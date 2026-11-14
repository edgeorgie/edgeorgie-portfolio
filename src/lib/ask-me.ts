/**
 * The contract between the Ask terminal (src/components/AskMe.tsx), its proxy
 * (src/app/api/ask-me/route.ts) and ask-edgeorgie-mcp's POST /api/ask.
 *
 * The proxy runs every upstream body through `toClientResult` instead of
 * forwarding it verbatim, so the browser only ever receives these fields, with
 * these types. That boundary is what stopped a real leak: when the upstream
 * Anthropic key was rejected, the service put the raw provider error
 * (`LLM synthesis failed (Anthropic API error 401: {"type":"error",...,
 * "request_id":"req_..."})`) at the top of `answer`, and this proxy passed it
 * straight to every visitor.
 */

export type AnswerMode = "llm" | "deterministic" | "synthesis-failed";

/** Mirrors ask-edgeorgie-mcp's SynthesisReason. Unknown values are dropped. */
export type FallbackReason = "auth" | "rate_limited" | "timeout" | "network" | "provider_error" | "empty_response";

const ANSWER_MODES: readonly AnswerMode[] = ["llm", "deterministic", "synthesis-failed"];
const FALLBACK_REASONS: readonly FallbackReason[] = ["auth", "rate_limited", "timeout", "network", "provider_error", "empty_response"];

export type Citation = {
  rank: number;
  source: string;
  startLine: number;
  endLine: number;
  score: number;
  excerpt: string;
};

export type AskResult = {
  question: string;
  answer: string;
  answerMode: AnswerMode;
  model?: string;
  fallbackReason?: FallbackReason;
  citations: Citation[];
};

/**
 * Older upstream builds prefixed the fallback answer with the provider's raw
 * error, on one line, ending in "falling back to citations.". Removed here so
 * the browser never shows it, whichever upstream version is deployed.
 */
const LEGACY_PROVIDER_ERROR = /^LLM synthesis failed \([\s\S]*?\); falling back to citations\.\s*/;

export function stripProviderError(answer: string): string {
  return answer.replace(LEGACY_PROVIDER_ERROR, "");
}

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null;
const isFiniteNumber = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);

function toCitation(v: unknown): Citation | null {
  if (!isObject(v)) return null;
  const { rank, source, startLine, endLine, score, excerpt } = v;
  if (!isFiniteNumber(rank) || typeof source !== "string" || !isFiniteNumber(startLine) || !isFiniteNumber(endLine)) return null;
  return {
    rank,
    source,
    startLine,
    endLine,
    score: isFiniteNumber(score) ? score : 0,
    excerpt: typeof excerpt === "string" ? excerpt : "",
  };
}

/**
 * Validates and narrows an upstream body to `AskResult`. Returns null when the
 * required fields are missing or mistyped, which the proxy reports as a 502.
 */
export function toClientResult(data: unknown): AskResult | null {
  if (!isObject(data)) return null;
  const { question, answer, answerMode, model, fallbackReason, citations } = data;
  if (typeof question !== "string" || typeof answer !== "string") return null;
  if (typeof answerMode !== "string" || !ANSWER_MODES.includes(answerMode as AnswerMode)) return null;

  const result: AskResult = {
    question,
    answer: stripProviderError(answer),
    answerMode: answerMode as AnswerMode,
    citations: Array.isArray(citations) ? citations.map(toCitation).filter((c): c is Citation => c !== null) : [],
  };
  if (typeof model === "string" && model) result.model = model;
  if (typeof fallbackReason === "string" && FALLBACK_REASONS.includes(fallbackReason as FallbackReason)) {
    result.fallbackReason = fallbackReason as FallbackReason;
  }
  return result;
}
