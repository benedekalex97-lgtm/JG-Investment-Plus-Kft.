import Section from "./Section";
import { faq } from "@/content/faq";

/**
 * Faq — 04. szakasz, „Gyakori kérdések".
 *
 * SZERKEZET: natív <details>/<summary>. A projekt egyetlen meglévő
 * accordionja (LegalAccordion) kliens-komponens és egyszerre csak egy panelt
 * enged nyitva, a GYIK viszont többet is nyitva tarthat, és a tartalma nem
 * függhet a JavaScripttől — ezért itt a böngésző saját megoldása a megfelelő.
 *
 *   – a kérdések ÉS a válaszok az első kiszolgált HTML-ben ott vannak,
 *     bezárt állapotban is (a böngésző a zárt <details> tartalmát nem
 *     jeleníti meg, de a DOM-ban és a szövegkeresésben megmarad);
 *   – Tab / Enter / Space natívan működik, a nyitott/zárt állapotot a
 *     böngésző adja át a képernyőolvasónak;
 *   – nincs automatikus görgetés, nincs magasság-animáció (nem vághatja le a
 *     tartalmat), csak egy rövid áttűnés nyitáskor, amit a reduced-motion
 *     kikapcsol (ld. .jg-faq-answer a globals.css-ben);
 *   – nincs scrollhoz kötött mozgás és nincs Reveal: a szöveg sosem ragadhat
 *     rejtve horgonyra ugrás után.
 *
 * HEADING: a szakaszcím h2 (Section), minden kérdés h3, a <summary>-n belül.
 *
 * FELÜLET: a főoldalon a Miért minket? (canvas/Porcelain) és a sötét
 * Hivatalos dokumentumok közé ékelődik. Világos marad, de a `surface` (fehér)
 * tónust kapja + hajszálvonalat a tetején, hogy ne olvadjon össze a
 * Porcelain szomszédjával (ld. a Section jegyzetét).
 *
 * LINKPOLITIKA: a külső források a meglévő mintát követik (target="_blank",
 * rel="noopener noreferrer", akadálymentes „új lapon nyílik meg" jelzés).
 * Strukturált adat (FAQPage/QAPage) szándékosan NINCS.
 */
export default function Faq() {
  return (
    <Section
      id="gyakori-kerdesek"
      number={faq.sectionNumber}
      label={faq.sectionLabel}
      heading={faq.heading}
      headingId="gyakori-kerdesek-cim"
      tone="surface"
    >
      <div className="border-t border-border-strong">
        {faq.items.map((item) => (
          <details key={item.question} className="group border-b border-border">
            <summary className="flex min-h-16 w-full cursor-pointer list-none items-center justify-between gap-5 py-4 text-left transition-colors marker:content-none hover:text-accent [&::-webkit-details-marker]:hidden">
              <h3 className="font-display text-[1.1875rem] leading-[1.3] tracking-[-0.008em] text-balance text-text-primary group-hover:text-accent sm:text-[1.3125rem]">
                {item.question}
              </h3>
              <span
                aria-hidden="true"
                className="relative flex size-8 shrink-0 items-center justify-center rounded-full border border-border-strong text-signal-berry transition-colors duration-200 group-hover:border-signal-berry group-open:border-signal-berry"
              >
                {/* Plusz: vízszintes + függőleges vonal; nyitva a függőleges eltűnik (mínusz). */}
                <span className="absolute block h-px w-3 bg-current" />
                <span className="absolute block h-3 w-px bg-current transition-transform duration-200 group-open:scale-y-0" />
              </span>
            </summary>

            <div className="jg-faq-answer pb-8 pr-2 sm:pr-14">
              <div className="max-w-[68ch] space-y-4 text-base leading-[1.75] text-text-primary sm:text-[1.0625rem]">
                {item.answer.map((paragraph) => (
                  <p key={paragraph.slice(0, 40)}>{paragraph}</p>
                ))}
              </div>

              {item.sources.length > 0 ? (
                <div className="mt-6 max-w-[68ch] border-t border-border pt-4">
                  <p className="text-xs font-semibold tracking-[0.14em] text-text-secondary uppercase">
                    Források
                  </p>
                  <ul className="mt-1 flex flex-col sm:flex-row sm:flex-wrap sm:gap-x-7">
                    {item.sources.map((source) => (
                      <li key={source.href}>
                        <a
                          href={source.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex min-h-11 items-center text-[0.9375rem] font-medium text-accent underline underline-offset-4 transition-colors hover:text-signal-berry"
                        >
                          {source.label}
                          <span className="sr-only"> (új lapon nyílik meg)</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          </details>
        ))}
      </div>

      {/* Közös tájékoztatás — mindig látható, jól olvasható szöveg, nem apróbetű. */}
      <p className="mt-10 max-w-[80ch] border-l-2 border-l-accent pl-5 text-base leading-[1.7] text-text-primary">
        {faq.notice}
      </p>
    </Section>
  );
}
