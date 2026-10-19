<script setup lang="ts">
import { education, profile } from '~/data/profile'

const root = ref<HTMLElement | null>(null)
useReveal(root)

const facts = [
  { icon: 'lucide:map-pin', label: 'Location', value: profile.location },
  { icon: 'lucide:briefcase', label: 'Currently', value: 'Frontend Developer @ AnchorzUp' },
  { icon: 'lucide:graduation-cap', label: 'Education', value: `${education.degree}, ${education.school} (${education.period})` },
  { icon: 'lucide:award', label: 'Latest cert', value: 'Advanced Django & DRF – Coursera' },
]
</script>

<template>
  <section id="about" ref="root" class="section">
    <div class="container-x">
      <UiSectionHeading index="01" eyebrow="About" title="Frontend craft, backend depth." />

      <div class="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
        <div class="space-y-5 text-lg leading-relaxed text-fg/90">
          <p v-for="(p, i) in profile.summary" :key="i" data-reveal>{{ p }}</p>
        </div>

        <div class="glass glow-border rounded-2xl p-6" data-reveal="right">
          <div class="mb-6 flex items-center gap-4">
            <!-- TODO: replace the monogram with a photo by setting profile.photo -->
            <img
              v-if="profile.photo"
              :src="profile.photo"
              :alt="`Portrait of ${profile.name}`"
              width="72"
              height="72"
              loading="lazy"
              class="h-18 w-18 rounded-2xl object-cover"
            >
            <div
              v-else
              class="grid h-18 w-18 place-items-center rounded-2xl bg-gradient-to-br from-cyan via-violet to-pink font-display text-2xl font-bold text-ink"
              aria-hidden="true"
            >
              AJ
            </div>
            <div>
              <p class="font-display text-xl font-semibold text-white">{{ profile.name }}</p>
              <p class="font-mono text-sm text-cyan">{{ profile.title }}</p>
            </div>
          </div>
          <dl class="space-y-4">
            <div v-for="f in facts" :key="f.label">
              <dt class="flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-muted">
                <Icon :name="f.icon" class="h-4 w-4 shrink-0 text-violet" aria-hidden="true" />{{ f.label }}
              </dt>
              <dd class="pl-6 text-sm text-fg">{{ f.value }}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  </section>
</template>
