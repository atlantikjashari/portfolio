<script setup lang="ts">
import { profile } from '~/data/profile'

const root = ref<HTMLElement | null>(null)
useReveal(root)

const { request, state: apiState } = useApi()

const form = reactive({ name: '', email: '', phone: '', subject: '', message: '', website: '' })
const errors = ref<Record<string, string>>({})
const status = ref<'idle' | 'sending' | 'sent' | 'error'>('idle')
const banner = ref('')

const channels = [
  { icon: 'lucide:mail', label: 'Email', value: profile.email, href: `mailto:${profile.email}` },
  { icon: 'lucide:phone', label: 'Phone', value: profile.phone, href: profile.phoneHref },
  { icon: 'simple-icons:linkedin', label: 'LinkedIn', value: 'in/atlantikjashari', href: profile.linkedin },
  { icon: 'simple-icons:github', label: 'GitHub', value: 'atlantikjashari', href: profile.github },
  { icon: 'lucide:map-pin', label: 'Location', value: profile.location, href: '' },
]

function validate() {
  const e: Record<string, string> = {}
  if (form.name.trim().length < 2) e.name = 'Please enter your name.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Please enter a valid email address.'
  if (form.phone && !/^\+?[0-9 ()-]{6,30}$/.test(form.phone.trim())) e.phone = 'Please enter a valid phone number.'
  if (form.message.trim().length < 10) e.message = 'Your message should be at least 10 characters.'
  errors.value = e
  return Object.keys(e).length === 0
}

async function submit() {
  banner.value = ''
  if (!validate()) return
  status.value = 'sending'
  const res = await request<Record<string, unknown>>('/api/contact/', { method: 'POST', body: { ...form }, retries: 1 })

  if (res.ok) {
    status.value = 'sent'
    Object.assign(form, { name: '', email: '', phone: '', subject: '', message: '', website: '' })
    return
  }
  status.value = 'error'
  if (res.status === 400 && res.data && typeof res.data === 'object') {
    errors.value = Object.fromEntries(
      Object.entries(res.data).map(([k, v]) => [k, Array.isArray(v) ? String(v[0]) : String(v)]),
    )
    banner.value = 'Please fix the highlighted fields.'
  } else if (res.status === 429) {
    banner.value = `Too many messages from your network. Please try again ${res.retryAfter ? `in ${Math.ceil(Number(res.retryAfter) / 60)} min` : 'later'}, or email me directly.`
  } else {
    banner.value = `The server couldn't be reached right now. Please email me at ${profile.email} – sorry about that!`
  }
}

const sendingLabel = computed(() => (apiState.value === 'waking' ? 'Waking up the server…' : 'Sending…'))
</script>

<template>
  <section id="contact" ref="root" class="section">
    <div class="container-x">
      <UiSectionHeading
        index="07"
        eyebrow="Contact"
        title="Let's build something."
        lead="Send a message straight into my Django backend, or reach me on any channel below."
      />

      <div class="grid gap-8 lg:grid-cols-[1fr_1.4fr]">
        <ul class="space-y-3" data-reveal="left">
          <li v-for="c in channels" :key="c.label">
            <component
              :is="c.href ? 'a' : 'div'"
              :href="c.href || undefined"
              :target="c.href.startsWith('http') ? '_blank' : undefined"
              :rel="c.href.startsWith('http') ? 'noopener noreferrer' : undefined"
              class="glass group flex items-center gap-4 rounded-2xl p-4 transition-colors"
              :class="c.href ? 'hover:bg-white/[0.07]' : ''"
            >
              <span class="grid h-10 w-10 place-items-center rounded-xl bg-white/5 text-cyan transition-colors group-hover:text-white">
                <Icon :name="c.icon" class="h-5 w-5" aria-hidden="true" />
              </span>
              <span>
                <span class="block font-mono text-[11px] uppercase tracking-widest text-muted">{{ c.label }}</span>
                <span class="block text-sm text-fg">{{ c.value }}</span>
              </span>
            </component>
          </li>
        </ul>

        <form class="glass glow-border space-y-4 rounded-2xl p-6 sm:p-8" novalidate data-reveal="right" @submit.prevent="submit">
          <div v-if="status === 'sent'" class="rounded-xl border border-ok/30 bg-ok/10 p-4 text-sm text-ok" role="status">
            <Icon name="lucide:check" class="mr-1 inline h-4 w-4" /> Thanks! Your message reached the backend. I'll get back to you soon.
          </div>
          <div v-if="banner" class="rounded-xl border border-err/30 bg-err/10 p-4 text-sm text-err" role="alert">{{ banner }}</div>

          <div class="grid gap-4 sm:grid-cols-2">
            <div>
              <label for="c-name" class="label">Name *</label>
              <input id="c-name" v-model="form.name" class="input" autocomplete="name" maxlength="100" :aria-invalid="!!errors.name" aria-describedby="c-name-err" required>
              <p v-if="errors.name" id="c-name-err" class="mt-1 text-xs text-err">{{ errors.name }}</p>
            </div>
            <div>
              <label for="c-email" class="label">Email *</label>
              <input id="c-email" v-model="form.email" type="email" class="input" autocomplete="email" :aria-invalid="!!errors.email" aria-describedby="c-email-err" required>
              <p v-if="errors.email" id="c-email-err" class="mt-1 text-xs text-err">{{ errors.email }}</p>
            </div>
            <div>
              <label for="c-phone" class="label">Phone <span class="text-muted/60">(optional)</span></label>
              <input id="c-phone" v-model="form.phone" type="tel" class="input" autocomplete="tel" maxlength="30" placeholder="+383 …" :aria-invalid="!!errors.phone" aria-describedby="c-phone-err">
              <p v-if="errors.phone" id="c-phone-err" class="mt-1 text-xs text-err">{{ errors.phone }}</p>
            </div>
            <div>
              <label for="c-subject" class="label">Subject <span class="text-muted/60">(optional)</span></label>
              <input id="c-subject" v-model="form.subject" class="input" maxlength="150">
            </div>
          </div>
          <div>
            <label for="c-message" class="label">Message *</label>
            <textarea id="c-message" v-model="form.message" rows="5" class="input resize-y" maxlength="5000" :aria-invalid="!!errors.message" aria-describedby="c-message-err" required />
            <p v-if="errors.message" id="c-message-err" class="mt-1 text-xs text-err">{{ errors.message }}</p>
          </div>

          <!-- Honeypot: invisible to people, irresistible to bots -->
          <div class="absolute -left-[9999px] h-px w-px overflow-hidden" aria-hidden="true">
            <label for="c-website">Website</label>
            <input id="c-website" v-model="form.website" tabindex="-1" autocomplete="off">
          </div>

          <div class="flex flex-wrap items-center justify-between gap-4 pt-2">
            <p class="font-mono text-[11px] text-muted">POST /api/contact/ · rate-limited · spam-protected</p>
            <UiMagneticButton type="submit" :disabled="status === 'sending'">
              <Icon :name="status === 'sending' ? 'lucide:loader-circle' : 'lucide:send'" class="h-4 w-4" :class="{ 'animate-spin': status === 'sending' }" />
              {{ status === 'sending' ? sendingLabel : 'Send message' }}
            </UiMagneticButton>
          </div>
        </form>
      </div>
    </div>
  </section>
</template>
