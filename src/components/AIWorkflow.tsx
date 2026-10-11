"use client";

import { useId, useState } from "react";
import { m, AnimatePresence } from "framer-motion";
import { Reveal } from "./Reveal";
import { SectionHeader } from "./SectionHeader";
import { Icon, type IconName } from "./Icon";
import { aiWorkflowPrinciples, type PrincipleIcon } from "@/data/content";

/* ------------------------------------------------------------------ */
/* The pipeline. Three lanes, no project names: this is the process    */
/* every piece of work goes through, not a list of what was built.     */
/* Each node's caption is the operating rule behind it.                */
/* ------------------------------------------------------------------ */

type Tone = "default" | "accent" | "dim";

type Node = {
  id: string;
  icon: IconName;
  title: string;
  caption: string;
  tone?: Tone;
};

type Lane = {
  id: string;
  label: string;
  sub: string;
  handoff: string;
  nodes: Node[];
  /** Optional two-way branch rendered after the node whose id matches `after`. */
  branch?: { after: string; left: { label: string; node: Node }; right: { label: string; node: Node } };
  tail?: Node[];
};

const LANES: Lane[] = [
  {
    id: "operator",
    label: "Operator",
    sub: "always-on · Hermes on cron",
    handoff: "wakes a build run only when something actually changed",
    nodes: [
      { id: "cron", icon: "clock", title: "cron tick", caption: "A fixed schedule, but it never runs the expensive agent on its own." },
      {
        id: "gate",
        icon: "gate",
        title: "cheap change check",
        caption: "Deterministic, no model call: did the input actually change since last time?",
        tone: "accent",
      },
    ],
    branch: {
      after: "gate",
      left: { label: "no", node: { id: "quiet-log", icon: "file", title: "quiet log", caption: "Routine run, nothing to say, no ping.", tone: "dim" } },
      right: {
        label: "yes",
        node: { id: "wake", icon: "bolt", title: "wake a build run", caption: "The full pipeline on the right runs, with the change as its brief.", tone: "accent" },
      },
    },
    tail: [
      {
        id: "alert",
        icon: "bell",
        title: "real alert",
        caption: "Only a failure or a human-only blocker escalates to me. Successes stay quiet.",
        tone: "accent",
      },
    ],
  },
  {
    id: "build",
    label: "Build",
    sub: "parallel bursts · Claude Code",
    handoff: "every result lands in one audit trail with its evidence",
    nodes: [
      { id: "brief", icon: "task", title: "brief", caption: "Goal plus acceptance criteria, written before any agent starts." },
      {
        id: "decompose",
        icon: "fork",
        title: "decompose",
        caption: "Map which pieces have no dependency on each other; those run together.",
      },
      {
        id: "route",
        icon: "scale",
        title: "route by stakes",
        caption: "Cheap, fast models for mechanical, easily verified work. The strongest model plus an explicit rubric for high-stakes work.",
        tone: "accent",
      },
      {
        id: "skills",
        icon: "skill",
        title: "load standing skills",
        caption: "Checklists, gating conventions and approval rules, written once and loaded on demand instead of retyped.",
      },
      {
        id: "guard",
        icon: "shield",
        title: "guard",
        caption: "Pre-execution interception of destructive commands. Secrets never echo into logs or files.",
        tone: "accent",
      },
      {
        id: "agents",
        icon: "parallel",
        title: "agents × N",
        caption: "Isolated contexts, concurrent. If something could be running, it is: idle time is a failure mode.",
        tone: "accent",
      },
      {
        id: "audit-log",
        icon: "db",
        title: "audit-trail log",
        caption: "One shared log. Every result carries a pointer to its evidence: URL, test run, log line.",
      },
    ],
  },
  {
    id: "verify",
    label: "Verify",
    sub: "before anything is called done",
    handoff: "fail loops back to the agents; pass ships",
    nodes: [
      {
        id: "critic",
        icon: "critic",
        title: "cold critic",
        caption: "A fresh context with no shared history reviews the work. Shared context shares blind spots.",
        tone: "accent",
      },
      {
        id: "artifact",
        icon: "check",
        title: "verify the artifact",
        caption: "The live URL, the test run, the real log line. An agent saying it worked is not evidence.",
        tone: "accent",
      },
    ],
    branch: {
      after: "artifact",
      left: { label: "fail", node: { id: "fix", icon: "bolt", title: "back to agents", caption: "Findings become a new brief for the same parallel loop.", tone: "dim" } },
      right: {
        label: "pass",
        node: { id: "ship", icon: "package", title: "ship", caption: "Push-time secret scanning and CI gates run on everything, so safety never depends on remembering." },
      },
    },
  },
];

