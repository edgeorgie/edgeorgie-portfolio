import { Suspense } from "react";
import Link from "next/link";
import { Reveal } from "./Reveal";
import { SectionHeader } from "./SectionHeader";
import { ProjectCard } from "./ProjectCard";
import { RepoActivity } from "./RepoActivity";
import { Icon } from "./Icon";
import { projects, moreProjects } from "@/data/content";
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
            lede="Six case studies you can run today. All public: a repo, a live URL or an npm package. Every number traces back to a committed benchmark, a CI run or the registry. Expand a card for the problem, my role, the architecture and what was hard."
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

        {/* The nine smaller repos live on /projects: inline they carried 47% of
            the page's words and buried the six case studies above. */}
        <div className="mt-14 md:mt-20 border-t border-line pt-12">
          <Reveal>
            <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
              <div>
                <p className="kicker">More projects</p>
                <h3 className="display text-3xl sm:text-4xl mt-4">
                  {moreProjects.length} more, for <em>humans and agents</em>.
                </h3>
                <p className="text-sm text-fg-dim max-w-xl mt-4">
                  The public, non-fork repos that aren&rsquo;t a case study above — MCP servers, CLIs, evals and web
                  apps, each with a repo, a live URL or an npm package.
                </p>
              </div>
              <Link
                href="/projects"
                className="btn"
                data-track="nav_clicked"
                data-track-target="all-projects"
              >
                See all {moreProjects.length}
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
