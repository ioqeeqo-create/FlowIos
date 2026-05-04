import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LiquidGlassPanel } from './LiquidGlassPanel';

const R = 26;

type Props = {
  children: React.ReactNode;
};

/**
 * «Жидкое стекло»: плавающий док над контентом (iOS — UIBlurEffect + тонкая обводка).
 */
export function GlassDock({ children }: Props) {
  const insets = useSafeAreaInsets();
  const bottom = Math.max(insets.bottom, 8);

  if (Platform.OS === 'ios') {
    return (
      <View style={[styles.iosWrap, { marginBottom: bottom - 2 }]}>
        <LiquidGlassPanel borderRadius={R} contentStyle={styles.children}>
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
