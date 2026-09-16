/**
 * TARTALMI SOURCE OF TRUTH
 * ------------------------
 * Forrás: JG_Investment_weboldal_vegleges_szovegezes_v1.0.docx
 * (COMPLIANCE-READY WEBSITE COPY — JG Investment Plus Kft.,
 *  Végleges weboldalszövegezés – v1.0, dátum: 2026. szeptember 7.)
 *
 * Az alábbi szövegek a dokumentumból szó szerint származnak. A webes
 * megjelenítés érdekében kizárólag tagolás történt (szakasz, kártya, lista);
 * a jelentés, a jogi tartalom, a jogosultsági állítások, a kockázati közlések
 * és a JG / K&H–Patria szerepelhatárolás változatlan.
 *
 * MÓDOSÍTÁSI SZABÁLY: compliance-visszajelzés esetén kizárólag ezt a fájlt
 * kell szerkeszteni. A komponensek nem tartalmaznak beégetett üzleti szöveget.
 *
 * STÁTUSZ: v1.1 — Hero motion + hero-referencia (Lovable) preview-copy. Nem
 * MNB-megfelelő, nem jogilag végleges, nem K&H-jóváhagyott, nem publikálásra
 * kész, nem production-ready. Élesítés előtt a K&H Compliance/Kommunikáció
 * írásbeli jóváhagyása szükséges — a Hero preview-copy mezőire külön is
 * (ld. a `hero` konstans figyelmeztetését).
 */

export const meta = {
  companyShort: "JG Investment Plus Kft.",
  companyLong: "JG Investment Plus Korlátolt Felelősségű Társaság",
  wordmark: "JG Investment Plus",
  documentVersion: "Végleges weboldalszövegezés – v1.0",
} as const;

/** Címkézett elérhetőségi tétel; a href opcionális (pl. a székhely nem link). */
export type ContactEntry = {
  readonly label: string;
  readonly value: string;
  readonly href?: string;
};

/** Lábléc-hivatkozás; a pending tételnek szándékosan nincs célhivatkozása. */
export type FooterLink = {
  readonly label: string;
  readonly href?: string;
  readonly pending?: boolean;
};

export const nav = {
  skipLink: "Ugrás a fő tartalomra",
  menuLabel: "Főnavigáció",
  /* Rövid látható felirat + teljes akadálymentes név (WCAG 2.5.3: a name
     tartalmazza a látható szöveget). */
  openMenu: "Menü",
  closeMenu: "Bezárás",
  openMenuAccessible: "Menü megnyitása",
  closeMenuAccessible: "Menü bezárása",
  /*
   * A hrefek abszolút, "/"-gyel kezdődő útvonalak (pl. "/#rolunk"), nem
   * puszta hash-linkek: így a jelenlegi útvonaltól függetlenül mindig a
   * főoldal megfelelő szakaszára navigálnak — a /adatkezelesi-tajekoztato
   * oldalról indítva sem ragadnak be a jelenlegi útvonalon.
   */
  items: [
    { label: "Rólunk", href: "/#rolunk" },
    { label: "Szolgáltatások", href: "/#szolgaltatasok" },
    { label: "Hogyan működik?", href: "/#hogyan-mukodik" },
    { label: "Jogi tájékoztató", href: "/#jogi-tajekoztato" },
    { label: "Kapcsolat", href: "/#kapcsolat" },
  ],
} as const;

/**
 * SOT 1. Főoldal – Hero
 *
 * v1.1 PUBLIC-READY COPY — compliance-review candidate
 * ----------------------------------------------------
 * A Hero szövegezése konverziófókuszú, de a jogállás mindenhol a docx SOT
 * szerinti „függő ügynök". A korábbi preview-copy három nyitott pontja
 * (a „partnereként" fordulat, a „KÖZVETÍTŐ" megjelölés és az
 * MNB-nyilvántartásra hivatkozó állítás) MIND VISSZAVONVA.
 *
 * Írásbeli K&H Compliance/Kommunikáció jóváhagyás nélkül a verzió továbbra
 * sem nevezhető K&H-approved vagy compliance-approved változatnak.
 */
export const hero = {
  eyebrow: "JG INVESTMENT PLUS KFT. · A K&H ÉRTÉKPAPÍR FÜGGŐ ÜGYNÖKE",
  /** A főcím két sorra bontva; együtt: „Biztonság. Átláthatóság. Szakmai háttér." */
  headlineLines: ["Biztonság. Átláthatóság.", "Szakmai háttér."],
  /**
   * Kontrollált tipográfiai kiemelés — NEM tartalmi mező: a főcím szövegét nem
   * változtatja meg, csak megjelöli, melyik szó kapja a Signal Berry színt.
   */
  headlineHighlight: "Átláthatóság.",
  intro:
    "Tájékoztatás a K&H Értékpapírnál elérhető befektetési szolgáltatásokról és pénzügyi eszközökről — személyes kapcsolattartással, érthető folyamatokkal.",
  primaryCta: { label: "KAPCSOLATFELVÉTEL", href: "/#kapcsolat" },
} as const;

