import Reveal from "./Reveal";
import { rv } from "./RevealParts";
import Section from "./Section";
import { officialDocuments } from "@/content/homepage";

/**
 * OfficialDocuments — 04. szakasz.
 *
 * Vizuálisan MÁSODLAGOS (kisebb címsor, szűkebb ritmus), de nem egyszerű
 * HTML-lista: 56–64 px magas sorok, kategóriajelölő sorszámmal, hoverre
 * Berry-vonallal és jobbra mozduló nyíllal. Nem kaphat nagyobb vizuális
 * súlyt, mint a Szolgáltatások vagy a Kapcsolat.
 *
 * LINKPOLITIKA: kizárólag ellenőrzött hivatalos K&H-URL-ek; kitalált
 * mélylink nincs (ld. a content-modell jegyzetét).
 *
 * v1.6 — SÖTÉT SZAKASZ (deep) a főoldali színritmusban. A kompakt, listás
 * szerkezet változatlan; a listaelemek Porcelain, a megjegyzés Cool Silver,
 * a vonalak kontrollált fehér áttetszőségűek, a hover/nyíl Signal Berry
 * Light.
 */
export default function OfficialDocuments() {
  return (
    <Section
      id="hivatalos-dokumentumok"
      number={officialDocuments.sectionNumber}
      label={officialDocuments.sectionLabel}
      heading={officialDocuments.heading}
      headingId="hivatalos-dokumentumok-cim"
      lead={officialDocuments.lead}
      tone="deep"
      size="compact"
    >
      {/*
        v2 — a sorok rövid staggerrel lépnek be (Reveal group; a sor
        hover-viselkedése változatlan, mert a belépő CSS animation, nem
        transition — nem írja felül a sor háttér-átmenetét).
      */}
      <Reveal variant="group">
        <ul className="border-t border-white/12">
          {officialDocuments.items.map((item, index) => (
            /*
              KATEGÓRIAJELÖLÉS sorszám helyett: egy rövid, Berry-re váltó vonal.
              Tudatos döntés — egy kiírt sorszám szövegcsomópont lenne, és
              beleírna a renderelt oldalszövegbe, amit a copy freeze tilt. Így a
              sorok ritmusa és a hover-visszajelzés megmarad, a szöveg viszont
              karakterre változatlan.
            */
            <li
              key={item.label}
              data-rv="rise"
              style={rv(index * 70)}
              className="group relative flex items-center gap-5 border-b border-white/12 transition-colors duration-200 hover:bg-white/[0.04] has-[a:active]:bg-white/[0.08]"
            >
              <span
                aria-hidden="true"
                className="ml-0 block h-px w-6 shrink-0 bg-white/30 transition-all duration-200 group-hover:w-10 group-hover:bg-signal-berry-light"
              />
              <a
                href={item.href}
                target="_blank"
                rel="noreferrer noopener"
                className="flex min-h-16 flex-1 items-center gap-5 py-4 pr-2 text-[0.9375rem] font-medium text-porcelain transition-colors group-hover:text-signal-berry-light sm:text-base"
              >
                <span className="flex-1">
                  {item.label}
                  <span className="sr-only"> (új lapon nyílik meg)</span>
                </span>
                <span aria-hidden="true" className="link-arrow shrink-0 pr-1 text-signal-berry-light">
                  →
                </span>
              </a>
            </li>
          ))}
        </ul>

        <p
          data-rv="fade"
          style={rv(officialDocuments.items.length * 70 + 60)}
          className="mt-7 max-w-[70ch] text-sm leading-relaxed text-cool-silver"
        >
          {officialDocuments.note}
        </p>
      </Reveal>
    </Section>
  );
}
