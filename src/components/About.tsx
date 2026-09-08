import Section from "./Section";
import { about } from "@/content/homepage";

export default function About() {
  return (
    <Section
      id="rolunk"
      label={about.sectionLabel}
      heading={about.heading}
      headingId="rolunk-cim"
    >
      <div className="grid gap-x-10 gap-y-5 md:grid-cols-2">
        {about.paragraphs.map((paragraph) => (
          <p
            key={paragraph.slice(0, 48)}
            className="text-base leading-relaxed text-text-primary"
          >
            {paragraph}
          </p>
        ))}
      </div>
    </Section>
  );
}
