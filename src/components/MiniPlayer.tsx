import React from 'react';
import {
  Animated,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LiquidGlassPanel } from './LiquidGlassPanel';
import { usePlayback } from '../context/PlaybackContext';

export function MiniPlayer() {
  const {
    current,
    playing,
    progress,
    duration,
    fullPlayerOpen,
    togglePlay,
    stop,
    seekToRatio,
    openFullPlayer,
    closeFullPlayer,
    toggleFavorite,
    isFavorite,
    error,
  } = usePlayback();
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
        <Pressable style={styles.row} onPress={openFullPlayer}>
          {current.cover ? <Image source={{ uri: current.cover }} style={styles.cover} /> : <View style={[styles.cover, styles.coverPh]} />}
          <View style={{ flex: 1 }}>
            <Text style={styles.title} numberOfLines={1}>
              {current.title}
            </Text>
            <Text style={styles.art} numberOfLines={1}>
              {current.artist} · {current.source}
            </Text>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${duration ? (progress / duration) * 100 : 0}%` }]} />
            </View>
          </View>
          <Pressable style={styles.btn} onPress={() => toggleFavorite(current)}>
            <Text style={styles.btnTxt}>{isFavorite(current) ? '♥' : '♡'}</Text>
          </Pressable>
          <Pressable style={styles.btn} onPress={togglePlay}>
            <Text style={styles.btnTxt}>{playing ? '❚❚' : '▶'}</Text>
          </Pressable>
          <Pressable style={styles.btn} onPress={stop}>
            <Text style={styles.btnTxt}>■</Text>
          </Pressable>
        </Pressable>
      </LiquidGlassPanel>
      <Modal visible={fullPlayerOpen} animationType="fade" transparent onRequestClose={closeFullPlayer}>
        <View style={styles.modalRoot}>
          <LiquidGlassPanel borderRadius={26} intensity="chrome" style={styles.fullCard} contentStyle={styles.fullContent}>
            <Pressable style={styles.close} onPress={closeFullPlayer}>
              <Text style={styles.closeTxt}>⌄</Text>
            </Pressable>
            {current.cover ? <Image source={{ uri: current.cover }} style={styles.fullCover} /> : <View style={[styles.fullCover, styles.coverPh]} />}
            <Text style={styles.fullTitle}>{current.title}</Text>
            <Text style={styles.fullArt}>{current.artist}</Text>
            <Pressable style={styles.fullProgress} onPress={() => seekToRatio(duration ? Math.min(1, (progress + 12) / duration) : 0)}>
              <View style={[styles.fullProgressFill, { width: `${duration ? (progress / duration) * 100 : 0}%` }]} />
            </Pressable>
            <View style={styles.fullButtons}>
              <Pressable style={styles.fullBtn} onPress={() => toggleFavorite(current)}>
                <Text style={styles.fullBtnTxt}>{isFavorite(current) ? '♥' : '♡'}</Text>
              </Pressable>
              <Pressable style={styles.fullBtn} onPress={togglePlay}>
                <Text style={styles.fullBtnTxt}>{playing ? '❚❚' : '▶'}</Text>
              </Pressable>
              <Pressable style={styles.fullBtn} onPress={stop}>
                <Text style={styles.fullBtnTxt}>■</Text>
              </Pressable>
            </View>
          </LiquidGlassPanel>
        </View>
      </Modal>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  animated: {
    paddingHorizontal: 10,
    paddingTop: 2,
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
  cover: { width: 38, height: 38, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.08)' },
  coverPh: { borderWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(255,255,255,0.2)' },
  title: { color: '#faf5ff', fontSize: 14, fontWeight: '700' },
  art: { color: '#9ca3af', fontSize: 12, marginTop: 2 },
  progressTrack: {
    marginTop: 6,
    height: 4,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.16)',
    overflow: 'hidden',
  },
  progressFill: { height: 4, borderRadius: 3, backgroundColor: '#facc15' },
  btn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(168,85,247,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnTxt: { color: '#f5e9ff', fontSize: 14, fontWeight: '800' },
  modalRoot: {
    flex: 1,
    backgroundColor: 'rgba(3,3,11,0.82)',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  fullCard: {},
  fullContent: { padding: 16, alignItems: 'center' },
  close: { alignSelf: 'flex-start', marginBottom: 8 },
  closeTxt: { color: '#d8b4fe', fontSize: 26 },
  fullCover: { width: 260, height: 260, borderRadius: 20, marginBottom: 16 },
  fullTitle: { color: '#fff', fontSize: 30, fontWeight: '800', alignSelf: 'flex-start' },
  fullArt: { color: '#a78bfa', fontSize: 14, marginTop: 4, alignSelf: 'flex-start' },
  fullProgress: {
    width: '100%',
    height: 8,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.18)',
    marginTop: 14,
    overflow: 'hidden',
  },
  fullProgressFill: { height: 8, borderRadius: 6, backgroundColor: '#facc15' },
  fullButtons: { flexDirection: 'row', gap: 14, marginTop: 18 },
  fullBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.32)',
  },
  fullBtnTxt: { color: '#fff', fontSize: 18, fontWeight: '800' },
});
