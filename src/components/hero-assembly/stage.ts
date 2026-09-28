import {
  BackSide,
  BufferAttribute,
  CanvasTexture,
  Color,
  DirectionalLight,
  DoubleSide,
  ExtrudeGeometry,
  Group,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  NeutralToneMapping,
  NoColorSpace,
  OrthographicCamera,
  PerspectiveCamera,
  PlaneGeometry,
  PMREMGenerator,
  RepeatWrapping,
  Scene,
  ShaderMaterial,
  Shape,
  SphereGeometry,
  SRGBColorSpace,
  Vector2,
  Vector3,
  WebGLRenderer,
  WebGLRenderTarget,
  type BufferGeometry,
  type Material,
  type Texture,
} from "three";
import { toCreasedNormals } from "three/addons/utils/BufferGeometryUtils.js";

import { ASSEMBLY, type AssemblyLayout, type MaterialKind } from "./config";
import {
  explodeOffsets,
  HALF_WIDTH,
  MARK,
  PIECE_KEYS,
  toScene,
  UNIT,
  type PieceKey,
} from "./geometry";

/**
 * A görgetésre összeálló embléma Three.js-színpada — keretrendszer-független.
 *
 * FELELŐSSÉG
 *   – pontosan HÁROM mesh (fedőlap, bal pillér, jobb pillér), a mester-SVG
 *     három subpathjából, enyhe extrudálással és visszafogott élletöréssel.
 *     Nincs negyedik panel, hátlap, összekötő elem vagy doboztest;
 *   – rögzített kamera; az embléma síkja a nézési irányra merőleges, így az
 *     összeállt állapot az SVG sziluettjének arányos vetülete, a negatív
 *     terekkel együtt;
 *   – egyetlen bemenet: setAssembly(0..1). Minden elem pozíciója
 *     lerpVectors(széthúzott, összeállt, érték) — ugyanazzal az értékkel;
 *   – IGÉNY SZERINTI renderelés: csak értékváltozáskor, átméretezéskor és
 *     láthatóság-visszatéréskor rajzol; nyugalomban és képernyőn kívül nem fut
 *     semmilyen loop.
 */

export type StageTokens = {
  porcelain: string;
  silver: string;
  aubergine: string;
  ink: string;
};

export type AssemblyStage = {
  /** 0 = széthúzott, 1 = összeállt (a görbét a hívó alkalmazza). */
  setAssembly(value: number): void;
  resize(width: number, height: number, layout: AssemblyLayout): void;
  dispose(): void;
  readonly pieceCount: number;
  readonly renderCount: number;
};

type StageOptions = {
  onFirstFrame?: () => void;
  onContextLost?: () => void;
};

type Piece = {
  key: PieceKey;
  mesh: Mesh<BufferGeometry, Material>;
  exploded: Vector3;
  assembled: Vector3;
  shadowStrength: number;
};

