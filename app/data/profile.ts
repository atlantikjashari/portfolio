// Single source of truth for personal info. Everything here comes from the CV
// (cv-atlantik-jashari.pdf) or details Atlantik confirmed.
export const profile = {
  name: 'Atlantik Jashari',
  firstName: 'Atlantik',
  title: 'Software Engineer',
  location: 'Pristina, Kosovo',
  email: 'atlantik.jashari@gmail.com',
  phone: '+383 45 82 50 50',
  phoneHref: 'tel:+38345825050',
  github: 'https://github.com/atlantikjashari',
  linkedin: 'https://www.linkedin.com/in/atlantikjashari',
  cvUrl: '/cv-atlantik-jashari.pdf',
  pitch: 'I build scalable, maintainable, high-performance web applications, keeping UX/UI at the center of development.',
  summary: [
    'Detail-oriented Software Engineer with 3+ years of experience building scalable, maintainable, and high-performance web applications.',
    'Proficient in TypeScript, React/Next.js, Vue/Nuxt and GraphQL, with hands-on backend experience in Django, Django REST Framework, NestJS and Hasura.',
    'A team player who bridges front-end and back-end efficiently while keeping UX/UI at the center of development, with a strong focus on clean code, performance optimization, mentoring, and continuous improvement.',
  ],
  // TODO: add a photo at /public/images/atlantik.webp and set this to '/images/atlantik.webp'
  photo: '' as string,
} as const

export const education = {
  degree: 'Computer Science and Engineering',
  school: 'UBT',
  period: '2019 – 2023',
}
