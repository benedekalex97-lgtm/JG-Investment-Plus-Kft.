import Image from "next/image";

import heroBackdrop from "@/assets/hero-market-corridor.webp";
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
        2) hero-vignette — lágy Aubergine mélység és peremsötétítés
        3) hero-media — a jóváhagyott, statikus gyertyakorridor-kép
        4) hero-veil — SÖTÉT kontrasztvédő overlay a copy mögött
        4b) hero-scrim — alsó kontrasztvédő sáv a státuszközlés mögött
        5) a copy és a CTA
      Az 1–4b. réteg mind dekoratív: aria-hidden és pointer-events: none.

      v1.5.2: a 3. réteg a Canvas-animáció helyett egy STATIKUS, jóváhagyott
      kép. A HeroMarketMotion komponens megmarad a repositoryban, de a Hero
      nem rendereli — így bármikor visszakapcsolható.
    */
    <section
      id="top"
      aria-labelledby="hero-cim"
      className="on-dark relative overflow-hidden bg-surface-deep"
    >
      {/* Réteg 1–2: statikus mélység és peremsötétítés. */}
      <div aria-hidden="true" className="absolute inset-0 bg-surface-deep" />
      <div aria-hidden="true" className="hero-vignette pointer-events-none absolute inset-0" />

      {/*
        Réteg 3: HERO MÉDIA — a jóváhagyott, statikus filmszerű gyertyakorridor.

        v1.5.2: a Canvas-alapú HeroMarketMotion NEM renderelődik többé itt
        (a komponens megmarad a repositoryban, ld. a fájl tetején lévő
        jegyzetet). Ez tudatos köztes lépés: előbb a statikus vizuális irány
        kerül jóváhagyásra, és csak utána döntünk a mozgásról.

        Tisztán dekoratív: alt="" + aria-hidden, tehát képernyőolvasó nem
        olvassa fel; pointer-events: none, tehát a CTA fölé sosem kerülhet.
        A kép abszolút pozicionált, kifolyik a normál elrendezésből, ezért
        elvileg sem okozhat layout shiftet. A `priority` above-the-fold
        előtöltést kér; a statikus import miatt a méretek build-időben
        ismertek.

        A kompozíciót a `.hero-media` osztály állítja be (ld. globals.css):
        desktopon `cover`, mobilon a kép TELJES szélessége látszik egy alsó
        sávban — mert egy 390 px-es, álló viewporton a középre vágott
        `cover` pontosan a folyosó ÜRES közepét mutatná, gyertyák nélkül.
      */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <Image
          src={heroBackdrop}
          alt=""
          priority
          fetchPriority="high"
          sizes="(max-width: 479px) 205vw, (max-width: 639px) 170vw, (max-width: 767px) 132vw, 100vw"
          className="hero-media select-none"
        />
      </div>

      {/* Réteg 4: sötét kontrasztvédő overlay — ld. .hero-veil a globals.css-ben. */}
      <div aria-hidden="true" className="hero-veil pointer-events-none absolute inset-0" />

      {/*
        Réteg 4b: alsó kontrasztvédő sáv. A kép alsó harmada fényes,
        tükröződő padló, és a kötelező státuszközlés éppen azon ül — mérve
        3,06:1 kontrasztra esett vissza. Ez a réteg csak a Hero alját
        sötétíti, a padló a copy alatt látható marad.
      */}
      <div aria-hidden="true" className="hero-scrim pointer-events-none absolute inset-0" />

      {/* Réteg 5: valódi HTML copy és CTA. */}
      <div className="relative z-10 mx-auto flex w-full max-w-[1280px] flex-col px-5 sm:px-6 lg:px-8">
        {/*
          data-hero-copy: ez a doboz jelöli ki a Hero olvasási zónáját.

          v1.4: a HeroMarketMotion már NEM ennek a paddinggel és
          min-height-tal felfújt doboznak a geometriáját méri, hanem a
          benne lévő, [data-hero-ink] attribútummal megjelölt, ténylegesen
          SZÖVEGET HORDOZÓ elemek (eyebrow, H1, bevezető, CTA) egyesített
          befoglaló dobozát. Ez azért lényeges, mert
            – a konténer paddingje miatt a zóna függőlegesen jóval nagyobb
              volt a szövegnél (mobilon 600 px a ~440 px helyett), ezért a
              gyertyák a Hero nagy részén feleslegesen le voltak halkítva;
            – a CTA-t körbevevő flex-doboz teljes konténerszélességű, tehát
              a zóna szélessége sem a szöveget követte.
          A megjelölt elemek mérésével a csillapítás pontosan ott van, ahol
          szöveg van — és sehol máshol.
        */}
        {/*
          v1.4 WHITESPACE-KORREKCIÓ — mérés alapján, nem becslésből.

          A v1.3-ban a header alja és az eyebrow között 154 px (1440) és
          164 px (1280) volt a távolság, a Hero teljes magassága pedig 905 px.
          A copy így a viewport közepe ALÁ csúszott, fölötte pedig egy üres
          „várakozási zóna" maradt. A min-height és a felső/alsó padding
          együttes szűkítésével a mért érték 95–140 px közé kerül, a Hero
          pedig kb. 100 px-szel kompaktabb lesz — a nagy, prémium arányok
          megtartása mellett.

          A ritmus továbbra sem transform/translate: rövid viewportokon így
          legfeljebb kevesebb üres tér marad, tartalom sosem vágódik le.
        */}
        <div
          data-hero-copy=""
          className="flex min-h-[600px] flex-col items-center justify-center pt-16 pb-14 text-center sm:min-h-[624px] sm:pt-[68px] sm:pb-[60px] lg:min-h-[660px] lg:pt-[76px] lg:pb-16"
        >
          <p
            data-hero-ink=""
            className="flex items-center gap-3 text-[0.6875rem] font-semibold tracking-[0.22em] text-cool-silver sm:text-xs lg:text-[0.8125rem]"
          >
            {/* Geometriai jelölés, nem szöveg: a felirat kap egy vizuális
                horgonyt mindkét oldalról, a copy pedig optikailag középre áll. */}
            <span aria-hidden="true" className="block h-px w-6 bg-signal-berry-light/60 sm:w-8" />
            {hero.eyebrow}
            <span aria-hidden="true" className="block h-px w-6 bg-signal-berry-light/60 sm:w-8" />
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
            data-hero-ink=""
            className="font-display mx-auto mt-7 max-w-[15ch] text-[clamp(2.75rem,12vw,3.5rem)] leading-[1.03] font-medium tracking-[-0.018em] [overflow-wrap:normal] hyphens-none text-balance text-porcelain sm:mt-8 sm:max-w-[16ch] md:text-[clamp(3.75rem,7vw,5rem)] lg:max-w-[19ch] lg:text-[clamp(4.5rem,6vw,5.75rem)]"
          >
            <HeadlineLine line={firstLine} />
            <HeadlineLine line={secondLine} />
          </h1>

          <p
            data-hero-ink=""
            className="mx-auto mt-7 max-w-[34ch] text-base leading-[1.72] text-cool-silver text-pretty sm:mt-8 sm:max-w-[58ch] sm:text-lg lg:max-w-[680px] lg:text-xl"
          >
            {hero.intro}
          </p>

          {/*
            EGYETLEN hero-CTA — az oldal legerősebb konverziós pontja.
            v1.5.2: Porcelain felület, Ink felirat (13,56:1, AAA), teljesen
            SEMLEGES élkezeléssel. A korábbi Berry Soft (rózsaszín) háttér,
            az alsó Berry jelzővonal, a Berry kontúr és a Berry fókuszgyűrű
            MIND eltávolítva. Hoverre 1 px-t emelkedik; nincs pulzálás.
          */}
          <div className="mt-9 flex w-full max-w-sm flex-col items-stretch sm:mt-10 sm:max-w-none sm:flex-row sm:justify-center">
            {/*
              A gomb SEMMILYEN dekoratív karaktert (pl. nyilat) nem tartalmaz:
              a renderelt szövegnek karakterre a content-modell feliratával kell
              egyeznie. A hover-visszajelzést a finom emelkedés és a semleges
              élkezelés erősödése adja — Berry/rózsaszín elem nincs rajta.
            */}
            <a
              href={hero.primaryCta.href}
              data-hero-ink=""
              className="hero-cta-primary inline-flex min-h-14 items-center justify-center rounded-md bg-porcelain px-10 text-center text-sm font-semibold tracking-[0.1em] text-ink hover:-translate-y-px hover:bg-white sm:text-[0.9375rem]"
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

      {/*
        Szakaszhatár — hajszálvékony, középen Berryre erősödő fényvonal a Hero
        alján. Ettől a Hero -> Rólunk váltás tudatos metszésnek hat, nem
        véletlen színváltásnak. Tisztán dekoratív.
      */}
      <div
        aria-hidden="true"
        className="jg-seam pointer-events-none absolute inset-x-0 bottom-0 z-10 h-px"
      />
    </section>
  );
}
