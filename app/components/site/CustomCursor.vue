<script setup lang="ts">
/** Desktop-only cursor: exact-position dot + trailing ring that grows over interactive elements. */
const dot = ref<HTMLElement | null>(null)
const ring = ref<HTMLElement | null>(null)
const enabled = ref(false)
const { reducedMotion, finePointer } = useMotion()

let raf = 0
const pos = { x: -100, y: -100, rx: -100, ry: -100 }
let hovering = false
let pressed = false

function onMove(e: PointerEvent) {
  if (e.pointerType !== 'mouse') return
  pos.x = e.clientX
  pos.y = e.clientY
  const t = e.target as HTMLElement | null
  hovering = !!t?.closest('a, button, [role="button"], input, textarea, select, label, [data-cursor="hover"]')
}
const onDown = () => (pressed = true)
const onUp = () => (pressed = false)
const onLeave = () => {
  pos.x = pos.y = -100
}

function loop() {
  pos.rx += (pos.x - pos.rx) * 0.18
  pos.ry += (pos.y - pos.ry) * 0.18
  if (dot.value) dot.value.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0) translate(-50%, -50%)`
  if (ring.value) {
    const s = (hovering ? 1.8 : 1) * (pressed ? 0.8 : 1)
    ring.value.style.transform = `translate3d(${pos.rx}px, ${pos.ry}px, 0) translate(-50%, -50%) scale(${s})`
    ring.value.style.borderColor = hovering ? 'rgb(167 139 250 / 0.9)' : 'rgb(34 211 238 / 0.6)'
  }
  raf = requestAnimationFrame(loop)
}

function enable() {
  enabled.value = true
  document.documentElement.classList.add('has-custom-cursor')
  addEventListener('pointermove', onMove, { passive: true })
  addEventListener('pointerdown', onDown)
  addEventListener('pointerup', onUp)
  document.addEventListener('pointerleave', onLeave)
  raf = requestAnimationFrame(loop)
}
function disable() {
  enabled.value = false
  document.documentElement.classList.remove('has-custom-cursor')
  removeEventListener('pointermove', onMove)
  removeEventListener('pointerdown', onDown)
  removeEventListener('pointerup', onUp)
  document.removeEventListener('pointerleave', onLeave)
  cancelAnimationFrame(raf)
}

onMounted(() => {
  watch(
    [finePointer, reducedMotion],
    ([fine, rm]) => {
      if (fine && !rm && !enabled.value) enable()
      else if ((!fine || rm) && enabled.value) disable()
    },
    { immediate: true },
  )
})
onBeforeUnmount(disable)
</script>

<template>
  <div v-if="enabled" aria-hidden="true">
    <div ref="dot" class="pointer-events-none fixed left-0 top-0 z-[100] h-1.5 w-1.5 rounded-full bg-cyan shadow-[0_0_12px_2px_rgb(34_211_238/0.8)]" />
    <div
      ref="ring"
      class="pointer-events-none fixed left-0 top-0 z-[100] h-9 w-9 rounded-full border transition-[border-color] duration-200 mix-blend-screen"
    />
  </div>
</template>
