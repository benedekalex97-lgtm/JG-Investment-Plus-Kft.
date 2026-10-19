import { heroIntroScript } from "./introScript";

/**
 * A nyitóanimáció statikus váza — a főoldal LEGELEJÉN renderelődik.
 *
 *   1) a kihagyó gomb: a DOM-ban az első fókuszálható elem, de CSS-ből csak
 *      futó intró közben látszik (JS nélkül soha);
 *   2) a takaró háttér: Carbon/Graphite felület, szintén csak intró közben;
 *   3) a szinkron vezérlőscript, amely az első festés előtt eldönti, hogy
 *      fut-e a nyitás (ld. introScript.ts).
 *
 * Egyik elem sem hordoz élő régiót: a nyitás nem okoz felolvasást.
 */
export default function HeroIntroLayer() {
  return (
    <>
      <button type="button" data-intro-skip="" className="jg-intro-skip on-dark">
        Animáció kihagyása
      </button>
      <div data-intro-cover="" aria-hidden="true" className="jg-intro-cover" />
      <script dangerouslySetInnerHTML={{ __html: heroIntroScript() }} />
    </>
  );
}
