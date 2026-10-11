"use client";

import { LazyMotion, domAnimation } from "framer-motion";
import type { ReactNode } from "react";

/**
 * Loads only the `domAnimation` feature set of framer-motion and makes
 * `m.*` components usable site-wide. `strict` turns any accidental use of
 * the full `motion.*` import into a runtime error in development, which
 * keeps the bundle from silently growing back.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      {children}
    </LazyMotion>
  );
}
