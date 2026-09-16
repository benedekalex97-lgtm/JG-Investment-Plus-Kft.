"use client";

import { useEffect, useRef } from "react";

/* ==========================================================================
   HERO MARKET MOTION — absztrakt, atmoszferikus japángyertya-háttér
   --------------------------------------------------------------------------
   Mi EZ:
     – dekoratív, absztrakt piaci hangulatkép: több mélységi rétegben lassan
       sodródó japángyertya-sziluettek a Hero teljes hátterében;
     – saját, függőség nélküli 2D Canvas rajzolás (nincs charting library,
       nincs animációs library, nincs WebGL, nincs Rive).

   Mi NEM ez:
     – nem valós árfolyam, nem valós instrumentum, nem historikus adat;
     – nem kereskedési jelzés, nem hozam-, teljesítmény- vagy pozícióábra;
     – nincs piros–zöld tőzsdei színpár: a gyertyák színét KIZÁRÓLAG a
       mélységi rétegük adja, az irányuk (emelkedő/csökkenő test) csak
       formai változatosság, semmilyen pénzügyi jelentése nincs. A ritka
       Signal Amber kiemelés is szándékosan mindkét irányú gyertyán
       megjelenik, hogy ne lehessen "nyereséges"/"vesztes" jelentést
       tulajdonítani neki.

   Akadálymentesség és teljesítmény:
     – aria-hidden + pointer-events: none → nincs a fókuszsorrendben, nem
       fogja el a CTA-k kattintásait, screen readernek nem létezik;
     – prefers-reduced-motion: reduce → nincs rAF-loop, egyetlen statikus,
       teljes értékű kompozíció rajzolódik ki;
     – IntersectionObserver: képernyőn kívül a loop leáll;
     – visibilitychange: háttérbe került fülön a loop leáll;
     – ResizeObserver + DPR-cap (desktop 2, mobil 1.5);
     – nincs React state update frame-enként — minden rajzolás közvetlenül
       a canvasra megy, a komponens a mount után nem renderel újra.
   ========================================================================== */

/* -------------------------------------------------------------------------
   Színek — a globals.css brand-tokenjeivel azonos értékek, RGB-triplettként,
   mert a Canvas 2D API-nak numerikus csatornák kellenek (a CSS-változók nem
   olvashatók ki közvetlenül rajzolási színként). Ha a brand-szín változik,
   a globals.css @theme blokkja marad a forrás, és ezt a táblát kell vele
   szinkronban tartani.
   ------------------------------------------------------------------------- */
type Rgb = readonly [number, number, number];

const COOL_SILVER: Rgb = [190, 193, 199]; // #BEC1C7 — háttérréteg
const MUTED_PLUM: Rgb = [117, 93, 112]; //  #755D70 — középső réteg
const AUBERGINE: Rgb = [73, 52, 71]; //     #493447 — fókuszréteg
const SIGNAL_AMBER: Rgb = [199, 154, 59]; // #C79A3B — ritka kiemelés

/* -------------------------------------------------------------------------
   Determinisztikus álvéletlen — a kompozíció minden betöltésnél ugyanaz.
   Így nincs "másik oldal" két látogatás között, és nincs esély rá, hogy egy
   szerencsétlen véletlen elrendezés pont a főcím mögé tegyen mindent.
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

/** Egyetlen gyertya — világkoordinátában (a réteg saját, ismétlődő sávjában). */
type Candle = {
  /** Középpont X a réteg világszélességén belül. */
  readonly x: number;
  readonly width: number;
  readonly bodyHeight: number;
  /**
   * Formai változat: +1 = hosszabb felső kanóc ("emelkedő" alak), -1 = hosszabb
   * alsó kanóc ("csökkenő" alak). KIZÁRÓLAG a sziluett változatosságát szolgálja:
   * nincs hozzá rendelve szín, tehát nem jelöl irányt, pozíciót vagy eredményt.
   */
  readonly direction: 1 | -1;
  /** Függőleges eltolás a réteg alapvonalától. */
  readonly offset: number;
  readonly wickUp: number;
  readonly wickDown: number;
  readonly radius: number;
  /** Finom vertikális lebegés — rétegen belül is eltérő fázissal. */
  readonly bobAmplitude: number;
  readonly bobSpeed: number;
  readonly bobPhase: number;
  /** Ritka Signal Amber fókuszpont. */
  readonly accent: boolean;
};

