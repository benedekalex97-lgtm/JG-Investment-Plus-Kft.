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
 *
 * „A KERESKEDÉSI NAP" (trading-day.ts): csendes, dekoratív réteg ugyanazon
 * a p fázison — impulzus az íveken (Tokió → London → New York), egyetlen
 * vékony gyűrűhullám a nyitó városnál, a jelölőgyűrű finom erősödése és a
 * kulcsfény ±6°-os azimut-lengése. Mivel p tiszta függvénye, a kamerával
 * együtt áll meg és indul. Egyszeri nyitány (setIntro, p-től független),
 * görgetéshez kötött finom kameraemelés (setScroll). Utófeldolgozás,
 * render target és árnyéktérkép nincs; legfeljebb 5 további rajzolási hívás.
 */

import {
  ACESFilmicToneMapping,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  ClampToEdgeWrapping,
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
import { cameraAt, CYCLE, stepMotion, type Rig } from "./camera-path";
import { projectWorld } from "./geo";
import { REGIONS, type RegionId } from "./markets";
import { ambientAt, createDayFrame, introAt, PULSE_LENGTH, type DayFrame } from "./trading-day";

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
  /**
   * Egyszeri nyitány: `time` = a nyitány ideje másodpercben (p-től független),
   * `gain` = a réteg erőssége (0–1; interakciókor lágyan 0-ra fut). `null` →
   * a nyitány véget ért: a kereskedési nap köre ezután lágyan átveszi.
   */
  setIntro: (time: number | null, gain?: number) => void;
  /**
   * Görgetési haladás (0 = a Hero a helyén, 1 = teljesen kigördült): a kamera
   * finoman emelkedik és hátrál. Megállított kameránál egy kockát renderel.
   */
  setScroll: (progress: number) => void;
  dispose: () => void;
};

/* ---------------------------------------------------------------------------
   Anyagok, színek — kizárólag a meglévő tokenek árnyalatai.
   --------------------------------------------------------------------------- */
const COLORS = {
  background: "#17131a", // Deep Surface és Carbon között — a köd és a talaj széle is ez
  // Talaj: lágy Aubergine–Carbon átmenet (nem fekete); a közép a meleg, emelt tónus.
  groundCentre: "#3a2a37",
  groundMid: "#271d27",
  cap: "#7a5a72", // matt mályva-Aubergine, a megvilágítás emeli
  side: "#5e4559", // sötétebb szilva oldalfal — nem fekete
  keyLight: "#f4f3f1", // Porcelain
  rimLight: "#bec1c7", // Cool Silver
  fillLight: "#755d70", // Muted Plum
  sky: "#cbbfca",
  skyGround: "#21181f",
  arc: "#c27fa3", // Berry Light — csak a vékony ívek és a jelölőgyűrű
  marker: "#f4f3f1",
};

/** Finom, tileable felületi karakter: lágy értékzaj → normal map (egyszer, induláskor). */
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
  // Két alacsony frekvenciájú oktáv: nyugodt, finom anyagkarakter, nem zaj.
  const octaves = [
    { cells: 4, amp: 1, seed: 11 },
    { cells: 8, amp: 0.4, seed: 23 },
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
      const dx = (H(x + 1, y) - H(x - 1, y)) * 3;
      const dy = (H(x, y + 1) - H(x, y - 1)) * 3;
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
  texture.repeat.set(0.3, 0.3);
  return texture;
}

/** Partvonalpont kulcsa: a 0,1 mm-re kerekített (x, z) — |x|, |z| · 1e4 < 2^19. */
const coastKey = (x: number, z: number) =>
  Math.round(x * 1e4) + 524288 + 1048576 * (Math.round(z * 1e4) + 524288);

/**
 * Kontinensek: valódi extrudált geometria.
 *
 *   - A peremlekerekítés (bevel) BEFELÉ tolt: az alapkontúr pontosan a
 *     partvonal, a felső lap kissé beljebb ül. Arány: a mélység ~17%-a.
 *   - Az alsó lap és az alsó perem a talajsík alatt lenne (sosem látszik):
 *     kihagyjuk — ~⅓-dal kevesebb csúcs, és 2 rajzolási hívás (felső lap /
 *     oldalfal) a korábbi ~270 helyett.
 *   - Az oldalfal NORMÁLISAI simítottak: a partvonal mentén néhány szomszédos
 *     pontra kiterjedő átlagolás, így eltűnik a lapos árnyalásból adódó
 *     oszlopos, fűrészfogas sávozás (a forma nem változik). A peremsáv normálisa a lekerekítés valódi profilját
 *     követi (fent függőleges, lent vízszintes) → a felső lap és a fal
 *     találkozása lágy, fényben olvasható élátmenet.
 *   - Csúcsszínnel finom „kontakt" sötétedés a fal alján.
 */
