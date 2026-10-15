import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { moreProjects } from "@/data/content";

/**
 * SEO regressions are invisible: a page keeps rendering perfectly while its
 * social card, structured data or document outline is wrong. These pin the
 * things that were actually found broken on /projects, each one verified
 * against the live site before being fixed:
 *
 *   - no opengraph-image route, so the page inherited the home page's card
 *   - JSON-LD byte-identical to the home page, describing none of the repos
 *   - the heading outline skipped from <h1> straight to <h3>
 */
const src = (p: string) => readFileSync(join(process.cwd(), "src", p), "utf8");

describe("per-route social cards", () => {
  it("every route with its own metadata also has its own OG image", () => {
    // A route that sets a title but no opengraph-image silently falls back to
    // the parent's card, which advertises the wrong page when shared.
    expect(() => src("app/projects/opengraph-image.tsx")).not.toThrow();
    expect(() => src("app/opengraph-image.tsx")).not.toThrow();
  });

  it("both OG routes render through the one shared card renderer", () => {
    // Two hand-rolled cards would drift in art direction; this keeps one.
    for (const p of ["app/opengraph-image.tsx", "app/projects/opengraph-image.tsx"]) {
      expect(src(p)).toContain("renderOgImage");
      expect(src(p)).toContain("OG_SIZE");
    }
  });

  it("the projects card states the real project count, not a written-in number", () => {
    const code = src("app/projects/opengraph-image.tsx");
    expect(code).toContain("moreProjects.length");
    // A literal count would silently go stale when a project is added.
    expect(code).not.toMatch(/\b(nine|9)\s+more public repos/i);
  });
});

describe("/projects structured data", () => {
  const page = src("app/projects/page.tsx");

  it("describes the collection itself, not just the site-wide Person graph", () => {
    expect(page).toContain('"@type": "CollectionPage"');
    expect(page).toContain('"@type": "ItemList"');
    expect(page).toContain('"@type": "SoftwareSourceCode"');
  });

  it("builds the list from the data so it cannot drift from the page", () => {
    expect(page).toContain("moreProjects.map");
    expect(page).toContain("numberOfItems: moreProjects.length");
  });

  it("links back to the shared Person and WebSite nodes by @id", () => {
    // Re-declaring the person here would create a second, competing entity.
    expect(page).toContain("#person");
    expect(page).toContain("#website");
  });

  it("escapes the JSON so a '<' in any project description cannot close the tag", () => {
    expect(page).toContain('replace(/</g, "\\\\u003c")');
  });
});

describe("document outline", () => {
  it("MoreProjects takes a heading level instead of hardcoding one", () => {
    const code = src("components/MoreProjects.tsx");
    expect(code).toContain("headingLevel");
    // The literal tags are what made /projects jump h1 -> h3.
    expect(code).not.toMatch(/<h3 className="display/);
    expect(code).not.toMatch(/<h4 id=\{`repo-/);
  });

  it("/projects renders it one level up, directly under its <h1>", () => {
    expect(src("app/projects/page.tsx")).toContain("headingLevel={2}");
  });

  it("the home page leaves it under the Work section's <h2>", () => {
    const home = src("components/Projects.tsx");
    const m = home.match(/<MoreProjects[^/>]*/);
    // No explicit level on the home page: the default (3) is correct there.
    expect(m?.[0] ?? "").not.toContain("headingLevel");
  });
});

describe("sitemap", () => {
  it("lists every indexable route", () => {
    const code = src("app/sitemap.ts");
    expect(code).toContain("/projects");
  });

  it("has no build-time lastModified, which would churn on every deploy", () => {
    // A lastmod that changes without the content changing is noise Google
    // learns to ignore; omitting it is better than faking it.
    expect(src("app/sitemap.ts")).not.toContain("lastModified");
  });
});

describe("project data feeding the structured data", () => {
  it("every project has the fields the ItemList emits", () => {
    for (const p of moreProjects) {
      expect(p.name, `${p.name}: name`).toBeTruthy();
      expect(p.description, `${p.name}: description`).toBeTruthy();
      expect(p.language, `${p.name}: language`).toBeTruthy();
      expect(p.repo, `${p.name}: repo`).toMatch(/^https:\/\/github\.com\//);
    }
  });
});
