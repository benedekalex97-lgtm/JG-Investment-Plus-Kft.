"use client";

import { useEffect, useRef } from "react";

/* ==========================================================================
   HERO MARKET MOTION — rendezett, összefüggő japángyertya-háttér
   --------------------------------------------------------------------------
   Mi EZ:
     – dekoratív, absztrakt piaci hangulatkép: több mélységi rétegben, EGY
       közös „master market path" mentén rendezett japángyertya-sor, ami
       lassan, egységes irányban sodródik;
     – saját, függőség nélküli 2D Canvas rajzolás (nincs charting library,
       nincs animációs library, nincs WebGL, nincs Rive).

   Mi NEM ez:
     – nem valós árfolyam, nem valós instrumentum, nem historikus adat;
     – nem kereskedési jelzés, nem hozam-, teljesítmény- vagy pozícióábra;
     – nincs piros–zöld tőzsdei színpár: a gyertyák színét KIZÁRÓLAG a
       mélységi rétegük adja, az irányuk (hosszabb felső vagy alsó kanóc) csak
       formai változatosság. A ritka Signal Berry kiemelés is szándékosan
       mindkét irányú gyertyán megjelenik, hogy ne lehessen
       "nyereséges"/"vesztes" jelentést tulajdonítani neki. A Signal Berry
       lila–vörös, NEM tőzsdei vörös.

   MOZGÁSI MODELL (v1.2 — a korábbi, független „összevissza" sodródás helyett)
   --------------------------------------------------------------------------
   A korábbi verzióban minden gyertya SAJÁT, független fázisú szinuszon
   lebegett, és nagy (a Hero magasságának ~30%-át kitevő) véletlen függőleges
   szórást kapott. Ettől a mező kaotikusnak, pattogónak hatott. A v1.2 ezt
   három eszközzel szünteti meg:

     1) MASTER MARKET PATH — egyetlen, közös, folytonos görbe (egész
        frekvenciájú térbeli szinuszok összege, nagyon lassú időbeli
        fázissodrással). MINDEN réteg MINDEN gyertyája ennek a görbének a
        magasságát veszi fel; a rétegek csak az amplitúdóban és egy kis
        fáziseltolásban különböznek. Így a mező egyetlen, összefüggő piaci
        sziluettként olvasódik.

     2) RENDEZETT POZÍCIÓS SOR — a gyertyák egyenletes vízszintes rácson
        ülnek (elhanyagolható, ±6%-os jitterrel), és mind UGYANABBA az irányba
        sodródnak. A rétegek sebessége 8–14 px/s között van: érzékelhető
        parallax, de nem versengő, szétszaladó mozgás.

     3) SZOMSZÉDKORRELÁCIÓ — a gyertyánkénti animációs fázisok nem
        véletlenek, hanem az INDEXBŐL származnak, kis lépésközzel
        (~0.4–0.6 rad). Ettől a szomszédos gyertyák szinte fázisban vannak: a
        mozgás végigfutó hullámként halad a soron, nem egyenkénti pattogásként.

   Minden animált érték zárt alakú, C∞-sima függvénye az időnek és a gyertya
   indexének. NINCS frame-enkénti random, nincs hard step, nincs jitter.
   ========================================================================== */

/* -------------------------------------------------------------------------
   Színek — a globals.css brand-tokenjeivel azonos értékek, RGB-triplettként,
   mert a Canvas 2D API-nak numerikus csatornák kellenek. Ha a brand-szín
   változik, a globals.css @theme blokkja marad a forrás, és ezt a táblát kell
   vele szinkronban tartani.
   ------------------------------------------------------------------------- */
type Rgb = readonly [number, number, number];

