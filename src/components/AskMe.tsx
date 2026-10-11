"use client";

import { useState, useRef, useEffect, useId, useSyncExternalStore } from "react";
import { m, AnimatePresence } from "framer-motion";
import { track } from "@/lib/analytics";
import { runCommand, type ConsoleLine } from "@/lib/console";
import { links } from "@/lib/site";
import { Reveal } from "./Reveal";
import { SectionHeader } from "./SectionHeader";
import { StreamingAnswer } from "./StreamingAnswer";
import { Icon } from "./Icon";

const MCP_CONFIG = `{
  "mcpServers": {
    "ask-edgeorgie": {
      "url": "${links.askMcpEndpoint}"
    }
  }
}`;

type Citation = { rank: number; source: string; startLine: number; endLine: number; score: number; excerpt: string };

type AskResult = {
  question: string;
  answer: string;
  answerMode: "llm" | "deterministic" | "synthesis-failed";
  model?: string;
  citations: Citation[];
};

type Turn =
  | { id: number; kind: "ask"; q: string; a: AskResult; streamed: boolean }
  | { id: number; kind: "cmd"; q: string; lines: ConsoleLine[] };

const SUGGESTIONS = [
  "What has this person built with AI agents?",
  "Tell me about their Mercado Libre experience.",
  "What's the real triage-desk accuracy number?",
];

const COMMAND_CHIPS = ["/projects", "/skills", "/contact", "/help"];

const subscribeNoop = () => () => {};

// Colour-code citation chips by corpus file (the four real files in
// ask-edgeorgie-mcp/data).
function sourceAccent(source: string) {
  if (source.includes("resume")) return "text-info border-info/40 bg-info/5";
  if (source.includes("RECRUITER-FAQ")) return "text-violet-300 border-violet-400/40 bg-violet-400/5";
  if (source.includes("BUILD-LOG")) return "text-warn border-warn/40 bg-warn/5";
  if (source.includes("RELIABILITY")) return "text-accent border-accent/40 bg-accent/5";
  return "text-fg-dim border-line";
}

