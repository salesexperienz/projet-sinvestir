import Image from "next/image";

/** Pied de page : carte "Formation offerte" + disclaimer + copyright. */
export function Footer() {
  return (
    <footer className="mt-16">
      {/* CTA Formation offerte */}
      <div
        className="p-8 sm:p-10"
        style={{
          background: "var(--surface-elevated)",
          backgroundImage: "var(--gradient-card)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-xl)",
          boxShadow: "var(--ring-card), var(--shadow-md)",
        }}
      >
        <div className="flex flex-col items-start gap-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-xl">
            <h3 className="text-2xl font-semibold text-sx-text sm:text-3xl">
              Accédez à notre Formation Offerte
            </h3>
            <p className="mt-4 text-base leading-relaxed text-sx-muted">
              Comment investir pour protéger votre avenir financier et vous
              générer des revenus passifs (même en partant de zéro et sans
              connaissance).
            </p>
            <a
              href="https://simulateurs.sinvestir.fr/formation-offerte"
              target="_blank"
              rel="noreferrer"
              className="mt-7 inline-flex items-center justify-center rounded-full px-10 py-3.5 text-base font-semibold text-white transition-[filter] hover:brightness-110"
              style={{
                background:
                  "linear-gradient(120deg, #3a6fe0 0%, #2a55c4 50%, #16265f 100%)",
                boxShadow: "0 6px 16px rgba(0, 0, 0, 0.35)",
              }}
            >
              Accéder à la formation
            </a>
          </div>

          {/* Vignette FORMATION OFFERTE (visuel officiel) */}
          <Image
            src="/formation-offerte-v2.png"
            alt="Formation offerte S'investir"
            width={406}
            height={382}
            className="h-40 w-40 shrink-0"
          />
        </div>
      </div>

      {/* Séparateur entre la carte Formation et le disclaimer */}
      <div className="mx-auto mt-12 h-px max-w-5xl bg-white/[0.08]" />

      {/* Disclaimer */}
      <p className="mx-auto mt-10 max-w-5xl text-center text-sm leading-snug text-sx-faint">
        Les simulateurs proposés sont mis à disposition gratuitement, à des fins
        exclusivement pédagogiques et informatives. Ils ont pour but d&rsquo;aider
        les utilisateurs à mieux comprendre certaines notions ou à estimer des
        situations selon les informations saisies. Ils ne constituent en aucun
        cas un conseil en investissement, en fiscalité ou une recommandation
        personnalisée. Investir comporte des risques, y compris de perte en
        capital. Les performances passées ne préjugent en rien des performances
        futures. Les résultats obtenus ne doivent pas être interprétés comme des
        recommandations personnalisées ou des garanties de performance. Ils sont
        purement indicatifs et peuvent varier en fonction des données saisies.
        Chaque utilisateur demeure seul responsable de l&rsquo;usage qu&rsquo;il
        fait des résultats obtenus par le biais des simulateurs.
      </p>

      <div className="mt-10 overflow-x-auto border-t border-white/[0.06] pt-8 pb-6 text-center">
        <span className="whitespace-nowrap text-sm text-sx-text sm:text-base">
          Copyright © 2026 &nbsp;|&nbsp; CGVU &nbsp;|&nbsp; Mentions légales
          &nbsp;|&nbsp; Politique de confidentialité &nbsp;|&nbsp; Notice
          simulateur &nbsp;|&nbsp; Création PULSION STUDIO
        </span>
      </div>
    </footer>
  );
}
