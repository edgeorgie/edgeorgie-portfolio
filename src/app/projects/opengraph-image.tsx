import { person } from "@/lib/site";
import { moreProjects } from "@/data/content";
import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage } from "@/lib/og";

export const alt = `${moreProjects.length} more public projects by ${person.name}, each with a repo, a live URL or an npm package.`;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

/**
 * Without this file /projects silently inherits the home page's OG card, so
 * sharing the page advertises the wrong thing. The count is read from the data
 * rather than written out, so the card cannot disagree with the list.
 */
export default async function ProjectsOpenGraphImage() {
  return renderOgImage({
    eyebrow: `${person.name} · all projects`,
    headline: { lead: "Everything else I've", accent: "shipped in public." },
    subtitle: `${moreProjects.length} more public repos beyond the six case studies — MCP servers, agent evals, CLIs and web apps, each with a repo, a live URL or an npm package.`,
  });
}
