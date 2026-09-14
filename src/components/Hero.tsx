import HeroVisual from "./hero-visual/HeroVisual";
import { hero, heroRiskWarning, statusNotice } from "@/content/homepage";

/**
 * Hero — a SOT 1. szakasza, v0.3: teljesen statikus.
 *
 * Elrendezés:
 *  - desktopon aszimmetrikus, egyetlen összefüggő kompozíció: bal oldalon a
 *    szöveg és a CTA-k, jobb oldalon a statikus vizuális kompozíció. A
 *    vizuális elem nem kártyaként/widgetként van bekeretezve — közvetlenül a
 *    canvas háttéren, egy nagyon finom atmoszférikus háttérfénnyel oldva
 *    bele a kompozícióba;
 *  - mobilon a dokumentumsorrend adja a sorrendet: szöveg → CTA-k → statikus
 *    kompozíció.
 *
 * v0.2-ben itt egy folyamatosan futó Hero-mozgásrendszer élt (futó/sétáló
 * figura, emelkedő/süllyedő gyertyák, parallax, kamerakövetés). Ez v0.3-ban
 * teljes egészében megszűnt — nincs `requestAnimationFrame`-hurok, nincs
 * scroll-hoz kötött mozgás, és nincs a tartalom láthatóságát késleltető
 * szöveg-reveal animáció sem: a Hero betöltés után AZONNAL, teljes egészében
 * látható, minden módban (reduced-motion-tól függetlenül is) statikus.
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
          {/* Szövegoszlop — azonnal, teljes egészében látható. */}
          <div className="min-w-0">
            <p className="text-sm font-medium tracking-[0.04em] text-text-secondary sm:text-base">
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
              <span className="block">{firstLine}</span>
              <span className="mt-1 block">
                {beforeHighlight}
                {/* Egyetlen, kontrollált Aubergine kiemelés. */}
                <span className="text-accent">{hero.headlineHighlight}</span>
                {afterHighlight}
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-relaxed text-text-secondary sm:text-[1.0625rem]">
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

          {/* Statikus vizuális kompozíció — mobilon a szöveg és a CTA-k után
              következik. */}
          <div className="min-w-0">
            <HeroVisual />
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
