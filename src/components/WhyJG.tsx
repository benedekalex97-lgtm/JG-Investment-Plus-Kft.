import Section from "./Section";
import { whyJg } from "@/content/homepage";

/**
 * WhyJG — 03. szakasz. Három pillér, számozott felső jelzővonallal.
 * Nem tartalmaz eredmény-, hozam- vagy tőkebiztonsági ígéretet.
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
      <ul className="grid gap-8 sm:grid-cols-3 sm:gap-7">
        {whyJg.pillars.map((pillar) => (
          <li key={pillar.title} className="border-t-2 border-t-accent pt-5">
            <h3 className="font-display text-xl leading-snug text-text-primary">
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
