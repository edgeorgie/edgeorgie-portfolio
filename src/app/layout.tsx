import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

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
    "I build software AI agents actually use. Senior software engineer at Mercado Libre, building agent architectures at LATAM e-commerce scale. Real shipped agent-native projects: triage-desk, eval-lab, repoask-mcp.",
  openGraph: {
    title: "Edwin Jorge — Software Engineer",
    description: "I build software AI agents actually use.",
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
        {children}
      </body>
    </html>
  );
}
