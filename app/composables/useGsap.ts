import type { gsap as GsapType } from 'gsap'
import type { ScrollTrigger as ScrollTriggerType } from 'gsap/ScrollTrigger'

interface GsapBundle {
  gsap: typeof GsapType
  ScrollTrigger: typeof ScrollTriggerType
}

let loader: Promise<GsapBundle> | null = null
let engaged: Promise<void> | null = null

/** Resolves on the visitor's first scroll / touch / pointer / key input. */
function firstEngagement(): Promise<void> {
  if (!engaged) {
    engaged = new Promise((resolve) => {
      if (scrollY > 0) return resolve() // reloaded mid-page or opened with a #hash
      const events = ['scroll', 'wheel', 'touchstart', 'pointerdown', 'keydown'] as const
      const go = () => {
        events.forEach((e) => removeEventListener(e, go))
        resolve()
      }
      events.forEach((e) => addEventListener(e, go, { passive: true, once: true }))
    })
  }
  return engaged
}

/**
 * Lazy-loads GSAP + ScrollTrigger once, on first engagement: everything they animate is reached by
 * scrolling, so ~110 KB of JS stays off the initial load (and off the main thread on phones).
 */
export function loadGsap(): Promise<GsapBundle> {
  if (!loader) {
    loader = firstEngagement().then(() => Promise.all([import('gsap'), import('gsap/ScrollTrigger')])).then(([g, st]) => {
      const gsap = g.gsap ?? g.default
      gsap.registerPlugin(st.ScrollTrigger)
      return { gsap, ScrollTrigger: st.ScrollTrigger }
    })
  }
  return loader
}

/**
 * Animates every `[data-reveal]` element inside `root` into view on scroll.
 * Optional `data-reveal="left|right|scale"` changes the entrance direction.
 */
export function useReveal(root: Ref<HTMLElement | null>) {
  let ctx: { revert: () => void } | null = null

  onMounted(async () => {
    const el = root.value
    if (!el) return
    let targets = Array.from(el.querySelectorAll<HTMLElement>('[data-reveal]'))
    if (el.hasAttribute('data-reveal')) targets.unshift(el)
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      targets.forEach((t) => (t.style.opacity = '1'))
      return
    }
    try {
      const { gsap, ScrollTrigger } = await loadGsap()
      // Once the pre-paint hiding has lapsed, content already on screen stays put (no re-hide flash).
      if (!document.documentElement.classList.contains('reveal-ready')) {
        targets = targets.filter((t) => t.getBoundingClientRect().top > innerHeight)
      }
      if (!targets.length) return
      ctx = gsap.context(() => {
        const from = (t: HTMLElement) => {
          const kind = t.dataset.reveal
          if (kind === 'left') return { x: -40, y: 0 }
          if (kind === 'right') return { x: 40, y: 0 }
          if (kind === 'scale') return { scale: 0.92, y: 10 }
          return { y: 28 }
        }
        targets.forEach((t) => gsap.set(t, { opacity: 0, ...from(t) }))
        ScrollTrigger.batch(targets, {
          start: 'top 88%',
          once: true,
          onEnter: (batch) =>
            gsap.to(batch, {
              opacity: 1,
              x: 0,
              y: 0,
              scale: 1,
              duration: 0.8,
              ease: 'expo.out',
              // big batches (e.g. skill grids) share a fixed total stagger instead of queueing for seconds
              stagger: batch.length > 6 ? { amount: 0.45 } : 0.07,
              overwrite: true,
            }),
        })
      }, el)
    } catch {
      targets.forEach((t) => (t.style.opacity = '1'))
    } finally {
      document.documentElement.classList.remove('reveal-ready')
    }
  })

  onBeforeUnmount(() => ctx?.revert())
}
