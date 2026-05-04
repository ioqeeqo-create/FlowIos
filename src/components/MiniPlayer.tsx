import React from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LiquidGlassPanel } from './LiquidGlassPanel';
import { usePlayback } from '../context/PlaybackContext';

export function MiniPlayer() {
  const { current, playing, togglePlay, stop, error } = usePlayback();
  const appear = React.useRef(new Animated.Value(0.92)).current;
  const fade = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (!current) return;
    appear.setValue(0.92);
    fade.setValue(0);
    Animated.parallel([
      Animated.spring(appear, {
        toValue: 1,
        useNativeDriver: true,
        damping: 16,
        stiffness: 170,
      }),
      Animated.timing(fade, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start();
  }, [appear, current, fade]);

  if (!current) return null;

  return (
    <Animated.View
      style={[
        styles.animated,
        {
          opacity: fade,
          transform: [{ scale: appear }],
        },
      ]}>
      <LiquidGlassPanel
        borderRadius={20}
        intensity="chrome"
        style={styles.panel}
        contentStyle={styles.wrap}>
        {error ? <Text style={styles.err}>{error}</Text> : null}
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title} numberOfLines={1}>
              {current.title}
            </Text>
            <Text style={styles.art} numberOfLines={1}>
              {current.artist} · {current.source}
            </Text>
          </View>
          <Pressable style={styles.btn} onPress={togglePlay}>
            <Text style={styles.btnTxt}>{playing ? '❚❚' : '▶'}</Text>
          </Pressable>
          <Pressable style={styles.btn} onPress={stop}>
            <Text style={styles.btnTxt}>■</Text>
          </Pressable>
        </View>
      </LiquidGlassPanel>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  animated: {
    paddingHorizontal: 10,
    paddingTop: 8,
    paddingBottom: 4,
  },
  panel: {
    backgroundColor: 'transparent',
  },
  wrap: {
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  err: { color: '#fca5a5', fontSize: 11, marginBottom: 6 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  title: { color: '#faf5ff', fontSize: 14, fontWeight: '700' },
  art: { color: '#9ca3af', fontSize: 12, marginTop: 2 },
  btn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(168,85,247,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnTxt: { color: '#f5e9ff', fontSize: 14, fontWeight: '800' },
});
