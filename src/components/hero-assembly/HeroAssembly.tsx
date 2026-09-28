"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

import { hero, statusNotice } from "@/content/homepage";
import { ASSEMBLY, type AssemblyLayout, type MaterialKind } from "./config";
import EmblemFallback from "./EmblemFallback";
import type { AssemblyStage, StageTokens } from "./stage";

/**
 * HeroAssembly — Porcelain hero, görgetésre összeálló 3D JG-emblémával.
 *
 * Előnézet: /preview/hero-motion. A komponens önálló, a homepage-be
 * cserével beilleszthető (a Hero helyére), a szöveg a meglévő tartalmi
 * modellből (hero, statusNotice) jön — a copy, a CTA-cél és a jogi
 * státuszközlés karakterre azonos.
 *
 * MOZGÁS
 *   Egyetlen normalizált érték vezérli mindhárom elemet:
 *     position = lerp(széthúzott, összeállt, ease(progress / assembleAt))
 *   A progress a natív görgetési pozícióból jön (GSAP ScrollTrigger,
 *   rövid scrub-simítással). Megállított görgetésnél a mozgás is megáll,
 *   visszagörgetve ugyanazon az úton nyílik szét. Nincs loop, forgás,
 *   rugózás, morfolás vagy kameramozgás.
 *
 * ÜZEMMÓDOK (data-mode a szekción)
 *   pinned — desktop, ha a hero kifér a header alatti területre: a hero
 *            sticky, alatta egy üres pálya (track) adja a görgetési utat.
 *            A sticky + pálya natív CSS, ezért a rögzítés végén nincs ugrás
 *            és nincs üres rés; a wheel/touch események érintetlenek.
 *   inline — mobil, tablet, alacsony ablak: nincs rögzítés; az embléma
 *            akkor áll össze, amikor a színpad a viewport közepéig ér.
 *   static — prefers-reduced-motion vagy WebGL-hiba: összeállt, statikus
 *            embléma, extra görgetési szakasz nélkül.
 *   A pinned/inline döntést elsődlegesen a CSS hozza (media query-k, ld.
 *   globals.css); a JS csak a tényleges elrendezést olvassa ki, és ha a
 *   tartalom mégsem fér ki, data-fit="false"-szal kikapcsolja a rögzítést.
 */

type Mode = "pinned" | "inline" | "static";
type StageState = "loading" | "ready" | "fallback";

/**
 * A FŐCÍM ÉS AZ EMBLÉMA ANYAGAI.
 *
 * A H1 szövege karakterre a tartalmi modellből jön (hero.headlineLines); itt
 * csak kifejezésekre (pontra végződő mondatokra) tagolódik, a szóközök sima
 * szövegként maradnak közöttük. A kifejezések sorrendben a config.ts
 * `headline` listájában megadott emblémaelem anyagszínét viselik:
 * Biztonság. -> felső elem (ezüstszürke), Átláthatóság. -> bal elem
 * (porcelánfehér), Szakmai háttér. -> jobb elem (padlizsán). A finom
 * térhatást és a világos betűk olvashatóságát a .jg-headline-phrase CSS adja.
 */
type HeadlinePart = { text: string; tone?: MaterialKind };

function headlineParts(lines: readonly string[]): HeadlinePart[][] {
  let phrase = 0;
  return lines.map((line) =>
    line.split(/(?<=\.)/).flatMap((chunk) => {
      const lead = chunk.match(/^\s*/)?.[0] ?? "";
      const text = chunk.slice(lead.length);
      const parts: HeadlinePart[] = lead ? [{ text: lead }] : [];
      if (text) {
        const piece = ASSEMBLY.headline[phrase++];
        parts.push({ text, tone: piece ? ASSEMBLY.pieceMaterials[piece] : undefined });
      }
      return parts;
    }),
  );
}

/** A márkaszínek a globals.css tokenjeiből — a 3D anyagok nem tartalmaznak saját HEX-et. */
function readTokens(element: HTMLElement): StageTokens {
  const styles = getComputedStyle(element);
  const token = (name: string) => styles.getPropertyValue(name).trim();
  return {
    porcelain: token("--color-porcelain"),
    silver: token("--color-cool-silver"),
    aubergine: token("--color-aubergine"),
    ink: token("--color-ink"),
  };
}

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

