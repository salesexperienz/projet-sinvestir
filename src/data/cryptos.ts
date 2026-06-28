import type { Crypto } from "@/lib/types";

/**
 * Cryptos proposées dans le sélecteur. Chacune possède une paire Coinbase
 * (ex: "BTC-EUR") qui sert à récupérer l'historique réel en euros, et — pour
 * certaines — un jeu de données figé local en secours.
 *
 * Source = Coinbase Exchange (api.exchange.coinbase.com) : prix en EUR natifs
 * (aucune conversion) et, contrairement à Binance, accessible depuis les
 * serveurs cloud (Vercel) — Binance renvoie 451 "restricted location".
 */
export interface CryptoDef extends Crypto {
  coinbase: string; // paire Coinbase (ex: "BTC-EUR")
}

export const CRYPTOS: CryptoDef[] = [
  { id: "bitcoin", symbol: "BTC", name: "Bitcoin", coinbase: "BTC-EUR" },
  { id: "ethereum", symbol: "ETH", name: "Ethereum", coinbase: "ETH-EUR" },
  { id: "ripple", symbol: "XRP", name: "XRP", coinbase: "XRP-EUR" },
  { id: "solana", symbol: "SOL", name: "Solana", coinbase: "SOL-EUR" },
  { id: "cardano", symbol: "ADA", name: "Cardano", coinbase: "ADA-EUR" },
  { id: "dogecoin", symbol: "DOGE", name: "Dogecoin", coinbase: "DOGE-EUR" },
  { id: "chainlink", symbol: "LINK", name: "Chainlink", coinbase: "LINK-EUR" },
  { id: "polkadot", symbol: "DOT", name: "Polkadot", coinbase: "DOT-EUR" },
  { id: "litecoin", symbol: "LTC", name: "Litecoin", coinbase: "LTC-EUR" },
  { id: "avalanche-2", symbol: "AVAX", name: "Avalanche", coinbase: "AVAX-EUR" },
  { id: "stellar", symbol: "XLM", name: "Stellar", coinbase: "XLM-EUR" },
];

/** Cryptos avec données figées disponibles hors-ligne (fallback). */
export const OFFLINE_IDS = new Set([
  "bitcoin",
  "ethereum",
  "ripple",
  "solana",
  "cardano",
  "dogecoin",
]);

export const COINBASE_BY_ID: Record<string, string> = Object.fromEntries(
  CRYPTOS.map((c) => [c.id, c.coinbase])
);
