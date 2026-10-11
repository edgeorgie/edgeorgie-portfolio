/**
 * All copy and facts for the site live here. Every number, link and claim
 * traces to something checkable: the committed resume and recruiter FAQ in
 * ask-edgeorgie-mcp, a project README, a CI run, the npm registry or a live
 * URL. Nothing here is estimated or invented — see docs/AUDIT.md "Links
 * verified" for how each was checked.
 */

/* ------------------------------------------------------------------ */
/* Projects                                                             */
/* ------------------------------------------------------------------ */

export type ProjectTier = "live" | "published" | "shipped";

export type EvidenceKind = "repo" | "live" | "run" | "pr" | "npm" | "endpoint";

export type Evidence = { label: string; href: string; kind: EvidenceKind };

export type ProjectPreview =
  | { kind: "image"; src: string; alt: string; width: number; height: number }
  | {
      kind: "triage";
      issueTitle: string;
      issueBody: string;
      result: { kind: string; priority: string; labels: string[]; confidence: number };
      sourceLabel: string;
      sourceHref: string;
    }
  | { kind: "benchmark"; rows: number; cols: number; passed: number; total: number; runLabel: string; runHref: string }
  | { kind: "tools"; title: string; tools: string[]; footnote: string; cta?: { label: string; href: string } }
  | { kind: "surfaces"; engine: string; surfaces: { name: string; detail: string }[] };

export type Project = {
  slug: string;
  name: string;
  tier: ProjectTier;
  tierLabel: string;
  /** Repo name under github.com/edgeorgie, used for the live "last push" line. */
  repo?: string;
  tagline: string;
  problem: string;
  role: string;
  architecture: string[];
  challenges: string[];
  stack: string[];
  stats: { label: string; value: string; sub?: string }[];
  evidence: Evidence[];
  preview: ProjectPreview;
};

