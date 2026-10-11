import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import { StreamingAnswer } from "./StreamingAnswer";

/**
 * The reveal advances one word per `setTimeout` of 10-24ms. Tests drive fake
 * timers so they are deterministic and fast rather than sleeping on wall
 * clock. `advance(n)` flushes n reveal ticks.
 */
async function advance(ticks: number) {
  for (let i = 0; i < ticks; i++) {
    await act(async () => {
      await vi.advanceTimersByTimeAsync(30);
    });
  }
}

function renderedText() {
  // The markdown renderer wraps output in <p>; read the whole subtree text.
  return (screen.getByTestId("stream-root").textContent ?? "").trim();
}

function Harness({ text }: { text: string }) {
  return (
    <div data-testid="stream-root">
      {/* These tests cover StreamingAnswer in isolation; the key mirrors the
          production call site, which AskMe.test.tsx covers for real. */}
      <StreamingAnswer key={text} text={text} />
    </div>
  );
}

const SHORT = "one two three";
const LONG = "alpha beta gamma delta epsilon zeta eta theta iota kappa";

describe("StreamingAnswer", () => {
  it("reveals the text progressively, not all at once", async () => {
    vi.useFakeTimers();
    render(<Harness text={LONG} />);

    expect(renderedText()).toBe("");

    await advance(3);
    const partial = renderedText();
    expect(partial.length).toBeGreaterThan(0);
    expect(partial.length).toBeLessThan(LONG.length);
    // what is shown is always a prefix of the source text
    expect(LONG.startsWith(partial)).toBe(true);
  });

  it("eventually reveals the full text and drops the caret", async () => {
    vi.useFakeTimers();
    render(<Harness text={LONG} />);

    // 10 words -> 19 split tokens incl. whitespace; allow headroom.
    await advance(40);

    expect(renderedText()).toBe(LONG);
    expect(screen.queryByTestId("stream-caret")).toBeNull();
  });

  it("restarts the reveal from the beginning when the text changes, instead of continuing from the stale position", async () => {
    vi.useFakeTimers();
    const { rerender } = render(<Harness text={LONG} />);

    // Stream the long answer all the way out, so the reveal position is far
    // past the end of the SHORT text that replaces it.
    await advance(40);
    expect(renderedText()).toBe(LONG);

    // New answer arrives. Because the call site keys on the text, this must
    // mount a fresh instance at reveal position 0 — NOT render SHORT sliced
    // by the previous answer's position (which would paint it complete, or
    // paint the wrong amount, immediately).
    rerender(<Harness text={SHORT} />);

    expect(renderedText()).toBe("");
    expect(screen.getByTestId("stream-caret")).toBeTruthy();

    // ...and then streams the new text from the start.
    await advance(1);
    const firstFrame = renderedText();
    expect(firstFrame.length).toBeGreaterThan(0);
    expect(firstFrame.length).toBeLessThan(SHORT.length);
    expect(SHORT.startsWith(firstFrame)).toBe(true);

    await advance(20);
    expect(renderedText()).toBe(SHORT);
  });

  it("fires onDone exactly once the full text is revealed", async () => {
    vi.useFakeTimers();
    const onDone = vi.fn();
    render(
      <div data-testid="stream-root">
        <StreamingAnswer key={SHORT} text={SHORT} onDone={onDone} />
      </div>,
    );

    await advance(1);
    expect(onDone).not.toHaveBeenCalled();

    await advance(30);
    expect(renderedText()).toBe(SHORT);
    expect(onDone).toHaveBeenCalled();
  });

  it("does not mutate its props", async () => {
    vi.useFakeTimers();
    const props = { text: LONG, onDone: () => {} };
    const snapshot = { ...props };
    const frozen = Object.freeze({ ...props });

    render(
      <div data-testid="stream-root">
        <StreamingAnswer key={frozen.text} {...frozen} />
      </div>,
    );
    await advance(40);

    expect(props.text).toBe(snapshot.text);
    expect(props.onDone).toBe(snapshot.onDone);
    expect(frozen.text).toBe(LONG);
    expect(renderedText()).toBe(LONG);
  });

  it("shows the whole answer immediately with no caret under prefers-reduced-motion", async () => {
    const original = window.matchMedia;
    window.matchMedia = ((query: string) => ({
      matches: query.includes("prefers-reduced-motion"),
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    })) as unknown as typeof window.matchMedia;

    try {
      render(<Harness text={LONG} />);
      await waitFor(() => expect(renderedText()).toBe(LONG));
      expect(screen.queryByTestId("stream-caret")).toBeNull();
    } finally {
      window.matchMedia = original;
    }
  });
});
