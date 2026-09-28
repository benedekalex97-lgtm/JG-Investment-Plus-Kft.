"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Hangolás egy helyen. A hero marad az oldal legerősebb mozgó eleme: itt
 * csak rövid, egyszeri belépés és desktopon egy alig észrevehető,
 * görgetéshez kötött képelmozdulás van — nincs pin, lebegés, zoom vagy
 * pattogás, és a képen belüli tárgyak nem mozognak (a kép állókép).
 */
const MOTION = {
  enter: {
    /** Függőleges belépési elmozdulás (px). */
    distance: { wide: 20, compact: 16 },
    /** Belépési idő (s) — a Reveal.tsx 620 ms-ával azonos ritmus. */
    duration: 0.62,
    /** power2.out ≈ cubic-bezier(0.215, 0.61, 0.355, 1), a Reveal görbéje. */
    ease: "power2.out",
    /** A blokk második eleme ennyivel később indul (s). */
    offset: 0.1,
    /** A belépés akkor indul, amikor az elem teteje a viewport ezen arányához ér. */
    line: 0.9,
  },
  /** Desktop: a kép ±16 px-t mozdul (32 px teljes út), torzítás és vágás nélkül. */
  shift: { distance: 16, scrub: 0.4 },
} as const;

const WIDE = "(min-width: 1024px) and (prefers-reduced-motion: no-preference)";
const COMPACT = "(max-width: 1023.98px) and (prefers-reduced-motion: no-preference)";

type Gsap = typeof import("gsap").gsap;
type Trigger = typeof import("gsap/ScrollTrigger").ScrollTrigger;

/**
 * ShowcaseMotion — a szolgáltatási kép–szöveg blokkok mozgása, a már
 * bevezetett GSAP + ScrollTrigger párossal (ugyanaz a dinamikusan betöltött
 * modul, mint a heróé; új könyvtár nincs).
 *
 *   – Belépés: opacity + kis függőleges elmozdulás, blokkonként EGYSZER.
 *     Desktopon a kép és a szöveg egy közös idővonalon, 100 ms eltolással
 *     lép be (a blokk teteje a kép teteje, ezért a kép indul előbb); mobilon,
 *     ahol a kép a szöveg ALATT van, mindkettő a saját helyén, amikor odaér.
 *   – Desktopon a teljes kép (a lekerekített lap egésze) enyhén, görgetéshez
 *     kötötten elmozdul. Transformot kap, tehát nincs layout shift, és a
 *     rács 112 px-es sorköze bőven elnyeli a ±16 px-t.
 *   – Mobilon nincs parallax: az olvashatóság és a gördülékenység az első.
 *
 * Biztonság:
 *   – a rejtett kiindulóállapotot KIZÁRÓLAG a script állítja be, a
 *     szerveroldali HTML-ben nincs: JavaScript vagy GSAP nélkül minden
 *     azonnal látszik; ha a beállítás hibára fut, minden visszaáll;
 *   – csak az kap belépést, ami még teljesen a viewport alatt van: ami már
 *     látszik (horgonyugrás, újratöltés), az nem tűnik el és nem villan;
 *   – a trigger vége a görgethető tartomány vége ("max"), így egy gyors
 *     görgetés vagy horgonyugrás, ami átugorja a blokkot, is lejátssza a
 *     belépést — semmi sem ragadhat rejtve (ld. a Reveal.tsx indoklását);
 *   – prefers-reduced-motion: egyik feltétel sem teljesül, semmi sem indul;
 *     ha a beállítás futás közben vált, a gsap.matchMedia mindent visszaállít;
 *   – lebontáskor (és StrictMode kettős mountnál) minden tween, trigger és
 *     inline stílus visszaáll.
 */
export default function ShowcaseMotion({
  className = "",
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    let disposed = false;
    let revert: (() => void) | null = null;

    Promise.all([import("gsap"), import("gsap/ScrollTrigger")])
      .then(([gsapModule, triggerModule]) => {
        if (disposed) return;
        const gsap = gsapModule.gsap;
        const ScrollTrigger = triggerModule.ScrollTrigger;
        gsap.registerPlugin(ScrollTrigger);

        const mm = gsap.matchMedia();
        revert = () => mm.revert();
        try {
          mm.add({ wide: WIDE, compact: COMPACT }, (context) => {
            const { wide, compact } = context.conditions ?? {};
            if (wide || compact) choreograph(gsap, ScrollTrigger, root, Boolean(wide));
          });
        } catch {
          mm.revert();
        }
      })
      .catch(() => {
        // GSAP nélkül a blokkok egyszerűen statikusak — és láthatók.
      });

    return () => {
      disposed = true;
      revert?.();
    };
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

function choreograph(gsap: Gsap, ScrollTrigger: Trigger, root: HTMLElement, wide: boolean) {
  const { enter, shift } = MOTION;
  const distance = wide ? enter.distance.wide : enter.distance.compact;

  /** A trigger-elemek maguk sosem kapnak transformot, így a mérés pontos. */
  function reveal(trigger: Element, targets: Element[]) {
    if (trigger.getBoundingClientRect().top < window.innerHeight) return;
    const timeline = gsap.timeline({
      paused: true,
      defaults: { duration: enter.duration, ease: enter.ease },
    });
    targets.forEach((target, index) => {
      timeline.from(target, { opacity: 0, y: distance }, index * enter.offset);
    });
    ScrollTrigger.create({
      trigger,
      start: `top ${enter.line * 100}%`,
      end: "max",
      onEnter: (self) => {
        timeline.play();
        self.kill();
      },
    });
  }

  for (const block of root.querySelectorAll<HTMLElement>("[data-showcase-block]")) {
    const text = block.querySelector("[data-showcase-text]");
    const media = block.querySelector("[data-showcase-media]");
    const textReveal = text?.querySelector("[data-showcase-reveal]");
    const mediaReveal = media?.querySelector("[data-showcase-reveal]");
    const image = media?.querySelector("[data-showcase-shift]");
    if (!text || !media || !textReveal || !mediaReveal || !image) continue;

    if (!wide) {
      reveal(text, [textReveal]);
      reveal(media, [mediaReveal]);
      continue;
    }

    reveal(block, [mediaReveal, textReveal]);
    // A kép egy hajszállal lassabban halad, mint a szöveg: belépéskor 16 px-lel
    // feljebb, kilépéskor 16 px-lel lejjebb áll, középen pontosan a helyén.
    gsap.fromTo(
      image,
      { y: -shift.distance },
      {
        y: shift.distance,
        ease: "none",
        scrollTrigger: {
          trigger: block,
          start: "top bottom",
          end: "bottom top",
          scrub: shift.scrub,
        },
      },
    );
  }
}
