import { ImageResponse } from "next/og";
import { person } from "@/lib/site";

export const alt = `${person.name} — ${person.title}. Full-stack & AI-agent engineer.`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Generated at build time (no request-time APIs used), cached as a static
 * asset. Uses system fonts available to the OG renderer; no font download
 * so the build never depends on the network for this image.
 */
export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 64,
          background: "linear-gradient(135deg, #09090b 0%, #111113 100%)",
          color: "#f4f4f5",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
          position: "relative",
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
        <div
          style={{
            position: "absolute",
            top: -200,
            right: -120,
            width: 620,
            height: 620,
            borderRadius: 999,
            background: "radial-gradient(closest-side, rgba(200,255,61,0.22), transparent 70%)",
          }}
        />
        <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 24, color: "#c8ff3d", letterSpacing: 4 }}>
          <div style={{ width: 14, height: 14, borderRadius: 999, background: "#c8ff3d" }} />
          {person.name.toUpperCase()} · {person.title.toUpperCase()}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ fontSize: 84, lineHeight: 1, letterSpacing: -2, fontWeight: 600, display: "flex", flexWrap: "wrap" }}>
            I build software people&nbsp;
            <span style={{ color: "#c8ff3d" }}>and agents</span>&nbsp;rely on.
          </div>
          <div style={{ fontSize: 30, color: "#a3a3ad", maxWidth: 960, lineHeight: 1.35 }}>
            Full-stack engineering at LATAM scale · web, native mobile, smart TV · live MCP servers, agent bots and
            eval tooling you can run today.
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 24, color: "#80808c", fontFamily: "ui-monospace, monospace" }}>
          <span>github.com/{person.handle}</span>
          <span>edgeorgie-portfolio.vercel.app</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
