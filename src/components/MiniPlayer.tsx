import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePlayback } from '../context/PlaybackContext';

export function MiniPlayer() {
  const insets = useSafeAreaInsets();
  const { current, playing, togglePlay, stop, error } = usePlayback();

  if (!current) return null;

  return (
    <View style={[styles.wrap, { paddingBottom: Math.max(6, insets.bottom > 0 ? 4 : 6) }]}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderTopWidth: 1,
    borderTopColor: '#2e2e42',
    backgroundColor: '#12121c',
    paddingHorizontal: 12,
    paddingTop: 8,
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
