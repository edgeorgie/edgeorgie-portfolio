/**
 * Thin analytics facade over TWO independent sinks, because they fail
 * independently and are configured independently:
 *
 *   - Vercel Web Analytics — always on in a Vercel deployment, needs no key
 *     and no env var. It is enabled on this project with data flowing.
 *   - PostHog — opt-in via NEXT_PUBLIC_POSTHOG_KEY, for funnels and retention
 *     Vercel does not do.
 *
 * Until this split existed, `track()` returned early whenever the PostHog key
 * was absent — which is the deployed state — so every custom event on the site
 * was dropped on the floor while Vercel Analytics sat enabled and received
 * nothing but pageviews. The gate now belongs to each sink, not to the facade.
 *
 * - No PostHog key → posthog-js is never downloaded (the bundle check in
 *   ci.yml still holds), but events still reach Vercel.
 * - With a key → the SDK is dynamically imported after hydration, off the
 *   critical path; events queued before it loads are flushed.
 * - Cookieless: no cookies, no storage, no consent banner. PostHog derives
 *   a daily anonymous id server-side; `identify()` is never called.
 * - Transport goes through this origin (`/ingest`, see next.config.ts), so
 *   tracking blockers that filter by domain do not drop it and the CSP
 *   stays pinned to 'self'.
 * - Every event carries `app` and `surface` so one PostHog project can hold
 *   every app. Never send user content (questions, notes, pasted text):
 *   only buckets, counts, booleans, durations and public identifiers.
 *
 * See docs/POSTHOG_PLAN.md.
 */
import type { PostHog } from "posthog-js";

type Props = Record<string, string | number | boolean | null | undefined>;

export const analyticsEnabled = Boolean(process.env.NEXT_PUBLIC_POSTHOG_KEY);
/**
 * Vercel Web Analytics needs no key: the <Analytics /> component defines
 * `window.va` (a queue stub until its script loads, then the real sender).
 * Calling it is safe before the script arrives — the stub buffers into
 * `window.vaq` and the script drains it. Checking for the function rather than
 * an env var is what makes this sink independent of PostHog's configuration.
 */
function vercelTrack(event: string, props?: Props): void {
  if (typeof window === "undefined") return;
  const va = (window as unknown as { va?: (...a: unknown[]) => void }).va;
  if (typeof va !== "function") return;
  // Vercel rejects nested objects and nullish values; send scalars only.
  const data: Record<string, string | number | boolean> = {};
  for (const [k, v] of Object.entries(props ?? {})) {
    if (v !== null && v !== undefined) data[k] = v;
  }
  // `$pageview` is PostHog's name for something @vercel/analytics records on
  // its own; forwarding it would double-count every page view.
  if (event.startsWith("$")) return;
  va("event", { name: event, data: { app: APP, ...data } });
}
/** The `app` super property; the same PostHog project holds every app. */
export const APP = "portfolio";
/** Same-origin path proxied to PostHog by next.config.ts rewrites. */
export const ANALYTICS_HOST = "/ingest";

let client: PostHog | null = null;
let loading: Promise<PostHog | null> | null = null;
const queue: { event: string; props?: Props }[] = [];

export function loadAnalytics(): Promise<PostHog | null> {
  // The gate reads process.env directly, not through a module-level constant:
  // next.config.ts defines the key as "" when unset, and only a literal here
  // lets the bundler prove the dynamic import unreachable and leave the SDK
  // out of a build made without a key (ci.yml asserts that).
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY || typeof window === "undefined") return Promise.resolve(null);
  if (client) return Promise.resolve(client);
  if (loading) return loading;
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  loading = import("posthog-js")
    .then(({ default: posthog }) => {
      posthog.init(key, {
        api_host: ANALYTICS_HOST,
        ui_host: "https://us.posthog.com",
        defaults: "2026-08-30",
        cookieless_mode: "always",
        person_profiles: "never",
        ip: false,
        autocapture: false,
        capture_pageview: false, // manual, App-Router-aware (see Analytics.tsx)
        disable_session_recording: true,
        respect_dnt: true,
        // Surveys, product tours and conversations each DEFAULT TO ENABLED in
        // posthog-js (`disable_*: false` in its own defaults), and each one
        // polls a separate `/api/...` endpoint on load. This app uses none of
        // them, and the `/ingest` proxy in next.config.ts deliberately does
        // not forward PostHog's `/api/*` surface — so leaving them on means
        // three requests per page load that can only ever 404. Turning them
        // off here is what makes that allowlist complete rather than
        // merely narrow.
        disable_surveys: true,
        disable_product_tours: true,
        disable_conversations: true,
      });
      posthog.register({ app: APP, surface: "web" });
      client = posthog;
      for (const q of queue.splice(0)) posthog.capture(q.event, q.props);
      return posthog;
    })
    .catch(() => null);
  return loading;
}

/** Fire-and-forget event. Safe to call anywhere, in any environment. */
export function track(event: string, props?: Props): void {
  // Vercel first: it is unconditional in a deployment and must not be gated
  // behind PostHog's key, which is the bug this ordering fixes.
  vercelTrack(event, props);
  if (!analyticsEnabled) return;
  if (client) {
    client.capture(event, props);
    return;
  }
  queue.push({ event, props });
  void loadAnalytics();
}

/** Coarse size of a free-text input, so no length can fingerprint a visitor. */
export function lengthBucket(length: number): "<40" | "40-120" | "120-300" | "300+" {
  if (length < 40) return "<40";
  if (length < 120) return "40-120";
  if (length < 300) return "120-300";
  return "300+";
}

/**
 * Reads a declarative event off an element: `data-track="evidence_clicked"`
 * names the event, every `data-track-*` attribute becomes a snake_case
 * property (`data-track-kind="live"` → `{ kind: "live" }`). Lets server
 * components emit events without becoming client components.
 */
export function eventFromElement(el: Element): { event: string; props: Props } | null {
  const dataset = (el as HTMLElement).dataset;
  const event = dataset?.track;
  if (!event) return null;
  const props: Props = {};
  for (const [key, value] of Object.entries(dataset)) {
    if (key === "track" || !key.startsWith("track")) continue;
    const name = key
      .slice("track".length)
      .replace(/^[A-Z]/, (c) => c.toLowerCase())
      .replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);
    props[name] = value ?? "";
  }
  return { event, props };
}
