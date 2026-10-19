<script setup lang="ts">
import { profile } from '~/data/profile'
// Entrance animation is pure CSS (see <style>): no JS on the critical path, and the name (the LCP
// element) only moves, it never starts invisible.
</script>

<template>
  <section id="top" class="relative flex min-h-[100svh] items-center pt-24 pb-16">
    <div class="container-x">
      <p data-hero class="chip mb-6 !text-xs">
        <span class="h-1.5 w-1.5 rounded-full bg-ok shadow-[0_0_8px_rgb(52_211_153)]" aria-hidden="true" />
        Based in {{ profile.location }}
      </p>

      <h1 class="font-display font-bold leading-[0.95] text-white">
        <span data-hero="lcp" class="block text-[clamp(2.75rem,9vw,7.5rem)]">{{ profile.name }}</span>
        <span data-hero class="mt-3 block text-[clamp(1.6rem,5vw,3.75rem)]">
          <span class="text-gradient"><UiGlitchTyping :text="profile.title" /></span>
        </span>
      </h1>

      <p data-hero class="mt-8 max-w-xl text-lg leading-relaxed text-muted sm:text-xl">
        {{ profile.pitch }}
      </p>

      <div data-hero class="mt-10 flex flex-wrap items-center gap-3">
        <UiMagneticButton href="#cv">
          <Icon name="lucide:file-text" class="h-4 w-4" /> View CV
        </UiMagneticButton>
        <UiMagneticButton href="#contact" variant="ghost">
          <Icon name="lucide:send" class="h-4 w-4" /> Contact
        </UiMagneticButton>
        <UiMagneticButton to="/backend" variant="ghost">
          <Icon name="lucide:flask-conical" class="h-4 w-4 text-cyan" /> Backend Lab
        </UiMagneticButton>
      </div>

      <dl data-hero class="mt-16 grid max-w-2xl grid-cols-3 gap-4 border-t border-line pt-8">
        <div>
          <dt class="font-mono text-[11px] uppercase tracking-widest text-muted">Experience</dt>
          <dd class="mt-1 font-display text-2xl font-semibold text-white sm:text-3xl">3+ yrs</dd>
        </div>
        <div>
          <dt class="font-mono text-[11px] uppercase tracking-widest text-muted">Frontend</dt>
          <dd class="mt-1 font-display text-2xl font-semibold text-white sm:text-3xl">Vue · React</dd>
        </div>
        <div>
          <dt class="font-mono text-[11px] uppercase tracking-widest text-muted">Backend</dt>
          <dd class="mt-1 font-display text-2xl font-semibold text-white sm:text-3xl">Django</dd>
        </div>
      </dl>
    </div>

    <a
      href="#about"
      class="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-muted sm:flex"
      aria-label="Scroll to About"
    >
      scroll
      <span class="h-10 w-px bg-gradient-to-b from-cyan to-transparent" aria-hidden="true" />
    </a>
  </section>
</template>

<style scoped>
@media (prefers-reduced-motion: no-preference) {
  [data-hero] {
    animation: hero-in 1s cubic-bezier(0.16, 1, 0.3, 1) both;
  }
  [data-hero='lcp'] {
    animation-name: hero-in-move;
  }
  [data-hero]:nth-child(1) { animation-delay: 0.05s; }
  h1 > [data-hero]:nth-child(2) { animation-delay: 0.15s; }
  p[data-hero] { animation-delay: 0.25s; }
  div[data-hero] { animation-delay: 0.35s; }
  dl[data-hero] { animation-delay: 0.45s; }
}
@keyframes hero-in {
  /* opacity + transform only: compositor-friendly, no per-frame repaint on phones */
  from { opacity: 0; transform: translateY(24px); }
  to { opacity: 1; transform: none; }
}
@keyframes hero-in-move {
  from { transform: translateY(24px); }
  to { transform: none; }
}
</style>