/*
  v1.3 — SÖTÉT ALAPRA HANGOLT RAJZOLÁSI SZÍNEK.

  A Hero a v1.2-ig világos (Porcelain) felületen állt, ezért a gyertyák a
  brandszínek SÖTÉT változatait használták. A v1.3-ban a Hero mély, sötét
  felületre került: ott a sötét tónusok beleolvadnának a háttérbe, ezért a
  középső és a fókuszréteg a saját hue-ját megtartva VILÁGOSÍTOTT változatra
  vált. A hue-identitás megmarad (silver → plum → aubergine), csak a
  világosság fordul meg, hogy a gyertyák valóban láthatók legyenek.

  Mért kontrasztok a Deep (#1B161C) alapon, teljes alfánál:
    Cool Silver #BEC1C7 ......... 9.88:1
    Muted Plum light #9C8598 .... 5.28:1
    Aubergine light #C0A8BC ..... 8.12:1
    Signal Berry light #C27FA3 .. 5.82:1
  A tényleges megjelenést ezen felül a rétegalfa és az olvashatósági zóna
  csillapítja — a számok a felső korlátot mutatják.

  A MOZGÁSI MODELL (master market path, rendezett sor, szomszédkorreláció,
  test- és kanócanimáció) VÁLTOZATLAN: ez a kör kizárólag a rajzolási
  kontrasztot hangolta át.
*/
const COOL_SILVER: Rgb = [190, 193, 199]; // #BEC1C7 — háttérréteg
const MUTED_PLUM_LIGHT: Rgb = [156, 133, 152]; // #9C8598 — középső réteg
const AUBERGINE_LIGHT: Rgb = [192, 168, 188]; // #C0A8BC — fókuszréteg
const SIGNAL_BERRY_LIGHT: Rgb = [194, 127, 163]; // #C27FA3 — ritka kiemelés

const TAU = Math.PI * 2;

/* -------------------------------------------------------------------------
   Determinisztikus álvéletlen — a kompozíció minden betöltésnél ugyanaz.
   Csak a jelenet FELÉPÍTÉSEKOR fut; az animáció közben soha.
   ------------------------------------------------------------------------- */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const SCENE_SEED = 0x1a5f3c;

