import Section from "./Section";
import { services } from "@/content/homepage";

export default function Services() {
  return (
    <Section
      id="szolgaltatasok"
      label={services.sectionLabel}
      heading={services.heading}
      headingId="szolgaltatasok-cim"
      lead={services.lead}
      tone="ice"
    >
      <ul className="grid gap-4 md:grid-cols-2">
        {services.items.map((item) => (
          <li
            key={item.title}
            className="rounded-card border border-silver bg-paper p-6"
          >
            <h3 className="text-lg font-semibold text-graphite">{item.title}</h3>
            <p className="mt-3 text-base leading-relaxed text-steel">
              {item.body}
            </p>
          </li>
        ))}
      </ul>

      {/* FONTOS KORLÁT — a SOT kiemelt keretes közlése, láthatóan megtartva. */}
      <div className="mt-6 rounded-card border-l-4 border-action border-y border-r border-y-silver border-r-silver bg-paper p-5">
        <h3 className="text-xs font-bold tracking-widest text-action uppercase">
          {services.importantLimit.label}
        </h3>
        <p className="mt-2 text-base leading-relaxed font-medium text-graphite">
          {services.importantLimit.body}
        </p>
      </div>
    </Section>
  );
}
