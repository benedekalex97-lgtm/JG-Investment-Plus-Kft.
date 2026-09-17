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
 *
 * v1.4: a szakasz a Section `deep` tónusán keresztül atmoszférát és
 * szakaszhatár-fényvonalat kap, az elválasztók pedig irányított (balról
 * jobbra halványodó) fényvonalra váltottak, rövid Berry indítással.
 */
export default function WhyJG() {
  return (
    <Section
      transitionFrom="surface"
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
            className="group relative py-10 first:pt-0 sm:py-12"
          >
            {/*
              v1.4 — ELVÁLASZTÓ RENDSZER. A v1.3-ban ez egyetlen, egyenletes
              1 px-es fehér vonal volt, ami sötét alapon olcsónak hatott.
              Most balról induló, jobbra elhalványuló fényvonal, a bal
              végén rövid Berry szakasszal: a pillérek így tagoltak, de a
              felület nem esik szét dobozokra.
            */}
            {index > 0 ? (
              <>
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-white/22 via-white/10 to-transparent"
                />
                <span
                  aria-hidden="true"
                  className="absolute top-0 left-0 h-px w-14 bg-signal-berry-light/70"
                />
              </>
            ) : null}

            <div className="relative grid gap-4 sm:grid-cols-[auto_1fr] sm:gap-10">
              {/* Nagy, halvány római szám — tisztán tipográfiai jelölés. */}
              <span
                aria-hidden="true"
                className="font-display text-[2.75rem] leading-[0.9] tracking-[0.06em] text-signal-berry-light/40 transition-colors duration-500 group-hover:text-signal-berry-light/60 sm:w-20 sm:text-[3.5rem]"
              >
                {pillar.numeral}
              </span>

              <div>
                <h3 className="font-display text-[1.5rem] leading-[1.22] tracking-[-0.01em] text-porcelain sm:text-[1.8125rem]">
                  {pillar.title}
                </h3>
                <p className="mt-4 max-w-[72ch] text-base leading-[1.76] text-cool-silver sm:text-[1.0625rem]">
                  {pillar.body}
                </p>
              </div>
            </div>
          </Reveal>
        ))}
      </ul>

      {/*
        v1.1 — POST-LAUNCH UI POLISH v1.1: kontextuális CTA a szakasz végén.
        Sötét (deep) felület — a Hero és a Header CTA-jával AZONOS
        `hero-cta-primary` osztály és színpár (Porcelain háttér, Ink
        felirat), új szín vagy stílus nélkül.
      */}
      <Reveal delay={whyJg.pillars.length * 100} className="mt-10 sm:mt-12">
        <a
          href={whyJg.cta.href}
          className="hero-cta-primary inline-flex min-h-14 items-center justify-center rounded-md bg-porcelain px-10 text-center text-sm font-semibold tracking-[0.1em] text-ink hover:-translate-y-px hover:bg-white sm:text-[0.9375rem]"
        >
          {whyJg.cta.label}
        </a>
      </Reveal>
    </Section>
  );
}