/** Periodikus alapvonal: egész frekvenciájú szinuszok összege a világszélességen.
 *  Így a sziluett a world-wrap határán tökéletesen folytonos — nincs
 *  felismerhető loopkezdés, nincs ugrás. */
type Wave = { readonly amplitude: number; readonly frequency: number; readonly phase: number };

type Layer = {
  readonly color: Rgb;
  readonly alpha: number;
  /** Vízszintes sodródás CSS px/másodpercben. */
  readonly speed: number;
  /** Mennyire halványuljon a réteg a középső olvasási zónában (0–1). */
  readonly readabilityFloor: number;
  readonly worldWidth: number;
  readonly baseline: number;
  readonly waves: readonly Wave[];
  readonly candles: readonly Candle[];
};

type Scene = {
  readonly width: number;
  readonly height: number;
  readonly layers: readonly Layer[];
  /** Az olvasási zóna középpontja és sugarai (a Hero copy mögötti terület). */
  readonly readability: {
    readonly cx: number;
    readonly cy: number;
    readonly rx: number;
    readonly ry: number;
  };
};

/** Rétegenkénti tervezési paraméterek. A mobil ág kevesebb és lassabb
 *  elemet kap, és a rétegek sebességkülönbsége is kisebb (visszafogottabb
 *  parallax a kis képernyőn). */
type LayerSpec = {
  readonly color: Rgb;
  readonly alpha: number;
  readonly speed: number;
  readonly count: number;
  readonly widthRange: readonly [number, number];
  readonly bodyRange: readonly [number, number];
  readonly wickRange: readonly [number, number];
  /** A réteg alapvonalának függőleges középpontja (a Hero magasságának arányában). */
  readonly bandCenter: number;
  /** A hullámzó alapvonal kitérése (a Hero magasságának arányában). */
  readonly bandSpread: number;
  /** Gyertyánkénti extra függőleges szórás (a Hero magasságának arányában). */
  readonly offsetSpread: number;
  readonly bobAmplitude: number;
  readonly readabilityFloor: number;
  readonly accentIndices: readonly number[];
};

const DESKTOP_LAYERS: readonly LayerSpec[] = [
  {
    // Háttérréteg — Cool Silver, nagyon alacsony kontraszt, nagyon lassú.
    color: COOL_SILVER,
    alpha: 0.5,
    speed: 4,
    count: 30,
    widthRange: [6, 11],
    bodyRange: [20, 54],
    wickRange: [8, 30],
    bandCenter: 0.44,
    bandSpread: 0.26,
    offsetSpread: 0.3,
    bobAmplitude: 3,
    readabilityFloor: 0.4,
    accentIndices: [],
  },
  {
    // Középső réteg — Muted Plum, közepes opacity és méret, lassú.
    color: MUTED_PLUM,
    alpha: 0.22,
    speed: 8,
    count: 20,
    widthRange: [11, 17],
    bodyRange: [34, 92],
    wickRange: [12, 44],
    bandCenter: 0.52,
    bandSpread: 0.21,
    offsetSpread: 0.22,
    bobAmplitude: 4.5,
    readabilityFloor: 0.22,
    accentIndices: [12],
  },
  {
    // Fókuszréteg — Aubergine, nagyobb testek, ritkább elhelyezés,
    // kissé gyorsabb, de továbbra is nyugodt sodródás.
    color: AUBERGINE,
    alpha: 0.2,
    speed: 14,
    count: 11,
    widthRange: [17, 27],
    bodyRange: [56, 138],
    wickRange: [16, 58],
    bandCenter: 0.58,
    bandSpread: 0.17,
    offsetSpread: 0.16,
    bobAmplitude: 6,
    readabilityFloor: 0.09,
    accentIndices: [2, 8],
  },
];

