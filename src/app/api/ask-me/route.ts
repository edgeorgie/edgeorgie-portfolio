import { NextResponse } from "next/server";

/**
 * Server-side proxy to ask-edgeorgie-mcp's human-facing REST route
 * (POST /api/ask) — the same retrieval engine behind the MCP tool
 * `ask_about_edgeorgie`. Proxying keeps the browser on a same-origin call
 * and lets this layer own validation, timeouts and rate limiting.
 */
const UPSTREAM = "https://ask-edgeorgie-mcp.vercel.app/api/ask";

export const QUESTION_MIN = 3;
export const QUESTION_MAX = 500;
export const TOPK_MIN = 1;
export const TOPK_MAX = 8;
export const TOPK_DEFAULT = 4;
const UPSTREAM_TIMEOUT_MS = 15_000;
const MAX_BODY_BYTES = 4 * 1024;

/**
 * Minimal in-memory per-IP fixed-window rate limiter: 10 requests/minute.
 * Intentionally not distributed (that would need Upstash/KV); the goal is
 * to blunt a trivial unlimited loop against the metered upstream project,
 * and serverless instances stay warm across exactly that kind of burst.
 */
const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 60_000;
const buckets = new Map<string, { count: number; resetAt: number }>();

function getClientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  const real = req.headers.get("x-real-ip");
  if (real) return real.trim();
  return "unknown";
}

export function checkRateLimit(ip: string, now = Date.now()): { limited: boolean; retryAfterSeconds: number } {
  // Opportunistic cleanup so the map cannot grow without bound.
  if (buckets.size > 5000) {
    for (const [k, v] of buckets) if (now >= v.resetAt) buckets.delete(k);
  }
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

export type ValidatedAsk = { question: string; topK: number };

/**
 * Validates an incoming body. Returns either the normalised payload or a
 * human-readable error. Exported so the rules can be unit-tested without
 * spinning up a request.
 */
export function validateAskBody(body: unknown): { ok: true; value: ValidatedAsk } | { ok: false; error: string } {
  if (typeof body !== "object" || body === null) return { ok: false, error: "Body must be a JSON object." };
  const { question, topK } = body as { question?: unknown; topK?: unknown };

  if (typeof question !== "string") return { ok: false, error: "question must be a string." };
  const q = question.trim();
  if (q.length < QUESTION_MIN) return { ok: false, error: `question must be at least ${QUESTION_MIN} characters.` };
  if (q.length > QUESTION_MAX) return { ok: false, error: `question must be at most ${QUESTION_MAX} characters.` };

  let k = TOPK_DEFAULT;
  if (topK !== undefined) {
    if (typeof topK !== "number" || !Number.isInteger(topK)) return { ok: false, error: "topK must be an integer." };
    if (topK < TOPK_MIN || topK > TOPK_MAX) return { ok: false, error: `topK must be between ${TOPK_MIN} and ${TOPK_MAX}.` };
    k = topK;
  }
  return { ok: true, value: { question: q, topK: k } };
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

  const declared = Number(req.headers.get("content-length") ?? 0);
  if (declared > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "Request body too large." }, { status: 413 });
  }

  let body: unknown;
  try {
    const text = await req.text();
    if (text.length > MAX_BODY_BYTES) {
      return NextResponse.json({ error: "Request body too large." }, { status: 413 });
    }
    body = JSON.parse(text);
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const validated = validateAskBody(body);
  if (!validated.ok) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);
  try {
    const upstream = await fetch(UPSTREAM, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validated.value),
      signal: controller.signal,
    });

    if (!upstream.ok) {
      // Do not echo upstream bodies to the client; log server-side only.
      console.error(`[ask-me] upstream ${upstream.status}`);
      return NextResponse.json(
        { error: `The answer service returned an error (${upstream.status}). Try again in a moment.` },
        { status: 502 }
      );
    }

    const data = await upstream.json();
    return NextResponse.json(data, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    const aborted = (err as Error).name === "AbortError";
    return NextResponse.json(
      { error: aborted ? "The answer service timed out. Try again in a moment." : "Couldn't reach the answer service." },
      { status: aborted ? 504 : 502 }
    );
  } finally {
    clearTimeout(timeout);
  }
}
