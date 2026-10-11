import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const EXPECTED_SECTIONS = ["top", "work", "skills", "experience", "ai-workflow", "ask-me", "beyond", "contact"];

async function scrollThrough(page: Page) {
  const h = await page.evaluate(() => document.documentElement.scrollHeight);
  const step = await page.evaluate(() => window.innerHeight * 0.8);
  for (let y = 0; y < h; y += step) {
    await page.evaluate((yy) => window.scrollTo(0, yy), y);
    await page.waitForTimeout(60);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await settle(page);
}

/**
 * Wait for every running, finite, time-based entrance animation so colours
 * and opacity are at rest. Infinite loops and scroll-driven animations
 * (whose `finished` promise never settles) are skipped; a 3 s cap keeps a
 * stuck animation from hanging the test.
 */
async function settle(page: Page) {
  await page.evaluate(() => {
    const finite = document.getAnimations().filter((a) => {
      const timeBased = !a.timeline || a.timeline instanceof DocumentTimeline;
      return timeBased && a.playState === "running" && a.effect?.getTiming().iterations !== Infinity;
    });
    const timeout = new Promise<void>((r) => setTimeout(r, 3000));
    return Promise.race([Promise.all(finite.map((a) => a.finished.catch(() => {}))), timeout]);
  });
}

/** The console is a client component; wait for hydration before typing into it. */
async function hydrated(page: Page) {
  await page.waitForLoadState("networkidle");
  await page.waitForFunction(() => document.querySelector("form[data-hydrated='true']") !== null);
}

test.describe("portfolio", () => {
  test("renders every section in order with correct numbering and no console errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(String(e)));
    page.on("console", (m) => {
      if (m.type() === "error") errors.push(m.text());
    });

    await page.goto("/");
    const ids = await page.locator("main section[id]").evaluateAll((els) => els.map((e) => e.id));
    expect(ids).toEqual(EXPECTED_SECTIONS);

    // Chapter numbering follows page order: 01 · Work, 02 · Skills, ...
    const kickers = await page.locator("main section h2").evaluateAll((hs) =>
      hs.map((h) => h.parentElement?.querySelector(".kicker")?.textContent?.replace(/\s+/g, " ").trim() ?? "")
    );
    expect(kickers[0]).toMatch(/^01\s*Work$/);
    expect(kickers[1]).toMatch(/^02\s*Skills$/);
    expect(kickers[kickers.length - 1]).toMatch(/^07\s*Contact$/);

    await scrollThrough(page);
    expect(errors, errors.join("\n")).toEqual([]);
  });

  test("hero is visible before hydration and nothing is server-rendered invisible", async ({ browser }) => {
    const ctx = await browser.newContext({ javaScriptEnabled: false });
    const page = await ctx.newPage();
    await page.goto("/");
    const h1 = page.locator("h1");
    await expect(h1).toBeVisible();
    // The CSS entrance animation starts from opacity 0 and finishes within a
    // second; what matters is that the markup itself is never invisible.
    await h1.evaluate((el) => Promise.all(el.getAnimations({ subtree: true }).map((a) => a.finished)));
    expect(await h1.evaluate((el) => getComputedStyle(el).opacity)).toBe("1");
    await expect(page.locator("#work h2")).toBeVisible();
    await expect(page.locator('a[href^="mailto:"]').first()).toBeVisible();
    const hidden = await page.locator("[style*='opacity']").evaluateAll((els) => els.filter((el) => (el as HTMLElement).style.opacity === "0").length);
    expect(hidden).toBe(0);
    await ctx.close();
  });

  test("contact channels are real and present in nav, hero and contact", async ({ page }) => {
    await page.goto("/");
    const github = page.locator('a[href="https://github.com/edgeorgie"]');
    const linkedin = page.locator('a[href="https://www.linkedin.com/in/edgeorgie"]');
    const mail = page.locator('a[href="mailto:ed.jorge1122@gmail.com"]');
    expect(await github.count()).toBeGreaterThanOrEqual(2);
    expect(await linkedin.count()).toBeGreaterThanOrEqual(2);
    expect(await mail.count()).toBeGreaterThanOrEqual(1);

    // Every external link opens safely and no link points at the dead domain.
    const bad = await page.locator("a[href^='http']").evaluateAll((as) =>
      as
        .filter((a) => {
          const el = a as HTMLAnchorElement;
          const external = !el.href.startsWith(location.origin);
          return external && (el.target !== "_blank" || !/noreferrer|noopener/.test(el.rel) || el.href.includes("edgeorgie.vercel.app"));
        })
        .map((a) => (a as HTMLAnchorElement).href)
    );
    expect(bad).toEqual([]);
  });

  test("every in-page anchor resolves to an element", async ({ page }) => {
    await page.goto("/");
    const missing = await page.locator('a[href^="#"]').evaluateAll((as) =>
      as
        .map((a) => a.getAttribute("href")!)
        .filter((h) => h.length > 1 && !document.querySelector(h))
    );
    expect(missing).toEqual([]);
  });

  test("project cards carry evidence links and expandable case-study notes", async ({ page }) => {
    await page.goto("/");
    const cards = page.locator("article[id^='project-']");
    expect(await cards.count()).toBe(6);
    const first = cards.first();
    await first.scrollIntoViewIfNeeded();
    const details = first.locator("details");
    await expect(details).not.toHaveAttribute("open", "");
    await details.locator("summary").click();
    await expect(details).toHaveAttribute("open", "");
    await expect(first.getByText("Architecture & decisions")).toBeVisible();
    expect(await first.locator("a[target=_blank]").count()).toBeGreaterThanOrEqual(1);
  });

  test("console runs slash commands offline", async ({ page }) => {
    await page.goto("/#ask-me");
    await hydrated(page);
    const input = page.getByLabel("Ask a question or type a command");
    await input.fill("/projects");
    await input.press("Enter");
    const log = page.getByRole("log");
    await expect(log.getByRole("link", { name: /ask-edgeorgie-mcp/ })).toBeVisible();
    await expect(log.getByRole("link", { name: /simplescope/ })).toBeVisible();
    await input.fill("/clear");
    await input.press("Enter");
    await expect(log.getByRole("link", { name: /simplescope/ })).toHaveCount(0);
  });

  test("keyboard: skip link is first, focus is visible, mobile menu closes on Escape", async ({ page, isMobile }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");
    const skip = page.locator("a.skip-link");
    await expect(skip).toBeFocused();
    await expect(skip).toBeInViewport();
    await page.keyboard.press("Enter");
    await expect(page.locator("#main")).toBeInViewport();

    if (isMobile) {
      const toggle = page.getByRole("button", { name: /open menu/i });
      await toggle.click();
      await expect(page.getByRole("button", { name: /close menu/i })).toBeVisible();
      await expect(page.locator("#mobile-nav-menu")).toHaveAttribute("aria-hidden", "false");
      await page.keyboard.press("Escape");
      await expect(page.getByRole("button", { name: /open menu/i })).toBeFocused();
    }
  });

  test("reduced motion: all content visible, no running animations", async ({ browser }) => {
    const ctx = await browser.newContext({ reducedMotion: "reduce" });
    const page = await ctx.newPage();
    await page.goto("/");
    await scrollThrough(page);
    const hidden = await page.evaluate(() =>
      [...document.querySelectorAll("main h2, main h3, main p")].filter((el) => {
        const cs = getComputedStyle(el);
        return cs.opacity === "0" || cs.visibility === "hidden";
      }).length
    );
    expect(hidden).toBe(0);
    await ctx.close();
  });

  test("no horizontal overflow", async ({ page }) => {
    await page.goto("/");
    await scrollThrough(page);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });

  test("metadata, robots, sitemap and OG image respond", async ({ page, request }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Edwin Jorge/);
    const og = await page.locator('meta[property="og:image"]').getAttribute("content");
    expect(og).toMatch(/opengraph-image/);
    const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
    expect(canonical).toMatch(/^https:\/\//);
    expect(await page.locator('script[type="application/ld+json"]').count()).toBe(1);
    for (const path of ["/robots.txt", "/sitemap.xml", "/opengraph-image"]) {
      const res = await request.get(path);
      expect(res.status(), path).toBe(200);
    }
  });

  test("security headers are set", async ({ request }) => {
    const res = await request.get("/");
    const h = res.headers();
    expect(h["content-security-policy"]).toContain("frame-ancestors 'none'");
    expect(h["x-content-type-options"]).toBe("nosniff");
    expect(h["referrer-policy"]).toBe("strict-origin-when-cross-origin");
    expect(h["x-powered-by"]).toBeUndefined();
  });

  test("ask API validates input", async ({ request }) => {
    const bad = await request.post("/api/ask-me", { data: { question: 42 } });
    expect(bad.status()).toBe(400);
    const tooLong = await request.post("/api/ask-me", { data: { question: "x".repeat(600) } });
    expect(tooLong.status()).toBe(400);
    const badTopK = await request.post("/api/ask-me", { data: { question: "hello there", topK: 99 } });
    expect(badTopK.status()).toBe(400);
  });

  test("accessibility: no axe violations", async ({ page }) => {
    await page.goto("/");
    await scrollThrough(page);
    await settle(page);
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
    expect(
      results.violations.map((v) => `${v.id}: ${v.help} (${v.nodes.map((n) => n.target.join(" ")).join(", ")})`)
    ).toEqual([]);
  });
});
