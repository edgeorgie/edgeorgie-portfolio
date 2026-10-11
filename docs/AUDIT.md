# Portfolio audit — baseline findings (2026-10-11)

Scope: `edgeorgie-portfolio` at commit `88fa321` (main). Measured locally on a
production build (`next build && next start`) with Lighthouse 13 (Chromium
1194, default mobile throttling and desktop preset), axe-core (WCAG 2.x A/AA +
best-practice), Playwright at 390/768/1280/1920px, and manual code review of
every file. The live deployment at https://edgeorgie-portfolio.vercel.app was
probed for headers, metadata, and the API routes.

Legend — **Confirmed** = reproduced with a tool or in code. **Hypothesis** =
likely but not reproduced. **Design** = subjective recommendation.

## Baseline numbers (before)

| Check | Result |
| --- | --- |
| `next build` | pass, 14 s; `/` static, 2 dynamic API routes |
| `eslint` / `tsc --noEmit` / `vitest` | all pass (9 tests, 2 files) |
| `npm audit --omit=dev` | 0 vulnerabilities; 5 high in the dev-only `eslint-config-next → braces` chain |
| JS shipped on `/` | 1.20 MB raw / **372 KB gzip** across 9 chunks; CSS 37 KB raw / 8 KB gzip |
| Lighthouse mobile | **Performance 44**, A11y 100, Best practices 96, SEO 100 |
| Lighthouse desktop | Performance 90, A11y 100, Best practices 96, SEO 100 |
| Mobile LCP / TBT / CLS / TTI | **4.2 s / 700 ms / 0.80 / 4.3 s** |
| Desktop LCP / TBT / CLS | 0.9 s / 10 ms / **0.197** |
| Unused JS (Lighthouse) | 185 KB, of which posthog-js chunk 86 KB wasted of 100 KB |
| Main-thread work (mobile) | 5.3 s (script eval 2.2 s, style/layout 1.3 s) |
| axe violations | 2 serious (nested-interactive, scrollable-region-focusable) |
| Page height | 16,715 px at 390 px wide (≈20 screens); 12,145 px at 1280 px |
| Console errors | 1 per page load in this sandbox (`/api/github-stats` 500 because api.github.com is blocked here; the live route returns 200) |
| Hydration warnings (dev) | none |

## Critical

### C1 — `metadataBase` points at a dead domain (Confirmed)
`src/app/layout.tsx:28` sets `metadataBase` to `https://edgeorgie.vercel.app`,
which returns **404**. The live site is `https://edgeorgie-portfolio.vercel.app`.
Any absolute URL Next.js derives from it (OG image, canonical) would point to a
dead host. The GitHub profile's "Portfolio" link also points to the 404 domain
(outside this repo; manual action).

### C2 — Hero, nav and 46 other nodes are server-rendered at `opacity:0` (Confirmed)
`Hero.tsx` and `Nav.tsx` use framer-motion `initial={{ opacity: 0 }}`; the SSR
HTML contains 48 `opacity:0` inline styles. With JavaScript disabled the h1
computes to `opacity: 0`. With JS enabled, the LCP element cannot paint until
~370 KB of JS downloads, parses and hydrates: mobile LCP 4.2 s on a page whose
server response is 10 ms. The `Reveal` component already solved this correctly
(server snapshot = visible); the hero never adopted it.

### C3 — CLS 0.80 mobile / 0.20 desktop (Confirmed)
Lighthouse attributes two 0.40 shifts to `section#top > div.relative`. Cause:
the hero is `min-h-screen flex justify-center` and `TerminalBoot` types three
lines in one after another, growing the block and re-centring everything above
it. The role ticker ("shipping {role}") also re-wraps the paragraph every 2.2 s.

### C4 — posthog-js (100 KB gzip) ships to every visitor with no key configured (Confirmed)
`instrumentation-client.ts` statically imports `posthog-js`, and `AskMe.tsx`
and `PostHogPageview.tsx` import it too, so the 315 KB chunk is in the critical
bundle. The production HTML/JS contains no `phc_` key, so `posthog.init` never
runs: the largest chunk on the page is dead weight (Lighthouse: 86 KB of 100 KB
unused).

### C5 — No security headers beyond Vercel's HSTS (Confirmed)
Live response has no `Content-Security-Policy`, `X-Content-Type-Options`,
`Referrer-Policy`, `Permissions-Policy`, `X-Frame-Options`/`frame-ancestors`.
`X-Powered-By: Next.js` is exposed locally. The page is static, so a nonce-based
CSP is not available without giving up static rendering; a policy with
`script-src 'self' 'unsafe-inline'` still enforces `object-src`, `base-uri`,
`frame-ancestors`, `form-action`, `connect-src`, `img-src`, `font-src`.

