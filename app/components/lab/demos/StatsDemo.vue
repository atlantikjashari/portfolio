<script setup lang="ts">
import type { ApiExchange } from '~/composables/useApi'

interface Stats {
  total_views: number
  unique_visitors: number
  views_today: number
  last_7_days: { date: string; views: number }[]
  top_paths: { path: string; views: number }[]
  generated_at: string
  cache_ttl_seconds: number
  cached: boolean
}

const { request } = useApi()
const exchange = ref<ApiExchange<Stats> | null>(null)
const pending = ref(false)
const stats = ref<Stats | null>(null)
const hover = ref<number | null>(null)

async function load() {
  pending.value = true
  const res = await request<Stats>('/api/stats/')
  exchange.value = res
  if (res.ok && res.data) stats.value = res.data
  pending.value = false
}
onMounted(load)

// Chart geometry (single series: no legend, title names it; 1px solid recessive baseline; <=24px bars with
// 4px rounded data-end; tooltip per bar; data also available as a table for screen readers).
const W = 320
const H = 120
const PAD_B = 18
const BAR = 24
const BAR_COLOR = '#0ea5c6' // validated against the dark surface (lightness band + 3:1 contrast)
const max = computed(() => Math.max(1, ...(stats.value?.last_7_days.map((d) => d.views) ?? [1])))
const bars = computed(() => {
  const days = stats.value?.last_7_days ?? []
  const slot = W / Math.max(days.length, 1)
  return days.map((d, i) => {
    const h = d.views ? Math.max(4, (d.views / max.value) * (H - PAD_B - 18)) : 0
    return {
      ...d,
      x: i * slot + (slot - BAR) / 2,
      y: H - PAD_B - h,
      h,
      cx: i * slot + slot / 2,
      label: new Date(`${d.date}T12:00:00`).toLocaleDateString('en-GB', { weekday: 'short' }),
      long: new Date(`${d.date}T12:00:00`).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' }),
      isMax: d.views === max.value && d.views > 0,
    }
  })
})
const hovered = computed(() => (hover.value === null ? null : bars.value[hover.value] ?? null))
// Path for a bar with a 4px rounded top and a square base.
const barPath = (x: number, y: number, h: number) => {
  const r = Math.min(4, h)
  return `M${x},${y + h}V${y + r}Q${x},${y} ${x + r},${y}H${x + BAR - r}Q${x + BAR},${y} ${x + BAR},${y + r}V${y + h}Z`
}
</script>

<template>
  <LabFeature id="stats" index="04" title="Live stats" :endpoints="['POST /api/stats/hit/', 'GET /api/stats/']" :exchange="exchange" :pending="pending">
    <template #explain>
      <p>Each page load sends an anonymous <code>POST /api/stats/hit/</code>. Visitors are counted with a <strong>salted, daily-rotating SHA-256 hash</strong>, so no raw IP address is ever stored.</p>
      <p>The aggregate query is <strong>cached for 60 seconds</strong> in Django's database cache, which is shared across gunicorn workers without Redis. Click refresh twice: the second response says <code>"cached": true</code> and comes with an <code>X-Cache: HIT</code> header.</p>
    </template>

    <div v-if="stats" class="grid grid-cols-3 gap-2">
      <div v-for="t in [
        { label: 'Total views', value: stats.total_views },
        { label: 'Unique visitors', value: stats.unique_visitors },
        { label: 'Today', value: stats.views_today },
      ]" :key="t.label" class="rounded-xl border border-line bg-white/[0.02] p-3">
        <p class="font-mono text-[10px] uppercase tracking-widest text-muted">{{ t.label }}</p>
        <p class="mt-1 font-display text-2xl font-semibold text-white">{{ t.value.toLocaleString('en-GB') }}</p>
      </div>
    </div>

    <figure v-if="stats" class="rounded-xl border border-line bg-white/[0.02] p-3">
      <figcaption class="mb-2 flex items-center justify-between text-xs">
        <span class="text-fg">Page views, last 7 days</span>
        <span class="font-mono text-[10px] text-muted">{{ stats.cached ? 'served from cache' : 'freshly computed' }}</span>
      </figcaption>
      <div class="relative">
        <svg :viewBox="`0 0 ${W} ${H}`" class="w-full" role="img" aria-label="Bar chart of page views for the last 7 days" @pointerleave="hover = null">
          <line :x1="0" :x2="W" :y1="H - PAD_B" :y2="H - PAD_B" stroke="rgb(255 255 255 / 0.12)" stroke-width="1" />
          <g v-for="(b, i) in bars" :key="b.date">
            <!-- hit target larger than the mark -->
            <rect :x="b.cx - W / 14" y="0" :width="W / 7" :height="H" fill="transparent" @pointerenter="hover = i" @focus="hover = i" />
            <path v-if="b.h" :d="barPath(b.x, b.y, b.h)" :fill="BAR_COLOR" :opacity="hover === null || hover === i ? 1 : 0.45" class="transition-opacity" />
            <text v-if="b.isMax" :x="b.cx" :y="b.y - 5" text-anchor="middle" class="fill-fg font-mono" font-size="9">{{ b.views }}</text>
            <text :x="b.cx" :y="H - 4" text-anchor="middle" class="fill-muted font-mono" font-size="9">{{ b.label }}</text>
          </g>
        </svg>
        <div
          v-if="hovered"
          class="pointer-events-none absolute -translate-x-1/2 -translate-y-full rounded-lg border border-line bg-ink px-2 py-1 font-mono text-[11px] text-fg shadow-xl"
          :style="{ left: `${(hovered.cx / W) * 100}%`, top: `${(hovered.y / H) * 100}%` }"
        >
          {{ hovered.long }} · <span class="text-white">{{ hovered.views }}</span> views
        </div>
      </div>
      <table class="sr-only">
        <caption>Page views per day</caption>
        <thead><tr><th>Date</th><th>Views</th></tr></thead>
        <tbody><tr v-for="d in stats.last_7_days" :key="d.date"><td>{{ d.date }}</td><td>{{ d.views }}</td></tr></tbody>
      </table>
    </figure>

    <button class="btn btn-ghost !py-2" :disabled="pending" @click="load"><Icon name="lucide:refresh-cw" class="h-4 w-4" /> Refresh</button>
  </LabFeature>
</template>
