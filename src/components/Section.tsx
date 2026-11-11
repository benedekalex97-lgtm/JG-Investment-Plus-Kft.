import type { ReactNode } from "react";
import Reveal from "./Reveal";
import { MaskWords, rv } from "./RevealParts";

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
 * v1.4: a sötét tónusú szakaszok atmoszférát és szakaszhatár-fényvonalat
 * kapnak (ld. lentebb), a fejléc tipográfiája pedig feszesebb lett.
 *
 * v1.1: a szakaszok 01–05 sorszámot kapnak, a desktop elrendezés pedig
 * aszimmetrikussá vált (4/8 oszlopos rács a korábbi, minden szakaszon azonos
 * „cím fölül, kártyák alul" séma helyett).
 *
 * v1.6: a főoldal ritmusát két tónus adja — `canvas` (Porcelain, világos) és
 * `deep` (sötét). A fejléc (címke, sorszám, h2, lead) színeit a tónus
 * állítja; a szakaszok BELSŐ tartalmának színei a saját komponensükben, a
 * tónushoz igazítva élnek. A `surface` és `tint` tónus a főoldalon jelenleg
 * nincs használatban.
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
  /*
    v2 — SZAKASZFEJLÉC-BELÉPŐ (Reveal group). Egyetlen, koreografált sor:
    a sorszám és a címke közti vonal kirajzolódik, a címke áttűnik, a H2
    vágott sordobozból emelkedik ki, végül a lead követi. A számot nem
    animáljuk: a „hol vagyok?" kérdésre azonnal válaszol.

    NINCS elrendezés-ugrás: minden elem a végleges geometriájával, a helyén
    áll a kezdettől; csak transform / opacity / clip változik. A sticky
    viselkedés a külső div-en marad, a csoport-wrapper egy sima blokk.
  */
  const header = (
    <Reveal variant="group">
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
          data-rv="rule"
          style={rv(0)}
          className={`h-px w-7 ${dark ? "bg-signal-berry-light/50" : "bg-border-strong"}`}
        />
        <span data-rv="fade" style={rv(70)}>
          {label}
        </span>
      </p>
      <h2
        id={headingId}
        data-rv="mask"
        style={rv(140)}
        className={`font-display mt-6 leading-[1.1] tracking-[-0.014em] [overflow-wrap:normal] hyphens-none text-balance ${
          dark ? "text-porcelain" : "text-text-primary"
        } ${
          compact
            ? "text-[1.375rem] sm:text-[1.625rem]"
            : "text-[2rem] sm:text-[2.5rem] lg:text-[2.875rem]"
        }`}
      >
        <MaskWords text={heading} />
      </h2>
      {lead ? (
        <p
          data-rv="rise"
          style={rv(280)}
          className={`mt-6 max-w-xl text-base leading-[1.72] text-pretty sm:text-[1.0625rem] ${
            dark ? "text-cool-silver" : "text-text-secondary"
          }`}
        >
          {lead}
        </p>
      ) : null}
    </Reveal>
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
        v1.6 — SZAKASZHATÁR: nincs átmeneti sáv. A főoldal szakaszai
        szabályos sötét–világos ritmusban váltakoznak (Hero sötét → Rólunk
        világos → Szolgáltatások sötét → Miért minket? világos → Dokumentumok
        sötét → Kapcsolat világos → Footer sötét), a hátterek teljes
        szélességben, hézag és gradiens nélkül találkoznak. A korábbi
        20/44 px-es SectionTransition sávok a világos–sötét határokon ködös
        csíkként látszottak, ezért a főoldalról kikerültek.
      */}
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