function buildLand(land: LandData, rig: Rig) {
  const depth = rig === "desktop" ? 0.19 : 0.21;
  const bevel = rig === "desktop" ? 0.032 : 0.036;
  const shapes: Shape[] = [];
  const toPoints = (flat: number[]) => {
    const pts: Vector2[] = [];
    for (let i = 0; i < flat.length; i += 2) {
      const { x, z } = projectWorld(flat[i], flat[i + 1]);
      pts.push(new Vector2(x, -z));
    }
    return pts;
  };
  /*
    Simított falnormális partvonalpontonként: a partvonal mentén ±COAST_SPAN
    ívhosszra lévő két pont húrjára merőleges, a szárazföldről kifelé mutató
    irány. A generalizált partvonal apró cikcakkjai így nem kapnak külön
    fényt (oszlopos sávozás helyett egyenletes, sima fal); a forma nem változik.
  */
  const COAST_SPAN = 0.22;
  const wallNormal = new Map<number, [number, number]>();
  const addRing = (pts: Vector2[], hole: boolean) => {
    const n = pts.length;
    if (n < 3) return;
    const cum = new Float64Array(n + 1);
    let area = 0;
    for (let i = 0; i < n; i++) {
      const a = pts[i];
      const b = pts[(i + 1) % n];
      cum[i + 1] = cum[i] + a.distanceTo(b);
      area += a.x * b.y - b.x * a.y;
    }
    const perimeter = cum[n];
    if (perimeter <= 0) return;
    const span = Math.min(COAST_SPAN, perimeter / 6);
    // Kifelé (a víz felé): óramutatóval ellentétes külső gyűrűnél a haladási irány jobbja.
    const sign = (hole ? -1 : 1) * (area > 0 ? 1 : -1);
    const at = (arc: number): [number, number] => {
      const t = ((arc % perimeter) + perimeter) % perimeter;
      let lo = 0;
      let hi = n - 1;
      while (lo < hi) {
        const mid = (lo + hi + 1) >> 1;
        if (cum[mid] <= t) lo = mid;
        else hi = mid - 1;
      }
      const a = pts[lo];
      const b = pts[(lo + 1) % n];
      const seg = cum[lo + 1] - cum[lo];
      const f = seg > 0 ? (t - cum[lo]) / seg : 0;
      return [a.x + (b.x - a.x) * f, a.y + (b.y - a.y) * f];
    };
    for (let i = 0; i < n; i++) {
      const [x0, y0] = at(cum[i] - span);
      const [x1, y1] = at(cum[i] + span);
      const tx = x1 - x0;
      const ty = y1 - y0;
      const len = Math.hypot(tx, ty);
      if (len < 1e-9) continue;
      // Shape-koordináta (x, y = észak) → világ (x, z = −y).
      wallNormal.set(coastKey(pts[i].x, -pts[i].y), [(sign * ty) / len, (sign * tx) / len]);
    }
  };
  for (const polygon of land.polygons) {
    const outer = toPoints(polygon[0]);
    addRing(outer, false);
    const shape = new Shape(outer);
    for (const ring of polygon.slice(1)) {
      const hole = toPoints(ring);
      addRing(hole, true);
      shape.holes.push(new Path(hole));
    }
    shapes.push(shape);
  }
  const source = new ExtrudeGeometry(shapes, {
    depth,
    curveSegments: 1,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelOffset: -bevel,
    // Egy szegmens elég: a lekerekítést a profilkövető normálisok adják.
    bevelSegments: 1,
  });
  source.rotateX(-Math.PI / 2); // a fal alja az y = 0 síkon, a felső lap y = depth + bevel
  const P = source.getAttribute("position").array as Float32Array;
  const N = source.getAttribute("normal").array as Float32Array;
  const U = source.getAttribute("uv").array as Float32Array;

  // Háromszögek szétválogatása; a talajsík alatti (alsó lap / alsó perem) kimarad.
  const caps: number[] = [];
  const sides: number[] = [];
  for (const group of source.groups) {
    const list = group.materialIndex === 0 ? caps : sides;
    for (let v = group.start; v < group.start + group.count; v += 3) {
      if (Math.max(P[v * 3 + 1], P[v * 3 + 4], P[v * 3 + 7]) > 1e-6) list.push(v);
    }
  }
  const capCount = caps.length * 3;
  const total = capCount + sides.length * 3;
  const pos = new Float32Array(total * 3);
  const nor = new Float32Array(total * 3);
  const uv = new Float32Array(total * 2);
  const col = new Float32Array(total * 3);
  const faceH = new Float32Array((total - capCount) * 2); // az oldallap vízszintes normálisa
  let o = 0;
  const copy = (v: number) => {
    for (let k = 0; k < 3; k++) {
      pos.set(P.subarray((v + k) * 3, (v + k) * 3 + 3), (o + k) * 3);
      uv.set(U.subarray((v + k) * 2, (v + k) * 2 + 2), (o + k) * 2);
    }
    o += 3;
  };
  for (const v of caps) copy(v);
  for (let i = 0; i < capCount; i++) {
    nor[i * 3 + 1] = 1;
    col[i * 3] = col[i * 3 + 1] = col[i * 3 + 2] = 1;
  }
  for (const v of sides) {
    const f = o - capCount;
    const hx = N[v * 3];
    const hz = N[v * 3 + 2];
    const len = Math.hypot(hx, hz);
    for (let k = 0; k < 3; k++) {
      faceH[(f + k) * 2] = len > 1e-9 ? hx / len : 0;
      faceH[(f + k) * 2 + 1] = len > 1e-9 ? hz / len : 0;
    }
    copy(v);
  }
  source.dispose();

  // Falcsúcsok normálisa: a partvonalpont simított iránya (fal alja és teteje
  // azonos), a peremsávban a lekerekítés profilja szerint felfelé fordul.
  for (let i = 0; i < total - capCount; i++) {
    const p = (capCount + i) * 3;
    const y = pos[p + 1];
    let nx = faceH[i * 2];
    let nz = faceH[i * 2 + 1];
    const smooth = y <= depth + 1e-6 ? wallNormal.get(coastKey(pos[p], pos[p + 2])) : undefined;
    if (smooth) {
      nx = smooth[0];
      nz = smooth[1];
    }
    // Peremprofil: cos θ = a perem feletti magasság aránya (fent 1 → függőleges normális).
    const up = y > depth ? Math.min(1, (y - depth) / bevel) : 0;
    const across = Math.sqrt(1 - up * up);
    nor[p] = nx * across;
    nor[p + 1] = up;
    nor[p + 2] = nz * across;
    // Kontakt-sötétedés a fal alján (a fal felső harmadában már teljes tónus).
    const shade = 0.68 + 0.32 * Math.min(1, y / (depth * 0.66));
    col[p] = col[p + 1] = col[p + 2] = shade;
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new BufferAttribute(pos, 3));
  geometry.setAttribute("normal", new BufferAttribute(nor, 3));
  geometry.setAttribute("uv", new BufferAttribute(uv, 2));
  geometry.setAttribute("color", new BufferAttribute(col, 3));
  geometry.addGroup(0, capCount, 0);
  geometry.addGroup(capCount, total - capCount, 1);
  geometry.computeBoundingSphere();
  return { geometry, shapes, top: depth + bevel };
}

