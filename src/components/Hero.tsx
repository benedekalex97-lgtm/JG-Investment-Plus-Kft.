import { hero, statusNotice } from "@/content/homepage";
import WorldPanorama from "./world-panorama/WorldPanorama";

/**
 * Hero — „VILÁGPIACI PANORÁMA" (World Market Panorama v1.0).
 *
 * A Hero szövege (eyebrow, H1, bevezető, CTA) VÁLTOZATLAN, szerveroldali
 * HTML, a tartalmi modellből. Mögötte valódi 3D világtérkép (Three.js,
 * Natural Earth földrajzi adatból extrudált kontinensek) 24 s-os, zárt
 * kameraúttal; a térképsávban három interaktív régió (New York, London,
 * Tokió) regionális bemutató részvénylistával. Részletek:
 * src/components/world-panorama/ és docs/world-panorama.md.
 *
 * A 3D modul kliensoldali, dinamikusan betöltött egység: a H1 és a CTA nem
 * függ a betöltésétől; addig (és WebGL2 nélkül / hiba esetén) a jelenetből
 * exportált statikus kép látszik. JS nélkül a régiólisták natív
 * <details> elemekben érhetők el.
 *
 * A kötelező státuszközlés KÜLÖN, átlátszatlan sötét sávban áll, mögötte
 * nem mozog térképrészlet.
 *
 * Korábbi változatok: a v2.0 „Architectural Flow" (HeroArchitecturalFlow) és
 * a v1.x gyertyakorridor (hero-market-corridor.webp, HeroMarketMotion) a
 * repositoryban maradt, de a Hero NEM rendereli őket.
 *
 * A lenti v1.x előzmény-jegyzet történeti; az aktuális rétegrend a
 * komponens markupja fölött áll.
 *
 * Előzmények: v0.1–v0.3-ban itt egy jobb oldali vizuális elem élt (előbb mozgó,
 * majd statikus figura + japángyertya-kompozíció), v0.4-ben egy balra igazított
 * szövegblokk, v0.5-ben középre rendezett copy + üres animációs réteg. A v0.6
 * töltötte ki ezt a réteget a HeroMarketMotion canvasszal. A v1.1 három dolgot
 * változtat: (a) a copy a jóváhagyott hero-referencia szövegezésére vált,
 * (b) a v0.6 arany kiemelőszínét a lila–vörös Signal Berry váltja,
 * (c) a Hero egyetlen CTA-ra egyszerűsödik, a státuszközlés pedig nagy kártya
 * helyett visszafogott információs sávvá válik.
 *
 * FIGURA TOVÁBBRA SINCS és nem is lesz: az animáció kizárólag absztrakt.
 *
 * A Hero négy rétegre tagolódik alulról:
 *
 *   1) Porcelain háttér (teljes Hero-szélesség)
 *   2) animation-mount — pointer-events: none, aria-hidden; ebben él a
 *      HeroMarketMotion canvas (absztrakt japángyertya-mozgás; nincs figura,
 *      nincs árfolyamadat, nincs piros–zöld színpár)
 *   3) .hero-veil kontrasztfátyol (ld. globals.css) — lágy, szél nélküli
 *      Porcelain gradient a copy és az animáció között
 *   4) a valódi HTML copy és a CTA, illetve alattuk, már a középre rendezett
 *      "stage"-en kívül a kötelező státuszközlés és a kockázati figyelmeztetés
 *
 * A stage függőleges ritmusa szándékosan NEM transform/translate-tel készül,
 * hanem aszimmetrikus felső/alsó paddinggel: rövid viewportokon (pl. 320×568)
 * így sosem vághatja le a tartalmat, mert a padding-különbség legfeljebb
 * kevesebb üres teret hagy — szemben egy transformmal, ami egy overflow-hidden
 * szülőn belül a copyt a doboz határán kívülre tolhatná.
 */

