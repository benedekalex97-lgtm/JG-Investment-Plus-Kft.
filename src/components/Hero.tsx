import { hero, heroRiskWarning, statusNotice } from "@/content/homepage";

/**
 * Hero — a SOT 1. szakasza, v0.5: középre rendezett, animációra előkészített
 * kompozíció.
 *
 * v0.1–v0.3-ban itt egy jobb oldali vizuális elem élt (előbb mozgó, majd
 * statikus figura + japángyertya-kompozíció), v0.4-ben pedig egy balra
 * igazított, egyoszlopos szövegblokk. v0.5-ben a copy vízszintesen és
 * (nagyjából, 2–4vh-val a geometriai közép fölé tolva) függőlegesen is
 * középre kerül, és a Hero négy rétegre tagolódik alulról:
 *
 *   1) Porcelain háttér (teljes Hero-szélesség)
 *   2) üres animation-mount — pointer-events: none, aria-hidden, jelenleg
 *      tartalom nélkül; KÉSŐBBI Rive-/canvas-/SVG-animáció fogadására
 *      készül elő, ebben a körben nem kap semmilyen mozgást vagy figurát
 *   3) .hero-veil kontrasztfátyol (ld. globals.css) — lágy, szél nélküli
 *      Porcelain gradient a copy és a jövőbeli animáció között
 *   4) a valódi HTML copy és a CTA-k, illetve alattuk, már a középre
 *      rendezett "stage"-en kívül, külön sávban a kötelező státuszközlés és
 *      kockázati figyelmeztetés
 *
 * A függőleges eltolás ("2–4vh a közép fölött") szándékosan NEM
 * transform/translate-tel készül, hanem a stage aszimmetrikus felső/alsó
 * paddingjével: ez ugyanazt a vizuális hatást adja, de rövid viewportokon
 * (pl. 320×568) sosem vághatja le a tartalmat, mert a padding-különbség
 * legfeljebb kevesebb üres teret hagy, sosem tolja a copyt a doboz határán
 * kívülre — szemben egy transformmal, ami egy overflow-hidden szülőn belül
 * ezt megtehetné.
 */
export default function Hero() {
  const [firstLine, secondLine] = hero.headlineLines;

  return (
    <section
      id="top"
      aria-labelledby="hero-cim"
      className="relative overflow-hidden bg-canvas"
    >
      {/* Réteg 1: Porcelain háttér — teljes Hero-szélesség. */}
      <div aria-hidden="true" className="absolute inset-0 bg-canvas" />

      {/*
        Réteg 2: animation-mount. Szándékosan üres — nincs figura, nincs
        Canvas/SVG/WebGL-tartalom és nincs mozgás ebben a körben. A CTA-k
        fölé sosem kerülhet (pointer-events: none), és screen readerek
        számára nem létezik (aria-hidden).
      */}
      <div
        aria-hidden="true"
        data-hero-animation-mount=""
        className="pointer-events-none absolute inset-0"
      />

      {/* Réteg 3: kontrasztfátyol — ld. .hero-veil a globals.css-ben. */}
      <div aria-hidden="true" className="hero-veil pointer-events-none absolute inset-0" />

      {/* Réteg 4: valódi HTML copy, CTA-k, majd a stage alatti státusz/kockázati sáv. */}
      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col px-5 sm:px-6 lg:px-8">
        <div className="flex min-h-[68svh] flex-col items-center justify-center pt-10 pb-16 text-center sm:min-h-[72svh] sm:pt-12 sm:pb-20 lg:min-h-[76vh] lg:pt-16 lg:pb-24">
          <p className="text-sm font-medium tracking-[0.04em] text-text-secondary sm:text-base lg:text-lg">
            {hero.eyebrow}
          </p>

          <h1
            id="hero-cim"
            className="font-display mx-auto mt-7 max-w-[900px] text-[clamp(2.5rem,11vw,3rem)] leading-[1.02] font-medium text-ink md:text-[clamp(3.125rem,6vw,3.875rem)] lg:text-[clamp(3.5rem,5vw,5rem)]"
          >
            <span className="mx-auto block max-w-[20ch] text-balance">
              {firstLine}
            </span>
            <span className="mx-auto mt-2 block max-w-[24ch] text-balance text-accent">
              {secondLine}
            </span>
          </h1>

          <p className="mx-auto mt-9 max-w-[680px] text-base leading-relaxed text-text-secondary sm:text-lg lg:text-xl">
            {hero.intro}
          </p>

          {/* A CTA-k stabilan láthatók: nem kapnak elrejtő kiindulóállapotot. */}
          <div className="mt-9 flex w-full max-w-md flex-col items-stretch gap-4 sm:max-w-none sm:flex-row sm:items-center sm:justify-center">
            <a
              href={hero.primaryCta.href}
              className="inline-flex min-h-12 items-center justify-center rounded-md bg-accent px-6 text-center text-base font-medium text-porcelain transition-colors hover:bg-accent-hover"
            >
              {hero.primaryCta.label}
            </a>
            <a
              href={hero.secondaryCta.href}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex min-h-12 items-center justify-center rounded-md border border-border-strong bg-transparent px-6 text-center text-base font-medium text-ink transition-colors hover:border-ink"
            >
              {hero.secondaryCta.label}
              <span className="sr-only"> (új lapon nyílik meg)</span>
            </a>
          </div>
        </div>

        {/* KÖTELEZŐ STÁTUSZKÖZLÉS — a középre rendezett stage alatti, önálló sávban. */}
        <div className="grid gap-4 pb-14 sm:pb-16 md:grid-cols-2 lg:pb-16">
          <div className="rounded-card border border-border bg-surface p-5 text-left">
            <p className="text-xs font-medium tracking-[0.14em] text-text-secondary uppercase">
              {statusNotice.label}
            </p>
            <p className="mt-2 text-base leading-relaxed text-text-primary sm:text-[1.0625rem]">
              {statusNotice.body}
            </p>
          </div>

          {/*
            KIEMELT KOCKÁZATI FIGYELMEZTETÉS.
            Mindig látható: nincs accordionban, tooltipben vagy modalban, és
            nem elrejthető. Betűmérete nem kisebb a környező törzsszövegnél;
            az Aubergine jelzővonal és a félkövér szöveg adja a nagyobb
            hangsúlyt.
          */}
          <div className="rounded-card border border-border border-l-[3px] border-l-accent bg-surface p-5 text-left">
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
