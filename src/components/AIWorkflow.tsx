"use client";

import { useId, useState } from "react";
import { m, AnimatePresence } from "framer-motion";
import { Reveal } from "./Reveal";
import { SectionHeader } from "./SectionHeader";
import { Icon, type IconName } from "./Icon";
import { aiWorkflowPrinciples, type PrincipleIcon } from "@/data/content";

/* ------------------------------------------------------------------ */
/* Principle tiles: icon + short label, full sentence behind a toggle. */
/* ------------------------------------------------------------------ */

function PrincipleTile({ lead, icon, body, index }: { lead: string; icon: PrincipleIcon; body: string; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <Reveal delay={(index % 3) * 0.05} y={18}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className={`group w-full h-full text-left rounded-xl border px-4 py-5 flex flex-col gap-3 transition-colors duration-300 ${
          open ? "border-accent bg-accent/5" : "border-line bg-bg-soft hover:border-line-strong"
        }`}
      >
        <div className="flex items-center justify-between">
          <span
            className={`inline-flex items-center justify-center w-9 h-9 rounded-lg border transition-colors duration-300 ${
              open ? "border-accent text-accent" : "border-line text-fg-dim"
            }`}
          >
            <Icon name={icon} />
          </span>
          <span className="font-mono text-[10px] text-fg-faint tnum">{String(index + 1).padStart(2, "0")}</span>
        </div>
        <h3 className="text-base font-semibold text-fg tracking-tight leading-snug">{lead}</h3>
        <AnimatePresence initial={false}>
          {open && (
            <m.p
              key="body"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="text-[13px] text-fg-dim leading-relaxed overflow-hidden"
            >
              {body}
            </m.p>
          )}
        </AnimatePresence>
        <span className="font-mono text-[10px] text-fg-faint group-hover:text-accent transition-colors mt-auto">{open ? "hide" : "read"}</span>
      </button>
    </Reveal>
  );
}

/* ------------------------------------------------------------------ */
/* Flow diagram: a vertical stepper of tappable nodes. Flow is shown   */
/* with a CSS stroke-dash animation (.flow-line) rather than JS-driven */
/* particles, so it costs nothing on the main thread and the global    */
/* reduced-motion rule stops it automatically.                         */
/* ------------------------------------------------------------------ */

