import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { COMMANDS, isCommand, runCommand } from "./console";
import { projects, moreProjects, experience } from "@/data/content";
import { links } from "@/lib/site";

describe("console commands", () => {
  it("treats only a leading slash as a command", () => {
    expect(isCommand("/help")).toBe(true);
    expect(isCommand("  /projects")).toBe(true);
    expect(isCommand("what has he shipped?")).toBe(false);
    expect(runCommand("what has he shipped?")).toBeNull();
  });

  it("/help lists every documented command", () => {
    const r = runCommand("/help");
    expect(r?.kind).toBe("output");
    if (r?.kind !== "output") return;
    const text = r.lines.map((l) => l.text).join("\n");
    for (const c of COMMANDS) expect(text).toContain(`/${c.name}`);
  });

  it("/projects links every project to its card anchor", () => {
    const r = runCommand("/projects");
    if (r?.kind !== "output") throw new Error("expected output");
    expect(r.lines.filter((l) => l.href)).toHaveLength(projects.length + moreProjects.length);
    const first = (text: string) => text.trim().split(/\s+/)[0];
    for (const p of projects) {
      const line = r.lines.find((l) => first(l.text) === p.name);
      expect(line?.href).toBe(`#project-${p.slug}`);
    }
    for (const p of moreProjects) {
      const line = r.lines.find((l) => first(l.text) === p.name);
      expect(line?.href).toBe(`#repo-${p.name}`);
    }
  });

  it("/experience lists every job in order", () => {
    const r = runCommand("/experience");
    if (r?.kind !== "output") throw new Error("expected output");
    expect(r.lines.map((l) => l.text)).toEqual(experience.map((j) => expect.stringContaining(j.company)));
  });

  it("/contact exposes the real channels and no invented ones", () => {
    const r = runCommand("/contact");
    if (r?.kind !== "output") throw new Error("expected output");
    const hrefs = r.lines.map((l) => l.href);
    expect(hrefs).toContain(links.mailto);
    expect(hrefs).toContain(links.github);
    expect(hrefs).toContain(links.linkedin);
    // WhatsApp only appears when configured through the environment.
    const hasWhatsapp = hrefs.some((h) => h?.startsWith("https://wa.me/"));
    expect(hasWhatsapp).toBe(Boolean(links.whatsapp));
  });

  it("/clear is a distinct result kind", () => {
    expect(runCommand("/clear")).toEqual({ kind: "clear" });
  });

  it("is case-insensitive and tolerant of arguments", () => {
    expect(runCommand("/HELP now")?.kind).toBe("output");
  });

  it("unknown commands fail soft with a hint", () => {
    const r = runCommand("/rm -rf");
    if (r?.kind !== "output") throw new Error("expected output");
    expect(r.lines[0].text).toContain("command not found: /rm -rf");
    expect(r.lines.some((l) => l.text.includes("/help"))).toBe(true);
  });

  it("no copy anywhere states a project count that the data contradicts", () => {
    // Guards the defect class this test was added for: a hand-written number
    // ("6", "fifteen", "Nine") in one surface drifting out of step with the
    // arrays once a project is added. Every count-bearing string must be
    // derived, so the only safe assertion is that no stale spelled-out or
    // literal count survives in the files that render these claims.
    const root = resolve(__dirname, "../..");
    const surfaces = ["src/components/Hero.tsx", "src/components/MoreProjects.tsx", "src/lib/console.ts"];
    const stale = /\b(six|nine|fifteen)\b|value="\d+"/i;
    for (const f of surfaces) {
      // The spelled-out lookup table and comments are data/prose, not claims;
      // everything else in these files is rendered copy and must be derived.
      const copy = readFileSync(resolve(root, f), "utf8")
        .split("\n")
        .filter((l) => !l.includes("COUNT_WORD = [") && !l.trimStart().startsWith("*") && !l.trimStart().startsWith("/*"))
        .join("\n");
      expect(copy, `${f} hard-codes a project count`).not.toMatch(stale);
    }

    // And the derived values are the real ones.
    const projectsCmd = COMMANDS.find((c) => c.name === "projects");
    expect(projectsCmd?.description).toContain(String(projects.length + moreProjects.length));
  });
});
