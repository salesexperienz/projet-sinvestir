"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CRYPTOS } from "@/data/cryptos";
import { simulate } from "@/lib/simulate";
import type { Crypto, Frequence, PricePoint, SimulationResult } from "@/lib/types";
import { fmtEUR, fmtPctSigned, toInputDate } from "@/lib/format";
import { Field } from "@/components/ui/Field";
import { CryptoSelect } from "@/components/CryptoSelect";
import { Button } from "@/components/ui/Button";
import { Callout } from "@/components/ui/Callout";
import { SimulationChart } from "@/components/SimulationChart";
import { IconInfo, IconPlay } from "@/components/icons";
import { InfoBadge } from "@/components/ui/InfoBadge";

const FREQUENCES: { value: Frequence; label: string }[] = [
  { value: "once", label: "En une fois" },
  { value: "daily", label: "Quotidienne" },
  { value: "weekly", label: "Hebdomadaire" },
  { value: "monthly", label: "Mensuelle" },
];

const DAY = 24 * 60 * 60 * 1000;

/**
 * Simulateur crypto autonome et embarquable.
 * Logique transposée de sinvestir.fr/simulateur-crypto-monnaie,
 * habillée au design de simulateurs.sinvestir.fr.
 */
export function CryptoSimulator({ embedded = false }: { embedded?: boolean }) {
  const [crypto, setCrypto] = useState<Crypto>(CRYPTOS[0]);
  const [montant, setMontant] = useState(1000);
  const [frequence, setFrequence] = useState<Frequence>("monthly");
  const [dateFin, setDateFin] = useState(() => toInputDate(Date.now()));
  const [dateDebut, setDateDebut] = useState(() => toInputDate(Date.now() - 330 * DAY));
  // L'utilisateur a-t-il touché aux dates ? Tant que non, on cale la période
  // sur toute la profondeur du jeu de données disponible. Stocké en ref : on
  // veut le lire au chargement des prix sans relancer le fetch quand il change.
  const datesTouched = useRef(false);

  const [prices, setPrices] = useState<PricePoint[] | null>(null);
  const [source, setSource] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Récupère les prix dès que la crypto change.
  useEffect(() => {
    let cancelled = false;
    async function loadPrices() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/prices?id=${crypto.id}&days=365`);
        const data = await res.json();
        if (cancelled) return;
        if (data.prices?.length) {
          setPrices(data.prices);
          setSource(data.source);
          // Période par défaut = toute la profondeur disponible.
          if (!datesTouched.current) {
            setDateDebut(toInputDate(data.prices[0][0]));
            setDateFin(toInputDate(data.prices[data.prices.length - 1][0]));
          }
        } else {
          setError(data.detail ?? "Données indisponibles.");
          setPrices(null);
        }
      } catch {
        if (!cancelled) setError("Erreur de chargement des données.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadPrices();
    return () => {
      cancelled = true;
    };
  }, [crypto.id]);

  // Filtre la série sur la période [dateDebut, dateFin] et lance le calcul.
  const result: SimulationResult | null = useMemo(() => {
    if (!prices) return null;
    const start = new Date(dateDebut).getTime();
    const end = new Date(dateFin).getTime();
    const slice = prices.filter(([t]) => t >= start && t <= end);
    if (slice.length < 2) return null;
    try {
      return simulate({ montant, frequence, prices: slice });
    } catch {
      return null;
    }
  }, [prices, dateDebut, dateFin, montant, frequence]);

  // Bornes des dates disponibles dans le jeu de données.
  const bounds = useMemo(() => {
    if (!prices?.length) return null;
    return { min: toInputDate(prices[0][0]), max: toInputDate(prices[prices.length - 1][0]) };
  }, [prices]);

  const positif = (result?.plusValue ?? 0) >= 0;
  const freqLabel =
    frequence === "once"
      ? "versement"
      : { daily: "jours", weekly: "semaines", monthly: "mois" }[frequence];

  return (
    <div className={embedded ? "min-w-0" : "mx-auto min-w-0 max-w-6xl"}>
      {/* En-tête simulateur */}
      <div className="pt-6 text-center">
        <div className="flex items-center justify-center gap-5">
          <span className="hidden h-0.5 w-20 sm:block sx-title-rule" />
          <h1 className="section-title text-xl tracking-normal sm:text-4xl sm:[letter-spacing:var(--ls-title)]">
            Simulateur Crypto
          </h1>
          <span className="hidden h-0.5 w-20 sm:block sx-title-rule sx-title-rule--right" />
        </div>
        <p className="mt-7 text-xl font-medium text-sx-blue-bright sm:text-2xl">
          Mesurez la performance d&rsquo;un investissement crypto, en DCA ou en
          une fois.
        </p>
        <p className="mx-auto mt-7 max-w-3xl text-base leading-relaxed text-sx-text">
          Calculez vos gains et performances pour un investissement crypto à
          partir de données de marché historiques. Bitcoin, Ethereum et des
          milliers de cryptomonnaies.
        </p>
      </div>

      {/* Avertissement risque (Callout officiel) */}
      <Callout
        tone="info"
        className="mx-auto mt-10 max-w-4xl"
        icon={<IconInfo className="h-5 w-5" />}
      >
        Les crypto-actifs sont très volatils et comportent un risque de perte en
        capital, partielle ou totale. Cet outil est pédagogique : il illustre
        des scénarios passés et ne préjuge en rien des performances futures.
      </Callout>

      {/* Grille inputs / résultats — colonne résultats plus large (comme l'original) */}
      <div className="mt-14 grid gap-x-10 gap-y-6 lg:grid-cols-[0.85fr_1.15fr]">
        {/* Colonne inputs */}
        <div className="space-y-6">
          <CryptoSelect
            label="Actif numérique"
            value={crypto}
            onChange={setCrypto}
          />

          <Field
            label={frequence === "once" ? "Montant investi" : "Montant par versement"}
            hint={
              frequence === "once"
                ? "Somme investie en une seule fois, en euros."
                : "Somme investie à chaque versement, en euros (ex : 100 € par mois)."
            }
            suffix="EUR"
          >
            <input
              type="number"
              min={1}
              value={montant}
              onChange={(e) => setMontant(Math.max(0, Number(e.target.value)))}
              className="w-full bg-transparent text-[1.375rem] font-medium text-sx-text outline-none tnum"
            />
          </Field>

          <Field
            label="Fréquence d'investissement"
            hint="« En une fois » : tout investi au départ. Quotidienne / hebdo / mensuelle : investissement régulier (DCA), qui lisse le prix d'achat dans le temps."
          >
            <select
              value={frequence}
              onChange={(e) => setFrequence(e.target.value as Frequence)}
              className="w-full appearance-none bg-transparent text-[1.375rem] font-medium text-sx-text outline-none tnum [&>option]:bg-sx-panel [&>option]:text-sx-text"
            >
              {FREQUENCES.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </Field>

          <div className="grid grid-cols-2 gap-5">
            <Field label="Depuis le">
              <input
                type="date"
                value={dateDebut}
                min={bounds?.min}
                max={dateFin}
                onChange={(e) => {
                  datesTouched.current = true;
                  setDateDebut(e.target.value);
                }}
                className="w-full bg-transparent text-base font-medium text-sx-text outline-none [color-scheme:dark]"
              />
            </Field>
            <Field label="Jusqu'au">
              <input
                type="date"
                value={dateFin}
                min={dateDebut}
                max={bounds?.max}
                onChange={(e) => {
                  datesTouched.current = true;
                  setDateFin(e.target.value);
                }}
                className="w-full bg-transparent text-base font-medium text-sx-text outline-none [color-scheme:dark]"
              />
            </Field>
          </div>

          {bounds && (
            <p className="text-xs text-sx-faint">
              Données disponibles du {new Date(bounds.min).toLocaleDateString("fr-FR")} au{" "}
              {new Date(bounds.max).toLocaleDateString("fr-FR")}
              {source === "fallback" && " — jeu de démonstration (API momentanément indisponible)"}
              .
            </p>
          )}

          <div className="flex flex-wrap gap-3 pt-1">
            <Button variant="primary">Enregistrer la simulation</Button>
            <Button variant="white">Partager mes résultats</Button>
          </div>
        </div>

        {/* Colonne résultats */}
        <div className="min-w-0">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="h-6 w-1 rounded-full bg-sx-blue" />
              <h2 className="text-xl font-semibold text-sx-text">Vos résultats</h2>
            </div>
            {/* Bouton décoratif "Voir notre vidéo tuto" (comme l'original) */}
            <Button variant="primary" iconLeft={<IconPlay className="h-[18px] w-[18px]" />}>
              Voir notre vidéo tuto
            </Button>
          </div>

          {loading && (
            <div className="grid h-64 place-items-center rounded-2xl bg-sx-card/60 text-sm text-sx-muted ring-1 ring-white/5">
              Chargement des données de marché…
            </div>
          )}

          {!loading && error && (
            <div className="grid h-64 place-items-center rounded-2xl bg-sx-card/60 p-6 text-center text-sm text-sx-muted ring-1 ring-white/5">
              {error}
            </div>
          )}

          {!loading && !error && result && (
            <div className="space-y-4">
              {/* Carte synthèse texte */}
              <div className="sx-card rounded-2xl p-5">
                <p className="text-sm leading-relaxed text-sx-muted">
                  En investissant{" "}
                  <strong className="text-sx-text">{fmtEUR(montant)}</strong>
                  {frequence === "once"
                    ? " en une fois "
                    : ` tous les ${
                        frequence === "daily" ? "jours" : frequence === "weekly" ? "semaines" : "mois"
                      } `}
                  sur <strong className="text-sx-text">{crypto.name}</strong>, vous auriez
                  investi au total{" "}
                  <strong className="text-sx-text">{fmtEUR(result.montantInvesti)}</strong>{" "}
                  pour une valeur finale de{" "}
                  <strong className="text-sx-text">{fmtEUR(result.valeurFinale)}</strong>,
                  soit une {positif ? "plus-value" : "moins-value"} de{" "}
                  <strong className={positif ? "text-sx-green" : "text-sx-red"}>
                    {fmtEUR(result.plusValue)}
                  </strong>
                  .
                </p>
              </div>

              {/* Deux grosses cartes : Valeur finale + Performance (chiffre géant) */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <BigMetric label="Valeur finale" value={fmtEUR(result.valeurFinale)} />
                <BigMetric
                  label="Performance"
                  value={fmtPctSigned(result.performancePct)}
                  color={positif ? "text-sx-green" : "text-sx-red"}
                  hint="Rendement total de la simulation : (valeur finale − montant investi) ÷ montant investi."
                />
              </div>

              {/* Répartition investi (cyan) / plus-value (or) */}
              <div className="sx-card rounded-2xl p-5">
                <div className="mb-3 flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-sx-muted">
                    <span className="h-2.5 w-2.5 rounded-full bg-sx-cyan" /> Investi
                  </span>
                  <span className="font-semibold text-sx-cyan">
                    {fmtEUR(result.montantInvesti)}
                  </span>
                </div>
                <Repartition investi={result.montantInvesti} valeur={result.valeurFinale} />
                <div className="mt-3 flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-sx-muted">
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${positif ? "bg-sx-gold" : "bg-sx-red"}`}
                    />
                    {positif ? "Plus-value" : "Moins-value"}
                  </span>
                  <span className={`font-semibold ${positif ? "text-sx-gold" : "text-sx-red"}`}>
                    {fmtEUR(result.plusValue)}
                  </span>
                </div>
              </div>

              {/* Secondaires */}
              <div className="grid grid-cols-2 gap-4">
                <Metric
                  label={`Acquis (${crypto.symbol})`}
                  value={fmtNum8(result.quantite)}
                  hint={`Quantité totale de ${crypto.name} accumulée sur l'ensemble des versements.`}
                />
                <Metric
                  label="Prix moyen d'acquisition"
                  value={fmtEUR(result.prixMoyen)}
                  hint="Prix unitaire moyen payé : montant investi ÷ quantité acquise. En DCA, il lisse les variations du marché."
                />
                <Metric
                  label="Versements"
                  value={`${result.nbVersements} ${frequence === "once" ? "versement" : freqLabel}`}
                />
                <Metric label="Prix actuel" value={fmtEUR(result.prixFin)} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Graphique historique */}
      {!loading && !error && result && (
        <>
          <div className="sx-card mt-6 min-w-0 rounded-2xl p-3 sm:p-5">
            <div className="mb-4 flex items-center gap-3">
              <span className="h-6 w-1 rounded-full bg-sx-blue" />
              <h2 className="text-xl font-semibold text-sx-text">Historique</h2>
            </div>
            <SimulationChart serie={result.serie} />
          </div>

          {/* Avertissement sous le graphique (Callout, texte de l'original) */}
          <Callout
            tone="info"
            className="mt-6"
            icon={<IconInfo className="h-5 w-5" />}
          >
            L&rsquo;illustration graphique et les résultats présentés ne
            constituent pas un indicateur fiable quant aux performances futures de
            vos investissements. Ils ont seulement pour but d&rsquo;illustrer les
            mécanismes de votre investissement sur la durée de placement.
            L&rsquo;évolution de la valeur de votre investissement pourra
            s&rsquo;écarter de ce qui est affiché, à la hausse comme à la baisse.
            Les gains et les pertes peuvent dépasser les montants affichés,
            respectivement, dans les scénarios les plus favorables et les plus
            défavorables. En poursuivant votre navigation, vous reconnaissez avoir
            pris connaissance de cet avertissement, et l&rsquo;avoir compris.
          </Callout>
        </>
      )}
    </div>
  );
}

