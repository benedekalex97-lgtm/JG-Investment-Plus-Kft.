"use client";

import { useEffect, useRef } from "react";
import {
  BAND_D,
  BAND_X_MIN,
  computePose,
  GROUND_BASE_Y,
  HIP_SPREAD,
  SHIN_LEN,
  terrainOffsetY,
  THIGH_LEN,
  VIEW_H,
  VIEW_W,
  type Pose,
} from "./physics";

/**
 * HeroMotion — „Continuous Market Journey".
 *
 * Egy absztrakt, arctalan, nemsemleges figura folyamatosan, ténylegesen
 * halad egy rétegzett, japángyertya-alapú környezetben. A teljes koreográfiát
 * EGYETLEN közös timeline hajtja (ld. physics.ts: computePose(t)) —
 * requestAnimationFrame-mel, közvetlen DOM-írással (SVG `transform`
 * attribútum), React-állapot és re-render nélkül a 60fps-es ágon.
 *
 * Rig-hierarchia (mindegyik saját <g> csoport, az ízület a csoport lokális
 * origójában): pelvis (gyökér) → torso → head; pelvis → thigh → shin → foot
 * (bal/jobb). A comb/térd szögét támaszfázisban 2-bone IK adja (ld.
 * physics.ts), ami world-koordinátában lehorgonyozza a talpat — ez zárja ki
 * a talpcsúszást és a "futópad-hatást".
 *
 * `prefers-reduced-motion: reduce` esetén a rAF-hurok el sem indul: az SVG
 * kezdő `transform` értékei már a t=0 pózt tükrözik (kiszámolva render
 * időben), így egy stabil, teljes, prémium statikus kompozíció marad —
 * nincs parallax, nincs járás, nincs elhalványodó/megjelenő varrat.
 *
 * A teljes SVG dekoratív (aria-hidden), nem terhel képernyőolvasót.
 */

const TORSO_H = 74;
const TORSO_W = 42;
const NECK_Y = -TORSO_H;
const HEAD_R = 15;

const SHOULDER_Y = -TORSO_H + 10;
const SHOULDER_X = 15;
const UPPER_ARM_LEN = 32;
const LOWER_ARM_LEN = 29;
const LIMB_W_ARM = 11;
const LIMB_W_LEG = 13;

const FOOT_LEN = 22;
const FOOT_H = 9;

function setTransform(el: SVGElement | null, value: string) {
  el?.setAttribute("transform", value);
}

/**
 * Kezdő, statikus póz — SSR-en, JS betöltődése előtt és reduced-motion alatt
 * is ez látszik. Szándékosan NEM t=0: a világtávolság-sáv 0.0–0.26 közti
 * szakasza gyertya nélküli, nyitott terület (ld. MIDGROUND_CANDLES), így a
 * karakter itt tisztán, zsúfoltság és takarás nélkül áll — prémium, teljes
 * kompozíció, nem csak "az animáció nulladik képkockája".
 */
const STATIC_POSE_TIME = 1.66;
const INITIAL_POSE: Pose = computePose(STATIC_POSE_TIME);

