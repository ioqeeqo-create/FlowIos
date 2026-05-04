import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { sha256 } from 'js-sha256';
import { useFlowSettings } from './FlowSettingsContext';

const K = {
  username: 'flow:auth:username',
} as const;

type LoginResult = { ok: boolean; error?: string };

type SocialAuthContextValue = {
  ready: boolean;
  username: string | null;
  isGuest: boolean;
  login: (username: string, password: string) => Promise<LoginResult>;
  register: (username: string, password: string) => Promise<LoginResult>;
  enterGuest: () => Promise<void>;
  logout: () => Promise<void>;
  syncProfileMedia: (username: string) => Promise<void>;
};

const SocialAuthContext = createContext<SocialAuthContextValue | null>(null);

function normalizeUsername(value: string) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_\-.]/g, '')
    .slice(0, 32);
}

function randomSalt(len = 24) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let out = '';
  for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

function hashPassword(password: string, salt: string) {
  return sha256(`${String(password || '')}::${String(salt || '')}`);
}

const SOCIAL_UA = { 'User-Agent': 'FlowMobile/1.0 (Flow; social)' } as const;

function explainSocialNetworkError(apiRoot: string, err: unknown): string {
  const m = err instanceof Error ? err.message : String(err);
  if (/Network request failed|Failed to fetch|load failed|Aborted|aborted/i.test(m)) {
    return [
      'Сеть: запрос до Flow Social не дошёл.',
      `Проверь в Safari: ${apiRoot}/flow-api/v1/profile-public/flow`,
      'Попробуй другую сеть (LTE ↔ Wi‑Fi), отключи VPN / iCloud Private Relay.',
      `Технически: ${m}`,
    ].join(' ');
  }
  return `Сеть: ${m}`;
}

export function SocialAuthProvider({ children }: { children: React.ReactNode }) {
  const {
    apiBase,
    apiToken,
    setSocialUsername,
    setCoverUri,
    setBannerUri,
    setBackgroundUri,
  } = useFlowSettings();
  const [ready, setReady] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const isGuest = username === 'guest';

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const u = await AsyncStorage.getItem(K.username);
        if (!cancelled && u) setUsername(u);
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const base = String(apiBase || 'http://85.239.34.229/social').trim().replace(/\/$/, '');
  const bearer = String(apiToken || 'flowflow').trim();

  const syncProfileMedia = useCallback(
    async (u: string) => {
      if (!base || !bearer) return;
      let res: Response;
      try {
        res = await fetch(`${base}/flow-api/v1/profile-public/${encodeURIComponent(u)}`, {
          headers: { Authorization: `Bearer ${bearer}`, ...SOCIAL_UA },
        });
      } catch {
        return;
      }
      if (!res.ok) return;
      const p = (await res.json()) as {
        avatar_data?: string | null;
        banner_data?: string | null;
      };
      if (p.avatar_data) setCoverUri(p.avatar_data);
      if (p.banner_data) {
        setBannerUri(p.banner_data);
        setBackgroundUri(p.banner_data);
      }
    },
    [base, bearer, setBackgroundUri, setBannerUri, setCoverUri],
  );

  const login = useCallback(
    async (rawName: string, password: string): Promise<LoginResult> => {
      const u = normalizeUsername(rawName);
      if (!base || !bearer) return { ok: false, error: 'Social API не настроен' };
      if (!u) return { ok: false, error: 'Введите username' };
      if (!password) return { ok: false, error: 'Введите пароль' };
      let r: Response;
      try {
        r = await fetch(`${base}/flow-api/v1/profile-auth/${encodeURIComponent(u)}`, {
          headers: { Authorization: `Bearer ${bearer}`, ...SOCIAL_UA },
        });
      } catch (e) {
        return { ok: false, error: explainSocialNetworkError(base, e) };
      }
      if (r.status === 404) return { ok: false, error: 'Профиль не найден, зарегистрируйся' };
      if (!r.ok) return { ok: false, error: `Ошибка входа: ${r.status}` };
      const data = (await r.json()) as { password_hash?: string; password_salt?: string };
      const salt = String(data.password_salt || '');
      const expected = String(data.password_hash || '');
      if (!salt || !expected) return { ok: false, error: 'Аккаунт без пароля, нужна миграция' };
      const actual = hashPassword(password, salt);
      if (actual !== expected) return { ok: false, error: 'Неверный пароль' };
      await AsyncStorage.setItem(K.username, u);
      setSocialUsername(u);
      setUsername(u);
      await syncProfileMedia(u);
      return { ok: true };
    },
    [base, bearer, setSocialUsername, syncProfileMedia],
  );

  const register = useCallback(
    async (rawName: string, password: string): Promise<LoginResult> => {
      const u = normalizeUsername(rawName);
      if (!base || !bearer) return { ok: false, error: 'Social API не настроен' };
      if (!u || u.length < 3) return { ok: false, error: 'Username: минимум 3 символа' };
      if (String(password || '').length < 4) return { ok: false, error: 'Пароль: минимум 4 символа' };
      let check: Response;
      try {
        check = await fetch(`${base}/flow-api/v1/profile-auth/${encodeURIComponent(u)}`, {
          headers: { Authorization: `Bearer ${bearer}`, ...SOCIAL_UA },
        });
      } catch (e) {
        return { ok: false, error: explainSocialNetworkError(base, e) };
      }
      if (check.ok) return { ok: false, error: 'Username уже занят' };
      const salt = randomSalt(24);
      const password_hash = hashPassword(password, salt);
      let up: Response;
      try {
        up = await fetch(`${base}/flow-api/v1/profile`, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${bearer}`,
            'Content-Type': 'application/json',
            ...SOCIAL_UA,
          },
          body: JSON.stringify({
            username: u,
            password_hash,
            password_salt: salt,
            online: true,
            last_seen: new Date().toISOString(),
          }),
        });
      } catch (e) {
        return { ok: false, error: explainSocialNetworkError(base, e) };
      }
      if (!up.ok) return { ok: false, error: `Ошибка регистрации: ${up.status}` };
      await AsyncStorage.setItem(K.username, u);
      setSocialUsername(u);
      setUsername(u);
      await syncProfileMedia(u);
      return { ok: true };
    },
    [base, bearer, setSocialUsername, syncProfileMedia],
  );

  const logout = useCallback(async () => {
    await AsyncStorage.removeItem(K.username);
    setUsername(null);
  }, []);

  const enterGuest = useCallback(async () => {
    await AsyncStorage.setItem(K.username, 'guest');
    setSocialUsername('guest');
    setUsername('guest');
  }, [setSocialUsername]);

  const value = useMemo(
    () => ({ ready, username, isGuest, login, register, enterGuest, logout, syncProfileMedia }),
    [enterGuest, isGuest, login, logout, ready, register, syncProfileMedia, username],
  );

  return <SocialAuthContext.Provider value={value}>{children}</SocialAuthContext.Provider>;
}

export function useSocialAuth() {
  const ctx = useContext(SocialAuthContext);
  if (!ctx) throw new Error('useSocialAuth must be used inside SocialAuthProvider');
  return ctx;
}
