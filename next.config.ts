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
    // so a path on this origin survives them, and the CSP stays at 'self'.
    //
    // Two guards, because each closes a hole the other cannot.
    //
    // 1. Gated on the key, since a rewrite is a SERVER-side route: it exists
    //    whether or not this site's own JS ever calls it. Ungated, the
    //    deployment forwards any body posted to /ingest/* to PostHog's public
    //    ingestion API — an open relay attributed to this origin. No
    //    client-side change can close that, which is why #41's bundle work
    //    left it open and #42 had to gate the route itself.
    //
    // 2. An explicit allowlist, because guard 1 stops holding the moment the
    //    key is set. PostHog's ingestion endpoints answer an unrecognised
    //    `api_key` with `200 {"status":"Ok"}`, so a `/ingest/:path*`
    //    catch-all would reopen the same relay permanently once analytics
    //    goes live — and would additionally expose PostHog's authenticated
    //    `/api/*` surface through this domain. New capabilities get a line
    //    here on purpose; a wildcard grants every future endpoint by default.
    if (!posthogEnabled) return [];
    return [
      // Assets host: the SDK bundle and the per-token remote config.
      { source: "/ingest/static/:path*", destination: "https://us-assets.i.posthog.com/static/:path*" },
      { source: "/ingest/array/:path*", destination: "https://us-assets.i.posthog.com/array/:path*" },
      // Ingestion host. One rule per endpoint the pinned posthog-js actually
      // calls here (`analyticsDefaultEndpoint = "/e/"`, `/flags/?v=2`,
      // `/i/v1/*`); Next matches on pathname only, so the query string on
      // the flags call needs no rule of its own. Nothing under `/api/*` is
      // listed, which is only COMPLETE because src/lib/analytics.ts disables
      // surveys, product tours and conversations — posthog-js enables all
      // three by default and each polls its own `/api/...` endpoint.
      { source: "/ingest/e/", destination: "https://us.i.posthog.com/e/" },
      { source: "/ingest/flags/", destination: "https://us.i.posthog.com/flags/" },
      { source: "/ingest/i/v1/:path*", destination: "https://us.i.posthog.com/i/v1/:path*" },
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
