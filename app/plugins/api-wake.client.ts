/**
 * Starts waking the API as soon as the page is idle (free hosts sleep), then records an anonymous
 * page view for the Live Stats demo. Never blocks rendering and silently gives up if the API is down.
 */
export default defineNuxtPlugin(() => {
  const router = useRouter()
  const { request, ensureAwake } = useApi()

  const idle = (cb: () => void) =>
    'requestIdleCallback' in window ? window.requestIdleCallback(cb, { timeout: 2500 }) : setTimeout(cb, 1200)

  const trackView = async (path: string) => {
    const key = `pv:${path}`
    try {
      if (sessionStorage.getItem(key)) return
      sessionStorage.setItem(key, '1')
    } catch {
      /* storage blocked: still count once per load */
    }
    await request('/api/stats/hit/', { method: 'POST', body: { path }, retries: 1 })
  }

  idle(async () => {
    if (await ensureAwake()) trackView(router.currentRoute.value.path)
  })

  router.afterEach((to, from) => {
    if (to.path !== from.path) idle(() => trackView(to.path))
  })
})
