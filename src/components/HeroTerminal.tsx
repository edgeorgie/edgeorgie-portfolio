import type { CSSProperties } from "react";

/**
 * A real transcript (captured 2026-10-11 against the live API) typed out
 * line by line with a pure-CSS typewriter (see .typewriter in globals.css):
 * no timers, no re-renders, nothing on the main thread while the page
 * loads. The box reserves its full height up front so typing never shifts
 * the layout below it (the main CLS source on the old hero). Under
 * prefers-reduced-motion the global rule collapses the animation and the
 * full transcript is shown at once. Server component.
 */
export const TERMINAL_LINES = [
  "$ curl -s ask-edgeorgie-mcp.vercel.app/api/ask \\",
  "    -d '{\"question\":\"what has he shipped?\"}'",
  '{ "answerMode": "llm", "model": "claude-haiku-4-5",',
  '  "citations": ["resume.txt:49-78",',
  '                "RECRUITER-FAQ.md:23-47"] }',
] as const;

const MS_PER_CHAR = 16;
const LINE_PAUSE_MS = 320;
const START_DELAY_MS = 450;

function delays(): number[] {
  const out: number[] = [];
  let t = START_DELAY_MS;
  for (const line of TERMINAL_LINES) {
    out.push(t);
    t += line.length * MS_PER_CHAR + LINE_PAUSE_MS;
  }
  return out;
}

export function HeroTerminal() {
  const starts = delays();
  return (
    <div
      className="panel-raised font-mono text-[10px] sm:text-xs leading-[1.7] text-fg-dim px-4 py-3 w-full max-w-xl min-w-0 overflow-x-auto"
      role="region"
      tabIndex={0}
      aria-label="Example request to the live ask-edgeorgie-mcp API"
    >
      <div className="flex items-center gap-1.5 mb-2 text-[10px] text-fg-faint" aria-hidden="true">
        <span className="w-2 h-2 rounded-full bg-err/70" />
        <span className="w-2 h-2 rounded-full bg-warn/70" />
        <span className="w-2 h-2 rounded-full bg-ok/70" />
        <span className="ml-2">live · captured 2026-10-11</span>
      </div>
      <div className="grid" style={{ gridTemplateRows: `repeat(${TERMINAL_LINES.length}, 1.7em)` }}>
        {TERMINAL_LINES.map((line, i) => (
          <div
            key={i}
            className={`typewriter ${i < 2 ? "text-fg" : "text-accent/90"}`}
            style={{ "--chars": line.length, "--delay": `${starts[i]}ms`, "--dur": `${line.length * MS_PER_CHAR}ms` } as CSSProperties}
          >
            {line}
          </div>
        ))}
      </div>
    </div>
  );
}
