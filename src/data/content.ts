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
      "A live MCP server about ME, not a repo. get_experience / get_projects / ask_about_edgeorgie, backed by TF-IDF retrieval with exact file+line citations over my real resume, case studies, and reliability reports. Synthesizes grounded prose with a real model (Claude Haiku) when an LLM key is configured, citing every claim back to a source excerpt — falls back to a deterministic citation dump otherwise, same corpus either way, no invented answers. Scoped and guarded: it only answers questions about me, declines off-topic requests, and resists prompt injection from its own retrieved text. Verified by a real @modelcontextprotocol/sdk client over Streamable HTTP against the live deployed URL, not a local stdio demo.",
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
  {
    slug: "crispy-profiling",
    name: "crispy-profiling",
    tagline: "React re-render profiler, published to npm, for humans and agents alike.",
    description:
      "A React re-render profiler shipped as four surfaces off one engine: CLI, GitHub Action, MCP server, and an Agent Skill so Claude Code, Cursor, Codex and similar tools can measure a re-render fix instead of guessing at one. Opens the target app in headless Chromium, drives described interactions, and reports which components re-rendered, how many times, and why (props/state/context/parent) — validated against 5 real open-source apps (Redux Essentials, Next.js App Router Playground, Excalidraw, shadcn-admin, react-admin), finding a fixable re-render problem in each.",
    stats: [
      { label: "Status", value: "Published on npm" },
      { label: "Validated against", value: "5 real OSS apps" },
      { label: "React versions", value: "19 tested, 18.3/19.0 validated" },
      { label: "Surfaces", value: "CLI + Action + MCP + Agent Skill" },
    ],
    links: [
      { label: "GitHub", href: "https://github.com/edgeorgie/crispy-profiling" },
      { label: "npm", href: "https://www.npmjs.com/package/crispy-profiling" },
    ],
    stack: ["TypeScript", "Playwright/Chromium", "MCP SDK", "GitHub Actions"],
  },
  {
    slug: "simplescope",
    name: "simplescope",
    tagline: "Learn algorithms by watching real JavaScript run, not static diagrams.",
    description:
      "An interactive, visual, gamified platform for learning algorithms — step through real executing JavaScript instead of reading pseudo-code. Built with Next.js App Router, TypeScript, Tailwind v4, and MDX lessons; fully functional with zero required environment variables (progress falls back to browser localStorage when optional account sync isn't configured).",
    stats: [
      { label: "Status", value: "Live, publicly deployed" },
      { label: "Required env vars", value: "0 — works out of the box" },
      { label: "Stack", value: "Next.js App Router + TypeScript" },
    ],
    links: [
      { label: "GitHub", href: "https://github.com/edgeorgie/simplescope" },
      { label: "Live site", href: "https://simplescope-one.vercel.app" },
    ],
    stack: ["TypeScript", "Next.js", "Tailwind v4", "shadcn/ui", "MDX"],
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
      "Led cross-platform initiatives spanning web, mobile WebViews, and AI-assisted native development in Kotlin (Android) and Swift (iOS), using Spec-Driven Development and scalable frontend architecture.",
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
  tapCopy: string;
  collapseCopy: string;
};

