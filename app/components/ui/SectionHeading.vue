<script setup lang="ts">
defineProps<{ eyebrow: string; title: string; index?: string; lead?: string }>()
</script>

<template>
  <header class="mb-12 max-w-2xl sm:mb-16" data-reveal>
    <p class="eyebrow flex items-center gap-3">
      <span v-if="index" class="text-muted">{{ index }}</span>
      <span class="h-px w-8 bg-gradient-to-r from-cyan to-transparent" aria-hidden="true" />
      {{ eyebrow }}
    </p>
    <h2 class="mt-4 text-3xl font-bold text-white sm:text-5xl">
      <slot name="title">{{ title }}</slot>
    </h2>
    <p v-if="lead" class="mt-4 text-base leading-relaxed text-muted sm:text-lg">{{ lead }}</p>
  </header>
</template>
