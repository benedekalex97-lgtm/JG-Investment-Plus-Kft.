/**
 * TARTALMI SOURCE OF TRUTH — Jogi tájékoztató
 * ----------------------------------------------------------------------
 * Forrás: JG_Investment_weboldal_vegleges_szovegezes_v1.0.docx
 * (COMPLIANCE-READY WEBSITE COPY — JG Investment Plus Kft.,
 *  Végleges weboldalszövegezés – v1.0, dátum: 2026. szeptember 7.)
 *
 * v1.1 — POST-LAUNCH UI & STRUCTURE POLISH.
 *
 * Ez a fájl a src/content/homepage.ts korábbi `legal` mezőjéből lett
 * KISZERVEZVE (MOVE, nem REWRITE): a tartalom karakterre változatlan, csak a
 * helye és a megjelenítése változott. Korábban a homepage-en, a
 * LegalRiskBlock komponens `#jogi-tajekoztato` szakaszaként, alapállapotban
 * összecsukott accordionban jelent meg; mostantól önálló oldalon
 * (`/jogi-tajekoztato`, ld. src/app/jogi-tajekoztato/page.tsx) él, teljes
 * egészében, kattintás nélkül olvashatóan — ugyanazzal a lapos, összecsukás
 * nélküli szerkezettel, mint az /adatkezelesi-tajekoztato oldal.
 *
 * MI NEM KERÜLT ÁT:
 *   – a `sectionLabel` mező (a homepage-es Section-eyebrow felirata) törölve,
 *     mert az új oldal az adatkezelési tájékoztató mintáját követi (H1 közvetlen
 *     bevezetővel, eyebrow-felirat nélkül) — ez UI-metaadat, nem jogi szöveg;
 *   – a `complaints` (Panaszkezelés) a homepage-en MARADT: a footer továbbra is
 *     önálló, homepage-horgonyra mutató linkként kezeli (#panaszkezeles),
 *     függetlenül ettől az oldaltól — ld. src/content/homepage.ts `complaints`
 *     export.
 *
 * MI VÁLTOZOTT A MEGJELENÉSBEN (a szövegen NEM):
 *   – a „Kockázatok" bekezdés a homepage-en kiemelt, Berry szegélyű dobozban
 *     állt; az új oldalon a többi szakasszal azonos, sima bekezdésként
 *     jelenik meg — ez a kért vizuális/strukturális KONZISZTENCIA az
 *     adatkezelési tájékoztató oldallal (ott sincs kiemelt doboz egyetlen
 *     szakaszhoz sem). A szöveg maga egyetlen karakterben sem változott.
 *
 * MÓDOSÍTÁSI SZABÁLY: a jogi tartalom módosítása kizárólag a forrás DOCX
 * frissítése és jóváhagyása után, ennek a fájlnak a cseréjével történhet.
 */

export const legalNotice = {
  heading: "Jogi tájékoztató",
  lead: "Az alábbi részletes tájékoztatás teljes egészében elérhető. A témakörök alapértelmezés szerint összecsukva jelennek meg, hogy a szakasz áttekinthető maradjon; a kockázati figyelmeztetés mindig nyitva van.",
  status: {
    heading: "Szerepek és felelősség",
    paragraphs: [
      "A JG Investment Plus Kft. (székhely: 2336 Dunavarsány, Nagyvarsányi utca 133.; cégjegyzékszám: 13-09-236124; adószám: 32643804-2-13) a Patria Finance Magyarországi Fióktelepe Bszt. 111. § (2) bekezdés a) pontja szerinti függő ügynöke.",
      "A JG Investment Plus Kft. a Fióktelep megbízásából, a közöttük fennálló együttműködés kereteit rögzítő, mindenkor hatályos ügynöki hirdetményben meghatározott körben jár el. A közvetített befektetési szolgáltatások tényleges nyújtója és az ügyfelek szerződéses partnere a Patria Finance Magyarországi Fióktelepe.",
      "A „K&H Értékpapír” a Patria Finance Magyarországi Fióktelepe által használt márkanév.",
    ],
  },
  scope: {
    heading: "Tevékenységi keretek",
    paragraphs: [
      "A JG Investment Plus Kft. a hatályos ügynöki hirdetményben meghatározott pénzügyi eszközök tekintetében egy vagy több pénzügyi eszközzel kapcsolatos megbízások fogadását és továbbítását, valamint megbízások ügyfél javára történő végrehajtását közvetíti. A mindenkori pontos szolgáltatási és eszközkört a K&H Értékpapír honlapján közzétett hatályos hirdetmény tartalmazza.",
      "Hatályos ügynöki hirdetmény: A Patria Finance Magyarországi Fióktelepe és a JG Investment Plus Kft. közötti együttműködés keretei",
    ],
  },
  limits: {
    heading: "Tevékenységi korlátok",
    items: [
      "A JG Investment Plus Kft. nem nyújt befektetési tanácsadást, nem végez portfóliókezelést, és nem ad személyre szóló befektetési ajánlást.",
      "A függő ügynökkel befektetési szolgáltatási keretszerződés vagy számlavezetési megállapodás nem köthető.",
      "A JG Investment Plus Kft. és munkatársai nem jogosultak ügyfélpénz vagy értékpapír átvételére és kezelésére.",
      "A JG Investment Plus Kft.-nek, képviselőjének, alkalmazottjának, megbízottjának, tulajdonosának vagy ezek hozzátartozójának a K&H Értékpapírnál vezetett számla feletti meghatalmazás nem adható.",
      "Személyes vagy céges adatok, meghatalmazások, értesítési címek vagy értesítési módok változása kizárólag a K&H Értékpapír hivatalos ügyfélszolgálatán jelenthető be.",
      "A JG Investment Plus Kft. kizárólag a K&H Értékpapír által rendelkezésére bocsátott anyagokat továbbíthatja.",
      "Csak a Patria Finance Magyarországi Fióktelepe által megküldött értesítés, visszaigazolás és számlakivonat minősül hivatalos tájékoztatásnak.",
    ],
  },
  riskWarning: {
    heading: "Kockázatok",
    body: "A tőzsdei kereskedés és a tőkepiaci befektetések kockázattal járnak, és tőkevesztést okozhatnak. A pénzügyi eszközök értéke csökkenhet, ezért a befektetett tőke részben vagy egészben elveszhet. A múltbeli hozam nem jelent garanciát a jövőbeni teljesítményre. Befektetési döntés meghozatala előtt ismerje meg a K&H Értékpapír hatályos Üzletszabályzatát, Végrehajtási Politikáját, Kondíciós Listáját, terméktájékoztatóit és kockázati tájékoztatóit.",
  },
  disclaimer: {
    heading: "Jogi nyilatkozat",
    body: "A weboldalon található információk általános tájékoztatási célt szolgálnak. Nem minősülnek pénzügyi eszköz jegyzésére, vételére vagy eladására vonatkozó ajánlatnak vagy ajánlattételi felhívásnak, személyre szóló befektetési tanácsnak, befektetési vagy pénzügyi elemzésnek, befektetéssel kapcsolatos kutatásnak, továbbá pénzügyi, adó- vagy jogi tanácsadásnak. A weboldal használata önmagában nem hoz létre szerződéses jogviszonyt.",
  },
} as const;
