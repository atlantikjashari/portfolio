<script setup lang="ts">
import { skillGroups } from '~/data/skills'

const root = ref<HTMLElement | null>(null)
useReveal(root)

// Brand logos come from a cached sprite built by modules/skills-sprite.ts (keeps them out of the HTML)
const sprite = useAppConfig().skillsSprite as string
const symbolId = (icon: string) => icon.replace(':', '-')
</script>

<template>
  <section id="skills" ref="root" class="section">
    <div class="container-x">
      <UiSectionHeading
        index="02"
        eyebrow="Skills"
        title="The stack I ship with."
        lead="Grouped by where they live in a product. Hover a tile to light it up."
      />

      <div class="grid gap-6 lg:grid-cols-3">
        <div v-for="group in skillGroups" :key="group.id" class="glass glow-border rounded-2xl p-6" data-reveal>
          <div class="mb-5 flex items-baseline justify-between">
            <h3 class="text-xl font-semibold text-white">{{ group.title }}</h3>
            <span class="font-mono text-xs text-muted">{{ group.skills.length.toString().padStart(2, '0') }}</span>
          </div>
          <p class="mb-5 text-sm text-muted">{{ group.blurb }}</p>
          <ul class="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
            <li
              v-for="skill in group.skills"
              :key="skill.name"
              class="group relative flex flex-col items-center justify-center gap-2 overflow-hidden rounded-xl border border-line bg-white/[0.02] px-2 py-4 text-center transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan/40 hover:bg-cyan/[0.06]"
              data-reveal="scale"
            >
              <span
                class="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-[radial-gradient(circle_at_50%_0%,rgb(34_211_238/0.18),transparent_70%)]"
                aria-hidden="true"
              />
              <svg class="h-6 w-6 text-fg/80 transition-colors duration-300 group-hover:text-cyan" aria-hidden="true" focusable="false">
                <use :href="`${sprite}#${symbolId(skill.icon)}`" />
              </svg>
              <span class="text-[11px] leading-tight text-muted transition-colors group-hover:text-white">{{ skill.name }}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </section>
</template>
