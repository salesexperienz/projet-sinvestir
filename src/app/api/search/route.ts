import { NextRequest, NextResponse } from "next/server";
import { CRYPTOS } from "@/data/cryptos";
import type { Crypto } from "@/lib/types";

// Même source que les prix : Fritzy Finance (proxy CoinGecko de l'original).
const FRITZY = "https://digital-assets.fritzy.finance";

type FritzyCoin = { id: string; symbol: string; name: string; marketCapRank?: number };

/** Liste complète mise en cache en mémoire (31k+ coins) pour la recherche. */
let LIST_CACHE: { at: number; coins: FritzyCoin[] } | null = null;
const LIST_TTL = 6 * 60 * 60 * 1000; // 6 h

async function getList(): Promise<FritzyCoin[]> {
  if (LIST_CACHE && Date.now() - LIST_CACHE.at < LIST_TTL) return LIST_CACHE.coins;
  const res = await fetch(`${FRITZY}/coins/list`, { next: { revalidate: 21600 } });
  const coins = (await res.json()) as FritzyCoin[];
  LIST_CACHE = { at: Date.now(), coins };
  return coins;
}

/**
 * Rang de popularité (capitalisation) par id, pour faire remonter les cryptos
 * connues en tête de recherche (ex. "sol" → Solana avant les tokens ponts).
 */
let RANK_CACHE: { at: number; rank: Map<string, number> } | null = null;
async function getRank(): Promise<Map<string, number>> {
  if (RANK_CACHE && Date.now() - RANK_CACHE.at < LIST_TTL) return RANK_CACHE.rank;
  const rank = new Map<string, number>();
  try {
    const res = await fetch(`${FRITZY}/coins/markets?vs_currency=eur`, {
      next: { revalidate: 3600 },
    });
    const coins = (await res.json()) as FritzyCoin[];
    coins.forEach((c, i) => rank.set(c.id, c.marketCapRank ?? i + 1));
  } catch {
    // pas de rang : la recherche reste fonctionnelle, juste moins bien triée
  }
  RANK_CACHE = { at: Date.now(), rank };
  return rank;
}

const toCrypto = (c: FritzyCoin): Crypto => ({
  id: c.id,
  symbol: (c.symbol ?? "").toUpperCase(),
  name: c.name,
});

/**
 * Recherche de cryptomonnaies parmi les 30 000+ indexées (comme l'original).
 * - sans q : top cryptos par capitalisation (markets EUR) ;
 * - avec q : filtre sur la liste complète, symbole exact d'abord, puis "commence
 *   par", puis "contient" ; limité à 20 résultats.
 * Fallback sur la liste locale si la source est indisponible.
 *
 * GET /api/search?q=sol
 */
export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get("q") ?? "").trim().toLowerCase();

  // Défaut : top par capitalisation
  if (!q) {
    try {
      const res = await fetch(`${FRITZY}/coins/markets?vs_currency=eur`, {
        next: { revalidate: 3600 },
      });
      const coins = (await res.json()) as FritzyCoin[];
      if (Array.isArray(coins) && coins.length) {
        return NextResponse.json({
          source: "fritzy",
          results: coins.slice(0, 12).map(toCrypto),
        });
      }
    } catch {
      // fallback
    }
    return NextResponse.json({ source: "local", results: CRYPTOS.slice(0, 8) });
  }

  // Recherche sur la liste complète
  try {
    const [list, rank] = await Promise.all([getList(), getRank()]);
    const exact: FritzyCoin[] = [];
    const starts: FritzyCoin[] = [];
    const contains: FritzyCoin[] = [];
    for (const c of list) {
      const sym = (c.symbol ?? "").toLowerCase();
      const name = (c.name ?? "").toLowerCase();
      if (sym === q || name === q) exact.push(c);
      else if (name.startsWith(q) || sym.startsWith(q)) starts.push(c);
      else if (name.includes(q)) contains.push(c);
    }
    // Dans chaque groupe, les cryptos connues (capitalisation) d'abord.
    const byRank = (a: FritzyCoin, b: FritzyCoin) =>
      (rank.get(a.id) ?? 1e9) - (rank.get(b.id) ?? 1e9);
    exact.sort(byRank);
    starts.sort(byRank);
    contains.sort(byRank);
    const results = [...exact, ...starts, ...contains].slice(0, 20).map(toCrypto);
    if (results.length) return NextResponse.json({ source: "fritzy", results });
  } catch {
    // fallback local
  }

  const results = CRYPTOS.filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      c.symbol.toLowerCase().includes(q) ||
      c.id.includes(q)
  );
  return NextResponse.json({ source: "local", results });
}
