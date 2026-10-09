"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const NAV = [
  { href: "#work", label: "Work" },
  { href: "#ask-me", label: "Ask an agent" },
  { href: "#experience", label: "Experience" },
  { href: "#contact", label: "Contact" },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${
        scrolled ? "bg-bg/80 backdrop-blur-md border-b border-[var(--line)]" : ""
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-10 h-16 flex items-center justify-between gap-2">
        <a href="#top" className="mono text-sm text-fg-dim hover:text-accent transition-colors shrink-0">
          EJ<span className="text-accent">.</span>
        </a>
        <div className="flex items-center gap-3 sm:gap-6 md:gap-8 overflow-x-auto">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="mono text-xs md:text-sm text-fg-dim hover:text-fg transition-colors tracking-wide whitespace-nowrap"
            >
              {item.label}
            </a>
          ))}
          <a
            href="https://github.com/edgeorgie"
            target="_blank"
            rel="noreferrer"
            className="mono text-xs md:text-sm border border-[var(--line)] rounded-full px-3 sm:px-4 py-1.5 hover:border-accent hover:text-accent transition-colors whitespace-nowrap shrink-0"
          >
            GitHub ↗
          </a>
        </div>
      </div>
    </motion.nav>
  );
}