const MOBILE_LAYERS: readonly LayerSpec[] = [
  {
    color: COOL_SILVER,
    alpha: 0.55,
    speed: 3.5,
    count: 16,
    widthRange: [5, 9],
    bodyRange: [16, 42],
    wickRange: [7, 22],
    bandCenter: 0.46,
    bandSpread: 0.22,
    offsetSpread: 0.26,
    bobAmplitude: 2.5,
    readabilityFloor: 0.42,
    accentIndices: [],
  },
  {
    color: MUTED_PLUM,
    alpha: 0.24,
    speed: 5,
    count: 11,
    widthRange: [8, 13],
    bodyRange: [26, 66],
    wickRange: [10, 32],
    bandCenter: 0.53,
    bandSpread: 0.19,
    offsetSpread: 0.2,
    bobAmplitude: 3.5,
    readabilityFloor: 0.24,
    accentIndices: [],
  },
  {
    color: AUBERGINE,
    alpha: 0.21,
    speed: 7,
    count: 7,
    widthRange: [13, 20],
    bodyRange: [40, 92],
    wickRange: [12, 40],
    bandCenter: 0.6,
    bandSpread: 0.15,
    offsetSpread: 0.15,
    bobAmplitude: 4.5,
    readabilityFloor: 0.11,
    accentIndices: [1, 5],
  },
];

const MOBILE_BREAKPOINT = 768;

