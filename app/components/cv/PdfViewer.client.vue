<script setup lang="ts">
/**
 * Embedded PDF viewer (pdf.js), desktop only. Loaded lazily when the CV section scrolls into view.
 * Renders one page at a time into a canvas at device-pixel resolution, with page + zoom controls.
 */
import type { PDFDocumentLoadingTask, PDFDocumentProxy, RenderTask } from 'pdfjs-dist'

const props = defineProps<{ src: string }>()

const canvas = ref<HTMLCanvasElement | null>(null)
const frame = ref<HTMLElement | null>(null)
const page = ref(1)
const pages = ref(0)
const zoom = ref(1)
const loading = ref(true)
const error = ref('')

let loadingTask: PDFDocumentLoadingTask | null = null
let doc: PDFDocumentProxy | null = null
let task: RenderTask | null = null

async function render() {
  if (!doc || !canvas.value || !frame.value) return
  task?.cancel()
  const p = await doc.getPage(page.value)
  const base = p.getViewport({ scale: 1 })
  const fit = (frame.value.clientWidth - 2) / base.width
  const viewport = p.getViewport({ scale: fit * zoom.value })
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  const c = canvas.value
  c.width = Math.floor(viewport.width * dpr)
  c.height = Math.floor(viewport.height * dpr)
  c.style.width = `${Math.floor(viewport.width)}px`
  c.style.height = `${Math.floor(viewport.height)}px`
  task = p.render({ canvas: c, viewport, transform: dpr !== 1 ? [dpr, 0, 0, dpr, 0, 0] : undefined })
  try {
    await task.promise
  } catch (e) {
    if ((e as Error)?.name !== 'RenderingCancelledException') throw e
  }
}

onMounted(async () => {
  try {
    const pdfjs = await import('pdfjs-dist')
    const worker = await import('pdfjs-dist/build/pdf.worker.min.mjs?url')
    pdfjs.GlobalWorkerOptions.workerSrc = worker.default
    loadingTask = pdfjs.getDocument({ url: props.src })
    doc = await loadingTask.promise
    pages.value = doc.numPages
    loading.value = false
    await nextTick()
    await render()
  } catch {
    loading.value = false
    error.value = 'The PDF preview could not be loaded. Use the buttons to open or download it.'
  }
})

watch([page, zoom], () => render())

let resizeTimer: ReturnType<typeof setTimeout>
const onResize = () => {
  clearTimeout(resizeTimer)
  resizeTimer = setTimeout(render, 150)
}
onMounted(() => addEventListener('resize', onResize, { passive: true }))
onBeforeUnmount(() => {
  removeEventListener('resize', onResize)
  task?.cancel()
  loadingTask?.destroy()
})

const prev = () => page.value > 1 && page.value--
const next = () => page.value < pages.value && page.value++
const zoomIn = () => (zoom.value = Math.min(2.5, +(zoom.value + 0.25).toFixed(2)))
const zoomOut = () => (zoom.value = Math.max(0.5, +(zoom.value - 0.25).toFixed(2)))
const onKey = (e: KeyboardEvent) => {
  if (e.key === 'ArrowLeft') prev()
  else if (e.key === 'ArrowRight') next()
  else if (e.key === '+' || e.key === '=') zoomIn()
  else if (e.key === '-') zoomOut()
}
</script>

<template>
  <div class="glass overflow-hidden rounded-2xl">
    <div class="flex flex-wrap items-center justify-between gap-2 border-b border-line px-3 py-2 font-mono text-xs text-muted">
      <div class="flex items-center gap-1" role="group" aria-label="Pages">
        <button class="rounded-lg p-2 hover:bg-white/10 disabled:opacity-30" :disabled="page <= 1" aria-label="Previous page" @click="prev">
          <Icon name="lucide:chevron-left" class="h-4 w-4" />
        </button>
        <span aria-live="polite">Page {{ page }} / {{ pages || '–' }}</span>
        <button class="rounded-lg p-2 hover:bg-white/10 disabled:opacity-30" :disabled="page >= pages" aria-label="Next page" @click="next">
          <Icon name="lucide:chevron-right" class="h-4 w-4" />
        </button>
      </div>
      <div class="flex items-center gap-1" role="group" aria-label="Zoom">
        <button class="rounded-lg p-2 hover:bg-white/10 disabled:opacity-30" :disabled="zoom <= 0.5" aria-label="Zoom out" @click="zoomOut">
          <Icon name="lucide:zoom-out" class="h-4 w-4" />
        </button>
        <button class="w-14 rounded-lg py-1 hover:bg-white/10" aria-label="Reset zoom" @click="zoom = 1">{{ Math.round(zoom * 100) }}%</button>
        <button class="rounded-lg p-2 hover:bg-white/10 disabled:opacity-30" :disabled="zoom >= 2.5" aria-label="Zoom in" @click="zoomIn">
          <Icon name="lucide:zoom-in" class="h-4 w-4" />
        </button>
      </div>
    </div>
    <div
      ref="frame"
      class="relative max-h-[80vh] min-h-[480px] overflow-auto bg-[#1a1d27] p-0 focus:outline-none"
      tabindex="0"
      aria-label="CV preview. Use arrow keys to change page and plus or minus to zoom."
      @keydown="onKey"
    >
      <div v-if="loading" class="shimmer absolute inset-0 grid place-items-center font-mono text-xs text-muted">Loading PDF…</div>
      <p v-else-if="error" class="p-6 text-sm text-muted">{{ error }}</p>
      <canvas ref="canvas" class="mx-auto block bg-white shadow-2xl" :class="{ hidden: loading || error }" />
    </div>
  </div>
</template>
