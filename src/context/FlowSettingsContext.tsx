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

const K = {
  backgroundUri: 'flow:appearance:bg',
  coverUri: 'flow:appearance:cover',
  fontId: 'flow:appearance:font',
  apiBase: 'flow:account:apiBase',
  apiToken: 'flow:account:apiToken',
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
  fontId: string;
  apiBase: string;
  apiToken: string;
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
  setFontId: (id: string) => void;
  setApiBase: (v: string) => void;
  setApiToken: (v: string) => void;
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
  const [fontId, setFontIdState] = useState('system');
  const [apiBase, setApiBaseState] = useState('');
  const [apiToken, setApiTokenState] = useState('');
  const [gatewayBase, setGatewayBaseState] = useState('');
  const [gatewaySecret, setGatewaySecretState] = useState('');
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
        if (m[K.fontId]) setFontIdState(m[K.fontId]!);
        if (m[K.apiBase]) setApiBaseState(m[K.apiBase]!);
        if (m[K.apiToken]) setApiTokenState(m[K.apiToken]!);
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
    setFontIdState('system');
    await Promise.all([
      AsyncStorage.removeItem(K.backgroundUri),
      AsyncStorage.removeItem(K.coverUri),
      AsyncStorage.removeItem(K.fontId),
    ]);
  }, []);

  const value = useMemo(
    () => ({
      backgroundUri,
      coverUri,
      fontId,
      apiBase,
      apiToken,
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
      setFontId,
      setApiBase,
      setApiToken,
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
      backgroundUri,
      coverUri,
      fontId,
      gatewayBase,
      gatewaySecret,
      hydrated,
      resetAppearance,
      searchSource,
      setApiBase,
      setApiToken,
      setBackgroundUri,
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
