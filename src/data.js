// Maison Aubier — données de la maison (fictive).
// Repère : x de 0 à 12 m (ouest → est), z de 0 à 8 m (jardin → rue), 3 m par niveau.

export const HOUSE = { width: 12, depth: 8, levelHeight: 3, wallHeight: 2.8 };

export const LEVELS = [
  { id: 0, name: 'Rez-de-jardin', tag: 'Niveau 0', line: 'Recevoir, cuisiner, ouvrir sur le jardin.' },
  { id: 1, name: 'Nuit', tag: 'Niveau 1', line: 'Dormir, lire, se retirer.' },
  { id: 2, name: 'Ciel', tag: 'Niveau 2', line: 'Un lounge et une terrasse au-dessus des toits.' },
];

// x, z, w, d : emprise au sol de la pièce. eye : point de vue en immersion
// (from / to en fractions de l'emprise).
export const ROOMS = [
  {
    id: 'salon', level: 0, name: 'Salon', x: 0, z: 0, w: 7, d: 5, surface: 35,
    desc: 'Une baie de sept mètres plein sud. Le chêne du sol file jusqu’au jardin, sans seuil.',
    features: ['Baie vitrée 7 m', 'Parquet chêne massif', 'Hauteur 2,80 m'],
    eye: { from: [0.9, 0.9], to: [0.3, 0.2] },
  },
  {
    id: 'cuisine', level: 0, name: 'Cuisine', x: 7, z: 0, w: 5, d: 4.5, surface: 22.5,
    desc: 'Un îlot en pierre claire, des façades sauge, et la lumière du matin sur le plan de travail.',
    features: ['Îlot central 2,60 m', 'Façades laquées sauge', 'Cellier intégré'],
    eye: { from: [0.12, 0.9], to: [0.7, 0.25] },
  },
  {
    id: 'salle-a-manger', level: 0, name: 'Salle à manger', x: 7.2, z: 4.5, w: 4.8, d: 3.5, surface: 16.8,
    desc: 'Une table pour huit, dans le prolongement de la cuisine. On passe les plats sans se lever.',
    features: ['Table 8 couverts', 'Ouverte sur la cuisine', 'Fenêtre sur rue'],
    eye: { from: [0.1, 0.15], to: [0.65, 0.7] },
  },
  {
    id: 'entree', level: 0, name: 'Entrée', x: 0, z: 5, w: 3.2, d: 3, surface: 9.6,
    desc: 'On pose les clés, on enlève son manteau. L’escalier en chêne commence ici.',
    features: ['Vestiaire sur mesure', 'Escalier chêne', 'Porte pleine 1,10 m'],
    eye: { from: [0.85, 0.8], to: [0.3, 0.25] },
  },
  {
    id: 'suite', level: 1, name: 'Suite parentale', x: 0, z: 0, w: 6, d: 5, surface: 30,
    desc: 'Le lit regarde les arbres. La salle de bain est juste derrière la cloison, sans couloir.',
    features: ['Dressing 4 m linéaires', 'Accès direct salle de bain', 'Vue jardin'],
    eye: { from: [0.88, 0.9], to: [0.3, 0.25] },
  },
  {
    id: 'salle-de-bain', level: 1, name: 'Salle de bain', x: 6, z: 0, w: 2.5, d: 4.5, surface: 11.25,
    desc: 'Une baignoire îlot sous la fenêtre, une double vasque, de la pierre du sol au plafond.',
    features: ['Baignoire îlot', 'Double vasque', 'Douche à l’italienne'],
    eye: { from: [0.5, 0.92], to: [0.5, 0.15] },
  },
  {
    id: 'chambre', level: 1, name: 'Chambre Érable', x: 8.5, z: 0, w: 3.5, d: 4.5, surface: 15.75,
    desc: 'Une chambre calme à l’angle est, avec son bureau sous la fenêtre.',
    features: ['Placard intégré', 'Double exposition', 'Coin bureau'],
    eye: { from: [0.15, 0.9], to: [0.7, 0.2] },
  },
  {
    id: 'bureau', level: 1, name: 'Bureau-bibliothèque', x: 7.2, z: 4.5, w: 4.8, d: 3.5, surface: 16.8,
    desc: 'Ouvert sur le palier, tapissé de livres. Une table longue pour travailler à deux.',
    features: ['Bibliothèque toute hauteur', 'Ouvert sur le palier', 'Fenêtre sur rue'],
    eye: { from: [0.1, 0.2], to: [0.7, 0.7] },
  },
  {
    id: 'lounge', level: 2, name: 'Lounge', x: 0, z: 0, w: 8, d: 5, surface: 40,
    desc: 'La pièce la plus haute de la maison. Deux façades vitrées, et la terrasse de plain-pied.',
    features: ['Double façade vitrée', 'Accès terrasse', 'Bar d’appoint'],
    eye: { from: [0.1, 0.88], to: [0.75, 0.3] },
  },
  {
    id: 'salle-d-eau', level: 2, name: 'Salle d’eau', x: 0, z: 5, w: 3.2, d: 3, surface: 9.6,
    desc: 'Une douche et une vasque pour les invités, à deux pas du lounge.',
    features: ['Douche à l’italienne', 'Vasque en pierre', 'Fenêtre haute'],
    eye: { from: [0.85, 0.15], to: [0.3, 0.75] },
  },
  {
    id: 'terrasse', level: 2, name: 'Terrasse', x: 8, z: 0, w: 4, d: 8, surface: 32,
    desc: 'Trente-deux mètres carrés à ciel ouvert, garde-corps en verre, vue sur les toits.',
    features: ['Garde-corps verre', 'Platelage bois', 'Jardinières intégrées'],
    eye: { from: [0.2, 0.92], to: [0.6, 0.2] },
  },
];

