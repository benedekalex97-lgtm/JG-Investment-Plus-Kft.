import HeroEmblem from "@/components/hero-intro/HeroEmblem";
import { hero, statusNotice } from "@/content/homepage";

/**
 * Hero — v1.6 PREVIEW: tipográfia-vezérelt copy + különálló, térbeli
 * JG-embléma hero-illusztráció (JG_hero_3D_alap_v01 rétegképek).
 *
 * Előzmények: v0.6–v1.5 között itt absztrakt japángyertya-háttér élt (előbb
 * Canvas-animáció, v1.5.2-től statikus gyertyakorridor-kép). A v1.6 ezt a
 * háttérképet NEM tölti be többé: a hero vizuális eleme a térbeli embléma.
 * A HeroMarketMotion komponens és a korridorkép a repositoryban marad.
 *
 * A fejléc lapos logója VÁLTOZATLAN; az embléma külön, dekoratív illusztráció
 * (aria-hidden), nem a márkajel helyettesítője.
 *
 * Elrendezés:
 *   – desktop (≥1024 px): kétoszlopos — balra a copy és a CTA, jobbra az
 *     embléma;
 *   – mobil és tablet: középre rendezett copy, alatta a CTA, a CTA alatt
 *     az embléma, legalul a státuszközlés.
 * Az embléma helye és képaránya előre le van foglalva (ld. HeroEmblem).
 *
 * Nyitóanimáció (ld. hero-intro/introScript.ts): a [data-intro-reveal]
 * elemek a nyitás végén tűnnek elő. JS nélkül, reduced-motionnél, mély-
 * hivatkozásnál és ismételt látogatásnál a hero azonnal, statikusan látszik —
 * a szöveg és a CTA soha nem függ a scripttől.
 *
 * Rétegek alulról: Deep alapfelület → hero-vignette → hero-veil
 * (kontrasztvédő) → copy, CTA és embléma. A háttérrétegek dekoratívak:
 * aria-hidden és pointer-events: none.
 */

/**
 * Egy főcímsort három részre bont a kiemelt szó mentén. A főcím SZÖVEGE nem
 * változik: a markup kizárólag azért tagolódik, hogy a hero.headlineHighlight
 * által megjelölt szó (jelenleg: „Átláthatóság.") önálló Signal Berry
 * kiemelést kaphasson.
 */
function splitHeadlineLine(line: string, highlight: string) {
  const at = line.indexOf(highlight);
  if (at === -1 || highlight.length === 0) {
    return { before: line, highlighted: "", after: "" };
  }
  return {
    before: line.slice(0, at),
    highlighted: highlight,
    after: line.slice(at + highlight.length),
  };
}

/** Egyetlen főcímsor, a kiemelt szóval Signal Berry színben. */
function HeadlineLine({ line }: { line: string }) {
  const { before, highlighted, after } = splitHeadlineLine(line, hero.headlineHighlight);
  return (
    <span className="block">
      {before}
      {highlighted ? (
        <span className="text-signal-berry-light">{highlighted}</span>
      ) : null}
      {after}
    </span>
  );
}

export default function Hero() {
  const [firstLine, secondLine] = hero.headlineLines;
  const [eyebrowPrimary, eyebrowSecondary] = hero.eyebrowLines;

  return (
    <section
      id="top"
      aria-labelledby="hero-cim"
      className="on-dark relative overflow-hidden bg-surface-deep"
    >
      <div aria-hidden="true" className="absolute inset-0 bg-surface-deep" />
      <div aria-hidden="true" className="hero-vignette pointer-events-none absolute inset-0" />
      <div aria-hidden="true" className="hero-veil pointer-events-none absolute inset-0" />

      <div className="hero-content jg-safe-x relative z-10 mx-auto flex w-full max-w-[1280px] flex-col">
        <div className="hero-layout">
          <div
            data-hero-copy=""
            className="flex w-full flex-col items-center text-center lg:items-start lg:text-left"
          >
            {/* Az eyebrow pontosan két, tudatos sor (v1.5.3). */}
            <p
              data-hero-ink=""
              data-intro-reveal=""
              className="flex flex-col items-center gap-2 text-[0.6875rem] font-semibold tracking-[0.22em] text-cool-silver sm:text-xs lg:items-start lg:text-[0.8125rem]"
            >
              <span className="flex items-center gap-3 whitespace-nowrap">
                <span aria-hidden="true" className="block h-px w-6 bg-signal-berry-light/60 sm:w-8" />
                {eyebrowPrimary}
                <span aria-hidden="true" className="block h-px w-6 bg-signal-berry-light/60 sm:w-8 lg:hidden" />
              </span>
              <span className="block whitespace-nowrap">{eyebrowSecondary}</span>
            </p>

            {/*
              Főcím — „Biztonság. Átláthatóság. Szakmai háttér." Porcelain
              alapszín; egyetlen szó Signal Berry kiemelést kap (5.82:1, AA).
              Desktopon a copy-oszlop keskenyebb, ezért a méret kisebb.
            */}
            <h1
              id="hero-cim"
              data-hero-ink=""
              data-intro-reveal=""
              className="font-display mx-auto mt-7 max-w-[15ch] text-[clamp(2.75rem,12vw,3.5rem)] leading-[1.03] font-medium tracking-[-0.018em] [overflow-wrap:normal] hyphens-none text-balance text-porcelain outline-none sm:mt-8 sm:max-w-[16ch] md:text-[clamp(3.75rem,7vw,5rem)] lg:mx-0 lg:max-w-[14ch] lg:text-[clamp(3.75rem,5.2vw,5rem)]"
            >
              <HeadlineLine line={firstLine} />
              <HeadlineLine line={secondLine} />
            </h1>

            <p
              data-hero-ink=""
              data-intro-reveal=""
              className="mx-auto mt-7 max-w-[34ch] text-base leading-[1.72] text-cool-silver text-pretty sm:mt-8 sm:max-w-[58ch] sm:text-lg lg:mx-0 lg:max-w-[34rem] lg:text-xl"
            >
              {hero.intro}
            </p>

            {/* Egyetlen hero-CTA — semleges Porcelain felület, Ink felirat (13,56:1, AAA). */}
            <div
              data-intro-reveal=""
              className="mt-9 flex w-full max-w-sm flex-col items-stretch sm:mt-10 sm:max-w-none sm:flex-row sm:justify-center lg:justify-start"
            >
              <a
                href={hero.primaryCta.href}
                data-hero-ink=""
                className="hero-cta-primary inline-flex min-h-14 items-center justify-center rounded-md bg-porcelain px-10 text-center text-sm font-semibold tracking-[0.1em] text-ink hover:-translate-y-px hover:bg-white sm:text-[0.9375rem]"
              >
                {hero.primaryCta.label}
              </a>
            </div>
          </div>

          <HeroEmblem />
        </div>

        {/* Státuszközlés — mindig látható, 15/16 px, Cool Silver Deep-en (AAA). */}
        <div data-intro-reveal="" className="border-t border-white/12 pb-12 pt-7 sm:pb-14 lg:pb-16">
          <p className="max-w-4xl text-[0.9375rem] leading-relaxed text-cool-silver sm:text-base">
            {statusNotice.body}
          </p>
        </div>
      </div>
    </section>
  );
}
