export interface Certification {
  title: string
  issuer: string
  date: string
  url?: string
  description?: string
  highlight?: boolean
}

export const certifications: Certification[] = [
  {
    title: 'Advanced Django: Mastering Django and Django Rest Framework',
    issuer: 'Coursera (Codio)',
    date: 'October 2026',
    url: 'https://www.coursera.org/specializations/codio-advanced-django-and-django-rest-framework',
    description:
      '4-course specialization: building a blog with Django, Django REST Framework, advanced DRF with testing and React integration, external APIs and task queuing with Celery/Redis.',
    highlight: true,
  },
  {
    title: 'Python Advanced',
    issuer: 'Innovation Centre Kosovo',
    date: '2021',
  },
  {
    title: 'Python Programming',
    issuer: 'Innovation Centre Kosovo',
    date: '2020',
  },
]
