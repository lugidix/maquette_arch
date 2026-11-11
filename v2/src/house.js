// Maquette d'architecte de la Maison Aubier : volumes clairs, arêtes tracées à l'encre,
// murs coupés net à 1,25 m en vue maquette, mobilier aux angles adoucis.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { HOUSE, ROOMS, WALLS } from './data.js';

const H = HOUSE.wallHeight;
const LH = HOUSE.levelHeight;
export const CUT = 1.25;

export const C = {
  wall: 0xf8f5ef, wallInt: 0xf1ede5, slab: 0xe7e2d7, oak: 0xd6bc98, oakDark: 0xa8855f,
  stone: 0xdedad0, sage: 0x8a9469, ink: 0x262a1c, linen: 0xefe8dc, white: 0xfdfcf9,
  terra: 0xc4532d, glass: 0xc4d6d2, ground: 0xe9e5da, leaf: 0x7c8b58, leafDark: 0x5f7044,
  deck: 0xb99a78, metal: 0x3d4033, water: 0xa9c6c3, clad: 0xb7926a,
};

// Petit générateur pseudo-aléatoire à graine fixe : les textures sont identiques à chaque chargement.
function rng(seed) { let s = seed; return () => ((s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296); }

function stripeTexture({ base, line, count, seed, jitter = 0.06, grid = false }) {
  const cv = document.createElement('canvas');
  cv.width = cv.height = 512;
  const ctx = cv.getContext('2d');
  const r = rng(seed);
  const col = new THREE.Color(base);
  const w = 512 / count;
  for (let i = 0; i < count; i++) {
    const k = 1 + (r() - 0.5) * jitter * 2;
    ctx.fillStyle = `rgb(${Math.min(255, col.r * 255 * k) | 0},${Math.min(255, col.g * 255 * k) | 0},${Math.min(255, col.b * 255 * k) | 0})`;
    ctx.fillRect(i * w, 0, w + 1, 512);
    if (!grid) { // joints en bout de lame, décalés d'une lame à l'autre
      ctx.fillStyle = line;
      for (let y = r() * 200; y < 512; y += 150 + r() * 120) ctx.fillRect(i * w, y, w, 1.5);
    }
  }
  ctx.fillStyle = line;
  for (let i = 0; i <= count; i++) ctx.fillRect(i * w - 0.75, 0, 1.5, 512);
  if (grid) for (let i = 0; i <= count; i++) ctx.fillRect(0, i * w - 0.75, 512, 1.5);
  const t = new THREE.CanvasTexture(cv);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

export function buildHouse(clipS, clipF) {
  const root = new THREE.Group();
  root.position.set(-HOUSE.width / 2, 0, -HOUSE.depth / 2);
  const cache = new Map();
  const tex = {
    oak: stripeTexture({ base: C.oak, line: 'rgba(90,65,40,0.35)', count: 10, seed: 7 }),
    deck: stripeTexture({ base: C.deck, line: 'rgba(70,50,30,0.5)', count: 12, seed: 11, jitter: 0.09 }),
    stone: stripeTexture({ base: C.stone, line: 'rgba(120,115,100,0.5)', count: 6, seed: 3, jitter: 0.03, grid: true }),
    clad: stripeTexture({ base: C.clad, line: 'rgba(60,40,22,0.6)', count: 16, seed: 5, jitter: 0.1 }),
  };

  // plane : 's' structure (coupée à hauteur de maquette), 'f' mobilier (entier sur le niveau visité), 'n' jamais coupé.
  const mat = (color, plane = 's', o = {}) => {
    const key = color + plane + JSON.stringify(o);
    if (!cache.has(key)) {
      cache.set(key, new THREE.MeshStandardMaterial({
        color, roughness: 0.9, metalness: 0,
        clippingPlanes: plane === 'n' ? [] : [plane === 's' ? clipS : clipF], clipShadows: true, ...o,
      }));
    }
    return cache.get(key);
  };
  const lineMat = new THREE.LineBasicMaterial({ color: C.ink, transparent: true, opacity: 0.42, clippingPlanes: [clipS] });
  const glassMat = mat(C.glass, 's', { transparent: true, opacity: 0.22, roughness: 0.05, depthWrite: false, side: THREE.DoubleSide });
  const cladMat = mat(0xffffff, 's', { map: tex.clad });

  const mesh = (g, geo, material, x, y, z, shadow = true) => {
    const m = new THREE.Mesh(geo, material);
    m.position.set(x, y, z);
    m.castShadow = shadow;
    m.receiveShadow = true;
    g.add(m);
    return m;
  };
  const outline = (m) => {
    const l = new THREE.LineSegments(new THREE.EdgesGeometry(m.geometry), lineMat);
    l.raycast = () => {};
    m.add(l);
  };

  // Structure : boîte à arêtes vives, tracée à l'encre. Avec `base`, elle est scindée à la hauteur
  // de coupe pour que la tranche soit pleine et nette en vue maquette.
  const S = (g, x0, y0, z0, w, h, d, color, { base = null, material = null, shadow = true } = {}) => {
    if (w < 0.005 || h < 0.005 || d < 0.005) return;
    const cut = base == null ? null : base + CUT;
    if (cut != null && y0 < cut - 0.01 && y0 + h > cut + 0.01) {
      S(g, x0, y0, z0, w, cut - y0, d, color, { material, shadow });
      S(g, x0, cut, z0, w, y0 + h - cut, d, color, { material, shadow });
      return;
    }
    outline(mesh(g, new THREE.BoxGeometry(w, h, d), material || mat(color), x0 + w / 2, y0 + h / 2, z0 + d / 2, shadow));
  };
  // Mobilier : angles adoucis, pas de trait.
  const F = (g, x0, y0, z0, w, h, d, color, r = 0.05) => {
    const rad = Math.max(0.004, Math.min(r, w / 2 - 0.002, h / 2 - 0.002, d / 2 - 0.002));
    return mesh(g, new RoundedBoxGeometry(w, h, d, 3, rad), mat(color, 'f'), x0 + w / 2, y0 + h / 2, z0 + d / 2);
  };
  const flat = (g, x0, y0, z0, w, d, color) => mesh(g, new THREE.BoxGeometry(w, 0.02, d), mat(color, 'f'), x0 + w / 2, y0 + 0.01, z0 + d / 2, false);
  const cyl = (g, x, y0, z, r, h, color, r2 = r, plane = 'f') => mesh(g, new THREE.CylinderGeometry(r2, r, h, 24), mat(color, plane), x, y0 + h / 2, z);
  const ball = (g, x, y, z, r, color, plane = 'f') => mesh(g, new THREE.IcosahedronGeometry(r, 2), mat(color, plane, { flatShading: true }), x, y, z);

  // ---------- Murs (depuis WALLS) ----------
  const wall = (g, spec) => {
    const [x1, z1, x2, z2] = spec.p;
    const base = spec.level * LH;
    const t = spec.ext ? 0.26 : 0.12;
    const alongX = z1 === z2;
    const len = alongX ? x2 - x1 : z2 - z1;
    const material = spec.clad ? cladMat : null;
    const color = spec.ext ? C.wall : C.wallInt;
    // pièce de mur entre a et b (le long du mur), de y0 à y1, épaisseur th
    const P = (a, b, y0, y1, th = t, o = {}) => {
      if (alongX) S(g, x1 + a, base + y0, z1 - th / 2, b - a, y1 - y0, th, o.color ?? color, { base, material: o.material ?? material, shadow: o.shadow });
      else S(g, x1 - th / 2, base + y0, z1 + a, th, y1 - y0, b - a, o.color ?? color, { base, material: o.material ?? material, shadow: o.shadow });
    };
    const frame = (a, b, y0, y1) => {
      const fm = { color: C.metal, material: mat(C.metal) };
      const ft = t + 0.03, bar = 0.05;
      P(a, b, y0, y0 + bar, ft, fm); P(a, b, y1 - bar, y1, ft, fm);
      const n = Math.max(1, Math.round((b - a) / 1.25));
      for (let i = 0; i <= n; i++) { const p = a + ((b - a - bar) * i) / n; P(p, p + bar, y0 + bar, y1 - bar, ft, fm); }
      P(a + bar, b - bar, y0 + bar, y1 - bar, 0.025, { material: glassMat, shadow: false });
    };
    let cur = 0;
    [...spec.o].sort((p, q) => p.a - q.a).forEach(({ a, b, k }) => {
      P(cur, a, 0, H);
      if (k === 'd') { P(a, b, 2.1, H); P(a, b, 2.06, 2.1, t + 0.03, { color: C.metal, material: mat(C.metal) }); }
      if (k === 'w') { P(a, b, 0, 0.9); P(a, b, 2.3, H); frame(a, b, 0.9, 2.3); }
      if (k === 'g') { P(a, b, 0, 0.05); P(a, b, 2.55, H); frame(a, b, 0.05, 2.55); }
      cur = b;
    });
    P(cur, len, 0, H);
  };

  // ---------- Petits meubles réutilisés ----------
  const chair = (g, x, y, z, side, color = C.oakDark) => {
    F(g, x, y + 0.38, z, 0.44, 0.07, 0.44, color, 0.03);
    [[0.03, 0.03], [0.37, 0.03], [0.03, 0.37], [0.37, 0.37]].forEach(([dx, dz]) => cyl(g, x + dx + 0.02, y, z + dz + 0.02, 0.018, 0.38, C.metal));
    const back = { n: [x, z + 0.39, 0.44, 0.05], s: [x, z, 0.44, 0.05], e: [x + 0.39, z, 0.05, 0.44], w: [x, z, 0.05, 0.44] }[side];
    F(g, back[0], y + 0.45, back[1], back[2], 0.4, back[3], color, 0.03);
  };
  const plant = (g, x, y, z, s = 1, plane = 'f') => {
    cyl(g, x, y, z, 0.2 * s, 0.42 * s, C.stone, 0.27 * s, plane);
    ball(g, x, y + 0.82 * s, z, 0.36 * s, C.leaf, plane);
    ball(g, x + 0.2 * s, y + 1.12 * s, z - 0.1 * s, 0.27 * s, C.leafDark, plane);
    ball(g, x - 0.16 * s, y + 1.05 * s, z + 0.14 * s, 0.22 * s, C.sage, plane);
  };
  const table = (g, x, y, z, w, d, h = 0.74, color = C.oak) => {
    F(g, x, y + h - 0.05, z, w, 0.05, d, color, 0.02);
    [[0.08, 0.08], [w - 0.08, 0.08], [0.08, d - 0.08], [w - 0.08, d - 0.08]].forEach(([dx, dz]) => cyl(g, x + dx, y, z + dz, 0.025, h - 0.05, C.metal));
  };
  const lamp = (g, x, y, z) => {
    cyl(g, x, y, z, 0.15, 0.02, C.metal); cyl(g, x, y, z, 0.012, 1.45, C.metal);
    cyl(g, x, y + 1.3, z, 0.21, 0.27, C.linen, 0.14);
  };
  const pendant = (g, x, base, z, r = 0.3, color = C.sage) => {
    cyl(g, x, base + 1.9, z, r, 0.22, color, r * 0.3); cyl(g, x, base + 2.12, z, 0.006, H - 2.12, C.metal);
  };
  // Canapé : assise, dossier (côté `back`), accoudoirs et coussins.
  const sofa = (g, x, y, z, w, d, color, back = 'n') => {
    F(g, x, y, z, w, 0.4, d, color, 0.08);
    const bz = back === 'n' ? z + d - 0.22 : z;
    F(g, x, y + 0.3, bz, w, 0.5, 0.22, color, 0.08);
    F(g, x, y + 0.3, z, 0.2, 0.32, d, color, 0.07); F(g, x + w - 0.2, y + 0.3, z, 0.2, 0.32, d, color, 0.07);
    const n = Math.max(2, Math.round(w / 0.9));
    for (let i = 0; i < n; i++) F(g, x + 0.24 + (i * (w - 0.48)) / n, y + 0.4, back === 'n' ? z + 0.08 : z + 0.24, (w - 0.48) / n - 0.04, 0.12, d - 0.34, C.linen, 0.05);
  };
  const bed = (g, x, y, z, w, l, cover) => {
    F(g, x - 0.05, y, z - 0.05, w + 0.1, 0.28, l + 0.1, C.oakDark, 0.04);
    F(g, x, y + 0.28, z, w, 0.22, l, C.white, 0.08);
    F(g, x - 0.02, y + 0.42, z - 0.02, w + 0.04, 0.1, l * 0.58, cover, 0.05);
    const pw = (w - 0.3) / 2;
    F(g, x + 0.1, y + 0.5, z + l - 0.5, pw, 0.13, 0.4, C.linen, 0.06); F(g, x + 0.2 + pw, y + 0.5, z + l - 0.5, pw, 0.13, 0.4, C.linen, 0.06);
    F(g, x - 0.15, y, z + l + 0.05, w + 0.3, 1.1, 0.1, C.sage, 0.04);
  };
  const stairs = (g, base) => {
    const m = mat(C.oak, 'f');
    for (let i = 0; i < 16; i++) mesh(g, new THREE.BoxGeometry(0.28, 0.045, 1.0), m, 3.2 + i * 0.25 + 0.14, base + (i + 1) * (LH / 16) - 0.022, 7.4);
    [6.92, 7.88].forEach((z) => {
      const s = mesh(g, new THREE.BoxGeometry(5.05, 0.22, 0.05), mat(C.metal, 'f'), 5.2, base + 1.42, z);
      s.rotation.z = Math.atan2(LH, 4);
    });
  };
  const slab = (g, base) => {
    S(g, -0.06, base - 0.2, -0.06, 12.12, 0.2, 6.86, C.slab);
    S(g, -0.06, base - 0.2, 6.8, 3.26, 0.2, 1.26, C.slab);
    S(g, 7.2, base - 0.2, 6.8, 4.86, 0.2, 1.26, C.slab);
    S(g, 3.2, base, 6.78, 3.4, 1.0, 0.025, 0, { material: glassMat, shadow: false });
    S(g, 3.2, base + 1.0, 6.76, 3.4, 0.04, 0.06, C.metal);
  };

  const levels = [0, 1, 2].map(() => { const g = new THREE.Group(); root.add(g); return g; });
  const [g0, g1, g2] = levels;
  WALLS.forEach((w) => wall(levels[w.level], w));

  // ---------- Niveau 0 ----------
  S(g0, -0.3, -0.3, -0.3, 12.6, 0.3, 8.6, C.slab);
  stairs(g0, 0);
  flat(g0, 1.4, 0.03, 0.9, 4, 2.9, C.linen);
  sofa(g0, 1.9, 0, 3.0, 2.9, 1.0, C.sage, 'n');
  F(g0, 5.3, 0, 1.5, 0.9, 0.4, 0.9, C.terra, 0.1); F(g0, 6.0, 0.3, 1.5, 0.2, 0.5, 0.9, C.terra, 0.08);
  F(g0, 2.6, 0, 1.7, 1.4, 0.3, 0.75, C.oakDark, 0.04); F(g0, 2.9, 0.3, 1.9, 0.4, 0.04, 0.3, C.white, 0.01);
  F(g0, 0.25, 0, 4.1, 0.45, 0.55, 0.75, C.oak, 0.03);
  lamp(g0, 1.45, 0, 4.45); plant(g0, 6.3, 0, 0.6, 1.2); plant(g0, 0.6, 0, 0.6);
  F(g0, 7.1, 0, 0.3, 0.62, 2.25, 2.2, C.sage, 0.02);
  F(g0, 11.25, 0, 0.3, 0.62, 0.88, 3.9, C.sage, 0.02); F(g0, 11.2, 0.88, 0.28, 0.68, 0.04, 3.94, C.stone, 0.01);
  F(g0, 11.3, 0.92, 1.4, 0.5, 0.02, 0.7, C.metal, 0.005); cyl(g0, 11.72, 0.92, 2.8, 0.015, 0.3, C.metal);
  F(g0, 8.3, 0, 1.6, 2.6, 0.88, 1.0, C.oak, 0.02); F(g0, 8.22, 0.88, 1.52, 2.76, 0.05, 1.16, C.stone, 0.015);
  [8.7, 9.6, 10.5].forEach((x) => { cyl(g0, x, 0, 3.0, 0.025, 0.62, C.metal); cyl(g0, x, 0.62, 3.0, 0.18, 0.05, C.oakDark); pendant(g0, x - 0.1, 0, 2.1, 0.16, C.metal); });
  table(g0, 8.3, 0, 5.75, 2.6, 1.1);
  [8.5, 9.15, 9.8, 10.45].forEach((x) => { chair(g0, x, 0, 5.2, 's'); chair(g0, x, 0, 6.95, 'n'); });
  pendant(g0, 9.6, 0, 6.3, 0.36, C.sage); plant(g0, 11.5, 0, 7.5);
  F(g0, 0.2, 0, 5.25, 0.6, 2.2, 1.5, C.oakDark, 0.02); F(g0, 2.5, 0, 5.2, 0.5, 0.45, 1.2, C.oak, 0.05);
  flat(g0, 1.0, 0.03, 6.6, 1.1, 1.2, C.sage);

  // ---------- Niveau 1 ----------
  const b1 = LH;
  slab(g1, b1); stairs(g1, b1);
  flat(g1, 1.2, b1 + 0.03, 0.9, 3.6, 3, C.linen);
  bed(g1, 2, b1, 1.35, 2, 2.15, C.sage);
  F(g1, 1.25, b1, 3.1, 0.5, 0.45, 0.45, C.oak, 0.03); F(g1, 4.25, b1, 3.1, 0.5, 0.45, 0.45, C.oak, 0.03);
  F(g1, 0.3, b1, 4.3, 3.8, 2.3, 0.55, C.oak, 0.02);
  F(g1, 4.8, b1, 0.6, 0.85, 0.4, 0.85, C.terra, 0.1); lamp(g1, 5.5, b1, 1.7); plant(g1, 0.6, b1, 0.6);
  F(g1, 6.45, b1, 0.5, 1.7, 0.56, 0.8, C.white, 0.14); F(g1, 6.57, b1 + 0.5, 0.62, 1.46, 0.07, 0.56, C.water, 0.1);
  F(g1, 7.85, b1, 1.9, 0.52, 0.82, 1.5, C.oak, 0.02); F(g1, 7.82, b1 + 0.82, 1.88, 0.58, 0.05, 1.54, C.stone, 0.015);
  cyl(g1, 8.1, b1 + 0.87, 2.3, 0.17, 0.08, C.white); cyl(g1, 8.1, b1 + 0.87, 3.0, 0.17, 0.08, C.white);
  S(g1, 6.12, b1, 3.0, 1.1, 2.1, 0.025, 0, { material: glassMat, shadow: false, base: b1 });
  bed(g1, 10.1, b1, 1.75, 1.6, 2.0, C.terra);
  table(g1, 9.3, b1, 0.3, 1.5, 0.6); chair(g1, 9.8, b1, 0.95, 'n');
  F(g1, 8.62, b1, 1.6, 0.6, 2.2, 1.5, C.oak, 0.02); plant(g1, 11.5, b1, 0.7, 0.8);
  [[7.9, 1.0], [10.1, 1.75]].forEach(([x, w]) => {
    F(g1, x, b1, 4.6, w, 2.4, 0.34, C.oakDark, 0.02);
    [0.5, 0.95, 1.4, 1.85].forEach((y, i) => F(g1, x + 0.06, b1 + y, 4.9, w - 0.12, 0.3, 0.06, [C.sage, C.linen, C.terra, C.stone][i], 0.01));
  });
  table(g1, 8.5, b1, 6.2, 2.6, 0.9); chair(g1, 9.0, b1, 7.15, 'n'); chair(g1, 10.2, b1, 7.15, 'n');
  lamp(g1, 11.5, b1, 7.5); plant(g1, 0.7, b1, 5.7); flat(g1, 0.9, b1 + 0.03, 6.0, 2, 1.2, C.sage);

  // ---------- Niveau 2 ----------
  const b2 = LH * 2;
  slab(g2, b2);
  S(g2, -0.5, b2 + H, -0.5, 9, 0.22, 9, C.wall);
  [[-0.5, -0.5, 9, 0.12], [-0.5, 8.38, 9, 0.12], [-0.5, -0.38, 0.12, 8.76], [8.38, -0.38, 0.12, 8.76]].forEach(([x, z, w, d]) => S(g2, x, b2 + H + 0.22, z, w, 0.18, d, C.wall));
  flat(g2, 1.0, b2 + 0.03, 0.9, 4.4, 3.2, C.linen);
  sofa(g2, 1.2, b2, 2.8, 3.4, 1.05, C.sage, 'n');
  F(g2, 1.2, b2, 1.2, 1.0, 0.4, 1.6, C.sage, 0.08); F(g2, 1.2, b2 + 0.3, 1.2, 0.2, 0.5, 1.6, C.sage, 0.08);
  F(g2, 2.7, b2, 1.5, 1.3, 0.3, 0.8, C.oakDark, 0.04);
  F(g2, 5.0, b2, 1.0, 0.85, 0.4, 0.85, C.linen, 0.1); F(g2, 5.0, b2 + 0.3, 1.0, 0.85, 0.5, 0.18, C.linen, 0.08);
  F(g2, 5.9, b2, 3.9, 1.7, 1.05, 0.5, C.oakDark, 0.02); F(g2, 5.85, b2 + 1.05, 3.85, 1.8, 0.05, 0.6, C.stone, 0.015);
  [6.3, 7.1].forEach((x) => { cyl(g2, x, b2, 3.5, 0.025, 0.7, C.metal); cyl(g2, x, b2 + 0.7, 3.5, 0.18, 0.05, C.oak); });
  lamp(g2, 4.9, b2, 3.95); plant(g2, 7.3, b2, 0.7, 1.2); plant(g2, 0.6, b2, 0.6);
  F(g2, 0.2, b2, 5.2, 0.5, 0.82, 1.2, C.oak, 0.02); F(g2, 0.17, b2 + 0.82, 5.18, 0.56, 0.05, 1.24, C.stone, 0.015);
  cyl(g2, 0.45, b2 + 0.87, 5.8, 0.17, 0.08, C.white);
  S(g2, 1.9, b2, 6.8, 0.025, 2.1, 1.1, 0, { material: glassMat, shadow: false, base: b2 });
  // Terrasse : garde-corps, pergola, salon d'extérieur, jardinières
  [[12, 0, 12, 8], [8, 0, 12, 0], [8, 8, 12, 8]].forEach(([x1, z1, x2, z2]) => {
    if (z1 === z2) { S(g2, x1, b2, z1 - 0.012, x2 - x1, 1.1, 0.025, 0, { material: glassMat, shadow: false }); S(g2, x1, b2 + 1.1, z1 - 0.03, x2 - x1, 0.04, 0.06, C.metal); }
    else { S(g2, x1 - 0.012, b2, z1, 0.025, 1.1, z2 - z1, 0, { material: glassMat, shadow: false }); S(g2, x1 - 0.03, b2 + 1.1, z1, 0.06, 0.04, z2 - z1, C.metal); }
  });
  [[8.4, 4.4], [11.6, 4.4], [8.4, 7.6], [11.6, 7.6]].forEach(([x, z]) => S(g2, x - 0.05, b2, z - 0.05, 0.1, 2.5, 0.1, C.metal, { base: b2 }));
  S(g2, 8.3, b2 + 2.5, 4.3, 3.4, 0.12, 0.1, C.metal); S(g2, 8.3, b2 + 2.5, 7.6, 3.4, 0.12, 0.1, C.metal);
  for (let i = 0; i < 9; i++) S(g2, 8.45 + i * 0.39, b2 + 2.62, 4.25, 0.06, 0.1, 3.5, C.oakDark);
  sofa(g2, 8.7, b2, 6.2, 2.4, 0.95, C.linen, 'n'); table(g2, 9.3, b2, 5.1, 1.2, 0.7, 0.4, C.oakDark);
  F(g2, 11.2, b2, 0.4, 0.55, 0.5, 3.2, C.stone, 0.03);
  [0.8, 1.6, 2.4, 3.2].forEach((z, i) => ball(g2, 11.47, b2 + 0.75, z, 0.32 - (i % 2) * 0.06, i % 2 ? C.leafDark : C.leaf));
  F(g2, 8.5, b2, 1.2, 1.9, 0.32, 0.7, C.oak, 0.05); F(g2, 8.5, b2 + 0.32, 1.2, 1.9, 0.08, 0.7, C.linen, 0.04);
  plant(g2, 8.5, b2, 0.5, 1.1);

  // ---------- Sols de pièces (survol, sélection) et circulations ----------
  const roomFloors = [];
  ROOMS.forEach((r) => {
    const kind = r.id === 'terrasse' ? 'deck' : /bain|eau/.test(r.id) ? 'stone' : 'oak';
    const map = tex[kind].clone();
    map.needsUpdate = true;
    map.repeat.set(r.w / (kind === 'stone' ? 3.6 : 1.6), r.d / (kind === 'stone' ? 3.6 : 4));
    const material = new THREE.MeshStandardMaterial({ map, roughness: 0.75, clippingPlanes: [clipS], clipShadows: true, emissive: C.terra, emissiveIntensity: 0 });
    const m = mesh(levels[r.level], new THREE.BoxGeometry(r.w - 0.12, 0.03, r.d - 0.12), material, r.x + r.w / 2, r.level * LH + 0.015, r.z + r.d / 2, false);
    m.userData.roomId = r.id;
    roomFloors.push(m);
  });
  const hall = tex.oak.clone(); hall.needsUpdate = true; hall.repeat.set(7.5, 2);
  const hallMat = mat(0xffffff, 's', { map: hall, roughness: 0.75 });
  mesh(g0, new THREE.BoxGeometry(12, 0.012, 8), hallMat, 6, 0.006, 4, false);
  mesh(g1, new THREE.BoxGeometry(12, 0.012, 6.8), hallMat, 6, b1 + 0.006, 3.4, false);
  mesh(g2, new THREE.BoxGeometry(8, 0.012, 6.8), hallMat, 4, b2 + 0.006, 3.4, false);

  // ---------- Jardin (jamais coupé) ----------
  const garden = new THREE.Group();
  root.add(garden);
  const N = 'n';
  const ground = mesh(garden, new THREE.CircleGeometry(70, 64), mat(C.ground, N, { roughness: 1 }), 6, -0.31, 4, false);
  ground.rotation.x = -Math.PI / 2;
  const gb = (x0, y0, z0, w, h, d, color, r = 0.03) => mesh(garden, new RoundedBoxGeometry(w, h, d, 2, Math.min(r, h / 2 - 0.002)), mat(color, N), x0 + w / 2, y0 + h / 2, z0 + d / 2);
  const deckT = tex.deck.clone(); deckT.needsUpdate = true; deckT.repeat.set(5, 1);
  mesh(garden, new THREE.BoxGeometry(7.6, 0.16, 3.8), mat(0xffffff, N, { map: deckT }), 3.6, -0.22, -2.1);
  gb(8.6, -0.3, -5.6, 4.4, 0.14, 3.2, C.stone); gb(8.85, -0.2, -5.35, 3.9, 0.06, 2.7, C.water, 0.02);
  gb(1.2, -0.14, -2.9, 2.0, 0.36, 0.85, C.linen, 0.1); gb(1.2, 0.1, -3.05, 2.0, 0.4, 0.2, C.linen, 0.08); gb(3.7, -0.14, -2.7, 0.9, 0.3, 0.9, C.oakDark, 0.05);
  [[-2.6, -6.5, 0.9, 9], [-2.6, -7.4, 16, 0.9]].forEach(([x, z, w, d]) => gb(x, -0.3, z, w, 1.0, d, C.leafDark, 0.25));
  for (let i = 0; i < 5; i++) gb(1.15, -0.3, 8.6 + i * 0.95, 0.9, 0.06, 0.6, C.stone, 0.02);
  [[-6, -1, 1.2], [19, 2, 1.3], [18, 10, 1.1], [-6.5, 10, 1.3], [-5, -10, 1.1], [14, 14, 1]].forEach(([x, z, s]) => {
    cyl(garden, x, -0.3, z, 0.17 * s, 2.3 * s, C.oakDark, 0.1 * s, N);
    ball(garden, x, 2.7 * s, z, 1.25 * s, C.leaf, N); ball(garden, x + 0.7 * s, 3.4 * s, z + 0.3 * s, 0.85 * s, C.leafDark, N);
    ball(garden, x - 0.6 * s, 3.2 * s, z - 0.4 * s, 0.75 * s, C.sage, N);
  });
  plant(garden, 7.0, -0.14, -3.2, 1.3, N);

  return { root, levels, roomFloors };
}
