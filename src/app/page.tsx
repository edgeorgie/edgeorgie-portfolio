import { Nav } from "@/components/Nav";
import { Hero } from "@/components/Hero";
import { Projects } from "@/components/Projects";
import { Skills } from "@/components/Skills";
import { Experience } from "@/components/Experience";
import { AIWorkflow } from "@/components/AIWorkflow";
import { AskMe } from "@/components/AskMe";
import { Beyond } from "@/components/Beyond";
import { Contact } from "@/components/Contact";
import { SectionNav } from "@/components/SectionNav";

/**
 * Section order follows the recruiter's path (what did you build → what can
 * you do → where → how you work) before the interactive console and the
 * personal timeline. The order is mirrored in src/lib/site.ts `sections`,
 * which drives the header nav, dot nav and chapter numbering.
 */
export default function Home() {
  return (
    <>
      <Nav />
      <main id="main" className="relative z-0">
        <Hero />
        <Projects />
        <Skills />
        <Experience />
        <AIWorkflow />
        <AskMe />
        <Beyond />
        <Contact />
      </main>
      <SectionNav />
    </>
  );
}
