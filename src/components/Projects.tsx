import { Suspense } from "react";
import { Reveal } from "./Reveal";
import { SectionHeader } from "./SectionHeader";
import { ProjectCard } from "./ProjectCard";
import { RepoActivity } from "./RepoActivity";
import { Icon } from "./Icon";
import { projects } from "@/data/content";
import { MoreProjects } from "./MoreProjects";
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
            lede="Six case studies, then nine more projects below. All public: a repo, a live URL or an npm package. Every number traces back to a committed benchmark, a CI run or the registry. Expand a card for the problem, my role, the architecture and what was hard."
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

        <div className="mt-14 md:mt-20">
          <MoreProjects />
        </div>
      </div>
    </section>
  );
}
