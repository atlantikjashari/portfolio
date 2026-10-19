<script setup lang="ts">
/** Live "API online" indicator, driven by the shared API wake state. */
withDefaults(defineProps<{ compact?: boolean }>(), { compact: false })
const { state } = useApiState()

const meta = computed(() => {
  switch (state.value) {
    case 'online':
      return { label: 'API online', color: 'bg-ok', ping: true }
    case 'waking':
      return { label: 'Waking up the server…', color: 'bg-warn', ping: true }
    case 'checking':
      return { label: 'Checking API…', color: 'bg-warn', ping: false }
    case 'offline':
      return { label: 'API offline', color: 'bg-err', ping: false }
    default:
      return { label: 'API status', color: 'bg-muted', ping: false }
  }
})
</script>

<template>
  <NuxtLink
    to="/backend#health"
    class="inline-flex items-center gap-2 rounded-full border border-line bg-white/[0.03] px-3 py-1 font-mono text-[11px] text-muted transition-colors hover:text-fg"
    :title="meta.label"
  >
    <span class="relative flex h-2 w-2">
      <span v-if="meta.ping" class="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60" :class="meta.color" />
      <span class="relative inline-flex h-2 w-2 rounded-full" :class="meta.color" />
    </span>
    <span :class="compact ? 'sr-only' : ''" aria-live="polite">{{ meta.label }}</span>
  </NuxtLink>
</template>
