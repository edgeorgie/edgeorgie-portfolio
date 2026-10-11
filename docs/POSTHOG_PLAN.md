# PostHog rollout plan: portfolio and projects

Written 2026-10-11 for edgeorgie's portfolio (`www.itsedgeorgie.dev`) and the
public projects it links to. The goal is one analytics setup that answers
three questions honestly and cheaply: *who reads the portfolio and what do
they click*, *which projects get used and how*, and *does the site stay fast
in the field*. Everything below is designed so it can never leak a visitor's
content and never needs a cookie banner.

## 0. Decisions made up front

| Decision | Choice | Why |
| --- | --- | --- |
| Account shape | One PostHog Cloud project (US region), every event carries an `app` super property | Keeps the free tier, keeps cross-app journeys (portfolio → repoask) queryable in one place, one dashboard set. Split into projects later only if an app needs separate access. |
| Transport | Reverse proxy on every Next.js app (`/ingest/*` → PostHog via `next.config` rewrites) | Tracking blockers filter by domain; a same-origin path survives them. Also keeps CSP `connect-src` at `'self'`. |
| Identity | `cookieless_mode: "always"`, `person_profiles: "never"`, no `identify()` | No cookies, no local storage, no consent banner to design, no person data to protect. PostHog derives a daily anonymous id server-side. The cost is no cross-day identity, which a portfolio does not need. |
| Capture | `autocapture: false`, explicit events only, session replay off, `respect_dnt: true` | Autocapture scrapes element text; explicit events are a short allowlist that can be audited. |
| Field performance | posthog-js `capture_performance` (web vitals) left on for the portfolio | Replaces the earlier `useReportWebVitals` idea with zero extra code. |
| Content | Never send user content: questions, notes, screenshots, pasted errors, repo file contents, prompts, answers | Only shapes of use: lengths in buckets, counts, booleans, durations, public identifiers such as a GitHub repo name. |
| Naming | `object_verb` event names, `snake_case` properties, `app` and `surface` on every event | One grammar across twelve repos so dashboards can be copied. |

Project token: `NEXT_PUBLIC_POSTHOG_KEY` (a public token by design). API host when proxied: `/ingest`. UI host: `https://us.posthog.com`.

## 1. Inventory and tiers

Tier 1: web apps, posthog-js through the proxy. Tier 2: servers, bots and MCP endpoints, posthog-node. Tier 3: CLIs, opt-in only. None: libraries and privacy-promise apps.

| Project | What it is | Tier | Events (the whole allowlist) | Notes |
| --- | --- | --- | --- | --- |
| edgeorgie-portfolio | Next.js site | 1 | `$pageview`, `section_viewed` (section), `project_opened` (slug), `evidence_clicked` (slug, kind), `console_command_run` (command), `question_asked` (length_bucket, top_k, is_suggestion, answered, answer_mode, citations, latency_ms, reason), `contact_clicked` (channel, placement), `cta_clicked` (target), `outbound_clicked` (target, kind) | **Implemented** (inert without a key — the SDK is absent from the bundle *and* the `/ingest` proxy route is not registered; with a key the proxy exposes an allowlist of five endpoints, no catch-all; all asserted in CI/tests): facade in `src/lib/analytics.ts`, `/ingest` proxy, declarative `data-track` attributes read by one listener in `Analytics.tsx`. Web vitals on. |
| ask-edgeorgie-mcp | Next.js web UI + MCP endpoint | 1 + 2 | `question_asked` (surface web\|mcp, mode, cited, latency_ms, length_bucket), `mcp_tool_called` (tool), `rate_limited` (surface) | Same event name on both surfaces so one chart shows humans vs agents. |
| repoask / repoask-mcp | Next.js web + `/api/mcp` | 1 + 2 | `repo_asked` (repo, question_length_bucket, surface), `index_built` (chunk_bucket, duration_ms), `mcp_tool_called` (tool) | A public repo name is public data; the question text is not sent. |
| issue-scout | Next.js web | 1 | `search_run` (language, label_count, policy_filter), `issue_opened` (repo), `policy_badge_viewed` (stance) | No free-text query is sent. |
| errorlens | Next.js web | 1 | `error_explained` (model, latency_ms, input_kind screenshot\|text, ok) | Never the screenshot, never the error text. |
| codereel | Next.js web, client-only | 1 | `editor_opened`, `video_exported` (aspect, duration_bucket, fps) | Client-only app, so Tier 1 only. |
| simplescope | Web | 1 | `lesson_started` (algorithm), `prediction_made` (algorithm, correct), `lesson_completed` (algorithm) | The one app where a "correct" boolean is the product signal. |
| agentlens | Tracer library + web viewer | viewer: 1, tracer: none | `trace_loaded` (source example\|upload, span_bucket) | The tracer is embedded in other people's agents; a library must never phone home. |
| triage-desk | GitHub bot (server) | 2 | `issue_triaged` (repo, labels_applied, model, latency_ms, outcome), `webhook_rejected` (reason) | Issue titles and bodies are never sent. |
| eval-lab | CLI + GitHub Action | 3, opt-in | `eval_run` (case_bucket, passed, failed, duration_ms, ci) | Off unless `EVAL_LAB_TELEMETRY=1`; the Action never sets it by itself. |
| budget-keeper | Agent CLI + local dashboard | 3, opt-in | `run_completed` (budget_bucket, spent_pct, tier_switches, killed) | Off unless `BUDGET_KEEPER_TELEMETRY=1`. |
| trajectory-grader | Python CLI | 3, opt-in | `grade_run` (trajectory_bucket, rubric_items, duration_ms) | Defer until it has users beyond its author; posthog-python when it does. |
| crispy-profiling | npm library | none | — | Libraries never report. |
| retrieval-core | Library | none | — | Same. |
| recall-local | Web app whose promise is "nothing leaves the browser" | none | — | Analytics would break the product's one promise. If it ever gets any, the promise text changes first and it is page-level only. |

