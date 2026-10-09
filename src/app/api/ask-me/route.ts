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

export async function POST(req: Request) {
  let question: string | undefined;
  let topK: number | undefined;
  try {
    const body = await req.json();
    question = body?.question;
    topK = body?.topK;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!question || question.trim().length < 3) {
    return NextResponse.json(
      { error: "Ask a real question (at least 3 characters)." },
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
