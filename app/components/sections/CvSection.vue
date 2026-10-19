<script setup lang="ts">
import { profile } from '~/data/profile'

const root = ref<HTMLElement | null>(null)
useReveal(root)

// pdf.js (~400 KB) is only downloaded on desktop, and only once this section approaches the viewport.
const showViewer = ref(false)
let io: IntersectionObserver | null = null
onMounted(() => {
  const desktop = matchMedia('(min-width: 768px) and (pointer: fine)').matches
  if (!desktop || !root.value) return
  io = new IntersectionObserver(
    ([e]) => {
      if (e?.isIntersecting) {
        showViewer.value = true
        io?.disconnect()
      }
    },
    { rootMargin: '400px 0px' },
  )
  io.observe(root.value)
})
onBeforeUnmount(() => io?.disconnect())
</script>

<template>
  <section id="cv" ref="root" class="section">
    <div class="container-x">
      <UiSectionHeading index="06" eyebrow="Curriculum vitae" title="The one-page version (well, three)." />

      <div class="grid gap-8 lg:grid-cols-[1fr_2fr] lg:items-start">
        <div class="space-y-5" data-reveal>
          <p class="text-muted">
            Everything on this site, in a recruiter-friendly PDF. Updated October 2026.
          </p>
          <div class="flex flex-wrap gap-3">
            <UiMagneticButton :href="profile.cvUrl" download="cv-atlantik-jashari.pdf">
              <Icon name="lucide:download" class="h-4 w-4" /> Download CV
            </UiMagneticButton>
            <UiMagneticButton :href="profile.cvUrl" variant="ghost" external>
              <Icon name="lucide:external-link" class="h-4 w-4" /> Open in new tab
            </UiMagneticButton>
          </div>
          <ul class="space-y-2 font-mono text-xs text-muted">
            <li class="flex items-center gap-2"><Icon name="lucide:file-text" class="h-4 w-4 text-cyan" /> PDF · 3 pages · US Letter</li>
            <li class="hidden items-center gap-2 md:flex"><Icon name="lucide:zoom-in" class="h-4 w-4 text-cyan" /> Zoom and page through it right here</li>
          </ul>
        </div>

        <div data-reveal>
          <!-- Desktop: interactive pdf.js viewer -->
          <LazyCvPdfViewer v-if="showViewer" :src="profile.cvUrl" />
          <!-- Mobile / before load: lightweight preview image that opens the PDF -->
          <a
            v-else
            :href="profile.cvUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="glass glow-border group block overflow-hidden rounded-2xl p-3"
            aria-label="Open the CV PDF"
          >
            <img
              src="/cv-preview.jpg"
              alt="Preview of the first page of Atlantik Jashari's CV"
              width="901"
              height="1166"
              loading="lazy"
              decoding="async"
              class="mx-auto w-full max-w-md rounded-lg transition-transform duration-500 group-hover:scale-[1.01]"
            >
            <span class="mt-3 flex items-center justify-center gap-2 font-mono text-xs text-cyan">
              <Icon name="lucide:maximize" class="h-4 w-4" /> Tap to open the full PDF
            </span>
          </a>
        </div>
      </div>
    </div>
  </section>
</template>
