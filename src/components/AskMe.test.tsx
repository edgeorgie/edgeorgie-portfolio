import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";

// AskMe fires PostHog events on submit; the real SDK would try to network.
vi.mock("posthog-js", () => ({ default: { capture: vi.fn() } }));

import { AskMe } from "./AskMe";
import { StreamingAnswer } from "./StreamingAnswer";

const LONG = "alpha beta gamma delta epsilon zeta eta theta iota kappa";
const SHORT = "one two three";

function apiAnswer(answer: string) {
  return {
    ok: true,
    json: async () => ({
      question: "q",
      answer,
      answerMode: "deterministic",
      citations: [],
    }),
  };
}

async function advance(ticks: number) {
  for (let i = 0; i < ticks; i++) {
    await act(async () => {
      await vi.advanceTimersByTimeAsync(30);
    });
  }
}

async function ask(q: string) {
  const input = screen.getByPlaceholderText(/Ask about experience/i);
  fireEvent.change(input, { target: { value: q } });
  await act(async () => {
    fireEvent.submit(input.closest("form")!);
  });
}

function answers() {
  return screen.queryAllByTestId("stream-answer").map((n) => (n.textContent ?? "").trim());
}

/**
 * Reads the React `key` that AskMe passed to the `<StreamingAnswer>` element
 * rendered at `node`.
 *
 * Pinned to StreamingAnswer's own fiber, not "the nearest keyed ancestor":
 * an earlier version of this helper walked up and returned the first non-null
 * key it found, and the transcript always has a keyed ancestor, so the guard
 * was satisfiable by a key on an unrelated element.
 *
 * Unwraps `memo`/`forwardRef` because `fiber.type` is the wrapper object, not
 * the function, once a component is wrapped — a pure performance refactor
 * adding `memo` would otherwise break this test with a message blaming the
 * testid.
 */
function reactKeyOf(node: Element): string | null {
  const fiberProp = Object.keys(node).find((k) => k.startsWith("__reactFiber$"));
  if (!fiberProp) throw new Error("no React fiber on node — React internals changed");
  type Fiber = { key: string | null; type: unknown; return: Fiber | null };
  // The component the test imports may itself be a wrapper (`memo`/`forwardRef`),
  // and React's fiber may hold either the wrapper or the inner function
  // depending on the fiber tag, so accept both sides of the unwrap.
  const S = StreamingAnswer as unknown as { type?: unknown; render?: unknown };
  const accepted = new Set<unknown>([StreamingAnswer, S.type, S.render].filter(Boolean));
  const isStreamingAnswer = (t: unknown) => {
    if (accepted.has(t)) return true;
    if (typeof t === "object" && t !== null) {
      const w = t as { type?: unknown; render?: unknown };
      return accepted.has(w.type) || accepted.has(w.render);
    }
    return false;
  };
  let fiber = (node as unknown as Record<string, Fiber>)[fiberProp] as Fiber | null;
  while (fiber) {
    if (isStreamingAnswer(fiber.type)) return fiber.key;
    fiber = fiber.return;
  }
  throw new Error(
    "no StreamingAnswer fiber above the stream-answer node — the testid moved off " +
      "StreamingAnswer, or it is wrapped in something this helper does not unwrap"
  );
}

