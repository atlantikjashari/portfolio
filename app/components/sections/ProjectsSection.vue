<script setup lang="ts">
import { projects as fallback, statusLabels, type Project } from '~/data/projects'

const root = ref<HTMLElement | null>(null)
useReveal(root)

// Pre-rendered with the static list (SEO + instant paint), then refreshed from GET /api/projects/.
const items = ref<Project[]>(fallback)
const source = ref<'static' | 'loading' | 'api'>('static')
const { request } = useApi()

onMounted(async () => {
  source.value = 'loading'
  const res = await request<Project[]>('/api/projects/', { retries: 1 })
  if (res.ok && Array.isArray(res.data) && res.data.length) {
    items.value = res.data
    source.value = 'api'
  } else {
    source.value = 'static'
  }
})

const statusStyle: Record<string, string> = {
  live: 'text-ok border-ok/30 bg-ok/10',
  in_development: 'text-cyan border-cyan/30 bg-cyan/10',
  private: 'text-violet border-violet/30 bg-violet/10',
  offline: 'text-muted border-line bg-white/5',
}
const hostOf = (url: string) => url.replace(/^https?:\/\//, '').replace(/\/$/, '')
</script>

<template>
  <section id="projects" ref="root" class="section">
    <div class="container-x">
      <UiSectionHeading index="04" eyebrow="Projects" title="Selected work." />

      <p class="-mt-8 mb-10 font-mono text-xs leading-relaxed text-muted" aria-live="polite" data-reveal>
        <span
          class="mr-2 inline-block h-1.5 w-1.5 rounded-full align-middle"
          :class="{ 'bg-ok': source === 'api', 'bg-warn animate-pulse': source === 'loading', 'bg-muted': source === 'static' }"
          aria-hidden="true"
        />
        <template v-if="source === 'api'">Loaded live from <code class="text-cyan">GET /api/projects/</code> (managed in Django admin)</template>
        <template v-else-if="source === 'loading'">Fetching from the API… showing cached data meanwhile</template>
        <template v-else>Showing the built-in copy (API asleep or unreachable)</template>
      </p>

      <div class="grid gap-6 md:grid-cols-2">
        <UiTiltCard v-for="p in items" :key="p.slug" as="article" class="flex flex-col p-6" data-reveal>
          <div class="flex items-start justify-between gap-4" style="transform: translateZ(30px)">
            <div>
              <p class="font-mono text-xs text-muted">{{ p.company }} · {{ p.period }}</p>
              <h3 class="mt-1 text-2xl font-semibold text-white">{{ p.title }}</h3>
            </div>
            <span class="shrink-0 rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider" :class="statusStyle[p.status]">
              {{ p.status_label || statusLabels[p.status] }}
            </span>
          </div>

          <p class="mt-3 text-sm leading-relaxed text-fg/85">{{ p.summary }}</p>
          <ul class="mt-4 space-y-1.5">
            <li v-for="h in p.highlights" :key="h" class="flex gap-2 text-sm text-muted">
              <Icon name="lucide:check" class="mt-0.5 h-4 w-4 shrink-0 text-cyan" aria-hidden="true" />{{ h }}
            </li>
          </ul>

          <div class="mt-5 flex flex-wrap gap-1.5">
            <span v-for="t in p.tech" :key="t" class="chip">{{ t }}</span>
          </div>

          <div class="mt-auto flex flex-wrap items-center gap-3 pt-6 text-sm">
            <a
              v-if="p.live_url"
              :href="p.live_url"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-1.5 text-cyan hover:text-white"
            >
              <Icon name="lucide:arrow-up-right" class="h-4 w-4" /> {{ hostOf(p.live_url) }}
            </a>
            <a
              v-if="p.repo_url"
              :href="p.repo_url"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-1.5 text-muted hover:text-white"
            >
              <Icon name="simple-icons:github" class="h-4 w-4" /> Source
            </a>
            <NuxtLink v-if="p.slug === 'portfolio-backend-lab'" to="/backend" class="inline-flex items-center gap-1.5 text-muted hover:text-white">
              <Icon name="lucide:flask-conical" class="h-4 w-4" /> Backend Lab
            </NuxtLink>
            <span v-if="!p.live_url && !p.repo_url && p.slug !== 'portfolio-backend-lab'" class="font-mono text-xs text-muted">
              {{ p.status === 'offline' ? 'The business has shut down – no live link' : 'Proprietary – no public link' }}
            </span>
          </div>
        </UiTiltCard>
      </div>
    </div>
  </section>
</template>
