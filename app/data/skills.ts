export interface Skill {
  name: string
  icon: string
}

export interface SkillGroup {
  id: string
  title: string
  blurb: string
  skills: Skill[]
}

// Only skills backed by the CV, the confirmed work history, or this portfolio's own code.
export const skillGroups: SkillGroup[] = [
  {
    id: 'frontend',
    title: 'Frontend',
    blurb: 'SSR-first apps, type-safe state, reusable component systems.',
    skills: [
      { name: 'TypeScript', icon: 'simple-icons:typescript' },
      { name: 'JavaScript', icon: 'simple-icons:javascript' },
      { name: 'React', icon: 'simple-icons:react' },
      { name: 'Next.js', icon: 'simple-icons:nextdotjs' },
      { name: 'Vue.js', icon: 'simple-icons:vuedotjs' },
      { name: 'Nuxt', icon: 'simple-icons:nuxt' },
      { name: 'Pinia', icon: 'simple-icons:pinia' },
      { name: 'Refine.dev', icon: 'simple-icons:refine' },
      { name: 'MUI', icon: 'simple-icons:mui' },
      { name: 'Ant Design', icon: 'simple-icons:antdesign' },
      { name: 'Tailwind CSS', icon: 'simple-icons:tailwindcss' },
      { name: 'GSAP / WebGL', icon: 'simple-icons:gsap' },
    ],
  },
  {
    id: 'backend',
    title: 'Backend',
    blurb: 'APIs, data layers and the glue between them.',
    skills: [
      { name: 'Python', icon: 'simple-icons:python' },
      { name: 'Django', icon: 'simple-icons:django' },
      { name: 'Django REST Framework', icon: 'lucide:server-cog' },
      { name: 'REST APIs', icon: 'simple-icons:openapiinitiative' },
      { name: 'GraphQL', icon: 'simple-icons:graphql' },
      { name: 'Hasura', icon: 'simple-icons:hasura' },
      { name: 'NestJS', icon: 'simple-icons:nestjs' },
      { name: 'PostgreSQL', icon: 'simple-icons:postgresql' },
      { name: 'JWT Auth', icon: 'simple-icons:jsonwebtokens' },
      { name: 'Laravel', icon: 'simple-icons:laravel' },
      { name: 'Celery / Redis (course)', icon: 'simple-icons:celery' },
    ],
  },
  {
    id: 'tools',
    title: 'Tools & Platforms',
    blurb: 'Testing, delivery and the Microsoft data stack.',
    skills: [
      { name: 'Git', icon: 'simple-icons:git' },
      { name: 'GitHub Actions', icon: 'simple-icons:githubactions' },
      { name: 'Jest', icon: 'simple-icons:jest' },
      { name: 'pytest', icon: 'simple-icons:pytest' },
      { name: 'Swagger / OpenAPI', icon: 'simple-icons:swagger' },
      { name: 'Power Apps', icon: 'simple-icons:powerapps' },
      { name: 'SharePoint SPFx', icon: 'simple-icons:microsoftsharepoint' },
      { name: 'Atomic Design', icon: 'lucide:atom' },
    ],
  },
]
