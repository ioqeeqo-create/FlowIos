import React from 'react';
import {
  Platform,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { BlurView } from '@react-native-community/blur';
import { GLASS_BORDER, NEON_PURPLE } from '../constants/theme';

type Props = {
  children: React.ReactNode;
  borderRadius?: number;
  intensity?: 'panel' | 'chrome';
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
};

/**
 * Liquid glass: сильный blur фона под карточкой, лёгкая кромка, без «серой коробки».
 */
export function LiquidGlassPanel({
  children,
  borderRadius = 24,
  intensity = 'panel',
  style,
  contentStyle,
}: Props) {
  const radiusStyle = { borderRadius };
  const blurAmount = intensity === 'chrome' ? 50 : 42;
  const blurType = Platform.OS === 'ios' ? 'dark' : 'dark';

  return (
    <View
      style={[
        styles.shadow,
        radiusStyle,
        intensity === 'chrome' ? styles.shadowChrome : null,
        style,
      ]}>
      <View style={[styles.clip, radiusStyle]}>
        {Platform.OS === 'ios' ? (
          <BlurView
            style={StyleSheet.absoluteFill}
            blurType={blurType}
            blurAmount={blurAmount}
            reducedTransparencyFallbackColor="rgba(12,10,22,0.72)"
          />
        ) : (
          <View style={[StyleSheet.absoluteFill, styles.androidFill]} />
        )}
        <View style={styles.tint} pointerEvents="none" />
        <View style={styles.topBloom} pointerEvents="none" />
        {intensity === 'chrome' ? (
          <View style={styles.chromeSheen} pointerEvents="none" />
        ) : null}
        <View style={[styles.rim, radiusStyle]} pointerEvents="none" />
        <View style={contentStyle}>{children}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shadow: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.35,
    shadowRadius: 22,
    elevation: 6,
  },
  shadowChrome: {
    shadowColor: NEON_PURPLE,
    shadowOpacity: 0.18,
    shadowRadius: 26,
    shadowOffset: { width: 0, height: 10 },
  },
  clip: {
    overflow: 'hidden',
  },
  androidFill: {
    backgroundColor: 'rgba(18,16,30,0.55)',
  },
  /** ~0.2 поверх blur — остаётся «стекло», не плитка */
  tint: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(6, 4, 14, 0.2)',
  },
  rim: {
    ...StyleSheet.absoluteFill,
    borderWidth: GLASS_BORDER_WIDTH,
    borderColor: GLASS_BORDER,
  },
  topBloom: {
    position: 'absolute',
    top: -56,
    left: 12,
    right: 12,
    height: 92,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.1)',
    opacity: 0.55,
  },
  chromeSheen: {
    position: 'absolute',
    top: 6,
    left: 22,
    right: 22,
    height: 1,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.38)',
  },
});
