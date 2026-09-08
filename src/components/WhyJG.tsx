import Section from "./Section";
import { whyJg } from "@/content/homepage";

export default function WhyJG() {
  return (
    <Section
      id="miert-a-jg"
      label={whyJg.sectionLabel}
      heading={whyJg.heading}
      headingId="miert-a-jg-cim"
      lead={whyJg.subheading}
    >
      <ul className="grid gap-5 md:grid-cols-3">
        {whyJg.pillars.map((pillar) => (
          <li key={pillar.title} className="border-t border-border-strong pt-5">
            <h3 className="font-display text-lg text-text-primary">
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
