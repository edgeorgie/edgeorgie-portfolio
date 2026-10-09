import { Nav } from "@/components/Nav";
import { Hero } from "@/components/Hero";
import { Projects } from "@/components/Projects";
import { Experience } from "@/components/Experience";
import { LiveStats } from "@/components/LiveStats";
import { Contact } from "@/components/Contact";

export default function Home() {
  return (
    <>
      <Nav />
      <main className="relative z-0">
        <Hero />
        <Projects />
        <Experience />
        <LiveStats />
        <Contact />
      </main>
    </>
  );
}
