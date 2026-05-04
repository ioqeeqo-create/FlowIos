import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Animated,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  gatewayResolve,
  gatewaySearch,
  type MusicTokens,
} from '../api/flowGateway';
import { LiquidGlassPanel } from '../components/LiquidGlassPanel';
import { fontFamilyForId } from '../constants/fontChoices';
import { useFlowSettings } from '../context/FlowSettingsContext';
import { usePlayback } from '../context/PlaybackContext';
import type { FlowTrack, SearchSource } from '../types/flowTrack';

/** Верстка без API: включи `true`, чтобы не дёргать шлюз при частых перезапусках. */
const USE_MOCK_SEARCH = false;

const MOCK_TRACKS: FlowTrack[] = [
  {
    title: 'Mock track',
    artist: 'Flow',
    url: null,
    source: 'audius',
    id: 'mock-1',
    cover: null,
  },
];

const SOURCES: { id: SearchSource; label: string }[] = [
  { id: 'hybrid', label: 'Авто' },
  { id: 'spotify', label: 'Spotify' },
  { id: 'soundcloud', label: 'SC' },
  { id: 'audius', label: 'Audius' },
  { id: 'yandex', label: 'Яндекс' },
  { id: 'vk', label: 'VK' },
  { id: 'youtube', label: 'YT' },
];

