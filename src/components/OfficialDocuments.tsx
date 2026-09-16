import Section from "./Section";
import { officialDocuments } from "@/content/homepage";

/**
 * OfficialDocuments — 05. szakasz.
 *
 * Kompakt, rendezett linklista, NEM domináns marketingkártyák. A
 * dokumentumok a K&H Értékpapír hivatalos, ellenőrzött oldalaira mutatnak;
 * kitalált mélylink nincs (ld. a content-modell linkpolitika-jegyzetét).
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
      tone="surface"
    >
      <ul className="border-t border-border">
        {officialDocuments.items.map((item) => (
          <li key={item.label} className="border-b border-border">
            <a
              href={item.href}
              {...(item.external
                ? { target: "_blank", rel: "noreferrer noopener" }
                : {})}
              className="group flex min-h-13 items-center justify-between gap-4 py-3.5 text-base font-medium text-text-primary transition-colors hover:text-accent"
            >
              <span>
                {item.label}
                {item.external ? (
                  <span className="sr-only"> (új lapon nyílik meg)</span>
                ) : null}
              </span>
              <span
                aria-hidden="true"
                className="shrink-0 text-signal-berry transition-transform group-hover:translate-x-0.5"
              >
                →
              </span>
            </a>
          </li>
        ))}
      </ul>

      <p className="mt-5 text-sm leading-relaxed text-text-secondary">
        {officialDocuments.note}
      </p>
    </Section>
  );
}
