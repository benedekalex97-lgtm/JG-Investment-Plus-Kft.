import type { ReactNode } from "react";

import SectionTransition, { type TransitionFrom } from "./SectionTransition";

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
  /**
   * v1.5.3 — az ELŐZŐ szakasz felülete. Ha meg van adva, a szakasz teteje
   * lágy átmenetet kap arról a felületről (ld. SectionTransition). Tisztán
   * dekoratív és abszolút pozicionált: nem ad hozzá magasságot, és nem
   * mozdítja el a horgonyt. Az oldal határláncát a page.tsx sorrendje adja,
   * ezért az értéket ott, a szakasz hívásánál kell helyesen megadni.
   */
  transitionFrom?: TransitionFrom;
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
 * v1.4: a sötét tónusú szakaszok atmoszférát és szakaszhatár-fényvonalat
 * kapnak (ld. lentebb), a fejléc tipográfiája pedig feszesebb lett.
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
  transitionFrom,
  children,
}: SectionProps) {
  const compact = size === "compact";
  const dark = tone === "deep";
  const header = (
    <>
      <p
        className={`flex items-baseline gap-3.5 text-sm font-semibold tracking-[0.18em] uppercase ${
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
          className={`h-px w-7 ${dark ? "bg-signal-berry-light/50" : "bg-border-strong"}`}
        />
        <span>{label}</span>
      </p>
      <h2
        id={headingId}
        className={`font-display mt-6 leading-[1.1] tracking-[-0.014em] [overflow-wrap:normal] hyphens-none text-balance ${
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
          className={`mt-6 max-w-xl text-base leading-[1.72] text-pretty sm:text-[1.0625rem] ${
            dark ? "text-cool-silver" : "text-text-secondary"
          }`}
        >
          {lead}
        </p>
      ) : null}
    </>
  );

  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className={`relative ${TONE_CLASS[tone]}`}
    >
      {/*
        v1.4 — SÖTÉT SZAKASZOK MÉLYSÉGE.

        A sötét szakaszok eddig egyetlen lapos Deep felületen álltak. A
        `.jg-deep-atmosphere` nagyon gyenge, felülről érkező Aubergine
        megvilágítást és peremsötétítést ad — a szakasz teteje egy hajszállal
        világosabb, ott lép be a szem. Dekoratív: aria-hidden és
        pointer-events: none.
      */}
      {dark ? (
        <div
          aria-hidden="true"
          className="jg-deep-atmosphere pointer-events-none absolute inset-0"
        />
      ) : null}

      {/*
        v1.5.3 — SZAKASZÁTMENET.

        A korábbi két `.jg-seam` (a sötét szakaszok felső és alsó éle) innen
        eltűnt, hogy egy határhoz pontosan egy elválasztó tartozzon. A vonal a
        SectionTransition legfelső sorába költözött — de csak ott, ahol SÖTÉT
        felületről érkezünk, mert világos alapon ugyanez a vonal rózsaszín
        hajszálvonalként olvasna. Mért indoklás: a SectionTransition fejléce.
      */}
      {transitionFrom ? (
        <SectionTransition from={transitionFrom} toDark={dark} />
      ) : null}

      <div
        className={`jg-safe-x relative mx-auto w-full max-w-[1280px] ${
          compact ? "py-16 sm:py-20 lg:py-24" : "py-[72px] sm:py-22 lg:py-[136px]"
        }`}
      >
        {layout === "aside" ? (
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-4">
              <div className="lg:sticky lg:top-[120px]">{header}</div>
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
