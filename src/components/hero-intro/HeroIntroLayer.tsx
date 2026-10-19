import { heroIntroScript, introConfig } from "./introScript";

/**
 * A nyitójelenet statikus váza — a főoldal LEGELEJÉN (a fejléc ELŐTT)
 * renderelődik, közvetlenül a <body> alatt, így egyetlen szülő sem vágja le
 * és nem zárja alacsonyabb rétegbe:
 *
 *   1) a Graphite nyitóháttér (fixed, teljes képernyő, a fejléc fölött);
 *   2) a „Kihagyás" gomb (a nyitóháttér és a 3D-canvas fölött);
 *   3) a szinkron vezérlőscript, amely az első festés előtt eldönti, hogy
 *      jár-e nyitás (ld. introScript.ts).
 *
 * Alapból (és JS nélkül) mindkét elem rejtett: csak a vezérlő stílusa
 * kapcsolja be őket. A `data-jg-intro` jelöli, hogy a nyitás alatt ezek NEM
 * kerülnek inert állapotba. Élő régió nincs: a nyitás nem okoz felolvasást.
 *
 * Újrajátszás csak preview/helyi buildben: /?intro=replay (production
 * buildben — VERCEL_ENV=production — ki van kapcsolva).
 */
export default function HeroIntroLayer() {
  const allowReplay = process.env.VERCEL_ENV !== "production";
  return (
    <>
      <div data-jg-intro="" className="jg-intro-overlay" aria-hidden="true" />
      <button type="button" data-jg-intro="" data-intro-skip="" className="jg-intro-skip on-dark">
        Kihagyás
      </button>
      <script dangerouslySetInnerHTML={{ __html: heroIntroScript({ ...introConfig, allowReplay }) }} />
    </>
  );
}
