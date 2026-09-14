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
 * STÁTUSZ: v0.2 vizuális rendszer + Hero motion prototípus. Nem MNB-megfelelő, nem jogilag végleges,
 * nem K&H-jóváhagyott, nem publikálásra kész, nem production-ready.
 * Élesítés előtt a K&H Compliance/Kommunikáció írásbeli jóváhagyása szükséges.
 */

export const meta = {
  companyShort: "JG Investment Plus Kft.",
  companyLong: "JG Investment Plus Korlátolt Felelősségű Társaság",
  wordmark: "JG Investment Plus",
  documentVersion: "Végleges weboldalszövegezés – v1.0",
  prototypeStatus:
    "v0.2 vizuális rendszer + Hero motion – belső review céljára. Nem publikálásra kész.",
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
  items: [
    { label: "Rólunk", href: "#rolunk" },
    { label: "Szolgáltatások", href: "#szolgaltatasok" },
    { label: "Hogyan működik?", href: "#hogyan-mukodik" },
    { label: "Jogi tájékoztató", href: "#jogi-tajekoztato" },
    { label: "Kapcsolat", href: "#kapcsolat" },
  ],
} as const;

/** SOT 1. Főoldal – Hero */
export const hero = {
  eyebrow: "JG Investment Plus Kft. · A K&H Értékpapír függő ügynöke",
  /** A főcím két sorra bontva a soronkénti reveal animációhoz. */
  headlineLines: [
    "Közvetlen kapcsolat a tőkepiacokhoz.",
    "Átlátható, szabályozott keretek között.",
  ],
  /** Kontrollált kiemelés: a második sor ezen kifejezése kap Action Blue színt. */
  headlineHighlight: "szabályozott keretek között",
  intro:
    "Bemutatjuk a K&H Értékpapír szolgáltatásait és az általa forgalmazott pénzügyi eszközöket, támogatjuk a kapcsolatfelvételt, valamint a hatályos ügynöki hirdetményben meghatározott körben közreműködünk a megbízások fogadásában, továbbításában és végrehajtásában.",
  primaryCta: { label: "Kapcsolatfelvétel", href: "#kapcsolat" },
  secondaryCta: {
    label: "K&H Értékpapír dokumentumai",
    href: "https://www.khertekpapir.hu/ugyfeltamogatas/dokumentumok",
  },
} as const;

/** SOT 1. — KÖTELEZŐ STÁTUSZKÖZLÉS A HERO KÖZELÉBEN */
export const statusNotice = {
  label: "Kötelező státuszközlés",
  body: "A tényleges befektetési szolgáltató a Patria Finance Magyarországi Fióktelepe, amely a „K&H Értékpapír” márkanevet használja. A JG Investment Plus Kft. a Fióktelep függő ügynöke, és nem nyújt befektetési tanácsadást.",
} as const;

/** SOT 1. — KIEMELT KOCKÁZATI FIGYELMEZTETÉS */
export const heroRiskWarning = {
  label: "Kiemelt kockázati figyelmeztetés",
  body: "A tőzsdei kereskedés és a tőkepiaci befektetések kockázattal járnak, és akár a befektetett tőke részleges vagy teljes elvesztését is okozhatják. A múltbeli hozam nem jelent garanciát a jövőbeni teljesítményre.",
} as const;

/** SOT 2. Rólunk */
export const about = {
  sectionLabel: "Rólunk",
  heading: "Kik vagyunk?",
  paragraphs: [
    "A JG Investment Plus Kft. a K&H Értékpapír (Patria Finance Magyarországi Fióktelepe) Bszt. 111. § (2) bekezdés a) pontja szerinti függő ügynöke. Társaságunk a Fióktelep megbízásából, a hatályos ügynöki hirdetményben meghatározott keretek között jár el.",
    "Feladatunk elsősorban új ügyfelek megszólítása, a K&H Értékpapír szolgáltatásainak és az általa forgalmazott pénzügyi eszközöknek a bemutatása, valamint az ügyfél és a befektetési szolgáltató közötti kapcsolat támogatása. Meglévő ügyfelek esetében a hirdetmény szerinti körben megbízások fogadásában, továbbításában és végrehajtásában is közreműködünk.",
    "A számlavezetést és a tényleges befektetési szolgáltatást a Patria Finance Magyarországi Fióktelepe nyújtja. A szerződéseket, hivatalos értesítéseket, visszaigazolásokat és számlakivonatokat a Fióktelep bocsátja az ügyfelek rendelkezésére.",
    "A JG Investment Plus Kft. nem nyújt befektetési tanácsadást, nem végez portfóliókezelést, és nem ad személyre szóló ajánlást pénzügyi eszköz megvásárlására, eladására vagy portfólió összeállítására.",
  ],
} as const;

