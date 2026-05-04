import React from 'react';
import {
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LiquidGlassPanel } from '../components/LiquidGlassPanel';
import { fontFamilyForId } from '../constants/fontChoices';
import { useFlowSettings } from '../context/FlowSettingsContext';

export function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { bannerUri, fontId } = useFlowSettings();
  const titleFont = fontFamilyForId(fontId);

  const body = (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.kicker, titleFont ? { fontFamily: titleFont } : null]}>
            Главная
          </Text>
          <Text style={styles.kickerSub}>Персональное радио</Text>
        </View>
      </View>

      <LiquidGlassPanel style={styles.card} contentStyle={styles.cardContent}>
        <ImageBackground
          source={{ uri: bannerUri || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200' }}
          imageStyle={styles.bannerImage}
          style={styles.banner}>
          <View style={styles.bannerDarken} />
          <Text style={[styles.cardTitle, titleFont ? { fontFamily: titleFont } : null]}>
            stalk ur socials
          </Text>
          <Text style={styles.cardSub}>based on your vibe</Text>
        </ImageBackground>
      </LiquidGlassPanel>

      <Text style={styles.hint}>
        Поиск и воспроизведение — вкладка «Поиск». Профили и друзья перенесены во вкладку «Соц».
      </Text>
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
    marginBottom: 22,
  },
  kicker: {
    fontSize: 22,
    fontWeight: '800',
    color: '#faf5ff',
    letterSpacing: 0.3,
  },
  kickerSub: { fontSize: 13, color: '#a1a1b0', marginTop: 2 },
  card: {
    borderRadius: 20,
  },
  cardContent: {
    padding: 12,
  },
  banner: {
    height: 140,
    borderRadius: 16,
    overflow: 'hidden',
    padding: 14,
    justifyContent: 'flex-end',
  },
  bannerImage: {
    borderRadius: 16,
  },
  bannerDarken: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10,6,20,0.35)',
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
  hint: {
    marginTop: 20,
    fontSize: 13,
    lineHeight: 19,
    color: '#9ca3af',
  },
});
