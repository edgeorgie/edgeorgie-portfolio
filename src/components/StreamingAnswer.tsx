"use client";

import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { usePrefersReducedMotion } from "./Reveal";

/**
 * Reveals `text` word-by-word to look like a live model stream.
 *
 * The reveal position in `count` is deliberately not reset when `text`
 * changes: doing that in-component needs either a setState-in-effect (which
 * `react-hooks/set-state-in-effect` rejects, and which lands only after a
 * render has already sliced the new text with the stale count) or a second
 * copy of the whole answer string in state. Callers reset it the way React
 * documents instead — a `key` derived from the text, see AskMe.tsx — so new
 * text mounts a fresh instance at count=0.
 */
export function StreamingAnswer({
  text,
  onDone,
}: {
  text: string;
  onDone?: () => void;
}) {
  const words = text.split(/(\s+)/);
  const [count, setCount] = useState(0);

  // Respect the OS-level `prefers-reduced-motion` preference (WCAG 2.3.3):
  // a word-by-word reveal of a long answer is ~250 sequential renders of
  // moving text, so reduced-motion users get the whole answer at once.
  // Uses the same `useSyncExternalStore` hook as `Reveal`, whose
  // server/first-paint snapshot defaults to reduced-motion ON — the safe,
  // content-is-visible side to be wrong about. (No StreamingAnswer exists
  // during SSR/hydration anyway: the transcript is empty until a visitor
  // asks something, so by first mount the real preference is known.)
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    // No reveal timers at all under reduced motion — the full text is
    // already rendered below; just report completion so the citation
    // chips (gated on `streamed`) still appear.
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
    <div
      data-testid="stream-answer"
      className="prose-ask text-fg-dim text-sm md:text-base leading-relaxed"
    >
      <ReactMarkdown
        components={{
          // Keep headings visually modest inside the chat bubble (don't let
          // a model-emitted "## eval-lab" look like a page section heading).
          h1: ({ children }) => <p className="font-semibold text-fg mt-2 mb-1">{children}</p>,
          h2: ({ children }) => <p className="font-semibold text-fg mt-2 mb-1">{children}</p>,
          h3: ({ children }) => <p className="font-semibold text-fg mt-2 mb-1">{children}</p>,
          p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
          ul: ({ children }) => <ul className="list-disc pl-5 mb-2 space-y-1">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal pl-5 mb-2 space-y-1">{children}</ol>,
          code: ({ children }) => (
            <code className="mono text-xs bg-bg-soft/80 px-1 py-0.5 rounded">{children}</code>
          ),
          strong: ({ children }) => <strong className="text-fg font-semibold">{children}</strong>,
        }}
      >
        {shown}
      </ReactMarkdown>
      {!done && (
        <span
          data-testid="stream-caret"
          className="caret inline-block w-[2px] h-[1em] bg-accent ml-0.5 align-middle"
        />
      )}
    </div>
  );
}
