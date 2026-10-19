export default defineEventHandler((event) => {
  const { siteUrl } = useRuntimeConfig().public
  const urls = ['/', '/backend']
  setHeader(event, 'content-type', 'application/xml; charset=utf-8')
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${siteUrl}${u === '/' ? '/' : u}</loc></url>`).join('\n')}
</urlset>
`
})
