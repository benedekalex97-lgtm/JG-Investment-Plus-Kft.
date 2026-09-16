import Section from "./Section";
import { about } from "@/content/homepage";

/**
 * About — 01. szakasz. Aszimmetrikus rács: a fejléc bal oldalon, a két
 * bekezdés jobb oldalon, olvasási mértékre korlátozva, alatta egy visszafogott
 * Signal Berry jelzővonallal kiemelt összegző mondat.
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
      <div className="max-w-2xl space-y-5">
        {about.paragraphs.map((paragraph) => (
          <p
            key={paragraph.slice(0, 48)}
            className="text-base leading-relaxed text-text-primary sm:text-[1.0625rem]"
          >
            {paragraph}
          </p>
        ))}
      </div>

      <p className="font-display mt-8 border-l-2 border-l-signal-berry pl-5 text-lg leading-snug text-text-primary sm:mt-10 sm:text-xl">
        {about.highlight}
      </p>
    </Section>
  );
}
