import React, { useEffect, useRef } from 'react';
import { gatewayProbeSavedTokens } from '../api/flowGateway';
import { useFlowSettings } from '../context/FlowSettingsContext';

/**
 * После гидрации настроек — тихо проверяет /health шлюза и токены Яндекс/VK (если заданы).
 * Логи только в __DEV__; UI не блокирует.
 */
export function GatewayTokenWarmup() {
  const s = useFlowSettings();
  const ran = useRef(false);

  useEffect(() => {
    if (!s.hydrated || ran.current) return;
    if (!s.gatewayBase.trim() || !s.gatewaySecret.trim()) return;
    ran.current = true;

    const t = setTimeout(() => {
      void (async () => {
        try {
          const out = await gatewayProbeSavedTokens(s.gatewayBase, s.gatewaySecret, {
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
