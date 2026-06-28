# Dossier technique & recommandations — Simulateur crypto S'investir

> Ce document a deux objectifs :
> 1. **Documenter** comment le simulateur a été reconstruit (les étapes, les
>    pièges, les choix) ;
> 2. **Recommander** des évolutions, côté expérience/design d'abord, côté
>    business ensuite.
>
> Écrit en langage clair, avec des encarts techniques pour qui veut creuser.

---

# Partie 1 — Documentation : comment le simulateur a été construit

L'objectif de départ : reprendre le **simulateur crypto** de S'investir et
l'habiller au **design de la suite** `simulateurs.sinvestir.fr`, avec une démo
en ligne qui fonctionne. Voici le chemin réel, pièges compris.

## 1.1 Le design : reproduire la suite au pixel

**Ce qu'on a fait.** On est parti du design system officiel de S'investir
(couleurs, police Poppins, composants) pour reconstruire l'interface : la barre
latérale, le bandeau, les cartes de résultats, le pied de page, et la charte
sombre premium (bleu nuit, accents bleu et or).

**Les difficultés rencontrées :**

- **Les graphiques qui disparaissent.** La librairie de graphiques (Recharts)
  se « vidait » dès qu'on lui appliquait certains styles. Il a fallu comprendre
  qu'il ne faut **jamais** forcer la largeur du conteneur du graphe ni le couper
  (`overflow`), sinon le graphe ne se dessine plus.
  > _Technique :_ garder un simple `div h-[380px] w-full` + `ResponsiveContainer
  > width="100%" height="100%"`, et `isAnimationActive={false}` pour un rendu
  > fiable. Ne pas mettre de CSS global sur `.recharts-wrapper`.

- **La vignette du simulateur (carte de la grille).** Plusieurs allers-retours
  pour coller au vrai composant de la suite : ce n'est pas une image en haut +
  du texte dessous, mais un **visuel plein cadre avec le texte en surimpression
  en bas**. Il a fallu reprendre les bonnes proportions (la carte était trop
  petite, puis trop grande) et la bonne couleur de fond (`#00020a`).
  > _Technique :_ piège **Tailwind v4** — les classes CSS personnalisées sont
  > vidées si elles ne sont pas dans un `@layer components`. C'est ce qui
  > expliquait que le style de la vignette ne s'appliquait pas.

- **L'affichage mobile.** Le graphe débordait légèrement sur petit écran
  (390 px). Corrigé sans toucher au graphe lui-même (en laissant la carte parente
  se réduire et en réduisant la marge sur mobile), puis **vérifié dans un vrai
  navigateur** — car les outils automatiques rendent mal ce type de graphe.

## 1.2 La donnée : le vrai feuilleton de l'API de prix

C'est ici qu'a eu lieu le travail le plus important — et le moins visible. Pour
qu'un simulateur soit crédible, il faut de **vrais prix**, en **euros**, sur un
**long historique**. Trouver la bonne source a demandé plusieurs essais.

| Source testée | Le problème rencontré |
|---|---|
| **Binance** | Marchait en local, mais **bloquée en production** : depuis les serveurs d'hébergement (Vercel), Binance renvoie une erreur « **451 — accès restreint selon la localisation** ». Résultat : en ligne, le simulateur affichait en réalité des **données figées** de secours, jamais les vrais prix. Piège sournois car invisible en test local. |
| **CoinGecko (gratuit, direct)** | Limite l'historique à **365 jours** et bloque les requêtes trop larges (erreur 401). Insuffisant pour un simulateur qui doit remonter à 2017-2020. |
| **Coinbase** | Fonctionne depuis Vercel et donne des prix en euros, mais seulement **~35 cryptos en EUR**. Incompatible avec l'exigence de reprendre toutes les cryptos de l'original. |
| **Kraken** | Fonctionne aussi, mais historique court (~720 jours) et plus lent. |

**Le déclic.** En inspectant le simulateur d'origine, on a découvert qu'il
n'est **pas développé en interne** : c'est un widget tiers, **Fritzy Finance**,
qui s'appuie lui-même sur **CoinGecko**. C'est cette source qui alimente les
milliers de cryptos et les prix de l'original.

**Le choix final : Fritzy / CoinGecko.** C'est la meilleure réponse à tous les
critères :

- ✅ **30 000+ cryptos** disponibles (le fameux « 7 000+ ») ;
- ✅ **prix en euros natifs** (aucune conversion qui fausserait les chiffres) ;
- ✅ **historique long** (depuis 2013) ;
- ✅ **fonctionne depuis Vercel** (contrairement à Binance) ;
- ✅ **c'est la source de l'original** → fidélité maximale.

