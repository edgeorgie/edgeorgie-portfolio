import type { Metadata, Viewport } from "next";
import { Inter, Instrument_Serif, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Analytics as ProductAnalytics } from "@/components/Analytics";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics as VercelAnalytics } from "@vercel/analytics/next";
import { MotionProvider } from "@/components/MotionProvider";
import { SITE_URL, links, person } from "@/lib/site";
import portrait from "@/assets/portrait.webp";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const serif = Instrument_Serif({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
});

const jbmono = JetBrains_Mono({
  variable: "--font-jbmono",
  subsets: ["latin"],
  display: "swap",
  // Only small labels use it; leaving it out of the preload set lets the
  // headline (serif) and body (Inter) fonts win bandwidth on slow networks.
  preload: false,
});

const title = `${person.name} — ${person.title}`;
const description =
  "Full-stack engineer at Mercado Libre shipping web, native mobile and smart-TV surfaces at LATAM scale (4.3M+ users), with a public track record in AI-agent engineering: live MCP servers, a webhook-triggered triage bot, an eval CLI/Action and a React re-render profiler on npm.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title,
  description,
  alternates: { canonical: "/" },
  keywords: [
    "Edwin Jorge",
    "edgeorgie",
    "software engineer",
    "frontend engineer",
    "full-stack engineer",
    "AI engineer",
    "MCP server",
    "React",
    "Next.js",
    "TypeScript",
    "remote",
  ],
  authors: [{ name: person.name, url: SITE_URL }],
  creator: person.name,
  openGraph: {
    title,
    description:
      "Full-stack engineer across web, native mobile and smart TV, with live AI-agent projects you can run today.",
    url: "/",
    siteName: `${person.name} — portfolio`,
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description:
      "Full-stack engineer across web, native mobile and smart TV, with live AI-agent projects you can run today.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#09090b",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": `${SITE_URL}/#person`,
      name: person.name,
      alternateName: person.handle,
      jobTitle: person.title,
      worksFor: { "@type": "Organization", name: person.company },
      email: links.mailto,
      url: SITE_URL,
      image: `${SITE_URL}${portrait.src}`,
      address: { "@type": "PostalAddress", addressLocality: "Barranquilla", addressCountry: "CO" },
      sameAs: [links.github, links.linkedin],
      knowsAbout: [
        "TypeScript",
        "React",
        "Next.js",
        "Node.js",
        "AI agents",
        "Model Context Protocol",
        "Retrieval-augmented generation",
        "Smart TV applications",
        "Observability",
      ],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: `${person.name} — portfolio`,
      author: { "@id": `${SITE_URL}/#person` },
      inLanguage: "en",
    },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} ${serif.variable} ${jbmono.variable} h-full`}>
      <body className="min-h-full bg-bg text-fg grain relative">
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <script
          type="application/ld+json"
          // JSON.stringify output is escaped so a "<" can never close the tag.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
        />
        <MotionProvider>{children}</MotionProvider>
        <ProductAnalytics />
        {/* Vercel sets VERCEL=1 at build time. Outside Vercel (local, CI)
            these would request /_vercel/* endpoints that don't exist. */}
        {process.env.VERCEL && (
          <>
            <SpeedInsights />
            <VercelAnalytics />
          </>
        )}
      </body>
    </html>
  );
}
