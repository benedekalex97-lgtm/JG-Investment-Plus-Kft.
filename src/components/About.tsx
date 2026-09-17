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
 *
 * v1.4: az idézet Berry jelzővonala felülről lefelé halványodó gradiensre
 * váltott, a facts rail pedig a `.jg-inset-panel` mélységet kapta.
 *
 * v1.4.1: a facts rail NÉGY helyett HÁROM adatpontot tartalmaz (a
 * befektetővédelmi tétel kikerült), ezért a rács 2×2-ről három egyenlő
 * oszlopra vált, a keretlogika pedig indexalapúra. Új adat nem került a
 * helyére.
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

      <Reveal as="figure" delay={90} className="mt-14 max-w-[60ch] sm:mt-16">
        <div className="relative pl-7 sm:pl-9">
          {/* Berry jelzővonal, a tetején erősebb — nem egyenletes border. */}
          <span
            aria-hidden="true"
            className="absolute inset-y-1 left-0 w-0.5 rounded-full bg-gradient-to-b from-signal-berry via-signal-berry/70 to-accent/25"
          />
          <blockquote className="font-display text-[1.6875rem] leading-[1.32] tracking-[-0.01em] text-balance text-text-primary sm:text-[1.9375rem] lg:text-[2.1875rem]">
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
      <Reveal delay={160} className="mt-16 sm:mt-18">
        {/*
          v1.4: a panel nem lapos Deep téglalap többé. A `.jg-inset-panel`
          tonális gradienst (raise -> deep -> sink), felső belső fényt és
          alsó belső mélyedést ad — a sáv így a lapba SÜLLYESZTVE hat, nem
          ráragasztott dashboard-kártyaként. Ikon, pecsét és badge nincs.
        */}
        {/*
          v1.4.1 — HÁROM adatpont (a befektetővédelmi tétel kikerült).

          A korábbi 2×2 rács három elemmel lyukat hagyna a jobb alsó cellában.
          A `nth-child` alapú keretlogika is eltörne: a második elem a felső
          sorban maradna, de `nth-last-child(-n+2)`-ként elveszítené az alsó
          keretét. Ezért a kereteket most az INDEX és a tényleges elemszám
          alapján számoljuk ki, a rács pedig három egyenlő oszlopra vált —
          így a sáv zárt, szimmetrikus marad, és NEM kellett pótlólagos
          adatot kitalálni a szimmetria kedvéért.

          A leghosszabb érték („K&H Értékpapír (Patria Finance Magyarországi
          Fióktelepe)") miatt a cellák vízszintes paddingje szűkebb, a
          szövegméret pedig egy hajszállal kisebb, mint a v1.4-ben.
        */}
        <dl className="jg-inset-panel on-dark grid overflow-hidden rounded-xl sm:grid-cols-3">
          {about.facts.map((fact, index) => (
            <div
              key={fact.label}
              className={`border-white/10 px-6 py-8 sm:px-7 sm:py-9 ${
                index < about.facts.length - 1 ? "border-b sm:border-r sm:border-b-0" : ""
              }`}
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
              <dt className="mt-3.5 text-[0.6875rem] font-semibold tracking-[0.14em] text-cool-silver uppercase">
                {fact.label}
              </dt>
              <dd className="mt-2.5 text-[0.9375rem] leading-[1.6] text-balance text-porcelain">
                {fact.value}
              </dd>
            </div>
          ))}
        </dl>
      </Reveal>
    </Section>
  );
}