/**
 * Talaj: lágy Aubergine–Carbon színátmenet (map) + a kontinensek alatti
 * puha kontaktárnyék (aoMap, külön UV-csatornán, csak a térkép körüli
 * területen, nagyobb felbontással). Megvilágítás nélküli anyag: a teljes
 * képernyőt kitöltő felületen ez a legolcsóbb, és a tónus pontosan az,
 * amit itt megadunk. Széle = háttér/köd színe → a sík széle sosem látszik.
 */
const GROUND = { cx: 1, cz: -2.5, width: 140, depth: 90 };
const SHADOW = { x0: -20.5, z0: -13, width: 42, depth: 21 };

function createGroundTextures(shapes: Shape[], rig: Rig) {
  // Színátmenet — alacsony felbontás is elég (sima mező, ditheringgel).
  const g = document.createElement("canvas");
  g.width = 512;
  g.height = Math.round((512 * GROUND.depth) / GROUND.width);
  const gx = g.getContext("2d")!;
  const toG = (x: number, z: number): [number, number] => [
    ((x - (GROUND.cx - GROUND.width / 2)) / GROUND.width) * g.width,
    ((z - (GROUND.cz - GROUND.depth / 2)) / GROUND.depth) * g.height,
  ];
  gx.fillStyle = COLORS.background;
  gx.fillRect(0, 0, g.width, g.height);
  const [cx, cy] = toG(2.5, 2.5); // a világosabb mag a térkép előterében
  const radius = (30 / GROUND.width) * g.width;
  gx.save();
  gx.translate(cx, cy);
  gx.scale(1, 0.62); // kelet–nyugati irányban elnyújtott ovális
  const grad = gx.createRadialGradient(0, 0, 0, 0, 0, radius);
  grad.addColorStop(0, COLORS.groundCentre);
  grad.addColorStop(0.45, COLORS.groundMid);
  grad.addColorStop(1, COLORS.background);
  gx.fillStyle = grad;
  gx.fillRect(-radius, -radius, radius * 2, radius * 2);
  gx.restore();
  const map = new CanvasTexture(g);
  map.colorSpace = SRGBColorSpace;
  map.wrapS = map.wrapT = ClampToEdgeWrapping;

  // Kontaktárnyék: a partvonalak elmosott lenyomata (fehér = nincs árnyék).
  const a = document.createElement("canvas");
  a.width = rig === "desktop" ? 2048 : 1024;
  a.height = Math.round((a.width * SHADOW.depth) / SHADOW.width);
  const ax = a.getContext("2d")!;
  const s = a.width / SHADOW.width;
  ax.fillStyle = "#fff";
  ax.fillRect(0, 0, a.width, a.height);
  const path = new Path2D();
  const trace = (points: Vector2[]) => {
    points.forEach((pt, i) => {
      // Shape-koordináta: (x, -z)
      const px = (pt.x - SHADOW.x0) * s;
      const py = (-pt.y - SHADOW.z0) * s;
      if (i === 0) path.moveTo(px, py);
      else path.lineTo(px, py);
    });
    path.closePath();
  };
  for (const shape of shapes) {
    trace(shape.getPoints());
    for (const hole of shape.holes) trace(hole.getPoints());
  }
  // Csak az árnyékot rajzoljuk: az alakzat a vásznon kívül, az árnyéka eltolva vissza.
  const shadow = (blurUnits: number, alpha: number, dx: number, dz: number) => {
    ax.save();
    ax.fillStyle = "#000";
    ax.shadowColor = `rgba(0, 0, 0, ${alpha})`;
    ax.shadowBlur = blurUnits * s;
    ax.shadowOffsetX = a.width * 2 + dx * s;
    ax.shadowOffsetY = dz * s;
    ax.translate(-a.width * 2, 0);
    ax.fill(path, "evenodd");
    ax.restore();
  };
  shadow(0.55, 0.45, 0.12, 0.1); // tág, lágy — a fénnyel ellentétes irányba kissé eltolva
  shadow(0.12, 0.6, 0.02, 0.02); // szoros kontakt a fal tövénél
  const ao = new CanvasTexture(a);
  ao.channel = 1;
  ao.wrapS = ao.wrapT = ClampToEdgeWrapping;
  return { map, ao };
}

