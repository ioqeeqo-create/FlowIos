import React, { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LiquidGlassPanel } from '../components/LiquidGlassPanel';
import { useSocialAuth } from '../context/SocialAuthContext';

export function AuthScreen() {
  const insets = useSafeAreaInsets();
  const { login, register } = useSocialAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const submit = async () => {
    setBusy(true);
    setMessage(null);
    try {
      const r = mode === 'login' ? await login(username, password) : await register(username, password);
      if (!r.ok) setMessage(r.error || 'Ошибка');
    } catch (e: unknown) {
      setMessage(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top + 18 }]}>
      <Text style={styles.title}>Flow Social</Text>
      <Text style={styles.subtitle}>Войди как на десктопе, чтобы видеть друзей и профили.</Text>

      <LiquidGlassPanel style={styles.card} contentStyle={styles.cardContent}>
        <View style={styles.modes}>
          <Pressable style={[styles.modeBtn, mode === 'login' && styles.modeBtnActive]} onPress={() => setMode('login')}>
            <Text style={styles.modeText}>Вход</Text>
          </Pressable>
          <Pressable style={[styles.modeBtn, mode === 'register' && styles.modeBtnActive]} onPress={() => setMode('register')}>
            <Text style={styles.modeText}>Регистрация</Text>
          </Pressable>
        </View>
        <TextInput
          style={styles.input}
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          autoCorrect={false}
          placeholder="username"
          placeholderTextColor="rgba(255,255,255,0.38)"
        />
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="password"
          placeholderTextColor="rgba(255,255,255,0.38)"
        />
        <Pressable style={styles.submit} onPress={submit} disabled={busy}>
          {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>{mode === 'login' ? 'Войти' : 'Создать аккаунт'}</Text>}
        </Pressable>
        {message ? <Text style={styles.err}>{message}</Text> : null}
      </LiquidGlassPanel>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: 16, backgroundColor: 'transparent' },
  title: { color: '#faf5ff', fontSize: 32, fontWeight: '800' },
  subtitle: { color: '#b8afcb', fontSize: 13, marginTop: 4, marginBottom: 14 },
  card: {},
  cardContent: { padding: 12 },
  modes: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  modeBtn: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.24)',
  },
  modeBtnActive: { backgroundColor: 'rgba(168,85,247,0.28)' },
  modeText: { color: '#f5e9ff', fontWeight: '700' },
  input: {
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.24)',
    color: '#fff',
    fontSize: 15,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 8,
  },
  submit: {
    borderRadius: 12,
    backgroundColor: 'rgba(168,85,247,0.36)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.34)',
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  submitText: { color: '#fff', fontWeight: '800' },
  err: { color: '#fca5a5', fontSize: 12, marginTop: 8 },
});
