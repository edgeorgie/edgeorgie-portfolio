import { Reveal } from "./Reveal";
import { SectionHeader } from "./SectionHeader";
import { experience, leadership } from "@/data/content";

export function Experience() {
  return (
    <section id="experience" className="relative py-24 md:py-32 border-t border-line scroll-mt-16">
      <div className="max-w-6xl mx-auto px-6 md:px-10">
        <Reveal>
          <SectionHeader
            id="experience"
            title={
              <>
                Production engineering at <em>LATAM scale</em>.
              </>
            }
            lede="Sourced from the résumé only. Every bullet is something I owned, not something a team I sat near delivered."
          />
        </Reveal>

        <ol className="mt-14 md:mt-20 flex flex-col">
          {experience.map((job, i) => (
            <li key={job.company}>
              <Reveal delay={i * 0.05}>
                <div className="grid md:grid-cols-[240px_1fr] gap-5 md:gap-16 py-10 border-t border-line">
                  <div className="md:sticky md:top-24 md:self-start">
                    <h3 className="text-xl font-semibold tracking-tight">{job.company}</h3>
                    <p className="font-mono text-[12px] text-accent mt-2">{job.role}</p>
                    <p className="font-mono text-[12px] text-fg-dim mt-2 tnum">{job.period}</p>
                    <p className="font-mono text-[12px] text-fg-faint mt-0.5">{job.location}</p>
                  </div>
                  <div>
                    <p className="text-fg-dim leading-relaxed text-[15px] max-w-2xl">{job.summary}</p>
                    {job.bullets.length > 0 && (
                      <ul className="mt-6 flex flex-col gap-3 max-w-2xl">
                        {job.bullets.map((b) => (
                          <li key={b} className="text-fg-dim leading-relaxed text-[15px] pl-4 border-l border-line">
                            {b}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </Reveal>
            </li>
          ))}
        </ol>

        <Reveal>
          <div className="grid md:grid-cols-[240px_1fr] gap-5 md:gap-16 py-10 border-t border-line">
            <div>
              <h3 className="text-xl font-semibold tracking-tight">Leadership</h3>
              <p className="font-mono text-[12px] text-fg-faint mt-2">Before Mercado Libre</p>
            </div>
            <ul className="grid gap-6 sm:grid-cols-2 max-w-2xl">
              {leadership.map((l) => (
                <li key={l.org}>
                  <p className="text-fg text-[15px]">{l.org}</p>
                  <p className="font-mono text-[12px] text-fg-dim mt-1">
                    {l.role} · {l.period}
                  </p>
                  <p className="text-[14px] text-fg-dim leading-relaxed mt-2">{l.detail}</p>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
