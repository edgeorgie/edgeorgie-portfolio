"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Reveal } from "./Reveal";
import { aiWorkflowPrinciples, type PrincipleIcon } from "@/data/content";

/* ------------------------------------------------------------------ */
/* Icon set — tiny inline SVGs, stroke-only, inherit currentColor so  */
/* they pick up the card's text color automatically.                  */
/* ------------------------------------------------------------------ */

function Icon({ name, className = "w-5 h-5" }: { name: IconName; className?: string }) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
  };
  switch (name) {
    case "split":
      return (
        <svg {...common}>
          <circle cx="6" cy="6" r="2.4" />
          <circle cx="6" cy="18" r="2.4" />
          <circle cx="18" cy="12" r="2.4" />
          <path d="M8.1 7.1 15.9 11M8.1 16.9 15.9 13" />
        </svg>
      );
    case "parallel":
      return (
        <svg {...common}>
          <path d="M4 6h16M4 12h16M4 18h16" />
          <path d="M20 6l-2-2m2 2-2 2M20 12l-2-2m2 2-2 2M20 18l-2-2m2 2-2 2" />
        </svg>
      );
    case "skill":
      return (
        <svg {...common}>
          <path d="M5 4h11l3 3v13H5z" />
          <path d="M9 9h6M9 13h6M9 17h3" />
        </svg>
      );
    case "gate":
      return (
        <svg {...common}>
          <path d="M12 3 21 12 12 21 3 12Z" />
          <path d="M12 9v6" />
        </svg>
      );
    case "scale":
      return (
        <svg {...common}>
          <path d="M12 3v18M7 7h10M4.5 7 7 13.5 9.5 7M14.5 7 17 13.5 19.5 7" />
        </svg>
      );
    case "check":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="m8 12.5 2.6 2.6L16.2 9" />
        </svg>
      );
    case "critic":
      return (
        <svg {...common}>
          <circle cx="11" cy="11" r="6.5" />
          <path d="m20 20-4.3-4.3" />
          <path d="M9 11h4" />
        </svg>
      );
    case "shield":
      return (
        <svg {...common}>
          <path d="M12 3 20 6.5V12c0 5-3.4 8-8 9-4.6-1-8-4-8-9V6.5Z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      );
    case "bolt":
      return (
        <svg {...common}>
          <path d="M13 3 5 13.5h6L10 21l9-11h-6.5Z" />
        </svg>
      );
    case "clock":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3.2 2" />
        </svg>
      );
    case "file":
      return (
        <svg {...common}>
          <path d="M6 3h8l4 4v14H6z" />
          <path d="M9 12h6M9 16h6" />
        </svg>
      );
    case "bell":
      return (
        <svg {...common}>
          <path d="M6 10a6 6 0 1 1 12 0c0 4 1.5 5.5 1.5 5.5h-15S6 14 6 10Z" />
          <path d="M10 19a2 2 0 0 0 4 0" />
        </svg>
      );
    case "fork":
      return (
        <svg {...common}>
          <circle cx="6" cy="6" r="2" />
          <circle cx="6" cy="18" r="2" />
          <circle cx="18" cy="12" r="2" />
          <path d="M8 6h4a4 4 0 0 1 4 4M8 18h4a4 4 0 0 0 4-4" />
        </svg>
      );
    case "db":
      return (
        <svg {...common}>
          <ellipse cx="12" cy="6" rx="7" ry="3" />
          <path d="M5 6v12c0 1.7 3.1 3 7 3s7-1.3 7-3V6" />
          <path d="M5 12c0 1.7 3.1 3 7 3s7-1.3 7-3" />
        </svg>
      );
    case "task":
      return (
        <svg {...common}>
          <rect x="4" y="4" width="16" height="16" rx="2.5" />
          <path d="m8.5 12 2.2 2.2L16 9" />
        </svg>
      );
    default:
      return null;
  }
}

type IconName =
  | PrincipleIcon
  | "clock"
  | "file"
  | "bell"
  | "fork"
  | "db"
  | "task";

/* ------------------------------------------------------------------ */
/* Principle cards — icon + 2-4 word label, full sentence hidden      */
/* behind a tap/hover reveal so the default view is almost all        */
/* visual. Scroll-in animation reuses the site's existing Reveal      */
/* pattern (same easing/duration as Projects/Hero) for consistency.   */
/* ------------------------------------------------------------------ */