### C6 — Design tokens `text-fg-dim`, `bg-bg-soft`, `font-mono` never compile (Confirmed)
`globals.css` registers only `--color-bg`, `--color-fg`, `--color-accent` in
`@theme`, and maps `--font-mono` to itself. The built CSS contains **zero**
rules for `.text-fg-dim` or `.bg-bg-soft`; computed colour of every "dim"
element is `#ededee` (full white) and every "soft" tile is transparent. The
entire secondary-text hierarchy the components were written for has never
rendered. (axe/Lighthouse contrast passes only because everything is white.)

## High

### H1 — Social sharing and discoverability gaps (Confirmed)
No `opengraph-image`, no `twitter:image` (card is `summary` with no image), no
canonical, no `robots.txt`, no `sitemap.xml`, no JSON-LD. Shares on LinkedIn,
Slack, X render as a bare title/description.

### H2 — Broken project link: `github.com/edgeorgie/simplescope` (Confirmed)
GitHub repository search for the account returns 0 results for "simplescope";
the live app https://simplescope-one.vercel.app works. The repo is private,
renamed, or deleted.

### H3 — LinkedIn and WhatsApp are absent (Confirmed)
The real profile https://www.linkedin.com/in/edgeorgie (listed on the GitHub
profile) appears nowhere on the site. No WhatsApp link exists and no phone
number is published anywhere (resume, FAQ, GitHub), so one must be supplied by
the owner, never invented.

