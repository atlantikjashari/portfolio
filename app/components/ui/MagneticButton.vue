<script setup lang="ts">
/** Button/link that is gently pulled towards the cursor (desktop, motion allowed only). */
const props = withDefaults(
  defineProps<{
    to?: string
    href?: string
    variant?: 'primary' | 'ghost'
    strength?: number
    download?: boolean | string
    external?: boolean
    type?: 'button' | 'submit'
    disabled?: boolean
  }>(),
  { variant: 'primary', strength: 0.35, type: 'button' },
)

const el = ref<HTMLElement | null>(null)
// works for both plain elements and NuxtLink (component instance -> $el)
const setEl = (r: unknown) => {
  el.value = (r && typeof r === 'object' && '$el' in r ? (r as { $el: HTMLElement }).$el : r) as HTMLElement | null
}
const inner = ref<HTMLElement | null>(null)
const { reducedMotion, finePointer } = useMotion()

function onMove(e: PointerEvent) {
  if (!finePointer.value || reducedMotion.value || !el.value) return
  const r = el.value.getBoundingClientRect()
  const x = (e.clientX - (r.left + r.width / 2)) * props.strength
  const y = (e.clientY - (r.top + r.height / 2)) * props.strength
  el.value.style.transform = `translate3d(${x}px, ${y}px, 0)`
  if (inner.value) inner.value.style.transform = `translate3d(${x * 0.35}px, ${y * 0.35}px, 0)`
}
function onLeave() {
  if (el.value) el.value.style.transform = ''
  if (inner.value) inner.value.style.transform = ''
}

const component = computed(() => (props.to ? resolveComponent('NuxtLink') : props.href ? 'a' : 'button'))
const attrs = computed(() => {
  if (props.to) return { to: props.to }
  if (props.href)
    return {
      href: props.href,
      ...(props.download ? { download: props.download === true ? '' : props.download } : {}),
      ...(props.external ? { target: '_blank', rel: 'noopener noreferrer' } : {}),
    }
  return { type: props.type, disabled: props.disabled }
})
</script>

<template>
  <component
    :is="component"
    :ref="setEl"
    v-bind="attrs"
    :class="['btn', variant === 'primary' ? 'btn-primary' : 'btn-ghost', 'transition-transform duration-500 ease-[cubic-bezier(.16,1,.3,1)] will-change-transform disabled:opacity-60 disabled:pointer-events-none']"
    @pointermove="onMove"
    @pointerleave="onLeave"
  >
    <span ref="inner" class="inline-flex items-center gap-2 transition-transform duration-500 ease-[cubic-bezier(.16,1,.3,1)]">
      <slot />
    </span>
  </component>
</template>
