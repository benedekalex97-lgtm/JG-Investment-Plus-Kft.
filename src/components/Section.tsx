import type { ReactNode } from "react";

type SectionProps = {
  id: string;
  label: string;
  heading: string;
  headingId: string;
  lead?: string;
  tone?: "paper" | "ice";
  children: ReactNode;
};

/**
 * Section — közös szakaszkeret egységes ritmussal és heading-hierarchiával.
 * Minden szakasz h2 szintű címet kap; a szakaszon belüli tételek h3-at.
 */
export default function Section({
  id,
  label,
  heading,
  headingId,
  lead,
  tone = "paper",
  children,
}: SectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className={tone === "ice" ? "bg-ice" : "bg-paper"}
    >
      <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <p className="text-xs font-bold tracking-widest text-action uppercase">
          {label}
        </p>
        <h2
          id={headingId}
          className="mt-3 max-w-3xl text-2xl leading-tight font-semibold tracking-tight text-balance text-graphite sm:text-3xl"
        >
          {heading}
        </h2>
        {lead ? (
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-steel">
            {lead}
          </p>
        ) : null}
        <div className="mt-8 sm:mt-10">{children}</div>
      </div>
    </section>
  );
}
