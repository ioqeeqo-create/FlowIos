import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { StyleSheet, View } from 'react-native';
import Video from 'react-native-video';
import type { FlowTrack } from '../types/flowTrack';

export type PlaybackContextValue = {
  current: FlowTrack | null;
  streamUrl: string | null;
  playing: boolean;
  statusText: string;
  error: string | null;
  playTrack: (track: FlowTrack, url: string) => void;
  togglePlay: () => void;
  stop: () => void;
  clearError: () => void;
};

const PlaybackContext = createContext<PlaybackContextValue | null>(null);

export function PlaybackProvider({ children }: { children: React.ReactNode }) {
  const [current, setCurrent] = useState<FlowTrack | null>(null);
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const playTrack = useCallback((track: FlowTrack, url: string) => {
    setError(null);
    setCurrent(track);
    setStreamUrl(url);
    setPlaying(true);
    setStatusText('Воспроизведение');
  }, []);

  const togglePlay = useCallback(() => {
    setPlaying(p => !p);
  }, []);

  const stop = useCallback(() => {
    setPlaying(false);
    setStreamUrl(null);
    setCurrent(null);
    setStatusText('');
    setError(null);
  }, []);

  const value = useMemo(
    () => ({
      current,
      streamUrl,
      playing,
      statusText,
      error,
      playTrack,
      togglePlay,
      stop,
      clearError,
    }),
    [
      current,
      streamUrl,
      playing,
      statusText,
      error,
      playTrack,
      togglePlay,
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
