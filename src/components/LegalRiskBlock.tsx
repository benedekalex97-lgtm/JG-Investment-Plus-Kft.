import { complaints, imprint } from "@/content/homepage";
import SectionTransition from "./SectionTransition";

/**
 * LegalRiskBlock — a Panaszkezelés és az Impresszum.
 *
 * v1.1 — POST-LAUNCH UI & STRUCTURE POLISH.
 *
 * A korábbi, részletes Jogi tájékoztató (Szerepek és felelősség /
 * Tevékenységi keretek / Tevékenységi korlátok / Kockázatok / Jogi
 * nyilatkozat) KIKERÜLT ebből a komponensből, és önálló oldalra költözött:
 * /jogi-tajekoztato (ld. src/app/jogi-tajekoztato/page.tsx +
 * src/content/legal-notice.ts). A szöveg karakterre változatlan — csak a
 * helye és a megjelenítése változott, ld. a legal-notice.ts fejlécét a
 * részletes indoklásért.
 *
 * A Panaszkezelés és az Impresszum VÁLTOZATLANUL itt maradt: a footer
 * mindkettőt önálló, homepage-horgonyra mutató linkként kezeli
 * (#panaszkezeles, #impresszum), függetlenül az új Jogi tájékoztató
 * oldaltól — ahogy korábban is.
 *
 * SÖTÉT FELÜLET (v1.1). A Kapcsolat (deep) és a Footer (sink) között eddig
 * egy világos (canvas) blokk ékelődött — a részletes Jogi tájékoztató
 * kiszervezése után ez a maradék, jóval rövidebb blokk vizuálisan túl
 * kicsi volt ahhoz, hogy önálló, világos "szakaszváltásként" hasson:
 * Kapcsolat (sötét) → ez a blokk (világos) → Footer (sötét) két kemény
 * váltást adott egymás után, "szakadék"-érzetet keltve a lap alján.
 *
 * A blokk ezért sötét felületre váltott, PONTOSAN ugyanazokkal a
 * tokenekkel, mint a többi sötét szakasz (.on-dark, .jg-deep-atmosphere,
 * bg-surface-deep, text-porcelain/text-cool-silver/signal-berry-light) —
 * új szín vagy token nem került be. Így Kapcsolat → ez a blokk → Footer
 * EGY folytonos, sötét záró-zónaként olvasódik, érzékelhető váltás
 * nélkül. Az átmenet-sáv (SectionTransition) emiatt gyakorlatilag
 * láthatatlanul olvad össze: mindkét oldala azonos tónusú.
 */

const paragraphClass = "text-[0.9375rem] leading-relaxed text-cool-silver sm:text-base";

export default function LegalRiskBlock() {
  return (
    <section
      aria-label="Panaszkezelés és impresszum"
      className="on-dark relative bg-surface-deep"
    >
      <div
        aria-hidden="true"
        className="jg-deep-atmosphere pointer-events-none absolute inset-0"
      />

      {/*
        A Kapcsolat (deep) felől érkező átmenet. Mindkét oldal azonos tónusú,
        ezért a sáv és a benne lévő hajszálvonal (a forrás sötét, ld.
        SectionTransition) érzékelhetetlenül olvad össze — pontosan ez a
        kívánt hatás.
      */}
      <SectionTransition from="deep" toDark />

      <div className="jg-safe-x relative mx-auto w-full max-w-[1280px] py-14 sm:py-16 lg:py-20">
        {/* Ugyanaz a szűkebb olvasási sáv, mint korábban a Jogi tájékoztatónál. */}
        <div className="max-w-[900px]">
          {/* Panaszkezelés — mindig nyitva, saját horgonnyal. */}
          <div id="panaszkezeles">
            <h2 className="font-display text-xl text-porcelain">
              {complaints.heading}
            </h2>
            <p className={`mt-3 max-w-3xl ${paragraphClass}`}>
              {complaints.lead}
            </p>
            <ul className="mt-4 space-y-2">
              {complaints.items.map((item) => (
                <li
                  key={item.label}
                  className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-4"
                >
                  <span className="text-sm font-medium text-cool-silver sm:w-56 sm:shrink-0">
                    {item.label}
                  </span>
                  {item.href ? (
                    <a
                      href={item.href}
                      className="inline-flex min-h-11 items-center break-all text-base font-medium text-signal-berry-light underline underline-offset-4 transition-colors hover:text-porcelain"
                    >
                      {item.value}
                    </a>
                  ) : (
                    <span className="text-base text-porcelain">{item.value}</span>
                  )}
                </li>
              ))}
            </ul>
            <p className={`mt-4 max-w-3xl ${paragraphClass}`}>
              {complaints.closing}
            </p>
          </div>

          {/* Impresszum — szintén mindig nyitva, változatlan tartalommal. */}
          <div id="impresszum" className="mt-14 border-t border-white/12 pt-7">
            <h2 className="font-display text-xl text-porcelain">
              {imprint.heading}
            </h2>
            <dl className="mt-4 grid gap-3 md:grid-cols-2">
              {imprint.items.map((item) => (
                <div key={item.label}>
                  <dt className="text-sm font-medium text-cool-silver">
                    {item.label}
                  </dt>
                  <dd className="text-[0.9375rem] leading-relaxed text-porcelain sm:text-base">
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
