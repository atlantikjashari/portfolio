// Static fallback for the Projects section, used at build time and whenever the API is asleep/unreachable.
// Mirrors backend/apps/projects/migrations/0002_seed_projects.py. Once the API answers, its data replaces this.
export type ProjectStatus = 'live' | 'in_development' | 'private' | 'offline'

export interface Project {
  slug: string
  title: string
  company: string
  role: string
  period: string
  summary: string
  highlights: string[]
  tech: string[]
  status: ProjectStatus
  status_label?: string
  live_url: string
  repo_url: string
  featured?: boolean
  order: number
}

export const statusLabels: Record<ProjectStatus, string> = {
  live: 'Live',
  in_development: 'In development',
  private: 'Private / under NDA',
  offline: 'No longer online',
}

export const projects: Project[] = [
  {
    slug: 'pabau-clinic-crm',
    title: 'Pabau – Clinic CRM',
    company: 'Pabau Clinic Software',
    role: 'Software Engineer',
    period: 'Apr 2024 – Apr 2025',
    summary: 'All-in-one B2B practice-management CRM used by multiple clinics and medical spas. I worked across the whole stack.',
    highlights: [
      'Full-stack work: Next.js front end, GraphQL API with Hasura and NestJS resolvers',
      'Made complex clinic workflows feel simple for healthcare professionals',
      'Refined architectural decisions and mentored newer developers',
    ],
    tech: ['Next.js', 'React', 'TypeScript', 'GraphQL', 'Hasura', 'NestJS', 'Jest'],
    status: 'live',
    live_url: 'https://pabau.com/',
    repo_url: '',
    featured: true,
    order: 1,
  },
  {
    slug: 'learniverse',
    title: 'Learniverse',
    company: 'AnchorzUp (client project)',
    role: 'Frontend Developer',
    period: '2026 – present',
    summary: 'AI-powered career-learning platform: personalised learning paths, interview simulations and workplace role-play.',
    highlights: [
      'Work on both learniverse.world and the app at app.learniverse.world',
      'SSR-first front-end architecture with Vue/Nuxt and TypeScript',
    ],
    tech: ['Vue.js', 'Nuxt', 'TypeScript', 'Pinia'],
    status: 'live',
    live_url: 'https://app.learniverse.world/',
    repo_url: '',
    featured: true,
    order: 2,
  },
  {
    slug: 'hr-platform',
    title: 'Gamified HR Platform',
    company: 'AnchorzUp (internal product)',
    role: 'Frontend Developer',
    period: '2026 – present',
    summary: 'Internal all-in-one HR app for companies: gamified tasks, trainings, time attendance and task evaluation.',
    highlights: [
      'Gamified tasks and trainings',
      'Time attendance and task evaluation in one place',
      'Composition API, custom composables and Pinia for type-safe state',
    ],
    tech: ['Vue.js', 'Nuxt', 'TypeScript', 'Pinia'],
    status: 'in_development',
    live_url: '',
    repo_url: '',
    featured: true,
    order: 3,
  },
  {
    slug: 'budget-forecasting',
    title: 'Budgeting & Forecasting App',
    company: 'Aralytiks (client project)',
    role: 'Frontend Developer',
    period: 'Jun 2025 – Feb 2026',
    summary: 'Budgeting and forecasting application for a high-end client, with full-year graphs and dashboards.',
    highlights: [
      'Full-year budget and forecast graphs',
      'Interactive dashboards',
      'Role-based access control, filtering, sorting and drag-and-drop',
    ],
    tech: ['React', 'TypeScript', 'Refine.dev'],
    status: 'private',
    live_url: '',
    repo_url: '',
    featured: true,
    order: 4,
  },
  {
    slug: 'eventkickoff',
    title: 'Eventkickoff',
    company: 'Eventkickoff',
    role: 'Developer',
    period: 'Aug 2023 – Jul 2024',
    summary: 'Social platform for discovering events and meeting like-minded people.',
    highlights: ['Revamped event creation and registration flow', 'New features for more event types and better retention'],
    tech: ['Laravel', 'PHP'],
    status: 'live',
    live_url: 'https://eventkickoff.com/',
    repo_url: '',
    order: 5,
  },
  {
    slug: 'mybranda',
    title: 'myBranda',
    company: 'myBranda',
    role: 'Full Stack Developer',
    period: 'Jul 2023 – Jun 2024',
    summary: 'Helped scale the core product: React front end with Django backend work on bottlenecks and full-stack features.',
    highlights: ['React front end, Django backend', 'Product discussions, UX improvements and shipped updates'],
    tech: ['React', 'Django', 'Python'],
    status: 'offline',
    live_url: '',
    repo_url: '',
    order: 6,
  },
  {
    slug: 'portfolio-backend-lab',
    title: 'This Portfolio + Backend Lab',
    company: 'Personal project',
    role: 'Design & full-stack development',
    period: '2026',
    summary: 'Static Nuxt site with a WebGL background and a live Django REST Framework API you can test in the browser.',
    highlights: [
      'Contact API with throttling and honeypot spam protection',
      'Interactive API explorer, JWT auth demo, Swagger docs',
      'Tests with pytest and GitHub Actions CI',
    ],
    tech: ['Nuxt', 'TypeScript', 'Tailwind CSS', 'GSAP', 'WebGL', 'Django', 'DRF', 'PostgreSQL'],
    status: 'live',
    live_url: '',
    repo_url: 'https://github.com/atlantikjashari/portfolio-api',
    order: 7,
  },
]
