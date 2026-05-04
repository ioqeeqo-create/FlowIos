import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { BlurView } from '@react-native-community/blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
        <View style={styles.iosShadow}>
          <View style={styles.iosClip}>
            <BlurView
              style={StyleSheet.absoluteFill}
              blurType="thinMaterialDark"
              blurAmount={48}
              reducedTransparencyFallbackColor="#14141f"
            />
            <View style={styles.tint} pointerEvents="none" />
            <View style={styles.hairline} pointerEvents="none" />
            <View style={styles.children}>{children}</View>
          </View>
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
  },
  iosShadow: {
    borderRadius: R,
    backgroundColor: 'rgba(10,10,18,0.35)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.45,
    shadowRadius: 20,
  },
  iosClip: {
    borderRadius: R,
    overflow: 'hidden',
  },
  tint: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(8, 6, 18, 0.38)',
  },
  hairline: {
    ...StyleSheet.absoluteFill,
    borderRadius: R,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.14)',
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
