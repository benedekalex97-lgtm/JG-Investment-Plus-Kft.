import Section from "./Section";
import { process } from "@/content/homepage";

/**
 * Process — 04. szakasz, „Így indul a kapcsolat".
 *
 * A sorszámozás rendezett listával készül, hogy a lépések sorrendje
 * képernyőolvasóval is egyértelmű legyen. Desktopon a számozott jelölőket egy
 * vékony vízszintes vonal köti össze (dekoratív, aria-hidden); mobilon
 * egyszerű vertikális lista.
 */
export default function Process() {
  return (
    <Section
      id="hogyan-mukodik"
      number={process.sectionNumber}
      label={process.sectionLabel}
      heading={process.heading}
      headingId="hogyan-mukodik-cim"
      layout="stack"
    >
      <ol className="relative grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-10">
        <div
          aria-hidden="true"
          className="absolute top-5 right-10 left-10 hidden h-px bg-border-strong lg:block"
        />
        {process.steps.map((step, index) => (
          <li key={step.title} className="relative">
            <span
              aria-hidden="true"
              className="relative z-10 inline-flex h-10 w-10 items-center justify-center rounded-full border border-border-strong bg-canvas text-sm font-semibold tabular-nums text-accent"
            >
              {index + 1}
            </span>
            <h3 className="font-display mt-4 text-lg leading-snug text-text-primary">
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
