"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Reveal } from "./Reveal";

const MCP_CONFIG = `{
  "mcpServers": {
    "ask-edgeorgie": {
      "url": "https://ask-edgeorgie-mcp.vercel.app/mcp"
    }
  }
}`;

type Citation = {
  rank: number;
  source: string;
  startLine: number;
  endLine: number;
  score: number;
  excerpt: string;
};

type AskResult = {
  question: string;
  answer: string;
  answerMode: "llm" | "deterministic";
  model?: string;
  citations: Citation[];
};

type Turn = { q: string; a: AskResult; streamed: boolean };

const SUGGESTIONS = [
  "What has this person built with AI agents?",
  "Tell me about their Mercado Libre experience.",
  "What's the real triage-desk accuracy number?",
];

// color-code citation chips by source file, like a syntax-highlighted
// "file reference" pill in an IDE / AI coding tool
function sourceAccent(source: string) {
  if (source.includes("resume")) return "text-sky-300 border-sky-400/30 bg-sky-400/5";
  if (source.includes("case-study")) return "text-violet-300 border-violet-400/30 bg-violet-400/5";
  if (source.includes("progress-log") || source.includes("BUILD-LOG"))
    return "text-amber-300 border-amber-400/30 bg-amber-400/5";
  if (source.includes("RELIABILITY")) return "text-accent border-accent/30 bg-accent/5";
  return "text-fg-dim border-[var(--line)]";
}

/** Reveals `text` word-by-word to look like a live model stream. */
function StreamingAnswer({ text, onDone }: { text: string; onDone?: () => void }) {
  const words = text.split(/(\s+)/);
  const [count, setCount] = useState(0);

  useEffect(() => {
    setCount(0);
  }, [text]);

  useEffect(() => {
    if (count >= words.length) {
      onDone?.();
      return;
    }
    const t = setTimeout(() => setCount((c) => c + 1), 10 + Math.random() * 14);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count, words.length]);

  const shown = words.slice(0, count).join("");
  const done = count >= words.length;

  return (
    <p className="text-fg-dim text-sm md:text-base leading-relaxed whitespace-pre-wrap">
      {shown}
      {!done && <span className="caret inline-block w-[2px] h-[1em] bg-accent ml-0.5 align-middle" />}
    </p>
  );
}

