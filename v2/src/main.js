// Maison Aubier v2 — structure et langage animé repris du crawl heronaiapp.com (skill anim-heron),
// contenu, dessins et maquette propres au triplex.
import '@fontsource-variable/archivo';
import '@fontsource-variable/jetbrains-mono';
import './style.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import Lenis from 'lenis';
import { LEVELS, ROOMS, ATOUTS, MATIERES } from './data.js';
import { createTour } from './tour.js';
import { inkMask, elevation, plan, ICONS } from './drawings.js';

gsap.registerPlugin(ScrollTrigger, SplitText);
ScrollTrigger.config({ invalidateOnRefresh: true });
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
// ?static fige le site dans son état final (comme « mouvement réduit ») : utile pour relire la mise en page.
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches || new URLSearchParams(location.search).has('static');
if (reduced) document.documentElement.classList.add('static');
const fmt = (v) => String(v).replace('.', ',');
const pad = (v, l = 2) => String(v).padStart(l, '0');
document.documentElement.classList.add('js');

// ---------- [05] Boutons : sprite de 20 images généré au vol, joué en steps(19) ----------
(function sprite() {
  const cv = document.createElement('canvas');
  cv.width = 2000; cv.height = 100;
  const ctx = cv.getContext('2d');
  let s = 9; const r = () => ((s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296);
  for (let f = 0; f < 20; f++) {
    const edge = (f / 19) * 118 - 9; // le front dépasse un peu pour finir plein
    ctx.beginPath(); ctx.moveTo(f * 100, 0);
    for (let y = 0; y <= 100; y += 5) ctx.lineTo(f * 100 + Math.max(0, Math.min(100, edge + (f === 0 || f === 19 ? 0 : (r() - 0.5) * 22))), y);
    ctx.lineTo(f * 100, 100); ctx.closePath(); ctx.fill();
  }
  document.documentElement.style.setProperty('--sprite', `url(${cv.toDataURL()})`);
})();
$$('[data-btn]').forEach((b) => {
  const t = b.textContent.trim();
  b.innerHTML = `<span class="btn-bg"></span><span class="btn-label mono"><span class="btn-roll"><span>${t}</span><span aria-hidden="true">${t}</span></span></span><span class="btn-ic" aria-hidden="true"><span class="btn-roll"><span>→</span><span>→</span></span></span>`;
});

// ---------- Dessins ----------
const elev = elevation();
$('#loader-draw').innerHTML = inkMask({ ...elev, from: 'bottom', cls: 'ink--loader' });
$('#hero-draw').innerHTML = `<svg class="hero-line" viewBox="0 0 ${elev.w} ${elev.h}">${elev.line}</svg><svg class="hero-ink" viewBox="0 0 ${elev.w} ${elev.h}">${elev.ink}</svg>`;
const drawings = { plan0: () => plan(0), elevation: () => ({ ...elev, from: 'bottom' }) };
$$('[data-ink]').forEach((el) => { el.innerHTML = inkMask(drawings[el.dataset.ink]()); });

$('#matieres').innerHTML = MATIERES.map((m) => `<li class="mono" data-block>${m}</li>`).join('');
$('#atouts').innerHTML = ATOUTS.map((a, i) => `
  <article class="atout" data-block>
    <i class="plus tl"></i><i class="plus tr"></i><i class="plus bl"></i><i class="plus br"></i>
    <header class="mono"><span>${a.tag}</span><span>[${pad(i + 1)}]</span></header>
    <svg class="atout-ic" viewBox="0 0 120 120" fill="none" stroke="currentColor" stroke-width="1.6">${ICONS[i]}</svg>
    <h3 class="h4">${a.title}</h3>
    <p>${a.text}</p>
  </article>`).join('');
const words = ['Jardin', 'Nuit', 'Ciel', '240 m²', 'Chêne massif', 'Pierre claire', 'Plein sud', 'Terrasse 32 m²'];
$('#marquee').innerHTML = [...words, ...words].map((w) => `<span>${w}</span><i></i>`).join('');

// ---------- [06] Rail fixe : un état par niveau ----------
$('#rail').innerHTML = LEVELS.map((l, i) => `
  <div class="why-bar${i ? '' : ' is-active'}">
    <span class="mono">${l.tag}</span><h3>${l.name}</h3><p>${l.line}</p><i class="dot"></i>
  </div>`).join('');
$('#stage').innerHTML = LEVELS.map((l) => `
  <div class="why-state" data-level="${l.id}">
    <div class="why-plan box"><i class="plus tl"></i><i class="plus tr"></i><i class="plus bl"></i><i class="plus br"></i>${inkMask(plan(l.id))}</div>
    <ul class="why-rooms mono">${ROOMS.filter((r) => r.level === l.id).map((r) => `<li><button type="button" data-goto="${r.id}"><span>${r.name}</span><span>${fmt(r.surface)} M²</span></button></li>`).join('')}</ul>
  </div>`).join('');

// ---------- Pièces : accordéon ----------
$('#rooms-list').innerHTML = ROOMS.map((r, i) => `
  <li class="room" data-room-item="${r.id}">
    <button type="button" class="room-row" aria-expanded="false">
      <span class="mono room-num">[${pad(i + 1)}]</span><span class="room-name">${r.name}</span>
      <span class="mono room-surf">${fmt(r.surface)} M² · N${r.level}</span><span class="room-plus" aria-hidden="true"></span>
    </button>
    <div class="room-panel"><div class="room-panel-inner">
      <p>${r.desc}</p>
      <ul class="mono">${r.features.map((f) => `<li>${f}</li>`).join('')}</ul>
      <button type="button" class="room-link mono" data-goto="${r.id}">Voir en 3D →</button>
    </div></div>
    <i class="room-line"></i>
  </li>`).join('');
function previewRoom(id) {
  const r = ROOMS.find((x) => x.id === id);
  const p = plan(r.level, { highlight: id });
  $('#room-plan').innerHTML = `<svg viewBox="0 0 ${p.w} ${p.h}">${p.ink}</svg>`;
  const img = $('#room-img');
  img.hidden = true;
  img.onload = () => { img.hidden = false; };
  img.alt = `${r.name} de la Maison Aubier`;
  img.src = `/media/rooms/${id}.jpg`;
}
function openRoom(li) {
  $$('.room').forEach((x) => {
    const on = x === li && !x.classList.contains('is-open');
    x.classList.toggle('is-open', on);
    $('.room-row', x).setAttribute('aria-expanded', on);
    gsap.to($('.room-panel', x), { height: on ? 'auto' : 0, duration: reduced ? 0 : 0.6, ease: 'power3.out', onComplete: () => ScrollTrigger.refresh() });
  });
  previewRoom(li.dataset.roomItem);
}
$('#rooms-list').addEventListener('click', (e) => { const row = e.target.closest('.room-row'); if (row) openRoom(row.parentElement); });
$('#rooms-list').addEventListener('pointerover', (e) => { const li = e.target.closest('.room'); if (li && e.pointerType === 'mouse') previewRoom(li.dataset.roomItem); });
previewRoom(ROOMS[0].id);

// ---------- [01] Défilement doux ----------
const lenis = new Lenis({ duration: 1, smoothWheel: !reduced });
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((t) => lenis.raf(t * 1000));
gsap.ticker.lagSmoothing(0);
$$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
  const target = $(a.getAttribute('href'));
  if (!target) return;
  e.preventDefault();
  lenis.scrollTo(target, { duration: 1.6 });
}));

