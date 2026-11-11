// Dessins d'architecte générés depuis les données de la maison : élévation sud et plans de niveau.
// Chaque dessin existe en deux calques — le trait (crayon) et l'encre — pour l'effet ink-mask.
import { ROOMS, WALLS } from './data.js';

const INK = '#262a1c', GLASS = '#dfe6e0', ACC = '#c4532d';
let uid = 0;
const n = (v) => +v.toFixed(1);
const fmt = (v) => String(v).replace('.', ',');

// Composant ink-mask : calque trait + calque encre révélé par une vague au bord organique.
// from : 'top' (la vague descend) ou 'bottom' (elle monte, comme une maison qui se construit).
export function inkMask({ w, h, line, ink, from = 'top', cls = '' }) {
  const id = `ink${++uid}`;
  const d0 = from === 'top' ? `M 0 1 Q ${w / 2} 2 ${w} 1 L ${w} 0 L 0 0 Z` : `M 0 ${h - 1} Q ${w / 2} ${h - 2} ${w} ${h - 1} L ${w} ${h} L 0 ${h} Z`;
  const d1 = from === 'top' ? `M 0 ${h} Q ${w / 2} ${h * 1.25} ${w} ${h} L ${w} 0 L 0 0 Z` : `M 0 0 Q ${w / 2} ${-h * 0.25} ${w} 0 L ${w} ${h} L 0 ${h} Z`;
  return `<svg class="ink ${cls}" viewBox="0 0 ${w} ${h}" aria-hidden="true">
    <defs>
      <filter id="${id}f" x="-20%" y="-20%" width="140%" height="140%">
        <feTurbulence type="fractalNoise" baseFrequency="0.045 0.055" numOctaves="4" seed="5" result="noise"/>
        <feDisplacementMap in="SourceGraphic" in2="noise" scale="${Math.round(w / 10)}" xChannelSelector="R" yChannelSelector="G"/>
        <feGaussianBlur stdDeviation="1.8"/>
      </filter>
      <mask id="${id}m" maskUnits="userSpaceOnUse" x="0" y="0" width="${w}" height="${h}">
        <path class="ink-wave" fill="#fff" filter="url(#${id}f)" d="${d0}" data-d1="${d1}"/>
      </mask>
    </defs>
    <g class="ink-line">${line}</g>
    <g class="ink-fill" mask="url(#${id}m)">${ink}</g>
  </svg>`;
}

// ---------- Élévation sud ----------
export function elevation() {
  const W = 1320, Hh = 620, s = 54, X0 = 276, G = 560;
  const X = (x) => n(X0 + x * s), Y = (y) => n(G - y * s);
  const R = (x0, y0, x1, y1, a = '') => `<rect x="${X(x0)}" y="${Y(y1)}" width="${n((x1 - x0) * s)}" height="${n((y1 - y0) * s)}" ${a}/>`;
  const L = (x0, y0, x1, y1, a = '') => `<line x1="${X(x0)}" y1="${Y(y0)}" x2="${X(x1)}" y2="${Y(y1)}" ${a}/>`;
  const D = 'class="draw" pathLength="1"';
  const blocks = [[0, 0, 12, 2.8], [-0.06, 2.8, 12.06, 3], [0, 3, 12, 5.8], [-0.06, 5.8, 12.06, 6], [0, 6, 8, 8.8], [-0.5, 8.8, 8.5, 9.02], [-0.5, 9.02, 8.5, 9.2]];
  const openings = WALLS.filter((w) => w.p[1] === 0 && w.p[3] === 0).flatMap((w) => w.o.map((o) => {
    const b = w.level * 3, x = w.p[0];
    return o.k === 'g' ? [x + o.a, b + 0.05, x + o.b, b + 2.55] : [x + o.a, b + 0.9, x + o.b, b + 2.3];
  }));
  const mull = openings.flatMap(([x0, y0, x1, y1]) => {
    const k = Math.max(1, Math.round((x1 - x0) / 1.25));
    return Array.from({ length: k - 1 }, (_, i) => [x0 + ((x1 - x0) * (i + 1)) / k, y0, y1]);
  });
  const clad = Array.from({ length: 26 }, (_, i) => 0.15 + i * 0.3).filter((x) => x < 8);
  const trees = [[-2.4, 3.1, 1.5], [-3.3, 2.2, 1.0], [17, 3.6, 1.7], [18.2, 2.4, 1.0]];
  const tree = ([x, y, r], a) => `<circle cx="${X(x)}" cy="${Y(y)}" r="${n(r * s)}" ${a}/>`;
  const marks = [[0, 'N0 ±0,00'], [3, 'N1 +3,00'], [6, 'N2 +6,00'], [9.02, '+9,02']];

  const line = `<g fill="none" stroke="${INK}" stroke-width="1.6" stroke-linecap="round">
    ${L(-4.2, 0, 19.2, 0, D)}
    ${blocks.map((b) => R(...b, D)).join('')}
    ${openings.map((o) => R(...o, D)).join('')}
    ${mull.map(([x, y0, y1]) => L(x, y0, x, y1, D)).join('')}
    ${R(8, 6, 12, 7.1, D)}${L(8.4, 6, 8.4, 8.5, D)}${L(11.6, 6, 11.6, 8.5, D)}${L(8.2, 8.5, 11.8, 8.5, D)}${L(8.2, 8.62, 11.8, 8.62, D)}
    ${R(0, -0.25, 7.4, 0, D)}
    ${trees.map((t) => tree(t, D) + L(t[0], 0, t[0], t[1] - t[2], D)).join('')}
    ${marks.map(([y]) => L(12.7, y, 13.3, y, 'class="flow"')).join('')}
  </g>
  <g class="svg-mono" fill="${INK}" opacity="0.72">${marks.map(([y, t]) => `<text x="${X(13.5)}" y="${Y(y) + 4}">${t}</text>`).join('')}</g>`;

  const ink = `<g stroke="${INK}" stroke-width="1.6">
    ${trees.map((t) => tree(t, `fill="${INK}" fill-opacity="0.82"`)).join('')}
    ${[[0, 0, 12, 2.8], [0, 3, 12, 5.8]].map((b) => R(...b, `fill="${INK}"`)).join('')}
    ${R(0, 6, 8, 8.8, `fill="#8d6d4b"`)}
    ${clad.map((x) => L(x, 6, x, 8.8, 'stroke-width="1" stroke-opacity="0.55"')).join('')}
    ${[[-0.06, 2.8, 12.06, 3], [-0.06, 5.8, 12.06, 6], [-0.5, 8.8, 8.5, 9.2]].map((b) => R(...b, 'fill="#e7e2d7"')).join('')}
    ${openings.map((o) => R(...o, `fill="${GLASS}"`)).join('')}
    ${mull.map(([x, y0, y1]) => L(x, y0, x, y1)).join('')}
    ${R(8, 6, 12, 7.1, `fill="${GLASS}" fill-opacity="0.6"`)}${L(8.4, 6, 8.4, 8.5, 'stroke-width="3"')}${L(11.6, 6, 11.6, 8.5, 'stroke-width="3"')}${R(8.2, 8.5, 11.8, 8.62, `fill="${INK}"`)}
    ${R(0, -0.25, 7.4, 0, 'fill="#b99a78"')}
    ${L(-4.2, 0, 19.2, 0, 'stroke-width="3"')}
    ${marks.map(([y]) => L(12.7, y, 13.3, y, `stroke="${ACC}" stroke-width="2"`)).join('')}
  </g>
  <g class="svg-mono" fill="${ACC}">${marks.map(([y, t]) => `<text x="${X(13.5)}" y="${Y(y) + 4}">${t}</text>`).join('')}</g>`;
  return { w: W, h: Hh, line, ink };
}