> _Technique :_ endpoints utilisés —
> `digital-assets.fritzy.finance/coins/list` (catalogue),
> `/coins/markets?vs_currency=eur` (top par capitalisation),
> `/coins/{id}/market_chart?vs_currency=eur&days=max` (historique).
> **Leçon clé : toute API doit être testée depuis le serveur de production
> (région US), pas seulement en local** — c'est l'écart local/prod qui masquait
> le blocage Binance.

## 1.3 L'intégration et la recherche de cryptos

Comme il y a plus de 30 000 cryptos, un simple menu déroulant ne suffit plus
(on ne déroule pas 30 000 lignes). On a donc mis un **champ de recherche** :
on tape le nom, les résultats s'affichent en direct.

> _Technique :_ piège de pertinence — une recherche brute fait remonter des
> dizaines de jetons obscurs portant le même symbole. On **trie par
> capitalisation** pour que les cryptos connues (Bitcoin, Ethereum, Solana…)
> apparaissent en tête. Un fallback de données figées reste en place si la
> source est momentanément indisponible.

## 1.4 La validation : des chiffres justes

Dernière étape, la plus rassurante : vérifier que **nos résultats correspondent
à ceux de l'original**, puisque c'est tout l'enjeu.

**Test réalisé** — Bitcoin, 1 000 €/mois, du 01/01/2021 au 01/01/2024 :

| Indicateur | Résultat |
|---|---|
| Investi | 37 000,00 € |
| Acquis | 1,33407588 BTC |
| Valeur finale | 51 015,34 € |
| Performance | +37,88 % |

Ces chiffres sont **identiques** entre notre simulateur et le calcul de
référence sur les données de la source. La bascule vers la même source que
l'original garantit cette concordance.

---

# Partie 2 — Recommandations : expérience, fonctionnalités, design

Pour chaque sujet : ce que faisait **l'ancienne version**, ce qu'on a **déjà
amélioré**, et ce qu'on peut **encore faire**.

## 2.1 La recherche de cryptos

- **Limite de l'ancienne version :** la recherche fait remonter en premier des
  jetons obscurs ; trouver une crypto connue n'est pas évident.
- **Ce qu'on a déjà amélioré :** tri par capitalisation → les cryptos connues
  arrivent en tête dès qu'on tape les premières lettres.
- **À améliorer encore :** ajouter les logos des cryptos et un petit libellé
  « top 10 » pour rassurer l'utilisateur.

## 2.2 La lecture du résultat

- **Limite de l'ancienne version :** le résultat clé (le gain) est noyé parmi
  plusieurs chiffres de même importance visuelle.
- **Ce qu'on a déjà amélioré :** une **phrase en langage clair** résume le
  résultat (« vous auriez investi X pour une valeur finale de Y, soit Z de
  plus-value ») et la **performance** est mise en avant.
- **À améliorer encore :** afficher le gain/perte en très grand, avec un
  sous-titre humain (« votre argent aurait presque triplé »).

## 2.3 La saisie (montant et période)

