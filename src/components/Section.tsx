import type { ReactNode } from "react";

type SectionProps = {
  id: string;
  /** Kétjegyű szakaszszám (01–05) — vizuális ritmus, nem tartalom. */
  number?: string;
  label: string;
  heading: string;
  headingId: string;
  lead?: string;
  tone?: "canvas" | "surface" | "tint";
  /**
   * "aside": desktopon aszimmetrikus rács — a fejléc a bal, keskenyebb
   * oszlopban, a tartalom a jobb, szélesebb oszlopban.
   * "stack": a fejléc a tartalom fölött, teljes szélességben.
   */
  layout?: "aside" | "stack";
  children: ReactNode;
};

const TONE_CLASS = {
  canvas: "bg-canvas",
  surface: "bg-surface",
  /** Nagyon halvány Aubergine-tónus — szakaszváltást jelöl, nem színez. */
  tint: "bg-section-tint",
} as const;

/**
 * Section — közös szakaszkeret egységes ritmussal és heading-hierarchiával.
 * Minden szakasz h2 szintű címet kap; a szakaszon belüli tételek h3-at.
 *
 * v1.1: a szakaszok 01–05 sorszámot kapnak, a desktop elrendezés pedig
 * aszimmetrikussá vált (4/8 oszlopos rács a korábbi, minden szakaszon azonos
 * „cím fölül, kártyák alul" séma helyett). A háromféle tónus (canvas /
 * surface / tint) adja a szakaszváltás vizuális ritmusát.
 */
export default function Section({
  id,
  number,
  label,
  heading,
  headingId,
  lead,
  tone = "canvas",
  layout = "aside",
  children,
}: SectionProps) {
  const header = (
    <>
      <p className="flex items-baseline gap-3 text-sm font-semibold tracking-[0.18em] text-accent uppercase">
        {number ? (
          <span className="tabular-nums text-text-secondary">{number}</span>
        ) : null}
        <span aria-hidden="true" className="h-px w-6 bg-border-strong" />
        <span>{label}</span>
      </p>
      <h2
        id={headingId}
        className="font-display mt-4 text-[1.875rem] leading-[1.15] [overflow-wrap:normal] hyphens-none text-balance text-text-primary sm:text-[2.25rem] lg:text-[2.5rem]"
      >
        {heading}
      </h2>
      {lead ? (
        <p className="mt-4 max-w-xl text-base leading-relaxed text-text-secondary sm:text-lg">
          {lead}
        </p>
      ) : null}
    </>
  );

  return (
    <section id={id} aria-labelledby={headingId} className={TONE_CLASS[tone]}>
      <div className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-28">
        {layout === "aside" ? (
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
            <div className="lg:col-span-4">{header}</div>
            <div className="lg:col-span-8">{children}</div>
          </div>
        ) : (
          <>
            <div className="max-w-3xl">{header}</div>
            <div className="mt-10 sm:mt-12">{children}</div>
          </>
        )}
      </div>
    </section>
  );
}