export default function HeroMotion() {
  const rootRef = useRef<SVGGElement>(null);
  const cameraRef = useRef<SVGGElement>(null);
  const backgroundRef = useRef<SVGGElement>(null);
  const midgroundRef = useRef<SVGGElement>(null);
  const foregroundRef = useRef<SVGGElement>(null);

  const torsoRef = useRef<SVGGElement>(null);
  const headRef = useRef<SVGGElement>(null);
  const armLUpperRef = useRef<SVGGElement>(null);
  const armLLowerRef = useRef<SVGGElement>(null);
  const armRUpperRef = useRef<SVGGElement>(null);
  const armRLowerRef = useRef<SVGGElement>(null);
  const thighLRef = useRef<SVGGElement>(null);
  const shinLRef = useRef<SVGGElement>(null);
  const footLRef = useRef<SVGGElement>(null);
  const thighRRef = useRef<SVGGElement>(null);
  const shinRRef = useRef<SVGGElement>(null);
  const footRRef = useRef<SVGGElement>(null);
  const occluderRef = useRef<SVGGElement>(null);

  useEffect(() => {
    const reduceMotionQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );

    function applyPose(pose: Pose) {
      setTransform(rootRef.current, `translate(${pose.rootX} ${pose.rootY})`);
      if (rootRef.current) rootRef.current.style.opacity = String(pose.opacity);

      setTransform(cameraRef.current, `translate(${pose.cameraOffsetX} 0)`);
      setTransform(backgroundRef.current, `translate(${pose.backgroundOffsetX} 0)`);
      setTransform(midgroundRef.current, `translate(${pose.midgroundOffsetX} 0)`);
      setTransform(foregroundRef.current, `translate(${pose.foregroundOffsetX} 0)`);
      setTransform(
        occluderRef.current,
        `translate(${pose.occlusionScreenX} 0)`,
      );

      setTransform(torsoRef.current, `rotate(${pose.torsoLeanDeg})`);
      setTransform(headRef.current, `translate(0 ${NECK_Y}) rotate(${pose.headCounterDeg})`);

      setTransform(
        armLUpperRef.current,
        `translate(${-SHOULDER_X} ${SHOULDER_Y}) rotate(${pose.armLeft.shoulderDeg})`,
      );
      setTransform(
        armLLowerRef.current,
        `translate(0 ${UPPER_ARM_LEN}) rotate(${-pose.armLeft.elbowDeg})`,
      );
      setTransform(
        armRUpperRef.current,
        `translate(${SHOULDER_X} ${SHOULDER_Y}) rotate(${pose.armRight.shoulderDeg})`,
      );
      setTransform(
        armRLowerRef.current,
        `translate(0 ${UPPER_ARM_LEN}) rotate(${-pose.armRight.elbowDeg})`,
      );

      setTransform(
        thighLRef.current,
        `translate(${-HIP_SPREAD} 0) rotate(${pose.legLeft.hipDeg})`,
      );
      setTransform(
        shinLRef.current,
        `translate(0 ${THIGH_LEN}) rotate(${-pose.legLeft.kneeDeg})`,
      );
      setTransform(
        footLRef.current,
        `translate(0 ${SHIN_LEN}) rotate(${-pose.legLeft.ankleDeg})`,
      );

      setTransform(
        thighRRef.current,
        `translate(${HIP_SPREAD} 0) rotate(${pose.legRight.hipDeg})`,
      );
      setTransform(
        shinRRef.current,
        `translate(0 ${THIGH_LEN}) rotate(${-pose.legRight.kneeDeg})`,
      );
      setTransform(
        footRRef.current,
        `translate(0 ${SHIN_LEN}) rotate(${-pose.legRight.ankleDeg})`,
      );
    }

    // Kezdő póz mindig alkalmazva (reduced-motion esetén ez marad végig).
    applyPose(INITIAL_POSE);

    if (reduceMotionQuery.matches) {
      return;
    }

    let raf = 0;
    let startTime: number | null = null;
    let paused = document.hidden;

    function tick(now: number) {
      if (paused) {
        raf = requestAnimationFrame(tick);
        return;
      }
      if (startTime === null) startTime = now;
      const elapsed = (now - startTime) / 1000;
      applyPose(computePose(elapsed));
      raf = requestAnimationFrame(tick);
    }

    function onVisibilityChange() {
      paused = document.hidden;
    }

    function onReduceMotionChange(event: MediaQueryListEvent) {
      if (event.matches) {
        cancelAnimationFrame(raf);
        applyPose(INITIAL_POSE);
      }
    }

    document.addEventListener("visibilitychange", onVisibilityChange);
    reduceMotionQuery.addEventListener("change", onReduceMotionChange);
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      reduceMotionQuery.removeEventListener("change", onReduceMotionChange);
    };
  }, []);

  return (
    <div className="relative w-full select-none" aria-hidden="true">
      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        role="presentation"
        focusable="false"
        className="block h-auto w-full"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* Smoked Graphite + frosted Aubergine belső tónus — a figura anyaga. */}
          <linearGradient id="jgFigureFill" x1="0" y1="0" x2="0.3" y2="1">
            <stop offset="0%" style={{ stopColor: "var(--color-ink)" }} stopOpacity="0.88" />
            <stop offset="55%" style={{ stopColor: "var(--color-aubergine)" }} stopOpacity="0.78" />
            <stop offset="100%" style={{ stopColor: "var(--color-aubergine)" }} stopOpacity="0.7" />
          </linearGradient>
          <linearGradient id="jgFigureRim" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" style={{ stopColor: "var(--color-cool-silver)" }} stopOpacity="0.7" />
            <stop offset="60%" style={{ stopColor: "var(--color-cool-silver)" }} stopOpacity="0.1" />
            <stop offset="100%" style={{ stopColor: "var(--color-cool-silver)" }} stopOpacity="0.3" />
          </linearGradient>
          <radialGradient id="jgGlow" cx="58%" cy="60%" r="52%">
            <stop offset="0%" style={{ stopColor: "var(--color-aubergine)" }} stopOpacity="0.1" />
            <stop offset="100%" style={{ stopColor: "var(--color-aubergine)" }} stopOpacity="0" />
          </radialGradient>
          {/* Midground: Smoked Graphite — visszafogott, áttetsző, NEM szolid fekete tömb. */}
          <linearGradient id="jgMidFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" style={{ stopColor: "var(--color-ink)" }} stopOpacity="0.62" />
            <stop offset="100%" style={{ stopColor: "var(--color-carbon)" }} stopOpacity="0.72" />
          </linearGradient>
          <filter id="jgSoftBlur" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="3.2" />
          </filter>
        </defs>

        <ellipse cx="420" cy="250" rx="260" ry="190" fill="url(#jgGlow)" />

        {/* Kamera-csoport: a teljes világ (a karakter kivételével) ezen belül
            mozog finoman, a karakter screen-X-éhez képest. */}
        <g ref={cameraRef}>
          {/* ---- BACKGROUND — távoli, világos, atmoszférikus. Rövid, önálló
              testű oszlopok (nem a talajig érő tömb), bőséges légréssel
              egymás között — mélységet ad, nem zsúfol. ---- */}
          <g ref={backgroundRef} opacity={0.5}>
            {[
              [46, 64, 26],
              [162, 84, 22],
              [330, 58, 28],
              [498, 90, 22],
              [630, 66, 26],
            ].map(([x, h, w]) => (
              <rect
                key={`bg-${x}`}
                x={x - w / 2}
                y={GROUND_BASE_Y - h}
                width={w}
                height={h}
                rx={w / 2.4}
                style={{ fill: "var(--color-cool-silver)" }}
                opacity={0.45}
              />
            ))}
          </g>

          {/* ---- MIDGROUND — a fő járási környezet: a terep-profillal
              egyeztetett, fizikailag értelmezhető "stepping surfaces". ---- */}
          <g ref={midgroundRef}>
            <MidgroundTerrain />
          </g>
        </g>

        {/* A karakter a kamera-csoporton KÍVÜL van: a saját screen-X-e adja a
            tényleges, látható haladást, a kamera csak finoman kíséri a
            hátteret — nem "a figura középen áll, a háttér csúszik" hatás. */}
        <g ref={rootRef} data-qa="character-root">
          {/* pelvis — a gyökér-csoport maga a medence; ebből erednek a combok
              és a torzó. Nincs saját vizuális elem, csak szerkezeti csomópont. */}
          <g ref={thighLRef} data-qa="thigh-left">
            <rect
              x={-LIMB_W_LEG / 2}
              y={0}
              width={LIMB_W_LEG}
              height={THIGH_LEN}
              rx={LIMB_W_LEG / 2}
              fill="url(#jgFigureFill)"
            />
            <g ref={shinLRef}>
              <rect
                x={-LIMB_W_LEG / 2 + 1}
                y={0}
                width={LIMB_W_LEG - 2}
                height={SHIN_LEN}
                rx={(LIMB_W_LEG - 2) / 2}
                fill="url(#jgFigureFill)"
              />
              <g ref={footLRef}>
                <rect
                  x={-6}
                  y={-FOOT_H / 2}
                  width={FOOT_LEN}
                  height={FOOT_H}
                  rx={FOOT_H / 2}
                  fill="url(#jgFigureFill)"
                />
              </g>
            </g>
          </g>

          <g ref={thighRRef} data-qa="thigh-right">
            <rect
              x={-LIMB_W_LEG / 2}
              y={0}
              width={LIMB_W_LEG}
              height={THIGH_LEN}
              rx={LIMB_W_LEG / 2}
              fill="url(#jgFigureFill)"
            />
            <g ref={shinRRef}>
              <rect
                x={-LIMB_W_LEG / 2 + 1}
                y={0}
                width={LIMB_W_LEG - 2}
                height={SHIN_LEN}
                rx={(LIMB_W_LEG - 2) / 2}
                fill="url(#jgFigureFill)"
              />
              <g ref={footRRef}>
                <rect
                  x={-6}
                  y={-FOOT_H / 2}
                  width={FOOT_LEN}
                  height={FOOT_H}
                  rx={FOOT_H / 2}
                  fill="url(#jgFigureFill)"
                />
              </g>
            </g>
          </g>

          <g ref={torsoRef}>
            <path
              d={`M0 ${-TORSO_H} C ${TORSO_W / 2} ${-TORSO_H} ${TORSO_W / 2 + 4} ${-TORSO_H + 18} ${TORSO_W / 2} ${-TORSO_H / 2}
                  C ${TORSO_W / 2 - 2} ${-14} ${TORSO_W / 2 - 8} 0 0 0
                  C ${-(TORSO_W / 2 - 8)} 0 ${-(TORSO_W / 2 - 2)} -14 ${-TORSO_W / 2} ${-TORSO_H / 2}
                  C ${-(TORSO_W / 2 + 4)} ${-TORSO_H + 18} ${-TORSO_W / 2} ${-TORSO_H} 0 ${-TORSO_H} Z`}
              fill="url(#jgFigureFill)"
            />
            <path
              d={`M0 ${-TORSO_H} C ${TORSO_W / 2} ${-TORSO_H} ${TORSO_W / 2 + 4} ${-TORSO_H + 18} ${TORSO_W / 2} ${-TORSO_H / 2}
                  C ${TORSO_W / 2 - 2} ${-14} ${TORSO_W / 2 - 8} 0 0 0`}
              fill="none"
              stroke="url(#jgFigureRim)"
              strokeWidth="1.6"
            />

            <g ref={armLUpperRef}>
              <rect
                x={-LIMB_W_ARM / 2}
                y={0}
                width={LIMB_W_ARM}
                height={UPPER_ARM_LEN}
                rx={LIMB_W_ARM / 2}
                fill="url(#jgFigureFill)"
              />
              <g ref={armLLowerRef}>
                <rect
                  x={-LIMB_W_ARM / 2 + 1}
                  y={0}
                  width={LIMB_W_ARM - 2}
                  height={LOWER_ARM_LEN}
                  rx={(LIMB_W_ARM - 2) / 2}
                  fill="url(#jgFigureFill)"
                />
              </g>
            </g>

            <g ref={armRUpperRef}>
              <rect
                x={-LIMB_W_ARM / 2}
                y={0}
                width={LIMB_W_ARM}
                height={UPPER_ARM_LEN}
                rx={LIMB_W_ARM / 2}
                fill="url(#jgFigureFill)"
              />
              <g ref={armRLowerRef}>
                <rect
                  x={-LIMB_W_ARM / 2 + 1}
                  y={0}
                  width={LIMB_W_ARM - 2}
                  height={LOWER_ARM_LEN}
                  rx={(LIMB_W_ARM - 2) / 2}
                  fill="url(#jgFigureFill)"
                />
              </g>
            </g>

            <g ref={headRef}>
              <circle
                cx="0"
                cy={-HEAD_R - 1}
                r={HEAD_R}
                fill="url(#jgFigureFill)"
              />
              <path
                d={`M ${-HEAD_R * 0.62} ${-HEAD_R * 1.7} A ${HEAD_R} ${HEAD_R} 0 0 1 ${HEAD_R * 0.52} ${-HEAD_R * 1.86}`}
                fill="none"
                stroke="#FFFFFF"
                strokeOpacity="0.4"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
            </g>
          </g>
        </g>

        {/* ---- FOREGROUND — közelebbi, sötétebb, az 05. beat takarása; finom
            blur. A karakter UTÁN rajzolva, hogy ténylegesen kitakarhassa.
            Mérete a figura sziluettjéhez igazított — nem tölti ki a jelenetet. ---- */}
        <g ref={foregroundRef}>
          <g ref={occluderRef} data-qa="occluder" filter="url(#jgSoftBlur)">
            <rect
              x={-24}
              y={GROUND_BASE_Y - 168}
              width={48}
              height={184}
              rx={22}
              style={{ fill: "var(--color-carbon)" }}
              opacity={0.86}
            />
          </g>
        </g>
      </svg>
    </div>
  );
}

