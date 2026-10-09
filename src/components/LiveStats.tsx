"use client";

import { useEffect, useState } from "react";
import { Reveal } from "./Reveal";

type Stats = {
  ok: boolean;
  repos: { name: string; stars: number; pushedAt: string }[];
  lastPushedRepo: string;
  lastPushedAt: string;
};

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function LiveStats() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/api/github-stats")
      .then((r) => r.json())
      .then((d) => (d.ok ? setStats(d) : setError(true)))
      .catch(() => setError(true));
  }, []);

  return (
    <section className="relative py-20 border-t border-[var(--line)]">
      <div className="max-w-6xl mx-auto px-6 md:px-10">
        <Reveal>
          <div className="flex items-center gap-3 mb-8">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-accent opacity-60 animate-ping" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent" />
            </span>
            <p className="mono text-xs text-fg-dim uppercase tracking-widest">
              Live from the GitHub API — not a static mockup
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          {error && (
            <p className="mono text-sm text-fg-dim">
              GitHub API temporarily unavailable — repos are still real, see
              links above.
            </p>
          )}
          {!error && !stats && (
            <p className="mono text-sm text-fg-dim">fetching live repo data…</p>
          )}
          {stats && (
            <div className="grid sm:grid-cols-3 gap-px bg-[var(--line)] border border-[var(--line)] rounded-xl overflow-hidden">
              {stats.repos.map((r) => (
                <div key={r.name} className="bg-bg-soft p-6">
                  <p className="mono text-sm text-fg">{r.name}</p>
                  <p className="mono text-xs text-fg-dim mt-2">
                    ★ {r.stars} · pushed {timeAgo(r.pushedAt)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Reveal>
      </div>
    </section>
  );
}
