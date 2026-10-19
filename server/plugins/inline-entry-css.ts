/**
 * app.vue imports the global stylesheet in a <style> block, which Nuxt inlines into every
 * pre-rendered page. Nuxt still adds a <link> to the identical entry CSS file, which would be a
 * second, render-blocking download of the same rules. The link is kept but marked `disabled`:
 * the browser neither applies nor blocks on it, and Nuxt's chunk preloader sees it as "already
 * loaded", so lazily hydrated sections don't fetch it again and restyle the whole page.
 */
const ENTRY_CSS_LINK = /<link rel="stylesheet" href="(\/_nuxt\/entry\.[\w-]+\.css)"[^>]*>/g

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('render:html', (html) => {
    const inlined = html.head.some((h) => h.includes('tailwindcss v4'))
    if (inlined) html.head = html.head.map((h) => h.replace(ENTRY_CSS_LINK, '<link rel="stylesheet" href="$1" disabled>'))
  })
})
