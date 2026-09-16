import Reveal from "./Reveal";
import Section from "./Section";
import { whyJg } from "@/content/homepage";

/**
 * WhyJG — 03. szakasz. A Hero után az oldal MÁSODIK legerősebb vizuális
 * eleme: teljes szélességű, mély sötét márkafelület.
 *
 * Desktop: bal oldalon a nagy cím (sticky), jobb oldalon a három pillér
 * egymás alatt, függőleges elválasztókkal és NAGY, halvány római
 * háttérszámmal. A szöveg nem szorul keskeny oszlopba — a pillérek teljes
 * szélességben futnak, így a hosszabb II. és III. blokk is kényelmesen
 * olvasható.
 *
 * Szövegszínek: Porcelain főszöveg (16.07:1), Cool Silver másodlagos
 * (9.88:1), Berry-light kizárólag a római számon (5.82:1).
 *
 * Nincs pecsét, shield, pipa vagy bármilyen garanciát sugalló grafika.
 */
export default function WhyJG() {
  return (
    <Section
      id="miert-a-jg"
      number={whyJg.sectionNumber}
      label={whyJg.sectionLabel}
      heading={whyJg.heading}
      headingId="miert-a-jg-cim"
      tone="deep"
    >
      <ul className="-mt-2">
        {whyJg.pillars.map((pillar, index) => (
          <Reveal
            as="li"
            key={pillar.title}
            delay={index * 100}
            className="relative border-t border-white/12 py-9 first:border-t-0 first:pt-0 sm:py-11"
          >
            <div className="relative grid gap-4 sm:grid-cols-[auto_1fr] sm:gap-9">
              {/* Nagy, halvány római szám — tisztán tipográfiai jelölés. */}
              <span
                aria-hidden="true"
                className="font-display text-[2.5rem] leading-none tracking-[0.06em] text-signal-berry-light/45 sm:w-16 sm:text-[3.25rem]"
              >
                {pillar.numeral}
              </span>

              <div>
                <h3 className="font-display text-[1.5rem] leading-[1.25] text-porcelain sm:text-[1.75rem]">
                  {pillar.title}
                </h3>
                <p className="mt-3.5 max-w-[72ch] text-base leading-[1.75] text-cool-silver sm:text-[1.0625rem]">
                  {pillar.body}
                </p>
              </div>
            </div>
          </Reveal>
        ))}
      </ul>
    </Section>
  );
}
