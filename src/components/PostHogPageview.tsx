"use client";

import { Suspense, useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import posthog from "posthog-js";

/**
 * Captures a `$pageview` on first load and on every client-side route
 * change. Needed because this file disables posthog-js's automatic
 * history-API pageview capture (`capture_pageview: false` in
 * instrumentation-client.ts) in favor of an explicit, App-Router-aware
 * call — the automatic one double-fires on Next.js's client navigation.
 */
function PageviewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastUrl = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname) return;
    let url = window.origin + pathname;
    const qs = searchParams.toString();
    if (qs) url += `?${qs}`;
    if (url === lastUrl.current) return;
    lastUrl.current = url;
    posthog.capture("$pageview", { $current_url: url });
  }, [pathname, searchParams]);

  return null;
}

export function PostHogPageview() {
  return (
    <Suspense fallback={null}>
      <PageviewTracker />
    </Suspense>
  );
}
