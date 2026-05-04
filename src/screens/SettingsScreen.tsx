import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  LayoutAnimation,
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
import {
  gatewayCheck,
  gatewayValidateVk,
  gatewayValidateYandex,
} from '../api/flowGateway';
import { LiquidGlassPanel } from '../components/LiquidGlassPanel';
import { fontFamilyForId } from '../constants/fontChoices';
import { useFlowSettings } from '../context/FlowSettingsContext';
import { useSocialAuth } from '../context/SocialAuthContext';

if (Platform.OS === 'ios') {
  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
}

/** Дефолтный Bearer для соц API и секрет музыкального шлюза на твоём VPS. */
const DEFAULT_FLOW_SECRET = 'flowflow';

async function validateFlowSocialToken(
  base: string,
  token: string,
): Promise<{ ok: boolean; message: string }> {
  const b = base.trim().replace(/\/$/, '');
  if (!b) return { ok: false, message: 'Укажите URL сервера' };
  const bearer = token.trim() || DEFAULT_FLOW_SECRET;

  const url = `${b}/flow-api/v1/profile-public/flow`;
  let res: Response;
  try {
    res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${bearer}`,
        'User-Agent': 'FlowMobile/1.0 (Flow; settings)',
      },
    });
  } catch (e) {
    const m = e instanceof Error ? e.message : String(e);
    return {
      ok: false,
      message: `Сеть: ${m}. Проверь URL в Safari, другую сеть (LTE/Wi‑Fi), VPN/Private Relay.`,
    };
  }

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
  const { username: authUsername, logout } = useSocialAuth();
  const s = useFlowSettings();
  const {
    backgroundUri,
    coverUri,
    bannerUri,
    backgroundRotateDeg,
    backgroundScale,
    backgroundDim,
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
    setBannerUri,
    setBackgroundRotateDeg,
    setBackgroundScale,
    setBackgroundDim,
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
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    appearance: true,
    media: true,
    blur: true,
    profiles: true,
    gateway: false,
    tokens: false,
    social: false,
  });

  useEffect(() => {
    setLocalBase(apiBase);
    setLocalToken(apiToken);
  }, [apiBase, apiToken]);

  const titleFont = fontFamilyForId(fontId);

  const pickMedia = useCallback(
    (kind: 'bg' | 'cover' | 'banner') => {
      launchImageLibrary(
        {
          mediaType: 'mixed',
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
          else if (kind === 'cover') setCoverUri(uri);
          else setBannerUri(uri);
        },
      );
    },
    [setBackgroundUri, setBannerUri, setCoverUri],
  );

  const toggleSection = useCallback((id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenSections(prev => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const onValidateSocial = useCallback(async () => {
    setValidateMsg(null);
    const effectiveToken = localToken.trim() || DEFAULT_FLOW_SECRET;
    setApiBase(localBase);
    setApiToken(effectiveToken);
    setLocalToken(effectiveToken);
    setValidating(true);
    try {
      const r = await validateFlowSocialToken(localBase, effectiveToken);
      setValidateMsg(r.message);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setValidateMsg(`Сеть: ${msg}`);
    } finally {
      setValidating(false);
    }
  }, [localBase, localToken, setApiBase, setApiToken, setLocalToken]);

  const onCheckGateway = useCallback(async () => {
    setGatewayMsg(null);
    setBusyGateway(true);
    try {
      const base = String(gatewayBase || '').trim();
      if (/\/social\/?$/i.test(base)) {
        setGatewayMsg(
          'В «URL шлюза» указан адрес Flow Social (/social). Для музыки нужен шлюз: …/mobile (или :3950 напрямую).',
        );
        return;
      }
      const secret = gatewaySecret.trim() || DEFAULT_FLOW_SECRET;
      const r = await gatewayCheck(base, secret);
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
        'На VPS:',
        '1) systemd: flow-mobile-gateway активен',
        '2) Nginx: префикс /mobile → процесс шлюза',
        '3) Safari на телефоне: http://85.239.34.229/mobile/health → {"ok":true}',
        'В приложении URL шлюза должен быть …/mobile, не …/social.',
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

  const profileMocks = useMemo(
    () => [
      { id: '1', name: 'flowwave', sub: 'Сейчас в сети' },
      { id: '2', name: 'stalker', sub: 'Слушает: The Weeknd' },
      { id: '3', name: 'pixel', sub: 'Не беспокоить' },
    ],
    [],
  );

  const SectionHeader = ({
    id,
    title,
  }: {
    id: string;
    title: string;
  }) => (
    <Pressable style={styles.foldHeader} onPress={() => toggleSection(id)}>
      <Text style={styles.foldTitle}>{title}</Text>
      <Text style={styles.foldArrow}>{openSections[id] ? '˅' : '›'}</Text>
    </Pressable>
  );

  return (
    <KeyboardAvoidingView
      style={[styles.root, { paddingTop: insets.top + 8 }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}>
      <Text style={[styles.screenTitle, titleFont ? { fontFamily: titleFont } : null]}>
        Настройки
      </Text>
      <Text style={styles.screenSub}>UI · Media · Blur · Profiles · Gateway · Tokens · Social</Text>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
        keyboardDismissMode="interactive">
        <LiquidGlassPanel intensity="chrome" style={styles.appearanceGlass} contentStyle={styles.appearanceContent}>
          <View style={styles.glassHighlight} pointerEvents="none" />
          <SectionHeader id="appearance" title="UI" />
          {openSections.appearance ? (
            <>
              <Text style={styles.hint}>По умолчанию всё уже настроено под рабочий шлюз и стеклянный UI.</Text>
              <Pressable style={styles.btnDanger} onPress={onResetLook}>
                <Text style={styles.btnDangerText}>Сбросить оформление</Text>
              </Pressable>
            </>
          ) : null}
        </LiquidGlassPanel>

        <LiquidGlassPanel intensity="chrome" style={styles.gatewayGlass} contentStyle={styles.gatewayGlassContent}>
          <SectionHeader id="media" title="Media" />
          {openSections.media ? (
            <>
              <Text style={styles.hint}>Отдельно меняются фон, обложка профиля и баннер. Поддержка фото и GIF.</Text>
              <View style={styles.rowWrap}>
                <Pressable style={styles.btnGlass} onPress={() => pickMedia('bg')}>
                  <Text style={styles.btnText}>Фон IMAGE/GIF</Text>
                </Pressable>
                <Pressable style={styles.btnGlass} onPress={() => setBackgroundUri(null)}>
                  <Text style={styles.btnText}>CLEAR</Text>
                </Pressable>
              </View>
              <View style={styles.rowWrap}>
                <Pressable style={styles.btnGlass} onPress={() => pickMedia('cover')}>
                  <Text style={styles.btnText}>Обложка IMAGE/GIF</Text>
                </Pressable>
                <Pressable style={styles.btnGlass} onPress={() => setCoverUri(null)}>
                  <Text style={styles.btnText}>CLEAR</Text>
                </Pressable>
              </View>
              <View style={styles.rowWrap}>
                <Pressable style={styles.btnGlass} onPress={() => pickMedia('banner')}>
                  <Text style={styles.btnText}>Баннер IMAGE/GIF</Text>
                </Pressable>
                <Pressable style={styles.btnGlass} onPress={() => setBannerUri(null)}>
                  <Text style={styles.btnText}>CLEAR</Text>
                </Pressable>
              </View>
              <Text style={styles.meta}>
                {backgroundUri ? 'Фон: OK' : 'Фон: пусто'} · {coverUri ? 'Обложка: OK' : 'Обложка: пусто'} ·{' '}
                {bannerUri ? 'Баннер: OK' : 'Баннер: пусто'}
              </Text>
            </>
          ) : null}
        </LiquidGlassPanel>

        <LiquidGlassPanel intensity="chrome" style={styles.gatewayGlass} contentStyle={styles.gatewayGlassContent}>
          <SectionHeader id="blur" title="Blur" />
          {openSections.blur ? (
            <>
              <Text style={styles.label}>Поворот фона: {backgroundRotateDeg.toFixed(0)}°</Text>
              <View style={styles.rowWrap}>
                <Pressable style={styles.btnGlass} onPress={() => setBackgroundRotateDeg(backgroundRotateDeg - 2)}>
                  <Text style={styles.btnText}>-2°</Text>
                </Pressable>
                <Pressable style={styles.btnGlass} onPress={() => setBackgroundRotateDeg(backgroundRotateDeg + 2)}>
                  <Text style={styles.btnText}>+2°</Text>
                </Pressable>
              </View>
              <Text style={styles.label}>Масштаб фона: {(backgroundScale * 100).toFixed(0)}%</Text>
              <View style={styles.rowWrap}>
                <Pressable style={styles.btnGlass} onPress={() => setBackgroundScale(backgroundScale - 0.03)}>
                  <Text style={styles.btnText}>-</Text>
                </Pressable>
                <Pressable style={styles.btnGlass} onPress={() => setBackgroundScale(backgroundScale + 0.03)}>
                  <Text style={styles.btnText}>+</Text>
                </Pressable>
              </View>
              <Text style={styles.label}>Затемнение: {(backgroundDim * 100).toFixed(0)}%</Text>
              <View style={styles.rowWrap}>
                <Pressable style={styles.btnGlass} onPress={() => setBackgroundDim(backgroundDim - 0.05)}>
                  <Text style={styles.btnText}>Светлее</Text>
                </Pressable>
                <Pressable style={styles.btnGlass} onPress={() => setBackgroundDim(backgroundDim + 0.05)}>
                  <Text style={styles.btnText}>Темнее</Text>
                </Pressable>
              </View>
            </>
          ) : null}
        </LiquidGlassPanel>

        <LiquidGlassPanel intensity="chrome" style={styles.gatewayGlass} contentStyle={styles.gatewayGlassContent}>
          <SectionHeader id="profiles" title="Profiles" />
          {openSections.profiles ? (
            <>
              {profileMocks.map(p => (
                <View key={p.id} style={styles.profileRow}>
                  <View style={styles.profileAvatar} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.profileName}>{p.name}</Text>
                    <Text style={styles.profileSub}>{p.sub}</Text>
                  </View>
                </View>
              ))}
            </>
          ) : null}
        </LiquidGlassPanel>

        <LiquidGlassPanel
          intensity="chrome"
          style={styles.gatewayGlass}
          contentStyle={styles.gatewayGlassContent}>
          <SectionHeader id="gateway" title="Gateway" />
          {openSections.gateway ? (
            <>
          <Text style={styles.hint}>
            Запуск: <Text style={styles.mono}>FLOW_MOBILE_GATEWAY_SECRET=flowflow</Text>. Это{' '}
            <Text style={styles.mono}>/mobile</Text> (музыка), не путай с <Text style={styles.mono}>/social</Text>.
          </Text>
          <Text style={styles.label}>URL шлюза</Text>
          <TextInput
            style={styles.inputGlass}
            placeholder="http://85.239.34.229/mobile"
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
            </>
          ) : null}
        </LiquidGlassPanel>

        <LiquidGlassPanel
          intensity="chrome"
          style={styles.gatewayGlass}
          contentStyle={styles.gatewayGlassContent}>
          <SectionHeader id="tokens" title="Tokens" />
          {openSections.tokens ? (
            <>
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
            </>
          ) : null}
        </LiquidGlassPanel>

        <LiquidGlassPanel
          intensity="chrome"
          style={styles.gatewayGlass}
          contentStyle={styles.gatewayGlassContent}>
          <SectionHeader id="social" title="Social" />
          {openSections.social ? (
            <>
        <Text style={styles.hint}>
          База: лучше <Text style={styles.mono}>http://IP/social</Text> через Nginx:80 — с телефона порт{' '}
          <Text style={styles.mono}>:3847</Text> часто закрыт снаружи. Токен пустой = подставится{' '}
          <Text style={styles.mono}>flowflow</Text>.
        </Text>
        <Text style={styles.label}>URL сервера</Text>
        <TextInput
          style={styles.input}
          placeholder="http://85.239.34.229/social"
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
        <Text style={styles.label}>Текущий аккаунт</Text>
        <Text style={styles.smallMsg}>{authUsername || 'Не выполнен вход'}</Text>
        <Pressable style={styles.helpBtn} onPress={() => void logout()}>
          <Text style={styles.helpBtnText}>Выйти из аккаунта</Text>
        </Pressable>
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
            </>
          ) : null}
        </LiquidGlassPanel>

        <Text style={[styles.section, { marginTop: 26 }]}>Шрифт</Text>
        <Text style={styles.hint}>Minecraftia включён как основной шрифт всего приложения.</Text>
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
  glassHighlight: {
    position: 'absolute',
    top: -28,
    left: 0,
    right: 0,
    height: 74,
    borderBottomLeftRadius: 140,
    borderBottomRightRadius: 42,
    backgroundColor: 'rgba(255,255,255,0.18)',
    opacity: 0.75,
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
  rowWrap: { flexDirection: 'row', gap: 10, marginBottom: 8 },
  foldHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.22)',
  },
  foldTitle: { color: '#f5e9ff', fontSize: 16, fontWeight: '800' },
  foldArrow: { color: '#d8b4fe', fontSize: 20, fontWeight: '700' },
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
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 10,
    marginBottom: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.22)',
  },
  profileAvatar: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: 'rgba(139,92,246,0.5)',
  },
  profileName: { color: '#faf5ff', fontSize: 14, fontWeight: '700' },
  profileSub: { color: '#c4b5fd', fontSize: 12, marginTop: 2 },
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
    backgroundColor: 'rgba(192,132,252,0.28)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.38)',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  btnDisabled: { opacity: 0.65 },
  btnPrimaryText: { color: '#f8f5ff', fontWeight: '800', fontSize: 15 },
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
