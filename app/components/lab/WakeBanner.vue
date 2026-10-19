<script setup lang="ts">
/** Cold-start UX: animated "waking up" state with elapsed time, then a friendly offline message. */
const { state, wakeStartedAt } = useApiState()
const { ensureAwake } = useApi()
const elapsed = ref(0)
let timer: ReturnType<typeof setInterval> | undefined

onMounted(() => {
  timer = setInterval(() => {
    elapsed.value = wakeStartedAt.value ? Math.round((Date.now() - wakeStartedAt.value) / 1000) : 0
  }, 500)
})
onBeforeUnmount(() => clearInterval(timer))

const progress = computed(() => Math.min(95, (elapsed.value / 60) * 100))
</script>

<template>
  <Transition
    enter-active-class="transition duration-500 ease-out"
    enter-from-class="opacity-0 -translate-y-2"
    leave-active-class="transition duration-300"
    leave-to-class="opacity-0"
  >
    <div
      v-if="state === 'waking' || state === 'offline'"
      class="glass relative overflow-hidden rounded-2xl p-4 sm:p-5"
      :class="state === 'offline' ? 'border-err/30' : 'border-warn/30'"
      role="status"
      aria-live="polite"
    >
      <template v-if="state === 'waking'">
        <div class="flex items-center gap-4">
          <div class="relative h-10 w-10 shrink-0" aria-hidden="true">
            <span class="absolute inset-0 animate-ping rounded-full bg-warn/30" />
            <span class="absolute inset-2 grid place-items-center rounded-full bg-warn/20">
              <Icon name="lucide:power" class="h-4 w-4 text-warn" />
            </span>
          </div>
          <div class="min-w-0">
            <p class="font-semibold text-white">Waking up the server… <span class="font-mono text-sm text-muted">{{ elapsed }}s</span></p>
            <p class="text-sm text-muted">
              The API runs on a free instance that sleeps after 15 minutes without traffic. A cold start takes about 30–60 seconds; requests will go through automatically.
            </p>
          </div>
        </div>
        <div class="mt-4 h-1 overflow-hidden rounded-full bg-white/5">
          <div class="h-full rounded-full bg-gradient-to-r from-warn to-cyan transition-[width] duration-500" :style="{ width: `${progress}%` }" />
        </div>
      </template>
      <template v-else>
        <div class="flex flex-wrap items-center gap-4">
          <Icon name="lucide:circle-alert" class="h-6 w-6 shrink-0 text-err" />
          <p class="min-w-0 flex-1 text-sm text-muted">
            <span class="font-semibold text-white">The API didn't wake up.</span> It may be redeploying or over its free-tier limits. The rest of the site works normally; the demos below will show their requests as failed.
          </p>
          <button class="btn btn-ghost !py-2" @click="ensureAwake(true)"><Icon name="lucide:refresh-cw" class="h-4 w-4" /> Retry</button>
        </div>
      </template>
    </div>
  </Transition>
</template>
