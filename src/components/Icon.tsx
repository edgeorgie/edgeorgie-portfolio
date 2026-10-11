import type { SVGProps } from "react";

/**
 * One stroke-only icon set for the whole site (24×24 viewBox, currentColor).
 * Previously AIWorkflow and Beyond each carried their own copies.
 */
const PATHS: Record<string, React.ReactNode> = {
  // workflow
  split: (
    <>
      <circle cx="6" cy="6" r="2.4" />
      <circle cx="6" cy="18" r="2.4" />
      <circle cx="18" cy="12" r="2.4" />
      <path d="M8.1 7.1 15.9 11M8.1 16.9 15.9 13" />
    </>
  ),
  parallel: (
    <>
      <path d="M4 6h16M4 12h16M4 18h16" />
      <path d="M20 6l-2-2m2 2-2 2M20 12l-2-2m2 2-2 2M20 18l-2-2m2 2-2 2" />
    </>
  ),
  skill: (
    <>
      <path d="M5 4h11l3 3v13H5z" />
      <path d="M9 9h6M9 13h6M9 17h3" />
    </>
  ),
  gate: (
    <>
      <path d="M12 3 21 12 12 21 3 12Z" />
      <path d="M12 9v6" />
    </>
  ),
  scale: <path d="M12 3v18M7 7h10M4.5 7 7 13.5 9.5 7M14.5 7 17 13.5 19.5 7" />,
  check: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m8 12.5 2.6 2.6L16.2 9" />
    </>
  ),
  critic: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m20 20-4.3-4.3" />
      <path d="M9 11h4" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3 20 6.5V12c0 5-3.4 8-8 9-4.6-1-8-4-8-9V6.5Z" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
  bolt: <path d="M13 3 5 13.5h6L10 21l9-11h-6.5Z" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.2 2" />
    </>
  ),
  file: (
    <>
      <path d="M6 3h8l4 4v14H6z" />
      <path d="M9 12h6M9 16h6" />
    </>
  ),
  bell: (
    <>
      <path d="M6 10a6 6 0 1 1 12 0c0 4 1.5 5.5 1.5 5.5h-15S6 14 6 10Z" />
      <path d="M10 19a2 2 0 0 0 4 0" />
    </>
  ),
  fork: (
    <>
      <circle cx="6" cy="6" r="2" />
      <circle cx="6" cy="18" r="2" />
      <circle cx="18" cy="12" r="2" />
      <path d="M8 6h4a4 4 0 0 1 4 4M8 18h4a4 4 0 0 0 4-4" />
    </>
  ),
  db: (
    <>
      <ellipse cx="12" cy="6" rx="7" ry="3" />
      <path d="M5 6v12c0 1.7 3.1 3 7 3s7-1.3 7-3V6" />
      <path d="M5 12c0 1.7 3.1 3 7 3s7-1.3 7-3" />
    </>
  ),
  task: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="2.5" />
      <path d="m8.5 12 2.2 2.2L16 9" />
    </>
  ),
  // beyond
  gamepad: (
    <>
      <rect x="3" y="8" width="18" height="9" rx="4" />
      <path d="M7 11v3M5.5 12.5h3" />
      <circle cx="15.5" cy="11.5" r="0.8" fill="currentColor" stroke="none" />
      <circle cx="17.5" cy="13.5" r="0.8" fill="currentColor" stroke="none" />
    </>
  ),
  brain: (
    <>
      <path d="M9 4.5a3 3 0 0 0-3 3v1a3 3 0 0 0-1.5 5.5A3 3 0 0 0 7 19h2" />
      <path d="M15 4.5a3 3 0 0 1 3 3v1a3 3 0 0 1 1.5 5.5A3 3 0 0 1 17 19h-2" />
      <path d="M9 4.5v14.5M15 4.5v14.5" />
    </>
  ),
  code: <path d="m9 7-5 5 5 5M15 7l5 5-5 5" />,
  palette: (
    <>
      <path d="M12 3a9 9 0 1 0 0 18c1.1 0 2-.7 2-1.8 0-.5-.2-.9-.5-1.2-.3-.3-.5-.7-.5-1.2 0-1.1.9-1.8 2-1.8h2a4.5 4.5 0 0 0 4.5-4.5C21 6.4 17 3 12 3Z" />
      <circle cx="7.5" cy="10.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="11" cy="7.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="15.5" cy="8.5" r="1" fill="currentColor" stroke="none" />
    </>
  ),
  controller: (
    <>
      <circle cx="16" cy="8.5" r="0.8" fill="currentColor" stroke="none" />
      <circle cx="14" cy="10.5" r="0.8" fill="currentColor" stroke="none" />
      <path d="M6 9h1a5 5 0 0 1 5 1 5 5 0 0 1 5-1h1a3 3 0 0 1 3 3.3l-.6 5a2.2 2.2 0 0 1-3.9 1.1L14 16h-4l-1.5 2.4A2.2 2.2 0 0 1 4.6 17.3l-.6-5A3 3 0 0 1 6 9Z" />
    </>
  ),
  guitar: (
    <>
      <circle cx="8.5" cy="15.5" r="4.5" />
      <path d="M11.5 12 17 6.5" />
      <path d="M15.5 5 19 8.5M17 4l2.5 2.5" />
      <path d="M7 15.5h3" />
    </>
  ),
  // achievements
  users: (
    <>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3.5 19a5.5 5.5 0 0 1 11 0" />
      <path d="M16 5.5a3.2 3.2 0 0 1 0 5.2M20.5 19a5.5 5.5 0 0 0-4-5.3" />
    </>
  ),
  tv: (
    <>
      <rect x="3" y="5" width="18" height="12" rx="2" />
      <path d="M8 21h8M12 17v4" />
    </>
  ),
  package: (
    <>
      <path d="m12 3 8 4.5v9L12 21l-8-4.5v-9Z" />
      <path d="M4 7.5 12 12l8-4.5M12 12v9" />
    </>
  ),
  server: (
    <>
      <rect x="4" y="4" width="16" height="6" rx="1.5" />
      <rect x="4" y="14" width="16" height="6" rx="1.5" />
      <path d="M8 7h.01M8 17h.01" />
    </>
  ),
  bot: (
    <>
      <rect x="5" y="8" width="14" height="11" rx="2.5" />
      <path d="M12 4v4M9 13h.01M15 13h.01M9 16h6" />
    </>
  ),
  degree: (
    <>
      <path d="m3 9 9-4 9 4-9 4Z" />
      <path d="M7 11v4c0 1.5 2.3 3 5 3s5-1.5 5-3v-4M21 9v5" />
    </>
  ),
  mic: (
    <>
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0M12 18v3M9 21h6" />
    </>
  ),
  // ui / social
  github: (
    <path
      fill="currentColor"
      stroke="none"
      d="M12 2C6.48 2 2 6.58 2 12.25c0 4.53 2.87 8.37 6.84 9.72.5.1.68-.22.68-.49 0-.24-.01-1.04-.01-1.89-2.78.62-3.37-1.21-3.37-1.21-.45-1.18-1.11-1.5-1.11-1.5-.91-.64.07-.63.07-.63 1 .07 1.53 1.06 1.53 1.06.9 1.57 2.35 1.12 2.92.86.09-.67.35-1.12.63-1.38-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.72 0 0 .84-.28 2.75 1.05A9.3 9.3 0 0 1 12 6.84c.85 0 1.7.12 2.5.35 1.9-1.33 2.74-1.05 2.74-1.05.55 1.42.2 2.46.1 2.72.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.8-4.57 5.06.36.32.68.94.68 1.9 0 1.37-.01 2.47-.01 2.81 0 .27.18.59.69.49A10.26 10.26 0 0 0 22 12.25C22 6.58 17.52 2 12 2Z"
    />
  ),
  linkedin: (
    <path
      fill="currentColor"
      stroke="none"
      d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.36V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.12 20.45H3.56V9h3.56v11.45Z"
    />
  ),
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </>
  ),
  whatsapp: (
    <path
      fill="currentColor"
      stroke="none"
      d="M12.04 2a9.9 9.9 0 0 0-8.5 15l-1.4 5 5.2-1.4A9.9 9.9 0 1 0 12.04 2Zm0 18.1a8.2 8.2 0 0 1-4.2-1.1l-.3-.2-3.1.8.8-3-.2-.3a8.2 8.2 0 1 1 7 3.8Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1-.2.2-.6.8-.8 1-.1.2-.3.2-.5.1-.7-.3-1.4-.6-2-1.2-.5-.5-1-1.1-1.3-1.7-.1-.2 0-.4.1-.5l.4-.5.2-.4c.1-.2 0-.3 0-.5l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.6.6-.9 1.3-.9 2.1 0 1 .6 1.9 1 2.5a11.1 11.1 0 0 0 4.3 3.8c.6.3 1.2.5 1.9.6.5.1 1 0 1.5-.3.4-.3.8-.7 1-1.2.1-.3.1-.6 0-.8l-.4-.3Z"
    />
  ),
  arrowRight: <path d="M5 12h14M13 6l6 6-6 6" />,
  arrowUpRight: <path d="M7 17 17 7M8 7h9v9" />,
  arrowDown: <path d="M12 5v14M6 13l6 6 6-6" />,
  plus: <path d="M12 5v14M5 12h14" />,
  copy: (
    <>
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M5 15V5a2 2 0 0 1 2-2h10" />
    </>
  ),
  terminal: (
    <>
      <path d="m5 7 5 5-5 5M12 17h7" />
    </>
  ),
  play: <path d="M7 5v14l11-7Z" />,
  npm: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M7 17V7h10v10h-3v-7h-2v7Z" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21s-6-5.3-6-10a6 6 0 1 1 12 0c0 4.7-6 10-6 10Z" />
      <circle cx="12" cy="11" r="2" />
    </>
  ),
};

export type IconName = keyof typeof PATHS;

export function Icon({
  name,
  className = "w-5 h-5",
  ...rest
}: { name: IconName; className?: string } & Omit<SVGProps<SVGSVGElement>, "name">) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {PATHS[name]}
    </svg>
  );
}