// ---------- Visite 3D ----------
const levelsEl = $('#levels'), roomsEl = $('#rooms'), tip = $('#tip');
levelsEl.innerHTML = `<button type="button" role="tab" data-level="all">Ensemble</button>` + LEVELS.map((l) => `<button type="button" role="tab" data-level="${l.id}">${l.tag}</button>`).join('');
function onChange(s) {
  $$('[data-level]', levelsEl).forEach((b) => {
    const on = s.level == null ? b.dataset.level === 'all' : +b.dataset.level === s.level;
    b.classList.toggle('is-active', on); b.setAttribute('aria-selected', on);
  });
  const list = s.level == null ? ROOMS : ROOMS.filter((r) => r.level === s.level);
  roomsEl.innerHTML = list.map((r) => `<li><button type="button" data-room="${r.id}" class="${r.id === s.roomId ? 'is-active' : ''}"><span>${r.name}</span><small class="mono">${fmt(r.surface)} M²</small></button></li>`).join('');
  $$('[data-view]').forEach((b) => b.classList.toggle('is-active', b.dataset.view === s.view));
  $('#visite').dataset.view = s.view;
  const level = s.level != null ? LEVELS[s.level] : null;
  const d = s.room
    ? { tag: `${level.tag} · ${level.name}`, title: s.room.name, surface: `${fmt(s.room.surface)} M²`, desc: s.room.desc, features: s.room.features }
    : level
      ? { tag: level.tag, title: level.name, surface: `${ROOMS.filter((r) => r.level === level.id).length} PIÈCES`, desc: `${level.line} Cliquez une pièce pour vous en approcher.`, features: [] }
      : { tag: 'Vue d’ensemble', title: 'Maison Aubier', surface: '240 M² · 3 NIVEAUX', desc: 'Cliquez un niveau de la maquette, puis une pièce. Glissez pour tourner autour.', features: [] };
  const card = $('#card'), photo = $('#card-photo'), img = $('#card-img');
  const body = $$('#card > :not(.plus):not(.tour-controls)');
  gsap.to(body, {
    opacity: 0, y: 8, duration: reduced ? 0 : 0.15, ease: 'circ.in', overwrite: true, onComplete() {
      $('#card-tag').textContent = d.tag;
      $('#card-title').textContent = d.title;
      $('#card-surface').textContent = d.surface;
      $('#card-desc').textContent = d.desc;
      $('#card-features').innerHTML = d.features.map((f) => `<li>${f}</li>`).join('');
      photo.hidden = true;
      if (s.room) { img.onload = () => { photo.hidden = false; }; img.alt = `${s.room.name} de la Maison Aubier`; img.src = `/media/rooms/${s.room.id}.jpg`; }
      gsap.to(body, { opacity: 1, y: 0, duration: reduced ? 0 : 1, ease: 'power3.out', stagger: 0.03 });
    },
  });
  card.dataset.mode = s.mode;
}
function onHover(h) {
  if (!h) { tip.hidden = true; return; }
  tip.textContent = h.room ? `${h.room.name} · ${fmt(h.room.surface)} M²` : `${LEVELS[h.level].tag} · ${LEVELS[h.level].name}`;
  const b = $('#visite').getBoundingClientRect();
  tip.style.transform = `translate(${h.x - b.left + 14}px, ${h.y - b.top + 14}px)`;
  tip.hidden = false;
}
const tour = createTour($('#scene'), { onChange, onHover });
window.__tour = tour; window.__gsap = gsap; // pratiques pour tester depuis la console
onChange({ ...tour.state, room: null });
levelsEl.addEventListener('click', (e) => { const b = e.target.closest('[data-level]'); if (b) (b.dataset.level === 'all' ? tour.showOverview() : tour.showLevel(+b.dataset.level)); });
roomsEl.addEventListener('click', (e) => { const b = e.target.closest('[data-room]'); if (b) tour.showRoom(b.dataset.room); });
$$('[data-view]').forEach((b) => b.addEventListener('click', () => tour.setView(b.dataset.view)));
$('#prev').addEventListener('click', () => tour.step(-1));
$('#next').addEventListener('click', () => tour.step(1));
document.addEventListener('click', (e) => {
  const b = e.target.closest('[data-goto]'); if (!b) return;
  lenis.scrollTo('#visite', { duration: 1.6, onComplete: () => tour.showRoom(b.dataset.goto, 'doll') });
});
addEventListener('keydown', (e) => {
  const r = $('#visite').getBoundingClientRect();
  if (r.top > innerHeight * 0.5 || r.bottom < innerHeight * 0.5) return;
  if (e.key === 'ArrowRight') tour.step(1);
  if (e.key === 'ArrowLeft') tour.step(-1);
  if (e.key === 'Escape') tour.showOverview();
});

