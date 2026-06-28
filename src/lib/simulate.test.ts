import { simulate } from "./simulate";
import type { PricePoint } from "./types";
import assert from "node:assert";

const DAY = 24 * 60 * 60 * 1000;
const t0 = Date.UTC(2024, 0, 1);

// Série simple : prix qui double de 100 à 200 sur 4 jours.
const doubling: PricePoint[] = [
  [t0, 100],
  [t0 + DAY, 125],
  [t0 + 2 * DAY, 150],
  [t0 + 3 * DAY, 200],
];

// 1. One-shot : 1000€ à 100, valorisé à 200 -> +100%
{
  const r = simulate({ montant: 1000, frequence: "once", prices: doubling });
  assert.strictEqual(r.montantInvesti, 1000);
  assert.strictEqual(r.valeurFinale, 2000);
  assert.strictEqual(r.plusValue, 1000);
  assert.strictEqual(r.performancePct, 100);
  assert.strictEqual(r.nbVersements, 1);
  console.log("✓ one-shot x2 -> +100%");
}

// 2. Prix qui baisse -> moins-value (spécificité crypto vs intérêts composés)
{
  const down: PricePoint[] = [
    [t0, 200],
    [t0 + DAY, 150],
    [t0 + 2 * DAY, 100],
  ];
  const r = simulate({ montant: 1000, frequence: "once", prices: down });
  assert.strictEqual(r.valeurFinale, 500);
  assert.strictEqual(r.plusValue, -500);
  assert.strictEqual(r.performancePct, -50);
  console.log("✓ baisse -> moins-value -50%");
}

// 3. DCA quotidien : 100€/jour pendant 4 jours = 400€ investis
{
  const r = simulate({ montant: 100, frequence: "daily", prices: doubling });
  assert.strictEqual(r.nbVersements, 4);
  assert.strictEqual(r.montantInvesti, 400);
  // Quantités : 100/100 + 100/125 + 100/150 + 100/200 = 1 + 0.8 + 0.6667 + 0.5 = 2.9667
  // Valeur finale = 2.9667 * 200 = 593.33
  assert.ok(Math.abs(r.valeurFinale - 593.33) < 0.5, `valeurFinale=${r.valeurFinale}`);
  assert.ok(r.plusValue > 0, "DCA sur tendance haussière doit être positif");
  console.log("✓ DCA quotidien : 4 versements, plus-value cohérente");
}

// 4. La série a un point par prix et finit à la valeur finale
{
  const r = simulate({ montant: 1000, frequence: "once", prices: doubling });
  assert.strictEqual(r.serie.length, doubling.length);
  assert.strictEqual(r.serie[r.serie.length - 1].valeur, r.valeurFinale);
  assert.strictEqual(r.serie[0].investi, 1000);
  console.log("✓ série cohérente (longueur + valeur finale)");
}

// 5. Convention DCA : prix moyen d'acquisition = investi / quantité
{
  const r = simulate({ montant: 100, frequence: "daily", prices: doubling });
  const prixMoyenAttendu =
    Math.round((r.montantInvesti / r.quantite) * 100) / 100;
  assert.strictEqual(r.prixMoyen, prixMoyenAttendu);
  // Le prix moyen DCA doit être entre le min et le max de la période
  assert.ok(r.prixMoyen >= 100 && r.prixMoyen <= 200, `prixMoyen=${r.prixMoyen}`);
  console.log("✓ prix moyen d'acquisition cohérent (investi / quantité)");
}

// 6. Nombre de versements DCA hebdomadaire sur ~9 semaines
{
  const weeks: PricePoint[] = [];
  for (let i = 0; i <= 63; i++) weeks.push([t0 + i * DAY, 100]);
  const r = simulate({ montant: 50, frequence: "weekly", prices: weeks });
  // 63 jours / 7 = 9 intervalles + 1 (date de début incluse) = 10 versements
  assert.strictEqual(r.nbVersements, 10);
  assert.strictEqual(r.montantInvesti, 500);
  // Prix constant 100 -> perf nulle, quantité = 5
  assert.strictEqual(r.performancePct, 0);
  assert.ok(Math.abs(r.quantite - 5) < 1e-9);
  console.log("✓ DCA hebdo : nb versements + invariants à prix constant");
}

// 7. Downsampling : la série est plafonnée mais commence/finit bien
{
  const many: PricePoint[] = [];
  for (let i = 0; i < 1000; i++) many.push([t0 + i * DAY, 100 + i]);
  const r = simulate({ montant: 1000, frequence: "once", prices: many });
  assert.ok(r.serie.length <= 400, `serie=${r.serie.length}`);
  assert.strictEqual(r.serie[r.serie.length - 1].valeur, r.valeurFinale);
  console.log("✓ downsampling série (<=400 points, dernier = valeur finale)");
}

console.log("\nTous les tests du moteur passent.");
