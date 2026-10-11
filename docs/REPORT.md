# Portfolio audit, redesign and engineering pass — final report

Branch `feature/great-turing-juuvkt`, 2026-10-11. Baseline findings and
evidence are in `docs/AUDIT.md`; this document records what changed, how it
was verified, and what is left.

## 1. Executive summary

The site keeps its identity (dark, lime accent, terminal motif, "real
evidence only" stance) and gains an editorial typographic system, projects
presented as case studies with real previews, a skills "character sheet"
backed by evidence instead of self-rated bars, a console with offline slash
commands on top of the live MCP engine, and the SEO/security/accessibility
plumbing a production site needs. Every critical and high finding from the
audit is fixed except two that need the owner (job-title consistency and a
WhatsApp number), and one external action (the GitHub profile link).

Measured on the same machine, same build pipeline, same Lighthouse version:

| Metric | Before | After |
| --- | --- | --- |
| Lighthouse mobile performance | 44 | **90–95** (3 runs) |
| Lighthouse desktop performance | 90 | **100** |
| Mobile LCP / TBT / CLS | 4.2 s / 700 ms / 0.80 | 2.6–3.4 s / 140–150 ms / **0** |
| Desktop LCP / TBT / CLS | 0.9 s / 10 ms / 0.197 | 0.7 s / 0–20 ms / **0** |
| Mobile main-thread work | 5.3 s | 2.6–2.9 s |
| JS for modern browsers on `/` (gzip) | 332 KB | **191 KB** (−42%) |
| Best practices | 96 | 100 |
| axe violations (WCAG 2.x A/AA) | 2 serious | 0 |
| Elements server-rendered at `opacity:0` | 48 | 0 |
| Security headers | HSTS only | CSP, nosniff, DENY, Referrer-Policy, Permissions-Policy, COOP, HSTS |
| Unit tests | 9 | 28 |
| End-to-end tests | 0 | 26 (13 specs × desktop + mobile) |

## 2. Audit findings: fixed vs. remaining

Fixed (see `docs/AUDIT.md` for the evidence behind each):

- **C1** `metadataBase` pointed at a 404 domain → resolved from `NEXT_PUBLIC_SITE_URL` / `VERCEL_PROJECT_PRODUCTION_URL` / the real production URL; canonical and `og:url` emitted.
- **C2** hero and nav invisible without JS, LCP gated on hydration → hero is a server component with CSS entrances; the headline animation is transform-only so it paints on the first frame.
- **C3** CLS 0.80 → terminal reserves its height, the rotating role ticker is gone, nothing re-centres: CLS 0 on both presets.
- **C4** posthog-js shipped to everyone with no key → `src/lib/analytics.ts` facade; the SDK is dynamically imported only when a key exists; `track()` is a no-op otherwise.
- **C5** no security headers → `next.config.ts` sets CSP (+ `unsafe-eval` only in development), `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, COOP, HSTS; `poweredByHeader: false`.
- **C6** design tokens never compiled (`text-fg-dim`, `bg-bg-soft` were no-ops; all text was full white) → tokens registered in `@theme`, utilities verified in the built CSS.
- **H1** no OG image / robots / sitemap / JSON-LD → generated `opengraph-image.tsx` (1200×630, build-time), `robots.ts`, `sitemap.ts` (static), Person + WebSite JSON-LD, `summary_large_image` card.
- **H2** broken `github.com/edgeorgie/simplescope` link → removed; the card links to the live app only (see Remaining).
- **H3** LinkedIn absent → in header, hero, contact, footer and `/contact`; WhatsApp wired to `NEXT_PUBLIC_WHATSAPP_NUMBER` and hidden until set.
- **H5** zero-star "live stats" section and client fetch on every view → removed; a per-card "last push" line comes from a server-side `use cache` fetch (`cacheLife('hours')`), renders nothing on failure, never throws.
- **H6** accessibility → skip link, global `:focus-visible` ring, labelled console input, `role="log"` + `aria-live` transcript, diagram is a labelled `group` (not `img`), focusable scrollable regions, Escape closes the menu and returns focus, visible-text/accessible-name match, dot nav after `<main>` in DOM order, all JS loops honour reduced motion (CSS loops are neutralised globally).
- **H7** stale copy (fictional `progress-log.txt`, non-existent case studies, wrong project count, numbering 01/02/03/05/04/04, nav order) → copy rewritten against the real corpus; numbering and nav derive from one `sections` list; the hero transcript is a real response captured from the live API.
- **H8** eager react-markdown, `filter: blur(140px)` glows, blend-mode grain, JS-driven particle animations, per-character React re-renders → lazy markdown (`React.lazy`), gradient glows, static grain, CSS dash-offset flow lines, pure-CSS typewriter, `content-visibility: auto` on below-fold sections, framer-motion reduced to `LazyMotion` + `domAnimation`, `Reveal` no longer remounts the whole subtree after hydration (a defect found during e2e).
- **H9** API hardening → `question` 3–500 chars, `topK` 1–8 integer, 4 KB body cap, 413/400/429/502/504 responses, upstream error bodies no longer echoed, `Cache-Control: no-store`.
- Medium: analytics persistence without cookies; README/env docs rewritten; Dependabot config; CI runs e2e; stale create-next-app SVGs removed; `scroll-padding-top` for anchors under the fixed header.

Remaining (need the owner or are outside this repo):

1. **Job title.** The site says "Senior Software Engineer"; the committed résumé and GitHub bio say "Software Engineer". Not changed; it is one constant in `src/lib/site.ts` (`person.title`). Decide and align the résumé, LinkedIn and site.
2. **WhatsApp.** No number is published anywhere, so none was added. Set `NEXT_PUBLIC_WHATSAPP_NUMBER` (E.164 digits) in Vercel and the button appears in Contact and `/contact`.
3. **simplescope source.** The repository is not public under that name. If it exists privately or under another name, add an evidence link in `src/data/content.ts`.
4. **GitHub profile "Portfolio" link** points at `edgeorgie.vercel.app` (404). Change it to `https://edgeorgie-portfolio.vercel.app` or add that domain to the Vercel project.
5. **Vercel env.** Optionally set `NEXT_PUBLIC_SITE_URL`, `GITHUB_TOKEN` (raises the GitHub API limit for the "last push" line) and the PostHog keys. Everything works without them.
6. **Playwright in CI** installs Chromium on every run (`npx playwright install --with-deps chromium`); cache it if CI minutes matter.

## 3. Design rationale

**Direction.** Keep the operator-console identity and make it editorial: Instrument Serif (regular + italic) for display headings with the key phrase italicised in lime, Inter for reading, JetBrains Mono for data, labels and the console. Chapter headers carry a mono numeral derived from page order, a rule and a serif title. Surfaces are three tiers (bg, bg-soft, raised panel) with one accent; colour is used for meaning (lime = live/ok, amber = priority, rose = error, sky = info/npm).

**Order.** Hero → Work → Skills → Experience → How I use AI → Console → Beyond → Contact. The recruiter's questions are answered in sequence; the console is one scroll later but reachable from the hero CTA and the nav, and its most useful content is also a single `/projects` command.

**Motion.** Entrances are CSS (no-JS visible, no LCP penalty, no CLS). Scroll reveals are CSS transitions driven by one shared IntersectionObserver. framer-motion is kept only for stateful expand/collapse. Every loop respects `prefers-reduced-motion` (checked in JS for JS loops, neutralised in CSS for CSS loops). The hero grid has a scroll-timeline parallax as progressive enhancement.

**Gaming layer, kept honest.** Three mechanics, all optional and all made of real data:
- *Character sheet* (Skills): class/spec/level/base rows, capability groups, and "Unlocked" achievements with a source link each. No invented levels or percentages: a filled dot means production use, a project name means readable code.
- *Console*: slash commands (`/help`, `/projects`, `/skills`, `/experience`, `/contact`, `/mcp`, `/whoami`, `/clear`, and a `/sudo` easter egg) run offline; free text goes to the live MCP engine. Keyboard-first, `role="log"`, nothing gated behind it.
- *Explored counter* on the workflow diagram ("n of 14 nodes explored") stays as a light progress cue.

Rejected: a navigable world, loading screens, custom cursors, a mandatory quest flow. They would make recruiters work harder for the same information.

## 4. Content strategy

Added: problem / role / architecture / challenges per project (behind a native `<details>`), re-selected stats with sub-labels, evidence links typed by kind, an experiments row (agentlens, codereel, errorlens, recall-local, descriptions taken from their GitHub pages), a skills taxonomy from the résumé with evidence mapping, nine sourced achievements, leadership entries from the résumé, availability and timezone, a real API transcript in the hero.

Rewritten: hero lede (56 words of rotating claims → one concrete paragraph plus four facts), every section header, AskMe copy (now names the four real corpus files), project taglines, the Mercado Libre summary.

Removed: the standalone live-stats section, the role ticker, "case studies"/`progress-log.txt` references, "Four real projects" over six cards, duplicated tap/collapse copy fields, `get_story`-less tool list (now four tools, per the README).

Not changed: any number, employer, date or claim. The only new numbers (npm v0.6.0 / 7 versions, 42 tests / 9 files, 19 lessons, 4 tools, `claude-haiku-4-5`) were read from the npm registry, the project READMEs, the live app and the live API on 2026-10-11.

## 5. Implementation summary

- `src/app/globals.css` — tokens in `@theme`, base, focus, skip link, typography helpers, surfaces, buttons, chips, disclosure, keyframes, reveal, typewriter, content-visibility, reduced motion.
- `next.config.ts` — security headers, image formats, no `X-Powered-By`.
- `src/lib/site.ts` — site URL, person, links (incl. env-driven WhatsApp), `sections` (single source for order, nav, numbering).
- `src/lib/analytics.ts`, `instrumentation-client.ts`, `src/components/Analytics.tsx` — lazy, key-gated analytics.
- `src/lib/github.ts`, `src/components/RepoActivity.tsx` — `use cache` GitHub fetch + deterministic date.
- `src/lib/console.ts` — slash commands (pure, tested).
- `src/app/layout.tsx` — fonts, metadata, viewport, JSON-LD, skip link, `MotionProvider`.
- `src/app/opengraph-image.tsx`, `robots.ts`, `sitemap.ts`.
- `src/app/api/ask-me/route.ts` — validation, limits, rate limit (exported for tests).
- `src/data/content.ts` — projects as case studies, experiments, experience, leadership, skills, achievements, principles, timeline.
- Components: `Hero` (server) + `HeroTerminal` (server, CSS typewriter), `SectionHeader`, `Projects` (server) + `ProjectCard` (server) + `ProjectPreviews` (client), `Skills` (server), `Experience` (server), `AIWorkflow`, `AskMe` (console) + `StreamingAnswer` + `AnswerMarkdown` (lazy), `Beyond`, `Contact` + `LocalTime` + `CopyButton`, `Nav`, `SectionNav`, `Reveal`, `Icon`, `MotionProvider`.
- Removed: `LiveStats.tsx`, `PostHogPageview.tsx`, `api/github-stats`, create-next-app SVGs.
- Dependencies: + `@playwright/test`, `@axe-core/playwright`, `playwright-core` (dev, pinned to one version). No new runtime dependencies.
- Tests: `src/lib/console.test.ts`, `src/lib/site.test.ts`, `src/app/api/ask-me/route.test.ts`, `e2e/portfolio.spec.ts`, `playwright.config.ts`; existing AskMe/StreamingAnswer tests still pass against the lazy markdown.
- CI: lint → build → typecheck → unit → prod audit → Playwright e2e on a production build; Dependabot for npm and actions.

## 6. Testing report

Conditions: Node 22.22 in the sandbox (CI uses 24), `next build` + `next start` on localhost, Chromium 1194 via Playwright 1.56.1, Lighthouse 13 with default throttling (mobile: Moto G Power class, 4× CPU slowdown, slow 4G; desktop preset). GitHub's API is blocked from this sandbox, so the "last push" line renders nothing here and its success path is exercised only by unit tests of the formatter and by production.

| Check | Result |
| --- | --- |
| `npm run lint` | pass |
| `npm run build` (includes TypeScript) | pass; `/` static (revalidate 1h), `/robots.txt`, `/sitemap.xml`, `/opengraph-image` static, `/api/ask-me` dynamic |
| `npm run typecheck` | pass |
| `npm test` | 28/28 (5 files) |
| `npm run e2e` | 26/26: section order and numbering, no console errors, no-JS visibility, contact links in 3 places, anchors resolve, external links safe, case-study disclosure, console commands, skip link + focus + Escape, reduced motion, no horizontal overflow, metadata/robots/sitemap/OG, security headers, API validation, axe (WCAG 2.x A/AA) on desktop and Pixel 7 |
| `npm audit --omit=dev --audit-level=high` | 0 vulnerabilities (5 high remain in the dev-only `eslint-config-next` subtree, unchanged) |
| Dev-mode console (hydration) | 0 warnings/errors |
| Lighthouse | see §1; raw JSON kept in the session scratchpad |
| Manual | keyboard walk-through, 390/768/1280/1920 screenshots, section-by-section review on desktop and mobile |

Variance note: mobile Lighthouse scores moved between 81 and 95 across builds and runs in this container; the three final runs on the final build were 95, 93, 90. LCP varies with the display-font swap (2.6–3.4 s).

Page length: 390 px wide went from 16,715 px to 18,045 px. The old page was six text walls; the new one carries previews, stats and disclosures per project. Below-fold sections use `content-visibility: auto` so the extra length costs nothing at load.

## 7. Recommended next steps

1. Resolve the title mismatch and set the WhatsApp number (five-minute owner tasks with outsized credibility effect).
2. Add a real screenshot or short clip for triage-desk (the bot's PR comment) and crispy-profiling (a CLI report), captured from the real tools, to replace the schematic previews.
3. Write one long-form case study page (e.g. ask-edgeorgie-mcp: retrieval design, guardrails, verification) and link it from the card; the card structure already anticipates it.
4. Add `useReportWebVitals` → analytics once PostHog is enabled, to get field data instead of lab scores.
5. Consider `display: optional` for Instrument Serif only on the OG/print paths, or subsetting it further, if field LCP on 3G matters.
6. Publish agentlens under `@edgeorgie/agentlens` and promote it from "experiments" once it has a version with real pricing tables.
