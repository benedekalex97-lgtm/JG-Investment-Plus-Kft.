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
 * KISZERVEZVE (MOVE, nem REWRITE): a tartalom a lenti egy kivétellel
 * karakterre változatlan, csak a helye és a megjelenítése változott.
 * Korábban a homepage-en, a LegalRiskBlock komponens `#jogi-tajekoztato`
 * szakaszaként, alapállapotban összecsukott accordionban jelent meg;
 * mostantól önálló oldalon (`/jogi-tajekoztato`, ld.
 * src/app/jogi-tajekoztato/page.tsx) él, teljes egészében, kattintás nélkül
 * olvashatóan — ugyanazzal a lapos, összecsukás nélküli szerkezettel, mint
 * az /adatkezelesi-tajekoztato oldal.
 *
 * v1.2 KIVÉTEL (TYPOGRAPHY & CONTENT RHYTHM POLISH v1.0 — MICRO FIX 1). A
 * `lead` mező eredetileg így zárult: „A témakörök alapértelmezés szerint
 * összecsukva jelennek meg, hogy a szakasz áttekinthető maradjon; a
 * kockázati figyelmeztetés mindig nyitva van." Ez a mondat az accordion UI
 * leírása volt, ami az önálló oldalon (nincs accordion, minden szakasz
 * azonnal olvasható) ténybelileg hamissá vált — Alex kifejezett
 * jóváhagyásával eltávolítva. Ez az EGYETLEN szöveges eltérés a forrás
 * DOCX-hez képest; minden más mező (státusz, keretek, korlátok,
 * kockázatok, nyilatkozat, panaszkezelés, impresszum) karakterre
 * változatlan.
 *
 * v1.1 KIEGÉSZÍTÉS (POST-LAUNCH UI POLISH v1.1 — LEGAL CONSOLIDATION).
 * A `complaints` (Panaszkezelés és jogorvoslat) és az `imprint` (Impresszum)
 * IDE, erre az oldalra költözött a homepage-ről (korábban a LegalRiskBlock
 * komponens rendere külön, sötét homepage-blokkban). A homepage-en emiatt
 * ez a két blokk TELJES EGÉSZÉBEN megszűnt, a LegalRiskBlock komponenst
 * töröltem (ld. src/app/page.tsx). A footer mindkettőt most már erre az
 * oldalra mutató horgonyként kezeli: /jogi-tajekoztato#panaszkezeles és
 * /jogi-tajekoztato#impresszum. A szöveg karakterre változatlan — a régi és
 * az új hely tartalmát külön szkripttel összevetve bizonyítva.
 *
 * MI NEM KERÜLT ÁT:
 *   – a `sectionLabel` mező (a homepage-es Section-eyebrow felirata) törölve,
 *     mert az új oldal az adatkezelési tájékoztató mintáját követi (H1 közvetlen
 *     bevezetővel, eyebrow-felirat nélkül) — ez UI-metaadat, nem jogi szöveg.
 *
 * MI VÁLTOZOTT A MEGJELENÉSBEN (a szövegen NEM):
 *   – a „Kockázatok" bekezdés a homepage-en kiemelt, Berry szegélyű dobozban
 *     állt; az új oldalon a többi szakasszal azonos, sima bekezdésként
 *     jelenik meg — ez a kért vizuális/strukturális KONZISZTENCIA az
 *     adatkezelési tájékoztató oldallal (ott sincs kiemelt doboz egyetlen
 *     szakaszhoz sem). A szöveg maga egyetlen karakterben sem változott;
 *   – a Panaszkezelés és az Impresszum a homepage-en SÖTÉT felületen állt
 *     (ld. a törölt LegalRiskBlock korábbi verzióját); ezen az oldalon a
 *     többi szakasszal azonos, VILÁGOS (canvas) felületen jelenik meg —
 *     ugyanazok a világos-kontextusú tokenek (text-text-primary,
 *     text-text-secondary, text-accent), amiket az 1–5. szakasz is használ.
 *
 * MÓDOSÍTÁSI SZABÁLY: a jogi tartalom módosítása kizárólag a forrás DOCX
 * frissítése és jóváhagyása után, ennek a fájlnak a cseréjével történhet.
 */

import type { ContactEntry } from "./homepage";

