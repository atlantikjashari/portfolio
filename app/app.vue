<script setup lang="ts">
import { profile } from '~/data/profile'

const { siteUrl } = useRuntimeConfig().public
const route = useRoute()
const description =
  'Atlantik Jashari – Software Engineer in Pristina, Kosovo. Vue/Nuxt, React/Next.js and TypeScript frontends, Django REST Framework backends.'

useHead({
  titleTemplate: (t) => (t ? `${t} · ${profile.name}` : `${profile.name} – ${profile.title}`),
  link: [{ rel: 'canonical', href: computed(() => `${siteUrl}${route.path === '/' ? '' : route.path}`) }],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: profile.name,
        jobTitle: profile.title,
        email: `mailto:${profile.email}`,
        url: siteUrl,
        address: { '@type': 'PostalAddress', addressLocality: 'Pristina', addressCountry: 'XK' },
        sameAs: [profile.github, profile.linkedin],
        alumniOf: 'UBT – University for Business and Technology',
      }),
    },
  ],
})

useSeoMeta({
  description,
  ogType: 'website',
  ogSiteName: profile.name,
  ogTitle: `${profile.name} – ${profile.title}`,
  ogDescription: description,
  ogImage: `${siteUrl}/og-image.png`,
  ogImageWidth: 1200,
  ogImageHeight: 630,
  ogImageAlt: `${profile.name} – ${profile.title}`,
  ogUrl: computed(() => `${siteUrl}${route.path}`),
  twitterCard: 'summary_large_image',
  twitterImage: `${siteUrl}/og-image.png`,
})
</script>

<template>
  <div class="relative isolate">
    <SiteShaderBackground />
    <SiteCustomCursor />
    <SiteNavBar />
    <main id="main" tabindex="-1" class="outline-none">
      <NuxtPage />
    </main>
    <SiteFooter />
  </div>
</template>

<!-- Inlined into the pre-rendered HTML by Nuxt (component styles are inlined; a global `css: []` entry would be render-blocking) -->
<style src="~/assets/css/main.css"></style>
