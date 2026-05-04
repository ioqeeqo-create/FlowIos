import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { SearchSource } from '../types/flowTrack';

const DEFAULT_GATEWAY_BASE = 'http://85.239.34.229:3950';
const DEFAULT_GATEWAY_SECRET = 'flowflow';
const DEFAULT_SOCIAL_BASE = 'http://85.239.34.229:3847';
const DEFAULT_SOCIAL_SECRET = 'flowflow';

const K = {
  backgroundUri: 'flow:appearance:bg',
  coverUri: 'flow:appearance:cover',
  bannerUri: 'flow:appearance:banner',
  backgroundRotateDeg: 'flow:appearance:bgRotateDeg',
  backgroundScale: 'flow:appearance:bgScale',
  backgroundDim: 'flow:appearance:bgDim',
  fontId: 'flow:appearance:font',
  apiBase: 'flow:account:apiBase',
  apiToken: 'flow:account:apiToken',
  socialUsername: 'flow:account:socialUsername',
  gatewayBase: 'flow:music:gatewayBase',
  gatewaySecret: 'flow:music:gatewaySecret',
  spotifyToken: 'flow:music:spotify',
  yandexToken: 'flow:music:yandex',
  vkToken: 'flow:music:vk',
  soundcloudClientId: 'flow:music:scClientId',
  searchSource: 'flow:music:searchSource',
  yandexValidated: 'flow:gate:yandexOk',
  vkValidated: 'flow:gate:vkOk',
} as const;

export type FlowSettingsContextValue = {
  backgroundUri: string | null;
  coverUri: string | null;
  bannerUri: string | null;
  backgroundRotateDeg: number;
  backgroundScale: number;
  backgroundDim: number;
  fontId: string;
  apiBase: string;
  apiToken: string;
  socialUsername: string;
  gatewayBase: string;
  gatewaySecret: string;
  spotifyToken: string;
  yandexToken: string;
  vkToken: string;
  soundcloudClientId: string;
  searchSource: SearchSource;
  /** Успешная проверка через шлюз /validate/yandex при текущем токене. */
  yandexValidated: boolean;
  /** Успешная проверка через шлюз /validate/vk. */
  vkValidated: boolean;
  hydrated: boolean;
  setBackgroundUri: (uri: string | null) => void;
  setCoverUri: (uri: string | null) => void;
  setBannerUri: (uri: string | null) => void;
  setBackgroundRotateDeg: (deg: number) => void;
  setBackgroundScale: (scale: number) => void;
  setBackgroundDim: (dim: number) => void;
  setFontId: (id: string) => void;
  setApiBase: (v: string) => void;
  setApiToken: (v: string) => void;
  setSocialUsername: (v: string) => void;
  setGatewayBase: (v: string) => void;
  setGatewaySecret: (v: string) => void;
  setSpotifyToken: (v: string) => void;
  setYandexToken: (v: string) => void;
  setVkToken: (v: string) => void;
  setSoundcloudClientId: (v: string) => void;
  setSearchSource: (v: SearchSource) => void;
  setYandexValidated: (ok: boolean) => void;
  setVkValidated: (ok: boolean) => void;
  resetAppearance: () => Promise<void>;
};

const FlowSettingsContext = createContext<FlowSettingsContextValue | null>(
  null,
);

const KEYS = Object.values(K);

