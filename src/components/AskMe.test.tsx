import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";

// AskMe fires PostHog events on submit; the real SDK would try to network.
vi.mock("posthog-js", () => ({ default: { capture: vi.fn() } }));

import { AskMe } from "./AskMe";

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
 * Reads the React `key` that AskMe actually passed to a rendered
 * StreamingAnswer, by walking up the fiber attached to its root DOM node.
 * See the comment on the wiring test below for why this is read directly.
 */
function reactKeyOf(node: Element): string | null {
  const fiberProp = Object.keys(node).find((k) => k.startsWith("__reactFiber$"));
  if (!fiberProp) throw new Error("no React fiber on node — React internals changed");
  type Fiber = { key: string | null; return: Fiber | null };
  let fiber = (node as unknown as Record<string, Fiber>)[fiberProp] as Fiber | null;
  // The testid lives on StreamingAnswer's own root <div>, so the key given to
  // the <StreamingAnswer> element sits on one of the fibers above it.
  while (fiber) {
    if (fiber.key !== null) return fiber.key;
    fiber = fiber.return;
  }
  return null;
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
});
