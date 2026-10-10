import { NextResponse } from "next/server";

/**
 * Server-side proxy to ask-edgeorgie-mcp's human-facing REST route
 * (POST /api/ask). Proxying from our own Next.js API route means the
 * browser widget never has to deal with cross-origin requests to a
 * different Vercel project, and we control timeouts/error shaping here.
 *
 * This is what makes the embedded widget on the portfolio itself — not
 * an iframe, not an outbound link — actually answer real questions by
 * calling the real ask-edgeorgie-mcp engine (TF-IDF retrieval over
 * resume.txt / progress-log.txt / case-study docs), same engine as the
 * MCP tool `ask_about_edgeorgie`.
 */
const UPSTREAM = "https://ask-edgeorgie-mcp.vercel.app/api/ask";

/**
 * Minimal in-memory per-IP token-bucket rate limiter.
 *
 * This is a public, unauthenticated proxy to a separate metered Vercel
 * project — without a cap, a scripted client can hammer that upstream
 * project's usage/billing indefinitely (see QA report
 * qa-reports/portfolio.md, Issue #1, High severity).
 *
 * In-memory is sufficient here: Vercel serverless functions for a given
 * region/route tend to stay warm across bursts of requests from the same
 * client, which is exactly the abuse pattern (rapid-fire from one IP)
 * this is meant to blunt. It intentionally does not try to be a
 * distributed/global limiter (that would need Upstash/Vercel KV) — the
 * goal is "stop a trivial unlimited-loop curl/script", not perfect
 * enforcement across every cold start.
 */
const RATE_LIMIT = 10; // requests
const RATE_WINDOW_MS = 60_000; // per 1 minute, per IP

const buckets = new Map<string, { count: number; resetAt: number }>();

function getClientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  const real = req.headers.get("x-real-ip");
  if (real) return real.trim();
  return "unknown";
}

function checkRateLimit(ip: string): { limited: boolean; retryAfterSeconds: number } {
  const now = Date.now();
  const entry = buckets.get(ip);

  if (!entry || now >= entry.resetAt) {
    buckets.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return { limited: false, retryAfterSeconds: 0 };
  }

  if (entry.count >= RATE_LIMIT) {
    return { limited: true, retryAfterSeconds: Math.ceil((entry.resetAt - now) / 1000) };
  }

  entry.count += 1;
  return { limited: false, retryAfterSeconds: 0 };
}

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const { limited, retryAfterSeconds } = checkRateLimit(ip);
  if (limited) {
    return NextResponse.json(
      { error: "Too many requests. Please slow down and try again shortly." },
      { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } }
    );
  }

  let question: unknown;
  let topK: unknown;
  try {
    const body = await req.json();
    question = body?.question;
    topK = body?.topK;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (typeof question !== "string" || question.trim().length < 3) {
    return NextResponse.json(
      { error: "question must be a non-empty string (at least 3 characters)." },
      { status: 400 }
    );
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    const upstream = await fetch(UPSTREAM, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, topK }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!upstream.ok) {
      const text = await upstream.text();
      return NextResponse.json(
        { error: `ask-edgeorgie-mcp returned ${upstream.status}: ${text.slice(0, 200)}` },
        { status: 502 }
      );
    }

    const data = await upstream.json();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { error: `Couldn't reach ask-edgeorgie-mcp: ${(err as Error).message}` },
      { status: 502 }
    );
  }
}
