/** Reactive motion/device preferences used to switch heavy effects off gracefully. */
export function useMotion() {
  const reducedMotion = useState('reduced-motion', () => false)
  const finePointer = useState('fine-pointer', () => false)
  const lowEnd = useState('low-end', () => true) // assume low-end until measured on the client

  onMounted(() => {
    const rm = matchMedia('(prefers-reduced-motion: reduce)')
    const fp = matchMedia('(pointer: fine) and (hover: hover)')
    const update = () => {
      reducedMotion.value = rm.matches
      finePointer.value = fp.matches
    }
    update()
    rm.addEventListener('change', update)
    fp.addEventListener('change', update)

    const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } }
    const cores = nav.hardwareConcurrency ?? 4
    const memory = nav.deviceMemory ?? 8
    const saveData = nav.connection?.saveData ?? false
    lowEnd.value = saveData || cores <= 4 || memory <= 4 || (!fp.matches && innerWidth < 768)

    onBeforeUnmount(() => {
      rm.removeEventListener('change', update)
      fp.removeEventListener('change', update)
    })
  })

  return { reducedMotion, finePointer, lowEnd }
}