### H4 — Title mismatch: "Senior Software Engineer" vs resume/GitHub "Software Engineer" (Confirmed, owner decision)
The committed resume (`resume.txt`) and GitHub bio both say "Software
Engineer"; the site says "Senior". A recruiter cross-checking will notice.
Not changed in this pass (title is the owner's claim to make); flagged.

### H5 — "Live from the GitHub API" advertises three zero-star repos (Confirmed)
The production route returns `stars: 0` for all three repos. The section's
purpose (prove live wiring) is undercut by what it shows, it costs a client
fetch on every visit, and it throws a console error whenever GitHub is
unreachable. Headline count is also wrong: "Four real, running projects" sits
above **six** projects.

### H6 — Accessibility defects (Confirmed)
- `WorkflowDiagram` wraps 14 `<button>`s in `role="img"`, which hides them
  from assistive tech (axe `nested-interactive`, serious).
- `<pre>` MCP config scrolls horizontally on mobile but is not focusable (axe
  `scrollable-region-focusable`, serious).
- AskMe `<input>` has `outline-none` and no replacement: no visible focus at all
  (WCAG 2.4.7). No site-wide `:focus-visible` style; UA default rings are
  near-invisible on the lime button.
- No skip link; on desktop the 7 dot-nav links precede the hero CTA in tab
  order.
- Mobile menu does not close on Escape.
- Framer-driven infinite animations (fan-out particles, arrow dots) ignore
  `prefers-reduced-motion` (the CSS safety net only covers CSS animations).
- Live-stats section has no `id`, heading, or label.

### H7 — Copy that no longer matches the real system (Confirmed)
- Hero terminal prints `citing resume.txt:1-24, progress-log.txt:289-318`;
  `progress-log.txt` is not in the corpus (corpus = `resume.txt`,
  `RELIABILITY-REPORT.md`, `BUILD-LOG.md`, `RECRUITER-FAQ.md`).
- AskMe copy promises "case studies" and colour-codes `case-study`/`progress-log`
  sources that do not exist.
- The live API reports `model: claude-haiku-4-5` and `answerMode: llm`; the
  copy's "Claude Haiku" is right but the mode caption is guessed until the
  first answer.
- Section numbering is 01, 02, 03, 05, 04, 04 in page order; header nav omits
  "Beyond the code" and lists sections in a different order from the page and
  from the dot nav.

### H8 — Performance: heavy effects and eager libraries (Confirmed / Hypothesis)
- `react-markdown` + remark/micromark (~50 KB gzip) is in the initial bundle for
  text that only exists after a visitor asks a question. (Confirmed in chunk)
- Two 500–600 px `filter: blur(120–140px)` glows and a fixed full-viewport
  `mix-blend-mode: overlay` SVG-noise layer force expensive compositing on
  every scroll on mobile GPUs. (Hypothesis, consistent with 1.3 s style/layout)
- 1283 ms scripting in the React/vendor chunk and a 527 ms long task from the
  page chunk on mobile. (Confirmed)
- Inter and JetBrains Mono are preloaded correctly via `next/font`.

### H9 — API hardening (Confirmed in code)
`/api/ask-me` validates `question` type and length ≥ 3 but has no maximum
length (a multi-MB body is forwarded upstream), forwards `topK` unvalidated,
and echoes 200 bytes of upstream error text to the client. The rate limiter is
in-memory per instance (documented; acceptable for this scale).

## Design and experience (Design)

- **Generic look.** Dark + neon + mono labels + glass panels is the default
  dev-portfolio aesthetic. Every section follows the same left-aligned
  kicker/h2/paragraph/list structure; no imagery at all (0 `<img>`), no
  compositional variety, default Inter/JetBrains pairing.
- **Projects are walls of text.** Six full-width articles, each a 90–120 word
  paragraph, stacked to 4,247 px. No screenshot even for simplescope, which has
  a striking real UI. No problem/role/architecture/outcome structure.
- **Stat tiles mis-cast.** Sentences like "Live, public, no auth wall" and
  "Streamable HTTP + stdio" are rendered as 30 px numeric tiles; "Local tests
  5/5 passing" and "Cost $0" are weak evidence promoted to headline stats.
- **Order.** The AI console sits before the projects. A recruiter's first
  question (what did you build?) is answered after a feature that needs them to
  type. The console is a genuine differentiator and should stay prominent via
  CTA and nav, not block the evidence.
- **No skills section.** The resume has a clear capability taxonomy; the site
  has none, and nothing distinguishes production (Mercado Libre) technology from
  personal-project technology.
- **Hero.** Strong headline; the 56-word paragraph, a rotating role ticker (also
  a CLS source and unreadable to screen readers), and a single CTA to the
  console bury the three things a recruiter wants in the first screen: projects,
  GitHub, contact.
- **Length.** ~20 phone screens with no visual anchors.

## Medium

- `LiveStats` client fetch on every page load; should be server-cached.
- `instrumentation-client.ts` sets `persistence: "localStorage+cookie"`: a
  first-party analytics cookie without consent UI; `localStorage` or `memory`
  avoids the cookie.
- README is stale (3 projects, "Contact — email + GitHub", `/api/github-stats`).
- `tsconfig` `target: ES2017` is fine; `jsdom 30.1.2` is ahead of the published
  latest 29.1.1 (a pre-release/odd tag); `eslint@9` is deprecated upstream.
- No Dependabot config in the repo, though CI comments rely on Dependabot.
- No e2e or API-route tests; only the streaming widget is tested.
- `html { scroll-behavior: smooth }` applies to find-in-page jumps too; fine but
  worth pairing with `scroll-padding-top` for the fixed nav (anchors currently
  land under the 64 px bar).

## Low

- `h1` uses `<br/>` mid-sentence; harmless.
- `Nav` `GitHub ↗` uses `rel="noreferrer"`; all external links do. OK.
- `public/` still contains the create-next-app SVGs (`next.svg`, `vercel.svg`,
  …), unused.
- `.github/PULL_REQUEST_TEMPLATE.md` checklist references `npx tsc --noEmit`
  but the script is `npm run typecheck`.

## Links verified

All project URLs returned 200 from a browser (GitHub blocks this sandbox's
proxy with 403, so GitHub pages were verified through a fetch service):
ask-edgeorgie-mcp (site + `/mcp`), repoask-mcp, simplescope live, agentlens,
triage-desk run 37983913473 (success, 25 s, trigger `issues`), triage-desk PR
#25 (merged), eval-lab run 37983754854 (success, 32 s), npm `crispy-profiling`
(v0.6.0, 7 versions, MIT), LinkedIn profile (LinkedIn returns 999 to bots; URL
is listed on the GitHub profile). **Broken:** github.com/edgeorgie/simplescope.

## Prioritised plan

1. **Critical fixes** (C1–C6): metadata base, CSS-driven hero entrance, CLS
   fixes, lazy analytics, security headers, register design tokens.
2. **High** (H1–H9): OG image + robots + sitemap + JSON-LD; LinkedIn/WhatsApp
   wiring; fix/replace broken link; a11y fixes; copy corrections; lazy
   markdown; API validation; server-cached GitHub data.
3. **Redesign**: design system, section order, hero, projects as case studies
   with real previews, skills map with evidence, achievements, console
   commands, timeline, contact.
4. **Validation**: unit + API tests, Playwright e2e (nav, links, a11y, console
   errors, reduced motion), Lighthouse/axe after.

Dependencies: tokens (C6) before any visual work; analytics abstraction (C4)
before touching AskMe; content model before project cards.

## After (same conditions, final build on this branch)

| Check | Before | After |
| --- | --- | --- |
| Lighthouse mobile (perf / a11y / best / seo) | 44 / 100 / 96 / 100 | 90–95 / 100 / 100 / 100 |
| Lighthouse desktop | 90 / 100 / 96 / 100 | 100 / 100 / 100 / 100 |
| Mobile LCP / TBT / CLS | 4.2 s / 700 ms / 0.80 | 2.6–3.4 s / 140–150 ms / 0 |
| Desktop LCP / TBT / CLS | 0.9 s / 10 ms / 0.197 | 0.7 s / ≤20 ms / 0 |
| JS for modern browsers on `/` (gzip) | 332 KB | 191 KB |
| CSS (gzip) | 8.1 KB | 10.2 KB |
| axe violations | 2 serious | 0 |
| SSR `opacity:0` nodes | 48 | 0 |
| Unit / e2e tests | 9 / 0 | 28 / 26 |

Findings C1–C6, H1–H3, H5–H9 and the medium items are fixed on this branch;
H4 (title), the WhatsApp number, the simplescope source link and the GitHub
profile link need the owner. Full write-up: `docs/REPORT.md`.
