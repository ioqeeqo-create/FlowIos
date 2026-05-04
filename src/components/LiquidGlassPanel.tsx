import React from 'react';
import {
  Platform,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { BlurView } from '@react-native-community/blur';

type Props = {
  children: React.ReactNode;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
};

export function LiquidGlassPanel({
  children,
  borderRadius = 24,
  style,
  contentStyle,
}: Props) {
  const radiusStyle = { borderRadius };

  return (
    <View style={[styles.shadow, radiusStyle, style]}>
      <View style={[styles.clip, radiusStyle]}>
        {Platform.OS === 'ios' ? (
          <BlurView
            style={StyleSheet.absoluteFill}
            blurType="thinMaterialDark"
            blurAmount={54}
            reducedTransparencyFallbackColor="#151521"
          />
        ) : (
          <View style={[StyleSheet.absoluteFill, styles.androidFill]} />
        )}
        <View style={styles.tint} pointerEvents="none" />
        <View style={styles.topBloom} pointerEvents="none" />
        <View style={styles.edgeGlow} pointerEvents="none" />
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
  clip: {
    overflow: 'hidden',
  },
  androidFill: {
    backgroundColor: 'rgba(22,22,34,0.92)',
  },
  tint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(8, 6, 18, 0.34)',
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
  edgeGlow: {
    position: 'absolute',
    right: -38,
    bottom: -36,
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: 'rgba(192,132,252,0.18)',
  },
  border: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.22)',
  },
});