export const aiWorkflowPrinciples: Principle[] = [
  {
    lead: "Builder vs. operator",
    icon: "split",
    body: "Claude Code is my builder: dispatched in bursts via parallel task delegation, with no memory between sessions. A separate always-on layer, Hermes running on cron, acts as the operator, running what Claude Code builds indefinitely without needing to be re-explained. That division between building and operating is where the real leverage comes from.",
    tapCopy: "see the split",
    collapseCopy: "hide the split",
  },
  {
    lead: "Decompose, then fan out",
    icon: "parallel",
    body: "Independent workstreams run concurrently as separate delegated tasks, all anchored to one shared audit-trail log. I map out which pieces have no dependency on each other first, then fire the independent ones together so results reconcile instead of silently colliding.",
    tapCopy: "see how it fans out",
    collapseCopy: "collapse the fan-out",
  },
  {
    lead: "Standing skills",
    icon: "skill",
    body: "Recurring procedures, things like cron-gating conventions, verification checklists, and approval-gate rules, live as skills that load on demand instead of instructions I retype every session. I write each one once, carefully, and every future session inherits it.",
    tapCopy: "see the skill list",
    collapseCopy: "hide the skill list",
  },
  {
    lead: "Gated cron",
    icon: "gate",
    body: "Scheduled jobs skip running an expensive agent on a fixed timer. A cheap, deterministic check runs first to confirm something actually changed, and only then does the full agent run get woken up. Routine runs stay quiet; failures escalate to a real alert.",
    tapCopy: "see the gate logic",
    collapseCopy: "close the gate",
  },
  {
    lead: "Model by stakes",
    icon: "scale",
    body: "Cheap, fast models handle mechanical, low-stakes, easily-verified work. High-stakes work goes to the strongest available model and gets judged against an explicit rubric, since how easy a task looks and how costly it is to get wrong are two different questions.",
    tapCopy: "see the rubric",
    collapseCopy: "hide the rubric",
  },
  {
    lead: "Verify, don't trust",
    icon: "check",
    body: "An agent's self-report that something succeeded isn't enough for me. I re-check the actual artifact every time: the live URL, the test run, the real log line. Only one of \u201cit worked\u201d and \u201cit says it worked\u201d is something you can actually check.",
    tapCopy: "see what gets checked",
    collapseCopy: "hide the checklist",
  },
  {
    lead: "Cold-context critic",
    icon: "critic",
    body: "Before anything is called finished, a cold review pass checks it: no shared conversation history, no benefit of the doubt. A reviewer who shares context with the work usually ends up sharing its blind spots too.",
    tapCopy: "see the review pass",
    collapseCopy: "hide the review pass",
  },
  {
    lead: "Security by default",
    icon: "shield",
    body: "A pre-execution guard intercepts destructive commands before they run, and secrets never get echoed into logs or committed files. Push-time secret scanning runs on everything I ship, so none of it depends on me remembering to be careful.",
    tapCopy: "see the guardrails",
    collapseCopy: "hide the guardrails",
  },
  {
    lead: "Never idle",
    icon: "bolt",
    body: "If something could be running, I start it. Letting one task sit idle while another could be running in parallel counts as a failure mode I actively correct for.",
    tapCopy: "see why",
    collapseCopy: "collapse",
  },
];

export const links = {
  github: "https://github.com/edgeorgie",
  email: "mailto:ed.jorge1122@gmail.com",
};

export type BeyondItem = {
  year: string;
  label: string;
  body: string;
  icon: "gamepad" | "code" | "brain" | "palette" | "controller" | "guitar" | "dumbbell";
  tapCopy: string;
  collapseCopy: string;
};

/**
 * "Beyond the code" section: a chronological narrative, not a flat list —
 * each entry is a real beat in the same self-directed-learning thread that
 * runs from a shipped game at 15 through to today. Every fact here is
 * independently checkable or directly relevant to how he works (self-taught,
 * design-minded, morning-person routine). No invented numbers or claims —
 * see RECRUITER-FAQ.md in ask-edgeorgie-mcp for the first-person source this
 * section is drawn from. Ordered oldest -> newest so the timeline reads as
 * one continuous story: build it yourself, whatever "it" is.
 */
export const beyond: BeyondItem[] = [
  {
    year: "Age 15",
    label: "Shipped my first game, solo",
    body: "Built and released a 2D platformer entirely on my own — no team, no course. It got about 50 downloads. That's the first time I remember building something just to see if I could, and then actually finishing it.",
    icon: "gamepad",
    tapCopy: "see the detail",
    collapseCopy: "collapse",
  },
  {
    year: "Degree",
    label: "Electronic Engineering, then Software",
    body: "Dual degrees — Electronic Engineering and Software Development. The electronics background is part of why I don't treat a new stack as intimidating: I'm used to learning a discipline from its fundamentals up.",
    icon: "brain",
    tapCopy: "see the detail",
    collapseCopy: "collapse",
  },
  {
    year: "On the job",
    label: "Kotlin and Swift, learned by shipping",
    body: "JavaScript/TypeScript is where I'm deepest, but at Mercado Libre I picked up Kotlin (Android) and Swift (iOS) for AI-assisted native work — learned both while shipping, not before. Same pattern as the platformer: figure it out by building the real thing.",
    icon: "code",
    tapCopy: "see the detail",
    collapseCopy: "collapse",
  },
  {
    year: "Always",
    label: "Design isn't handed to me, I own it",
    body: "UX and interaction design on these projects — this portfolio included — are my own decisions, not a template someone else made. I care how something feels to use, not only whether the API underneath is correct.",
    icon: "palette",
    tapCopy: "see the detail",
    collapseCopy: "collapse",
  },
  {
    year: "Right now",
    label: "Self-teaching Unreal Engine (5.8.3)",
    body: "Still building games, not just playing them — currently teaching myself game development and design in Unreal Engine on my own time. Same self-directed approach as the platformer at 15, just a bigger engine.",
    icon: "controller",
    tapCopy: "see the detail",
    collapseCopy: "collapse",
  },
  {
    year: "Right now",
    label: "Guitar, and the gym at sunrise",
    body: "Learning to play guitar. At the gym 4 mornings a week — I'm a morning person, I'd rather get moving early than push it to the end of the day.",
    icon: "guitar",
    tapCopy: "see the detail",
    collapseCopy: "collapse",
  },
];
