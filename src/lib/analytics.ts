/**
 * Thin analytics facade (PostHog), shared shape across the owner's apps.
 *
 * - No key → `track()` is a no-op and posthog-js is never downloaded.
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

export const ANALYTICS_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
export const analyticsEnabled = Boolean(ANALYTICS_KEY);
/** The `app` super property; the same PostHog project holds every app. */
export const APP = "portfolio";
/** Same-origin path proxied to PostHog by next.config.ts rewrites. */
export const ANALYTICS_HOST = "/ingest";

let client: PostHog | null = null;
let loading: Promise<PostHog | null> | null = null;
const queue: { event: string; props?: Props }[] = [];

export function loadAnalytics(): Promise<PostHog | null> {
  if (!analyticsEnabled || typeof window === "undefined") return Promise.resolve(null);
  if (client) return Promise.resolve(client);
  if (loading) return loading;
  loading = import("posthog-js")
    .then(({ default: posthog }) => {
      posthog.init(ANALYTICS_KEY as string, {
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
