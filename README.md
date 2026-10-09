# edgeorgie-portfolio

Personal portfolio site for Edwin Jorge (edgeorgie) — software engineer at Mercado Libre.

Live: https://edgeorgie-portfolio.vercel.app

## Stack

- Next.js 16 (App Router, Turbopack)
- TypeScript
- Tailwind CSS v4
- Framer Motion (scroll-triggered reveals, micro-interactions)
- Deployed on Vercel

## What's on it

- **Hero** — positioning line, rotating role ticker.
- **Projects** — the 3 real shipped agent-native artifacts (triage-desk, eval-lab,
  repoask-mcp), each with real stats (accuracy, pass rate, latency) pulled from their
  own repos' committed benchmark files, and real links to repos/PRs/Actions runs.
- **Experience** — Mercado Libre, Vansa, Freelance, sourced from the real resume only.
- **Live GitHub stats** (`/api/github-stats`) — server route that calls the GitHub REST
  API at request time for the 3 project repos (stars, last-pushed timestamp), proving
  the site is wired to live data, not a static snapshot.
- **Contact** — email + GitHub.

No invented metrics anywhere — every number traces back to a committed BENCHMARKS.md /
ACCURACY.md / real Actions run in the respective project repo.

## Local dev

```bash
npm install
npm run dev
```

Note: if your shell has a global `NODE_ENV=production`, `npm install` will silently skip
devDependencies (including `typescript`). Run `unset NODE_ENV` first, or
`npm install --include=dev`.

## Deploy

```bash
npx vercel deploy --prod
```
