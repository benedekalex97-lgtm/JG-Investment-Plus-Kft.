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
   *
   * v1.1 — POST-LAUNCH UI & STRUCTURE POLISH, két változás:
   *   1) a korábbi "Jogi tájékoztató" tétel (a homepage saját
   *      #jogi-tajekoztato szakaszára mutatott) átnevezve "Hivatalos
   *      dokumentumok"-ra, és a már meglévő #hivatalos-dokumentumok
   *      szakaszra célozva — a jogi tájékoztató ugyanis önálló oldalra
   *      költözött (/jogi-tajekoztato), a footerből érhető el, a header
   *      pedig ezt a felszabaduló helyet a korábban headerből hiányzó
   *      Hivatalos dokumentumok szakaszra mutató linkre használja fel;
   *   2) a korábbi külön "Kapcsolat" tétel TÖRÖLVE: ez pusztán megismételte
   *      a mellette (a divider után) álló "Kapcsolatfelvétel" CTA célját
   *      (mindkettő "/#kapcsolat"-ra mutatott) — redundáns, egymás melletti
   *      pár volt, nem két különböző cél.
   */
  items: [
    { label: "Rólunk", href: "/#rolunk" },
    { label: "Szolgáltatások", href: "/#szolgaltatasok" },
    { label: "Miért mi?", href: "/#miert-a-jg" },
    { label: "Hivatalos dokumentumok", href: "/#hivatalos-dokumentumok" },
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
  /**
   * v1.5.3 — az eyebrow KÉT, TUDATOSAN külön sor, nem egy elválasztóval
   * összefűzött füzér.
   *
   * Korábban egyetlen sztring volt:
   *   "JG INVESTMENT PLUS KFT. · A K&H ÉRTÉKPAPÍR FÜGGŐ ÜGYNÖKE"
   * Ezt a böngésző szűk viewporton ott törte, ahol éppen elfért — a
   * középpont-elválasztó pedig hol az első sor végén, hol a második elején
   * maradt. A sortörés így nem tervezési döntés volt, hanem a rendelkezésre
   * álló szélesség következménye.
   *
   * A két sor ezért itt, a tartalmi modellben külön mező, és a Hero külön
   * markup-blokkban rendereli őket. Két szándékos eltérés a korábbi
   * sztringhez képest, mindkettő a briefben előírva:
   *   – a „KFT" után NINCS pont (a sor önmagában áll, nem rövidítésként egy
   *     mondat közepén);
   *   – a két sor között NINCS `·` elválasztó (a sortörés maga a tagolás).
   */
  eyebrowLines: [
    "JG INVESTMENT PLUS KFT",
    "A K&H ÉRTÉKPAPÍR FÜGGŐ ÜGYNÖKE",
  ],
  /** A főcím két sorra bontva; együtt: „Biztonság. Átláthatóság. Szakmai háttér." */
  headlineLines: ["Biztonság. Átláthatóság.", "Szakmai háttér."],
  /**
   * Kontrollált tipográfiai kiemelés — NEM tartalmi mező: a főcím szövegét nem
   * változtatja meg, csak megjelöli, melyik szó kapja a Signal Berry színt.
   */
  headlineHighlight: "Átláthatóság.",
  intro:
    "Tájékoztatás a K&H Értékpapírnál elérhető befektetési szolgáltatásokról és pénzügyi eszközökről, személyes kapcsolattartással és érthető folyamatokkal.",
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

/*
 * A korábbi külön `riskWarningSummary` export TÖRÖLVE: a Jogi tájékoztató
 * tetején két, egymást átfedő kockázati bekezdés jelent meg egymás alatt.
 * Mostantól EGYETLEN kockázati blokk van, a docx source of truth teljes
 * szövegével (legal.riskWarning) — ez tartalmazza az összes kötelező elemet
 * (kockázat, részleges vagy teljes tőkevesztés, múltbeli hozam, a hivatalos
 * dokumentumok megismerésének kötelezettsége), ismétlés nélkül.
 */

/**
 * SOT 2. Rólunk — 01
 *
 * A szövegezés forrása a jóváhagyott hero-referencia (Lovable) oldal.
 *
 * v1.4.1: az infosávból KIKERÜLT a „Befektetővédelem — Cseh Befektetővédelmi
 * Alap — 20 000 EUR" tétel. NEM azért, mert tartalmilag hibásnak minősítettük,
 * hanem mert ezen a helyen túl korán és túl nagy bizalmi súllyal jelent meg.
 * A befektetővédelmi tájékoztatás VÁLTOZATLANUL megmarad a „Miért minket?"
 * III. pillérében; új befektetővédelmi állítás sehol nem keletkezett, és a
 * helyére NEM került pótlólagos marketingállítás.
 *
 * A megmaradó „Felügyeleti hatóság" tétel tényszerű közlésként jelenik meg,
 * NEM marketingígéretként, és compliance-review tételként van megjelölve
 * (`complianceReview: true`). Hivatalos forrás hiányában NEM rendelünk hozzá
 * kitalált hivatkozást.
 */
export const about: {
  sectionNumber: string;
  sectionLabel: string;
  heading: string;
  paragraphs: readonly string[];
  quote: string;
  facts: readonly { readonly label: string; readonly value: string; readonly complianceReview: boolean }[];
} = {
  sectionNumber: "01",
  sectionLabel: "Rólunk",
  heading: "Kik vagyunk?",
  paragraphs: [
    "A JG Investment Plus Kft. a K&H Értékpapír (Patria Finance Magyarországi Fióktelepe) függő ügynökeként közvetlen kapcsolatot biztosít ügyfeleink és Magyarország egyik vezető bankcsoporti hátterű brókercége között. Tevékenységünket a Bszt. 111. §-a alapján, a K&H Értékpapír dokumentumai között közzétett, mindenkor hatályos együttműködési hirdetmény keretei között végezzük.",
    "Munkánk középpontjában az átlátható, szakmailag megalapozott tájékoztatás áll.",
  ],
  quote:
    "A pénzügyi döntések nem csupán számokról szólnak, hanem értékekről, célokról és felelős gondolkodásról is.",
  facts: [
    {
      label: "Megbízó befektetési szolgáltató",
      value: "K&H Értékpapír (Patria Finance Magyarországi Fióktelepe)",
      complianceReview: false,
    },
    {
      label: "Jogalap",
      value: "Bszt. 111. § — függő ügynöki tevékenység",
      complianceReview: false,
    },
    {
      label: "Felügyeleti hatóság",
      value: "Magyar Nemzeti Bank (MNB)",
      complianceReview: true,
    },
  ],
};

/**
 * SOT 3. Szolgáltatások — 02
 *
 * A négy blokk címe és szövege a jóváhagyott hero-referencia (Lovable) oldal
 * szövege, szó szerint. A jogi figyelmeztetés SZÁNDÉKOSAN nem ismétlődik
 * blokkonként: a négy blokk alatt egyetlen, visszafogott közös közlés áll.
 */
export const services = {
  sectionNumber: "02",
  sectionLabel: "Szolgáltatások",
  heading: "Miben segítünk?",
  lead: "Az alábbi témakörökben nyújtunk általános, nem személyre szóló tájékoztatást, amely az ügyfél döntési folyamatát készíti elő.",
  items: [
    {
      title: "Pénzügyi lehetőségek bemutatása",
      body: "Vállalkozók és magánszemélyek számára elérhető tőkepiaci eszközök és megtakarítási konstrukciók (például részvények, kötvények, ETF-ek, befektetési alapok és TBSZ-számlák) általános ismertetése, kizárólag tájékoztató jelleggel, egyedi ajánlás nélkül.",
    },
    {
      title: "Megtakarítási és adózási lehetőségek",
      body: "Különböző megtakarítási formák (TBSZ, NYESZ, rendszeres befektetési tervek) működésének, valamint a vonatkozó adójogszabályi környezetnek az általános bemutatása. Nem minősül adótanácsadásnak.",
    },
    {
      title: "Digitális pénzügyi megoldások",
      body: "A K&H Webtrader és Mobiltrader platform lehetőségeinek, funkcióinak és a számlanyitás folyamatának bemutatása. Segítség az online tőkepiaci jelenlét megkezdéséhez.",
    },
    {
      title: "Kapcsolattartás és pénzügyi edukáció",
      body: "Folyamatos kommunikáció, pénzügyi szemléletformálás és tapasztalatcsere hosszú távú együttműködésben. Segítség abban, hogy az ügyfél megalapozottabb kérdésekkel fordulhasson a befektetési szolgáltatóhoz.",
    },
  ],
  /** EGYETLEN közös közlés a négy blokk alatt — nem ismétlődik kártyánként. */
  roleNote: {
    body: "A tényleges befektetési szolgáltatást a K&H Értékpapír nyújtja. A JG Investment Plus Kft. tájékoztatása nem minősül befektetési tanácsadásnak, személyre szóló ajánlásnak vagy adótanácsadásnak.",
  },
  /**
   * v1.1 — POST-LAUNCH UI POLISH v1.1: kontextuális CTA a szakasz végén.
   * Kizárólag BEJÖVŐ kapcsolatfelvételre hív fel (a #kapcsolat szakaszra
   * navigál, ahol a közvetlen telefonos/e-mailes elérhetőségek vannak) —
   * nem ígér visszahívást, űrlapot vagy időpontfoglalást, mert ilyen
   * folyamat jelenleg nem létezik.
   */
  cta: { label: "Egyeztessen velünk", href: "/#kapcsolat" },
} as const;

/**
 * SOT 4. Miért mi? — 03
 *
 * COMPLIANCE-REVIEW TÉTELEK ebben a szakaszban (a riport is felsorolja):
 *   – a cím „pénzügyi biztonsága" fordulata;
 *   – a KBC Csoportra vonatkozó, IDŐÉRZÉKENY adatok (13 millió ügyfél,
 *     397 milliárd euró mérlegfőösszeg) — ellenőrzött hivatalos forrás nélkül
 *     nem módosítandók és nem frissítendők;
 *   – a teljes III. pillér (nyilvántartás, közös felügyelet, 20 000 EUR
 *     befektetővédelmi összeghatár).
 * Egyik sem garanciaként jelenik meg; a UI tényszerű, visszafogott közlésként
 * rendereli őket.
 */
export const whyJg: {
  sectionNumber: string;
  sectionLabel: string;
  heading: string;
  pillars: readonly {
    readonly numeral: string;
    readonly title: string;
    readonly body: string;
    readonly complianceReview: boolean;
  }[];
  cta: { readonly label: string; readonly href: string };
} = {
  sectionNumber: "03",
  sectionLabel: "Miért minket?",
  heading: "Három pillér, egy cél: az Ön pénzügyi biztonsága.",
  pillars: [
    {
      numeral: "I",
      title: "Átláthatóság",
      body: "Minden lépés dokumentált. Ön mindig pontosan tudja, ki felelős miért: a JG Investment Plus Kft. tájékoztat és közvetít, a K&H Értékpapír szolgáltat. Nincsenek rejtett szerepek.",
      complianceReview: false,
    },
    {
      numeral: "II",
      title: "Szakmai háttér",
      body: "A K&H Értékpapír (Patria Finance Magyarországi Fióktelepe) a belgiumi székhelyű nemzetközi pénzügyi szolgáltató KBC Csoport (KBC Group NV) tagja. A KBC Csoport világszerte 13 millió ügyfelet szolgál ki, mérlegfőösszege 397 milliárd euró. A Fióktelep működését a Magyar Nemzeti Bank és a Cseh Nemzeti Bank közösen felügyeli.",
      complianceReview: true,
    },
    {
      numeral: "III",
      title: "Szabályozottság és biztonság",
      body: "A JG Investment Plus Kft. az MNB közvetítői nyilvántartásában szereplő függő ügynök. A K&H Értékpapír működését az MNB és a Cseh Nemzeti Bank közösen felügyeli. A befektetővédelmi alap 20 000 EUR összeghatárig nyújt fedezetet.",
      complianceReview: true,
    },
  ],
  /**
   * v1.1 — POST-LAUNCH UI POLISH v1.1: kontextuális CTA a szakasz végén.
   * Ugyanaz a cél és ugyanaz az elv, mint a `services.cta`-nál: kizárólag
   * bejövő kapcsolatfelvételre hív fel, nem ígér visszahívást, űrlapot vagy
   * időpontfoglalást.
   */
  cta: { label: "Lépjen kapcsolatba velünk", href: "/#kapcsolat" },
};

/*
 * A külön FOLYAMAT („Így indul a kapcsolat") szakasz és a konverziós CTA-sáv
 * („Ismerje meg a lehetőségeket…") TÖRÖLVE: egyik sem része a jóváhagyott
 * hero-referencia (Lovable) oldal szövegének, mindkettő általunk kitalált
 * kiegészítés volt. A konverziós útvonalat a header-CTA, a hero-CTA és a
 * Kapcsolat szakasz biztosítja.
 */

/**
 * Hivatalos dokumentumok — 04
 *
 * A compliance-visszajelzés miatt marad, de vizuálisan MÁSODLAGOS és kompakt,
 * az oldal alsó felében.
 *
 * LINKPOLITIKA: kizárólag ELLENŐRZÖTT, a repositoryban már korábban is
 * használt hivatalos URL-ek. Az egyes dokumentumokhoz NEM találunk ki
 * mélylinket: a K&H Értékpapír ezeket a dokumentum-gyűjtőoldalán teszi közzé,
 * ezért oda mutatnak. A panaszkezelés a saját, szintén ellenőrzött oldalára.
 */
const KH_DOCUMENTS_URL = "https://www.khertekpapir.hu/ugyfeltamogatas/dokumentumok";
const KH_COMPLAINTS_URL = "https://www.khertekpapir.hu/ugyfelvedelem/panaszkezeles";

export const officialDocuments: {
  sectionNumber: string;
  sectionLabel: string;
  heading: string;
  lead: string;
  items: readonly { readonly label: string; readonly href: string }[];
  note: string;
} = {
  sectionNumber: "04",
  sectionLabel: "Hivatalos dokumentumok",
  heading: "Hivatalos dokumentumok",
  lead: "A szolgáltatások részletes feltételeit, költségeit, végrehajtási szabályait és kockázatait a K&H Értékpapír mindenkor hatályos dokumentumai tartalmazzák.",
  items: [
    { label: "Üzletszabályzat", href: KH_DOCUMENTS_URL },
    { label: "Végrehajtási Politika", href: KH_DOCUMENTS_URL },
    { label: "Kondíciós Lista", href: KH_DOCUMENTS_URL },
    { label: "Termék- és kockázati tájékoztatók", href: KH_DOCUMENTS_URL },
    { label: "Mindenkor hatályos ügynöki hirdetmény", href: KH_DOCUMENTS_URL },
    { label: "Panaszkezelési oldal és szabályzat", href: KH_COMPLAINTS_URL },
  ],
  note: "A felsorolt dokumentumokat a K&H Értékpapír a hivatalos dokumentum-gyűjtőoldalán teszi közzé; a hivatkozások oda vezetnek.",
};

/** SOT 5. Kapcsolat */
export const contact: {
  sectionNumber: string;
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
  sectionNumber: "05",
  sectionLabel: "Kapcsolat",
  heading: "Lépjen kapcsolatba velünk",
  lead: "Ha szeretné megismerni a K&H Értékpapírnál elérhető szolgáltatásokat, vagy meglévő ügyfélként a függő ügynöki tevékenység körébe tartozó ügyben keres minket, vegye fel velünk a kapcsolatot.",
  /*
   * v1.1 — POST-LAUNCH UI & STRUCTURE POLISH: a két kapcsolattartó sorrendje
   * cserélve (Lengyel Gábor felülre, Regdon Bence alulra). Kizárólag a
   * sorrend változott — a nevek, telefonszámok és a többi tétel karakterre
   * változatlan.
   */
  details: [
    { label: "E-mail", value: "info@jginvst.com", href: "mailto:info@jginvst.com" },
    { label: "Lengyel Gábor", value: "+36 30 563 2835", href: "tel:+36305632835" },
    { label: "Regdon Bence", value: "+36 30 485 0895", href: "tel:+36304850895" },
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

/**
 * SOT 6. Panaszkezelés és Impresszum — v1.1 (LEGAL CONSOLIDATION) ÁTKÖLTÖZÖTT
 *
 * A korábbi `complaints` és `imprint` export innen (és a homepage-en élő
 * LegalRiskBlock komponensből) átkerült a src/content/legal-notice.ts
 * fájlba: mostantól a `legalNotice.complaints` és `legalNotice.imprint`
 * alatt élnek, a /jogi-tajekoztato oldalon renderelve. A szöveg karakterre
 * változatlan. A LegalRiskBlock komponens törölve (ld. src/app/page.tsx);
 * a footer mindkettőt az új oldal horgonyaira mutatja
 * (/jogi-tajekoztato#panaszkezeles, /jogi-tajekoztato#impresszum).
 *
 * A `ContactEntry` típus exportja alant VÁLTOZATLANUL megmaradt: a
 * `contact` mező (Kapcsolat szakasz) és a legal-notice.ts importálja.
 */

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
    "A „K&H Értékpapír” a Patria Finance Magyarországi Fióktelepe által használt márkanév; az ügyfelek tényleges befektetési szolgáltatója a Fióktelep.",
  disclaimerLine:
    "A weboldal általános tájékoztatást tartalmaz; nem minősül személyre szóló befektetési tanácsadásnak, ajánlatnak, befektetési vagy pénzügyi elemzésnek, illetve adó- vagy jogi tanácsadásnak. A tőkepiaci befektetések kockázattal járnak, és tőkevesztést okozhatnak. A múltbeli hozam nem jelent garanciát a jövőbeni teljesítményre.",
  /*
   * v1.1 — LEGAL CONSOLIDATION: az Impresszum és a Panaszkezelés horgonya a
   * homepage-ről (#impresszum / #panaszkezeles) a Jogi tájékoztató oldal
   * saját horgonyaira váltott, mert mindkét tartalom oda költözött — ld.
   * src/content/legal-notice.ts. A sorrend és a másik három link
   * változatlan.
   */
  links: [
    { label: "Impresszum", href: "/jogi-tajekoztato#impresszum" },
    /**
     * v1.1 — POST-LAUNCH UI & STRUCTURE POLISH: a részletes Jogi tájékoztató
     * (korábban a homepage saját #jogi-tajekoztato szakasza) önálló oldalra
     * költözött — ld. src/content/legal-notice.ts és
     * src/app/jogi-tajekoztato/page.tsx. A szöveg karakterre változatlan.
     */
    { label: "Jogi tájékoztató", href: "/jogi-tajekoztato" },
    /**
     * A K&H/Patria által átadott adatkezelési tájékoztató (adatfeldolgozói)
     * teljes, tartalmilag változatlan szövege a /adatkezelesi-tajekoztato
     * oldalon érhető el — ld. src/content/privacy-policy.ts.
     */
    { label: "Adatkezelési tájékoztató", href: "/adatkezelesi-tajekoztato" },
    { label: "Panaszkezelés", href: "/jogi-tajekoztato#panaszkezeles" },
    {
      label: "K&H Értékpapír dokumentumai",
      href: "https://www.khertekpapir.hu/ugyfeltamogatas/dokumentumok",
    },
  ],
  copyright: "© 2026 JG Investment Plus Kft. – Minden jog fenntartva.",
};
