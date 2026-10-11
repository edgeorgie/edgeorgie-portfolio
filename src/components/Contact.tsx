import { Reveal } from "./Reveal";
import { SectionHeader } from "./SectionHeader";
import { Icon } from "./Icon";
import { CopyButton } from "./CopyButton";
import { LocalTime } from "./LocalTime";
import { links, person } from "@/lib/site";

const REPO_URL = "https://github.com/edgeorgie/edgeorgie-portfolio";

export function Contact() {
  return (
    <section id="contact" className="relative py-24 md:py-32 border-t border-line overflow-hidden scroll-mt-16">
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute -bottom-64 left-1/2 -translate-x-1/2 w-[56rem] h-[56rem] glow-accent opacity-80" />
      </div>
      <div className="relative max-w-6xl mx-auto px-6 md:px-10">
        <Reveal>
          <SectionHeader
            id="contact"
            title={
              <>
                Let&rsquo;s build something <em>people rely on</em>.
              </>
            }
            lede="Open to remote roles, and to relocating with sponsorship. Everything above links to a real repo, run or deployment, and I'm happy to walk through any of it on a call."
          />
        </Reveal>

        <Reveal delay={0.05}>
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <a href={links.mailto} className="btn btn-primary">
              <Icon name="mail" className="w-4 h-4" />
              {links.email}
            </a>
            <CopyButton value={links.email} label="Copy email" />
            <a href={links.linkedin} target="_blank" rel="noreferrer" className="btn">
              <Icon name="linkedin" className="w-4 h-4" />
              LinkedIn
            </a>
            <a href={links.github} target="_blank" rel="noreferrer" className="btn">
              <Icon name="github" className="w-4 h-4" />
              GitHub
            </a>
            {links.whatsapp && (
              <a href={links.whatsapp} target="_blank" rel="noreferrer" className="btn">
                <Icon name="whatsapp" className="w-4 h-4" />
                WhatsApp
              </a>
            )}
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <footer className="mt-24 md:mt-32 border-t border-line pt-6 grid gap-4 sm:grid-cols-[1fr_auto] font-mono text-[11.5px] text-fg-faint">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <span className="inline-flex items-center gap-1.5">
                <Icon name="pin" className="w-3.5 h-3.5" />
                {person.location} · {person.timezoneLabel}
              </span>
              <LocalTime />
              <span>remote</span>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <span>Next.js 16 · React 19 · Tailwind 4 · Vercel</span>
              <a href={REPO_URL} target="_blank" rel="noreferrer" className="underline-link text-fg-dim">
                source ↗
              </a>
            </div>
          </footer>
        </Reveal>
      </div>
    </section>
  );
}