/**
 * SOT 1. — Státuszközlés a Hero alatt.
 *
 * Vizuálisan MÁSODLAGOS, de mindig látható és WCAG AA kontrasztú. Nincs
 * „KÖTELEZŐ STÁTUSZKÖZLÉS" all-caps felirat, nincs domináns kártya vagy
 * háttér — a jogi hierarchia első (legrövidebb) szintje.
 */
export const statusNotice = {
  body: "A JG Investment Plus Kft. a K&H Értékpapír (Patria Finance Magyarországi Fióktelepe) függő ügynöke. A tényleges befektetési szolgáltatást a K&H Értékpapír nyújtja. A JG Investment Plus Kft. nem nyújt befektetési tanácsadást.",
} as const;

/**
 * Kockázati figyelmeztetés — RÖVID, kiemelt összefoglaló.
 *
 * A részletes Jogi tájékoztató accordionján KÍVÜL, alapállapotban láthatóan
 * jelenik meg, közvetlenül a docx SOT teljes kockázati bekezdése (lásd
 * legal.riskWarning) fölött. Egyik sincs elrejtve vagy rövidítve; a két szöveg
 * egy mondata átfed, ezt tudatosan vállaljuk, mert egyiket sem szabad
 * kihagyni. A címke emberi megfogalmazású, nem all-caps riasztás.
 */
export const riskWarningSummary = {
  label: "Kockázatok",
  body: "A tőzsdei kereskedés és a tőkepiaci befektetések kockázattal járnak, és akár a befektetett tőke részleges vagy teljes elvesztését is okozhatják. A múltbeli hozam nem jelent garanciát a jövőbeni teljesítményre.",
} as const;

/** SOT 2. Rólunk — 01 */
export const about = {
  sectionNumber: "01",
  sectionLabel: "Rólunk",
  heading: "Személyes kapcsolat. Egyértelmű szerepek.",
  paragraphs: [
    "A JG Investment Plus Kft. abban segít, hogy közérthetően megismerje a K&H Értékpapírnál elérhető befektetési szolgáltatásokat, pénzügyi eszközöket és az ügyintézés fő lépéseit. Személyes kapcsolattartással támogatjuk az eligazodást és a kapcsolatfelvételt.",
    "Függő ügynökként a mindenkor hatályos ügynöki hirdetményben meghatározott keretek között járunk el. A tényleges befektetési szolgáltatást és a hivatalos ügyféltájékoztatást a K&H Értékpapír (Patria Finance Magyarországi Fióktelepe) nyújtja.",
  ],
  highlight: "Érthető tájékoztatás. Átlátható folyamat. Személyes elérhetőség.",
} as const;

/** SOT 3. Szolgáltatások — 02 */
export const services = {
  sectionNumber: "02",
  sectionLabel: "Szolgáltatások",
  heading: "Miben segítünk?",
  lead: "Segítünk eligazodni a K&H Értékpapírnál elérhető lehetőségek, dokumentumok és ügyintézési folyamatok között.",
  items: [
    {
      title: "Elérhető lehetőségek bemutatása",
      body: "Közérthetően bemutatjuk a K&H Értékpapírnál elérhető befektetési szolgáltatások és pénzügyi eszközök fő jellemzőit. A tájékoztatás általános jellegű, és nem tartalmaz személyre szóló befektetési ajánlást.",
    },
    {
      title: "Kapcsolatfelvétel és számlanyitási folyamat",
      body: "Segítünk elérni a mindenkor hatályos hivatalos tájékoztatókat, és bemutatjuk a kapcsolatfelvétel, valamint a számlanyitás fő lépéseit. A szerződéskötés és a tényleges befektetési szolgáltatás a K&H Értékpapírral történik.",
    },
    {
      title: "Meglévő ügyfelek támogatása",
      body: "A mindenkor hatályos ügynöki hirdetményben meghatározott keretek között támogatjuk a kapcsolattartást és az engedélyezett közvetítői folyamatokat.",
    },
    {
      title: "Hivatalos dokumentumok és csatornák",
      body: "Segítünk eligazodni abban, hogy egy adott kérdéssel, dokumentummal vagy ügyintézési igénnyel melyik hivatalos K&H Értékpapír-csatornához szükséges fordulni.",
    },
  ],
  /**
   * EGYETLEN, közös szereptisztázás a négy blokk alatt — a jogi hierarchia
   * második szintje. Szándékosan NEM ismétlődik kártyánként.
   */
  roleNote: {
    label: "Fontos tudnivaló",
    body: "A JG Investment Plus Kft. nem nyújt befektetési tanácsadást, nem végez portfóliókezelést, és nem ad személyre szóló befektetési ajánlást.",
  },
} as const;

