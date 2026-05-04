import React, { useEffect, useRef } from 'react';
import { gatewayProbeSavedTokens } from '../api/flowGateway';
import { DEFAULT_GATEWAY_SECRET, useFlowSettings } from '../context/FlowSettingsContext';

/**
 * После гидрации настроек — тихо проверяет /health шлюза и токены Яндекс/VK (если заданы).
 * Логи только в __DEV__; UI не блокирует.
 */
export function GatewayTokenWarmup() {
  const s = useFlowSettings();
  const ran = useRef(false);

  useEffect(() => {
    if (!s.hydrated || ran.current) return;
    const base = s.gatewayBase.trim().replace(/\/$/, '');
    if (!base || /\/social$/i.test(base)) return;
    const secret = s.gatewaySecret.trim() || DEFAULT_GATEWAY_SECRET;
    ran.current = true;

    const t = setTimeout(() => {
      void (async () => {
        try {
          const out = await gatewayProbeSavedTokens(s.gatewayBase, secret, {
            yandexToken: s.yandexToken,
            vkToken: s.vkToken,
          });
          if (__DEV__ && out) {
            // eslint-disable-next-line no-console
            console.log('[Flow] gateway probe', JSON.stringify(out));
          }
        } catch (e) {
          if (__DEV__) {
            // eslint-disable-next-line no-console
            console.warn('[Flow] gateway probe failed', e);
          }
        }
      })();
    }, 800);

    return () => clearTimeout(t);
  }, [
    s.gatewayBase,
    s.gatewaySecret,
    s.hydrated,
    s.vkToken,
    s.yandexToken,
  ]);

  return null;
}
