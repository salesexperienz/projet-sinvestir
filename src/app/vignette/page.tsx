import { SimulatorCard } from "@/components/SimulatorCard";

export const metadata = {
  title: "Vignette simulateur Crypto — Intégration suite | S'investir",
};

/** Autres outils de la suite, en contexte (grisés) autour de la vignette crypto. */
const AUTRES = [
  "Simulateur d’intérêts composés",
  "Simulateur d’inflation",
  "Simulateur d’impact des frais",
  "Simulateur de crédit immobilier",
  "Simulateur F.I.R.E",
  "Simulateur coût par ordre (PEA)",
  "Simulateur Financement d’un véhicule",
];

/**
 * Aperçu de la vignette crypto telle qu'elle s'insérerait dans la grille de
 * simulateurs.sinvestir.fr/les-simulateurs. Carte crypto active (1re) +
 * emplacements de contexte (grisés) reprenant la même structure de carte.
 */
export default function VignettePage() {
  return (
    <main
      className="min-h-screen px-4 py-14 sm:px-8"
      style={{ background: "#00020a" }}
    >
      <div className="mx-auto max-w-[1600px]">
      <div className="text-center">
        <span className="inline-block rounded-full border border-sx-blue/40 px-5 py-1.5 text-sm text-sx-blue-bright">
          Nos simulateurs
        </span>
        <h1 className="mt-6 text-3xl font-semibold text-sx-text sm:text-4xl">
          Accédez à tous nos simulateurs
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-sx-muted">
          La vignette « Simulateur Crypto » telle qu&rsquo;elle s&rsquo;insère
          dans la grille de la suite. Seule la première carte est active.
        </p>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <SimulatorCard href="/" />

        {AUTRES.map((label, i) => (
          <a
            key={label}
            href="#"
            aria-disabled
            className="homepage-card-shell pointer-events-none opacity-45"
          >
            <div className="homepage-card-image">
              <div
                className="homepage-card-visual"
                style={{ filter: `hue-rotate(${i * 18 - 30}deg)` }}
              />
            </div>
            <div className="homepage-card-content">
              <h3 className="homepage-card-title">{label}</h3>
            </div>
          </a>
        ))}
      </div>
      </div>
    </main>
  );
}
