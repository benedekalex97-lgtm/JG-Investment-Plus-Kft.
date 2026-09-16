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

   RENDERELÉSI MODELL (v1.4 — a lapos kitöltés helyett térbeli hasábok)
   --------------------------------------------------------------------------
   A MOZGÁSI modell a fentiek szerint VÁLTOZATLAN. Ami új, az kizárólag az,
   ahogyan egy gyertya kinéz:

     A) HÁROM ÉRZÉKELHETŐ Z-MÉLYSÉG. A rétegek nem csak méretben és
        opacitásban térnek el, hanem a rajzolás GAZDAGSÁGÁBAN is
        (flat / shaded / full), és a bandCenter a horizont felé emeli a
        távoli réteget. A rétegek mégsem külön sávok: minden gyertya kap egy
        rétegen BELÜLI mélységi szórást (zScale / zAlpha / zOffsetY), ami
        egymásba fésüli őket.

     B) TÉRBELI GYERTYATEST. Egy front lap (belső tonális gradienssel),
        egy árnyékos jobb oldallap, az előtérben egy megvilágított tetőlap,
        egy 1 px-es bal éli csúcsfény és egy alsó perem. A mélységvektor
        iránya minden gyertyán azonos, ezért a mező egyetlen koherens
        térnek olvasódik — explicit 3D kamera és WebGL nélkül.

     C) EGYETLEN FÉNYFORRÁS bal felülről / elölről. Ebből következik minden
        laptónus és a kanócok eltérő világossága.

     D) MAGASABB PERCEPTUÁLIS KONTRASZT — világosabb rétegszínek és nagyobb
        alfák, miközben a copy mögötti LOKÁLIS csillapítás szűkebb lett.
        Nem az egész animációt halványítjuk, csak ott, ahol szöveg van.

   Továbbra sincs külső függőség, WebGL, charting vagy animációs library.
   ========================================================================== */

/* -------------------------------------------------------------------------
   Színek — a globals.css brand-tokenjeivel azonos értékek, RGB-triplettként,
   mert a Canvas 2D API-nak numerikus csatornák kellenek. Ha a brand-szín
   változik, a globals.css @theme blokkja marad a forrás, és ezt a táblát kell
   vele szinkronban tartani.
   ------------------------------------------------------------------------- */
type Rgb = readonly [number, number, number];

/*
  v1.4 — SÖTÉT ALAPRA HANGOLT, MÉLYSÉGI RAJZOLÁSI PALETTA.

  A v1.3 már sötét alapra hangolta a színeket, de a gyertyák több helyen
  túl közel maradtak a háttér tónusához, és minden gyertya EGYETLEN lapos
  kitöltést kapott. A v1.4 két dolgot változtat:

    1) világosabb rétegszínek (nagyobb perceptuális kontraszt a Deep alapon);
    2) a lapos kitöltést egy háromlapos (front / oldal / tető) árnyalt
       modell váltja — ld. a `shade()` függvényt és a drawCandle()-t.

  Mért kontrasztok a Deep (#1B161C) alapon, TELJES alfánál:
    Cool Silver      #BEC1C7 ..... 9.88:1   háttérréteg
    Plum light       #B29CB0 ..... 7.02:1   középső réteg
    Aubergine light  #D0BCCE ..... 9.99:1   fókuszréteg
    Signal Berry lt. #C27FA3 ..... 5.82:1   ritka kiemelés
  A tényleges megjelenést ezen felül a rétegalfa, a mélységi z-szórás és az
  olvashatósági zóna csillapítja — a számok a felső korlátot mutatják.

  A MOZGÁSI MODELL VÁLTOZATLAN: a master market path, a rendezett pozíciós
  sor, a szomszédkorrelált fázisok, valamint a test- és kanócanimáció
  pontosan ugyanaz, mint a v1.3-ban. Ez a kör a RENDERELÉST fejleszti.

  A háttérszín — a sötétítés CÉLSZÍNE. A sötét lapokat NEM fekete felé
  keverjük (attól kormosak lennének), hanem a Hero saját alapfelülete felé:
  így a gyertya „beleül" a térbe, nem ráfestett folt.
*/
const SURFACE_DEEP: Rgb = [27, 22, 28]; // #1B161C — a Hero alapfelülete
const COOL_SILVER: Rgb = [190, 193, 199]; // #BEC1C7 — háttérréteg
const PLUM_LIGHT: Rgb = [178, 156, 176]; // #B29CB0 — középső réteg
const AUBERGINE_LIGHT: Rgb = [208, 188, 206]; // #D0BCCE — fókuszréteg
const SIGNAL_BERRY_LIGHT: Rgb = [194, 127, 163]; // #C27FA3 — ritka kiemelés