- **État actuel (identique à l'original) :** la période se cale automatiquement
  sur tout l'historique disponible de la crypto, mais les dates et le montant se
  saisissent à la main, sans repères rapides.
- **À améliorer :** des **raccourcis** en un clic — montants (50/100/500 €) et
  périodes (« 1 an / 5 ans / depuis le début ») — pour jouer avec l'outil sans
  taper de dates.

## 2.4 Les graphiques

**Le constat (fidèle à l'original).** Notre graphe « Historique » reprend
exactement celui de l'original : il affiche **4 courbes** (Acquis, Investi, Prix,
Valeur) sur **deux échelles verticales en même temps** :

- à **gauche**, une échelle en **quantité de crypto** (ex. 0 à 3,3 BTC) — pour la
  courbe « Acquis » ;
- à **droite**, une échelle en **euros** (ex. 0 à 340 000 €) — pour « Valeur »,
  « Investi », « Prix ».

**Pourquoi c'est une piste d'amélioration.** Quand on regarde une courbe qui
monte, on ne sait pas immédiatement **quelle échelle lire** (les BTC à gauche ?
les euros à droite ?). Et comme les deux échelles sont étirées différemment, deux
courbes peuvent sembler se croiser ou se rejoindre **sans que ça ait de sens**.
Les bonnes pratiques de visualisation déconseillent ce « double axe » pour un
public débutant.

**La proposition.** Garder le graphe actuel en option « détaillée », mais
proposer **par défaut une vue simplifiée** : une seule échelle en euros, avec
deux courbes seulement — la **valeur du portefeuille** et le **montant investi**.
L'écart visuel entre les deux, c'est le gain. Plus immédiat à comprendre, sans
rien retirer à ceux qui veulent le détail.

> _Note : ce point n'est pas un défaut de notre transposition — c'est fidèle à
> l'original. C'est une amélioration possible de l'expérience, surtout pour les
> débutants._

## 2.5 Enregistrer et partager une simulation

**Le constat.** Le simulateur crypto a bien deux boutons — « Enregistrer la
simulation » et « Partager mes résultats » — mais ils sont **décoratifs : ils ne
font rien**. Or **cette fonctionnalité existe déjà, et complètement, dans les
autres simulateurs de la suite** (intérêts composés, etc.) :

- « Enregistrer » ouvre une fenêtre **« Nom de ma simulation »** → sauvegarde
  rattachée au compte de l'utilisateur ;
- « Partager » ouvre une fenêtre **« Partager ma simulation »** avec un **lien
  partageable** (`simulateurs.sinvestir.fr/share/…`), un bouton **« Copier le
  lien »** et un bouton **« Télécharger l'image »**.

**La proposition.** Il ne s'agit donc pas d'inventer quelque chose, mais
d'**aligner le simulateur crypto sur le standard déjà en place dans la suite** :
brancher ces deux boutons sur le même système (sauvegarde nommée liée au compte +
lien de partage + image téléchargeable). C'est une question de **cohérence** :
aujourd'hui le crypto est le « maillon » qui ne propose pas ce que font les
autres outils.

**Pourquoi c'est important.** Côté utilisateur : il retrouve le comportement
qu'il connaît ailleurs sur le site. Côté business : un lien ou une image partagés
ramènent des visiteurs déjà intéressés (le « Télécharger l'image » est même un
petit moteur de visibilité sur les réseaux).

## 2.6 À NE PAS faire (pièges écartés)

| Piste | Pourquoi on l'écarte |
|---|---|
| **Projeter les gains futurs** | Risque réglementaire (AMF) : projeter du rendement crypto frôle le conseil financier déguisé. |
| **Animations de chargement / chiffres qui défilent** | Le calcul est instantané : ajouter une fausse attente dégrade l'usage. |
| **Comparer 2 scénarios côte à côte** | Casse l'affichage mobile et perd le débutant. |
| **Empiler des options cosmétiques** (mode sombre, export PDF…) | Aucun impact réel sur la compréhension. |

---

# Partie 3 — Recommandations business & stratégie commerciale

Au-delà de l'outil lui-même, voici comment le simulateur peut **mieux servir le
métier de S'investir** (le conseil en placements).

## 3.1 Le constat

Pour utiliser le simulateur, l'utilisateur **crée déjà un compte** (prénom,
email, consentement marketing). S'investir sait donc **qui** s'en sert. Mais ce
que la personne **simule** n'est aujourd'hui pas exploité. Quelqu'un teste
« 1 000 €/mois pendant 10 ans »… et rien ne se passe derrière.

> La vraie question n'est pas « comment récupérer plus de contacts » (déjà fait),
> mais **« comment exploiter ce que chacun simule pour qualifier et convertir »**.

## 3.2 Les 3 préconisations prioritaires

**1. Transformer chaque simulation en signal de qualification.**
Chaque simulation (crypto, montant, fréquence, horizon) remonte automatiquement
dans le CRM (HubSpot) via une automatisation (n8n) et enrichit la fiche du
contact. Une **IA de scoring** distingue le curieux (50 € une fois) du prospect
sérieux (1 000 €/mois sur 10 ans), qui déclenche une alerte vers un conseiller.

**2. Une IA qui explique le résultat et amorce la conversation.**
Pas pour décorer : pour donner envie de parler à un conseiller
(« vu votre profil, voici les 2 questions qu'un conseiller vous poserait »).
Personnalisable avec le prénom et l'historique, puisque l'utilisateur est connu.

**3. Comparer la crypto avec des placements classiques (Livret A, ETF…).**
Cela transforme un outil spéculatif en vrai support de conseil, aligné sur le
métier (diversification). Et l'intérêt pour la diversification est lui-même un
signal de qualification à renvoyer dans le CRM.

## 3.3 La logique d'ensemble

```
Inscription (déjà en place)
   ↓
Simulation = donnée de comportement
   ↓
Remontée auto dans le CRM + scoring (n8n + HubSpot + IA)
   ↓
IA qui explique + amorce la conversation
   ↓
Le conseiller sait qui rappeler, quand, et avec quel message
```

C'est ce qui transforme un outil gratuit en **machine à qualifier les futurs
clients**.

---

## Annexe — Sources et bonnes pratiques citées

- Les calculateurs interactifs convertissent nettement mieux que les contenus
  statiques (HubSpot, State of Marketing 2025).
- Comparaison multi-actifs et versement régulier vs versement unique = standards
  des bons calculateurs (Newhedge ; Vanguard : le versement unique bat le
  versement progressif 61-74 % du temps selon les périodes).
- Le graphique à double axe vertical est déconseillé en visualisation de données
  (ONS, PolicyViz) : risque de lecture trompeuse.
- L'IA générative qui résume des données financières en langage clair est une
  pratique fintech établie.
