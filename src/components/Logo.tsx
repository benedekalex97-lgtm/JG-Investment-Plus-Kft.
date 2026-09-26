import { meta } from "@/content/homepage";

/**
 * Logo — JG Investment Plus Logo System v1.0.
 *
 * A jóváhagyott „Symmetric Core" (Logo Validation v0.8) szimbólum tiszta,
 * matematikai rekonstrukciója — NEM bitmap-trace. Teljes leírás, szerkesztési
 * szabályok és tiltott használatok: docs/brand/logo-system-v1.md.
 *
 * GEOMETRIA (88 × 99 egység, 1 modul = m = 8 egység, minden él 1:2 — 26,57° —
 * lejtésű vagy függőleges):
 *   - felső fedőlap: rombusz, 9m széles × 4,5m magas, a tengelyen középre;
 *   - két pillér: 4m széles, külső él 9,5m, belső él 5,5m magas; a felső él
 *     párhuzamos a fedőlap alsó élével (függőleges távolság 9 egység);
 *   - központi nyílás: 3m (24 egység) széles, alul nyitott.
 * A jel az x = 44 függőleges tengelyre PONTOSAN szimmetrikus: a jobb pillér
 * minden csúcsa a bal pillér csúcsának tükörképe (x -> 88 - x).
 *
 * A wordmark valódi HTML-szöveg (Inter), NEM körvonalazott vektor: amíg nincs
 * dedikált, körvonalazott wordmark-master, a lockup = SVG szimbólum + élő szöveg.
 * A szöveg a meta.wordmark értéke; a nagybetűsítés CSS, így a képernyőolvasó
 * a természetes „JG Investment Plus" alakot olvassa fel, egyszer.
 */

/** A mester-szimbólum koordinátarendszere. */
export const JG_MARK_VIEWBOX = "0 0 88 99";

/** Mester-geometria: felső fedőlap, bal pillér, jobb pillér (tükrözött). */
export const JG_MARK_PATH =
  "M44 0 80 18 44 36 8 18Z M0 23 32 39 32 83 0 99Z M88 23 56 39 56 83 88 99Z";

type LogoVariant = "mark" | "horizontal" | "stacked";

/**
 * A téma a HÁTTÉR-kontextust jelöli ki, nem a jel színét:
 *   light     — világos (Porcelain) alapon: Carbon jel és szöveg;
 *   dark      — sötét (Carbon / deep) alapon: Porcelain jel és szöveg;
 *   aubergine — másodlagos változat világos alapon: Aubergine jel és szöveg.
 * A jel `currentColor`-t használ, így a szín egyetlen osztályból öröklődik.
 */
type LogoTheme = "light" | "dark" | "aubergine";

const THEME_CLASS: Record<LogoTheme, string> = {
  light: "text-carbon",
  dark: "text-porcelain",
  aubergine: "text-aubergine",
};

type LogoProps = {
  variant?: LogoVariant;
  theme?: LogoTheme;
  /**
   * A lockup a betűmérethez skálázódik (a jel magassága em-ben van megadva),
   * ezért a méretet egy text-* osztály adja. A `mark` variánsnál a
   * magasságot közvetlenül kell megadni (pl. `h-8`).
   */
  className?: string;
  /** A wordmark szövegére kerülő kiegészítő osztály (pl. reszponzív sr-only). */
  wordmarkClassName?: string;
  /**
   * Csak a `mark` variánsnál: ha a jel mellett van látható márkanév vagy a
   * szülő elem már megnevezi, a jel dekoratív (aria-hidden) legyen.
   */
  decorative?: boolean;
};

function Mark({ className, label }: { className: string; label?: string }) {
  return (
    <svg
      viewBox={JG_MARK_VIEWBOX}
      width="88"
      height="99"
      fill="currentColor"
      className={className}
      {...(label
        ? { role: "img", "aria-label": label }
        : { "aria-hidden": true, focusable: false })}
    >
      <path d={JG_MARK_PATH} />
    </svg>
  );
}

export default function Logo({
  variant = "horizontal",
  theme = "light",
  className,
  wordmarkClassName = "",
  decorative = false,
}: LogoProps) {
  const color = THEME_CLASS[theme];

  if (variant === "mark") {
    return (
      <Mark
        label={decorative ? undefined : meta.wordmark}
        className={`${color} w-auto shrink-0 ${className ?? "h-8"}`}
      />
    );
  }

  /*
    Arányok a nyílásszélességből (X = 24/99 × jelmagasság):
      horizontal — jel 2,5em, térköz 1,25X ≈ 0,76em;
      stacked    — jel 3,5em, térköz 1X ≈ 0,85em.
    A -mr a betűköz utolsó betű utáni többletét veszi vissza, így a
    wordmark optikailag nem tolódik el (különösen a középre zárt stackednél).
  */
  const stacked = variant === "stacked";

  return (
    <span
      className={`${color} inline-flex ${
        stacked ? "flex-col items-center gap-[0.85em]" : "items-center gap-[0.76em]"
      } ${className ?? ""}`}
    >
      <Mark
        className={`${stacked ? "h-[3.5em]" : "h-[2.5em]"} w-auto shrink-0`}
      />
      <span
        className={`-mr-[0.14em] font-sans leading-none font-medium tracking-[0.14em] whitespace-nowrap uppercase ${wordmarkClassName}`}
      >
        {meta.wordmark}
      </span>
    </span>
  );
}
