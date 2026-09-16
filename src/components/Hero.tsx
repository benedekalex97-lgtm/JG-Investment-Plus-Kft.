import HeroMarketMotion from "@/components/HeroMarketMotion";
import { hero, statusNotice } from "@/content/homepage";

/**
 * Hero — v1.3: MÉLY, SÖTÉT felületen álló, tipográfia-vezérelt copy absztrakt
 * japángyertya-háttéranimációval. Az oldal legerősebb vizuális eleme.
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

  return (
    /*
      A Hero mély, sötét felületen áll (.on-dark → a fókuszgyűrű Porcelainre
      vált, ld. globals.css). Rétegek alulról:
        1) Deep alapfelület
        2) hero-vignette — lágy Aubergine mélység a sarkokban
        3) hero-grid — nagyon halvány tőkepiaci rácsháló, maszkolva
        4) HeroMarketMotion canvas — a mozgó gyertyák
        5) hero-veil — SÖTÉT kontrasztvédő overlay a copy mögött
        6) a copy és a CTA
      Az 1–5. réteg mind dekoratív: aria-hidden és pointer-events: none.
    */
    <section
      id="top"
      aria-labelledby="hero-cim"
      className="on-dark relative overflow-hidden bg-surface-deep"
    >
      {/* Réteg 1–3: statikus mélység. */}
      <div aria-hidden="true" className="absolute inset-0 bg-surface-deep" />
      <div aria-hidden="true" className="hero-vignette pointer-events-none absolute inset-0" />
      <div aria-hidden="true" className="hero-grid pointer-events-none absolute inset-0" />

      {/*
        Réteg 4: animation-mount — az absztrakt japángyertya-animáció canvasa.
        Tisztán dekoratív: a CTA fölé sosem kerülhet (pointer-events: none),
        nincs a billentyűzetes fókuszsorrendben, és screen readerek számára
        nem létezik (aria-hidden). Szerveroldalon üres canvasként renderel,
        ezért nem okoz hydration mismatchet és nem mozdítja el a layoutot.
      */}
      <div
        aria-hidden="true"
        data-hero-animation-mount=""
        className="pointer-events-none absolute inset-0"
      >
        <HeroMarketMotion />
      </div>

      {/* Réteg 5: sötét kontrasztvédő overlay — ld. .hero-veil a globals.css-ben. */}
      <div aria-hidden="true" className="hero-veil pointer-events-none absolute inset-0" />

      {/* Réteg 6: valódi HTML copy és CTA. */}
      <div className="relative z-10 mx-auto flex w-full max-w-[1280px] flex-col px-5 sm:px-6 lg:px-8">
        {/*
          data-hero-copy: ez a doboz jelöli ki a Hero olvasási zónáját. A
          HeroMarketMotion ennek a VALÓDI, kimért geometriájának megfelelően
          halványítja le a gyertyákat — így a readability-zóna minden
          viewporton pontosan a szöveget követi, nem egy találgatott arányt.
        */}
        <div
          data-hero-copy=""
          className="flex min-h-[600px] flex-col items-center justify-center pt-16 pb-14 text-center sm:min-h-[680px] sm:pt-20 sm:pb-16 lg:min-h-[760px] lg:pt-24 lg:pb-20"
        >
          <p className="text-[0.6875rem] font-semibold tracking-[0.22em] text-cool-silver sm:text-xs lg:text-[0.8125rem]">
            {hero.eyebrow}
          </p>

          {/*
            Főcím — a két sor együtt: „Biztonság. Átláthatóság. Szakmai háttér."
            Porcelain alapszín; EGYETLEN szó, a hero.headlineHighlight
            („Átláthatóság.") kap Signal Berry kiemelést, sötét alapon a
            -light változattal (5.82:1, AA). Nincs gradient, glow vagy
            text-shadow.
          */}
          <h1
            id="hero-cim"
            className="font-display mx-auto mt-7 max-w-[15ch] text-[clamp(2.75rem,12vw,3.5rem)] leading-[1.04] font-medium [overflow-wrap:normal] hyphens-none text-balance text-porcelain sm:mt-8 sm:max-w-[16ch] md:text-[clamp(3.75rem,7vw,5rem)] lg:max-w-[19ch] lg:text-[clamp(4.5rem,6vw,5.75rem)]"
          >
            <HeadlineLine line={firstLine} />
            <HeadlineLine line={secondLine} />
          </h1>

          <p className="mx-auto mt-8 max-w-[34ch] text-base leading-[1.7] text-cool-silver sm:mt-9 sm:max-w-[62ch] sm:text-lg lg:max-w-[720px] lg:text-xl">
            {hero.intro}
          </p>

          {/*
            EGYETLEN hero-CTA — az oldal legerősebb konverziós pontja.
            Világos Berry Soft felület, Carbon felirat (12.85:1, AAA), alsó
            Berry jelzővonallal. Hoverre 1 px-t emelkedik; nincs pulzálás.
          */}
          <div className="mt-10 flex w-full max-w-sm flex-col items-stretch sm:mt-11 sm:max-w-none sm:flex-row sm:justify-center">
            {/*
              A gomb SEMMILYEN dekoratív karaktert (pl. nyilat) nem tartalmaz:
              a renderelt szövegnek karakterre a content-modell feliratával kell
              egyeznie. A hover-visszajelzést a finom emelkedés és az alsó
              Berry jelzővonal adja.
            */}
            <a
              href={hero.primaryCta.href}
              className="hero-cta-primary inline-flex min-h-14 items-center justify-center rounded-md bg-signal-berry-soft px-10 text-center text-sm font-semibold tracking-[0.1em] text-ink hover:-translate-y-px hover:bg-white sm:text-[0.9375rem]"
            >
              {hero.primaryCta.label}
            </a>
          </div>
        </div>

        {/*
          STÁTUSZKÖZLÉS — a jogi hierarchia ELSŐ, legrövidebb szintje.
          Vizuálisan MÁSODLAGOS: nincs kártya, nincs domináns keret vagy
          háttér, nincs all-caps „KÖTELEZŐ STÁTUSZKÖZLÉS" felirat — csak egy
          hajszálvékony felső osztóvonal. Ugyanakkor mindig látható, mobilon
          sem rejtett, és a mérete a specifikált minimum FÖLÖTT van:
          15 px mobilon (0.9375rem), 16 px desktopon. Muted Plum Porcelainen
          mérve 5.33:1 — WCAG AA teljesül.
        */}
        <div className="border-t border-white/12 pb-12 pt-7 sm:pb-14 lg:pb-16">
          <p className="max-w-4xl text-[0.9375rem] leading-relaxed text-cool-silver sm:text-base">
            {statusNotice.body}
          </p>
        </div>
      </div>
    </section>
  );
}
