import type { NextConfig } from "next";

const isProd = process.env.VERCEL_ENV === "production" || process.env.NODE_ENV === "production";
// React needs eval() for its development-only debugging features; never in production.
const isDev = process.env.NODE_ENV === "development";

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
  // PostHog endpoints end in "/" (e.g. /e/); Next's trailing-slash redirect would drop events.
  skipTrailingSlashRedirect: true,
  async rewrites() {
    // Same-origin proxy for analytics: tracking blockers filter by domain,
    // and the CSP can stay pinned to 'self'. Order matters: static and
    // array before the catch-all. No-op traffic-wise until a key is set.
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
