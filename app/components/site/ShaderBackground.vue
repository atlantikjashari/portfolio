<script setup lang="ts">
/**
 * Full-screen WebGL shader background (~3 KB, no Three.js).
 * - loads only after the browser is idle
 * - renders at reduced resolution, capped at ~40 fps, pauses when the tab is hidden
 * - disabled (CSS gradient fallback only) for reduced motion, low-end devices, or no WebGL
 */
const canvas = ref<HTMLCanvasElement | null>(null)
const active = ref(false)
const { reducedMotion, lowEnd } = useMotion()

const VERT = `attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}`
const FRAG = `
precision mediump float;
uniform vec2 r;uniform float t;uniform vec2 m;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
  return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<4;i++){v+=a*n(p);p=p*2.03+vec2(1.7,9.2);a*=.5;}return v;}
void main(){
  vec2 uv=gl_FragCoord.xy/r;vec2 q=(gl_FragCoord.xy-.5*r)/r.y;
  float tt=t*.04;
  vec2 w=vec2(fbm(q*1.6+tt),fbm(q*1.6-tt+4.3));
  float f=fbm(q*1.3+w*1.8+(m-.5)*.25);
  vec3 cyan=vec3(.13,.83,.93),vio=vec3(.65,.55,.98),pink=vec3(.96,.45,.71),ink=vec3(.02,.024,.04);
  vec3 c=mix(ink,vio*.55,smoothstep(.35,.85,f));
  c=mix(c,cyan*.6,smoothstep(.55,.95,w.x)*.55);
  c=mix(c,pink*.5,smoothstep(.6,1.,w.y)*.35);
  // perspective grid floor
  float hz=.32;
  if(uv.y<hz){float d=(hz-uv.y);vec2 g=vec2((uv.x-.5)/d*.18,1./d*.06+t*.05);
    vec2 gl=abs(fract(g*6.)-.5)/fwidth(g*6.);float line=1.-min(min(gl.x,gl.y),1.);
    c+=cyan*line*.28*smoothstep(0.,.3,d)*(1.-smoothstep(.05,.32,d)*.6);}
  float vig=smoothstep(1.25,.25,length(q));
  c*=mix(.35,1.,vig);
  c=mix(ink,c,.62);
  gl_FragColor=vec4(c,1.);
}`

let raf = 0
let cleanup: (() => void) | null = null

function start() {
  const el = canvas.value
  if (!el) return
  const gl = el.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power' })
  if (!gl || !gl.getExtension('OES_standard_derivatives')) return

  const compile = (type: number, src: string) => {
    const s = gl.createShader(type)!
    gl.shaderSource(s, src)
    gl.compileShader(s)
    return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null
  }
  const vs = compile(gl.VERTEX_SHADER, VERT)
  const fs = compile(gl.FRAGMENT_SHADER, '#extension GL_OES_standard_derivatives : enable\n' + FRAG)
  if (!vs || !fs) return
  const prog = gl.createProgram()!
  gl.attachShader(prog, vs)
  gl.attachShader(prog, fs)
  gl.linkProgram(prog)
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return
  gl.useProgram(prog)

  const buf = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buf)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
  const loc = gl.getAttribLocation(prog, 'p')
  gl.enableVertexAttribArray(loc)
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)
  const uR = gl.getUniformLocation(prog, 'r')
  const uT = gl.getUniformLocation(prog, 't')
  const uM = gl.getUniformLocation(prog, 'm')

  const scale = Math.min(devicePixelRatio, 1.5) * 0.6
  const resize = () => {
    el.width = Math.floor(innerWidth * scale)
    el.height = Math.floor(innerHeight * scale)
    gl.viewport(0, 0, el.width, el.height)
  }
  resize()

  const mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 }
  const onMove = (e: PointerEvent) => {
    mouse.tx = e.clientX / innerWidth
    mouse.ty = 1 - e.clientY / innerHeight
  }

  let last = 0
  const t0 = performance.now()
  const frame = (now: number) => {
    raf = requestAnimationFrame(frame)
    if (now - last < 25) return // ~40 fps cap
    last = now
    mouse.x += (mouse.tx - mouse.x) * 0.05
    mouse.y += (mouse.ty - mouse.y) * 0.05
    gl.uniform2f(uR, el.width, el.height)
    gl.uniform1f(uT, (now - t0) / 1000)
    gl.uniform2f(uM, mouse.x, mouse.y)
    gl.drawArrays(gl.TRIANGLES, 0, 3)
  }
  const onVisibility = () => {
    cancelAnimationFrame(raf)
    if (!document.hidden) raf = requestAnimationFrame(frame)
  }

  addEventListener('resize', resize, { passive: true })
  addEventListener('pointermove', onMove, { passive: true })
  document.addEventListener('visibilitychange', onVisibility)
  raf = requestAnimationFrame(frame)
  active.value = true

  cleanup = () => {
    cancelAnimationFrame(raf)
    removeEventListener('resize', resize)
    removeEventListener('pointermove', onMove)
    document.removeEventListener('visibilitychange', onVisibility)
    gl.getExtension('WEBGL_lose_context')?.loseContext()
  }
}

onMounted(() => {
  const go = () => {
    if (!reducedMotion.value && !lowEnd.value) start()
  }
  if ('requestIdleCallback' in window) window.requestIdleCallback(go, { timeout: 3000 })
  else setTimeout(go, 1500)
})

watch(reducedMotion, (rm) => {
  if (rm && cleanup) {
    cleanup()
    cleanup = null
    active.value = false
  }
})

onBeforeUnmount(() => cleanup?.())
</script>

<template>
  <div class="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
    <!-- CSS fallback: always present, the shader fades in on top when available -->
    <div class="absolute inset-0 bg-ink" />
    <!-- soft color glows as radial gradients (no blur filter, no transforms): cheap to paint on
         phones and never a layout shift -->
    <div class="glows absolute inset-0" />
    <canvas
      ref="canvas"
      class="absolute inset-0 h-full w-full transition-opacity duration-[1500ms]"
      :class="active ? 'opacity-100' : 'opacity-0'"
    />
    <div class="bg-grid absolute inset-0 opacity-60" />
    <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_top,transparent_40%,rgb(5_6_10/0.85))]" />
  </div>
</template>

<style scoped>
.glows {
  background:
    radial-gradient(circle 40rem at 9rem 9rem, rgb(167 139 250 / 0.2), transparent 70%),
    radial-gradient(circle 34rem at calc(100% - 8rem) 29rem, rgb(34 211 238 / 0.15), transparent 70%),
    radial-gradient(circle 28rem at calc(25% + 20rem) 100%, rgb(244 114 182 / 0.1), transparent 70%);
}
</style>
