"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

/**
 * HeroArchitecturalFlow — „JG ARCHITECTURAL FLOW: structure in motion".
 *
 * A Hero dekoratív háttérkompozíciója (aria-hidden, pointer-events: none).
 * NEM logó és nem logóváltozat: önálló építészeti struktúra, amely csak a
 * Symmetric Core geometriai fegyelmét (tükörszimmetria, egyenes élek,
 * hajszálvonalak) veszi át.
 *
 * GEOMETRIA
 *   Két egymást kiegészítő, nagy léptékű szárny. Mindkettő pontosan
 *   szerkesztett, magas síkok legyezője, amelyek EGY közös függőleges
 *   csuklótengely körül fordulnak (bal szárny: a bal szél közelében, jobb:
 *   tükörképe). Valódi CSS 3D perspektíva: a síkok szabad éle a mélységbe
 *   fordul, a felső/alsó élek a közös enyészpont felé futnak. A síkokat
 *   hajszálvékony élvonalak és néhány belső kontúr („metszés") rajzolja ki;
 *   desktopon a hátsó síkon néhány datum-vonal adja a tér mértékét.
 *
 * MOZGÁS — egyetlen koreográfia
 *   Egyetlen GSAP timeline egyetlen fázisértéket (t: 0 → 1) visz végig a
 *   ciklus alatt; MINDEN transzformáció ennek periodikus függvénye:
 *     - a legyezők „lélegeznek": a síkok szöge szinuszosan nyílik/zárul,
 *       síkonként kis fáziskéséssel → a hullám a csuklótól kifelé fut;
 *     - a két szárny ellenfázisban (fél ciklus eltolással) mozog → a
 *       kompozíció súlypontja lassan átáramlik egyik oldalról a másikra;
 *     - egy harmadolt periódusú finom hullám élteti a síkokat;
 *     - a két szárny a mélységben előre-hátra lép, az egész szerkezet pedig
 *       lassan elfordul (rotateY / rotateX).
 *   Csak transform (rotateY, rotateX, translateZ) változik — nincs layout és
 *   nincs repaint, a rétegeket a kompozitor mozgatja.
 *
 * ZÁRT LOOP
 *   Minden tag sin/cos(2π · k · t) alakú, egész k-val, ezért t = 1-nél
 *   PONTOSAN a t = 0 állapot áll elő (érték ÉS sebesség): az ismétlés
 *   matematikailag varratmentes, nincs ugrás, reset vagy irányváltás.
 *
 * ELSŐ KÉPKOCKA, SSR, REDUCED MOTION
 *   A t = 0 póz a szerveroldali HTML-ben inline transformként érkezik, tehát
 *   a struktúra JS nélkül, az első festéskor is teljes. A timeline pontosan
 *   innen indul (a sebesség 1,6 s alatt fut fel), így hidratáláskor semmi
 *   nem ugrik. prefers-reduced-motion esetén a t = 0 póz marad: gondosan
 *   komponált, szimmetrikus állókép — nem a régi hero kép.
 *
 * TELJESÍTMÉNY
 *   Mobilon külön, kisebb rig fut (3 + 3 sík, datum-vonalak nélkül). A
 *   timeline szünetel, ha a Hero nincs a viewportban vagy a lap rejtett, és
 *   onnan folytatódik, ahol megállt. Minden a useGSAP / matchMedia context
 *   része: unmountkor (és breakpoint- vagy preferenciaváltáskor) teljesen
 *   visszaáll.
 */

/** A teljes koreográfia ciklusideje másodpercben. */
export const FLOW_CYCLE = 24;

const TAU = Math.PI * 2;

type PlaneSpec = {
  /** Alapszög (fok): 0 = a nézőre néz, 90 = élben áll. */
  base: number;
  /** A fő, ciklusidejű nyitás/zárás amplitúdója (fok). */
  amp: number;
  /** Fáziskésés a ciklus törtrészében — ettől fut hullám a legyezőn. */
  lag: number;
  /** A harmadolt periódusú finom hullám amplitúdója (fok). */
  ripple: number;
  /** Mélységi fokozatosság: a hátsóbb síkok halkabbak. */
  alpha: number;
  contour?: boolean;
  accent?: boolean;
};

