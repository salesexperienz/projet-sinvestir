import { CryptoSimulator } from "@/components/CryptoSimulator";

export const metadata = {
  title: "Simulateur Crypto — Aperçu intégré | S'investir",
};

/**
 * Version embarquable (iframe) : le simulateur seul, sans sidebar ni footer.
 * Pensé pour être intégré proprement depuis sinvestir.fr.
 *   <iframe src="https://<domaine>/embed" width="100%" height="900" />
 */
export default function EmbedPage() {
  return (
    <main className="px-4 py-8 sm:px-6">
      <CryptoSimulator embedded />
    </main>
  );
}
