/**
 * physics.ts — a Continuous Market Journey mozgásrendszer tiszta matematikája.
 *
 * Nincs benne DOM-hozzáférés és React-állapot: egyetlen bemenete a világidő
 * (másodperc), kimenete egy strukturált "pózleírás" (Pose), amit a
 * HeroMotion.tsx alkalmaz a valódi SVG-csoportokra `transform` attribútumként.
 * Ez a közös, egyetlen forrásból számolt timeline adja a motion-koherenciát:
 * a figura, a lábak, a terep, a takarás és a világ-rétegek mind UGYANABBÓL
 * a `worldX(t)` értékből származnak, nem hét külön animációs hurokból.
 *
 * ---------------------------------------------------------------------------
 * MOZGÁSFIZIKA — a v0.1 fő hibájának javítása
 * ---------------------------------------------------------------------------
 * v0.1-ben a figura X-helyzete alig változott, miközben a végtagok mozogtak
 * és a test függőlegesen pattogott — ez futópad-hatást adott.
 *
 * v0.2-ben a karakter world-koordinátája FOLYAMATOSAN, monoton nő
 * (worldX = sebesség × idő), és ebből vezetjük le mind a képernyő-X
 * pozíciót (egy utazási sávon belül, ld. lentebb), mind az egyes ízületek
 * szögét. A támaszlábnál (stance) a boka VILÁGKOORDINÁTÁJA a talajra
 * lépés pillanatában rögzül, és a comb+térd szögét minden képkockán egy
 * kétcsontos (2-bone) inverz kinematikai megoldó számolja újra úgy, hogy
 * a boka world-pozíciója a támaszfázis alatt VÁLTOZATLAN maradjon, míg a
 * csípő a valódi worldX szerint halad fölötte. Ez matematikailag zárja ki
 * a talpcsúszást a támaszfázis alatt (nem csak vizuális közelítés).
 *
 * A lengő láb (swing) ehhez képest egyszerű, szinusz-alapú eljárási
 * mozgás — ott nincs talajkontakt, az IK feleslegesen bonyolítaná.
 * ---------------------------------------------------------------------------
 */

export const clamp01 = (value: number): number =>
  Math.min(1, Math.max(0, value));

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

/** Cosine-alapú smoothstep: 0-nál 0, 1-nél 1, mindkét végén sima érintővel. */
const smooth = (t: number): number => {
  const c = clamp01(t);
  return 0.5 - 0.5 * Math.cos(Math.PI * c);
};

const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

const deg2rad = (deg: number): number => (deg * Math.PI) / 180;
const rad2deg = (rad: number): number => (rad * 180) / Math.PI;

/* ============================================================================
   VILÁG-PARAMÉTEREK
   ========================================================================= */

/** SVG viewBox mérete (world- és képernyő-egység is ez, 1:1 arányban). */
export const VIEW_W = 720;
export const VIEW_H = 460;

/** A karakter haladási sebessége world-egység/másodperc — nyugodt tempó. */
const SPEED = 27;

/** Lábhossz (comb + lábszár), world/SVG-egységben. */
const THIGH_LEN = 46;
const SHIN_LEN = 44;
const LEG_TOTAL_LEN = THIGH_LEN + SHIN_LEN;

/** A lengő láb comblendítésének alap-amplitúdója, fokban. */
const SWING_THIGH_AMPLITUDE = 24;

/** Talajfogáskor (a lengő fázis végén, phase=π) a boka mennyivel esik a
 *  csípő elé — a majdnem kinyújtott lábból, geometriailag levezetve. */
const PLANT_REACH = Math.sin(deg2rad(SWING_THIGH_AMPLITUDE)) * LEG_TOTAL_LEN;

