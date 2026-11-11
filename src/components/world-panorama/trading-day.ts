/**
 * „A kereskedési nap" — a jelenet csendes, dekoratív rétegének időzítése.
 *
 * A 24 s-os kör egy 24 órás kereskedési napot jelképez: a piacok átadják
 * egymásnak a napot (Tokió → London → New York). Minden érték TISZTA
 * FÜGGVÉNY (three.js nélkül, egységtesztelhető):
 *
 *   - ambientAt(p): a kör állapota a kamerával közös p fázisban. Mivel csak
 *     p-től függ, a ciklushatáron varratmentes (p = 0 ≡ p = 1), és pontosan
 *     akkor áll meg, amikor a kamera (panel, felhasználói leállítás, reduced
 *     motion, rejtett lap). p = 0-ban minden effekt nyugalomban van → az első
 *     élő kocka a statikus poszterrel azonos.
 *   - introAt(t): az egyszeri nyitány (oldalbetöltésenként, csak ha a mozgás
 *     engedélyezett), p-től független, t = 0 … INTRO_DURATION másodperc:
 *     egy impulzus New York → London → Tokió irányban (az olvasási irány),
 *     minden városnál egyetlen gyűrűhullámmal.
 *
 * A kimenet egy előre lefoglalt DayFrame — a renderciklus nem foglal memóriát.
 *
 * Ívek (a geometria iránya, u = 0 → 1): 0 = New York → London,
 * 1 = London → Tokió. Városindexek: 0 = New York, 1 = London, 2 = Tokió.
 */

import { CYCLE } from "./camera-path";

export type DayFrame = {
  /** Impulzus ívenként: a fej helye az ív mentén (u), haladási irány (±1), erősség (0–1). */
  pulseHead: [number, number];
  pulseDir: [number, number];
  pulseAlpha: [number, number];
  /** Gyűrűhullám városonként: a jelölőgyűrűhöz mért lépték és átlátszatlanság (0 = nincs). */
  rippleScale: [number, number, number];
  rippleAlpha: [number, number, number];
  /** A jelölőgyűrű finom erősödése városonként (0–1). */
  ring: [number, number, number];
  /** A kulcsfény azimutjának eltolása (radián). */
  lightAzimuth: number;
};

export function createDayFrame(): DayFrame {
  return {
    pulseHead: [0, 0],
    pulseDir: [1, 1],
    pulseAlpha: [0, 0],
    rippleScale: [1, 1, 1],
    rippleAlpha: [0, 0, 0],
    ring: [0, 0, 0],
    lightAzimuth: 0,
  };
}

/* ---------------------------------------------------------------------------
   Paraméterek
   --------------------------------------------------------------------------- */

/** Az impulzus teljes hossza az ív hosszához mérve (elöl rövidebb, hátul hosszabb lecsengés). */
export const PULSE_LENGTH = 0.12;
/** Az impulzus legnagyobb erőssége (az anyag átlátszatlanságát szorozza). */
const PULSE_PEAK = 1;
/** Gyűrűhullám: a jelölőgyűrű sugarának legfeljebb ennyiszereséig tágul. */
const RIPPLE_SCALE = 3.4;
const RIPPLE_PEAK = 0.42;
/** A kulcsfény azimutjának lengése (±6°). */
const LIGHT_SWING = (6 * Math.PI) / 180;

/*
  A kereskedési nap (fázisban, CYCLE = 24 s):
    0,04  Tokió nyit
    0,08 → 0,30  impulzus Tokió → London
    0,33  London nyit
    0,38 → 0,60  impulzus London → New York
    0,63  New York nyit
    utána csendes pihenő a kör zárásáig (a New York-i gyűrű ~0,83-ra elcsendesedik)
*/
/** Nyitási fázis városindex szerint: New York, London, Tokió. */
export const OPENS = [0.63, 0.33, 0.04] as const;
const PULSE_TOKYO_LONDON = [0.08, 0.3] as const;
const PULSE_LONDON_NEWYORK = [0.38, 0.6] as const;
/** A gyűrűhullám hossza a körben (s). */
const RIPPLE_SECONDS = 2.4;
/** A jelölőgyűrű erősödése: felfutás, kitartás, lecsengés (s). */
const RING_ATTACK = 0.8;
const RING_HOLD = 1.2;
const RING_RELEASE = 3;

