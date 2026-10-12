"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

import { ramped } from "../motion/curves";
import { LAYERS, type LayersLayout } from "./layers-config";
import type { LayersStage, LayersTokens } from "./layers-stage";

type State = "static" | "loading" | "ready";

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

/**
 * SavingsLayers — a „Megtakarítási és adózási lehetőségek" blokk képmezője:
 * a referencia állóképe fölött egy görgetéshez kötött 3D-jelenet, amelyben a
 * négy réteg a képmező viewporton való áthaladása közben rendezett,
 * egymás fölötti kompozícióba közelít.
 *
 * MOZGÁS — egyetlen normalizált progress (GSAP ScrollTrigger, rövid scrub):
 *   start: a képmező teteje a viewport `scroll.start` részénél (≈ 88%);
 *   end:   a képmező KÖZEPE a sticky header alatti terület `scroll.end`
 *          részénél (≈ a viewport 37%-a); a header tényleges magasságával.
 *   A görbe ramped(): rövid lágy indulás és érkezés, hosszú egyenletes közép;
 *   az összeállás a pálya végén teljes. Nincs pin és nincs extra pálya, a
 *   blokk a többi szolgáltatási képpel azonos módon gördül; a képlap teljes
 *   parallax-elmozdulása itt NINCS (a belső mozgás váltja fel).
 *
 * BETÖLTÉS ÉS FALLBACK
 *   – a jelenet csak a viewport közelében inicializálódik (IntersectionObserver),
 *     a Three.js és a GSAP dinamikus importtal jön;
 *   – a statikus referenciakép (children) az első sikeres 3D-képkockáig
 *     látszik, utána a canvas lágyan fölé tűnik — a kép a DOM-ban marad;
 *   – reduced motion: a jelenet létre sem jön; JS nélkül, WebGL-hiba vagy
 *     context loss esetén a referenciakép látszik;
 *   – a canvas dekoratív (aria-hidden, nem fókuszálható); a cím és a szöveg
 *     a blokk valódi HTML-je, amelyet a betöltés nem érint.
 */
export default function SavingsLayers({ children }: { children: ReactNode }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<State>("static");

  useEffect(() => {
    const wrap = wrapRef.current;
    const host = hostRef.current;
    if (!wrap || !host) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const wideQuery = window.matchMedia("(min-width: 1024px)");
    const media = (wrap.closest("[data-showcase-media]") as HTMLElement | null) ?? wrap;

    let disposed = false;
    let started = false;
    let stage: LayersStage | null = null;
    let tween: gsap.core.Tween | null = null;
    let resizeObserver: ResizeObserver | null = null;
    let progress = 0;
    let size = "";

    const layoutNow = (): LayersLayout => (wideQuery.matches ? "wide" : "compact");
    const headerBottom = () =>
      document.querySelector(".jg-header")?.firstElementChild?.getBoundingClientRect().bottom ?? 72;

    function measure() {
      if (!stage) return;
      const rect = wrap!.getBoundingClientRect();
      const next = `${rect.width}x${rect.height}@${window.devicePixelRatio}:${layoutNow()}`;
      if (next === size) return;
      size = next;
      stage.resize(rect.width, rect.height, layoutNow());
    }

    function apply() {
      stage?.setProgress(ramped(clamp01(progress), LAYERS.scroll.ramp));
    }

    function teardown(nextState: State) {
      tween?.scrollTrigger?.kill();
      tween?.kill();
      tween = null;
      resizeObserver?.disconnect();
      resizeObserver = null;
      stage?.dispose();
      stage = null;
      size = "";
      if (!disposed) setState(nextState);
    }

    function start() {
      if (started || disposed || reduceMotion.matches) return;
      started = true;
      setState("loading");
      Promise.all([import("gsap"), import("gsap/ScrollTrigger"), import("./layers-stage")])
        .then(([gsapModule, triggerModule, stageModule]) => {
          if (disposed) return;
          const gsap = gsapModule.gsap;
          const ScrollTrigger = triggerModule.ScrollTrigger;
          gsap.registerPlugin(ScrollTrigger);

          const styles = getComputedStyle(document.documentElement);
          const token = (name: string) => styles.getPropertyValue(name).trim();
          const tokens: LayersTokens = {
            porcelain: token("--color-porcelain"),
            silver: token("--color-cool-silver"),
            plum: token("--color-muted-plum"),
            aubergine: token("--color-aubergine"),
            ink: token("--color-ink"),
          };
          try {
            stage = stageModule.createLayersStage(host!, tokens, {
              onFirstFrame: () => {
                if (!disposed) setState("ready");
              },
              onContextLost: () => teardown("static"),
            });
          } catch {
            teardown("static");
            return;
          }

          measure();
          resizeObserver = new ResizeObserver(measure);
          resizeObserver.observe(wrap!);

          const proxy = { value: 0 };
          tween = gsap.to(proxy, {
            value: 1,
            ease: "none",
            scrollTrigger: {
              trigger: media,
              start: `top ${LAYERS.scroll.start * 100}%`,
              // a képmező közepe a header alatti látható terület adott részén
              end: () => {
                const header = headerBottom();
                return `center top+=${Math.round(header + (window.innerHeight - header) * LAYERS.scroll.end)}`;
              },
              scrub: LAYERS.scroll.scrub,
            },
            onUpdate: () => {
              progress = proxy.value;
              apply();
            },
          });
          const current = tween.scrollTrigger?.progress ?? 0;
          tween.progress(current);
          progress = current;
          apply();
        })
        .catch(() => teardown("static"));
    }

    // Csak a viewport közelében indul (egy viewportnyi előtöltéssel).
    const nearby = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          nearby.disconnect();
          start();
        }
      },
      { rootMargin: "100% 0px" },
    );
    if (!reduceMotion.matches) nearby.observe(media);

    // Ha a felhasználó futás közben kapcsolja be a reduced motiont: állókép.
    const onMotionChange = () => {
      if (reduceMotion.matches) {
        nearby.disconnect();
        teardown("static");
      }
    };
    reduceMotion.addEventListener("change", onMotionChange);

    Object.defineProperty(wrap, "__layers", {
      configurable: true,
      value: {
        get progress() {
          return progress;
        },
        get assembly() {
          return ramped(clamp01(progress), LAYERS.scroll.ramp);
        },
        get renders() {
          return stage?.renderCount ?? 0;
        },
        get slabs() {
          return stage?.slabCount ?? 0;
        },
        get range() {
          const trigger = tween?.scrollTrigger;
          return trigger ? [trigger.start, trigger.end] : null;
        },
        get active() {
          return Boolean(stage);
        },
      },
    });

    return () => {
      disposed = true;
      nearby.disconnect();
      reduceMotion.removeEventListener("change", onMotionChange);
      teardown("static");
      delete (wrap as HTMLElement & { __layers?: unknown }).__layers;
    };
  }, []);

  return (
    <div ref={wrapRef} data-layers={state} className="relative overflow-hidden rounded-card">
      {children}
      <div
        ref={hostRef}
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 transition-opacity duration-500 ${
          state === "ready" ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
}
