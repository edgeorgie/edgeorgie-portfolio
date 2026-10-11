// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { eventFromElement, lengthBucket } from "./analytics";

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
