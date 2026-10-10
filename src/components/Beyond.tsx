"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Reveal } from "./Reveal";
import { beyond, type BeyondItem } from "@/data/content";

/* ------------------------------------------------------------------ */
/* Icon set — same stroke-only inline-SVG language as AIWorkflow's    */
/* Icon component, so this section feels like part of the same site,  */
/* not a different visual system bolted on.                           */
/* ------------------------------------------------------------------ */

function BeyondIcon({ name, className = "w-5 h-5" }: { name: BeyondItem["icon"]; className?: string }) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
  };
  switch (name) {
    case "gamepad":
      return (
        <svg {...common}>
          <rect x="3" y="8" width="18" height="9" rx="4" />
          <path d="M7 11v3M5.5 12.5h3" />
          <circle cx="15.5" cy="11.5" r="0.8" fill="currentColor" stroke="none" />
          <circle cx="17.5" cy="13.5" r="0.8" fill="currentColor" stroke="none" />
        </svg>
      );
    case "brain":
      return (
        <svg {...common}>
          <path d="M9 4.5a3 3 0 0 0-3 3v1a3 3 0 0 0-1.5 5.5A3 3 0 0 0 7 19h2" />
          <path d="M15 4.5a3 3 0 0 1 3 3v1a3 3 0 0 1 1.5 5.5A3 3 0 0 1 17 19h-2" />
          <path d="M9 4.5v14.5M15 4.5v14.5" />
        </svg>
      );
    case "code":
      return (
        <svg {...common}>
          <path d="m9 7-5 5 5 5M15 7l5 5-5 5" />
        </svg>
      );
    case "palette":
      return (
        <svg {...common}>
          <path d="M12 3a9 9 0 1 0 0 18c1.1 0 2-.7 2-1.8 0-.5-.2-.9-.5-1.2-.3-.3-.5-.7-.5-1.2 0-1.1.9-1.8 2-1.8h2a4.5 4.5 0 0 0 4.5-4.5C21 6.4 17 3 12 3Z" />
          <circle cx="7.5" cy="10.5" r="1" fill="currentColor" stroke="none" />
          <circle cx="11" cy="7.5" r="1" fill="currentColor" stroke="none" />
          <circle cx="15.5" cy="8.5" r="1" fill="currentColor" stroke="none" />
        </svg>
      );
    case "controller":
      return (
        <svg {...common}>
          <circle cx="16" cy="8.5" r="0.8" fill="currentColor" stroke="none" />
          <circle cx="14" cy="10.5" r="0.8" fill="currentColor" stroke="none" />
          <path d="M6 9h1a5 5 0 0 1 5 1 5 5 0 0 1 5-1h1a3 3 0 0 1 3 3.3l-.6 5a2.2 2.2 0 0 1-3.9 1.1L14 16h-4l-1.5 2.4A2.2 2.2 0 0 1 4.6 17.3l-.6-5A3 3 0 0 1 6 9Z" />
        </svg>
      );
    case "guitar":
      return (
        <svg {...common}>
          <circle cx="8.5" cy="15.5" r="4.5" />
          <path d="M11.5 12 17 6.5" />
          <path d="M15.5 5 19 8.5M17 4l2.5 2.5" />
          <path d="M7 15.5h3" />
        </svg>
      );
    case "dumbbell":
      return (
        <svg {...common}>
          <path d="M4 9v6M20 9v6" />
          <path d="M2 10.5v3M22 10.5v3" />
          <path d="M7 12h10" />
          <path d="M6 8.5v7M18 8.5v7" />
        </svg>
      );
    default:
      return null;
  }
}

function BeyondNode({ item, index, isLast }: { item: BeyondItem; index: number; isLast: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <Reveal delay={(index % 4) * 0.04} y={16}>
      <div className="flex gap-4 md:gap-5">
        <div className="flex flex-col items-center shrink-0">
          <span
            className={`inline-flex items-center justify-center w-11 h-11 rounded-full border-2 transition-colors duration-300 ${
              open ? "border-accent text-accent bg-accent/5" : "border-[var(--line)] text-fg-dim bg-bg"
            }`}
          >
            <BeyondIcon name={item.icon} />
          </span>
          {!isLast && <div className="w-px flex-1 bg-[var(--line)] mt-2 mb-2 min-h-[1.5rem]" aria-hidden="true" />}
        </div>

        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="group flex-1 text-left pb-8 md:pb-10"
        >
          <span className="mono text-[11px] text-accent uppercase tracking-[0.15em]">
            {item.year}
          </span>
          <h3 className="mt-1 text-lg md:text-xl font-semibold tracking-tight leading-snug">
            {item.label}
          </h3>

          <AnimatePresence initial={false}>
            {open && (
              <motion.p
                key="body"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                className="mt-3 text-fg-dim leading-relaxed text-[15px] overflow-hidden max-w-xl"
              >
                {item.body}
              </motion.p>
            )}
          </AnimatePresence>

          <span className="mono text-[10px] text-fg-dim/50 group-hover:text-accent/70 transition-colors mt-2 inline-block">
            {open ? item.collapseCopy : item.tapCopy}
          </span>
        </button>
      </div>
    </Reveal>
  );
}

/**
 * "Beyond the code" section: a chronological, tap-to-reveal timeline —
 * not a static grid of text cards. Reuses the same interaction language
 * as AIWorkflow (icon node, mono year/kicker label, tap-to-expand body)
 * so this reads as the same site, not a second design system bolted on.
 */
export function Beyond() {
  return (
    <section
      id="beyond"
      className="relative py-28 md:py-36 border-t border-[var(--line)]"
    >
      <div className="max-w-6xl mx-auto px-6 md:px-10">
        <Reveal>
          <p className="mono text-xs text-accent uppercase tracking-widest mb-3">
            05 · Beyond the code
          </p>
          <h2 className="text-4xl md:text-6xl font-semibold tracking-tight max-w-3xl">
            The same habit, from age 15 to now.
          </h2>
          <p className="mt-5 text-fg-dim max-w-xl text-lg">
            Build it yourself to understand it, whatever &ldquo;it&rdquo; is. Tap any
            step for the real story.
          </p>
        </Reveal>

        <div className="mt-16 max-w-2xl">
          {beyond.map((item, i) => (
            <BeyondNode key={item.label} item={item} index={i} isLast={i === beyond.length - 1} />
          ))}
        </div>
      </div>
    </section>
  );
}
