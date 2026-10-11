"use client";

import { useState } from "react";
import { Icon } from "./Icon";

export function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable */
    }
  };
  return (
    <button type="button" onClick={copy} className="btn !py-2 !px-3.5 text-[12px]" aria-live="polite">
      <Icon name={copied ? "check" : "copy"} className="w-3.5 h-3.5" />
      {copied ? "Copied" : label}
    </button>
  );
}