/*
  FÉNYMODELL — egyetlen, nagyon finom fényforrás bal felülről / elölről.
  Ebből következik minden lapérték: a tetőlap néz leginkább a fény felé
  (legvilágosabb), a front lap felülről lefelé sötétedik, a jobb oldallap
  árnyékban van, a bal él pedig egy hajszálnyi csúcsfényt kap.
  Nincs neon, nincs glow, nincs bloom — az értékek szándékosan kicsik.
*/
const FACE = {
  /** Tetőlap — a fény felé néz. */
  top: 0.34,
  /** A front lap teteje. */
  frontTop: 0.1,
  /** A front lap alja. */
  frontBottom: -0.26,
  /** Jobb oldallap — árnyékban. */
  side: -0.44,
  /** Bal él csúcsfénye (1 px). */
  highlight: 0.52,
  /** Alsó perem — a test „vastagsága". */
  rim: -0.55,
} as const;

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

/**
 * Egy laptónus előállítása a gyertya alapszínéből. Pozitív `amount` a fehér
 * felé világosít (megvilágított lap), negatív a Hero ALAPFELÜLETE felé
 * sötétít (árnyékos lap) — nem a fekete felé, mert attól a gyertyák
 * kormosak lennének a lila-fekete háttéren.
 */
function shade(color: Rgb, amount: number): Rgb {
  const target = amount >= 0 ? WHITE : SURFACE_DEEP;
  const t = Math.abs(amount);
  return [
    Math.round(color[0] + (target[0] - color[0]) * t),
    Math.round(color[1] + (target[1] - color[1]) * t),
    Math.round(color[2] + (target[2] - color[2]) * t),
  ];
}

const WHITE: Rgb = [255, 255, 255];

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

  /* --- v1.4 MÉLYSÉGI SZÓRÁS ------------------------------------------------
     A rétegek önmagukban vízszintes SÁVOKNAK látszanának. Hogy egyetlen
     összefüggő tér legyen belőlük, minden gyertya kap egy kis saját
     z-pozíciót a rétegén BELÜL is: ez egyszerre skálázza a méretét, az
     opacitását, a függőleges helyét és a mozgásamplitúdóját. Ettől a
     rétegek egymásba fésülődnek — egy réteg „közeli" gyertyája nagyobb és
     kontrasztosabb lehet, mint a következő réteg „távoli" gyertyája. */
  /** Mélységi méretszorzó (0.86–1.14). */
  readonly zScale: number;
  /** Mélységi opacitásszorzó (0.82–1.18). */
  readonly zAlpha: number;
  /** Közelebbi gyertya lejjebb is ül — perspektivikus függőleges eltolás. */
  readonly zOffsetY: number;

  /** Ritka Signal Berry fókuszpont. */
  readonly accent: boolean;
};

/**
 * Rajzolási gazdagság mélység szerint. Ez egyszerre esztétikai és
 * teljesítmény-döntés: a távoli réteg sok gyertyából áll, de laponként
 * olcsó; az előtér kevés gyertyából áll, viszont teljes térbeli kezelést kap.
 */
type Richness = "flat" | "shaded" | "full";

