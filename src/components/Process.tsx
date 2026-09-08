import Section from "./Section";
import { process } from "@/content/homepage";

/**
 * Process — a SOT 4. szakaszának „Így működik a kapcsolatfelvétel” lépéssora.
 * A sorszámozás rendezett listával készül, hogy a lépések sorrendje
 * képernyőolvasóval is egyértelmű legyen.
 *
 * Desktopon visszafogott horizontális timeline: a számozott jelölők egy
 * vékony vízszintes vonallal kapcsolódnak össze (dekoratív, aria-hidden).
 * Mobilon egyszerű, vertikális lista — nincs extra animáció.
 */
export default function Process() {
  return (
    <Section
      id="hogyan-mukodik"
      label={process.sectionLabel}
      heading={process.heading}
      headingId="hogyan-mukodik-cim"
      tone="surface"
    >
      <ol className="relative grid gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
        <div
          aria-hidden="true"
          className="absolute top-5 right-8 left-8 hidden h-px bg-border-strong lg:block"
        />
        {process.steps.map((step, index) => (
          <li key={step.title} className="relative">
            <span
              aria-hidden="true"
              className="relative z-10 inline-flex h-10 w-10 items-center justify-center rounded-full bg-ink text-sm font-medium text-porcelain"
            >
              {index + 1}
            </span>
            <h3 className="mt-4 text-base font-medium text-text-primary">
              {step.title}
            </h3>
            <p className="mt-2 text-base leading-relaxed text-text-secondary">
              {step.body}
            </p>
          </li>
        ))}
      </ol>
    </Section>
  );
}
