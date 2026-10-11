"use client";

import ReactMarkdown from "react-markdown";

/** Markdown renderer for console answers, code-split from StreamingAnswer. */
export default function AnswerMarkdown({ text }: { text: string }) {
  return (
    <ReactMarkdown
      components={{
        // Keep headings modest inside the transcript (a model-emitted "## eval-lab"
        // must not look like a page section heading).
        h1: ({ children }) => <p className="font-semibold text-fg mt-2 mb-1">{children}</p>,
        h2: ({ children }) => <p className="font-semibold text-fg mt-2 mb-1">{children}</p>,
        h3: ({ children }) => <p className="font-semibold text-fg mt-2 mb-1">{children}</p>,
        p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
        ul: ({ children }) => <ul className="list-disc pl-5 mb-2 space-y-1">{children}</ul>,
        ol: ({ children }) => <ol className="list-decimal pl-5 mb-2 space-y-1">{children}</ol>,
        code: ({ children }) => <code className="font-mono text-xs bg-bg-soft px-1 py-0.5 rounded">{children}</code>,
        strong: ({ children }) => <strong className="text-fg font-semibold">{children}</strong>,
        a: ({ children, href }) => (
          <a href={href} target="_blank" rel="noreferrer" className="text-fg underline-link">
            {children}
          </a>
        ),
      }}
    >
      {text}
    </ReactMarkdown>
  );
}
