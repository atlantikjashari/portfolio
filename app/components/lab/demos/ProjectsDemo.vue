<script setup lang="ts">
import type { ApiExchange } from '~/composables/useApi'
import type { Project } from '~/data/projects'

const { request } = useApi()
const exchange = ref<ApiExchange<Project[]> | null>(null)
const pending = ref(false)
const featuredOnly = ref(false)

async function load() {
  pending.value = true
  exchange.value = await request<Project[]>('/api/projects/', { query: { featured: featuredOnly.value ? 'true' : undefined } })
  pending.value = false
}
onMounted(load)

const list = computed(() => (Array.isArray(exchange.value?.data) ? exchange.value!.data! : []))
</script>

<template>
  <LabFeature id="projects-api" index="02" title="Projects API" :endpoints="['GET /api/projects/', 'GET /api/projects/{slug}/']" :exchange="exchange" :pending="pending">
    <template #explain>
      <p>The <NuxtLink to="/#projects" class="text-cyan underline-offset-2 hover:underline">Projects section</NuxtLink> is served from this endpoint. Projects are stored in the database and edited in the <strong>Django admin</strong> (ordering, featured flag, publish toggle), so updating the portfolio doesn't need a redeploy.</p>
      <p>The site is pre-rendered with a <strong>static copy</strong> of the list, so it loads instantly and still works if the API is asleep. The live data replaces it once the API responds.</p>
    </template>
    <div class="flex flex-wrap items-center gap-3">
      <button class="btn btn-primary !py-2" :disabled="pending" @click="load"><Icon name="lucide:send" class="h-4 w-4" /> Send request</button>
      <label class="inline-flex items-center gap-2 text-sm text-muted">
        <input v-model="featuredOnly" type="checkbox" class="h-4 w-4 accent-cyan" @change="load"> <code class="font-mono text-xs">?featured=true</code>
      </label>
    </div>
    <ul v-if="list.length" class="grid gap-2 sm:grid-cols-2">
      <li v-for="p in list" :key="p.slug" class="rounded-xl border border-line bg-white/[0.02] px-3 py-2">
        <p class="text-sm text-white">{{ p.title }}</p>
        <p class="font-mono text-[11px] text-muted">{{ p.status_label }} · {{ p.tech.slice(0, 3).join(', ') }}</p>
      </li>
    </ul>
  </LabFeature>
</template>
