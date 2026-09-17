import LegalAccordion, { type LegalPanel } from "./LegalAccordion";
import { imprint, legal } from "@/content/homepage";
import SectionTransition from "./SectionTransition";

/**
 * LegalRiskBlock — a részletes Jogi tájékoztató, a Panaszkezelés és az
 * Impresszum. A jogi hierarchia HARMADIK, legrészletesebb szintje; az oldal
 * alsó részén áll, hogy ne uralja az értékajánlatot.
 *
 * MIT NEM VÁLTOZTAT a v1.1:
 *   – a jogi bekezdések, felsorolási pontok, a Panaszkezelés és az Impresszum
 *     SZÖVEGE szó szerint változatlan (egyetlen kivétel: a közvetítői státusz
 *     bekezdésében a konkrét hirdetmény-dátum „mindenkor hatályos"-ra
 *     cserélődött — ez compliance-korrekció, ld. README);
 *   – semmi nem lett rövidítve, összevonva vagy törölve.
 *
 * MI VÁLTOZIK:
 *   – a témakörök accordionba kerültek (alapállapotban összecsukva), hogy a
 *     jogi tartalom ne nyomja el az oldal első felét. A tartalom MINDIG a
 *     DOM-ban van, csak `hidden` — ld. LegalAccordion;
 *   – a KOCKÁZATI FIGYELMEZTETÉS az accordionon KÍVÜL, alapállapotban
 *     láthatóan marad;
 *   – a Panaszkezelés és az Impresszum szintén az accordionon KÍVÜL,
 *     mindig nyitva marad, saját horgonnyal (#panaszkezeles, #impresszum),
 *     hogy a lábléc- és külső hivatkozások változatlanul működjenek;
 *   – az all-caps riasztó címek („KIEMELT KOCKÁZATI FIGYELMEZTETÉS") helyett
 *     emberi megfogalmazású címek állnak.
 *
 * v1.4: a szakasz függőleges ritmusa levegősebb lett, a kockázati blokk
 * hajszálnyi mélységet (lágy árnyék) és jelölt fejlécet kapott, a két
 * al-horgony (#panaszkezeles, #impresszum) pedig a globális, header-pontos
 * scroll-padding-topot használja a korábbi, fix `scroll-mt-24` helyett —
 * így minden horgony ugyanoda érkezik.
 *
 * Tipográfia: a részletes jogi szöveg 15 px (0.9375rem) mobilon és 16 px
 * desktopon — a specifikált minimum (14/15 px) fölött —, Ink színnel
 * Porcelainen/fehéren, ami WCAG AAA (13.56:1 / 15.03:1). Semmi nem halvány.
 */

const paragraphClass = "text-[0.9375rem] leading-relaxed text-text-primary sm:text-base";

