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
      tone="surface"
    >
      <ul className="grid gap-5 md:grid-cols-2">
        {services.items.map((item) => (
          <li
            key={item.title}
            className="rounded-card border border-border bg-canvas p-6 shadow-soft"
          >
            <h3 className="text-lg font-medium text-text-primary">
              {item.title}
            </h3>
            <p className="mt-3 text-base leading-relaxed text-text-secondary">
              {item.body}
            </p>
          </li>
        ))}
      </ul>

      {/* FONTOS KORLÁT — a SOT kiemelt keretes közlése, láthatóan megtartva. */}
      <div className="mt-6 rounded-card border border-border border-l-[3px] border-l-accent bg-canvas p-5 shadow-soft">
        <h3 className="text-xs font-medium tracking-[0.14em] text-accent uppercase">
          {services.importantLimit.label}
        </h3>
        <p className="mt-2 text-base leading-relaxed font-medium text-text-primary">
          {services.importantLimit.body}
        </p>
      </div>
    </Section>
  );
}
