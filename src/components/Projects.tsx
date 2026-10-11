import { Suspense } from "react";
import { Reveal } from "./Reveal";
import { SectionHeader } from "./SectionHeader";
import { ProjectCard } from "./ProjectCard";
import { RepoActivity } from "./RepoActivity";
import { Icon } from "./Icon";
import { experiments, projects } from "@/data/content";
import { links } from "@/lib/site";

export function Projects() {
  return (
    <section id="work" className="relative py-24 md:py-32 border-t border-line scroll-mt-16">
      <div className="max-w-6xl mx-auto px-6 md:px-10">
        <Reveal>
          <SectionHeader
            id="work"
            title={
              <>
                Six things you can <em>run today</em>.
              </>
            }
            lede="Each one is public with a repo or a live URL, and every number traces back to a committed benchmark, a CI run or the npm registry. Open a card for the problem, my role, the architecture and what was hard."
            aside={
              <a href={links.github} target="_blank" rel="noreferrer" className="btn">
                <Icon name="github" className="w-4 h-4" />
                All repositories
              </a>
            }
          />
        </Reveal>

        <div className="mt-14 md:mt-20 grid gap-5 md:grid-cols-2">
          {projects.map((p, i) => (
            <Reveal key={p.slug} delay={(i % 2) * 0.06} className="flex">
              <ProjectCard
                project={p}
                index={i}
                priority={i < 2}
                activity={
                  p.repo ? (
                    <Suspense fallback={null}>
                      <RepoActivity repo={p.repo} />
                    </Suspense>
                  ) : undefined
                }
              />
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-14 md:mt-16">
          <div className="grid gap-6 md:grid-cols-[220px_1fr] md:gap-12 border-t border-line pt-10">
            <div>
              <p className="kicker">Experiments</p>
              <p className="mt-3 text-sm text-fg-dim leading-relaxed">
                Smaller public repos, pinned on GitHub. Descriptions are the ones from their READMEs.
              </p>
            </div>
            <ul className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
              {experiments.map((x) => (
                <li key={x.name} className="flex flex-col gap-1">
                  <a href={x.href} target="_blank" rel="noreferrer" className="font-mono text-sm text-fg underline-link w-fit inline-flex items-center gap-1.5">
                    {x.name}
                    <Icon name="arrowUpRight" className="w-3.5 h-3.5 text-fg-faint" />
                  </a>
                  <p className="text-[13px] text-fg-dim leading-relaxed">{x.description}</p>
                  {x.note && <p className="font-mono text-[11px] text-fg-faint">{x.note}</p>}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
