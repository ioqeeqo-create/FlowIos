import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';
import {
  gatewayCheck,
  gatewayValidateVk,
  gatewayValidateYandex,
} from '../api/flowGateway';
import { LiquidGlassPanel } from '../components/LiquidGlassPanel';
import { FONT_CHOICES, fontFamilyForId } from '../constants/fontChoices';
import { useFlowSettings } from '../context/FlowSettingsContext';

function GlassWave() {
  return (
    <Svg
      width="100%"
      height={74}
      viewBox="0 0 360 74"
      preserveAspectRatio="none"
      style={styles.glassWave}
      pointerEvents="none">
      <Defs>
        <LinearGradient id="settingsGlassWave" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor="#ffffff" stopOpacity="0.38" />
          <Stop offset="0.55" stopColor="#ffffff" stopOpacity="0.1" />
          <Stop offset="1" stopColor="#ffffff" stopOpacity="0.28" />
        </LinearGradient>
      </Defs>
      <Path
        d="M0 0 H360 C338 43 292 54 222 44 C143 32 81 64 0 38 Z"
        fill="url(#settingsGlassWave)"
        opacity="0.62"
      />
    </Svg>
  );
}

async function validateFlowSocialToken(
  base: string,
  token: string,
): Promise<{ ok: boolean; message: string }> {
  const b = base.trim().replace(/\/$/, '');
  if (!b) return { ok: false, message: 'Укажите URL сервера' };
  if (!token.trim()) return { ok: false, message: 'Укажите токен (FLOW_SOCIAL_SECRET как Bearer)' };

  const url = `${b}/flow-api/v1/profile-public/flow`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token.trim()}` },
  });

  if (res.status === 401) {
    return { ok: false, message: '401: токен не принят сервером' };
  }
  if (res.status === 404) {
    return {
      ok: true,
      message: 'Токен принят (пользователь flow не найден — это нормально)',
    };
  }
  if (res.ok) {
    return { ok: true, message: 'Токен принят, ответ 200' };
  }
  const t = await res.text().catch(() => '');
  return { ok: false, message: `Ошибка ${res.status}${t ? `: ${t.slice(0, 120)}` : ''}` };
}

export function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const s = useFlowSettings();
  const {
    backgroundUri,
    coverUri,
    fontId,
    apiBase,
    apiToken,
    gatewayBase,
    gatewaySecret,
    spotifyToken,
    yandexToken,
    vkToken,
    soundcloudClientId,
    setBackgroundUri,
    setCoverUri,
    setFontId,
    setApiBase,
    setApiToken,
    setGatewayBase,
    setGatewaySecret,
    setSpotifyToken,
    setYandexToken,
    setVkToken,
    setSoundcloudClientId,
    setYandexValidated,
    setVkValidated,
    yandexValidated,
    vkValidated,
    resetAppearance,
  } = s;

  const [localBase, setLocalBase] = useState(apiBase);
  const [localToken, setLocalToken] = useState(apiToken);
  const [validating, setValidating] = useState(false);
  const [validateMsg, setValidateMsg] = useState<string | null>(null);
  const [valYandexMsg, setValYandexMsg] = useState<string | null>(null);
  const [valVkMsg, setValVkMsg] = useState<string | null>(null);
  const [gatewayMsg, setGatewayMsg] = useState<string | null>(null);
  const [busyGateway, setBusyGateway] = useState(false);
  const [busyY, setBusyY] = useState(false);
  const [busyV, setBusyV] = useState(false);

  useEffect(() => {
    setLocalBase(apiBase);
    setLocalToken(apiToken);
  }, [apiBase, apiToken]);

  const titleFont = fontFamilyForId(fontId);

  const pickMedia = useCallback(
    (kind: 'bg' | 'cover') => {
      launchImageLibrary(
        {
          mediaType: 'photo',
          selectionLimit: 1,
          quality: 1,
        },
        response => {
          if (response.didCancel) return;
          if (response.errorMessage) {
            Alert.alert('Галерея', response.errorMessage);
            return;
          }
          const uri = response.assets?.[0]?.uri;
          if (!uri) return;
          if (kind === 'bg') setBackgroundUri(uri);
          else setCoverUri(uri);
        },
      );
    },
    [setBackgroundUri, setCoverUri],
  );

  const onValidateSocial = useCallback(async () => {
    setValidateMsg(null);
    setApiBase(localBase);
    setApiToken(localToken);
    setValidating(true);
    try {
      const r = await validateFlowSocialToken(localBase, localToken);
      setValidateMsg(r.message);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setValidateMsg(`Сеть: ${msg}`);
    } finally {
      setValidating(false);
    }
  }, [localBase, localToken, setApiBase, setApiToken]);

  const onCheckGateway = useCallback(async () => {
    setGatewayMsg(null);
    setBusyGateway(true);
    try {
      const r = await gatewayCheck(gatewayBase, gatewaySecret);
      setGatewayMsg(r.message);
    } catch (e: unknown) {
      setGatewayMsg(e instanceof Error ? e.message : String(e));
    } finally {
      setBusyGateway(false);
    }
  }, [gatewayBase, gatewaySecret]);

  const onShowGatewayHelp = useCallback(() => {
    Alert.alert(
      'Шлюз не отвечает',
      [
        'На VPS выполни:',
        '1) cd flow-mobile-gateway && npm start',
        '2) открой порт 3950 в firewall/панели VPS',
        '3) проверь в Safari: http://85.239.34.229:3950/health',
        'Должно вернуться {"ok":true}.',
      ].join('\n'),
    );
  }, []);

  const onValidateYandex = useCallback(async () => {
    setValYandexMsg(null);
    setBusyY(true);
    try {
      const r = await gatewayValidateYandex(
        gatewayBase,
        gatewaySecret,
        yandexToken,
      );
      setValYandexMsg(r.message);
      setYandexValidated(r.ok);
    } catch (e: unknown) {
      setValYandexMsg(e instanceof Error ? e.message : String(e));
      setYandexValidated(false);
    } finally {
      setBusyY(false);
    }
  }, [gatewayBase, gatewaySecret, setYandexValidated, yandexToken]);

  const onValidateVk = useCallback(async () => {
    setValVkMsg(null);
    setBusyV(true);
    try {
      const r = await gatewayValidateVk(gatewayBase, gatewaySecret, vkToken);
      setValVkMsg(r.message);
      setVkValidated(r.ok);
    } catch (e: unknown) {
      setValVkMsg(e instanceof Error ? e.message : String(e));
      setVkValidated(false);
    } finally {
      setBusyV(false);
    }
  }, [gatewayBase, gatewaySecret, setVkValidated, vkToken]);

  const onResetLook = useCallback(() => {
    Alert.alert(
      'Сброс оформления',
      'Убрать фон, обложку и вернуть системный шрифт?',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Сбросить',
          style: 'destructive',
          onPress: () => {
            void resetAppearance();
          },
        },
      ],
    );
  }, [resetAppearance]);

  return (
    <KeyboardAvoidingView
      style={[styles.root, { paddingTop: insets.top + 8 }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}>
      <Text style={[styles.screenTitle, titleFont ? { fontFamily: titleFont } : null]}>
        Настройки
      </Text>
      <Text style={styles.screenSub}>Оформление, шлюз музыки, токены, Flow Social</Text>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
        keyboardDismissMode="interactive">
        <LiquidGlassPanel
          intensity="chrome"
          style={styles.appearanceGlass}
          contentStyle={styles.appearanceContent}>
          <GlassWave />
          <Text style={styles.section}>Оформление</Text>
          <Text style={styles.hint}>
            Фото и GIF из галереи — фон и обложка в шапке «Моя волна».
          </Text>
          <View style={styles.row}>
            <Pressable style={styles.btnGlass} onPress={() => pickMedia('bg')}>
              <Text style={styles.btnText}>Фон экрана</Text>
            </Pressable>
            <Pressable style={styles.btnGlass} onPress={() => pickMedia('cover')}>
              <Text style={styles.btnText}>Обложка</Text>
            </Pressable>
          </View>
          <Text style={styles.meta}>
            {backgroundUri ? 'Фон: да' : 'Фон: нет'} · {coverUri ? 'Обложка: да' : 'Обложка: нет'}
          </Text>
          <Pressable style={styles.btnDanger} onPress={onResetLook}>
            <Text style={styles.btnDangerText}>Сбросить оформление</Text>
          </Pressable>
        </LiquidGlassPanel>

        <LiquidGlassPanel
          intensity="chrome"
          style={styles.gatewayGlass}
          contentStyle={styles.gatewayGlassContent}>
          <GlassWave />
          <Text style={styles.section}>Шлюз музыки (Node на VPS/ПК)</Text>
          <Text style={styles.hint}>
            Запуск: в папке flow_fixed —{' '}
            <Text style={styles.mono}>
              FLOW_MOBILE_GATEWAY_SECRET=... npm run mobile-gateway
            </Text>
            . URL и секрет уже вставлены по умолчанию, поменяй их под свой сервер.
          </Text>
          <Text style={styles.label}>URL шлюза</Text>
          <TextInput
            style={styles.inputGlass}
            placeholder="http://192.168.1.5:3950"
            placeholderTextColor="rgba(255,255,255,0.38)"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardAppearance="dark"
            value={gatewayBase}
            onChangeText={setGatewayBase}
          />
          <Text style={styles.label}>Секрет шлюза</Text>
          <TextInput
            style={styles.inputGlass}
            placeholder="FLOW_MOBILE_GATEWAY_SECRET"
            placeholderTextColor="rgba(255,255,255,0.38)"
            autoCapitalize="none"
            secureTextEntry
            keyboardAppearance="dark"
            value={gatewaySecret}
            onChangeText={setGatewaySecret}
          />
          <Pressable
            style={[styles.btnPrimary, busyGateway && styles.btnDisabled]}
            onPress={onCheckGateway}
            disabled={busyGateway}>
            {busyGateway ? (
              <ActivityIndicator color="#0a0a12" />
            ) : (
              <Text style={styles.btnPrimaryText}>Проверить шлюз</Text>
            )}
          </Pressable>
          {gatewayMsg ? <Text style={styles.smallMsg}>{gatewayMsg}</Text> : null}
          {gatewayMsg && gatewayMsg !== 'Шлюз доступен, секрет принят' ? (
            <Pressable style={styles.helpBtn} onPress={onShowGatewayHelp}>
              <Text style={styles.helpBtnText}>Что сделать на VPS?</Text>
            </Pressable>
          ) : null}
          {gatewayMsg === 'Шлюз доступен, секрет принят' ? (
            <Text style={styles.okBadge}>Шлюз: подключен</Text>
          ) : null}
        </LiquidGlassPanel>

        <Text style={[styles.section, { marginTop: 22 }]}>Токены источников (как в десктопе)</Text>
        <Text style={styles.label}>Spotify access token</Text>
        <TextInput
          style={styles.input}
          placeholder="опционально"
          placeholderTextColor="#6b7280"
          autoCapitalize="none"
          value={spotifyToken}
          onChangeText={setSpotifyToken}
        />
        <Text style={styles.label}>Яндекс OAuth</Text>
        <TextInput
          style={styles.input}
          placeholder="OAuth токен Яндекс.Музыки"
          placeholderTextColor="#6b7280"
          autoCapitalize="none"
          secureTextEntry
          value={yandexToken}
          onChangeText={setYandexToken}
        />
        <Pressable
          style={[styles.btnPrimary, busyY && styles.btnDisabled]}
          onPress={onValidateYandex}
          disabled={busyY}>
          {busyY ? (
            <ActivityIndicator color="#0a0a12" />
          ) : (
            <Text style={styles.btnPrimaryText}>Проверить Яндекс (через шлюз)</Text>
          )}
        </Pressable>
        {valYandexMsg ? <Text style={styles.smallMsg}>{valYandexMsg}</Text> : null}
        {yandexValidated ? (
          <Text style={styles.okBadge}>Яндекс: проверен — поиск по Яндексу разрешён</Text>
        ) : null}

        <Text style={[styles.label, { marginTop: 12 }]}>VK access token</Text>
        <TextInput
          style={styles.input}
          placeholder="Kate / vkhost…"
          placeholderTextColor="#6b7280"
          autoCapitalize="none"
          secureTextEntry
          value={vkToken}
          onChangeText={setVkToken}
        />
        <Pressable
          style={[styles.btnPrimary, busyV && styles.btnDisabled]}
          onPress={onValidateVk}
          disabled={busyV}>
          {busyV ? (
            <ActivityIndicator color="#0a0a12" />
          ) : (
            <Text style={styles.btnPrimaryText}>Проверить VK (через шлюз)</Text>
          )}
        </Pressable>
        {valVkMsg ? <Text style={styles.smallMsg}>{valVkMsg}</Text> : null}
        {vkValidated ? (
          <Text style={styles.okBadge}>VK: проверен — поиск по VK разрешён</Text>
        ) : null}

        <Text style={[styles.label, { marginTop: 12 }]}>SoundCloud client_id (вручную)</Text>
        <TextInput
          style={styles.input}
          placeholder="если пусто — шлюз сам вытащит с soundcloud.com"
          placeholderTextColor="#6b7280"
          autoCapitalize="none"
          value={soundcloudClientId}
          onChangeText={setSoundcloudClientId}
        />

        <Text style={[styles.section, { marginTop: 26 }]}>Flow Social (комнаты / друзья)</Text>
        <Text style={styles.hint}>
          Как в десктопе: база и FLOW_SOCIAL_SECRET. Проверка — GET …/flow-api/v1/profile-public/flow
        </Text>
        <Text style={styles.label}>URL сервера</Text>
        <TextInput
          style={styles.input}
          placeholder="https://…:3847"
          placeholderTextColor="#6b7280"
          autoCapitalize="none"
          value={localBase}
          onChangeText={setLocalBase}
        />
        <Text style={styles.label}>Токен (Bearer)</Text>
        <TextInput
          style={styles.input}
          placeholder="FLOW_SOCIAL_SECRET"
          placeholderTextColor="#6b7280"
          autoCapitalize="none"
          secureTextEntry
          value={localToken}
          onChangeText={setLocalToken}
        />
        <Pressable
          style={[styles.btnPrimary, validating && styles.btnDisabled]}
          onPress={onValidateSocial}
          disabled={validating}>
          {validating ? (
            <ActivityIndicator color="#0a0a12" />
          ) : (
            <Text style={styles.btnPrimaryText}>Проверить Flow Social</Text>
          )}
        </Pressable>
        {validateMsg ? <Text style={styles.smallMsg}>{validateMsg}</Text> : null}

        <Text style={[styles.section, { marginTop: 26 }]}>Шрифт</Text>
        <Text style={styles.hint}>Превью «Abc123» в квадрате.</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.fontRow}>
          {FONT_CHOICES.map(choice => {
            const active = choice.id === fontId;
            const fam = choice.iosFontFamily;
            return (
              <Pressable
                key={choice.id}
                onPress={() => setFontId(choice.id)}
                style={[styles.fontCard, active && styles.fontCardActive]}>
                <View style={styles.fontPreviewBox}>
                  <Text style={[styles.fontPreviewText, fam ? { fontFamily: fam } : null]}>
                    Abc123
                  </Text>
                </View>
                <Text style={styles.fontLabel} numberOfLines={2}>
                  {choice.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingHorizontal: 18,
  },
  screenTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: '#faf5ff',
  },
  screenSub: {
    marginTop: 4,
    marginBottom: 12,
    fontSize: 14,
    color: '#9ca3af',
  },
  scroll: { flex: 1 },
  glassWave: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  appearanceGlass: {
    marginTop: 8,
    marginBottom: 24,
  },
  appearanceContent: {
    padding: 16,
  },
  gatewayGlass: {
    marginTop: 26,
    marginBottom: 2,
  },
  gatewayGlassContent: {
    padding: 16,
  },
  section: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: '#c084fc',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  hint: {
    fontSize: 13,
    lineHeight: 19,
    color: '#9ca3af',
    marginBottom: 12,
  },
  mono: { fontFamily: 'Minecraftia', fontSize: 11, color: '#d8b4fe' },
  row: { flexDirection: 'row', gap: 10 },
  btnGlass: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  btn: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  btnText: { color: '#e9d5ff', fontWeight: '700', fontSize: 14 },
  meta: { marginTop: 10, fontSize: 12, color: '#6b7280' },
  btnDanger: {
    marginTop: 14,
    alignSelf: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(239,68,68,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(248,113,113,0.45)',
  },
  btnDangerText: { color: '#fecaca', fontWeight: '700', fontSize: 13 },
  label: {
    marginTop: 10,
    fontSize: 12,
    fontWeight: '600',
    color: '#d1d5db',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#101018',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2e2e42',
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#f9fafb',
    fontSize: 15,
  },
  inputGlass: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.22)',
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 13 : 12,
    color: '#f9fafb',
    fontSize: 15,
  },
  btnPrimary: {
    marginTop: 12,
    backgroundColor: '#c084fc',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  btnDisabled: { opacity: 0.65 },
  btnPrimaryText: { color: '#0a0a12', fontWeight: '800', fontSize: 15 },
  helpBtn: {
    marginTop: 10,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  helpBtnText: { color: '#f5e9ff', fontWeight: '800', fontSize: 12 },
  smallMsg: {
    marginTop: 8,
    fontSize: 13,
    color: '#e5e7eb',
    lineHeight: 18,
  },
  okBadge: {
    marginTop: 6,
    fontSize: 12,
    color: '#86efac',
    fontWeight: '600',
  },
  fontRow: { marginTop: 8, marginHorizontal: -4 },
  fontCard: {
    width: 108,
    marginRight: 10,
    padding: 10,
    borderRadius: 16,
    backgroundColor: '#12121a',
    borderWidth: 1,
    borderColor: '#2a2a3d',
  },
  fontCardActive: {
    borderColor: '#c084fc',
    backgroundColor: 'rgba(168,85,247,0.12)',
  },
  fontPreviewBox: {
    height: 72,
    borderRadius: 12,
    backgroundColor: '#0a0a12',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#27273a',
  },
  fontPreviewText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#f3e8ff',
  },
  fontLabel: {
    fontSize: 11,
    color: '#d1d5db',
    textAlign: 'center',
    minHeight: 28,
  },
});
