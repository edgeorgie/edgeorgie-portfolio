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
    // Every destination must stay on PostHog's own hosts: a typo'd or
    // attacker-supplied destination here would make the relay worse, not
    // better, than the ungated version.
    for (const r of rewrites) {
      expect(new URL(r.destination).hostname).toMatch(/\.i\.posthog\.com$/);
    }
  });

  it("exposes no catch-all, so unlisted PostHog paths are unreachable", async () => {
    const rewrites = await rewritesWith("phc_test_key");

    // A wildcard directly under /ingest/ is the whole bug: it matches every
    // path PostHog will ever serve, including ones this app does not use.
    for (const r of rewrites) {
      expect(r.source).not.toBe("/ingest/:path*");
    }

    // Spelled out as reachability, not just as a shape: these are real
    // PostHog paths that must NOT be proxied. `/api/*` is the authenticated
    // management surface; `/s/` is session-replay ingestion, which this app
    // disables (`disable_session_recording: true`); `/batch/` is the
    // server-side capture endpoint, which a browser app never needs.
    const forbidden = [
      "/ingest/api/projects/",
      "/ingest/api/users/@me/",
      "/ingest/s/",
      "/ingest/batch/",
      "/ingest/decide/",
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
});

/**
 * Does any rewrite rule match `path`? Implements the only two `source`
 * shapes this config uses — an exact path, or a trailing `:path*` wildcard —
 * rather than pulling in Next's own matcher, so the expected semantics are
 * visible here instead of being asserted against the thing under test.
 */
function matches(rewrites: { source: string }[], path: string): boolean {
  return rewrites.some((r) => {
    const wildcard = r.source.endsWith("/:path*");
    if (!wildcard) return r.source === path;
    const prefix = r.source.slice(0, -"/:path*".length);
    return path === prefix || path.startsWith(`${prefix}/`);
  });
}
