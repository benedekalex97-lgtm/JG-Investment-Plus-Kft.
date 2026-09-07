import Section from "./Section";
import { process } from "@/content/homepage";

/**
 * Process — a SOT 4. szakaszának „Így működik a kapcsolatfelvétel” lépéssora.
 * A sorszámozás rendezett listával készül, hogy a lépések sorrendje
 * képernyőolvasóval is egyértelmű legyen.
 */
export default function Process() {
  return (
    <Section
      id="hogyan-mukodik"
      label={process.sectionLabel}
      heading={process.heading}
      headingId="hogyan-mukodik-cim"
      tone="ice"
    >
      <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {process.steps.map((step, index) => (
          <li
            key={step.title}
            className="rounded-card border border-silver bg-paper p-6"
          >
            <span
              aria-hidden="true"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-graphite text-sm font-semibold text-paper"
            >
              {index + 1}
            </span>
            <h3 className="mt-4 text-base font-semibold text-graphite">
              {step.title}
            </h3>
            <p className="mt-2 text-base leading-relaxed text-steel">
              {step.body}
            </p>
          </li>
        ))}
      </ol>
    </Section>
  );
}
