<script setup lang="ts">
import { certifications } from '~/data/certifications'
import { education } from '~/data/profile'

const root = ref<HTMLElement | null>(null)
useReveal(root)
</script>

<template>
  <section id="certifications" ref="root" class="section">
    <div class="container-x">
      <UiSectionHeading index="05" eyebrow="Certifications & education" title="Always learning." />

      <div class="grid gap-6 lg:grid-cols-3">
        <article
          v-for="c in certifications"
          :key="c.title"
          class="glass glow-border flex flex-col rounded-2xl p-6"
          :class="c.highlight ? 'lg:col-span-2 lg:row-span-2' : ''"
          data-reveal
        >
          <div class="flex items-center gap-3">
            <span class="grid h-10 w-10 place-items-center rounded-xl" :class="c.highlight ? 'bg-gradient-to-br from-cyan to-violet text-ink' : 'bg-white/5 text-violet'">
              <Icon name="lucide:award" class="h-5 w-5" aria-hidden="true" />
            </span>
            <p class="font-mono text-xs text-muted">{{ c.issuer }} · {{ c.date }}</p>
            <span v-if="c.highlight" class="ml-auto rounded-full bg-cyan/10 px-2 py-0.5 font-mono text-[10px] uppercase text-cyan">new</span>
          </div>
          <h3 class="mt-4 font-semibold text-white" :class="c.highlight ? 'text-2xl sm:text-3xl' : 'text-lg'">{{ c.title }}</h3>
          <p v-if="c.description" class="mt-3 text-sm leading-relaxed text-muted">{{ c.description }}</p>
          <div v-if="c.highlight" class="mt-5 flex flex-wrap gap-1.5">
            <span v-for="t in ['Django', 'Django REST Framework', 'Testing', 'React integration', 'External APIs', 'Celery', 'Redis']" :key="t" class="chip">{{ t }}</span>
          </div>
          <div class="mt-auto flex flex-wrap gap-4 pt-6">
            <a v-if="c.url" :href="c.url" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 text-sm text-cyan hover:text-white">
              <Icon name="lucide:external-link" class="h-4 w-4" /> View on Coursera
            </a>
            <NuxtLink v-if="c.highlight" to="/backend" class="inline-flex items-center gap-1.5 text-sm text-muted hover:text-white">
              <Icon name="lucide:flask-conical" class="h-4 w-4" /> See it applied in the Backend Lab
            </NuxtLink>
          </div>
        </article>

        <article class="glass flex flex-col rounded-2xl p-6" data-reveal>
          <div class="flex items-center gap-3">
            <span class="grid h-10 w-10 place-items-center rounded-xl bg-white/5 text-cyan">
              <Icon name="lucide:graduation-cap" class="h-5 w-5" aria-hidden="true" />
            </span>
            <p class="font-mono text-xs text-muted">{{ education.school }} · {{ education.period }}</p>
          </div>
          <h3 class="mt-4 text-lg font-semibold text-white">{{ education.degree }}</h3>
        </article>
      </div>
    </div>
  </section>
</template>
