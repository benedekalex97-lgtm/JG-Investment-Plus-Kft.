import Section from "./Section";
import { about } from "@/content/homepage";

/**
 * About — 01. szakasz, „Kik vagyunk?".
 *
 * A Lovable editorial kiemelt idézetét átvesszük, de a JG vizuális
 * rendszerében: Newsreader serif, Signal Berry jelzővonal és Aubergine
 * idézőjel — NEM arany, nem fekete-arany brand.
 *
 * A négy információs tétel tényszerű adatsáv, nem marketingállítás. Amelyik
 * compliance-review tétel (felügyeleti hatóság, befektetővédelem), az a
 * content-modellben `complianceReview: true` jelölést kap; hivatalos forrás
 * hiányában NEM kap kitalált hivatkozást.
 */
export default function About() {
  return (
    <Section
      id="rolunk"
      number={about.sectionNumber}
      label={about.sectionLabel}
      heading={about.heading}
      headingId="rolunk-cim"
    >
      <div className="max-w-2xl space-y-5">
        {about.paragraphs.map((paragraph) => (
          <p
            key={paragraph.slice(0, 48)}
            className="text-base leading-relaxed text-text-primary sm:text-[1.0625rem]"
          >
            {paragraph}
          </p>
        ))}
      </div>

      <figure className="mt-9 max-w-2xl border-l-2 border-l-signal-berry pl-5 sm:mt-11 sm:pl-6">
        <blockquote className="font-display text-xl leading-snug text-balance text-text-primary sm:text-2xl">
          <span aria-hidden="true" className="text-accent">
            „
          </span>
          {about.quote}
          <span aria-hidden="true" className="text-accent">
            ”
          </span>
        </blockquote>
      </figure>

      <dl className="mt-10 grid gap-x-10 gap-y-6 border-t border-border pt-7 sm:mt-12 sm:grid-cols-2">
        {about.facts.map((fact) => (
          <div key={fact.label}>
            <dt className="text-xs font-semibold tracking-[0.14em] text-text-secondary uppercase">
              {fact.label}
            </dt>
            <dd className="mt-1.5 text-base leading-relaxed text-text-primary">
              {fact.value}
            </dd>
          </div>
        ))}
      </dl>
    </Section>
  );
}