/** SOT 4. Miért a JG? — 03 */
export const whyJg = {
  sectionNumber: "03",
  sectionLabel: "Miért a JG?",
  heading: "A személyes kapcsolattartás értéke",
  pillars: [
    {
      title: "Átlátható működés",
      body: "Pontosan megmutatjuk, mely feladatokat végezzük mi, és mely szolgáltatásokat nyújtja közvetlenül a K&H Értékpapír.",
    },
    {
      title: "Személyes elérhetőség",
      body: "Elérhető kapcsolattartókkal és érthető ügyintézési útvonalakkal segítjük az érdeklődőket és a meglévő ügyfeleket.",
    },
    {
      title: "Szabályozott háttér",
      body: "Tevékenységünket a vonatkozó jogszabályok, a K&H Értékpapír szabályzatai és a mindenkor hatályos ügynöki hirdetmény keretei között végezzük.",
    },
  ],
} as const;

/** SOT 4. Folyamat — 04 */
export const process = {
  sectionNumber: "04",
  sectionLabel: "Folyamat",
  heading: "Így indul a kapcsolat",
  steps: [
    {
      title: "Kapcsolatfelvétel",
      body: "Röviden egyeztetjük, milyen témában keres tájékoztatást.",
    },
    {
      title: "Lehetőségek és dokumentumok",
      body: "Bemutatjuk a releváns, hivatalos K&H Értékpapír-információkat és dokumentumokat.",
    },
    {
      title: "Hivatalos ügyintézés",
      body: "A számlanyitás, szerződéskötés és a tényleges befektetési szolgáltatás a K&H Értékpapírral történik.",
    },
    {
      title: "Folyamatos kapcsolattartás",
      body: "A mindenkor hatályos ügynöki keretek között segítjük az eligazodást és az ügyintézést.",
    },
  ],
} as const;

/**
 * Konverziós CTA-sáv a folyamat után.
 * Nincs sürgetés, hiányérzet, hozamígéret vagy mesterséges exkluzivitás.
 */
export const ctaBand = {
  heading: "Ismerje meg a lehetőségeket személyes kapcsolattartással.",
  body: "Vegye fel velünk a kapcsolatot, ha szeretne közérthető tájékoztatást kapni a K&H Értékpapírnál elérhető szolgáltatásokról és a következő lépésekről.",
  cta: { label: "KAPCSOLATFELVÉTEL", href: "/#kapcsolat" },
} as const;

/**
 * SOT — Hivatalos dokumentumok — 05
 *
 * LINKPOLITIKA: kizárólag ELLENŐRZÖTT, a repositoryban már korábban is
 * használt hivatalos URL-ek szerepelnek. Az egyes dokumentumokhoz NEM
 * találunk ki mélylinket: a K&H Értékpapír a felsorolt dokumentumokat a
 * dokumentum-gyűjtőoldalán teszi közzé, ezért azok oda mutatnak. A
 * panaszkezelés a saját, szintén ellenőrzött oldalára mutat.
 */
const KH_DOCUMENTS_URL = "https://www.khertekpapir.hu/ugyfeltamogatas/dokumentumok";
const KH_COMPLAINTS_URL = "https://www.khertekpapir.hu/ugyfelvedelem/panaszkezeles";

export const officialDocuments: {
  sectionNumber: string;
  sectionLabel: string;
  heading: string;
  lead: string;
  items: readonly { readonly label: string; readonly href: string; readonly external: boolean }[];
  note: string;
} = {
  sectionNumber: "05",
  sectionLabel: "Hivatalos dokumentumok",
  heading: "Döntés előtt ismerje meg a hivatalos dokumentumokat",
  lead: "A hivatalos, mindenkor hatályos dokumentumokat a K&H Értékpapír teszi közzé. Befektetési döntés előtt ezek megismerése szükséges.",
  items: [
    { label: "Üzletszabályzat", href: KH_DOCUMENTS_URL, external: true },
    { label: "Végrehajtási Politika", href: KH_DOCUMENTS_URL, external: true },
    { label: "Kondíciós Lista", href: KH_DOCUMENTS_URL, external: true },
    { label: "Termék- és kockázati tájékoztatók", href: KH_DOCUMENTS_URL, external: true },
    { label: "Mindenkor hatályos ügynöki hirdetmény", href: KH_DOCUMENTS_URL, external: true },
    { label: "Panaszkezelési oldal és szabályzat", href: KH_COMPLAINTS_URL, external: true },
  ],
  note: "A felsorolt dokumentumokat a K&H Értékpapír a hivatalos dokumentum-gyűjtőoldalán teszi közzé; a hivatkozások oda vezetnek.",
};

