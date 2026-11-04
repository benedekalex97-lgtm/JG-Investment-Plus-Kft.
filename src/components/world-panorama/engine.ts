/**
 * Világpiaci panoráma — Three.js jelenet.
 *
 * KIZÁRÓLAG kliensoldalon, dinamikus importtal töltődik be (WorldPanorama).
 *
 * RENDERELÉSI ÜTEMEZŐ: egyetlen listener a meglévő gsap.tickeren — nincs
 * külön requestAnimationFrame-loop, és a globális GSAP-beállításokhoz
 * (ticker fps, lagSmoothing, globalTimeline) nem nyúlunk. A listener csak
 * addig van fent, amíg a jelenet ténylegesen mozog; megállítva nem
 * renderelünk folyamatosan.
 *
 * FÁZIS: p = aktívan futott idő / CYCLE (mod 1). Megállításkor a fázis nem
 * halad, a falióraidőt nem „hozza be" — folytatáskor onnan indul, ahol
 * megállt. A sebesség megálláskor gyorsan (τ ≈ 0,07 s), induláskor
 * nyugodtan (τ ≈ 0,6 s) áll be: megálláskor ~0,25 s alatt nyugszik (a
 * hotspot nem fut ki a kurzor alól), folytatáskor nincs rántás. Ez csak a
 * sebességet simítja, a pálya ugyanaz.
 */

import {
  ACESFilmicToneMapping,
  BufferGeometry,
  CanvasTexture,
  Color,
  DirectionalLight,
  ExtrudeGeometry,
  Fog,
  HemisphereLight,
  Material,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Path,
  PerspectiveCamera,
  PlaneGeometry,
  QuadraticBezierCurve3,
  RepeatWrapping,
  RingGeometry,
  Scene,
  Shape,
  SphereGeometry,
  SRGBColorSpace,
  Texture,
  TubeGeometry,
  Vector2,
  Vector3,
  WebGLRenderer,
} from "three";
import { gsap } from "gsap";
import { cameraAt, stepMotion, type Rig } from "./camera-path";
import { projectWorld } from "./geo";
import { REGIONS, type RegionId } from "./markets";

export type LandData = { polygons: number[][][] };

export type ProjectedPoint = { x: number; y: number; visible: boolean };
export type Projection = Record<RegionId, ProjectedPoint>;

export type PanoramaOptions = {
  canvas: HTMLCanvasElement;
  rig: Rig;
  land: LandData;
  /**
   * Optikai tengely-eltolás (előjeles): a látott kép egy (1 + |lensShift|)-
   * szer magasabb virtuális kép felső (pozitív → a térkép lejjebb ül, a felső
   * zóna a szövegé) vagy alsó (negatív → a térkép feljebb ül) része.
   * 0 = középre komponált.
   */
  lensShift: number;
  maxDpr: number;
  maxPixels: number;
  /** Minden renderelt kocka után: a városok képernyő-koordinátái (CSS px). */
  onProject: (projection: Projection) => void;
  onFirstFrame: () => void;
  onContextLost: () => void;
  /**
   * Teljesítményvédelem: a legkisebb renderfelbontáson is tartósan nagyon
   * lassú képkockák (pl. szoftveres renderelés, letiltott GPU) esetén hívódik;
   * a felület ilyenkor leállítja az automatikus kameráutat.
   */
  onTooSlow: () => void;
};

export type Panorama = {
  setRunning: (run: boolean) => void;
  resize: (width: number, height: number, lensShift: number) => void;
  renderNow: () => void;
  dispose: () => void;
};

/* ---------------------------------------------------------------------------
   Anyagok, színek — kizárólag a meglévő tokenek árnyalatai.
   --------------------------------------------------------------------------- */
const COLORS = {
  background: "#17131a", // Deep Surface és Carbon között
  ground: "#19141b",
  cap: "#6c4e68", // matt Aubergine, a megvilágítás emeli
  side: "#3f2d3d",
  keyLight: "#f4f3f1", // Porcelain
  rimLight: "#bec1c7", // Cool Silver
  fillLight: "#755d70", // Muted Plum
  sky: "#cbbfca",
  arc: "#c27fa3", // Berry Light — csak a vékony ívek és a jelölőgyűrű
  marker: "#f4f3f1",
};

