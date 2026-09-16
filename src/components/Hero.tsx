import HeroMarketMotion from "@/components/HeroMarketMotion";
import { hero, statusNotice } from "@/content/homepage";

/**
 * Hero — a SOT 1. szakasza, v1.1: középre rendezett, tipográfia-vezérelt copy
 * absztrakt japángyertya-háttéranimációval.
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
      {highlighted ? <span className="text-signal-berry">{highlighted}</span> : null}
      {after}
    </span>
  );
}

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
        Réteg 2: animation-mount — az absztrakt japángyertya-animáció canvasa.
        Tisztán dekoratív: a CTA-k fölé sosem kerülhet (pointer-events: none),
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

      {/* Réteg 3: kontrasztfátyol — ld. .hero-veil a globals.css-ben. */}
      <div aria-hidden="true" className="hero-veil pointer-events-none absolute inset-0" />

      {/* Réteg 4: valódi HTML copy, CTA-k, majd a stage alatti státusz/kockázati sáv. */}
      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col px-5 sm:px-6 lg:px-8">
        {/*
          data-hero-copy: ez a doboz jelöli ki a Hero olvasási zónáját. A
          HeroMarketMotion ennek a VALÓDI, kimért geometriájának megfelelően
          halványítja le a gyertyákat — így a readability-zóna minden
          viewporton pontosan a szöveget követi, nem egy találgatott arányt.
        */}
        <div
          data-hero-copy=""
          className="flex min-h-[64svh] flex-col items-center justify-center pt-10 pb-14 text-center sm:min-h-[68svh] sm:pt-12 sm:pb-16 lg:min-h-[72vh] lg:pt-16 lg:pb-20"
        >
          {/*
            Eyebrow — a forrásszöveg már nagybetűs; a tipográfiai karaktert a
            széles betűköz és a kis méret adja, nem egy uppercase transzformáció.
          */}
          <p className="text-[0.6875rem] font-semibold tracking-[0.2em] text-text-secondary sm:text-xs lg:text-sm">
            {hero.eyebrow}
          </p>

          {/*
            Főcím — a két sor együtt: „Biztonság. Átláthatóság. Szakmai háttér.”
            A sorok Ink színűek; EGYETLEN szó, a hero.headlineHighlight
            („Átláthatóság.") kap Signal Berry kiemelést. Nincs gradient, nincs
            glow, nincs text-shadow, nincs animált betűszín.
          */}
          <h1
            id="hero-cim"
            className="font-display mx-auto mt-6 max-w-[15ch] text-[clamp(2.75rem,12vw,3.25rem)] leading-[1.03] font-medium text-balance text-ink sm:mt-7 sm:max-w-[16ch] md:text-[clamp(3.5rem,6.6vw,4.5rem)] lg:max-w-[18ch] lg:text-[clamp(4rem,5.8vw,5.5rem)]"
          >
            <HeadlineLine line={firstLine} />
            <HeadlineLine line={secondLine} />
          </h1>

          <p className="mx-auto mt-7 max-w-[34ch] text-base leading-relaxed text-text-secondary sm:mt-8 sm:max-w-[52ch] sm:text-lg lg:text-xl">
            {hero.intro}
          </p>

          {/*
            EGYETLEN hero-CTA. A másodlagos „K&H Értékpapír dokumentumai" gomb a
            v1.1-ben nem renderelődik itt — ugyanez a hivatkozás a láblécben és a
            jogi szakaszban változatlanul elérhető maradt.
            A CTA stabilan látható: nem kap elrejtő kiindulóállapotot.
          */}
          <div className="mt-8 flex w-full max-w-sm flex-col items-stretch sm:mt-9 sm:max-w-none sm:flex-row sm:justify-center">
            <a
              href={hero.primaryCta.href}
              className="hero-cta-primary inline-flex min-h-13 items-center justify-center rounded-md bg-accent px-8 text-center text-sm font-semibold tracking-[0.1em] text-porcelain hover:bg-accent-hover sm:text-base"
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
        <div className="border-t border-border pb-10 pt-6 sm:pb-12 lg:pb-14">
          <p className="max-w-4xl text-[0.9375rem] leading-relaxed text-text-secondary sm:text-base">
            {statusNotice.body}
          </p>
        </div>
      </div>
    </section>
  );
}
