import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import Svg, {
  Defs,
  Ellipse,
  LinearGradient,
  Path,
  Rect,
  Stop,
} from 'react-native-svg';
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
            <Svg width="100%" height="100%" viewBox="0 0 112 78">
              <Defs>
                <LinearGradient id="glassFill" x1="8" y1="4" x2="104" y2="74">
                  <Stop offset="0" stopColor="#ffffff" stopOpacity="0.46" />
                  <Stop offset="0.42" stopColor="#ffffff" stopOpacity="0.08" />
                  <Stop offset="1" stopColor="#000000" stopOpacity="0.28" />
                </LinearGradient>
                <LinearGradient id="rainbowTop" x1="12" y1="0" x2="100" y2="16">
                  <Stop offset="0" stopColor="#7dd3fc" stopOpacity="0.64" />
                  <Stop offset="0.5" stopColor="#ffffff" stopOpacity="0.72" />
                  <Stop offset="1" stopColor="#facc15" stopOpacity="0.58" />
                </LinearGradient>
                <LinearGradient id="rainbowSide" x1="0" y1="8" x2="112" y2="70">
                  <Stop offset="0" stopColor="#22d3ee" stopOpacity="0.62" />
                  <Stop offset="0.5" stopColor="#ffffff" stopOpacity="0.08" />
                  <Stop offset="1" stopColor="#fb7185" stopOpacity="0.58" />
                </LinearGradient>
              </Defs>
              <Rect
                x="4"
                y="4"
                width="104"
                height="70"
                rx="35"
                fill="url(#glassFill)"
                stroke="rgba(255,255,255,0.62)"
                strokeWidth="1.4"
              />
              <Path
                d="M18 16 C28 1, 78 1, 95 15"
                stroke="url(#rainbowTop)"
                strokeWidth="4.2"
                strokeLinecap="round"
                fill="none"
              />
              <Path
                d="M12 24 C4 34, 5 48, 15 58"
                stroke="url(#rainbowSide)"
                strokeWidth="4.4"
                strokeLinecap="round"
                fill="none"
              />
              <Path
                d="M100 23 C109 34, 108 49, 98 59"
                stroke="url(#rainbowSide)"
                strokeWidth="4.4"
                strokeLinecap="round"
                fill="none"
              />
              <Ellipse cx="56" cy="39" rx="42" ry="17" fill="#ffffff" opacity="0.11" />
              <Ellipse
                cx="42"
                cy="22"
                rx="24"
                ry="7"
                fill="#ffffff"
                opacity="0.42"
                transform="rotate(-11 42 22)"
              />
              <Ellipse
                cx="75"
                cy="58"
                rx="16"
                ry="5"
                fill="#ffffff"
                opacity="0.2"
                transform="rotate(-8 75 58)"
              />
            </Svg>
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
    width: 112,
    height: 78,
    borderRadius: 39,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
  },
  activeLensContent: {
    flex: 1,
    overflow: 'hidden',
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
