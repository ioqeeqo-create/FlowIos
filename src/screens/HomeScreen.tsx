import React from 'react';
import {
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fontFamilyForId } from '../constants/fontChoices';
import { useFlowSettings } from '../context/FlowSettingsContext';

export function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { backgroundUri, coverUri, fontId } = useFlowSettings();
  const titleFont = fontFamilyForId(fontId);

  const body = (
    <>
      <View style={styles.headerRow}>
        {coverUri ? (
          <Image source={{ uri: coverUri }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarPh]}>
            <Text style={styles.avatarPhText}>♪</Text>
          </View>
        )}
        <View style={{ flex: 1 }}>
          <Text style={[styles.kicker, titleFont ? { fontFamily: titleFont } : null]}>
            Моя волна
          </Text>
          <Text style={styles.kickerSub}>Персональное радио</Text>
        </View>
      </View>
      <View style={styles.card}>
        <Text style={[styles.cardTitle, titleFont ? { fontFamily: titleFont } : null]}>
          Flow
        </Text>
        <Text style={styles.cardSub}>music for your wave</Text>
      </View>
      <Text style={styles.hint}>
        Поиск и воспроизведение — вкладка «Поиск» (нужен шлюз в настройках). Фон и обложка — в «Настройки».
      </Text>
    </>
  );

  if (backgroundUri) {
    return (
      <ImageBackground
        source={{ uri: backgroundUri }}
        style={[styles.flex, { paddingTop: insets.top + 12 }]}
        imageStyle={styles.bgDim}>
        <View style={styles.overlay}>{body}</View>
      </ImageBackground>
    );
  }

  return (
    <View style={[styles.flex, styles.solid, { paddingTop: insets.top + 12 }]}>
      {body}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  solid: {
    backgroundColor: '#07070d',
  },
  bgDim: {
    opacity: 0.45,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(7,7,13,0.72)',
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 22,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(168,85,247,0.45)',
  },
  avatarPh: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#151520',
  },
  avatarPhText: { fontSize: 22, color: '#c084fc' },
  kicker: {
    fontSize: 22,
    fontWeight: '800',
    color: '#faf5ff',
    letterSpacing: 0.3,
  },
  kickerSub: { fontSize: 13, color: '#a1a1b0', marginTop: 2 },
  card: {
    borderRadius: 20,
    padding: 22,
    backgroundColor: 'rgba(30,27,45,0.95)',
    borderWidth: 1,
    borderColor: 'rgba(168,85,247,0.35)',
  },
  cardTitle: {
    fontSize: 26,
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
