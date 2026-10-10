"use client";

import { Reveal } from "./Reveal";
import { beyond } from "@/data/content";

/**
 * "Beyond the code" section: real, independently-stated facts about who
 * the candidate is outside the resume — self-taught habit, design
 * sensibility, a shipped game at 15, current hobbies. Deliberately not a
 * generic "fun facts" list: every entry is either checkable or directly
 * relevant to how he actually works. See content.ts `beyond` for sourcing
 * notes.
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
            Who I am when I'm not shipping.
          </h2>
        </Reveal>

        <div className="mt-16 grid md:grid-cols-2 gap-6">
          {beyond.map((item, i) => (
            <Reveal key={item.label} delay={i * 0.05}>
              <div className="h-full p-6 md:p-7 rounded-2xl border border-[var(--line)] hover:border-accent/50 transition-colors">
                <h3 className="text-lg font-semibold mb-2">{item.label}</h3>
                <p className="text-fg-dim leading-relaxed text-[15px]">
                  {item.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
