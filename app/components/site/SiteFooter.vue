<script setup lang="ts">
import { profile } from '~/data/profile'
const year = new Date().getFullYear()
</script>

<template>
  <footer class="relative border-t border-line py-10">
    <div class="container-x flex flex-col items-center justify-between gap-4 text-sm text-muted sm:flex-row">
      <p>© {{ year }} {{ profile.name }} · {{ profile.location }}</p>
      <div class="flex items-center gap-4">
        <SiteApiStatusPill />
        <a :href="profile.github" target="_blank" rel="noopener noreferrer" class="hover:text-white" aria-label="GitHub">
          <Icon name="simple-icons:github" class="h-4 w-4" />
        </a>
        <a :href="profile.linkedin" target="_blank" rel="noopener noreferrer" class="hover:text-white" aria-label="LinkedIn">
          <Icon name="simple-icons:linkedin" class="h-4 w-4" />
        </a>
        <a :href="`mailto:${profile.email}`" class="hover:text-white" aria-label="Email">
          <Icon name="lucide:mail" class="h-4 w-4" />
        </a>
      </div>
      <p class="font-mono text-xs">Nuxt · Django REST Framework · WebGL</p>
    </div>
  </footer>
</template>
