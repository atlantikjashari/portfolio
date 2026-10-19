<script setup lang="ts">
import type { ApiExchange, HttpMethod } from '~/composables/useApi'

interface Preset {
  label: string
  method: HttpMethod
  path: string
  body?: unknown
  auth?: boolean
}

const props = defineProps<{ token?: string | null }>()
const emit = defineEmits<{ token: [string] }>()
const { request, base, history } = useApi()

const presets: Preset[] = [
  { label: 'Health check', method: 'GET', path: '/api/health/' },
  { label: 'Health (deep, DB)', method: 'GET', path: '/api/health/?deep=1' },
  { label: 'API index', method: 'GET', path: '/api/' },
  { label: 'List projects', method: 'GET', path: '/api/projects/' },
  { label: 'One project', method: 'GET', path: '/api/projects/pabau-clinic-crm/' },
  { label: 'Guestbook page 1', method: 'GET', path: '/api/guestbook/?page=1' },
  { label: 'Stats (cached)', method: 'GET', path: '/api/stats/' },
  { label: 'Contact, invalid body', method: 'POST', path: '/api/contact/', body: { name: '', email: 'nope', message: 'hi' } },
  { label: 'Get JWT (demo user)', method: 'POST', path: '/api/auth/token/', body: { username: 'demo', password: 'demo-portfolio-2026' } },
  { label: 'Protected /me', method: 'GET', path: '/api/auth/me/', auth: true },
  { label: '404 route', method: 'GET', path: '/api/does-not-exist/' },
]

const selected = ref(0)
const method = ref<HttpMethod>('GET')
const path = ref('/api/health/')
const bodyText = ref('')
const useToken = ref(false)
const bodyError = ref('')
const pending = ref(false)
const current = ref<ApiExchange | null>(null)

function pick(i: number) {
  const p = presets[i]!
  selected.value = i
  method.value = p.method
  path.value = p.path
  bodyText.value = p.body ? JSON.stringify(p.body, null, 2) : ''
  useToken.value = !!p.auth
  bodyError.value = ''
}
pick(0)

async function send() {
  bodyError.value = ''
  let body: unknown
  if (method.value !== 'GET' && bodyText.value.trim()) {
    try {
      body = JSON.parse(bodyText.value)
    } catch {
      bodyError.value = 'Body is not valid JSON.'
      return
    }
  }
  if (!path.value.startsWith('/api/')) {
    bodyError.value = 'Path must start with /api/'
    return
  }
  pending.value = true
  current.value = await request(path.value, {
    method: method.value,
    body,
    token: useToken.value ? props.token : null,
    retries: 0,
  })
  // share a freshly issued JWT with the auth demo and the "Bearer token" checkbox
  const access = (current.value?.data as { access?: unknown } | null)?.access
  if (current.value?.ok && typeof access === 'string') emit('token', access)
  pending.value = false
}

const statusColor = (s: number | null) => (!s ? 'text-err' : s < 300 ? 'text-ok' : s < 500 ? 'text-warn' : 'text-err')
const size = computed(() => {
  const d = current.value?.data
  if (d === null || d === undefined) return '0 B'
  const n = new Blob([typeof d === 'string' ? d : JSON.stringify(d)]).size
  return n > 1024 ? `${(n / 1024).toFixed(1)} KB` : `${n} B`
})
</script>

