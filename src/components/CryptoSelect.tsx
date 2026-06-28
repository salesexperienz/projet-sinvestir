"use client";

import { useEffect, useRef, useState } from "react";
import type { Crypto } from "@/lib/types";
import { IconSearch, IconChevron } from "@/components/icons";

/**
 * Sélecteur de crypto recherchable (comme l'original) : champ de recherche +
 * liste de résultats live via /api/search (Fritzy/CoinGecko, 30 000+ cryptos).
 * Au design S'investir. Affiche la crypto courante, s'ouvre au clic.
 */
export function CryptoSelect({
  value,
  label,
  onChange,
}: {
  value: Crypto;
  label: string;
  onChange: (c: Crypto) => void;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Crypto[]>([]);
  const [loading, setLoading] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fermer au clic extérieur
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  // Focus le champ à l'ouverture
  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  // Recherche (debounce 250 ms) — q vide = top par capitalisation
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    const t = setTimeout(async () => {
      if (cancelled) return;
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
        const data = (await res.json()) as { results: Crypto[] };
        if (!cancelled) setResults(data.results ?? []);
      } catch {
        if (!cancelled) setResults([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [q, open]);

  const pick = (c: Crypto) => {
    onChange(c);
    setOpen(false);
    setQ("");
  };

  return (
    <div ref={boxRef} className="relative">
      <div className="flex items-center gap-1.5">
        <span className="text-[0.9375rem] font-medium text-sx-muted">{label}</span>
      </div>
      {/* Déclencheur */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="mt-2.5 flex w-full items-center justify-between pb-2.5 text-left transition-colors focus-within:[border-color:var(--brand)]"
        style={{ borderBottom: "1.5px solid var(--border-strong)" }}
      >
        <span className="truncate text-[1.375rem] font-medium text-sx-text">
          {value.name}{" "}
          <span className="text-sx-faint">({value.symbol})</span>
        </span>
        <IconChevron
          className={`h-4 w-4 shrink-0 text-sx-faint transition-transform ${
            open ? "rotate-90" : "-rotate-90"
          }`}
        />
      </button>

      {/* Panneau de recherche */}
      {open && (
        <div className="absolute z-30 mt-2 w-full overflow-hidden rounded-2xl border border-white/10 bg-sx-panel shadow-2xl">
          <div className="flex items-center gap-2 border-b border-white/[0.06] px-4 py-3">
            <IconSearch className="h-4 w-4 shrink-0 text-sx-faint" />
            <input
              ref={inputRef}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Rechercher une cryptomonnaie…"
              className="w-full bg-transparent text-sm text-sx-text placeholder:text-sx-faint outline-none"
            />
          </div>
          <ul role="listbox" className="max-h-72 overflow-y-auto py-1">
            {loading && (
              <li className="px-4 py-3 text-sm text-sx-faint">Recherche…</li>
            )}
            {!loading && results.length === 0 && (
              <li className="px-4 py-3 text-sm text-sx-faint">Aucun résultat.</li>
            )}
            {!loading &&
              results.map((c) => (
                <li key={c.id} role="option" aria-selected={c.id === value.id}>
                  <button
                    type="button"
                    onClick={() => pick(c)}
                    className={`flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-sm transition-colors hover:bg-white/[0.05] ${
                      c.id === value.id ? "bg-white/[0.04] text-sx-text" : "text-sx-body"
                    }`}
                  >
                    <span className="truncate">{c.name}</span>
                    <span className="shrink-0 text-xs text-sx-faint">{c.symbol}</span>
                  </button>
                </li>
              ))}
          </ul>
        </div>
      )}
    </div>
  );
}
