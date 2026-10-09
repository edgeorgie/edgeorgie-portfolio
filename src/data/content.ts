export type Project = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  stats: { label: string; value: string }[];
  links: { label: string; href: string }[];
  stack: string[];
};

export const projects: Project[] = [
  {
    slug: "ask-edgeorgie-mcp",
    name: "ask-edgeorgie-mcp",
    tagline: "Don't take my word for it — ask an agent directly.",
    description:
      "A live MCP server about ME, not a repo. get_experience / get_projects / ask_about_edgeorgie, backed by TF-IDF retrieval with exact file+line citations over my real resume, case studies, and reliability reports — no LLM, no invented answers, deterministic citation dumps only. Verified by a real @modelcontextprotocol/sdk client over Streamable HTTP against the live deployed URL, not a local stdio demo.",
    stats: [
      { label: "Status", value: "Live, public, no auth wall" },
      { label: "Verified by", value: "real external MCP client (HTTP)" },
      { label: "Local tests", value: "5/5 passing" },
      { label: "Transport", value: "Streamable HTTP + stdio" },
    ],
    links: [
      { label: "GitHub", href: "https://github.com/edgeorgie/ask-edgeorgie-mcp" },
      { label: "Ask me live", href: "https://ask-edgeorgie-mcp.vercel.app" },
    ],
    stack: ["TypeScript", "MCP SDK", "Vercel", "TF-IDF retrieval"],
  },
  {
    slug: "triage-desk",
    name: "triage-desk",
    tagline: "A GitHub bot that triages issues on its own — no human click.",
    description:
      "Webhook-triggered agent bot that reads a new GitHub issue, classifies kind/priority, flags likely duplicates, posts a comment, and applies labels — triggered by GitHub's own `issues: opened` webhook, not a UI button. Falls back to a deterministic heuristic when no LLM key is configured, so the full pipeline produces real, non-fabricated output end-to-end either way.",
    stats: [
      { label: "Real webhook run", value: "22s, success" },
      { label: "Kind accuracy", value: "83.3% (15/18)" },
      { label: "Priority accuracy", value: "83.3% (15/18)" },
      { label: "Local tests", value: "22/22 passing" },
    ],
    links: [
      { label: "GitHub", href: "https://github.com/edgeorgie/triage-desk" },
      {
        label: "Live Actions run",
        href: "https://github.com/edgeorgie/triage-desk/actions/runs/37983913473",
      },
      {
        label: "PR #25 (webhook bot)",
        href: "https://github.com/edgeorgie/triage-desk/pull/25",
      },
    ],
    stack: ["TypeScript", "GitHub Actions", "Octokit", "Node.js"],
  },
  {
    slug: "eval-lab",
    name: "eval-lab",
    tagline: "An installable CLI + GitHub Action that fails CI on a bad prompt.",
    description:
      "Variant runner, deterministic checks, LLM judge, and regression diff — packaged as a CLI (`npx eval-lab run`) and a reusable composite GitHub Action. Dogfooded on its own CI and on triage-desk's CI: it ran triage-desk's real heuristic-triage function directly and gated a real PR on the result.",
    stats: [
      { label: "Benchmark pass rate", value: "100% (24/24 cells, 3 runs)" },
      { label: "Avg latency", value: "~20ms / cell" },
      { label: "Cost", value: "$0 (offline demo model)" },
      { label: "Local tests", value: "7/7 passing" },
    ],
    links: [
      { label: "GitHub", href: "https://github.com/edgeorgie/eval-lab" },
      {
        label: "Benchmark run",
        href: "https://github.com/edgeorgie/eval-lab/actions/runs/37983754854",
      },
      {
        label: "Dogfooded on triage-desk CI",
        href: "https://github.com/edgeorgie/triage-desk/actions/runs/37987251361",
      },
    ],
    stack: ["Node.js ESM", "GitHub Actions", "CLI"],
  },
  {
    slug: "repoask-mcp",
    name: "repoask-mcp",
    tagline: "A live MCP server, publicly deployed, answering real questions about real repos.",
    description:
      "An MCP server built on the official @modelcontextprotocol/sdk exposing index_repo / ask_repo / list_indexed_repos tools over Streamable HTTP. It's deployed and publicly reachable right now — a real external MCP client connected to it over the open internet and got real citations back, not a local demo.",
    stats: [
      { label: "Status", value: "Live, public, no auth wall" },
      { label: "Verified by", value: "real external MCP client (HTTP)" },
      { label: "Local tests", value: "3/3 passing" },
      { label: "Transport", value: "Streamable HTTP + stdio" },
    ],
    links: [
      { label: "GitHub", href: "https://github.com/edgeorgie/repoask-mcp" },
      { label: "Live MCP endpoint", href: "https://repoask-mcp.vercel.app" },
    ],
    stack: ["TypeScript", "MCP SDK", "Vercel", "Express"],
  },
];

export const experience = [
  {
    company: "Mercado Libre",
    role: "Software Engineer",
    period: "November 2022 — Present",
    location: "Remote",
    summary:
      "LATAM e-commerce platform serving 4.3M+ users. Designed AI workflows and agent-based architectures, defining agent rules, skills, and orchestration across services.",
    bullets: [
      "Designed AI workflows and agent-based architectures, defining agent rules, skills, and orchestration across services.",
      "Led cross-platform initiatives (web, mobile, TV/Samsung/LG) using Spec-Driven Development and scalable frontend architecture.",
      "Implemented observability and monitoring using Kibana, New Relic, Datadog, and Grafana aligned with SRE practices (SLA/SLI/SLO).",
      "Applied Clean Architecture and Domain-Driven Design while refactoring legacy systems and improving code quality.",
      "Contributed to OTT video streaming platforms, including Chromecast Web Receiver development.",
    ],
  },
  {
    company: "Vansa",
    role: "Front-end Developer",
    period: "February 2022 — July 2022",
    location: "Remote",
    summary:
      "Built React frontend applications and responsive dashboards; applied Atomic Design and Clean Architecture.",
    bullets: [],
  },
  {
    company: "Freelance",
    role: "Front-end Developer & UI/UX Designer",
    period: "April 2020 — February 2022",
    location: "Remote",
    summary:
      "Designed frontend architecture/design systems, translated Figma designs into scalable React interfaces.",
    bullets: [],
  },
];

export const links = {
  github: "https://github.com/edgeorgie",
  email: "mailto:ed.jorge1122@gmail.com",
};
