"use client";

import { useState } from "react";

/**
 * Pastille (i) ronde grise avec une infobulle de définition au survol/focus.
 * Tooltip au design sombre S'investir.
 */
export function InfoBadge({ text }: { text: string }) {
  const [open, setOpen] = useState(false);

  return (
    <span className="relative inline-flex">
      <button
        type="button"
        aria-label={text}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        className="inline-flex h-4 w-4 shrink-0 cursor-help items-center justify-center rounded-full bg-white/[0.08] text-[9px] font-semibold italic text-sx-faint ring-1 ring-white/10 transition-colors hover:text-sx-text"
      >
        i
      </button>
      {open && (
        <span
          role="tooltip"
          className="absolute bottom-full left-1/2 z-20 mb-2 w-56 -translate-x-1/2 rounded-lg border border-white/10 bg-[#0b1525] px-3 py-2 text-xs font-normal not-italic leading-snug text-sx-body shadow-xl"
        >
          {text}
          <span className="absolute left-1/2 top-full h-2 w-2 -translate-x-1/2 -translate-y-1 rotate-45 border-b border-r border-white/10 bg-[#0b1525]" />
        </span>
      )}
    </span>
  );
}
