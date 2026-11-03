import Reveal from "./Reveal";
import Section from "./Section";
import { whyJg } from "@/content/homepage";

/**
 * WhyJG — 03. szakasz.
 *
 * v1.6 — VILÁGOS SZAKASZ (canvas / Porcelain) a főoldali színritmusban
 * (korábban mély sötét felület volt). Szerkezet és tipográfia változatlan.
 *
 * Desktop: bal oldalon a nagy cím (sticky), jobb oldalon a három pillér
 * egymás alatt, függőleges elválasztókkal és NAGY, halvány római
 * háttérszámmal. A szöveg nem szorul keskeny oszlopba — a pillérek teljes
 * szélességben futnak, így a hosszabb II. és III. blokk is kényelmesen
 * olvasható.
 *
 * Szövegszínek (v1.6): Ink főszöveg, Muted Plum másodlagos szöveg; a
 * dekoratív római szám és az elválasztók Berry-indítása a világos
 * háttérhez készült Signal Berry tónusból.
 *
 * Nincs pecsét, shield, pipa vagy bármilyen garanciát sugalló grafika.
 *
 * Az elválasztók irányított (balról jobbra halványodó) vonalak, rövid Berry
 * indítással — v1.6-tól a világos felülethez illő szürke/Berry tónusban.
 */
export default function WhyJG() {
  return (
    <Section
      id="miert-a-jg"
      number={whyJg.sectionNumber}
      label={whyJg.sectionLabel}
      heading={whyJg.heading}
      headingId="miert-a-jg-cim"
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
              ELVÁLASZTÓ RENDSZER: balról induló, jobbra elhalványuló vonal,
              a bal végén rövid Berry szakasszal — a pillérek így tagoltak,
              de a felület nem esik szét dobozokra. v1.6: világos felületen
              a meglévő border tokenekből, fehér áttetszőség nélkül.
            */}
            {index > 0 ? (
              <>
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-border-strong via-border to-transparent"
                />
                <span
                  aria-hidden="true"
                  className="absolute top-0 left-0 h-px w-14 bg-signal-berry/70"
                />
              </>
            ) : null}

            <div className="relative grid gap-4 sm:grid-cols-[auto_1fr] sm:gap-10">
              {/* Nagy, halvány római szám — tisztán tipográfiai jelölés. */}
              <span
                aria-hidden="true"
                className="font-display text-[2.75rem] leading-[0.9] tracking-[0.06em] text-signal-berry/45 transition-colors duration-500 group-hover:text-signal-berry/70 sm:w-20 sm:text-[3.5rem]"
              >
                {pillar.numeral}
              </span>

              <div>
                <h3 className="font-display text-[1.5rem] leading-[1.22] tracking-[-0.01em] text-text-primary sm:text-[1.8125rem]">
                  {pillar.title}
                </h3>
                <p className="mt-4 max-w-[72ch] text-base leading-[1.76] text-text-secondary sm:text-[1.0625rem]">
                  {pillar.body}
                </p>
              </div>
            </div>
          </Reveal>
        ))}
      </ul>

      {/*
        Kontextuális CTA a szakasz végén. v1.6: világos (canvas) felületen az
        Aubergine háttér + Porcelain felirat (accent / accent-hover) — a
        sötét heróhoz készült `hero-cta-primary` dekoráció nélkül. Ugyanaz a
        forma (rounded-md, min-h-14, hover:-translate-y-px).
      */}
      <Reveal delay={whyJg.pillars.length * 100} className="mt-10 sm:mt-12">
        <a
          href={whyJg.cta.href}
          className="inline-flex min-h-14 items-center justify-center rounded-md bg-accent px-10 text-center text-sm font-semibold tracking-[0.1em] text-porcelain transition duration-200 hover:-translate-y-px hover:bg-accent-hover sm:text-[0.9375rem]"
        >
          {whyJg.cta.label}
        </a>
      </Reveal>
    </Section>
  );
}
