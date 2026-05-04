import React, { useState } from 'react';
import {
  Animated,
  Image,
  LayoutChangeEvent,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { LiquidGlassPanel } from './LiquidGlassPanel';
import { NEON_CYAN, NEON_PINK, NEON_PURPLE } from '../constants/theme';
import { usePlayback } from '../context/PlaybackContext';

function NeonProgressBar({
  progress,
  duration,
}: {
  progress: number;
  duration: number;
}) {
  const [w, setW] = useState(0);
  const onLayout = (e: LayoutChangeEvent) => {
    setW(e.nativeEvent.layout.width);
  };
  const ratio = duration > 0 ? Math.min(1, Math.max(0, progress / duration)) : 0;
  const fillW = Math.max(0, w * ratio);

  return (
    <View style={styles.progressTrack} onLayout={onLayout}>
      <Svg width={Math.max(1, w)} height={6} style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id="miniProg" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor={NEON_PURPLE} />
            <Stop offset="0.45" stopColor={NEON_CYAN} />
            <Stop offset="1" stopColor={NEON_PINK} />
          </LinearGradient>
        </Defs>
        <Rect x={0} y={0} width={fillW} height={6} rx={3} fill="url(#miniProg)" />
      </Svg>
    </View>
  );
}

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
  const [fullW, setFullW] = useState(0);

  React.useEffect(() => {
    if (!current) return;
    appear.setValue(0.92);
    fade.setValue(0);
    Animated.parallel([
      Animated.spring(appear, {
        toValue: 1,
        useNativeDriver: true,
        damping: 14,
        stiffness: 160,
      }),
      Animated.timing(fade, {
        toValue: 1,
        duration: 240,
        useNativeDriver: true,
      }),
    ]).start();
  }, [appear, current, fade]);

  if (!current) return null;

  const fullRatio = duration > 0 ? Math.min(1, Math.max(0, progress / duration)) : 0;
  const fullFill = Math.max(0, fullW * fullRatio);

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
        borderRadius={24}
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
            <NeonProgressBar progress={progress} duration={duration} />
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
          <LiquidGlassPanel borderRadius={28} intensity="chrome" style={styles.fullCard} contentStyle={styles.fullContent}>
            <Pressable style={styles.close} onPress={closeFullPlayer}>
              <Text style={styles.closeTxt}>⌄</Text>
            </Pressable>
            {current.cover ? <Image source={{ uri: current.cover }} style={styles.fullCover} /> : <View style={[styles.fullCover, styles.coverPh]} />}
            <Text style={styles.fullTitle}>{current.title}</Text>
            <Text style={styles.fullArt}>{current.artist}</Text>
            <Pressable
              style={styles.fullProgress}
              onLayout={e => setFullW(e.nativeEvent.layout.width)}
              onPress={e => {
                const lw = e.nativeEvent.locationX;
                if (!fullW) return;
                seekToRatio(Math.max(0, Math.min(1, lw / fullW)));
              }}>
              <Svg width={Math.max(1, fullW)} height={10} style={StyleSheet.absoluteFill}>
                <Defs>
                  <LinearGradient id="fullProg" x1="0" y1="0" x2="1" y2="0">
                    <Stop offset="0" stopColor={NEON_PURPLE} />
                    <Stop offset="0.5" stopColor={NEON_CYAN} />
                    <Stop offset="1" stopColor={NEON_PINK} />
                  </LinearGradient>
                </Defs>
                <Rect x={0} y={0} width={fullFill} height={10} rx={5} fill="url(#fullProg)" />
              </Svg>
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
    paddingVertical: 12,
  },
  err: { color: '#fca5a5', fontSize: 11, marginBottom: 6 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  cover: { width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.08)' },
  coverPh: { borderWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(255,255,255,0.2)' },
  title: { color: '#faf5ff', fontSize: 14, fontWeight: '700' },
  art: { color: '#9ca3af', fontSize: 12, marginTop: 2 },
  progressTrack: {
    marginTop: 8,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.12)',
    overflow: 'hidden',
  },
  btn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: 'rgba(168,85,247,0.28)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  btnTxt: { color: '#f5e9ff', fontSize: 14, fontWeight: '800' },
  modalRoot: {
    flex: 1,
    backgroundColor: 'rgba(3,3,11,0.88)',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  fullCard: {},
  fullContent: { padding: 20, alignItems: 'center' },
  close: { alignSelf: 'flex-start', marginBottom: 8 },
  closeTxt: { color: '#d8b4fe', fontSize: 26 },
  fullCover: { width: 260, height: 260, borderRadius: 22, marginBottom: 16 },
  fullTitle: { color: '#fff', fontSize: 28, fontWeight: '800', alignSelf: 'flex-start' },
  fullArt: { color: '#a78bfa', fontSize: 14, marginTop: 4, alignSelf: 'flex-start' },
  fullProgress: {
    width: '100%',
    height: 10,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.14)',
    marginTop: 16,
    overflow: 'hidden',
  },
  fullButtons: { flexDirection: 'row', gap: 14, marginTop: 22 },
  fullBtn: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.28)',
  },
  fullBtnTxt: { color: '#fff', fontSize: 18, fontWeight: '800' },
});
