/**
 * Thin analytics facade.
 *
 * posthog-js is ~100 KB gzipped. The previous setup imported it statically
 * from instrumentation-client.ts, AskMe.tsx and PostHogPageview.tsx, so it
 * shipped to every visitor even when no NEXT_PUBLIC_POSTHOG_KEY was set
 * (which is the case on the production deployment — docs/AUDIT.md C4).
 *
 * Now: no key → `track()` is a no-op and the library is never downloaded.
 * With a key → the library is dynamically imported after hydration, off
 * the critical path, and events queued before it loads are flushed.
 */
import type { PostHog } from "posthog-js";

type Props = Record<string, string | number | boolean | null | undefined>;

export const ANALYTICS_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
export const analyticsEnabled = Boolean(ANALYTICS_KEY);

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
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
        ui_host: "https://us.posthog.com",
        defaults: "2025-05-24",
        // Privacy-conscious defaults for a public portfolio:
        ip: false, // anonymise IP
        autocapture: false, // only the deliberate events below
        disable_session_recording: true,
        capture_pageview: false, // manual, App-Router-aware (see Analytics.tsx)
        capture_pageleave: true,
        // localStorage only: no analytics cookie is set, so no consent banner
        // is needed for a first-party, anonymised, opt-in-by-config setup.
        persistence: "localStorage",
      });
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
