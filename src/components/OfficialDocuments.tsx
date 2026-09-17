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
 */
export default function OfficialDocuments() {
  return (
    <Section
      transitionFrom="deep"
      id="hivatalos-dokumentumok"
      number={officialDocuments.sectionNumber}
      label={officialDocuments.sectionLabel}
      heading={officialDocuments.heading}
      headingId="hivatalos-dokumentumok-cim"
      lead={officialDocuments.lead}
      tone="canvas"
      size="compact"
    >
      <ul className="border-t border-border">
        {officialDocuments.items.map((item) => (
          /*
            KATEGÓRIAJELÖLÉS sorszám helyett: egy rövid, Berry-re váltó vonal.
            Tudatos döntés — egy kiírt sorszám szövegcsomópont lenne, és
            beleírna a renderelt oldalszövegbe, amit a copy freeze tilt. Így a
            sorok ritmusa és a hover-visszajelzés megmarad, a szöveg viszont
            karakterre változatlan.
          */
          <li
            key={item.label}
            className="group relative flex items-center gap-5 border-b border-border transition-colors duration-200 hover:bg-white/55"
          >
            <span
              aria-hidden="true"
              className="ml-0 block h-px w-6 shrink-0 bg-border-strong transition-all duration-200 group-hover:w-10 group-hover:bg-signal-berry"
            />
            <a
              href={item.href}
              target="_blank"
              rel="noreferrer noopener"
              className="flex min-h-16 flex-1 items-center gap-5 py-4 pr-2 text-[0.9375rem] font-medium text-text-primary transition-colors group-hover:text-accent sm:text-base"
            >
              <span className="flex-1">
                {item.label}
                <span className="sr-only"> (új lapon nyílik meg)</span>
              </span>
              <span aria-hidden="true" className="link-arrow shrink-0 pr-1 text-signal-berry">
                →
              </span>
            </a>
          </li>
        ))}
      </ul>

      <p className="mt-7 max-w-[70ch] text-sm leading-relaxed text-text-secondary">
        {officialDocuments.note}
      </p>
    </Section>
  );
}
