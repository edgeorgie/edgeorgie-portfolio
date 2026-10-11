"use client";

import { useEffect, useState } from "react";
import { person } from "@/lib/site";

/** Current local time in Barranquilla; client-only to avoid a hydration mismatch. */
export function LocalTime() {
  const [time, setTime] = useState<string | null>(null);
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-US", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: person.timezone });
    const tick = () => setTime(fmt.format(new Date()));
    tick();
    const t = setInterval(tick, 30_000);
    return () => clearInterval(t);
  }, []);
  return (
    <span className="tnum" suppressHydrationWarning>
      {time ?? "--:--"} local
    </span>
  );
}
