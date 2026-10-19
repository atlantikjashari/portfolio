import tailwindcss from '@tailwindcss/vite'

const siteUrl = (process.env.NUXT_PUBLIC_SITE_URL || 'https://atlantik-portfolio.pages.dev').replace(/\/$/, '')

export default defineNuxtConfig({
  compatibilityDate: '2026-10-01',
  devtools: { enabled: false },
  ssr: true, // pre-rendered to static HTML by `nuxt generate`

  modules: ['@nuxt/fonts', '@nuxt/icon'],

  // Global CSS is loaded from app.vue's <style> block so Nuxt inlines it into the HTML (no render-blocking request).

  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: { include: ['gsap', 'gsap/ScrollTrigger'] },
  },

  experimental: {
    // prefetch the /backend chunk when a visitor hovers/focuses the link, not as soon as it is visible
    defaults: { nuxtLink: { prefetchOn: { visibility: false, interaction: true } } },
  },

  runtimeConfig: {
    public: {
      // Baked in at build time (static site). Set NUXT_PUBLIC_API_BASE in Cloudflare Pages.
      apiBase: (process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:8000').replace(/\/$/, ''),
      siteUrl,
    },
  },

  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        { name: 'theme-color', content: '#05060a' },
        { name: 'color-scheme', content: 'dark' },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32.png' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
      ],
      script: [
        {
          // Hide reveal targets before first paint only when JS + motion are available (no flash, no hidden content without JS).
          innerHTML:
            "(function(){try{if(!matchMedia('(prefers-reduced-motion: reduce)').matches){document.documentElement.classList.add('reveal-ready');setTimeout(function(){document.documentElement.classList.remove('reveal-ready')},4000)}}catch(e){}})()",
          tagPriority: 'critical',
        },
      ],
    },
  },

  fonts: {
    // latin covers English + Albanian (ë, ç); preload the two fonts used above the fold
    defaults: { weights: [400, 500, 600, 700], styles: ['normal'], subsets: ['latin'] },
    families: [
      { name: 'Space Grotesk', provider: 'google', weights: [500, 600, 700], preload: true },
      { name: 'Inter', provider: 'google', weights: [400, 500, 600], preload: true },
      { name: 'JetBrains Mono', provider: 'google', weights: [400, 500] },
    ],
  },

  icon: {
    // Bundle the icons we use into the client build: no runtime calls to the Iconify API.
    provider: 'none',
    mode: 'svg', // inline SVG in the pre-rendered HTML instead of a large CSS-mask stylesheet
    clientBundle: {
      scan: true, // skill logos are not in here: they ship as a separate sprite (modules/skills-sprite.ts)
      sizeLimitKb: 256,
    },
  },

  nitro: {
    prerender: {
      routes: ['/', '/backend', '/sitemap.xml', '/robots.txt'],
      crawlLinks: false,
    },
  },

  typescript: { strict: true },
})