/** Finom, tileable felületi karakter: értékzaj → normal map (egyszer, induláskor). */
function createSurfaceNormalMap(size = 128): Texture {
  const heights = new Float32Array(size * size);
  const grid = (cells: number, seed: number) => {
    const g = new Float32Array(cells * cells);
    let s = seed;
    for (let i = 0; i < g.length; i++) {
      s = (s * 16807) % 2147483647;
      g[i] = s / 2147483647;
    }
    return g;
  };
  const octaves = [
    { cells: 8, amp: 1, seed: 11 },
    { cells: 16, amp: 0.5, seed: 23 },
    { cells: 32, amp: 0.25, seed: 37 },
  ].map((o) => ({ ...o, g: grid(o.cells, o.seed) }));
  const smooth = (t: number) => t * t * (3 - 2 * t);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let h = 0;
      for (const o of octaves) {
        const fx = (x / size) * o.cells;
        const fy = (y / size) * o.cells;
        const x0 = Math.floor(fx);
        const y0 = Math.floor(fy);
        const tx = smooth(fx - x0);
        const ty = smooth(fy - y0);
        const at = (i: number, j: number) => o.g[((j % o.cells) * o.cells + (i % o.cells)) | 0];
        const a = at(x0, y0) + (at(x0 + 1, y0) - at(x0, y0)) * tx;
        const b = at(x0, y0 + 1) + (at(x0 + 1, y0 + 1) - at(x0, y0 + 1)) * tx;
        h += (a + (b - a) * ty) * o.amp;
      }
      heights[y * size + x] = h;
    }
  }
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const img = ctx.createImageData(size, size);
  const H = (x: number, y: number) => heights[((y + size) % size) * size + ((x + size) % size)];
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = (H(x + 1, y) - H(x - 1, y)) * 2.2;
      const dy = (H(x, y + 1) - H(x, y - 1)) * 2.2;
      const len = Math.hypot(dx, dy, 1);
      const i = (y * size + x) * 4;
      img.data[i] = ((-dx / len) * 0.5 + 0.5) * 255;
      img.data[i + 1] = ((-dy / len) * 0.5 + 0.5) * 255;
      img.data[i + 2] = ((1 / len) * 0.5 + 0.5) * 255;
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  const texture = new CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = RepeatWrapping;
  texture.repeat.set(0.55, 0.55);
  return texture;
}

/**
 * Kontinensek: valódi extrudált geometria. A peremlekerekítés (bevel)
 * BEFELÉ tolt, így az alapkontúr pontosan a partvonal, a felső lap kissé
 * beljebb ül → finoman lekerekített partvonalél. Egyetlen geometria,
 * két anyagcsoport (0 = felső/alsó lap, 1 = oldal + perem).
 */
function buildLand(land: LandData, rig: Rig) {
  const depth = rig === "desktop" ? 0.2 : 0.22;
  const bevel = rig === "desktop" ? 0.035 : 0.04;
  const shapes: Shape[] = [];
  const toPoints = (flat: number[]) => {
    const pts: Vector2[] = [];
    for (let i = 0; i < flat.length; i += 2) {
      const { x, z } = projectWorld(flat[i], flat[i + 1]);
      pts.push(new Vector2(x, -z));
    }
    return pts;
  };
  for (const polygon of land.polygons) {
    const shape = new Shape(toPoints(polygon[0]));
    for (const hole of polygon.slice(1)) shape.holes.push(new Path(toPoints(hole)));
    shapes.push(shape);
  }
  const geometry = new ExtrudeGeometry(shapes, {
    depth,
    curveSegments: 1,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelOffset: -bevel,
    // Egy szegmens: a perem így is lekerekítettnek hat, a csúcsszám ~35%-kal kisebb.
    bevelSegments: 1,
  });
  geometry.rotateX(-Math.PI / 2);
  geometry.translate(0, bevel, 0); // az alap az y = 0 síkon
  return { geometry, top: depth + 2 * bevel };
}

