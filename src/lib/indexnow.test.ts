import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { INDEXNOW_KEY } from "./site";

/**
 * IndexNow proves domain ownership by fetching the key as plain text at
 * `{SITE_URL}/{key}.txt`. If the constant and the file in public/ ever
 * disagree, every submission is rejected — and nothing else in the app would
 * notice, because no page renders either value.
 */
describe("IndexNow ownership key", () => {
  const publicDir = join(process.cwd(), "public");
  const keyFiles = readdirSync(publicDir).filter((f) => /^[a-f0-9]{8,128}\.txt$/.test(f));

  it("has exactly one key file in public/", () => {
    // Two key files means an old one is still claiming the domain.
    expect(keyFiles).toHaveLength(1);
  });

  it("is named after the key the code submits", () => {
    expect(keyFiles[0]).toBe(`${INDEXNOW_KEY}.txt`);
  });

  it("contains the key as its entire body, with nothing else", () => {
    // The spec wants the raw key; a trailing newline is tolerated by the
    // endpoint but anything else (quotes, JSON, markup) fails validation.
    const body = readFileSync(join(publicDir, keyFiles[0]), "utf8");
    expect(body.trim()).toBe(INDEXNOW_KEY);
  });

  it("uses a key of the length the spec allows (8-128 hex chars)", () => {
    expect(INDEXNOW_KEY).toMatch(/^[a-f0-9]{8,128}$/);
  });

  it("submits the routes from the sitemap rather than a second hardcoded list", () => {
    const script = readFileSync(join(process.cwd(), "scripts/indexnow.ts"), "utf8");
    expect(script).toContain("sitemap.xml");
    expect(script).toContain("<loc>");
    // A literal URL list here would go stale the moment a route is added.
    expect(script).not.toMatch(/urlList\s*=\s*\[\s*["'`]https/);
  });

  it("verifies the key is live before submitting", () => {
    // Submitting against a missing key file gets the whole batch rejected,
    // so the script should fail loudly instead.
    const script = readFileSync(join(process.cwd(), "scripts/indexnow.ts"), "utf8");
    expect(script).toContain("keyLocation");
    expect(script).toMatch(/keyBody\s*!==\s*INDEXNOW_KEY/);
  });
});
