<script setup lang="ts">
import type { ApiExchange } from '~/composables/useApi'

const { request } = useApi()
const exchange = ref<ApiExchange | null>(null)
const pending = ref(false)

const scenarios = {
  valid: {
    label: 'Valid message',
    icon: 'lucide:check',
    body: {
      name: 'Backend Lab visitor',
      email: 'visitor@example.com',
      subject: '[Backend Lab demo]',
      message: 'Hello from the Backend Lab! This message was sent by the live demo.',
    },
  },
  invalid: {
    label: 'Invalid payload',
    icon: 'lucide:circle-alert',
    body: { name: 'A', email: 'not-an-email', message: 'short' },
  },
  honeypot: {
    label: 'Bot (honeypot filled)',
    icon: 'lucide:shield-check',
    body: {
      name: 'Spam Bot',
      email: 'bot@example.com',
      message: 'Buy cheap followers now, best prices!!!',
      website: 'http://spam.example',
    },
  },
} as const

async function send(kind: keyof typeof scenarios) {
  pending.value = true
  exchange.value = await request('/api/contact/', { method: 'POST', body: scenarios[kind].body, retries: 1 })
  pending.value = false
}
</script>

<template>
  <LabFeature id="contact-api" index="01" title="Contact API" :endpoints="['POST /api/contact/']" :exchange="exchange" :pending="pending">
    <template #explain>
      <p>The portfolio's contact form posts here. A <strong>DRF ModelSerializer</strong> validates the name, email, optional phone and message, then the message is saved to <strong>PostgreSQL</strong> and shows up in the Django admin.</p>
      <ul>
        <li><strong>Rate limited</strong> with DRF <code>ScopedRateThrottle</code>: 5 accepted messages per hour per IP. The 6th returns <code>429</code> with a <code>Retry-After</code> header. A custom throttle counts only submissions that pass validation, so typos never lock a visitor out.</li>
        <li><strong>Honeypot</strong>: a hidden <code>website</code> field that only bots fill in. They get a fake <code>201</code>, and nothing is stored or emailed.</li>
        <li>After the database commit, a <strong>Resend</strong> email notification is sent in the background, so a slow email API never slows down the response.</li>
      </ul>
    </template>
    <div class="grid gap-2 sm:grid-cols-3">
      <button
        v-for="(s, key) in scenarios"
        :key="key"
        class="btn btn-ghost !justify-start !px-4 text-left"
        :disabled="pending"
        @click="send(key)"
      >
        <Icon :name="s.icon" class="h-4 w-4 shrink-0 text-cyan" /> {{ s.label }}
      </button>
    </div>
    <p class="font-mono text-[11px] text-muted">"Valid message" really saves a row (rate-limited to 5/hour per IP).</p>
  </LabFeature>
</template>
