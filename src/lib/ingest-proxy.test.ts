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

  it("proxies to PostHog only when a key is set, catch-all last", async () => {
    const rewrites = await rewritesWith("phc_test_key");
    expect(rewrites.map((r) => r.source)).toEqual([
      "/ingest/static/:path*",
      "/ingest/array/:path*",
      "/ingest/:path*",
    ]);
    // Every destination must stay on PostHog's own hosts: a typo'd or
    // attacker-supplied destination here would make the relay worse, not
    // better, than the ungated version.
    for (const r of rewrites) {
      expect(new URL(r.destination).hostname).toMatch(/\.i\.posthog\.com$/);
    }
    // The catch-all must be last, or /ingest/static/* would be swallowed by
    // it and the SDK assets would 404.
    expect(rewrites[rewrites.length - 1].source).toBe("/ingest/:path*");
  });
});
