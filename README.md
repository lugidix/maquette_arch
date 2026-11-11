# Maison Aubier — Présentation d'un Triplex d'Architecte & Visite 3D

Projet architectural interactif haut de gamme présentant la **Maison Aubier**, un triplex contemporain d'exception (fictif) de 240 m² avec visite 3D immersive et vidéo d'ambiance.

Ce dépôt rassemble les **deux versions successives** développées pour explorer et perfectionner l'expérience utilisateur et le rendu architectural.

---

## 🧭 Navigation dans le dépôt

Le dépôt est organisé de manière à permettre à la fois une vue globale et une utilisation isolée de chaque version :

| Emplacement / Branche | Contenu | Idéal pour |
|---|---|---|
| **Branche `main`** *(actuelle)* | Monorepo contenant les dossiers [`/v1`](./v1) et [`/v2`](./v2) | Visualiser, comparer et auditer l'ensemble du projet |
| **Branche `v2`** | Version 2 isolée à la racine du dépôt | Déploiement direct en 1 clic (Vercel, Netlify, Cloudflare Pages) |
| **Branche `v1`** | Version 1 isolée à la racine du dépôt | Archive fonctionnelle de la première itération |

---

## 🏛️ Les deux versions en un coup d'œil

### 1. Version 1 — [`/v1`](./v1)
- **Concept :** Première itération orientée éditorial de luxe (`style-luxe-creme`), tons chauds et écrémés.
- **Stack :** Vite, Three.js, GSAP, Lenis, polices Fraunces & Inter.
- **Maison :** 240 m², 3 niveaux (Rez-de-jardin, Nuit, Ciel), 10 pièces + terrasse de 32 m².
- **Visite 3D :** Maquette procédurale Three.js coupée par niveau, caméra orbitale & fly-to dynamique vers les pièces sélectionnées, fiches descriptives par pièce.
- **Film HyperFrames local :** Composition vidéo de 14 s (`v1/film/`) rendue en MP4 (`v1/public/media/film.mp4`).

### 2. Version 2 — [`/v2`](./v2) *(Version de référence)*
- **Concept :** Refonte intégrale inspirée de la structure et de la mécanique d'interaction du site primé **Heron AI** (Awwwards SOTD / Bearplus).
- **Design & Exosquelette :** Grille architecturale rigide, règles graduées aux bords de l'écran, coordonnées de visée du curseur en temps réel, réticules de coin, filets pointillés, bandeau défilant technique.
- **Palette chromatique minérale :** Papier `#f3efe8`, encre olive `#262a1c`, terre cuite `#c4532d`.
- **Typographie de précision :** Archivo & JetBrains Mono.
- **Modélisation 3D refondue (`src/house.js`) :**
  - Murs nets et structurés, menuiseries et châssis fins.
  - Bardage bois ajouré au niveau supérieur (Ciel).
  - Pergola en acier et lattes de chêne ombragées sur la terrasse.
  - Parquet texturé, mobilier aux angles chanfreinés, jardin paysager avec bassin d'eau miroitant.
- **Dessins SVG générés dynamiquement (`src/drawings.js`) :**
  - Façade sud et 3 plans de niveau générés directement depuis la source de données unique (`WALLS` dans `src/data.js`).
  - Deux rendus graphiques disponibles : tracé technique au trait et lavis d'encre organique.
- **Intégration vidéo :** Film HyperFrames intégré dans le bloc de présentation architecturale.

---

## 🚀 Démarrage rapide

### Pour exécuter la Version 2 (Recommandée) :
```bash
cd v2
npm install
npm run dev
# Accessible sur http://localhost:5184
# Astuce : ajoutez ?static à l'URL pour inspecter la maquette figée dans son état final
```

### Pour exécuter la Version 1 :
```bash
cd v1
npm install
npm run dev
# Accessible sur http://localhost:5183
```

---

## 🎨 Génération d'images photoréalistes (Higgsfield)

Pour enrichir les fiches de pièces avec des rendus intérieurs photoréalistes (format 16:9, modèle Nano Banana), les prompts calibrés suivants sont documentés dans le projet :
- **Salon :** *Photorealistic interior photo, contemporary living room of a triplex house, 7-metre floor-to-ceiling south glazing with dark slim steel frames opening onto a garden and wooden deck, wide-plank light oak floor, sage green sofa, terracotta armchair, low dark oak coffee table, linen rug, cream walls, soft natural morning light, architectural photography, 24mm, calm and warm*
- **Cuisine :** *Photorealistic interior photo, contemporary kitchen, central island in pale limestone with oak base, matte sage green lacquered cabinets, three slim black pendant lights, light oak floor, large window, cream walls, soft daylight, minimalist architectural photography, 24mm*
- **Suite parentale :** *Photorealistic interior photo, calm contemporary master bedroom, oak bed with white linen and sage green throw, sage upholstered headboard, terracotta lounge chair, floor lamp, wide window overlooking trees, light oak floor, cream walls, built-in oak wardrobe, soft natural light, architectural photography, 24mm*
- **Lounge :** *Photorealistic interior photo, top-floor lounge with two fully glazed walls, sage green L-shaped sofa, dark oak coffee table, small bar with stone counter and two oak stools, light oak floor, rooftop terrace visible through the glass, golden hour light, contemporary architecture, 24mm*
- **Terrasse :** *Photorealistic photo, rooftop terrace of a contemporary house, wooden decking, frameless glass balustrade, black steel pergola with oak slats, linen outdoor sofa, low dark oak table, stone planters with greenery, wood-clad wall with large glazing, view over rooftops and trees, soft evening light, architectural photography*

Les rendus finaux sont destinés au dossier `public/media/rooms/<id>.jpg`.

---

## 📝 Journal de conception

Retrouvez le compte-rendu détaillé des choix techniques, des mesures d'animations et des étapes d'itération dans [`JOURNAL-maison-aubier.md`](./JOURNAL-maison-aubier.md).
