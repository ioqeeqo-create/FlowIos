import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LiquidGlassPanel } from '../components/LiquidGlassPanel';
import { useFlowSettings } from '../context/FlowSettingsContext';

type PublicProfile = {
  username: string;
  online?: number;
  avatar_data?: string | null;
  banner_data?: string | null;
  bio?: string | null;
  total_tracks?: number;
};

function authHeaders(token: string) {
  return { Authorization: `Bearer ${token}` };
}

export function SocialScreen() {
  const insets = useSafeAreaInsets();
  const { apiBase, apiToken, socialUsername } = useFlowSettings();
  const [selfProfile, setSelfProfile] = useState<PublicProfile | null>(null);
  const [friends, setFriends] = useState<PublicProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<PublicProfile | null>(null);
  const normalizedBase = useMemo(() => String(apiBase || '').trim().replace(/\/$/, ''), [apiBase]);

  const fetchProfile = useCallback(
    async (username: string) => {
      const res = await fetch(
        `${normalizedBase}/flow-api/v1/profile-public/${encodeURIComponent(username)}`,
        { headers: authHeaders(apiToken) },
      );
      if (!res.ok) return null;
      return (await res.json()) as PublicProfile;
    },
    [apiToken, normalizedBase],
  );

  const reload = useCallback(async () => {
    if (!normalizedBase || !apiToken.trim()) {
      setMessage('Укажи Flow Social URL и Bearer токен в настройках.');
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      const me = await fetchProfile(socialUsername);
      setSelfProfile(me);
      const fr = await fetch(
        `${normalizedBase}/flow-api/v1/friends/${encodeURIComponent(socialUsername)}`,
        { headers: authHeaders(apiToken) },
      );
      const raw = fr.ok ? ((await fr.json()) as Array<{ friend_username?: string }>) : [];
      const names = raw
        .map(x => String(x.friend_username || '').trim().toLowerCase())
        .filter(Boolean);
      const detailed = await Promise.all(names.map(name => fetchProfile(name)));
      setFriends(detailed.filter(Boolean) as PublicProfile[]);
      if (!me) setMessage('Профиль не найден. Проверь social username в настройках.');
    } catch (e: unknown) {
      setMessage(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, [apiToken, fetchProfile, normalizedBase, socialUsername]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const profileCard = (profile: PublicProfile, isSelf = false) => (
    <LiquidGlassPanel key={profile.username} style={styles.profileCard} contentStyle={styles.profileCardContent}>
      <Image
        source={{ uri: profile.banner_data || 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1200' }}
        style={styles.banner}
      />
      <View style={styles.bannerFade} />
      <View style={styles.profileMainRow}>
        <Image
          source={{ uri: profile.avatar_data || `https://i.pravatar.cc/120?u=${profile.username}` }}
          style={styles.avatar}
        />
        <View style={{ flex: 1 }}>
          <Text style={styles.username}>{profile.username}</Text>
          <Text style={styles.sub}>{profile.bio || (isSelf ? 'Мой профиль' : 'Профиль друга')}</Text>
        </View>
        <View style={[styles.dot, profile.online ? styles.dotOn : styles.dotOff]} />
      </View>
      <Text style={styles.stats}>Tracks: {profile.total_tracks || 0}</Text>
    </LiquidGlassPanel>
  );

  return (
    <View style={[styles.root, { paddingTop: insets.top + 8 }]}>
      <View style={styles.headRow}>
        <View>
          <Text style={styles.title}>Соц</Text>
          <Text style={styles.subtitle}>Профили и друзья из твоего Flow Social</Text>
        </View>
        <Pressable style={styles.meBtn} onPress={() => selfProfile && setSelectedProfile(selfProfile)}>
          <Text style={styles.meBtnText}>Мой профиль</Text>
        </Pressable>
      </View>

      <Pressable style={styles.refresh} onPress={() => void reload()}>
        <Text style={styles.refreshText}>Обновить</Text>
      </Pressable>

      {loading ? <ActivityIndicator color="#c084fc" style={{ marginTop: 8 }} /> : null}
      {message ? <Text style={styles.msg}>{message}</Text> : null}

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 34 }}>
        {selfProfile ? profileCard(selfProfile, true) : null}
        <Text style={styles.friendsTitle}>Друзья</Text>
        {friends.length ? (
          friends.map(friend => (
            <Pressable key={friend.username} onPress={() => setSelectedProfile(friend)}>
              {profileCard(friend)}
            </Pressable>
          ))
        ) : (
          <Text style={styles.empty}>Список друзей пуст или профили не заполнены на сервере.</Text>
        )}
      </ScrollView>

      <Modal visible={Boolean(selectedProfile)} transparent animationType="fade" onRequestClose={() => setSelectedProfile(null)}>
        <View style={styles.modalWrap}>
          <View style={styles.modalContent}>{selectedProfile ? profileCard(selectedProfile, selectedProfile.username === socialUsername) : null}</View>
          <Pressable style={styles.closeBtn} onPress={() => setSelectedProfile(null)}>
            <Text style={styles.closeBtnText}>Закрыть</Text>
          </Pressable>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: 14 },
  headRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { color: '#faf5ff', fontSize: 34, fontWeight: '800' },
  subtitle: { color: '#b9b2c8', fontSize: 12, marginTop: 2 },
  meBtn: {
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.26)',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  meBtnText: { color: '#f3e8ff', fontSize: 12, fontWeight: '700' },
  refresh: { marginTop: 10, marginBottom: 8 },
  refreshText: { color: '#c4b5fd', fontSize: 13, fontWeight: '700' },
  msg: { color: '#fca5a5', marginBottom: 8, fontSize: 12 },
  friendsTitle: { color: '#ddd6fe', fontSize: 13, marginTop: 12, marginBottom: 6, fontWeight: '700' },
  profileCard: { marginBottom: 10 },
  profileCardContent: { padding: 0, overflow: 'hidden' },
  banner: { width: '100%', height: 90 },
  bannerFade: {
    position: 'absolute',
    top: 55,
    left: 0,
    right: 0,
    height: 48,
    backgroundColor: 'rgba(14,13,22,0.55)',
  },
  profileMainRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 12, paddingTop: 8 },
  avatar: { width: 64, height: 64, borderRadius: 22, borderWidth: 1, borderColor: 'rgba(255,255,255,0.34)' },
  username: { color: '#f8f5ff', fontSize: 28, fontWeight: '800' },
  sub: { color: '#b7aeca', fontSize: 12, marginTop: 1 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  dotOn: { backgroundColor: '#34d399' },
  dotOff: { backgroundColor: '#6b7280' },
  stats: { color: '#aea6c5', fontSize: 11, paddingHorizontal: 12, paddingBottom: 10, paddingTop: 5 },
  empty: { color: '#a59eb8', fontSize: 12, marginTop: 8 },
  modalWrap: { flex: 1, backgroundColor: 'rgba(2,2,8,0.7)', justifyContent: 'center', paddingHorizontal: 14 },
  modalContent: { maxHeight: '78%' },
  closeBtn: {
    alignSelf: 'center',
    marginTop: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  closeBtnText: { color: '#fff', fontWeight: '700' },
});
