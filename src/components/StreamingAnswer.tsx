"use client";

import { lazy, Suspense, useState, useEffect } from "react";
import { usePrefersReducedMotion } from "./Reveal";

/**
 * react-markdown (+ remark/micromark, ~50 KB gzip) only loads the first time
 * an answer renders, instead of sitting in the initial bundle for a widget
 * most visitors never type into. While it loads, the plain text streams.
 */
const Markdown = lazy(() => import("./AnswerMarkdown"));

/**
 * Reveals `text` word-by-word to look like a live model stream.
 *
 * The reveal position in `count` is deliberately not reset when `text`
 * changes; callers key the element on the text (see AskMe.tsx) so new text
 * mounts a fresh instance at count=0.
 */
export function StreamingAnswer({ text, onDone }: { text: string; onDone?: () => void }) {
  const words = text.split(/(\s+)/);
  const [count, setCount] = useState(0);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion || count >= words.length) {
      onDone?.();
      return;
    }
    const t = setTimeout(() => setCount((c) => c + 1), 10 + Math.random() * 14);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count, words.length, prefersReducedMotion]);

  const shown = prefersReducedMotion ? text : words.slice(0, count).join("");
  const done = prefersReducedMotion || count >= words.length;

  return (
    <div data-testid="stream-answer" className="prose-ask text-fg-dim text-sm md:text-[15px] leading-relaxed">
      <Suspense fallback={<p className="whitespace-pre-wrap mb-2 last:mb-0">{shown}</p>}>
        <Markdown text={shown} />
      </Suspense>
      {!done && <span data-testid="stream-caret" className="caret inline-block w-[2px] h-[1em] bg-accent ml-0.5 align-middle" />}
    </div>
  );
}
