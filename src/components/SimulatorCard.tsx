import Link from "next/link";

/**
 * Vignette du simulateur crypto, calquée sur le composant réel de la suite
 * (simulateurs.sinvestir.fr/les-simulateurs).
 *
 * Structure et noms de classes repris à l'identique de leur markup Vue :
 *   <a class="homepage-card-shell homepage-simulator-card" href="...">
 *     <… visuel …>
 *     <div class="homepage-card-content">
 *       <h3 class="homepage-card-title">…</h3>
 *       <p  class="homepage-card-description">…</p>
 *     </div>
 *   </a>
 *
 * Chez eux le visuel est une <img class="homepage-card-image"> (PNG dédié).
 * Faute de PNG crypto, on garde la même classe mais on dessine une
 * illustration SVG (courbe de cours qui monte/descend + glow bleu) → la carte
 * reste directement transposable dans leur grille (il suffira de remplacer le
 * visuel par leur <img>). Styles dans globals.css (.homepage-card-*).
 */
export function SimulatorCard({
  href = "https://simulateurs.sinvestir.fr/les-simulateurs/crypto",
}: {
  href?: string;
}) {
  return (
    <Link href={href} className="homepage-card-shell homepage-simulator-card">
      <div className="homepage-card-image">
        <CryptoVisual />
      </div>
      <div className="homepage-card-content">
        <h3 className="homepage-card-title">Simulateur Crypto</h3>
        <p className="homepage-card-description">
          Calculez ce qu&rsquo;aurait rapporté un investissement régulier en
          crypto-monnaie, sur la base des prix réels.
        </p>
      </div>
    </Link>
  );
}

/**
 * Illustration crypto, dans l'esprit 3D des vignettes de la suite :
 * barres volumétriques montantes (comme « impact des frais ») + une ligne de
 * cours lumineuse qui monte / descend / remonte par-dessus.
 */
function CryptoVisual() {
  // Barres 3D : x, hauteur (du bas). Croissance globale vers la droite.
  const bars = [
    { x: 36, h: 46 },
    { x: 96, h: 74 },
    { x: 156, h: 104 },
    { x: 216, h: 138 },
    { x: 276, h: 170 },
  ];
  const baseY = 196;
  const depth = 14; // profondeur de l'extrusion 3D
  const bw = 34; // largeur de barre

  return (
    <div className="homepage-card-visual">
      <svg
        viewBox="0 0 340 210"
        preserveAspectRatio="xMidYMid slice"
        className="homepage-card-visual-svg"
      >
        <defs>
          <linearGradient id="barFront" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3f6fd6" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#1b3578" stopOpacity="0.7" />
          </linearGradient>
          <linearGradient id="lineStroke" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#bcd6ff" />
            <stop offset="100%" stopColor="#ffffff" />
          </linearGradient>
        </defs>

        {/* Barres 3D (face avant + dessus + côté) */}
        {bars.map(({ x, h }, i) => {
          const top = baseY - h;
          return (
            <g key={i} opacity={0.92}>
              {/* côté droit */}
              <path
                d={`M${x + bw} ${top} l${depth} ${-depth} l0 ${h} l${-depth} ${depth} Z`}
                fill="#14275c"
                opacity="0.8"
              />
              {/* dessus */}
              <path
                d={`M${x} ${top} l${depth} ${-depth} l${bw} 0 l${-depth} ${depth} Z`}
                fill="#5d8df5"
                opacity="0.55"
              />
              {/* face avant */}
              <rect x={x} y={top} width={bw} height={h} fill="url(#barFront)" />
            </g>
          );
        })}

        {/* Ligne de cours : monte, redescend, remonte (glow puis trait net) */}
        <path
          d="M8 150 L60 120 L110 150 L160 96 L210 132 L262 70 L320 100"
          fill="none"
          stroke="#bcd6ff"
          strokeWidth="7"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.25"
        />
        <path
          d="M8 150 L60 120 L110 150 L160 96 L210 132 L262 70 L320 100"
          fill="none"
          stroke="url(#lineStroke)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Point lumineux sur le dernier sommet */}
        <circle cx="262" cy="70" r="4.5" fill="#ffffff" />
        <circle cx="262" cy="70" r="10" fill="#ffffff" opacity="0.25" />
      </svg>
    </div>
  );
}
