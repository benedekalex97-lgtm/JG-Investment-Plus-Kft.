import {
  CanvasTexture,
  Color,
  DirectionalLight,
  ExtrudeGeometry,
  Group,
  MathUtils,
  Mesh,
  MeshPhysicalMaterial,
  MultiplyBlending,
  NeutralToneMapping,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  Shape,
  SRGBColorSpace,
  Vector3,
  WebGLRenderer,
  type Texture,
} from "three";

import { BRUSHED_ROWS, brushedTexture, createStudioEnvironment, supportsWebGL2 } from "../three/studio";
import { LAYERS, type LayersLayout } from "./layers-config";

/**
 * A „Megtakarítási és adózási lehetőségek" rétegjelenete — keretrendszer-
 * független Three.js-színpad.
 *
 *   – pontosan NÉGY különálló, merev, vízszintes lap (négyzetes alaprajz,
 *     lekerekített sarkok, befelé induló élletörés); ötödik elem nincs;
 *   – egyetlen bemenet: setProgress(0..1) — 0 = nyitott, 1 = összeállt. A
 *     lapok KIZÁRÓLAG függőlegesen mozognak, a csoport közepe körül
 *     szimmetrikusan, így a kompozíció közepe helyben marad;
 *   – rögzített kamera (nincs kameramozgás, forgás); a keret a NYITOTT
 *     állapotra és az árnyékra méretezett, így mindkét állapot elfér;
 *   – IGÉNY SZERINTI renderelés: csak progress-, méret- vagy láthatóság-
 *     változáskor rajzol; képernyőn kívül és nyugalomban nem fut loop.
 */

export type LayersTokens = {
  porcelain: string;
  silver: string;
  plum: string;
  aubergine: string;
  ink: string;
};

export type LayersStage = {
  setProgress(value: number): void;
  resize(width: number, height: number, layout: LayersLayout): void;
  dispose(): void;
  readonly renderCount: number;
  readonly slabCount: number;
};

type Options = {
  onFirstFrame?: () => void;
  onContextLost?: () => void;
};

const { thickness, cornerRadius, bevel, bevelSegments, curveSegments } = LAYERS.slab;
/** A padlóárnyék-sík mérete (a lap oldalhosszához képest; a maszk szélei lágyak). */
const FLOOR_SHADOW_SIZE = 1.18;

/** Lekerekített négyzet (oldal = 1) extrudálva, vízszintesre fektetve; teteje y = +t/2. */
function slabGeometry() {
  const h = 0.5;
  const r = cornerRadius;
  const shape = new Shape();
  shape.moveTo(-h + r, -h);
  shape.lineTo(h - r, -h);
  shape.quadraticCurveTo(h, -h, h, -h + r);
  shape.lineTo(h, h - r);
  shape.quadraticCurveTo(h, h, h - r, h);
  shape.lineTo(-h + r, h);
  shape.quadraticCurveTo(-h, h, -h, h - r);
  shape.lineTo(-h, -h + r);
  shape.quadraticCurveTo(-h, -h, -h + r, -h);
  const geometry = new ExtrudeGeometry(shape, {
    depth: thickness - 2 * bevel,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelOffset: -bevel,
    bevelSegments,
    curveSegments,
    steps: 1,
  });
  geometry.translate(0, 0, -(thickness - 2 * bevel) / 2);
  geometry.rotateX(-Math.PI / 2);
  geometry.computeVertexNormals();
  return geometry;
}

