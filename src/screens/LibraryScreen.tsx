import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LiquidGlassPanel } from '../components/LiquidGlassPanel';
import { GLASS_RADIUS_MD } from '../constants/theme';
import { usePlayback } from '../context/PlaybackContext';

type PlaylistItem = { id: string; title: string; subtitle: string };

export function LibraryScreen() {
  const insets = useSafeAreaInsets();
  const { favorites } = usePlayback();
  const [importUrl, setImportUrl] = useState('');
  const [playlists, setPlaylists] = useState<PlaylistItem[]>([
    { id: '1', title: 'stalk ur socials', subtitle: '18 tracks' },
    { id: '2', title: 'late night wave', subtitle: '24 tracks' },
  ]);

  const onCreate = () => {
    const idx = playlists.length + 1;
    setPlaylists(prev => [
      { id: String(Date.now()), title: `Новый плейлист ${idx}`, subtitle: '0 tracks' },
      ...prev,
    ]);
  };

  const onImport = () => {
    const link = importUrl.trim();
    if (!link) {
      Alert.alert('Импорт', 'Вставь ссылку на плейлист');
      return;
    }
    setPlaylists(prev => [
      { id: String(Date.now()), title: 'Импортированный плейлист', subtitle: link },
      ...prev,
    ]);
    setImportUrl('');
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top + 8 }]}>
      <Text style={styles.title}>Библиотека</Text>
      <Text style={styles.lead}>Локальные избранные и демо-плейлисты — без облачного парсинга импорта.</Text>
      <View style={styles.topBtns}>
        <Pressable style={styles.actionBtn} onPress={onCreate}>
          <Text style={styles.actionText}>+ Создать плейлист</Text>
        </Pressable>
      </View>
      <LiquidGlassPanel borderRadius={GLASS_RADIUS_MD} style={styles.importCard} contentStyle={styles.importContent}>
        <TextInput
          style={styles.input}
          value={importUrl}
          onChangeText={setImportUrl}
          placeholder="URL плейлиста (импорт = заглушка)"
          placeholderTextColor="rgba(255,255,255,0.38)"
          autoCapitalize="none"
          autoCorrect={false}
        />
        <Pressable style={styles.importBtn} onPress={onImport}>
          <Text style={styles.importText}>Импорт</Text>
        </Pressable>
      </LiquidGlassPanel>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 26 }}>
        <LiquidGlassPanel borderRadius={GLASS_RADIUS_MD} style={styles.itemCard} contentStyle={styles.itemContent}>
          <Text style={styles.plTitle}>Любимые</Text>
          <Text style={styles.plSub}>{favorites.length} tracks · AsyncStorage, до 200</Text>
          {favorites.slice(0, 4).map(t => (
            <Text key={`${t.source}:${t.id}`} style={styles.favoriteLine}>
              ♥ {t.title} — {t.artist}
            </Text>
          ))}
        </LiquidGlassPanel>

        <Text style={styles.sectionLabel}>Плейлисты</Text>
        <View style={styles.grid}>
          {playlists.map(pl => (
            <LiquidGlassPanel
              key={pl.id}
              borderRadius={20}
              style={styles.gridCell}
              contentStyle={styles.gridCellInner}>
              <Text style={styles.gridTitle} numberOfLines={2}>
                {pl.title}
              </Text>
              <Text style={styles.gridSub} numberOfLines={2}>
                {pl.subtitle}
              </Text>
            </LiquidGlassPanel>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: 14 },
  title: { color: '#faf5ff', fontSize: 34, fontWeight: '800', marginBottom: 6 },
  lead: { color: 'rgba(255,255,255,0.42)', fontSize: 12, lineHeight: 17, marginBottom: 10 },
  topBtns: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  actionBtn: {
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.26)',
  },
  actionText: { color: '#f3e8ff', fontSize: 13, fontWeight: '700' },
  importCard: { marginBottom: 10 },
  importContent: { padding: 10, flexDirection: 'row', alignItems: 'center', gap: 8 },
  input: {
    flex: 1,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.26)',
    color: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
  },
  importBtn: {
    borderRadius: 14,
    backgroundColor: 'rgba(168,85,247,0.35)',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  importText: { color: '#fff', fontWeight: '700' },
  itemCard: { marginBottom: 12 },
  itemContent: { padding: 12 },
  sectionLabel: {
    marginTop: 4,
    marginBottom: 8,
    fontSize: 13,
    fontWeight: '800',
    color: '#c4b5fd',
    letterSpacing: 0.6,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 0,
  },
  gridCell: {
    width: '48.4%',
    marginBottom: 10,
  },
  gridCellInner: {
    padding: 12,
    minHeight: 96,
    justifyContent: 'flex-end',
  },
  gridTitle: { color: '#f7f4ff', fontSize: 14, fontWeight: '700' },
  gridSub: { color: '#aca3c0', fontSize: 11, marginTop: 6, lineHeight: 15 },
  plTitle: { color: '#f7f4ff', fontSize: 15, fontWeight: '700' },
  plSub: { color: '#aca3c0', fontSize: 12, marginTop: 4 },
  favoriteLine: { color: '#fbcfe8', fontSize: 11, marginTop: 4 },
});