/** SOT 5. Kapcsolat */
export const contact: {
  sectionLabel: string;
  heading: string;
  lead: string;
  details: readonly ContactEntry[];
  businessHours: {
    heading: string;
    items: readonly { readonly market: string; readonly value: string }[];
  };
  khSupport: { heading: string; items: readonly ContactEntry[] };
  orderNotice: string;
} = {
  sectionLabel: "Kapcsolat",
  heading: "Lépjen kapcsolatba velünk",
  lead: "Ha szeretné megismerni a K&H Értékpapírnál elérhető szolgáltatásokat, vagy meglévő ügyfélként a függő ügynöki tevékenység körébe tartozó ügyben keres minket, vegye fel velünk a kapcsolatot.",
  details: [
    { label: "E-mail", value: "info@jginvst.com", href: "mailto:info@jginvst.com" },
    { label: "Regdon Bence", value: "+36 30 485 0895", href: "tel:+36304850895" },
    { label: "Lengyel Gábor", value: "+36 30 563 2835", href: "tel:+36305632835" },
    { label: "Székhely", value: "2336 Dunavarsány, Nagyvarsányi utca 133." },
  ],
  businessHours: {
    heading: "Ügynöki üzleti órák",
    items: [
      {
        market: "Budapesti Értéktőzsde",
        value: "hétfő–péntek 9:00–17:15, tőzsdei szünnapok kivételével.",
      },
      {
        market: "Nemzetközi piacok",
        value:
          "hétfő–péntek 9:00–17:15, a nemzetközi tőzsdék nyitvatartásához igazodva; magyar ünnepnapokon zárva.",
      },
    ],
  },
  khSupport: {
    heading: "K&H Értékpapír ügyfélszolgálat",
    items: [
      { label: "Telefon", value: "+36 1 455 1500", href: "tel:+3614551500" },
      {
        label: "E-mail",
        value: "info@khertekpapir.hu",
        href: "mailto:info@khertekpapir.hu",
      },
      { label: "Cím", value: "1095 Budapest, Lechner Ödön fasor 9." },
      {
        label: "Online elérhetőség",
        value: "www.khertekpapir.hu/tarsasagunk/kapcsolat",
        href: "https://www.khertekpapir.hu/tarsasagunk/kapcsolat",
      },
    ],
  },
  orderNotice:
    "Tőzsdei megbízást kizárólag a K&H Értékpapír és a hatályos ügynöki hirdetmény által meghatározott csatornán és üzleti időben lehet megadni.",
};

/** SOT 6. Jogi tájékoztató */
export const legal: {
  sectionLabel: string;
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
} = {
  sectionLabel: "Jogi tájékoztató",
  heading: "Jogi tájékoztató",
  lead: "Az alábbi részletes tájékoztatás teljes egészében elérhető. A témakörök alapértelmezés szerint összecsukva jelennek meg, hogy áttekinthető maradjon; a kockázati figyelmeztetés mindig nyitva van.",
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
};

/** SOT 9. Impresszum */
export const imprint = {
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
} as const;

/** SOT 10. Lábléc – kötelező rövid változat */
export const footer: {
  statusLine: string;
  brandLine: string;
  disclaimerLine: string;
  links: readonly FooterLink[];
  copyright: string;
} = {
  statusLine:
    "JG Investment Plus Kft. · A K&H Értékpapír (Patria Finance Magyarországi Fióktelepe) függő ügynöke.",
  brandLine:
    "A „K&H Értékpapír” a Patria Finance Magyarországi Fióktelepe mint az ügyfelek tényleges befektetési szolgáltatója által használt márkanév.",
  disclaimerLine:
    "A weboldal általános tájékoztatást tartalmaz; nem minősül személyre szóló befektetési tanácsadásnak, ajánlatnak, befektetési vagy pénzügyi elemzésnek, illetve adó- vagy jogi tanácsadásnak. A tőkepiaci befektetések kockázattal járnak, és tőkevesztést okozhatnak. A múltbeli hozam nem jelent garanciát a jövőbeni teljesítményre.",
  links: [
    { label: "Impresszum", href: "/#impresszum" },
    /**
     * A K&H/Patria által átadott adatkezelési tájékoztató (adatfeldolgozói)
     * teljes, tartalmilag változatlan szövege a /adatkezelesi-tajekoztato
     * oldalon érhető el — ld. src/content/privacy-policy.ts.
     */
    { label: "Adatkezelési tájékoztató", href: "/adatkezelesi-tajekoztato" },
    { label: "Panaszkezelés", href: "/#panaszkezeles" },
    {
      label: "K&H Értékpapír dokumentumai",
      href: "https://www.khertekpapir.hu/ugyfeltamogatas/dokumentumok",
    },
  ],
  copyright: "© 2026 JG Investment Plus Kft. – Minden jog fenntartva.",
};
