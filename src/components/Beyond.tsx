"use client";

import { useState } from "react";
import { m, AnimatePresence } from "framer-motion";
import { Reveal } from "./Reveal";
import { SectionHeader } from "./SectionHeader";
import { Icon } from "./Icon";
import { beyond, type BeyondItem } from "@/data/content";

function BeyondNode({ item, index, isLast }: { item: BeyondItem; index: number; isLast: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <Reveal delay={(index % 4) * 0.04} y={16}>
      <div className="flex gap-4 md:gap-5">
        <div className="flex flex-col items-center shrink-0">
          <span
            className={`inline-flex items-center justify-center w-11 h-11 rounded-full border transition-colors duration-300 ${
              open ? "border-accent text-accent bg-accent/5" : "border-line-strong text-fg-dim bg-bg"
            }`}
          >
            <Icon name={item.icon} />
          </span>
          {!isLast && <div className="w-px flex-1 bg-line mt-2 mb-2 min-h-[1.5rem]" aria-hidden="true" />}
        </div>
        <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="group flex-1 text-left pb-8 md:pb-10 rounded-md">
          <span className="kicker text-[11px]">{item.year}</span>
          <h3 className="mt-1 text-lg md:text-xl font-semibold tracking-tight leading-snug">{item.label}</h3>
          <AnimatePresence initial={false}>
            {open && (
              <m.p
                key="body"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                className="mt-3 text-fg-dim leading-relaxed text-[15px] overflow-hidden max-w-xl"
              >
                {item.body}
              </m.p>
            )}
          </AnimatePresence>
          <span className="font-mono text-[10px] text-fg-faint group-hover:text-accent transition-colors mt-2 inline-block">
            {open ? "collapse" : "read"}
          </span>
        </button>
      </div>
    </Reveal>
  );
}

export function Beyond() {
  return (
    <section id="beyond" className="relative py-24 md:py-32 border-t border-line scroll-mt-16">
      <div className="max-w-6xl mx-auto px-6 md:px-10 grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
        <Reveal className="lg:sticky lg:top-24 lg:self-start">
          <SectionHeader
            id="beyond"
            title={
              <>
                The same habit, from <em>age 15</em> to now.
              </>
            }
            lede="Build it yourself to understand it, whatever “it” is. Each step is a real beat from the recruiter FAQ the console reads from."
          />
        </Reveal>
        <div className="max-w-2xl">
          {beyond.map((item, i) => (
            <BeyondNode key={item.label} item={item} index={i} isLast={i === beyond.length - 1} />
          ))}
        </div>
      </div>
    </section>
  );
}
