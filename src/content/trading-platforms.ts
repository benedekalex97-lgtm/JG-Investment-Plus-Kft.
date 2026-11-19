/**
 * Kereskedési felületek — a főoldal 04. szakaszának tartalma.
 *
 * A képernyők a K&H Értékpapír NYILVÁNOS bemutatóanyagaiból származnak
 * (forrásjegyzék: docs/trading-platforms-sources.md). A két eszközön két
 * KÜLÖN hivatalos bemutató fut — a webtrader-anyag OTP Bank, a mobiltrader-
 * anyag Tesla Inc adatlapját mutatja —, ezért az eszközfeliratok nevesítik a
 * bemutatott papírt; nem állítunk egyezést, ami a forrásokban nincs.
 *
 * Felhasználási engedély és K&H Compliance/Kommunikáció-jóváhagyás: NINCS
 * igazolva. Publikálás előtti feltétel.
 */
export const tradingPlatforms = {
  sectionNumber: "04",
  heading: "Kereskedési felületek",
  lead: "A K&H Értékpapír digitális felületei számítógépen és mobilon.",
  /**
   * A szakasz alatti közlés — Reni (2026-11-19) által megadott szöveg,
   * karakterre változatlanul. Ez nem jelent K&H Compliance-jóváhagyást.
   */
  notice:
    "A képernyőképek kizárólag a kereskedési felület működésének szemléltetését szolgálják. Az ábrázolt adatok, árfolyamok és hozamok nem feltétlenül aktuálisak, nem minősülnek befektetési ajánlásnak, befektetési tanácsadásnak vagy hozamígéretnek. A képek forrása: K&H Értékpapír.",
  webtrader: {
    name: "K&H webtrader",
    detail: "Portfólió, majd az OTP Bank adatlapja",
    alt: "A K&H webtrader portfólió nézete, majd az OTP Bank részvény adatlapja ötéves árfolyamgrafikonnal (régebbi bemutatóanyag, nem élő adat).",
  },
  mobiltrader: {
    name: "K&H mobiltrader",
    detail: "Áttekintés, keresés, majd a Tesla Inc adatlapja",
    alt: "A K&H mobiltrader áttekintő oldala, a Tesla részvény keresése, majd az adatlap árfolyamgrafikonnal és teljesítményadatokkal (régebbi bemutatóanyag, nem élő adat).",
  },
  /** Rövid szöveges alternatíva a görgetéssel vezérelt bemutatóhoz. */
  description:
    "A bemutató görgetésre lépésről lépésre halad. A laptopon a K&H webtrader portfólió nézete látható, majd az OTP Bank részvény adatlapja árfolyamgrafikonnal és cégleírással. A telefonon a K&H mobiltrader áttekintő oldala után a felhasználó rákeres a Tesla részvényre, megnyitja az adatlapját, ahol betölt az árfolyamgrafikon, majd a teljesítményadatok (vételi és eladási ár, napi minimum és maximum, 52 hetes tartomány) következnek.",
} as const;