Buckets, not raw numbers, for anything that could fingerprint a person: `length_bucket` ∈ {`<40`, `40-120`, `120-300`, `300+`}, `duration_bucket` ∈ {`<5s`, `5-30s`, `30-120s`, `120s+`}, and so on.

## 2. Shared building blocks

### 2.1 Next.js reverse proxy (every Tier 1 app)

```ts
// next.config.ts
const posthogEnabled = Boolean(process.env.NEXT_PUBLIC_POSTHOG_KEY);

const nextConfig = {
  async rewrites() {
    // Guard 1 — gate the proxy on the key. The rewrite is a SERVER-side
    // route, so it exists whether or not the client ever calls it:
    // registered unconditionally, the deployment forwards any body posted
    // to /ingest/* to PostHog's public ingestion API — an open relay on
    // your own domain. A no-key client bundle does not close it.
    if (!posthogEnabled) return [];
    // Guard 2 — an explicit ALLOWLIST, never a `/ingest/:path*` catch-all.
    // Guard 1 only holds while analytics is off; the moment the key is set
    // a catch-all reopens the identical relay permanently, because
    // PostHog's ingestion endpoints answer an unrecognised `api_key` with
    // `200 {"status":"Ok"}` — nothing downstream limits who may post
    // through it. A catch-all also proxies PostHog's AUTHENTICATED
    // `/api/*` surface through your origin. List only the endpoints your
    // SDK configuration actually calls; adding a capability (surveys →
    // `/api/surveys/`, session replay → `/s/`) is a deliberate edit here.
    return [
      { source: "/ingest/static/:path*", destination: "https://us-assets.i.posthog.com/static/:path*" },
      { source: "/ingest/array/:path*", destination: "https://us-assets.i.posthog.com/array/:path*" },
      { source: "/ingest/e/", destination: "https://us.i.posthog.com/e/" },
      { source: "/ingest/flags/", destination: "https://us.i.posthog.com/flags/" },
      { source: "/ingest/i/v1/:path*", destination: "https://us.i.posthog.com/i/v1/:path*" },
    ];
  },
  skipTrailingSlashRedirect: true, // PostHog endpoints end in "/", a redirect would drop events
};
```

With the proxy in place, CSP needs no PostHog origins; the portfolio's `posthogOrigins` branch in `next.config.ts` becomes dead and can be removed. Copy `src/lib/ingest-proxy.test.ts` alongside the config: it calls the real `rewrites()` under unset / `""` / set keys, and asserts both guards by reachability (that `/ingest/api/projects/`, `/ingest/s/`, `/ingest/batch/` do **not** match any rule) rather than by inspecting the source, which cannot answer whether a route exists.

### 2.2 Browser facade (every Tier 1 app)

Copy `src/lib/analytics.ts` from the portfolio: it dynamically imports `posthog-js` only when a key exists, queues `track()` calls made before the SDK loads, and is a no-op otherwise, so no app ever ships the SDK to users of a deployment without a key. Its `init` block becomes:

```ts
posthog.init(key, {
  api_host: "/ingest",
  ui_host: "https://us.posthog.com",
  defaults: "2026-05-30",
  cookieless_mode: "always",
  person_profiles: "never",
  autocapture: false,
  capture_pageview: false, // sent manually with the app property
  disable_session_recording: true,
  respect_dnt: true,
});
posthog.register({ app: "repoask", surface: "web" });
```

`track(event, props)` stays the only call sites use. Outbound links from the portfolio to the apps carry `?utm_source=portfolio&utm_medium=card`, so the destination app's first events record the campaign without any cross-domain identity.

### 2.3 Server helper (Tier 2, Vercel functions)

```ts
import { PostHog } from "posthog-node";

export function serverAnalytics() {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key) return null;
  return new PostHog(key, { host: "https://us.i.posthog.com", flushAt: 1, flushInterval: 0 });
}

// in a route handler
const ph = serverAnalytics();
if (ph) {
  await ph.captureImmediate({
    distinctId: crypto.randomUUID(), // anonymous per request; no person profile
    event: "question_asked",
    properties: { app: "ask-edgeorgie-mcp", surface: "mcp", cited: true, latency_ms: 812, $process_person_profile: false },
  });
}
```

`captureImmediate` is awaited because a serverless function can freeze before a batched `capture` is sent. Server events use a fresh anonymous id per request and `$process_person_profile: false`, matching the cookieless browser side.

### 2.4 CLI opt-in (Tier 3)

- Off by default. Enabled by `<TOOL>_TELEMETRY=1` or `--telemetry`, documented in a "Telemetry" section of the README that lists every property sent.
- Anonymous `machine_id`: SHA-256 of hostname + username + a random salt generated on first run and stored in `~/.config/<tool>/telemetry.json`. Never arguments, paths, file contents or prompts.
- First enabled run prints one line: what is sent and how to turn it off.
- Python (trajectory-grader): `posthog-python`, `capture(distinct_id=machine_id, event="grade_run", properties=…)` then `flush()` before exit. Check the SDK's current `capture` signature when wiring it; it changed between major versions.

## 3. Rollout, in order

| Phase | Scope | Effort | Done when |
| --- | --- | --- | --- |
| 0 | Create the PostHog project (US), copy the token, create an empty "Portfolio" dashboard | 20 min | Token in a password manager, nothing deployed yet |
| 1 | Portfolio: proxy rewrites, facade options above, `app: "portfolio"`, the eight events in §1, `NEXT_PUBLIC_POSTHOG_KEY` on Vercel, drop the PostHog CSP branch | 1–2 h, one PR | Live events show `$pageview` and `section_viewed` from production; web vitals appear under Web analytics; Lighthouse mobile unchanged (SDK loads on idle); an ad-blocker test still delivers events |
| 2 | Web apps, one PR each: repoask, issue-scout, errorlens, codereel, simplescope, agentlens viewer, ask-edgeorgie-mcp UI | 45 min each | Each app's events arrive with its own `app` value; portfolio outbound links carry UTMs |
| 3 | Servers: ask-edgeorgie-mcp MCP route, repoask `/api/mcp`, triage-desk | 1 h each | `question_asked` shows both `surface` values on one chart; triage outcomes charted |
| 4 | CLIs, opt-in: eval-lab, budget-keeper; trajectory-grader later | 1 h each | README "Telemetry" sections published; events only arrive when the env var is set |
| 5 | Insights: three dashboards (Portfolio funnel: `section_viewed` → `project_opened` → `outbound_clicked`; Ask-me usage by surface with cited rate and p50 latency; Apps overview by `app`), two alerts (errorlens `ok=false` rate, MCP `rate_limited` spikes), a 15-minute weekly look | 2 h once | Dashboards pinned; the first weekly note written |

Phases 2 to 4 are independent of each other and can be done in any order as time allows. Nothing in phase 1 blocks on them.

## 4. Never sent, from any surface

Question text, answers, notes, pasted errors, screenshots, repository file contents, prompts, model outputs, email addresses, names, IPs beyond what PostHog's cookieless hashing uses server-side, file paths, command-line arguments, environment variables.

## 5. Verification checklist per project

1. `npm run build` with no key: `posthog-js` absent from the client bundle (`grep -r posthog .next/static` empty).
2. No key, against the **deployed** site: `POST /ingest/e/` returns 404. The bundle check above says nothing about this — a rewrite is a server-side route, so the only check that covers it is calling the route.
3. With a key: `/ingest/e/`, `/ingest/flags/` and `/ingest/static/*` work, and every unlisted PostHog path (`/ingest/api/projects/`, `/ingest/s/`, `/ingest/batch/`) returns 404. Guard 1 stops holding the moment the key is set; from then on the allowlist is the only thing closing the relay.
4. With a key, in production: PostHog "Live events" shows the first event within a minute, with `app` and `surface` set.
5. Browser devtools: every analytics request goes to `/ingest/…` on the app's own origin; no CSP report.
6. With uBlock Origin enabled: events still arrive.
7. Property audit: export one day of events and grep for `@`, `http`, and any string longer than 64 characters in properties; expect none.
8. Lighthouse mobile before and after: performance unchanged within run-to-run variance.
9. README or privacy note updated where the app has one (errorlens, recall-local's promise stays intact by having nothing to update).

## 6. Cost

At portfolio scale (thousands of events a month, not millions) this sits inside PostHog's free tier; check `posthog.com/pricing` for the current monthly allowance before phase 2 adds the apps. Cookieless anonymous events are also PostHog's cheapest event class, which is another reason not to call `identify()`.
