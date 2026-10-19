export interface Experience {
  company: string
  role: string
  period: string
  current?: boolean
  url?: string
  description: string
  highlights: string[]
  tech: string[]
}

// From the updated CV (newest first).
export const experience: Experience[] = [
  {
    company: 'AnchorzUp',
    role: 'Frontend Developer',
    period: 'Mar 2026 – Present',
    current: true,
    description:
      'Building scalable, SSR-first applications with Vue.js, Nuxt and TypeScript, using the Composition API, custom composables and Pinia for type-safe, predictable state management.',
    highlights: [
      'Developing an internal all-in-one HR platform: gamified tasks, trainings, time attendance and task evaluation',
      'Working on the client project Learniverse (learniverse.world and app.learniverse.world)',
      'Mentoring new employees joining the team',
    ],
    tech: ['Vue.js', 'Nuxt', 'TypeScript', 'Pinia'],
  },
  {
    company: 'Aralytiks',
    role: 'Frontend Developer',
    period: 'Jun 2025 – Feb 2026',
    description:
      'Built scalable and intuitive web apps using React, TypeScript and Refine.dev, with UI libraries like MUI and Ant Design.',
    highlights: [
      'Built a budgeting and forecasting application for a high-end client, with full-year graphs and interactive dashboards',
      'Structured projects with Atomic Design and implemented role-based access control',
      'Enhanced UX with filtering, sorting and drag-and-drop',
    ],
    tech: ['React', 'TypeScript', 'Refine.dev', 'MUI', 'Ant Design'],
  },
  {
    company: 'Pabau Clinic Software',
    role: 'Software Engineer',
    period: 'Apr 2024 – Apr 2025',
    url: 'https://pabau.com/',
    description:
      'Part of the team building Pabau, a B2B CRM used by multiple clinics to run their daily operations. I worked across the whole stack.',
    highlights: [
      'Front end in React (Next.js) and TypeScript; GraphQL with Hasura and NestJS resolvers on the back end; Jest for testing',
      'Led front-end efforts that made complex tasks feel simple for healthcare professionals',
      'Refined architectural decisions and mentored newer developers',
    ],
    tech: ['Next.js', 'React', 'TypeScript', 'GraphQL', 'Hasura', 'NestJS', 'Jest'],
  },
  {
    company: 'myBranda',
    role: 'Full Stack Developer',
    period: 'Jul 2023 – Jun 2024',
    description:
      'Helped scale the core product: built sleek, responsive React components and jumped into the Django backend to resolve bottlenecks and collaborate on full-stack features.',
    highlights: [
      'Involved in product discussions and UX improvements',
      'Shipped meaningful updates that users noticed',
    ],
    tech: ['React', 'Django', 'Python'],
  },
  {
    company: 'Eventkickoff',
    role: 'Developer',
    period: 'Aug 2023 – Jul 2024',
    url: 'https://eventkickoff.com/',
    description:
      'Made event planning smoother and more engaging: revamped the event creation and registration flow with Laravel.',
    highlights: [
      'Introduced features supporting a wider variety of event types',
      'Improved user retention and helped turn the platform into a community-driven experience',
    ],
    tech: ['Laravel', 'PHP'],
  },
  {
    company: 'Aralytiks',
    role: 'React Developer',
    period: 'Nov 2022 – Jul 2023',
    description:
      'Helped build data applications that teams actually wanted to use: custom React components and Power Apps tailored to real business needs.',
    highlights: [
      'Created several SharePoint web parts with SPFx that became essential to clients',
      'Turned raw data and complex logic into usable products',
    ],
    tech: ['React', 'Power Apps', 'SharePoint SPFx'],
  },
]
