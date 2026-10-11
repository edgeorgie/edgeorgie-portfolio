import { describe, it, expect } from "vitest";
import { COMMANDS, isCommand, runCommand } from "./console";
import { projects, experience } from "@/data/content";
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
    expect(r.lines).toHaveLength(projects.length);
    for (const p of projects) {
      const line = r.lines.find((l) => l.text.startsWith(p.name));
      expect(line?.href).toBe(`#project-${p.slug}`);
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
});