/** Egy teljes (2π) gaitciklushoz tartozó világtávolság: ennyi utat tesz meg
 *  a csípő egyetlen teljes lépésciklus (mindkét láb egyszer lendül és
 *  támaszkodik) alatt. Ez köti össze a lábmunkát a TÉNYLEGES haladással.
 *
 *  ÉRTÉK NEM SZABADON VÁLASZTOTT: a támaszfázis (fél gaitciklus, azaz a
 *  világtávolság fele) alatt a csípőnek pontosan 2×PLANT_REACH-et kell
 *  haladnia ahhoz, hogy a támaszláb IK-pózja (talajfogáskor +PLANT_REACH,
 *  elrugaszkodáskor −PLANT_REACH) folytonosan illeszkedjen a lengő láb
 *  szinusz-formulájának mindkét fázishatáron (π-nél ÉS 0/2π-nél) számolt
 *  szögéhez. Enélkül a két formula között néhány fokos "ugrás" látszana
 *  lépésenként a boka world-pozíciójában — ez zárja ki azt egzaktul.
 */
const STRIDE_DISTANCE = 4 * PLANT_REACH;

/** Az utazási sáv (screen-X tartomány), amin belül a karakter látszólagos
 *  képernyőpozíciója mozog, mielőtt a ciklus — takarással és elhalványodással
 *  álcázva — visszaindul. A karakter tehát ténylegesen, láthatóan halad a
 *  keretben, nem középen áll fixen. */
const BAND_X_MIN = 150;
const BAND_X_MAX = 470;
const BAND_D = BAND_X_MAX - BAND_X_MIN;

const GROUND_BASE_Y = 336;

/* ============================================================================
   TEREP-PROFIL — a stepping surfaces magassága a sáv mentén
   ========================================================================= */

/** [sávtörtrész 0..1, Y-eltolás px-ben (pozitív = lejjebb)] párok, a köztük
 *  lévő szakaszokon smoothstep-interpolációval. A profil 0-nál és 1-nél is
 *  alapszinten (0) van, hogy a — takarással és elhalványodással úgyis
 *  álcázott — varratnál ne legyen látható ugrás. */
const TERRAIN_KEYFRAMES: Array<[number, number]> = [
  [0.0, 0],
  [0.2, 0],
  [0.3, -16], // 04 — Fellépés: emelkedés egy magasabb felületre
  [0.58, -16], // fennmarad az emelt szinten (itt halad át az előtér-takarás is)
  [0.66, 12], // 06 — Lelépés: süllyedés egy alacsonyabb felületre
  [0.8, 0], // vissza az alapszintre a hosszabb lépés / rés előtt
  [1.0, 0],
];

export function terrainOffsetY(bandFraction: number): number {
  const f = clamp01(bandFraction);
  for (let i = 0; i < TERRAIN_KEYFRAMES.length - 1; i += 1) {
    const [x0, y0] = TERRAIN_KEYFRAMES[i];
    const [x1, y1] = TERRAIN_KEYFRAMES[i + 1];
    if (f >= x0 && f <= x1) {
      const local = x1 === x0 ? 0 : (f - x0) / (x1 - x0);
      return lerp(y0, y1, smooth(local));
    }
  }
  return 0;
}

/** 05 — Áthaladás/occlusion: az előtér-gyertya rögzített pozíciója a sávon. */
export const OCCLUSION_BAND_FRACTION = 0.58;

/** 07 — Hosszabb lépés: a comblendítés amplitúdó-szorzója ebben az
 *  ablakban emelkedik meg átmenetileg, hosszabb léptáv-érzetet adva —
 *  világtávolság-alapú fázis-újraskálázás nélkül, egyszerűbben és
 *  megbízhatóan. */
const LONG_STRIDE_WINDOW: [number, number] = [0.82, 0.9];
const LONG_STRIDE_PEAK = 0.86;
const LONG_STRIDE_MULTIPLIER = 1.55;

function longStrideAmplitudeMultiplier(bandFraction: number): number {
  const [start, end] = LONG_STRIDE_WINDOW;
  if (bandFraction < start || bandFraction > end) return 1;
  const toPeak = bandFraction <= LONG_STRIDE_PEAK;
  const local = toPeak
    ? (bandFraction - start) / (LONG_STRIDE_PEAK - start)
    : 1 - (bandFraction - LONG_STRIDE_PEAK) / (end - LONG_STRIDE_PEAK);
  return lerp(1, LONG_STRIDE_MULTIPLIER, smooth(local));
}

/** A karakter opacitása: lágy be- és kifutás a sáv két végén — ez, a
 *  08 „continuous / seamless continuation” beat: a visszaállás (reset) a
 *  worldX % BAND_D varratnál pontosan az elhalványodás + előtér-takarás
 *  mögött történik, így nem látható. */