/** A mobil kameraút legkisebb függőleges látószöge (fok) — ld. render(). */
const MIN_VFOV_MOBILE = 72;

/** A kulcsfény alaphelyzete (bal felülről-hátulról). */
const KEY_POSITION = [-11, 12, -7] as const;

/*
  A kereskedési nap rétegének megjelenése — csak a meglévő tokenek
  (Berry Light, Porcelain), ragyogás nélkül.
*/
/** Az impulzus csőszegmenseinek száma (azonos az alapívvel) és keresztmetszete. */
const ARC_SEGMENTS = 96;
const ARC_RADIAL = 6;
/** Az impulzus színe: Berry Light → Porcelain felé keverve; legnagyobb átlátszatlansága. */
const PULSE_TINT = 0.7;
const PULSE_OPACITY = 0.9;
/** Az impulzuscső sugara az alapívhez képest (fedje az alapívet, ne legyen „gyöngy"). */
const PULSE_THICKNESS = 1.6;
/** Az impulzus eleje rövidebb, a vége hosszabban cseng le (az irány így olvasható). */
const PULSE_AHEAD = PULSE_LENGTH * 0.3;
const PULSE_BEHIND = PULSE_LENGTH * 0.7;
/** A jelölőgyűrű erősödése: Porcelain felé keverés, átlátszatlanság, lépték. */
const RING_TINT = 0.45;
const RING_OPACITY = 0.85;
const RING_GROW = 0.06;
/** A kör lágy átvétele a nyitány után (s, a kamerával együtt halad). */
const AMBIENT_FADE_IN = 0.8;
/** Görgetési emelés teljes kigördüléskor: +4° emelkedés, +6% távolság. */
const SCROLL_LIFT = (4 * Math.PI) / 180;
const SCROLL_PULL = 0.06;