function Arrow({ dashed = false }: { dashed?: boolean }) {
  return (
    <svg width="20" height="28" viewBox="0 0 20 28" className="text-fg-faint shrink-0" aria-hidden="true">
      <line x1="10" y1="0" x2="10" y2="20" stroke="currentColor" strokeWidth="1.5" strokeDasharray={dashed ? "3 3" : undefined} />
      <line x1="10" y1="0" x2="10" y2="20" stroke="var(--color-accent)" strokeWidth="1.5" className="flow-line" opacity="0.8" />
      <path d="M4 18 L10 26 L16 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function FlowNode({
  icon,
  title,
  caption,
  tone = "default",
  compact = false,
  id,
  href,
  onVisit,
}: {
  icon: IconName;
  title: string;
  caption: string;
  tone?: "default" | "accent" | "dim";
  compact?: boolean;
  id: string;
  href?: string;
  onVisit?: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const borderTone = tone === "accent" ? "border-accent/70 text-accent" : tone === "dim" ? "border-line text-fg-dim" : "border-line text-fg";
  return (
    <m.button
      type="button"
      whileTap={{ scale: 0.97 }}
      onClick={() => {
        setOpen((o) => !o);
        onVisit?.(id);
      }}
      aria-expanded={open}
      className={`relative flex flex-col items-center justify-center gap-1.5 text-center rounded-xl border bg-bg px-3 ${
        compact ? "py-3 min-w-[84px]" : "py-4 min-w-[140px]"
      } ${borderTone} ${open ? "shadow-[0_0_0_1px_var(--color-accent)]" : ""} transition-shadow duration-300`}
    >
      <Icon name={icon} className={compact ? "w-4 h-4" : "w-5 h-5"} />
      <span className={`font-mono ${compact ? "text-[10px]" : "text-[11px]"} leading-tight`}>{title}</span>
      <AnimatePresence initial={false}>
        {open && (
          <m.span
            key="cap"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="font-mono text-[10px] text-fg-dim leading-snug overflow-hidden max-w-[150px] flex flex-col items-center gap-1"
          >
            <span>{caption}</span>
            {href && (
              <a href={href} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="text-accent hover:underline">
                open ↗
              </a>
            )}
          </m.span>
        )}
      </AnimatePresence>
    </m.button>
  );
}

function LaneLabel({ children }: { children: React.ReactNode }) {
  return <span className="kicker text-[11px] mb-1">{children}</span>;
}

function BranchLabel({ children }: { children: React.ReactNode }) {
  return <span className="font-mono text-[10px] text-fg-faint -mb-0.5">{children}</span>;
}

const TASKS: { icon: IconName; title: string; caption: string; id: string; href?: string }[] = [
  { icon: "task", title: "triage-desk", caption: "webhook-triggered GitHub issue triage bot — real webhooks, not a clicked demo", id: "task-triage", href: "https://github.com/edgeorgie/triage-desk" },
  { icon: "task", title: "eval-lab", caption: "CLI + GitHub Action that evals prompts/agents — gates triage-desk's own CI", id: "task-evallab", href: "https://github.com/edgeorgie/eval-lab" },
  { icon: "task", title: "repoask-mcp", caption: "MCP server, ask any public GitHub repo — routes through the cold-context critic before done", id: "task-repoask", href: "https://repoask-mcp.vercel.app" },
  { icon: "task", title: "ask-edgeorgie-mcp", caption: "MCP server about this candidate — resume/projects as the retrieval corpus", id: "task-askme", href: "https://ask-edgeorgie-mcp.vercel.app" },
  { icon: "task", title: "crispy-profiling", caption: "React re-render profiler — CLI + Action + MCP + Agent Skill, published to npm", id: "task-crispy", href: "https://www.npmjs.com/package/crispy-profiling" },
];

const TOTAL_NODES = 9 + TASKS.length;

/** Fan-out/fan-in connector drawn with real lines; flow via CSS dash animation. */
function FanConnector({ direction }: { direction: "out" | "in" }) {
  const xs = [10, 30, 50, 70, 90];
  return (
    <svg viewBox="0 0 100 26" preserveAspectRatio="none" className="w-full max-w-[420px] sm:max-w-none h-6 text-fg-faint" aria-hidden="true">
      {xs.map((x) => {
        const d = direction === "out" ? `M50 0 C50 10, ${x} 10, ${x} 26` : `M${x} 0 C${x} 16, 50 16, 50 26`;
        return (
          <g key={x}>
            <path d={d} fill="none" stroke="currentColor" strokeWidth="1" vectorEffect="non-scaling-stroke" />
            <path d={d} fill="none" stroke="var(--color-accent)" strokeWidth="1" vectorEffect="non-scaling-stroke" className="flow-line" opacity="0.7" />
          </g>
        );
      })}
    </svg>
  );
}

function WorkflowDiagram() {
  const [visited, setVisited] = useState<Set<string>>(new Set());
  const descId = useId();
  const markVisited = (id: string) =>
    setVisited((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      return next;
    });

  return (
    <div className="panel p-5 md:p-10 flex flex-col items-center" role="group" aria-label="Workflow diagram" aria-describedby={descId}>
      <p id={descId} className="sr-only">
        Two-layer workflow. Operator layer: a cron scheduler feeds a change-detection gate that routes to either a quiet log or a real
        alert. Builder layer: a dispatcher fans out through a pre-execution guard into five parallel projects (triage-desk, eval-lab,
        repoask-mcp, ask-edgeorgie-mcp, crispy-profiling) that converge on one shared audit-trail log; repoask-mcp routes through a
        cold-context critic before being marked done. Each node is a button that reveals a one-line description.
      </p>
      <div className="w-full flex items-center justify-between mb-5">
        <LaneLabel>Operator · always-on</LaneLabel>
        <span className="font-mono text-[10px] text-fg-faint tnum" aria-live="polite">
          {visited.size} of {TOTAL_NODES} nodes explored
        </span>
      </div>
      <FlowNode id="cron" icon="clock" title="cron scheduler" caption="runs on a fixed schedule" onVisit={markVisited} />
      <Arrow />
      <FlowNode id="gate" icon="gate" title="change detected?" caption="cheap, deterministic check — gates the expensive run" tone="accent" onVisit={markVisited} />

      <div className="flex items-start gap-8 mt-1">
        <div className="flex flex-col items-center">
          <BranchLabel>no</BranchLabel>
          <Arrow />
          <FlowNode id="quiet-log" icon="file" title="quiet log" caption="routine run, no ping" tone="dim" compact onVisit={markVisited} />
        </div>
        <div className="flex flex-col items-center">
          <BranchLabel>yes</BranchLabel>
          <Arrow />
          <FlowNode id="real-alert" icon="bell" title="real alert" caption="human-only blocker" tone="accent" compact onVisit={markVisited} />
        </div>
      </div>

      <div className="my-10 h-px w-16 bg-line" aria-hidden="true" />

      <LaneLabel>Builder · bursts</LaneLabel>
      <FlowNode id="dispatcher" icon="fork" title="dispatcher" caption="decomposes work into independent pieces" onVisit={markVisited} />
      <Arrow dashed />
      <FlowNode id="guard" icon="shield" title="guard" caption="pre-execution check, before anything runs" tone="accent" onVisit={markVisited} />

      <FanConnector direction="out" />

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 w-full max-w-[420px] sm:max-w-none justify-items-center">
        {TASKS.map((t) => (
          <FlowNode key={t.id} {...t} compact onVisit={markVisited} />
        ))}
      </div>

      <FanConnector direction="in" />

      <FlowNode
        id="audit-log"
        icon="db"
        title="audit-trail log"
        caption="one shared log — every project writes its evidence here (progress.log / RELIABILITY-REPORT.md)"
        tone="accent"
        onVisit={markVisited}
      />

      <div className="flex flex-col items-center mt-8 pt-6 border-t border-dashed border-line w-full max-w-[260px]">
        <BranchLabel>repoask-mcp only, before marked done</BranchLabel>
        <Arrow dashed />
        <FlowNode id="critic" icon="critic" title="critic" caption="cold context — zero shared history, no benefit of the doubt" tone="accent" compact onVisit={markVisited} />
        <Arrow dashed />
        <FlowNode id="done" icon="check" title="done" caption="only after the critic pass clears it" compact onVisit={markVisited} />
      </div>

      <p className="font-mono text-[10px] text-fg-faint mt-8 text-center">tap any node to see what it does</p>
    </div>
  );
}

export function AIWorkflow() {
  return (
    <section id="ai-workflow" className="relative py-24 md:py-32 border-t border-line scroll-mt-16">
      <div className="max-w-6xl mx-auto px-6 md:px-10">
        <Reveal>
          <SectionHeader
            id="ai-workflow"
            title={
              <>
                AI, run like <em>production</em>.
              </>
            }
            lede="Not a chat window. An orchestration layer with its own operating discipline: scheduled, gated, parallel, verified and reviewed cold, the same way I run any system I'm accountable for. Every project above went through it."
          />
        </Reveal>

        <Reveal delay={0.05} className="mt-14 md:mt-20">
          <WorkflowDiagram />
        </Reveal>

        <div className="mt-10 grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          {aiWorkflowPrinciples.map((p, i) => (
            <PrincipleTile key={p.lead} lead={p.lead} icon={p.icon} body={p.body} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
