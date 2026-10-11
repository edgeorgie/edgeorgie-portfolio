import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { PRODUCTION_HOST, person } from "@/lib/site";

export const alt = `${person.name} — ${person.title}. Full-stack & AI-agent engineer.`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Generated at build time (no request-time APIs used), cached as a static
 * asset. Uses system fonts available to the OG renderer; no font download
 * so the build never depends on the network for this image. The portrait
 * is a build-time-only asset (src/assets/portrait-cutout.png), inlined as
 * a data URI so the renderer never fetches anything either.
 */
export default async function OpenGraphImage() {
  const cutout = await readFile(join(process.cwd(), "src/assets/portrait-cutout.png"));
  const portrait = `data:image/png;base64,${cutout.toString("base64")}`;
  // 560 × 700 source, drawn at 456 × 570, anchored bottom-right so the
  // right shoulder runs off the canvas; the source fades out on its left edge.
  const pw = 456;
  const ph = 570;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 56,
          background: "linear-gradient(135deg, #09090b 0%, #111113 100%)",
          color: "#f4f4f5",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* grid */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(to right, #232328 1px, transparent 1px), linear-gradient(to bottom, #232328 1px, transparent 1px)",
            backgroundSize: "56px 56px",
            opacity: 0.6,
          }}
        />
        {/* studio light behind the figure, then the lime glow above it */}
        <div
          style={{
            position: "absolute",
            right: -40,
            bottom: -260,
            width: 700,
            height: 700,
            borderRadius: 999,
            background: "radial-gradient(circle at center, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.05) 40%, rgba(255,255,255,0) 72%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: -220,
            right: -60,
            width: 620,
            height: 620,
            borderRadius: 999,
            background: "radial-gradient(circle at center, rgba(200,255,61,0.26) 0%, rgba(200,255,61,0.12) 38%, rgba(200,255,61,0) 72%)",
          }}
        />
        <img src={portrait} width={pw} height={ph} alt="" style={{ position: "absolute", right: -28, bottom: 0, width: pw, height: ph }} />

        <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 22, color: "#c8ff3d", letterSpacing: 4 }}>
          <div style={{ width: 14, height: 14, borderRadius: 999, background: "#c8ff3d" }} />
          {person.name.toUpperCase()} · {person.title.toUpperCase()}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 22, maxWidth: 660 }}>
          <div style={{ fontSize: 68, lineHeight: 1.04, letterSpacing: -1.5, fontWeight: 600, display: "flex", flexWrap: "wrap" }}>
            I build software people&nbsp;
            <span style={{ color: "#c8ff3d" }}>and agents</span>&nbsp;rely on.
          </div>
          <div style={{ fontSize: 25, color: "#a3a3ad", maxWidth: 640, lineHeight: 1.35 }}>
            Full-stack engineering at LATAM scale · web, native mobile, smart TV · live MCP servers, agent bots and
            eval tooling you can run today.
          </div>
        </div>
        <div style={{ display: "flex", gap: 28, fontSize: 22, color: "#80808c", fontFamily: "ui-monospace, monospace" }}>
          <span>github.com/{person.handle}</span>
          <span>{PRODUCTION_HOST}</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
