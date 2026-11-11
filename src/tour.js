// Visite 3D : caméra, coupe par niveau, navigation pièce par pièce.
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import gsap from 'gsap';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { HOUSE, ROOMS } from './data.js';
import { buildHouse } from './house.js';

const LH = HOUSE.levelHeight;
const OFF = new THREE.Vector3(-HOUSE.width / 2, 0, -HOUSE.depth / 2);
const CUT_OPEN = 12;
const BG = 0xf3efe8;

export function createTour(canvas, { onChange = () => {}, onHover = () => {} } = {}) {
  const reduced = document.documentElement.classList.contains('static') || matchMedia('(prefers-reduced-motion: reduce)').matches;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setClearColor(BG);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.localClippingEnabled = true;
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(BG, 45, 95);

  const camera = new THREE.PerspectiveCamera(35, 1, 0.05, 200);
  const clip = new THREE.Plane(new THREE.Vector3(0, -1, 0), CUT_OPEN);
  const clipF = new THREE.Plane(new THREE.Vector3(0, -1, 0), CUT_OPEN);
  const { root, roomFloors } = buildHouse(clip, clipF);
  scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.4;
  scene.add(root);

  scene.add(new THREE.HemisphereLight(0xfffaf2, 0xe6dccb, 0.75));
  scene.add(new THREE.AmbientLight(0xfff6ea, 0.4));
  const sun = new THREE.DirectionalLight(0xfff1dc, 2.4);
  sun.position.set(-8, 24, -11);
  sun.shadow.intensity = 0.65;
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -18, right: 18, top: 18, bottom: -18, near: 1, far: 60 });
  sun.shadow.bias = -0.0004;
  sun.shadow.normalBias = 0.03;
  scene.add(sun);

  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.enablePan = false;
  controls.enableZoom = false; // la molette reste au défilement de la page
  controls.autoRotateSpeed = 0.5;

  const state = { mode: 'overview', level: null, roomId: null, view: 'doll' };
  const byId = Object.fromEntries(ROOMS.map((r) => [r.id, r]));
  const aspectFit = () => Math.max(1, 1.55 / camera.aspect);

  // ---------- Points de vue ----------
  const poses = {
    overview() {
      const k = aspectFit();
      return { pos: [29 * k, 18 * k, -27 * k], target: [-1.2, 3.4, 0], fov: 35, cut: CUT_OPEN };
    },
    level(l) {
      const base = l * LH, k = aspectFit();
      return { pos: [0.01, base + 24 * k, -11.5 * k], target: [0, base, 0], fov: 35, cut: base + 1.252 };
    },
    doll(r) {
      const base = r.level * LH, k = aspectFit();
      const cx = r.x + r.w / 2 + OFF.x, cz = r.z + r.d / 2 + OFF.z, s = Math.max(r.w, r.d);
      return {
        pos: [cx - 0.05 * Math.max(21, s * 4.2) * k, base + 0.4 + 0.84 * Math.max(21, s * 4.2) * k, cz - 0.54 * Math.max(21, s * 4.2) * k],
        target: [cx, base + 0.4, cz], fov: 35, cut: base + 1.252,
      };
    },
    eye(r) {
      const base = r.level * LH;
      const from = new THREE.Vector3(r.x + r.eye.from[0] * r.w + OFF.x, base + 1.55, r.z + r.eye.from[1] * r.d + OFF.z);
      const to = new THREE.Vector3(r.x + r.eye.to[0] * r.w + OFF.x, base + 1.15, r.z + r.eye.to[1] * r.d + OFF.z);
      const target = from.clone().add(to.sub(from).normalize().multiplyScalar(0.4));
      return { pos: from.toArray(), target: target.toArray(), fov: 70, cut: CUT_OPEN };
    },
  };

  let tween = null;
  function flyTo(p, duration = 1.9) {
    tween?.kill();
    controls.enabled = false;
    controls.autoRotate = false;
    const eyeView = p.fov > 50;
    const from = { px: camera.position.x, py: camera.position.y, pz: camera.position.z, tx: controls.target.x, ty: controls.target.y, tz: controls.target.z, fov: camera.fov, cut: clip.constant, cutF: clipF.constant };
    // En entrant en immersion on rouvre la coupe tout de suite ; en sortant, on coupe à la fin.
    tween = gsap.to(from, {
      px: p.pos[0], py: p.pos[1], pz: p.pos[2], tx: p.target[0], ty: p.target[1], tz: p.target[2], fov: p.fov, cut: p.cut, cutF: p.cut >= CUT_OPEN ? CUT_OPEN : p.cut + 1.498,
      duration: reduced ? 0.01 : duration, ease: 'power3.inOut',
      onUpdate() {
        camera.position.set(from.px, from.py, from.pz);
        controls.target.set(from.tx, from.ty, from.tz);
        camera.fov = from.fov;
        clip.constant = from.cut;
        clipF.constant = from.cutF;
        camera.updateProjectionMatrix();
        camera.lookAt(controls.target);
      },
      onComplete() {
        controls.minPolarAngle = eyeView ? 0.9 : 0.12;
        controls.maxPolarAngle = eyeView ? 2.1 : 1.3;
        controls.rotateSpeed = eyeView ? -0.35 : 0.6;
        controls.enabled = true;
        controls.autoRotate = state.mode === 'overview' && !reduced;
        controls.update();
      },
    });
  }

  function paintFloors() {
    roomFloors.forEach((m) => {
      const active = m.userData.roomId === state.roomId && state.view === 'doll';
      gsap.to(m.material, { emissiveIntensity: active ? 0.2 : 0, duration: 0.6, overwrite: true });
    });
  }
  function emit() { paintFloors(); onChange({ ...state, room: state.roomId ? byId[state.roomId] : null }); }

  const api = {
    state,
    showOverview() { Object.assign(state, { mode: 'overview', level: null, roomId: null, view: 'doll' }); flyTo(poses.overview()); emit(); },
    showLevel(l) { Object.assign(state, { mode: 'level', level: l, roomId: null, view: 'doll' }); flyTo(poses.level(l)); emit(); },
    showRoom(id, view = state.view) {
      const r = byId[id]; if (!r) return;
      Object.assign(state, { mode: 'room', level: r.level, roomId: id, view });
      flyTo(view === 'eye' ? poses.eye(r) : poses.doll(r), view === 'eye' ? 2.3 : 1.8);
      emit();
    },
    setView(view) {
      if (state.roomId) return api.showRoom(state.roomId, view);
      state.view = view;
      if (view === 'eye') api.showRoom(ROOMS.find((r) => r.level === (state.level ?? 0)).id, 'eye');
      else emit();
    },
    step(dir) {
      const i = ROOMS.findIndex((r) => r.id === state.roomId);
      const next = ROOMS[(i + dir + ROOMS.length) % ROOMS.length];
      api.showRoom(i < 0 ? ROOMS[0].id : next.id);
    },
    start() { setRunning(true); },
  };

  // ---------- Survol et clic ----------
  const ray = new THREE.Raycaster();
  const ptr = new THREE.Vector2();
  let down = null, hovered = null;
  const pick = (e) => {
    const b = canvas.getBoundingClientRect();
    ptr.set(((e.clientX - b.left) / b.width) * 2 - 1, -((e.clientY - b.top) / b.height) * 2 + 1);
    ray.setFromCamera(ptr, camera);
    if (state.mode === 'overview') {
      const hit = ray.intersectObject(root, true).find((h) => h.point.y > -0.1 && h.point.y < 9.1 && Math.abs(h.point.x) < 6.6 && Math.abs(h.point.z) < 4.6);
      return hit ? { level: Math.min(2, Math.max(0, Math.floor(hit.point.y / LH))) } : null;
    }
    if (state.view === 'eye') return null;
    const hit = ray.intersectObjects(roomFloors.filter((m) => byId[m.userData.roomId].level === state.level))[0];
    return hit ? { roomId: hit.object.userData.roomId } : null;
  };
  canvas.addEventListener('pointerdown', (e) => { down = [e.clientX, e.clientY]; });
  canvas.addEventListener('pointerup', (e) => {
    if (!down || Math.hypot(e.clientX - down[0], e.clientY - down[1]) > 6) return;
    const hit = pick(e);
    if (hit?.roomId) api.showRoom(hit.roomId, 'doll');
    else if (hit && 'level' in hit) api.showLevel(hit.level);
  });
  canvas.addEventListener('pointermove', (e) => {
    if (e.pointerType === 'touch') return;
    const hit = pick(e);
    const id = hit?.roomId ?? (hit && 'level' in hit ? 'level-' + hit.level : null);
    canvas.style.cursor = id ? 'pointer' : 'grab';
    if (id !== hovered) {
      hovered = id;
      roomFloors.forEach((m) => {
        if (m.userData.roomId === state.roomId) return;
        gsap.to(m.material, { emissiveIntensity: m.userData.roomId === id ? 0.1 : 0, duration: 0.35, overwrite: true });
      });
    }
    onHover(hit ? { room: hit.roomId ? byId[hit.roomId] : null, level: hit.level ?? null, x: e.clientX, y: e.clientY } : null);
  });
  canvas.addEventListener('pointerleave', () => { hovered = null; onHover(null); paintFloors(); });
  controls.addEventListener('start', () => { controls.autoRotate = false; });

  // ---------- Boucle de rendu (seulement quand la section est visible) ----------
  let running = false, raf = 0;
  function frame() {
    if (controls.enabled) controls.update();
    renderer.render(scene, camera);
    raf = requestAnimationFrame(frame);
  }
  function setRunning(on) {
    if (on === running) return;
    running = on;
    cancelAnimationFrame(raf);
    if (on) frame();
  }
  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  new ResizeObserver(resize).observe(canvas);
  new IntersectionObserver(([e]) => setRunning(e.isIntersecting), { threshold: 0.01 }).observe(canvas);
  resize();

  const p = poses.overview();
  camera.position.set(...p.pos);
  controls.target.set(...p.target);
  controls.minPolarAngle = 0.12;
  controls.maxPolarAngle = 1.3;
  controls.autoRotate = !reduced;
  controls.update();
  renderer.render(scene, camera);

  return api;
}
