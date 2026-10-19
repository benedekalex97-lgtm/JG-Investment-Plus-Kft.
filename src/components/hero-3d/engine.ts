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
 *    └ stage      kompozíció + hero-pozíció: az intro repülése (pozíció,
 *                 skála, enyhe forgás). A kész heróban identitás.
 *       └ tilt    pointerre adott kis elfordulás + nagyon finom himbálózás.
 *          └ recenter   a modell befoglaló dobozának középre igazítása.
 *             └ pivot[i]   elemenkénti összeállás (eltolás + forgás az elem
 *                          SAJÁT középpontja körül). Kész állapotban identitás.
 *                └ unpivot[i]   a pivot eltolásának visszavonása.
 *                   └ GLB node   eredeti helyzet; az idle klipek (8 s, zárt
 *                                ciklus, t=0 == alaphelyzet) csak ezt írják.
 *
 * Kamera: egyetlen perspektivikus kamera, egyetlen canvas az intróhoz és a
 * kész heróhoz. A canvas mérete az intro alatt nem változik; a principális
 * pontot `setViewOffset` tolja a slot közepére, így a végső kompozíció
 * perspektívája olyan, mintha a kamera az emblémára nézne.
 */
import {
  AnimationMixer,
  Box3,
  DirectionalLight,
  Group,
  HemisphereLight,
  LoopRepeat,
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
  type AnimationAction,
  type Material,
  type WebGLRenderTarget,
} from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

export type Rect = { x: number; y: number; w: number; h: number };

export type EngineOptions = {
  canvas: HTMLCanvasElement;
  modelUrl: string;
  /** A canvas CSS-mérete és benne a slot (a végső embléma helye), CSS px-ben. */
  measure: () => { canvas: { w: number; h: number }; slot: Rect };
  /** Az intro kezdőpontja a canvason belül (CSS px) — a slot közepétől eltolva. */
  introStart?: () => { x: number; y: number; scale: number };
  maxDpr: number;
  maxPixels: number;
  onContextLost: () => void;
  signal: AbortSignal;
};

export type EngineStats = {
  frames: number;
  /** Az utolsó ~120 képkocka közötti időközök (ms). */
  intervals: number[];
  /** Renderhívás CPU-ideje (ms), utolsó ~120. */
  cpu: number[];
  dpr: number;
  drawingBuffer: [number, number];
  renderer: string;
  transmission: boolean;
};

const INTRO = {
  assembleMs: 760,
  flightStartMs: 420,
  flightMs: 1300,
};

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const clamp01 = (t: number) => Math.min(1, Math.max(0, t));

