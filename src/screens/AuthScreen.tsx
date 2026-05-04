import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LiquidGlassPanel } from '../components/LiquidGlassPanel';
import { GLASS_RADIUS_LG } from '../constants/theme';
import { useSocialAuth } from '../context/SocialAuthContext';

export function AuthScreen() {
  const insets = useSafeAreaInsets();
  const { login, register, enterGuest } = useSocialAuth();
  const rise = useRef(new Animated.Value(0)).current;
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    Animated.spring(rise, {
      toValue: 1,
      damping: 15,
      stiffness: 130,
      mass: 0.85,
      useNativeDriver: true,
    }).start();
  }, [rise]);

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
    <View style={[styles.root, { paddingTop: insets.top + 18, paddingBottom: insets.bottom + 14 }]}>
      <Animated.View
        style={[
          styles.centerWrap,
          {
            opacity: rise,
            transform: [
              {
                translateY: rise.interpolate({
                  inputRange: [0, 1],
                  outputRange: [28, 0],
                }),
              },
            ],
          },
        ]}>
      <LiquidGlassPanel borderRadius={GLASS_RADIUS_LG} intensity="chrome" style={styles.card} contentStyle={styles.cardContent}>
        <Text style={styles.logo}>Flow</Text>
        <Text style={styles.subtitle}>Liquid glass · neon depth · музыка вокруг тебя</Text>
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
        <Pressable style={styles.guestBtn} onPress={() => void enterGuest()}>
          <Text style={styles.guestText}>Войти как гость</Text>
        </Pressable>
        {message ? <Text style={styles.err}>{message}</Text> : null}
      </LiquidGlassPanel>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: 16, backgroundColor: 'transparent', justifyContent: 'center' },
  centerWrap: { justifyContent: 'center' },
  logo: { color: '#faf5ff', fontSize: 44, fontWeight: '800', textAlign: 'center', marginTop: 2 },
  subtitle: { color: '#b8afcb', fontSize: 13, marginTop: 2, marginBottom: 14, textAlign: 'center' },
  card: { maxWidth: 420, alignSelf: 'center', width: '100%' },
  cardContent: { padding: 18 },
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
  guestBtn: { marginTop: 10, alignItems: 'center', paddingVertical: 8 },
  guestText: { color: '#d8b4fe', fontSize: 13, fontWeight: '700' },
  err: { color: '#fca5a5', fontSize: 12, marginTop: 8, textAlign: 'center' },
});