describe("AskMe (production call site)", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  function mockApi(...texts: string[]) {
    let mock = vi.fn();
    for (const t of texts) mock = mock.mockResolvedValueOnce(apiAnswer(t));
    vi.stubGlobal("fetch", mock);
    return mock;
  }

  it("streams a second answer from the beginning instead of continuing from the first answer's position", async () => {
    mockApi(LONG, SHORT);
    render(<AskMe />);

    await ask("what has this person built with agents?");
    await advance(40);
    expect(answers()).toEqual([LONG]);
    expect(screen.queryByTestId("stream-caret")).toBeNull();

    // Second question, no reload. The new answer must begin at reveal
    // position 0. If it continued from the first answer's position (which is
    // past SHORT's length) it would paint fully-revealed with no caret.
    await ask("tell me about mercado libre");
    expect(answers()).toEqual([LONG, ""]);
    expect(screen.getByTestId("stream-caret")).toBeTruthy();

    // ...and then streams, rather than appearing all at once.
    await advance(1);
    const [, secondPartial] = answers();
    expect(secondPartial.length).toBeGreaterThan(0);
    expect(secondPartial.length).toBeLessThan(SHORT.length);
    expect(SHORT.startsWith(secondPartial)).toBe(true);

    await advance(20);
    expect(answers()).toEqual([LONG, SHORT]);
    expect(screen.queryByTestId("stream-caret")).toBeNull();
  });

  // SCOPE, stated honestly because an earlier version of this file overstated
  // it: this is a STRUCTURAL guard, not a user-visible-regression guard.
  //
  // Removing `key` from `<StreamingAnswer>` does not currently change anything
  // a visitor sees, and no behavioral test in this repo fails when you do it —
  // verified by mutation, which is how the overstatement was caught. The reason
  // is that `AskMe` only ever appends to `history` (see `setHistory` in
  // AskMe.tsx), so every turn mounts a fresh StreamingAnswer at position 0
  // regardless of keying. The reveal-position bug the key defends against needs
  // an existing turn's `answer` to change in place, which this call site never
  // does. That reachable behavior is covered directly, at the component level,
  // by StreamingAnswer.test.tsx's "restarts the reveal from the beginning when
  // the text changes" — driven through a harness that really does swap the prop.
  //
  // So the key is deliberate defense against a future call site that edits a
  // turn (a retry, an edit-and-resend, a streaming update), and this test's job
  // is to make a silent removal of that defense visible in review. That is
  // worth a test, but it is not worth claiming a bug it does not catch.
  it("keys each StreamingAnswer on its answer text, so a future in-place answer update cannot reuse a mounted reveal", async () => {
    mockApi(LONG, SHORT);
    render(<AskMe />);

    await ask("what has this person built with agents?");
    await advance(40);
    await ask("tell me about mercado libre");
    await advance(30);

    const nodes = screen.getAllByTestId("stream-answer");
    expect(nodes).toHaveLength(2);
    expect(nodes.map(reactKeyOf)).toEqual([LONG, SHORT]);
  });

  // The per-turn list key is a separate invariant from the one above, and this
  // one IS behavioral: two different questions can retrieve the same answer
  // text, and if the transcript's list items were keyed on answer text instead
  // of per turn, React would reconcile two siblings under one key.
  //
  // The claim that identical answers are reachable is not assumed here — the
  // test asserts it is possible for the component to render two identical
  // answers at all, which is the only premise the invariant needs.
  //
  // The console.error assertion carries a positive control, because asserting
  // "no warning was logged" passes identically when the warning text changed,
  // when React stopped warning, and when the spy never saw anything at all. The
  // control renders a deliberately duplicate-keyed fixture first and asserts
  // the spy DOES capture the warning, so a React wording change fails loudly
  // here instead of silently voiding the check.
  it("gives the transcript's list items keys that stay unique when two answers are identical", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    try {
      // Positive control: React still warns, and this spy + regex still see it.
      render(
        <div>
          {["dup", "dup"].map((k) => (
            <span key={k} />
          ))}
        </div>
      );
      const sawWarning = () =>
        consoleError.mock.calls.map((c) => c.join(" ")).filter((m) => /same key/i.test(m));
      expect(sawWarning().length).toBeGreaterThan(0);
      consoleError.mockClear();

      mockApi(LONG, LONG);
      render(<AskMe />);

      await ask("what has this person built with agents?");
      await advance(40);
      expect(answers()).toEqual([LONG]);

      await ask("describe the agent work again");
      await advance(40);

      // Two turns asked, two turns shown — not one node silently reused.
      expect(screen.getAllByTestId("stream-answer")).toHaveLength(2);
      expect(answers()).toEqual([LONG, LONG]);

      // ...and the real component produced no duplicate-key warning, checked
      // with the same spy+regex just proven to catch one.
      expect(sawWarning()).toEqual([]);
    } finally {
      consoleError.mockRestore();
    }
  });
});
