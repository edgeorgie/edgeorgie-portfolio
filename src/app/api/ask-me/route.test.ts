import { describe, it, expect } from "vitest";
import { validateAskBody, checkRateLimit, QUESTION_MAX, TOPK_MAX } from "./route";

describe("validateAskBody", () => {
  it("accepts a plain question and fills in the default topK", () => {
    expect(validateAskBody({ question: "  what has he built?  " })).toEqual({
      ok: true,
      value: { question: "what has he built?", topK: 4 },
    });
  });

  it("rejects non-object bodies and non-string questions", () => {
    expect(validateAskBody(null).ok).toBe(false);
    expect(validateAskBody("hi").ok).toBe(false);
    expect(validateAskBody({ question: 123 }).ok).toBe(false);
    expect(validateAskBody({}).ok).toBe(false);
  });

  it("enforces minimum and maximum question length", () => {
    expect(validateAskBody({ question: "hi" }).ok).toBe(false);
    expect(validateAskBody({ question: "x".repeat(QUESTION_MAX) }).ok).toBe(true);
    expect(validateAskBody({ question: "x".repeat(QUESTION_MAX + 1) }).ok).toBe(false);
  });

  it("bounds topK and rejects non-integers", () => {
    expect(validateAskBody({ question: "hello there", topK: 0 }).ok).toBe(false);
    expect(validateAskBody({ question: "hello there", topK: TOPK_MAX + 1 }).ok).toBe(false);
    expect(validateAskBody({ question: "hello there", topK: 2.5 }).ok).toBe(false);
    expect(validateAskBody({ question: "hello there", topK: "4" }).ok).toBe(false);
    const ok = validateAskBody({ question: "hello there", topK: TOPK_MAX });
    expect(ok.ok && ok.value.topK).toBe(TOPK_MAX);
  });
});

describe("checkRateLimit", () => {
  it("allows 10 requests per window per IP, then returns a Retry-After", () => {
    const ip = `test-${Math.random()}`;
    const t0 = 1_000_000;
    for (let i = 0; i < 10; i++) expect(checkRateLimit(ip, t0 + i).limited).toBe(false);
    const eleventh = checkRateLimit(ip, t0 + 10);
    expect(eleventh.limited).toBe(true);
    expect(eleventh.retryAfterSeconds).toBeGreaterThan(0);
    expect(eleventh.retryAfterSeconds).toBeLessThanOrEqual(60);
  });

  it("resets after the window", () => {
    const ip = `test-${Math.random()}`;
    const t0 = 5_000_000;
    for (let i = 0; i < 10; i++) checkRateLimit(ip, t0);
    expect(checkRateLimit(ip, t0).limited).toBe(true);
    expect(checkRateLimit(ip, t0 + 60_001).limited).toBe(false);
  });

  it("isolates IPs from each other", () => {
    const a = `a-${Math.random()}`;
    const b = `b-${Math.random()}`;
    for (let i = 0; i < 10; i++) checkRateLimit(a, 1);
    expect(checkRateLimit(a, 1).limited).toBe(true);
    expect(checkRateLimit(b, 1).limited).toBe(false);
  });
});
