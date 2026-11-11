import '@fontsource-variable/fraunces';
import '@fontsource-variable/inter';
import './style.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { LEVELS, ROOMS, STATS } from './data.js';
import { createTour } from './tour.js';

gsap.registerPlugin(ScrollTrigger);
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const EXPO = 'expo.out';

// ---------- Défilement doux ----------
const lenis = new Lenis({ duration: 1.1, smoothWheel: !reduced });
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((t) => lenis.raf(t * 1000));
gsap.ticker.lagSmoothing(0);
$$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
  const target = $(a.getAttribute('href'));
  if (!target) return;
  e.preventDefault();
  lenis.scrollTo(target, { offset: 0 });
}));
ScrollTrigger.create({ start: 80, onUpdate: (s) => $('#nav').classList.toggle('is-scrolled', s.scroll() > 80) });

// ---------- Hero ----------
const title = $('[data-split]');
title.innerHTML = [...title.textContent].map((c) => `<span class="char"><span>${c === ' ' ? '&nbsp;' : c}</span></span>`).join('');
if (!reduced) gsap.from('.char > span', { yPercent: 110, duration: 1.4, ease: EXPO, stagger: 0.04, delay: 0.15 });

$('#stats').innerHTML = STATS.map((s) => `<div><dt><span data-count="${s.value}">0</span>${s.unit ? ` <small>${s.unit}</small>` : ''}</dt><dd>${s.label}</dd></div>`).join('');
$$('[data-count]').forEach((el) => {
  const o = { v: 0 }, end = +el.dataset.count;
  gsap.to(o, { v: end, duration: reduced ? 0 : 1.8, ease: 'power2.out', delay: 0.6, onUpdate: () => { el.textContent = Math.round(o.v); } });
});

// ---------- Apparitions ----------
$$('[data-reveal]').forEach((el) => {
  ScrollTrigger.create({ trigger: el, start: 'top 88%', once: true, onEnter: () => el.classList.add('is-visible') });
});

// ---------- Film ----------
const film = $('#film');
film.addEventListener('error', () => { film.hidden = true; $('#film-fallback').hidden = false; });

// ---------- Niveaux (section éditoriale) ----------
$('#floors').innerHTML = LEVELS.map((l) => `
  <article class="floor" data-reveal>
    <span class="floor__num">${l.id}</span>
    <div>
      <p class="label">${l.tag}</p>
      <h3>${l.name}</h3>
      <p>${l.line}</p>
    </div>
    <ul>${ROOMS.filter((r) => r.level === l.id).map((r) => `<li><button type="button" data-goto="${r.id}">${r.name}<small>${String(r.surface).replace('.', ',')} m²</small></button></li>`).join('')}</ul>
  </article>`).join('');
$$('#floors [data-reveal]').forEach((el) => {
  ScrollTrigger.create({ trigger: el, start: 'top 88%', once: true, onEnter: () => el.classList.add('is-visible') });
});

// ---------- Visite 3D ----------
const levelsEl = $('#levels'), roomsEl = $('#rooms'), tip = $('#tip');
levelsEl.innerHTML = `<button type="button" role="tab" data-level="all">Ensemble</button>` +
  LEVELS.map((l) => `<button type="button" role="tab" data-level="${l.id}">${l.tag}</button>`).join('');

const fmt = (n) => String(n).replace('.', ',');
function renderRooms(level) {
  const list = level == null ? ROOMS : ROOMS.filter((r) => r.level === level);
  roomsEl.innerHTML = list.map((r) => `<li><button type="button" data-room="${r.id}"><span>${r.name}</span><small>${fmt(r.surface)} m²</small></button></li>`).join('');
}

