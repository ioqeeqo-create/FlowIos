import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { usePlayback } from '../context/PlaybackContext';

export function MiniPlayer() {
  const { current, playing, togglePlay, stop, error } = usePlayback();

  if (!current) return null;

  return (
    <View style={styles.wrap}>
      {error ? <Text style={styles.err}>{error}</Text> : null}
      <View style={styles.sep} />
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
    backgroundColor: 'transparent',
    paddingHorizontal: 14,
    paddingTop: 6,
    paddingBottom: 4,
  },
  sep: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginBottom: 8,
    marginHorizontal: -4,
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
