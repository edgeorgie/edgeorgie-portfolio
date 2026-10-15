import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { sections } from "./site";

/**
 * The section order lives in THREE places that must agree, and until this file
 * existed nothing checked that they did:
 *
 *   1. src/lib/site.ts `sections` — drives the header nav, the dot nav and the
 *      chapter numbers rendered by SectionHeader (`sectionNumber` is an index
 *      lookup into this array);
 *   2. src/app/page.tsx — the actual render order of the section components;
 *   3. e2e/portfolio.spec.ts `EXPECTED_SECTIONS` — a hand-written literal.
 *
 * page.tsx's own header comment states the order "is mirrored in
 * src/lib/site.ts `sections`", which was documentation, not a gate. Reordering
 * `sections` alone kept all 41 unit tests green while renumbering the page:
 * swapping skills and experience made the Skills section render the kicker
 * "02 Experience", because the number comes from the array index and the label
 * comes from the same entry. Silent, and wrong on the most-read page.
 *
 * The e2e suite does assert the live DOM order, but it compares against its own
 * hard-coded list, so it cannot catch site.ts and page.tsx drifting together,
 * and it only runs where a browser is available.
 *
 * These assertions derive both sides from source rather than restating the
 * order a fourth time — a literal here would be one more copy to drift.
 */

const repoRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const read = (p: string) => readFileSync(path.join(repoRoot, p), "utf8");

/** Section ids in the order their components appear inside <main> in page.tsx. */
function pageOrderFromSource(): string[] {
  const src = read("src/app/page.tsx");
  const main = src.match(/<main[^>]*>([\s\S]*?)<\/main>/);
  expect(main, "page.tsx must render a <main> element").toBeTruthy();

  // `<Hero />` -> Hero, in render order.
  const components = [...main![1].matchAll(/<([A-Z][A-Za-z0-9]*)\s*\/>/g)].map((m) => m[1]);
  expect(components.length, "no section components found in page.tsx").toBeGreaterThan(0);

  return components.map((name) => {
    const component = read(`src/components/${name}.tsx`);
    // The section's own anchor id: the id on its <section> (Hero uses a <header>).
    const id = component.match(/<(?:section|header)[^>]*\bid="([^"]+)"/);
    expect(id, `${name}.tsx must put an id on its root section/header element`).toBeTruthy();
    return id![1];
  });
}

describe("section order is single-sourced", () => {
  it("site.ts `sections` matches the render order in page.tsx", () => {
    // Fails if a section is reordered, added or removed in one place only.
    expect(sections.map((s) => s.id)).toEqual(pageOrderFromSource());
  });

  it("every component's anchor id is a declared section id", () => {
    const declared = new Set(sections.map((s) => s.id));
    for (const id of pageOrderFromSource()) {
      // A typo'd id silently breaks nav links and the chapter number falls back
      // to the raw id, so this is worth pinning separately from order.
      expect(declared, `"${id}" is rendered but not declared in site.ts sections`).toContain(id);
    }
  });

  it("the e2e spec's EXPECTED_SECTIONS is not a stale copy", () => {
    const spec = read("e2e/portfolio.spec.ts");
    const literal = spec.match(/const EXPECTED_SECTIONS\s*=\s*\[([^\]]*)\]/);
    expect(literal, "e2e spec must declare EXPECTED_SECTIONS").toBeTruthy();
    const ids = [...literal![1].matchAll(/"([^"]+)"/g)].map((m) => m[1]);
    expect(ids).toEqual(sections.map((s) => s.id));
  });

  it("chapter numbers are contiguous from 00, so no number is skipped or repeated", () => {
    // SectionHeader renders `sectionNumber(id)`; duplicate ids would silently
    // print the same chapter twice.
    const ids = sections.map((s) => s.id);
    expect(new Set(ids).size, "duplicate section id").toBe(ids.length);
  });
});