function lerp(min: number, max: number, t: number): number {
  return min + (max - min) * t;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** A Hero copy-blokkjának helye a canvashoz képest, CSS pixelben. */
type CopyRect = { readonly x: number; readonly y: number; readonly width: number; readonly height: number };

function createScene(width: number, height: number, copyRect: CopyRect | null): Scene {
  const isMobile = width < MOBILE_BREAKPOINT;
  const specs = isMobile ? MOBILE_LAYERS : DESKTOP_LAYERS;

  // A gyertyaméretek a Hero magasságával arányosan skálázódnak, hogy egy
  // alacsony (landscape mobil) és egy magas (desktop) Hero is kiegyensúlyozott
  // maradjon — de a skála korlátozott, hogy sose nőjenek aránytalanná.
  const heightScale = clamp(height / 760, 0.62, 1.2);
  const widthScale = isMobile ? 0.9 : 1;

  /* A kiemelt (Signal Amber) gyertyák rétegeken átívelő számlálója — ld. lentebb. */
  let accentCursor = 0;

  // A rétegek egyetlen, közös seedből épülnek, de mindegyik saját
  // generátorágat kap, hogy a rétegek mintázata ne korreláljon.
  const layers = specs.map((spec, layerIndex) => {
    const random = mulberry32(SCENE_SEED + layerIndex * 9176);

    // A világszélesség mindig nagyobb a viewportnál, így egyszerre sosem
    // látszik a teljes ismétlődő minta.
    const worldWidth = width + Math.max(width * 0.45, 280);
    const step = worldWidth / spec.count;

    const waves: Wave[] = [1, 2, 3].map((frequency) => ({
      // A magasabb frekvenciájú komponens kisebb amplitúdót kap — lágy,
      // hullámzó sziluett, nem zajos fogazás.
      amplitude: height * spec.bandSpread * (0.62 / frequency) * lerp(0.7, 1, random()),
      frequency,
      phase: random() * Math.PI * 2,
    }));

    const accentSet = new Set(spec.accentIndices);

    const candles: Candle[] = Array.from({ length: spec.count }, (_, index) => {
      const accent = accentSet.has(index);
      // Egyenletes alaposztás + jitter: se rácsszerű, se kupacos elrendezés.
      const x = (index + 0.5) * step + (random() - 0.5) * step * 0.5;
      const candleWidth = lerp(spec.widthRange[0], spec.widthRange[1], random()) * widthScale;
      const bodyHeight = lerp(spec.bodyRange[0], spec.bodyRange[1], random()) * heightScale;

      // Sarokrádiusz: kisebb gyertyáknál 2–3 px, nagyobbaknál 4–6 px, és
      // sosem több a test harmadánál — így a forma sosem válik kapszulává.
      const radius = clamp(
        clamp(candleWidth * 0.26, 2, 6),
        2,
        Math.max(2, Math.min(candleWidth / 3, bodyHeight / 3)),
      );

      /*
        A Signal Amber gyertyák iránya NEM véletlen, hanem felváltva emelkedő és
        csökkenő alakot kap (accentCursor). Ez tudatos döntés: ha a kiemelt
        gyertyák mind ugyanolyan alakúak lennének, az amber szín véletlenül
        „nyereséges" (vagy „vesztes") jelentést kaphatna. Így a kiemelés
        bizonyíthatóan csak figyelemvezetés, nem piaci üzenet.
      */
      const direction: 1 | -1 = accent ? (accentCursor++ % 2 === 0 ? 1 : -1) : random() < 0.5 ? 1 : -1;

      // Az irány a kanócok hosszának aszimmetriájában jelenik meg — színben soha.
      const wickA = lerp(spec.wickRange[0], spec.wickRange[1], random()) * heightScale;
      const wickB = lerp(spec.wickRange[0], spec.wickRange[1], random()) * heightScale;

      return {
        x,
        width: candleWidth,
        bodyHeight,
        direction,
        offset: (random() - 0.5) * spec.offsetSpread * height,
        wickUp: direction === 1 ? wickA * 1.45 : wickA * 0.7,
        wickDown: direction === 1 ? wickB * 0.7 : wickB * 1.45,
        radius,
        bobAmplitude: spec.bobAmplitude * lerp(0.6, 1, random()),
        // Nagyon lassú lebegés (~18–35 s periódus), egyedi fázissal.
        bobSpeed: lerp(0.18, 0.34, random()),
        bobPhase: random() * Math.PI * 2,
        accent,
      };
    });

    return {
      color: spec.color,
      alpha: spec.alpha,
      speed: spec.speed,
      readabilityFloor: spec.readabilityFloor,
      worldWidth,
      baseline: height * spec.bandCenter,
      waves,
      candles,
    } satisfies Layer;
  });

  /*
    Az olvasási zóna a Hero copy-blokkjának KIMÉRT geometriáját követi (ha az
    valamiért nem mérhető, egy konzervatív arányos becslés lép be). Ez azért
    fontos, mert a Hero teljes magassága viewportonként nagyon eltérő — mobilon
    a státusz/kockázati kártyákkal együtt jóval magasabb, mint a szövegblokk —,
    és egy fix aránnyal a zóna vagy a szöveg alá csúszna, vagy az egész Hero-t
    lefedné, elnyomva a mozgást.
  */
  const readability = copyRect
    ? {
        cx: copyRect.x + copyRect.width / 2,
        cy: copyRect.y + copyRect.height / 2,
        // A vízszintes sugár felső korlátja azért kell, mert mobilon a
        // copy-blokk a teljes tartalmi szélességet elfoglalja: korlát nélkül a
        // zóna a Hero teljes szélességét lefedné, és a bal/jobb peremen sem
        // maradna látható mozgás. A blokk függőleges mérete a középre
        // rendezés miatt bőven a tényleges szöveg fölé/alá nyúlik, ezért a
        // függőleges sugár enyhén szűkíthető.
        rx: Math.min(copyRect.width / 2 + width * 0.04, width * 0.46),
        ry: (copyRect.height / 2) * 0.94 + height * 0.015,
      }
    : {
        cx: width * 0.5,
        cy: height * (isMobile ? 0.3 : 0.38),
        rx: width * (isMobile ? 0.62 : 0.46),
        ry: height * (isMobile ? 0.3 : 0.34),
      };

  return { width, height, layers, readability };
}

/** A réteg alapvonala az adott világkoordinátán (periodikus → seamless loop). */
function baselineAt(layer: Layer, worldX: number): number {
  let y = layer.baseline;
  for (const wave of layer.waves) {
    y += wave.amplitude * Math.sin((2 * Math.PI * wave.frequency * worldX) / layer.worldWidth + wave.phase);
  }
  return y;
}

/**
 * Olvashatósági szorzó: a Hero copy mögött lecsökkenti a gyertyák opacityjét,
 * a szélek és a felső/alsó periféria felé haladva pedig visszaengedi a teljes
 * intenzitást. Így a nagyobb vizuális aktivitás a széleken marad, a főcím
 * betűit pedig nem metszik erős kontrasztú gyertyatestek.
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
    const shift = (elapsed * layer.speed) % layer.worldWidth;

    for (const candle of layer.candles) {
      let x = candle.x - shift;
      if (x < -candle.width * 2) x += layer.worldWidth;
      if (x > scene.width + candle.width * 2) continue;

      const bob = candle.bobAmplitude * Math.sin(elapsed * candle.bobSpeed + candle.bobPhase);
      const centerY = baselineAt(layer, candle.x) + candle.offset + bob;

      const bodyTop = centerY - candle.bodyHeight / 2;
      const bodyLeft = x - candle.width / 2;

      const factor = readabilityFactor(scene, x, centerY, layer.readabilityFloor);
      // A vízszintes széleken lágy kifutás, hogy a gyertyák ne "vágódjanak"
      // be és ki a Hero peremén.
      const edgeFade = clamp(
        Math.min(x + candle.width, scene.width - x + candle.width) / 72,
        0,
        1,
      );

      const color = candle.accent ? SIGNAL_AMBER : layer.color;
      const bodyAlpha = (candle.accent ? 0.5 : layer.alpha) * factor * edgeFade;
      if (bodyAlpha <= 0.004) continue;

      // Kanóc: vékony, egyenes, és mindig kevésbé kontrasztos a testnél.
      const wickWidth = Math.max(1, candle.width * 0.085);
      const wickLeft = x - wickWidth / 2;
      ctx.fillStyle = rgba(color, bodyAlpha * 0.6);
      ctx.fillRect(wickLeft, bodyTop - candle.wickUp, wickWidth, candle.wickUp);
      ctx.fillRect(wickLeft, bodyTop + candle.bodyHeight, wickWidth, candle.wickDown);

      // Test: enyhén lekerekített téglalap (2–6 px, sosem kapszula). A
      // direction itt már csak a rádiusz hajszálnyi eltérését adja — a
      // tényleges alaki különbséget a kanócok aszimmetriája hordozza. Színbeli
      // különbség egyik irányhoz sem tartozik.
      ctx.fillStyle = rgba(color, bodyAlpha);
      roundedRectPath(
        ctx,
        bodyLeft,
        bodyTop,
        candle.width,
        candle.bodyHeight,
        candle.direction === 1 ? candle.radius : candle.radius * 0.82,
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

      // DPR-cap: desktopon 2, mobilon 1.5 — a vizuális különbség
      // elhanyagolható, a rajzolási költség viszont jelentősen kisebb.
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
      // A delta felső korlátja megakadályozza, hogy egy hosszabb szünet
      // után (pl. háttérfülről visszatérve) nagyot ugorjon a kompozíció.
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
        // Statikus, teljes értékű kompozíció: a t = 0 pillanatkép.
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
