/**
 * JG 3D embléma — WebGL-motor (Three.js + GLTFLoader).
 *
 * Ezt a modult KIZÁRÓLAG dinamikus importtal töltjük be (EmblemCanvas.tsx),
 * tehát a three.js csak a főoldalon, csak böngészőben, és csak akkor töltődik
 * le, ha a 3D-megjelenítés egyáltalán szóba jöhet. SSR alatt soha nem fut.
 *
 * JELENETHIERARCHIA — egy transzformációt mindig csak EGY szint ír:
 *
 *   scene
 *    └ stage      a nyitás elfordulása (összeállás alatt lassan fordul, a
 *                 helyére érkezve nullára áll). A kész heróban identitás.
 *       └ tilt    pointerre adott kis elfordulás (csak felhasználói mozgásra).
 *          └ recenter   a modell befoglaló dobozának középre igazítása.
 *             └ pivot[i]   elemenkénti összeállás (eltolás + forgás az elem
 *                          SAJÁT középpontja körül). Kész állapotban identitás.
 *                └ unpivot[i]   a pivot eltolásának visszavonása.
 *                   └ GLB node   eredeti helyzet (a GLB idle klipjeit NEM
 *                                játsszuk le: nyugalomban az embléma áll).
 *
 * KAMERA ÉS CANVAS — egyetlen canvas, egyetlen renderer, egyetlen modell a
 * teljes nyitáshoz és a kész heróhoz. A canvas a dokumentum koordináta-
 * rendszerében áll (ld. EmblemCanvas): a `region` téglalap a nyitóképernyő
 * közepét és a hero-slotot is lefedi, így semmilyen szülő nem vágja le.
 *
 * Az objektum mindig a kamera optikai tengelyén van; a képen elfoglalt helyét
 * a principális pont (`setViewOffset`, lens shift) adja, a képméretét a
 * kamera távolsága (valódi dolly: közelebb érve erősödik a perspektíva). A
 * fókusztávolság px-ben rögzített (a slot magasságához kötve), ezért a canvas
 * méretének/helyének változása NEM változtat a perspektíván vagy a méreten:
 * ugyanaz a pont ugyanott marad a dokumentumban.
 */
import {
  Box3,
  DirectionalLight,
  Group,
  HemisphereLight,
  MathUtils,
  Mesh,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  NeutralToneMapping,
  PointLight,
  PerspectiveCamera,
  PMREMGenerator,
  Scene,
  SRGBColorSpace,
  Texture,
  Vector3,
  WebGLRenderer,
  type Material,
  type WebGLRenderTarget,
} from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

export type Rect = { x: number; y: number; w: number; h: number };

/** Minden érték CSS px-ben, a DOKUMENTUM koordinátarendszerében. */
export type EmblemLayout = {
  /** A canvas helye és mérete. */
  region: Rect;
  /** A végső embléma helye (hero-slot). */
  slot: Rect;
  /** A nyitóképernyő közepe és az összeállt objektum magassága ott. */
  intro?: { cx: number; cy: number; size: number };
  /**
   * A hero szövegének és CTA-jának tényleges kiterjedése. Amíg a repülő
   * objektum ezt fedné, a nyitóháttér nem oldódik fel: látható szövegen az
   * objektum soha nem halad át.
   */
  avoid?: Rect;
};

export type EngineOptions = {
  canvas: HTMLCanvasElement;
  modelUrl: string;
  maxDpr: number;
  maxPixels: number;
  /** A helyére érkezés (repülés) kezdete — az oldal kezelhetővé válik. */
  onFlight: () => void;
  /**
   * A nyitóháttér feloldódása (0 → 1) a repülés alatt, képkockánként — így
   * a háttér és az objektum mozgása terhelés alatt sem csúszik el.
   */
  onReveal: (r: number) => void;
  onContextLost: () => void;
  signal: AbortSignal;
};

export type EngineStats = {
  frames: number;
  /** Az utolsó ~180 képkocka közötti időközök (ms). */
  intervals: number[];
  /** Renderhívás CPU-ideje (ms), utolsó ~180. */
  cpu: number[];
  dpr: number;
  drawingBuffer: [number, number];
  renderer: string;
  transmission: boolean;
  /** "intro" | "final" — tesztekhez. */
  mode: string;
  /** Fut-e éppen renderloop (nyugalomban false). */
  looping: boolean;
};

