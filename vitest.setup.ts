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

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});
