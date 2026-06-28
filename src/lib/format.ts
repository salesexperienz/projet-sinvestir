const eur = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const eur0 = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

const num = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 });

const pct = new Intl.NumberFormat("fr-FR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const fmtEUR = (n: number) => eur.format(n);
export const fmtEUR0 = (n: number) => eur0.format(n);
export const fmtNum = (n: number) => num.format(n);
export const fmtPct = (n: number) => `${pct.format(n)} %`;
export const fmtPctSigned = (n: number) =>
  `${n >= 0 ? "+" : ""}${pct.format(n)} %`;

export const fmtDate = (ts: number) =>
  new Date(ts).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

/** Pour les <input type="date"> (yyyy-mm-dd) */
export const toInputDate = (ts: number) =>
  new Date(ts).toISOString().slice(0, 10);
