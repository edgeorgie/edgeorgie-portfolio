import { Reveal } from "./Reveal";
import { SectionHeader } from "./SectionHeader";
import { Icon } from "./Icon";
import { achievements, projects, skillGroups } from "@/data/content";
import { person } from "@/lib/site";

const projectName = (slug: string) => projects.find((p) => p.slug === slug)?.name ?? slug;

/**
 * The "character sheet": capabilities grouped by what they let me do, each
 * skill marked with where it was used (production at Mercado Libre, or a
 * public project on this page). No self-rated bars: every mark is evidence.
 */
export function Skills() {
  return (
    <section id="skills" className="relative py-24 md:py-32 border-t border-line scroll-mt-16">
      <div className="max-w-6xl mx-auto px-6 md:px-10">
        <Reveal>
          <SectionHeader
            id="skills"
            title={
              <>
                Capabilities, with <em>receipts</em>.
              </>
            }
            lede={
              <>
                No self-rated bars. A filled dot means I&rsquo;ve used it in production at {person.company}; a project name
                means the code is on this page.
              </>
            }
          />
        </Reveal>

        <div className="mt-14 md:mt-20 grid gap-8 lg:grid-cols-[320px_1fr] lg:gap-12 items-start">
          {/* class card */}
          <Reveal className="lg:sticky lg:top-24">
            <div className="panel-raised p-6 flex flex-col gap-6">
              <div>
                <p className="kicker">Character sheet</p>
                <h3 className="display text-3xl mt-3">{person.name}</h3>
              </div>
              <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2.5 font-mono text-[12px]">
                <Row k="class" v="Full-stack engineer" />
                <Row k="spec" v="AI agents · cross-platform UI" />
                <Row k="level" v="5+ yrs in production" />
                <Row k="base" v={`${person.location} · ${person.timezoneLabel}`} />
                <Row k="status" v={person.availability} />
                <Row k="langs" v="TypeScript · JS · Kotlin · Swift · Python" />
              </dl>
              <div className="border-t border-line pt-5">
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-fg-faint mb-3">Unlocked · achievements</p>
                <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                  {achievements.map((a) => (
                    <li key={a.id} className="flex gap-3">
                      <span className="inline-flex items-center justify-center w-8 h-8 shrink-0 rounded-lg border border-accent/40 text-accent bg-accent/5">
                        <Icon name={a.icon} className="w-4 h-4" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-[13px] text-fg leading-snug">{a.title}</p>
                        <p className="text-[12px] text-fg-dim leading-snug mt-0.5">{a.detail}</p>
                        <a href={a.source.href} target="_blank" rel="noreferrer" className="font-mono text-[10.5px] text-fg-faint underline-link">
                          source: {a.source.label} ↗
                        </a>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Reveal>

          {/* skill groups */}
          <div className="grid gap-4 md:grid-cols-2">
            {skillGroups.map((g, i) => {
              const seenIn = Array.from(new Set(g.skills.flatMap((s) => s.projects ?? [])));
              return (
                <Reveal key={g.id} delay={(i % 2) * 0.05} className="flex">
                  <div className="panel p-5 flex flex-col gap-4 w-full">
                    <div>
                      <h3 className="font-mono text-sm text-fg">{g.name}</h3>
                      <p className="text-[13px] text-fg-dim mt-1 leading-relaxed">{g.blurb}</p>
                    </div>
                    <ul className="flex flex-wrap gap-1.5">
                      {g.skills.map((s) => (
                        <li
                          key={s.name}
                          className="chip chip-wrap"
                          title={[
                            s.prod ? `Used in production at ${person.company}` : null,
                            s.projects?.length ? `Projects: ${s.projects.map(projectName).join(", ")}` : null,
                          ]
                            .filter(Boolean)
                            .join(" · ")}
                        >
                          <span
                            className={`inline-block w-1.5 h-1.5 rounded-full ${s.prod ? "bg-accent" : "border border-fg-faint"}`}
                            aria-hidden="true"
                          />
                          <span className="whitespace-normal">{s.name}</span>
                          {s.prod && <span className="sr-only"> (used in production)</span>}
                        </li>
                      ))}
                    </ul>
                    {seenIn.length > 0 && (
                      <p className="font-mono text-[11px] text-fg-faint leading-relaxed mt-auto">
                        seen in:{" "}
                        {seenIn.map((slug, j) => (
                          <span key={slug}>
                            <a href={`#project-${slug}`} className="text-fg-dim underline-link">
                              {projectName(slug)}
                            </a>
                            {j < seenIn.length - 1 ? " · " : ""}
                          </span>
                        ))}
                      </p>
                    )}
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <>
      <dt className="text-fg-faint uppercase tracking-[0.12em] text-[10px] pt-0.5">{k}</dt>
      <dd className="text-fg-dim">{v}</dd>
    </>
  );
}
