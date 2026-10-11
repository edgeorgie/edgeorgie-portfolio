# edgeorgie-portfolio

Personal portfolio for Edwin Jorge (edgeorgie), software engineer at Mercado Libre.

Live: https://www.itsedgeorgie.dev (the `edgeorgie-portfolio.vercel.app` alias redirects there)

## Stack

- Next.js 16 (App Router, Cache Components, Turbopack) · React 19 · TypeScript
- Tailwind CSS v4 with the design tokens registered in `src/app/globals.css`
- framer-motion (`LazyMotion` + `domAnimation`, only for stateful interactions); entrances are CSS
- Vitest + Testing Library (unit), Playwright + axe-core (e2e)
- Vercel Web Analytics + Speed Insights (rendered only when `VERCEL` is set at build time)
- Deployed on Vercel

## What's on it

Section order (`src/lib/site.ts` drives the header nav, dot nav and numbering):

1. **Hero** — positioning, GitHub/LinkedIn/contact in the first screen, a real API transcript.
2. **Work** — six public projects as case studies (problem, role, architecture, challenges, stats, evidence links), with a "last push" line fetched server-side from the GitHub API through `use cache`.
3. **Skills** — a character sheet: capabilities grouped by what they let me do, each marked as used in production (Mercado Libre) or in a public project; "unlocked" achievements, each with a source link.
4. **Experience** — sourced from the résumé only.
5. **How I use AI** — the operator/builder workflow diagram and nine principles.
6. **Console** — an embedded terminal. Slash commands (`/help`, `/projects`, `/skills`, `/contact`, …) run offline; anything else is proxied to the live [ask-edgeorgie-mcp](https://github.com/edgeorgie/ask-edgeorgie-mcp) engine via `/api/ask-me` and answered with file:line citations.
7. **Beyond the code** — a tap-to-reveal timeline.
8. **Contact** — email, LinkedIn, GitHub and WhatsApp.

No invented metrics anywhere: every number traces back to a committed benchmark, a CI run, the npm registry or a live URL. `docs/AUDIT.md` records the audit that shaped the current version.

## Local dev

```bash
npm install
npm run dev
```

Note: if your shell has a global `NODE_ENV=production`, `npm install` will silently skip
devDependencies. Run `unset NODE_ENV` first, or `npm install --include=dev`.

## Configuration (all optional)

Copy `.env.local.example` to `.env.local`.

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Canonical origin for metadata/OG/sitemap. Defaults to `https://www.itsedgeorgie.dev`. |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Overrides the WhatsApp number (digits; `+`, spaces and dashes are stripped). The owner's number is the code default. |
| `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST` | Product analytics. Unset → the SDK is never downloaded. |
| `GITHUB_TOKEN` (server only) | Raises the GitHub API rate limit for the "last push" line. Never sent to the client. |

## Scripts

```bash
npm run build      # production build (also runs TypeScript)
npm run lint       # eslint
npm run typecheck  # tsc --noEmit (run after a build: Next generates route types)
npm test           # vitest unit tests
npm run e2e        # Playwright against a production build on :3100
```

The e2e suite needs Chromium: `npx playwright install --with-deps chromium` once.

## Security notes

- `next.config.ts` sets CSP, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, COOP and HSTS. The page is statically prerendered, so `script-src` must allow `'unsafe-inline'` for Next.js's inlined RSC payload; the policy still pins `connect-src`, `img-src`, `font-src`, forbids plugins, framing and base-URI changes.
- `/api/ask-me` validates `question` (3–500 chars) and `topK` (1–8), caps the body at 4 KB, rate-limits 10 req/min per IP in memory, and never echoes upstream error bodies.

## Deploy

```bash
npx vercel deploy --prod
```
