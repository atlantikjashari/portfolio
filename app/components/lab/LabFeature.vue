<script setup lang="ts">
import type { ApiExchange } from '~/composables/useApi'

defineProps<{
  id: string
  index: string
  title: string
  endpoints: string[]
  exchange?: ApiExchange | null
  pending?: boolean
  hideExchange?: boolean
}>()
</script>

<template>
  <section :id="id" class="glass glow-border scroll-mt-24 rounded-3xl p-5 sm:p-8" data-reveal>
    <div class="grid gap-8 lg:grid-cols-[1fr_1.15fr]">
      <div class="min-w-0">
        <p class="font-mono text-xs text-cyan">{{ index }}</p>
        <h2 class="mt-2 text-2xl font-semibold text-white sm:text-3xl">{{ title }}</h2>
        <div class="mt-3 flex flex-wrap gap-1.5">
          <code v-for="e in endpoints" :key="e" class="chip !text-fg/80">{{ e }}</code>
        </div>
        <div class="prose-lab mt-5 space-y-3 text-sm leading-relaxed text-muted">
          <slot name="explain" />
        </div>
      </div>
      <div class="min-w-0 space-y-4">
        <slot />
        <LabExchangeView v-if="!hideExchange" :exchange="exchange ?? null" :pending="pending" />
      </div>
    </div>
  </section>
</template>

<style scoped>
.prose-lab :deep(strong) {
  color: var(--color-fg);
  font-weight: 600;
}
.prose-lab :deep(code) {
  font-family: var(--font-mono);
  font-size: 0.85em;
  color: var(--color-cyan);
}
.prose-lab :deep(ul) {
  list-style: disc;
  padding-left: 1.1rem;
}
</style>
