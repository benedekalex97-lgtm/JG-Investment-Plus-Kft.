import Section from "./Section";
import { whyJg } from "@/content/homepage";

/**
 * WhyJG — 03. szakasz, „Három pillér, egy cél…".
 *
 * A három pillér római számozású, felső Aubergine jelzővonallal. A tartalom
 * tényszerű közlésként jelenik meg: nincs garanciaként ható vizuális
 * megerősítés (nincs pecsét, pipa, badge vagy kiemelt „biztonság" grafika).
 * A compliance-review tételeket a content-modell jelöli; a riport tételesen
 * felsorolja őket.
 */
export default function WhyJG() {
  return (
    <Section
      id="miert-a-jg"
      number={whyJg.sectionNumber}
      label={whyJg.sectionLabel}
      heading={whyJg.heading}
      headingId="miert-a-jg-cim"
      tone="tint"
    >
      <ul className="grid gap-9 sm:grid-cols-3 sm:gap-7">
        {whyJg.pillars.map((pillar) => (
          <li key={pillar.title} className="border-t-2 border-t-accent pt-5">
            <span
              aria-hidden="true"
              className="font-display text-sm tracking-[0.2em] text-text-secondary"
            >
              {pillar.numeral}
            </span>
            <h3 className="font-display mt-1.5 text-xl leading-snug text-text-primary">
              {pillar.title}
            </h3>
            <p className="mt-2.5 text-base leading-relaxed text-text-secondary">
              {pillar.body}
            </p>
          </li>
        ))}
      </ul>
    </Section>
  );
}