/** SOT 2. Rólunk — Egyértelmű szerepek (szereptisztázás) */
export const roleClarification = {
  sectionLabel: "Szereptisztázás",
  heading: "Egyértelmű szerepek",
  roles: [
    {
      actor: "JG Investment Plus Kft.",
      body: "tájékoztatás, kapcsolatfelvétel támogatása és a hirdetményben engedélyezett közvetítői tevékenység.",
    },
    {
      actor: "K&H Értékpapír",
      body: "a tényleges befektetési szolgáltató, a számlavezetés és a hivatalos ügyféltájékoztatás felelőse.",
    },
    {
      actor: "Ügyfél",
      body: "a hivatalos dokumentumok és kockázatok megismerését követően saját döntést hoz.",
    },
  ],
} as const;

/** SOT 3. Szolgáltatások */
export const services = {
  sectionLabel: "Szolgáltatások",
  heading: "Miben segítünk?",
  lead: "Tevékenységünket kizárólag a hatályos ügynöki hirdetmény, a K&H Értékpapír szabályzatai és a részünkre rendelkezésre bocsátott hivatalos anyagok alapján végezzük.",
  items: [
    {
      title: "Szolgáltatások és pénzügyi eszközök bemutatása",
      body: "Közérthetően bemutatjuk a K&H Értékpapír szolgáltatásait, az általa forgalmazott pénzügyi eszközök fő jellemzőit, valamint az igénybevételhez kapcsolódó alapvető folyamatokat. A tájékoztatás nem tartalmaz személyre szóló befektetési ajánlást.",
    },
    {
      title: "Kapcsolatfelvétel és számlanyitás támogatása",
      body: "Segítünk a megfelelő hivatalos tájékoztatók elérésében és a K&H Értékpapírral történő kapcsolatfelvételben. Befektetési szolgáltatási keretszerződés és számlavezetési megállapodás kizárólag a Patria Finance Magyarországi Fióktelepével köthető; ilyen szerződés a JG Investment Plus Kft.-vel vagy munkatársaival nem köthető.",
    },
    {
      title: "Megbízások fogadása, továbbítása és végrehajtása",
      body: "Meglévő ügyfelek részére, a hatályos ügynöki hirdetményben meghatározott pénzügyi eszközök és üzleti órák szerint közreműködünk a megbízások fogadásában, továbbításában és végrehajtásában. Ennek során a K&H Értékpapír Üzletszabályzata és Végrehajtási Politikája szerint járunk el.",
    },
    {
      title: "Kapcsolattartás",
      body: "Segítünk eligazodni abban, hogy egy adott kérdéssel, nyilatkozattal vagy ügyintézési igénnyel melyik hivatalos K&H Értékpapír-csatornához szükséges fordulni. A Fióktelep által küldött értesítés, visszaigazolás és számlakivonat minősül hivatalos tájékoztatásnak.",
    },
  ],
  importantLimit: {
    label: "Fontos korlát",
    body: "A JG Investment Plus Kft. kizárólag a K&H Értékpapír által rendelkezésére bocsátott anyagokat továbbíthatja. Munkatársainknak pénzt vagy értékpapírt átadni, illetve a K&H Értékpapírnál vezetett számla feletti meghatalmazást adni tilos.",
  },
} as const;

/** SOT 4. Miért a JG Investment Plus Kft.? */
export const whyJg = {
  sectionLabel: "Miért a JG?",
  heading: "Miért a JG Investment Plus Kft.?",
  subheading: "Egyértelmű szerepek. Ellenőrizhető működés.",
  pillars: [
    {
      title: "Átláthatóság",
      body: "Pontosan megmutatjuk, mely feladatokat végezzük mi, és mely szolgáltatásokat nyújtja közvetlenül a K&H Értékpapír.",
    },
    {
      title: "Szabályozott keretek",
      body: "Függő ügynöki tevékenységünket a Bszt., a K&H Értékpapír szabályzatai és a nyilvánosan elérhető ügynöki hirdetmény keretei között végezzük.",
    },
    {
      title: "Közvetlen kapcsolattartás",
      body: "Elérhető kapcsolattartókkal és tiszta ügyintézési útvonalakkal segítjük az érdeklődőket és a meglévő ügyfeleket.",
    },
  ],
} as const;