/** Elemenkénti összeállási kiindulás (pivot-térben, modellegységben). */
const ASSEMBLY: Record<string, { pos: [number, number, number]; rot: [number, number, number]; delay: number }> = {
  jg_cap_aubergine: { pos: [0, 0.85, -0.9], rot: [0.42, 0.12, -0.06], delay: 0 },
  jg_panel_silver: { pos: [-0.85, -0.18, 0.7], rot: [0.04, 0.55, 0.05], delay: 80 },
  jg_panel_carbon: { pos: [0.85, -0.18, -0.7], rot: [-0.04, 0.38, -0.05], delay: 150 }, // a fény felé: ne tűnjön el
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
    stop();
    opts.onContextLost();
  };
  canvas.addEventListener("webglcontextlost", onLost);

  const scene = new Scene();
  const camera = new PerspectiveCamera(26, 1, 0.1, 60);

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
  // Közeli csúcsfény bal felül: a felső üveglapon mozgó fényátmenet (a
  // renderelt referencián is ez adja az üveg karakterét).
  const sheen = new PointLight(0xfff4fb, 11, 0, 2);
  sheen.position.set(-2.7, 1.0, 4.8); // tükrözve az üveglap bal felére esik
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

  const pivots: { name: string; pivot: Group; delay: number; from: { pos: Vector3; rot: Vector3 } }[] = [];
  for (const node of nodes) {
    const base = node.position.clone();
    const pivot = new Group();
    const unpivot = new Group();
    pivot.position.copy(base);
    unpivot.position.copy(base).multiplyScalar(-1);
    pivot.add(unpivot);
    unpivot.add(node); // a node lokális (klip által írt) transzformációja változatlan
    recenter.add(pivot);
    const a = ASSEMBLY[node.name];
    pivots.push({ name: node.name, pivot, delay: a.delay, from: { pos: new Vector3(...a.pos), rot: new Vector3(...a.rot) } });
  }

  // Anyaghangolás — a Blender stúdiófénye nincs a GLB-ben, itt állítjuk be.
  let transmission = false;
  // A node-ok már a pivot-hierarchiában vannak (nem a gltf.scene alatt).
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
      m.roughness = 0.42; // szélesebb tükröződés: minden szögből kirajzolódik
    } else if (m.name === "JG_Aubergine_Glass" && (m as MeshPhysicalMaterial).isMeshPhysicalMaterial) {
      const g = m as MeshPhysicalMaterial;
      // KÖLTSÉGDÖNTÉS (mérve): a valódi transzmisszió külön renderpasst és
      // mipmap-generálást igényel; szoftveres renderelőn 251 → 780 ms/kép.
      // Sötét háttér előtt ráadásul fekete foltként hatna. Helyette olcsó
      // üveg-közelítés: enyhén áttetsző, lakkozott fizikai anyag, amelyen a
      // környezet és a fények tükröződése mozog.
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

  // Idle klipek: a mesh-ekkel azonos nevű, 8 s-os zárt ciklusok.
  // A klipek a node-okat NÉV szerint keresik: a gyökér a recenter csoport.
  const mixer = new AnimationMixer(recenter);
  const actions: AnimationAction[] = gltf.animations.map((clip) => {
    const a = mixer.clipAction(clip);
    a.setLoop(LoopRepeat, Infinity);
    return a;
  });

  // --- Kamera és méretezés --------------------------------------------------
  const CAM_AZ = 0.34; // kissé jobbról: látszik a lapok vastagsága és a perspektíva
  const CAM_EL = 0.16; // kissé felülről
  const camDir = new Vector3(
    Math.sin(CAM_AZ) * Math.cos(CAM_EL),
    Math.sin(CAM_EL),
    Math.cos(CAM_AZ) * Math.cos(CAM_EL),
  ).normalize();
  let fit = { canvasW: 1, canvasH: 1, dpr: 1 };
  const objectH = size.y;

  function layout() {
    const { canvas: c, slot } = opts.measure();
    const w = Math.max(1, Math.round(c.w));
    const h = Math.max(1, Math.round(c.h));
    let dpr = Math.min(window.devicePixelRatio || 1, opts.maxDpr);
    if (w * h * dpr * dpr > opts.maxPixels) dpr = Math.sqrt(opts.maxPixels / (w * h));
    renderer.setPixelRatio(dpr);
    renderer.setSize(w, h, false);
    fit = { canvasW: w, canvasH: h, dpr };

    // Virtuális teljes keret, amelynek KÖZEPE a slot közepe (lens shift).
    const cx = slot.x + slot.w / 2;
    const cy = slot.y + slot.h / 2;
    const fullW = 2 * Math.max(cx, w - cx);
    const fullH = 2 * Math.max(cy, h - cy);
    camera.aspect = fullW / fullH;
    camera.setViewOffset(fullW, fullH, fullW / 2 - cx, fullH / 2 - cy, w, h);
    // Távolság: az objektum magassága a slot ~86%-át töltse ki.
    const fillPx = slot.h * 0.86;
    const visibleH = (objectH * fullH) / fillPx;
    const dist = visibleH / (2 * Math.tan(MathUtils.degToRad(camera.fov / 2)));
    camera.position.copy(camDir).multiplyScalar(dist);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  }
  layout();

  /** Egy canvas-pont (CSS px) világkoordinátája a z=0 síkon (kamera felőli mélység szerint). */
  function screenToWorld(px: number, py: number, depth = 0) {
    const ndc = new Vector3((px / fit.canvasW) * 2 - 1, -(py / fit.canvasH) * 2 + 1, 0.5);
    ndc.unproject(camera);
    const dir = ndc.sub(camera.position).normalize();
    const plane = new Vector3(0, 0, depth).sub(camera.position);
    const n = camDir.clone().multiplyScalar(-1);
    const t = plane.dot(n) / dir.dot(n);
    return camera.position.clone().add(dir.multiplyScalar(t));
  }

  // --- Állapot ----------------------------------------------------------------
  type Mode = "final" | "intro";
  let mode: Mode = "final";
  let introT0 = 0;
  let introResolve: (() => void) | null = null;
  const introFrom = { pos: new Vector3(), scale: 0.62, rotY: -0.42, rotX: 0.14, z: -1.6 };

  const pointer = { tx: 0, ty: 0, x: 0, y: 0 };
  let clockLast = 0;
  let idleT = 0;
  let raf = 0;
  /** Elindult-e már az élő (intro vagy idle) üzem. */
  let live = false;
  let paused = false;
  let active = true;
  /** Fut-e a renderloop: intro alatt mindig, idle-ben csak nem szüneteltetve. */
  const wantsLoop = () => live && active && !lost && (mode === "intro" || !paused);
  const stats: EngineStats = {
    frames: 0,
    intervals: [],
    cpu: [],
    dpr: 0,
    drawingBuffer: [0, 0],
    renderer: rendererName,
    transmission,
  };

  const pivotBase = pivots.map((p) => p.pivot.position.clone());

  function applyFinalPose() {
    stage.position.set(0, 0, 0);
    stage.scale.setScalar(1);
    stage.rotation.set(0, 0, 0);
    pivots.forEach((p, i) => {
      p.pivot.position.copy(pivotBase[i]);
      p.pivot.rotation.set(0, 0, 0);
    });
  }

  function applyIntro(tMs: number) {
    // Elemenkénti összeállás.
    pivots.forEach((p, i) => {
      const k = easeOutCubic(clamp01((tMs - p.delay) / (INTRO.assembleMs - p.delay)));
      const inv = 1 - k;
      p.pivot.position.copy(pivotBase[i]).addScaledVector(p.from.pos, inv);
      p.pivot.rotation.set(p.from.rot.x * inv, p.from.rot.y * inv, p.from.rot.z * inv);
    });
    // Repülés a hero-helyre: valódi mélység (z), skála és forgás.
    const f = easeInOutCubic(clamp01((tMs - INTRO.flightStartMs) / INTRO.flightMs));
    const inv = 1 - f;
    stage.position.copy(introFrom.pos).multiplyScalar(inv);
    stage.position.z += introFrom.z * inv;
    stage.scale.setScalar(introFrom.scale + (1 - introFrom.scale) * f);
    stage.rotation.set(introFrom.rotX * inv, introFrom.rotY * inv, 0);
  }

  function frame() {
    raf = 0;
    // Egyetlen időalap (a rAF-paraméter helyett is): az intro kezdőideje is
    // performance.now(), így a kettő soha nem csúszhat el egymástól.
    const now = performance.now();
    if (lost) return;
    // Idle-ben 30 kép/s elég a lassú, finom mozgáshoz (fele GPU-munka); az
    // intro mindig teljes ütemben fut.
    if (mode !== "intro" && clockLast && now - clockLast < 30) {
      if (wantsLoop()) raf = requestAnimationFrame(frame);
      return;
    }
    const dt = clockLast ? Math.min(0.05, (now - clockLast) / 1000) : 0;
    if (clockLast) {
      stats.intervals.push(now - clockLast);
      if (stats.intervals.length > 120) stats.intervals.shift();
    }
    clockLast = now;
    const c0 = performance.now();

    if (mode === "intro") {
      const t = now - introT0;
      applyIntro(t);
      if (t >= INTRO.flightStartMs + INTRO.flightMs) endIntro();
    } else {
      // Idle: GLB-klipek + nagyon finom himbálózás; pointer: kis elfordulás.
      idleT += dt;
      mixer.update(dt);
      pointer.x += (pointer.tx - pointer.x) * Math.min(1, dt * 3.2);
      pointer.y += (pointer.ty - pointer.y) * Math.min(1, dt * 3.2);
      tilt.rotation.y = pointer.x * 0.2 + Math.sin(idleT * 0.39) * 0.018;
      tilt.rotation.x = pointer.y * 0.1 + Math.sin(idleT * 0.27) * 0.01;
    }

    renderer.render(scene, camera);
    stats.frames++;
    stats.cpu.push(performance.now() - c0);
    if (stats.cpu.length > 120) stats.cpu.shift();
    stats.dpr = fit.dpr;
    stats.drawingBuffer = [canvas.width, canvas.height];

    if (wantsLoop()) raf = requestAnimationFrame(frame);
  }

  /** A loop indítása, ha kell és még nem fut. */
  function kick() {
    if (!raf && wantsLoop()) {
      clockLast = 0;
      raf = requestAnimationFrame(frame);
    }
  }
  function halt() {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  }
  function stop() {
    live = false;
    halt();
  }

  function endIntro() {
    if (mode !== "intro") return;
    mode = "final";
    applyFinalPose();
    for (const a of actions) {
      a.reset(); // t=0 == alaphelyzet: nincs pozícióugrás
      a.play();
    }
    const r = introResolve;
    introResolve = null;
    if (r) r();
  }

  // Shaderfordítás + első képkocka a végleges pózban (még láthatatlan canvason).
  applyFinalPose();
  await renderer.compileAsync(scene, camera);
  if (signal.aborted) throw new DOMException("aborted", "AbortError");
  renderer.render(scene, camera);

  return {
    stats,
    /** Az intro kezdőpózának kirajzolása (a canvas még rejtett). */
    prepareIntro() {
      const s = opts.introStart?.();
      const { slot } = opts.measure();
      const sx = s ? s.x : slot.x + slot.w / 2;
      const sy = s ? s.y : slot.y + slot.h / 2;
      introFrom.scale = s ? s.scale : 0.62;
      const target = screenToWorld(sx, sy, 0);
      introFrom.pos.copy(target);
      mode = "intro";
      applyIntro(0);
      renderer.render(scene, camera);
    },
    playIntro(): Promise<void> {
      return new Promise((resolve) => {
        introResolve = resolve;
        mode = "intro";
        introT0 = performance.now();
        live = true;
        kick();
      });
    },
    /** Kihagyás: azonnal a végleges póz, idle indul (vagy áll, ha szüneteltetve). */
    finishIntro() {
      endIntro();
      renderer.render(scene, camera);
      kick();
    },
    /** Élő hero intro nélkül (ismételt látogatás, mélyhivatkozás, kimaradt intro). */
    startIdle() {
      mode = "final";
      applyFinalPose();
      for (const a of actions) {
        a.reset();
        a.play();
      }
      live = true;
      renderer.render(scene, camera);
      kick();
    },
    /** A „Mozgás megállítása" gomb: a renderloop is leáll, nem csak a transzformáció. */
    setPaused(p: boolean) {
      paused = p;
      if (p && mode !== "intro") halt();
      else kick();
    },
    /** Láthatóság (IntersectionObserver / háttérfül): a renderloop is áll. */
    setActive(a: boolean) {
      active = a;
      if (!a) halt();
      else kick();
    },
    setPointer(nx: number, ny: number) {
      pointer.tx = MathUtils.clamp(nx, -1, 1);
      pointer.ty = MathUtils.clamp(ny, -1, 1);
    },
    resize() {
      layout();
      if (!raf && !lost) renderer.render(scene, camera);
    },
    /** Teljes takarítás: loop, mixer, geometriák, anyagok, textúrák, env RT, renderer. */
    dispose() {
      stop();
      canvas.removeEventListener("webglcontextlost", onLost);
      mixer.stopAllAction();
      mixer.uncacheRoot(recenter);
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
