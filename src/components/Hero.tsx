"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const ROLES = [
  "AI agent architectures",
  "webhook-triggered bots",
  "MCP servers",
  "eval-gated CI",
];

export function Hero() {
  const [roleIdx, setRoleIdx] = useState(0);

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
          Edwin Jorge — Software Engineer
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-[13vw] md:text-[6.2rem] leading-[0.95] font-semibold tracking-tight"
        >
          I build software
          <br />
          <span className="text-accent">AI agents</span> actually use.
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mt-8 max-w-2xl"
        >
          <p className="text-lg md:text-xl text-fg-dim leading-relaxed">
            Senior engineer at Mercado Libre, shipping{" "}
            <span className="text-fg">
              {ROLES[roleIdx]}
            </span>{" "}
            in production at LATAM e-commerce scale (4.3M+ users). Off the
            clock, I ship the same thing as side projects — and prove it with
            real webhook runs, not demos.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.45 }}
          className="mt-10 flex flex-wrap items-center gap-4"
        >
          <a
            href="#work"
            className="mono text-sm bg-accent text-black px-6 py-3 rounded-full hover:scale-[1.03] transition-transform inline-block"
          >
            See the work →
          </a>
          <a
            href="https://repoask-mcp.vercel.app"
            target="_blank"
            rel="noreferrer"
            className="mono text-sm border border-[var(--line)] px-6 py-3 rounded-full hover:border-accent hover:text-accent transition-colors"
          >
            Live MCP server ↗
          </a>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.8 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 mono text-xs text-fg-dim/60 flex flex-col items-center gap-2"
      >
        <span>scroll</span>
        <motion.span
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
        >
          ↓
        </motion.span>
      </motion.div>
    </section>
  );
}