function PrincipleTile({
  lead,
  icon,
  body,
  index,
  tapCopy,
  collapseCopy,
}: {
  lead: string;
  icon: PrincipleIcon;
  body: string;
  index: number;
  tapCopy: string;
  collapseCopy: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Reveal delay={(index % 3) * 0.05} y={18}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className={`group w-full h-full text-left rounded-xl border px-4 py-5 flex flex-col gap-3 transition-colors duration-300 ${
          open ? "border-accent bg-accent/5" : "border-[var(--line)] bg-bg-soft hover:border-accent/50"
        }`}
      >
        <div className="flex items-center justify-between">
          <span
            className={`inline-flex items-center justify-center w-9 h-9 rounded-lg border transition-colors duration-300 ${
              open ? "border-accent text-accent" : "border-[var(--line)] text-fg-dim"
            }`}
          >
            <Icon name={icon} />
          </span>
          <span className="mono text-[10px] text-fg-dim/60">{String(index + 1).padStart(2, "0")}</span>
        </div>

        <h3 className="text-base font-semibold text-fg tracking-tight leading-snug">{lead}</h3>

        <AnimatePresence initial={false}>
          {open && (
            <motion.p
              key="body"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="text-xs text-fg-dim leading-relaxed overflow-hidden"
            >
              {body}
            </motion.p>
          )}
        </AnimatePresence>

        <span className="mono text-[10px] text-fg-dim/50 group-hover:text-accent/70 transition-colors mt-auto">
          {open ? collapseCopy : tapCopy}
        </span>
      </button>
    </Reveal>
  );
}

/* ------------------------------------------------------------------ */
/* Flow diagram — mobile-first vertical stepper. Every node is a      */
/* small tappable card; arrows connect every step top-to-bottom so    */
/* the full flow is traceable at a glance, at any viewport width.     */
/* Branches (gate -> quiet/alert, fan-out, critic loop) render as     */
/* small side-by-side groups instead of a fixed-width SVG canvas, so  */
/* nothing ever needs horizontal scrolling or shrinking to fit.       */
/* ------------------------------------------------------------------ */

function Arrow({ dashed = false }: { dashed?: boolean }) {
  return (
    <svg
      width="20"
      height="28"
      viewBox="0 0 20 28"
      className="text-fg-dim/70 shrink-0"
      aria-hidden="true"
    >
      <line
        x1="10"
        y1="0"
        x2="10"
        y2="20"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeDasharray={dashed ? "3 3" : undefined}
      />
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
  onVisit,
}: {
  icon: IconName;
  title: string;
  caption: string;
  tone?: "default" | "accent" | "dim";
  compact?: boolean;
  id: string;
  onVisit?: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const borderTone =
    tone === "accent" ? "border-accent/70 text-accent" : tone === "dim" ? "border-[var(--line)] text-fg-dim" : "border-[var(--line)] text-fg";

  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.97 }}
      onClick={() => {
        setOpen((o) => !o);
        onVisit?.(id);
      }}
      aria-expanded={open}
      className={`relative flex flex-col items-center justify-center gap-1.5 text-center rounded-xl border bg-bg px-3 ${
        compact ? "py-3 min-w-[84px]" : "py-4 min-w-[140px]"
      } ${borderTone} ${open ? "shadow-[0_0_0_1px_var(--accent)]" : ""} transition-shadow duration-300`}
    >
      <Icon name={icon} className={compact ? "w-4 h-4" : "w-5 h-5"} />
      <span className={`mono ${compact ? "text-[10px]" : "text-[11px]"} leading-tight`}>{title}</span>
      <AnimatePresence initial={false}>
        {open && (
          <motion.span
            key="cap"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mono text-[9.5px] text-fg-dim leading-snug overflow-hidden max-w-[140px]"
          >
            {caption}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

function LaneLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="mono text-[11px] text-accent uppercase tracking-[0.2em] mb-1">{children}</span>
  );
}

function BranchLabel({ children }: { children: React.ReactNode }) {
  return <span className="mono text-[10px] text-fg-dim/70 -mb-0.5">{children}</span>;
}

const TASKS: { icon: IconName; title: string; caption: string; id: string }[] = [
  { icon: "task", title: "task A", caption: "independent workstream, no shared state", id: "task-a" },
  { icon: "task", title: "task B", caption: "independent workstream, no shared state", id: "task-b" },
  { icon: "task", title: "task C", caption: "routes through the cold-context critic before done", id: "task-c" },
  { icon: "task", title: "task D", caption: "independent workstream, no shared state", id: "task-d" },
];

const ALL_NODE_IDS = [
  "cron",
  "gate",
  "quiet-log",
  "real-alert",
  "dispatcher",
  "guard",
  ...TASKS.map((t) => t.id),
  "audit-log",
  "critic",
  "done",
];
const TOTAL_NODES = ALL_NODE_IDS.length;

