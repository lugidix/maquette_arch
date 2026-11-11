# Maison Aubier — journal de la session du 11 novembre 2026

Site de présentation d'un triplex **fictif** (« Maison Aubier ») avec visite 3D des pièces, construit sur le PC de Lugidix.

---

## 1. Point de départ : Higgsfield MCP et HyperFrames

| Outil | Ce que c'est | État à la fin de la session |
|---|---|---|
| **Higgsfield MCP** | Serveur MCP hébergé (`https://mcp.higgsfield.ai/mcp`) pour les modèles image/vidéo de Higgsfield | Connecté comme connecteur personnalisé dans claude.ai. **Lecture seule** : solde, modèles, historique. Ne génère pas. Compte gratuit, 10 crédits, 0 génération. |
| **HyperFrames (HeyGen)** | Framework open source : HTML/CSS/GSAP rendu en vidéo | Connecteur cloud connecté dans claude.ai + skills locaux sur le PC (`hyperframes`, `hyperframes-cli`, `hyperframes-registry`, `remotion-to-hyperframes` dans `.agents\skills`, plugin dans `.gemini\config\plugins`). |

Différence retenue : les **skills locaux** produisent des fichiers HTML éditables rendus en MP4 sur la machine ; le **connecteur** crée un projet hébergé chez HeyGen, rendu dans le cloud.

---

## 2. Version 1 — `C:\Users\konem\Documents\triplex-site`

**Choix faits ensemble :** plan B (visite 3D Three.js), style `style-luxe-creme`, maison fictive, Higgsfield à connecter.

