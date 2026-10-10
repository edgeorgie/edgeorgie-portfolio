import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { PostHogPageview } from "@/components/PostHogPageview";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jbmono = JetBrains_Mono({
  variable: "--font-jbmono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Edwin Jorge — Software Engineer",
  description:
    "Full-stack software engineer at Mercado Libre, building production platforms at LATAM e-commerce scale (4.3M+ users) across web, native Android/iOS, and smart TV/OTT — plus observability and clean architecture. AI-agent systems are a standout specialty: real shipped projects include triage-desk, eval-lab, repoask-mcp, and ask-edgeorgie-mcp.",
  openGraph: {
    title: "Edwin Jorge — Software Engineer",
    description: "Full-stack software engineer across web, native mobile, and smart TV/OTT. Production systems at LATAM scale, with AI-agent work as a standout specialty.",
    type: "website",
  },
  metadataBase: new URL("https://edgeorgie.vercel.app"),
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jbmono.variable} h-full`}
    >
      <body className="min-h-full bg-bg text-fg bg-grain relative">
        <PostHogPageview />
        {children}
      </body>
    </html>
  );
}
