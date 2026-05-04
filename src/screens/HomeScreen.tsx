import React, { useEffect, useRef } from 'react';
import {
  Animated,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LiquidGlassPanel } from '../components/LiquidGlassPanel';
import { GLASS_RADIUS_LG } from '../constants/theme';
import { fontFamilyForId } from '../constants/fontChoices';
import { useFlowSettings } from '../context/FlowSettingsContext';

export function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { bannerUri, fontId } = useFlowSettings();
  const titleFont = fontFamilyForId(fontId);
  const intro = useRef(new Animated.Value(0)).current;
  const drift = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(intro, {
      toValue: 1,
      damping: 16,
      stiffness: 120,
      mass: 0.9,
      useNativeDriver: true,
    }).start();
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(drift, { toValue: 1, duration: 8000, useNativeDriver: true }),
        Animated.timing(drift, { toValue: 0, duration: 8000, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [drift, intro]);

  const body = (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
      <Animated.View
        style={{
          opacity: intro,
          transform: [
            {
              translateY: intro.interpolate({
                inputRange: [0, 1],
                outputRange: [22, 0],
              }),
            },
          ],
        }}>
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.kicker, titleFont ? { fontFamily: titleFont } : null]}>Главная</Text>
            <Text style={styles.kickerSub}>Персональное радио</Text>
            <Text style={styles.ambient}>
              Спокойный визуальный слой — музыка и соц живут на соседних вкладках, чтобы ничего не отвлекало
              от атмосферы.
            </Text>
          </View>
        </View>

        <Animated.View
          style={{
            transform: [
              {
                translateY: drift.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -4],
                }),
              },
            ],
          }}>
          <LiquidGlassPanel
            borderRadius={GLASS_RADIUS_LG}
            intensity="chrome"
            style={styles.card}
            contentStyle={styles.cardContent}>
            <ImageBackground
              source={{
                uri:
                  bannerUri ||
                  'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200',
              }}
              imageStyle={styles.bannerImage}
              style={styles.banner}>
              <View style={styles.bannerDarken} />
              <Text style={[styles.cardTitle, titleFont ? { fontFamily: titleFont } : null]}>
                stalk ur socials
              </Text>
              <Text style={styles.cardSub}>based on your vibe</Text>
            </ImageBackground>
          </LiquidGlassPanel>
        </Animated.View>

        <View style={styles.hintBlock}>
          <Text style={styles.hintLine}>Поиск и воспроизведение — во вкладке «Поиск».</Text>
          <Text style={styles.hintLine}>Социальные функции — во вкладке «Соц».</Text>
        </View>
      </Animated.View>
    </ScrollView>
  );

  return (
    <View style={[styles.flex, styles.solid, { paddingTop: insets.top + 12 }]}>
      {body}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  solid: {
    backgroundColor: 'transparent',
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  scrollBody: {
    paddingBottom: 18,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 20,
  },
  kicker: {
    fontSize: 22,
    fontWeight: '800',
    color: '#faf5ff',
    letterSpacing: 0.3,
  },
  kickerSub: { fontSize: 13, color: '#a1a1b0', marginTop: 2 },
  ambient: {
    marginTop: 10,
    fontSize: 12,
    lineHeight: 18,
    color: 'rgba(196,181,253,0.55)',
  },
  card: {
    borderRadius: GLASS_RADIUS_LG,
  },
  cardContent: {
    padding: 12,
  },
  banner: {
    height: 160,
    borderRadius: 20,
    overflow: 'hidden',
    padding: 16,
    justifyContent: 'flex-end',
  },
  bannerImage: {
    borderRadius: 20,
  },
  bannerDarken: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(10,6,20,0.4)',
  },
  cardTitle: {
    fontSize: 24,
    color: '#f5e9ff',
  },
  cardSub: {
    marginTop: 6,
    fontSize: 14,
    color: '#c4b5fd',
  },
  hintBlock: {
    marginTop: 22,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.1)',
    gap: 8,
  },
  hintLine: {
    fontSize: 13,
    lineHeight: 20,
    color: '#9ca3af',
  },
});