/** Carte secondaire compacte (label en haut, valeur moyenne).
 *  Pastille (i) affichée uniquement si une définition `hint` est fournie. */
function Metric({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="sx-card min-w-0 rounded-2xl p-5">
      <p className="flex items-center gap-1.5 text-sm text-sx-muted">
        {label} {hint && <InfoBadge text={hint} />}
      </p>
      <p className="mt-1.5 truncate text-xl font-bold text-sx-text">{value}</p>
    </div>
  );
}

/** Grande carte : chiffre géant + unité éventuelle sur la ligne du dessous. */
function BigMetric({
  label,
  value,
  color = "text-sx-text",
  hint,
}: {
  label: string;
  value: string;
  color?: string;
  hint?: string;
}) {
  return (
    <div className="sx-card min-w-0 rounded-2xl p-5">
      <p className="flex items-center gap-1.5 text-sm text-sx-muted">
        {label} {hint && <InfoBadge text={hint} />}
      </p>
      <p className={`tnum mt-3 truncate text-2xl font-bold leading-tight sm:text-[1.7rem] ${color}`}>
        {value}
      </p>
    </div>
  );
}

function Repartition({ investi, valeur }: { investi: number; valeur: number }) {
  // Largeur de la part investie dans la valeur totale (cap à 100%).
  const total = Math.max(valeur, investi, 1);
  const partInvesti = Math.min(100, (investi / total) * 100);
  const gainPositif = valeur >= investi;
  return (
    <div className="flex h-3 w-full gap-[3px]">
      <div
        className="h-full rounded-full bg-sx-cyan"
        style={{ width: `${partInvesti}%` }}
      />
      <div
        className={`h-full flex-1 rounded-full ${gainPositif ? "bg-sx-gold" : "bg-sx-red"}`}
      />
    </div>
  );
}

function fmtNum8(n: number): string {
  return new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 8 }).format(n);
}