/**
 * A nyitás idővonala (ms, a lejátszás kezdetétől):
 *   0 – assembleMs            a három elem középen összeáll;
 *   assembleMs – flightStart  az összeállt embléma középen, lassan fordul;
 *   flightStart – +flightMs   nagyobb lesz és a hero helyére érkezik, közben
 *                             oldódik fel a nyitóháttér.
 */
export const INTRO = {
  assembleMs: 1150,
  flightStartMs: 1650,
  flightMs: 1400,
};

/** Az összeállt objektum a slot magasságának ekkora részét tölti ki. */
const FILL = 0.86;
/**
 * Fókusztávolság a slot magasságának arányában (= a korábbi 26°-os, slotra
 * illesztett kamera perspektívája). px-ben rögzített, viewporttól független.
 */
const FOCAL_PER_SLOT_H = 0.64 / Math.tan(MathUtils.degToRad(13));

/** A nyitás kezdeti (összeállás közbeni) elfordulása; a végén nulla. */
const ROT_START = { x: 0.24, y: -0.95 };
const ROT_ASSEMBLED = { x: 0.12, y: -0.42 };

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const smoothstep = (t: number) => t * t * (3 - 2 * t);
/**
 * A repülés pályája korábban gyorsul, mint a méret és a forgás: az
 * objektum hamar elhagyja a szöveg környékét, a végén lassan ér célba.
 */
const pathEase = (t: number) => easeInOutCubic(Math.pow(t, 0.65));
const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const clamp01 = (t: number) => Math.min(1, Math.max(0, t));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Elemenkénti összeállási kiindulás (pivot-térben, modellegységben; a modell ~4 egység magas). */
const ASSEMBLY: Record<string, { pos: [number, number, number]; rot: [number, number, number]; delay: number }> = {
  jg_cap_aubergine: { pos: [0, 1.75, -1.1], rot: [0.85, 0.45, -0.18], delay: 0 },
  jg_panel_silver: { pos: [-1.9, -0.45, 1.0], rot: [0.12, 1.05, 0.12], delay: 110 },
  // a fény felé fordulva érkezik: a sötét lap ne olvadjon a háttérbe
  jg_panel_carbon: { pos: [1.9, -0.35, -1.0], rot: [-0.08, 0.8, -0.12], delay: 220 },
};

/**
 * A motor felépítése. Ha bármely lépés hibázik vagy megszakad (AbortSignal),
 * a már létrehozott GPU-erőforrások felszabadulnak, a hiba továbbmegy — a
 * hívó ilyenkor a statikus tartalékot mutatja (újrapróbálás nincs).
 */
export async function createEmblemEngine(opts: EngineOptions) {
  const renderer = new WebGLRenderer({
    canvas: opts.canvas,
    alpha: true,
    antialias: true,
    powerPreference: "low-power",
    failIfMajorPerformanceCaveat: false,
  });
  try {
    return await buildEngine(opts, renderer);
  } catch (err) {
    renderer.dispose();
    renderer.forceContextLoss();
    throw err;
  }
}

