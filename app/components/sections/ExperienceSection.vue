<script setup lang="ts">
import { experience } from '~/data/experience'

const root = ref<HTMLElement | null>(null)
const progress = ref<HTMLElement | null>(null)
useReveal(root)

let ctx: { revert: () => void } | null = null
onMounted(async () => {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || !root.value || !progress.value) return
  const { gsap } = await loadGsap()
  ctx = gsap.context(() => {
    gsap.fromTo(
      progress.value,
      { scaleY: 0 },
      {
        scaleY: 1,
        ease: 'none',
        scrollTrigger: { trigger: root.value!.querySelector('ol'), start: 'top 70%', end: 'bottom 60%', scrub: 0.6 },
      },
    )
  }, root.value)
})
onBeforeUnmount(() => ctx?.revert())
</script>

<template>
  <section id="experience" ref="root" class="section">
    <div class="container-x">
      <UiSectionHeading index="03" eyebrow="Experience" title="Where I've been building." />

      <div class="relative">
        <!-- timeline rail + scroll progress -->
        <div class="absolute left-[11px] top-2 bottom-2 w-px bg-line md:left-1/2" aria-hidden="true" />
        <div
          ref="progress"
          class="absolute left-[11px] top-2 bottom-2 w-px origin-top bg-gradient-to-b from-cyan via-violet to-pink shadow-[0_0_12px_rgb(34_211_238/0.6)] md:left-1/2"
          aria-hidden="true"
        />

        <ol class="space-y-10 md:space-y-16">
          <li
            v-for="(job, i) in experience"
            :key="`${job.company}-${job.period}`"
            class="relative grid gap-4 pl-10 md:grid-cols-2 md:gap-16 md:pl-0"
          >
            <span
              class="absolute left-1.5 top-2 h-3 w-3 rounded-full border-2 border-ink md:left-1/2 md:-translate-x-1/2"
              :class="job.current ? 'bg-cyan shadow-[0_0_0_4px_rgb(34_211_238/0.2),0_0_16px_rgb(34_211_238)]' : 'bg-violet'"
              aria-hidden="true"
            />
            <div :class="i % 2 ? 'md:order-2' : 'md:text-right'" :data-reveal="i % 2 ? 'right' : 'left'">
              <p class="font-mono text-xs text-cyan">{{ job.period }}</p>
              <h3 class="mt-1 text-2xl font-semibold text-white">
                <a v-if="job.url" :href="job.url" target="_blank" rel="noopener noreferrer" class="hover:text-cyan">{{ job.company }}</a>
                <template v-else>{{ job.company }}</template>
              </h3>
              <p class="text-sm text-muted">
                {{ job.role }}
                <span v-if="job.current" class="ml-2 rounded-full bg-ok/15 px-2 py-0.5 font-mono text-[10px] uppercase text-ok">now</span>
              </p>
            </div>
            <div :class="i % 2 ? 'md:order-1' : ''" :data-reveal="i % 2 ? 'left' : 'right'">
              <div class="glass rounded-2xl p-5">
                <p class="text-sm leading-relaxed text-fg/90">{{ job.description }}</p>
                <ul class="mt-3 space-y-1.5">
                  <li v-for="h in job.highlights" :key="h" class="flex gap-2 text-sm text-muted">
                    <Icon name="lucide:chevron-right" class="mt-0.5 h-4 w-4 shrink-0 text-cyan" aria-hidden="true" />
                    {{ h }}
                  </li>
                </ul>
                <div class="mt-4 flex flex-wrap gap-1.5">
                  <span v-for="t in job.tech" :key="t" class="chip">{{ t }}</span>
                </div>
              </div>
            </div>
          </li>
        </ol>
      </div>
    </div>
  </section>
</template>
