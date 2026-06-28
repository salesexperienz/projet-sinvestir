"use client";

import { useState } from "react";
import {
  Area,
  CartesianGrid,
  Line,
  ComposedChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { SimulationPoint } from "@/lib/types";
import { fmtEUR0, fmtDate, fmtEUR } from "@/lib/format";

type Mode = "historique" | "gains";

// Couleurs des séries (reprises de l'outil d'origine)
const C_ACQUIS = "#e9b43c"; // or — quantité acquise
const C_INVESTI = "#8b6df0"; // violet — montant investi (escalier)
const C_VALEUR = "#7fb1ee"; // bleu clair — valeur du portefeuille
const C_PRIX = "#6e7997"; // gris — prix (désactivé par défaut)
const C_GAIN_POS = "#2bb673";
const C_GAIN_NEG = "#e5484d";

function TooltipBox({
  active,
  payload,
  label,
  mode,
}: {
  active?: boolean;
  payload?: { dataKey: string; value: number }[];
  label?: number;
  mode: Mode;
}) {
  if (!active || !payload?.length) return null;
  const get = (k: string) => payload.find((p) => p.dataKey === k)?.value ?? 0;
  const valeur = get("valeur");
  const investi = get("investi");
  const gain = valeur - investi;
  // La couleur de "Valeur" suit la ligne réelle : bleu ciel en mode Historique,
  // jaune en mode Gains/Pertes.
  const valeurColor = mode === "historique" ? C_VALEUR : C_ACQUIS;
  return (
    <div className="rounded-xl border border-white/10 bg-[#0b1525]/95 px-4 py-3 text-xs shadow-xl backdrop-blur">
      <p className="mb-2 font-medium text-sx-text">{fmtDate(label ?? 0)}</p>
      {mode === "historique" && (
        <Row color={C_ACQUIS} label="Acquis" value={get("acquis").toFixed(6)} />
      )}
      <Row color={valeurColor} label="Valeur" value={fmtEUR(valeur)} />
      <Row color={C_INVESTI} label="Investi" value={fmtEUR(investi)} />
      {mode === "gains" && (
        <Row
          color={gain >= 0 ? C_GAIN_POS : C_GAIN_NEG}
          label="Gains / Pertes"
          value={`${gain >= 0 ? "+" : ""}${fmtEUR(gain)}`}
        />
      )}
    </div>
  );
}

function Row({ color, label, value }: { color: string; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-6 py-0.5">
      <span className="flex items-center gap-2 text-sx-muted">
        <span className="h-2 w-2 rounded-full" style={{ background: color }} />
        {label}
      </span>
      <span className="font-medium text-sx-text">{value}</span>
    </div>
  );
}

export function SimulationChart({ serie }: { serie: SimulationPoint[] }) {
  const [mode, setMode] = useState<Mode>("historique");
  // Le prix est désactivé par défaut (comme dans l'original) ; cliquable.
  const [showPrix, setShowPrix] = useState(false);

  const data = serie.map((p) => ({
    date: p.date,
    investi: p.investi,
    valeur: p.valeur,
    acquis: p.acquis,
    prix: p.prix,
    gain: Math.round((p.valeur - p.investi) * 100) / 100,
  }));

  // Domaines d'axes ajustés au max réel (évite des échelles trop larges qui
  // écrasent les courbes sur les longues périodes).
  const maxAcquis = Math.max(...data.map((d) => d.acquis), 0);
  const maxEur = Math.max(...data.map((d) => Math.max(d.valeur, d.investi)), 0);

  // Offset du zéro pour l'aire Gains/Pertes (vert au-dessus, rouge en dessous).
  const gains = data.map((d) => d.gain);
  const gMax = Math.max(0, ...gains);
  const gMin = Math.min(0, ...gains);
  const zeroOffset = gMax === gMin ? 50 : (gMax / (gMax - gMin)) * 100;
  const lastGain = gains[gains.length - 1] ?? 0;

  const xAxis = (
    <XAxis
      dataKey="date"
      tickFormatter={(t) =>
        new Date(t).toLocaleDateString("fr-FR", { month: "short", year: "2-digit" })
      }
      stroke="#5b6c87"
      tick={{ fontSize: 11 }}
      minTickGap={48}
      tickLine={false}
      axisLine={{ stroke: "#1e2a40" }}
    />
  );

  return (
    <div>
      {/* Toggle Historique | Gains / Pertes */}
      <div className="mb-5 flex justify-center">
        <div className="inline-flex rounded-full bg-[#0a1428] p-1 ring-1 ring-white/5">
          {(["historique", "gains"] as Mode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
                mode === m ? "bg-white/[0.08] text-sx-text" : "text-sx-faint hover:text-sx-muted"
              }`}
            >
              {m === "historique" ? "Historique" : "Gains / Pertes"}
            </button>
          ))}
        </div>
      </div>

      <div className="h-[380px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: 8, bottom: 0, left: 8 }}>
            <defs>
              <linearGradient id="valeurFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={C_VALEUR} stopOpacity={0.3} />
                <stop offset="100%" stopColor={C_VALEUR} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gainSplit" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={C_GAIN_POS} stopOpacity={0.5} />
                <stop offset={`${zeroOffset}%`} stopColor={C_GAIN_POS} stopOpacity={0.12} />
                <stop offset={`${zeroOffset}%`} stopColor={C_GAIN_NEG} stopOpacity={0.12} />
                <stop offset="100%" stopColor={C_GAIN_NEG} stopOpacity={0.5} />
              </linearGradient>
              <linearGradient id="gainStroke" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={C_GAIN_POS} />
                <stop offset={`${zeroOffset}%`} stopColor={C_GAIN_POS} />
                <stop offset={`${zeroOffset}%`} stopColor={C_GAIN_NEG} />
                <stop offset="100%" stopColor={C_GAIN_NEG} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#1e2a40" vertical={false} />
            {xAxis}

            {/* Axe € (droite, partagé par toutes les séries en euros) */}
            <YAxis
              yAxisId="eur"
              orientation="right"
              stroke="#5b6c87"
              tick={{ fontSize: 11 }}
              tickFormatter={(v) => fmtEUR0(v as number)}
              width={64}
              tickLine={false}
              axisLine={false}
              domain={mode === "gains" ? ["auto", "auto"] : [0, Math.ceil(maxEur * 1.05)]}
            />

            {mode === "historique" ? (
              <>
                {/* Axe quantité (gauche) — pour "Acquis" */}
                <YAxis
                  yAxisId="qty"
                  orientation="left"
                  stroke="#5b6c87"
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v) => (v as number).toFixed(3)}
                  width={56}
                  tickLine={false}
                  axisLine={false}
                  domain={[0, maxAcquis * 1.05]}
                />
                <Tooltip content={<TooltipBox mode="historique" />} />

                {/* Valeur (bleu clair, aire) — axe € */}
                <Area
                  isAnimationActive={false}
                  yAxisId="eur"
                  type="monotone"
                  dataKey="valeur"
                  stroke={C_VALEUR}
                  strokeWidth={2}
                  fill="url(#valeurFill)"
                  name="Valeur"
                />
                {/* Investi (violet escalier) — axe € */}
                <Line
                  isAnimationActive={false}
                  yAxisId="eur"
                  type="stepAfter"
                  dataKey="investi"
                  stroke={C_INVESTI}
                  strokeWidth={2}
                  dot={false}
                  name="Investi"
                />
                {/* Acquis (or escalier) — axe quantité */}
                <Line
                  isAnimationActive={false}
                  yAxisId="qty"
                  type="stepAfter"
                  dataKey="acquis"
                  stroke={C_ACQUIS}
                  strokeWidth={2}
                  dot={false}
                  name="Acquis"
                />
                {/* Prix (gris) — axe €, masqué par défaut */}
                {showPrix && (
                  <Line
                  isAnimationActive={false}
                    yAxisId="eur"
                    type="monotone"
                    dataKey="prix"
                    stroke={C_PRIX}
                    strokeWidth={1.5}
                    dot={false}
                    name="Prix"
                  />
                )}
              </>
            ) : (
              <>
                <Tooltip content={<TooltipBox mode="gains" />} />
                <ReferenceLine yAxisId="eur" y={0} stroke="#2f3b54" />
                {/* Valeur (or) */}
                <Line
                  isAnimationActive={false}
                  yAxisId="eur"
                  type="monotone"
                  dataKey="valeur"
                  stroke={C_ACQUIS}
                  strokeWidth={2}
                  dot={false}
                  name="Valeur"
                />
                {/* Investi (violet escalier) */}
                <Line
                  isAnimationActive={false}
                  yAxisId="eur"
                  type="stepAfter"
                  dataKey="investi"
                  stroke={C_INVESTI}
                  strokeWidth={2}
                  dot={false}
                  name="Investi"
                />
                {/* Prix (gris), masqué par défaut */}
                {showPrix && (
                  <Line
                  isAnimationActive={false}
                    yAxisId="eur"
                    type="monotone"
                    dataKey="prix"
                    stroke={C_PRIX}
                    strokeWidth={1.5}
                    dot={false}
                    name="Prix"
                  />
                )}
                {/* Gains / Pertes (aire bicolore) */}
                <Area
                  isAnimationActive={false}
                  yAxisId="eur"
                  type="monotone"
                  dataKey="gain"
                  stroke="url(#gainStroke)"
                  strokeWidth={2}
                  fill="url(#gainSplit)"
                  name="Gains / Pertes"
                />
              </>
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Légende cliquable (Prix activable comme dans l'original) */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-7 text-sm text-sx-muted">
        {mode === "historique" ? (
          <>
            <LegendChip color={C_ACQUIS} label="Acquis" />
            <LegendChip color={C_INVESTI} label="Investi" />
            <LegendToggle
              color={C_PRIX}
              label="Prix"
              active={showPrix}
              onClick={() => setShowPrix((v) => !v)}
            />
            <LegendChip color={C_VALEUR} label="Valeur" />
          </>
        ) : (
          <>
            <LegendChip color={C_ACQUIS} label="Valeur" />
            <LegendChip color={C_INVESTI} label="Investi" />
            <LegendToggle
              color={C_PRIX}
              label="Prix"
              active={showPrix}
              onClick={() => setShowPrix((v) => !v)}
            />
            <LegendChip
              color={lastGain >= 0 ? C_GAIN_POS : C_GAIN_NEG}
              label="Gains / Pertes"
            />
          </>
        )}
      </div>
    </div>
  );
}

function LegendChip({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-2">
      <span className="h-1 w-5 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}

function LegendToggle({
  color,
  label,
  active,
  onClick,
}: {
  color: string;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 transition-opacity ${active ? "" : "opacity-45"}`}
    >
      <span className="h-1 w-5 rounded-full" style={{ background: color }} />
      {label}
    </button>
  );
}
