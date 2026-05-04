/**
 * @flow/api-client — изолированное «ядро» HTTP для Flow Mobile Gateway.
 * Не зависит от Electron / React Native: только fetch (в Node 18+ есть глобальный fetch).
 */

'use strict'

function normalizeGatewayBase(raw) {
  let s = String(raw || '')
    .trim()
    .replace(/\/$/, '')
  if (!s) return ''
  if (!/^https?:\/\//i.test(s)) s = `http://${s}`
  return s.replace(/\/$/, '')
}

function describeNetworkError(error, url) {
  const raw = error && error.message ? String(error.message) : String(error || '')
  if (/abort/i.test(raw)) {
    return `Шлюз не ответил за 8 секунд: ${url}`
  }
  return `Не удалось подключиться к шлюзу: ${url}. Проверь, что сервер запущен, порт открыт в firewall и URL доступен с iPhone.${raw ? ` (${raw})` : ''}`
}

async function fetchWithTimeout(fetchImpl, url, options = {}, timeoutMs = 8000) {
  if (typeof AbortController !== 'function') {
    return fetchImpl(url, options)
  }
  const controller = new AbortController()
  const t = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetchImpl(url, {
      ...options,
      signal: controller.signal,
    })
  } finally {
    clearTimeout(t)
  }
}

/**
 * @param {{ baseUrl: string, secret: string, fetch?: typeof fetch }} cfg
 */
function createFlowGatewayClient(cfg) {
  const fetchImpl = cfg.fetch || globalThis.fetch
  if (typeof fetchImpl !== 'function') {
    throw new Error('@flow/api-client: нужен fetch (Node 18+ или передай cfg.fetch)')
  }
  const base = normalizeGatewayBase(cfg.baseUrl)
  const secret = String(cfg.secret || '').trim()

  async function post(path, body) {
    const url = `${base.replace(/\/$/, '')}${path}`
    return fetchWithTimeout(fetchImpl, url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${secret}`,
      },
      body: JSON.stringify(body ?? {}),
    })
  }

  return {
    normalizeGatewayBase,
    getBase() {
      return base
    },

    /** GET /health — без Bearer. */
    async health() {
      if (!base) return { ok: false, error: 'Пустой baseUrl' }
      const url = `${base}/health`
      try {
        const r = await fetchWithTimeout(fetchImpl, url, { method: 'GET' })
        const j = await r.json().catch(() => ({}))
        return { ok: r.ok && j.ok === true, status: r.status, body: j }
      } catch (e) {
        return { ok: false, error: describeNetworkError(e, url) }
      }
    },

    async checkSecret() {
      if (!base) return { ok: false, message: 'Нет URL шлюза' }
      if (!secret) return { ok: false, message: 'Нет секрета шлюза' }
      const health = await this.health()
      if (!health.ok) {
        return {
          ok: false,
          message: health.error || `Health HTTP ${health.status || '?'}`,
          health,
        }
      }

      const r = await post('/mobile/v1/search', {
        q: '__flow_gateway_check__',
        source: 'audius',
        tokens: {},
      }).catch(e => ({ networkError: e }))
      if (r.networkError) {
        return {
          ok: false,
          message: describeNetworkError(
            r.networkError,
            `${base}/mobile/v1/search`,
          ),
          health,
        }
      }
      const j = await r.json().catch(() => ({}))
      if (r.ok) {
        return {
          ok: true,
          message: 'Шлюз доступен, секрет принят',
          health,
        }
      }
      return {
        ok: false,
        message: j.error || `Секрет не принят: HTTP ${r.status}`,
        health,
      }
    },

    async search(q, source, tokens = {}) {
      if (!base || !secret) {
        return { ok: false, tracks: [], error: 'Нет baseUrl или secret' }
      }
      const r = await post('/mobile/v1/search', {
        q,
        source,
        tokens: {
          spotifyToken: tokens.spotifyToken || '',
          yandexToken: tokens.yandexToken || '',
          vkToken: tokens.vkToken || '',
          soundcloudClientId: tokens.soundcloudClientId || '',
        },
      })
      const j = await r.json().catch(() => ({}))
      if (!r.ok) {
        return { ok: false, tracks: [], error: j.error || `HTTP ${r.status}` }
      }
      return {
        ok: Boolean(j.ok),
        tracks: Array.isArray(j.tracks) ? j.tracks : [],
        mode: j.mode,
        error: j.error,
      }
    },

    async resolve(track, tokens = {}) {
      if (!base || !secret) return { ok: false, error: 'Нет шлюза' }
      const r = await post('/mobile/v1/resolve', {
        track,
        tokens: {
          yandexToken: tokens.yandexToken || '',
          vkToken: tokens.vkToken || '',
          soundcloudClientId: tokens.soundcloudClientId || '',
        },
      })
      const j = await r.json().catch(() => ({}))
      if (!r.ok) return { ok: false, error: j.error || `HTTP ${r.status}` }
      if (!j.ok || !j.url) return { ok: false, error: j.error || 'Нет URL' }
      return { ok: true, url: j.url }
    },

    async validateYandex(yandexToken) {
      if (!base) return { ok: false, message: 'Нет URL шлюза' }
      const r = await post('/mobile/v1/validate/yandex', { token: yandexToken })
      const j = await r.json().catch(() => ({}))
      if (j.ok) return { ok: true, message: `Яндекс OK: ${j.login || 'ok'}` }
      return { ok: false, message: j.error || `HTTP ${r.status}` }
    },

    async validateVk(vkToken) {
      if (!base) return { ok: false, message: 'Нет URL шлюза' }
      const r = await post('/mobile/v1/validate/vk', { token: vkToken })
      const j = await r.json().catch(() => ({}))
      if (j.ok) return { ok: true, message: `VK OK: ${j.name || ''}` }
      return { ok: false, message: j.error || `HTTP ${r.status}` }
    },

    /** Health + validate Yandex/VK если токены переданы. */
    async probeSavedTokens(tokens = {}) {
      const out = { health: null, yandex: null, vk: null }
      out.health = await this.health()
      if (tokens.yandexToken) {
        try {
          out.yandex = await this.validateYandex(tokens.yandexToken)
        } catch (e) {
          out.yandex = { ok: false, message: e.message }
        }
      }
      if (tokens.vkToken) {
        try {
          out.vk = await this.validateVk(tokens.vkToken)
        } catch (e) {
          out.vk = { ok: false, message: e.message }
        }
      }
      return out
    },
  }
}

module.exports = {
  normalizeGatewayBase,
  createFlowGatewayClient,
}
