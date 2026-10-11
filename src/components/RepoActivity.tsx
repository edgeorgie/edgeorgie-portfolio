import { getRepoActivity } from "@/lib/github";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Deterministic UTC date label, safe inside prerendering (no Date.now()). */
export function formatPushDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

/**
 * "last push · 10 Oct 2026" from the GitHub API, fetched server-side through
 * the cached `getRepoActivity`. Renders nothing when GitHub is unreachable.
 */
export async function RepoActivity({ repo }: { repo: string }) {
  const activity = await getRepoActivity(repo);
  if (!activity) return null;
  return (
    <span className="font-mono text-[11px] text-fg-faint whitespace-nowrap" title="Live from the GitHub API, cached hourly">
      last push · {formatPushDate(activity.pushedAt)}
    </span>
  );
}