export const projects: Project[] = [
  {
    slug: "ask-edgeorgie-mcp",
    name: "ask-edgeorgie-mcp",
    tier: "live",
    tierLabel: "Live · public MCP server",
    repo: "ask-edgeorgie-mcp",
    tagline: "A résumé you can interrogate. An MCP server about me, with every answer cited to a file and line.",
    problem:
      "A résumé can't answer follow-up questions, and an AI recruiter can't read a PDF. This lets a person or an agent ask directly and get grounded, cited answers without me in the loop.",
    role: "Solo: retrieval design, server, prompt guardrails, deployment and verification.",
    architecture: [
      "Official @modelcontextprotocol/sdk over Streamable HTTP and stdio; four tools: get_experience, get_projects, get_story, ask_about_edgeorgie.",
      "TF-IDF retrieval from @edgeorgie/retrieval-core (shared with repoask-mcp) over four committed public files: resume, reliability report, build log, recruiter FAQ.",
      "Grounded synthesis with claude-haiku-4-5 when a key is configured; deterministic cited-excerpt mode otherwise. Same corpus, same citations either way.",
      "Scoped to questions about me: declines off-topic requests and resists prompt injection from its own retrieved text.",
    ],
    challenges: [
      "Every claim in a generated answer must map back to a source excerpt with a line range, or the answer is not emitted.",
      "Verified by a real external MCP client over HTTP against the deployed URL, not a local stdio demo.",
    ],
    stack: ["TypeScript", "MCP SDK", "TF-IDF retrieval", "Anthropic API", "Vercel"],
    stats: [
      { label: "Status", value: "Live", sub: "public, no auth wall" },
      { label: "Answer mode", value: "llm", sub: "claude-haiku-4-5, cited" },
      { label: "Tools", value: "4", sub: "over HTTP + stdio" },
      { label: "Local tests", value: "5/5", sub: "passing" },
    ],
    evidence: [
      { label: "Source", href: "https://github.com/edgeorgie/ask-edgeorgie-mcp", kind: "repo" },
      { label: "Live site", href: "https://ask-edgeorgie-mcp.vercel.app", kind: "live" },
      { label: "/mcp endpoint", href: "https://ask-edgeorgie-mcp.vercel.app/mcp", kind: "endpoint" },
    ],
    preview: {
      kind: "tools",
      title: "Tools exposed over MCP",
      tools: ["get_experience", "get_projects", "get_story", "ask_about_edgeorgie"],
      footnote: "Same engine as the console on this page.",
      cta: { label: "Ask it here", href: "#ask-me" },
    },
  },
  {
    slug: "simplescope",
    name: "simplescope",
    tier: "live",
    tierLabel: "Live · web app",
    tagline: "Learn algorithms by watching real JavaScript run, step by step, and predicting what happens next.",
    problem:
      "Algorithm courses show static diagrams or pseudo-code. SimpleScope records every step from the actual running JavaScript so you can scrub through a real execution, predict the next state, and check yourself.",
    role: "Solo: product, interaction design, visualiser engine, lessons, deployment.",
    architecture: [
      "Next.js App Router + TypeScript + Tailwind v4, lessons authored in MDX, UI primitives from shadcn/ui.",
      "An instrumented runner records comparisons and writes from the real algorithm implementation; the visualiser replays the trace.",
      "Zero required environment variables: progress lives in localStorage, with optional account sync when configured.",
      "Learning loop with XP, streaks, race and compare modes across 19 lessons.",
    ],
    challenges: [
      "Making the recorded trace both faithful to the code and legible at a glance (highlighting the current comparison, write and pointer).",
    ],
    stack: ["TypeScript", "Next.js", "Tailwind v4", "shadcn/ui", "MDX"],
    stats: [
      { label: "Status", value: "Live", sub: "publicly deployed" },
      { label: "Lessons", value: "19", sub: "searching, sorting, graphs, DS" },
      { label: "Required env vars", value: "0", sub: "works out of the box" },
      { label: "Stack", value: "Next.js", sub: "App Router + TypeScript" },
    ],
    evidence: [{ label: "Live site", href: "https://simplescope-one.vercel.app", kind: "live" }],
    preview: {
      kind: "image",
      src: "/previews/simplescope.webp",
      alt: "SimpleScope landing page: a bubble-sort run visualised as bars, with step 6 of 42, comparisons and writes counted live.",
      width: 1280,
      height: 800,
    },
  },
  {
    slug: "crispy-profiling",
    name: "crispy-profiling",
    tier: "published",
    tierLabel: "Published on npm",
    repo: "crispy-profiling",
    tagline: "A React re-render profiler for humans and agents: measure the fix instead of guessing at it.",
    problem:
      "Unnecessary re-renders are easy to suspect and hard to prove. crispy-profiling opens the app in headless Chromium, drives the interactions you describe, and reports which components rendered, how often and why.",
    role: "Solo: profiler engine, four product surfaces, validation against real apps, npm release.",
    architecture: [
      "One engine, four surfaces: CLI (crispy scan / run / test / compare), a GitHub Action that posts to the job summary and PR, an MCP server (scan_app, test_render_snapshots) and an Agent Skill for Claude Code, Cursor and Codex.",
      "Attributes each render to props, state, context or parent, and snapshot-tests re-render counts so regressions fail CI.",
      "Needs no changes to the target app; CI matrix on Node 20, 22 and 24.",
    ],
    challenges: [
      "Validated against five real open-source apps (Redux Essentials, Next.js App Router Playground, Excalidraw, shadcn-admin, react-admin), finding a fixable re-render problem in each.",
    ],
    stack: ["TypeScript", "Playwright / Chromium", "MCP SDK", "GitHub Actions", "npm"],
    stats: [
      { label: "npm", value: "v0.6.0", sub: "7 versions published" },
      { label: "Validated on", value: "5", sub: "real open-source apps" },
      { label: "Surfaces", value: "4", sub: "CLI · Action · MCP · Skill" },
      { label: "React", value: "19", sub: "tested; 18.3 / 19.0 validated" },
    ],
    evidence: [
      { label: "Source", href: "https://github.com/edgeorgie/crispy-profiling", kind: "repo" },
      { label: "npm package", href: "https://www.npmjs.com/package/crispy-profiling", kind: "npm" },
    ],
    preview: {
      kind: "surfaces",
      engine: "render profiler",
      surfaces: [
        { name: "CLI", detail: "crispy scan · run · test · compare" },
        { name: "GitHub Action", detail: "fails PRs on re-render regressions" },
        { name: "MCP server", detail: "scan_app · test_render_snapshots" },
        { name: "Agent Skill", detail: "measure → fix → re-measure" },
      ],
    },
  },
  {
    slug: "triage-desk",
    name: "triage-desk",
    tier: "shipped",
    tierLabel: "Shipped · autonomous bot",
    repo: "triage-desk",
    tagline: "A GitHub bot that triages new issues on its own, triggered by the real webhook, not a button.",
    problem:
      "Issue triage is repetitive and delayed. The bot reads a new issue the moment it opens, classifies kind and priority, flags likely duplicates, posts a comment and applies labels.",
    role: "Solo: agent design, tools, benchmark, GitHub Actions workflow.",
    architecture: [
      "Runs from GitHub's own issues: opened webhook through a GitHub Actions workflow; a headless script reuses the agent, tools and triage schema.",
      "Falls back to a deterministic heuristic when no LLM key is configured, so the pipeline produces real, non-fabricated output end to end either way.",
      "JSON run logs uploaded as workflow artifacts; its own CI is gated by eval-lab.",
    ],
    challenges: [
      "Accuracy is measured against a committed 18-issue benchmark rather than eyeballed: 15/18 on kind and 15/18 on priority.",
    ],
    stack: ["TypeScript", "GitHub Actions", "Octokit", "Node.js"],
    stats: [
      { label: "Real webhook run", value: "22 s", sub: "success, triggered by issues" },
      { label: "Kind accuracy", value: "83.3%", sub: "15 / 18 benchmark" },
      { label: "Priority accuracy", value: "83.3%", sub: "15 / 18 benchmark" },
      { label: "Local tests", value: "22/22", sub: "passing" },
    ],
    evidence: [
      { label: "Source", href: "https://github.com/edgeorgie/triage-desk", kind: "repo" },
      { label: "Webhook run", href: "https://github.com/edgeorgie/triage-desk/actions/runs/37983913473", kind: "run" },
      { label: "PR #25 (bot)", href: "https://github.com/edgeorgie/triage-desk/pull/25", kind: "pr" },
    ],
    preview: {
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
    tier: "shipped",
    tierLabel: "Shipped · CLI + GitHub Action",
    repo: "eval-lab",
    tagline: "An installable CLI and GitHub Action that fails CI when a prompt regresses.",
    problem:
      "Prompt changes break things silently. eval-lab runs prompt variants against test cases with deterministic checks and an LLM judge, then diffs runs so a regression blocks the merge.",
    role: "Solo: runner, judge, Action packaging, dogfooding on two repos.",
    architecture: [
      "Variant runner + deterministic checks + LLM judge + regression diff, packaged as a CLI (npx eval-lab run) and a reusable composite GitHub Action.",
      "Dogfooded on its own CI and on triage-desk's CI: it ran triage-desk's real heuristic-triage function and gated a real PR on the result.",
    ],
    challenges: ["Keeping the benchmark free: an offline demo model gives a $0, deterministic baseline for CI."],
    stack: ["Node.js ESM", "GitHub Actions", "CLI"],
    stats: [
      { label: "Benchmark", value: "24/24", sub: "cells passing, 3 runs" },
      { label: "Avg latency", value: "~20 ms", sub: "per cell" },
      { label: "Local tests", value: "7/7", sub: "passing" },
      { label: "Benchmark cost", value: "$0", sub: "offline demo model" },
    ],
    evidence: [
      { label: "Source", href: "https://github.com/edgeorgie/eval-lab", kind: "repo" },
      { label: "Benchmark run", href: "https://github.com/edgeorgie/eval-lab/actions/runs/37983754854", kind: "run" },
      { label: "Gating triage-desk CI", href: "https://github.com/edgeorgie/triage-desk/actions/runs/37987251361", kind: "run" },
    ],
    preview: {
      kind: "benchmark",
      rows: 4,
      cols: 6,
      passed: 24,
      total: 24,
      runLabel: "point-in-time result from the linked CI run",
      runHref: "https://github.com/edgeorgie/eval-lab/actions/runs/37983754854",
    },
  },
  {
    slug: "repoask-mcp",
    name: "repoask-mcp",
    tier: "live",
    tierLabel: "Live · public MCP server",
    repo: "repoask-mcp",
    tagline: "Ask any public GitHub repo a question and get line-cited answers, over MCP or a web UI.",
    problem:
      "Reading an unfamiliar codebase is slow. repoask-mcp indexes a repo's text files and answers questions with file-and-line citations, usable by any MCP client or from the browser.",
    role: "Solo: indexer, MCP server, REST wrappers, web UI, deployment.",
    architecture: [
      "index_repo / ask_repo / list_indexed_repos on the official @modelcontextprotocol/sdk, over Streamable HTTP (/mcp) and stdio.",
      "TF-IDF chunk index built from the GitHub REST API; Zod-validated tool schemas; optional LLM synthesis with claude-haiku-4-5 or gpt-4o-mini.",
      "The human UI calls the same TypeScript functions the MCP tool handlers call: one engine, two front doors.",
    ],
    challenges: ["Verified from a real external MCP client over the open internet, with real citations back."],
    stack: ["TypeScript", "MCP SDK", "Express", "Zod", "Vercel"],
    stats: [
      { label: "Status", value: "Live", sub: "public, no auth wall" },
      { label: "Tests", value: "42", sub: "across 9 files" },
      { label: "Tools", value: "3", sub: "index · ask · list" },
      { label: "Transport", value: "HTTP", sub: "+ stdio" },
    ],
    evidence: [
      { label: "Source", href: "https://github.com/edgeorgie/repoask-mcp", kind: "repo" },
      { label: "Live UI + /mcp", href: "https://repoask-mcp.vercel.app", kind: "live" },
    ],
    preview: {
      kind: "tools",
      title: "Tools exposed over MCP",
      tools: ["index_repo", "ask_repo", "list_indexed_repos"],
      footnote: "Citations come back as file:line ranges.",
      cta: { label: "Open the live UI", href: "https://repoask-mcp.vercel.app" },
    },
  },
];

/* ------------------------------------------------------------------ */
/* More projects — the rest of the public, non-fork repos. Curated by  */
/* hand; descriptions are the repos' own. Previews are real screenshots */
/* of the live apps; projects without a UI get an honest text tile.     */
/* ------------------------------------------------------------------ */

export type Audience = "humans" | "agents";

export type MoreProject = {
  name: string;
  description: string;
  language: string;
  kind: string;
  audience: Audience[];
  repo: string;
  live?: string;
  note?: string;
  preview?: { src: string; alt: string; width: number; height: number };
};

export const moreProjects: MoreProject[] = [
  {
    name: "repoask",
    description: "Ask any public GitHub repo a question. Local embeddings in the browser, answers cite exact lines.",
    language: "TypeScript",
    kind: "Web app + MCP",
    audience: ["humans", "agents"],
    repo: "https://github.com/edgeorgie/repoask",
    live: "https://repoask.vercel.app",
    note: "MiniLM embeddings via Transformers.js, in the browser; /api/mcp for agents",
    preview: { src: "/previews/repoask.webp", alt: "repoask web app: a field to enter a public GitHub repository and ask it questions, answers cite exact lines.", width: 1280, height: 800 },
  },
  {
    name: "issue-scout",
    description: "Find open source issues you can actually fix, scored by repo health and contribution policy.",
    language: "TypeScript",
    kind: "Web app",
    audience: ["humans"],
    repo: "https://github.com/edgeorgie/issue-scout",
    live: "https://issue-scout-seven.vercel.app",
    note: "Next.js 16 + React 19; flags each project's stance on AI-assisted contributions",
    preview: { src: "/previews/issue-scout.webp", alt: "issue-scout landing page with a GitHub username field and a Scout button.", width: 1280, height: 800 },
  },
  {
    name: "recall-local",
    description: "Search your own notes by meaning. Local embeddings, a memory map of your notes, nothing leaves the browser.",
    language: "TypeScript",
    kind: "Web app",
    audience: ["humans"],
    repo: "https://github.com/edgeorgie/recall-local",
    live: "https://recall-local.vercel.app",
    preview: { src: "/previews/recall-local.webp", alt: "recall-local home screen: semantic search over your notes with a zoomable memory map.", width: 1280, height: 800 },
  },
  {
    name: "codereel",
    description: "Browser-based editor for animated code and devlog videos. No install.",
    language: "TypeScript",
    kind: "Web app",
    audience: ["humans"],
    repo: "https://github.com/edgeorgie/codereel",
    live: "https://codereel.vercel.app",
    note: "client-side only, no backend; exports 16:9, 9:16, 1:1 and 4:5",
    preview: { src: "/previews/codereel.webp", alt: "codereel editor: code on the left, an animated video preview on the right.", width: 1280, height: 800 },
  },
  {
    name: "errorlens",
    description: "Paste a screenshot of an error and get a plain explanation, likely causes and the fix from a vision model.",
    language: "TypeScript",
    kind: "Web app",
    audience: ["humans"],
    repo: "https://github.com/edgeorgie/errorlens",
    live: "https://errorlens-one.vercel.app",
    preview: { src: "/previews/errorlens.webp", alt: "errorlens: drop zone for an error screenshot that returns an explanation, likely causes and a fix.", width: 1280, height: 800 },
  },
  {
    name: "agentlens",
    description: "Zero-dependency tracing + waterfall visualizer for AI agent tool calls: latency, tokens, cost, nesting, errors.",
    language: "TypeScript",
    kind: "Tracer + viewer",
    audience: ["agents", "humans"],
    repo: "https://github.com/edgeorgie/agentlens",
    live: "https://agentlens-nine.vercel.app",
    note: "v0.1.0; Node builtins only; not on npm yet (install from GitHub)",
    preview: { src: "/previews/agentlens.webp", alt: "agentlens viewer showing the example trace as a waterfall of nested tool calls with latency and token columns.", width: 1280, height: 800 },
  },
  {
    name: "budget-keeper",
    description: "Cost-governed multi-step agent: hard per-run USD budget enforced mid-stream at the token level, automatic model-tier routing, kill-switch with partial-result handoff.",
    language: "TypeScript",
    kind: "Agent + CLI",
    audience: ["agents"],
    repo: "https://github.com/edgeorgie/budget-keeper",
    note: "runs locally with a live SSE dashboard; no public instance",
  },
  {
    name: "trajectory-grader",
    description: "Harness that scores agent tool-call trajectories (process quality) against a declarative rubric, not just final answers.",
    language: "Python",
    kind: "Eval harness + CLI",
    audience: ["agents"],
    repo: "https://github.com/edgeorgie/trajectory-grader",
    note: "day-1, actively developing; Python 3.11+",
  },
  {
    name: "retrieval-core",
    description: "Shared TF-IDF chunking/scoring/prompt core extracted from repoask-mcp and ask-edgeorgie-mcp.",
    language: "TypeScript",
    kind: "Library",
    audience: ["agents"],
    repo: "https://github.com/edgeorgie/retrieval-core",
    note: "installed as a git dependency by both MCP servers; not on npm",
  },
];

/* ------------------------------------------------------------------ */
/* Experience (sourced from the committed resume only)                  */
/* ------------------------------------------------------------------ */

export type Job = {
  company: string;
  role: string;
  period: string;
  location: string;
  summary: string;
  bullets: string[];
};

export const experience: Job[] = [
  {
    company: "Mercado Libre",
    role: "Senior Software Engineer",
    period: "Nov 2022 — Present",
    location: "Remote",
    summary:
      "LATAM's largest e-commerce platform, 4.3M+ users on the surfaces I work on. Full-stack across web, native Android/iOS and smart TV/OTT, with observability and clean architecture as standing responsibilities.",
    bullets: [
      "Owned 10+ initiatives end-to-end solo, together reaching 4M+ users across LATAM; one feature alone served 1.5M+ users with zero production incidents.",
      "Led cross-platform work spanning web, mobile WebViews and AI-assisted native development in Kotlin (Android) and Swift (iOS), using Spec-Driven Development and a scalable frontend architecture.",
      "Shipped smart TV and OTT surfaces for video streaming: web receivers for LG, Samsung (Tizen), Vidaa and TitanOS, and a Chromecast Web Receiver.",
      "Built backend APIs with caching, idempotency and low-latency design underpinning the same web, mobile and TV surfaces.",
      "Implemented observability with Kibana, New Relic, Datadog and Grafana aligned with SRE practice (SLA / SLI / SLO).",
      "Applied Clean Architecture and Domain-Driven Design while refactoring legacy systems; comprehensive unit, integration and E2E testing.",
      "Designed and owned AI-agent architectures end-to-end (agent rules, skills, cross-service orchestration) as a sustained production responsibility, not a one-off project.",
    ],
  },
  {
    company: "Vansa",
    role: "Front-end Developer",
    period: "Feb 2022 — Jul 2022",
    location: "Remote",
    summary:
      "React applications and responsive dashboards with JavaScript, SASS and Framer Motion; performance, accessibility and cross-browser work; Atomic Design, SOLID and Clean Architecture for reusable components.",
    bullets: [],
  },
  {
    company: "Freelance",
    role: "Front-end Developer & UI/UX Designer",
    period: "Apr 2020 — Feb 2022",
    location: "Remote",
    summary:
      "Designed frontend architectures and design systems; translated Figma designs into scalable React interfaces with reusable components and hooks; improved Time to Interactive with Next.js SSR and SEO work.",
    bullets: [],
  },
];

export const leadership: { org: string; role: string; period: string; detail: string }[] = [
  {
    org: "University of Antioquia",
    role: "Head of development and design",
    period: "Jul — Dec 2021",
    detail: "Led two MERN development teams; roadmaps in Figma and Trello; sprint planning with Scrum.",
  },
  {
    org: "IEEE student branch, Barranquilla",
    role: "Lead and board member",
    period: "2019",
    detail: "Coordinated and spoke at two online events: a Python workshop (50+ attendees) and an IoT application-architecture talk (100+).",
  },
];

/* ------------------------------------------------------------------ */
/* Skills — the character sheet. Evidence, not self-rated bars.         */
/* `prod` = used professionally at Mercado Libre (resume).              */
/* `projects` = public projects on this page where it is used.          */
/* ------------------------------------------------------------------ */

export type Skill = { name: string; prod?: boolean; projects?: string[] };

export type SkillGroup = { id: string; name: string; blurb: string; skills: Skill[] };

export const skillGroups: SkillGroup[] = [
  {
    id: "frontend",
    name: "Frontend engineering",
    blurb: "Where I'm deepest: TypeScript and React, from component architecture to render performance.",
    skills: [
      { name: "TypeScript", prod: true, projects: ["ask-edgeorgie-mcp", "repoask-mcp", "crispy-profiling", "simplescope", "triage-desk"] },
      { name: "React", prod: true, projects: ["crispy-profiling", "simplescope"] },
      { name: "Next.js", prod: true, projects: ["simplescope"] },
      { name: "Component architecture & design systems", prod: true },
      { name: "Accessibility", prod: true },
      { name: "Render performance", prod: true, projects: ["crispy-profiling"] },
      { name: "Tailwind CSS", projects: ["simplescope"] },
      { name: "Framer Motion", prod: true },
    ],
  },
  {
    id: "ai",
    name: "AI & agent engineering",
    blurb: "Agents as production systems: tools, retrieval, evals and guardrails, not just prompts.",
    skills: [
      { name: "MCP servers", projects: ["ask-edgeorgie-mcp", "repoask-mcp", "crispy-profiling"] },
      { name: "Agent workflows & orchestration", prod: true, projects: ["triage-desk"] },
      { name: "LLM integration (Anthropic, OpenAI, local)", prod: true, projects: ["ask-edgeorgie-mcp", "repoask-mcp"] },
      { name: "Retrieval / RAG", projects: ["ask-edgeorgie-mcp", "repoask-mcp"] },
      { name: "Evals & LLM-as-judge", projects: ["eval-lab"] },
      { name: "Prompt injection guardrails", projects: ["ask-edgeorgie-mcp"] },
      { name: "Agent skills (Claude Code, Cursor, Codex)", prod: true, projects: ["crispy-profiling"] },
    ],
  },
  {
    id: "backend",
    name: "Backend & APIs",
    blurb: "APIs that stay fast under load: caching, idempotency, low-latency design.",
    skills: [
      { name: "Node.js", prod: true, projects: ["ask-edgeorgie-mcp", "repoask-mcp", "eval-lab", "triage-desk"] },
      { name: "Express", prod: true, projects: ["repoask-mcp"] },
      { name: "REST design (caching, idempotency)", prod: true },
      { name: "GitHub API / webhooks / Octokit", projects: ["triage-desk", "repoask-mcp"] },
      { name: "Python", prod: true },
      { name: "MongoDB · MySQL · SQLite", prod: true },
    ],
  },
  {
    id: "platforms",
    name: "Platforms beyond the browser",
    blurb: "The same product shipped to phones and living rooms.",
    skills: [
      { name: "Mobile WebViews", prod: true },
      { name: "Android (Kotlin), AI-assisted", prod: true },
      { name: "iOS (Swift), AI-assisted", prod: true },
      { name: "Smart TV: LG webOS, Samsung Tizen, Vidaa, TitanOS", prod: true },
      { name: "Chromecast Web Receiver", prod: true },
    ],
  },
  {
    id: "reliability",
    name: "Reliability & architecture",
    blurb: "Observability and structure that survive the refactor.",
    skills: [
      { name: "Kibana · New Relic · Datadog · Grafana", prod: true },
      { name: "SLA / SLI / SLO practice", prod: true },
      { name: "Clean Architecture & DDD", prod: true },
      { name: "Legacy refactoring", prod: true },
    ],
  },
  {
    id: "delivery",
    name: "Testing & delivery",
    blurb: "If it isn't verified, it isn't done.",
    skills: [
      { name: "Unit · integration · E2E", prod: true, projects: ["repoask-mcp", "triage-desk"] },
      { name: "Jest · Cypress", prod: true },
      { name: "Vitest · Playwright", projects: ["crispy-profiling"] },
      { name: "GitHub Actions / CI gates", projects: ["eval-lab", "triage-desk", "crispy-profiling"] },
      { name: "Vercel deployments", projects: ["ask-edgeorgie-mcp", "repoask-mcp", "simplescope"] },
    ],
  },
];

/* ------------------------------------------------------------------ */
/* Achievements — real milestones with a source each.                   */
/* ------------------------------------------------------------------ */

export type Achievement = {
  id: string;
  title: string;
  detail: string;
  source: { label: string; href: string };
  icon: "users" | "shield" | "tv" | "package" | "server" | "bot" | "gamepad" | "degree" | "mic";
};

export const achievements: Achievement[] = [
  {
    id: "zero-incidents",
    title: "1.5M+ users, zero incidents",
    detail: "One production feature at Mercado Libre, delivered in record time.",
    source: { label: "resume", href: "https://github.com/edgeorgie/ask-edgeorgie-mcp/blob/main/data/resume.txt" },
    icon: "shield",
  },
  {
    id: "ten-initiatives",
    title: "10+ initiatives owned end-to-end",
    detail: "Solo ownership from scope to delivery; together reaching 4M+ users across LATAM.",
    source: { label: "resume", href: "https://github.com/edgeorgie/ask-edgeorgie-mcp/blob/main/data/resume.txt" },
    icon: "users",
  },
  {
    id: "tv",
    title: "Shipped to living rooms",
    detail: "Smart TV receivers for LG, Samsung Tizen, Vidaa, TitanOS and a Chromecast Web Receiver.",
    source: { label: "resume", href: "https://github.com/edgeorgie/ask-edgeorgie-mcp/blob/main/data/resume.txt" },
    icon: "tv",
  },
  {
    id: "npm",
    title: "Published to npm",
    detail: "crispy-profiling v0.6.0, seven releases, MIT.",
    source: { label: "npm", href: "https://www.npmjs.com/package/crispy-profiling" },
    icon: "package",
  },
  {
    id: "mcp",
    title: "Two public MCP servers live",
    detail: "ask-edgeorgie-mcp and repoask-mcp, reachable by any MCP client over HTTP.",
    source: { label: "endpoint", href: "https://ask-edgeorgie-mcp.vercel.app/mcp" },
    icon: "server",
  },
  {
    id: "bot",
    title: "A bot that works from the real webhook",
    detail: "triage-desk triaged issue #24 in 22 s, triggered by issues: opened.",
    source: { label: "run", href: "https://github.com/edgeorgie/triage-desk/actions/runs/37983913473" },
    icon: "bot",
  },
  {
    id: "first-game",
    title: "First game shipped at 15",
    detail: "A 2D platformer, built and released solo. About 50 downloads.",
    source: { label: "FAQ", href: "https://github.com/edgeorgie/ask-edgeorgie-mcp/blob/main/data/RECRUITER-FAQ.md" },
    icon: "gamepad",
  },
  {
    id: "degrees",
    title: "Two degrees",
    detail: "Electronic Engineering and Software Development.",
    source: { label: "resume", href: "https://github.com/edgeorgie/ask-edgeorgie-mcp/blob/main/data/resume.txt" },
    icon: "degree",
  },
  {
    id: "speaker",
    title: "Led teams, spoke at events",
    detail: "Two MERN teams at UdeA; IEEE talks with 50+ and 100+ attendees.",
    source: { label: "resume", href: "https://github.com/edgeorgie/ask-edgeorgie-mcp/blob/main/data/resume.txt" },
    icon: "mic",
  },
];

/* ------------------------------------------------------------------ */
/* How I use AI — principles (unchanged facts)                          */
/* ------------------------------------------------------------------ */

export type PrincipleIcon = "split" | "parallel" | "skill" | "gate" | "scale" | "check" | "critic" | "shield" | "bolt";

export type Principle = { lead: string; icon: PrincipleIcon; body: string };

export const aiWorkflowPrinciples: Principle[] = [
  {
    lead: "Builder vs. operator",
    icon: "split",
    body: "Claude Code is my builder: dispatched in bursts via parallel task delegation, with no memory between sessions. A separate always-on layer, Hermes running on cron, acts as the operator, running what Claude Code builds indefinitely without needing to be re-explained. That division between building and operating is where the real leverage comes from.",
  },
  {
    lead: "Decompose, then fan out",
    icon: "parallel",
    body: "Independent workstreams run concurrently as separate delegated tasks, all anchored to one shared audit-trail log. I map out which pieces have no dependency on each other first, then fire the independent ones together so results reconcile instead of silently colliding.",
  },
  {
    lead: "Standing skills",
    icon: "skill",
    body: "Recurring procedures, things like cron-gating conventions, verification checklists, and approval-gate rules, live as skills that load on demand instead of instructions I retype every session. I write each one once, carefully, and every future session inherits it.",
  },
  {
    lead: "Gated cron",
    icon: "gate",
    body: "Scheduled jobs skip running an expensive agent on a fixed timer. A cheap, deterministic check runs first to confirm something actually changed, and only then does the full agent run get woken up. Routine runs stay quiet; failures escalate to a real alert.",
  },
  {
    lead: "Model by stakes",
    icon: "scale",
    body: "Cheap, fast models handle mechanical, low-stakes, easily-verified work. High-stakes work goes to the strongest available model and gets judged against an explicit rubric, since how easy a task looks and how costly it is to get wrong are two different questions.",
  },
  {
    lead: "Verify, don't trust",
    icon: "check",
    body: "An agent's self-report that something succeeded isn't enough for me. I re-check the actual artifact every time: the live URL, the test run, the real log line. Only one of “it worked” and “it says it worked” is something you can actually check.",
  },
  {
    lead: "Cold-context critic",
    icon: "critic",
    body: "Before anything is called finished, a cold review pass checks it: no shared conversation history, no benefit of the doubt. A reviewer who shares context with the work usually ends up sharing its blind spots too.",
  },
  {
    lead: "Security by default",
    icon: "shield",
    body: "A pre-execution guard intercepts destructive commands before they run, and secrets never get echoed into logs or committed files. Push-time secret scanning runs on everything I ship, so none of it depends on me remembering to be careful.",
  },
  {
    lead: "Never idle",
    icon: "bolt",
    body: "If something could be running, I start it. Letting one task sit idle while another could be running in parallel counts as a failure mode I actively correct for.",
  },
];

/* ------------------------------------------------------------------ */
/* Beyond the code — timeline (facts from RECRUITER-FAQ.md)             */
/* ------------------------------------------------------------------ */

export type BeyondItem = {
  year: string;
  label: string;
  body: string;
  icon: "gamepad" | "code" | "brain" | "palette" | "controller" | "guitar";
};

export const beyond: BeyondItem[] = [
  {
    year: "Age 15",
    label: "Shipped my first game, solo",
    body: "Built and released a 2D platformer entirely on my own: no team, no course. It got about 50 downloads. That's the first time I remember building something just to see if I could, and then actually finishing it.",
    icon: "gamepad",
  },
  {
    year: "Degree",
    label: "Electronic Engineering, then Software",
    body: "Dual degrees in Electronic Engineering and Software Development. The electronics background is part of why I don't treat a new stack as intimidating: I'm used to learning a discipline from its fundamentals up.",
    icon: "brain",
  },
  {
    year: "On the job",
    label: "Kotlin and Swift, learned by shipping",
    body: "JavaScript/TypeScript is where I'm deepest, but at Mercado Libre I picked up Kotlin (Android) and Swift (iOS) for AI-assisted native work, learned while shipping, not before. Same pattern as the platformer: figure it out by building the real thing.",
    icon: "code",
  },
  {
    year: "Always",
    label: "Design isn't handed to me, I own it",
    body: "UX and interaction design on these projects, this portfolio included, are my own decisions, not a template someone else made. I care how something feels to use, not only whether the API underneath is correct.",
    icon: "palette",
  },
  {
    year: "Right now",
    label: "Self-teaching Unreal Engine 5.8",
    body: "Still building games, not just playing them: currently teaching myself game development and design in Unreal Engine on my own time. Same self-directed approach as the platformer at 15, just a bigger engine.",
    icon: "controller",
  },
  {
    year: "Right now",
    label: "Guitar, and the gym at sunrise",
    body: "Learning to play guitar. At the gym four mornings a week; I'm a morning person and would rather get moving early than push it to the end of the day.",
    icon: "guitar",
  },
];