export const STATS = [
  { value: 240, unit: 'm²', label: 'habitables' },
  { value: 3, unit: '', label: 'niveaux' },
  { value: 10, unit: '', label: 'pièces' },
  { value: 32, unit: 'm²', label: 'de terrasse' },
];

// Murs : source unique pour la maquette 3D et les plans dessinés.
// a, b : position de l'ouverture depuis le départ du mur. k : 'd' porte, 'w' fenêtre, 'g' baie vitrée.
const E = true;
export const WALLS = [
  // Niveau 0
  { level: 0, ext: E, p: [0, 0, 12, 0], o: [{ a: 0.6, b: 6.4, k: 'g' }, { a: 8, b: 11, k: 'w' }] },
  { level: 0, ext: E, p: [0, 8, 12, 8], o: [{ a: 1, b: 2.1, k: 'd' }, { a: 8.4, b: 11, k: 'w' }] },
  { level: 0, ext: E, p: [0, 0, 0, 8], o: [{ a: 1.2, b: 3.8, k: 'w' }] },
  { level: 0, ext: E, p: [12, 0, 12, 8], o: [{ a: 1, b: 3.5, k: 'w' }, { a: 5.2, b: 7.2, k: 'w' }] },
  { level: 0, p: [0, 5, 3.2, 5], o: [{ a: 1.6, b: 2.7, k: 'd' }] },
  { level: 0, p: [7, 0, 7, 2.6], o: [] },
  // Niveau 1
  { level: 1, ext: E, p: [0, 0, 12, 0], o: [{ a: 1, b: 5, k: 'w' }, { a: 6.7, b: 7.9, k: 'w' }, { a: 9.2, b: 11.3, k: 'w' }] },
  { level: 1, ext: E, p: [0, 8, 12, 8], o: [{ a: 1, b: 2.6, k: 'w' }, { a: 8.4, b: 11, k: 'w' }] },
  { level: 1, ext: E, p: [0, 0, 0, 8], o: [{ a: 1.2, b: 3.8, k: 'w' }] },
  { level: 1, ext: E, p: [12, 0, 12, 8], o: [{ a: 1, b: 3.5, k: 'w' }, { a: 5.2, b: 7.2, k: 'w' }] },
  { level: 1, p: [0, 5, 6, 5], o: [{ a: 4.7, b: 5.6, k: 'd' }] },
  { level: 1, p: [6, 0, 6, 5], o: [{ a: 3.4, b: 4.3, k: 'd' }] },
  { level: 1, p: [8.5, 0, 8.5, 4.5], o: [] },
  { level: 1, p: [6, 4.5, 12, 4.5], o: [{ a: 0.8, b: 1.7, k: 'd' }, { a: 3, b: 3.9, k: 'd' }] },
  // Niveau 2 (volume en retrait, x de 0 à 8)
  { level: 2, ext: E, clad: true, p: [0, 0, 8, 0], o: [{ a: 0.5, b: 7.5, k: 'g' }] },
  { level: 2, ext: E, clad: true, p: [0, 8, 8, 8], o: [{ a: 4, b: 7, k: 'w' }] },
  { level: 2, ext: E, clad: true, p: [0, 0, 0, 8], o: [{ a: 1, b: 4, k: 'w' }, { a: 5.8, b: 7.2, k: 'w' }] },
  { level: 2, ext: E, clad: true, p: [8, 0, 8, 8], o: [{ a: 0.5, b: 4.3, k: 'g' }, { a: 5.4, b: 6.5, k: 'd' }] },
  { level: 2, p: [0, 5, 3.2, 5], o: [] },
  { level: 2, p: [3.2, 5, 3.2, 8], o: [{ a: 0.5, b: 1.4, k: 'd' }] },
];

export const ATOUTS = [
  { tag: 'Lumière', title: 'Le sud à chaque étage', text: 'Sept mètres de baie au salon, quatre fenêtres à l’étage, deux façades vitrées au lounge. Le soleil traverse la maison du matin au soir.' },
  { tag: 'Matières', title: 'Trois matières, pas une de plus', text: 'Chêne massif au sol, pierre claire pour l’eau et la cuisine, laque sauge pour les rangements. Les mêmes du jardin au toit.' },
  { tag: 'Calme', title: 'Un étage rien que pour la nuit', text: 'Les chambres sont seules au niveau 1. Ni cuisine en dessous du lit, ni télévision derrière la cloison.' },
  { tag: 'Ciel', title: 'Une terrasse au-dessus des toits', text: 'Trente-deux mètres carrés de plain-pied avec le lounge, garde-corps en verre, pergola et jardinières.' },
];

export const MATIERES = ['Chêne massif', 'Pierre claire', 'Laque sauge', 'Verre triple', 'Acier patiné'];
