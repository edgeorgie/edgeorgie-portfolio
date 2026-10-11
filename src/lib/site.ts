/**
 * Single source of truth for the public identity of the site: canonical
 * URL, name, contact channels. Everything that renders a link or an
 * absolute URL (metadata, JSON-LD, nav, contact, console commands) reads
 * from here, so there is exactly one place to update.
 *
 * Contact details are REAL and verified:
 *  - GitHub + LinkedIn come from the public GitHub profile
 *    (https://github.com/edgeorgie lists both).
 *  - Email is the one on the committed resume.
 *  - WhatsApp number was supplied by the owner for this purpose;
 *    NEXT_PUBLIC_WHATSAPP_NUMBER overrides it. Non-digits are stripped, so
 *    "+57 300 ..." and "57300..." both produce the wa.me format.
 */

/**
 * Canonical origin. The custom domain is the default (the apex redirects to
 * www, and the vercel.app host redirects here too, see next.config.ts).
 * NEXT_PUBLIC_SITE_URL overrides it for other deployments.
 */
export const PRODUCTION_HOST = "www.itsedgeorgie.dev";
export const LEGACY_HOST = "edgeorgie-portfolio.vercel.app";

function resolveSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");
  return `https://${PRODUCTION_HOST}`;
}

export const SITE_URL = resolveSiteUrl();

export const person = {
  name: "Edwin Jorge",
  handle: "edgeorgie",
  /**
   * Job title as the owner presents it on the site. Note: the committed
   * resume and the GitHub bio both say "Software Engineer"; see
   * docs/AUDIT.md H4. Kept as-is pending the owner's decision.
   */
  title: "Senior Software Engineer",
  company: "Mercado Libre",
  location: "Barranquilla, Colombia",
  timezone: "America/Bogota",
  timezoneLabel: "UTC−5",
  availability: "Open to remote roles · relocation with sponsorship",
} as const;

const DEFAULT_WHATSAPP = "573002813676";

function whatsappLink(): string | null {
  const raw = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || DEFAULT_WHATSAPP;
  const digits = raw.replace(/\D/g, "");
  // E.164 is at most 15 digits; refuse anything that doesn't look like one.
  if (digits.length < 8 || digits.length > 15) return null;
  return `https://wa.me/${digits}`;
}

export const links = {
  github: "https://github.com/edgeorgie",
  linkedin: "https://www.linkedin.com/in/edgeorgie",
  email: "ed.jorge1122@gmail.com",
  mailto: "mailto:ed.jorge1122@gmail.com",
  whatsapp: whatsappLink(),
  askMcp: "https://ask-edgeorgie-mcp.vercel.app",
  askMcpEndpoint: "https://ask-edgeorgie-mcp.vercel.app/mcp",
} as const;

export type SectionId =
  | "top"
  | "work"
  | "skills"
  | "experience"
  | "ai-workflow"
  | "ask-me"
  | "beyond"
  | "contact";

/** Page order. Header nav, dot nav and section numbering all derive from this. */
export const sections: { id: SectionId; label: string; short: string }[] = [
  { id: "top", label: "Top", short: "Top" },
  { id: "work", label: "Work", short: "Work" },
  { id: "skills", label: "Skills", short: "Skills" },
  { id: "experience", label: "Experience", short: "Experience" },
  { id: "ai-workflow", label: "How I use AI", short: "AI" },
  { id: "ask-me", label: "Console", short: "Console" },
  { id: "beyond", label: "Beyond the code", short: "Beyond" },
  { id: "contact", label: "Contact", short: "Contact" },
];

export function sectionNumber(id: SectionId): string {
  const idx = sections.findIndex((s) => s.id === id);
  // "top" is 00; every real section counts from 01.
  return String(Math.max(0, idx)).padStart(2, "0");
}
