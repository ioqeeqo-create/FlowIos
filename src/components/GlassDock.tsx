import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LiquidGlassPanel } from './LiquidGlassPanel';

const R = 26;
const TAB_COUNT = 5;

type Props = {
  children: React.ReactNode;
  activeIndex?: number;
};

/**
 * «Жидкое стекло»: Telegram-style capsule with a refractive active lens.
 */
export function GlassDock({ children, activeIndex = 0 }: Props) {
  const insets = useSafeAreaInsets();
  const bottom = Math.max(insets.bottom, 8);
  const clampedIndex = Math.max(0, Math.min(TAB_COUNT - 1, activeIndex));
  const lensLeft = `${(clampedIndex * 100) / TAB_COUNT}%`;

  if (Platform.OS === 'ios') {
    return (
      <View style={[styles.iosWrap, { marginBottom: bottom - 2 }]}>
        <LiquidGlassPanel
          borderRadius={R}
          intensity="chrome"
          contentStyle={styles.children}>
          {children}
        </LiquidGlassPanel>
        <View
          pointerEvents="none"
          style={[
            styles.activeLensSlot,
            { left: lensLeft, width: `${100 / TAB_COUNT}%` },
          ]}>
          <LiquidGlassPanel
            borderRadius={38}
            intensity="chrome"
            style={styles.activeLens}
            contentStyle={styles.activeLensContent}>
            <View style={styles.lensMagnifier} />
            <View style={styles.lensRainbowTop} />
            <View style={styles.lensRainbowLeft} />
            <View style={styles.lensRainbowRight} />
            <View style={styles.lensShine} />
            <View style={styles.lensHotspot} />
            <View style={styles.lensInnerShadow} />
          </LiquidGlassPanel>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.androidRoot, { paddingBottom: bottom }]}>
      <View style={styles.androidTopHair} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  iosWrap: {
    marginHorizontal: 11,
    backgroundColor: 'transparent',
    overflow: 'visible',
  },
  children: {
    borderRadius: R,
    overflow: 'hidden',
  },
  activeLensSlot: {
    position: 'absolute',
    top: -18,
    height: 84,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
  },
  activeLens: {
    width: 104,
    height: 74,
    borderRadius: 38,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
  },
  activeLensContent: {
    flex: 1,
    overflow: 'hidden',
  },
  lensMagnifier: {
    position: 'absolute',
    left: 18,
    right: 18,
    top: 20,
    bottom: 20,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.13)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.42)',
    transform: [{ scaleX: 1.65 }],
  },
  lensRainbowTop: {
    position: 'absolute',
    top: -10,
    left: 14,
    right: 14,
    height: 30,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.4)',
    borderTopWidth: 3,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: 'rgba(163,230,53,0.62)',
  },
  lensRainbowLeft: {
    position: 'absolute',
    left: -2,
    top: 16,
    width: 24,
    height: 40,
    borderRadius: 18,
    backgroundColor: 'rgba(96,165,250,0.2)',
    borderRightWidth: 3,
    borderRightColor: 'rgba(251,191,36,0.62)',
  },
  lensRainbowRight: {
    position: 'absolute',
    right: -2,
    top: 17,
    width: 24,
    height: 40,
    borderRadius: 18,
    backgroundColor: 'rgba(236,72,153,0.18)',
    borderLeftWidth: 3,
    borderLeftColor: 'rgba(34,211,238,0.62)',
  },
  lensShine: {
    position: 'absolute',
    left: 16,
    top: 12,
    width: 48,
    height: 15,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.5)',
    transform: [{ rotate: '-12deg' }],
  },
  lensHotspot: {
    position: 'absolute',
    right: 17,
    bottom: 13,
    width: 24,
    height: 9,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.25)',
    transform: [{ rotate: '-9deg' }],
  },
  lensInnerShadow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 38,
    borderWidth: 1.5,
    borderTopColor: 'rgba(255,255,255,0.72)',
    borderBottomColor: 'rgba(0,0,0,0.32)',
    borderLeftColor: 'rgba(255,255,255,0.34)',
    borderRightColor: 'rgba(255,255,255,0.34)',
  },
  androidRoot: {
    backgroundColor: '#0c0c14',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  androidTopHair: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
});