type Layer = {
  readonly color: Rgb;
  readonly alpha: number;
  readonly richness: Richness;
  /** Az oldallap mélysége a gyertya szélességének arányában (0 = lapos). */
  readonly sideDepth: number;
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
    /** Elemenként EGY védett szövegdoboz (eyebrow, H1, bevezető, CTA). */
    readonly boxes: readonly {
      readonly cx: number;
      readonly cy: number;
      readonly halfWidth: number;
      readonly halfHeight: number;
    }[];
    /** Az elhalványulás hossza a dobozokon kívül. */
    readonly padX: number;
    readonly padY: number;
  };
};

/** Rétegenkénti tervezési paraméterek. */
type LayerSpec = {
  readonly color: Rgb;
  readonly alpha: number;
  /** Mélységi rajzolási gazdagság — ld. a Richness típust. */
  readonly richness: Richness;
  /** Az oldallap mélysége a gyertya szélességének arányában (0 = lapos). */
  readonly sideDepth: number;
  /** A rétegen BELÜLI mélységi szórás mértéke (0 = nincs). */
  readonly zSpread: number;
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

/*
  RÉTEGTERV — v1.4.

  Három ÉRZÉKELHETŐ mélységi réteg, de szándékosan NEM három elkülönülő sáv:
  a `zSpread` mezővel minden réteg gyertyái a rétegen belül is szóródnak
  mélységben, ezért a három réteg egymásba fésülődik és EGY perspektivikus
  térnek olvasódik.

  A perspektíva eszközei rétegről rétegre, összehangoltan:
    – méret ........ widthRange / bodyRange nő az előtér felé
    – kontraszt .... alpha nő az előtér felé (0.22 -> 0.38 -> 0.52)
    – gazdagság .... flat -> shaded -> full (oldallap, tetőlap, csúcsfény)
    – sebesség ..... 8 -> 10.5 -> 13.5 px/s (parallax)
    – magasság ..... bandCenter 0.40 -> 0.52 -> 0.63 (a távoli följebb ül,
                     a horizont felé — ez a legerősebb mélységjelzés)
    – mozgás ....... motionScale nő az előtér felé
  Minden réteg AZONOS irányba (balra) sodródik.
*/
const DESKTOP_LAYERS: readonly LayerSpec[] = [
  {
    // HÁTTÉRRÉTEG — sok, apró, lapos gyertya a horizont közelében.
    color: COOL_SILVER,
    alpha: 0.22,
    richness: "flat",
    sideDepth: 0,
    zSpread: 0.1,
    speed: 8,
    count: 26,
    widthRange: [6, 11],
    bodyRange: [18, 50],
    wickRange: [8, 28],
    bandCenter: 0.4,
    pathAmplitude: 0.2,
    localSpread: 0.045,
    motionScale: 0.6,
    readabilityFloor: 0.3,
    accentIndices: [],
  },
  {
    // KÖZÉPSŐ RÉTEG — tisztább testek, oldallap, jól érzékelhető kanóc.
    color: PLUM_LIGHT,
    alpha: 0.38,
    richness: "shaded",
    sideDepth: 0.17,
    zSpread: 0.13,
    speed: 10.5,
    count: 18,
    widthRange: [12, 18],
    bodyRange: [34, 92],
    wickRange: [12, 44],
    bandCenter: 0.52,
    pathAmplitude: 0.17,
    localSpread: 0.038,
    motionScale: 0.85,
    readabilityFloor: 0.14,
    accentIndices: [],
  },
  {
    // ELŐTÉRRÉTEG — kevés gyertya, nagy lépték, teljes térbeli kezelés.
    color: AUBERGINE_LIGHT,
    alpha: 0.52,
    richness: "full",
    sideDepth: 0.3,
    zSpread: 0.15,
    speed: 13.5,
    count: 9,
    widthRange: [19, 30],
    bodyRange: [58, 142],
    wickRange: [16, 58],
    bandCenter: 0.63,
    pathAmplitude: 0.14,
    localSpread: 0.03,
    motionScale: 1,
    readabilityFloor: 0.06,
    // Desktopon PONTOSAN 3 Signal Berry gyertya, mind ugyanebben a rétegben.
    // Egy rétegen belül azonos a sodródási sebesség, ezért a köztük lévő
    // távolság ÁLLANDÓ — sosem kerülhetnek közvetlenül egymás mellé.
    accentIndices: [1, 4, 7],
  },
];

/*
  MOBIL — a mélység érezhető marad, de a kompozíció nem zsúfolt, és a
  renderelési költség számottevően alacsonyabb:
    – kevesebb gyertya minden rétegben (29 vs. 53);
    – az előtér „shaded", nem „full" (nincs tetőlap és csúcsfény);
    – kisebb oldallap-mélység;
    – a copy olvashatósága ugyanúgy elsődleges.
  A mobil Hero így NEM a desktop lekicsinyítése: külön komponált mező.
  A gyertyaszám ugyanakkor MÉRÉS alapján nőtt (29 -> 41): 390 px-en a
  korábbi sűrűség mellett egyszerre csak ~17 gyertya látszott, és azok
  nagy része a copy-zónába esett — a mező gyakorlatilag eltűnt.
*/
const MOBILE_LAYERS: readonly LayerSpec[] = [
  {
    color: COOL_SILVER,
    alpha: 0.3,
    richness: "flat",
    sideDepth: 0,
    zSpread: 0.09,
    speed: 6,
    count: 20,
    widthRange: [5, 9],
    bodyRange: [16, 42],
    wickRange: [7, 22],
    bandCenter: 0.38,
    pathAmplitude: 0.22,
    localSpread: 0.04,
    motionScale: 0.45,
    readabilityFloor: 0.34,
    accentIndices: [],
  },
  {
    color: PLUM_LIGHT,
    alpha: 0.48,
    richness: "shaded",
    sideDepth: 0.15,
    zSpread: 0.12,
    speed: 7.9,
    count: 14,
    widthRange: [9, 14],
    bodyRange: [26, 66],
    wickRange: [10, 32],
    bandCenter: 0.52,
    pathAmplitude: 0.185,
    localSpread: 0.034,
    motionScale: 0.62,
    readabilityFloor: 0.18,
    accentIndices: [],
  },
  {
    color: AUBERGINE_LIGHT,
    alpha: 0.66,
    richness: "shaded",
    sideDepth: 0.24,
    zSpread: 0.14,
    speed: 10,
    count: 7,
    widthRange: [14, 22],
    bodyRange: [42, 96],
    wickRange: [12, 40],
    bandCenter: 0.66,
    pathAmplitude: 0.15,
    localSpread: 0.028,
    motionScale: 0.72,
    readabilityFloor: 0.1,
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

/** Egy szöveget hordozó Hero-elem helye a canvashoz képest, CSS pixelben. */
type CopyRect = { readonly x: number; readonly y: number; readonly width: number; readonly height: number };

function createScene(width: number, height: number, copyRects: readonly CopyRect[]): Scene {
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

      /* MÉLYSÉGI SZÓRÁS a rétegen belül: ez fésüli egymásba a három réteget,
         hogy ne három vízszintes sávnak, hanem egyetlen térnek olvasódjanak.
         A nagyobb zScale = közelebbi gyertya: nagyobb, kontrasztosabb,
         lejjebb ül és nagyobb amplitúdóval mozog. */
      const z = (random() - 0.5) * 2; // −1 .. +1
      const zScale = 1 + z * spec.zSpread;
      const zAlpha = 1 + z * spec.zSpread * 1.25;
      const zOffsetY = z * spec.zSpread * height * 0.42;

      const candleWidth =
        lerp(spec.widthRange[0], spec.widthRange[1], random()) * widthScale * zScale;
      const baseBodyHeight =
        lerp(spec.bodyRange[0], spec.bodyRange[1], random()) * heightScale * zScale;

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
      const wickA = lerp(spec.wickRange[0], spec.wickRange[1], random()) * heightScale * zScale;
      const wickB = lerp(spec.wickRange[0], spec.wickRange[1], random()) * heightScale * zScale;

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
        swayAmplitude: lerp(SWAY_RANGE[0], SWAY_RANGE[1], random()) * motion * zScale,
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

        zScale,
        zAlpha,
        zOffsetY,

        accent,
      } satisfies Candle;
    });

    return {
      color: spec.color,
      alpha: spec.alpha,
      richness: spec.richness,
      sideDepth: spec.sideDepth,
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
  /*
    OLVASHATÓSÁGI ZÓNA — v1.4: ELEMENKÉNTI, LEKEREKÍTETT TÉGLALAPOK.

    Két hibát javít a v1.3 egyetlen, ellipszis alakú zónájához képest.

    (a) ROSSZ ALAK. Az ellipszis peremén a csillapítás már majdnem nulla, a
        szöveg viszont épp a peremig ér — a 768 px-es bevezető mögött ezért
        teljes erejű gyertya jelent meg, és a Cool Silver kontrasztja
        3.21:1-re esett (WCAG AA FAIL). A lekerekített téglalap
        távolságmezeje a dobozon BELÜL pontosan 0, tehát a szöveg egyetlen
        pontja sem marad védtelen.

    (b) TÚL NAGY ZÓNA. Egyetlen, a teljes copyt befoglaló doboz a sorok
        KÖZÖTTI üres sávokat és a keskenyebb elemek (bevezető, CTA) melletti
        területet is lehalkította — pedig ott nincs szöveg. Ezért minden
        megjelölt elem SAJÁT dobozt kap, és a csillapítás a dobozok
        MINIMUMA: ahol nincs szöveg, ott a mező teljes erővel látszik.

    Így a csillapítás pontosan a betűk mögött van, és sehol máshol.
  */
  const fallback: CopyRect[] = [
    {
      x: width * (isMobile ? 0.05 : 0.19),
      y: height * (isMobile ? 0.12 : 0.16),
      width: width * (isMobile ? 0.9 : 0.62),
      height: height * (isMobile ? 0.5 : 0.46),
    },
  ];
  const rects = copyRects.length > 0 ? copyRects : fallback;

  const readability = {
    boxes: rects.map((r) => ({
      cx: r.x + r.width / 2,
      cy: r.y + r.height / 2,
      // Hajszálnyi biztonsági ráhagyás (leading, ékezetek, alsó szárak).
      halfWidth: r.width / 2 + 6,
      halfHeight: r.height / 2 + 6,
    })),
    padX: width * 0.07,
    padY: height * 0.055,
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
 * Olvashatósági szorzó — a GYERTYA TELJES BEFOGLALÓ DOBOZA és a védett
 * szövegdobozok közötti pontos távolság alapján.
 *
 * v1.4 JAVÍTÁS: korábban ezt a szorzót a gyertya KÖZÉPPONTJÁRA számoltuk.
 * Egy magas gyertya teste és kanóca ezért átlóghatott a szövegre úgy, hogy a
 * középpontja a zónán kívül volt — ilyenkor teljes erővel rajzolódott ki a
 * betűk mögé. A 768 px-es bevezetőnél ez mérhetően 3.77:1-re rontotta a
 * Cool Silver kontrasztját (WCAG AA FAIL).
 *
 * Most a gyertya teljes függőleges kiterjedését (felső kanóc hegyétől az
 * alsó kanóc hegyéig) és szélességét vesszük, és doboz–doboz szeparációt
 * számolunk: ha a gyertya bármely pontja ÉRINTI a szöveget, a távolság 0,
 * tehát teljes a csillapítás. A dobozokon kívül padX / padY hosszon oldódik
 * fel, azon túl a mező teljes erővel látszik.
 */
function readabilityFactor(
  scene: Scene,
  cx: number,
  cy: number,
  halfWidth: number,
  halfHeight: number,
  floor: number,
): number {
  const { boxes, padX, padY } = scene.readability;

  // A LEGKÖZELEBBI szövegdoboz dönt: elég egyetlen elem közelsége ahhoz,
  // hogy a gyertya lehalkuljon, de két elem KÖZÖTT nincs csillapítás.
  let distance = 1;
  for (const box of boxes) {
    const dx = Math.max(0, Math.abs(cx - box.cx) - box.halfWidth - halfWidth) / padX;
    const dy = Math.max(0, Math.abs(cy - box.cy) - box.halfHeight - halfHeight) / padY;
    const d = Math.sqrt(dx * dx + dy * dy);
    if (d < distance) distance = d;
    if (distance <= 0) return floor;
  }

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

/** Kitöltött sokszög — az oldal- és tetőlaphoz. */
function facePath(ctx: CanvasRenderingContext2D, points: readonly (readonly [number, number])[]): void {
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i++) ctx.lineTo(points[i][0], points[i][1]);
  ctx.closePath();
}

/* -------------------------------------------------------------------------
   EGYETLEN GYERTYA KIRAJZOLÁSA — v1.4 térbeli modell
   --------------------------------------------------------------------------
   A gyertyatest már nem lapos téglalap, hanem egy nagyon visszafogott,
   háromlapos hasáb:

        ┌────────────┐ ← tetőlap (a fény felé néz, a legvilágosabb)
        │            │╲
        │  front lap │ ╲ ← jobb oldallap (árnyékban, a legsötétebb)
        │  (gradiens)│  │
        └────────────┘  ╱
        ↑ bal él csúcsfénye (1 px)

   A mélységvektor IRÁNYA minden gyertyán azonos (jobbra-felfelé), ezért a
   mező egyetlen, koherens térnek olvasódik, és nem kell explicit 3D kamera.
   A fény bal felülről / elölről érkezik — ebből adódik a lapok sorrendje.

   Rétegenként eltérő a gazdagság (`richness`), tehát a távoli, sok elemből
   álló réteg laponként olcsó marad:
     flat   — kanóc + egyetlen kitöltés                  (2 rajzolási hívás)
     shaded — + oldallap + kétsávos front + alsó perem    (5 hívás)
     full   — + tetőlap + gradiens front + bal csúcsfény  (7 hívás)
   ------------------------------------------------------------------------- */
function drawCandle(
  ctx: CanvasRenderingContext2D,
  layer: Layer,
  candle: Candle,
  x: number,
  bodyTop: number,
  bodyHeight: number,
  wickUpLength: number,
  wickDownLength: number,
  alpha: number,
): void {
  const color = candle.accent ? SIGNAL_BERRY_LIGHT : layer.color;
  const w = candle.width;
  const left = x - w / 2;
  const right = x + w / 2;
  const bodyBottom = bodyTop + bodyHeight;
  const radius = Math.min(candle.radius, w / 3, bodyHeight / 3);

  /* --- KANÓC ---------------------------------------------------------------
     Mindig a test MÖGÖTT, és a felső kanóc egy hajszállal világosabb, mint az
     alsó: ugyanaz a fényirány, ami a lapokat is meghatározza. */
  const wickWidth = Math.max(1, w * 0.085);
  const wickLeft = x - wickWidth / 2;
  ctx.fillStyle = rgba(shade(color, 0.06), alpha * 0.66);
  ctx.fillRect(wickLeft, bodyTop - wickUpLength, wickWidth, wickUpLength);
  ctx.fillStyle = rgba(shade(color, -0.18), alpha * 0.54);
  ctx.fillRect(wickLeft, bodyBottom, wickWidth, wickDownLength);

  /* --- LAPOS RÉTEG: itt véget is ér ---------------------------------------- */
  if (layer.richness === "flat") {
    ctx.fillStyle = rgba(color, alpha);
    roundedRectPath(ctx, left, bodyTop, w, bodyHeight, radius);
    ctx.fill();
    return;
  }

  /* --- MÉLYSÉGVEKTOR -------------------------------------------------------
     Jobbra és felfelé: a test „hátrafelé" mélyül, a néző pedig egy
     hajszálnyival a mező alatt/balra áll. Az irány minden gyertyán azonos. */
  const dx = w * layer.sideDepth;
  const dy = -dx * 0.55;

  // Jobb oldallap — árnyékban.
  ctx.fillStyle = rgba(shade(color, FACE.side), alpha * 0.92);
  facePath(ctx, [
    [right - radius * 0.5, bodyTop + radius * 0.5],
    [right - radius * 0.5 + dx, bodyTop + radius * 0.5 + dy],
    [right - radius * 0.5 + dx, bodyBottom - radius * 0.5 + dy],
    [right - radius * 0.5, bodyBottom - radius * 0.5],
  ]);
  ctx.fill();

  // Tetőlap — csak az előtérben, ahol a lépték már elbírja.
  if (layer.richness === "full") {
    ctx.fillStyle = rgba(shade(color, FACE.top), alpha * 0.86);
    facePath(ctx, [
      [left + radius * 0.5, bodyTop + radius * 0.4],
      [left + radius * 0.5 + dx, bodyTop + radius * 0.4 + dy],
      [right - radius * 0.5 + dx, bodyTop + radius * 0.4 + dy],
      [right - radius * 0.5, bodyTop + radius * 0.4],
    ]);
    ctx.fill();
  }

  /* --- FRONT LAP -----------------------------------------------------------
     Belső tonális gradiens felülről lefelé. Az előtérben valódi
     CanvasGradient (rétegenként legfeljebb 9 példány képkockánként), a
     középső rétegen két lapos sáv — ez vizuálisan alig különbözik, viszont
     feleannyi objektumallokáció. */
  roundedRectPath(ctx, left, bodyTop, w, bodyHeight, radius);
  if (layer.richness === "full") {
    const gradient = ctx.createLinearGradient(left, bodyTop, left + w * 0.35, bodyBottom);
    gradient.addColorStop(0, rgba(shade(color, FACE.frontTop), alpha));
    gradient.addColorStop(0.55, rgba(color, alpha));
    gradient.addColorStop(1, rgba(shade(color, FACE.frontBottom), alpha));
    ctx.fillStyle = gradient;
  } else {
    ctx.fillStyle = rgba(color, alpha);
  }
  ctx.fill();

  if (layer.richness === "shaded") {
    // Kétsávos árnyalás gradiens nélkül: a test alsó harmada sötétebb.
    ctx.save();
    ctx.clip();
    ctx.fillStyle = rgba(shade(color, FACE.frontBottom), alpha * 0.55);
    ctx.fillRect(left, bodyTop + bodyHeight * 0.62, w, bodyHeight * 0.38);
    ctx.restore();
  }

  // Bal él csúcsfénye — 1 px, csak az előtérben.
  if (layer.richness === "full") {
    ctx.fillStyle = rgba(shade(color, FACE.highlight), alpha * 0.8);
    ctx.fillRect(left + radius * 0.6, bodyTop + radius, 1, Math.max(0, bodyHeight - radius * 2));
  }

  // Alsó perem — a test „vastagsága", ami a hasábot lezárja.
  ctx.fillStyle = rgba(shade(color, FACE.rim), alpha * 0.75);
  ctx.fillRect(left + radius * 0.6, bodyBottom - 1, Math.max(0, w - radius * 1.2), 1);
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

      /* --- ANIMÁLT GEOMETRIA — minden érték az idő sima függvénye ---------
         A v1.3-hoz képest itt CSAK a zOffsetY perspektivikus tag új; a
         master path, a sway, a testlélegzés és a kanócmozgás változatlan. */

      // 1) A gyertya függőleges helye: a közös market path + kis lokális
      //    eltérés + a test saját, lassú fel-le mozgása + a mélységi eltolás.
      const sway = candle.swayAmplitude * smoothWave(elapsed * candle.swayRate + candle.swayPhase);
      const centerY =
        marketPathAt(scene, layer, candle.worldX, elapsed) +
        candle.localOffset +
        candle.zOffsetY +
        sway;

      // 2) A TEST magassága is finoman változik: a felső és az alsó él
      //    részben külön interpolálódik (a grow fél-fél arányban oszlik meg,
      //    de a két élhez eltérő fázisú komponens is társul), ezért a test
      //    nemcsak mozog, hanem lélegzik is.
      const grow = candle.growAmplitude * smoothWave(elapsed * candle.growRate + candle.growPhase);
      const edgeSkew =
        candle.growAmplitude * 0.35 * smoothWave(elapsed * candle.growRate * 0.73 + candle.growPhase + 2.2);
      const bodyHeight = Math.max(6, candle.baseBodyHeight + grow);
      const bodyTop = centerY - bodyHeight / 2 + edgeSkew * 0.5;

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

      /* A gyertya TELJES befoglaló doboza — a felső kanóc hegyétől az alsó
         kanóc hegyéig, plusz az oldallap mélysége. Így ha bármely része a
         szöveg fölé kerül, a csillapítás teljes. */
      const extentTop = bodyTop - wickUpLength;
      const extentBottom = bodyTop + bodyHeight + wickDownLength;
      const halfExtentY = (extentBottom - extentTop) / 2;
      const halfExtentX = candle.width / 2 + candle.width * layer.sideDepth;
      const factor = readabilityFactor(
        scene,
        x,
        (extentTop + extentBottom) / 2,
        halfExtentX,
        halfExtentY,
        layer.readabilityFloor,
      );
      const edgeFade = clamp(
        Math.min(x + candle.width, scene.width - x + candle.width) / 96,
        0,
        1,
      );

      // A mélységi z-szórás az opacitást is modulálja: a rétegen belül
      // közelebbi gyertya kontrasztosabb. A Berry akcentus fix, magasabb
      // alfát kap, hogy határozott fókuszpont maradjon.
      const base = candle.accent ? 0.72 : layer.alpha * candle.zAlpha;
      const bodyAlpha = clamp(base, 0, 0.92) * factor * edgeFade;
      if (bodyAlpha <= 0.004) continue;

      drawCandle(ctx, layer, candle, x, bodyTop, bodyHeight, wickUpLength, wickDownLength, bodyAlpha);
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

    /*
      A Hero olvasási zónája — a readability-csillapítás forrása.

      v1.4 JAVÍTÁS: korábban a [data-hero-copy] KONTÉNER dobozát mértük, ami
      tartalmazza a nagy felső/alsó paddinget és a min-height miatti üres
      teret is. Mobilon ez a doboz 600 px magas volt, miközben a tényleges
      szöveg csak ~440 px — a csillapított ellipszis így gyakorlatilag az
      egész Herót lefedte, és a gyertyák szinte eltűntek. A konténer
      közvetlen gyerekeit mérve pedig a CTA-t körbevevő, teljes szélességű
      flex-doboz torzította a zóna SZÉLESSÉGÉT.

      Most a [data-hero-ink] attribútummal megjelölt elemek egyesített
      befoglaló dobozát mérjük — pontosan azt a területet, ahol valóban
      szöveg van. A copy mögött ugyanolyan nyugodt marad a felület, fölötte,
      alatta és a peremeken viszont a mező teljes erővel látszik.
    */
    const readCopyRects = (canvasRect: DOMRect): CopyRect[] => {
      const copy = canvas.closest("section")?.querySelector("[data-hero-copy]");
      if (!copy) return [];

      /*
        A megjelölt, TÉNYLEGESEN szöveget hordozó elemek (eyebrow, H1,
        bevezető, CTA). Ha valamiért nincs megjelölt elem, a konténer
        közvetlen gyerekeire esünk vissza.
      */
      const inked = copy.querySelectorAll("[data-hero-ink]");
      const nodes = inked.length > 0 ? Array.from(inked) : Array.from(copy.children);

      const rects: CopyRect[] = [];
      for (const node of nodes) {
        const r = node.getBoundingClientRect();
        if (r.width <= 0 || r.height <= 0) continue;
        rects.push({
          x: r.left - canvasRect.left,
          y: r.top - canvasRect.top,
          width: r.width,
          height: r.height,
        });
      }
      return rects;
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

      const copyRects = readCopyRects(rect);
      const copySignature = copyRects
        .map(
          (r) =>
            `${Math.round(r.x)}:${Math.round(r.y)}:${Math.round(r.width)}:${Math.round(r.height)}`,
        )
        .join("|");

      if (!scene || scene.width !== width || scene.height !== height || copySignature !== lastCopySignature) {
        lastCopySignature = copySignature;
        scene = createScene(width, height, copyRects);
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
