<script setup lang="ts">
import type { ApiExchange } from '~/composables/useApi'

const { request, state, lastHealth } = useApi()
const exchange = ref<ApiExchange | null>(null)
const pending = ref(false)
const deep = ref(false)

async function ping() {
  pending.value = true
  exchange.value = await request('/api/health/', { query: { deep: deep.value ? 1 : undefined }, retries: 0 })
  pending.value = false
}

const health = computed(() => (exchange.value?.ok ? (exchange.value.data as Record<string, unknown>) : lastHealth.value))
const uptime = computed(() => {
  const s = Number(health.value?.uptime_seconds ?? 0)
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  return h ? `${h}h ${m}m` : m ? `${m}m ${s % 60}s` : `${s}s`
})
const stateLabel: Record<string, string> = {
  online: 'Online',
  waking: 'Waking up',
  checking: 'Checking',
  offline: 'Offline',
  idle: 'Unknown',
}
</script>

<template>
  <LabFeature id="health" index="08" title="Health & status" :endpoints="['GET /api/health/', 'GET /api/health/?deep=1']" :exchange="exchange" :pending="pending">
    <template #explain>
      <p>A plain liveness endpoint. It drives the <strong>"API online"</strong> indicator in the navbar and footer, and Render uses it as the service health check.</p>
      <p>By default it <strong>doesn't touch the database</strong>, so uptime checks don't keep the serverless Neon Postgres awake (that would use up its free compute hours). Add <code>?deep=1</code> to also run <code>SELECT 1</code>.</p>
    </template>
    <div class="grid grid-cols-3 gap-2">
      <div class="rounded-xl border border-line bg-white/[0.02] p-3">
        <p class="font-mono text-[10px] uppercase tracking-widest text-muted">State</p>
        <p class="mt-1 flex items-center gap-2 font-display text-lg font-semibold text-white">
          <span class="h-2 w-2 rounded-full" :class="{ 'bg-ok': state === 'online', 'bg-warn animate-pulse': state === 'waking' || state === 'checking', 'bg-err': state === 'offline', 'bg-muted': state === 'idle' }" />
          {{ stateLabel[state] }}
        </p>
      </div>
      <div class="rounded-xl border border-line bg-white/[0.02] p-3">
        <p class="font-mono text-[10px] uppercase tracking-widest text-muted">Uptime</p>
        <p class="mt-1 font-display text-lg font-semibold text-white">{{ health ? uptime : '–' }}</p>
      </div>
      <div class="rounded-xl border border-line bg-white/[0.02] p-3">
        <p class="font-mono text-[10px] uppercase tracking-widest text-muted">Version</p>
        <p class="mt-1 font-mono text-lg text-white">{{ health?.version ?? '–' }}</p>
      </div>
    </div>
    <div class="flex flex-wrap items-center gap-3">
      <button class="btn btn-primary !py-2" :disabled="pending" @click="ping"><Icon name="lucide:activity" class="h-4 w-4" /> Ping</button>
      <label class="inline-flex items-center gap-2 text-sm text-muted">
        <input v-model="deep" type="checkbox" class="h-4 w-4 accent-cyan"> include database check
      </label>
    </div>
  </LabFeature>
</template>
