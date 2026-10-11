import { describe, it, expect } from "vitest";
import { SITE_URL, links, sectionNumber, sections, withUtm } from "./site";
import { formatPushDate } from "@/components/RepoActivity";

describe("site", () => {
  it("resolves a canonical https URL without a trailing slash", () => {
    expect(SITE_URL).toMatch(/^https:\/\/[^/]+$/);
  });

  it("only exposes real, verified contact channels", () => {
    expect(links.github).toBe("https://github.com/edgeorgie");
    expect(links.linkedin).toBe("https://www.linkedin.com/in/edgeorgie");
    expect(links.mailto).toBe(`mailto:${links.email}`);
    // Never a hard-coded WhatsApp number: only from the environment.
    if (links.whatsapp) expect(links.whatsapp).toMatch(/^https:\/\/wa\.me\/\d{8,15}$/);
  });

  it("numbers sections from their page order", () => {
    expect(sectionNumber("top")).toBe("00");
    expect(sectionNumber("work")).toBe("01");
    expect(sectionNumber(sections[sections.length - 1].id)).toBe(String(sections.length - 1).padStart(2, "0"));
  });
});

describe("formatPushDate", () => {
  it("formats in UTC deterministically", () => {
    expect(formatPushDate("2026-10-10T14:20:15Z")).toBe("10 Oct 2026");
    expect(formatPushDate("2026-01-01T00:00:00Z")).toBe("1 Jan 2026");
    expect(formatPushDate("not a date")).toBe("");
  });
});

describe("withUtm", () => {
  it("tags links into the owner's vercel.app apps", () => {
    expect(withUtm("https://repoask.vercel.app")).toBe("https://repoask.vercel.app/?utm_source=portfolio&utm_medium=card");
    expect(withUtm("https://repoask.vercel.app/?x=1", "hero")).toBe("https://repoask.vercel.app/?x=1&utm_source=portfolio&utm_medium=hero");
  });
  it("leaves other hosts, existing campaigns and bad input alone", () => {
    expect(withUtm("https://github.com/edgeorgie/repoask")).toBe("https://github.com/edgeorgie/repoask");
    expect(withUtm("https://repoask.vercel.app/?utm_source=x")).toBe("https://repoask.vercel.app/?utm_source=x");
    expect(withUtm("not a url")).toBe("not a url");
  });
});