/**
 * Egy főcímsort három részre bont a kiemelt szó mentén. A főcím SZÖVEGE nem
 * változik: a markup kizárólag azért tagolódik, hogy a hero.headlineHighlight
 * által megjelölt szó (jelenleg: „Átláthatóság.") önálló Signal Berry
 * kiemelést kaphasson. Ha a szó nem szerepel az adott sorban, a sor egyben,
 * kiemelés nélkül jelenik meg — a szöveg soha nem veszhet el, és az sem
 * számít, melyik sorba kerül a kiemelendő szó.
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
    /*
      A Hero mély, sötét felületen áll (.on-dark → a fókuszgyűrű Porcelainre
      vált). Felépítés: WorldPanorama (3D színpad + szöveg + térképsáv), alatta
      a státuszközlés saját sötét sávja. Minden dekoratív réteg aria-hidden és
      pointer-events: none.
    */
    <section
      id="top"
      aria-labelledby="hero-cim"
      className="on-dark relative overflow-hidden bg-surface-deep"
    >
      <WorldPanorama>
        <div className="jg-safe-x mx-auto flex w-full max-w-[1280px] flex-col">
          {/*
            data-hero-copy: a Hero olvasási zónája. A függőleges ritmus
            padding, nem transform; a térkép saját, előre lefoglalt sávja
            (WorldPanorama .wp-slot) ezután következik, így a panel és a
            hotspotok sosem kerülnek a szöveg fölé.
          */}
          <div
            data-hero-copy=""
            className="flex flex-col items-center pt-12 pb-8 text-center sm:pt-14 lg:pt-12 lg:pb-6"
          >
            {/*
              Az eyebrow PONTOSAN két, tudatos sor (v1.5.3): a két sor külön
              markup-blokk, a `whitespace-nowrap` miatt egyik sem törik tovább.
              A dekoratív vonalak aria-hidden-ek.
            */}
            <p
              data-hero-ink=""
              className="flex flex-col items-center gap-2 text-[0.6875rem] font-semibold tracking-[0.22em] text-cool-silver sm:text-xs lg:text-[0.8125rem]"
            >
              <span className="flex items-center gap-3 whitespace-nowrap">
                <span aria-hidden="true" className="block h-px w-6 bg-signal-berry-light/60 sm:w-8" />
                {eyebrowPrimary}
                <span aria-hidden="true" className="block h-px w-6 bg-signal-berry-light/60 sm:w-8" />
              </span>
              <span className="block whitespace-nowrap">{eyebrowSecondary}</span>
            </p>

            {/*
              Főcím — két sor: „Biztonság. Átláthatóság." / „Szakmai háttér."
              Kizárólag a hero.headlineHighlight („Átláthatóság.") kap Berry
              Light kiemelést. Nincs gradient, glow vagy text-shadow.
            */}
            <h1
              id="hero-cim"
              data-hero-ink=""
              className="font-display mx-auto mt-7 max-w-[15ch] text-[clamp(2.75rem,12vw,3.5rem)] leading-[1.03] font-medium tracking-[-0.018em] [overflow-wrap:normal] hyphens-none text-balance text-porcelain sm:mt-8 sm:max-w-[16ch] md:text-[clamp(3.75rem,7vw,5rem)] lg:max-w-[19ch] lg:text-[clamp(4.5rem,6vw,5.75rem)]"
            >
              <HeadlineLine line={firstLine} />
              <HeadlineLine line={secondLine} />
            </h1>

            <p
              data-hero-ink=""
              className="mx-auto mt-7 max-w-[34ch] text-base leading-[1.72] text-cool-silver text-pretty sm:mt-8 sm:max-w-[58ch] sm:text-lg lg:mt-6 lg:max-w-[680px] lg:text-xl"
            >
              {hero.intro}
            </p>

            {/*
              EGYETLEN hero-CTA — Porcelain felület, Ink felirat (13,56:1),
              dekoratív karakter nélkül; a felirat karakterre a tartalmi modellé.
            */}
            <div className="mt-9 flex w-full max-w-sm flex-col items-stretch sm:mt-10 sm:max-w-none sm:flex-row sm:justify-center lg:mt-8">
              <a
                href={hero.primaryCta.href}
                data-hero-ink=""
                className="hero-cta-primary inline-flex min-h-14 items-center justify-center rounded-md bg-porcelain px-10 text-center text-sm font-semibold tracking-[0.1em] text-ink hover:-translate-y-px hover:bg-white sm:text-[0.9375rem]"
              >
                {hero.primaryCta.label}
              </a>
            </div>
          </div>
        </div>
      </WorldPanorama>

      {/*
        STÁTUSZKÖZLÉS — a jogi hierarchia első szintje, KÜLÖN, átlátszatlan
        sötét sávban: mögötte nincs térkép, így a kontraszt állandó (Cool
        Silver a Carbonon 9,82:1). A szöveg karakterre változatlan.
      */}
      <div className="wp-legal relative z-10 border-t border-white/10 bg-carbon">
        <div className="jg-safe-x mx-auto w-full max-w-[1280px] pt-7 pb-12 sm:pb-14 lg:pb-16">
          <p className="max-w-4xl text-[0.9375rem] leading-relaxed text-cool-silver sm:text-base">
            {statusNotice.body}
          </p>
        </div>
      </div>
    </section>
  );
}
