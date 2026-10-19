<script setup lang="ts">
useHead({ title: 'Backend Lab' })
useSeoMeta({
  description:
    'Live Django REST Framework demos: contact API, projects API, guestbook, cached analytics, API explorer, JWT auth, OpenAPI docs and health checks.',
})

const { base, ensureAwake } = useApi()
const token = ref<string | null>(null)
const root = ref<HTMLElement | null>(null)
useReveal(root)

onMounted(() => ensureAwake())

const toc = [
  { id: 'contact-api', label: 'Contact API' },
  { id: 'projects-api', label: 'Projects API' },
  { id: 'guestbook', label: 'Guestbook' },
  { id: 'stats', label: 'Live stats' },
  { id: 'explorer', label: 'API explorer' },
  { id: 'auth', label: 'JWT auth' },
  { id: 'docs', label: 'API docs' },
  { id: 'health', label: 'Health' },
  { id: 'tests', label: 'Tests & CI' },
]

const stack = ['Django 5.2', 'Django REST Framework', 'SimpleJWT', 'drf-spectacular', 'PostgreSQL (Neon)', 'WhiteNoise', 'gunicorn', 'Render']
const testFiles = [
  { file: 'test_contact.py', what: 'validation, honeypot, accepted-only 429 throttling, Resend notification (mocked)' },
  { file: 'test_projects.py', what: 'ordering, publish flag, featured filter, detail' },
  { file: 'test_guestbook.py', what: 'pagination, link moderation, validation, honeypot' },
  { file: 'test_core.py', what: 'health (zero DB queries), stats caching, hashed visitors, OpenAPI' },
  { file: 'test_auth.py', what: 'JWT login/refresh, 401s, demo user rights, superuser bootstrap' },
]
// TODO: update if you name the backend repository differently on GitHub
const repoUrl = 'https://github.com/atlantikjashari/portfolio-api'
</script>

<template>
  <div ref="root" class="pt-28 pb-24">
    <div class="container-x">
      <!-- above the fold: no scroll reveal, so the LCP text paints immediately -->
      <header class="max-w-3xl">
        <p class="eyebrow flex items-center gap-3"><Icon name="lucide:flask-conical" class="h-4 w-4" /> Backend Lab</p>
        <h1 class="mt-4 text-4xl font-bold text-white sm:text-6xl">
          A real API, <span class="text-gradient">running live.</span>
        </h1>
        <p class="mt-5 text-lg leading-relaxed text-muted">
          Every widget on this page talks to my <strong class="text-fg">Django REST Framework</strong> backend. Nothing is mocked: you see the actual request, status code, timing and JSON response.
        </p>
        <div class="mt-6 flex flex-wrap gap-1.5">
          <span v-for="s in stack" :key="s" class="chip">{{ s }}</span>
        </div>
        <p class="mt-4 font-mono text-xs text-muted">API: <a :href="`${base}/api/`" target="_blank" rel="noopener noreferrer" class="break-all text-cyan hover:underline">{{ base }}/api/</a></p>
      </header>

      <nav class="mt-10 flex gap-2 overflow-x-auto pb-2" aria-label="Backend Lab features">
        <a v-for="(t, i) in toc" :key="t.id" :href="`#${t.id}`" class="chip shrink-0 !px-3 !py-1.5 hover:!text-white">
          <span class="text-cyan">{{ String(i + 1).padStart(2, '0') }}</span> {{ t.label }}
        </a>
      </nav>

      <div class="sticky top-20 z-30 mt-6">
        <LabWakeBanner />
      </div>

      <div class="mt-8 space-y-8">
        <LabDemosContactDemo />
        <LabDemosProjectsDemo />
        <LabDemosGuestbookDemo />
        <LabDemosStatsDemo />
        <LabDemosApiExplorer :token="token" @token="token = $event" />
        <LabDemosAuthDemo v-model:token="token" />

        <LabFeature id="docs" index="07" title="Auto-generated API docs" :endpoints="['GET /api/docs/', 'GET /api/redoc/', 'GET /api/schema/']" hide-exchange>
          <template #explain>
            <p><strong>drf-spectacular</strong> introspects the serializers and views to generate an <strong>OpenAPI 3</strong> schema, served through Swagger UI and ReDoc. Request and response shapes, throttles and auth stay in sync with the code automatically.</p>
          </template>
          <div class="grid gap-3 sm:grid-cols-3">
            <a v-for="d in [
              { href: `${base}/api/docs/`, icon: 'simple-icons:swagger', label: 'Swagger UI', sub: 'try requests' },
              { href: `${base}/api/redoc/`, icon: 'lucide:book-open', label: 'ReDoc', sub: 'reference' },
              { href: `${base}/api/schema/`, icon: 'simple-icons:openapiinitiative', label: 'OpenAPI', sub: 'raw YAML' },
            ]" :key="d.label" :href="d.href" target="_blank" rel="noopener noreferrer" class="glass group rounded-2xl p-5 transition-colors hover:bg-white/[0.07]">
              <Icon :name="d.icon" class="h-6 w-6 text-cyan" />
              <p class="mt-3 font-semibold text-white">{{ d.label }} <Icon name="lucide:arrow-up-right" class="inline h-4 w-4 opacity-50 group-hover:opacity-100" /></p>
              <p class="font-mono text-xs text-muted">{{ d.sub }}</p>
            </a>
          </div>
        </LabFeature>

        <LabDemosHealthDemo />

        <LabFeature id="tests" index="09" title="Tests & CI" :endpoints="['pytest', 'GitHub Actions']" hide-exchange>
          <template #explain>
            <p>The API is covered by <strong>37 pytest tests</strong> (pytest-django + DRF's <code>APIClient</code>). On every push, a <strong>GitHub Actions</strong> workflow runs them on Python 3.13 and 3.14 against a real <strong>PostgreSQL 17</strong> service container. It also runs <code>manage.py check --deploy</code> and checks that no migrations are missing.</p>
            <p><strong>Task queues:</strong> the Coursera specialization covered background jobs with <strong>Celery + Redis</strong>. The free hosting tier has no worker processes, so here the email notification runs in a lightweight background thread after the database commit. With a paid worker it would be a Celery task.</p>
          </template>
          <ul class="space-y-2 font-mono text-xs">
            <li v-for="t in testFiles" :key="t.file" class="flex gap-3 rounded-xl border border-line bg-white/[0.02] px-3 py-2">
              <Icon name="lucide:check" class="h-4 w-4 shrink-0 text-ok" />
              <span><span class="text-white">{{ t.file }}</span> <span class="text-muted">· {{ t.what }}</span></span>
            </li>
          </ul>
          <a :href="`${repoUrl}/actions`" target="_blank" rel="noopener noreferrer" class="btn btn-ghost !py-2">
            <Icon name="simple-icons:githubactions" class="h-4 w-4" /> View CI runs
          </a>
        </LabFeature>
      </div>
    </div>
  </div>
</template>
