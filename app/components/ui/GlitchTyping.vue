<script setup lang="ts">
/** Types the text once, then glitches every few seconds. Screen readers get the full text immediately. */
const props = withDefaults(defineProps<{ text: string; speed?: number; glitchEvery?: number }>(), {
  speed: 70,
  glitchEvery: 4200,
})

const shown = ref(props.text) // SSR / no-JS / reduced motion: full text
const typing = ref(false)
const glitching = ref(false)
let timers: ReturnType<typeof setTimeout>[] = []
let interval: ReturnType<typeof setInterval> | undefined

onMounted(() => {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
  shown.value = ''
  typing.value = true
  ;[...props.text].forEach((_, i) => {
    timers.push(setTimeout(() => (shown.value = props.text.slice(0, i + 1)), 450 + i * props.speed))
  })
  timers.push(
    setTimeout(() => {
      typing.value = false
      const glitch = () => {
        glitching.value = true
        timers.push(setTimeout(() => (glitching.value = false), 460))
      }
      glitch()
      interval = setInterval(() => !document.hidden && glitch(), props.glitchEvery)
    }, 500 + props.text.length * props.speed),
  )
})

onBeforeUnmount(() => {
  timers.forEach(clearTimeout)
  timers = []
  clearInterval(interval)
})
</script>

<template>
  <span>
    <span class="sr-only">{{ text }}</span>
    <span aria-hidden="true" class="glitch" :class="{ 'is-glitching': glitching }" :data-text="shown">{{ shown }}</span>
    <span v-if="typing" class="caret" aria-hidden="true" />
  </span>
</template>