// ---------- [09] Curseur : coordonnées, projecteur d'encre, parallaxe ----------
const xy = $('#xy');
addEventListener('pointermove', (e) => { xy.textContent = `X: ${pad(Math.round(e.clientX), 4)} PX   Y: ${pad(Math.round(e.clientY), 4)} PX`; }, { passive: true });
function spotlight(zone, target = zone) {
  const set = (x, y) => { target.style.setProperty('--mx', x); target.style.setProperty('--my', y); };
  const move = (e) => { const r = target.getBoundingClientRect(); const p = e.touches ? e.touches[0] : e; set(`${p.clientX - r.left}px`, `${p.clientY - r.top}px`); };
  zone.addEventListener('mousemove', move);
  zone.addEventListener('touchmove', move, { passive: true });
  zone.addEventListener('mouseleave', () => set('-48rem', '-48rem'));
  if (matchMedia('(hover: none)').matches) set('50%', '55%'); // tactile : un état visible par défaut
}
spotlight($('#hero-stage'), $('.hero-ink'));
spotlight($('#giant'));
if (!reduced) {
  const yTo = gsap.quickTo('#hero-draw', 'y', { duration: 0.5, ease: 'power3' });
  const sTo = gsap.quickTo('#hero-draw', 'scale', { duration: 0.5, ease: 'power3' });
  $('#hero-stage').addEventListener('mousemove', (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    yTo(((e.clientY - r.top) / r.height - 0.5) * 5);
    sTo(1 - Math.abs((e.clientX - r.left) / r.width - 0.5) * 0.04);
  });
}

// ---------- Film ----------
const film = $('#film-video'), toggle = $('#film-toggle');
toggle.addEventListener('click', () => { film.paused ? film.play() : film.pause(); });
film.addEventListener('play', () => { toggle.textContent = 'PAUSE'; });
film.addEventListener('pause', () => { toggle.textContent = 'LECTURE'; });
ScrollTrigger.create({ trigger: film, start: 'top 80%', end: 'bottom 20%', onToggle: (s) => { if (reduced) return; s.isActive ? film.play().catch(() => {}) : film.pause(); } });

