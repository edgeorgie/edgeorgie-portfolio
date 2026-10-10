"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Reveal } from "./Reveal";
import { projects, type Project } from "@/data/content";

function TriagePreview({ demo }: { demo: Extract<Project["demo"], { kind: "triage" }> }) {
  const [triggered, setTriggered] = useState(false);

  return (
    <div className="glass-panel rounded-xl p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="mono text-[11px] text-fg-dim uppercase tracking-widest">
          Live example · webhook payload → label
        </span>
        <button
          onClick={() => setTriggered((t) => !t)}
          className="mono text-[11px] border border-[var(--line)] rounded-full px-3 py-1 hover:border-accent hover:text-accent transition-colors"
        >
          {triggered ? "reset" : "run it"}
        </button>
      </div>

      <div className="mono text-xs rounded-lg border border-[var(--line)] bg-bg p-4">
        <p className="text-fg-dim/60 mb-1">issues: opened</p>
        <p className="text-fg">{demo.issueTitle}</p>
        <p className="text-fg-dim mt-1">{demo.issueBody}</p>
      </div>

      <motion.div
        initial={false}
        animate={{ opacity: triggered ? 1 : 0.35, y: triggered ? 0 : -4 }}
        transition={{ duration: 0.35 }}
        className="flex flex-wrap items-center gap-2"
      >
        <span className="mono text-[11px] text-fg-dim">↳ classified:</span>
        <span className="mono text-[11px] rounded-full px-2.5 py-1 border border-red-400/30 text-red-300 bg-red-400/5">
          {demo.result.kind}
        </span>
        <span className="mono text-[11px] rounded-full px-2.5 py-1 border border-amber-400/30 text-amber-300 bg-amber-400/5">
          {demo.result.priority}
        </span>
        <span className="mono text-[11px] text-fg-dim/70 ml-1">
          confidence {Math.round(demo.result.confidence * 100)}%
        </span>
      </motion.div>

      <a
        href={demo.sourceHref}
        target="_blank"
        rel="noreferrer"
        className="mono text-[11px] text-fg-dim underline-link w-fit"
      >
        {demo.sourceLabel} ↗
      </a>
    </div>
  );
}

function BenchmarkPreview({ demo }: { demo: Extract<Project["demo"], { kind: "benchmark" }> }) {
  const cells = Array.from({ length: demo.rows * demo.cols }, (_, i) => i);
  return (
    <div className="glass-panel rounded-xl p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="mono text-[11px] text-fg-dim uppercase tracking-widest">
          {demo.passed}/{demo.total} cells passing
        </span>
        <span className="mono text-[11px] text-accent">{Math.round((demo.passed / demo.total) * 100)}%</span>
      </div>
      <div
        className="grid gap-1.5"
        style={{ gridTemplateColumns: `repeat(${demo.cols}, minmax(0, 1fr))` }}
      >
        {cells.map((i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.6 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.25, delay: i * 0.015 }}
            className="aspect-square rounded-sm bg-accent/80"
          />
        ))}
      </div>
      <p className="mono text-[11px] text-fg-dim">{demo.asOf}</p>
      <a
        href={demo.runHref}
        target="_blank"
        rel="noreferrer"
        className="mono text-[11px] text-fg-dim underline-link w-fit"
      >
        {demo.runLabel} ↗
      </a>
    </div>
  );
}

function McpBadgePreview({ demo }: { demo: Extract<Project["demo"], { kind: "mcp-badge" }> }) {
  return (
    <div className="glass-panel rounded-xl p-5 flex flex-col gap-3">
      <span className="mono text-[11px] text-fg-dim uppercase tracking-widest">
        Tools exposed over MCP
      </span>
      <div className="flex flex-wrap gap-2">
        {demo.tools.map((t) => (
          <span
            key={t}
            className="mono text-[11px] rounded-full px-3 py-1.5 border border-accent/30 text-accent bg-accent/5"
          >
            {t}()
          </span>
        ))}
      </div>
      <a href="#ask-me" className="mono text-[11px] text-fg-dim underline-link w-fit mt-1">
        try it in the box above ↑
      </a>
    </div>
  );
}

function DemoPreview({ demo }: { demo: NonNullable<Project["demo"]> }) {
  if (demo.kind === "triage") return <TriagePreview demo={demo} />;
  if (demo.kind === "benchmark") return <BenchmarkPreview demo={demo} />;
  return <McpBadgePreview demo={demo} />;
}

export function Projects() {
  return (
    <section id="work" className="relative py-28 md:py-36 border-t border-[var(--line)]">
      <div className="max-w-6xl mx-auto px-6 md:px-10">
        <Reveal>
          <p className="mono text-xs text-accent uppercase tracking-widest mb-3">
            02 · Shipped
          </p>
          <h2 className="text-4xl md:text-6xl font-semibold tracking-tight max-w-3xl">
            Four real, running projects — not slideware.
          </h2>
          <p className="mt-5 text-fg-dim max-w-xl text-lg">
            A deployed MCP server you can query about me, a webhook-triggered
            bot, a CI gate, and a publicly reachable repo Q&A server — each
            with a GitHub run log behind its numbers.
          </p>
        </Reveal>

        <div className="mt-20 flex flex-col gap-24">
          {projects.map((p, i) => (
            <Reveal key={p.slug} delay={0.05}>
              <article className="grid md:grid-cols-[1fr_1.1fr] gap-10 md:gap-16 items-start">
                <div>
                  <span className="mono text-sm text-fg-dim">
                    0{i + 1}
                  </span>
                  <h3 className="text-3xl md:text-4xl font-semibold mt-2 tracking-tight">
                    {p.name}
                  </h3>
                  <p className="mt-3 text-fg-dim text-base md:text-lg leading-relaxed">
                    {p.tagline}
                  </p>
                  <p className="mt-4 text-sm text-fg-dim/80 leading-relaxed">
                    {p.description}
                  </p>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {p.stack.map((s) => (
                      <span
                        key={s}
                        className="mono text-[11px] text-fg-dim border border-[var(--line)] rounded-full px-3 py-1"
                      >
                        {s}
                      </span>
                    ))}
                  </div>

                  <div className="mt-6 flex flex-wrap gap-4">
                    {p.links.map((l) => (
                      <a
                        key={l.href}
                        href={l.href}
                        target="_blank"
                        rel="noreferrer"
                        className="mono text-sm text-fg underline-link"
                      >
                        {l.label} ↗
                      </a>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  {p.demo && <DemoPreview demo={p.demo} />}
                  <div className="grid grid-cols-2 gap-px bg-[var(--line)] rounded-xl overflow-hidden border border-[var(--line)]">
                    {p.stats.map((stat) => (
                      <motion.div
                        key={stat.label}
                        whileHover={{ backgroundColor: "rgba(186,255,41,0.06)" }}
                        className="bg-bg-soft p-6 flex flex-col gap-2"
                      >
                        <span className="mono text-2xl md:text-3xl text-accent font-semibold">
                          {stat.value}
                        </span>
                        <span className="mono text-[11px] text-fg-dim uppercase tracking-wide">
                          {stat.label}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
