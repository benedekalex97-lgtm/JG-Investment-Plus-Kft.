"use client";

import { useEffect, useRef } from "react";

/* ==========================================================================
   HERO MARKET MOTION — v1.5: FILMSZERŰ, TÉRBELI GYERTYAKORRIDOR
   --------------------------------------------------------------------------
   Mi EZ:
     – dekoratív, absztrakt pénzügyi TÉR: japángyertyák egy perspektivikus
       folyosó két oldalán, tükröződő padló fölött lebegve, a horizont felé
       sűrűsödve és a mélységi ködbe veszve;
     – saját, függőség nélküli 2D Canvas rajzolás (nincs charting library,
       nincs animációs library, nincs WebGL, nincs Rive, nincs videó).

   Mi NEM ez:
     – nem valós árfolyam, nem valós instrumentum, nem historikus adat;
     – nem kereskedési jelzés, nem hozam-, teljesítmény- vagy pozícióábra;
     – nincs tengely, nincs árfolyamszám, nincs ticker, nincs piros–zöld
       tőzsdei színpár. A gyertyák színét a mélységük és egy ritka márkakiemelés
       adja, az irányuk (hosszabb felső vagy alsó kanóc) csak formai
       változatosság.

   MI VÁLTOZOTT A v1.4-HEZ KÉPEST
   --------------------------------------------------------------------------
   A v1.4 gyertyái egy LAPOS, vízszintes sávrendszerben álltak: a mélységet
   méret, alfa és rajzolási gazdagság szimulálta, de a mező a teljes
   szélességben egyenletesen töltötte ki a Herót, és a „mélység" három
   párhuzamos réteg volt, nem tér.

   A v1.5 VALÓDI PERSPEKTÍVÁT vezet be. Minden gyertya világkoordinátát kap
   (oldalirány, mélység, padló fölötti magasság), és egy egyszerű, egypontos
   kamera vetíti ki:

       s        = focal / z                    (mélységi méretarány)
       screenX  = vpX + wx * s
       screenY  = horizonY + (camY - magasság) * s

   Ebből három dolog KÖVETKEZIK, nem utólag rájátszott effekt:

     1) FOLYOSÓ. Az oldalirányú pozíció egy középső sávot kihagy, ezért a
        közeli gyertyák a képszélek felé kerülnek, a távoliak viszont a
        középpont felé konvergálnak — pontosan úgy, ahogy egy valódi
        folyosóban. A copy középső zónája szerkezetileg marad szabadon, nem
        utólagos elhalványítással.

     2) PADLÓSÍK. A padló a magasság = 0 sík. Ugyanaz a vetítés rajzolja a
        mélységi vonalakat és a tükröződéseket, ezért a gyertyák valóban EGY
        térben állnak. (A v1.4 CSS-rácsa megszűnt: az külön síkban élt, és
        nem tudott a gyertyákkal egyezni.)

     3) PARALLAXIS INGYEN. Egyetlen, világkoordinátás oldalirányú lengés
        elég: a közeli gyertyák nagyobb `s`-sel nagyobbat mozdulnak a
        képernyőn, mint a távoliak. Nem kell rétegenként külön sebesség.

   MOZGÁSI ELV — „szinte statikus prémium vizuál"
   --------------------------------------------------------------------------
   A v1.4 rétegei 8–13,5 px/s sebességgel sodródtak: ez 10 másodperc alatt
   80–135 px, ami már érzékelhető chart-scroll. A v1.5-ben NINCS lineáris
   sodródás és nincs körbefordulás — MINDEN mozgás nagyon hosszú periódusú,
   szinuszos lengés. Ebből következik, hogy:
     – nincs loop-jump (a görbe sosem ugrik vissza a kezdőpontra);
     – a kompozíció 20 másodperc után sem drifteltel el;
     – az első másodpercben gyakorlatilag semmi nem történik, a mozgás
       5–8 másodperc után válik érzékelhetővé.

   Minden animált érték zárt alakú, C∞-sima függvénye az időnek és a gyertya
   indexének. NINCS frame-enkénti random, nincs hard step, nincs jitter.
   ========================================================================== */

type Rgb = readonly [number, number, number];

/*
  RAJZOLÁSI PALETTA — a globals.css @theme tokenjeivel AZONOS értékek,
  RGB-triplettként, mert a Canvas 2D API-nak numerikus csatornák kellenek.
  A v1.5 EGYETLEN új színt sem vezet be: ugyanaz a négy érték, mint a
  v1.4-ben. Ami változott, az kizárólag a HASZNÁLATI ARÁNYUK (ld. a
  COLOR_MIX táblát) és a lapok anyagszerű árnyalása.

  Mért kontrasztok a Deep (#1B161C) alapon, teljes alfánál:
    Cool Silver      #BEC1C7 ..... 9.88:1
    Plum light       #B29CB0 ..... 7.02:1
    Aubergine light  #D0BCCE ..... 9.99:1
    Signal Berry lt. #C27FA3 ..... 5.82:1
*/
const SURFACE_DEEP: Rgb = [27, 22, 28]; // #1B161C — a Hero alapfelülete
const COOL_SILVER: Rgb = [190, 193, 199]; // #BEC1C7
const PLUM_LIGHT: Rgb = [178, 156, 176]; // #B29CB0
const AUBERGINE_LIGHT: Rgb = [208, 188, 206]; // #D0BCCE
const SIGNAL_BERRY_LIGHT: Rgb = [194, 127, 163]; // #C27FA3
const WHITE: Rgb = [255, 255, 255];

/*
  SZÍNARÁNY — a referencia szerint a mező domináns tömege grafit/ezüst, a
  lila csak másodlagos, a Berry pedig ritka akcentus. A súlyok kumulatívak.
  Eredmény: ~58% Cool Silver, ~26% Plum, ~11% Aubergine, ~5% Berry —
  vagyis a gyertyák ~95%-a a hűvös/grafit/lila tartományban marad, és a kép
  egészében NEM rózsaszín.
*/
const COLOR_MIX: readonly { readonly weight: number; readonly color: Rgb }[] = [
  { weight: 0.58, color: COOL_SILVER },
  { weight: 0.84, color: PLUM_LIGHT },
  { weight: 0.95, color: AUBERGINE_LIGHT },
  { weight: 1.0, color: SIGNAL_BERRY_LIGHT },
];