export function FlowSettingsProvider({ children }: { children: React.ReactNode }) {
  const [backgroundUri, setBackgroundUriState] = useState<string | null>(null);
  const [coverUri, setCoverUriState] = useState<string | null>(null);
  const [bannerUri, setBannerUriState] = useState<string | null>(null);
  const [backgroundRotateDeg, setBackgroundRotateDegState] = useState(0);
  const [backgroundScale, setBackgroundScaleState] = useState(1);
  const [backgroundDim, setBackgroundDimState] = useState(0.4);
  const [fontId, setFontIdState] = useState('system');
  const [apiBase, setApiBaseState] = useState(DEFAULT_SOCIAL_BASE);
  const [apiToken, setApiTokenState] = useState(DEFAULT_SOCIAL_SECRET);
  const [socialUsername, setSocialUsernameState] = useState('flow');
  const [gatewayBase, setGatewayBaseState] = useState(DEFAULT_GATEWAY_BASE);
  const [gatewaySecret, setGatewaySecretState] = useState(DEFAULT_GATEWAY_SECRET);
  const [spotifyToken, setSpotifyTokenState] = useState('');
  const [yandexToken, setYandexTokenState] = useState('');
  const [vkToken, setVkTokenState] = useState('');
  const [soundcloudClientId, setSoundcloudClientIdState] = useState('');
  const [searchSource, setSearchSourceState] = useState<SearchSource>('hybrid');
  const [yandexValidated, setYandexValidatedState] = useState(false);
  const [vkValidated, setVkValidatedState] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const vals = await Promise.all(KEYS.map(k => AsyncStorage.getItem(k)));
        if (cancelled) return;
        const m = Object.fromEntries(KEYS.map((k, i) => [k, vals[i]]));
        if (m[K.backgroundUri]) setBackgroundUriState(m[K.backgroundUri]!);
        if (m[K.coverUri]) setCoverUriState(m[K.coverUri]!);
        if (m[K.bannerUri]) setBannerUriState(m[K.bannerUri]!);
        if (m[K.backgroundRotateDeg]) {
          const v = Number(m[K.backgroundRotateDeg]);
          if (Number.isFinite(v)) setBackgroundRotateDegState(v);
        }
        if (m[K.backgroundScale]) {
          const v = Number(m[K.backgroundScale]);
          if (Number.isFinite(v) && v >= 1 && v <= 1.4) setBackgroundScaleState(v);
        }
        if (m[K.backgroundDim]) {
          const v = Number(m[K.backgroundDim]);
          if (Number.isFinite(v) && v >= 0 && v <= 0.75) setBackgroundDimState(v);
        }
        if (m[K.fontId]) setFontIdState(m[K.fontId]!);
        if (m[K.apiBase]) setApiBaseState(m[K.apiBase]!);
        else setApiBaseState(DEFAULT_SOCIAL_BASE);
        if (m[K.apiToken]) setApiTokenState(m[K.apiToken]!);
        else setApiTokenState(DEFAULT_SOCIAL_SECRET);
        if (m[K.socialUsername]) setSocialUsernameState(m[K.socialUsername]!);
        if (m[K.gatewayBase]) setGatewayBaseState(m[K.gatewayBase]!);
        if (m[K.gatewaySecret]) setGatewaySecretState(m[K.gatewaySecret]!);
        if (m[K.spotifyToken]) setSpotifyTokenState(m[K.spotifyToken]!);
        if (m[K.yandexToken]) setYandexTokenState(m[K.yandexToken]!);
        if (m[K.vkToken]) setVkTokenState(m[K.vkToken]!);
        if (m[K.soundcloudClientId]) {
          setSoundcloudClientIdState(m[K.soundcloudClientId]!);
        }
        if (m[K.searchSource]) {
          setSearchSourceState(m[K.searchSource]! as SearchSource);
        }
        if (m[K.yandexValidated] === '1') setYandexValidatedState(true);
        if (m[K.vkValidated] === '1') setVkValidatedState(true);
      } finally {
        if (!cancelled) setHydrated(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const persist = useCallback(async (key: string, value: string | null) => {
    if (value == null || value === '') await AsyncStorage.removeItem(key);
    else await AsyncStorage.setItem(key, value);
  }, []);

  const setBackgroundUri = useCallback(
    (uri: string | null) => {
      setBackgroundUriState(uri);
      void persist(K.backgroundUri, uri);
    },
    [persist],
  );

  const setCoverUri = useCallback(
    (uri: string | null) => {
      setCoverUriState(uri);
      void persist(K.coverUri, uri);
    },
    [persist],
  );

  const setBannerUri = useCallback(
    (uri: string | null) => {
      setBannerUriState(uri);
      void persist(K.bannerUri, uri);
    },
    [persist],
  );

  const setBackgroundRotateDeg = useCallback(
    (deg: number) => {
      const safe = Math.max(-25, Math.min(25, Number.isFinite(deg) ? deg : 0));
      setBackgroundRotateDegState(safe);
      void persist(K.backgroundRotateDeg, String(safe));
    },
    [persist],
  );

  const setBackgroundScale = useCallback(
    (scale: number) => {
      const safe = Math.max(1, Math.min(1.4, Number.isFinite(scale) ? scale : 1));
      setBackgroundScaleState(safe);
      void persist(K.backgroundScale, String(safe));
    },
    [persist],
  );

  const setBackgroundDim = useCallback(
    (dim: number) => {
      const safe = Math.max(0, Math.min(0.75, Number.isFinite(dim) ? dim : 0.4));
      setBackgroundDimState(safe);
      void persist(K.backgroundDim, String(safe));
    },
    [persist],
  );

  const setFontId = useCallback(
    (id: string) => {
      setFontIdState(id);
      void persist(K.fontId, id);
    },
    [persist],
  );

  const setApiBase = useCallback(
    (v: string) => {
      setApiBaseState(v);
      void persist(K.apiBase, v.trim() || null);
    },
    [persist],
  );

  const setApiToken = useCallback(
    (v: string) => {
      setApiTokenState(v);
      void persist(K.apiToken, v.trim() || null);
    },
    [persist],
  );

  const setSocialUsername = useCallback(
    (v: string) => {
      const safe = String(v || '').trim().toLowerCase();
      setSocialUsernameState(safe || 'flow');
      void persist(K.socialUsername, safe || 'flow');
    },
    [persist],
  );

  const clearGatewayTokenFlags = useCallback(async () => {
    setYandexValidatedState(false);
    setVkValidatedState(false);
    await Promise.all([
      AsyncStorage.removeItem(K.yandexValidated),
      AsyncStorage.removeItem(K.vkValidated),
    ]);
  }, []);

  const setGatewayBase = useCallback(
    (v: string) => {
      setGatewayBaseState(v);
      void persist(K.gatewayBase, v.trim() || null);
      void clearGatewayTokenFlags();
    },
    [clearGatewayTokenFlags, persist],
  );

  const setGatewaySecret = useCallback(
    (v: string) => {
      setGatewaySecretState(v);
      void persist(K.gatewaySecret, v.trim() || null);
      void clearGatewayTokenFlags();
    },
    [clearGatewayTokenFlags, persist],
  );

  const setSpotifyToken = useCallback(
    (v: string) => {
      setSpotifyTokenState(v);
      void persist(K.spotifyToken, v.trim() || null);
    },
    [persist],
  );

  const setYandexToken = useCallback(
    (v: string) => {
      setYandexTokenState(v);
      void persist(K.yandexToken, v.trim() || null);
      setYandexValidatedState(false);
      void persist(K.yandexValidated, null);
    },
    [persist],
  );

  const setVkToken = useCallback(
    (v: string) => {
      setVkTokenState(v);
      void persist(K.vkToken, v.trim() || null);
      setVkValidatedState(false);
      void persist(K.vkValidated, null);
    },
    [persist],
  );

  const setSoundcloudClientId = useCallback(
    (v: string) => {
      setSoundcloudClientIdState(v);
      void persist(K.soundcloudClientId, v.trim() || null);
    },
    [persist],
  );

  const setSearchSource = useCallback(
    (v: SearchSource) => {
      setSearchSourceState(v);
      void persist(K.searchSource, v);
    },
    [persist],
  );

  const setYandexValidated = useCallback(
    (ok: boolean) => {
      setYandexValidatedState(ok);
      void persist(K.yandexValidated, ok ? '1' : null);
    },
    [persist],
  );

  const setVkValidated = useCallback(
    (ok: boolean) => {
      setVkValidatedState(ok);
      void persist(K.vkValidated, ok ? '1' : null);
    },
    [persist],
  );

  const resetAppearance = useCallback(async () => {
    setBackgroundUriState(null);
    setCoverUriState(null);
    setBannerUriState(null);
    setBackgroundRotateDegState(0);
    setBackgroundScaleState(1);
    setBackgroundDimState(0.4);
    setFontIdState('system');
    await Promise.all([
      AsyncStorage.removeItem(K.backgroundUri),
      AsyncStorage.removeItem(K.coverUri),
      AsyncStorage.removeItem(K.bannerUri),
      AsyncStorage.removeItem(K.backgroundRotateDeg),
      AsyncStorage.removeItem(K.backgroundScale),
      AsyncStorage.removeItem(K.backgroundDim),
      AsyncStorage.removeItem(K.fontId),
    ]);
  }, []);

  const value = useMemo(
    () => ({
      backgroundUri,
      coverUri,
      bannerUri,
      backgroundRotateDeg,
      backgroundScale,
      backgroundDim,
      fontId,
      apiBase,
      apiToken,
      socialUsername,
      gatewayBase,
      gatewaySecret,
      spotifyToken,
      yandexToken,
      vkToken,
      soundcloudClientId,
      searchSource,
      yandexValidated,
      vkValidated,
      hydrated,
      setBackgroundUri,
      setCoverUri,
      setBannerUri,
      setBackgroundRotateDeg,
      setBackgroundScale,
      setBackgroundDim,
      setFontId,
      setApiBase,
      setApiToken,
      setSocialUsername,
      setGatewayBase,
      setGatewaySecret,
      setSpotifyToken,
      setYandexToken,
      setVkToken,
      setSoundcloudClientId,
      setSearchSource,
      setYandexValidated,
      setVkValidated,
      resetAppearance,
    }),
    [
      apiBase,
      apiToken,
      socialUsername,
      backgroundUri,
      backgroundDim,
      backgroundRotateDeg,
      backgroundScale,
      bannerUri,
      coverUri,
      fontId,
      gatewayBase,
      gatewaySecret,
      hydrated,
      resetAppearance,
      searchSource,
      setApiBase,
      setApiToken,
      setSocialUsername,
      setBackgroundUri,
      setBackgroundDim,
      setBackgroundRotateDeg,
      setBackgroundScale,
      setBannerUri,
      setCoverUri,
      setFontId,
      setGatewayBase,
      setGatewaySecret,
      setSearchSource,
      setSoundcloudClientId,
      setSpotifyToken,
      setVkToken,
      setVkValidated,
      setYandexToken,
      setYandexValidated,
      soundcloudClientId,
      spotifyToken,
      vkToken,
      vkValidated,
      yandexToken,
      yandexValidated,
    ],
  );

  return (
    <FlowSettingsContext.Provider value={value}>
      {children}
    </FlowSettingsContext.Provider>
  );
}

export function useFlowSettings() {
  const ctx = useContext(FlowSettingsContext);
  if (!ctx) {
    throw new Error('useFlowSettings must be used inside FlowSettingsProvider');
  }
  return ctx;
}
