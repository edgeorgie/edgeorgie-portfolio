"use client";

import { Reveal } from "./Reveal";

export function Contact() {
  return (
    <section
      id="contact"
      className="relative py-28 md:py-36 border-t border-[var(--line)] overflow-hidden"
    >
      <div className="max-w-6xl mx-auto px-6 md:px-10">
        <Reveal>
          <p className="mono text-xs text-accent uppercase tracking-widest mb-3">
            03 · Contact
          </p>
          <h2 className="text-4xl md:text-6xl font-semibold tracking-tight max-w-2xl">
            Want to see more of the work?
          </h2>
          <p className="mt-5 text-fg-dim max-w-lg text-lg">
            Everything above links to a real repo, run, or deployment — no
            invented metrics. Happy to walk through any of it.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <a
              href="mailto:ed.jorge1122@gmail.com"
              className="mono text-sm bg-accent text-black px-6 py-3 rounded-full hover:scale-[1.03] transition-transform inline-block"
            >
              ed.jorge1122@gmail.com
            </a>
            <a
              href="https://github.com/edgeorgie"
              target="_blank"
              rel="noreferrer"
              className="mono text-sm border border-[var(--line)] px-6 py-3 rounded-full hover:border-accent hover:text-accent transition-colors"
            >
              github.com/edgeorgie ↗
            </a>
          </div>
        </Reveal>
      </div>

      <footer className="max-w-6xl mx-auto px-6 md:px-10 mt-32 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-t border-[var(--line)] pt-8">
        <p className="mono text-xs text-fg-dim">
          Barranquilla, Colombia — remote
        </p>
        <p className="mono text-xs text-fg-dim">
          Built with Next.js + Framer Motion. Deployed on Vercel.
        </p>
      </footer>
    </section>
  );
}
