import { cacheLife } from "next/cache";

export type RepoActivity = {
  repo: string;
  pushedAt: string;
  stars: number;
  url: string;
};

/**
 * Last-push timestamp for a public repo, fetched server-side and cached with
 * the `use cache` directive (Cache Components). Replaces the previous
 * client-side fetch to `/api/github-stats` on every page view: the value is
 * now part of the static shell, revalidated in the background on the
 * `hours` profile, and a GitHub outage renders nothing instead of a console
 * error. Returns `null` on any failure. Never throws.
 *
 * An optional server-only GITHUB_TOKEN raises the unauthenticated 60 req/h
 * limit; it is never exposed to the client.
 */
export async function getRepoActivity(repo: string): Promise<RepoActivity | null> {
  "use cache";
  cacheLife("hours");

  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "edgeorgie-portfolio",
  };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

  try {
    const res = await fetch(`https://api.github.com/repos/edgeorgie/${repo}`, { headers });
    if (!res.ok) return null;
    const data = (await res.json()) as { pushed_at?: string; stargazers_count?: number; html_url?: string };
    if (!data.pushed_at) return null;
    return {
      repo,
      pushedAt: data.pushed_at,
      stars: data.stargazers_count ?? 0,
      url: data.html_url ?? `https://github.com/edgeorgie/${repo}`,
    };
  } catch {
    return null;
  }
}

/** "3h ago" / "2d ago" / "Mar 2026" style relative label, deterministic for tests. */
export function relativeTime(iso: string, now: number = Date.now()): string {
  const diff = Math.max(0, now - new Date(iso).getTime());
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}
