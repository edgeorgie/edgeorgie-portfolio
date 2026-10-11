import type { ReactNode } from "react";
import type { Project, EvidenceKind } from "@/data/content";
import { withUtm } from "@/lib/site";
import { Icon, type IconName } from "./Icon";
import { ProjectPreviewView } from "./ProjectPreviews";

const EVIDENCE_ICON: Record<EvidenceKind, IconName> = {
  repo: "github",
  live: "arrowUpRight",
  run: "play",
  pr: "fork",
  npm: "npm",
  endpoint: "terminal",
};

const TIER_CLASS: Record<Project["tier"], string> = {
  live: "chip-accent",
  published: "border-info/40 text-info bg-info/5",
  shipped: "border-line-strong text-fg-dim",
};

/**
 * One case study. Server component; only the interactive previews are
 * client code. Technical depth sits behind a native <details> so a recruiter
 * scans the card in seconds and an engineer can open the architecture
 * notes without any JavaScript.
 */
export function ProjectCard({
  project,
  index,
  activity,
}: {
  project: Project;
  index: number;
  activity?: ReactNode;
}) {
  const p = project;
  return (
    <article
      id={`project-${p.slug}`}
      className="group panel-raised p-4 sm:p-6 flex flex-col gap-5 scroll-mt-24 transition-[border-color] duration-300 hover:border-line-strong"
      aria-labelledby={`project-${p.slug}-title`}
    >
      <div className="flex items-center justify-between gap-3">
        <span className={`chip ${TIER_CLASS[p.tier]}`}>
          {p.tier === "live" && <span className="relative inline-flex h-1.5 w-1.5 live-dot"><span className="relative rounded-full h-1.5 w-1.5 bg-current" /></span>}
          {p.tierLabel}
        </span>
        <span className="font-mono text-[11px] text-fg-faint tnum">{String(index + 1).padStart(2, "0")}</span>
      </div>

      <ProjectPreviewView preview={p.preview} />

      <div>
        <h3 id={`project-${p.slug}-title`} className="font-mono text-xl sm:text-2xl text-fg tracking-tight">
          {p.name}
        </h3>
        <p className="mt-2 text-fg-dim leading-relaxed text-[15px]">{p.tagline}</p>
      </div>

      <dl className="grid grid-cols-2 gap-px bg-line rounded-xl overflow-hidden border border-line">
        {p.stats.map((s) => (
          <div key={s.label} className="bg-bg p-3.5 flex flex-col gap-1">
            <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-fg-faint">{s.label}</dt>
            <dd className="font-mono text-lg text-accent tnum leading-none">{s.value}</dd>
            {s.sub && <dd className="text-[11px] text-fg-faint leading-snug">{s.sub}</dd>}
          </div>
        ))}
      </dl>

      <div className="flex flex-wrap gap-1.5">
        {p.stack.map((s) => (
          <span key={s} className="chip">
            {s}
          </span>
        ))}
      </div>

      <details className="disclosure group/d rounded-xl border border-line bg-bg/60" data-track="project_opened" data-track-slug={p.slug}>
        <summary className="flex items-center justify-between gap-3 px-4 py-3 font-mono text-[12px] text-fg-dim hover:text-fg transition-colors">
          <span>Case study: problem, role, architecture, challenges</span>
          <Icon name="plus" className="disclosure-icon w-4 h-4 shrink-0" />
        </summary>
        <div className="px-4 pb-5 pt-1 flex flex-col gap-5 text-[14px] leading-relaxed text-fg-dim">
          <Block label="Problem">
            <p>{p.problem}</p>
          </Block>
          <Block label="Role">
            <p>{p.role}</p>
          </Block>
          <Block label="Architecture & decisions">
            <ul className="flex flex-col gap-2">
              {p.architecture.map((a) => (
                <li key={a} className="pl-4 border-l border-line">
                  {a}
                </li>
              ))}
            </ul>
          </Block>
          <Block label="Engineering challenges">
            <ul className="flex flex-col gap-2">
              {p.challenges.map((c) => (
                <li key={c} className="pl-4 border-l border-line">
                  {c}
                </li>
              ))}
            </ul>
          </Block>
        </div>
      </details>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-1 mt-auto">
        {p.evidence.map((e) => (
          <a
            key={e.href}
            href={e.kind === "live" ? withUtm(e.href) : e.href}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 font-mono text-[12.5px] text-fg underline-link"
            data-track="evidence_clicked"
            data-track-slug={p.slug}
            data-track-kind={e.kind}
          >
            <Icon name={EVIDENCE_ICON[e.kind]} className="w-3.5 h-3.5 text-fg-dim" />
            {e.label}
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        ))}
        <span className="ml-auto">{activity}</span>
      </div>
    </article>
  );
}

function Block({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-fg-faint mb-2">{label}</p>
      {children}
    </div>
  );
}
