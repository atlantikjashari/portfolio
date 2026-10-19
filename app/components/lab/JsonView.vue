<script setup lang="ts">
/** Pretty, syntax-highlighted JSON (tiny tokenizer, no dependency). Escapes everything before highlighting. */
const props = withDefaults(defineProps<{ value: unknown; maxHeight?: string }>(), { maxHeight: '22rem' })

const escape = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

const html = computed(() => {
  const text = typeof props.value === 'string' ? props.value : JSON.stringify(props.value, null, 2) ?? 'undefined'
  if (typeof props.value === 'string') return escape(text)
  return escape(text).replace(
    /("(?:\\u[a-fA-F0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(?:true|false|null)\b|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/g,
    (m) => {
      let cls = 'text-lime' // number
      if (m.startsWith('"')) cls = m.trimEnd().endsWith(':') ? 'text-violet' : 'text-cyan'
      else if (m === 'true' || m === 'false') cls = 'text-pink'
      else if (m === 'null') cls = 'text-muted'
      return `<span class="${cls}">${m}</span>`
    },
  )
})

const copied = ref(false)
async function copy() {
  try {
    await navigator.clipboard.writeText(typeof props.value === 'string' ? props.value : JSON.stringify(props.value, null, 2))
    copied.value = true
    setTimeout(() => (copied.value = false), 1200)
  } catch {
    /* clipboard not available */
  }
}
</script>

<template>
  <div class="group relative">
    <button
      class="absolute right-2 top-2 rounded-md border border-line bg-ink/80 px-2 py-1 font-mono text-[10px] text-muted opacity-0 transition-opacity hover:text-white focus:opacity-100 group-hover:opacity-100"
      :aria-label="copied ? 'Copied' : 'Copy JSON'"
      @click="copy"
    >
      {{ copied ? 'copied' : 'copy' }}
    </button>
    <!-- eslint-disable-next-line vue/no-v-html -- content is escaped above -->
    <pre class="overflow-auto rounded-xl bg-black/40 p-4 font-mono text-[12px] leading-relaxed text-fg/90" :style="{ maxHeight }" v-html="html" />
  </div>
</template>