type RigSpec = {
  planes: PlaneSpec[];
  /** A teljes szerkezet elfordulása (fok). */
  swayY: number;
  swayX: number;
  /** A szárnyak mélységi lépése (px). */
  breathe: number;
  datum: boolean;
};

/*
  A szomszédos síkok alapszöge 10–14°-kal tér el; az amplitúdók és a
  fáziskések úgy vannak megválasztva, hogy a szomszédos síkok szögkülönbsége
  a legrosszabb esetben is csak ~7–11°-kal csökkenjen — a síkok sorrendje
  a teljes ciklus alatt megmarad (a legyező nem „gabalyodik össze").
*/
const DESKTOP: RigSpec = {
  planes: [
    { base: 34, amp: 17, lag: 0, ripple: 4, alpha: 1, accent: true },
    { base: 46, amp: 16, lag: 0.035, ripple: 4, alpha: 0.94, contour: true },
    { base: 58, amp: 15, lag: 0.07, ripple: 3.5, alpha: 0.88 },
    { base: 69, amp: 13, lag: 0.105, ripple: 3, alpha: 0.82, contour: true },
    { base: 79, amp: 8, lag: 0.14, ripple: 2, alpha: 0.76 },
  ],
  swayY: 4,
  swayX: 1.6,
  breathe: 80,
  datum: true,
};

const MOBILE: RigSpec = {
  planes: [
    { base: 44, amp: 16, lag: 0, ripple: 4, alpha: 1, accent: true },
    { base: 58, amp: 14, lag: 0.05, ripple: 3.5, alpha: 0.92, contour: true },
    { base: 72, amp: 10, lag: 0.1, ripple: 2.5, alpha: 0.84 },
  ],
  swayY: 3,
  swayX: 1.2,
  breathe: 60,
  datum: false,
};

const SIDES = ["left", "right"] as const;
type Side = (typeof SIDES)[number];
/** A két szárny ellenfázisban mozog. */
const WING_PHASE: Record<Side, number> = { left: 0, right: 0.5 };

const clamp = gsap.utils.clamp(8, 87);

/** Egy sík szöge a t fázisban (fok, a szárny saját irányában). */
function planeAngle(plane: PlaneSpec, t: number, side: Side) {
  const u = t + WING_PHASE[side] + plane.lag;
  return clamp(
    plane.base + plane.amp * Math.sin(TAU * u) + plane.ripple * Math.sin(TAU * 3 * u),
  );
}

/** A teljes rig póza a t fázisban — EZ az egyetlen mozgásfüggvény. */
function pose(spec: RigSpec, t: number) {
  return {
    rigY: spec.swayY * Math.sin(TAU * t),
    rigX: spec.swayX * Math.cos(TAU * t),
    wings: SIDES.map((side) => ({
      side,
      z: spec.breathe * Math.sin(TAU * (t + WING_PHASE[side])),
      // A jobb szárny a bal tükörképe: ellentétes forgásirány.
      angles: spec.planes.map((p) => planeAngle(p, t, side) * (side === "left" ? 1 : -1)),
    })),
  };
}

/* Az SSR-póz szövege GSAP transform-sorrendben (rotateY, majd rotateX). */
const f = (n: number) => Number(n.toFixed(3));
const START = { desktop: pose(DESKTOP, 0), mobile: pose(MOBILE, 0) };

const RIGS = [
  { key: "mobile", spec: MOBILE, className: "af-view af-view--mobile md:hidden" },
  { key: "desktop", spec: DESKTOP, className: "af-view af-view--desktop hidden md:block" },
] as const;

