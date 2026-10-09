"use client";

import { motion } from "framer-motion";
import { Reveal } from "./Reveal";
import { projects } from "@/data/content";

export function Projects() {
  return (
    <section id="work" className="relative py-28 md:py-36 border-t border-[var(--line)]">
      <div className="max-w-6xl mx-auto px-6 md:px-10">
        <Reveal>
          <p className="mono text-xs text-accent uppercase tracking-widest mb-3">
            01 · Shipped
          </p>
          <h2 className="text-4xl md:text-6xl font-semibold tracking-tight max-w-3xl">
            Three real artifacts. Agents actually invoke them.
          </h2>
          <p className="mt-5 text-fg-dim max-w-xl text-lg">
            Not UI demos — a webhook-triggered bot, a CI gate, and a publicly
            deployed MCP server. Every number below is pulled from a real run.
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
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
