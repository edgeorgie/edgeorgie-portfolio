import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it, vi } from "vitest";

/**
 * The `/ingest` proxy is a SERVER-side route, so no client-side gate can
 * close it: with the rewrite registered unconditionally, the deployed site
 * forwards any body posted to `/ingest/*` to PostHog's public ingestion API
 * regardless of whether a key is set and regardless of what the bundle
 * contains. That is an open relay attributed to this origin.
 *
 * Asserting on the SOURCE of next.config.ts cannot prove the route is
 * absent, so these tests import the real config and call its own
 * `rewrites()` under both environments, which is the only thing that
 * actually answers "does this route exist".
 *
 * Two independent properties are covered here, because the key gate only
 * holds while analytics is OFF:
 *
 *   1. No key → no rewrite at all.
 *   2. Key set → the proxy exposes an explicit ALLOWLIST of endpoints, never
 *      a `/ingest/:path*` catch-all. PostHog's ingestion API answers an
 *      unrecognised `api_key` with `200 {"status":"Ok"}`, so once the key is
 *      set (phase 1 of docs/POSTHOG_PLAN.md) a catch-all would reopen the
 *      identical relay permanently, and would additionally proxy PostHog's
 *      authenticated `/api/*` surface through this origin.
 *
 * Note the companion CI step (`.github/workflows/ci.yml`, "Analytics is
 * absent from the bundle without a key") covers the CLIENT half. The two
 * halves are independent: a clean bundle says nothing about the proxy.
 */
async function rewritesWith(key: string | undefined) {
  const previous = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (key === undefined) delete process.env.NEXT_PUBLIC_POSTHOG_KEY;
  else process.env.NEXT_PUBLIC_POSTHOG_KEY = key;
  try {
    // The gate is evaluated at module scope, so the module cache must be
    // dropped between environments. A templated import specifier is not
    // statically analysable by Vite, hence resetModules + a literal path.
    vi.resetModules();
    const mod = await import("../../next.config");
    const config = mod.default as { rewrites?: () => Promise<unknown[]> };
    expect(typeof config.rewrites).toBe("function");
    return (await config.rewrites!()) as { source: string; destination: string }[];
  } finally {
    if (previous === undefined) delete process.env.NEXT_PUBLIC_POSTHOG_KEY;
    else process.env.NEXT_PUBLIC_POSTHOG_KEY = previous;
  }
}