/** Determinisztikus álvéletlen (mulberry32) — a textúrák minden betöltéskor azonosak. */
function seeded(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Síkvetített UV: minden elem 0..1 között, a saját befoglaló dobozán. */
function planarUV(geometry: BufferGeometry) {
  geometry.computeBoundingBox();
  const box = geometry.boundingBox!;
  const pos = geometry.getAttribute("position");
  const width = box.max.x - box.min.x || 1;
  const height = box.max.y - box.min.y || 1;
  const uv = new Float32Array(pos.count * 2);
  for (let i = 0; i < pos.count; i++) {
    uv[i * 2] = (pos.getX(i) - box.min.x) / width;
    uv[i * 2 + 1] = (pos.getY(i) - box.min.y) / height;
  }
  geometry.setAttribute("uv", new BufferAttribute(uv, 2));
}

/**
 * Egy emblémaelem: az SVG-subpath enyhén extrudálva. A bevelOffset = -bevel
 * miatt az élletörés BEFELÉ indul, így a legkülső kontúr pontosan az eredeti
 * subpath — a sziluett és a rések nem nőnek. Az elülső lap a z = 0 síkban
 * ül, a vastagság hátrafelé nő.
 */
function buildPieceGeometry(key: PieceKey) {
  const { depth, bevel, bevelSegments, creaseAngle } = ASSEMBLY.emblem;
  const d = depth * UNIT;
  const b = bevel * UNIT;
  const points = MARK.pieces[key].points.map((p) => {
    const [x, y] = toScene(p);
    return new Vector2(x, y);
  });

  const geometry = new ExtrudeGeometry(new Shape(points), {
    depth: d - 2 * b,
    bevelEnabled: true,
    bevelThickness: b,
    bevelSize: b,
    bevelOffset: -b,
    bevelSegments,
    curveSegments: 1,
    steps: 1,
  });
  geometry.translate(0, 0, -(d - b));
  planarUV(geometry);

  // Élletörés: a szomszédos bevel-szegmensek simán árnyaltak, a sokszög
  // sarkai élesek maradnak; az elülső/hátsó lap normálisa pontosan síkbeli.
  const smooth = toCreasedNormals(geometry, MathUtils.degToRad(creaseAngle));
  const normal = smooth.getAttribute("normal");
  const position = smooth.getAttribute("position");
  for (const group of smooth.groups) {
    if (group.materialIndex !== 0) continue;
    for (let i = group.start; i < group.start + group.count; i++) {
      normal.setXYZ(i, 0, 0, position.getZ(i) > -d / 2 ? 1 : -1);
    }
  }
  normal.needsUpdate = true;
  smooth.clearGroups();
  return smooth;
}

/** A szálcsiszolás-textúra sorainak száma (egy sor = egy csiszolásnyom). */
const BRUSHED_ROWS = 256;

/** Egy emblémaelem magassága logóegységben (az SVG-koordinátákból). */
function pieceHeight(key: PieceKey) {
  const ys = MARK.pieces[key].points.map(([, y]) => y);
  return Math.max(...ys) - Math.min(...ys);
}

/** Finom, vízszintes szálcsiszolás-rajzolat (roughness-térkép, G csatorna). */
function brushedTexture(amount: number, maxAnisotropy: number) {
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
 * Üvegvastagság-térkép (G csatorna): jobb felül vastagabb, bal alul
 * vékonyabb. A vékonyabb részen kevesebb fény nyelődik el, ott jelenik meg
 * az átvilágított, Muted Plum felé húzó tónus.
 */
function thicknessTexture(top: number, bottom: number) {
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const image = ctx.createImageData(size, size);
  for (let py = 0; py < size; py++) {
    for (let px = 0; px < size; px++) {
      const u = px / (size - 1);
      const v = 1 - py / (size - 1);
      const t = MathUtils.smoothstep(0.22 * u + 0.78 * v, 0, 1);
      const g = Math.round(MathUtils.lerp(bottom, top, t) * 255);
      const i = (py * size + px) * 4;
      image.data[i] = g;
      image.data[i + 1] = g;
      image.data[i + 2] = g;
      image.data[i + 3] = 255;
    }
  }
  ctx.putImageData(image, 0, 0);
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = NoColorSpace;
  return texture;
}

/**
 * A porcelánlap lágy fényesés-átmenete (bal felül világosabb, jobb alul egy
 * árnyalattal sötétebb) — egy nagy, közeli softbox esését idézi, ami egy
 * sík, matt lapon egyetlen távoli fényforrással nem jönne létre.
 */
function falloffTexture(from: number, to: number) {
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const gradient = ctx.createLinearGradient(0, 0, size, size * 0.75);
  const tone = (value: number) => {
    const v = Math.round(value * 255);
    return `rgb(${v},${v},${v})`;
  };
  gradient.addColorStop(0, tone(from));
  gradient.addColorStop(1, tone(to));
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
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
function createStudioEnvironment(renderer: WebGLRenderer) {
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

/** Egyszerű, szeparálható Gauss-elmosás (9 minta) a kontaktárnyékhoz. */
function blurMaterial() {
  return new ShaderMaterial({
    uniforms: { tDiffuse: { value: null }, direction: { value: new Vector2() } },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position.xy, 0.0, 1.0);
      }`,
    fragmentShader: /* glsl */ `
      uniform sampler2D tDiffuse;
      uniform vec2 direction;
      varying vec2 vUv;
      void main() {
        vec4 sum = texture2D(tDiffuse, vUv) * 0.1633;
        sum += texture2D(tDiffuse, vUv + direction * 1.0) * 0.1531;
        sum += texture2D(tDiffuse, vUv - direction * 1.0) * 0.1531;
        sum += texture2D(tDiffuse, vUv + direction * 2.0) * 0.12245;
        sum += texture2D(tDiffuse, vUv - direction * 2.0) * 0.12245;
        sum += texture2D(tDiffuse, vUv + direction * 3.0) * 0.0918;
        sum += texture2D(tDiffuse, vUv - direction * 3.0) * 0.0918;
        sum += texture2D(tDiffuse, vUv + direction * 4.0) * 0.051;
        sum += texture2D(tDiffuse, vUv - direction * 4.0) * 0.051;
        gl_FragColor = sum;
      }`,
    depthTest: false,
    depthWrite: false,
  });
}

/**
 * WebGL2-előellenőrzés: ha nincs (letiltva, nem támogatott), a színpad létre
 * sem jön, így a Three.js sem ír hibát a konzolra — a hívó csendben a
 * statikus fallbackre vált.
 */
function supportsWebGL2() {
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

export function createAssemblyStage(
  host: HTMLElement,
  tokens: StageTokens,
  options: StageOptions = {},
): AssemblyStage {
  if (!supportsWebGL2()) throw new Error("WebGL2 nem érhető el");

  // Minden mountnál FRISS canvas: így egy korábbi (pl. StrictMode miatt
  // lebontott) példány elveszített kontextusa sosem öröklődik.
  const canvas = document.createElement("canvas");
  canvas.className = "jg-assembly__canvas";
  canvas.setAttribute("aria-hidden", "true");
  canvas.setAttribute("role", "presentation");

  // Ha nincs WebGL2, a konstruktor kivételt dob — a hívó statikus
  // fallbackre vált.
  const renderer = new WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
    stencil: false,
    powerPreference: "high-performance",
  });
  host.appendChild(canvas);

  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = NeutralToneMapping;
  renderer.toneMappingExposure = ASSEMBLY.light.exposure;
  renderer.transmissionResolutionScale = ASSEMBLY.render.transmissionScale;

  const porcelain = new Color(tokens.porcelain);
  const scene = new Scene();
  // A háttér PONTOSAN a hero Porcelain felülete (a clear color nincs
  // tónusleképezve), így a canvas széle nem látszik.
  scene.background = porcelain.clone();

  const environment = createStudioEnvironment(renderer);
  // A környezeti térkép ANYAGONKÉNT kerül fel (nem scene.environment-ként):
  // a Three.js scene.environment esetén a jelenet közös intenzitásával
  // felülírná az anyagok saját envMapIntensity értékét.
  const envMap = environment.texture;
  const envIntensity = (value: number) => value * ASSEMBLY.light.environment;

  const warmLight = new Color(1, 0.985, 0.965);
  const key = new DirectionalLight(warmLight, ASSEMBLY.light.key);
  key.position.set(-3, 5, 6);
  scene.add(key);

  // ---- Anyagok -----------------------------------------------------------
  // Az elem -> anyag hozzárendelés a config.ts pieceMaterials mezőjéből jön.
  // Az anyaggal együtt minden tulajdonsága vándorol (textúra, érdesség,
  // fémesség, tónusleképezés), nem csak az alapszín.
  const depth = ASSEMBLY.emblem.depth * UNIT;
  const { porcelain: porcelainCfg, silver: silverCfg, glass: glassCfg } = ASSEMBLY.materials;
  const brushed = brushedTexture(silverCfg.brushed, renderer.capabilities.getMaxAnisotropy());
  const glassThickness = thicknessTexture(glassCfg.thicknessTop, glassCfg.thicknessBottom);
  const porcelainFalloff = falloffTexture(porcelainCfg.falloff[0], porcelainCfg.falloff[1]);
  const textures: Texture[] = [brushed, glassThickness, porcelainFalloff];

  function createMaterial(kind: MaterialKind, key: PieceKey) {
    switch (kind) {
      case "porcelain":
        return new MeshPhysicalMaterial({
          color: porcelain.clone(),
          metalness: 0,
          map: porcelainFalloff,
          roughness: porcelainCfg.roughness,
          envMap,
          envMapIntensity: envIntensity(porcelainCfg.envMapIntensity),
          toneMapped: false,
        });
      case "silver": {
        // A csiszolásnyomok sűrűsége logóegységben állandó, így a rajzolat
        // bármelyik elemen ugyanolyan finom.
        const map = brushed.clone();
        map.repeat.set(1, (pieceHeight(key) * silverCfg.brushedRowsPerUnit) / BRUSHED_ROWS);
        map.needsUpdate = true;
        textures.push(map);
        return new MeshPhysicalMaterial({
          color: new Color(tokens.silver),
          metalness: 1,
          roughness: silverCfg.roughness,
          roughnessMap: map,
          envMap,
          envMapIntensity: envIntensity(silverCfg.envMapIntensity),
        });
      }
      case "glass":
        return new MeshPhysicalMaterial({
          color: new Color(1, 1, 1),
          metalness: 0,
          roughness: glassCfg.roughness,
          ior: glassCfg.ior,
          transmission: 1,
          thickness: depth,
          thicknessMap: glassThickness,
          attenuationColor: new Color(tokens.aubergine),
          attenuationDistance: depth,
          clearcoat: glassCfg.clearcoat,
          clearcoatRoughness: glassCfg.clearcoatRoughness,
          envMap,
          envMapIntensity: envIntensity(glassCfg.envMapIntensity),
        });
    }
  }

  const materials = Object.fromEntries(
    PIECE_KEYS.map((key) => [key, createMaterial(ASSEMBLY.pieceMaterials[key], key)]),
  ) as Record<PieceKey, MeshPhysicalMaterial>;

  // ---- A három elem --------------------------------------------------------
  // A csoport a kamera emelésével azonos szögben hátra van döntve: az
  // embléma síkja így végig merőleges a nézési irányra.
  const pitch = MathUtils.degToRad(ASSEMBLY.camera.pitch);
  const group = new Group();
  group.rotation.x = -pitch;
  scene.add(group);
  const pieces: Piece[] = PIECE_KEYS.map((pieceKey) => {
    const mesh = new Mesh(buildPieceGeometry(pieceKey), materials[pieceKey] as Material);
    mesh.name = `jg-${pieceKey}`;
    group.add(mesh);
    return {
      key: pieceKey,
      mesh,
      exploded: new Vector3(),
      assembled: new Vector3(0, 0, 0),
      shadowStrength:
        ASSEMBLY.pieceMaterials[pieceKey] === "glass" ? ASSEMBLY.shadow.glassStrength : 1,
    };
  });

  // ---- Kontaktárnyék -------------------------------------------------------
  // Alulról néző ortografikus kamera rögzíti az elemek padló feletti
  // magasságát, ezt két menetben elmossuk, majd egy átlátszó síkon, az
  // Ink–Aubergine keverék tónusával jelenítjük meg. Csak akkor fut, ha az
  // elemek elmozdultak.
  const shadowCfg = ASSEMBLY.shadow;
  const shadowWidth = 2 * (HALF_WIDTH + ASSEMBLY.explode.wide.spread + 0.4);
  const shadowDepth = 1;
  const shadowResX = shadowCfg.resolution;
  const shadowResY = Math.round(shadowCfg.resolution * (shadowDepth / shadowWidth));
  const shadowTarget = new WebGLRenderTarget(shadowResX, shadowResY);
  shadowTarget.texture.generateMipmaps = false;
  const shadowBlurTarget = new WebGLRenderTarget(shadowResX, shadowResY, { depthBuffer: false });
  shadowBlurTarget.texture.generateMipmaps = false;

  const shadowGroup = new Group();
  scene.add(shadowGroup);
  const shadowPlaneGeometry = new PlaneGeometry(shadowWidth, shadowDepth).rotateX(Math.PI / 2);
  const shadowPlaneMaterial = new MeshBasicMaterial({
    color: new Color(tokens.ink).lerp(new Color(tokens.aubergine), 0.35),
    alphaMap: shadowTarget.texture,
    transparent: true,
    opacity: shadowCfg.opacity,
    depthWrite: false,
  });
  const shadowPlane = new Mesh(shadowPlaneGeometry, shadowPlaneMaterial);
  shadowPlane.scale.y = -1; // felfelé néző oldal
  shadowPlane.renderOrder = 1;
  shadowGroup.add(shadowPlane);

  const reach = shadowCfg.reach * UNIT;
  const shadowCamera = new OrthographicCamera(
    -shadowWidth / 2,
    shadowWidth / 2,
    shadowDepth / 2,
    -shadowDepth / 2,
    0,
    reach,
  );
  shadowCamera.rotation.x = Math.PI / 2; // felfelé néz
  shadowGroup.add(shadowCamera);

  const heightMaterial = new ShaderMaterial({
    uniforms: {
      floorY: { value: 0 },
      reach: { value: reach },
      strength: { value: 1 },
    },
    vertexShader: /* glsl */ `
      varying float vHeight;
      void main() {
        vec4 world = modelMatrix * vec4(position, 1.0);
        vHeight = world.y;
        gl_Position = projectionMatrix * viewMatrix * world;
      }`,
    fragmentShader: /* glsl */ `
      uniform float floorY;
      uniform float reach;
      uniform float strength;
      varying float vHeight;
      void main() {
        float h = clamp((vHeight - floorY) / reach, 0.0, 1.0);
        float a = strength * (1.0 - h) * (1.0 - h);
        gl_FragColor = vec4(a);
      }`,
    side: DoubleSide,
  });

  const quadCamera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const quadGeometry = new PlaneGeometry(2, 2);
  const blur = blurMaterial();
  const quad = new Mesh(quadGeometry, blur);
  quad.frustumCulled = false;

  function blurPass(amount: number) {
    blur.uniforms.tDiffuse.value = shadowTarget.texture;
    blur.uniforms.direction.value.set(amount / shadowResX, 0);
    renderer.setRenderTarget(shadowBlurTarget);
    renderer.render(quad, quadCamera);
    blur.uniforms.tDiffuse.value = shadowBlurTarget.texture;
    blur.uniforms.direction.value.set(0, amount / shadowResY);
    renderer.setRenderTarget(shadowTarget);
    renderer.render(quad, quadCamera);
  }

  function renderShadow() {
    heightMaterial.uniforms.floorY.value = shadowGroup.position.y;
    renderer.setRenderTarget(shadowTarget);
    renderer.setClearColor(0x000000, 0);
    renderer.clear(true, true, false);
    const autoClear = renderer.autoClear;
    renderer.autoClear = false;
    for (const piece of pieces) {
      const original = piece.mesh.material;
      piece.mesh.material = heightMaterial;
      heightMaterial.uniforms.strength.value = piece.shadowStrength;
      renderer.render(piece.mesh, shadowCamera);
      piece.mesh.material = original;
    }
    renderer.autoClear = autoClear;
    blurPass(shadowCfg.blur);
    blurPass(shadowCfg.blur * 0.45);
    renderer.setRenderTarget(null);
    renderer.setClearColor(porcelain, 1);
  }

  // ---- Kamera és keret -----------------------------------------------------
  const camera = new PerspectiveCamera(ASSEMBLY.camera.fov, 1, 0.1, 50);
  const probe = new Vector3();

  function placeCamera(distance: number) {
    camera.position.set(0, distance * Math.sin(pitch), distance * Math.cos(pitch));
    camera.lookAt(0, 0, 0);
    camera.near = Math.max(0.05, distance - 2.5);
    camera.far = distance + 3;
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld();
  }

  function frame(width: number, height: number, layout: AssemblyLayout) {
    const explode = ASSEMBLY.explode[layout];
    const offsets = explodeOffsets(explode);
    for (const piece of pieces) {
      const [x, y] = offsets[piece.key];
      piece.exploded.set(x, y, 0);
    }
    const drop = -offsets.left[1];
    const outer = HALF_WIDTH + explode.spread;
    group.updateMatrixWorld();

    // A padló a (széthúzott, hátradöntött) pillérek legalsó pontja alatt ül.
    const lowest = group.localToWorld(probe.set(outer, -0.5 - drop, -depth)).y;
    const floorY = lowest - ASSEMBLY.shadow.floorGap * UNIT;
    const floorZ = group.localToWorld(probe.set(0, -0.5 - drop, -depth / 2)).z;
    shadowGroup.position.set(0, floorY, floorZ - 0.18);
    shadowGroup.updateMatrixWorld();

    // A keretbe foglalandó pontok: a széthúzott állapot szélső csúcsai és
    // az árnyék kiterjedése a padlón.
    const fitPoints = [
      new Vector3(0, 0.5 + explode.lift, 0),
      new Vector3(outer, 0.5 - 23 * UNIT - drop, 0),
      new Vector3(-outer, 0.5 - 23 * UNIT - drop, 0),
      new Vector3(outer, -0.5 - drop, 0),
      new Vector3(-outer, -0.5 - drop, 0),
    ].map((p) => group.localToWorld(p));
    fitPoints.push(
      new Vector3(outer, floorY, floorZ + 0.14),
      new Vector3(-outer, floorY, floorZ + 0.14),
    );

    camera.aspect = width / Math.max(1, height);
    const halfFov = Math.tan(MathUtils.degToRad(ASSEMBLY.camera.fov / 2));
    const minDistance = 1 / (2 * ASSEMBLY.camera.maxEmblemFraction[layout] * halfFov);
    const safe = 1 - ASSEMBLY.camera.margin;
    let distance = minDistance;
    // A vetület a távolsággal fordítottan arányos: néhány lépés alatt
    // beáll a legkisebb távolságra, amelynél minden pont a margón belül van.
    for (let i = 0; i < 5; i++) {
      placeCamera(distance);
      let extent = 0;
      for (const point of fitPoints) {
        probe.copy(point).project(camera);
        extent = Math.max(extent, Math.abs(probe.x), Math.abs(probe.y));
      }
      distance = Math.max(minDistance, (distance * extent) / safe);
    }
    placeCamera(distance);
  }

  // ---- Igény szerinti renderelés ------------------------------------------
  let assembly = 0;
  let dirty = true;
  let shadowDirty = true;
  let visible = true;
  let frameId = 0;
  let renderCount = 0;
  let firstFrame = false;
  let disposed = false;
  let sized = false;

  function applyAssembly() {
    for (const piece of pieces) {
      piece.mesh.position.lerpVectors(piece.exploded, piece.assembled, assembly);
    }
  }

  function renderFrame() {
    frameId = 0;
    if (disposed || !visible || !dirty || !sized) return;
    dirty = false;
    applyAssembly();
    scene.updateMatrixWorld();
    if (shadowDirty) {
      shadowDirty = false;
      renderShadow();
    }
    renderer.setRenderTarget(null);
    renderer.render(scene, camera);
    renderCount += 1;
    if (!firstFrame) {
      firstFrame = true;
      options.onFirstFrame?.();
    }
  }

  function schedule() {
    if (frameId || disposed) return;
    frameId = window.requestAnimationFrame(renderFrame);
  }

  // Képernyőn kívül nem renderelünk; visszatéréskor egy képkocka, ha kell.
  const visibility = new IntersectionObserver(
    (entries) => {
      visible = entries.some((entry) => entry.isIntersecting);
      if (visible && dirty) schedule();
    },
    { rootMargin: "120px 0px" },
  );
  visibility.observe(host);

  function onContextLost() {
    if (disposed) return;
    options.onContextLost?.();
  }
  canvas.addEventListener("webglcontextlost", onContextLost);

  return {
    get pieceCount() {
      return pieces.length;
    },
    get renderCount() {
      return renderCount;
    },
    setAssembly(value: number) {
      const next = MathUtils.clamp(value, 0, 1);
      if (Math.abs(next - assembly) < 1e-5 && firstFrame) return;
      assembly = next;
      dirty = true;
      shadowDirty = true;
      schedule();
    },
    resize(width: number, height: number, layout: AssemblyLayout) {
      if (width < 2 || height < 2) return;
      const ratio = Math.min(window.devicePixelRatio || 1, ASSEMBLY.render.maxPixelRatio[layout]);
      renderer.setPixelRatio(ratio);
      renderer.setSize(width, height, false);
      frame(width, height, layout);
      sized = true;
      dirty = true;
      shadowDirty = true;
      // Átméretezés után szinkron rajzolunk, hogy ne villanjon üres canvas.
      if (frameId) {
        window.cancelAnimationFrame(frameId);
        frameId = 0;
      }
      renderFrame();
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      if (frameId) window.cancelAnimationFrame(frameId);
      visibility.disconnect();
      canvas.removeEventListener("webglcontextlost", onContextLost);
      for (const piece of pieces) piece.mesh.geometry.dispose();
      Object.values(materials).forEach((material) => material.dispose());
      textures.forEach((texture) => texture.dispose());
      environment.dispose();
      shadowTarget.dispose();
      shadowBlurTarget.dispose();
      shadowPlaneGeometry.dispose();
      shadowPlaneMaterial.dispose();
      heightMaterial.dispose();
      quadGeometry.dispose();
      blur.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      canvas.remove();
    },
  };
}
