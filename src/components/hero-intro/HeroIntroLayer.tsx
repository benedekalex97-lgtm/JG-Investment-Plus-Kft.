import { heroIntroScript } from "./introScript";

/**
 * A 3D-nyitás statikus váza — a főoldal LEGELEJÉN renderelődik.
 *
 *   1) a kihagyó gomb: a DOM-ban az első fókuszálható elem, de CSS-ből csak
 *      futó intró közben látszik (JS nélkül soha);
 *   2) a szinkron vezérlőscript, amely az első festés előtt eldönti, hogy
 *      jöhet-e intro (ld. introScript.ts). Takaró képernyő nincs: a szöveg,
 *      a CTA és a fejléc mindvégig látható.
 *
 * Egyik elem sem hordoz élő régiót: a nyitás nem okoz felolvasást.
 */
export default function HeroIntroLayer() {
  return (
    <>
      <button type="button" data-intro-skip="" className="jg-intro-skip on-dark">
        Animáció kihagyása
      </button>
      <script dangerouslySetInnerHTML={{ __html: heroIntroScript() }} />
    </>
  );
}