export default function HeroArchitecturalFlow() {
  const stageRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const stage = stageRef.current;
      if (!stage) return;
      const mm = gsap.matchMedia();

      mm.add(
        {
          desktop: "(min-width: 768px)",
          motion: "(prefers-reduced-motion: no-preference)",
        },
        (context) => {
          const { desktop, motion } = context.conditions ?? {};
          // Reduced motion: az SSR-ben érkező t = 0 póz a végleges állókép.
          if (!motion) return;

          const key = desktop ? "desktop" : "mobile";
          const spec = desktop ? DESKTOP : MOBILE;
          const view = stage.querySelector<HTMLElement>(`[data-rig="${key}"]`);
          const rig = view?.querySelector<HTMLElement>(".af-rig");
          if (!view || !rig) return;
          const wings = SIDES.map((side) => {
            const el = view.querySelector<HTMLElement>(`.af-wing-${side}`)!;
            return { el, planes: gsap.utils.toArray<HTMLElement>(".af-plane", el) };
          });

          // A GSAP transform-gyorsítótárát a t = 0 pózzal töltjük fel (ez
          // azonos az SSR inline transformmal → nincs ugrás), és ezt a
          // context visszaállításkor helyre is teszi.
          const start = START[key];
          gsap.set(rig, { rotationY: start.rigY, rotationX: start.rigX });
          wings.forEach((wing, w) => {
            gsap.set(wing.el, { z: start.wings[w].z });
            wing.planes.forEach((plane, i) =>
              gsap.set(plane, { rotationY: start.wings[w].angles[i] }),
            );
          });

          const setRigY = gsap.quickSetter(rig, "rotationY", "deg");
          const setRigX = gsap.quickSetter(rig, "rotationX", "deg");
          const setters = wings.map((wing) => ({
            z: gsap.quickSetter(wing.el, "z", "px"),
            planes: wing.planes.map((plane) => gsap.quickSetter(plane, "rotationY", "deg")),
          }));

          const state = { t: 0 };
          const render = () => {
            const p = pose(spec, state.t);
            setRigY(p.rigY);
            setRigX(p.rigX);
            p.wings.forEach((wing, w) => {
              setters[w].z(wing.z);
              wing.angles.forEach((angle, i) => setters[w].planes[i](angle));
            });
          };

          const tl = gsap
            .timeline({ repeat: -1 })
            .to(state, { t: 1, duration: FLOW_CYCLE, ease: "none", onUpdate: render });
          // Nyugodt indulás: a már látható t = 0 pózból a sebesség fut fel.
          gsap.fromTo(tl, { timeScale: 0 }, { timeScale: 1, duration: 1.6, ease: "power1.inOut" });

          // Belső teljesítmény-optimalizálás (nincs felhasználói vezérlő):
          // szünet, ha a Hero nem látszik vagy a lap rejtett.
          let inView = true;
          const sync = () => {
            if (inView && !document.hidden) tl.resume();
            else tl.pause();
          };
          const observer = new IntersectionObserver(([entry]) => {
            inView = entry.isIntersecting;
            sync();
          });
          observer.observe(stage);
          document.addEventListener("visibilitychange", sync);

          return () => {
            observer.disconnect();
            document.removeEventListener("visibilitychange", sync);
          };
        },
      );
    },
    { scope: stageRef },
  );

  return (
    <div
      ref={stageRef}
      aria-hidden="true"
      className="af-stage pointer-events-none absolute inset-0 overflow-hidden"
    >
      {RIGS.map(({ key, spec, className }) => {
        const start = START[key];
        return (
          <div key={key} data-rig={key} className={className}>
            <div
              className="af-rig"
              style={{ transform: `rotateY(${f(start.rigY)}deg) rotateX(${f(start.rigX)}deg)` }}
            >
              {spec.datum ? (
                <>
                  <span className="af-datum af-datum--h" />
                  <span className="af-datum af-datum--v af-datum--v1" />
                  <span className="af-datum af-datum--v af-datum--v2" />
                </>
              ) : null}
              {start.wings.map((wing) => (
                <div
                  key={wing.side}
                  className={`af-wing af-wing-${wing.side}`}
                  style={{ transform: `translate3d(0px, 0px, ${f(wing.z)}px)` }}
                >
                  {spec.planes.map((plane, i) => (
                    <div
                      key={i}
                      className={`af-plane${plane.contour ? " af-plane--contour" : ""}${
                        plane.accent ? " af-plane--accent" : ""
                      }`}
                      style={{ transform: `rotateY(${f(wing.angles[i])}deg)`, opacity: plane.alpha }}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