// ---------- Plan d'un niveau ----------
export function plan(level, { highlight = null } = {}) {
  const W = 1320, Hh = 960, s = 100, M = 60;
  const X = (x) => n(M + x * s), Y = (z) => n(M + (8 - z) * s); // le jardin (sud) est en bas
  const rect = (x0, z0, x1, z1, a = '') => `<rect x="${X(Math.min(x0, x1))}" y="${Y(Math.max(z0, z1))}" width="${n(Math.abs(x1 - x0) * s)}" height="${n(Math.abs(z1 - z0) * s)}" ${a}/>`;
  const D = 'class="draw" pathLength="1"';
  const walls = [], glass = [], doors = [];
  WALLS.filter((w) => w.level === level).forEach((w) => {
    const [x1, z1, x2, z2] = w.p, t = w.ext ? 0.26 : 0.12, ax = z1 === z2, len = ax ? x2 - x1 : z2 - z1;
    const seg = (a, b) => (ax ? [x1 + a, z1 - t / 2, x1 + b, z1 + t / 2] : [x1 - t / 2, z1 + a, x1 + t / 2, z1 + b]);
    let cur = 0;
    [...w.o].sort((p, q) => p.a - q.a).forEach((o) => {
      if (o.a - cur > 0.01) walls.push(seg(cur, o.a));
      if (o.k === 'd') {
        const r = o.b - o.a;
        const [hx, hz] = ax ? [x1 + o.a, z1] : [x1, z1 + o.a];
        doors.push(ax
          ? `M ${X(hx)} ${Y(hz)} L ${X(hx)} ${Y(hz + r)} A ${r * s} ${r * s} 0 0 1 ${X(hx + r)} ${Y(hz)}`
          : `M ${X(hx)} ${Y(hz)} L ${X(hx + r)} ${Y(hz)} A ${r * s} ${r * s} 0 0 0 ${X(hx)} ${Y(hz + r)}`);
      } else glass.push(seg(o.a, o.b));
      cur = o.b;
    });
    if (len - cur > 0.01) walls.push(seg(cur, len));
  });
  const rooms = ROOMS.filter((r) => r.level === level);
  const stair = level < 3 ? Array.from({ length: 17 }, (_, i) => 3.2 + i * 0.25) : [];
  const label = (r, fill) => {
    const cx = X(r.x + r.w / 2), cy = Y(r.z + r.d / 2);
    const words = r.name.toUpperCase();
    return `<text x="${cx}" y="${cy - 4}" text-anchor="middle" fill="${fill}">${words}</text><text x="${cx}" y="${cy + 30}" text-anchor="middle" fill="${fill}" opacity="0.7">${fmt(r.surface)} M²</text>`;
  };
  const terrace = level === 2 ? rect(8, 0, 12, 8, 'fill="none" stroke-dasharray="6 8" class="flow"') : '';
  const deck = level === 2 ? Array.from({ length: 19 }, (_, i) => `<line x1="${X(8.2 + i * 0.2)}" y1="${Y(0.1)}" x2="${X(8.2 + i * 0.2)}" y2="${Y(7.9)}" stroke="${INK}" stroke-opacity="0.22"/>`).join('') : '';
  const dims = `<line x1="${X(0)}" y1="${Y(-0.45)}" x2="${X(12)}" y2="${Y(-0.45)}" class="flow"/><line x1="${X(12.45)}" y1="${Y(0)}" x2="${X(12.45)}" y2="${Y(8)}" class="flow"/>`;
  const dimTxt = (fill) => `<text x="${X(6)}" y="${Y(-0.45) + 26}" text-anchor="middle" fill="${fill}">12,00 M</text><text x="${X(12.45) + 14}" y="${Y(4)}" fill="${fill}" transform="rotate(90 ${X(12.45) + 14} ${Y(4)})" text-anchor="middle">8,00 M</text>`;

  const line = `<g fill="none" stroke="${INK}" stroke-width="2" stroke-linejoin="round">
    ${walls.map((w) => rect(...w, D)).join('')}
    ${glass.map((g) => rect(...g, `${D} stroke-width="1.2"`)).join('')}
    ${doors.map((d) => `<path d="${d}" ${D} stroke-width="1.2"/>`).join('')}
    ${stair.map((x) => `<line x1="${X(x)}" y1="${Y(6.9)}" x2="${X(x)}" y2="${Y(7.9)}" ${D} stroke-width="1.2"/>`).join('')}
    ${terrace}${dims}
  </g>
  <g class="svg-mono svg-mono--plan">${rooms.map((r) => label(r, INK)).join('')}${dimTxt(INK)}</g>`;

  const ink = `<g>
    ${rooms.map((r) => rect(r.x, r.z, r.x + r.w, r.z + r.d, `fill="${r.id === highlight ? ACC : INK}" fill-opacity="${r.id === highlight ? 0.85 : /bain|eau/.test(r.id) ? 0.16 : r.id === 'terrasse' ? 0.05 : 0.09}"`)).join('')}
    ${deck}
    ${walls.map((w) => rect(...w, `fill="${INK}"`)).join('')}
    ${glass.map((g) => rect(...g, `fill="${GLASS}" stroke="${INK}" stroke-width="1.5"`)).join('')}
    ${doors.map((d) => `<path d="${d}" fill="none" stroke="${INK}" stroke-width="1.5"/>`).join('')}
    ${stair.map((x) => `<line x1="${X(x)}" y1="${Y(6.9)}" x2="${X(x)}" y2="${Y(7.9)}" stroke="${INK}" stroke-width="1.5"/>`).join('')}
    <g stroke="${ACC}" stroke-width="2">${dims.replaceAll('class="flow"', '')}</g>
  </g>
  <g class="svg-mono svg-mono--plan">${rooms.map((r) => label(r, r.id === highlight ? '#fff' : INK)).join('')}${dimTxt(ACC)}</g>`;
  return { w: W, h: Hh, line, ink };
}

