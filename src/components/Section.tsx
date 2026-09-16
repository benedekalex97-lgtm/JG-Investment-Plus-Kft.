import type { ReactNode } from "react";

type SectionProps = {
  id: string;
  /** Kétjegyű szakaszszám (01–05) — vizuális ritmus, nem tartalom. */
  number?: string;
  label: string;
  heading: string;
  headingId: string;
  lead?: string;
  tone?: "canvas" | "surface" | "tint" | "deep";
  /**
   * "aside": desktopon aszimmetrikus rács — a fejléc a bal, keskenyebb
   * oszlopban, a tartalom a jobb, szélesebb oszlopban.
   * "stack": a fejléc a tartalom fölött, teljes szélességben.
   */
  layout?: "aside" | "stack";
  /**
   * "compact": kisebb címsor és szűkebb függőleges ritmus — vizuálisan
   * MÁSODLAGOS szakaszokhoz (pl. hivatalos dokumentumok), amelyeknek jelen
   * kell lenniük, de nem versenyezhetnek az értékajánlattal.
   */
  size?: "default" | "compact";
  children: ReactNode;
};

const TONE_CLASS = {
  canvas: "bg-canvas",
  surface: "bg-surface",
  /** Nagyon halvány Aubergine-tónus — szakaszváltást jelöl, nem színez. */
  tint: "bg-section-tint",
  /** Mély, sötét márkafelület. Az `on-dark` osztály a fókuszgyűrűt is váltja. */
  deep: "on-dark bg-surface-deep",
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
  size = "default",
  children,
}: SectionProps) {
  const compact = size === "compact";
  const dark = tone === "deep";
  const header = (
    <>
      <p
        className={`flex items-baseline gap-3 text-sm font-semibold tracking-[0.18em] uppercase ${
          dark ? "text-signal-berry-light" : "text-accent"
        }`}
      >
        {number ? (
          <span className={`tabular-nums ${dark ? "text-cool-silver" : "text-text-secondary"}`}>
            {number}
          </span>
        ) : null}
        <span
          aria-hidden="true"
          className={`h-px w-6 ${dark ? "bg-white/25" : "bg-border-strong"}`}
        />
        <span>{label}</span>
      </p>
      <h2
        id={headingId}
        className={`font-display mt-5 leading-[1.12] [overflow-wrap:normal] hyphens-none text-balance ${
          dark ? "text-porcelain" : "text-text-primary"
        } ${
          compact
            ? "text-[1.375rem] sm:text-[1.625rem]"
            : "text-[2rem] sm:text-[2.5rem] lg:text-[2.875rem]"
        }`}
      >
        {heading}
      </h2>
      {lead ? (
        <p
          className={`mt-5 max-w-xl text-base leading-[1.7] sm:text-lg ${
            dark ? "text-cool-silver" : "text-text-secondary"
          }`}
        >
          {lead}
        </p>
      ) : null}
    </>
  );

  return (
    <section id={id} aria-labelledby={headingId} className={TONE_CLASS[tone]}>
      <div
        className={`mx-auto w-full max-w-[1280px] px-5 sm:px-6 lg:px-8 ${
          compact ? "py-16 sm:py-20 lg:py-24" : "py-[72px] sm:py-22 lg:py-[136px]"
        }`}
      >
        {layout === "aside" ? (
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-4">
              <div className="lg:sticky lg:top-[112px]">{header}</div>
            </div>
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