/** A képlap háttere: a referenciakép mért háttérátmenete, Porcelain-szorzókból. */
function backdropTexture(porcelain: Color) {
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const image = ctx.createImageData(size, size);
  const { base, highlight, shade } = LAYERS.backdrop;
  // a token sRGB-értéke (a Color belül lineáris térben tárol)
  const srgb = porcelain.clone().convertLinearToSRGB();
  for (let py = 0; py < size; py++) {
    for (let px = 0; px < size; px++) {
      const u = px / (size - 1);
      const v = py / (size - 1);
      // világos folt bal középen, sötétedés jobbra és felül
      const light = Math.exp(-(((u - 0.08) / 0.42) ** 2 + ((v - 0.55) / 0.5) ** 2));
      const dark = MathUtils.smoothstep(u, 0.45, 1) * 0.75 + MathUtils.smoothstep(1 - v, 0.55, 1) * 0.25;
      const k = base + (highlight - base) * light + (shade - base) * dark;
      const i = (py * size + px) * 4;
      image.data[i] = Math.round(srgb.r * 255 * k);
      image.data[i + 1] = Math.round(srgb.g * 255 * k);
      image.data[i + 2] = Math.round(srgb.b * 255 * k);
      image.data[i + 3] = 255;
    }
  }
  ctx.putImageData(image, 0, 0);
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

/** Lágy, lekerekített négyzet alakú árnyékmaszk (R = 1 a közepén, 0 kívül). */
function shadowMask() {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const image = ctx.createImageData(size, size);
  const half = 0.36; // a lap félmérete a maszkon belül (a többi elmosás)
  const r = 0.07;
  for (let py = 0; py < size; py++) {
    for (let px = 0; px < size; px++) {
      const x = Math.abs((px + 0.5) / size - 0.5);
      const y = Math.abs((py + 0.5) / size - 0.5);
      const qx = Math.max(x - (half - r), 0);
      const qy = Math.max(y - (half - r), 0);
      const outside = Math.hypot(qx, qy) + Math.min(Math.max(x - (half - r), y - (half - r)), 0) - r;
      const value = 1 - MathUtils.smoothstep(outside, -0.1, 0.13);
      const i = (py * size + px) * 4;
      const g = Math.round(value * 255);
      image.data[i] = g;
      image.data[i + 1] = g;
      image.data[i + 2] = g;
      image.data[i + 3] = 255;
    }
  }
  ctx.putImageData(image, 0, 0);
  return new CanvasTexture(canvas);
}

/**
 * Szorzó keverésű árnyéksík. NEM átlátszó anyag (transparent: false), ezért
 * az átlátszatlan listában renderelődik — így az üveglapokon ÁT is látszik
 * (a transmission-menet csak az átlátszatlan objektumokat látja).
 */
function shadowMaterial(mask: Texture, tint: Color) {
  return new ShaderMaterial({
    uniforms: { mask: { value: mask }, strength: { value: 0 }, tint: { value: tint } },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: /* glsl */ `
      uniform sampler2D mask;
      uniform float strength;
      uniform vec3 tint;
      varying vec2 vUv;
      void main() {
        float a = texture2D(mask, vUv).r * strength;
        gl_FragColor = vec4(mix(vec3(1.0), tint, a), 1.0);
      }`,
    blending: MultiplyBlending,
    premultipliedAlpha: true,
    transparent: false,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -2,
    polygonOffsetUnits: -2,
  });
}

export function createLayersStage(host: HTMLElement, tokens: LayersTokens, options: Options = {}): LayersStage {
  if (!supportsWebGL2()) throw new Error("WebGL2 nem érhető el");

  const canvas = document.createElement("canvas");
  canvas.className = "block h-full w-full";
  canvas.setAttribute("aria-hidden", "true");
  canvas.setAttribute("role", "presentation");
  canvas.tabIndex = -1;

  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: false, stencil: false });
  host.appendChild(canvas);
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = NeutralToneMapping;
  renderer.toneMappingExposure = LAYERS.light.exposure;

  const porcelain = new Color(tokens.porcelain);
  const scene = new Scene();
  const backdrop = backdropTexture(porcelain);
  scene.background = backdrop;

  const environment = createStudioEnvironment(renderer);
  const envMap = environment.texture;

  const key = new DirectionalLight(new Color(1, 0.985, 0.965), LAYERS.light.key);
  key.position.set(-3, 6, 4);
  scene.add(key);

  // ---- Anyagok (alulról felfelé) -------------------------------------------
  const m = LAYERS.materials;
  const brushed = brushedTexture(m.silver.brushed, renderer.capabilities.getMaxAnisotropy());
  brushed.repeat.set(1, m.silver.brushedRowsPerUnit / BRUSHED_ROWS);
  brushed.needsUpdate = true;
  type GlassConfig = {
    roughness: number;
    ior: number;
    attenuation: number;
    edge: number;
    clearcoat: number;
    envMapIntensity: number;
  };
  /**
   * Üveg: a fedőlap (ExtrudeGeometry 0. csoport) a lap vastagságán át tompít;
   * az oldalfal (1. csoport) hosszabb fényúttal számol, így az él sötétebb,
   * füstösebb — a valódi üveglap élén a fény a lap síkjában, hosszan halad.
   * (A Three.js transmissionje állandó vastagsággal számol, magától nem
   * sötétítené az éleket.)
   */
  const glass = (cfg: GlassConfig, color: string, path: number) =>
    new MeshPhysicalMaterial({
      color: new Color(1, 1, 1),
      metalness: 0,
      roughness: cfg.roughness,
      ior: cfg.ior,
      transmission: 1,
      thickness: thickness * path,
      attenuationColor: new Color(color),
      attenuationDistance: thickness * cfg.attenuation,
      clearcoat: cfg.clearcoat,
      clearcoatRoughness: 0.06,
      envMap,
      envMapIntensity: cfg.envMapIntensity,
    });
  const porcelainMaterial = new MeshPhysicalMaterial({
    color: porcelain.clone(),
    metalness: 0,
    roughness: m.porcelain.roughness,
    envMap,
    envMapIntensity: m.porcelain.envMapIntensity,
  });
  const silverMaterial = new MeshPhysicalMaterial({
    color: new Color(tokens.silver),
    metalness: 1,
    roughness: m.silver.roughness,
    roughnessMap: brushed,
    envMap,
    envMapIntensity: m.silver.envMapIntensity,
  });
  // [fedőlap, oldalfal] anyagpárok, alulról felfelé
  const materials: [MeshPhysicalMaterial, MeshPhysicalMaterial][] = [
    [porcelainMaterial, porcelainMaterial],
    [silverMaterial, silverMaterial],
    [glass(m.plumGlass, tokens.plum, 1), glass(m.plumGlass, tokens.plum, m.plumGlass.edge)],
    [glass(m.aubergineGlass, tokens.aubergine, 1), glass(m.aubergineGlass, tokens.aubergine, m.aubergineGlass.edge)],
  ];

  // ---- A négy lap ----------------------------------------------------------
  const group = new Group();
  group.rotation.y = MathUtils.degToRad(LAYERS.camera.yaw);
  scene.add(group);
  const geometry = slabGeometry();
  const slabs = materials.map((pair, index) => {
    const mesh = new Mesh(geometry, pair);
    mesh.name = `jg-layer-${index + 1}`;
    group.add(mesh);
    return mesh;
  });

  // ---- Kontaktárnyékok -----------------------------------------------------
  const mask = shadowMask();
  const ink = new Color(tokens.ink);
  const plumTint = new Color(tokens.plum).lerp(new Color(1, 1, 1), 0.35);
  const planeGeometry = new PlaneGeometry(1, 1).rotateX(-Math.PI / 2);
  // árnyék i: az (i+1)-edik lap árnyéka az i-edik lap tetején; 0: padló
  const shadows = [0, 1, 2, 3].map((index) => {
    const tint = index >= 2 ? plumTint : ink; // üveg fölötte: tónusos, halványabb
    const material = shadowMaterial(mask, tint);
    const plane = new Mesh(planeGeometry, material);
    plane.renderOrder = 1;
    group.add(plane);
    return { plane, material };
  });

  // ---- Kamera és keret -----------------------------------------------------
  const camera = new PerspectiveCamera(LAYERS.camera.fov, 1, 0.1, 100);
  const elevation = MathUtils.degToRad(LAYERS.camera.elevation);
  const target = new Vector3();
  const probe = new Vector3();
  let layout: LayersLayout = "wide";
  let progress = 0;

  const spacingFor = (value: number) =>
    MathUtils.lerp(LAYERS.spacing.open[layout], LAYERS.spacing.closed, value);

  function place(distance: number) {
    camera.position.set(0, distance * Math.sin(elevation), distance * Math.cos(elevation)).add(target);
    camera.lookAt(target);
    camera.near = Math.max(0.05, distance - 4);
    camera.far = distance + 4;
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld();
  }

  function frame(width: number, height: number) {
    camera.aspect = width / Math.max(1, height);
    group.updateMatrixWorld();
    const open = LAYERS.spacing.open[layout];
    const half = 0.5;
    const corners = [[-half, -half], [half, -half], [half, half], [-half, half]];
    // a NYITOTT állapot szélső csúcsai (erre igazítunk középre) …
    const slabPoints: Vector3[] = [];
    for (const y of [1.5 * open + thickness / 2, -1.5 * open - thickness / 2]) {
      for (const [x, z] of corners) slabPoints.push(group.localToWorld(new Vector3(x, y, z)));
    }
    // … és az alatta lévő árnyék, aminek csak a margón belül kell maradnia
    const shadowY = -1.5 * open - thickness / 2 - LAYERS.shadow.floorGap;
    const reach = 0.5 * FLOOR_SHADOW_SIZE;
    const shadowPoints = corners.map(([x, z]) =>
      group.localToWorld(new Vector3((x * reach) / half, shadowY, (z * reach) / half)),
    );

    const safe = 1 - LAYERS.camera.margin;
    const halfFov = Math.tan(MathUtils.degToRad(LAYERS.camera.fov / 2));
    const up = new Vector3();
    const bounds = (points: Vector3[]) => {
      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
      for (const point of points) {
        probe.copy(point).project(camera);
        minX = Math.min(minX, probe.x);
        maxX = Math.max(maxX, probe.x);
        minY = Math.min(minY, probe.y);
        maxY = Math.max(maxY, probe.y);
      }
      return { minX, maxX, minY, maxY };
    };
    let distance = 2 / halfFov;
    target.set(0, 0, 0);
    for (let i = 0; i < 8; i++) {
      place(distance);
      const slabsBox = bounds(slabPoints);
      const all = bounds([...slabPoints, ...shadowPoints]);
      // a lapok kerülnek a képmező közepére (a kamera felfelé vektora mentén)
      up.set(0, 1, 0).applyQuaternion(camera.quaternion);
      target.addScaledVector(up, ((slabsBox.minY + slabsBox.maxY) / 2) * distance * halfFov);
      const extent = Math.max(-all.minX, all.maxX, -all.minY, all.maxY);
      distance = (distance * extent) / safe;
    }
    place(distance);
  }

  function apply() {
    const spacing = spacingFor(progress);
    slabs.forEach((mesh, index) => {
      mesh.position.set(0, (index - 1.5) * spacing, 0);
    });
    const open = LAYERS.spacing.open[layout];
    const closed = LAYERS.spacing.closed;
    // rétegközi árnyékok: a rés szűkülésével erősödnek és élesednek
    const gapT = MathUtils.clamp((spacing - closed) / Math.max(1e-6, open - closed), 0, 1);
    for (let i = 1; i < 4; i++) {
      const { plane, material } = shadows[i];
      const below = slabs[i - 1].position.y + thickness / 2 + 0.0015;
      plane.position.set(0, below, 0);
      const size = 1.02 + 0.22 * gapT;
      plane.scale.set(size, 1, size);
      const factor = i >= 2 ? LAYERS.shadow.glassFactor : 1;
      material.uniforms.strength.value =
        factor * MathUtils.lerp(LAYERS.shadow.between.near, LAYERS.shadow.between.far, gapT);
    }
    // padlóárnyék: a legalsó lap alatt állandó, kis távolságban (mint a
    // referencián) — a köteg összeállásakor a lap nem „szakad el" a padlótól
    const floorY = slabs[0].position.y - thickness / 2 - LAYERS.shadow.floorGap;
    shadows[0].plane.position.set(0, floorY, 0);
    shadows[0].plane.scale.set(FLOOR_SHADOW_SIZE, 1, FLOOR_SHADOW_SIZE);
    shadows[0].material.uniforms.strength.value = LAYERS.shadow.floor;
  }

  // ---- Igény szerinti renderelés ------------------------------------------
  let frameId = 0;
  let dirty = true;
  let visible = true;
  let sized = false;
  let disposed = false;
  let firstFrame = false;
  let renderCount = 0;
  // Az első renderelés a shaderfordítás UTÁN, külön feladatban jön
  // (KHR_parallel_shader_compile esetén aszinkron): a beállítás, a fordítás
  // és az első kép így nem egyetlen hosszú főszál-blokk. Addig a statikus
  // referenciakép látszik.
  let compiled = false;

  function render() {
    frameId = 0;
    if (disposed || !dirty || !sized || !compiled) return;
    // Képernyőn kívül nem rajzolunk — kivéve az első képkockát, hogy a
    // jelenet már kész legyen, mire a képlap a viewportba ér.
    if (!visible && firstFrame) return;
    dirty = false;
    apply();
    renderer.render(scene, camera);
    renderCount += 1;
    if (!firstFrame) {
      firstFrame = true;
      options.onFirstFrame?.();
    }
  }
  const schedule = () => {
    if (!frameId && !disposed) frameId = window.requestAnimationFrame(render);
  };

  const visibility = new IntersectionObserver(
    (entries) => {
      visible = entries.some((entry) => entry.isIntersecting);
      if (visible && dirty) schedule();
    },
    { rootMargin: "120px 0px" },
  );
  visibility.observe(host);

  function onContextLost(event: Event) {
    event.preventDefault();
    if (!disposed) options.onContextLost?.();
  }
  canvas.addEventListener("webglcontextlost", onContextLost);

  const textures: Texture[] = [backdrop, brushed, mask];

  const onCompiled = () => {
    if (disposed) return;
    compiled = true;
    if (dirty) schedule();
  };
  if (renderer.extensions.has("KHR_parallel_shader_compile")) {
    renderer.compileAsync(scene, camera).catch(() => undefined).then(onCompiled);
  } else {
    // Párhuzamos fordítás nélkül (pl. Safari) külön feladatban, szinkron:
    // így legalább nem ugyanabban a hosszú feladatban fut, mint a beállítás.
    window.setTimeout(() => {
      if (disposed) return;
      renderer.compile(scene, camera);
      onCompiled();
    }, 0);
  }

  return {
    get renderCount() {
      return renderCount;
    },
    get slabCount() {
      return slabs.length;
    },
    setProgress(value: number) {
      const next = MathUtils.clamp(value, 0, 1);
      if (Math.abs(next - progress) < 1e-5 && firstFrame) return;
      progress = next;
      dirty = true;
      schedule();
    },
    resize(width: number, height: number, nextLayout: LayersLayout) {
      if (width < 2 || height < 2) return;
      layout = nextLayout;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, LAYERS.render.maxPixelRatio[layout]));
      renderer.transmissionResolutionScale = LAYERS.render.transmissionScale[layout];
      renderer.setSize(width, height, false);
      frame(width, height);
      sized = true;
      dirty = true;
      if (frameId) {
        window.cancelAnimationFrame(frameId);
        frameId = 0;
      }
      render();
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      if (frameId) window.cancelAnimationFrame(frameId);
      visibility.disconnect();
      canvas.removeEventListener("webglcontextlost", onContextLost);
      geometry.dispose();
      planeGeometry.dispose();
      new Set(materials.flat()).forEach((material) => material.dispose());
      shadows.forEach(({ material }) => material.dispose());
      textures.forEach((texture) => texture.dispose());
      environment.dispose();
      const lost = renderer.getContext().isContextLost();
      renderer.dispose();
      // elveszett kontextuson a kényszerített elvesztés már nem értelmezett
      if (!lost) renderer.forceContextLoss();
      canvas.remove();
    },
  };
}
