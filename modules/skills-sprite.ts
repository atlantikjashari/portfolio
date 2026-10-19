import { createHash } from 'node:crypto'
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { join } from 'node:path'
import { defineNuxtModule } from '@nuxt/kit'
import { getIconData, iconToSVG } from '@iconify/utils'
import type { IconifyJSON } from '@iconify/types'
import { skillGroups } from '../app/data/skills'

/**
 * Builds one SVG sprite (<symbol> per skill icon) at build time and serves it as a hashed,
 * immutable static file. The skills grid references it with <use>, so ~50 KB of brand-logo paths
 * stay out of the pre-rendered HTML (faster first paint on mobile) and are cached across visits.
 */
export default defineNuxtModule({
  meta: { name: 'skills-sprite' },
  setup(_, nuxt) {
    const require = createRequire(import.meta.url)
    const sets = new Map<string, IconifyJSON>()
    const loadSet = (prefix: string) => {
      if (!sets.has(prefix)) {
        const file = require.resolve(`@iconify-json/${prefix}/icons.json`)
        sets.set(prefix, JSON.parse(readFileSync(file, 'utf-8')))
      }
      return sets.get(prefix)!
    }

    const symbols = skillGroups.flatMap((g) => g.skills).map(({ icon }) => {
      const [prefix, name] = icon.split(':') as [string, string]
      const data = getIconData(loadSet(prefix), name)
      if (!data) throw new Error(`[skills-sprite] unknown icon "${icon}"`)
      const { attributes, body } = iconToSVG(data)
      return `<symbol id="${prefix}-${name}" viewBox="${attributes.viewBox}">${body}</symbol>`
    })
    const sprite = `<svg xmlns="http://www.w3.org/2000/svg">${[...new Set(symbols)].join('')}</svg>`
    const hash = createHash('sha256').update(sprite).digest('hex').slice(0, 8)

    // outside buildDir, which Nuxt empties during the build
    const dir = join(nuxt.options.rootDir, 'node_modules/.cache/skills-sprite')
    rmSync(dir, { recursive: true, force: true })
    mkdirSync(dir, { recursive: true })
    writeFileSync(join(dir, `skills.${hash}.svg`), sprite)
    nuxt.hook('nitro:config', (config) => {
      config.publicAssets ||= []
      config.publicAssets.push({ dir, baseURL: '/sprites', maxAge: 31536000 })
    })
    nuxt.options.appConfig.skillsSprite = `/sprites/skills.${hash}.svg`
  },
})