async function buildEngine(opts: EngineOptions, renderer: WebGLRenderer) {
  const { canvas, signal } = opts;

  // --- Renderer -------------------------------------------------------------
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = NeutralToneMapping;
  renderer.toneMappingExposure = 0.95;
  // Ha valaha transzmisszió kerülne a jelenetbe: fél felbontású pass.
  renderer.transmissionResolutionScale = 0.5;

  const gl = renderer.getContext();
  const dbg = gl.getExtension("WEBGL_debug_renderer_info");
  const rendererName = dbg ? String(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL)) : "unknown";

  let lost = false;
  const onLost = () => {
    lost = true;
    halt();
    opts.onContextLost();
  };
  canvas.addEventListener("webglcontextlost", onLost);

  const scene = new Scene();
  const camera = new PerspectiveCamera(26, 1, 0.1, 100);

  // --- Modell (ELŐSZÖR: hibás/hiányzó GLB esetén gyors kilépés) -------------
  const loader = new GLTFLoader();
  const res = await fetch(opts.modelUrl, { signal });
  if (!res.ok) throw new Error(`GLB HTTP ${res.status}`);
  const buf = await res.arrayBuffer();
  const gltf = await loader.parseAsync(buf, "");
  if (signal.aborted) throw new DOMException("aborted", "AbortError");

  // --- Környezet és fények (procedurális, nincs HDR-fájl) -------------------
  const pmrem = new PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  // 128-as kocka elég a lágy környezeti fényhez (a 256-os négyszer drágább).
  const envRT: WebGLRenderTarget = pmrem.fromScene(room, 0.04, 0.1, 100, { size: 128 });
  room.dispose();
  scene.environment = envRT.texture;
  scene.environmentIntensity = 0.85;

  const key = new DirectionalLight(0xfff6f0, 1.6);
  key.position.set(-3.2, 5.5, 6);
  const rim = new DirectionalLight(0xd8c6e6, 1.15);
  rim.position.set(4.5, 2.5, -4.5);
  const fill = new HemisphereLight(0xe9e4ee, 0x1b161c, 0.35);
  // Közeli csúcsfény bal felül: a felső üveglapon mozgó fényátmenet.
  const sheen = new PointLight(0xfff4fb, 11, 0, 2);
  sheen.position.set(-2.7, 1.0, 4.8);
  scene.add(key, rim, fill, sheen);

  const stage = new Group();
  const tilt = new Group();
  const recenter = new Group();
  stage.add(tilt);
  tilt.add(recenter);
  scene.add(stage);

  const root = gltf.scene;
  const nodes = ["jg_cap_aubergine", "jg_panel_silver", "jg_panel_carbon"].map((n) => {
    const o = root.getObjectByName(n);
    if (!o) throw new Error(`Hiányzó node: ${n}`);
    return o;
  });

  const box = new Box3().setFromObject(root);
  const center = box.getCenter(new Vector3());
  const size = box.getSize(new Vector3());
  recenter.position.copy(center).multiplyScalar(-1);
  const objectH = size.y;

  const pivots: { pivot: Group; delay: number; from: { pos: Vector3; rot: Vector3 } }[] = [];
  for (const node of nodes) {
    const base = node.position.clone();
    const pivot = new Group();
    const unpivot = new Group();
    pivot.position.copy(base);
    unpivot.position.copy(base).multiplyScalar(-1);
    pivot.add(unpivot);
    unpivot.add(node);
    recenter.add(pivot);
    const a = ASSEMBLY[node.name];
    pivots.push({ pivot, delay: a.delay, from: { pos: new Vector3(...a.pos), rot: new Vector3(...a.rot) } });
  }
  const pivotBase = pivots.map((p) => p.pivot.position.clone());

  // Anyaghangolás — a Blender stúdiófénye nincs a GLB-ben, itt állítjuk be.
  let transmission = false;
  recenter.traverse((o) => {
    const mesh = o as Mesh;
    if (!mesh.isMesh) return;
    const m = mesh.material as MeshStandardMaterial | MeshPhysicalMaterial;
    if (m.name === "JG_Brushed_Silver") {
      m.envMapIntensity = 0.72; // ne égjen ki fehérre (szélső pointer-dőlésben sem)
      m.roughness = 0.34;
    } else if (m.name === "JG_Matte_Carbon") {
      m.color.setRGB(0.036, 0.034, 0.042); // ne olvadjon a sötét háttérbe
      m.envMapIntensity = 1.6;
      m.roughness = 0.42;
    } else if (m.name === "JG_Aubergine_Glass" && (m as MeshPhysicalMaterial).isMeshPhysicalMaterial) {
      const g = m as MeshPhysicalMaterial;
      // KÖLTSÉGDÖNTÉS (mérve): a valódi transzmisszió külön renderpasst és
      // mipmap-generálást igényel; szoftveres renderelőn 251 → 780 ms/kép.
      // Sötét háttér előtt ráadásul fekete foltként hatna. Helyette olcsó
      // üveg-közelítés: enyhén áttetsző, lakkozott fizikai anyag.
      g.transmission = 0;
      g.transparent = true;
      g.opacity = 0.9;
      g.depthWrite = true;
      g.roughness = 0.48;
      g.metalness = 0.04;
      g.color.setRGB(0.19, 0.1, 0.18);
      g.clearcoat = 1;
      g.clearcoatRoughness = 0.32;
      g.envMapIntensity = 1.35;
      g.specularIntensity = 1;
      transmission = g.transmission > 0;
    }
  });
  // A GLB idle klipjei (gltf.animations) szándékosan NINCSENEK lejátszva.

  // --- Kamera ---------------------------------------------------------------
  const CAM_AZ = 0.34; // kissé jobbról: látszik a lapok vastagsága és a perspektíva
  const CAM_EL = 0.16; // kissé felülről
  const camDir = new Vector3(
    Math.sin(CAM_AZ) * Math.cos(CAM_EL),
    Math.sin(CAM_EL),
    Math.cos(CAM_AZ) * Math.cos(CAM_EL),
  ).normalize();

  let L: EmblemLayout | null = null;
  let dpr = 1;
  /** A repülés azon pontja (0–1), ahonnan a nyitóháttér oldódhat (ld. avoid). */
  let revealFrom = 0;

  /** A canvas elhelyezése és a rajzpuffer mérete (a kép NEM ugrik: ld. fent). */
  function applyRegion(layout: EmblemLayout) {
    L = layout;
    const r = layout.region;
    const w = Math.max(1, Math.round(r.w));
    const h = Math.max(1, Math.round(r.h));
    // transformmal (nem left/top-pal): a canvas áthelyezése nem layout shift
    canvas.style.transform = `translate3d(${Math.round(r.x)}px, ${Math.round(r.y)}px, 0)`;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    dpr = Math.min(window.devicePixelRatio || 1, opts.maxDpr);
    if (w * h * dpr * dpr > opts.maxPixels) dpr = Math.sqrt(opts.maxPixels / (w * h));
    renderer.setPixelRatio(dpr);
    renderer.setSize(w, h, false);
    revealFrom = computeRevealFrom(layout);
  }

  /** Az objektum képernyő-befoglalója (közelítés) a repülés f pontjában. */
  function flightBox(layout: EmblemLayout, f: number) {
    const s = layout.slot;
    const i = layout.intro!;
    const p = pathEase(f);
    const cx = lerp(i.cx, s.x + s.w / 2, p);
    const cy = lerp(i.cy, s.y + s.h / 2, p);
    const size = lerp(i.size, s.h * FILL, easeInOutCubic(f));
    const hw = size * 0.46; // szélesség/magasság ≈ 0,77, plusz elfordulás
    const hh = size * 0.53;
    return { l: cx - hw, r: cx + hw, t: cy - hh, b: cy + hh };
  }

  function computeRevealFrom(layout: EmblemLayout) {
    const a = layout.avoid;
    if (!layout.intro || !a) return 0;
    const m = 10;
    let last = -1;
    for (let k = 0; k <= 60; k++) {
      const f = k / 60;
      const b = flightBox(layout, f);
      const hit = b.r > a.x - m && b.l < a.x + a.w + m && b.b > a.y - m && b.t < a.y + a.h + m;
      if (hit) last = f;
    }
    // legalább a repülés utolsó ~35%-a a feltárulásé
    return last < 0 ? 0 : Math.min(0.65, last + 1 / 60);
  }

  /**
   * Kamera: principális pont a dokumentum (px, py) pontján, az objektum
   * képmagassága `sizePx`. A fókusztávolság px-ben állandó.
   */
  function aim(px: number, py: number, sizePx: number) {
    if (!L) return;
    const rx = Math.round(L.region.x);
    const ry = Math.round(L.region.y);
    const rw = Math.max(1, Math.round(L.region.w));
    const rh = Math.max(1, Math.round(L.region.h));
    const f = FOCAL_PER_SLOT_H * L.slot.h;
    const lx = px - rx;
    const ly = py - ry;
    const fullW = 2 * Math.max(lx, rw - lx, 1);
    const fullH = 2 * Math.max(ly, rh - ly, 1);
    camera.fov = MathUtils.radToDeg(2 * Math.atan(fullH / 2 / f));
    camera.aspect = fullW / fullH;
    camera.setViewOffset(fullW, fullH, fullW / 2 - lx, fullH / 2 - ly, rw, rh);
    const dist = (f * objectH) / Math.max(1, sizePx);
    camera.near = Math.max(0.05, dist * 0.15);
    camera.far = dist * 6;
    camera.position.copy(camDir).multiplyScalar(dist);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  }

  // --- Állapot ----------------------------------------------------------------
  type Mode = "final" | "intro";
  let mode: Mode = "final";
  let introT = 0; // az utoljára kirajzolt intro-időpont (ms)
  let introT0 = 0;
  let flightSent = false;
  let introResolve: (() => void) | null = null;

  const pointer = { tx: 0, ty: 0, x: 0, y: 0 };
  let clockLast = 0;
  let raf = 0;
  let active = true;
  const stats: EngineStats = {
    frames: 0,
    intervals: [],
    cpu: [],
    dpr: 0,
    drawingBuffer: [0, 0],
    renderer: rendererName,
    transmission,
    mode,
    looping: false,
  };

  function applyFinalPose() {
    stage.rotation.set(0, 0, 0);
    pivots.forEach((p, i) => {
      p.pivot.position.copy(pivotBase[i]);
      p.pivot.rotation.set(0, 0, 0);
    });
    tilt.rotation.set(pointer.y * 0.1, pointer.x * 0.2, 0);
    if (!L) return;
    const s = L.slot;
    aim(s.x + s.w / 2, s.y + s.h / 2, s.h * FILL);
  }

  function applyIntro(t: number) {
    introT = t;
    // 1) Elemenkénti összeállás (mind az assembleMs végére ér a helyére).
    pivots.forEach((p, i) => {
      const k = easeOutCubic(clamp01((t - p.delay) / (INTRO.assembleMs - p.delay)));
      const inv = 1 - k;
      p.pivot.position.copy(pivotBase[i]).addScaledVector(p.from.pos, inv);
      p.pivot.rotation.set(p.from.rot.x * inv, p.from.rot.y * inv, p.from.rot.z * inv);
    });
    // 2) Az egész lassan fordul az összeállás és a megállás alatt…
    const d = easeOutCubic(clamp01(t / INTRO.flightStartMs));
    // 3) …majd a repülés alatt a végleges nézetbe áll.
    const f = easeInOutCubic(clamp01((t - INTRO.flightStartMs) / INTRO.flightMs));
    const rx = lerp(ROT_START.x, ROT_ASSEMBLED.x, d) * (1 - f);
    const ry = lerp(ROT_START.y, ROT_ASSEMBLED.y, d) * (1 - f);
    stage.rotation.set(rx, ry, 0);
    tilt.rotation.set(0, 0, 0);
    if (!L) return;
    const s = L.slot;
    const i = L.intro ?? { cx: s.x + s.w / 2, cy: s.y + s.h / 2, size: s.h * FILL };
    const fr = clamp01((t - INTRO.flightStartMs) / INTRO.flightMs);
    const p = pathEase(fr);
    aim(lerp(i.cx, s.x + s.w / 2, p), lerp(i.cy, s.y + s.h / 2, p), lerp(i.size, s.h * FILL, f));
  }

  /** A nyitóháttér feloldódása a repülés t időpontjában (0 → 1). */
  function revealAt(t: number) {
    const fr = clamp01((t - INTRO.flightStartMs) / INTRO.flightMs);
    const span = Math.max(0.3, (1 - revealFrom) * 0.92);
    return smoothstep(clamp01((fr - revealFrom) / span));
  }

  function draw() {
    const c0 = performance.now();
    renderer.render(scene, camera);
    stats.frames++;
    stats.cpu.push(performance.now() - c0);
    if (stats.cpu.length > 180) stats.cpu.shift();
    stats.dpr = dpr;
    stats.drawingBuffer = [canvas.width, canvas.height];
    stats.mode = mode;
  }

  /** Kell-e még képkocka: intro alatt mindig; nyugalomban csak amíg a pointer-dőlés célba nem ér. */
  const settled = () => Math.abs(pointer.tx - pointer.x) < 4e-4 && Math.abs(pointer.ty - pointer.y) < 4e-4;
  const wantsLoop = () => active && !lost && (mode === "intro" || !settled());

  function frame() {
    raf = 0;
    stats.looping = false;
    if (lost) return;
    // Egyetlen időalap: performance.now() (a rAF-paraméter helyett is).
    const now = performance.now();
    const dt = clockLast ? Math.min(0.05, (now - clockLast) / 1000) : 1 / 60;
    if (clockLast) {
      stats.intervals.push(now - clockLast);
      if (stats.intervals.length > 180) stats.intervals.shift();
    }
    clockLast = now;

    if (mode === "intro") {
      const t = now - introT0;
      applyIntro(t);
      if (!flightSent && t >= INTRO.flightStartMs) {
        flightSent = true;
        try {
          opts.onFlight();
        } catch {}
      }
      if (flightSent) {
        try {
          opts.onReveal(revealAt(t));
        } catch {}
      }
      if (t >= INTRO.flightStartMs + INTRO.flightMs) endIntro();
    } else {
      // Nyugalom: csak a felhasználó egérmozgására adott kis elfordulás.
      const k = Math.min(1, dt * 4);
      pointer.x += (pointer.tx - pointer.x) * k;
      pointer.y += (pointer.ty - pointer.y) * k;
      if (settled()) {
        pointer.x = pointer.tx;
        pointer.y = pointer.ty;
      }
      tilt.rotation.set(pointer.y * 0.1, pointer.x * 0.2, 0);
    }
    draw();

    if (wantsLoop()) {
      raf = requestAnimationFrame(frame);
      stats.looping = true;
    } else {
      clockLast = 0;
    }
  }

  function kick() {
    if (!raf && wantsLoop()) {
      raf = requestAnimationFrame(frame);
      stats.looping = true;
    }
  }
  function halt() {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    clockLast = 0;
    stats.looping = false;
  }

  function endIntro() {
    if (mode !== "intro") return;
    mode = "final";
    stats.mode = mode;
    applyFinalPose();
    const r = introResolve;
    introResolve = null;
    if (r) r();
  }

  // Shaderfordítás (a canvas még láthatatlan).
  applyFinalPose();
  await renderer.compileAsync(scene, camera);
  if (signal.aborted) throw new DOMException("aborted", "AbortError");

  return {
    stats,
    /**
     * Elhelyezés (régió, slot, intro-középpont) — azonnal, ugyanabban a
     * feladatban újrarajzolva, így a canvas áthelyezése nem villan.
     */
    setLayout(layout: EmblemLayout) {
      applyRegion(layout);
      if (mode === "intro") applyIntro(introT);
      else applyFinalPose();
      if (!lost) draw();
    },
    /** A nyitás kezdőképe: a szétnyílt elemek a képernyő közepén. */
    prepareIntro() {
      mode = "intro";
      stats.mode = mode;
      flightSent = false;
      applyIntro(0);
      draw();
    },
    playIntro(): Promise<void> {
      return new Promise((resolve) => {
        introResolve = resolve;
        mode = "intro";
        introT0 = performance.now();
        clockLast = 0;
        kick();
      });
    },
    /** Kihagyás / megszakítás: azonnal a végleges póz, a loop leáll. */
    finishIntro() {
      endIntro();
      halt();
      if (!lost) draw();
    },
    /** Kész hero intro nélkül (ismételt látogatás, mélyhivatkozás, kimaradt intro). */
    showFinal() {
      mode = "final";
      stats.mode = mode;
      applyFinalPose();
      if (!lost) draw();
    },
    /** Láthatóság (IntersectionObserver / háttérfül): képernyőn kívül nincs renderelés. */
    setActive(a: boolean) {
      active = a;
      if (!a) halt();
      else kick();
    },
    /** Egérmozgás: kis elfordulás; csak a célba érésig fut a loop, utána leáll. */
    setPointer(nx: number, ny: number) {
      pointer.tx = MathUtils.clamp(nx, -1, 1);
      pointer.ty = MathUtils.clamp(ny, -1, 1);
      if (mode === "final") kick();
    },
    isIntro() {
      return mode === "intro";
    },
    /** Teljes takarítás: loop, geometriák, anyagok, textúrák, env RT, renderer. */
    dispose() {
      halt();
      lost = true;
      canvas.removeEventListener("webglcontextlost", onLost);
      const textures = new Set<Texture>();
      const materials = new Set<Material>();
      scene.traverse((o) => {
        const mesh = o as Mesh;
        if (!mesh.isMesh) return;
        mesh.geometry.dispose();
        const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        for (const m of mats) {
          materials.add(m);
          for (const v of Object.values(m)) if (v instanceof Texture) textures.add(v);
        }
      });
      textures.forEach((t) => t.dispose());
      materials.forEach((m) => m.dispose());
      envRT.dispose();
      pmrem.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
    },
  };
}

export type EmblemEngine = Awaited<ReturnType<typeof buildEngine>>;
