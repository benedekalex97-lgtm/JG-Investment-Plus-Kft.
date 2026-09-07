import HeroMotion from "./HeroMotion";
import { hero, heroRiskWarning, statusNotice } from "@/content/homepage";

/**
 * Hero — a SOT 1. szakasza.
 *
 * Elrendezés:
 *  - desktopon kb. 48/52 arányú, egyetlen összefüggő kompozíció: bal oldalon a
 *    szöveg és a CTA-k, jobb oldalon a mozgó figura és a gyertyák. Az animáció
 *    külön rácsoszlopban áll, nem kerül a szöveg mögé;
 *  - mobilon a dokumentumsorrend adja a sorrendet: szöveg → CTA-k → animáció.
 *
 * A szöveganimáció tisztán CSS: a keyframe `both` kitöltéssel zárul, egyszer fut
 * le, és JavaScript nem vesz részt a láthatóságában.
 */
export default function Hero() {
  const [firstLine, secondLine] = hero.headlineLines;
  const [beforeHighlight, afterHighlight] = secondLine.split(
    hero.headlineHighlight,
  );

  return (
    <section
      id="top"
      aria-labelledby="hero-cim"
      className="border-b border-silver/50 bg-gradient-to-b from-ice to-paper"
    >
      <div className="mx-auto w-full max-w-6xl px-4 pt-10 pb-12 sm:px-6 sm:pt-14 lg:px-8 lg:pt-20 lg:pb-16">
        <div className="grid items-center gap-10 lg:grid-cols-[48fr_52fr] lg:gap-10">
          {/* Szövegoszlop */}
          <div className="min-w-0">
            <p className="jg-reveal jg-reveal-1 text-sm font-semibold tracking-wide text-steel sm:text-base">
              {hero.eyebrow}
            </p>

            <h1
              id="hero-cim"
              /*
                A clamp megakadályozza, hogy a főcím 320 px-en egyetlen szavas
                sorokra essen szét („Közvetlen" / „kapcsolat").
              */
              className="mt-4 text-[clamp(1.375rem,6.9vw,1.75rem)] leading-[1.15] font-semibold tracking-tight text-balance text-graphite sm:text-4xl lg:text-[2.75rem]"
            >
              <span className="jg-reveal jg-reveal-1 block">{firstLine}</span>
              <span className="jg-reveal jg-reveal-2 mt-1 block">
                {beforeHighlight}
                {/* Egyetlen, kontrollált Action Blue kiemelés. */}
                <span className="text-action">{hero.headlineHighlight}</span>
                {afterHighlight}
              </span>
            </h1>

            <p className="jg-reveal jg-reveal-3 mt-5 max-w-xl text-base leading-relaxed text-steel sm:text-[1.0625rem]">
              {hero.intro}
            </p>

            {/* A CTA-k stabilan láthatók: nem kapnak elrejtő kiindulóállapotot. */}
            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <a
                href={hero.primaryCta.href}
                className="inline-flex min-h-12 items-center justify-center rounded-lg bg-action px-6 text-base font-semibold text-paper transition-colors hover:bg-graphite"
              >
                {hero.primaryCta.label}
              </a>
              <a
                href={hero.secondaryCta.href}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex min-h-12 items-center justify-center rounded-lg border border-graphite/25 bg-paper px-6 text-center text-base font-semibold text-graphite transition-colors hover:border-graphite hover:bg-ice"
              >
                {hero.secondaryCta.label}
                <span className="sr-only"> (új lapon nyílik meg)</span>
              </a>
            </div>
          </div>

          {/* Mozgásoszlop — mobilon a szöveg és a CTA-k után következik. */}
          <div className="min-w-0">
            <div className="mx-auto w-full max-w-[28rem] lg:max-w-none">
              <HeroMotion />
            </div>
          </div>
        </div>

        {/* KÖTELEZŐ STÁTUSZKÖZLÉS — a Hero közvetlen közelében. */}
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          <div className="rounded-card border border-silver bg-paper p-5">
            <p className="text-xs font-bold tracking-widest text-steel uppercase">
              {statusNotice.label}
            </p>
            <p className="mt-2 text-base leading-relaxed text-graphite sm:text-[1.0625rem]">
              {statusNotice.body}
            </p>
          </div>

          {/*
            KIEMELT KOCKÁZATI FIGYELMEZTETÉS.
            Mindig látható: nincs accordionban, tooltipben vagy modalban, és nem
            elrejthető. Betűmérete nem kisebb a környező törzsszövegnél.
          */}
          <div className="rounded-card border-2 border-graphite bg-graphite p-5">
            <p className="text-xs font-bold tracking-widest text-silver uppercase">
              {heroRiskWarning.label}
            </p>
            <p className="mt-2 text-base leading-relaxed font-medium text-paper sm:text-[1.0625rem]">
              {heroRiskWarning.body}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