type CandleSpec = { fraction: number; width: number; height: number };

/**
 * A midground "stepping surfaces" — különálló, japán-gyertya jellegű
 * oszlopok (NEM egy szolid, talajig érő tömb), amiknek a TETEJE a
 * terep-profillal (physics.ts terrainOffsetY) van összehangolva, hogy
 * vizuálisan is az legyen, amin a karakter ténylegesen jár. A csoportok
 * közötti légrés adja az "építészeti tér" érzetét — nem tölti ki a jelenetet.
 */
const MIDGROUND_CANDLES: CandleSpec[] = [
  // A sáv eleje szándékosan nyitva marad (kb. 0–0.26 között): itt indul a
  // "01 — Kontakt" beat, és ez a statikus (reduced-motion) alapértelmezett
  // póz helyszíne is — a karakter itt szabadon, gyertyák nélkül áll/lép,
  // nem zsúfolódik egymás mellé semmi.
  // 04 — emelt platform (három, egymást finoman átfedő test egy
  // folytonos járófelületet ad, miközben egyenként is felismerhetők).
  { fraction: 0.3, width: 62, height: 128 },
  { fraction: 0.4, width: 54, height: 150 },
  { fraction: 0.5, width: 58, height: 138 },
  // 06 — alacsonyabb lépcsőfok.
  { fraction: 0.64, width: 46, height: 78 },
  { fraction: 0.74, width: 40, height: 68 },
  // 07 előtti/utáni rés — szándékosan nincs itt gyertya (ld. lentebb).
  // Záró szakasz (a varratnál a fade és a takarás úgyis elrejti).
  { fraction: 0.95, width: 28, height: 88 },
];

function MidgroundTerrain() {
  return (
    <g>
      {MIDGROUND_CANDLES.map((c) => {
        const x = BAND_X_MIN + c.fraction * BAND_D;
        const topY = GROUND_BASE_Y + terrainOffsetY(c.fraction);
        return (
          <g key={`mid-${c.fraction}`}>
            <rect
              x={x - c.width / 2}
              y={topY}
              width={c.width}
              height={c.height}
              rx={Math.min(18, c.width / 2.6)}
              fill="url(#jgMidFill)"
            />
            {/* Finom felső élfény — Cool Silver, visszafogott, nem "metallic
                effekt minden elemen". */}
            <rect
              x={x - c.width / 2 + 5}
              y={topY + 5}
              width={c.width - 10}
              height={Math.max(5, c.height * 0.14)}
              rx={4}
              style={{ fill: "var(--color-cool-silver)" }}
              opacity={0.14}
            />
          </g>
        );
      })}
    </g>
  );
}
