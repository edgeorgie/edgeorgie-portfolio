"use client";

import { Reveal } from "./Reveal";
import { experience } from "@/data/content";

export function Experience() {
  return (
    <section
      id="experience"
      className="relative py-28 md:py-36 border-t border-[var(--line)]"
    >
      <div className="max-w-6xl mx-auto px-6 md:px-10">
        <Reveal>
          <p className="mono text-xs text-accent uppercase tracking-widest mb-3">
            03 · Experience
          </p>
          <h2 className="text-4xl md:text-6xl font-semibold tracking-tight max-w-3xl">
            Shipping agent systems at LATAM scale.
          </h2>
        </Reveal>

        <div className="mt-16 flex flex-col">
          {experience.map((job, i) => (
            <Reveal key={job.company} delay={i * 0.05}>
              <div className="grid md:grid-cols-[220px_1fr] gap-6 md:gap-16 py-10 border-t border-[var(--line)] first:border-t-0">
                <div>
                  <h3 className="text-xl font-semibold">{job.company}</h3>
                  <p className="mono text-xs text-fg-dim mt-2">{job.period}</p>
                  <p className="mono text-xs text-fg-dim/70 mt-1">
                    {job.location}
                  </p>
                </div>
                <div>
                  <p className="text-accent text-sm mono mb-3">{job.role}</p>
                  {job.bullets.length > 0 ? (
                    <ul className="flex flex-col gap-2.5">
                      {job.bullets.map((b) => (
                        <li
                          key={b}
                          className="text-fg-dim leading-relaxed text-[15px] pl-4 border-l border-[var(--line)]"
                        >
                          {b}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-fg-dim leading-relaxed text-[15px]">
                      {job.summary}
                    </p>
                  )}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