function edgeOpacity(bandFraction: number): number {
  const fadeIn = smooth(bandFraction / 0.05);
  const fadeOut = smooth((1 - bandFraction) / 0.07);
  return clamp01(Math.min(fadeIn, fadeOut));
}

/* ============================================================================
   KÉT-CSONTOS IK — a támaszláb boka-rögzítéséhez
   ========================================================================= */

/** A csípőízület és a talaj közti ÁLLANDÓ, LOKÁLIS függőleges táv — nem az
 *  SVG abszolút Y-koordinátája (azt a rootY/GROUND_BASE_Y adja külön, a
 *  teljes karakter-csoport eltolásaként, ld. computePose). Az IK ebben a
 *  lokális "mindig sík talaj" térben old meg, a terepmagasság-változást a
 *  teljes test egyben, "liftszerűen" követi (ld. modul-fejléc). */
const LEG_REACH_Y = 82;

export type IkSolution = { hipDeg: number; kneeDeg: number };

/**
 * Klasszikus 2-bone IK (koszinusztétel): adott a csípő és a boka relatív
 * távolsága (dx, dy — a csípőhöz képest, lefelé pozitív Y), visszaadja a
 * csípő- és térdszöget fokban úgy, hogy a lábfej pontosan a célpontra essen.
 * Ha a cél elérhetetlenül távol van (dist > teljes hossz), a lábat
 * kinyújtva a cél irányába fordítja — nem omlik össze NaN-ra.
 */
export function solveTwoBoneIk(dx: number, dy: number): IkSolution {
  const dist = clamp(Math.hypot(dx, dy), 1, THIGH_LEN + SHIN_LEN - 0.01);
  const targetAngle = Math.atan2(dx, dy); // 0 = egyenesen lefelé

  const cosKnee =
    (THIGH_LEN * THIGH_LEN + SHIN_LEN * SHIN_LEN - dist * dist) /
    (2 * THIGH_LEN * SHIN_LEN);
  const kneeInner = Math.acos(clamp(cosKnee, -1, 1));
  // A térd "kinyújtott" állapota 180°; a behajlás ennek a kiegészítője.
  const kneeBendRad = Math.PI - kneeInner;

  const cosHipOffset =
    (THIGH_LEN * THIGH_LEN + dist * dist - SHIN_LEN * SHIN_LEN) /
    (2 * THIGH_LEN * dist);
  const hipOffsetRad = Math.acos(clamp(cosHipOffset, -1, 1));

  const hipDeg = rad2deg(targetAngle - hipOffsetRad);
  const kneeDeg = rad2deg(kneeBendRad);

  return { hipDeg, kneeDeg };
}

/* ============================================================================
   LENGŐ LÁB — eljárási szinusz-mozgás (nincs talajkontakt, nincs szükség IK-ra)
   ========================================================================= */

const SWING_KNEE_PEAK = 62; // fok

function swingLegPose(phase: number, amplitudeMul: number): IkSolution {
  // phase ∈ [0, π): 0 = elrugaszkodás (hátul), π = talajfogás (elöl).
  const hipDeg = -SWING_THIGH_AMPLITUDE * amplitudeMul * Math.cos(phase);
  const kneeDeg = SWING_KNEE_PEAK * Math.max(0, Math.sin(phase));
  return { hipDeg, kneeDeg };
}

/* ============================================================================
   EGY LÁB TELJES PÓZA
   ========================================================================= */

export type LegPose = {
  hipDeg: number;
  kneeDeg: number;
  ankleDeg: number;
  grounded: boolean;
};

type StanceAnchor = { plantHipX: number; plantAnkleX: number };

/**
 * Egy láb póza adott világfázisnál. A csípő ANNAK a lábnak a világ-X
 * pozíciója (a karakter unwrapped worldX-e + a csípő oldali eltolása).
 *
 * A támaszfázisban (phase ∈ [π, 2π)) a `stanceAnchor` rögzíti, hogy a
 * boka world-X-e hol landolt (a talajfogás pillanatában felvett érték) —
 * ebből és a csípő JELENLEGI world-X-éből számolja az IK a szükséges
 * comb/térd szöget, hogy a boka world-pozíciója változatlan maradjon,
 * amíg a csípő halad fölötte.
 */
