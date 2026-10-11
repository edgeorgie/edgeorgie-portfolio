/**
 * Offline slash-commands for the console. Pure functions: no DOM, no
 * network, fully unit-testable. Anything that is not a recognised command
 * is treated as a free-text question for the MCP engine.
 */
import { experience, moreProjects, projects, skillGroups } from "@/data/content";
import { links, person } from "@/lib/site";

export type ConsoleLine = { text: string; href?: string; muted?: boolean };

export type CommandResult = { kind: "output"; command: string; lines: ConsoleLine[] } | { kind: "clear" };

export const COMMANDS: { name: string; description: string }[] = [
  { name: "help", description: "list commands" },
  { name: "projects", description: `all ${projects.length + moreProjects.length} public projects, with links` },
  { name: "skills", description: "capability groups" },
  { name: "experience", description: "work history" },
  { name: "contact", description: "email, GitHub, LinkedIn" },
  { name: "mcp", description: "connect your own agent to this server" },
  { name: "whoami", description: "who you are talking to" },
  { name: "clear", description: "clear the transcript" },
];

export function isCommand(input: string): boolean {
  return input.trim().startsWith("/");
}

export function runCommand(input: string): CommandResult | null {
  const raw = input.trim();
  if (!raw.startsWith("/")) return null;
  const [name, ...args] = raw.slice(1).split(/\s+/);
  const cmd = name.toLowerCase();

  switch (cmd) {
    case "help":
    case "?":
      return {
        kind: "output",
        command: cmd,
        lines: [
          { text: "Commands run locally. Anything else is sent to the live ask_about_edgeorgie engine.", muted: true },
          ...COMMANDS.map((c) => ({ text: `/${c.name.padEnd(11)} ${c.description}` })),
        ],
      };
    case "projects":
    case "ls":
      return {
        kind: "output",
        command: cmd,
        lines: [
          ...projects.map((p) => ({ text: `${p.name.padEnd(20)} ${p.tierLabel}`, href: `#project-${p.slug}` })),
          { text: "more:", muted: true },
          ...moreProjects.map((p) => ({ text: `${p.name.padEnd(20)} ${p.kind} · ${p.audience.join(" + ")}`, href: `#repo-${p.name}` })),
        ],
      };
    case "skills":
      return {
        kind: "output",
        command: cmd,
        lines: skillGroups.map((g) => ({
          text: `${g.name}: ${g.skills.map((s) => s.name).join(", ")}`,
        })),
      };
    case "experience":
    case "exp":
      return {
        kind: "output",
        command: cmd,
        lines: experience.map((j) => ({ text: `${j.period.padEnd(24)} ${j.role} · ${j.company}`, href: "#experience" })),
      };
    case "contact":
      return {
        kind: "output",
        command: cmd,
        lines: [
          { text: `email     ${links.email}`, href: links.mailto },
          { text: `github    ${links.github.replace("https://", "")}`, href: links.github },
          { text: `linkedin  ${links.linkedin.replace("https://www.", "")}`, href: links.linkedin },
          ...(links.whatsapp ? [{ text: "whatsapp  open chat", href: links.whatsapp }] : []),
        ],
      };
    case "mcp":
      return {
        kind: "output",
        command: cmd,
        lines: [
          { text: `endpoint  ${links.askMcpEndpoint}`, href: links.askMcpEndpoint },
          { text: "tools     get_experience · get_projects · get_story · ask_about_edgeorgie" },
          { text: "Paste the config under this terminal into Claude Desktop or Cursor.", muted: true },
        ],
      };
    case "whoami":
      return {
        kind: "output",
        command: cmd,
        lines: [
          { text: `${person.name} (${person.handle}) · ${person.title} · ${person.company}` },
          { text: `${person.location} · ${person.timezoneLabel} · ${person.availability}`, muted: true },
        ],
      };
    case "clear":
      return { kind: "clear" };
    case "sudo":
      return {
        kind: "output",
        command: cmd,
        lines: [
          { text: `${person.handle} is not in the sudoers file. This incident will be reported.`, muted: true },
          { text: "(The contact section works without root.)", href: "#contact" },
        ],
      };
    default:
      return {
        kind: "output",
        command: cmd,
        lines: [
          { text: `command not found: /${cmd}${args.length ? " " + args.join(" ") : ""}`, muted: true },
          { text: "type /help, or ask a question in plain words." },
        ],
      };
  }
}
