/** Tracks which page section is currently in view (for navbar highlighting). */
export function useActiveSection(ids: string[]) {
  const active = ref<string>('')
  let observer: IntersectionObserver | null = null

  onMounted(() => {
    const visible = new Map<string, number>()
    observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) visible.set(e.target.id, e.isIntersecting ? e.intersectionRatio : 0)
        let best = ''
        let bestRatio = 0
        for (const id of ids) {
          const r = visible.get(id) ?? 0
          if (r > bestRatio) {
            best = id
            bestRatio = r
          }
        }
        if (best) active.value = best
      },
      { rootMargin: '-35% 0px -55% 0px', threshold: [0, 0.01, 0.25, 0.5, 1] },
    )
    for (const id of ids) {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    }
  })

  onBeforeUnmount(() => observer?.disconnect())
  return active
}