describe("/ingest analytics proxy", () => {
  it("registers no rewrite at all when no key is set", async () => {
    expect(await rewritesWith(undefined)).toEqual([]);
  });

  it("treats an empty key as unset (next.config.ts defines it as \"\")", async () => {
    expect(await rewritesWith("")).toEqual([]);
  });

  it("proxies only the endpoints the SDK actually uses when a key is set", async () => {
    const rewrites = await rewritesWith("phc_test_key");
    expect(rewrites.map((r) => r.source)).toEqual([
      "/ingest/static/:path*",
      "/ingest/array/:path*",
      "/ingest/e/",
      "/ingest/flags/",
      "/ingest/i/v1/:path*",
    ]);
    // Every destination must stay on one of PostHog's two US hosts, matched
    // exactly. A suffix pattern like /\.i\.posthog\.com$/ would accept
    // `eu.i.posthog.com` or a typo'd subdomain, and a proxy pointing at the
    // wrong region silently sends this site's traffic somewhere the project
    // does not exist — a failure that looks like "analytics is broken"
    // rather than "the proxy is misconfigured".
    const allowedHosts = new Set(["us.i.posthog.com", "us-assets.i.posthog.com"]);
    for (const r of rewrites) {
      expect(allowedHosts.has(new URL(r.destination).hostname), r.destination).toBe(true);
    }
  });

  it("exposes no catch-all, so unlisted PostHog paths are unreachable", async () => {
    const rewrites = await rewritesWith("phc_test_key");

    // Spelled out as reachability, not as a shape. Asserting
    // `source !== "/ingest/:path*"` only guards the ONE spelling the author
    // happened to write: `/ingest/:p*/`, `/ingest/:rest*` and
    // `/ingest/:a/:b*` are all the same bug under different names, and a
    // string compare waves each of them through. These paths are real
    // PostHog endpoints that must not be proxied whatever the rule is
    // called. `/api/*` is the authenticated management surface and the
    // feature-polling surface (surveys, product tours and conversations are
    // all three default-ON in posthog-js and explicitly disabled in
    // src/lib/analytics.ts; `/api/web_experiments/` is default-OFF —
    // `disable_web_experiments:!0` in the pinned 1.438.7 bundle — so it is
    // listed here as defence against a future config change, not because
    // anything polls it today); `/s/` is session-replay ingestion, which
    // this app disables; `/batch/` is the server-side capture endpoint,
    // which a browser app never calls; `/engage/` and `/capture/` are the
    // person-properties and legacy-capture endpoints — unreachable today,
    // but absent from this list until a cold review probed them live and
    // found the negative set narrower than the endpoint families PostHog
    // actually publishes.
    const forbidden = [
      "/ingest/api/projects/",
      "/ingest/api/users/@me/",
      "/ingest/api/surveys/",
      "/ingest/api/product_tours/",
      "/ingest/api/early_access_features/",
      "/ingest/api/web_experiments/",
      "/ingest/s/",
      "/ingest/batch/",
      "/ingest/decide/",
      "/ingest/engage/",
      "/ingest/capture/",
    ];
    for (const path of forbidden) {
      expect(matches(rewrites, path), `${path} must not be proxied`).toBe(false);
    }

    // Positive control: the allowlisted paths the SDK really calls must match,
    // or this test would pass vacuously by proxying nothing at all.
    for (const path of ["/ingest/e/", "/ingest/flags/", "/ingest/static/array.js", "/ingest/i/v1/metrics"]) {
      expect(matches(rewrites, path), `${path} must be proxied`).toBe(true);
    }
  });

  it("the forbidden-path check is sensitive to any catch-all spelling", async () => {
    // Guards the guard. The negative assertions above are only worth
    // anything if `matches()` really reports a wildcard as covering the
    // forbidden paths; this test proves it does, for each spelling of the
    // bug, without needing to edit next.config.ts to find out.
    const forbidden = ["/ingest/api/projects/", "/ingest/s/", "/ingest/decide/"];
    for (const source of ["/ingest/:path*", "/ingest/:p*", "/ingest/:rest*"]) {
      for (const path of forbidden) {
        expect(matches([{ source }], path), `${source} must cover ${path}`).toBe(true);
      }
    }
  });

  it("the key-set bundle assertion stays the last CI step", async () => {
    // A workflow ORDERING constraint, enforced here because nothing in YAML
    // can express it. The "Analytics IS present in the bundle with a key"
    // step rebuilds `.next` with a key set, and two earlier steps read
    // `.next` expecting the NO-KEY build: the absent-from-the-bundle
    // assertion, and the Playwright e2e run (`reuseExistingServer` off in
    // CI, so `npm run start` serves whatever `.next` holds).
    //
    // Reordering it earlier does not break the build — it makes the no-key
    // assertion grep a key-set artifact. That check would then fail, which
    // is at least loud; the worse outcome is a future refactor moving the
    // rebuild before e2e and silently changing which bundle the browser
    // tests exercise. Asserting the order here means the constraint is
    // stated somewhere a reader of ci.yml can be pointed at, and it fails in
    // CI rather than in review.
    // Resolved from the repo root via `process.cwd()` (vitest runs from
    // there), not from `import.meta.url` — under the jsdom environment that
    // is not a `file:` URL and `readFile` rejects it outright.
    const workflow = await readFile(join(process.cwd(), ".github/workflows/ci.yml"), "utf8");
    const steps = [...workflow.matchAll(/^ {6}- name: (.+)$/gm)].map((m) => m[1].trim());
    expect(steps.length, "no `- name:` steps found in ci.yml — this guard would pass vacuously").toBeGreaterThan(
      5,
    );

    const keySetStep = "Analytics IS present in the bundle with a key";
    const noKeyStep = "Analytics is absent from the bundle without a key";
    const e2eStep = "End-to-end tests (production build)";
    for (const name of [keySetStep, noKeyStep, e2eStep]) {
      expect(steps, `ci.yml no longer has a step named ${JSON.stringify(name)}`).toContain(name);
    }

    expect(
      steps.indexOf(keySetStep),
      `${JSON.stringify(keySetStep)} rebuilds .next with a key and must run AFTER every step ` +
        `that reads the no-key build; ci.yml order is [${steps.join(" | ")}]`,
    ).toBeGreaterThan(Math.max(steps.indexOf(noKeyStep), steps.indexOf(e2eStep)));
  });
});

/**
 * Does any rewrite rule match `path`? Implements the only two `source`
 * shapes this config uses — an exact path, or a trailing named wildcard
 * (`/:anything*`, under any parameter name) — rather than pulling in Next's
 * own matcher, so the expected semantics are visible here instead of being
 * asserted against the thing under test. The parameter name is matched
 * loosely on purpose: `/ingest/:path*` and `/ingest/:rest*` are the same
 * rule, and a check that only recognised one spelling would pass while the
 * other reopened the hole.
 */
function matches(rewrites: { source: string }[], path: string): boolean {
  const WILDCARD = /\/:[A-Za-z_][A-Za-z0-9_]*\*\/?$/;
  return rewrites.some((r) => {
    const wildcard = r.source.match(WILDCARD);
    if (!wildcard) return r.source === path || `${r.source}/` === path;
    const prefix = r.source.slice(0, r.source.length - wildcard[0].length);
    return path === prefix || path.startsWith(`${prefix}/`);
  });
}
