<script setup lang="ts">
import { profile } from '~/data/profile'

const sections = [
  { id: 'about', label: 'About' },
  { id: 'skills', label: 'Skills' },
  { id: 'experience', label: 'Experience' },
  { id: 'projects', label: 'Projects' },
  { id: 'certifications', label: 'Certs' },
  { id: 'cv', label: 'CV' },
  { id: 'contact', label: 'Contact' },
]

const route = useRoute()
const isHome = computed(() => route.path === '/')
const active = useActiveSection(sections.map((s) => s.id))
const open = ref(false)
const scrolled = ref(false)

const onScroll = () => (scrolled.value = scrollY > 12)
onMounted(() => {
  onScroll()
  addEventListener('scroll', onScroll, { passive: true })
})
onBeforeUnmount(() => removeEventListener('scroll', onScroll))
watch(() => route.fullPath, () => (open.value = false))

const linkTo = (id: string) => (isHome.value ? `#${id}` : `/#${id}`)
</script>

<template>
  <header class="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-4">
    <a href="#main" class="sr-only-focusable btn btn-primary absolute left-4 top-4 z-[60]">Skip to content</a>
    <nav
      class="mx-auto flex h-14 max-w-6xl items-center justify-between rounded-2xl px-3 transition-all duration-500 sm:px-4"
      :class="scrolled || open ? 'glass nav-solid shadow-[0_10px_40px_-15px_rgb(0_0_0/0.8)]' : 'border border-transparent'"
      aria-label="Main"
    >
      <NuxtLink to="/" class="group flex items-center gap-2.5">
        <!-- monogram drawn via CSS content so the link's accessible name is just the full name -->
        <span aria-hidden="true" class="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-cyan to-violet font-display text-sm font-bold text-ink shadow-[0_0_24px_-4px_rgb(34_211_238/0.7)] before:content-['AJ']" />
        <span class="sr-only font-display text-sm font-semibold text-white sm:not-sr-only">{{ profile.name }}<span class="sr-only">, home</span></span>
      </NuxtLink>

      <ul class="hidden items-center gap-1 lg:flex">
        <li v-for="s in sections" :key="s.id">
          <a
            :href="linkTo(s.id)"
            class="relative rounded-lg px-3 py-2 text-sm transition-colors"
            :class="isHome && active === s.id ? 'text-white' : 'text-muted hover:text-white'"
            :aria-current="isHome && active === s.id ? 'true' : undefined"
          >
            {{ s.label }}
            <span
              class="absolute inset-x-3 -bottom-0.5 h-px origin-left bg-gradient-to-r from-cyan to-violet transition-transform duration-500"
              :class="isHome && active === s.id ? 'scale-x-100' : 'scale-x-0'"
              aria-hidden="true"
            />
          </a>
        </li>
        <li>
          <NuxtLink
            to="/backend"
            class="ml-1 inline-flex items-center gap-1.5 rounded-lg border border-cyan/30 bg-cyan/10 px-3 py-2 font-mono text-xs text-cyan transition-colors hover:bg-cyan/20"
            active-class="!bg-cyan/25 !text-white"
          >
            <Icon name="lucide:flask-conical" class="h-3.5 w-3.5" /> Backend Lab
          </NuxtLink>
        </li>
      </ul>

      <div class="flex items-center gap-2">
        <SiteApiStatusPill class="hidden sm:inline-flex" :compact="true" />
        <button
          class="grid h-10 w-10 place-items-center rounded-xl border border-line text-fg lg:hidden"
          :aria-expanded="open"
          aria-controls="mobile-menu"
          :aria-label="open ? 'Close menu' : 'Open menu'"
          @click="open = !open"
        >
          <Icon :name="open ? 'lucide:x' : 'lucide:menu'" class="h-5 w-5" />
        </button>
      </div>
    </nav>

    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0 -translate-y-2"
      leave-active-class="transition duration-200 ease-in"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div v-if="open" id="mobile-menu" class="glass nav-solid mx-auto mt-2 max-w-6xl rounded-2xl p-3 lg:hidden">
        <ul class="grid gap-1">
          <li v-for="s in sections" :key="s.id">
            <a :href="linkTo(s.id)" class="block rounded-lg px-3 py-2.5 text-sm text-fg hover:bg-white/5" @click="open = false">{{ s.label }}</a>
          </li>
          <li>
            <NuxtLink to="/backend" class="flex items-center gap-2 rounded-lg px-3 py-2.5 font-mono text-sm text-cyan hover:bg-white/5">
              <Icon name="lucide:flask-conical" class="h-4 w-4" /> Backend Lab
            </NuxtLink>
          </li>
          <li class="px-3 pt-2"><SiteApiStatusPill /></li>
        </ul>
      </div>
    </Transition>
  </header>
</template>

<style scoped>
/* readable over any content: a mostly-opaque tint under the glass gradient */
.nav-solid {
  background:
    linear-gradient(180deg, rgb(255 255 255 / 0.06), rgb(255 255 255 / 0.02)),
    rgb(5 6 10 / 0.82);
}
</style>
