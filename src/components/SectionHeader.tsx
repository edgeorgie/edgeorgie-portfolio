import type { ReactNode } from "react";
import { sectionNumber, sections, type SectionId } from "@/lib/site";

/**
 * Shared chapter header: numbered mono kicker (derived from page order, so
 * numbering can't drift), a serif display title and an optional lede.
 */
export function SectionHeader({
  id,
  title,
  lede,
  aside,
}: {
  id: SectionId;
  title: ReactNode;
  lede?: ReactNode;
  aside?: ReactNode;
}) {
  const label = sections.find((s) => s.id === id)?.label ?? id;
  return (
    <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-end">
      <div>
        <p className="kicker mb-5 flex items-center gap-3">
          <span className="tnum">{sectionNumber(id)}</span>
          <span className="h-px w-6 bg-accent/60" aria-hidden="true" />
          <span>{label}</span>
        </p>
        <h2 className="display text-[2.6rem] sm:text-5xl md:text-6xl lg:text-[4.25rem] max-w-3xl">{title}</h2>
        {lede && <p className="lede mt-6">{lede}</p>}
      </div>
      {aside && <div className="md:pb-2">{aside}</div>}
    </div>
  );
}
