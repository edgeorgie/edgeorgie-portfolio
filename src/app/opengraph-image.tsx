import { person } from "@/lib/site";
import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage } from "@/lib/og";

export const alt = `${person.name} — ${person.title}. Full-stack & AI-agent engineer.`;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function OpenGraphImage() {
  return renderOgImage({
    eyebrow: `${person.name} · ${person.title}`,
    headline: { lead: "I build software people", accent: "and agents", tail: "rely on." },
    subtitle:
      "Full-stack engineering at LATAM scale · web, native mobile, smart TV · live MCP servers, agent bots and eval tooling you can run today.",
  });
}