/* Fan-out/fan-in connector: draws real lines from "guard" down to each of  */
/* the 4 task boxes, and from each task box back down to "audit-trail log" */
/* — instead of relying on prose/proximity to imply the parallel spread.   */
function FanConnector({ direction }: { direction: "out" | "in" }) {
  // 4 branches, evenly spaced across the row width, meeting at a single
  // trunk point at top (fan-out) or bottom (fan-in).
  const xs = [12.5, 37.5, 62.5, 87.5];
  return (
    <svg
      viewBox="0 0 100 26"
      preserveAspectRatio="none"
      className="w-full max-w-[420px] sm:max-w-none h-6 text-fg-dim/70"
      aria-hidden="true"
    >
      {xs.map((x) =>
        direction === "out" ? (
          <path key={x} d={`M50 0 C50 10, ${x} 10, ${x} 26`} fill="none" stroke="currentColor" strokeWidth="1" />
        ) : (
          <path key={x} d={`M${x} 0 C${x} 16, 50 16, 50 26`} fill="none" stroke="currentColor" strokeWidth="1" />
        )
      )}
    </svg>
  );
}

function WorkflowDiagram() {
  const [visited, setVisited] = useState<Set<string>>(new Set());
  const markVisited = (id: string) =>
    setVisited((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      return next;
    });

  return (
    <div
      className="glass-panel rounded-xl p-5 md:p-10 flex flex-col items-center"
      role="img"
      aria-label="Two-layer workflow: a cron scheduler feeds a change-detection gate that routes to either a quiet log or a real alert. Separately, a dispatcher fans out through a pre-execution guard into four parallel tasks that converge on one shared audit-trail log, with one task routing through a cold-context critic before being marked done. Tap any node for detail."
    >
      <div className="w-full flex items-center justify-between mb-5">
        <LaneLabel>Operator · always-on</LaneLabel>
        <span className="mono text-[10px] text-fg-dim/60" aria-live="polite">
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

      <div className="my-10 h-px w-16 bg-[var(--line)]" aria-hidden="true" />

      <LaneLabel>Builder · bursts</LaneLabel>
      <FlowNode id="dispatcher" icon="fork" title="dispatcher" caption="decomposes work into independent pieces" onVisit={markVisited} />
      <Arrow dashed />
      <FlowNode id="guard" icon="shield" title="guard" caption="pre-execution check, before anything runs" tone="accent" onVisit={markVisited} />

      <FanConnector direction="out" />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 w-full max-w-[420px] sm:max-w-none justify-items-center">
        {TASKS.map((t) => (
          <FlowNode key={t.id} {...t} compact onVisit={markVisited} />
        ))}
      </div>

      <FanConnector direction="in" />

      <FlowNode id="audit-log" icon="db" title="audit-trail log" caption="one shared log — every task writes its evidence here" tone="accent" onVisit={markVisited} />

      <div className="flex flex-col items-center mt-8 pt-6 border-t border-dashed border-[var(--line)] w-full max-w-[260px]">
        <BranchLabel>task C only, before marked done</BranchLabel>
        <Arrow dashed />
        <FlowNode id="critic" icon="critic" title="critic" caption="cold context — zero shared history, no benefit of the doubt" tone="accent" compact onVisit={markVisited} />
        <Arrow dashed />
        <FlowNode id="done" icon="check" title="done" caption="only after the critic pass clears it" compact onVisit={markVisited} />
      </div>

      <p className="mono text-[10px] text-fg-dim/60 mt-8 text-center">tap any node to see what it does</p>
    </div>
  );
}

export function AIWorkflow() {
  return (
    <section id="ai-workflow" className="relative py-28 md:py-36 border-t border-[var(--line)]">
      <div className="max-w-6xl mx-auto px-6 md:px-10">
        <Reveal>
          <p className="mono text-xs text-accent uppercase tracking-widest mb-3">
            04 &middot; How I use AI
          </p>
          <h2 className="text-4xl md:text-6xl font-semibold tracking-tight max-w-3xl">
            How I use AI on a daily basis.
          </h2>
          <p className="mt-5 text-fg-dim max-w-xl text-lg">
            I treat it as an orchestration layer with its own operating discipline, built
            the same way I&apos;d build any system I&apos;m accountable for in production.
          </p>
        </Reveal>

        <Reveal delay={0.05} className="mt-16">
          <WorkflowDiagram />
        </Reveal>

        <div className="mt-16 grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          {aiWorkflowPrinciples.map((p, i) => (
            <PrincipleTile
              key={p.lead}
              lead={p.lead}
              icon={p.icon}
              body={p.body}
              index={i}
              tapCopy={p.tapCopy}
              collapseCopy={p.collapseCopy}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
