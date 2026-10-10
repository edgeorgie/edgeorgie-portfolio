"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

const ROLES = [
  "full-stack web platforms",
  "cross-platform UIs",
  "reliable backend APIs",
  "AI agent systems",
];

const TERMINAL_LINES = [
  "$ curl -X POST ask-edgeorgie-mcp.vercel.app/api/ask",
  '> { "question": "what has this person shipped?" }',
  "< citing resume.txt:1-24, progress-log.txt:289-318 …",
];

function TerminalBoot() {
  const [lineIdx, setLineIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);

  useEffect(() => {
    if (lineIdx >= TERMINAL_LINES.length) return;
    const current = TERMINAL_LINES[lineIdx];
    if (charIdx < current.length) {
      const t = setTimeout(() => setCharIdx((c) => c + 1), 18);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => {
      setLineIdx((l) => l + 1);
      setCharIdx(0);
    }, 420);
    return () => clearTimeout(t);
  }, [lineIdx, charIdx]);

  return (
    <div className="mono text-[11px] md:text-xs text-fg-dim/80 bg-bg-soft border border-[var(--line)] rounded-lg px-4 py-3 w-fit max-w-full overflow-hidden">
      {TERMINAL_LINES.slice(0, lineIdx).map((l, i) => (
        <div key={i} className="whitespace-pre">{l}</div>
      ))}
      {lineIdx < TERMINAL_LINES.length && (
        <div className="whitespace-pre">
          {TERMINAL_LINES[lineIdx].slice(0, charIdx)}
          <span className="inline-block w-[7px] h-[12px] bg-accent/70 ml-0.5 animate-pulse align-middle" />
        </div>
      )}
    </div>
  );
}

export function Hero() {
  const [roleIdx, setRoleIdx] = useState(0);
  // Respect OS-level reduced-motion preference for the infinite scroll-hint
  // bounce (see qa-reports/portfolio.md Issue #3).
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const t = setInterval(() => setRoleIdx((i) => (i + 1) % ROLES.length), 2200);
    return () => clearInterval(t);
  }, []);

  return (
    <section
      id="top"
      className="relative min-h-screen flex flex-col justify-center overflow-hidden grid-lines"
    >
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-accent/10 blur-[120px]" />
      </div>

      <div className="relative max-w-6xl w-full mx-auto px-6 md:px-10 pt-24">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mono text-xs md:text-sm text-accent tracking-widest uppercase mb-6"
        >
          Edwin Jorge — Senior Software Engineer
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-[13vw] md:text-[6.2rem] leading-[0.95] font-semibold tracking-tight"
        >
          I build software
          <br />
          people <span className="text-accent">and agents</span> rely on.
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mt-8 max-w-2xl"
        >
          <p className="text-lg md:text-xl text-fg-dim leading-relaxed">
            Senior Software Engineer at Mercado Libre, shipping{" "}
            <span className="text-fg">
              {ROLES[roleIdx]}
            </span>{" "}
            in production at LATAM e-commerce scale (4.3M+ users). Outside
            work, I keep building — including a set of real, publicly
            running AI-agent projects: webhook-triggered bots and a live
            MCP server you can question right now.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-6"
        >
          <TerminalBoot />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.55 }}
          className="mt-8 flex flex-wrap items-center gap-4"
        >
          <a
            href="#ask-me"
            className="mono text-sm bg-accent text-black px-6 py-3 rounded-full hover:scale-[1.03] transition-transform inline-block"
          >
            Ask an agent about me ↓
          </a>
          <a
            href="#work"
            className="mono text-sm text-fg-dim hover:text-accent transition-colors"
          >
            See the work →
          </a>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.8 }}
        // Hidden below md: on narrow/mobile viewports the hero content
        // stack is tall enough that this absolutely-positioned hint
        // lands directly on top of the primary CTA button (confirmed via
        // getBoundingClientRect() overlap — qa-reports/portfolio.md
        // Issue #2). Showing it only at md+ (where there's vertical
        // room below the CTA) removes the overlap entirely rather than
        // relying on a fragile spacing/z-index tweak.
        className="hidden md:flex absolute bottom-10 left-1/2 -translate-x-1/2 mono text-xs text-fg-dim/60 flex-col items-center gap-2"
      >
        <span>scroll</span>
        <motion.span
          animate={shouldReduceMotion ? { y: 0 } : { y: [0, 8, 0] }}
          transition={
            shouldReduceMotion
              ? { duration: 0 }
              : { repeat: Infinity, duration: 1.6, ease: "easeInOut" }
          }
        >
          ↓
        </motion.span>
      </motion.div>
    </section>
  );
}
