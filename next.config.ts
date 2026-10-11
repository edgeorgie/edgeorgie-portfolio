import type { NextConfig } from "next";

const isProd = process.env.VERCEL_ENV === "production" || process.env.NODE_ENV === "production";
// React needs eval() for its development-only debugging features; never in production.
const isDev = process.env.NODE_ENV === "development";
// Gates the /ingest proxy below. Analytics is opt-in by configuration; the
// proxy must not exist as a route when it is off.
const posthogEnabled = Boolean(process.env.NEXT_PUBLIC_POSTHOG_KEY);

/**
 * Content Security Policy.
 *
 * The page is statically prerendered, so a per-request nonce is not
 * available (Next.js only injects nonces on dynamically rendered routes).
 * `script-src` therefore has to allow `'unsafe-inline'` for the React
 * Server Component payload and the hydration bootstrap that Next.js
 * inlines. What the policy still enforces: no plugins, no framing, no
 * base-URI hijack, no form exfiltration, and `connect-src`/`img-src`/
 * `font-src` pinned to this origin. Analytics needs no extra origin: it is
 * proxied through `/ingest` (see `rewrites()` below).
 *
 * Vercel's preview toolbar (`vercel.live`) is allowed outside production.
 */
function buildCsp(): string {
  const previewTools = isProd ? [] : ["https://vercel.live", "https://*.vercel.live"];
  // @vercel/analytics and @vercel/speed-insights load from /_vercel/* (same
  // origin) in production; in development they load their debug scripts
  // from va.vercel-scripts.com.
  const vercelDev = isDev ? ["https://va.vercel-scripts.com"] : [];

  const directives: Record<string, string[]> = {
    "default-src": ["'self'"],
    "script-src": ["'self'", "'unsafe-inline'", ...(isDev ? ["'unsafe-eval'"] : []), ...vercelDev, ...previewTools],
    "style-src": ["'self'", "'unsafe-inline'"],
    "img-src": ["'self'", "data:", "blob:"],
    "font-src": ["'self'", "data:"],
    "connect-src": ["'self'", ...vercelDev, ...previewTools],
    "frame-src": previewTools.length ? previewTools : ["'none'"],
    "object-src": ["'none'"],
    "base-uri": ["'self'"],
    "form-action": ["'self'"],
    "frame-ancestors": ["'none'"],
    "upgrade-insecure-requests": [],
  };

  return Object.entries(directives)
    .map(([k, v]) => (v.length ? `${k} ${v.join(" ")}` : k))
    .join("; ");
}

const securityHeaders = [
  { key: "Content-Security-Policy", value: buildCsp() },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
  },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  poweredByHeader: false,
  // An UNSET NEXT_PUBLIC_* variable stays a runtime lookup under Turbopack, so
  // without this the build still emits the 315 KB posthog-js chunk even though
  // nothing ever loads it. Defining the key as "" when unset turns the gate in
  // src/lib/analytics.ts into a literal, the dynamic import into dead code and
  // the SDK out of the build (ci.yml asserts the bundle is clean).
  env: { NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY ?? "" },
  // PostHog endpoints end in "/" (e.g. /e/); Next's trailing-slash redirect would drop events.
  skipTrailingSlashRedirect: true,
  async rewrites() {
    // Same-origin proxy for analytics: tracking blockers filter by domain,
    // and the CSP can stay pinned to 'self'. Order matters: static and
    // array before the catch-all.
    //
    // Gated on the key. An UNCONDITIONAL rewrite is not "a no-op until a key
    // is set": the proxy is a server-side route that exists whether or not the
    // client ever calls it, so without this guard the deployed site forwards
    // ANY body posted to /ingest/* straight to PostHog's public ingestion API
    // — an open relay on this domain that costs nothing to abuse and whose
    // traffic is attributed to this origin. Nothing on the client side can
    // close it, which is why #41's bundle work left it open.
    if (!posthogEnabled) return [];
    return [
      { source: "/ingest/static/:path*", destination: "https://us-assets.i.posthog.com/static/:path*" },
      { source: "/ingest/array/:path*", destination: "https://us-assets.i.posthog.com/array/:path*" },
      { source: "/ingest/:path*", destination: "https://us.i.posthog.com/:path*" },
    ];
  },
  images: {
    formats: ["image/avif", "image/webp"],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  // One canonical host: the project's vercel.app alias permanently redirects
  // to the custom domain (preview deployments use other hosts and are unaffected).
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "edgeorgie-portfolio.vercel.app" }],
        destination: "https://www.itsedgeorgie.dev/:path*",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
