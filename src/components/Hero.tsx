import HeroMotion from "./hero-motion/HeroMotion";
import { hero, heroRiskWarning, statusNotice } from "@/content/homepage";

/**
 * Hero — a SOT 1. szakasza, v0.2 vizuális rendszerben.
 *
 * Elrendezés:
 *  - desktopon aszimmetrikus, egyetlen összefüggő kompozíció: bal oldalon a
 *    szöveg és a CTA-k, jobb oldalon a Continuous Market Journey motion
 *    world. A vizuális világ nem kártyaként/widgetként van bekeretezve —
 *    közvetlenül a canvas háttéren, egy nagyon finom atmoszférikus
 *    háttérfénnyel oldva bele a kompozícióba;
 *  - mobilon a dokumentumsorrend adja a sorrendet: szöveg → CTA-k → animáció.
 *
 * A szöveganimáció tisztán CSS: a keyframe `both` kitöltéssel zárul, egyszer
 * fut le, és JavaScript nem vesz részt a láthatóságában — a HeroMotion saját
 * JS-orchestrátora ettől függetlenül, külön fut (ld. hero-motion/orchestrator.ts).
 */
export default function Hero() {
  const [firstLine, secondLine] = hero.headlineLines;
  const [beforeHighlight, afterHighlight] = secondLine.split(
    hero.headlineHighlight,
  );

  return (
    <section id="top" aria-labelledby="hero-cim" className="bg-canvas">
      <div className="mx-auto w-full max-w-6xl px-5 pt-14 pb-14 sm:px-6 sm:pt-20 lg:px-8 lg:pt-24 lg:pb-20">
        <div className="grid items-center gap-12 lg:grid-cols-[46fr_54fr] lg:gap-8">
          {/* Szövegoszlop */}
          <div className="min-w-0">
            <p className="jg-reveal jg-reveal-1 text-sm font-medium tracking-[0.04em] text-text-secondary sm:text-base">
              {hero.eyebrow}
            </p>

            <h1
              id="hero-cim"
              /*
                A clamp megakadályozza, hogy a főcím 320 px-en egyetlen szavas
                sorokra essen szét („Közvetlen" / „kapcsolat").
              */
              className="font-display mt-5 text-[clamp(1.625rem,7vw,2rem)] leading-[1.18] text-balance text-text-primary sm:text-[2.75rem] lg:text-[3.25rem]"
            >
              <span className="jg-reveal jg-reveal-1 block">{firstLine}</span>
              <span className="jg-reveal jg-reveal-2 mt-1 block">
                {beforeHighlight}
                {/* Egyetlen, kontrollált Aubergine kiemelés. */}
                <span className="text-accent">{hero.headlineHighlight}</span>
                {afterHighlight}
              </span>
            </h1>

            <p className="jg-reveal jg-reveal-3 mt-6 max-w-xl text-base leading-relaxed text-text-secondary sm:text-[1.0625rem]">
              {hero.intro}
            </p>

            {/* A CTA-k stabilan láthatók: nem kapnak elrejtő kiindulóállapotot. */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <a
                href={hero.primaryCta.href}
                className="inline-flex min-h-12 items-center justify-center rounded-md bg-accent px-6 text-base font-medium text-white transition-colors hover:bg-accent-hover"
              >
                {hero.primaryCta.label}
              </a>
              <a
                href={hero.secondaryCta.href}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex min-h-12 items-center justify-center rounded-md border border-border-strong bg-transparent px-6 text-center text-base font-medium text-text-primary transition-colors hover:border-ink"
              >
                {hero.secondaryCta.label}
                <span className="sr-only"> (új lapon nyílik meg)</span>
              </a>
            </div>
          </div>

          {/* Motion world — mobilon a szöveg és a CTA-k után következik. */}
          <div className="min-w-0">
            <HeroMotion />
          </div>
        </div>

        {/* KÖTELEZŐ STÁTUSZKÖZLÉS — a Hero közvetlen közelében. */}
        <div className="mt-12 grid gap-4 sm:mt-14 md:grid-cols-2">
          <div className="rounded-card border border-border bg-surface p-5">
            <p className="text-xs font-medium tracking-[0.14em] text-text-secondary uppercase">
              {statusNotice.label}
            </p>
            <p className="mt-2 text-base leading-relaxed text-text-primary sm:text-[1.0625rem]">
              {statusNotice.body}
            </p>
          </div>

          {/*
            KIEMELT KOCKÁZATI FIGYELMEZTETÉS.
            Mindig látható: nincs accordionban, tooltipben vagy modalban, és nem
            elrejthető. Betűmérete nem kisebb a környező törzsszövegnél; az
            Aubergine jelzővonal és a félkövér szöveg adja a nagyobb hangsúlyt
            a v0.1 teljes sötét blokkja helyett.
          */}
          <div className="rounded-card border border-border border-l-[3px] border-l-accent bg-surface p-5">
            <p className="text-xs font-semibold tracking-[0.14em] text-accent uppercase">
              {heroRiskWarning.label}
            </p>
            <p className="mt-2 text-base leading-relaxed font-medium text-text-primary sm:text-[1.0625rem]">
              {heroRiskWarning.body}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
