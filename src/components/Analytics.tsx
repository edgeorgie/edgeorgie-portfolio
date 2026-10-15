"use client";

import { Suspense, useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { analyticsEnabled, eventFromElement, track } from "@/lib/analytics";
import { sections } from "@/lib/site";

/**
 * Captures a `$pageview` on first load and on every client-side route
 * change. Manual rather than posthog-js's history patch, which double-fires
 * on App Router navigations.
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
    track("$pageview", { $current_url: url });
  }, [pathname, searchParams]);

  return null;
}

/**
 * One document-level listener for every `data-track` element: links and
 * buttons on click, `<details>` on open. Server components stay server
 * components; they only carry attributes.
 */
function InteractionTracker() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const el = (e.target as Element | null)?.closest?.("[data-track]");
      if (!el || el.tagName === "DETAILS") return;
      const ev = eventFromElement(el);
      if (ev) track(ev.event, ev.props);
    };
    const onToggle = (e: Event) => {
      const el = e.target as HTMLDetailsElement | null;
      if (!el || el.tagName !== "DETAILS" || !el.open || !el.dataset.track) return;
      const ev = eventFromElement(el);
      if (ev) track(ev.event, ev.props);
    };
    document.addEventListener("click", onClick, true);
    document.addEventListener("toggle", onToggle, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("toggle", onToggle, true);
    };
  }, []);
  return null;
}

/** `section_viewed` once per section per page load, when it crosses the middle of the viewport. */
function SectionViewTracker() {
  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;
    const seen = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting || seen.has(entry.target.id)) continue;
          seen.add(entry.target.id);
          track("section_viewed", { section: entry.target.id });
        }
      },
      { rootMargin: "-40% 0px -40% 0px", threshold: 0 }
    );
    for (const s of sections) {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, []);
  return null;
}

/**
 * Renders nothing. The trackers mount regardless of the PostHog key, because
 * `track()` also feeds Vercel Web Analytics, which needs no key — gating the
 * whole tree on `analyticsEnabled` is what previously meant that in the
 * deployed (no-key) state no listener existed at all and no custom event was
 * ever recorded by either sink.
 *
 * PageviewTracker stays gated: @vercel/analytics records page views itself, so
 * mounting it without PostHog would only double-count.
 */
export function Analytics() {
  return (
    <Suspense fallback={null}>
      {analyticsEnabled && <PageviewTracker />}
      <InteractionTracker />
      <SectionViewTracker />
    </Suspense>
  );
}
