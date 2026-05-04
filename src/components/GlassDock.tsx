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
          <View
            pointerEvents="none"
            style={[
              styles.activeLensSlot,
              { left: lensLeft, width: `${100 / TAB_COUNT}%` },
            ]}>
            <LiquidGlassPanel
              borderRadius={30}
              style={styles.activeLens}
              contentStyle={styles.activeLensContent}>
              <View style={styles.lensMagnifier} />
              <View style={styles.lensRainbowTop} />
              <View style={styles.lensRainbowLeft} />
              <View style={styles.lensRainbowRight} />
              <View style={styles.lensShine} />
              <View style={styles.lensInnerShadow} />
            </LiquidGlassPanel>
          </View>
          {children}
        </LiquidGlassPanel>
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
  },
  children: {
    borderRadius: R,
    overflow: 'hidden',
  },
  activeLensSlot: {
    position: 'absolute',
    top: 4,
    bottom: 6,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 0,
  },
  activeLens: {
    width: 82,
    height: 58,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.42,
    shadowRadius: 18,
  },
  activeLensContent: {
    flex: 1,
    overflow: 'hidden',
  },
  lensMagnifier: {
    position: 'absolute',
    left: 14,
    right: 14,
    top: 17,
    bottom: 17,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.08)',
    transform: [{ scaleX: 1.45 }],
  },
  lensRainbowTop: {
    position: 'absolute',
    top: -13,
    left: 9,
    right: 9,
    height: 28,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.34)',
    borderTopWidth: 2,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: 'rgba(163,230,53,0.45)',
  },
  lensRainbowLeft: {
    position: 'absolute',
    left: -4,
    top: 11,
    width: 18,
    height: 31,
    borderRadius: 16,
    backgroundColor: 'rgba(96,165,250,0.18)',
    borderRightWidth: 2,
    borderRightColor: 'rgba(251,191,36,0.48)',
  },
  lensRainbowRight: {
    position: 'absolute',
    right: -4,
    top: 12,
    width: 18,
    height: 31,
    borderRadius: 16,
    backgroundColor: 'rgba(236,72,153,0.16)',
    borderLeftWidth: 2,
    borderLeftColor: 'rgba(34,211,238,0.45)',
  },
  lensShine: {
    position: 'absolute',
    left: 11,
    top: 8,
    width: 36,
    height: 12,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.36)',
    transform: [{ rotate: '-12deg' }],
  },
  lensInnerShadow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 30,
    borderWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.52)',
    borderBottomColor: 'rgba(0,0,0,0.22)',
    borderLeftColor: 'rgba(255,255,255,0.22)',
    borderRightColor: 'rgba(255,255,255,0.22)',
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
