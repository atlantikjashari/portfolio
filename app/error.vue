<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()
const is404 = computed(() => props.error.statusCode === 404)
const route = useRoute()

useHead({ title: is404.value ? 'Page not found' : 'Something went wrong' })
useSeoMeta({ robots: 'noindex' })

const home = () => clearError({ redirect: '/' })
</script>

<template>
  <div class="relative isolate">
    <SiteShaderBackground />
    <main class="container-x flex min-h-[100svh] flex-col items-center justify-center text-center">
      <p class="eyebrow">Error {{ error.statusCode }}</p>
      <h1 class="mt-4 font-display text-[clamp(5rem,22vw,14rem)] font-bold leading-none">
        <span class="glitch is-glitching text-gradient" :data-text="String(error.statusCode)">{{ error.statusCode }}</span>
      </h1>
      <p class="mt-6 max-w-md text-lg text-muted">
        {{ is404 ? "This route doesn't exist – it's not in the urlpatterns either." : 'Something broke on my side. Please try again.' }}
      </p>
      <pre class="glass mt-8 max-w-full overflow-x-auto rounded-xl px-4 py-3 text-left font-mono text-xs text-muted"><span class="text-violet">GET</span> {{ route.fullPath }} <span class="text-err">→ {{ error.statusCode }} {{ is404 ? 'Not Found' : 'Error' }}</span></pre>
      <div class="mt-10 flex flex-wrap justify-center gap-3">
        <button class="btn btn-primary" @click="home"><Icon name="lucide:house" class="h-4 w-4" /> Back home</button>
        <NuxtLink to="/backend" class="btn btn-ghost"><Icon name="lucide:flask-conical" class="h-4 w-4" /> Backend Lab</NuxtLink>
      </div>
    </main>
  </div>
</template>
