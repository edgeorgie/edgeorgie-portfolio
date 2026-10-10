import { Nav } from "@/components/Nav";
import { Hero } from "@/components/Hero";
import { Projects } from "@/components/Projects";
import { AskMe } from "@/components/AskMe";
import { Experience } from "@/components/Experience";
import { Beyond } from "@/components/Beyond";
import { AIWorkflow } from "@/components/AIWorkflow";
import { LiveStats } from "@/components/LiveStats";
import { Contact } from "@/components/Contact";
import { SectionNav } from "@/components/SectionNav";

export default function Home() {
  return (
    <>
      <Nav />
      <SectionNav />
      <main className="relative z-0">
        <Hero />
        <AskMe />
        <Projects />
        <Experience />
        <Beyond />
        <AIWorkflow />
        <LiveStats />
        <Contact />
      </main>
    </>
  );
}
