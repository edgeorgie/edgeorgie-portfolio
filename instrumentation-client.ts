// PostHog client-side init — official Next.js App Router pattern.
// https://posthog.com/docs/libraries/next-js
//
// This file runs once, before the app renders, per Next.js's
// `instrumentation-client` convention (App & Pages router alike).
import posthog from "posthog-js";

const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;

if (key) {
  posthog.init(key, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
    ui_host: "https://us.posthog.com",
    defaults: "2025-05-24",

    // Privacy / cost-conscious defaults for a public portfolio site:
    // — strip the last IP octet instead of storing a full IP
    ip: false,
    // — don't autocapture every click/DOM mutation; this site fires a
    //   small number of deliberate custom events instead (see AskMe.tsx)
    autocapture: false,
    // — session replay stays off by default; no need to record visitors
    //   just to prove the pipeline works, and it keeps event volume low
    disable_session_recording: true,
    // Manual pageview capture (see PostHogPageview.tsx) rather than
    // the default history-API patch, which double-fires on this site's
    // client-side route/hash navigation.
    capture_pageview: false,
    capture_pageleave: true,
    persistence: "localStorage+cookie",
  });
}

export default posthog;