export function AskMe() {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<Turn[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [history, loading]);

  const ask = async (q: string) => {
    const trimmed = q.trim();
    if (trimmed.length < 3 || loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ask-me", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: trimmed, topK: 4 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setHistory((h) => [...h, { q: trimmed, a: data, streamed: false }]);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    ask(question);
    setQuestion("");
  };

  const copyConfig = async () => {
    try {
      await navigator.clipboard.writeText(MCP_CONFIG);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // clipboard unavailable — snippet is still selectable text
    }
  };

  return (
    <section
      id="ask-me"
      className="relative py-28 md:py-36 border-t border-[var(--line)]"
    >
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 right-0 w-[520px] h-[520px] rounded-full bg-accent/5 blur-[140px]" />
      </div>

      <div className="relative max-w-6xl mx-auto px-6 md:px-10">
        <Reveal>
          <p className="mono text-xs text-accent uppercase tracking-widest mb-3">
            01 · Talk to an agent, not a résumé
          </p>
          <h2 className="text-4xl md:text-6xl font-semibold tracking-tight max-w-3xl">
            Ask it something. Right here.
          </h2>
          <p className="mt-5 text-fg-dim max-w-xl text-lg">
            This box calls the same live <code className="mono text-sm text-fg">ask_about_edgeorgie</code>{" "}
            engine any MCP client would — real TF-IDF retrieval over my résumé,
            case studies, and reliability reports, cited by file and line.
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mt-10 gradient-border cmdk-glow">
            <div className="glass-panel rounded-[1rem] overflow-hidden bg-bg-soft/60">
              {/* fake window chrome, command-palette style */}
              <div className="flex items-center gap-2 px-5 py-3 border-b border-white/[0.06]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
                <span className="mono text-[11px] text-fg-dim/60 ml-3">
                  ask-edgeorgie-mcp · live · streamable-http
                </span>
                <span className="ml-auto flex items-center gap-1.5">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-accent opacity-60 animate-ping" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-accent" />
                  </span>
                  <span className="mono text-[10px] text-fg-dim/50">connected</span>
                </span>
              </div>

              {/* transcript */}
              <div ref={scrollRef} className="max-h-[480px] overflow-y-auto p-6 flex flex-col gap-6">
                {history.length === 0 && !loading && (
                  <p className="mono text-sm text-fg-dim/70">
                    Ask a real question below — e.g. &ldquo;What has this person
                    built with AI agents?&rdquo;
                  </p>
                )}
                <AnimatePresence initial={false}>
                  {history.map((turn, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="flex flex-col gap-3"
                    >
                      <div className="flex items-start gap-2">
                        <span className="mono text-xs text-accent shrink-0 mt-1">you &gt;</span>
                        <p className="text-fg text-sm md:text-base">{turn.q}</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="mono text-xs text-fg-dim shrink-0 mt-1">mcp &gt;</span>
                        <div className="flex-1">
                          <StreamingAnswer
                            text={turn.a.answer}
                            onDone={() => {
                              if (!turn.streamed) {
                                setHistory((h) =>
                                  h.map((t, idx) => (idx === i ? { ...t, streamed: true } : t))
                                );
                              }
                            }}
                          />
                          <div className="flex items-center gap-2 mt-2">
                            <span className="mono text-[11px] text-fg-dim/60 border border-[var(--line)] rounded-full px-2 py-0.5">
                              {turn.a.answerMode}
                            </span>
                            {turn.a.model && (
                              <span className="mono text-[11px] text-fg-dim/60">{turn.a.model}</span>
                            )}
                          </div>
                          {turn.a.citations?.length > 0 && turn.streamed && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ duration: 0.4 }}
                              className="mt-3 flex flex-wrap gap-1.5"
                            >
                              {turn.a.citations.map((c) => (
                                <span
                                  key={c.rank}
                                  title={c.excerpt.slice(0, 160)}
                                  className={`mono text-[11px] rounded-md px-2.5 py-1 border cursor-help ${sourceAccent(c.source)}`}
                                >
                                  [{c.rank}] {c.source}
                                  <span className="opacity-60">:{c.startLine}-{c.endLine}</span>
                                </span>
                              ))}
                            </motion.div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {loading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-2"
                  >
                    <span className="mono text-xs text-fg-dim">mcp &gt;</span>
                    <span className="mono text-xs shimmer-text">
                      querying live corpus…
                    </span>
                  </motion.div>
                )}
                {error && <p className="mono text-xs text-red-400">{error}</p>}
              </div>

              {/* suggestions */}
              <div className="px-6 pb-4 flex flex-wrap gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => ask(s)}
                    disabled={loading}
                    className="mono text-[11px] text-fg-dim border border-[var(--line)] rounded-full px-3 py-1.5 hover:border-accent hover:text-accent hover:bg-accent/5 transition-all disabled:opacity-40"
                  >
                    {s}
                  </button>
                ))}
              </div>

              {/* input */}
              <form
                onSubmit={onSubmit}
                className="border-t border-white/[0.06] flex items-center gap-3 p-4 bg-black/10"
              >
                <span className="mono text-sm text-accent pl-2">❯</span>
                <input
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Ask about experience, projects, or real numbers…"
                  className="flex-1 bg-transparent mono text-sm px-1 py-2 outline-none placeholder:text-fg-dim/50"
                />
                <button
                  type="submit"
                  disabled={loading || question.trim().length < 3}
                  className="mono text-sm bg-accent text-black px-5 py-2.5 rounded-full hover:scale-[1.03] transition-transform disabled:opacity-40 disabled:hover:scale-100 whitespace-nowrap"
                >
                  {loading ? "…" : "Ask →"}
                </button>
              </form>
            </div>
          </div>
        </Reveal>

        {/* secondary: connect directly via MCP */}
        <Reveal delay={0.15}>
          <div className="mt-8 border border-[var(--line)] rounded-xl p-5 md:p-6">
            <p className="mono text-xs text-fg-dim uppercase tracking-widest mb-3">
              Prefer to connect your own agent?
            </p>
            <div className="grid md:grid-cols-[1fr_auto] gap-4 items-start">
              <pre className="mono text-[11px] md:text-xs bg-bg border border-[var(--line)] rounded-lg p-4 overflow-x-auto leading-relaxed">
                {MCP_CONFIG}
              </pre>
              <button
                onClick={copyConfig}
                className="mono text-xs border border-[var(--line)] px-4 py-2.5 rounded-full hover:border-accent hover:text-accent transition-colors whitespace-nowrap"
              >
                {copied ? "Copied ✓" : "Copy config"}
              </button>
            </div>
            <p className="mt-3 mono text-[11px] text-fg-dim">
              Drop this into Claude Desktop or Cursor for get_experience ·
              get_projects · ask_about_edgeorgie. Same engine as the box
              above.{" "}
              <a
                href="https://ask-edgeorgie-mcp.vercel.app"
                target="_blank"
                rel="noreferrer"
                className="underline-link text-fg"
              >
                Open the standalone endpoint ↗
              </a>
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