export default function HeroAssembly() {
  const rootRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [stageState, setStageState] = useState<StageState>("loading");

  useEffect(() => {
    const root = rootRef.current;
    const pin = pinRef.current;
    const stageEl = stageRef.current;
    const host = hostRef.current;
    const track = trackRef.current;
    if (!root || !pin || !stageEl || !host || !track) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const wideQuery = window.matchMedia("(min-width: 1024px)");

    let disposed = false;
    let fallback = false;
    let stage: AssemblyStage | null = null;
    let gsapApi: typeof import("gsap").gsap | null = null;
    let triggerApi: typeof import("gsap/ScrollTrigger").ScrollTrigger | null = null;
    let tween: gsap.core.Tween | null = null;
    let mode: Mode = "static";
    let layout: AssemblyLayout = wideQuery.matches ? "wide" : "compact";
    let progress = 0;
    let ease: (t: number) => number = (t) => t;
    let resizeFrame = 0;
    let stageSize = "";

    const headerOffset = () =>
      parseFloat(getComputedStyle(root).getPropertyValue("--jg-header-h")) || 0;

    /** A normalizált görgetési előrehaladásból az összeállás mértéke (0..1). */
    const assemblyFor = (value: number) =>
      mode === "static" ? 1 : ease(clamp01(value / ASSEMBLY.scroll.assembleAt));

    function apply() {
      stage?.setAssembly(assemblyFor(progress));
    }

    /**
     * Desktopon csak akkor rögzítünk, ha a hero teljes tartalma (copy, CTA,
     * státuszközlés) kifér a header alatti területre. A pin doboz minimum
     * magassága mindkét állapotban ugyanaz, így a mérés nem függ attól, hogy
     * éppen rögzítve van-e.
     */
    function updateFit() {
      if (layout !== "wide") {
        root!.dataset.fit = "true";
        return;
      }
      const available = window.innerHeight - headerOffset();
      root!.dataset.fit = pin!.offsetHeight <= available + 1 ? "true" : "false";
    }

    function detectMode(): Mode {
      if (fallback || reduceMotion.matches) return "static";
      return getComputedStyle(track!).display !== "none" ? "pinned" : "inline";
    }

    /** Rögzítés nélküli pálya: a színpad középpontja a látható terület közepéig ér. */
    function inlineDistance() {
      const viewport = window.innerHeight;
      const header = headerOffset();
      const stageRect = stageEl!.getBoundingClientRect();
      const rootTop = root!.getBoundingClientRect().top + window.scrollY;
      const start = rootTop - header;
      const stageCenter = stageRect.top + window.scrollY + stageRect.height / 2;
      const target = header + (viewport - header) * ASSEMBLY.scroll.inlineTarget;
      const distance = stageCenter - target - start;
      return Math.min(
        ASSEMBLY.scroll.inlineMax * viewport,
        Math.max(ASSEMBLY.scroll.inlineMin * viewport, distance),
      );
    }

    function killTrigger() {
      tween?.scrollTrigger?.kill();
      tween?.kill();
      tween = null;
    }

    /** Pontosan EGY ScrollTrigger él; üzemmódváltáskor a régit megszüntetjük. */
    function buildTrigger() {
      killTrigger();
      if (!gsapApi || !triggerApi) return;
      if (mode === "static") {
        progress = 1;
        apply();
        return;
      }
      const proxy = { value: 0 };
      tween = gsapApi.to(proxy, {
        value: 1,
        ease: "none",
        scrollTrigger: {
          trigger: root,
          start: () => `top top+=${headerOffset()}`,
          end: () => (mode === "pinned" ? `+=${track!.offsetHeight}` : `+=${inlineDistance()}`),
          scrub: ASSEMBLY.scroll.scrub,
          invalidateOnRefresh: true,
        },
        onUpdate: () => {
          progress = proxy.value;
          apply();
        },
      });
      // Frissítés/visszatöltés görgetett állapotban: a kezdő érték a
      // tényleges görgetési pozíció, nem a széthúzott állapot.
      const current = tween.scrollTrigger?.progress ?? 0;
      tween.progress(current);
      progress = current;
      apply();
    }

    function setMode(next: Mode) {
      root!.dataset.mode = next;
      if (next === mode && tween) return;
      mode = next;
      buildTrigger();
    }

    /** A canvas méretezése — csak tényleges méret-, elrendezés- vagy DPR-változáskor. */
    function measureStage() {
      if (!stage) return;
      const rect = host!.getBoundingClientRect();
      const size = `${rect.width}x${rect.height}@${window.devicePixelRatio}:${layout}`;
      if (size === stageSize) return;
      stageSize = size;
      stage.resize(rect.width, rect.height, layout);
    }

    /**
     * Átméretezés / preferenciaváltás. A sima átméretezést a ScrollTrigger
     * maga kezeli (debounce-olt refresh); mi csak akkor frissítünk azonnal,
     * ha az elrendezés üzemmódja (rögzített / folyó / statikus) változott.
     */
    function relayout() {
      resizeFrame = 0;
      if (disposed) return;
      const previous = `${mode}|${root!.dataset.fit}`;
      layout = wideQuery.matches ? "wide" : "compact";
      updateFit();
      setMode(detectMode());
      measureStage();
      if (`${mode}|${root!.dataset.fit}` !== previous) triggerApi?.refresh();
    }

    function scheduleRelayout() {
      if (resizeFrame) return;
      resizeFrame = window.requestAnimationFrame(relayout);
    }

    function toFallback() {
      if (fallback) return;
      fallback = true;
      stage?.dispose();
      stage = null;
      root!.dataset.static = "true";
      setStageState("fallback");
      setMode("static");
      triggerApi?.refresh();
    }

    // Első, szinkron döntés: a CSS már a helyes elrendezést mutatja.
    updateFit();
    mode = detectMode();
    root.dataset.mode = mode;

    // A pin doboz (tartalom: betűtöltés, szövegnagyítás) és a színpad
    // méretváltozása egyaránt újraértékeli a rögzítést és a canvas méretét.
    const resizeObserver = new ResizeObserver(scheduleRelayout);
    resizeObserver.observe(pin);
    resizeObserver.observe(host);

    window.addEventListener("resize", scheduleRelayout);
    reduceMotion.addEventListener("change", scheduleRelayout);
    document.fonts?.ready.then(scheduleRelayout);

    Promise.all([import("gsap"), import("gsap/ScrollTrigger"), import("./stage")])
      .then(([gsapModule, triggerModule, stageModule]) => {
        if (disposed) return;
        gsapApi = gsapModule.gsap;
        triggerApi = triggerModule.ScrollTrigger;
        gsapApi.registerPlugin(triggerApi);
        triggerApi.config({ ignoreMobileResize: true });
        ease = gsapApi.parseEase(ASSEMBLY.scroll.ease);

        try {
          stage = stageModule.createAssemblyStage(host, readTokens(root), {
            onFirstFrame: () => {
              if (!disposed) setStageState("ready");
            },
            onContextLost: toFallback,
          });
        } catch {
          toFallback();
          return;
        }

        buildTrigger();
        measureStage();
      })
      .catch(() => {
        if (!disposed) toFallback();
      });

    // Ellenőrzési kapaszkodó (nem globális): a böngészős teszt innen olvassa
    // az üzemmódot, az előrehaladást és a ScrollTrigger-példányok számát.
    Object.defineProperty(root, "__assembly", {
      configurable: true,
      value: {
        get mode() {
          return mode;
        },
        get progress() {
          return progress;
        },
        get assembly() {
          return assemblyFor(progress);
        },
        get pieces() {
          return stage?.pieceCount ?? 0;
        },
        get renders() {
          return stage?.renderCount ?? 0;
        },
        /** Csak a hero saját ScrollTriggerei (az oldal más szekcióié nem). */
        get triggers() {
          return triggerApi?.getAll().filter((trigger) => trigger.trigger === root).length ?? 0;
        },
        get range() {
          const trigger = tween?.scrollTrigger;
          return trigger ? [trigger.start, trigger.end] : null;
        },
      },
    });

    return () => {
      disposed = true;
      if (resizeFrame) window.cancelAnimationFrame(resizeFrame);
      window.removeEventListener("resize", scheduleRelayout);
      reduceMotion.removeEventListener("change", scheduleRelayout);
      resizeObserver.disconnect();
      killTrigger();
      stage?.dispose();
      stage = null;
      delete (root as HTMLElement & { __assembly?: unknown }).__assembly;
    };
  }, []);

  const [eyebrowPrimary, eyebrowSecondary] = hero.eyebrowLines;

  return (
    <section
      ref={rootRef}
      id="top"
      aria-labelledby="hero-cim"
      data-assembly=""
      className="jg-assembly"
      style={{ "--jg-assembly-distance": ASSEMBLY.scroll.pinnedDistance } as CSSProperties}
    >
      <div ref={pinRef} className="jg-assembly__pin">
        <div className="jg-safe-x mx-auto flex w-full max-w-[1280px] flex-1 flex-col">
          <div className="grid flex-1 grid-cols-1 items-center gap-y-10 pt-12 pb-10 sm:pt-16 sm:pb-12 lg:grid-cols-12 lg:gap-x-10 lg:py-8">
            <div className="lg:col-span-6">
              <p className="flex flex-col items-start gap-2 text-[0.6875rem] font-semibold tracking-[0.22em] text-accent sm:text-xs lg:text-[0.8125rem]">
                <span className="flex items-center gap-3 whitespace-nowrap">
                  <span aria-hidden="true" className="block h-px w-6 bg-signal-berry/60 sm:w-8" />
                  {eyebrowPrimary}
                </span>
                <span className="block whitespace-nowrap text-text-secondary">
                  {eyebrowSecondary}
                </span>
              </p>

              <h1
                id="hero-cim"
                className="jg-assembly-headline font-display mt-7 max-w-[13ch] text-[clamp(2.625rem,11.5vw,3.5rem)] leading-[1.02] font-medium tracking-[-0.02em] [overflow-wrap:normal] hyphens-none text-text-primary sm:mt-8 sm:text-[clamp(3.5rem,8vw,4.5rem)] lg:mt-7 lg:text-[clamp(3.25rem,min(5.2vw,8.6svh),5.25rem)]"
              >
                {headlineParts(hero.headlineLines).map((parts, line) => (
                  <span key={line} className="block">
                    {parts.map((part, index) =>
                      part.tone ? (
                        <span key={index} className="jg-headline-phrase" data-tone={part.tone}>
                          {part.text}
                        </span>
                      ) : (
                        part.text
                      ),
                    )}
                  </span>
                ))}
              </h1>

              <p className="mt-7 max-w-[36ch] text-base leading-[1.7] text-pretty text-text-secondary sm:mt-8 sm:max-w-[44ch] sm:text-lg lg:mt-7 lg:text-[clamp(1.0625rem,min(1.35vw,2.3svh),1.25rem)]">
                {hero.intro}
              </p>

              <div className="mt-9 flex sm:mt-10 lg:mt-9">
                <a
                  href={hero.primaryCta.href}
                  className="jg-assembly-cta inline-flex min-h-14 w-full items-center justify-center rounded-md bg-accent px-10 text-center text-sm font-semibold tracking-[0.1em] text-white hover:-translate-y-px hover:bg-accent-hover sm:w-auto sm:text-[0.9375rem]"
                >
                  {hero.primaryCta.label}
                </a>
              </div>
            </div>

            {/*
              A színpad tisztán dekoratív: aria-hidden, pointer-events: none.
              A mérete CSS-ből jön (mobilon négyzetes arány, desktopon a sor
              teljes magassága), ezért a canvas betöltése nem okoz layout
              shiftet; a canvas első képkockája után áttűnéssel jelenik meg.
            */}
            <div
              ref={stageRef}
              data-state={stageState}
              aria-hidden="true"
              className="jg-assembly__stage relative mx-auto aspect-square w-full max-w-[32rem] lg:col-span-6 lg:aspect-auto lg:h-full lg:max-w-none lg:self-stretch"
            >
              <div ref={hostRef} className="jg-assembly__canvas-host absolute inset-0" />
              {stageState === "fallback" ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <EmblemFallback className="h-[54%] w-auto" />
                </div>
              ) : null}
              <noscript>
                <div className="absolute inset-0 flex items-center justify-center">
                  <EmblemFallback className="h-[54%] w-auto" />
                </div>
              </noscript>
            </div>
          </div>

          {/*
            STÁTUSZKÖZLÉS — a jogi hierarchia első szintje, a Heróval azonos
            szöveggel. Rögzített állapotban is végig látható.
          */}
          <div className="border-t border-border pt-6 pb-8 sm:pb-9 lg:pt-5 lg:pb-6">
            <p className="max-w-4xl text-[0.9375rem] leading-relaxed text-text-secondary sm:text-base">
              {statusNotice.body}
            </p>
          </div>
        </div>
      </div>

      {/* Görgetési pálya a rögzített változathoz — üres, dekoratív. */}
      <div ref={trackRef} aria-hidden="true" className="jg-assembly__track" />
    </section>
  );
}
