import LegalAccordion, { type LegalPanel } from "./LegalAccordion";
import { imprint, legal, riskWarningSummary } from "@/content/homepage";

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
      className="bg-canvas"
    >
      <div className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <p className="flex items-baseline gap-3 text-sm font-semibold tracking-[0.18em] text-accent uppercase">
          <span aria-hidden="true" className="h-px w-6 bg-border-strong" />
          <span>{legal.sectionLabel}</span>
        </p>
        <h2
          id="jogi-tajekoztato-cim"
          className="font-display mt-4 text-[1.875rem] leading-[1.15] [overflow-wrap:normal] hyphens-none text-text-primary sm:text-[2.25rem]"
        >
          {legal.heading}
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-text-secondary">
          {legal.lead}
        </p>

        {/*
          KOCKÁZATOK — az accordionon KÍVÜL, alapállapotban láthatóan, teljes
          szöveggel. Soha nem csukható össze és nem rövidíthető.
        */}
        <div className="mt-8 border-l-2 border-l-accent bg-surface px-5 py-4 sm:mt-10 sm:px-6 sm:py-5">
          <h3 className="text-sm font-semibold text-accent">
            {legal.riskWarning.heading}
          </h3>
          {/*
            Két kockázati szöveg, MINDKETTŐ alapállapotban látható:
            1) a rövid, kiemelt összefoglaló,
            2) a docx source of truth teljes kockázati bekezdése.
            Egy mondatuk átfed; ezt tudatosan vállaljuk, mert egyiket sem
            szabad elhagyni vagy accordionba rejteni.
          */}
          <p className="mt-2 max-w-4xl text-[0.9375rem] leading-relaxed font-medium text-text-primary sm:text-base">
            {riskWarningSummary.body}
          </p>
          <p className="mt-3 max-w-4xl text-[0.9375rem] leading-relaxed text-text-primary sm:text-base">
            {legal.riskWarning.body}
          </p>
        </div>

        {/* Részletes témakörök — összecsukva, de a DOM-ban teljes szöveggel. */}
        <div className="mt-10">
          <LegalAccordion panels={panels} />
        </div>

        {/*
          Panaszkezelés — az accordionon KÍVÜL, mindig nyitva. Szövege,
          elérhetőségei, K&H-hivatkozásai és horgonya változatlan.
        */}
        <div
          id="panaszkezeles"
          className="mt-12 scroll-mt-24 border-t border-border-strong pt-6"
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
                    className="inline-flex min-h-11 items-center break-all text-base font-medium text-accent underline underline-offset-4 sm:min-h-0"
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
          className="mt-12 scroll-mt-24 border-t border-border-strong pt-6"
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
    </section>
  );
}
