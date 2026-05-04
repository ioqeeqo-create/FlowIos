import React from 'react';
import {
  ImageBackground,
  Image,
  Pressable,
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
  const { coverUri, bannerUri, fontId } = useFlowSettings();
  const titleFont = fontFamilyForId(fontId);
  const profileAvatar = coverUri || 'https://i.pravatar.cc/120?img=33';

  const discordProfiles = [
    { id: '1', name: 'flowwave', status: 'Listening', color: '#22c55e' },
    { id: '2', name: 'stalker', status: 'In social room', color: '#8b5cf6' },
    { id: '3', name: 'reverb', status: 'AFK', color: '#f59e0b' },
  ];

  const body = (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.kicker, titleFont ? { fontFamily: titleFont } : null]}>
            Моя волна
          </Text>
          <Text style={styles.kickerSub}>Персональное радио</Text>
        </View>
        <Pressable style={styles.profileBubble}>
          <Image source={{ uri: profileAvatar }} style={styles.profileBubbleImage} />
        </Pressable>
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

      <LiquidGlassPanel style={styles.profilesWrap} contentStyle={styles.profilesContent}>
        <Text style={styles.profilesTitle}>Профили</Text>
        {discordProfiles.map(item => (
          <View key={item.id} style={styles.profileRow}>
            <Image source={{ uri: profileAvatar }} style={styles.profileAvatar} />
            <View style={{ flex: 1 }}>
              <Text style={styles.profileName}>{item.name}</Text>
              <Text style={styles.profileStatus}>{item.status}</Text>
            </View>
            <View style={[styles.profileDot, { backgroundColor: item.color }]} />
          </View>
        ))}
      </LiquidGlassPanel>
      <Text style={styles.hint}>
        Поиск и воспроизведение — вкладка «Поиск». В «Настройки» теперь можно отдельно менять фон,
        обложку и баннер (включая GIF), а также крутить фон.
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
  profileBubble: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    overflow: 'hidden',
  },
  profileBubbleImage: { width: '100%', height: '100%' },
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
  profilesWrap: {
    marginTop: 14,
  },
  profilesContent: {
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  profilesTitle: {
    fontSize: 13,
    color: '#c4b5fd',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(255,255,255,0.04)',
    marginBottom: 8,
  },
  profileAvatar: {
    width: 42,
    height: 42,
    borderRadius: 14,
  },
  profileName: {
    color: '#faf5ff',
    fontSize: 14,
    fontWeight: '700',
  },
  profileStatus: {
    color: '#a1a1b0',
    fontSize: 12,
    marginTop: 1,
  },
  profileDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  hint: {
    marginTop: 20,
    fontSize: 13,
    lineHeight: 19,
    color: '#9ca3af',
  },
});
