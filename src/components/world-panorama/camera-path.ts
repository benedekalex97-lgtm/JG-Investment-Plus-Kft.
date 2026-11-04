/**
 * A 24 s-os, ZÁRT kameraút.
 *
 * Egyetlen normalizált fázis vezérli: p ∈ [0, 1) (= aktívan futott idő /
 * CYCLE, modulo 1). A kamera paraméterei — nézési cél (x, z), azimut,
 * emelkedési szög, távolság és látószög — kulcskockák között PERIODIKUS
 * Hermite-interpolációval mozognak. Az érintők idő-arányos véges
 * differenciák (nem egyenletes Catmull–Rom), a szomszédokat körbefordulva
 * számoljuk, ezért:
 *   - a pálya értékben ÉS sebességben is folytonos (C¹), a ciklushatáron is;
 *   - p = 1-nél pontosan a p = 0 állapot áll elő (pozíció, nézési irány,
 *     látószög és sebesség is);
 *   - nincs yoyo, visszatekerés vagy vágás: a 17–24 s közötti szakasz más
 *     ívén (más azimut / magasság) tér vissza az induló kompozícióhoz.
 *
 * A kamera pozíciója: cél + távolság × (sin az·cos el, sin el, cos az·cos el)
 * — délről, felülről néz a térképre.
 */

export const CYCLE = 24;

/** [célX, célZ, azimut°, emelkedés°, távolság, VÍZSZINTES látószög°] */
type Pose = [number, number, number, number, number, number];
type Key = { t: number; pose: Pose };

/*
  DESKTOP — kreatív időrend (brief 9.):
    0–3 s   teljes kompozíció, alacsonyabb nézőpont, oldalirányú haladás
    3–7 s   enyhe közeledés és emelkedés Európa felé
    7–12 s  nézőpontváltás Ázsia felé (az ívek görbülete jobban látszik)
    12–17 s lassú távolodás, szélesebb összkép
    17–24 s másik, ívelt útszakaszon vissza az induló kompozícióhoz
*/
const DESKTOP: Key[] = [
  { t: 0, pose: [3.1, -1.9, 8, 26, 20.5, 68.5] },
  { t: 3, pose: [3.7, -2.1, -1, 27, 20, 68.5] },
  { t: 7, pose: [2.9, -2.8, -4, 33, 17.8, 66.5] },
  { t: 12, pose: [4.2, -2.5, -9, 30, 18.8, 68.5] },
  { t: 17, pose: [3.5, -1.8, -3, 29, 22.5, 70.5] },
  { t: 21, pose: [2.9, -1.7, 7, 24, 21, 68.5] },
];

/*
  MOBIL — külön komponált nézet, NEM a desktop kivágata. A kamera
  délnyugat felől, átlósan néz a térképre: a kelet–nyugati tengely a
  mélységbe fut, így New York közelebb (lent, balra), London középen, Tokió
  távolabb (fent, jobbra) ül, és a kontinensek a szűk, magas sávot is
  kitöltik. Magasabb nézőpont, kisebb kamerautazás, mindhárom pont végig a
  képen.
*/
const MOBILE: Key[] = [
  { t: 0, pose: [0.4, -3.4, -44, 32, 18, 70] },
  { t: 3, pose: [1.3, -3.7, -56, 34, 17.4, 70] },
  { t: 7, pose: [0.6, -3.9, -54, 37, 16.6, 68] },
  { t: 12, pose: [1.6, -3.8, -60, 35, 17.2, 70] },
  { t: 17, pose: [0.8, -3.4, -52, 33, 18.8, 72] },
  { t: 21, pose: [0.0, -3.2, -42, 30, 18.2, 70] },
];

export type Rig = "desktop" | "mobile";
const KEYS: Record<Rig, Key[]> = { desktop: DESKTOP, mobile: MOBILE };

/** Periodikus, idő-arányos Hermite-interpoláció a kulcskockák között. */
function samplePose(keys: Key[], p: number): Pose {
  const n = keys.length;
  const t = (((p % 1) + 1) % 1) * CYCLE;
  // Szegmens keresése (a ciklushatáron az utolsó kulcsból a 0. felé).
  let i = n - 1;
  for (let k = 0; k < n; k++) {
    const next = k + 1 < n ? keys[k + 1].t : CYCLE;
    if (t >= keys[k].t && t < next) {
      i = k;
      break;
    }
  }
  const time = (k: number) => {
    const wrap = Math.floor(k / n);
    return keys[((k % n) + n) % n].t + wrap * CYCLE;
  };
  const pose = (k: number) => keys[((k % n) + n) % n].pose;
  const t0 = time(i);
  const t1 = time(i + 1);
  const h = t1 - t0;
  const s = (t - t0) / h;
  const s2 = s * s;
  const s3 = s2 * s;
  const h00 = 2 * s3 - 3 * s2 + 1;
  const h10 = s3 - 2 * s2 + s;
  const h01 = -2 * s3 + 3 * s2;
  const h11 = s3 - s2;
  const out = [0, 0, 0, 0, 0, 0] as Pose;
  for (let c = 0; c < 6; c++) {
    const m0 = (pose(i + 1)[c] - pose(i - 1)[c]) / (time(i + 1) - time(i - 1));
    const m1 = (pose(i + 2)[c] - pose(i)[c]) / (time(i + 2) - time(i));
    out[c] = h00 * pose(i)[c] + h10 * h * m0 + h01 * pose(i + 1)[c] + h11 * h * m1;
  }
  return out;
}

export type CameraState = {
  position: [number, number, number];
  target: [number, number, number];
  /** Vízszintes látószög (fok) — a kompozíció így független a képaránytól. */
  hfov: number;
};

/** A teljes kameraállapot a p fázisban. */
export function cameraAt(rig: Rig, p: number, targetY = 0.25): CameraState {
  const [tx, tz, azDeg, elDeg, dist, hfov] = samplePose(KEYS[rig], p);
  const az = (azDeg * Math.PI) / 180;
  const el = (elDeg * Math.PI) / 180;
  return {
    target: [tx, targetY, tz],
    position: [
      tx + dist * Math.sin(az) * Math.cos(el),
      targetY + dist * Math.sin(el),
      tz + dist * Math.cos(az) * Math.cos(el),
    ],
    hfov,
  };
}

/**
 * Egy ütemezési lépés (tiszta függvény, egységtesztelhető): a sebesség a cél
 * felé exponenciálisan simul — megállás τ = 0,07 s, indulás τ = 0,6 s —, a
 * fázis legfeljebb a valós idővel azonos ütemben haladhat (speed ≤ 1).
 */
export function stepMotion(speed: number, target: number, dtSeconds: number) {
  const tau = target > speed ? 0.6 : 0.07;
  let next = speed + (target - speed) * (1 - Math.exp(-dtSeconds / tau));
  const stopped = target === 0 && next < 0.01;
  if (stopped) next = 0;
  return { speed: next, phaseAdvance: (dtSeconds * next) / CYCLE, stopped };
}
