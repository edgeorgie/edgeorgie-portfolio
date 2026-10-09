import { NextResponse } from "next/server";

type RepoStat = {
  name: string;
  stars: number;
  pushedAt: string;
};

export async function GET() {
  const repos = ["triage-desk", "eval-lab", "repoask-mcp"];
  try {
    const results = await Promise.all(
      repos.map(async (repo) => {
        const res = await fetch(
          `https://api.github.com/repos/edgeorgie/${repo}`,
          {
            headers: { Accept: "application/vnd.github+json" },
            next: { revalidate: 300 },
          }
        );
        if (!res.ok) throw new Error(`GitHub API ${res.status} for ${repo}`);
        const data = await res.json();
        return {
          name: repo,
          stars: data.stargazers_count ?? 0,
          pushedAt: data.pushed_at,
        } as RepoStat;
      })
    );

    const mostRecent = results.reduce((a, b) =>
      new Date(a.pushedAt) > new Date(b.pushedAt) ? a : b
    );

    return NextResponse.json({
      ok: true,
      repos: results,
      lastPushedRepo: mostRecent.name,
      lastPushedAt: mostRecent.pushedAt,
      fetchedAt: new Date().toISOString(),
    });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: (err as Error).message },
      { status: 500 }
    );
  }
}
