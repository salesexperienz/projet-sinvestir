// Types partagés du simulateur crypto.

export type Frequence = "once" | "daily" | "weekly" | "monthly";

export interface Crypto {
  id: string; // identifiant CoinGecko (ex: "bitcoin")
  symbol: string; // ex: "BTC"
  name: string; // ex: "Bitcoin"
}

/** Une bougie de prix : [timestamp ms, prix EUR] */
export type PricePoint = [number, number];

export interface SimulationInput {
  /** Montant en euros. En one-shot : montant total investi.
   *  En DCA : montant investi à chaque versement. */
  montant: number;
  frequence: Frequence;
  /** Série de prix historiques (ordonnée par date croissante), en EUR. */
  prices: PricePoint[];
}

export interface SimulationPoint {
  date: number; // timestamp ms
  investi: number; // cumul investi à cette date
  valeur: number; // valeur du portefeuille à cette date
  acquis: number; // quantité de crypto accumulée à cette date
  prix: number; // prix unitaire de la crypto ce jour-là
}

export interface SimulationResult {
  montantInvesti: number; // total réellement investi
  valeurFinale: number; // valeur du portefeuille à la date de fin
  plusValue: number; // valeurFinale - montantInvesti (peut être négatif)
  performancePct: number; // plusValue / montantInvesti * 100
  quantite: number; // quantité de crypto accumulée
  prixMoyen: number; // prix moyen d'acquisition (investi / quantité)
  prixDebut: number;
  prixFin: number;
  nbVersements: number;
  serie: SimulationPoint[]; // pour le graphique
}