export function AskMe() {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<Turn[]>([]);
  const nextId = useRef(1);
  // false on the server and during hydration, true once the client runs.
  const hydrated = useSyncExternalStore(subscribeNoop, () => true, () => false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();

  const lastAnswerMode = [...history].reverse().find((t): t is Extract<Turn, { kind: "ask" }> => t.kind === "ask")?.a
    .answerMode;

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [history, loading]);


  const submit = async (raw: string) => {
    const trimmed = raw.trim();
    if (trimmed.length === 0 || loading) return;

    const local = runCommand(trimmed);
    if (local) {
      setError(null);
      if (local.kind === "clear") {
        setHistory([]);
        return;
      }
      setHistory((h) => [...h, { id: nextId.current++, kind: "cmd", q: trimmed, lines: local.lines }]);
      track("console_command", { command: local.command });
      return;
    }

    if (trimmed.length < 3) return;
    setLoading(true);
    setError(null);
    track("ask_me_question_submitted", {
      question_length: trimmed.length,
      question_preview: trimmed.slice(0, 80),
      is_suggestion: SUGGESTIONS.includes(trimmed),
    });
    try {
      const res = await fetch("/api/ask-me", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: trimmed, topK: 4 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setHistory((h) => [...h, { id: nextId.current++, kind: "ask", q: trimmed, a: data, streamed: false }]);
      track("ask_me_answer_received", { answer_mode: data.answerMode, citation_count: data.citations?.length ?? 0 });
    } catch (err) {
      setError((err as Error).message);
      track("ask_me_answer_failed", { error: (err as Error).message });
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void submit(question);
    setQuestion("");
  };

  const copyConfig = async () => {
    try {
      await navigator.clipboard.writeText(MCP_CONFIG);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // clipboard unavailable: the snippet is still selectable text
    }
  };

  return (
    <section id="ask-me" className="relative py-24 md:py-32 border-t border-line scroll-mt-16">
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute -top-40 right-0 w-[40rem] h-[40rem] glow-accent opacity-70" />
      </div>

      <div className="relative max-w-6xl mx-auto px-6 md:px-10">
        <Reveal>
          <SectionHeader
            id="ask-me"
            title={
              <>
                Don&rsquo;t take my word for it. <em>Ask.</em>
              </>
            }
            lede={
              <>
                This console calls the same live <code className="font-mono text-[0.9em] text-fg">ask_about_edgeorgie</code>{" "}
                engine any MCP client would: retrieval over my résumé, reliability report, build log and recruiter FAQ, cited
                by file and line. Slash commands run locally and never leave the page.
              </>
            }
          />
          <p className="mt-4 font-mono text-[12px] text-fg-faint max-w-xl" aria-live="polite">
            {lastAnswerMode === "llm"
              ? "Answers are generated prose from a real model, grounded strictly in the cited excerpts. See the answerMode badge under each reply."
              : lastAnswerMode === "deterministic"
                ? "No LLM key is configured on the upstream deployment right now, so answers are direct cited excerpts. Retrieval and citations are real either way."
                : "Ask a question to see the live answerMode: generated prose if a model key is active upstream, or a direct cited excerpt otherwise."}
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mt-10 panel overflow-hidden" style={{ boxShadow: "var(--shadow-glow)" }}>
            {/* window chrome */}
            <div className="flex items-center gap-2 px-5 py-3 border-b border-line">
              <span className="w-2.5 h-2.5 rounded-full bg-err/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-warn/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-ok/80" />
              <span className="font-mono text-[11px] text-fg-faint ml-3 truncate">ask-edgeorgie-mcp · streamable-http · /help for commands</span>
              <span className="ml-auto flex items-center gap-1.5 shrink-0">
                <span className="relative flex h-1.5 w-1.5 text-accent live-dot">
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-accent" />
                </span>
                <span className="font-mono text-[10px] text-fg-faint">live</span>
              </span>
            </div>

            {/* transcript */}
            <div
              ref={scrollRef}
              role="log"
              aria-live="polite"
              aria-relevant="additions"
              aria-label="Console transcript"
              className="max-h-[480px] overflow-y-auto p-5 sm:p-6 flex flex-col gap-6"
            >
              {history.length === 0 && !loading && (
                <p className="font-mono text-sm text-fg-dim">
                  Ask a real question, e.g. &ldquo;What has this person built with AI agents?&rdquo; Or type{" "}
                  <button type="button" onClick={() => void submit("/help")} className="text-accent underline-link">
                    /help
                  </button>
                  .
                </p>
              )}
              <AnimatePresence initial={false}>
                {history.map((turn) => (
                  <m.div
                    key={turn.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col gap-3"
                  >
                    <div className="flex items-start gap-2">
                      <span className="font-mono text-xs text-accent shrink-0 mt-1">you &gt;</span>
                      <p className="text-fg text-sm md:text-base break-words">{turn.q}</p>
                    </div>
                    {turn.kind === "cmd" ? (
                      <div className="flex items-start gap-2">
                        <span className="font-mono text-xs text-fg-faint shrink-0 mt-1">sys &gt;</span>
                        <ul className="flex-1 font-mono text-[12.5px] leading-relaxed flex flex-col gap-0.5">
                          {turn.lines.map((l, i) => (
                            <li key={i} className={`whitespace-pre-wrap ${l.muted ? "text-fg-faint" : "text-fg-dim"}`}>
                              {l.href ? (
                                <a
                                  href={l.href}
                                  {...(l.href.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}
                                  className="underline-link hover:text-fg"
                                >
                                  {l.text}
                                </a>
                              ) : (
                                l.text
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <div className="flex items-start gap-2">
                        <span className="font-mono text-xs text-fg-faint shrink-0 mt-1">mcp &gt;</span>
                        <div className="flex-1 min-w-0">
                          <StreamingAnswer
                            key={turn.a.answer}
                            text={turn.a.answer}
                            onDone={() => {
                              if (!turn.streamed) {
                                setHistory((h) => h.map((t) => (t.id === turn.id && t.kind === "ask" ? { ...t, streamed: true } : t)));
                              }
                            }}
                          />
                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            <span className="chip">{turn.a.answerMode}</span>
                            {turn.a.model && <span className="font-mono text-[11px] text-fg-faint">{turn.a.model}</span>}
                          </div>
                          {turn.a.citations?.length > 0 && turn.streamed && (
                            <m.ul
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ duration: 0.4 }}
                              className="mt-3 flex flex-wrap gap-1.5"
                              aria-label="Citations"
                            >
                              {turn.a.citations.map((c) => (
                                <li
                                  key={c.rank}
                                  title={c.excerpt.slice(0, 160)}
                                  className={`font-mono text-[11px] rounded-md px-2.5 py-1 border cursor-help ${sourceAccent(c.source)}`}
                                >
                                  [{c.rank}] {c.source}
                                  <span className="opacity-60">
                                    :{c.startLine}-{c.endLine}
                                  </span>
                                </li>
                              ))}
                            </m.ul>
                          )}
                        </div>
                      </div>
                    )}
                  </m.div>
                ))}
              </AnimatePresence>
              {loading && (
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-fg-faint">mcp &gt;</span>
                  <span className="font-mono text-xs shimmer-text">querying live corpus…</span>
                </div>
              )}
              {error && (
                <p role="alert" className="font-mono text-xs text-err">
                  {error}
                </p>
              )}
            </div>

            {/* suggestions */}
            <div className="px-5 sm:px-6 pb-4 flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button key={s} type="button" onClick={() => void submit(s)} disabled={loading} className="chip hover:border-accent hover:text-accent transition-colors disabled:opacity-40">
                  {s}
                </button>
              ))}
              {COMMAND_CHIPS.map((c) => (
                <button key={c} type="button" onClick={() => void submit(c)} disabled={loading} className="chip chip-accent hover:bg-accent/10 transition-colors disabled:opacity-40">
                  {c}
                </button>
              ))}
            </div>

            {/* input */}
            <form
              onSubmit={onSubmit}
              action="#ask-me"
              method="get"
              data-hydrated={hydrated ? "true" : "false"}
              className="border-t border-line flex items-center gap-3 p-3 sm:p-4 bg-bg/40"
            >
              <label htmlFor={inputId} className="font-mono text-sm text-accent pl-2" aria-hidden="true">
                ❯
              </label>
              <input
                id={inputId}
                ref={inputRef}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask about experience, projects, or real numbers… or type /help"
                aria-label="Ask a question or type a command"
                autoComplete="off"
                spellCheck={false}
                maxLength={500}
                className="flex-1 min-w-0 bg-transparent font-mono text-sm px-1 py-2 placeholder:text-fg-faint rounded-md"
              />
              <button type="submit" disabled={loading || question.trim().length === 0} className="btn btn-primary !py-2.5 !px-4">
                {loading ? "…" : "Ask"}
                <Icon name="arrowRight" className="w-4 h-4" />
              </button>
            </form>
          </div>
        </Reveal>

        <Reveal delay={0.15}>
          <div className="mt-6 panel p-5 md:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-fg-faint">Prefer to connect your own agent?</p>
              <button type="button" onClick={copyConfig} className="btn !py-2 !px-3.5 text-[12px]">
                <Icon name={copied ? "check" : "copy"} className="w-3.5 h-3.5" />
                {copied ? "Copied" : "Copy config"}
              </button>
            </div>
            <pre
              tabIndex={0}
              aria-label="MCP server configuration for Claude Desktop or Cursor"
              className="font-mono text-[11px] md:text-xs bg-bg border border-line rounded-lg p-4 overflow-x-auto leading-relaxed text-fg-dim"
            >
              {MCP_CONFIG}
            </pre>
            <p className="mt-3 font-mono text-[11px] text-fg-faint">
              Drop this into Claude Desktop or Cursor for get_experience · get_projects · get_story · ask_about_edgeorgie.{" "}
              <a href={links.askMcp} target="_blank" rel="noreferrer" className="underline-link text-fg-dim">
                Open the standalone endpoint ↗
              </a>
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
