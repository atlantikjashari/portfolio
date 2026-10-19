/**
 * Resilient client for the Django API.
 *
 * Free hosting sleeps after ~15 min idle and takes up to a minute to wake up. Every request
 * therefore goes through `ensureAwake()`, which pings /api/health/ with retries and exposes a
 * global state ('waking', 'online', 'offline') that the UI uses to show the "Waking up the server…"
 * banner. Requests never throw: they resolve to an `ApiExchange` that the Backend Lab also renders
 * as the raw request/response JSON.
 */
export type ApiState = 'idle' | 'checking' | 'waking' | 'online' | 'offline'
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export interface ApiExchange<T = unknown> {
  id: number
  method: HttpMethod
  url: string
  path: string
  requestHeaders: Record<string, string>
  requestBody?: unknown
  status: number | null
  statusText: string
  ok: boolean
  durationMs: number
  serverMs: number | null
  cache: string | null
  retryAfter: string | null
  attempts: number
  data: T | null
  error: string | null
  at: string
}

export interface RequestOptions {
  method?: HttpMethod
  body?: unknown
  token?: string | null
  query?: Record<string, string | number | boolean | undefined>
  timeoutMs?: number
  retries?: number
  skipWake?: boolean
}

const WAKE_BUDGET_MS = 100_000 // Render free cold starts are ~30-60 s; give up after 100 s
const SLOW_PING_MS = 2_500 // a health ping slower than this means the server is booting
let exchangeId = 0
let wakePromise: Promise<boolean> | null = null
let lastOkAt = 0

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

export function useApiState() {
  const state = useState<ApiState>('api-state', () => 'idle')
  const wakeStartedAt = useState<number | null>('api-wake-started', () => null)
  const lastHealth = useState<Record<string, unknown> | null>('api-last-health', () => null)
  return { state, wakeStartedAt, lastHealth }
}

export function useApi() {
  const config = useRuntimeConfig()
  const base = config.public.apiBase as string
  const { state, wakeStartedAt, lastHealth } = useApiState()
  const history = useState<ApiExchange[]>('api-history', () => [])

  function buildUrl(path: string, query?: RequestOptions['query']) {
    const url = new URL(path.startsWith('http') ? path : `${base}${path}`)
    if (query) for (const [k, v] of Object.entries(query)) if (v !== undefined) url.searchParams.set(k, String(v))
    return url.toString()
  }

  async function rawFetch(url: string, init: RequestInit, timeoutMs: number) {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)
    try {
      return await fetch(url, { ...init, signal: controller.signal, credentials: 'omit', mode: 'cors' })
    } finally {
      clearTimeout(timer)
    }
  }

  async function pingOnce(timeoutMs: number): Promise<{ ok: boolean; ms: number }> {
    const started = performance.now()
    try {
      const res = await rawFetch(buildUrl('/api/health/'), { headers: { Accept: 'application/json' } }, timeoutMs)
      const isJson = res.headers.get('content-type')?.includes('application/json')
      if (res.ok && isJson) {
        lastHealth.value = await res.json()
        return { ok: true, ms: performance.now() - started }
      }
    } catch {
      /* network error, CORS-less "spinning up" page or timeout: still waking */
    }
    return { ok: false, ms: performance.now() - started }
  }

  /** Resolves true once the API answers, false if it stays down for the whole wake budget. */
  function ensureAwake(force = false): Promise<boolean> {
    if (import.meta.server) return Promise.resolve(false)
    if (!force && state.value === 'online' && Date.now() - lastOkAt < 60_000) return Promise.resolve(true)
    if (wakePromise) return wakePromise

    wakePromise = (async () => {
      const start = Date.now()
      if (state.value !== 'online') state.value = 'checking'
      let attempt = 0
      while (Date.now() - start < WAKE_BUDGET_MS) {
        const { ok, ms } = await pingOnce(attempt === 0 ? 8_000 : 15_000)
        if (ok) {
          lastOkAt = Date.now()
          state.value = 'online'
          wakeStartedAt.value = null
          return true
        }
        if (state.value !== 'waking') {
          state.value = 'waking'
          wakeStartedAt.value = start
        }
        attempt++
        const wait = Math.min(2_000 * attempt, 6_000)
        if (ms < wait) await sleep(wait - ms)
      }
      state.value = 'offline'
      wakeStartedAt.value = null
      return false
    })().finally(() => {
      wakePromise = null
    })
    return wakePromise
  }

  async function request<T = unknown>(path: string, opts: RequestOptions = {}): Promise<ApiExchange<T>> {
    const method = opts.method ?? 'GET'
    const url = buildUrl(path, opts.query)
    const headers: Record<string, string> = { Accept: 'application/json' }
    if (opts.body !== undefined) headers['Content-Type'] = 'application/json'
    if (opts.token) headers.Authorization = `Bearer ${opts.token}`

    const exchange: ApiExchange<T> = {
      id: ++exchangeId,
      method,
      url,
      path: url.replace(base, ''),
      requestHeaders: { ...headers, ...(opts.token ? { Authorization: `Bearer ${opts.token.slice(0, 12)}…` } : {}) },
      requestBody: opts.body,
      status: null,
      statusText: '',
      ok: false,
      durationMs: 0,
      serverMs: null,
      cache: null,
      retryAfter: null,
      attempts: 0,
      data: null,
      error: null,
      at: new Date().toISOString(),
    }

    if (!opts.skipWake) {
      const awake = await ensureAwake()
      if (!awake) {
        exchange.error = 'The API is unreachable right now (it may be sleeping or down). Please try again in a minute.'
        return record(exchange)
      }
    }

    const retries = opts.retries ?? 2
    for (let attempt = 0; attempt <= retries; attempt++) {
      exchange.attempts = attempt + 1
      const started = performance.now()
      try {
        const res = await rawFetch(
          url,
          { method, headers, body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined },
          opts.timeoutMs ?? 20_000,
        )
        exchange.durationMs = Math.round(performance.now() - started)
        exchange.status = res.status
        exchange.statusText = res.statusText
        exchange.ok = res.ok
        exchange.serverMs = Number(res.headers.get('x-response-time-ms')) || null
        exchange.cache = res.headers.get('x-cache')
        exchange.retryAfter = res.headers.get('retry-after')
        const isJson = res.headers.get('content-type')?.includes('application/json')
        exchange.data = (isJson ? await res.json() : await res.text()) as T

        // 502/503/504 while the instance boots: wait and retry
        if ([502, 503, 504].includes(res.status) && attempt < retries) {
          state.value = 'waking'
          await sleep(3_000 * (attempt + 1))
          continue
        }
        if (res.ok) {
          lastOkAt = Date.now()
          state.value = 'online'
        }
        exchange.error = null
        return record(exchange)
      } catch (err) {
        exchange.durationMs = Math.round(performance.now() - started)
        exchange.error =
          err instanceof DOMException && err.name === 'AbortError'
            ? 'Request timed out.'
            : 'Network error: the API could not be reached.'
        if (attempt < retries) {
          await ensureAwake(true)
          continue
        }
      }
    }
    return record(exchange)
  }

  function record<T>(exchange: ApiExchange<T>) {
    history.value = [exchange as ApiExchange, ...history.value].slice(0, 30)
    return exchange
  }

  return { base, state, request, ensureAwake, history, lastHealth }
}
