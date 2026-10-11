"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "./Icon";
import { links, sections } from "@/lib/site";

const NAV_IDS = new Set(["work", "skills", "experience", "ask-me", "contact"]);
const NAV = sections.filter((s) => NAV_IDS.has(s.id));

/**
 * Fixed header. CSS-only transitions (no animation library): visible in the
 * server HTML, no opacity:0 flash, and it costs nothing on the main thread.
 * The mobile menu closes on link click, on Escape (focus returns to the
 * toggle) and when the viewport grows past the breakpoint.
 */
export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    const onResize = () => {
      if (window.innerWidth >= 768) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, [open]);

  const closeMenu = () => setOpen(false);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-300 ${
        scrolled || open ? "bg-bg/80 backdrop-blur-md border-b border-line" : "border-b border-transparent"
      }`}
    >
      <nav aria-label="Primary" className="max-w-6xl mx-auto px-4 sm:px-6 md:px-10 h-16 flex items-center justify-between gap-3">
        <a href="#top" className="font-mono text-sm text-fg-dim hover:text-accent transition-colors shrink-0">
          EJ<span className="text-accent">.</span>
          <span className="sr-only"> Edwin Jorge, back to top</span>
        </a>

        <div className="hidden md:flex items-center gap-7">
          {NAV.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className="font-mono text-[13px] text-fg-dim hover:text-fg transition-colors tracking-wide whitespace-nowrap"
            >
              {item.label}
            </a>
          ))}
          <span className="h-4 w-px bg-line-strong" aria-hidden="true" />
          <a
            href={links.linkedin}
            target="_blank"
            rel="noreferrer"
            aria-label="LinkedIn profile (opens in a new tab)"
            className="text-fg-dim hover:text-accent transition-colors"
          >
            <Icon name="linkedin" className="w-[18px] h-[18px]" />
          </a>
          <a
            href={links.github}
            target="_blank"
            rel="noreferrer"
            className="btn !py-2 !px-4 text-[13px]"
          >
            <Icon name="github" className="w-4 h-4" />
            GitHub
          </a>
        </div>

        <button
          ref={toggleRef}
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-nav-menu"
          onClick={() => setOpen((v) => !v)}
          className="md:hidden relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line text-fg-dim hover:border-accent hover:text-accent transition-colors"
        >
          <span className="flex flex-col gap-1.5" aria-hidden="true">
            <span
              className="block h-[1.5px] w-5 bg-current transition-transform duration-200"
              style={{ transform: open ? "translateY(6px) rotate(45deg)" : undefined }}
            />
            <span className="block h-[1.5px] w-5 bg-current transition-opacity duration-200" style={{ opacity: open ? 0 : 1 }} />
            <span
              className="block h-[1.5px] w-5 bg-current transition-transform duration-200"
              style={{ transform: open ? "translateY(-6px) rotate(-45deg)" : undefined }}
            />
          </span>
        </button>
      </nav>

      <div
        id="mobile-nav-menu"
        className="md:hidden grid transition-[grid-template-rows] duration-250 ease-out"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
        aria-hidden={!open}
      >
        <div className="overflow-hidden">
          <div className="flex flex-col px-4 sm:px-6 py-4 gap-1 border-t border-line">
            {NAV.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={closeMenu}
                tabIndex={open ? 0 : -1}
                className="font-mono text-base text-fg-dim hover:text-fg transition-colors tracking-wide py-2"
              >
                {item.label}
              </a>
            ))}
            <div className="flex gap-3 pt-3">
              <a href={links.github} target="_blank" rel="noreferrer" onClick={closeMenu} tabIndex={open ? 0 : -1} className="btn !py-2.5">
                <Icon name="github" className="w-4 h-4" />
                GitHub
              </a>
              <a href={links.linkedin} target="_blank" rel="noreferrer" onClick={closeMenu} tabIndex={open ? 0 : -1} className="btn !py-2.5">
                <Icon name="linkedin" className="w-4 h-4" />
                LinkedIn
              </a>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
