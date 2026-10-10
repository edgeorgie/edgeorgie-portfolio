"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

const SECTIONS = [
  { id: "top", label: "Top" },
  { id: "ask-me", label: "Ask an agent" },
  { id: "work", label: "Work" },
  { id: "experience", label: "Experience" },
  { id: "beyond", label: "Beyond the code" },
  { id: "ai-workflow", label: "How I use AI" },
  { id: "contact", label: "Contact" },
];

/**
 * Persistent dot-nav / section-progress indicator.
 *
 * Desktop-only (hidden below md): fixed on the right edge, one dot per
 * section, highlights the section currently in view via IntersectionObserver
 * scroll-spy, click jumps to the section. Addresses portfolio-blind-critique.md
 * fix #6 (dot-nav / section-progress indicator), the last open item in
 * BACKLOG.md Tier-2 #4.
 */
export function SectionNav() {
  const [activeId, setActiveId] = useState<string>(SECTIONS[0].id);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const elements = SECTIONS.map((s) => document.getElementById(s.id)).filter(
      (el): el is HTMLElement => el !== null
    );
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Pick the entry closest to the top of the viewport among those
        // currently intersecting, so the active dot tracks scroll position
        // smoothly even across sections of very different heights.
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length === 0) return;
        const topMost = visible.reduce((a, b) =>
          a.boundingClientRect.top <= b.boundingClientRect.top ? a : b
        );
        if (topMost.target.id) setActiveId(topMost.target.id);
      },
      {
        // Treat a section as "current" once its top has crossed roughly the
        // upper third of the viewport, and stop tracking once it has
        // scrolled mostly past the top.
        rootMargin: "-20% 0px -70% 0px",
        threshold: 0,
      }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <nav
      aria-label="Section progress"
      className="hidden md:flex fixed right-5 top-1/2 -translate-y-1/2 z-40 flex-col items-center gap-4"
    >
      {SECTIONS.map((section) => {
        const isActive = section.id === activeId;
        return (
          <a
            key={section.id}
            href={`#${section.id}`}
            aria-label={section.label}
            aria-current={isActive ? "location" : undefined}
            className="group relative flex items-center justify-center p-3"
          >
            <motion.span
              animate={{
                scale: isActive ? 1 : 0.6,
                opacity: isActive ? 1 : 0.4,
              }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
              className={`block h-2 w-2 rounded-full border border-[var(--line)] ${
                isActive ? "bg-accent border-accent" : "bg-transparent"
              } group-hover:opacity-100 group-hover:scale-100 transition-colors`}
            />
            <span
              className="pointer-events-none absolute right-full mr-3 whitespace-nowrap rounded-full border border-[var(--line)] bg-bg/90 px-3 py-1 text-xs mono text-fg-dim opacity-0 backdrop-blur-md transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
            >
              {section.label}
            </span>
          </a>
        );
      })}
    </nav>
  );
}