export function SearchScreen() {
  const insets = useSafeAreaInsets();
  const s = useFlowSettings();
  const { playTrack } = usePlayback();
  const titleFont = fontFamilyForId(s.fontId);
  const [fade] = useState(() => new Animated.Value(0));

  useEffect(() => {
    Animated.timing(fade, {
      toValue: 1,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [fade]);

  const [q, setQ] = useState('');
  const [source, setSource] = useState<SearchSource>('hybrid');
  const [tracks, setTracks] = useState<FlowTrack[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  useEffect(() => {
    if (s.hydrated) setSource(s.searchSource);
  }, [s.hydrated, s.searchSource]);

  const tokens: MusicTokens = {
    spotifyToken: s.spotifyToken,
    yandexToken: s.yandexToken,
    vkToken: s.vkToken,
    soundcloudClientId: s.soundcloudClientId,
  };

  const gateReason = useMemo(() => {
    if (!s.gatewayBase.trim() || !s.gatewaySecret.trim()) {
      return 'В Настройках укажи URL и секрет шлюза.';
    }
    if (source === 'spotify' && !s.spotifyToken.trim()) {
      return 'Для Spotify введи access token в Настройках.';
    }
    if (source === 'yandex') {
      if (!s.yandexToken.trim()) return 'Введи OAuth Яндекса в Настройках.';
      if (!s.yandexValidated) {
        return 'Сначала «Проверить Яндекс (через шлюз)» в Настройках.';
      }
    }
    if (source === 'vk') {
      if (!s.vkToken.trim()) return 'Введи VK token в Настройках.';
      if (!s.vkValidated) {
        return 'Сначала «Проверить VK (через шлюз)» в Настройках.';
      }
    }
    return null;
  }, [
    s.gatewayBase,
    s.gatewaySecret,
    s.spotifyToken,
    s.vkToken,
    s.vkValidated,
    s.yandexToken,
    s.yandexValidated,
    source,
  ]);

  const onSearch = useCallback(async () => {
    setMsg(null);
    if (gateReason) {
      setMsg(gateReason);
      return;
    }
    const query = q.trim();
    if (!query) {
      setTracks([]);
      return;
    }
    setLoading(true);
    try {
      if (USE_MOCK_SEARCH) {
        setTracks(MOCK_TRACKS);
        setMsg('Mock-данные (USE_MOCK_SEARCH)');
        return;
      }
      const r = await gatewaySearch(
        s.gatewayBase,
        s.gatewaySecret,
        query,
        source,
        tokens,
      );
      setTracks(r.tracks);
      setMsg(
        r.ok
          ? `Найдено: ${r.tracks.length} (${r.mode || source})`
          : r.error || 'Пусто',
      );
    } catch (e: unknown) {
      setTracks([]);
      setMsg(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, [gateReason, q, s.gatewayBase, s.gatewaySecret, source, tokens]);

  const onPlay = useCallback(
    async (track: FlowTrack) => {
      setMsg(null);
      const src = String(track.source || '').toLowerCase();
      if (src === 'yandex' && !s.yandexValidated) {
        Alert.alert('', 'Нужен активный токен Яндекса.');
        return;
      }
      if (src === 'vk' && !s.vkValidated) {
        Alert.alert('', 'Нужен активный токен ВКонтакте.');
        return;
      }
      const key = `${track.source}:${track.id}`;
      setResolvingId(key);
      try {
        const r = await gatewayResolve(
          s.gatewayBase,
          s.gatewaySecret,
          track,
          tokens,
        );
        if (!r.ok || !r.url) {
          setMsg(r.error || 'Не удалось получить поток');
          return;
        }
        playTrack(track, r.url);
        setMsg(`Играет: ${track.title}`);
      } catch (e: unknown) {
        setMsg(e instanceof Error ? e.message : String(e));
      } finally {
        setResolvingId(null);
      }
    },
    [
      playTrack,
      s.gatewayBase,
      s.gatewaySecret,
      s.vkValidated,
      s.yandexValidated,
      tokens,
    ],
  );

  const listHeader = (
    <Animated.View
      style={{
        paddingTop: insets.top + 10,
        opacity: fade,
        transform: [
          {
            scale: fade.interpolate({
              inputRange: [0, 1],
              outputRange: [0.97, 1],
            }),
          },
        ],
      }}>
      <Text style={[styles.h1, titleFont ? { fontFamily: titleFont } : null]}>
        Поиск
      </Text>
      <Text style={styles.sub}>
        Шлюз на Node (как десктоп). Режим «Авто» = Spotify → SoundCloud → Audius. Яндекс / VK / YouTube
        — отдельные вкладки источника.
      </Text>

      <View style={styles.searchShell}>
        <TextInput
          style={styles.input}
          placeholder="Трек или исполнитель"
          placeholderTextColor="rgba(255,255,255,0.38)"
          value={q}
          onChangeText={setQ}
          onSubmitEditing={onSearch}
          returnKeyType="search"
          autoCorrect={false}
          clearButtonMode={Platform.OS === 'ios' ? 'while-editing' : 'never'}
          keyboardAppearance="dark"
        />
        <Pressable
          style={[styles.goBtn, gateReason && styles.goBtnDisabled]}
          onPress={onSearch}
          disabled={loading || Boolean(gateReason)}>
          {loading ? (
            <ActivityIndicator color="#0a0a12" />
          ) : (
            <Text style={styles.goTxt}>Найти</Text>
          )}
        </Pressable>
      </View>

      {gateReason ? <Text style={styles.gate}>{gateReason}</Text> : null}

      <Text style={styles.srcLabel}>Источник</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
        keyboardShouldPersistTaps="handled">
        {SOURCES.map(item => {
          const on = item.id === source;
          return (
            <Pressable
              key={item.id}
              onPress={() => {
                setSource(item.id);
                s.setSearchSource(item.id);
              }}
              style={[styles.chip, on && styles.chipOn]}>
              <Text style={[styles.chipTxt, on && styles.chipTxtOn]}>{item.label}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {msg ? <Text style={styles.msg}>{msg}</Text> : null}
    </Animated.View>
  );

  return (
    <View style={styles.root}>
      <FlatList
        data={tracks}
        keyExtractor={(t, i) => `${t.source}-${t.id}-${i}`}
        ListHeaderComponent={listHeader}
        automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 28, flexGrow: 1 }}
        renderItem={({ item }) => {
          const key = `${item.source}:${item.id}`;
          const busy = resolvingId === key;
          return (
            <LiquidGlassPanel
              borderRadius={18}
              style={styles.trackGlass}
              contentStyle={styles.trackRow}
            >
            <Pressable
              style={styles.trackPress}
              onPress={() => onPlay(item)}
              disabled={Boolean(busy)}>
              {item.cover ? (
                <Image source={{ uri: item.cover }} style={styles.cover} />
              ) : (
                <View style={[styles.cover, styles.coverPh]}>
                  <Text style={styles.coverPhTxt}>♪</Text>
                </View>
              )}
              <View style={{ flex: 1 }}>
                <Text style={styles.tTitle} numberOfLines={2}>
                  {item.title}
                </Text>
                <Text style={styles.tArt} numberOfLines={1}>
                  {item.artist}
                </Text>
                <Text style={styles.tSrc}>{item.source}</Text>
              </View>
              {busy ? <ActivityIndicator color="#c084fc" /> : null}
            </Pressable>
            </LiquidGlassPanel>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: 'transparent' },
  h1: {
    fontSize: 34,
    fontWeight: '700',
    letterSpacing: Platform.OS === 'ios' ? -0.8 : 0,
    color: '#faf5ff',
    paddingHorizontal: 16,
  },
  sub: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 18,
    color: 'rgba(255,255,255,0.45)',
    marginBottom: 14,
    paddingHorizontal: 16,
  },
  searchShell: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 4,
  },
  input: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 22,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 14 : 12,
    color: '#fff',
    fontSize: 17,
  },
  goBtn: {
    backgroundColor: '#c084fc',
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 14,
    minWidth: 92,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goBtnDisabled: { opacity: 0.45 },
  goTxt: { fontWeight: '800', color: '#0a0a12' },
  gate: {
    marginTop: 10,
    fontSize: 13,
    color: '#fcd34d',
    lineHeight: 18,
    paddingHorizontal: 16,
  },
  srcLabel: {
    marginTop: 14,
    fontSize: 12,
    fontWeight: '700',
    color: '#a78bfa',
    marginBottom: 6,
    paddingHorizontal: 16,
  },
  chips: {
    gap: 8,
    paddingBottom: 8,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  chipOn: {
    borderColor: '#c084fc',
    backgroundColor: 'rgba(168,85,247,0.2)',
  },
  chipTxt: { color: '#d1d5db', fontSize: 13, fontWeight: '600' },
  chipTxtOn: { color: '#f5e9ff' },
  msg: {
    marginVertical: 8,
    fontSize: 13,
    color: '#e5e7eb',
    paddingHorizontal: 16,
  },
  trackRow: {
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  trackPress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  trackGlass: {
    marginHorizontal: 14,
    marginVertical: 5,
  },
  cover: {
    width: 52,
    height: 52,
    borderRadius: 10,
    backgroundColor: '#151520',
  },
  coverPh: { alignItems: 'center', justifyContent: 'center' },
  coverPhTxt: { color: '#a78bfa', fontSize: 20 },
  tTitle: { color: '#f9fafb', fontSize: 15, fontWeight: '700' },
  tArt: { color: '#9ca3af', fontSize: 13, marginTop: 2 },
  tSrc: { color: '#6b7280', fontSize: 11, marginTop: 4, textTransform: 'uppercase' },
});
