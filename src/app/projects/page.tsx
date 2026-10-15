import type { Metadata } from "next";
import Link from "next/link";
import { Nav } from "@/components/Nav";
import { Icon } from "@/components/Icon";
import { MoreProjects } from "@/components/MoreProjects";
import { moreProjects } from "@/data/content";
import { SITE_URL, links } from "@/lib/site";

/**
 * A CollectionPage + ItemList describing the actual repos, rather than letting
 * the route show nothing but the site-wide Person/WebSite graph from the
 * layout. Built from `moreProjects`, so the structured data cannot drift from
 * what the page renders.
 */
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "@id": `${SITE_URL}/projects#page`,
  url: `${SITE_URL}/projects`,
  name: "All projects — Edwin Jorge",
  isPartOf: { "@id": `${SITE_URL}/#website` },
  about: { "@id": `${SITE_URL}/#person` },
  inLanguage: "en",
  mainEntity: {
    "@type": "ItemList",
    numberOfItems: moreProjects.length,
    itemListElement: moreProjects.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "SoftwareSourceCode",
        name: p.name,
        description: p.description,
        programmingLanguage: p.language,
        codeRepository: p.repo,
        author: { "@id": `${SITE_URL}/#person` },
        ...(p.live ? { url: p.live } : {}),
      },
    })),
  },
};

/**
 * The secondary projects live on their own route rather than inline on the
 * home page. The Work section carried 47% of the site's words, which buried
 * the six case studies that are the actual evidence — the nine smaller repos
 * are supporting material and read better as a list someone chooses to open.
 *
 * MoreProjects is reused verbatim, so there is one definition of a repo card
 * and no second copy of the data to drift.
 */
export const metadata: Metadata = {
  title: "All projects — Edwin Jorge",
  description: `${moreProjects.length} more public repos beyond the six case studies: MCP servers, agent evals, CLIs and web apps, each with a repo, a live URL or an npm package.`,
  alternates: { canonical: `${SITE_URL}/projects` },
  openGraph: {
    title: "All projects — Edwin Jorge",
    description: `${moreProjects.length} more public repos beyond the six case studies.`,
    url: `${SITE_URL}/projects`,
    type: "website",
  },
};

export default function ProjectsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        // JSON.stringify output is escaped so a "<" can never close the tag.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <Nav />
      <main id="main" className="relative z-0">
        <section className="relative py-24 md:py-32 scroll-mt-16">
          <div className="max-w-6xl mx-auto px-6 md:px-10">
            <p className="kicker mb-5 flex items-center gap-3">
              <Link href="/#work" className="hover:text-fg transition-colors" data-track="nav_clicked" data-track-target="back-to-work">
                ← Work
              </Link>
            </p>
            <h1 className="display text-[2.6rem] sm:text-5xl md:text-6xl max-w-3xl">
              Everything else I&rsquo;ve <em>shipped in public</em>.
            </h1>
            <p className="lede mt-6 max-w-2xl">
              The six case studies live on the{" "}
              <Link href="/#work" className="link">
                home page
              </Link>
              . These are the rest of the public, non-fork repos — smaller, still real: each one has a repo, a live URL
              or an npm package.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={links.github}
                target="_blank"
                rel="noreferrer"
                className="btn"
                data-track="outbound_clicked"
                data-track-target="github-profile"
                data-track-kind="repo"
              >
                <Icon name="github" className="w-4 h-4" />
                All repositories
              </a>
              <Link href="/#ask-me" className="btn" data-track="nav_clicked" data-track-target="ask-me">
                Ask the MCP server about them
              </Link>
            </div>

            <div className="mt-16 md:mt-20">
              <MoreProjects headingLevel={2} />
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
