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

export function LiquidGlassPanel({
  children,
  borderRadius = 24,
  intensity = 'panel',
  style,
  contentStyle,
}: Props) {
  const radiusStyle = { borderRadius };

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
            blurType="thinMaterialDark"
            blurAmount={intensity === 'chrome' ? 44 : 28}
            reducedTransparencyFallbackColor="#151521"
          />
        ) : (
          <View style={[StyleSheet.absoluteFill, styles.androidFill]} />
        )}
        <View style={styles.tint} pointerEvents="none" />
        <View style={styles.topBloom} pointerEvents="none" />
        {intensity === 'chrome' ? (
          <View style={styles.chromeSheen} pointerEvents="none" />
        ) : null}
        {intensity === 'chrome' ? (
          <View style={[styles.edgeGlow, radiusStyle]} pointerEvents="none" />
        ) : null}
        <View style={[styles.border, radiusStyle]} pointerEvents="none" />
        <View style={contentStyle}>{children}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shadow: {
    backgroundColor: 'rgba(9,9,18,0.32)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.38,
    shadowRadius: 24,
    elevation: 8,
  },
  shadowChrome: {
    shadowColor: NEON_PURPLE,
    shadowOpacity: 0.22,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 12 },
  },
  clip: {
    overflow: 'hidden',
  },
  androidFill: {
    backgroundColor: 'rgba(22,22,34,0.92)',
  },
  tint: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(6, 4, 16, 0.4)',
  },
  edgeGlow: {
    ...StyleSheet.absoluteFill,
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderColor: 'rgba(255,255,255,0.22)',
  },
  topBloom: {
    position: 'absolute',
    top: -48,
    left: 18,
    right: 18,
    height: 84,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.16)',
    opacity: 0.7,
  },
  chromeSheen: {
    position: 'absolute',
    top: 8,
    left: 28,
    right: 28,
    height: 1,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.42)',
  },
  border: {
    ...StyleSheet.absoluteFill,
    borderWidth: 0.5,
    borderColor: GLASS_BORDER,
  },
});
