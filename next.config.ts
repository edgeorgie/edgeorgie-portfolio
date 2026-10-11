import type { NextConfig } from "next";

const isProd = process.env.VERCEL_ENV === "production" || process.env.NODE_ENV === "production";
// React needs eval() for its development-only debugging features; never in production.
const isDev = process.env.NODE_ENV === "development";
const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";

/**
 * Content Security Policy.
 *
 * The page is statically prerendered, so a per-request nonce is not
 * available (Next.js only injects nonces on dynamically rendered routes).
 * `script-src` therefore has to allow `'unsafe-inline'` for the React
 * Server Component payload and the hydration bootstrap that Next.js
 * inlines. What the policy still enforces: no plugins, no framing, no
 * base-URI hijack, no form exfiltration, and `connect-src`/`img-src`/
 * `font-src` pinned to this origin (+ PostHog only when a key is set).
 *
 * Vercel's preview toolbar (`vercel.live`) is allowed outside production.
 */
function buildCsp(): string {
  const posthogOrigins = posthogKey
    ? [posthogHost, posthogHost.replace("://", "://us-assets.").replace("us-assets.us.", "us-assets.")]
    : [];
  const previewTools = isProd ? [] : ["https://vercel.live", "https://*.vercel.live"];

  const directives: Record<string, string[]> = {
    "default-src": ["'self'"],
    "script-src": ["'self'", "'unsafe-inline'", ...(isDev ? ["'unsafe-eval'"] : []), ...posthogOrigins, ...previewTools],
    "style-src": ["'self'", "'unsafe-inline'"],
    "img-src": ["'self'", "data:", "blob:"],
    "font-src": ["'self'", "data:"],
    "connect-src": ["'self'", ...posthogOrigins, ...previewTools],
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
