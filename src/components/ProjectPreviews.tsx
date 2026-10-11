"use client";

import { useState } from "react";
import Image from "next/image";
import type { ProjectPreview } from "@/data/content";
import { Icon } from "./Icon";

type Of<K extends ProjectPreview["kind"]> = Extract<ProjectPreview, { kind: K }>;

function TriagePreview({ demo }: { demo: Of<"triage"> }) {
  const [triggered, setTriggered] = useState(false);
  return (
    <div className="flex flex-col gap-3 h-full">
      <div className="flex items-center justify-between gap-3">
        <span className="font-mono text-[10px] text-fg-faint uppercase tracking-[0.18em]">issues: opened → labels</span>
        <button
          type="button"
          onClick={() => setTriggered((t) => !t)}
          aria-pressed={triggered}
          className="btn !py-1.5 !px-3 text-[11px]"
        >
          <Icon name={triggered ? "check" : "play"} className="w-3.5 h-3.5" />
          {triggered ? "reset" : "run it"}
        </button>
      </div>
      <div className="font-mono text-[11.5px] rounded-lg border border-line bg-bg p-3.5 leading-relaxed">
        <p className="text-fg-faint">webhook · issues: opened</p>
        <p className="text-fg mt-1">{demo.issueTitle}</p>
        <p className="text-fg-dim mt-0.5">{demo.issueBody}</p>
      </div>
      <div
        className="flex flex-wrap items-center gap-2 transition-opacity duration-300"
        style={{ opacity: triggered ? 1 : 0.35 }}
        aria-live="polite"
      >
        <span className="font-mono text-[11px] text-fg-dim">↳ classified:</span>
        <span className="chip border-err/40 text-err bg-err/5">{demo.result.kind}</span>
        <span className="chip border-warn/40 text-warn bg-warn/5">{demo.result.priority}</span>
        <span className="font-mono text-[11px] text-fg-faint">confidence {Math.round(demo.result.confidence * 100)}%</span>
      </div>
      <a href={demo.sourceHref} target="_blank" rel="noreferrer" className="font-mono text-[11px] text-fg-dim underline-link w-fit mt-auto">
        {demo.sourceLabel} ↗
      </a>
    </div>
  );
}

function BenchmarkPreview({ demo }: { demo: Of<"benchmark"> }) {
  const cells = Array.from({ length: demo.rows * demo.cols }, (_, i) => i);
  return (
    <div className="flex flex-col gap-3 h-full">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] text-fg-faint uppercase tracking-[0.18em]">
          {demo.passed}/{demo.total} cells passing
        </span>
        <span className="font-mono text-[11px] text-accent tnum">{Math.round((demo.passed / demo.total) * 100)}%</span>
      </div>
      <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${demo.cols}, minmax(0, 1fr))` }} role="img" aria-label={`${demo.passed} of ${demo.total} benchmark cells passing`}>
        {cells.map((i) => (
          <div
            key={i}
            className="aspect-square rounded-[3px] bg-accent/85 anim-fade"
            style={{ "--d": `${i * 18}ms` } as React.CSSProperties}
          />
        ))}
      </div>
      <p className="font-mono text-[11px] text-fg-faint">{demo.runLabel}</p>
      <a href={demo.runHref} target="_blank" rel="noreferrer" className="font-mono text-[11px] text-fg-dim underline-link w-fit mt-auto">
        benchmark run · 3 passes ↗
      </a>
    </div>
  );
}

function ToolsPreview({ demo }: { demo: Of<"tools"> }) {
  return (
    <div className="flex flex-col gap-3 h-full">
      <span className="font-mono text-[10px] text-fg-faint uppercase tracking-[0.18em]">{demo.title}</span>
      <ul className="flex flex-col gap-1.5 font-mono text-[12px]">
        {demo.tools.map((t, i) => (
          <li key={t} className="flex items-center gap-2.5">
            <span className="text-fg-faint tnum w-4">{String(i + 1).padStart(2, "0")}</span>
            <span className="chip chip-accent">{t}()</span>
          </li>
        ))}
      </ul>
      <p className="font-mono text-[11px] text-fg-faint">{demo.footnote}</p>
      {demo.cta && (
        <a
          href={demo.cta.href}
          {...(demo.cta.href.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}
          className="font-mono text-[11px] text-fg-dim underline-link w-fit mt-auto"
        >
          {demo.cta.label} {demo.cta.href.startsWith("http") ? "↗" : "↓"}
        </a>
      )}
    </div>
  );
}

function SurfacesPreview({ demo }: { demo: Of<"surfaces"> }) {
  return (
    <div className="flex flex-col gap-3 h-full">
      <span className="font-mono text-[10px] text-fg-faint uppercase tracking-[0.18em]">one engine · four surfaces</span>
      <div className="grid grid-cols-[auto_1fr] gap-x-3 items-stretch">
        <div className="flex flex-col items-center">
          <span className="chip chip-accent">{demo.engine}</span>
          <span className="flex-1 w-px bg-line my-1" aria-hidden="true" />
        </div>
        <ul className="flex flex-col gap-2 min-w-0">
          {demo.surfaces.map((s) => (
            <li key={s.name} className="flex items-start gap-2 font-mono text-[11.5px] min-w-0">
              <span className="text-fg-faint shrink-0" aria-hidden="true">
                ├─
              </span>
              <span className="min-w-0">
                <span className="text-fg block whitespace-nowrap">{s.name}</span>
                <span className="text-fg-faint block text-[10.5px] leading-snug">{s.detail}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
      <p className="font-mono text-[11px] text-fg-faint mt-auto">validated on 5 real OSS apps</p>
    </div>
  );
}

export function ProjectPreviewView({ preview, priority = false }: { preview: ProjectPreview; priority?: boolean }) {
  if (preview.kind === "image") {
    return (
      <div className="relative aspect-[16/10] overflow-hidden rounded-xl border border-line bg-bg-soft">
        <Image
          src={preview.src}
          alt={preview.alt}
          width={preview.width}
          height={preview.height}
          sizes="(min-width: 1024px) 560px, (min-width: 640px) 90vw, 100vw"
          priority={priority}
          className="h-full w-full object-cover object-top transition-transform duration-700 ease-[var(--ease-out-quart)] group-hover:scale-[1.02]"
        />
      </div>
    );
  }
  return (
    <div className="panel p-4 sm:p-5 sm:aspect-[16/10] overflow-hidden">
      {preview.kind === "triage" && <TriagePreview demo={preview} />}
      {preview.kind === "benchmark" && <BenchmarkPreview demo={preview} />}
      {preview.kind === "tools" && <ToolsPreview demo={preview} />}
      {preview.kind === "surfaces" && <SurfacesPreview demo={preview} />}
    </div>
  );
}
