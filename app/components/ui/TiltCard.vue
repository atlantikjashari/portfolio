<script setup lang="ts">
/** 3D tilt + moving glare on hover (fine pointers with motion allowed only). */
const props = withDefaults(defineProps<{ max?: number; as?: string }>(), { max: 8, as: 'div' })
const el = ref<HTMLElement | null>(null)
const glare = ref<HTMLElement | null>(null)
const { reducedMotion, finePointer } = useMotion()
let raf = 0

function onMove(e: PointerEvent) {
  if (!finePointer.value || reducedMotion.value || !el.value) return
  const r = el.value.getBoundingClientRect()
  const px = (e.clientX - r.left) / r.width
  const py = (e.clientY - r.top) / r.height
  cancelAnimationFrame(raf)
  raf = requestAnimationFrame(() => {
    if (!el.value) return
    el.value.style.transform = `perspective(900px) rotateX(${(0.5 - py) * props.max}deg) rotateY(${(px - 0.5) * props.max}deg) translateZ(0)`
    if (glare.value) {
      glare.value.style.opacity = '1'
      glare.value.style.background = `radial-gradient(500px circle at ${px * 100}% ${py * 100}%, rgb(255 255 255 / 0.10), transparent 45%)`
    }
  })
}
function onLeave() {
  cancelAnimationFrame(raf)
  if (el.value) el.value.style.transform = ''
  if (glare.value) glare.value.style.opacity = '0'
}
</script>

<template>
  <component
    :is="as"
    ref="el"
    class="glass glow-border relative rounded-2xl transition-transform duration-500 ease-[cubic-bezier(.16,1,.3,1)] [transform-style:preserve-3d] will-change-transform"
    @pointermove="onMove"
    @pointerleave="onLeave"
  >
    <div ref="glare" class="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300" aria-hidden="true" />
    <slot />
  </component>
</template>