function onChange(s) {
  $$('[data-level]', levelsEl).forEach((b) => {
    const on = s.level == null ? b.dataset.level === 'all' : +b.dataset.level === s.level;
    b.classList.toggle('is-active', on);
    b.setAttribute('aria-selected', on);
  });
  renderRooms(s.level);
  $$('[data-room]', roomsEl).forEach((b) => b.classList.toggle('is-active', b.dataset.room === s.roomId));
  $$('[data-view]').forEach((b) => b.classList.toggle('is-active', b.dataset.view === s.view));
  $('#visite').dataset.view = s.view;

  const card = $('#card'), photo = $('#card-photo'), img = $('#card-img');
  const level = s.level != null ? LEVELS[s.level] : null;
  const data = s.room
    ? { tag: `${level.tag} · ${level.name}`, title: s.room.name, surface: `${fmt(s.room.surface)} m²`, desc: s.room.desc, features: s.room.features }
    : level
      ? { tag: level.tag, title: level.name, surface: `${ROOMS.filter((r) => r.level === level.id).length} pièces`, desc: `${level.line} Cliquez une pièce pour vous en approcher.`, features: [] }
      : { tag: 'Vue d’ensemble', title: 'Maison Aubier', surface: '240 m² · 3 niveaux', desc: 'Cliquez un niveau de la maquette, puis une pièce. Glissez pour tourner autour.', features: [] };
  gsap.to(card, {
    opacity: 0, y: 8, duration: reduced ? 0 : 0.22, ease: 'power2.in', onComplete() {
      $('#card-tag').textContent = data.tag;
      $('#card-title').textContent = data.title;
      $('#card-surface').textContent = data.surface;
      $('#card-desc').textContent = data.desc;
      $('#card-features').innerHTML = data.features.map((f) => `<li>${f}</li>`).join('');
      photo.hidden = true;
      if (s.room) {
        img.onload = () => { photo.hidden = false; };
        img.onerror = () => { photo.hidden = true; };
        img.alt = `${s.room.name} de la Maison Aubier`;
        img.src = `/media/rooms/${s.room.id}.jpg`;
      }
      gsap.to(card, { opacity: 1, y: 0, duration: reduced ? 0 : 0.7, ease: EXPO });
    },
  });
}

function onHover(h) {
  if (!h) { tip.hidden = true; return; }
  tip.textContent = h.room ? `${h.room.name} · ${fmt(h.room.surface)} m²` : `${LEVELS[h.level].tag} · ${LEVELS[h.level].name}`;
  const b = $('#visite').getBoundingClientRect();
  tip.style.transform = `translate(${h.x - b.left + 14}px, ${h.y - b.top + 14}px)`;
  tip.hidden = false;
}

const tour = createTour($('#scene'), { onChange, onHover });
window.__tour = tour; // pratique pour tester depuis la console
onChange({ ...tour.state, room: null });

levelsEl.addEventListener('click', (e) => {
  const b = e.target.closest('[data-level]'); if (!b) return;
  b.dataset.level === 'all' ? tour.showOverview() : tour.showLevel(+b.dataset.level);
});
roomsEl.addEventListener('click', (e) => { const b = e.target.closest('[data-room]'); if (b) tour.showRoom(b.dataset.room); });
$$('[data-view]').forEach((b) => b.addEventListener('click', () => tour.setView(b.dataset.view)));
$('#prev').addEventListener('click', () => tour.step(-1));
$('#next').addEventListener('click', () => tour.step(1));
$('#floors').addEventListener('click', (e) => {
  const b = e.target.closest('[data-goto]'); if (!b) return;
  lenis.scrollTo('#visite', { onComplete: () => tour.showRoom(b.dataset.goto, 'doll') });
});
addEventListener('keydown', (e) => {
  const r = $('#visite').getBoundingClientRect();
  if (r.top > innerHeight * 0.5 || r.bottom < innerHeight * 0.5) return;
  if (e.key === 'ArrowRight') tour.step(1);
  if (e.key === 'ArrowLeft') tour.step(-1);
  if (e.key === 'Escape') tour.showOverview();
});
