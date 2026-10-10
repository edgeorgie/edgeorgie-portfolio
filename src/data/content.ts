export type Project = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  stats: { label: string; value: string }[];
  links: { label: string; href: string }[];
  stack: string[];
  demo?:
    | {
        kind: "triage";
        issueTitle: string;
        issueBody: string;
        result: { kind: string; priority: string; labels: string[]; confidence: number };
        sourceLabel: string;
        sourceHref: string;
      }
    | {
        kind: "benchmark";
        rows: number;
        cols: number;
        passed: number;
        total: number;
        runLabel: string;
        runHref: string;
        asOf: string;
      }
    | {
        kind: "mcp-badge";
        tools: string[];
      };
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
    demo: { kind: "mcp-badge", tools: ["get_experience", "get_projects", "ask_about_edgeorgie"] },
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
    demo: {
      kind: "triage",
      issueTitle: "Bug: duplicate detection crashes on empty issue body",
      issueBody: "Opening an issue with no body text throws inside the dedup step before labels get applied.",
      result: { kind: "bug", priority: "p0", labels: ["bug", "p0"], confidence: 0.4 },
      sourceLabel: "real run · issue #24",
      sourceHref: "https://github.com/edgeorgie/triage-desk/actions/runs/37983913473",
    },
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
    demo: {
      kind: "benchmark",
      rows: 4,
      cols: 6,
      passed: 24,
      total: 24,
      runLabel: "benchmark run · 3 passes",
      runHref: "https://github.com/edgeorgie/eval-lab/actions/runs/37983754854",
      asOf: "point-in-time result from the linked CI run, not a live feed",
    },
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
    role: "Senior Software Engineer",
    period: "November 2022 — Present",
    location: "Remote",
    summary:
      "LATAM e-commerce platform serving 4.3M+ users. Full-stack engineering across every surface — web, native Android/iOS, and smart TV/OTT — plus observability, clean architecture, and AI-agent workflow design.",
    bullets: [
      "Owned 10+ initiatives end-to-end solo, together reaching 4M+ users across LATAM; one shipped feature alone served 1.5M+ users with zero production incidents.",
      "Led cross-platform initiatives spanning web, mobile WebViews, and AI-assisted native development for Android and iOS, using Spec-Driven Development and scalable frontend architecture.",
      "Built backend APIs with caching, idempotency, and low-latency design underpinning those same web, mobile, and TV surfaces.",
      "Shipped smart TV and OTT surfaces: web receivers for LG, Samsung (Tizen), and a Chromecast Web Receiver, for video streaming.",
      "Implemented observability and monitoring using Kibana, New Relic, Datadog, and Grafana aligned with SRE practices (SLA/SLI/SLO).",
      "Applied Clean Architecture and Domain-Driven Design while refactoring legacy systems and improving code quality.",
      "Designed and owned AI-agent architectures end-to-end — defining agent rules, skills, and cross-service orchestration — as a sustained, multi-year production responsibility since Nov 2022, not a one-off project.",
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

export type PrincipleIcon =
  | "split"
  | "parallel"
  | "skill"
  | "gate"
  | "scale"
  | "check"
  | "critic"
  | "shield"
  | "bolt";

export type Principle = {
  lead: string;
  icon: PrincipleIcon;
  body: string;
};

export const aiWorkflowPrinciples: Principle[] = [
  {
    lead: "Builder vs. operator",
    icon: "split",
    body: "Claude Code is my \u201cbuilder\u201d \u2014 dispatched in bursts via parallel task delegation, no memory between sessions. A separate always-on layer (Hermes/cron) is the \u201coperator\u201d that runs what Claude Code builds, indefinitely, without needing to be re-explained. That split is the actual leverage move, not the model itself.",
  },
  {
    lead: "Parallel, not serial",
    icon: "parallel",
    body: "Independent workstreams run concurrently as separate delegated tasks, anchored to one shared audit-trail log. I decompose first \u2014 which pieces have no dependency on each other? \u2014 then fire them together so results reconcile instead of silently colliding.",
  },
  {
    lead: "Standing skills",
    icon: "skill",
    body: "Recurring procedures \u2014 cron-gating conventions, verification checklists, approval-gate rules \u2014 live as skills that load on demand, not instructions I retype every session. Write it once correctly, let every future session inherit it.",
  },
  {
    lead: "Gated cron",
    icon: "gate",
    body: "Scheduled jobs don't run an expensive agent on a fixed timer. A cheap, deterministic check runs first \u2014 did anything actually change? \u2014 and only wakes the full agent run if yes. Routine runs stay quiet; failures escalate to a real alert.",
  },
  {
    lead: "Model by stakes",
    icon: "scale",
    body: "Cheap, fast models handle mechanical, low-stakes, easily-verified work. The strongest available model gets high-stakes work, judged against an explicit rubric \u2014 because \u201ceasy\u201d and \u201ccheap to get wrong\u201d aren't the same question.",
  },
  {
    lead: "Verify, don't trust",
    icon: "check",
    body: "I don't accept an agent's self-report that something succeeded. I re-check the actual artifact: the live URL, the test run, the real log line. Narrating success and actually succeeding are different claims, and only one is checkable.",
  },
  {
    lead: "Cold-context critic",
    icon: "critic",
    body: "Before anything is called finished, a cold review pass \u2014 no shared conversation history, no benefit of the doubt \u2014 checks it, specifically because a reviewer sharing context with the work tends to share its blind spots too.",
  },
  {
    lead: "Security by default",
    icon: "shield",
    body: "A pre-execution guard intercepts destructive commands before they run. Secrets never get echoed into logs or committed files. Push-time secret scanning runs on everything I ship \u2014 none of it depends on me remembering to be careful.",
  },
  {
    lead: "Never idle",
    icon: "bolt",
    body: "If something could be running, it's running \u2014 idle time while one task could be started in parallel is a failure mode I actively correct for.",
  },
];

export const links = {
  github: "https://github.com/edgeorgie",
  email: "mailto:ed.jorge1122@gmail.com",
};
