# Maison Aubier — Version 2 (V2)

Site architectural d'avant-garde pour un triplex d'exception de 240 m², inspiré de la structure et de la mécanique d'interaction de **Heron AI** (Awwwards SOTD / Bearplus).

## ✨ Évolutions majeures par rapport à la V1
- **Exosquelette technique & UI de précision :** Cadre fixe, règles graduées, coordonnées dynamiques du curseur, réticules de coin, filets pointillés et bandeau défilant.
- **Maquette 3D réarchitecturée (`src/house.js`) :** Murs coupés net, menuiseries fines, bardage bois ajouré au niveau Ciel, pergola en acier et lattes de chêne, parquet texturé, mobilier aux angles chanfreinés, jardin paysager avec bassin d'eau.
- **Plans & Élévations SVG générés depuis la donnée (`src/drawings.js`) :** Façade sud et 3 plans de niveau générés dynamiquement à partir d'une source unique de vérité (`WALLS` dans `src/data.js`), disponibles en mode trait technique et mode lavis d'encre.
- **Palette chromatique minérale :** Papier `#f3efe8`, encre olive `#262a1c`, terre cuite `#c4532d`.
- **Typographie :** Archivo & JetBrains Mono.
- **Intégration vidéo :** Film HyperFrames intégré dans le bloc de présentation architecturale.

## 🛠️ Stack technique
- **Bundler :** [Vite](https://vitejs.dev/)
- **Moteur 3D :** [Three.js](https://threejs.org/)
- **Animations & Scroll :** [GSAP](https://gsap.com/) & [Lenis](https://lenis.darkroom.engineering/)
- **Composition Vidéo :** HyperFrames (`film/`)

## 🚀 Démarrage local
```bash
# Installation des dépendances
npm install

# Démarrage du serveur de développement (http://localhost:5184)
npm run dev

# Astuce : ajouter ?static à l'URL pour figer l'état final des animations
# http://localhost:5184/?static

# Build de production
npm run build
```

## 📂 Structure du projet
```
├── film/                        # Composition vidéo HyperFrames
├── public/                      # Assets statiques & vidéo MP4 rendue
│   └── media/
│       ├── film.mp4
│       └── film-poster.jpg
├── src/
│   ├── data.js                  # Données pièces, niveaux, géométrie des murs
│   ├── drawings.js              # Générateur SVG façade et plans d'étages
│   ├── house.js                 # Générateur 3D Three.js de la maison
│   ├── tour.js                  # Gestion de la caméra et visite interactive
│   ├── main.js                  # Orchestration, GSAP, Lenis, UI
│   └── style.css                # Exosquelette, grille et styles
├── index.html
└── JOURNAL-maison-aubier.md     # Journal de bord de la session de conception
```
