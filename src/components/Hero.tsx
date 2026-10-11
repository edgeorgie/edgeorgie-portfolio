import Image from "next/image";
import { Icon } from "./Icon";
import portrait from "@/assets/portrait.webp";
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
            {/* The human half of "people and agents": the bio reads next to a
                face, the terminal on the right is the agent half. The float
                is contained by flow-root so the CTAs always start below it.
                `loading="eager"` rather than the deprecated `priority`: Next still
                emits a preload link for it, but without the high fetch priority,
                so it never queues ahead of the display fonts that paint the
                headline (the LCP element). Measured: priority, eager and lazy all
                land within run-to-run noise, see docs/REPORT.md §8. */}
            <div className="flow-root max-w-xl">
              <Image
                src={portrait}
                alt="Edwin Jorge, smiling, in glasses and a black t-shirt"
                width={136}
                height={170}
                sizes="(min-width: 640px) 136px, 96px"
                loading="eager"
                placeholder="blur"
                className="float-left mr-4 mb-2 sm:mr-6 w-24 sm:w-[136px] h-auto rounded-2xl ring-1 ring-line-strong shadow-[0_18px_40px_-18px_rgba(0,0,0,0.8)]"
              />
              <p className="lede text-lg md:text-xl">
                Senior engineer at Mercado Libre: five years shipping production{" "}
                <span className="text-fg">web, native mobile and smart‑TV</span> surfaces to millions of users across LATAM.
                Outside work I build <span className="text-fg">AI‑agent systems</span> in public: two live MCP servers, a
                GitHub triage bot, an eval CLI and a React profiler on npm. Everything here runs today.
              </p>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a href="#work" className="btn btn-primary" data-track="cta_clicked" data-track-target="work">
                See the work
                <Icon name="arrowDown" className="w-4 h-4" />
              </a>
              <a
                href={links.github}
                target="_blank"
                rel="noreferrer"
                className="btn"
                data-track="contact_clicked"
                data-track-channel="github"
                data-track-placement="hero"
              >
                <Icon name="github" className="w-4 h-4" />
                GitHub
              </a>
              <a
                href={links.linkedin}
                target="_blank"
                rel="noreferrer"
                className="btn"
                data-track="contact_clicked"
                data-track-channel="linkedin"
                data-track-placement="hero"
              >
                <Icon name="linkedin" className="w-4 h-4" />
                LinkedIn
              </a>
              <a
                href="#ask-me"
                className="font-mono text-sm text-fg-dim hover:text-accent transition-colors underline-link ml-1"
                data-track="cta_clicked"
                data-track-target="ask-me"
              >
                or ask the MCP about me →
              </a>
            </div>

            <dl className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-5 max-w-xl border-t border-line pt-6">
              <Fact value="4.3M+" label="users across the surfaces I ship" />
              <Fact value="6" label="public projects, runnable today" />
              <Fact value="5+" label="years in production" />
              <Fact value={person.timezoneLabel} label="Barranquilla · remote" />
            </dl>
          </div>

          <div className="anim-rise lg:justify-self-end w-full min-w-0" style={{ "--d": "220ms" } as React.CSSProperties}>
            <HeroTerminal />
            <p className="mt-3 font-mono text-[11px] text-fg-faint max-w-xl">
              A real MCP server that answers questions about my work, with citations. Try it yourself in Ask me MCP, further down.
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