export function legPose(
  phase01: number,
  hipWorldX: number,
  stanceAnchor: StanceAnchor,
  amplitudeMul: number,
): LegPose {
  const phase = ((phase01 % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);

  if (phase < Math.PI) {
    // --- LENGŐ FÁZIS: procedurális, nincs talajkontakt. ---
    const { hipDeg, kneeDeg } = swingLegPose(phase, amplitudeMul);
    // Finom boka-ellenkompenzálás: a lábfej lendítéskor kissé felhúzva
    // (talajtávolság), talajfogás közelében visszasimul vízszintesre.
    const ankleDeg = 14 * Math.max(0, Math.sin(phase - 0.4));
    return { hipDeg, kneeDeg, ankleDeg, grounded: false };
  }

  // --- TÁMASZFÁZIS: 2-bone IK zárja a bokát a landolási world-pontra. ---
  const dx = stanceAnchor.plantAnkleX - hipWorldX;
  const { hipDeg, kneeDeg } = solveTwoBoneIk(dx, LEG_REACH_Y);
  return { hipDeg, kneeDeg, ankleDeg: 0, grounded: true };
}

/* ============================================================================
   TELJES PÓZ — a HeroMotion.tsx ezt hívja minden képkockán
   ========================================================================= */

export type Pose = {
  /** A karakter gyökér-csoportjának képernyő-X, -Y pozíciója. */
  rootX: number;
  rootY: number;
  /** 0..1 — a karakter (és a hozzá kötött elemek) opacitása a varrat-álcázáshoz. */
  opacity: number;
  /** Finom törzsdőlés és fejstabilizálás, fokban. */
  torsoLeanDeg: number;
  headCounterDeg: number;
  /** Karok — bal/jobb, kontralaterális fázisban a lábakkal. */
  armLeft: { shoulderDeg: number; elbowDeg: number };
  armRight: { shoulderDeg: number; elbowDeg: number };
  /** Lábak. */
  legLeft: LegPose;
  legRight: LegPose;
  /** Kamera- és world-réteg eltolások (parallax), képernyő-px-ben. */
  cameraOffsetX: number;
  midgroundOffsetX: number;
  backgroundOffsetX: number;
  foregroundOffsetX: number;
  /** Az előtér-takaró gyertya rögzített képernyő-X-e. */
  occlusionScreenX: number;
  /** Debug/QA célra: a nyers, nem-wrapolt világtávolság. */
  worldX: number;
  bandFraction: number;
};

const HIP_SPREAD = 9;
const VERTICAL_BOUNCE = 2.2; // px — szándékosan minimális

/**
 * A karakter world-X-e (nem wrapolt, monoton nő) — ebből származik minden
 * más: a fázis, a képernyőpozíció, a terep, a takarás és az elhalványodás.
 */
export function worldXAt(elapsedSeconds: number): number {
  return elapsedSeconds * SPEED;
}

function stanceAnchorFor(hipWorldXAtPlant: number): StanceAnchor {
  // Talajfogáskor a láb kinyújtva, előre — a landolási boka-world-X a
  // csípő akkori world-X-e plusz a PLANT_REACH (ld. STRIDE_DISTANCE
  // fejléce: ugyanaz az érték, amivel a formula önmagával konzisztens).
  return {
    plantHipX: hipWorldXAtPlant,
    plantAnkleX: hipWorldXAtPlant + PLANT_REACH,
  };
}

export function computePose(elapsedSeconds: number): Pose {
  const worldX = worldXAt(elapsedSeconds);
  const rawBandX = ((worldX % BAND_D) + BAND_D) % BAND_D;
  const bandFraction = rawBandX / BAND_D;
  const screenX = BAND_X_MIN + rawBandX;

  const gaitPhaseGlobal = (worldX / STRIDE_DISTANCE) * 2 * Math.PI;
  // Bal láb fázisa a globális gaitfázis; jobb láb ellenfázisban.
  const phaseLeft = gaitPhaseGlobal;
  const phaseRight = gaitPhaseGlobal + Math.PI;

  const amplitudeMul = longStrideAmplitudeMultiplier(bandFraction);

  // A csípő world-X-e lábanként (a HIP_SPREAD miatt kicsit eltér, de az IK
  // szempontjából elhanyagolható különbség — a karakter fő worldX-ét
  // használjuk mindkét lábnál az egyszerűség és a stabil varrat-mentesség
  // kedvéért).
  const hipWorldX = worldX;

  // A támaszfázis "lehorgonyzása": az utolsó talajfogás world-X pillanatát
  // a fázis alapján visszaszámoljuk (mivel a fázis és a worldX szigorúan
  // arányos, ez zárt alakban, "várakozás" nélkül kifejezhető).
  const lastPlantWorldXFor = (phase: number, currentWorldX: number) => {
    const phaseAtPi = ((phase - Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
    // currentWorldX - (phaseAtPi / (2π)) * STRIDE_DISTANCE adja meg azt a
    // world-X-et, ahol ennek a lábnak a fázisa utoljára pontosan π volt
    // (azaz talajt fogott).
    return currentWorldX - (phaseAtPi / (2 * Math.PI)) * STRIDE_DISTANCE;
  };

  const plantWorldXLeft = lastPlantWorldXFor(
    ((phaseLeft % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI),
    hipWorldX,
  );
  const plantWorldXRight = lastPlantWorldXFor(
    ((phaseRight % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI),
    hipWorldX,
  );

  const anchorLeft = stanceAnchorFor(plantWorldXLeft);
  const anchorRight = stanceAnchorFor(plantWorldXRight);

  const legLeft = legPose(phaseLeft, hipWorldX, anchorLeft, amplitudeMul);
  const legRight = legPose(phaseRight, hipWorldX, anchorRight, amplitudeMul);

  // Karok: kontralaterális — jobb kar a bal láb fázisát tükrözi, kisebb
  // amplitúdóval, finom könyékhajlítással.
  const armAmplitude = 12;
  const elbowBase = 8;
  const elbowSwing = 10;
  const armLeft = {
    shoulderDeg: armAmplitude * Math.sin(phaseRight),
    elbowDeg: elbowBase + elbowSwing * Math.max(0, Math.sin(phaseRight)),
  };
  const armRight = {
    shoulderDeg: armAmplitude * Math.sin(phaseLeft),
    elbowDeg: elbowBase + elbowSwing * Math.max(0, Math.sin(phaseLeft)),
  };

  // Minimális, kontrollált függőleges lüktetés — két csúcs/ciklus (mindkét
  // láb támaszba érésekor), szándékosan kis amplitúdóval.
  const bounce = VERTICAL_BOUNCE * Math.abs(Math.cos(gaitPhaseGlobal));
  const torsoLeanDeg = 1.4 * Math.sin(gaitPhaseGlobal);
  const headCounterDeg = -torsoLeanDeg * 0.5;

  const terrainY = terrainOffsetY(bandFraction);
  const rootY = GROUND_BASE_Y + terrainY - bounce;

  const opacity = edgeOpacity(bandFraction);

  const centerX = (BAND_X_MIN + BAND_X_MAX) / 2;
  const followBase = screenX - centerX;
  const cameraOffsetX = -followBase * 0.18;
  const backgroundOffsetX = -followBase * 0.04;
  const midgroundOffsetX = -followBase * 0.1;
  const foregroundOffsetX = -followBase * 0.22;

  const occlusionScreenX = BAND_X_MIN + OCCLUSION_BAND_FRACTION * BAND_D;

  return {
    rootX: screenX,
    rootY,
    opacity,
    torsoLeanDeg,
    headCounterDeg,
    armLeft,
    armRight,
    legLeft,
    legRight,
    cameraOffsetX,
    midgroundOffsetX,
    backgroundOffsetX,
    foregroundOffsetX,
    occlusionScreenX,
    worldX,
    bandFraction,
  };
}

export {
  BAND_X_MIN,
  BAND_X_MAX,
  BAND_D,
  HIP_SPREAD,
  GROUND_BASE_Y,
  THIGH_LEN,
  SHIN_LEN,
  TERRAIN_KEYFRAMES,
};