export function createPanorama(options: PanoramaOptions): Panorama {
  const { canvas, rig } = options;
  const renderer = new WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
    powerPreference: "high-performance",
  });
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.18;
  renderer.setClearColor(new Color(COLORS.background), 1);

  const scene = new Scene();
  scene.background = new Color(COLORS.background);
  scene.fog = new Fog(COLORS.background, rig === "desktop" ? 26 : 30, rig === "desktop" ? 62 : 72);

  const camera = new PerspectiveCamera(30, 1, 0.5, 200);

  /* --- Fények: egyszerű stúdióvilágítás, árnyék és utófeldolgozás nélkül --- */
  scene.add(new HemisphereLight(COLORS.sky, "#120e13", 0.95));
  const key = new DirectionalLight(COLORS.keyLight, 2.4);
  key.position.set(-18, 10, 8); // nyugat felől, alacsonyan → puha oldalfény, látható felületi karakter
  scene.add(key);
  const rim = new DirectionalLight(COLORS.rimLight, 2.2);
  rim.position.set(20, 3, -2); // kelet felől, súrlófény → ezüstös élfény a peremen
  scene.add(rim);
  const fill = new DirectionalLight(COLORS.fillLight, 1.0);
  fill.position.set(0, 3, 22); // dél felől → a nézőre néző oldalfalak láthatók
  scene.add(fill);

  /* --- Geometriák és anyagok (mind nyilvántartva a felszabadításhoz) --- */
  const geometries: BufferGeometry[] = [];
  const materials: Material[] = [];
  const textures: Texture[] = [];

  const ground = new PlaneGeometry(220, 140);
  ground.rotateX(-Math.PI / 2);
  const groundMat = new MeshStandardMaterial({ color: COLORS.ground, roughness: 1, metalness: 0 });
  const groundMesh = new Mesh(ground, groundMat);
  groundMesh.position.set(4, -0.002, -2);
  scene.add(groundMesh);
  geometries.push(ground);
  materials.push(groundMat);

  const normalMap = createSurfaceNormalMap();
  textures.push(normalMap);
  const capMat = new MeshStandardMaterial({
    color: COLORS.cap,
    roughness: 0.8,
    metalness: 0.06,
    normalMap,
    normalScale: new Vector2(0.45, 0.45),
  });
  const sideMat = new MeshStandardMaterial({ color: COLORS.side, roughness: 0.58, metalness: 0.14 });
  materials.push(capMat, sideMat);
  const land = buildLand(options.land, rig);
  geometries.push(land.geometry);
  scene.add(new Mesh(land.geometry, [capMat, sideMat]));

  /* --- Városjelölők és térbeli ívek --- */
  const cityWorld = {} as Record<RegionId, Vector3>;
  const markerGeo = new SphereGeometry(rig === "desktop" ? 0.1 : 0.16, 24, 16);
  const markerMat = new MeshStandardMaterial({ color: COLORS.marker, roughness: 0.32, metalness: 0.35 });
  const ringGeo = new RingGeometry(rig === "desktop" ? 0.17 : 0.26, rig === "desktop" ? 0.2 : 0.3, 48);
  ringGeo.rotateX(-Math.PI / 2);
  const ringMat = new MeshBasicMaterial({ color: COLORS.arc, transparent: true, opacity: 0.85, depthWrite: false });
  geometries.push(markerGeo, ringGeo);
  materials.push(markerMat, ringMat);
  for (const region of REGIONS) {
    const { x, z } = projectWorld(region.city.lon, region.city.lat);
    const point = new Vector3(x, land.top + 0.08, z);
    cityWorld[region.id] = point;
    const marker = new Mesh(markerGeo, markerMat);
    marker.position.copy(point);
    const ring = new Mesh(ringGeo, ringMat);
    ring.position.set(x, land.top + 0.012, z);
    scene.add(marker, ring);
  }
  const arcMat = new MeshBasicMaterial({ color: COLORS.arc, transparent: true, opacity: 0.55, depthWrite: false });
  materials.push(arcMat);
  const arcs: [RegionId, RegionId, number][] = [
    ["americas", "europe", 2.1],
    ["europe", "asia", 3.2],
  ];
  for (const [from, to, lift] of arcs) {
    const a = cityWorld[from];
    const b = cityWorld[to];
    const mid = a.clone().add(b).multiplyScalar(0.5);
    mid.y += lift;
    const tube = new TubeGeometry(new QuadraticBezierCurve3(a, mid, b), 96, rig === "desktop" ? 0.018 : 0.03, 6, false);
    geometries.push(tube);
    scene.add(new Mesh(tube, arcMat));
  }

  /* --- Méretezés: DPR- és pixelkorlát (adaptív renderfelbontással) --- */
  let width = 1;
  let height = 1;
  let lensShift = options.lensShift;
  let pixelScale = 1; // a teljesítményvédelem felezi, ha a képkockák tartósan lassúak
  const MIN_PIXEL_SCALE = rig === "desktop" ? 0.175 : 0.3; // ≈ 0,35 M / 0,2 M renderpixel
  const resize = (w: number, h: number) => {
    width = Math.max(1, Math.round(w));
    height = Math.max(1, Math.round(h));
    const budget = Math.sqrt((options.maxPixels * pixelScale) / (width * height));
    const dpr = Math.max(0.5, Math.min(window.devicePixelRatio || 1, options.maxDpr, budget));
    renderer.setPixelRatio(dpr);
    renderer.setSize(width, height, false);
    const shift = Math.abs(lensShift);
    const fullHeight = height * (1 + shift);
    camera.aspect = width / fullHeight;
    camera.setViewOffset(width, fullHeight, 0, lensShift < 0 ? height * shift : 0, width, height);
  };

  /* --- Egy kocka --- */
  let phase = 0;
  const projection = {} as Projection;
  const scratch = new Vector3();
  let firstFrame = true;
  const render = () => {
    const state = cameraAt(rig, phase, land.top);
    camera.position.set(...state.position);
    camera.lookAt(...state.target);
    // Vízszintes látószög → függőleges a (lencseeltolással nőtt) virtuális kép arányával.
    const halfH = (state.hfov * Math.PI) / 360;
    camera.fov = (2 * Math.atan(Math.tan(halfH) / camera.aspect) * 180) / Math.PI;
    camera.updateProjectionMatrix();
    renderer.render(scene, camera);
    for (const region of REGIONS) {
      scratch.copy(cityWorld[region.id]).project(camera);
      projection[region.id] = {
        x: ((scratch.x + 1) / 2) * width,
        y: ((1 - scratch.y) / 2) * height,
        visible: scratch.z < 1 && Math.abs(scratch.x) <= 1 && Math.abs(scratch.y) <= 1,
      };
    }
    options.onProject(projection);
    if (firstFrame) {
      firstFrame = false;
      options.onFirstFrame();
    }
  };

  /* --- Ütemezés: egyetlen gsap.ticker listener, csak mozgás közben --- */
  let speed = 0;
  let targetSpeed = 0;
  let listening = false;
  /*
    Teljesítményvédelem: a képkocka-időköz mozgó átlaga. Ha 2 s-on át
    20 fps alatt marad, a renderfelbontás feleződik (a minimumig); ha a
    minimumon is 3 s-on át ~9 fps alatt marad, az automatikus kameraút leáll
    (onTooSlow) — a térkép statikusan, interaktívan marad.
  */
  let frameEma = 16.7;
  let slowFor = 0;
  let verySlowFor = 0;
  let gaveUp = false;
  const governor = (deltaTime: number, dt: number) => {
    frameEma += (deltaTime - frameEma) * 0.1;
    slowFor = frameEma > 50 ? slowFor + dt : Math.max(0, slowFor - dt);
    if (slowFor > 2 && pixelScale > MIN_PIXEL_SCALE) {
      pixelScale = Math.max(MIN_PIXEL_SCALE, pixelScale * 0.5);
      slowFor = 0;
      resize(width, height);
    }
    verySlowFor = pixelScale <= MIN_PIXEL_SCALE && frameEma > 110 ? verySlowFor + dt : 0;
    if (verySlowFor > 3 && !gaveUp) {
      gaveUp = true;
      options.onTooSlow();
    }
  };
  const tick = (_time: number, deltaTime: number) => {
    // A GSAP ticker a hosszú megakadásokat már kisimítja (lagSmoothing);
    // itt csak a szélsőséges lépéseket vágjuk, a fázis így a valós időt követi.
    const dt = Math.min(deltaTime, 250) / 1000;
    if (targetSpeed > 0 && speed > 0.5) governor(deltaTime, dt);
    const step = stepMotion(speed, targetSpeed, dt);
    speed = step.speed;
    phase = (phase + step.phaseAdvance) % 1;
    if (step.stopped) stop();
    render();
  };
  const start = () => {
    if (listening) return;
    listening = true;
    gsap.ticker.add(tick);
  };
  const stop = () => {
    if (!listening) return;
    listening = false;
    gsap.ticker.remove(tick);
  };

  const onLost = (event: Event) => {
    event.preventDefault();
    stop();
    options.onContextLost();
  };
  canvas.addEventListener("webglcontextlost", onLost);

  return {
    setRunning(run) {
      targetSpeed = run ? 1 : 0;
      if (run) start();
    },
    resize(w, h, shift) {
      lensShift = shift;
      resize(w, h);
      if (!listening) render();
    },
    renderNow() {
      render();
    },
    dispose() {
      stop();
      canvas.removeEventListener("webglcontextlost", onLost);
      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
      textures.forEach((t) => t.dispose());
      renderer.dispose();
      renderer.forceContextLoss();
    },
  };
}
