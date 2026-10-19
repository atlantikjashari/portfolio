<script setup lang="ts">
import type { ApiExchange } from '~/composables/useApi'

interface Entry {
  id: number
  name: string
  message: string
  created_at: string
}
interface Page {
  count: number
  next: string | null
  previous: string | null
  results: Entry[]
}

const { request } = useApi()
const exchange = ref<ApiExchange | null>(null)
const pending = ref(false)
const page = ref(1)
const data = ref<Page | null>(null)
const form = reactive({ name: '', message: '', website: '' })
const notice = ref('')
const errors = ref<Record<string, string>>({})

async function load(p = page.value) {
  pending.value = true
  const res = await request<Page>('/api/guestbook/', { query: { page: p } })
  exchange.value = res
  if (res.ok && res.data) {
    data.value = res.data
    page.value = p
  }
  pending.value = false
}
onMounted(() => load(1))

async function sign() {
  notice.value = ''
  errors.value = {}
  pending.value = true
  const res = await request<Record<string, unknown>>('/api/guestbook/', { method: 'POST', body: { ...form }, retries: 1 })
  exchange.value = res
  pending.value = false
  if (res.ok) {
    notice.value = String((res.data as { detail?: string })?.detail ?? 'Thanks!')
    form.message = ''
    await load(1)
    exchange.value = res // keep the POST visible
  } else if (res.status === 400 && res.data) {
    errors.value = Object.fromEntries(Object.entries(res.data).map(([k, v]) => [k, Array.isArray(v) ? String(v[0]) : String(v)]))
  } else if (res.status === 429) {
    notice.value = 'Slow down! The guestbook allows 10 posts per hour per visitor.'
  }
}

const totalPages = computed(() => (data.value ? Math.max(1, Math.ceil(data.value.count / 5)) : 1))
const fmt = (iso: string) => new Date(iso).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
</script>

<template>
  <LabFeature id="guestbook" index="03" title="Guestbook" :endpoints="['GET /api/guestbook/?page=n', 'POST /api/guestbook/']" :exchange="exchange" :pending="pending">
    <template #explain>
      <p>Leave a short note (up to 280 characters). The list is <strong>paginated</strong> with DRF's <code>PageNumberPagination</code>, 5 entries per page, newest first.</p>
      <ul>
        <li><strong>Validation</strong>: name 2–40 characters, message 3–280 characters.</li>
        <li><strong>Moderation flag</strong>: entries with links are automatically held back (<code>is_approved=False</code>) until I approve them in the admin.</li>
        <li>Separate throttle for writes (10/hour), plus the same honeypot as the contact form.</li>
      </ul>
    </template>

    <form class="grid gap-2 sm:grid-cols-[10rem_1fr_auto]" novalidate @submit.prevent="sign">
      <div>
        <label for="gb-name" class="sr-only">Your name</label>
        <input id="gb-name" v-model="form.name" class="input !py-2" placeholder="Your name" maxlength="40" :aria-invalid="!!errors.name">
      </div>
      <div>
        <label for="gb-msg" class="sr-only">Message</label>
        <input id="gb-msg" v-model="form.message" class="input !py-2" placeholder="Say hi…" maxlength="280" :aria-invalid="!!errors.message">
      </div>
      <input v-model="form.website" class="hidden" tabindex="-1" autocomplete="off" aria-hidden="true">
      <button class="btn btn-primary !py-2" type="submit" :disabled="pending"><Icon name="lucide:send" class="h-4 w-4" /> Sign</button>
    </form>
    <p v-if="errors.name || errors.message" class="text-xs text-err" role="alert">{{ errors.name || errors.message }}</p>
    <p v-if="notice" class="text-xs text-ok" role="status">{{ notice }}</p>

    <ul class="space-y-2" aria-live="polite">
      <li v-if="data && !data.results.length" class="text-sm text-muted">No entries yet. Be the first!</li>
      <li v-for="e in data?.results ?? []" :key="e.id" class="rounded-xl border border-line bg-white/[0.02] px-3 py-2">
        <p class="text-sm text-fg"><span class="font-semibold text-white">{{ e.name }}</span> · {{ e.message }}</p>
        <p class="font-mono text-[10px] text-muted">{{ fmt(e.created_at) }}</p>
      </li>
    </ul>
    <div v-if="data" class="flex items-center justify-between font-mono text-xs text-muted">
      <button class="rounded-lg px-2 py-1 hover:bg-white/10 disabled:opacity-30" :disabled="!data.previous || pending" @click="load(page - 1)">← prev</button>
      <span>page {{ page }} / {{ totalPages }} · {{ data.count }} entries</span>
      <button class="rounded-lg px-2 py-1 hover:bg-white/10 disabled:opacity-30" :disabled="!data.next || pending" @click="load(page + 1)">next →</button>
    </div>
  </LabFeature>
</template>
