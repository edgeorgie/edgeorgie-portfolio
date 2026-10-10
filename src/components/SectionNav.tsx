"use client";

import { useEffect, useRef, useState } from "react";

const SECTIONS = [
  { id: "top", label: "Intro" },
  { id: "ask-me", label: "Ask an agent" },
  { id: "work", label: "Work" },
  { id: "experience", label: "Experience" },
  { id: "contact", label: "Contact" },
];

/**
 * Persistent fixed dot-nav / section-progress indicator.
 * Hidden below md breakpoint so it never overlaps mobile content.
 */
export function SectionNav() {
  const [activeId, setActiveId] = useState(SECTIONS[0].id);
  const activeIdRef = useRef(activeId);
  activeIdRef.current = activeId;

  useEffect(() => {
    const elements = SECTIONS.map((s) => document.getElementById(s.id)).filter(
      (el): el is HTMLElement => el !== null
    );
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Pick the entry closest to the top of the viewport that's intersecting.
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          const id = visible[0].target.id;
          if (id !== activeIdRef.current) setActiveId(id);
        }
      },
      {
        // Treat the vertical middle band of the viewport as "active".
        rootMargin: "-40% 0px -50% 0px",
        threshold: 0,
      }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <nav
      aria-label="Section progress"
      className="section-dot-nav hidden md:flex fixed right-5 lg:right-8 top-1/2 -translate-y-1/2 z-40 flex-col items-end gap-4"
    >
      {SECTIONS.map((s) => {
        const isActive = s.id === activeId;
        return (
          <a
            key={s.id}
            href={`#${s.id}`}
            aria-label={`Jump to ${s.label} section`}
            aria-current={isActive ? "true" : undefined}
            className="group flex items-center gap-3"
          >
            <span
              className={`mono text-[10px] tracking-wide uppercase text-fg-dim opacity-0 -translate-x-1 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0 ${
                isActive ? "opacity-100 translate-x-0 text-accent" : ""
              }`}
            >
              {s.label}
            </span>
            <span
              className={`block rounded-full border transition-all duration-200 ${
                isActive
                  ? "w-2.5 h-2.5 bg-accent border-accent shadow-[0_0_8px_var(--accent)]"
                  : "w-1.5 h-1.5 bg-transparent border-[var(--fg-dim)] group-hover:border-accent"
              }`}
            />
          </a>
        );
      })}
    </nav>
  );
}
