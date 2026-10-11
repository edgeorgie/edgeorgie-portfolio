"use client";

import { type CSSProperties, type ReactNode, useEffect, useRef, useSyncExternalStore } from "react";

function subscribe(callback: () => void) {
  const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}

function getSnapshot() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

// Server and first client paint must agree (no window), so default to
// "reduced motion" there. The safe side to be wrong about: content is
// visible, never stuck hidden.
function getServerSnapshot() {
  return true;
}

/**
 * Live `prefers-reduced-motion: reduce` subscription, shared by every
 * JS-driven animation on the site.
 */
export function usePrefersReducedMotion() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/* One IntersectionObserver for every Reveal on the page. */
let observer: IntersectionObserver | null = null;
const handlers = new WeakMap<Element, (entry: IntersectionObserverEntry) => void>();

function observe(el: Element, handler: (entry: IntersectionObserverEntry) => void) {
  if (!observer) {
    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) handlers.get(entry.target)?.(entry);
      },
      { rootMargin: "0px 0px -80px 0px", threshold: 0 }
    );
  }
  handlers.set(el, handler);
  observer.observe(el);
  return () => {
    observer?.unobserve(el);
    handlers.delete(el);
  };
}

/**
 * Scroll-triggered entrance, CSS-driven.
 *
 * The markup is a plain, fully visible <div> on the server and at hydration.
 * After mount, elements that are still below the viewport get
 * `data-reveal="hidden"` and animate to `"visible"` when they scroll in
 * (see globals.css). Elements already on screen at hydration are left
 * alone, so nothing ever flashes or waits for JavaScript, and reduced-motion
 * users never see the animation at all.
 *
 * The previous implementation returned a framer-motion element once the
 * client confirmed the preference, which is a different React element type
 * from the server-rendered div: React remounted the whole subtree after
 * hydration on every page load.
 */
export function Reveal({
  children,
  delay = 0,
  className = "",
  y = 24,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  y?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion) return;
    let armed = false;
    const stop = observe(el, (entry) => {
      if (entry.isIntersecting) {
        if (armed) el.dataset.reveal = "visible";
        stop();
      } else if (!armed) {
        // First report and not on screen: hide it until it scrolls in.
        armed = true;
        el.dataset.reveal = "hidden";
      }
    });
    return () => {
      stop();
      delete el.dataset.reveal;
    };
  }, [prefersReducedMotion]);

  return (
    <div ref={ref} className={className} style={{ "--reveal-y": `${y}px`, "--reveal-delay": `${delay}s` } as CSSProperties}>
      {children}
    </div>
  );
}