// Petits pictogrammes au trait pour les quatre atouts.
export const ICONS = [
  `<circle cx="60" cy="60" r="22" class="draw" pathLength="1"/>${[0, 45, 90, 135, 180, 225, 270, 315].map((a) => `<line x1="60" y1="20" x2="60" y2="8" transform="rotate(${a} 60 60)" class="draw" pathLength="1"/>`).join('')}`,
  `<rect x="18" y="22" width="84" height="20" class="draw" pathLength="1"/><rect x="18" y="50" width="84" height="20" class="draw" pathLength="1"/><rect x="18" y="78" width="84" height="20" class="draw" pathLength="1"/><line x1="52" y1="22" x2="52" y2="42" class="draw" pathLength="1"/><line x1="78" y1="50" x2="78" y2="70" class="draw" pathLength="1"/><line x1="40" y1="78" x2="40" y2="98" class="draw" pathLength="1"/>`,
  `<path d="M 78 22 A 40 40 0 1 0 98 78 A 32 32 0 1 1 78 22 Z" class="draw" pathLength="1"/><line x1="16" y1="104" x2="104" y2="104" class="flow"/>`,
  `<rect x="20" y="58" width="80" height="40" class="draw" pathLength="1"/><line x1="12" y1="58" x2="108" y2="58" class="draw" pathLength="1"/><line x1="30" y1="58" x2="30" y2="26" class="draw" pathLength="1"/><line x1="90" y1="58" x2="90" y2="26" class="draw" pathLength="1"/><line x1="22" y1="26" x2="98" y2="26" class="draw" pathLength="1"/><line x1="22" y1="18" x2="98" y2="18" class="flow"/>`,
];
