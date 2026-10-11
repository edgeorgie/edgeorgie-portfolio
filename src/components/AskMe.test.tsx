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
 * Why this is pinned to StreamingAnswer's own fiber rather than "the nearest
 * keyed ancestor": the previous version of this helper walked *up* from the
 * testid node and returned the first non-null key it found. That made the
 * guard satisfiable by a key on the WRONG element — moving the key up to the
 * surrounding `<motion.div>` and deleting StreamingAnswer's key left this
 * suite fully green while reintroducing the exact bug it exists to catch
 * (a mounted StreamingAnswer reused for different text, so the reveal
 * continues from the previous answer's position). Verified by mutation:
 * that swap now fails here instead of passing.
 *
 * So: walk up only until the fiber whose `type` is the StreamingAnswer
 * component itself, and report THAT fiber's key. A key anywhere else — above
 * it, below it — is not the key React uses to decide whether to remount the
 * reveal, and must not count.
 */
function reactKeyOf(node: Element): string | null {
  const fiberProp = Object.keys(node).find((k) => k.startsWith("__reactFiber$"));
  if (!fiberProp) throw new Error("no React fiber on node — React internals changed");
  type Fiber = { key: string | null; type: unknown; return: Fiber | null };
  let fiber = (node as unknown as Record<string, Fiber>)[fiberProp] as Fiber | null;
  while (fiber) {
    if (fiber.type === StreamingAnswer) return fiber.key;
    fiber = fiber.return;
  }
  throw new Error(
    "no StreamingAnswer fiber above the stream-answer node — the testid moved off StreamingAnswer"
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

  it("keys each StreamingAnswer on its answer text, so a mounted instance can never be reused for different text", async () => {
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

  // The fiber assertion above proves WHERE the key sits. This proves WHY that
  // placement is the only correct one, without touching React internals.
  //
  // Two different questions can legitimately retrieve the SAME answer text —
  // the corpus is small and the deterministic path returns the best-matching
  // excerpt, so "what have you built with agents?" and a rephrasing of it can
  // produce one identical string. The answer text is therefore a valid key for
  // StreamingAnswer (one instance per distinct text, remounted when the text
  // changes) but NOT for the transcript's list items, which are per-turn and
  // can collide. Moving the key up to the surrounding `<motion.div>` makes
  // React reconcile two siblings under one key, which it reports as an error.
  //
  // Mutation-verified: with the key moved to the list element, React logs
  // "Encountered two children with the same key" and this test fails.
  it("gives the transcript's list items keys that stay unique when two answers are identical", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    try {
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

      const messages = consoleError.mock.calls.map((c) => c.join(" "));
      expect(messages.filter((m) => /same key/i.test(m))).toEqual([]);
    } finally {
      consoleError.mockRestore();
    }
  });
});
