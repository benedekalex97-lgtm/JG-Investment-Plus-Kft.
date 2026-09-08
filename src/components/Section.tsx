import type { ReactNode } from "react";

type SectionProps = {
  id: string;
  label: string;
  heading: string;
  headingId: string;
  lead?: string;
  tone?: "canvas" | "surface";
  children: ReactNode;
};

/**
 * Section — közös szakaszkeret egységes ritmussal és heading-hierarchiával.
 * Minden szakasz h2 szintű címet kap; a szakaszon belüli tételek h3-at.
 *
 * Editorial ritmus: bőséges függőleges tér, aubergine eyebrow-label, serif
 * display cím, a lead szöveg olvasási mértékre (max-w) korlátozva.
 */
export default function Section({
  id,
  label,
  heading,
  headingId,
  lead,
  tone = "canvas",
  children,
}: SectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className={tone === "surface" ? "bg-surface" : "bg-canvas"}
    >
      <div className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <p className="text-xs font-medium tracking-[0.16em] text-accent uppercase">
          {label}
        </p>
        <h2
          id={headingId}
          className="font-display mt-3 max-w-2xl text-[1.75rem] leading-[1.2] text-balance text-text-primary sm:text-[2.25rem]"
        >
          {heading}
        </h2>
        {lead ? (
          <p className="mt-4 max-w-xl text-base leading-relaxed text-text-secondary">
            {lead}
          </p>
        ) : null}
        <div className="mt-10 sm:mt-12">{children}</div>
      </div>
    </section>
  );
}
