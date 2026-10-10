"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const NAV = [
  { href: "#work", label: "Work" },
  { href: "#ask-me", label: "Ask an agent" },
  { href: "#experience", label: "Experience" },
  { href: "#contact", label: "Contact" },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the mobile menu on route-less navigation (anchor click) and on resize.
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) setOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const closeMenu = () => setOpen(false);

  return (
    <motion.nav
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${
        scrolled || open ? "bg-bg/80 backdrop-blur-md border-b border-[var(--line)]" : ""
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-10 h-16 flex items-center justify-between gap-2">
        <a href="#top" className="mono text-sm text-fg-dim hover:text-accent transition-colors shrink-0">
          EJ<span className="text-accent">.</span>
        </a>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6 md:gap-8">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="mono text-sm text-fg-dim hover:text-fg transition-colors tracking-wide whitespace-nowrap"
            >
              {item.label}
            </a>
          ))}
          <a
            href="https://github.com/edgeorgie"
            target="_blank"
            rel="noreferrer"
            className="mono text-sm border border-[var(--line)] rounded-full px-4 py-1.5 hover:border-accent hover:text-accent transition-colors whitespace-nowrap shrink-0"
          >
            GitHub ↗
          </a>
        </div>

        {/* Mobile hamburger button */}
        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-nav-menu"
          onClick={() => setOpen((v) => !v)}
          className="md:hidden relative z-50 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--line)] text-fg-dim hover:border-accent hover:text-accent transition-colors"
        >
          <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
          <div className="flex flex-col gap-1.5">
            <motion.span
              animate={{ rotate: open ? 45 : 0, y: open ? 6 : 0 }}
              className="block h-[1.5px] w-5 bg-current"
            />
            <motion.span
              animate={{ opacity: open ? 0 : 1 }}
              className="block h-[1.5px] w-5 bg-current"
            />
            <motion.span
              animate={{ rotate: open ? -45 : 0, y: open ? -6 : 0 }}
              className="block h-[1.5px] w-5 bg-current"
            />
          </div>
        </button>
      </div>

      {/* Mobile menu panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-nav-menu"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="md:hidden overflow-hidden bg-bg/95 backdrop-blur-md border-b border-[var(--line)]"
          >
            <div className="flex flex-col px-4 sm:px-6 py-4 gap-4">
              {NAV.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={closeMenu}
                  className="mono text-base text-fg-dim hover:text-fg transition-colors tracking-wide"
                >
                  {item.label}
                </a>
              ))}
              <a
                href="https://github.com/edgeorgie"
                target="_blank"
                rel="noreferrer"
                onClick={closeMenu}
                className="mono text-base border border-[var(--line)] rounded-full px-4 py-2 w-fit hover:border-accent hover:text-accent transition-colors"
              >
                GitHub ↗
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
