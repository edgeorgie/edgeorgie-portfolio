"use client";

import { Reveal } from "./Reveal";
import { aiWorkflowPrinciples } from "@/data/content";

/**
 * Two-layer swimlane diagram: operator (always-on) vs. builder (bursts).
 *
 * Top lane: cron scheduler -> gate ("change detected?") -> quiet local log
 * or an alert endpoint.
 * Bottom lane: dispatcher fans out (dashed arrows) into parallel task boxes
 * through a pre-execution guard (shield), each task box writes into one
 * shared audit-trail log (cylinder); one task box loops out to a cold-context
 * critic node before being marked done.
 *
 * Plain <svg>, no external assets, matches the site's mono/accent-green/
 * line-grid visual language (same palette tokens as globals.css).
 */
function WorkflowDiagram() {
  return (
    <div className="glass-panel rounded-xl p-4 md:p-8 overflow-x-auto">
      <svg
        viewBox="0 0 980 420"
        role="img"
        aria-label="Two-layer workflow diagram. Top lane: Operator, always-on — a cron scheduler checks a gate, 'change detected?', then either writes quietly to a local log or sends a real alert. Bottom lane: Builder, bursts — a dispatcher fans out through a pre-execution guard into four parallel task boxes, each writing its evidence into one shared audit-trail log; one task loops out to a cold-context critic before being marked done."
        className="w-full min-w-[820px] h-auto"
        fontFamily="var(--font-jbmono), ui-monospace, SFMono-Regular, Menlo, monospace"
      >
        {/* lane labels */}
        <text x="16" y="28" fill="var(--accent)" fontSize="13" letterSpacing="2" className="uppercase">
          Operator &middot; always-on
        </text>
        <text x="16" y="208" fill="var(--accent)" fontSize="13" letterSpacing="2" className="uppercase">
          Builder &middot; bursts
        </text>

        {/* lane separators */}
        <line x1="0" y1="40" x2="980" y2="40" stroke="var(--line)" strokeWidth="1" />
        <line x1="0" y1="180" x2="980" y2="180" stroke="var(--line)" strokeWidth="1" />
        <line x1="0" y1="400" x2="980" y2="400" stroke="var(--line)" strokeWidth="1" />

        {/* ---- TOP LANE: operator ---- */}
        {/* cron scheduler */}
        <rect x="24" y="70" width="140" height="64" rx="10" fill="none" stroke="var(--fg-dim)" strokeWidth="1.5" />
        <text x="94" y="96" textAnchor="middle" fill="var(--fg)" fontSize="13">
          cron
        </text>
        <text x="94" y="114" textAnchor="middle" fill="var(--fg-dim)" fontSize="11">
          scheduler
        </text>

        <line x1="164" y1="102" x2="222" y2="102" stroke="var(--fg-dim)" strokeWidth="1.5" markerEnd="url(#arrow)" />

        {/* gate icon (diamond) */}
        <polygon
          points="300,66 356,102 300,138 244,102"
          fill="none"
          stroke="var(--accent)"
          strokeWidth="1.5"
        />
        <text x="300" y="98" textAnchor="middle" fill="var(--accent)" fontSize="10.5">
          change
        </text>
        <text x="300" y="112" textAnchor="middle" fill="var(--accent)" fontSize="10.5">
          detected?
        </text>

        {/* gate -> quiet log (no) */}
        <line x1="356" y1="102" x2="430" y2="102" stroke="var(--fg-dim)" strokeWidth="1.5" markerEnd="url(#arrow)" />
        <text x="365" y="90" fill="var(--fg-dim)" fontSize="10">no</text>
        <rect x="430" y="70" width="150" height="64" rx="10" fill="none" stroke="var(--line)" strokeWidth="1.5" />
        <text x="505" y="96" textAnchor="middle" fill="var(--fg-dim)" fontSize="12">
          quiet local log
        </text>
        <text x="505" y="113" textAnchor="middle" fill="var(--fg-dim)" fontSize="10.5">
          routine run, no ping
        </text>

        {/* gate -> alert (yes) */}
        <line x1="328" y1="138" x2="328" y2="160" stroke="var(--fg-dim)" strokeWidth="1.5" />
        <line x1="328" y1="160" x2="700" y2="160" stroke="var(--fg-dim)" strokeWidth="1.5" />
        <line x1="700" y1="160" x2="700" y2="134" stroke="var(--fg-dim)" strokeWidth="1.5" markerEnd="url(#arrow)" />
        <text x="430" y="152" fill="var(--fg-dim)" fontSize="10">yes</text>
        <rect x="630" y="70" width="150" height="64" rx="10" fill="none" stroke="var(--accent)" strokeWidth="1.5" />
        <text x="705" y="96" textAnchor="middle" fill="var(--accent)" fontSize="12">
          real alert
        </text>
        <text x="705" y="113" textAnchor="middle" fill="var(--fg-dim)" fontSize="10.5">
          human-only blocker
        </text>

        {/* ---- BOTTOM LANE: builder ---- */}
        {/* dispatcher */}
        <rect x="24" y="210" width="140" height="56" rx="10" fill="none" stroke="var(--fg-dim)" strokeWidth="1.5" />
        <text x="94" y="234" textAnchor="middle" fill="var(--fg)" fontSize="13">
          dispatcher
        </text>
        <text x="94" y="250" textAnchor="middle" fill="var(--fg-dim)" fontSize="10.5">
          decomposes work
        </text>

        {/* shield / pre-execution guard */}
        <path
          d="M 226 210 L 254 218 L 254 238 Q 254 254 226 264 Q 198 254 198 238 L 198 218 Z"
          fill="none"
          stroke="var(--accent)"
          strokeWidth="1.5"
        />
        <text x="226" y="280" textAnchor="middle" fill="var(--accent)" fontSize="10">
          guard
        </text>

        {/* dispatcher -> guard (dashed) */}
        <line
          x1="164"
          y1="238"
          x2="196"
          y2="238"
          stroke="var(--fg-dim)"
          strokeWidth="1.5"
          strokeDasharray="4 3"
          markerEnd="url(#arrow)"
        />

        {/* guard fans out (dashed) into 4 task boxes */}
        {[
          { x: 320, label: "task A" },
          { x: 470, label: "task B" },
          { x: 620, label: "task C" },
          { x: 770, label: "task D" },
        ].map((t) => (
          <g key={t.label}>
            <path
              d={`M 254 230 L ${t.x} 212`}
              fill="none"
              stroke="var(--fg-dim)"
              strokeWidth="1.3"
              strokeDasharray="4 3"
              markerEnd="url(#arrow)"
            />
            <rect x={t.x - 56} y="212" width="112" height="46" rx="9" fill="none" stroke="var(--fg-dim)" strokeWidth="1.5" />
            <text x={t.x} y="240" textAnchor="middle" fill="var(--fg)" fontSize="12">
              {t.label}
            </text>
          </g>
        ))}

        {/* critic cold-context loop off task C */}
        <path
          d="M 620 258 C 600 300, 560 300, 560 330"
          fill="none"
          stroke="var(--fg-dim)"
          strokeWidth="1.3"
          strokeDasharray="2 4"
          markerEnd="url(#arrow)"
        />
        <rect x="495" y="330" width="130" height="50" rx="9" fill="none" stroke="var(--accent)" strokeWidth="1.5" />
        <text x="560" y="352" textAnchor="middle" fill="var(--accent)" fontSize="11.5">
          critic
        </text>
        <text x="560" y="368" textAnchor="middle" fill="var(--fg-dim)" fontSize="10">
          (cold context)
        </text>
        <path
          d="M 560 330 C 560 300, 600 300, 620 268"
          fill="none"
          stroke="var(--fg-dim)"
          strokeWidth="1.3"
          strokeDasharray="2 4"
          markerEnd="url(#arrow)"
        />

        {/* each task box -> shared audit-trail log (solid) */}
        {[320, 470, 620, 770].map((x) => (
          <line
            key={x}
            x1={x}
            y1="258"
            x2={490 + (x - 320) * 0.08}
            y2="330"
            stroke="var(--accent)"
            strokeWidth="1.4"
            markerEnd="url(#arrowAccent)"
          />
        ))}

        {/* shared audit-trail log cylinder */}
        <g transform="translate(410,328)">
          <path
            d="M0,10 Q40,-6 80,10 L80,46 Q40,62 0,46 Z"
            fill="rgba(186,255,41,0.06)"
            stroke="var(--accent)"
            strokeWidth="1.5"
          />
          <path d="M0,10 Q40,24 80,10" fill="none" stroke="var(--accent)" strokeWidth="1.5" />
          <text x="40" y="34" textAnchor="middle" fill="var(--accent)" fontSize="10">
            audit-trail
          </text>
          <text x="40" y="47" textAnchor="middle" fill="var(--accent)" fontSize="10">
            log
          </text>
        </g>

        <defs>
          <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill="var(--fg-dim)" />
          </marker>
          <marker id="arrowAccent" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill="var(--accent)" />
          </marker>
        </defs>
      </svg>

      <p className="mono text-[11px] text-fg-dim mt-4 leading-relaxed">
        Top: a cheap, deterministic gate decides whether the expensive agent run wakes up at all.
        Bottom: independent tasks fan out behind a pre-execution guard, converge on one shared
        audit log, and one path routes through a critic with zero shared context before anything
        is marked done.
      </p>
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
            Not a faster autocomplete &mdash; an orchestration layer with its own operating
            discipline, built the same way I&apos;d build any system I&apos;m accountable
            for in production.
          </p>
        </Reveal>

        <Reveal delay={0.05} className="mt-16">
          <WorkflowDiagram />
        </Reveal>

        <div className="mt-16 grid md:grid-cols-2 gap-px bg-[var(--line)] rounded-xl overflow-hidden border border-[var(--line)]">
          {aiWorkflowPrinciples.map((p, i) => (
            <Reveal key={p.lead} delay={(i % 2) * 0.04} className="bg-bg-soft p-6 md:p-8 flex flex-col gap-3">
              <span className="mono text-xs text-fg-dim">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="text-lg md:text-xl font-semibold text-fg tracking-tight">
                {p.lead}
              </h3>
              <p className="text-sm text-fg-dim leading-relaxed">{p.body}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
