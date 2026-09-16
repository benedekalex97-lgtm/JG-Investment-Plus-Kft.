import Reveal from "./Reveal";
import Section from "./Section";
import { about } from "@/content/homepage";

/**
 * About — 01. szakasz, „Kik vagyunk?".
 *
 * v1.3: editorial kétoszlopos szerkezet. Bal oldalon a szakaszfejléc
 * desktopon megtapad (sticky), jobb oldalon a folyó szöveg 65–72 karakteres
 * sorhosszra korlátozva, alatta a nagy Newsreader idézet.
 *
 * A négy információs adat nem szövegrács, hanem összefüggő „institutional
 * facts rail": egyetlen, kontrasztos Carbon inset panel, számozott
 * adatpontokkal és függőleges elválasztókkal. Tényszerű, nem marketingjellegű.
 * Mobilon függőleges, elválasztott lista.
 */
export default function About() {
  return (
    <Section
      id="rolunk"
      number={about.sectionNumber}
      label={about.sectionLabel}
      heading={about.heading}
      headingId="rolunk-cim"
    >
      <Reveal className="max-w-[68ch] space-y-6">
        {about.paragraphs.map((paragraph) => (
          <p
            key={paragraph.slice(0, 48)}
            className="text-[1.0625rem] leading-[1.75] text-text-primary sm:text-[1.125rem]"
          >
            {paragraph}
          </p>
        ))}
      </Reveal>

      <Reveal as="figure" delay={90} className="mt-12 max-w-[60ch] sm:mt-14">
        <div className="border-l-2 border-l-signal-berry pl-6 sm:pl-8">
          <blockquote className="font-display text-[1.625rem] leading-[1.35] text-balance text-text-primary sm:text-[1.875rem] lg:text-[2.125rem]">
            <span aria-hidden="true" className="text-signal-berry">
              „
            </span>
            {about.quote}
            <span aria-hidden="true" className="text-signal-berry">
              ”
            </span>
          </blockquote>
        </div>
      </Reveal>

      {/*
        Institutional facts rail — kontrasztos Carbon panel. Tényszerű
        adatsáv, nem marketingblokk: nincs ikon, pecsét vagy badge.
      */}
      <Reveal delay={160} className="mt-14 sm:mt-16">
        <dl className="on-dark grid overflow-hidden rounded-lg bg-surface-deep sm:grid-cols-2">
          {about.facts.map((fact, index) => (
            <div
              key={fact.label}
              className="border-b border-white/10 px-6 py-7 last:border-b-0 sm:border-r sm:[&:nth-child(2n)]:border-r-0 sm:[&:nth-last-child(-n+2)]:border-b-0 sm:px-8"
            >
              {/*
                Finom GEOMETRIAI jelölés, nem sorszám. Tudatos döntés: egy
                kiírt sorszám szövegcsomópont lenne, és beleírna a renderelt
                oldalszövegbe — a copy freeze miatt a szövegnek karakterre
                változatlannak kell maradnia. A jelölés hossza az adatpont
                sorszámával nő, tehát a ritmust ugyanúgy megadja.
              */}
              <span aria-hidden="true" className="flex items-center gap-1">
                {Array.from({ length: index + 1 }, (_, i) => (
                  <span key={i} className="block h-0.5 w-2.5 bg-signal-berry-light" />
                ))}
              </span>
              <dt className="mt-3 text-[0.6875rem] font-semibold tracking-[0.12em] text-cool-silver uppercase">
                {fact.label}
              </dt>
              <dd className="mt-2 text-[0.9375rem] leading-relaxed text-porcelain">
                {fact.value}
              </dd>
            </div>
          ))}
        </dl>
      </Reveal>
    </Section>
  );
}
