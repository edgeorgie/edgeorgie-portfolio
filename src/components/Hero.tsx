import { Icon } from "./Icon";
import { HeroTerminal } from "./HeroTerminal";
import { links, person } from "@/lib/site";

/**
 * Server component. Everything in the first screen is in the HTML and
 * visible before any JavaScript runs; entrance motion is CSS keyframes
 * (see .anim-rise), so LCP is the h1 at first paint and nothing shifts.
 */
export function Hero() {
  return (
    <section id="top" className="relative min-h-[100svh] flex flex-col justify-center overflow-hidden pt-24 pb-16 md:pb-24">
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute inset-0 grid-lines parallax-slow" />
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[48rem] h-[48rem] glow-accent" />
      </div>

      <div className="relative max-w-6xl w-full mx-auto px-6 md:px-10">
        <p className="kicker mb-7 anim-rise flex flex-wrap items-center gap-x-3 gap-y-1" style={{ "--d": "0ms" } as React.CSSProperties}>
          <span className="relative inline-flex h-2 w-2 text-accent live-dot">
            <span className="relative inline-flex rounded-full h-2 w-2 bg-accent" />
          </span>
          <span>
            {person.name} · {person.title} · {person.company}
          </span>
        </p>

        <h1
          className="display text-[clamp(3rem,11.5vw,5.5rem)] md:text-[clamp(4.5rem,8.6vw,7.25rem)] max-w-5xl anim-lift"
          style={{ "--d": "0ms" } as React.CSSProperties}
        >
          I build software people <em>and agents</em> rely on.
        </h1>

        <div className="mt-8 md:mt-10 grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:items-start [&>*]:min-w-0">
          <div className="anim-rise" style={{ "--d": "140ms" } as React.CSSProperties}>
            <p className="lede text-lg md:text-xl max-w-xl">
              Five years shipping production <span className="text-fg">web, native mobile and smart‑TV</span> surfaces at
              LATAM scale. On the side, a public set of <span className="text-fg">AI‑agent systems</span>: two live MCP
              servers, a webhook‑triggered triage bot, an eval CLI and a React profiler on npm. All runnable today.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a href="#work" className="btn btn-primary">
                See the work
                <Icon name="arrowDown" className="w-4 h-4" />
              </a>
              <a href={links.github} target="_blank" rel="noreferrer" className="btn">
                <Icon name="github" className="w-4 h-4" />
                GitHub
              </a>
              <a href={links.linkedin} target="_blank" rel="noreferrer" className="btn">
                <Icon name="linkedin" className="w-4 h-4" />
                LinkedIn
              </a>
              <a href="#ask-me" className="font-mono text-sm text-fg-dim hover:text-accent transition-colors underline-link ml-1">
                or ask the console →
              </a>
            </div>

            <dl className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-5 max-w-xl border-t border-line pt-6">
              <Fact value="4.3M+" label="users on the surfaces I ship" />
              <Fact value="6" label="public projects, runnable today" />
              <Fact value="5+" label="years in production" />
              <Fact value={person.timezoneLabel} label="Barranquilla · remote" />
            </dl>
          </div>

          <div className="anim-rise lg:justify-self-end w-full min-w-0" style={{ "--d": "220ms" } as React.CSSProperties}>
            <HeroTerminal />
            <p className="mt-3 font-mono text-[11px] text-fg-faint max-w-xl">
              That endpoint is a real MCP server about my work. The console further down calls the same engine.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Fact({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <dt className="sr-only">{label}</dt>
      <dd className="font-mono text-2xl md:text-[1.7rem] text-fg tnum leading-none">{value}</dd>
      <dd className="mt-2 text-[12px] leading-snug text-fg-faint">{label}</dd>
    </div>
  );
}