<template>
  <LabFeature
    id="explorer"
    index="05"
    title="Interactive API explorer"
    :endpoints="['any /api/* endpoint']"
    hide-exchange
  >
    <template #explain>
      <p>A small Postman in the browser. Pick a preset or write your own request, press <strong>Send</strong>, and you'll see the method, status code, total time (plus the server's own processing time from the <code>X-Response-Time-Ms</code> header), payload size and the JSON response.</p>
      <p>Get a JWT with the "Get JWT" preset or in the auth demo below, then tick <strong>Bearer token</strong> to call protected endpoints.</p>
      <p class="font-mono text-xs">Base URL: <span class="break-all text-fg/80">{{ base }}</span></p>
    </template>

    <div class="overflow-hidden rounded-2xl border border-line bg-[#07080d] font-mono text-xs shadow-[0_20px_80px_-30px_rgb(34_211_238/0.35)]">
      <div class="flex items-center gap-1.5 border-b border-line px-3 py-2" aria-hidden="true">
        <span class="h-2.5 w-2.5 rounded-full bg-err/70" /><span class="h-2.5 w-2.5 rounded-full bg-warn/70" /><span class="h-2.5 w-2.5 rounded-full bg-ok/70" />
        <span class="ml-2 text-muted">atlantik@backend-lab:~$</span>
      </div>

      <div class="space-y-3 p-3">
        <label class="sr-only" for="ex-preset">Preset</label>
        <select id="ex-preset" :value="selected" class="input !py-2 font-mono !text-xs" @change="pick(Number(($event.target as HTMLSelectElement).value))">
          <option v-for="(p, i) in presets" :key="p.label" :value="i">{{ p.method.padEnd(4) }} {{ p.label }}</option>
        </select>

        <div class="flex gap-2">
          <label class="sr-only" for="ex-method">Method</label>
          <select id="ex-method" v-model="method" class="input !w-24 !py-2 font-mono !text-xs text-violet">
            <option v-for="m in ['GET', 'POST']" :key="m">{{ m }}</option>
          </select>
          <label class="sr-only" for="ex-path">Path</label>
          <input id="ex-path" v-model="path" class="input !py-2 font-mono !text-xs" spellcheck="false" @keydown.enter.prevent="send">
          <button class="btn btn-primary !px-4 !py-2" :disabled="pending" aria-label="Send request" @click="send">
            <Icon :name="pending ? 'lucide:loader-circle' : 'lucide:send'" class="h-4 w-4" :class="{ 'animate-spin': pending }" />
            <span class="hidden sm:inline">Send</span>
          </button>
        </div>

        <div v-if="method !== 'GET'">
          <label for="ex-body" class="label !mb-1 font-mono">JSON body</label>
          <textarea id="ex-body" v-model="bodyText" rows="4" class="input !py-2 font-mono !text-xs" spellcheck="false" />
        </div>
        <label class="inline-flex items-center gap-2 text-muted">
          <input v-model="useToken" type="checkbox" class="h-3.5 w-3.5 accent-cyan" :disabled="!token">
          Bearer token {{ token ? `(${token.slice(0, 10)}…)` : '(get one with the "Get JWT" preset or the auth demo below)' }}
        </label>
        <p v-if="bodyError" class="text-err" role="alert">{{ bodyError }}</p>
      </div>

      <div class="border-t border-line p-3" aria-live="polite">
        <div v-if="pending" class="flex items-center gap-2 text-warn"><span class="caret" /> awaiting response…</div>
        <template v-else-if="current">
          <div class="mb-2 flex flex-wrap gap-x-4 gap-y-1">
            <span><span class="text-muted">method</span> <span class="text-violet">{{ current.method }}</span></span>
            <span><span class="text-muted">status</span> <span :class="statusColor(current.status)">{{ current.status ?? 'ERR' }} {{ current.statusText }}</span></span>
            <span><span class="text-muted">time</span> <span class="text-white">{{ current.durationMs }} ms</span></span>
            <span v-if="current.serverMs"><span class="text-muted">server</span> <span class="text-white">{{ current.serverMs }} ms</span></span>
            <span><span class="text-muted">size</span> <span class="text-white">{{ size }}</span></span>
          </div>
          <LabJsonView :value="current.error && current.data === null ? { error: current.error } : current.data" max-height="18rem" />
        </template>
        <p v-else class="text-muted">Press Send to make a request.</p>
      </div>

      <details v-if="history.length" class="border-t border-line px-3 py-2">
        <summary class="cursor-pointer text-muted hover:text-white">History ({{ history.length }})</summary>
        <ul class="mt-2 max-h-40 space-y-1 overflow-auto">
          <li v-for="h in history" :key="h.id" class="flex gap-3 whitespace-nowrap">
            <span class="w-10 text-violet">{{ h.method }}</span>
            <span :class="statusColor(h.status)" class="w-8">{{ h.status ?? 'ERR' }}</span>
            <span class="w-14 text-muted">{{ h.durationMs }}ms</span>
            <span class="truncate text-fg/80">{{ h.path }}</span>
          </li>
        </ul>
      </details>
    </div>
  </LabFeature>
</template>
