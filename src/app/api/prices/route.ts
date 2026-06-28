import { NextRequest, NextResponse } from "next/server";
import fallback from "@/data/fallback-prices.json";
import type { PricePoint } from "@/lib/types";

type FallbackEntry = { id: string; symbol: string; name: string; prices: PricePoint[] };
const FALLBACK = fallback as unknown as Record<string, FallbackEntry>;

// Source de prix : Fritzy Finance (proxy CoinGecko utilisé par le simulateur
// d'origine de S'investir). Avantages décisifs :
//  - couvre 30 000+ cryptos (le « 7000+ » de l'original) ;
//  - prix en EUR natifs (vs_currency=eur), aucune conversion ;
//  - historique long (depuis 2013) sans la limite 365 j de CoinGecko gratuit ;
//  - accessible depuis les serveurs Vercel (Binance y renvoie 451).
const FRITZY = "https://digital-assets.fritzy.finance";

/**
 * Récupère l'historique complet d'une crypto en EUR via Fritzy/CoinGecko.
 * Format renvoyé : { prices: [[timestampMs, prixEUR], ...] }.
 */
async function fetchFritzy(id: string): Promise<PricePoint[]> {
  const url = `${FRITZY}/coins/${id}/market_chart?vs_currency=eur&days=max`;
  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`fritzy ${res.status}`);
  const data = (await res.json()) as { prices?: [number, number][] };
  if (!Array.isArray(data.prices)) throw new Error("no prices");
  // CoinGecko renvoie des points journaliers en days=max ; on arrondit le prix.
  return data.prices.map(
    ([t, p]) => [t, Math.round(p * 1e6) / 1e6] as PricePoint
  );
}

/**
 * GET /api/prices?id=bitcoin
 * Stratégie : Fritzy/CoinGecko (EUR, historique long) → fallback figé local.
 */
export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id") ?? "bitcoin";

  // 1. Source live (EUR, historique long)
  try {
    const prices = await fetchFritzy(id);
    if (prices.length > 1) {
      return NextResponse.json({ source: "fritzy", id, prices });
    }
  } catch {
    // bascule fallback
  }

  // 2. Fallback figé local (cryptos majeures uniquement)
  const fb = FALLBACK[id];
  if (fb) {
    return NextResponse.json({
      source: "fallback",
      id,
      prices: fb.prices,
      notice:
        "Données de démonstration (jeu figé local) — la source temps réel est momentanément indisponible.",
    });
  }

  return NextResponse.json(
    {
      error: "Données indisponibles pour cette crypto.",
      detail:
        "La source de prix est momentanément indisponible et aucune donnée figée n'existe pour cette crypto.",
    },
    { status: 503 }
  );
}