/** Városindex a trading-day.ts sorrendjében. */
const CITY_INDEX: Record<RegionId, number> = { americas: 0, europe: 1, asia: 2 };

type PulseUniforms = { uHead: { value: number }; uDir: { value: number } };

/**
 * Az impulzus anyaga: MeshBasicMaterial, egyetlen apró shader-kiegészítéssel —
 * az ív menti koordináta (a cső uv.x-e) szerinti lágy, aszimmetrikus súly
 * (elöl rövid, hátul hosszabb lecsengés). Nincs textúra, ragyogás vagy
 * utófeldolgozás; a szín a meglévő tokenekből.
 */
function createPulseMaterial(color: Color) {
  const uniforms: PulseUniforms = { uHead: { value: 0 }, uDir: { value: 1 } };
  // toneMapped: false — a keverék pontosan a tokenszín marad (az ACES nem szürkíti).
  const material = new MeshBasicMaterial({ color, transparent: true, opacity: 0, depthWrite: false, toneMapped: false });
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uHead = uniforms.uHead;
    shader.uniforms.uDir = uniforms.uDir;
    shader.vertexShader = shader.vertexShader.replace(
      "void main() {",
      "varying float vArcU;\nvoid main() {\n\tvArcU = uv.x;",
    );
    shader.fragmentShader = shader.fragmentShader
      .replace(
        "void main() {",
        `uniform float uHead;\nuniform float uDir;\nvarying float vArcU;\nvoid main() {`,
      )
      .replace(
        "#include <alphamap_fragment>",
        `#include <alphamap_fragment>
	float pulseD = ( vArcU - uHead ) * uDir;
	float pulseK = pulseD >= 0.0 ? pulseD / ${PULSE_AHEAD.toFixed(4)} : -pulseD / ${PULSE_BEHIND.toFixed(4)};
	float pulseW = clamp( 1.0 - pulseK * pulseK, 0.0, 1.0 );
	diffuseColor.a *= pulseW * sqrt( pulseW );`,
      );
  };
  return { material, uniforms };
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

  /* --- Fények: egyszerű stúdióvilágítás, árnyék és utófeldolgozás nélkül ---
     Kulcsfény bal felülről (északnyugat, magasan) → lágy fény a felső
     lapokon és a peremeken; visszafogott elölről jövő derítés, hogy a
     nézőre néző fal olvasható maradjon; hátulról súroló ezüstös élfény,
     ragyogás nélkül. */
  scene.add(new HemisphereLight(COLORS.sky, COLORS.skyGround, 0.8));
  const key = new DirectionalLight(COLORS.keyLight, 2.1);
  key.position.set(KEY_POSITION[0], KEY_POSITION[1], KEY_POSITION[2]);
  scene.add(key);
  /* Élő fény: a kulcsfény azimutja p szerint ±6°-ot leng a függőleges
     tengely körül (azonos magasság és távolság → az expozíció nem változik). */
  const keyRadius = Math.hypot(KEY_POSITION[0], KEY_POSITION[2]);
  const keyAzimuth = Math.atan2(KEY_POSITION[0], KEY_POSITION[2]);
  const rim = new DirectionalLight(COLORS.rimLight, 1.2);
  rim.position.set(16, 3, -12);
  scene.add(rim);
  const fill = new DirectionalLight(COLORS.fillLight, 1.0);
  fill.position.set(2, 5, 18);
  scene.add(fill);

  /* --- Geometriák és anyagok (mind nyilvántartva a felszabadításhoz) --- */
  const geometries: BufferGeometry[] = [];
  const materials: Material[] = [];
  const textures: Texture[] = [];

  const land = buildLand(options.land, rig);
  geometries.push(land.geometry);

  const ground = new PlaneGeometry(GROUND.width, GROUND.depth);
  ground.rotateX(-Math.PI / 2);
  ground.translate(GROUND.cx, -0.002, GROUND.cz);
  {
    // 2. UV-csatorna az árnyéktextúrához: a térkép körüli téglalapra skálázva.
    const gp = ground.getAttribute("position");
    const uv1 = new Float32Array(gp.count * 2);
    for (let i = 0; i < gp.count; i++) {
      uv1[i * 2] = (gp.getX(i) - SHADOW.x0) / SHADOW.width;
      uv1[i * 2 + 1] = 1 - (gp.getZ(i) - SHADOW.z0) / SHADOW.depth;
    }
    ground.setAttribute("uv1", new BufferAttribute(uv1, 2));
  }
  const groundTextures = createGroundTextures(land.shapes, rig);
  textures.push(groundTextures.map, groundTextures.ao);
  const groundMat = new MeshBasicMaterial({
    map: groundTextures.map,
    aoMap: groundTextures.ao,
    aoMapIntensity: 1,
    toneMapped: false,
    dithering: true,
  });
  scene.add(new Mesh(ground, groundMat));
  geometries.push(ground);
  materials.push(groundMat);

  const normalMap = createSurfaceNormalMap();
  textures.push(normalMap);
  const capMat = new MeshStandardMaterial({
    color: COLORS.cap,
    roughness: 0.74,
    metalness: 0.04,
    normalMap,
    normalScale: new Vector2(0.18, 0.18),
  });
  const sideMat = new MeshStandardMaterial({
    color: COLORS.side,
    roughness: 0.55,
    metalness: 0.08,
    vertexColors: true,
  });
  materials.push(capMat, sideMat);
  scene.add(new Mesh(land.geometry, [capMat, sideMat]));

  /* --- Városjelölők és térbeli ívek --- */
  const cityWorld = {} as Record<RegionId, Vector3>;
  const markerGeo = new SphereGeometry(rig === "desktop" ? 0.1 : 0.16, 24, 16);
  const markerMat = new MeshStandardMaterial({ color: COLORS.marker, roughness: 0.32, metalness: 0.35 });
  const ringGeo = new RingGeometry(rig === "desktop" ? 0.17 : 0.26, rig === "desktop" ? 0.2 : 0.3, 48);
  ringGeo.rotateX(-Math.PI / 2);
  /*
    Városonként saját gyűrűanyag (a kereskedési nap városonként erősíti) —
    alaphelyzetben pontosan a korábbi közös anyag: Berry Light, 0,85.
    Gyűrűhullám: városonként egy újrahasznosított, vékony gyűrű a jelölőgyűrű
    síkjában; csak hullám közben látható (különben nincs rajzolási hívás).
  */
  const arcColor = new Color(COLORS.arc);
  const porcelain = new Color(COLORS.marker);
  const rippleGeo = new RingGeometry(rig === "desktop" ? 0.18 : 0.276, rig === "desktop" ? 0.2 : 0.3, 64);
  rippleGeo.rotateX(-Math.PI / 2);
  geometries.push(markerGeo, ringGeo, rippleGeo);
  materials.push(markerMat);
  const rings: Mesh<RingGeometry, MeshBasicMaterial>[] = [];
  const ripples: Mesh<RingGeometry, MeshBasicMaterial>[] = [];
  for (const region of REGIONS) {
    const { x, z } = projectWorld(region.city.lon, region.city.lat);
    const point = new Vector3(x, land.top + 0.08, z);
    cityWorld[region.id] = point;
    const marker = new Mesh(markerGeo, markerMat);
    marker.position.copy(point);
    const ringMat = new MeshBasicMaterial({ color: COLORS.arc, transparent: true, opacity: RING_OPACITY, depthWrite: false });
    const ring = new Mesh(ringGeo, ringMat);
    ring.position.set(x, land.top + 0.012, z);
    const rippleMat = new MeshBasicMaterial({
      color: arcColor.clone().lerp(porcelain, 0.25),
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });
    const rippleMesh = new Mesh(rippleGeo, rippleMat);
    rippleMesh.position.set(x, land.top + 0.014, z);
    rippleMesh.visible = false;
    rippleMesh.renderOrder = 1;
    materials.push(ringMat, rippleMat);
    rings[CITY_INDEX[region.id]] = ring;
    ripples[CITY_INDEX[region.id]] = rippleMesh;
    scene.add(marker, ring, rippleMesh);
  }
  const arcMat = new MeshBasicMaterial({ color: COLORS.arc, transparent: true, opacity: 0.55, depthWrite: false });
  materials.push(arcMat);
  const arcs: [RegionId, RegionId, number][] = [
    ["americas", "europe", 2.1],
    ["europe", "asia", 3.2],
  ];
  const arcRadius = rig === "desktop" ? 0.018 : 0.03;
  const pulses: { mesh: Mesh<TubeGeometry, MeshBasicMaterial>; uniforms: PulseUniforms }[] = [];
  for (const [from, to, lift] of arcs) {
    const a = cityWorld[from];
    const b = cityWorld[to];
    const mid = a.clone().add(b).multiplyScalar(0.5);
    mid.y += lift;
    const curve = new QuadraticBezierCurve3(a, mid, b);
    const tube = new TubeGeometry(curve, ARC_SEGMENTS, arcRadius, ARC_RADIAL, false);
    geometries.push(tube);
    scene.add(new Mesh(tube, arcMat));
    /* Impulzus: ugyanazon az íven kissé vastagabb cső, csak impulzus közben
       rajzolva, és akkor is csak a fej körüli szakasza (setDrawRange). */
    const pulseTube = new TubeGeometry(curve, ARC_SEGMENTS, arcRadius * PULSE_THICKNESS, ARC_RADIAL, false);
    const { material, uniforms } = createPulseMaterial(arcColor.clone().lerp(porcelain, PULSE_TINT));
    const mesh = new Mesh(pulseTube, material);
    mesh.visible = false;
    mesh.renderOrder = 2; // mindig az alapív után (átlátszó rétegek rendezése)
    geometries.push(pulseTube);
    materials.push(material);
    scene.add(mesh);
    pulses.push({ mesh, uniforms });
  }

  /* A kereskedési nap rétegének alkalmazása egy kockára — foglalás nélkül. */
  const ambient = createDayFrame();
  const intro = createDayFrame();
  let introTime: number | null = null;
  let introGain = 0;
  let ambientGain = 1;
  const applyDay = () => {
    const ag = ambientGain;
    const ig = introTime === null ? 0 : introGain;
    for (let i = 0; i < 2; i++) {
      const a = ambient.pulseAlpha[i] * ag;
      const b = intro.pulseAlpha[i] * ig;
      const from: DayFrame = b > a ? intro : ambient;
      const alpha = Math.max(a, b);
      const { mesh, uniforms } = pulses[i];
      mesh.visible = alpha > 0.002;
      if (!mesh.visible) continue;
      const head = from.pulseHead[i];
      const dir = from.pulseDir[i];
      mesh.material.opacity = PULSE_OPACITY * alpha;
      uniforms.uHead.value = head;
      uniforms.uDir.value = dir;
      // Csak a fej körüli csőszakasz kerül rajzolásra (indexpuffer-tartomány).
      const lo = head - (dir > 0 ? PULSE_BEHIND : PULSE_AHEAD);
      const hi = head + (dir > 0 ? PULSE_AHEAD : PULSE_BEHIND);
      const s0 = Math.max(0, Math.floor(lo * ARC_SEGMENTS));
      const s1 = Math.min(ARC_SEGMENTS, Math.ceil(hi * ARC_SEGMENTS));
      mesh.geometry.setDrawRange(s0 * ARC_RADIAL * 6, Math.max(0, s1 - s0) * ARC_RADIAL * 6);
    }
    for (let c = 0; c < 3; c++) {
      const a = ambient.rippleAlpha[c] * ag;
      const b = intro.rippleAlpha[c] * ig;
      const alpha = Math.max(a, b);
      const ripple = ripples[c];
      ripple.visible = alpha > 0.002;
      if (ripple.visible) {
        const scale = b > a ? intro.rippleScale[c] : ambient.rippleScale[c];
        ripple.scale.set(scale, 1, scale);
        ripple.material.opacity = alpha;
      }
      const k = Math.max(ambient.ring[c] * ag, intro.ring[c] * ig);
      const ring = rings[c];
      ring.material.color.copy(arcColor).lerp(porcelain, RING_TINT * k);
      ring.material.opacity = RING_OPACITY + (1 - RING_OPACITY) * k;
      const grow = 1 + RING_GROW * k;
      ring.scale.set(grow, 1, grow);
    }
    // Élő fény (tisztán p-ből; p = 0-ban pontosan az alaphelyzet).
    if (ambient.lightAzimuth === 0) key.position.set(KEY_POSITION[0], KEY_POSITION[1], KEY_POSITION[2]);
    else {
      const az = keyAzimuth + ambient.lightAzimuth;
      key.position.set(keyRadius * Math.sin(az), KEY_POSITION[1], keyRadius * Math.cos(az));
    }
  };

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
  /** Görgetési emelés (0–1, már simítva) — additív eltolás a pálya fölött. */
  let lift = 0;
  const render = () => {
    const state = cameraAt(rig, phase, land.top);
    const tx = state.target[0];
    const ty = state.target[1];
    const tz = state.target[2];
    if (lift > 0) {
      // A pálya pontja gömbi koordinátákban a cél körül: emelkedés + táv eltolása.
      const dx = state.position[0] - tx;
      const dy = state.position[1] - ty;
      const dz = state.position[2] - tz;
      const flat = Math.hypot(dx, dz);
      const dist = Math.hypot(flat, dy) * (1 + SCROLL_PULL * lift);
      const el = Math.atan2(dy, flat) + SCROLL_LIFT * lift;
      const az = Math.atan2(dx, dz);
      camera.position.set(
        tx + dist * Math.cos(el) * Math.sin(az),
        ty + dist * Math.sin(el),
        tz + dist * Math.cos(el) * Math.cos(az),
      );
    } else camera.position.set(...state.position);
    camera.lookAt(tx, ty, tz);
    ambientAt(phase, ambient);
    if (introTime !== null) introAt(introTime, intro);
    applyDay();
    // Vízszintes látószög → függőleges a (lencseeltolással nőtt) virtuális kép arányával.
    // A mobil kompozíció széles sávon (tablet) se veszítse el a függőleges
    // terjedelmét: ott legalább MIN_VFOV_MOBILE (telefonon ez nem lép életbe).
    const halfH = (state.hfov * Math.PI) / 360;
    const vfov = (2 * Math.atan(Math.tan(halfH) / camera.aspect) * 180) / Math.PI;
    camera.fov = rig === "mobile" ? Math.max(vfov, MIN_VFOV_MOBILE) : vfov;
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
    // A nyitány után a kör lágyan veszi át a réteget — a kamerával együtt
    // halad (fázisidőben), így megállítva ez is áll.
    if (introTime === null && ambientGain < 1) {
      ambientGain = Math.min(1, ambientGain + (step.phaseAdvance * CYCLE) / AMBIENT_FADE_IN);
    }
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
    setIntro(time, gain = 1) {
      if (time === null) {
        if (introTime === null) return;
        introTime = null;
        introGain = 0;
      } else {
        introTime = time;
        introGain = Math.max(0, Math.min(1, gain));
        ambientGain = 0; // a nyitány alatt a kör hallgat
      }
      if (!listening) render();
    },
    setScroll(progress) {
      const x = Math.max(0, Math.min(1, progress));
      const eased = 1 - (1 - x) * (1 - x); // power1.out — a lassú kigördülés is érezhető, a vége nyugodt
      // Apró változásra nem renderelünk; a nyugalmi (0) helyzetet viszont mindig pontosan visszaállítjuk.
      if (eased === lift || (eased !== 0 && Math.abs(eased - lift) < 1e-4)) return;
      lift = eased;
      if (!listening) render();
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
