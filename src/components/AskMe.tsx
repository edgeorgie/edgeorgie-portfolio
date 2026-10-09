"use client";

import { useState } from "react";
import { Reveal } from "./Reveal";

const MCP_CONFIG = `{
  "mcpServers": {
    "ask-edgeorgie": {
      "url": "https://ask-edgeorgie-mcp.vercel.app/mcp"
    }
  }
}`;

export function AskMe() {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(MCP_CONFIG);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // clipboard unavailable — no-op, snippet is still selectable text
    }
  };

  return (
    <section
      id="ask-me"
      className="relative py-28 md:py-36 border-t border-[var(--line)]"
    >
      <div className="max-w-6xl mx-auto px-6 md:px-10">
        <Reveal>
          <p className="mono text-xs text-accent uppercase tracking-widest mb-3">
            02 · Talk to an agent, not a résumé
          </p>
          <h2 className="text-4xl md:text-6xl font-semibold tracking-tight max-w-3xl">
            Point your agent at me directly.
          </h2>
          <p className="mt-5 text-fg-dim max-w-xl text-lg">
            Drop this into Claude Desktop, Cursor, or any MCP-speaking client
            and ask it about my experience, projects, or reliability numbers
            — it answers with citations, not guesses.
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mt-10 grid md:grid-cols-[1fr_auto] gap-6 items-start">
            <pre className="mono text-xs md:text-sm bg-bg-soft border border-[var(--line)] rounded-xl p-6 overflow-x-auto leading-relaxed">
              {MCP_CONFIG}
            </pre>
            <button
              onClick={copy}
              className="mono text-sm bg-accent text-black px-6 py-3 rounded-full hover:scale-[1.03] transition-transform whitespace-nowrap"
            >
              {copied ? "Copied ✓" : "Copy config"}
            </button>
          </div>

          <div className="mt-6 flex flex-wrap gap-3 mono text-xs text-fg-dim">
            <span className="border border-[var(--line)] rounded-full px-3 py-1">
              Tools: get_experience · get_projects · ask_about_edgeorgie
            </span>
            <span className="border border-[var(--line)] rounded-full px-3 py-1">
              Transport: Streamable HTTP
            </span>
            <span className="border border-[var(--line)] rounded-full px-3 py-1">
              Zero fabrication: deterministic citation mode
            </span>
          </div>

          <div className="mt-6">
            <a
              href="https://ask-edgeorgie-mcp.vercel.app"
              target="_blank"
              rel="noreferrer"
              className="mono text-sm text-fg underline-link"
            >
              Open the live endpoint ↗
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