function lerp(min: number, max: number, t: number): number {
  return min + (max - min) * t;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Kétkomponensű, kvázi-periodikus, végtelenül sima hullám, ±1 körüli
 * amplitúdóval. A második komponens frekvenciája irracionális arányú
 * (aranymetszés), ezért a görbe soha nem ismétli önmagát pontosan — a mozgás
 * nem válik felismerhetően ciklikussá, ugyanakkor teljesen folytonos marad.
 * Ez helyettesíti a korábbi tiszta szinuszt ÉS zárja ki a frame-random
 * jittert: minden érték kizárólag az idő sima függvénye.
 */
function smoothWave(x: number): number {
  return 0.72 * Math.sin(x) + 0.28 * Math.sin(1.618034 * x + 1.1);
}

/** A master market path egyetlen térbeli komponense. */
type PathWave = {
  /** Normalizált amplitúdó (a komponensek összege 1). */
  readonly amplitude: number;
  /** Egész térbeli frekvencia a világszélességen → seamless wrap. */
  readonly frequency: number;
  readonly phase: number;
  /** Nagyon lassú időbeli fázissodrás: a görbe „lélegzik". */
  readonly drift: number;
};

/** Egyetlen gyertya. Minden mező a jelenet felépítésekor dől el. */
type Candle = {
  /** Rendezett rácspozíció a réteg világsávjában. */
  readonly worldX: number;
  readonly width: number;
  readonly baseBodyHeight: number;
  readonly baseWickUp: number;
  readonly baseWickDown: number;
  /** Kicsi, simított lokális eltérés a master pathtól. */
  readonly localOffset: number;
  readonly radius: number;

  /* Animációs paraméterek. A FÁZISOK az indexből származnak (kis lépésközzel),
     ezért a szomszédos gyertyák korreláltan mozognak. A RATE-ek a 10–22 s-os
     ciklusidőkből adódnak. */
  readonly swayAmplitude: number;
  readonly swayRate: number;
  readonly swayPhase: number;
  readonly growAmplitude: number;
  readonly growRate: number;
  readonly growPhase: number;
  readonly wickUpAmplitude: number;
  readonly wickUpRate: number;
  readonly wickUpPhase: number;
  readonly wickDownAmplitude: number;
  readonly wickDownRate: number;
  readonly wickDownPhase: number;

  /** Ritka Signal Berry fókuszpont. */
  readonly accent: boolean;
};

type Layer = {
  readonly color: Rgb;
  readonly alpha: number;
  /** Vízszintes sodródás CSS px/másodpercben — minden réteg AZONOS irányba. */
  readonly speed: number;
  /** Mennyire halványuljon a réteg a középső olvasási zónában (0–1). */
  readonly readabilityFloor: number;
  readonly baseline: number;
  /** A master path amplitúdója ebben a rétegben (mélységi skálázás). */
  readonly pathAmplitude: number;
  /** A réteg fáziseltolása a master pathon — hogy ne legyenek pontosan fedésben. */
  readonly pathPhase: number;
  readonly candles: readonly Candle[];
};

type Scene = {
  readonly width: number;
  readonly height: number;
  /** MINDEN réteg ugyanazt a világszélességet és master patht használja. */
  readonly worldWidth: number;
  readonly masterWaves: readonly PathWave[];
  readonly layers: readonly Layer[];
  readonly readability: {
    readonly cx: number;
    readonly cy: number;
    readonly rx: number;
    readonly ry: number;
  };
};

/** Rétegenkénti tervezési paraméterek. */
type LayerSpec = {
  readonly color: Rgb;
  readonly alpha: number;
  /** CSS px/s — a specifikáció szerinti 8–14 px/s sávban. */
  readonly speed: number;
  readonly count: number;
  readonly widthRange: readonly [number, number];
  readonly bodyRange: readonly [number, number];
  readonly wickRange: readonly [number, number];
  /** A réteg alapvonala a Hero magasságának arányában. */
  readonly bandCenter: number;
  /** A master path amplitúdója a Hero magasságának arányában. */
  readonly pathAmplitude: number;
  /** Kicsi lokális eltérés a pathtól, a Hero magasságának arányában. */
  readonly localSpread: number;
  /** Mozgásamplitúdó-szorzó (mélységi csillapítás). */
  readonly motionScale: number;
  readonly readabilityFloor: number;
  readonly accentIndices: readonly number[];
};

const DESKTOP_LAYERS: readonly LayerSpec[] = [
  {
    // Háttérréteg — Cool Silver, visszafogott, a leglassabb.
    color: COOL_SILVER,
    alpha: 0.16,
    speed: 8,
    count: 30,
    widthRange: [6, 11],
    bodyRange: [20, 54],
    wickRange: [8, 30],
    bandCenter: 0.42,
    pathAmplitude: 0.2,
    localSpread: 0.045,
    motionScale: 0.6,
    readabilityFloor: 0.4,
    accentIndices: [],
  },
  {
    // Középső réteg — Muted Plum, jól érzékelhető.
    color: MUTED_PLUM_LIGHT,
    alpha: 0.26,
    speed: 10.5,
    count: 20,
    widthRange: [11, 17],
    bodyRange: [34, 92],
    wickRange: [12, 44],
    bandCenter: 0.52,
    pathAmplitude: 0.17,
    localSpread: 0.038,
    motionScale: 0.85,
    readabilityFloor: 0.22,
    accentIndices: [],
  },
  {
    // Fókuszréteg — Aubergine, határozottabb, nagyobb testek.
    color: AUBERGINE_LIGHT,
    alpha: 0.34,
    speed: 13.5,
    count: 11,
    widthRange: [17, 27],
    bodyRange: [56, 138],
    wickRange: [16, 58],
    bandCenter: 0.61,
    pathAmplitude: 0.14,
    localSpread: 0.03,
    motionScale: 1,
    readabilityFloor: 0.09,
    // Desktopon PONTOSAN 3 Signal Berry gyertya, mind ugyanebben a rétegben.
    // Egy rétegen belül azonos a sodródási sebesség, ezért a köztük lévő
    // távolság ÁLLANDÓ — sosem kerülhetnek közvetlenül egymás mellé.
    accentIndices: [1, 5, 9],
  },
];

const MOBILE_LAYERS: readonly LayerSpec[] = [
  {
    color: COOL_SILVER,
    alpha: 0.18,
    speed: 6,
    count: 16,
    widthRange: [5, 9],
    bodyRange: [16, 42],
    wickRange: [7, 22],
    bandCenter: 0.44,
    pathAmplitude: 0.18,
    localSpread: 0.04,
    motionScale: 0.45,
    readabilityFloor: 0.42,
    accentIndices: [],
  },
  {
    color: MUTED_PLUM_LIGHT,
    alpha: 0.28,
    speed: 7.9,
    count: 11,
    widthRange: [8, 13],
    bodyRange: [26, 66],
    wickRange: [10, 32],
    bandCenter: 0.53,
    pathAmplitude: 0.155,
    localSpread: 0.034,
    motionScale: 0.62,
    readabilityFloor: 0.24,
    accentIndices: [],
  },
  {
    color: AUBERGINE_LIGHT,
    alpha: 0.36,
    speed: 10,
    count: 7,
    widthRange: [13, 20],
    bodyRange: [40, 92],
    wickRange: [12, 40],
    bandCenter: 0.62,
    pathAmplitude: 0.13,
    localSpread: 0.028,
    motionScale: 0.72,
    readabilityFloor: 0.11,
    // Mobilon PONTOSAN 2 Signal Berry gyertya, szintén egyetlen rétegben.
    accentIndices: [1, 4],
  },
];

const MOBILE_BREAKPOINT = 768;

/* Mozgásamplitúdók CSS pixelben (desktop alapérték; mobilon a motionScale
   csillapít). A specifikáció irányértékei:
     – test függőleges mozgása .... 8–20 px
     – testmagasság-változás ...... 3–8 px
     – felső/alsó kanócváltozás ... 5–14 px
     – teljes mozgási ciklusok .... 10–22 s                                   */
const SWAY_RANGE = [8, 20] as const;
const GROW_RANGE = [3, 8] as const;
const WICK_RANGE = [5, 14] as const;

/** A Hero copy-blokkjának helye a canvashoz képest, CSS pixelben. */
type CopyRect = { readonly x: number; readonly y: number; readonly width: number; readonly height: number };

function createScene(width: number, height: number, copyRect: CopyRect | null): Scene {
  const isMobile = width < MOBILE_BREAKPOINT;
  const specs = isMobile ? MOBILE_LAYERS : DESKTOP_LAYERS;

  const heightScale = clamp(height / 760, 0.62, 1.2);
  const widthScale = isMobile ? 0.9 : 1;

  // MINDEN réteg ugyanazt a világszélességet használja: így a master path
  // térbeli frekvenciái minden mélységben egybeesnek, és a mező EGYETLEN
  // összefüggő piaci sziluettként olvasódik.
  const worldWidth = width + Math.max(width * 0.45, 280);

  /* ---- Master market path -------------------------------------------------
     Egész frekvenciájú térbeli szinuszok összege, normalizált amplitúdókkal.
     Az egész frekvencia miatt a görbe a világsáv határán tökéletesen
     folytonos (nincs látható loopkezdés); a nagyon lassú `drift` fázissodrás
     miatt viszont a sziluett folyamatosan, kiszámíthatatlanul alakul át. */
  const pathRandom = mulberry32(SCENE_SEED);
  const rawWaves = [1, 2, 3].map((frequency) => ({
    frequency,
    amplitude: (1 / frequency) * lerp(0.78, 1, pathRandom()),
    phase: pathRandom() * TAU,
    // 0.055 / 0.080 / 0.105 rad/s → 114 / 79 / 60 s periódus: nagyon lassú.
    drift: 0.03 + 0.025 * frequency,
  }));
  const amplitudeSum = rawWaves.reduce((total, w) => total + w.amplitude, 0);
  const masterWaves: PathWave[] = rawWaves.map((w) => ({
    ...w,
    amplitude: w.amplitude / amplitudeSum,
  }));

  /* A kiemelt (Signal Berry) gyertyák rétegeken átívelő számlálója: felváltva
     emelkedő és csökkenő alakot adunk nekik, hogy a szín ne kaphasson piaci
     jelentést. */
  let accentCursor = 0;

  const layers = specs.map((spec, layerIndex) => {
    const random = mulberry32(SCENE_SEED + layerIndex * 9176);
    const step = worldWidth / spec.count;
    const accentSet = new Set(spec.accentIndices);
    const motion = spec.motionScale;

    const candles: Candle[] = Array.from({ length: spec.count }, (_, index) => {
      const accent = accentSet.has(index);

      // RENDEZETT rács: a jitter szándékosan elhanyagolható (±6% a lépésközön
      // belül). Elég ahhoz, hogy ne legyen mechanikus, de a sor rendezettsége
      // és a szomszédokkal való vizuális kapcsolat megmarad.
      const worldX = (index + 0.5) * step + (random() - 0.5) * step * 0.12;

      const candleWidth = lerp(spec.widthRange[0], spec.widthRange[1], random()) * widthScale;
      const baseBodyHeight = lerp(spec.bodyRange[0], spec.bodyRange[1], random()) * heightScale;

      // Sarokrádiusz: kisebb gyertyáknál 2–3 px, nagyobbaknál 4–6 px. A
      // rajzoláskor a MINDENKORI (animált) testmagassághoz is hozzá van vágva,
      // ezért a forma sosem válhat kapszulává.
      const radius = clamp(candleWidth * 0.26, 2, 6);

      /* Az irány itt már csak a kanócok alap-aszimmetriáját adja. A kiemelt
         gyertyáké NEM véletlen, hanem felváltva emelkedő/csökkenő alak. */
      const direction: 1 | -1 = accent
        ? accentCursor++ % 2 === 0
          ? 1
          : -1
        : random() < 0.5
          ? 1
          : -1;
      const wickA = lerp(spec.wickRange[0], spec.wickRange[1], random()) * heightScale;
      const wickB = lerp(spec.wickRange[0], spec.wickRange[1], random()) * heightScale;

      return {
        worldX,
        width: candleWidth,
        baseBodyHeight,
        baseWickUp: direction === 1 ? wickA * 1.45 : wickA * 0.7,
        baseWickDown: direction === 1 ? wickB * 0.7 : wickB * 1.45,
        localOffset: (random() - 0.5) * spec.localSpread * height,
        radius,

        /* FÁZISOK AZ INDEXBŐL — ez adja a szomszédkorrelációt. A kis
           lépésközök (0.42–0.61 rad) miatt a szomszédos gyertyák közel
           fázisban vannak, így a mozgás végigfutó hullámként halad a soron.
           A ±0.12 rad-os véletlen csak annyit lazít rajta, hogy ne legyen
           gépiesen tökéletes. */
        swayAmplitude: lerp(SWAY_RANGE[0], SWAY_RANGE[1], random()) * motion,
        swayRate: TAU / lerp(14, 22, random()),
        swayPhase: index * 0.55 + (random() - 0.5) * 0.24,

        growAmplitude: lerp(GROW_RANGE[0], GROW_RANGE[1], random()) * motion,
        growRate: TAU / lerp(11, 18, random()),
        growPhase: index * 0.42 + 1.7 + (random() - 0.5) * 0.24,

        wickUpAmplitude: lerp(WICK_RANGE[0], WICK_RANGE[1], random()) * motion,
        wickUpRate: TAU / lerp(10, 17, random()),
        wickUpPhase: index * 0.61 + 0.4 + (random() - 0.5) * 0.24,

        wickDownAmplitude: lerp(WICK_RANGE[0], WICK_RANGE[1], random()) * motion,
        wickDownRate: TAU / lerp(12, 20, random()),
        wickDownPhase: index * 0.48 + 3.1 + (random() - 0.5) * 0.24,

        accent,
      } satisfies Candle;
    });

    return {
      color: spec.color,
      alpha: spec.alpha,
      speed: spec.speed,
      readabilityFloor: spec.readabilityFloor,
      baseline: height * spec.bandCenter,
      pathAmplitude: height * spec.pathAmplitude,
      pathPhase: layerIndex * 0.6,
      candles,
    } satisfies Layer;
  });

  /*
    Az olvasási zóna a Hero copy-blokkjának KIMÉRT geometriáját követi (ha az
    valamiért nem mérhető, egy konzervatív arányos becslés lép be).
  */
  const readability = copyRect
    ? {
        cx: copyRect.x + copyRect.width / 2,
        cy: copyRect.y + copyRect.height / 2,
        rx: Math.min(copyRect.width / 2 + width * 0.04, width * 0.46),
        ry: (copyRect.height / 2) * 0.94 + height * 0.015,
      }
    : {
        cx: width * 0.5,
        cy: height * (isMobile ? 0.3 : 0.38),
        rx: width * (isMobile ? 0.62 : 0.46),
        ry: height * (isMobile ? 0.3 : 0.34),
      };

  return { width, height, worldWidth, masterWaves, layers, readability };
}

/**
 * A MASTER MARKET PATH magassága az adott világkoordinátán és időpontban.
 * Minden réteg minden gyertyája ezt olvassa — ez teszi a mezőt összefüggővé.
 */
function marketPathAt(scene: Scene, layer: Layer, worldX: number, time: number): number {
  let sum = 0;
  for (const w of scene.masterWaves) {
    sum +=
      w.amplitude *
      Math.sin((TAU * w.frequency * worldX) / scene.worldWidth + w.phase + layer.pathPhase + w.drift * time);
  }
  return layer.baseline + layer.pathAmplitude * sum;
}

/**
 * Olvashatósági szorzó: a Hero copy mögött lecsökkenti a gyertyák opacityjét,
 * a szélek és a felső/alsó periféria felé haladva pedig visszaengedi a teljes
 * intenzitást.
 */
function readabilityFactor(scene: Scene, x: number, y: number, floor: number): number {
  const nx = (x - scene.readability.cx) / scene.readability.rx;
  const ny = (y - scene.readability.cy) / scene.readability.ry;
  const distance = Math.sqrt(nx * nx + ny * ny);
  if (distance >= 1) return 1;
  const smooth = distance * distance * (3 - 2 * distance); // smoothstep(0, 1, d)
  return floor + (1 - floor) * smooth;
}

/** Lekerekített téglalap útvonal — nem támaszkodunk a ctx.roundRect()
 *  böngészőtámogatására. */
function roundedRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
): void {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function rgba(color: Rgb, alpha: number): string {
  return `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${alpha})`;
}

function drawScene(ctx: CanvasRenderingContext2D, scene: Scene, elapsed: number): void {
  ctx.clearRect(0, 0, scene.width, scene.height);

  for (const layer of scene.layers) {
    // Egységes haladási irány: minden réteg balra sodródik, csak a sebesség
    // (azaz a mélységi parallax) különbözik.
    const shift = (elapsed * layer.speed) % scene.worldWidth;

    for (const candle of layer.candles) {
      let x = candle.worldX - shift;
      if (x < -candle.width * 2) x += scene.worldWidth;
      if (x > scene.width + candle.width * 2) continue;

      /* --- ANIMÁLT GEOMETRIA — minden érték az idő sima függvénye --------- */

      // 1) A gyertya függőleges helye: a közös market path + kis lokális
      //    eltérés + a test saját, lassú fel-le mozgása.
      const sway = candle.swayAmplitude * smoothWave(elapsed * candle.swayRate + candle.swayPhase);
      const centerY =
        marketPathAt(scene, layer, candle.worldX, elapsed) + candle.localOffset + sway;

      // 2) A TEST magassága is finoman változik: a felső és az alsó él
      //    részben külön interpolálódik (a grow fél-fél arányban oszlik meg,
      //    de a két élhez eltérő fázisú komponens is társul), ezért a test
      //    nemcsak mozog, hanem lélegzik is.
      const grow = candle.growAmplitude * smoothWave(elapsed * candle.growRate + candle.growPhase);
      const edgeSkew =
        candle.growAmplitude * 0.35 * smoothWave(elapsed * candle.growRate * 0.73 + candle.growPhase + 2.2);
      const bodyHeight = Math.max(6, candle.baseBodyHeight + grow);
      const bodyTop = centerY - bodyHeight / 2 + edgeSkew * 0.5;
      const bodyBottom = bodyTop + bodyHeight;

      // 3) A felső és az alsó KANÓC végpontja külön, egymástól részben
      //    függetlenül nyúlik és húzódik vissza — de mindig a test aktuális
      //    éléhez kapcsolódva, ezért a geometria végig folytonos marad.
      const wickUpLength = Math.max(
        3,
        candle.baseWickUp + candle.wickUpAmplitude * smoothWave(elapsed * candle.wickUpRate + candle.wickUpPhase),
      );
      const wickDownLength = Math.max(
        3,
        candle.baseWickDown +
          candle.wickDownAmplitude * smoothWave(elapsed * candle.wickDownRate + candle.wickDownPhase),
      );

      /* --- SZÍN ÉS OLVASHATÓSÁG ------------------------------------------ */

      const factor = readabilityFactor(scene, x, centerY, layer.readabilityFloor);
      const edgeFade = clamp(
        Math.min(x + candle.width, scene.width - x + candle.width) / 72,
        0,
        1,
      );

      const color = candle.accent ? SIGNAL_BERRY_LIGHT : layer.color;
      // A Signal Berry lényegesen sötétebb a rétegszíneknél, ezért kisebb
      // alfát kap — határozott fókuszpont marad, de nem domináns folt.
      const bodyAlpha = (candle.accent ? 0.62 : layer.alpha) * factor * edgeFade;
      if (bodyAlpha <= 0.004) continue;

      /* --- RAJZOLÁS ------------------------------------------------------ */

      // Kanóc: vékony, egyenes, és mindig kevésbé kontrasztos a testnél.
      const wickWidth = Math.max(1, candle.width * 0.085);
      const wickLeft = x - wickWidth / 2;
      ctx.fillStyle = rgba(color, bodyAlpha * 0.6);
      ctx.fillRect(wickLeft, bodyTop - wickUpLength, wickWidth, wickUpLength);
      ctx.fillRect(wickLeft, bodyBottom, wickWidth, wickDownLength);

      // Test: enyhén lekerekített téglalap. A rádiusz a MINDENKORI magassághoz
      // van vágva (max. a harmada), így a forma animáció közben sem válhat
      // kapszulává.
      ctx.fillStyle = rgba(color, bodyAlpha);
      roundedRectPath(
        ctx,
        x - candle.width / 2,
        bodyTop,
        candle.width,
        bodyHeight,
        Math.min(candle.radius, candle.width / 3, bodyHeight / 3),
      );
      ctx.fill();
    }
  }
}

export default function HeroMarketMotion() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let scene: Scene | null = null;
    let frameId = 0;
    let running = false;
    let inView = true;
    let elapsed = 0;
    let lastTimestamp = 0;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let reducedMotion = motionQuery.matches;

    const render = () => {
      if (scene) drawScene(ctx, scene, elapsed);
    };

    /** A Hero copy-blokkja — a readability-zóna forrása. */
    const readCopyRect = (canvasRect: DOMRect): CopyRect | null => {
      const copy = canvas.closest("section")?.querySelector("[data-hero-copy]");
      if (!copy) return null;
      const r = copy.getBoundingClientRect();
      if (r.width <= 0 || r.height <= 0) return null;
      return {
        x: r.left - canvasRect.left,
        y: r.top - canvasRect.top,
        width: r.width,
        height: r.height,
      };
    };

    let lastCopySignature = "";

    const measure = () => {
      const rect = canvas.getBoundingClientRect();
      const width = Math.round(rect.width);
      const height = Math.round(rect.height);
      if (width <= 0 || height <= 0) return;

      // DPR-cap: desktopon 2, mobilon 1.5.
      const maxDpr = width < MOBILE_BREAKPOINT ? 1.5 : 2;
      const dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
      const bufferWidth = Math.round(width * dpr);
      const bufferHeight = Math.round(height * dpr);

      if (canvas.width !== bufferWidth || canvas.height !== bufferHeight) {
        canvas.width = bufferWidth;
        canvas.height = bufferHeight;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const copyRect = readCopyRect(rect);
      const copySignature = copyRect
        ? `${Math.round(copyRect.x)}:${Math.round(copyRect.y)}:${Math.round(copyRect.width)}:${Math.round(copyRect.height)}`
        : "none";

      if (!scene || scene.width !== width || scene.height !== height || copySignature !== lastCopySignature) {
        lastCopySignature = copySignature;
        scene = createScene(width, height, copyRect);
      }
      render();
    };

    const frame = (timestamp: number) => {
      if (lastTimestamp === 0) lastTimestamp = timestamp;
      // A delta felső korlátja megakadályozza, hogy egy hosszabb szünet után
      // (pl. háttérfülről visszatérve) nagyot ugorjon a kompozíció.
      const delta = Math.min((timestamp - lastTimestamp) / 1000, 0.05);
      lastTimestamp = timestamp;
      elapsed += delta;
      render();
      frameId = window.requestAnimationFrame(frame);
    };

    const start = () => {
      if (running || reducedMotion || !inView || document.hidden || !scene) return;
      running = true;
      lastTimestamp = 0;
      frameId = window.requestAnimationFrame(frame);
    };

    const stop = () => {
      if (!running) return;
      running = false;
      window.cancelAnimationFrame(frameId);
      frameId = 0;
    };

    const handleVisibilityChange = () => {
      if (document.hidden) stop();
      else start();
    };

    const handleMotionPreferenceChange = (event: MediaQueryListEvent) => {
      reducedMotion = event.matches;
      if (reducedMotion) {
        stop();
        // Statikus, rendezett, teljes értékű kompozíció: a t = 0 pillanatkép.
        // Sem a test, sem a kanóc nem mozog tovább.
        elapsed = 0;
        render();
      } else {
        start();
      }
    };

    const resizeObserver = new ResizeObserver(() => {
      measure();
    });
    resizeObserver.observe(canvas);

    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        inView = entries.some((entry) => entry.isIntersecting);
        if (inView) start();
        else stop();
      },
      { rootMargin: "120px" },
    );
    intersectionObserver.observe(canvas);

    document.addEventListener("visibilitychange", handleVisibilityChange);
    motionQuery.addEventListener("change", handleMotionPreferenceChange);

    measure();
    start();

    return () => {
      stop();
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      motionQuery.removeEventListener("change", handleMotionPreferenceChange);
      scene = null;
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 block h-full w-full"
    />
  );
}
