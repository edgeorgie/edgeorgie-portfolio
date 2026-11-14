import { describe, it, expect } from "vitest";
import { toClientResult, stripProviderError } from "./ask-me";

const citation = { rank: 1, source: "resume.txt", startLine: 10, endLine: 20, score: 0.12, excerpt: "Mercado Libre…" };

// Verbatim shape of what production returned on 2026-11-14, request id shortened.
const LEAKED =
  'LLM synthesis failed (Anthropic API error 401: {"type":"error","error":{"type":"authentication_error",' +
  '"message":"invalid x-api-key"},"request_id":"req_011Ch1v3"}); falling back to citations.\n\n' +
  "An LLM key IS configured on this deployment, but the synthesis call failed…";

describe("stripProviderError", () => {
  it("removes the legacy provider-error prefix and keeps the rest", () => {
    const out = stripProviderError(LEAKED);
    expect(out).not.toMatch(/invalid x-api-key|authentication_error|req_011|Anthropic API error/);
    expect(out.startsWith("An LLM key IS configured")).toBe(true);
  });

  it("leaves a normal answer untouched", () => {
    const answer = "Edwin shipped triage-desk [1]. LLM synthesis failed (in a test) is just text here.";
    expect(stripProviderError(answer)).toBe(answer);
  });
});

describe("toClientResult", () => {
  it("keeps only the documented fields", () => {
    const out = toClientResult({
      question: "q?",
      answer: "a",
      answerMode: "llm",
      model: "claude-haiku-4-5",
      llmKeyConfigured: true,
      somethingNew: { secret: 1 },
      citations: [citation],
    });
    expect(out).toEqual({ question: "q?", answer: "a", answerMode: "llm", model: "claude-haiku-4-5", citations: [citation] });
  });

  it("strips a leaked provider error from a synthesis-failed answer", () => {
    const out = toClientResult({ question: "q", answer: LEAKED, answerMode: "synthesis-failed", citations: [] });
    expect(out?.answer).not.toMatch(/x-api-key|request_id/);
  });

  it("passes a known fallbackReason and drops an unknown one", () => {
    const base = { question: "q", answer: "a", answerMode: "synthesis-failed", citations: [] };
    expect(toClientResult({ ...base, fallbackReason: "auth" })?.fallbackReason).toBe("auth");
    expect(toClientResult({ ...base, fallbackReason: "Anthropic said no" })).not.toHaveProperty("fallbackReason");
  });

  it("rejects bodies missing required fields or with an unknown answerMode", () => {
    expect(toClientResult(null)).toBeNull();
    expect(toClientResult({ answer: "a", answerMode: "llm" })).toBeNull();
    expect(toClientResult({ question: "q", answer: "a", answerMode: "magic" })).toBeNull();
  });

  it("drops malformed citations instead of failing the whole answer", () => {
    const out = toClientResult({ question: "q", answer: "a", answerMode: "deterministic", citations: [citation, { rank: "x" }, null] });
    expect(out?.citations).toEqual([citation]);
  });
});
