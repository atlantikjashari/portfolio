<script setup lang="ts">
import type { ApiExchange } from '~/composables/useApi'

/** Shows the raw request + response of the last call, the way the server actually saw it. */
const props = defineProps<{ exchange: ApiExchange | null; pending?: boolean }>()
const tab = ref<'response' | 'request'>('response')

const statusClass = computed(() => {
  const s = props.exchange?.status
  if (!s) return 'text-err'
  if (s < 300) return 'text-ok'
  if (s < 500) return 'text-warn'
  return 'text-err'
})

const requestView = computed(() => {
  const ex = props.exchange
  if (!ex) return null
  return {
    method: ex.method,
    url: ex.url,
    headers: ex.requestHeaders,
    ...(ex.requestBody !== undefined ? { body: ex.requestBody } : {}),
  }
})
</script>

<template>
  <div class="rounded-xl border border-line bg-ink-2/60">
    <div class="flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-line px-3 py-2 font-mono text-[11px]">
      <template v-if="exchange">
        <span class="text-violet">{{ exchange.method }}</span>
        <span class="truncate text-muted">{{ exchange.path }}</span>
        <span :class="statusClass">{{ exchange.status ?? 'ERR' }} {{ exchange.statusText }}</span>
        <span class="text-muted">{{ exchange.durationMs }} ms<template v-if="exchange.serverMs"> · server {{ exchange.serverMs }} ms</template></span>
        <span v-if="exchange.cache" class="text-muted">cache {{ exchange.cache }}</span>
        <span v-if="exchange.attempts > 1" class="text-warn">{{ exchange.attempts }} attempts</span>
      </template>
      <span v-else-if="pending" class="text-warn">sending…</span>
      <span v-else class="text-muted">No request yet. Use the demo to send one.</span>
      <div class="ml-auto flex gap-1" role="tablist" aria-label="Exchange view">
        <button
          v-for="t in (['response', 'request'] as const)"
          :key="t"
          role="tab"
          :aria-selected="tab === t"
          class="rounded-md px-2 py-0.5 transition-colors"
          :class="tab === t ? 'bg-white/10 text-white' : 'text-muted hover:text-white'"
          @click="tab = t"
        >
          {{ t }}
        </button>
      </div>
    </div>
    <div class="p-2">
      <div v-if="pending" class="shimmer h-24 rounded-xl" />
      <template v-else-if="exchange">
        <LabJsonView v-if="tab === 'response'" :value="exchange.error && exchange.data === null ? { error: exchange.error } : exchange.data" />
        <LabJsonView v-else :value="requestView" />
      </template>
    </div>
  </div>
</template>
