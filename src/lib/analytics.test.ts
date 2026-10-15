// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { APP, eventFromElement, lengthBucket, track } from "./analytics";

/**
 * These tests pin the Vercel sink specifically, because it is the one that is
 * ALWAYS live in a deployment and was receiving nothing. The regression they
 * guard: `track()` used to return early whenever NEXT_PUBLIC_POSTHOG_KEY was
 * unset — the deployed state — so every custom event was discarded even though
 * Vercel Web Analytics was enabled on the project and needs no key.
 *
 * The suite runs with no PostHog key configured, so it exercises exactly that
 * state: anything asserted here is what production does.
 */
type VaCall = [string, { name: string; data?: Record<string, unknown> }];

function captureVa(): VaCall[] {
  const calls: VaCall[] = [];
  (window as unknown as { va: (...a: unknown[]) => void }).va = (...a: unknown[]) => {
    calls.push(a as VaCall);
  };
  return calls;
}

afterEach(() => {
  delete (window as unknown as { va?: unknown }).va;
  vi.unstubAllEnvs();
});

describe("analytics helpers", () => {
  it("buckets lengths coarsely", () => {
    expect(lengthBucket(0)).toBe("<40");
    expect(lengthBucket(39)).toBe("<40");
    expect(lengthBucket(40)).toBe("40-120");
    expect(lengthBucket(119)).toBe("40-120");
    expect(lengthBucket(120)).toBe("120-300");
    expect(lengthBucket(300)).toBe("300+");
  });

  it("reads a declarative event and snake_cases its data-track-* properties", () => {
    const a = document.createElement("a");
    a.setAttribute("data-track", "evidence_clicked");
    a.setAttribute("data-track-slug", "eval-lab");
    a.setAttribute("data-track-kind", "live");
    a.setAttribute("data-track-long-name", "x");
    expect(eventFromElement(a)).toEqual({ event: "evidence_clicked", props: { slug: "eval-lab", kind: "live", long_name: "x" } });
  });

  it("ignores elements without data-track", () => {
    const div = document.createElement("div");
    div.setAttribute("data-track-kind", "live");
    expect(eventFromElement(div)).toBeNull();
  });
});

describe("the Vercel sink", () => {
  it("records a custom event with NO PostHog key configured", () => {
    // The whole point: this is the deployed state, and it used to send nothing.
    const calls = captureVa();
    track("evidence_clicked", { slug: "eval-lab", kind: "live" });
    expect(calls).toHaveLength(1);
    expect(calls[0][0]).toBe("event");
    expect(calls[0][1].name).toBe("evidence_clicked");
    expect(calls[0][1].data).toMatchObject({ app: APP, slug: "eval-lab", kind: "live" });
  });

  it("does not forward PostHog's $pageview, which Vercel counts itself", () => {
    const calls = captureVa();
    track("$pageview", { $current_url: "https://example.test/" });
    expect(calls).toEqual([]);
  });

  it("drops null and undefined props, which Vercel's API rejects", () => {
    const calls = captureVa();
    track("project_opened", { slug: "simplescope", missing: null, absent: undefined, n: 3, ok: true });
    expect(calls[0][1].data).toEqual({ app: APP, slug: "simplescope", n: 3, ok: true });
  });

  it("stays silent, and does not throw, when window.va is absent", () => {
    // Local dev and CI render no Vercel script at all.
    delete (window as unknown as { va?: unknown }).va;
    expect(() => track("cta_clicked", { target: "contact" })).not.toThrow();
  });
});
