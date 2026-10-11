"use client";

import { useState } from "react";
import Image from "next/image";
import { Reveal } from "./Reveal";
import { Icon } from "./Icon";
import { moreProjects, type Audience } from "@/data/content";

const AUDIENCE_LABEL: Record<Audience, string> = { humans: "for humans", agents: "for agents" };
const MOBILE_VISIBLE = 3;

/**
 * The rest of the public, non-fork repos as compact cards: a real screenshot
 * where there is a live UI, an honest text tile where there is none, the
 * repo's own description, and who it is built for. On phones the list shows
 * three cards and a toggle; from `sm` up every card is always visible, so
 * the toggle is purely a small-screen convenience.
 */
export function MoreProjects() {
  const [expanded, setExpanded] = useState(false);
  const hiddenCount = moreProjects.length - MOBILE_VISIBLE;

  return (
    <div className="border-t border-line pt-12">
      <Reveal>
        <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <p className="kicker">More projects</p>
            <h3 className="display text-3xl sm:text-4xl mt-4">
              Nine more, for <em>humans and agents</em>.
            </h3>
          </div>
          <p className="text-sm text-fg-dim max-w-sm md:text-right">
            Every public, non-fork repo that isn&rsquo;t a case study above, described in its own words. Previews are real
            screenshots of the live apps.
          </p>
        </div>
      </Reveal>

      <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" id="more-projects">
        {moreProjects.map((p, i) => (
          <li
            key={p.name}
            id={`repo-${p.name}`}
            className={`${i >= MOBILE_VISIBLE && !expanded ? "hidden sm:flex" : "flex"} scroll-mt-24`}
          >
            <Reveal delay={(i % 3) * 0.05} className="flex w-full">
              <article
                className="group panel-raised p-3.5 sm:p-4 flex flex-col gap-3 w-full transition-[border-color] duration-300 hover:border-line-strong"
                aria-labelledby={`repo-${p.name}-title`}
              >
                {p.preview ? (
                  <a
                    href={p.live ?? p.repo}
                    target="_blank"
                    rel="noreferrer"
                    className="relative block aspect-[16/10] overflow-hidden rounded-lg border border-line bg-bg-soft"
                    aria-label={`Open ${p.name} live (opens in a new tab)`}
                  >
                    <Image
                      src={p.preview.src}
                      alt={p.preview.alt}
                      width={p.preview.width}
                      height={p.preview.height}
                      sizes="(min-width: 1024px) 360px, (min-width: 640px) 45vw, 100vw"
                      loading="lazy"
                      className="h-full w-full object-cover object-top transition-transform duration-700 ease-[var(--ease-out-quart)] group-hover:scale-[1.02]"
                    />
                  </a>
                ) : (
                  <div className="panel aspect-[16/10] p-4 flex flex-col justify-between font-mono text-[11px] text-fg-dim">
                    <div className="flex items-center justify-between text-fg-faint">
                      <span>no UI</span>
                      <span>{p.language}</span>
                    </div>
                    <div>
                      <p className="text-fg text-sm">{p.kind}</p>
                      <p className="mt-1 text-fg-faint">$ gh repo clone edgeorgie/{p.name}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between gap-2">
                  <h4 id={`repo-${p.name}-title`} className="font-mono text-base text-fg tracking-tight">
                    {p.name}
                  </h4>
                  <span className="flex gap-1">
                    {p.audience.map((a) => (
                      <span key={a} className={`chip !px-2 !py-1 text-[10px] ${a === "agents" ? "chip-accent" : ""}`}>
                        {AUDIENCE_LABEL[a]}
                      </span>
                    ))}
                  </span>
                </div>

                <p className="text-[13.5px] text-fg-dim leading-relaxed">{p.description}</p>
                {p.note && <p className="font-mono text-[11px] text-fg-faint leading-snug">{p.note}</p>}

                <div className="mt-auto pt-1 flex flex-wrap items-center gap-x-4 gap-y-1.5 font-mono text-[12px]">
                  <span className="chip !px-2 !py-1 text-[10px]">
                    {p.kind} · {p.language}
                  </span>
                  <a href={p.repo} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-fg underline-link">
                    <Icon name="github" className="w-3.5 h-3.5 text-fg-dim" />
                    Source<span className="sr-only"> (opens in a new tab)</span>
                  </a>
                  {p.live && (
                    <a href={p.live} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-fg underline-link">
                      <Icon name="arrowUpRight" className="w-3.5 h-3.5 text-fg-dim" />
                      Live<span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  )}
                </div>
              </article>
            </Reveal>
          </li>
        ))}
      </ul>

      {hiddenCount > 0 && (
        <div className="mt-5 sm:hidden">
          <button
            type="button"
            onClick={() => setExpanded((e) => !e)}
            aria-expanded={expanded}
            aria-controls="more-projects"
            className="btn w-full"
          >
            {expanded ? "Show fewer" : `Show ${hiddenCount} more projects`}
            <Icon name="arrowDown" className={`w-4 h-4 transition-transform ${expanded ? "rotate-180" : ""}`} />
          </button>
        </div>
      )}
    </div>
  );
}
