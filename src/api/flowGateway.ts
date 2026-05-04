import {
  createFlowGatewayClient,
  normalizeGatewayBase as normalizeGatewayBaseImpl,
} from '@flow/api-client';
import type { FlowTrack, SearchSource } from '../types/flowTrack';

export const normalizeGatewayBase = normalizeGatewayBaseImpl;

export type MusicTokens = {
  spotifyToken?: string;
  yandexToken?: string;
  vkToken?: string;
  soundcloudClientId?: string;
};

function gw(gatewayBase: string, gatewaySecret: string) {
  return createFlowGatewayClient({
    baseUrl: gatewayBase,
    secret: gatewaySecret,
  });
}

export async function gatewaySearch(
  gatewayBase: string,
  gatewaySecret: string,
  q: string,
  source: SearchSource,
  tokens: MusicTokens,
): Promise<{ ok: boolean; tracks: FlowTrack[]; mode?: string; error?: string }> {
  const base = normalizeGatewayBaseImpl(gatewayBase);
  if (!base || !gatewaySecret.trim()) {
    return { ok: false, tracks: [], error: 'Укажите URL и секрет шлюза в настройках' };
  }
  const r = await gw(gatewayBase, gatewaySecret).search(q, source, {
    spotifyToken: tokens.spotifyToken || '',
    yandexToken: tokens.yandexToken || '',
    vkToken: tokens.vkToken || '',
    soundcloudClientId: tokens.soundcloudClientId || '',
  });
  return {
    ok: r.ok,
    tracks: (r.tracks || []) as FlowTrack[],
    mode: r.mode,
    error: r.error,
  };
}

export async function gatewayResolve(
  gatewayBase: string,
  gatewaySecret: string,
  track: FlowTrack,
  tokens: MusicTokens,
): Promise<{ ok: boolean; url?: string; error?: string }> {
  return gw(gatewayBase, gatewaySecret).resolve(
    track as unknown as Record<string, unknown>,
    {
      yandexToken: tokens.yandexToken || '',
      vkToken: tokens.vkToken || '',
      soundcloudClientId: tokens.soundcloudClientId || '',
    },
  );
}

export async function gatewayValidateYandex(
  gatewayBase: string,
  gatewaySecret: string,
  yandexToken: string,
): Promise<{ ok: boolean; message: string }> {
  return gw(gatewayBase, gatewaySecret).validateYandex(yandexToken);
}

export async function gatewayValidateVk(
  gatewayBase: string,
  gatewaySecret: string,
  vkToken: string,
): Promise<{ ok: boolean; message: string }> {
  return gw(gatewayBase, gatewaySecret).validateVk(vkToken);
}

export async function gatewayCheck(
  gatewayBase: string,
  gatewaySecret: string,
): Promise<{ ok: boolean; message: string }> {
  const base = normalizeGatewayBaseImpl(gatewayBase);
  if (!base) return { ok: false, message: 'Нет URL шлюза' };
  if (!gatewaySecret.trim()) return { ok: false, message: 'Нет секрета шлюза' };

  const r = await gw(gatewayBase, gatewaySecret).checkSecret();
  return { ok: r.ok, message: r.message };
}

/** Простукивание при старте (шлюз + опционально Яндекс/VK). */
export async function gatewayProbeSavedTokens(
  gatewayBase: string,
  gatewaySecret: string,
  tokens: MusicTokens,
) {
  const base = normalizeGatewayBaseImpl(gatewayBase);
  if (!base || !gatewaySecret.trim()) return null;
  return gw(gatewayBase, gatewaySecret).probeSavedTokens({
    yandexToken: tokens.yandexToken || '',
    vkToken: tokens.vkToken || '',
  });
}
