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
      <ul className="grid gap-4 md:grid-cols-3">
        {whyJg.pillars.map((pillar) => (
          <li
            key={pillar.title}
            className="rounded-card border border-silver bg-ice p-6"
          >
            <h3 className="text-lg font-semibold text-graphite">
              {pillar.title}
            </h3>
            <p className="mt-3 text-base leading-relaxed text-steel">
              {pillar.body}
            </p>
          </li>
        ))}
      </ul>
    </Section>
  );
}
