import Section from "./Section";
import { services } from "@/content/homepage";

/**
 * Services — 02. szakasz, „Miben segítünk?".
 *
 * A négy blokk számozott, vékony osztóvonalakkal tagolt lista — nem
 * bekeretezett kártyahalmaz. A jogi figyelmeztetés SZÁNDÉKOSAN nem ismétlődik
 * blokkonként: a négy blokk alatt egyetlen, visszafogott közös közlés áll.
 */
export default function Services() {
  return (
    <Section
      id="szolgaltatasok"
      number={services.sectionNumber}
      label={services.sectionLabel}
      heading={services.heading}
      headingId="szolgaltatasok-cim"
      lead={services.lead}
      tone="surface"
    >
      <ul className="grid gap-x-12 gap-y-9 sm:grid-cols-2">
        {services.items.map((item, index) => (
          <li key={item.title} className="border-t border-border pt-5">
            <span
              aria-hidden="true"
              className="text-xs font-semibold tabular-nums text-text-secondary"
            >
              {String(index + 1).padStart(2, "0")}
            </span>
            <h3 className="font-display mt-2 text-xl leading-snug text-text-primary">
              {item.title}
            </h3>
            <p className="mt-2.5 text-base leading-relaxed text-text-secondary">
              {item.body}
            </p>
          </li>
        ))}
      </ul>

      {/* EGYETLEN közös közlés — visszafogott, nem riasztó doboz. */}
      <p className="mt-10 border-l-2 border-l-accent bg-canvas px-5 py-4 text-base leading-relaxed text-text-primary">
        {services.roleNote.body}
      </p>
    </Section>
  );
}
