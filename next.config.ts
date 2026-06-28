import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Ce projet vit dans un dossier où d'autres lockfiles existent en amont :
  // on fixe explicitement la racine pour lever l'ambiguïté de Turbopack.
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