// ---------- [02][03][04] Révélations, encre, tracés : montés une fois les polices prêtes ----------
function initScroll() {
  // Rail : la barre active suit le plan visible
  const bars = $$('.why-bar');
  $$('.why-state').forEach((state, i) => ScrollTrigger.create({
    trigger: state, start: 'top 55%', end: 'bottom 45%',
    onToggle: (self) => { if (self.isActive) bars.forEach((b, j) => b.classList.toggle('is-active', j === i)); },
  }));
  if (reduced) { // tout est posé dans son état final, sans animation
    $$('.ink-wave').forEach((w) => w.setAttribute('d', w.dataset.d1));
    $('.giant-ink').style.setProperty('--fill', '100%');
    return;
  }
  $$('[data-lines]').forEach((el) => {
    SplitText.create(el, {
      type: 'lines', mask: 'lines', autoSplit: true,
      onSplit: (self) => gsap.from(self.lines, { yPercent: 100, duration: 0.8, ease: 'power2.out', stagger: 0.02, scrollTrigger: { trigger: el, start: 'top 88%', once: true } }),
    });
  });
  $$('[data-block]').forEach((el) => gsap.from(el, { opacity: 0, y: 24, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 90%', once: true } }));
  $$('[data-img] video, [data-img] img').forEach((el) => gsap.from(el, { scale: 1.2, duration: 1.6, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 85%', once: true } }));

  // Texte d'intro qui se remplit mot à mot, lié au défilement
  const fill = SplitText.create('#fill-text', { type: 'words' });
  gsap.fromTo(fill.words, { color: 'var(--disable)' }, { color: 'var(--ink)', ease: 'none', stagger: 0.1, scrollTrigger: { trigger: '#fill-text', start: 'top 80%', end: 'bottom 45%', scrub: true } });

  // Vagues d'encre liées au défilement + tracé des traits à l'entrée
  $$('.ink:not(.ink--loader)').forEach((svg) => {
    const wave = $('.ink-wave', svg);
    gsap.to(wave, { attr: { d: wave.dataset.d1 }, ease: 'none', scrollTrigger: { trigger: svg, start: 'top 72%', end: 'top 18%', scrub: true } });
  });
  $$('.ink:not(.ink--loader), .atout-ic, .hero-line').forEach((svg) => {
    const paths = $$('.draw', svg);
    paths.forEach((p, i) => p.style.setProperty('--d', `${((i / Math.max(1, paths.length)) * 1.8).toFixed(2)}s`));
    ScrollTrigger.create({ trigger: svg, start: 'top 85%', once: true, onEnter: () => svg.classList.add('is-inview') });
  });

  // Géant du pied de page : l'encre monte au défilement
  gsap.fromTo('.giant-ink', { '--fill': '0%' }, { '--fill': '100%', ease: 'none', scrollTrigger: { trigger: '#giant', start: 'top 95%', end: 'bottom 100%', scrub: true } });
  ScrollTrigger.refresh();
}

// ---------- [04] Chargement : la façade se trace, puis s'encre de bas en haut ----------
function loader() {
  const el = $('#loader');
  const done = () => { el.remove(); document.documentElement.classList.remove('is-loading'); lenis.start(); };
  if (reduced) { initScroll(); done(); return; }
  document.documentElement.classList.add('is-loading');
  lenis.stop();
  const svg = $('.ink--loader'), wave = $('.ink-wave', svg), pct = { v: 0 };
  const tl = gsap.timeline({ onComplete: done });
  tl.to($$('.draw', svg), { strokeDashoffset: 0, duration: 1.3, ease: 'power2.inOut', stagger: { amount: 2, from: 'start' } }, 0.2)
    .from('.loader-info > *, .loader-info dt, .loader-info dd', { opacity: 0, y: 8, duration: 0.5, stagger: 0.04, ease: 'power3.out' }, 0.2)
    .from('#loader-log li', { opacity: 0, duration: 0.01, stagger: 0.3 }, 0.5)
    .to(wave, { attr: { d: wave.dataset.d1 }, duration: 2.4, ease: 'power1.inOut' }, 1.2)
    .fromTo('#loader-pct', { top: '100%' }, { top: '0%', duration: 2.4, ease: 'power1.inOut' }, 1.2)
    .to(pct, { v: 100, duration: 2.4, ease: 'power1.inOut', onUpdate: () => { $('#loader-pct').textContent = `${pad(Math.round(pct.v), 3)} %`; } }, 1.2)
    .add(initScroll, 3.7)
    .to(el, { yPercent: -100, duration: 1, ease: 'expo.inOut' }, 3.8);
}
document.fonts.ready.then(loader);