/*
  Nyitány (másodpercben, p-től független): ütemek New York 0 s, London
  0,75 s, Tokió 1,4 s — az impulzus mindig az érkezéskor indítja a hullámot,
  és a HTML-feliratok is ezekre az ütemekre jelennek meg (WorldPanorama).
*/
export const INTRO_DURATION = 2.4;
export const INTRO_BEATS = [0, 0.75, 1.4] as const;
const INTRO_RIPPLE_SECONDS = 1;
const INTRO_PULSES = [
  [0.05, 0.8],
  [0.7, 1.45],
] as const;

/* ---------------------------------------------------------------------------
   Segédfüggvények
   --------------------------------------------------------------------------- */
const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
export const smoothstep = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const sineInOut = (x: number) => 0.5 - 0.5 * Math.cos(Math.PI * x);
const cubicOut = (x: number) => 1 - (1 - x) * (1 - x) * (1 - x);

/** Impulzus egy ablakban: u = 0 → 1 a haladás; a két végén lágy be- és kiúszás (nincs „pop"). */
function pulse(out: DayFrame, arc: 0 | 1, u: number, reverse: boolean) {
  if (u <= 0 || u >= 1) return;
  const alpha = PULSE_PEAK * smoothstep(0, 0.15, u) * (1 - smoothstep(0.85, 1, u));
  if (alpha <= out.pulseAlpha[arc]) return;
  const head = sineInOut(u);
  out.pulseAlpha[arc] = alpha;
  out.pulseHead[arc] = reverse ? 1 - head : head;
  out.pulseDir[arc] = reverse ? -1 : 1;
}

/** Egyetlen, vékony gyűrűhullám: tágul és elhalványul (u = 0 → 1). */
function ripple(out: DayFrame, city: number, u: number) {
  if (u <= 0 || u >= 1) return;
  const alpha = RIPPLE_PEAK * smoothstep(0, 0.12, u) * (1 - u) * (1 - u);
  if (alpha <= out.rippleAlpha[city]) return;
  out.rippleAlpha[city] = alpha;
  out.rippleScale[city] = 1 + (RIPPLE_SCALE - 1) * cubicOut(u);
}

/** A jelölőgyűrű erősödése a nyitás óta eltelt idő (s) függvényében. */
export function ringEnvelope(seconds: number) {
  if (seconds <= 0 || seconds >= RING_ATTACK + RING_HOLD + RING_RELEASE) return 0;
  if (seconds < RING_ATTACK) return smoothstep(0, RING_ATTACK, seconds);
  return 1 - smoothstep(RING_ATTACK + RING_HOLD, RING_ATTACK + RING_HOLD + RING_RELEASE, seconds);
}

function reset(out: DayFrame) {
  out.pulseAlpha[0] = out.pulseAlpha[1] = 0;
  out.pulseHead[0] = out.pulseHead[1] = 0;
  out.pulseDir[0] = out.pulseDir[1] = 1;
  for (let c = 0; c < 3; c++) {
    out.rippleAlpha[c] = 0;
    out.rippleScale[c] = 1;
    out.ring[c] = 0;
  }
  out.lightAzimuth = 0;
}

/* ---------------------------------------------------------------------------
   A kör (p fázis) és a nyitány (t másodperc)
   --------------------------------------------------------------------------- */

/** A kereskedési nap állapota a p fázisban (p tetszőleges valós; mod 1). */
export function ambientAt(phase: number, out: DayFrame): DayFrame {
  reset(out);
  const p = ((phase % 1) + 1) % 1;
  const tl = PULSE_TOKYO_LONDON;
  const ln = PULSE_LONDON_NEWYORK;
  pulse(out, 1, (p - tl[0]) / (tl[1] - tl[0]), true);
  pulse(out, 0, (p - ln[0]) / (ln[1] - ln[0]), true);
  for (let city = 0; city < 3; city++) {
    const since = (p - OPENS[city]) * CYCLE;
    ripple(out, city, since / RIPPLE_SECONDS);
    out.ring[city] = ringEnvelope(since);
  }
  out.lightAzimuth = LIGHT_SWING * Math.sin(2 * Math.PI * p);
  return out;
}

/** A nyitány állapota t másodpercnél (t ∉ [0, INTRO_DURATION] → nyugalom). */
export function introAt(t: number, out: DayFrame): DayFrame {
  reset(out);
  for (let arc = 0; arc < 2; arc++) {
    const w = INTRO_PULSES[arc];
    pulse(out, arc as 0 | 1, (t - w[0]) / (w[1] - w[0]), false);
  }
  for (let city = 0; city < 3; city++) ripple(out, city, (t - INTRO_BEATS[city]) / INTRO_RIPPLE_SECONDS);
  return out;
}
