import { Fragment, type CSSProperties } from "react";

/**
 * RevealParts — a Reveal v2 szerveroldali segédei (NEM kliens modul, így
 * szerverkomponensből is hívhatók; a Reveal.tsx "use client", abból a
 * függvények nem exportálhatók ide-oda).
 *
 * `rv(ms)` — egy `[data-rv]` leszármazott saját késleltetése a csoporton
 *   (`<Reveal variant="group">`) belül. A teljes késleltetés a csoport
 *   `--reveal-delay` értékének és a leszármazott `--rv-d` értékének összege
 *   (ld. globals.css, REVEAL v2). Ez egy sima inline CSS változó: JS nélkül
 *   hatástalan, a tartalom ilyenkor is azonnal látszik.
 *
 * `MaskWords` — a címsor szavait külön „sordoboz-maszkba" teszi, hogy a szöveg
 *   egy vágott sorból emelkedjen ki. SZERVEROLDALON készül, ugyanazzal a
 *   markuppal, mint a végleges állapot: nincs hydration-eltérés és nincs
 *   elrendezés-ugrás. A szavak közötti sima szóköz szövegcsomópont marad,
 *   tehát a renderelt szöveg (innerText) karakterre változatlan, és a sortörés
 *   is ugyanott lehetséges. Csak a szóköz (U+0020) mentén vág szavakra; a
 *   törhetetlen szóköz a szón belül marad.
 */
export function rv(ms: number): CSSProperties {
  return { "--rv-d": `${ms}ms` } as CSSProperties;
}

export function MaskWords({ text }: { text: string }) {
  const words = text.split(" ");
  return (
    <>
      {words.map((word, index) => (
        <Fragment key={index}>
          {index > 0 ? " " : null}
          <span className="jg-mw">
            <span className="jg-mi">{word}</span>
          </span>
        </Fragment>
      ))}
    </>
  );
}