- **Stack :** Vite, Three.js, GSAP, Lenis, polices Fraunces et Inter.
- **Maison :** 240 m², 3 niveaux (Rez-de-jardin, Nuit, Ciel), 10 pièces + terrasse de 32 m².
- **Visite 3D :** maquette procédurale coupée par niveau ; la caméra vole vers la pièce cliquée ; modes **Maquette** et **Immersion** ; flèches clavier, survol, fiche de pièce.
- **Sections :** hero, la maison + film, visite 3D, niveaux, prestations, contact.
- **Film local HyperFrames** (`film\`) : 14 s, 3 scènes (titre, coupe + chiffres, invitation), rendu en `public\media\film.mp4`, `check` passé.
- **Film cloud HyperFrames** : 30 s avec musique, projet `45e6cdd7-b4b5-4115-8eda-8394a3fbc379`. Pas intégré : tu as décidé de ne pas lancer le rendu MP4 payant.
- Lancement : `npm run dev` (testé sur http://localhost:5183).

Ton retour : propre, mais la modélisation de la maison n'était « pas top ».

---

## 3. Le crawl Heron AI

Trouvé dans `Downloads` :

- **`heronai-crawl\`** : copie locale de heronaiapp.com (Awwwards SOTD, agence Bearplus), 329 fichiers, `animations.md` (153 tweens, 44 ScrollTriggers, 24 keyframes), `server.js` (serveur local sur le port 8765).
- **`anim-heron-skill\`** : skill `anim-heron` tiré du crawl, en 10 fichiers (scroll virtuel, révélations, effet d'encre, tracé, boutons sprite, rail sticky, exosquelette, marquee, curseur, adaptation), plus des tokens et un gabarit. **Pas installé** dans `.agents\skills` ni `.claude\skills`.

Consigne : garder la v1 et tout refaire en prenant **le site crawlé lui-même** comme base, pas seulement le skill.

---

## 4. Version 2 — `C:\Users\konem\Documents\triplex-site-v2`

Testée sur http://localhost:5184 (`npm run dev`). Ajouter `?static` à l'adresse fige le site dans son état final, pour relire la mise en page.

### Repris de heronaiapp.com (structure et mécanique)

- **Ordre des sections de la page d'accueil :** chargement, en-tête en cases, hero, intro, cartes numérotées, section collante, bloc [01]/[02], rail fixe, liste dépliante, appel final, pied de page avec mot géant.
- **Exosquelette :** cadre fixe, règles graduées, coordonnées du curseur, croix de coin, filets pointillés, bandeau défilant.
- **Mouvement, valeurs mesurées :**
  - révélation de lignes : 0,8 s `power2.out`, décalage 0,02 ;
  - blocs : 1 s `power3` ;
  - images : 1,6 s `expo.out` ;
  - vague d'encre : masque SVG + turbulence ;
  - tracé des traits : 1,3 s ;
  - boutons sprite : 20 images en `steps(19)` ;
  - projecteur d'encre : rayon 30 rem.

### Pas repris (marque et travail de l'agence)

Textes, images, logo, police BT Grotesk, code JS du bundle, couleur orange `#fa3600`.

### Propre au triplex

- **Palette :** papier `#f3efe8`, encre olive `#262a1c`, terre cuite `#c4532d`.
- **Polices :** Archivo et JetBrains Mono.
- **Dessins générés depuis les données** (`src/drawings.js`) : façade sud et 3 plans de niveau, chacun en version trait et version encrée.
- **Maquette 3D refaite** (`src/house.js`) : murs coupés net, menuiseries, bardage bois au niveau 2, pergola, parquet texturé, mobilier aux angles adoucis, jardin avec bassin.
- **Murs :** une seule source de données (`WALLS` dans `src/data.js`) sert à la fois à la 3D et aux plans.
- **Film HyperFrames local intégré** dans le bloc [01].

### Fichiers

| Fichier | Rôle |
|---|---|
| `index.html` | Structure des sections |
| `src/main.js` | Animations, chargement, interactions |
| `src/style.css` | Grille, exosquelette, styles |
| `src/data.js` | Pièces, niveaux, murs, atouts |
| `src/house.js` | Maquette 3D |
| `src/tour.js` | Caméra et visite |
| `src/drawings.js` | Façade et plans SVG |
| `public/media/` | Film et emplacement des rendus de pièces (`rooms/<id>.jpg`) |
| `film/` | Composition HyperFrames éditable |

### Vérifié / non vérifié

- **Vérifié :** le build passe ; aucune erreur console ; captures à 1440 px du chargement, du hero, de l'intro, de la maquette (ensemble, niveau 1, immersion salon), de la façade, du rail, des pièces et du pied de page.
- **Non vérifié :**
  - la fluidité réelle (navigateur de test ralenti) ;
  - la mise en page mobile ;
  - les derniers réglages de la maquette (cadrage plus large, lampe du salon déplacée, surbrillance plus douce).

---

## 5. Higgsfield : où on en est

1. Connecteur personnalisé ajouté dans claude.ai → fonctionne, mais **en lecture seule**.
2. Essai de génération via le navigateur intégré → bloqué : pas connecté à Higgsfield dans ce navigateur, et je ne saisis pas de mots de passe.
3. Essai via Chrome → extension Claude in Chrome non joignable (message envoyé depuis le téléphone).
4. **Solution en cours :** tu génères sur higgsfield.ai avec les prompts ci-dessous, puis je récupère les images via le connecteur et je les place dans `triplex-site-v2\public\media\rooms\`.

**Réglages :** Nano Banana, format 16:9. Les 5 pièces prioritaires d'abord.

- **Salon** — Photorealistic interior photo, contemporary living room of a triplex house, 7-metre floor-to-ceiling south glazing with dark slim steel frames opening onto a garden and wooden deck, wide-plank light oak floor, sage green sofa, terracotta armchair, low dark oak coffee table, linen rug, cream walls, soft natural morning light, architectural photography, 24mm, calm and warm
- **Cuisine** — Photorealistic interior photo, contemporary kitchen, central island in pale limestone with oak base, matte sage green lacquered cabinets, three slim black pendant lights, light oak floor, large window, cream walls, soft daylight, minimalist architectural photography, 24mm
- **Suite parentale** — Photorealistic interior photo, calm contemporary master bedroom, oak bed with white linen and sage green throw, sage upholstered headboard, terracotta lounge chair, floor lamp, wide window overlooking trees, light oak floor, cream walls, built-in oak wardrobe, soft natural light, architectural photography, 24mm
- **Lounge** — Photorealistic interior photo, top-floor lounge with two fully glazed walls, sage green L-shaped sofa, dark oak coffee table, small bar with stone counter and two oak stools, light oak floor, rooftop terrace visible through the glass, golden hour light, contemporary architecture, 24mm
- **Terrasse** — Photorealistic photo, rooftop terrace of a contemporary house, wooden decking, frameless glass balustrade, black steel pergola with oak slats, linen outdoor sofa, low dark oak table, stone planters with greenery, wood-clad wall with large glazing, view over rooftops and trees, soft evening light, architectural photography

---

## 6. Reste à faire

- [ ] Générer les rendus Higgsfield, puis me dire « c'est fait » pour que je les intègre.
- [ ] Juger la fluidité et la version mobile de la v2 sur un vrai écran.
- [ ] Revoir les derniers réglages de la maquette 3D.
- [ ] Optionnel : installer `anim-heron` dans `.agents\skills`.
- [ ] Optionnel : rendre et intégrer le film cloud de 30 s.
