import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

// jsdom has no matchMedia. StreamingAnswer/Reveal subscribe to
// `(prefers-reduced-motion: reduce)` via useSyncExternalStore, so provide a
// real (non-matching) implementation: tests exercise the animated streaming
// path by default. Individual tests can override `matches`.
if (!window.matchMedia) {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
}

// jsdom implements neither IntersectionObserver nor Element.scrollTo.
// `Reveal` (framer-motion `whileInView`) needs the former; AskMe's
// transcript auto-scroll needs the latter. Stub both so component trees
// containing them can be rendered at all. The IO stub reports nothing as
// intersecting, which is fine: `Reveal` renders its children either way.
if (typeof globalThis.IntersectionObserver === "undefined") {
  class StubIntersectionObserver implements IntersectionObserver {
    readonly root = null;
    readonly rootMargin = "";
    readonly thresholds: ReadonlyArray<number> = [];
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords(): IntersectionObserverEntry[] {
      return [];
    }
  }
  globalThis.IntersectionObserver =
    StubIntersectionObserver as unknown as typeof IntersectionObserver;
  window.IntersectionObserver = globalThis.IntersectionObserver;
}

if (!Element.prototype.scrollTo) {
  Element.prototype.scrollTo = () => {};
}

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});
