import React, { useEffect, useRef } from 'react';
import { ActivityIndicator, Animated, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LiquidGlassPanel } from './LiquidGlassPanel';
import { fontFamilyForId } from '../constants/fontChoices';
import { useFlowSettings } from '../context/FlowSettingsContext';
import { NEON_CYAN } from '../constants/theme';

/**
 * Shown while SocialAuth hydrates from AsyncStorage — liquid glass, no blank screen.
 */
export function BootLoading() {
  const insets = useSafeAreaInsets();
  const { fontId } = useFlowSettings();
  const titleFont = fontFamilyForId(fontId);
  const pulse = useRef(new Animated.Value(0.4)).current;
  const rise = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(pulse, {
            toValue: 1,
            duration: 1100,
            useNativeDriver: true,
          }),
          Animated.spring(rise, {
            toValue: 0,
            damping: 14,
            stiffness: 120,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(pulse, {
            toValue: 0.4,
            duration: 900,
            useNativeDriver: true,
          }),
          Animated.timing(rise, {
            toValue: 8,
            duration: 900,
            useNativeDriver: true,
          }),
        ]),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse, rise]);

  return (
    <View style={[styles.root, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 24 }]}>
      <Animated.View
        style={{
          opacity: pulse,
          transform: [{ translateY: rise }],
        }}>
        <LiquidGlassPanel borderRadius={28} intensity="chrome" style={styles.card} contentStyle={styles.cardInner}>
          <Text style={[styles.logo, titleFont ? { fontFamily: titleFont } : null]}>Flow</Text>
          <Text style={styles.tagline}>liquid glass · neon depth</Text>
          <View style={styles.row}>
            <ActivityIndicator size="large" color={NEON_CYAN} />
            <Text style={styles.wait}>Загрузка…</Text>
          </View>
        </LiquidGlassPanel>
      </Animated.View>
      <Text style={styles.hint}>Персональное радио и соц-слой готовятся</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 28,
    backgroundColor: 'transparent',
  },
  card: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: 360,
  },
  cardInner: {
    paddingVertical: 36,
    paddingHorizontal: 28,
    alignItems: 'center',
  },
  logo: {
    fontSize: 42,
    fontWeight: '800',
    color: '#faf5ff',
    letterSpacing: 1,
  },
  tagline: {
    marginTop: 6,
    fontSize: 12,
    color: 'rgba(196,181,253,0.85)',
    letterSpacing: 2,
    textTransform: 'lowercase',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 28,
  },
  wait: {
    color: '#e0e7ff',
    fontSize: 15,
    fontWeight: '600',
  },
  hint: {
    marginTop: 28,
    textAlign: 'center',
    fontSize: 12,
    color: 'rgba(255,255,255,0.38)',
    lineHeight: 18,
  },
});
