"use client";

import { motion } from "framer-motion";
import { ReactNode, useSyncExternalStore } from "react";

function subscribe(callback: () => void) {
  const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}

function getSnapshot() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

// Server and first client paint must agree (no window), so default to
// "reduced motion" there — i.e. render the plain, always-visible div until
// the client can confirm otherwise. This is the side that is SAFE to be
// wrong about: worst case a non-reduced-motion user briefly sees content
// without the entrance animation; it can never leave anyone stuck invisible.
function getServerSnapshot() {
  return true;
}

/**
 * Live `prefers-reduced-motion: reduce` subscription.
 *
 * Shared so every animation on the site reads the preference the same way,
 * with the same safety property: the server/first-paint snapshot is
 * "reduced motion ON", so the guaranteed-safe branch is the static,
 * fully-visible one. See the long note in `Reveal` below for why
 * framer-motion's own `useReducedMotion()` is not used here.
 */
export function usePrefersReducedMotion() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

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
  // Respect the OS-level `prefers-reduced-motion` preference (WCAG 2.3.3):
  // users with vestibular/motion sensitivity get content immediately,
  // with no animated opacity/translate transition.
  // See qa-reports/portfolio.md Issue #3.
  //
  // IMPORTANT: do not rely on framer-motion's own `useReducedMotion()` here.
  // That hook lazily reads `matchMedia` once via a module-level cache and
  // returns it through a one-shot `useState` initializer with no re-render
  // on change. On SSR (no `window`) it resolves to a non-reduced default,
  // so the server (and the very first client paint, which must match the
  // server markup for hydration) always renders the animated
  // `motion.div` with `initial={{ opacity: 0 }}` baked into its inline
  // style. Verified live via CDP `Emulation.setEmulatedMedia` that once
  // that opacity:0 motion.div has mounted, switching the *next* render to
  // a reduced-motion branch does not reliably clear the stuck opacity:0
  // state — reduced-motion users end up with content that never becomes
  // visible, which is worse than not special-casing reduced motion at all.
  //
  // Fix: use `useSyncExternalStore` to subscribe directly to the live
  // `matchMedia` result (React's documented pattern for external browser
  // state, re-renders automatically on change, no manual setState-in-effect
  // needed). The server/first-paint snapshot defaults to "reduced motion ON"
  // (the plain, fully-visible `<div>` branch) so the guaranteed-safe state
  // is never an invisible one — the animated `motion.div` is strictly
  // opt-in once the client confirms the real OS preference.
  const prefersReducedMotion = usePrefersReducedMotion();

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
