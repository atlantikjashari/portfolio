<script setup lang="ts">
useHead({ title: '' })

// hydrate a little before the section enters the viewport, so scroll reveals start off-screen
const early = { rootMargin: '600px 0px' }
</script>

<template>
  <div>
    <SectionsHeroSection />
    <!-- Below the fold: pre-rendered HTML shows immediately, but each section's JS only loads and
         hydrates shortly before it scrolls into view (keeps the main thread free on phones). -->
    <LazySectionsAboutSection :hydrate-on-visible="early" />
    <LazySectionsSkillsSection :hydrate-on-visible="early" />
    <LazySectionsExperienceSection :hydrate-on-visible="early" />
    <LazySectionsProjectsSection :hydrate-on-visible="early" />
    <LazySectionsCertificationsSection :hydrate-on-visible="early" />
    <LazySectionsCvSection :hydrate-on-visible="early" />
    <LazySectionsContactSection :hydrate-on-visible="early" />
  </div>
</template>