export default function LegalRiskBlock() {
  const panels: readonly LegalPanel[] = [
    {
      id: "szerepek",
      heading: legal.status.heading,
      content: (
        <div className="max-w-3xl space-y-3">
          {legal.status.paragraphs.map((paragraph) => (
            <p key={paragraph.slice(0, 40)} className={paragraphClass}>
              {paragraph}
            </p>
          ))}
        </div>
      ),
    },
    {
      id: "keretek",
      heading: legal.scope.heading,
      content: (
        <div className="max-w-3xl space-y-3">
          {legal.scope.paragraphs.map((paragraph) => (
            <p key={paragraph.slice(0, 40)} className={paragraphClass}>
              {paragraph}
            </p>
          ))}
        </div>
      ),
    },
    {
      id: "korlatok",
      heading: legal.limits.heading,
      content: (
        <ul className="grid gap-3 md:grid-cols-2">
          {legal.limits.items.map((item) => (
            <li
              key={item.slice(0, 40)}
              className={`flex gap-3 ${paragraphClass}`}
            >
              <span
                aria-hidden="true"
                className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent"
              />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ),
    },
    {
      id: "nyilatkozat",
      heading: legal.disclaimer.heading,
      content: (
        <p className={`max-w-3xl ${paragraphClass}`}>{legal.disclaimer.body}</p>
      ),
    },
  ];

  return (
    <section
      id="jogi-tajekoztato"
      aria-labelledby="jogi-tajekoztato-cim"
      className="relative bg-canvas"
    >
      {/*
        v1.5.3 — a Kapcsolat (Deep) felől érkező lágy átmenet. Ez a szakasz
        nem a közös Section keretet használja, ezért a fedőréteget közvetlenül
        rendereli — ugyanabból az egy komponensből, mint a többi határ.
      */}
      <SectionTransition from="deep" toDark={false} />

      <div className="jg-safe-x relative mx-auto w-full max-w-[1280px] py-16 sm:py-20 lg:py-28">
        {/* A jogi szakasz szándékosan SZŰKEBB olvasási sávot kap, mint a
            marketingszakaszok: így jelen van és teljesen olvasható, de nem
            uralja az oldal vizuális élményét. */}
        <div className="max-w-[900px]">
        <p className="flex items-baseline gap-3.5 text-sm font-semibold tracking-[0.18em] text-accent uppercase">
          <span aria-hidden="true" className="h-px w-7 bg-border-strong" />
          <span>{legal.sectionLabel}</span>
        </p>
        <h2
          id="jogi-tajekoztato-cim"
          className="font-display mt-5 text-[1.875rem] leading-[1.13] tracking-[-0.012em] [overflow-wrap:normal] hyphens-none text-text-primary sm:text-[2.25rem]"
        >
          {legal.heading}
        </h2>
        <p className="mt-5 max-w-2xl text-base leading-[1.72] text-text-secondary">
          {legal.lead}
        </p>

        {/*
          KOCKÁZATOK — az accordionon KÍVÜL, alapállapotban láthatóan, teljes
          szöveggel. Soha nem csukható össze és nem rövidíthető.
        */}
        <div className="mt-9 rounded-r-lg border-l-2 border-l-signal-berry bg-surface px-5 py-5 shadow-[0_10px_28px_-24px_rgb(24_24_27/45%)] sm:mt-11 sm:px-7 sm:py-6">
          <h3 className="flex items-center gap-2.5 text-sm font-semibold text-accent">
            <span aria-hidden="true" className="block h-px w-4 bg-signal-berry" />
            {legal.riskWarning.heading}
          </h3>
          {/*
            EGYETLEN kockázati blokk. A korábbi két, egymást átfedő bekezdés
            (rövid összefoglaló + docx-szöveg) helyett csak a docx source of
            truth teljes szövege áll itt — ez tartalmazza az összes kötelező
            elemet: a kockázat tényét, a részleges vagy teljes tőkevesztés
            lehetőségét, a múltbeli hozamra vonatkozó közlést és a hivatalos
            dokumentumok megismerésének kötelezettségét. Nincs ismétlés.
          */}
          <p className="mt-2 max-w-4xl text-[0.9375rem] leading-relaxed font-medium text-text-primary sm:text-base">
            {legal.riskWarning.body}
          </p>
        </div>

        {/* Részletes témakörök — összecsukva, de a DOM-ban teljes szöveggel. */}
        <div className="mt-11">
          <LegalAccordion panels={panels} />
        </div>

        {/*
          Panaszkezelés — az accordionon KÍVÜL, mindig nyitva. Szövege,
          elérhetőségei, K&H-hivatkozásai és horgonya változatlan.
        */}
        <div
          id="panaszkezeles"
          className="mt-14 border-t border-border-strong pt-7"
        >
          <h3 className="font-display text-xl text-text-primary">
            {legal.complaints.heading}
          </h3>
          <p className={`mt-3 max-w-3xl ${paragraphClass}`}>
            {legal.complaints.lead}
          </p>
          <ul className="mt-4 space-y-2">
            {legal.complaints.items.map((item) => (
              <li
                key={item.label}
                className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-4"
              >
                <span className="text-sm font-medium text-text-secondary sm:w-56 sm:shrink-0">
                  {item.label}
                </span>
                {item.href ? (
                  <a
                    href={item.href}
                    className="inline-flex min-h-11 items-center break-all text-base font-medium text-accent underline underline-offset-4"
                  >
                    {item.value}
                  </a>
                ) : (
                  <span className="text-base text-text-primary">
                    {item.value}
                  </span>
                )}
              </li>
            ))}
          </ul>
          <p className={`mt-4 max-w-3xl ${paragraphClass}`}>
            {legal.complaints.closing}
          </p>
        </div>

        {/* Impresszum — szintén mindig nyitva, változatlan tartalommal. */}
        <div
          id="impresszum"
          className="mt-14 border-t border-border-strong pt-7"
        >
          <h3 className="font-display text-xl text-text-primary">
            {imprint.heading}
          </h3>
          <dl className="mt-4 grid gap-3 md:grid-cols-2">
            {imprint.items.map((item) => (
              <div key={item.label}>
                <dt className="text-sm font-medium text-text-secondary">
                  {item.label}
                </dt>
                <dd className="text-[0.9375rem] leading-relaxed text-text-primary sm:text-base">
                  {item.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
        </div>
      </div>
    </section>
  );
}
