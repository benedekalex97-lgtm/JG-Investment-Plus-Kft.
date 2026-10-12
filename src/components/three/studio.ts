import {
  BackSide,
  BufferAttribute,
  CanvasTexture,
  Color,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  NoColorSpace,
  PlaneGeometry,
  PMREMGenerator,
  RepeatWrapping,
  Scene,
  SphereGeometry,
  type WebGLRenderer,
} from "three";

/**
 * KÖZÖS THREE.JS-SEGÉDEK — a hero-színpad (hero-assembly/stage.ts) és a
 * szolgáltatási rétegjelenet (services-showcase/layers-stage.ts) ugyanazt a
 * stúdiófényt, szálcsiszolt textúrát és WebGL-előellenőrzést használja.
 * A függvények a hero-ból változatlanul kerültek ide.
 */

/** Determinisztikus álvéletlen (mulberry32) — a textúrák minden betöltéskor azonosak. */
export function seeded(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A szálcsiszolás-textúra sorainak száma (egy sor = egy csiszolásnyom). */
export const BRUSHED_ROWS = 256;

/** Finom, vízszintes szálcsiszolás-rajzolat (roughness-térkép, G csatorna). */
export function brushedTexture(amount: number, maxAnisotropy: number) {
  const size = BRUSHED_ROWS;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const random = seeded(0x4a47);
  const shade = (t: number) => Math.round(255 * (1 - amount * t));
  ctx.fillStyle = `rgb(${shade(0.5)},${shade(0.5)},${shade(0.5)})`;
  ctx.fillRect(0, 0, size, size);
  for (let y = 0; y < size; y++) {
    const row = shade(random());
    ctx.fillStyle = `rgb(${row},${row},${row})`;
    ctx.fillRect(0, y, size, 1);
    // Rövid, eltérő fényességű szálak ugyanabban a sorban.
    for (let s = 0; s < 3; s++) {
      const v = shade(random());
      ctx.fillStyle = `rgba(${v},${v},${v},0.6)`;
      ctx.fillRect(random() * size, y, 24 + random() * 120, 1);
    }
  }
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = NoColorSpace;
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.anisotropy = Math.min(8, maxAnisotropy);
  return texture;
}

/**
 * Stúdiókörnyezet: semleges-meleg, lágy háttérgradiens és nagy softboxok.
 * Nincs HDR-fájl, nincs hálózati letöltés; a PMREM egyszer készül el.
 *
 * Az elülső lapok a kamera mögötti, szűk tartományt tükrözik. Ott magasan
 * egy széles softbox ül: a felső ezüstlap és az üveg felső éle ezt
 * tükrözi (felül világosabb, lefelé szatén-szürke átmenet). Alatta balra
 * egy alacsony derítőkártya a bal oldali elemre és az ezüstlap bal felére ad
 * derítést — az üveg ezt a szögtartományt nem látja, így a padlizsán tónusa
 * mély marad.
 */
export function createStudioEnvironment(renderer: WebGLRenderer) {
  const scene = new Scene();
  const warm = new Color(1, 0.992, 0.978);

  const roomGeometry = new SphereGeometry(10, 48, 24);
  const pos = roomGeometry.getAttribute("position");
  const colors = new Float32Array(pos.count * 3);
  for (let i = 0; i < pos.count; i++) {
    const t = pos.getY(i) / 10;
    // padló (Porcelain-visszaverődés) -> horizont (legsötétebb) -> mennyezet
    const value =
      t < 0
        ? MathUtils.lerp(0.4, 0.78, MathUtils.smoothstep(-t, 0, 0.5))
        : MathUtils.lerp(0.4, 0.58, MathUtils.smoothstep(t, 0, 0.6));
    colors[i * 3] = value * warm.r;
    colors[i * 3 + 1] = value * warm.g;
    colors[i * 3 + 2] = value * warm.b;
  }
  roomGeometry.setAttribute("color", new BufferAttribute(colors, 3));
  const roomMaterial = new MeshBasicMaterial({ side: BackSide, vertexColors: true });
  scene.add(new Mesh(roomGeometry, roomMaterial));

  const panels: Array<[number, number, [number, number, number], number]> = [
    // [szélesség, magasság, pozíció, erősség]
    [13, 4.4, [-1.4, 4.4, 8.3], 3], // széles softbox a kamera mögött, magasan
    [6.8, 3, [-3.8, 0.3, 8.6], 1], // alacsony derítőkártya balra (az üveg nem tükrözi)
    [9, 6, [-6, 5.5, 6], 3.2], // kulcs-softbox: bal felül, elöl
    [10, 10, [0, 9.2, 0], 1.6], // felső derítő
    [2.4, 8, [8.6, 2, 2], 2], // jobb oldali élfény
    [2, 7, [-8.6, 1.5, -1], 1.3], // bal hátsó élfény
  ];
  const panelGeometry = new PlaneGeometry(1, 1);
  const panelMaterials: MeshBasicMaterial[] = [];
  for (const [w, h, [x, y, z], intensity] of panels) {
    const material = new MeshBasicMaterial({ color: warm.clone().multiplyScalar(intensity) });
    panelMaterials.push(material);
    const panel = new Mesh(panelGeometry, material);
    panel.scale.set(w, h, 1);
    panel.position.set(x, y, z);
    panel.lookAt(0, 0, 0);
    scene.add(panel);
  }

  const pmrem = new PMREMGenerator(renderer);
  const target = pmrem.fromScene(scene, 0.04);
  pmrem.dispose();
  roomGeometry.dispose();
  roomMaterial.dispose();
  panelGeometry.dispose();
  panelMaterials.forEach((material) => material.dispose());
  return target;
}

/**
 * WebGL2-előellenőrzés: ha nincs (letiltva, nem támogatott), a színpad létre
 * sem jön, így a Three.js sem ír hibát a konzolra — a hívó csendben a
 * statikus fallbackre vált.
 */
export function supportsWebGL2() {
  try {
    const probe = document.createElement("canvas");
    const gl = probe.getContext("webgl2");
    if (!gl) return false;
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return true;
  } catch {
    return false;
  }
}

