"use client";

import { useEffect, useState } from "react";
import { sections } from "@/lib/site";

/**
 * Desktop-only dot nav with IntersectionObserver scroll-spy. Derived from
 * the single `sections` list so it can never drift from the page order.
 * Placed after <main> in the DOM so keyboard users reach the content first.
 */
export function SectionNav() {
  const [activeId, setActiveId] = useState<string>(sections[0].id);

  useEffect(() => {
    const elements = sections
      .map((s) => document.getElementById(s.id))
      .filter((el): el is HTMLElement => el !== null);
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length === 0) return;
        const topMost = visible.reduce((a, b) => (a.boundingClientRect.top <= b.boundingClientRect.top ? a : b));
        if (topMost.target.id) setActiveId(topMost.target.id);
      },
      { rootMargin: "-20% 0px -70% 0px", threshold: 0 }
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <nav aria-label="Section progress" className="hidden lg:flex fixed right-5 top-1/2 -translate-y-1/2 z-40 flex-col items-center gap-1">
      {sections.map((section) => {
        const isActive = section.id === activeId;
        return (
          <a
            key={section.id}
            href={`#${section.id}`}
            aria-label={section.label}
            aria-current={isActive ? "location" : undefined}
            className="group relative flex items-center justify-center p-2.5"
          >
            <span
              className={`block rounded-full border transition-all duration-200 ${
                isActive ? "h-2.5 w-2.5 bg-accent border-accent" : "h-1.5 w-1.5 border-line-strong bg-transparent group-hover:border-fg-dim"
              }`}
            />
            <span className="pointer-events-none absolute right-full mr-2 whitespace-nowrap rounded-full border border-line bg-bg/90 px-3 py-1 text-[11px] font-mono text-fg-dim opacity-0 backdrop-blur-md transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
              {section.label}
            </span>
          </a>
        );
      })}
    </nav>
  );
}
