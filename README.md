# Maison Aubier — Version 1 (V1)

Site de présentation d'un triplex d'architecte fictif de 240 m² avec visite 3D interactive procédurale.

## 🏛️ Caractéristiques du projet
- **Surface :** 240 m² sur 3 niveaux (Rez-de-jardin, Nuit, Ciel), 10 pièces + terrasse de 32 m²
- **Style visuel :** `style-luxe-creme` (fonds crème, typographie éditoriale, ambiance calme et raffinée)
- **Visite 3D :** Maquette procédurale Three.js coupée par niveau, caméra orbitale & fly-to, modes *Maquette* et *Immersion*, navigation clavier et fiches pièces interactives
- **Film d'ambiance :** Vidéo de 14 s générée via HyperFrames (`film/` rendu en `public/media/film.mp4`)

## 🛠️ Stack technique
- **Bundler :** [Vite](https://vitejs.dev/)
- **3D :** [Three.js](https://threejs.org/)
- **Animations & Scroll :** [GSAP](https://gsap.com/) & [Lenis](https://lenis.darkroom.engineering/)
- **Typographie :** Fraunces & Inter

## 🚀 Démarrage local
```bash
# Installation des dépendances
npm install

# Démarrage du serveur de développement (http://localhost:5183)
npm run dev

# Build de production
npm run build
```