export const legalNotice: {
  heading: string;
  lead: string;
  status: { heading: string; paragraphs: readonly string[] };
  scope: { heading: string; paragraphs: readonly string[] };
  limits: { heading: string; items: readonly string[] };
  riskWarning: { heading: string; body: string };
  disclaimer: { heading: string; body: string };
  complaints: {
    heading: string;
    lead: string;
    items: readonly ContactEntry[];
    closing: string;
  };
  imprint: {
    heading: string;
    items: readonly { readonly label: string; readonly value: string }[];
  };
} = {
  heading: "Jogi tájékoztató",
  lead: "Az alábbi részletes tájékoztatás teljes egészében elérhető.",
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
  complaints: {
    heading: "Panaszkezelés és jogorvoslat",
    lead: "Amennyiben a K&H Értékpapír szolgáltatásával vagy a JG Investment Plus Kft. függő ügynöki tevékenységével kapcsolatban panasza vagy észrevétele van, azt a Patria Finance Magyarországi Fióktelepe hivatalos elérhetőségein jelentheti be.",
    items: [
      { label: "E-mail", value: "info@khertekpapir.hu", href: "mailto:info@khertekpapir.hu" },
      { label: "Telefon", value: "+36 1 455 1500", href: "tel:+3614551500" },
      {
        label: "Személyes ügyfélszolgálat",
        value: "1095 Budapest, Lechner Ödön fasor 9. – előzetes időpontfoglalással",
      },
      {
        label: "Aktuális panaszkezelési oldal és szabályzat",
        value: "www.khertekpapir.hu/ugyfelvedelem/panaszkezeles",
        href: "https://www.khertekpapir.hu/ugyfelvedelem/panaszkezeles",
      },
    ],
    closing:
      "A panaszkezelés részletes szabályait, az aktuális nyomtatványokat és a jogorvoslati lehetőségeket a K&H Értékpapír mindenkor hatályos Panaszkezelési szabályzata tartalmazza.",
  },
  imprint: {
    heading: "Impresszum",
    items: [
      { label: "Szolgáltató neve", value: "JG Investment Plus Korlátolt Felelősségű Társaság" },
      { label: "Rövidített név", value: "JG Investment Plus Kft." },
      { label: "Székhely", value: "2336 Dunavarsány, Nagyvarsányi utca 133." },
      { label: "Cégjegyzékszám", value: "13-09-236124" },
      { label: "Adószám", value: "32643804-2-13" },
      { label: "E-mail", value: "info@jginvst.com" },
      {
        label: "Függő ügynöki jogállás",
        value:
          "A Patria Finance Magyarországi Fióktelepe Bszt. 111. § (2) bekezdés a) pontja szerinti függő ügynöke",
      },
      {
        /*
          MNB-HATÁROZAT SZÁMA — v1.4.1.

          Szándékosan NEM „engedélyszám": a függő ügynöki jogállás nyilvántartásba
          vételéről szóló HATÁROZAT azonosítója, nem a JG saját tevékenységi
          engedélye. A megnevezés ezért semleges és nem keletkeztet új
          jogosultsági állítást.

          Elhelyezés: kizárólag az Impresszum hivatalos intézményi adatai között,
          közvetlenül a függő ügynöki jogállás után. NEM kerül a Heróba, a
          státuszközlésbe, a Rólunk vagy a Szolgáltatások marketingcopyba, a
          „Miért minket?" szakaszba, illetve a CTA mellé.

          FORRÁS: az MNB Intézménykereső a futtatókörnyezetből NEM volt elérhető
          (az egress-proxy blokkolja az intezmenykereso.mnb.hu hosztot), ezért az
          adat kizárólag a megrendelő által átadott értékből származik, és a
          publikálás előtt hivatalos forrásból megerősítendő.
        */
        label: "MNB-határozat száma",
        value: "H-EN-III-636/2025",
      },
      {
        label: "Megbízó befektetési vállalkozás",
        value: "Patria Finance Magyarországi Fióktelepe – a „K&H Értékpapír” márkanév használója",
      },
      { label: "Megbízó székhelye", value: "1095 Budapest, Lechner Ödön fasor 9." },
      { label: "Megbízó cégjegyzékszáma", value: "01-17-001469" },
      {
        label: "Felügyeleti és nyilvántartási információ",
        value: "Magyar Nemzeti Bank Intézménykereső; K&H Értékpapír – Közvetítők jegyzéke",
      },
    ],
  },
} as const;
