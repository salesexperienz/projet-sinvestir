# Simulateur Crypto — S'investir Simulateurs

[![CI](https://github.com/salesexperienz/projet-sinvestir/actions/workflows/ci.yml/badge.svg)](https://github.com/salesexperienz/projet-sinvestir/actions/workflows/ci.yml)

Transposition du **simulateur de plus-value crypto** de
[sinvestir.fr](https://sinvestir.fr/simulateur-crypto-monnaie/) au design et aux
standards de la suite d'outils [simulateurs.sinvestir.fr](https://simulateurs.sinvestir.fr/).

On reprend la **logique fonctionnelle** du simulateur crypto (investissement
one-shot ou DCA sur données de marché historiques) et on l'habille à
l'**identité visuelle** de la suite S'investir (thème navy/or, sidebar, Poppins).

---

## Lancer le projet

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # tests du moteur de calcul
npm run lint       # vérification ESLint
npm run build      # build de production
```

Version de Node recommandée : voir `.nvmrc` (`nvm use`).

- Page principale : `/`
- Version embarquable (iframe) : `/embed`

Aucune variable d'environnement n'est requise (les sources de prix sont
publiques et sans clé).

---

## Stack & justification

| Choix | Pourquoi |
|---|---|
| **Next.js 16 (App Router) + TypeScript** | Stack interne de S'investir → intégrabilité directe. |
| **Tailwind v4** | Itération rapide ; design tokens importés depuis le design system S'investir. |
| **Recharts** | Graphes légers, dépendance unique pour la dataviz. |
| **Vercel** | Déploiement attendu par S'investir ; build statique + route API serverless. |

Le simulateur est un **composant autonome** (`<CryptoSimulator />`) :
- réutilisable, peu de dépendances ;
- embarquable proprement via la route `/embed` (iframe) ;
- prêt à prendre la place du simulateur actuel dans la suite.

---

## Source des données de prix

- **Source principale : Fritzy Finance / CoinGecko** (`vs_currency=eur`,
  `days=max`), prix réels en euros natifs, **30 000+ cryptos**, historique long
  (depuis 2013), gratuit et sans clé. C'est **la source du simulateur d'origine**
  (qui s'appuie sur le widget tiers Fritzy) → concordance garantie avec l'outil
  de production. Récupéré côté serveur via `app/api/prices/route.ts` (cache 1 h).
  > Binance a été écartée : elle marche en local mais renvoie une erreur **451**
  > (blocage géographique) depuis les serveurs Vercel. Coinbase (~35 cryptos EUR)
  > et Kraken (historique court) ne couvraient pas le périmètre. Leçon : toute API
  > doit être testée depuis la prod (région US), pas seulement en local.
- **Filet de sécurité : jeu figé local** (`src/data/fallback-prices.json`, 7
  cryptos) servi automatiquement si la source est indisponible → la démo
  fonctionne en toutes circonstances.
- **Convention de calcul** : achats **et** valorisation au **prix d'ouverture**
  du jour — c'est la convention de l'outil d'origine. Résultats reproduits au
  centième près (écart < 0,1 % sur les scénarios testés).

---

## Logique fonctionnelle (transposée de l'original)

Entrées : **actif** (BTC, ETH, BNB, XRP, SOL, ADA, DOGE… + autres en ligne),
**montant**, **fréquence** (en une fois / quotidienne / hebdo / mensuelle = DCA),
**période** (depuis / jusqu'au).

Sorties (identiques à l'original) : **valeur finale**, **performance %**,
**acquis** (quantité), **prix moyen d'acquisition**, **versements**,
**prix actuel**, répartition investi / plus-value, et deux graphiques
(**Historique** double-axe + **Gains / Pertes** vert/rouge).

Le cœur de calcul est une fonction pure et testée : `src/lib/simulate.ts`.

---

## Structure

```
src/
  app/
    page.tsx               # page complète (sidebar + simulateur + footer)
    embed/page.tsx         # version embarquable (iframe)
    api/prices/route.ts    # prix Fritzy/CoinGecko EUR + fallback figé
    api/search/route.ts    # recherche de cryptos (Fritzy, triée par market cap)
    globals.css            # tokens design system S'investir + Poppins
    ds-tokens/             # tokens officiels (colors, effects, typography, spacing)
  components/
    CryptoSimulator.tsx    # composant autonome principal
    SimulationChart.tsx    # graphes Historique + Gains/Pertes (Recharts)
    Sidebar / Topbar / Footer / Logo
    ui/                    # Button, Callout, Field, InfoBadge (portés du DS)
  lib/
    simulate.ts            # moteur de calcul (pur)
    simulate.test.ts       # tests (one-shot, DCA, moins-value, downsampling)
    types.ts / format.ts
  data/
    cryptos.ts             # liste de cryptos par défaut (ids CoinGecko)
    fallback-prices.json   # jeu figé 7 cryptos (vrais prix EUR)
```

---

## Partis pris

- **Fidélité au design system officiel** : tokens, Poppins et composants
  (Button, Callout, Field) repris du design system S'investir fourni.
- **Données réelles** plutôt que simulées : prix EUR Fritzy/CoinGecko (la source
  de l'original), convention de l'original (prix d'ouverture) → mêmes chiffres que
  l'outil de production.
- **Robustesse démo** : fallback local pour ne jamais afficher un simulateur cassé.
- **Authentification, sauvegarde et partage** ne sont pas implémentés (hors
  périmètre du test) — les boutons correspondants sont décoratifs, comme le
  bouton « Voir notre vidéo tuto ».

---

## Pistes d'amélioration proposées

- **Persistance & partage** : brancher les boutons « Enregistrer » et « Partager »
  (aujourd'hui décoratifs) sur le standard déjà en place dans les autres
  simulateurs de la suite (sauvegarde liée au compte + lien partageable + image).
- **Graphe par défaut simplifié** : une seule échelle € (valeur vs investi) pour
  les débutants, le graphe double-axe actuel passant en option « détaillée ».
- **Raccourcis de saisie** : montants (50/100/500 €) et périodes (1 an / 5 ans /
  depuis le début) en un clic.
- **Exploitation business** : remontée des simulations dans le CRM + scoring IA
  pour qualifier les prospects (détaillé dans le dossier technique).
- **Tests E2E** (Playwright) sur les parcours clés en plus des tests unitaires
  du moteur.

> Détail complet du making-of et des recommandations :
> [`DOSSIER-TECHNIQUE-ET-RECOMMANDATIONS.md`](./DOSSIER-TECHNIQUE-ET-RECOMMANDATIONS.md).