/** SOT 4. — Így működik a kapcsolatfelvétel */
export const process = {
  sectionLabel: "Hogyan működik?",
  heading: "Így működik a kapcsolatfelvétel",
  steps: [
    {
      title: "Kapcsolatfelvétel",
      body: "röviden egyeztetjük, miben van szüksége tájékoztatásra.",
    },
    {
      title: "Hivatalos tájékoztatás",
      body: "bemutatjuk a K&H Értékpapír releváns szolgáltatásait és dokumentumait.",
    },
    {
      title: "Számlanyitás és szerződéskötés",
      body: "közvetlenül a Patria Finance Magyarországi Fióktelepével történik.",
    },
    {
      title: "Folyamatos kapcsolattartás",
      body: "a hatályos ügynöki keretek között segítjük az ügyintézést és a megbízások kezelését.",
    },
  ],
} as const;

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
} = {
  sectionLabel: "Kapcsolat",
  heading: "Lépjen kapcsolatba velünk",
  lead: "Ha szeretné megismerni a K&H Értékpapír szolgáltatásait, vagy meglévő ügyfélként a függő ügynöki tevékenység körébe tartozó ügyben keres minket, vegye fel velünk a kapcsolatot.",
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
};

/** SOT 5. — Kapcsolati űrlap (v0.2: továbbra is kizárólag vizuális prototípus) */
export const contactForm = {
  heading: "Kapcsolati űrlap",
  /** Prototípus-státusz. Az űrlap nem küld adatot. */
  prototypeNotice:
    "Ez az űrlap a v0.2 vizuális prototípusban még nem aktív: nem küld és nem tárol adatot. Az adatkezelési tájékoztató linkje az élesítés előtti compliance-lépés után kerül be.",
  fields: [
    { id: "nev", label: "Név", type: "text", autoComplete: "name" },
    { id: "email", label: "E-mail-cím", type: "email", autoComplete: "email" },
    { id: "telefon", label: "Telefonszám", type: "tel", autoComplete: "tel" },
    { id: "uzenet", label: "Üzenet", type: "textarea", autoComplete: "off" },
  ],
  consentLabel:
    "Elolvastam az Adatkezelési tájékoztatót, és tudomásul veszem, hogy az űrlapon küldött üzenet nem minősül tőzsdei megbízásnak, hivatalos nyilatkozatnak vagy befektetési tanácsadás iránti megbízásnak.",
  submitLabel: "Üzenet küldése",
  orderNotice:
    "Tőzsdei megbízást kizárólag a K&H Értékpapír és a hatályos ügynöki hirdetmény által meghatározott csatornán és üzleti időben lehet megadni.",
} as const;

/** SOT 6. Jogi tájékoztató */
export const legal: {
  sectionLabel: string;
  heading: string;
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
  status: {
    heading: "Közvetítői státusz és felelősségi kör",
    paragraphs: [
      "A JG Investment Plus Kft. (székhely: 2336 Dunavarsány, Nagyvarsányi utca 133.; cégjegyzékszám: 13-09-236124; adószám: 32643804-2-13) a Patria Finance Magyarországi Fióktelepe Bszt. 111. § (2) bekezdés a) pontja szerinti függő ügynöke.",
      "A JG Investment Plus Kft. a Fióktelep megbízásából, a közöttük fennálló együttműködés kereteit rögzítő, 2026. március 10. napjától hatályos ügynöki hirdetményben meghatározott körben jár el. A közvetített befektetési szolgáltatások tényleges nyújtója és az ügyfelek szerződéses partnere a Patria Finance Magyarországi Fióktelepe.",
      "A „K&H Értékpapír” a Patria Finance Magyarországi Fióktelepe által használt márkanév.",
    ],
  },
  scope: {
    heading: "A tevékenység terjedelme",
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
    heading: "Kockázati figyelmeztetés",
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
    { label: "Impresszum", href: "#impresszum" },
    /**
     * A K&H/Patria által átadott adatkezelési tájékoztató (adatfeldolgozói)
     * teljes, tartalmilag változatlan szövege a /adatkezelesi-tajekoztato
     * oldalon érhető el — ld. src/content/privacy-policy.ts.
     */
    { label: "Adatkezelési tájékoztató", href: "/adatkezelesi-tajekoztato" },
    { label: "Panaszkezelés", href: "#panaszkezeles" },
    {
      label: "K&H Értékpapír dokumentumai",
      href: "https://www.khertekpapir.hu/ugyfeltamogatas/dokumentumok",
    },
  ],
  copyright: "© 2026 JG Investment Plus Kft. – Minden jog fenntartva.",
};

/** SOT 8. Adatvédelem — élesítés előtti feltétel, a prototípusban láthatóan jelezve. */
export const privacyPending = {
  label: "Élesítés előtti feltétel",
  body: "Az ügynöki minőségben végzett adatkezeléshez a K&H/Patria által korábban átadott adatkezelési tájékoztató teljes, tartalmilag változatlan szövegét kell közzétenni. Ez a szöveg a prototípus készítésekor nem állt rendelkezésre, ezért saját megfogalmazású jogi szöveggel nem került pótlásra.",
} as const;
