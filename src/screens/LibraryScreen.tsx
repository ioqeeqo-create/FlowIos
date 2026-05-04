import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LiquidGlassPanel } from '../components/LiquidGlassPanel';
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
    setPlaylists(prev => [{ id: String(Date.now()), title: `Новый плейлист ${idx}`, subtitle: '0 tracks' }, ...prev]);
  };

  const onImport = () => {
    const link = importUrl.trim();
    if (!link) {
      Alert.alert('Импорт', 'Вставь ссылку на плейлист');
      return;
    }
    setPlaylists(prev => [{ id: String(Date.now()), title: 'Импортированный плейлист', subtitle: link }, ...prev]);
    setImportUrl('');
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top + 8 }]}>
      <Text style={styles.title}>Библиотека</Text>
      <View style={styles.topBtns}>
        <Pressable style={styles.actionBtn} onPress={onCreate}>
          <Text style={styles.actionText}>+ Создать плейлист</Text>
        </Pressable>
      </View>
      <LiquidGlassPanel style={styles.importCard} contentStyle={styles.importContent}>
        <TextInput
          style={styles.input}
          value={importUrl}
          onChangeText={setImportUrl}
          placeholder="Вставь ссылку для импорта плейлиста"
          placeholderTextColor="rgba(255,255,255,0.38)"
          autoCapitalize="none"
          autoCorrect={false}
        />
        <Pressable style={styles.importBtn} onPress={onImport}>
          <Text style={styles.importText}>Импорт</Text>
        </Pressable>
      </LiquidGlassPanel>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 26 }}>
        <LiquidGlassPanel style={styles.itemCard} contentStyle={styles.itemContent}>
          <Text style={styles.plTitle}>Любимые</Text>
          <Text style={styles.plSub}>{favorites.length} tracks</Text>
          {favorites.slice(0, 4).map(t => (
            <Text key={`${t.source}:${t.id}`} style={styles.favoriteLine}>
              ♥ {t.title} — {t.artist}
            </Text>
          ))}
        </LiquidGlassPanel>
        {playlists.map(pl => (
          <LiquidGlassPanel key={pl.id} style={styles.itemCard} contentStyle={styles.itemContent}>
            <Text style={styles.plTitle}>{pl.title}</Text>
            <Text style={styles.plSub}>{pl.subtitle}</Text>
          </LiquidGlassPanel>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: 14 },
  title: { color: '#faf5ff', fontSize: 34, fontWeight: '800', marginBottom: 8 },
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
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.26)',
    color: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
  },
  importBtn: {
    borderRadius: 12,
    backgroundColor: 'rgba(168,85,247,0.35)',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  importText: { color: '#fff', fontWeight: '700' },
  itemCard: { marginBottom: 8 },
  itemContent: { padding: 12 },
  plTitle: { color: '#f7f4ff', fontSize: 15, fontWeight: '700' },
  plSub: { color: '#aca3c0', fontSize: 12, marginTop: 4 },
  favoriteLine: { color: '#fbcfe8', fontSize: 11, marginTop: 4 },
});