const TOTAL_NODES = LANES.reduce((n, l) => n + l.nodes.length + (l.branch ? 2 : 0) + (l.tail?.length ?? 0), 0);

/* ------------------------------------------------------------------ */

function Arrow({ dashed = false }: { dashed?: boolean }) {
  return (
    <svg width="20" height="24" viewBox="0 0 20 24" className="text-fg-faint shrink-0" aria-hidden="true">
      <line x1="10" y1="0" x2="10" y2="16" stroke="currentColor" strokeWidth="1.5" strokeDasharray={dashed ? "3 3" : undefined} />
      <line x1="10" y1="0" x2="10" y2="16" stroke="var(--color-accent)" strokeWidth="1.5" className="flow-line" opacity="0.8" />
      <path d="M4 14 L10 22 L16 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function FlowNode({ node, compact = false, onVisit }: { node: Node; compact?: boolean; onVisit: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  const tone = node.tone ?? "default";
  const borderTone = tone === "accent" ? "border-accent/70 text-accent" : tone === "dim" ? "border-line text-fg-dim" : "border-line text-fg";
  return (
    <m.button
      type="button"
      whileTap={{ scale: 0.97 }}
      onClick={() => {
        setOpen((o) => !o);
        onVisit(node.id);
      }}
      aria-expanded={open}
      className={`relative flex flex-col items-center justify-center gap-1.5 text-center rounded-xl border bg-bg px-3 w-full ${
        compact ? "py-3 max-w-[150px]" : "py-3.5 max-w-[220px]"
      } ${borderTone} ${open ? "shadow-[0_0_0_1px_var(--color-accent)]" : ""} transition-shadow duration-300`}
    >
      <Icon name={node.icon} className={compact ? "w-4 h-4" : "w-5 h-5"} />
      <span className={`font-mono ${compact ? "text-[10px]" : "text-[11px]"} leading-tight`}>{node.title}</span>
      <AnimatePresence initial={false}>
        {open && (
          <m.span
            key="cap"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="font-mono text-[10.5px] text-fg-dim leading-snug overflow-hidden"
          >
            {node.caption}
          </m.span>
        )}
      </AnimatePresence>
    </m.button>
  );
}

function LaneView({ lane, index, onVisit }: { lane: Lane; index: number; onVisit: (id: string) => void }) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-line/70 bg-bg-soft/40 p-4 sm:p-5">
      <div className="w-full mb-5">
        <p className="kicker text-[11px]">
          <span className="tnum">0{index + 1}</span> · {lane.label}
        </p>
        <p className="font-mono text-[10.5px] text-fg-faint mt-1">{lane.sub}</p>
      </div>

      {lane.nodes.map((node, i) => (
        <div key={node.id} className="flex flex-col items-center w-full">
          {i > 0 && <Arrow />}
          <FlowNode node={node} onVisit={onVisit} />
        </div>
      ))}

      {lane.branch && (
        <div className="flex items-start gap-4 sm:gap-6 mt-1 w-full justify-center">
          {[lane.branch.left, lane.branch.right].map((b) => (
            <div key={b.node.id} className="flex flex-col items-center flex-1 max-w-[150px]">
              <span className="font-mono text-[10px] text-fg-faint -mb-0.5">{b.label}</span>
              <Arrow />
              <FlowNode node={b.node} compact onVisit={onVisit} />
            </div>
          ))}
        </div>
      )}

      {lane.tail?.map((node) => (
        <div key={node.id} className="flex flex-col items-center w-full">
          <Arrow dashed />
          <FlowNode node={node} compact onVisit={onVisit} />
        </div>
      ))}

      <p className="mt-6 pt-4 border-t border-dashed border-line w-full font-mono text-[10.5px] text-fg-faint text-center leading-snug">
        {lane.handoff}
        <span className="lg:inline hidden"> →</span>
      </p>
    </div>
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
    <div className="panel p-4 sm:p-6 md:p-8" role="group" aria-label="How a piece of work moves through my AI pipeline" aria-describedby={descId}>
      <p id={descId} className="sr-only">
        Three lanes. Operator, always on: a cron tick runs a cheap deterministic change check; nothing changed goes to a
        quiet log, a change wakes a build run, and only failures escalate to a real alert. Build, in parallel bursts: a
        brief with acceptance criteria is decomposed into independent pieces, routed to a model by stakes, given standing
        skills, passed through a pre-execution guard, run by several isolated agents concurrently, and every result lands in
        one audit-trail log with its evidence. Verify, before anything is called done: a cold-context critic reviews the
        work, the artifact itself is verified against the live URL, test run or log line; a fail loops back to the agents,
        a pass ships through secret scanning and CI. Each node is a button that reveals the rule behind it.
      </p>
      <div className="flex items-center justify-between mb-5">
        <p className="font-mono text-[11px] text-fg-dim">one piece of work, end to end · tap any node</p>
        <span className="font-mono text-[10px] text-fg-faint tnum" aria-live="polite">
          {visited.size} of {TOTAL_NODES} nodes explored
        </span>
      </div>
      <div className="grid gap-4 lg:grid-cols-3 lg:gap-5 items-start">
        {LANES.map((lane, i) => (
          <LaneView key={lane.id} lane={lane} index={i} onVisit={markVisited} />
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* The nine operating rules: first sentence visible, rest on demand.    */
/* ------------------------------------------------------------------ */

function splitLead(body: string): [string, string] {
  const idx = body.indexOf(". ");
  if (idx === -1) return [body, ""];
  return [body.slice(0, idx + 1), body.slice(idx + 2)];
}

function PrincipleRow({ lead, icon, body, index }: { lead: string; icon: PrincipleIcon; body: string; index: number }) {
  const [open, setOpen] = useState(false);
  const [first, rest] = splitLead(body);
  return (
    <li className="border-t border-line py-4">
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="group w-full text-left flex gap-4 items-start rounded-md">
        <span className="inline-flex items-center justify-center w-8 h-8 shrink-0 rounded-lg border border-line text-fg-dim group-hover:text-accent group-hover:border-accent/60 transition-colors">
          <Icon name={icon} className="w-4 h-4" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-baseline gap-3">
            <span className="font-mono text-[10px] text-fg-faint tnum">{String(index + 1).padStart(2, "0")}</span>
            <span className="text-[15px] font-semibold text-fg tracking-tight">{lead}</span>
          </span>
          <span className="block mt-1 text-[13.5px] text-fg-dim leading-relaxed">{first}</span>
          <AnimatePresence initial={false}>
            {open && rest && (
              <m.span
                key="rest"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                className="block text-[13.5px] text-fg-dim leading-relaxed overflow-hidden"
              >
                {rest}
              </m.span>
            )}
          </AnimatePresence>
          {rest && <span className="block mt-1 font-mono text-[10px] text-fg-faint group-hover:text-accent transition-colors">{open ? "less" : "more"}</span>}
        </span>
      </button>
    </li>
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
            lede="Not a chat window. One pipeline every piece of work goes through: an always-on operator that only wakes the expensive run when something actually changed, builder agents working in parallel behind a guard and a shared audit trail, and a cold-context critic plus artifact verification before anything is called done."
          />
        </Reveal>

        <Reveal delay={0.05} className="mt-14 md:mt-16">
          <WorkflowDiagram />
        </Reveal>

        <Reveal className="mt-14 md:mt-16">
          <div className="grid gap-8 lg:grid-cols-[260px_1fr] lg:gap-14">
            <div>
              <p className="kicker">Operating rules</p>
              <p className="mt-3 text-sm text-fg-dim leading-relaxed">
                The nine rules the pipeline encodes. Each one exists because something went wrong without it.
              </p>
            </div>
            <ol className="grid gap-x-10 md:grid-cols-2 border-b border-line">
              {aiWorkflowPrinciples.map((p, i) => (
                <PrincipleRow key={p.lead} lead={p.lead} icon={p.icon} body={p.body} index={i} />
              ))}
            </ol>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
