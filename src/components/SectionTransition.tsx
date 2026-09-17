/**
 * SectionTransition — v1.5.3.
 *
 * Egyetlen, dekoratív fedőréteg a FOGADÓ szakasz tetején, ami az előző
 * szakasz felületét lágyan viszi át a következőbe. Ez váltja ki a korábbi
 * ÁTMENET NÉLKÜLI színugrásokat (mérve 200–223 fokozat a nyolc határból
 * hatnál), köztük a Hero alatti, „fehér csíkként" jelentett vágást.
 *
 * MIÉRT A FOGADÓ OLDALON ÉL?
 * Mert így egyetlen elem felel egy határért. Ha az átmenetet az előző szakasz
 * ALJÁRA tennénk, minden szakasznak tudnia kellene, mi következik utána —
 * az adó oldali és a fogadó oldali réteg pedig könnyen egymásra csúszna.
 *
 * MIÉRT NEM MOZDÍT SEMMIT?
 * `position: absolute; top: 0` — kifolyik a normál elrendezésből, tehát nem
 * ad hozzá magasságot és nem tolja el a horgonyokat. A legmagasabb változat
 * 44 px, a szakaszok belső felső paddingje ennek a többszöröse (72–136 px),
 * tehát szöveget sosem takar. `aria-hidden` + `pointer-events: none`.
 *
 * A HAJSZÁLVONALRÓL (v1.4 `.jg-seam`) — MÉRT DÖNTÉS, NEM ÍZLÉS.
 * Az eddigi rendszerben a sötét szakaszok felső ÉS alsó éle kapott egy
 * hajszálvékony, középen Berryre erősödő fényvonalat: összesen hat vonal, a
 * hat világos↔sötét határon. Ha a helyükön maradnának, minden ilyen határ KÉT
 * elválasztót kapna — a lágy sávot és a vonalat egymás mellett.
 *
 * A vonal ezért ide költözik, a sáv legfelső sorába. De CSAK a SÖTÉT → VILÁGOS
 * határokon. A `.jg-seam` ugyanis egy VILÁGOS (Berry Light, 55%) vonal, ami
 * sötét felületre készült:
 *   – sötét → világos határon a sáv teteje Deep, a vonal ott renderelve
 *     rgb(120,81,103) — PONTOSAN az az érték, amit a v1.4-ben is adott, mert
 *     ott is Deep fölött ült. Változatlan megjelenés.
 *   – világos → sötét határon viszont a sáv teteje Porcelain vagy fehér, és
 *     ugyanez a vonal rgb(220,183,203)-ra jön ki: egy jól látható RÓZSASZÍN
 *     hajszálvonal fehéren. Ez nem a v1.4-es hatás, hanem egy új, feltűnő
 *     elem — szemben a brief kérésével („finom", „ne legyen feltűnő").
 *     Ezeken a határokon a vonal ELMARAD: a lágy sáv önmagában írja le a
 *     váltást.
 * A hajszálvonalak száma tehát hatról háromra csökken; a megmaradó három
 * pixelértékre azonos a korábbival. Ez tudatos, mért kompromisszum, és a
 * v1.5.3 riport külön kitér rá.
 */

/** A felület, AMIRŐL érkezünk. A nevek a Section tone-jaival egyeznek. */
export type TransitionFrom = "canvas" | "surface" | "tint" | "deep" | "sink";

const FROM_CLASS = {
  canvas: "jg-from-canvas",
  surface: "jg-from-surface",
  tint: "jg-from-tint",
  deep: "jg-from-deep",
  sink: "jg-from-sink",
} as const;

const DARK: ReadonlySet<TransitionFrom> = new Set(["deep", "sink"]);

export function isDarkSurface(from: TransitionFrom) {
  return DARK.has(from);
}

type Props = {
  /** Az előző szakasz felülete. */
  from: TransitionFrom;
  /** A saját (fogadó) szakasz sötét-e — ez dönti el a sáv magasságát. */
  toDark: boolean;
};

export default function SectionTransition({ from, toDark }: Props) {
  /*
    Világos → világos határon a mért különbség ~11 fokozat: ott 20 px elég,
    sőt csak annyi szabad. Világos ↔ sötét határon ~200–223 fokozat: 44 px.
  */
  const fromDark = isDarkSurface(from);
  const tall = fromDark || toDark;

  return (
    <div
      aria-hidden="true"
      className={`jg-section-transition ${FROM_CLASS[from]} ${
        tall ? "jg-transition-tall" : "jg-transition-short"
      }`}
    >
      {/*
        A v1.4-es hajszálvonal — kizárólag SÖTÉT felületről érkezve, ahol a
        sáv legfelső sora még teljesen Deep/Sink, tehát a vonal pontosan úgy
        néz ki, mint eddig. Világos felületről érkezve kimarad; az indoklás a
        fájl fejlécében, mért pixelértékekkel.
      */}
      {fromDark ? (
        <span
          aria-hidden="true"
          className="jg-seam pointer-events-none absolute inset-x-0 top-0 block h-px"
        />
      ) : null}
    </div>
  );
}
