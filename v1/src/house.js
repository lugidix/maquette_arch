// Maquette procédurale de la Maison Aubier (Three.js, aucune texture externe).
import * as THREE from 'three';
import { HOUSE, ROOMS } from './data.js';

const H = HOUSE.wallHeight;
const LH = HOUSE.levelHeight;

export const COLORS = {
  wall: 0xfbf8f6, wallInt: 0xf3ede6, slab: 0xe3e1d4, oak: 0xcdaa7d, oakDark: 0x9c7a55,
  stone: 0xdcd7ca, sage: 0x7f8c5c, olive: 0x373f1d, linen: 0xeee5d8, white: 0xfdfbf8,
  terra: 0xb97c5e, glass: 0xbfd6d0, ground: 0xd9d8c0, leaf: 0x70834a, deck: 0xb39270, metal: 0x5a5d4e,
};

export function buildHouse(clipPlane) {
  const root = new THREE.Group();
  root.position.set(-HOUSE.width / 2, 0, -HOUSE.depth / 2);
  const cache = new Map();

  const mat = (color, o = {}) => {
    const key = color + JSON.stringify(o);
    if (!cache.has(key)) {
      cache.set(key, new THREE.MeshStandardMaterial({
        color, roughness: 0.86, metalness: 0, side: THREE.DoubleSide,
        clippingPlanes: [clipPlane], clipShadows: true, ...o,
      }));
    }
    return cache.get(key);
  };
  const glassMat = mat(COLORS.glass, { transparent: true, opacity: 0.2, roughness: 0.08, depthWrite: false });

  // Boîte posée par son coin minimal (x0, y0, z0).
  const B = (g, x0, y0, z0, w, h, d, color, o) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), o?.material || mat(color));
    m.position.set(x0 + w / 2, y0 + h / 2, z0 + d / 2);
    m.castShadow = o?.shadow !== false;
    m.receiveShadow = true;
    g.add(m);
    return m;
  };
  const glass = (g, x0, y0, z0, w, h, d) => B(g, x0, y0, z0, w, h, d, 0, { material: glassMat, shadow: false });
  const cyl = (g, x, y0, z, r, h, color, r2 = r) => {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(r2, r, h, 20), mat(color));
    m.position.set(x, y0 + h / 2, z);
    m.castShadow = m.receiveShadow = true;
    g.add(m);
    return m;
  };
  const ball = (g, x, y, z, r, color) => {
    const m = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 1), mat(color, { flatShading: true }));
    m.position.set(x, y, z);
    m.castShadow = m.receiveShadow = true;
    g.add(m);
    return m;
  };

  // Mur droit de (x1,z1) à (x2,z2), avec ouvertures {a, b, k} mesurées depuis le départ.
  // k : 'd' porte, 'w' fenêtre, 'g' baie vitrée, 'o' passage libre.
  const wall = (g, base, x1, z1, x2, z2, { t = 0.14, openings = [], h = H } = {}) => {
    const alongX = z1 === z2;
    const len = alongX ? x2 - x1 : z2 - z1;
    const piece = (a, b, y0, y1, isGlass) => {
      if (b - a < 0.01 || y1 - y0 < 0.01) return;
      const tt = isGlass ? 0.03 : t;
      const fn = isGlass ? glass : B;
      if (alongX) fn(g, x1 + a, base + y0, z1 - tt / 2, b - a, y1 - y0, tt, t > 0.2 ? COLORS.wall : COLORS.wallInt);
      else fn(g, x1 - tt / 2, base + y0, z1 + a, tt, y1 - y0, b - a, t > 0.2 ? COLORS.wall : COLORS.wallInt);
    };
    let cur = 0;
    [...openings].sort((p, q) => p.a - q.a).forEach(({ a, b, k }) => {
      piece(cur, a, 0, h);
      if (k === 'd') piece(a, b, 2.1, h);
      if (k === 'w') { piece(a, b, 0, 0.9); piece(a, b, 0.9, 2.3, true); piece(a, b, 2.3, h); }
      if (k === 'g') { piece(a, b, 0, 0.06); piece(a, b, 0.06, 2.55, true); piece(a, b, 2.55, h); }
      cur = b;
    });
    piece(cur, len, 0, h);
  };
  const ext = (g, base, x1, z1, x2, z2, openings = []) => wall(g, base, x1, z1, x2, z2, { t: 0.24, openings });

  const chair = (g, x, y, z, side, color = COLORS.oakDark) => {
    B(g, x, y, z, 0.44, 0.45, 0.44, color);
    if (side === 'n') B(g, x, y + 0.45, z + 0.38, 0.44, 0.42, 0.06, color);
    if (side === 's') B(g, x, y + 0.45, z, 0.44, 0.42, 0.06, color);
    if (side === 'e') B(g, x + 0.38, y + 0.45, z, 0.06, 0.42, 0.44, color);
    if (side === 'w') B(g, x, y + 0.45, z, 0.06, 0.42, 0.44, color);
  };
  const plant = (g, x, y, z, s = 1) => {
    cyl(g, x, y, z, 0.2 * s, 0.4 * s, COLORS.terra, 0.26 * s);
    ball(g, x, y + 0.8 * s, z, 0.36 * s, COLORS.leaf);
    ball(g, x + 0.18 * s, y + 1.12 * s, z - 0.1 * s, 0.26 * s, COLORS.sage);
  };
  const table = (g, x, y, z, w, d, h = 0.74, color = COLORS.oak) => {
    B(g, x, y + h - 0.06, z, w, 0.06, d, color);
    [[0.06, 0.06], [w - 0.14, 0.06], [0.06, d - 0.14], [w - 0.14, d - 0.14]]
      .forEach(([dx, dz]) => B(g, x + dx, y, z + dz, 0.08, h - 0.06, 0.08, color));
  };
  const lamp = (g, x, y, z) => {
    cyl(g, x, y, z, 0.14, 0.03, COLORS.metal);
    cyl(g, x, y, z, 0.015, 1.45, COLORS.metal);
    cyl(g, x, y + 1.3, z, 0.2, 0.26, COLORS.linen, 0.13);
  };
  const stairs = (g, base) => {
    for (let i = 0; i < 16; i++) B(g, 3.2 + i * 0.25, base, 6.9, 0.25, (i + 1) * (LH / 16), 1.0, COLORS.oak);
  };
  // Dalle d'étage avec trémie d'escalier (x 3.2–7.2, z 6.8–8).
  const slab = (g, base) => {
    B(g, 0, base - 0.2, 0, 12, 0.2, 6.8, COLORS.slab);
    B(g, 0, base - 0.2, 6.8, 3.2, 0.2, 1.2, COLORS.slab);
    B(g, 7.2, base - 0.2, 6.8, 4.8, 0.2, 1.2, COLORS.slab);
    glass(g, 3.2, base, 6.78, 3.4, 1.0, 0.03);
  };

  const levels = [0, 1, 2].map(() => { const g = new THREE.Group(); root.add(g); return g; });
  const [g0, g1, g2] = levels;

  // ---------- Niveau 0 ----------
  B(g0, -0.1, -0.25, -0.1, 12.2, 0.25, 8.2, COLORS.slab);
  ext(g0, 0, 0, 0, 12, 0, [{ a: 0.6, b: 6.4, k: 'g' }, { a: 8, b: 11, k: 'w' }]);
  ext(g0, 0, 0, 8, 12, 8, [{ a: 1, b: 2.1, k: 'd' }, { a: 8.4, b: 11, k: 'w' }]);
  ext(g0, 0, 0, 0, 0, 8, [{ a: 1.2, b: 3.8, k: 'w' }]);
  ext(g0, 0, 12, 0, 12, 8, [{ a: 1, b: 3.5, k: 'w' }, { a: 5.2, b: 7.2, k: 'w' }]);
  wall(g0, 0, 0, 5, 3.2, 5, { openings: [{ a: 1.6, b: 2.7, k: 'd' }] });
  wall(g0, 0, 7, 0, 7, 2.6);
  stairs(g0, 0);
  // Salon
  B(g0, 1.4, 0.03, 0.9, 4, 0.02, 2.9, COLORS.linen, { shadow: false });
  B(g0, 1.9, 0, 3.1, 2.8, 0.42, 0.95, COLORS.linen); B(g0, 1.9, 0.42, 3.85, 2.8, 0.4, 0.2, COLORS.linen);
  B(g0, 1.9, 0.42, 3.1, 0.2, 0.22, 0.75, COLORS.linen); B(g0, 4.5, 0.42, 3.1, 0.2, 0.22, 0.75, COLORS.linen);
  B(g0, 5.3, 0, 1.5, 0.9, 0.42, 0.9, COLORS.terra); B(g0, 6.05, 0.42, 1.5, 0.15, 0.4, 0.9, COLORS.terra);
  B(g0, 2.6, 0, 1.7, 1.4, 0.3, 0.75, COLORS.oakDark);
  B(g0, 0.25, 0, 4.2, 0.45, 0.55, 0.65, COLORS.oak);
  lamp(g0, 5.2, 0, 3.9); plant(g0, 6.3, 0, 0.6, 1.2); plant(g0, 0.6, 0, 0.6);
  // Cuisine
  B(g0, 7.1, 0, 0.3, 0.62, 2.2, 2.2, COLORS.sage);
  B(g0, 11.25, 0, 0.3, 0.62, 0.88, 3.9, COLORS.sage); B(g0, 11.2, 0.88, 0.28, 0.68, 0.05, 3.94, COLORS.stone);
  B(g0, 8.3, 0, 1.6, 2.6, 0.88, 1.0, COLORS.stone); B(g0, 8.22, 0.88, 1.52, 2.76, 0.05, 1.16, COLORS.white);
  [8.7, 9.6, 10.5].forEach((x) => { cyl(g0, x, 0, 3.0, 0.03, 0.62, COLORS.metal); cyl(g0, x, 0.62, 3.0, 0.19, 0.05, COLORS.oak); });
  // Salle à manger
  table(g0, 8.3, 0, 5.75, 2.6, 1.1);
  [8.5, 9.15, 9.8, 10.45].forEach((x) => { chair(g0, x, 0, 5.2, 's'); chair(g0, x, 0, 6.95, 'n'); });
  cyl(g0, 9.6, 1.75, 6.3, 0.34, 0.24, COLORS.sage, 0.1); cyl(g0, 9.6, 1.99, 6.3, 0.008, 0.81, COLORS.metal);
  plant(g0, 11.5, 0, 7.5);
  // Entrée
  B(g0, 0.2, 0, 5.25, 0.6, 2.2, 1.5, COLORS.oakDark);
  B(g0, 2.5, 0, 5.2, 0.5, 0.45, 1.2, COLORS.oak);
  B(g0, 1.0, 0.03, 6.6, 1.1, 0.02, 1.2, COLORS.sage, { shadow: false });

  // ---------- Niveau 1 ----------
  const b1 = LH;
  slab(g1, b1);
  ext(g1, b1, 0, 0, 12, 0, [{ a: 1, b: 5, k: 'w' }, { a: 6.7, b: 7.9, k: 'w' }, { a: 9.2, b: 11.3, k: 'w' }]);
  ext(g1, b1, 0, 8, 12, 8, [{ a: 1, b: 2.6, k: 'w' }, { a: 8.4, b: 11, k: 'w' }]);
  ext(g1, b1, 0, 0, 0, 8, [{ a: 1.2, b: 3.8, k: 'w' }]);
  ext(g1, b1, 12, 0, 12, 8, [{ a: 1, b: 3.5, k: 'w' }, { a: 5.2, b: 7.2, k: 'w' }]);
  wall(g1, b1, 0, 5, 6, 5, { openings: [{ a: 4.7, b: 5.6, k: 'd' }] });
  wall(g1, b1, 6, 0, 6, 5, { openings: [{ a: 3.4, b: 4.3, k: 'd' }] });
  wall(g1, b1, 8.5, 0, 8.5, 4.5);
  wall(g1, b1, 6, 4.5, 12, 4.5, { openings: [{ a: 0.8, b: 1.7, k: 'd' }, { a: 3, b: 3.9, k: 'd' }] });
  stairs(g1, b1);
  // Suite parentale
  B(g1, 1.2, b1 + 0.03, 0.9, 3.6, 0.02, 3, COLORS.linen, { shadow: false });
  B(g1, 2, b1, 1.4, 2, 0.3, 2.2, COLORS.oakDark); B(g1, 2.05, b1 + 0.3, 1.45, 1.9, 0.22, 2.1, COLORS.white);
  B(g1, 2.05, b1 + 0.52, 1.45, 1.9, 0.06, 1.2, COLORS.sage);
  B(g1, 2.2, b1 + 0.52, 3.05, 0.7, 0.14, 0.42, COLORS.linen); B(g1, 3.1, b1 + 0.52, 3.05, 0.7, 0.14, 0.42, COLORS.linen);
  B(g1, 1.8, b1, 3.6, 2.4, 1.15, 0.12, COLORS.sage);
  B(g1, 1.3, b1, 3.2, 0.5, 0.45, 0.45, COLORS.oak); B(g1, 4.2, b1, 3.2, 0.5, 0.45, 0.45, COLORS.oak);
  B(g1, 0.3, b1, 4.3, 3.8, 2.3, 0.55, COLORS.oak);
  B(g1, 4.8, b1, 0.6, 0.85, 0.42, 0.85, COLORS.terra); lamp(g1, 5.5, b1, 1.7); plant(g1, 0.6, b1, 0.6);
  // Salle de bain
  B(g1, 6.45, b1, 0.5, 1.7, 0.56, 0.8, COLORS.white); B(g1, 6.55, b1 + 0.5, 0.6, 1.5, 0.07, 0.6, COLORS.glass);
  B(g1, 7.85, b1, 1.9, 0.52, 0.82, 1.5, COLORS.oak); B(g1, 7.82, b1 + 0.82, 1.88, 0.58, 0.05, 1.54, COLORS.stone);
  cyl(g1, 8.1, b1 + 0.87, 2.3, 0.17, 0.08, COLORS.white); cyl(g1, 8.1, b1 + 0.87, 3.0, 0.17, 0.08, COLORS.white);
  glass(g1, 6.15, b1, 3.0, 1.1, 2.1, 0.03); B(g1, 6.15, b1, 3.05, 1.05, 0.04, 1.35, COLORS.stone, { shadow: false });
  // Chambre Érable
  B(g1, 10.1, b1, 1.9, 1.6, 0.3, 2.0, COLORS.oakDark); B(g1, 10.14, b1 + 0.3, 1.94, 1.52, 0.22, 1.92, COLORS.white);
  B(g1, 10.14, b1 + 0.52, 1.94, 1.52, 0.06, 1.1, COLORS.terra); B(g1, 10.0, b1, 3.9, 1.8, 1.05, 0.1, COLORS.oak);
  table(g1, 9.3, b1, 0.3, 1.5, 0.6); chair(g1, 9.8, b1, 0.95, 'n');
  B(g1, 8.62, b1, 1.6, 0.6, 2.2, 1.5, COLORS.oak); plant(g1, 11.5, b1, 0.7, 0.8);
  // Bureau-bibliothèque
  [[7.9, 1.0], [10.1, 1.75]].forEach(([x, w]) => {
    B(g1, x, b1, 4.6, w, 2.4, 0.34, COLORS.oakDark);
    [0.5, 0.95, 1.4, 1.85].forEach((y, i) => B(g1, x + 0.06, b1 + y, 4.92, w - 0.12, 0.3, 0.04, [COLORS.sage, COLORS.linen, COLORS.terra, COLORS.stone][i]));
  });
  table(g1, 8.5, b1, 6.2, 2.6, 0.9); chair(g1, 9.0, b1, 7.15, 'n'); chair(g1, 10.2, b1, 7.15, 'n');
  lamp(g1, 11.5, b1, 7.5); plant(g1, 0.7, b1, 5.7); B(g1, 0.9, b1 + 0.03, 6.1, 2, 0.02, 1.2, COLORS.sage, { shadow: false });

  // ---------- Niveau 2 ----------
  const b2 = LH * 2;
  slab(g2, b2);
  ext(g2, b2, 0, 0, 8, 0, [{ a: 0.5, b: 7.5, k: 'g' }]);
  ext(g2, b2, 0, 8, 8, 8, [{ a: 4, b: 7, k: 'w' }]);
  ext(g2, b2, 0, 0, 0, 8, [{ a: 1, b: 4, k: 'w' }, { a: 5.8, b: 7.2, k: 'w' }]);
  ext(g2, b2, 8, 0, 8, 8, [{ a: 0.5, b: 4.3, k: 'g' }, { a: 5.4, b: 6.5, k: 'd' }]);
  wall(g2, b2, 0, 5, 3.2, 5);
  wall(g2, b2, 3.2, 5, 3.2, 8, { openings: [{ a: 0.5, b: 1.4, k: 'd' }] });
  B(g2, -0.45, b2 + H, -0.45, 8.9, 0.22, 8.9, COLORS.wall);
  // Lounge
  B(g2, 1.0, b2 + 0.03, 0.9, 4.4, 0.02, 3.2, COLORS.linen, { shadow: false });
  B(g2, 1.2, b2, 2.9, 3.4, 0.42, 1.0, COLORS.sage); B(g2, 1.2, b2 + 0.42, 3.7, 3.4, 0.4, 0.2, COLORS.sage);
  B(g2, 1.2, b2, 1.3, 1.0, 0.42, 1.6, COLORS.sage); B(g2, 1.2, b2 + 0.42, 1.3, 0.2, 0.4, 2.4, COLORS.sage);
  B(g2, 2.7, b2, 1.5, 1.3, 0.3, 0.8, COLORS.oakDark);
  B(g2, 5.0, b2, 1.0, 0.85, 0.42, 0.85, COLORS.linen); B(g2, 5.0, b2 + 0.42, 1.0, 0.85, 0.4, 0.15, COLORS.linen);
  B(g2, 5.9, b2, 3.9, 1.7, 1.05, 0.5, COLORS.oakDark); B(g2, 5.85, b2 + 1.05, 3.85, 1.8, 0.05, 0.6, COLORS.stone);
  [6.3, 7.1].forEach((x) => { cyl(g2, x, b2, 3.5, 0.03, 0.7, COLORS.metal); cyl(g2, x, b2 + 0.7, 3.5, 0.18, 0.05, COLORS.oak); });
  lamp(g2, 4.9, b2, 3.9); plant(g2, 7.3, b2, 0.7, 1.2); plant(g2, 0.6, b2, 0.6);
  // Salle d'eau
  B(g2, 0.2, b2, 5.2, 0.5, 0.82, 1.2, COLORS.oak); B(g2, 0.17, b2 + 0.82, 5.18, 0.56, 0.05, 1.24, COLORS.stone);
  cyl(g2, 0.45, b2 + 0.87, 5.8, 0.17, 0.08, COLORS.white);
  glass(g2, 1.9, b2, 6.8, 0.03, 2.1, 1.1); B(g2, 0.2, b2, 6.85, 1.7, 0.04, 1.0, COLORS.stone, { shadow: false });
  // Terrasse
  [[12, 0, 12, 8], [8, 0, 12, 0], [8, 8, 12, 8]].forEach(([x1, z1, x2, z2]) => {
    if (z1 === z2) { glass(g2, x1, b2, z1 - 0.015, x2 - x1, 1.1, 0.03); B(g2, x1, b2 + 1.1, z1 - 0.03, x2 - x1, 0.04, 0.06, COLORS.metal); }
    else { glass(g2, x1 - 0.015, b2, z1, 0.03, 1.1, z2 - z1); B(g2, x1 - 0.03, b2 + 1.1, z1, 0.06, 0.04, z2 - z1, COLORS.metal); }
  });
  B(g2, 11.2, b2, 0.4, 0.55, 0.5, 3.2, COLORS.stone);
  [0.8, 1.6, 2.4, 3.2].forEach((z, i) => ball(g2, 11.47, b2 + 0.75, z, 0.32 - (i % 2) * 0.06, i % 2 ? COLORS.sage : COLORS.leaf));
  B(g2, 8.6, b2, 5.4, 2.3, 0.38, 0.9, COLORS.linen); B(g2, 8.6, b2 + 0.38, 6.15, 2.3, 0.35, 0.15, COLORS.linen);
  table(g2, 9.1, b2, 4.2, 1.2, 0.7, 0.4, COLORS.oakDark);
  cyl(g2, 10.8, b2, 6.9, 0.03, 2.3, COLORS.metal); cyl(g2, 10.8, b2 + 2.1, 6.9, 1.3, 0.35, COLORS.linen, 0.05);
  plant(g2, 8.5, b2, 0.6, 1.1);

  // ---------- Sols de pièces (survol, sélection) ----------
  const roomFloors = [];
  ROOMS.forEach((r) => {
    const color = r.id === 'terrasse' ? COLORS.deck : /bain|eau/.test(r.id) ? COLORS.stone : COLORS.oak;
    const material = new THREE.MeshStandardMaterial({
      color, roughness: 0.7, clippingPlanes: [clipPlane], clipShadows: true,
      emissive: COLORS.sage, emissiveIntensity: 0,
    });
    const m = new THREE.Mesh(new THREE.BoxGeometry(r.w - 0.06, 0.03, r.d - 0.06), material);
    m.position.set(r.x + r.w / 2, r.level * LH + 0.015, r.z + r.d / 2);
    m.receiveShadow = true;
    m.userData.roomId = r.id;
    levels[r.level].add(m);
    roomFloors.push(m);
  });
  // Circulations (paliers) en chêne, sous les sols de pièces.
  B(g0, 0, 0, 0, 12, 0.012, 8, COLORS.oak, { shadow: false });
  B(g1, 0, b1, 0, 12, 0.012, 6.8, COLORS.oak, { shadow: false });
  B(g2, 0, b2, 0, 8, 0.012, 6.8, COLORS.oak, { shadow: false });

  // ---------- Jardin ----------
  const garden = new THREE.Group();
  root.add(garden);
  const ground = new THREE.Mesh(new THREE.CircleGeometry(60, 64), new THREE.MeshStandardMaterial({ color: COLORS.ground, roughness: 1 }));
  ground.rotation.x = -Math.PI / 2;
  ground.position.set(6, -0.26, 4);
  ground.receiveShadow = true;
  garden.add(ground);
  B(garden, 0, -0.25, -3.6, 7.4, 0.2, 3.6, COLORS.deck);
  B(garden, 1, -0.25, 8.1, 1.2, 0.06, 4, COLORS.stone, { shadow: false });
  [[-4.5, -2, 1.2], [17, -3, 1.4], [17.5, 7, 1.1], [-5, 10, 1.3], [-3, -9, 1], [4, 14, 1]].forEach(([x, z, s]) => {
    cyl(garden, x, -0.25, z, 0.16 * s, 2.2 * s, COLORS.oakDark, 0.11 * s);
    ball(garden, x, 2.6 * s, z, 1.25 * s, COLORS.leaf);
    ball(garden, x + 0.6 * s, 3.3 * s, z + 0.3 * s, 0.85 * s, COLORS.sage);
  });
  plant(garden, 7.0, -0.05, -3.0, 1.3);
  B(garden, 1.2, -0.05, -2.6, 1.9, 0.36, 0.8, COLORS.linen); B(garden, 3.6, -0.05, -2.5, 0.8, 0.3, 0.8, COLORS.oakDark);

  return { root, levels, roomFloors };
}
