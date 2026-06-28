import type {
  Frequence,
  PricePoint,
  SimulationInput,
  SimulationPoint,
  SimulationResult,
} from "./types";

const DAY = 24 * 60 * 60 * 1000;

const INTERVAL_MS: Record<Exclude<Frequence, "once">, number> = {
  daily: DAY,
  weekly: 7 * DAY,
  monthly: 30 * DAY,
};

/**
 * Trouve le prix le plus proche (à la date `t` ou juste avant) dans une série
 * triée par date croissante. Recherche linéaire avec curseur car on parcourt
 * la série dans l'ordre — suffisant pour quelques milliers de points.
 */
function priceAt(prices: PricePoint[], t: number): number {
  let chosen = prices[0][1];
  for (const [time, price] of prices) {
    if (time <= t) chosen = price;
    else break;
  }
  return chosen;
}

/**
 * Cœur fonctionnel transposé du simulateur crypto S'investir.
 *
 * - "once"  : tout le montant est investi au prix de la date de début.
 * - DCA     : `montant` est investi à chaque intervalle (quotidien / hebdo /
 *             mensuel) au prix du jour, jusqu'à la date de fin.
 *
 * La valorisation finale se fait au dernier prix de la série. La série retournée
 * permet de tracer l'évolution de la valeur vs le capital investi.
 */
export function simulate(input: SimulationInput): SimulationResult {
  const { montant, frequence, prices } = input;

  if (!prices || prices.length < 2) {
    throw new Error("Série de prix insuffisante pour simuler.");
  }

  const debut = prices[0][0];
  const fin = prices[prices.length - 1][0];
  const prixDebut = prices[0][1];
  const prixFin = prices[prices.length - 1][1];

  // Dates d'achat
  const achats: number[] = [];
  if (frequence === "once") {
    achats.push(debut);
  } else {
    const step = INTERVAL_MS[frequence];
    for (let t = debut; t <= fin; t += step) achats.push(t);
  }

  // Accumulation de quantité
  let quantite = 0;
  let investi = 0;
  for (const t of achats) {
    const p = priceAt(prices, t);
    if (p > 0) {
      quantite += montant / p;
      investi += montant;
    }
  }

  // Série d'évolution : à chaque point de prix, valeur = quantité détenue ce
  // jour-là × prix du jour, et investi = cumul des versements effectués.
  const achatsSet = achats.slice().sort((a, b) => a - b);
  const serie: SimulationPoint[] = [];
  let qtyCum = 0;
  let invCum = 0;
  let achatIdx = 0;

  for (const [time, price] of prices) {
    // Intègre les achats dont la date est <= au point courant
    while (achatIdx < achatsSet.length && achatsSet[achatIdx] <= time) {
      const p = priceAt(prices, achatsSet[achatIdx]);
      if (p > 0) {
        qtyCum += montant / p;
        invCum += montant;
      }
      achatIdx++;
    }
    serie.push({
      date: time,
      investi: Math.round(invCum * 100) / 100,
      valeur: Math.round(qtyCum * price * 100) / 100,
      acquis: qtyCum,
      prix: price,
    });
  }

  const valeurFinale = quantite * prixFin;
  const plusValue = valeurFinale - investi;
  const performancePct = investi > 0 ? (plusValue / investi) * 100 : 0;

  return {
    montantInvesti: Math.round(investi * 100) / 100,
    valeurFinale: Math.round(valeurFinale * 100) / 100,
    plusValue: Math.round(plusValue * 100) / 100,
    performancePct: Math.round(performancePct * 100) / 100,
    quantite,
    prixMoyen: quantite > 0 ? Math.round((investi / quantite) * 100) / 100 : 0,
    prixDebut,
    prixFin,
    nbVersements: achats.length,
    serie: downsample(serie, 400),
  };
}

/**
 * Réduit la série à ~max points pour alléger le rendu du graphe, en conservant
 * toujours le premier et le dernier point (calcul des résultats inchangé).
 */
function downsample(serie: SimulationPoint[], max: number): SimulationPoint[] {
  if (serie.length <= max) return serie;
  const step = (serie.length - 1) / (max - 1);
  const out: SimulationPoint[] = [];
  for (let i = 0; i < max; i++) out.push(serie[Math.round(i * step)]);
  out[out.length - 1] = serie[serie.length - 1];
  return out;
}