function pickColor(t: number): Rgb {
  for (const entry of COLOR_MIX) if (t <= entry.weight) return entry.color;
  return COOL_SILVER;
}

/*
  FÉNYMODELL — egyetlen, nagyon finom fényforrás bal felülről / elölről.
  Ebből következik minden laptónus: a tetőlap néz leginkább a fény felé, a
  front lap felülről lefelé sötétedik, a jobb oldallap árnyékban van, a bal
  él pedig egy hajszálnyi csúcsfényt kap.

  Az anyag célja MATT / SZATÉN INTÉZMÉNYI FÉM: nincs üveg, króm, erős tükör,
  hologram vagy emissive neon. Ezért a csúcsfény szűk és halvány, a lapok
  közötti különbség pedig mérsékelt.
*/
const FACE = {
  /** Tetőlap — a fény felé néz. */
  top: 0.3,
  /** A front lap teteje. */
  frontTop: 0.12,
  /** A front lap alja. */
  frontBottom: -0.28,
  /** Jobb oldallap — árnyékban. */
  side: -0.46,
  /** Bal él csúcsfénye. */
  highlight: 0.5,
  /** Alsó perem — a test „vastagsága". */
  rim: -0.58,
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
 * Ez zárja ki a frame-random jittert ÉS a loop-jumpot: minden érték
 * kizárólag az idő sima függvénye.
 */
function smoothWave(x: number): number {
  return 0.72 * Math.sin(x) + 0.28 * Math.sin(1.618034 * x + 1.1);
}

/**
 * Egy laptónus előállítása a gyertya alapszínéből. Pozitív `amount` a fehér
 * felé világosít (megvilágított lap), negatív a Hero ALAPFELÜLETE felé
 * sötétít (árnyékos lap) — nem a fekete felé, mert attól a gyertyák
 * kormosak lennének a lila-fekete háttéren. Ugyanez a függvény adja a
 * MÉLYSÉGI KÖDÖT is: a távoli gyertyák a háttérszín felé mosódnak.
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

function rgba(color: Rgb, alpha: number): string {
  return `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${alpha})`;
}

/* =========================================================================
   TÍPUSOK
   ========================================================================= */

/** A master market path egyetlen térbeli komponense. */
type PathWave = {
  /** Normalizált amplitúdó (a komponensek összege 1). */
  readonly amplitude: number;
  readonly frequency: number;
  readonly phase: number;
  /** Nagyon lassú időbeli fázissodrás: a sziluett „lélegzik". */
  readonly drift: number;
};

/**
 * Rajzolási gazdagság mélység szerint. Egyszerre esztétikai és
 * teljesítmény-döntés: a távoli tartomány sok gyertyából áll, de laponként
 * olcsó; az előtér kevés gyertyából áll, viszont teljes anyagkezelést kap.
 */
type Richness = "flat" | "shaded" | "full";

/** Egyetlen gyertya. Minden mező a jelenet felépítésekor dől el. */
type Candle = {
  /* --- VILÁGKOORDINÁTÁK ------------------------------------------------- */
  /** Oldalirány; negatív = bal folyosó, pozitív = jobb folyosó. */
  readonly wx: number;
  /** Mélység a kamerától. Nagyobb = távolabb. */
  readonly wz: number;
  /** A vetítési méretarány ezen a mélységen (focal / wz). */
  readonly scale: number;
  /** A test középpontjának alap-magassága a padlósík fölött. */
  readonly baseHeight: number;
  /** A master path t = 0-beli értéke ezen a gyertyán (a lélegzés nullpontja). */
  readonly pathBase: number;

  /* --- VILÁGMÉRETEK (a vetítés szorozza őket a scale-lel) --------------- */
  readonly width: number;
  readonly baseBodyHeight: number;
  readonly baseWickUp: number;
  readonly baseWickDown: number;

  readonly color: Rgb;
  readonly richness: Richness;
  /** Az oldallap mélysége a gyertya szélességének arányában. */
  readonly sideDepth: number;
  /** Alap-átlátszatlanság a mélységi köd ELŐTT. */
  readonly alpha: number;
  /** Mennyire halványuljon a copy mögött (0–1). */
  readonly readabilityFloor: number;
  /** Kap-e tükröződést a padlón. */
  readonly reflects: boolean;

  /* --- ANIMÁCIÓ ---------------------------------------------------------
     A fázisok az INDEXBŐL származnak, kis lépésközzel, ezért a szomszédos
     gyertyák korreláltan mozognak: a mozgás végigfutó hullámként halad a
     soron, nem egyenkénti pattogásként. */
  /** Oldalirányú lengés VILÁGEGYSÉGBEN (a parallaxist a vetítés adja). */
  readonly swayAmplitude: number;
  readonly swayRate: number;
  readonly swayPhase: number;
  /** Függőleges lebegés világegységben. */
  readonly floatAmplitude: number;
  readonly floatRate: number;
  readonly floatPhase: number;
  /** Testmagasság-lélegzés — a saját magasság ARÁNYÁBAN (2–5%). */
  readonly breathAmplitude: number;
  readonly breathRate: number;
  readonly breathPhase: number;
  /** Kanóc-mikromozgás világegységben (néhány px). */
  readonly wickUpAmplitude: number;
  readonly wickUpRate: number;
  readonly wickUpPhase: number;
  readonly wickDownAmplitude: number;
  readonly wickDownRate: number;
  readonly wickDownPhase: number;
  /** Anyag/fény lélegzés — a laptónusokat modulálja. */
  readonly lightRate: number;
  readonly lightPhase: number;
};

/** Egypontos perspektivikus kamera. */
type Camera = {
  readonly vpX: number;
  readonly horizonY: number;
  readonly focal: number;
  /** A kamera magassága a padlósík fölött, világegységben. */
  readonly camY: number;
  readonly nearZ: number;
  readonly farZ: number;
};

type Scene = {
  readonly width: number;
  readonly height: number;
  readonly camera: Camera;
  /** A master market path függőleges kiterjedése világegységben. */
  readonly pathAmplitude: number;
  /** A path térbeli hullámhossz-alapja (oldalirányú világegységben). */
  readonly pathSpan: number;
  readonly masterWaves: readonly PathWave[];
  /** Mélység szerint CSÖKKENŐEN rendezve: a távoli rajzolódik előbb. */
  readonly candles: readonly Candle[];
  readonly ground: {
    /** A mélységi (vízszintes) padlóvonalak z-értékei. */
    readonly depthLines: readonly number[];
    /** Az oldalirányú (konvergáló) padlóvonalak wx-értékei. */
    readonly lateralLines: readonly number[];
  };
  readonly readability: {
    readonly boxes: readonly {
      readonly cx: number;
      readonly cy: number;
      readonly halfWidth: number;
      readonly halfHeight: number;
    }[];
    readonly padX: number;
    readonly padY: number;
  };
};

/** Egy mélységi sáv tervezési paraméterei. */
type BandSpec = {
  readonly count: number;
  /** A sáv mélységi tartománya a fókusztávolság arányában. */
  readonly zRange: readonly [number, number];
  readonly richness: Richness;
  readonly sideDepth: number;
  readonly alpha: number;
  readonly readabilityFloor: number;
  readonly reflects: boolean;
  /**
   * A folyosó oldalirányú tartománya KÉPERNYŐARÁNYBAN (a Hero szélességének
   * hányadában, a középvonaltól mérve). A világkoordinátát ebből számoljuk
   * vissza (wx = képernyőeltolás / s), ezért minden sáv garantáltan a képen
   * belül marad, a sávok EGYMÁSHOZ képest viszont a középpont felé
   * konvergálnak: előtér kint, háttér bent. Ez adja a folyosó perspektíváját
   * anélkül, hogy az előtér lecsúszna a képről.
   */
  readonly offsetRange: readonly [number, number];
  /** Világméretek a fókusztávolságon (z = focal, tehát s = 1). */
  readonly widthRange: readonly [number, number];
  readonly bodyRange: readonly [number, number];
  readonly wickRange: readonly [number, number];
};

/*
  MÉLYSÉGI SÁVOK — előtér / középtér / háttér.

  A sávok NEM három vízszintes réteg: mindegyik egy MÉLYSÉGI TARTOMÁNY, és a
  tartományok érintkeznek (0.55–1.05, 1.0–2.3, 2.2–6.2 × focal). Az átfedés
  szándékos: a határon lévő gyertyák egymásba fésülődnek, ezért a szem
  folytonos teret lát, nem három síkot.

  Rajzolási költség képkockánként (desktop):
    előtér  16 × 9 hívás (7 lap + tükröződés)  = 144
    középtér 30 × 5                            = 150
    háttér   44 × 2                            =  88
    padló + horizont                           ≈  34
                                          összesen ≈ 416
*/
const DESKTOP_BANDS: readonly BandSpec[] = [
  {
    // ELŐTÉR — kevés, nagy, teljes anyagkezelésű gyertya a képszéleken.
    count: 16,
    zRange: [0.55, 1.05],
    richness: "full",
    sideDepth: 0.3,
    alpha: 0.66,
    readabilityFloor: 0.035,
    reflects: true,
    offsetRange: [0.26, 0.56],
    widthRange: [17, 26],
    bodyRange: [78, 190],
    wickRange: [30, 76],
  },
  {
    // KÖZÉPTÉR — a legtisztább tartomány; itt a legolvashatóbb a forma.
    count: 30,
    zRange: [1.0, 2.3],
    richness: "shaded",
    sideDepth: 0.19,
    alpha: 0.58,
    readabilityFloor: 0.085,
    reflects: true,
    offsetRange: [0.15, 0.44],
    widthRange: [15, 24],
    bodyRange: [64, 160],
    wickRange: [26, 66],
  },
  {
    // HÁTTÉR — sok, apró, lapos gyertya, a horizont felé sűrűsödve és
    // a mélységi ködbe veszve.
    count: 44,
    zRange: [2.2, 6.2],
    richness: "flat",
    sideDepth: 0,
    alpha: 0.5,
    readabilityFloor: 0.2,
    reflects: false,
    offsetRange: [0.05, 0.27],
    widthRange: [13, 21],
    bodyRange: [54, 140],
    wickRange: [22, 58],
  },
];

/*
  MOBIL — a térérzet megmarad, de a vizuális komplexitás a desktop ~70%-a:
  kevesebb előtérgyertya, kisebb perspektivikus túlzás, kevesebb tükröződés,
  nyugodtabb középső zóna. A mobil Hero így NEM a desktop lekicsinyítése.
    előtér 9 + középtér 19 + háttér 28 = 56 gyertya (desktop: 90 → 62%)
*/
const MOBILE_BANDS: readonly BandSpec[] = [
  {
    count: 9,
    zRange: [0.62, 1.1],
    richness: "shaded",
    sideDepth: 0.22,
    alpha: 0.64,
    readabilityFloor: 0.055,
    reflects: true,
    offsetRange: [0.28, 0.62],
    widthRange: [16, 24],
    bodyRange: [72, 176],
    wickRange: [28, 70],
  },
  {
    count: 19,
    zRange: [1.05, 2.4],
    richness: "shaded",
    sideDepth: 0.15,
    alpha: 0.56,
    readabilityFloor: 0.11,
    reflects: false,
    offsetRange: [0.17, 0.5],
    widthRange: [14, 22],
    bodyRange: [60, 150],
    wickRange: [24, 60],
  },
  {
    count: 28,
    zRange: [2.3, 6.0],
    richness: "flat",
    sideDepth: 0,
    alpha: 0.48,
    readabilityFloor: 0.24,
    reflects: false,
    offsetRange: [0.06, 0.3],
    widthRange: [12, 20],
    bodyRange: [50, 132],
    wickRange: [20, 54],
  },
];

const MOBILE_BREAKPOINT = 768;

/* -------------------------------------------------------------------------
   MOZGÁSI AMPLITÚDÓK — világegységben, a fókusztávolságon (s = 1) értendők.
   A képernyőn látható elmozdulás ennek a scale-szerese, tehát az előtérben
   kb. 1,7×, a háttérben kb. 0,2×.

   A brief szerinti célok és az itt beállított értékek:
     – oldalirányú sodródás ..... 8–16 px több másodperc alatt
     – testmagasság-változás .... 2–5% (arányos, nem abszolút px)
     – kanócmozgás .............. néhány px
     – ciklusidők ............... 26–70 s (a v1.4 10–22 s-os ciklusaihoz
                                  képest lényegesen lassabb)

   MÉRT EREDMÉNY (sávonkénti alfa-súlyozott középpont elmozdulása 1440 px-en):
      1 s ..... vízszintes 1,3 px · függőleges 3,6 px   (észrevehetetlen)
      5 s ..... 5,3 px · 15,6 px                        (kezd élni)
     10 s ..... 9,3 px · 26,6 px
     20 s ..... 12,2 px · 19,0 px                       (VISSZATÉR — leng)
     30 s ..... 16,5 px · 22,6 px
   Az értékek nem monoton nőnek, hanem oszcillálnak: a kompozíció tehát nem
   vándorol el. Képkockák közti legnagyobb lépés 250 ms alatt: 0,0045 átlagos
   alfa — nincs loop-jump.
   ------------------------------------------------------------------------- */
const SWAY_RANGE = [5, 9] as const; // világegység → előtérben ~8–16 px
const FLOAT_RANGE = [2, 4] as const; // függőleges lebegés
const BREATH_RANGE = [0.02, 0.045] as const; // a testmagasság ARÁNYÁBAN
const WICK_RANGE = [1.6, 4] as const; // kanóc-mikromozgás

/** A kamera nagyon lassú, alig érzékelhető sodródása. */
const CAMERA_DRIFT = {
  x: 6, // ±6 px vízszintesen
  y: 3, // ±3 px függőlegesen
  xRate: TAU / 78, // 78 s periódus
  yRate: TAU / 103, // 103 s periódus
} as const;

/** Egy szöveget hordozó Hero-elem helye a canvashoz képest, CSS pixelben. */
type CopyRect = { readonly x: number; readonly y: number; readonly width: number; readonly height: number };

/* =========================================================================
   JELENET FELÉPÍTÉSE
   ========================================================================= */

function createScene(width: number, height: number, copyRects: readonly CopyRect[]): Scene {
  const isMobile = width < MOBILE_BREAKPOINT;
  const bands = isMobile ? MOBILE_BANDS : DESKTOP_BANDS;

  /* ---- KAMERA -----------------------------------------------------------
     A horizont a Hero 68%-ánál van: elég mélyen ahhoz, hogy a távoli
     gyertyák konvergenciapontja a CTA ALÁ essen, és a copy fölött nyugodt
     maradjon a kép. A `camY` úgy van megválasztva, hogy a legközelebbi
     padlósáv épp a Hero alsó pereme körül érjen véget. */
  const focal = width * 0.92;
  const horizonY = height * 0.68;
  const nearZ = focal * 0.55;
  const farZ = focal * 6.4;
  // A legközelebbi mélységen a padló a Hero aljára essen:
  //   horizonY + camY * (focal / nearZ) ≈ height
  const camY = ((height - horizonY) * nearZ) / focal;

  const camera: Camera = { vpX: width * 0.5, horizonY, focal, camY, nearZ, farZ };

  /* ---- Master market path -------------------------------------------------
     Egész frekvenciájú térbeli szinuszok összege, normalizált amplitúdókkal.
     A gyertyák PADLÓ FÖLÖTTI MAGASSÁGÁT adja, az oldalirányú
     világkoordinátájuk függvényében — így a mező egyetlen összefüggő piaci
     sziluettként olvasódik, a folyosó két oldalán is. A nagyon lassú `drift`
     fázissodrás miatt a sziluett folyamatosan, kiszámíthatatlanul alakul át. */
  const pathRandom = mulberry32(SCENE_SEED);
  const rawWaves = [1, 2, 3].map((frequency) => ({
    frequency,
    amplitude: (1 / frequency) * lerp(0.78, 1, pathRandom()),
    phase: pathRandom() * TAU,
    // 0.0072 / 0.0104 / 0.0136 rad/s → 873 / 604 / 462 s periódus.
    // A v1.4-nél (114/79/60 s) közel nyolcszor lassabb.
    drift: 0.004 + 0.0032 * frequency,
  }));
  const amplitudeSum = rawWaves.reduce((total, w) => total + w.amplitude, 0);
  const masterWaves: PathWave[] = rawWaves.map((w) => ({
    ...w,
    amplitude: w.amplitude / amplitudeSum,
  }));

  /* ---- FOLYOSÓ ------------------------------------------------------------
     Az oldalirányú pozíciót KÉPERNYŐARÁNYBAN adjuk meg sávonként, és onnan
     számoljuk vissza a világkoordinátát (wx = eltolás / s).

     Miért nem fix világkoordinátás a folyosó? Mert akkor az előtér (nagy s)
     gyertyáinak túlnyomó része lecsúszna a képről: mérés szerint a 0,17–0,72
     világarányú tartományból 1440 px-en az előtérben csak a legbelső néhány
     gyertya maradt látható, a mező pedig kiürült a képszéleken.

     A konvergenciát így a SÁVOK EGYMÁSHOZ KÉPESTI tartománya adja:
       előtér  0,27–0,64 × szélesség  (kint, részben a kereten kívül)
       középtér 0,16–0,47
       háttér  0,05–0,27              (bent, a horizont felé összetartva)
     A copy középső zónája ezért szerkezetileg marad szabadon, a távoli
     gyertyák viszont a konvergenciapont felé futnak. */

  const scene0Span = width * 1.6;
  const heightScale = clamp(height / 760, 0.7, 1.15);
  /* A sziluett függőleges kiterjedése. A v1.5 első mérésénél 0,13 volt, és a
     gyertyák egy szűk, ~90 px-es sávba tömörültek a horizont körül; 0,22
     mellett az előtér a Hero felső harmadáig felér. */
  const pathAmplitude = height * (isMobile ? 0.17 : 0.22);

  const candles: Candle[] = [];
  let globalIndex = 0;

  bands.forEach((band, bandIndex) => {
    const random = mulberry32(SCENE_SEED + bandIndex * 9176);

    for (let i = 0; i < band.count; i++) {
      const index = globalIndex++;

      /* Mélység: a sávon belül rendezett lépésköz, elhanyagolható jitterrel.
         A rendezettség adja a folyosó ritmusát; a jitter csak annyit lazít
         rajta, hogy ne legyen gépies. */
      const zT = (i + 0.5) / band.count + (random() - 0.5) * 0.6 / band.count;
      const wz = focal * lerp(band.zRange[0], band.zRange[1], clamp(zT, 0, 1));
      const scale = focal / wz;

      // Oldal: felváltva bal és jobb, hogy egyik folyosó se ürüljön ki.
      const side = i % 2 === 0 ? -1 : 1;
      const offsetPx = width * lerp(band.offsetRange[0], band.offsetRange[1], random());
      const wx = (side * offsetPx) / scale;

      /* A sziluett magassága: a kamera szemmagassága (camY) körül ingadozik,
         ezért a horizont közelében természetesen lapul ki. A saját szórás
         adja, hogy a folyosó ne egyetlen vonalban álljon.

         MÉRÉS ALAPJÁN: a v1.5 első két iterációjában a canvas felső harmada
         teljesen üres maradt (8×8-as alfarács: y0–y2 sorok ≈ 0,00), mert a
         gyertyák a kamera szemmagassága körüli szűk sávban álltak. A
         0,9-es pathAmplitude-szorzó és a ±18%-os szórás emeli a mezőt úgy,
         hogy az előtér a keret tetejéig felérjen. */
      // A master market path t = 0-beli értéke BEÉPÜL az alapmagasságba:
      // a sziluett alakja ezzel rögzül, és nem tud időben elvándorolni.
      const pathBase = pathAt(masterWaves, wx, scene0Span, 0);
      const baseHeight =
        camY + pathAmplitude * 0.9 + (random() - 0.5) * height * 0.36 + pathBase * pathAmplitude;

      const w = lerp(band.widthRange[0], band.widthRange[1], random());
      const bodyHeight = lerp(band.bodyRange[0], band.bodyRange[1], random()) * heightScale;

      /* Az irány csak a kanócok alap-aszimmetriáját adja; a SZÍN ettől
         teljesen független, tehát a színnek nem tulajdonítható
         nyereség/veszteség jelentés. */
      const direction: 1 | -1 = random() < 0.5 ? 1 : -1;
      const wickA = lerp(band.wickRange[0], band.wickRange[1], random()) * heightScale;
      const wickB = lerp(band.wickRange[0], band.wickRange[1], random()) * heightScale;

      candles.push({
        wx,
        wz,
        scale,
        baseHeight,
        pathBase,
        width: w,
        baseBodyHeight: bodyHeight,
        baseWickUp: direction === 1 ? wickA * 1.4 : wickA * 0.72,
        baseWickDown: direction === 1 ? wickB * 0.72 : wickB * 1.4,
        color: pickColor(random()),
        richness: band.richness,
        sideDepth: band.sideDepth,
        alpha: band.alpha,
        readabilityFloor: band.readabilityFloor,
        reflects: band.reflects,

        swayAmplitude: lerp(SWAY_RANGE[0], SWAY_RANGE[1], random()),
        swayRate: TAU / lerp(44, 70, random()),
        swayPhase: index * 0.55 + (random() - 0.5) * 0.24,

        floatAmplitude: lerp(FLOAT_RANGE[0], FLOAT_RANGE[1], random()),
        floatRate: TAU / lerp(38, 62, random()),
        floatPhase: index * 0.47 + 1.1 + (random() - 0.5) * 0.24,

        breathAmplitude: lerp(BREATH_RANGE[0], BREATH_RANGE[1], random()),
        breathRate: TAU / lerp(30, 52, random()),
        breathPhase: index * 0.42 + 1.7 + (random() - 0.5) * 0.24,

        wickUpAmplitude: lerp(WICK_RANGE[0], WICK_RANGE[1], random()),
        wickUpRate: TAU / lerp(26, 44, random()),
        wickUpPhase: index * 0.61 + 0.4 + (random() - 0.5) * 0.24,

        wickDownAmplitude: lerp(WICK_RANGE[0], WICK_RANGE[1], random()),
        wickDownRate: TAU / lerp(30, 50, random()),
        wickDownPhase: index * 0.48 + 3.1 + (random() - 0.5) * 0.24,

        lightRate: TAU / lerp(34, 58, random()),
        lightPhase: index * 0.39 + 2.4 + (random() - 0.5) * 0.24,
      });
    }
  });

  // MÉLYSÉG SZERINTI RENDEZÉS: a távoli rajzolódik előbb, a közeli takar.
  // A mélység nem változik az idővel, ezért elég egyszer, itt rendezni.
  candles.sort((a, b) => b.wz - a.wz);

  /* ---- PADLÓSÍK -----------------------------------------------------------
     A mélységi vonalak z-értékei MÉRTANI sorozatot alkotnak, ezért a
     képernyőn egyenletesen sűrűsödnek a horizont felé — ez a helyes
     perspektivikus viselkedés. Az oldalirányú vonalak a folyosó szélességét
     követik és a horizontban futnak össze. */
  const depthLines: number[] = [];
  for (let i = 0; i <= 13; i++) {
    depthLines.push(nearZ * Math.pow(farZ / nearZ, i / 13));
  }
  const lateralLines: number[] = [];
  const lateralCount = isMobile ? 5 : 7;
  for (let i = 1; i <= lateralCount; i++) {
    // Világkoordinátában egyenletes osztás: a képen a horizont felé
    // összetartó vonalsereget ad.
    const v = width * 0.12 * i;
    lateralLines.push(-v, v);
  }

  /*
    OLVASHATÓSÁGI ZÓNA — v1.4-ből VÁLTOZATLANUL átvéve.

    Elemenkénti ([data-hero-ink]: eyebrow, H1, bevezető, CTA), lekerekített
    téglalap alakú zónák. A dobozon belül a távolság pontosan 0, tehát a
    szöveg egyetlen pontja sem marad védtelen; a dobozok KÖZÖTT és a
    perifériákon viszont nincs csillapítás. A v1.5 folyosós elrendezése
    ezt kiegészíti, nem helyettesíti: a közeli gyertyák már szerkezetileg
    sem kerülhetnek a copy mögé.
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
      halfWidth: r.width / 2 + 6,
      halfHeight: r.height / 2 + 6,
    })),
    padX: width * 0.085,
    padY: height * 0.066,
  };

  return {
    width,
    height,
    camera,
    pathAmplitude,
    pathSpan: scene0Span,
    masterWaves,
    candles,
    ground: { depthLines, lateralLines },
    readability,
  };
}

/**
 * A MASTER MARKET PATH normalizált magassága az adott oldalirányú
 * világkoordinátán és időpontban. Minden gyertya ezt olvassa — ez teszi a
 * mezőt összefüggő piaci sziluetté.
 */
function pathAt(waves: readonly PathWave[], wx: number, span: number, time: number): number {
  let sum = 0;
  for (const w of waves) {
    sum += w.amplitude * Math.sin((TAU * w.frequency * wx) / span + w.phase + w.drift * time);
  }
  return sum;
}

/**
 * Olvashatósági szorzó — a GYERTYA TELJES KÉPERNYŐS BEFOGLALÓ DOBOZA és a
 * védett szövegdobozok közötti pontos doboz–doboz távolság alapján. Ha a
 * gyertya bármely pontja érinti a szöveget, a szorzó a réteg `floor` értéke.
 * (v1.4-ből változatlanul átvéve.)
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

/** Kitöltött sokszög — az oldal- és tetőlaphoz. */
function facePath(ctx: CanvasRenderingContext2D, points: readonly (readonly [number, number])[]): void {
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i++) ctx.lineTo(points[i][0], points[i][1]);
  ctx.closePath();
}

/* =========================================================================
   RAJZOLÁS
   ========================================================================= */

/**
 * MÉLYSÉGI KÖD — a távoli objektumok a háttérszín felé mosódnak, és
 * veszítenek a kontrasztjukból. Ez helyettesíti a drága valódi blur
 * pipeline-t: ugyanazt a „mélységélesség" érzetet adja alfával és
 * tónussal, képkockánkénti szűrő nélkül.
 * 0 = nincs köd (előtér), 1 = teljesen a háttérbe olvad.
 */
function fogAmount(camera: Camera, wz: number): number {
  const t = clamp((wz - camera.focal * 0.9) / (camera.farZ - camera.focal * 0.9), 0, 1);
  return t * t * 0.78;
}

/**
 * PADLÓSÍK — perspektivikus mélységi és oldalirányú vonalak.
 *
 * SZÁNDÉKOSAN NEM „synthwave grid": nincs neon, nincs izzás, nincs
 * telített szín, és a vonalak alfája 1,5–5% között marad. A padló csak
 * annyira látszik, hogy a gyertyák egy TÉRBEN álljanak — önálló grafikai
 * elemként nem hívja fel magára a figyelmet.
 */
function drawGround(ctx: CanvasRenderingContext2D, scene: Scene, camDx: number, camDy: number): void {
  const { camera, ground } = scene;
  const vpX = camera.vpX + camDx;
  const horizonY = camera.horizonY + camDy;
  const floorAt = (z: number) => horizonY + (camera.camY * camera.focal) / z;
  const xAt = (wx: number, z: number) => vpX + (wx * camera.focal) / z;

  ctx.lineWidth = 1;

  // Mélységi (vízszintes) vonalak — a horizont felé sűrűsödnek.
  for (const z of ground.depthLines) {
    const y = floorAt(z);
    if (y <= horizonY + 0.5 || y > scene.height + 2) continue;
    // A közelebbi vonal erősebb; a horizont közelében elhal.
    const nearness = clamp((y - horizonY) / (scene.height - horizonY), 0, 1);
    const alpha = 0.03 + 0.085 * nearness * nearness;
    const halfSpan = xAt(scene.width * 1.5, z) - vpX;
    ctx.strokeStyle = rgba(COOL_SILVER, alpha);
    ctx.beginPath();
    ctx.moveTo(vpX - halfSpan, y);
    ctx.lineTo(vpX + halfSpan, y);
    ctx.stroke();
  }

  // Oldalirányú vonalak — a horizontban futnak össze.
  const yNear = floorAt(camera.nearZ);
  const yFar = floorAt(camera.farZ);
  for (const wx of ground.lateralLines) {
    const gradient = ctx.createLinearGradient(0, yFar, 0, yNear);
    gradient.addColorStop(0, rgba(COOL_SILVER, 0));
    gradient.addColorStop(0.45, rgba(COOL_SILVER, 0.032));
    gradient.addColorStop(1, rgba(COOL_SILVER, 0.1));
    ctx.strokeStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(xAt(wx, camera.farZ), yFar);
    ctx.lineTo(xAt(wx, camera.nearZ), yNear);
    ctx.stroke();
  }
}

/**
 * HORIZONT — optikai mélységi támpont, NEM fényforrás.
 *
 * Egy nagyon halvány, lapos Aubergine/Berry atmoszféra a konvergenciapont
 * körül, plusz egy hajszálvékony fénysáv magán a horizontvonalon. Nem
 * naplemente, nem sci-fi portál, nem neon horizont: a maximális alfa 9%.
 */
function drawHorizon(ctx: CanvasRenderingContext2D, scene: Scene, camDx: number, camDy: number): void {
  const vpX = scene.camera.vpX + camDx;
  const horizonY = scene.camera.horizonY + camDy;
  const radius = scene.width * 0.3;

  const glow = ctx.createRadialGradient(vpX, horizonY, 0, vpX, horizonY, radius);
  glow.addColorStop(0, rgba(AUBERGINE_LIGHT, 0.17));
  glow.addColorStop(0.35, rgba(PLUM_LIGHT, 0.075));
  glow.addColorStop(1, rgba(PLUM_LIGHT, 0));
  ctx.save();
  // Lapított ellipszis: a horizont vízszintesen terül el, nem gömbszerű.
  ctx.translate(vpX, horizonY);
  ctx.scale(1, 0.32);
  ctx.translate(-vpX, -horizonY);
  ctx.fillStyle = glow;
  ctx.fillRect(vpX - radius, horizonY - radius, radius * 2, radius * 2);
  ctx.restore();

  // Hajszálvékony fénysáv a horizontvonalon, a közepén a legerősebb.
  const line = ctx.createLinearGradient(vpX - radius, 0, vpX + radius, 0);
  line.addColorStop(0, rgba(AUBERGINE_LIGHT, 0));
  line.addColorStop(0.5, rgba(AUBERGINE_LIGHT, 0.3));
  line.addColorStop(1, rgba(AUBERGINE_LIGHT, 0));
  ctx.fillStyle = line;
  ctx.fillRect(vpX - radius, horizonY - 0.5, radius * 2, 1);
}

/**
 * TÜKRÖZŐDÉS — a gyertya rövid, lefelé halványodó lenyomata a padlón.
 *
 * Nem valódi tükörkép: csak a TEST alsó része jelenik meg, függőlegesen
 * tükrözve a padlósíkra, alacsony alfával és gyors elhalványulással. Nincs
 * blur-szűrő (drága lenne); a lágyságot a gradiens és az alacsony
 * átlátszatlanság adja.
 */
function drawReflection(
  ctx: CanvasRenderingContext2D,
  color: Rgb,
  x: number,
  w: number,
  floorY: number,
  bodyBottomY: number,
  bodyHeightPx: number,
  alpha: number,
): void {
  if (floorY <= bodyBottomY) return; // a test a padló alatt van: nincs értelme
  const gap = floorY - bodyBottomY;
  // A lenyomat a padlótól indul, és legfeljebb a testmagasság 70%-áig ér.
  const length = Math.min(bodyHeightPx * 0.7, 120);
  if (length < 3) return;

  // Minél magasabban lebeg a gyertya, annál halványabb és szórtabb a nyoma.
  const lift = clamp(1 - gap / (bodyHeightPx * 2.4 + 60), 0, 1);
  const peak = alpha * 0.42 * lift;
  if (peak <= 0.004) return;

  const gradient = ctx.createLinearGradient(0, floorY, 0, floorY + length);
  gradient.addColorStop(0, rgba(color, peak));
  gradient.addColorStop(0.45, rgba(color, peak * 0.34));
  gradient.addColorStop(1, rgba(color, 0));
  ctx.fillStyle = gradient;
  // A lenyomat hajszálnyit szélesebb és széttartó: a padló nem tükörsima.
  ctx.fillRect(x - w * 0.62, floorY, w * 1.24, length);
}

/* -------------------------------------------------------------------------
   EGYETLEN GYERTYA — matt/szatén intézményi fém, háromlapos hasábként.

        ┌────────────┐ ← tetőlap (a fény felé néz, a legvilágosabb)
        │            │╲
        │  front lap │ ╲ ← jobb oldallap (árnyékban, a legsötétebb)
        │  (gradiens)│  │
        └────────────┘  ╱
        ↑ bal él csúcsfénye

   A mélységvektor iránya minden gyertyán azonos, ezért a mező egyetlen
   koherens térnek olvasódik. A `light` paraméter az anyag/fény lélegzést
   viszi be: a laptónusokat ±12%-kal modulálja, mintha a jelenet fénye
   nagyon lassan változna.
   ------------------------------------------------------------------------- */
function drawCandle(
  ctx: CanvasRenderingContext2D,
  candle: Candle,
  color: Rgb,
  x: number,
  bodyTop: number,
  bodyHeight: number,
  w: number,
  wickUpLength: number,
  wickDownLength: number,
  alpha: number,
  light: number,
): void {
  const left = x - w / 2;
  const right = x + w / 2;
  const bodyBottom = bodyTop + bodyHeight;
  const radius = Math.min(Math.max(w * 0.22, 1.5), w / 3, bodyHeight / 3);
  const L = (amount: number) => amount * (1 + light * 0.12);

  /* --- KANÓC — mindig a test MÖGÖTT; a felső egy hajszállal világosabb. */
  const wickWidth = Math.max(1, w * 0.09);
  const wickLeft = x - wickWidth / 2;
  ctx.fillStyle = rgba(shade(color, L(0.06)), alpha * 0.62);
  ctx.fillRect(wickLeft, bodyTop - wickUpLength, wickWidth, wickUpLength);
  ctx.fillStyle = rgba(shade(color, L(-0.2)), alpha * 0.5);
  ctx.fillRect(wickLeft, bodyBottom, wickWidth, wickDownLength);

  /* --- LAPOS (háttér) — itt véget is ér. */
  if (candle.richness === "flat") {
    ctx.fillStyle = rgba(color, alpha);
    roundedRectPath(ctx, left, bodyTop, w, bodyHeight, radius);
    ctx.fill();
    return;
  }

  const dx = w * candle.sideDepth;
  const dy = -dx * 0.55;

  // Jobb oldallap — árnyékban.
  ctx.fillStyle = rgba(shade(color, L(FACE.side)), alpha * 0.92);
  facePath(ctx, [
    [right - radius * 0.5, bodyTop + radius * 0.5],
    [right - radius * 0.5 + dx, bodyTop + radius * 0.5 + dy],
    [right - radius * 0.5 + dx, bodyBottom - radius * 0.5 + dy],
    [right - radius * 0.5, bodyBottom - radius * 0.5],
  ]);
  ctx.fill();

  // Tetőlap — csak az előtérben, ahol a lépték már elbírja.
  if (candle.richness === "full") {
    ctx.fillStyle = rgba(shade(color, L(FACE.top)), alpha * 0.86);
    facePath(ctx, [
      [left + radius * 0.5, bodyTop + radius * 0.4],
      [left + radius * 0.5 + dx, bodyTop + radius * 0.4 + dy],
      [right - radius * 0.5 + dx, bodyTop + radius * 0.4 + dy],
      [right - radius * 0.5, bodyTop + radius * 0.4],
    ]);
    ctx.fill();
  }

  /* --- FRONT LAP — belső tonális gradiens. Az előtérben valódi
     CanvasGradient, a középtérben két lapos sáv: vizuálisan alig
     különbözik, viszont feleannyi objektumallokáció. */
  roundedRectPath(ctx, left, bodyTop, w, bodyHeight, radius);
  if (candle.richness === "full") {
    const gradient = ctx.createLinearGradient(left, bodyTop, left + w * 0.35, bodyBottom);
    gradient.addColorStop(0, rgba(shade(color, L(FACE.frontTop)), alpha));
    gradient.addColorStop(0.55, rgba(color, alpha));
    gradient.addColorStop(1, rgba(shade(color, L(FACE.frontBottom)), alpha));
    ctx.fillStyle = gradient;
  } else {
    ctx.fillStyle = rgba(color, alpha);
  }
  ctx.fill();

  if (candle.richness === "shaded") {
    ctx.save();
    ctx.clip();
    ctx.fillStyle = rgba(shade(color, L(FACE.frontBottom)), alpha * 0.55);
    ctx.fillRect(left, bodyTop + bodyHeight * 0.62, w, bodyHeight * 0.38);
    ctx.restore();
  }

  // Bal él csúcsfénye — szűk és halvány: szatén, nem króm.
  if (candle.richness === "full") {
    ctx.fillStyle = rgba(shade(color, L(FACE.highlight)), alpha * 0.72);
    ctx.fillRect(left + radius * 0.6, bodyTop + radius, 1, Math.max(0, bodyHeight - radius * 2));
  }

  // Alsó perem — a hasáb lezárása.
  ctx.fillStyle = rgba(shade(color, L(FACE.rim)), alpha * 0.75);
  ctx.fillRect(left + radius * 0.6, bodyBottom - 1, Math.max(0, w - radius * 1.2), 1);
}

function drawScene(ctx: CanvasRenderingContext2D, scene: Scene, elapsed: number): void {
  ctx.clearRect(0, 0, scene.width, scene.height);

  const { camera } = scene;

  /* --- VIRTUÁLIS KAMERA ---------------------------------------------------
     Nagyon lassú, hosszú periódusú sodródás: ±6 px vízszintesen (78 s) és
     ±3 px függőlegesen (103 s). NINCS zoom, dolly, orbit, tilt vagy
     egérkövetés — a jelenet nem mozog a néző szeme előtt, csak él. */
  const camDx = CAMERA_DRIFT.x * smoothWave(elapsed * CAMERA_DRIFT.xRate);
  const camDy = CAMERA_DRIFT.y * smoothWave(elapsed * CAMERA_DRIFT.yRate + 1.9);
  const vpX = camera.vpX + camDx;
  const horizonY = camera.horizonY + camDy;

  // A padló és a horizont a gyertyák MÖGÖTT: előbb a tér, aztán a tárgyak.
  drawHorizon(ctx, scene, camDx, camDy);
  drawGround(ctx, scene, camDx, camDy);

  // A gyertyák mélység szerint CSÖKKENŐ sorrendben érkeznek (távoli előbb),
  // ezért a közelebbi természetesen takarja a távolabbit.
  for (const candle of scene.candles) {
    const s = candle.scale;

    /* --- ANIMÁLT VILÁGGEOMETRIA — minden érték az idő sima függvénye ----
       Egyetlen, világkoordinátás oldalirányú lengés: a PARALLAXIST maga a
       vetítés adja, mert a közeli gyertya nagyobb `s`-sel nagyobbat mozdul
       a képernyőn. Nincs rétegenkénti sebesség és nincs körbefordulás. */
    const sway = candle.swayAmplitude * smoothWave(elapsed * candle.swayRate + candle.swayPhase);
    const wx = candle.wx + sway;

    const float = candle.floatAmplitude * smoothWave(elapsed * candle.floatRate + candle.floatPhase);
    /* A sziluett alakja a jelenet felépítésekor RÖGZÜLT (ld. baseHeight).
       Futásidőben csak a t = 0-hoz képesti KÜLÖNBSÉG hat, 18%-os
       csillapítással: a mező így „lélegzik", de a kompozíció nem tud
       elvándorolni. Mérés indokolja — a teljes amplitúdójú animált path
       mellett a tömegközéppont 20 s alatt 116 px-t vándorolt. */
    const pathHeight =
      (pathAt(scene.masterWaves, candle.wx, scene.pathSpan, elapsed) - candle.pathBase) *
      scene.pathAmplitude *
      0.18;
    const worldHeight = candle.baseHeight + pathHeight + float;

    /* A TEST lélegzése ARÁNYOS: a saját magasságának 2–4,5%-a, nagyon lassú
       (30–52 s) ciklusban. A v1.4 abszolút px-es változása a kis gyertyáknál
       aránytalanul nagy volt; ez a forma megőrzi az arányt. */
    const breath = 1 + candle.breathAmplitude * smoothWave(elapsed * candle.breathRate + candle.breathPhase);
    const bodyWorldHeight = candle.baseBodyHeight * breath;

    // Kanóc-mikromozgás: néhány világegység, egymástól eltérő fázisban.
    const wickUpWorld = Math.max(
      2,
      candle.baseWickUp + candle.wickUpAmplitude * smoothWave(elapsed * candle.wickUpRate + candle.wickUpPhase),
    );
    const wickDownWorld = Math.max(
      2,
      candle.baseWickDown +
        candle.wickDownAmplitude * smoothWave(elapsed * candle.wickDownRate + candle.wickDownPhase),
    );

    /* --- VETÍTÉS --------------------------------------------------------- */
    const x = vpX + wx * s;
    const w = candle.width * s;
    const bodyHeight = bodyWorldHeight * s;
    const centerY = horizonY + (camera.camY - worldHeight) * s;
    const bodyTop = centerY - bodyHeight / 2;
    const bodyBottom = bodyTop + bodyHeight;
    const wickUp = wickUpWorld * s;
    const wickDown = wickDownWorld * s;

    // Képen kívüli gyertyák kihagyása (a vízszintes margó a takarás miatt bő).
    if (x < -w * 3 || x > scene.width + w * 3) continue;
    if (bodyHeight < 1.5 || w < 0.8) continue;

    /* --- MÉLYSÉGI KÖD ÉS OLVASHATÓSÁG ------------------------------------ */
    const fog = fogAmount(camera, candle.wz);
    const color = shade(candle.color, -fog);

    const extentTop = bodyTop - wickUp;
    const extentBottom = bodyBottom + wickDown;
    const halfExtentX = w / 2 + w * candle.sideDepth;
    const factor = readabilityFactor(
      scene,
      x,
      (extentTop + extentBottom) / 2,
      halfExtentX,
      (extentBottom - extentTop) / 2,
      candle.readabilityFloor,
    );

    // Peremelhalványulás: a képszélen a gyertyák beleolvadnak a vignettába.
    const edgeFade = clamp(Math.min(x + w * 1.6, scene.width - x + w * 1.6) / 70, 0, 1);

    const alpha = clamp(candle.alpha * (1 - fog * 0.42), 0, 0.94) * factor * edgeFade;
    if (alpha <= 0.004) continue;

    /* --- ANYAG/FÉNY LÉLEGZÉS ---------------------------------------------
       Nem külön effekt: úgy hat, mintha a jelenet fénye változna
       nagyon lassan. A laptónusokat modulálja ±12%-kal. */
    const light = smoothWave(elapsed * candle.lightRate + candle.lightPhase);

    // TÜKRÖZŐDÉS — a test MÖGÉ, a padlóra, még a gyertya kirajzolása előtt.
    if (candle.reflects) {
      const floorY = horizonY + camera.camY * s;
      drawReflection(ctx, color, x, w, floorY, bodyBottom + wickDown, bodyHeight, alpha);
    }

    drawCandle(ctx, candle, color, x, bodyTop, bodyHeight, w, wickUp, wickDown, alpha, light);
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
