import React, { useId, useState } from 'react';
import {
  LayoutChangeEvent,
  Platform,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { BlurView } from '@react-native-community/blur';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { NEON_PURPLE } from '../constants/theme';

type Props = {
  children: React.ReactNode;
  borderRadius?: number;
  intensity?: 'panel' | 'chrome';
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
};

/**
 * Liquid Glass: два слоя нативного blur (разная «глубина»), градиентная кромка (блик → неон),
 * лёгкий specular сверху. Без Skia — максимум из BlurView + SVG.
 */
export function LiquidGlassPanel({
  children,
  borderRadius = 24,
  intensity = 'panel',
  style,
  contentStyle,
}: Props) {
  const uid = useId().replace(/:/g, '');
  const gradId = `lgStroke-${uid}`;
  const sheenId = `lgSheen-${uid}`;
  const [box, setBox] = useState({ w: 0, h: 0 });

  const radiusStyle = { borderRadius };
  const isChrome = intensity === 'chrome';
  const blurMain = isChrome ? 78 : 62;
  const blurSoft = isChrome ? 34 : 28;

  const onBoxLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width > 0 && height > 0) setBox({ w: width, h: height });
  };

  const strokeW = 1.5;
  const rx = Math.max(4, borderRadius - strokeW / 2);
  const { w, h } = box;
  const innerW = Math.max(0, w - strokeW);
  const innerH = Math.max(0, h - strokeW);

  return (
    <View
      style={[
        styles.shadow,
        radiusStyle,
        isChrome ? styles.shadowChrome : styles.shadowPanel,
        style,
      ]}>
      <View style={[styles.clip, radiusStyle]} onLayout={onBoxLayout}>
        {Platform.OS === 'ios' ? (
          <>
            <BlurView
              style={StyleSheet.absoluteFill}
              blurType="dark"
              blurAmount={blurMain}
              reducedTransparencyFallbackColor="rgba(10,8,20,0.78)"
            />
            <View style={styles.blurAccentWrap} pointerEvents="none">
              <BlurView style={StyleSheet.absoluteFill} blurType="dark" blurAmount={blurSoft} />
            </View>
          </>
        ) : (
          <View style={[StyleSheet.absoluteFill, styles.androidFill]} />
        )}
        <View style={styles.tint} pointerEvents="none" />
        <View style={styles.topBloom} pointerEvents="none" />
        {isChrome ? <View style={styles.chromeSheen} pointerEvents="none" /> : null}
        {w > 0 && h > 0 ? (
          <Svg width={w} height={h} style={StyleSheet.absoluteFill} pointerEvents="none">
            <Defs>
              <LinearGradient id={sheenId} x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor="#ffffff" stopOpacity="0.16" />
                <Stop offset="0.28" stopColor="#ffffff" stopOpacity="0.04" />
                <Stop offset="1" stopColor="#ffffff" stopOpacity="0" />
              </LinearGradient>
              <LinearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
                <Stop offset="0" stopColor="#ffffff" stopOpacity="0.82" />
                <Stop offset="0.4" stopColor={NEON_PURPLE} stopOpacity="0.95" />
                <Stop offset="1" stopColor="#4c1d95" stopOpacity="0.88" />
              </LinearGradient>
            </Defs>
            <Rect
              x={0}
              y={0}
              width={w}
              height={h}
              rx={borderRadius}
              ry={borderRadius}
              fill={`url(#${sheenId})`}
            />
            <Rect
              x={strokeW / 2}
              y={strokeW / 2}
              width={innerW}
              height={innerH}
              rx={rx}
              ry={rx}
              fill="none"
              stroke={`url(#${gradId})`}
              strokeWidth={strokeW}
            />
          </Svg>
        ) : null}
        <View style={contentStyle}>{children}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shadow: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.42,
    shadowRadius: 20,
    elevation: 10,
  },
  shadowChrome: {
    shadowColor: NEON_PURPLE,
    shadowOpacity: 0.28,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 14 },
  },
  shadowPanel: {
    shadowColor: '#0f0720',
    shadowOpacity: 0.35,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
  },
  clip: {
    overflow: 'hidden',
  },
  blurAccentWrap: {
    ...StyleSheet.absoluteFill,
    opacity: Platform.OS === 'ios' ? 0.42 : 0,
  },
  androidFill: {
    backgroundColor: 'rgba(16,14,28,0.58)',
  },
  tint: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(4, 2, 12, 0.16)',
  },
  topBloom: {
    position: 'absolute',
    top: -52,
    left: 8,
    right: 8,
    height: 88,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.09)',
    opacity: 0.5,
  },
  chromeSheen: {
    position: 'absolute',
    top: 5,
    left: 20,
    right: 20,
    height: 1,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.45)',
  },
});
