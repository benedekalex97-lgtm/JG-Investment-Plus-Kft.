/**
 * Kereskedési felületek — a főoldal 04. szakaszának tartalma.
 *
 * A képernyők a K&H Értékpapír NYILVÁNOS bemutatóanyagaiból származnak
 * (forrásjegyzék: docs/trading-platforms-sources.md). A két eszközön két
 * KÜLÖN hivatalos bemutató fut — a webtrader a négy oktatóvideóból kivágott
 * képkockákat (OTP Bank adatlap), a mobiltrader a Tesla Inc adatlapját
 * mutatja —, ezért az eszközfeliratok nevesítik a bemutatott papírt; nem
 * állítunk egyezést, ami a forrásokban nincs.
 *
 * Felhasználás: a K&H Értékpapír részéről Jánosi Renáta 2026-11-19-i
 * e-mailjei (a megrendelő által bemutatott képernyőképek) szerint a négy
 * webtrader-oktatóvideóból kivágott képek felhasználhatók, a forrás
 * megjelölésével; a javítások után az élesítés is jóváhagyott. Részletek:
 * docs/trading-platforms-sources.md.
 */
export const tradingPlatforms = {
  sectionNumber: "04",
  heading: "Kereskedési felületek",
  lead: "A K&H Értékpapír digitális felületei számítógépen és mobilon.",
  /**
   * A szakasz alatti közlés — Jánosi Renáta (K&H Értékpapír, 2026-11-19)
   * szövege. Az utolsó mondat az ő kérésére „A képek és videók forrása",
   * mert a webtrader-képek a hivatalos oktatóvideókból kivágott kockák.
   */
  notice:
    "A képernyőképek kizárólag a kereskedési felület működésének szemléltetését szolgálják. Az ábrázolt adatok, árfolyamok és hozamok nem feltétlenül aktuálisak, nem minősülnek befektetési ajánlásnak, befektetési tanácsadásnak vagy hozamígéretnek. A képek és videók forrása: K&H Értékpapír.",
  webtrader: {
    name: "K&H webtrader",
    detail: "Portfólió, az OTP Bank adatlapja, megbízás, pénzműveletek",
    alt: "A K&H webtrader 2.0 portfólió nézete, majd egy részvény keresése és az OTP Bank adatlapja ötéves árfolyamgrafikonnal, a megbízás beadása, a pénzműveletek és a rendszeres befektetés beállítása (a K&H oktatóvideóiból, nem élő adat).",
  },
  mobiltrader: {
    name: "K&H mobiltrader",
    detail: "Áttekintés, keresés, majd a Tesla Inc adatlapja",
    alt: "A K&H mobiltrader áttekintő oldala, a Tesla részvény keresése, majd az adatlap árfolyamgrafikonnal és teljesítményadatokkal (régebbi bemutatóanyag, nem élő adat).",
  },
  /** Rövid szöveges alternatíva a görgetéssel vezérelt bemutatóhoz. */
  description:
    "A bemutató görgetésre lépésről lépésre halad. A laptopon a K&H webtrader portfólió nézete látható, majd a felhasználó részvényt keres, megnyitja az OTP Bank adatlapját árfolyamgrafikonnal és cégleírással, beadja a megbízást, végül a pénzműveletek és a rendszeres befektetés beállítása következik. A telefonon a K&H mobiltrader áttekintő oldala után a felhasználó rákeres a Tesla részvényre, megnyitja az adatlapját, ahol betölt az árfolyamgrafikon, majd a teljesítményadatok (vételi és eladási ár, napi minimum és maximum, 52 hetes tartomány) következnek.",
} as const;
