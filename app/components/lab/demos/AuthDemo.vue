<script setup lang="ts">
import type { ApiExchange } from '~/composables/useApi'

const token = defineModel<string | null>('token', { default: null })
const { request } = useApi()
const exchange = ref<ApiExchange | null>(null)
const pending = ref(false)
const creds = reactive({ username: 'demo', password: 'demo-portfolio-2026' })
const refresh = ref<string | null>(null)

const payload = computed(() => {
  if (!token.value) return null
  try {
    const part = token.value.split('.')[1]!.replace(/-/g, '+').replace(/_/g, '/')
    return JSON.parse(atob(part.padEnd(part.length + ((4 - (part.length % 4)) % 4), '=')))
  } catch {
    return null
  }
})
const now = ref(Date.now())
let tick: ReturnType<typeof setInterval> | undefined
onMounted(() => (tick = setInterval(() => (now.value = Date.now()), 1000)))
onBeforeUnmount(() => clearInterval(tick))
const expiresIn = computed(() => (payload.value?.exp ? Math.max(0, Math.round(payload.value.exp - now.value / 1000)) : 0))

async function login() {
  pending.value = true
  const res = await request<{ access: string; refresh: string }>('/api/auth/token/', { method: 'POST', body: { ...creds }, retries: 1 })
  exchange.value = res
  if (res.ok && res.data) {
    token.value = res.data.access
    refresh.value = res.data.refresh
  }
  pending.value = false
}
async function me(withToken: boolean) {
  pending.value = true
  exchange.value = await request('/api/auth/me/', { token: withToken ? token.value : null, retries: 0 })
  pending.value = false
}
async function doRefresh() {
  if (!refresh.value) return
  pending.value = true
  const res = await request<{ access: string }>('/api/auth/token/refresh/', { method: 'POST', body: { refresh: refresh.value } })
  exchange.value = res
  if (res.ok && res.data) token.value = res.data.access
  pending.value = false
}
function logout() {
  token.value = null
  refresh.value = null
}
</script>

<template>
  <LabFeature
    id="auth"
    index="06"
    title="JWT auth demo"
    :endpoints="['POST /api/auth/token/', 'POST /api/auth/token/refresh/', 'GET /api/auth/me/']"
    :exchange="exchange"
    :pending="pending"
  >
    <template #explain>
      <p>Stateless authentication with <strong>djangorestframework-simplejwt</strong>. Logging in returns a short-lived <strong>access token</strong> (10 minutes) and a <strong>refresh token</strong> (12 hours). The protected endpoint only answers when it gets <code>Authorization: Bearer &lt;access&gt;</code>.</p>
      <p>The demo account is public and has no admin rights. It is re-created on every deploy, and login attempts are throttled.</p>
    </template>

    <form class="grid gap-2 sm:grid-cols-[1fr_1fr_auto]" @submit.prevent="login">
      <div>
        <label for="auth-user" class="sr-only">Username</label>
        <input id="auth-user" v-model="creds.username" class="input !py-2 font-mono !text-xs" autocomplete="off">
      </div>
      <div>
        <label for="auth-pass" class="sr-only">Password</label>
        <input id="auth-pass" v-model="creds.password" class="input !py-2 font-mono !text-xs" autocomplete="off">
      </div>
      <button class="btn btn-primary !py-2" type="submit" :disabled="pending"><Icon name="lucide:key-round" class="h-4 w-4" /> Log in</button>
    </form>

    <div class="flex flex-wrap gap-2">
      <button class="btn btn-ghost !py-2" :disabled="pending || !token" @click="me(true)"><Icon name="lucide:lock-open" class="h-4 w-4 text-ok" /> /me with token</button>
      <button class="btn btn-ghost !py-2" :disabled="pending" @click="me(false)"><Icon name="lucide:lock" class="h-4 w-4 text-err" /> /me without token</button>
      <button class="btn btn-ghost !py-2" :disabled="pending || !refresh" @click="doRefresh"><Icon name="lucide:refresh-cw" class="h-4 w-4" /> Refresh</button>
      <button v-if="token" class="btn btn-ghost !py-2" @click="logout"><Icon name="lucide:x" class="h-4 w-4" /> Forget token</button>
    </div>

    <div v-if="payload" class="rounded-xl border border-line bg-white/[0.02] p-3 font-mono text-[11px]">
      <p class="mb-1 text-muted">Decoded access token payload · expires in {{ Math.floor(expiresIn / 60) }}m {{ expiresIn % 60 }}s</p>
      <LabJsonView :value="payload" max-height="10rem" />
    </div>
  </LabFeature>
</template>
