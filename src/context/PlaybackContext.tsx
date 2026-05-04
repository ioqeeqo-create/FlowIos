import React, {
  createContext,
  useEffect,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { StyleSheet, View } from 'react-native';
import Video from 'react-native-video';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { FlowTrack } from '../types/flowTrack';

export type PlaybackContextValue = {
  current: FlowTrack | null;
  streamUrl: string | null;
  playing: boolean;
  progress: number;
  duration: number;
  favorites: FlowTrack[];
  fullPlayerOpen: boolean;
  statusText: string;
  error: string | null;
  playTrack: (track: FlowTrack, url: string) => void;
  playOrToggleTrack: (track: FlowTrack, resolvedUrl?: string | null) => void;
  togglePlay: () => void;
  seekToRatio: (ratio: number) => void;
  openFullPlayer: () => void;
  closeFullPlayer: () => void;
  isFavorite: (track: FlowTrack) => boolean;
  toggleFavorite: (track: FlowTrack) => void;
  stop: () => void;
  clearError: () => void;
};

const PlaybackContext = createContext<PlaybackContextValue | null>(null);
const K_FAVORITES = 'flow:player:favorites';

export function PlaybackProvider({ children }: { children: React.ReactNode }) {
  const videoRef = React.useRef<Video>(null);
  const [current, setCurrent] = useState<FlowTrack | null>(null);
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [favorites, setFavorites] = useState<FlowTrack[]>([]);
  const [fullPlayerOpen, setFullPlayerOpen] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(K_FAVORITES);
        if (!raw || cancelled) return;
        const parsed = JSON.parse(raw) as FlowTrack[];
        if (Array.isArray(parsed)) setFavorites(parsed);
      } catch {}
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const saveFavorites = useCallback((next: FlowTrack[]) => {
    setFavorites(next);
    void AsyncStorage.setItem(K_FAVORITES, JSON.stringify(next.slice(0, 200)));
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const playTrack = useCallback((track: FlowTrack, url: string) => {
    setError(null);
    setCurrent(track);
    setStreamUrl(url);
    setPlaying(true);
    setProgress(0);
    setDuration(0);
    setStatusText('Воспроизведение');
  }, []);

  const playOrToggleTrack = useCallback(
    (track: FlowTrack, resolvedUrl?: string | null) => {
      const same = current && `${current.source}:${current.id}` === `${track.source}:${track.id}`;
      if (same) {
        setPlaying(p => !p);
        return;
      }
      if (!resolvedUrl) return;
      playTrack(track, resolvedUrl);
    },
    [current, playTrack],
  );

  const togglePlay = useCallback(() => {
    setPlaying(p => !p);
  }, []);

  const seekToRatio = useCallback(
    (ratio: number) => {
      if (!duration || !Number.isFinite(duration)) return;
      const bounded = Math.max(0, Math.min(1, ratio));
      const target = bounded * duration;
      videoRef.current?.seek(target);
      setProgress(target);
    },
    [duration],
  );

  const isFavorite = useCallback(
    (track: FlowTrack) =>
      favorites.some(f => `${f.source}:${f.id}` === `${track.source}:${track.id}`),
    [favorites],
  );

  const toggleFavorite = useCallback(
    (track: FlowTrack) => {
      const key = `${track.source}:${track.id}`;
      const exists = favorites.some(f => `${f.source}:${f.id}` === key);
      if (exists) {
        saveFavorites(favorites.filter(f => `${f.source}:${f.id}` !== key));
      } else {
        saveFavorites([track, ...favorites]);
      }
    },
    [favorites, saveFavorites],
  );

  const stop = useCallback(() => {
    setPlaying(false);
    setStreamUrl(null);
    setCurrent(null);
    setProgress(0);
    setDuration(0);
    setStatusText('');
    setError(null);
    setFullPlayerOpen(false);
  }, []);

  const value = useMemo(
    () => ({
      current,
      streamUrl,
      playing,
      progress,
      duration,
      favorites,
      fullPlayerOpen,
      statusText,
      error,
      playTrack,
      playOrToggleTrack,
      togglePlay,
      seekToRatio,
      openFullPlayer: () => setFullPlayerOpen(true),
      closeFullPlayer: () => setFullPlayerOpen(false),
      isFavorite,
      toggleFavorite,
      stop,
      clearError,
    }),
    [
      current,
      streamUrl,
      playing,
      progress,
      duration,
      favorites,
      fullPlayerOpen,
      statusText,
      error,
      playTrack,
      playOrToggleTrack,
      togglePlay,
      seekToRatio,
      isFavorite,
      toggleFavorite,
      stop,
      clearError,
    ],
  );

  return (
    <PlaybackContext.Provider value={value}>
      {children}
      {streamUrl ? (
        <View style={styles.hiddenVideo} pointerEvents="none">
          <Video
            source={{ uri: streamUrl }}
            paused={!playing}
            playInBackground
            playWhenInactive
            ignoreSilentSwitch="ignore"
            resizeMode="contain"
            style={styles.video}
            ref={videoRef}
            onLoad={info => {
              setDuration(Number(info.duration || 0));
            }}
            onProgress={p => {
              setProgress(Number(p.currentTime || 0));
            }}
            onError={e => {
              const msg =
                typeof e?.error?.errorString === 'string'
                  ? e.error.errorString
                  : 'Ошибка воспроизведения';
              setError(msg);
              setPlaying(false);
            }}
            onEnd={() => setStatusText('Конец трека')}
          />
        </View>
      ) : null}
    </PlaybackContext.Provider>
  );
}

const styles = StyleSheet.create({
  hiddenVideo: {
    position: 'absolute',
    width: 2,
    height: 2,
    opacity: 0.01,
    overflow: 'hidden',
    bottom: 0,
    right: 0,
  },
  video: { width: 2, height: 2 },
});

export function usePlayback() {
  const ctx = useContext(PlaybackContext);
  if (!ctx) {
    throw new Error('usePlayback needs PlaybackProvider');
  }
  return ctx;
}
