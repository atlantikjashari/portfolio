# Atlantik Jashari: portfolio

My personal site: a one-page portfolio plus a **Backend Lab** (`/backend`) where
every widget calls my live Django REST Framework API
([portfolio-api](https://github.com/atlantikjashari/portfolio-api)).

**Stack:** Nuxt 4 (fully static via `nuxt generate`) · TypeScript · Tailwind CSS v4 ·
GSAP + ScrollTrigger · a hand-written WebGL shader background (no Three.js) ·
pdf.js · `@nuxt/fonts` (self-hosted Space Grotesk, Inter, JetBrains Mono) · `@nuxt/icon`

## Pages and sections

- **`/`**: Hero (typing/glitch title) → About → Skills → Experience timeline → Projects
  (tilt cards, loaded from the API with a static fallback) → Certifications → CV
  (pdf.js viewer with zoom and page controls on desktop, image + download on mobile) →
  Contact (form posts to the API; phone, e-mail and social links)
- **`/backend`**: Backend Lab: contact API, projects API, guestbook, live stats,
  terminal-style API explorer, JWT auth demo, OpenAPI docs links, health check, tests and CI
- **404** page, sitemap, robots.txt, Open Graph image, favicons, JSON-LD

## Performance and accessibility

Measured with Lighthouse 13 on the static build (5 runs each):

| | Performance | Accessibility | Best practices | SEO |
|---|---|---|---|---|
| Mobile `/` | 93 | 100 | 100 | 100 |
| Mobile `/backend` | 92–94 | 100 | 100 | 100 |
| Desktop (both) | 98–100 | 100 | 100 | 100 |

How the site stays fast with this many effects:
- **Pre-rendered HTML with inlined CSS:** no render-blocking stylesheet.
  `server/plugins/inline-entry-css.ts` disables the duplicate `<link>`.
- **Lazy hydration:** sections below the hero hydrate shortly before they scroll into view (`pages/index.vue`).
- **GSAP on demand:** GSAP loads on the first scroll or touch. Everything it animates is reached by scrolling anyway.
- **Shader only when it's cheap:** the WebGL shader starts when the browser is idle, runs at reduced resolution capped at about 40 fps, and pauses in hidden tabs. It's off on phones, low-end devices and with `prefers-reduced-motion`; a CSS gradient replaces it.
- **Skill logos from a sprite:** they're one hashed, cached SVG sprite built at build time (`modules/skills-sprite.ts`), not inline SVG.
- **Desktop-only blur:** backdrop blur only runs on desktop. The custom cursor and magnetic buttons only run on fine pointers.
- **Reduced motion:** `prefers-reduced-motion` turns off the shader, scroll reveals, typing/glitch effect and cursor.

**Cold starts:** the free backend sleeps when idle. `composables/useApi.ts` adds a timeout, retries
with backoff and a "Waking up the server…" banner. The API is warmed when the page is idle
(`plugins/api-wake.client.ts`). If it stays down, every section falls back to static
content and the page never breaks.

## Local setup

Requires Node 22+ (see `.nvmrc`).

```bash
npm install
cp .env.example .env     # point NUXT_PUBLIC_API_BASE at your API
npm run dev              # http://localhost:3000
npm run build            # static site in .output/public
npm run preview          # serve the build
npm run typecheck
```

Run the backend locally too (see its README) or set `NUXT_PUBLIC_API_BASE` to the
deployed API. Without an API, the site still works on its static fallbacks.

## Environment variables

Both are baked in **at build time** (the site is static), so redeploy after changing them.

| Variable | Example | Purpose |
|---|---|---|
| `NUXT_PUBLIC_API_BASE` | `https://portfolio-api.onrender.com` | Django API base URL, no trailing slash |
| `NUXT_PUBLIC_SITE_URL` | `https://atlantik-portfolio.pages.dev` | canonical URLs, Open Graph, sitemap |

## Deploy: Cloudflare Pages (free)

Free tier checked on 16 Oct 2026: 500 builds a month, 20,000 files, no listed bandwidth cap.

1. Push this folder to its own GitHub repo, e.g. `atlantikjashari/portfolio`:
   ```bash
   git init && git add . && git commit -m "Portfolio frontend"
   git branch -M main
   git remote add origin https://github.com/atlantikjashari/portfolio.git
   git push -u origin main
   ```
2. In the Cloudflare dashboard, go to **Workers & Pages → Create → Pages → Connect to Git** and pick the repo.
3. Build settings:
   - Framework preset: **Nuxt.js**
   - Build command: `npm run build`
   - Build output directory: `.output/public`
   - Environment variables (Production *and* Preview):
     `NUXT_PUBLIC_API_BASE` = your Render URL, `NUXT_PUBLIC_SITE_URL` = your Pages URL, `NODE_VERSION` = `22`
4. **Save and Deploy.** The project name sets the URL (`<name>.pages.dev`). With the name
   `atlantik-portfolio` you get `https://atlantik-portfolio.pages.dev`.
5. On Render, set the backend's `CORS_ALLOWED_ORIGINS` to that exact URL. To let preview
   deploys work too, also set `CORS_ALLOWED_ORIGIN_REGEX`.
6. Optional: add a custom domain under **Custom domains**, then update
   `NUXT_PUBLIC_SITE_URL` here and `CORS_ALLOWED_ORIGINS` on Render, and redeploy.

`public/_headers` sets security headers and long-term caching for hashed assets on Cloudflare.

## Updating content

| What | Where |
|---|---|
| Name, title, pitch, contact info, photo | `app/data/profile.ts` |
| Experience | `app/data/experience.ts` |
| Skills (icons are Iconify names, built into the sprite) | `app/data/skills.ts` |
| Projects (static fallback; the live list is edited in Django admin) | `app/data/projects.ts` |
| Certifications | `app/data/certifications.ts` |
| CV PDF / preview image | `public/cv-atlantik-jashari.pdf`, `public/cv-preview.jpg` |
| OG image / icon sources | `scripts/brand/` |

## Structure

```
app/
  pages/            index.vue (one-page site), backend.vue (Backend Lab)
  components/
    sections/       Hero, About, Skills, Experience, Projects, Certifications, Cv, Contact
    lab/            Backend Lab feature panels and demo widgets
    site/           NavBar, ShaderBackground, CustomCursor, ApiStatusPill, SiteFooter
    ui/             GlitchTyping, MagneticButton, TiltCard, SectionHeading
  composables/      useApi (retries + cold start), useGsap (lazy GSAP + reveals), useMotion, useActiveSection
  data/             all content (from the CV)
  plugins/          api-wake.client.ts
modules/            skills-sprite.ts (build-time SVG sprite)
server/             robots.txt, sitemap.xml, inline-CSS plugin
public/             CV PDF, OG image, favicons, _headers
```
