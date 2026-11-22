/**
 * Útmutatók — önálló aloldalak (/szamlanyitas, /tbsz) tartalma.
 *
 * STÁTUSZ: TERVEZET — K&H JÓVÁHAGYÁSRA VÁR (2026-11-21). A JG ügynöki
 * keretei szerint (legal-notice.ts, Tevékenységi korlátok) a JG csak a K&H
 * Értékpapír által rendelkezésre bocsátott anyagokat továbbíthatja, ezért
 * ezek az oldalak csak a K&H Értékpapír jóváhagyása után kerülhetnek élesbe.
 *
 * FORRÁSOK: minden ténybeli állítás a K&H Értékpapír nyilvános, hivatalos
 * oldalairól származik (2026-11-21-i állapot), a JG magázó hangnemére
 * átfogalmazva; a forráslinkek oldalanként a `sources` mezőben. Szándékosan
 * NINCS benne: időszakos promóció, konkrét díjtétel (a díjjegyzék változhat),
 * beutalási számlaszám (a K&H felületein mindig az aktuális szerepel),
 * ügyfélszolgálati cím (a K&H kapcsolati oldalára mutatunk).
 *
 * MÓDOSÍTÁSI SZABÁLY: a szöveget csak ez a fájl tartalmazza; a megjelenítés
 * a GuidePage komponensben él.
 */

export type GuideLink = { readonly label: string; readonly href: string };

export type GuideBlock =
  | { readonly type: "p"; readonly text: string; readonly link?: GuideLink }
  | { readonly type: "list"; readonly items: readonly string[] }
  | {
      readonly type: "steps";
      readonly items: readonly { readonly title: string; readonly text: string; readonly link?: GuideLink }[];
    }
  | {
      readonly type: "table";
      readonly caption: string;
      readonly head: readonly string[];
      readonly rows: readonly (readonly string[])[];
      readonly note?: string;
    };

export type GuideSection = {
  readonly id: string;
  readonly heading: string;
  readonly blocks: readonly GuideBlock[];
};

export type Guide = {
  readonly slug: string;
  /** <title> és og:title (a „· JG Investment Plus" utótagot az oldal teszi hozzá). */
  readonly metaTitle: string;
  /** Meta leírás, kb. 140–160 karakter. */
  readonly metaDescription: string;
  /** Rövid név a morzsamenühöz és a belső linkekhez. */
  readonly shortName: string;
  /** A lábléc „Útmutatók" sorának felirata. */
  readonly navLabel: string;
  readonly heading: string;
  readonly lead: string;
  /** ISO dátum (strukturált adat) és megjelenített forma. */
  readonly updated: { readonly iso: string; readonly label: string };
  readonly sections: readonly GuideSection[];
  readonly sources: readonly GuideLink[];
  /** Az oldal végi, mindig látható közlés. */
  readonly notice: string;
};

/** A JG szerepe — mindkét útmutatón azonos, a legal-notice.ts kereteivel összhangban. */
export const guideRoleNote = {
  heading: "Miben segít a JG Investment Plus?",
  text: "A JG Investment Plus Kft. a K&H Értékpapír (Patria Finance Magyarországi Fióktelepe) függő ügynöke. Bemutatjuk a számlanyitás folyamatát és a K&H Értékpapír szolgáltatásait, és válaszolunk a felmerülő kérdésekre. A számlát a K&H Értékpapír nyitja és vezeti, a szerződést is vele köti meg. A JG nem ad személyre szóló befektetési ajánlást, és ügyfélpénzt vagy értékpapírt nem vehet át.",
} as const;

/** Az útmutatók alján álló, két utat kínáló blokk szövege. */
export const guideCta = {
  heading: "Kezdje el most, vagy kérdezzen tőlünk",
  text: "A számlanyitás online, a K&H Értékpapír oldalán végezhető el. Ha előtte kérdése van, hívja kollégáinkat – az ország bármely pontjáról szívesen segítünk telefonon.",
  phoneHeading: "Kérdése van? Hívjon minket",
} as const;

const KH_ACCOUNT_GUIDE: GuideLink = {
  label: "K&H Értékpapír: számlanyitási útmutató",
  href: "https://www.khertekpapir.hu/szamlanyitas-utmutato",
};

const KH_DOCUMENTS: GuideLink = {
  label: "K&H Értékpapír: a számlanyitáshoz szükséges dokumentumok",
  href: "https://www.khertekpapir.hu/ugyfeltamogatas/tudastar/milyen-dokumentumok-szuksegesek-az-ugyfelszamla-megnyitasahoz-termeszetes-szemelytol",
};

const KH_ONLINE_KYC: GuideLink = {
  label: "K&H Értékpapír: tájékoztató az online átvilágításhoz",
  href: "https://www.khertekpapir.hu/ugyfeltamogatas/dokumentumok/kategoria/tajekoztato-online-atvilagitashoz",
};

const KH_CONTACT: GuideLink = {
  label: "K&H Értékpapír: kapcsolat és időpontfoglalás",
  href: "https://www.khertekpapir.hu/tarsasagunk/kapcsolat",
};

const KH_TBSZ: GuideLink = {
  label: "K&H Értékpapír: Tartós Befektetési Számla (TBSZ)",
  href: "https://www.khertekpapir.hu/szolgaltatasok/tartos-befektetesi-szamla-tbsz",
};

const KH_FEES: GuideLink = {
  label: "K&H Értékpapír: díjjegyzék",
  href: "https://www.khertekpapir.hu/dijjegyzek",
};

const NAV_TBSZ: GuideLink = {
  label: "NAV: a tartós befektetésből származó jövedelem szochokötelezettsége",
  href: "https://nav.gov.hu/ado/szocialis_hozzajarulasi_ado/A_tartos_befektetesbol_szarmazo_jovedelem_szochokotelezettsege",
};

const AGENCY_NOTICE: GuideLink = {
  label: "JG ügynöki hirdetmény",
  href: "https://www.khertekpapir.hu/ugyfeltamogatas/dokumentumok/dokumentum/4225",
};

const UPDATED = { iso: "2026-11-21", label: "2026. november 21." } as const;

const COMMON_NOTICE =
  "Az útmutató általános tájékoztatást tartalmaz, és a K&H Értékpapír nyilvános tájékoztatói alapján készült; nem minősül személyre szabott befektetési ajánlásnak, illetve befektetési, adó- vagy jogi tanácsadásnak. A folyamat és a feltételek változhatnak: a mindenkor hatályos szabályokat a K&H Értékpapír honlapja és dokumentumai tartalmazzák. A befektetések kockázattal járnak, és tőkevesztést okozhatnak.";

export const accountOpeningGuide: Guide = {
  slug: "szamlanyitas",
  metaTitle: "K&H Értékpapír számlanyitás lépésről lépésre",
  metaDescription:
    "Hogyan nyithat értékpapírszámlát a K&H Értékpapírnál? Feltételek, szükséges okmányok, az online és a személyes számlanyitás lépései egy helyen.",
  shortName: "Számlanyitás lépésről lépésre",
  navLabel: "Értékpapírszámla nyitása a K&H Értékpapírnál",
  heading: "Értékpapírszámla nyitása a K&H Értékpapírnál, lépésről lépésre",
  lead: "Ez az útmutató a K&H Értékpapír hivatalos tájékoztatói alapján mutatja be, hogyan nyithat magánszemélyként értékpapírszámlát online vagy személyesen, mit érdemes előkészítenie, és mi a teendő a számlanyitás után.",
  updated: UPDATED,
  sections: [
    {
      id: "online-vagy-szemelyesen",
      heading: "Online vagy személyesen?",
      blocks: [
        {
          type: "p",
          text: "Magánszemélyként a számlanyitás teljesen online is elvégezhető, mobiltelefonon vagy számítógépen. Ha az online számlanyitás feltételei nem teljesülnek, vagy inkább személyesen intézné, előre egyeztetett időpontban a K&H Értékpapír központi ügyfélszolgálatán vagy a kijelölt K&H bankfiókokban is nyithat számlát.",
        },
        {
          type: "p",
          text: "Cégek és más szervezetek számára a számlanyitás kizárólag személyesen, a K&H Értékpapír központi ügyfélszolgálatán lehetséges, a szükséges dokumentumok előzetes megküldése után.",
        },
      ],
    },
    {
      id: "kik-nyithatnak-online",
      heading: "Ki nyithat számlát online?",
      blocks: [
        { type: "p", text: "A K&H Értékpapír tájékoztatója szerint az online számlanyitás feltételei:" },
        {
          type: "list",
          items: [
            "természetes személy, és a magyar adóhatóság által kiállított adóazonosító jellel rendelkezik;",
            "magyar állampolgár, vagy magyarországi állandó lakcímmel rendelkezik;",
            "hozzájárul az online átvilágításhoz;",
            "nem rendelkezik amerikai adóilletőséggel;",
            "cselekvőképes, és betöltötte a 18. életévét;",
            "Ön lesz a számla tényleges tulajdonosa.",
          ],
        },
        {
          type: "p",
          text: "Ha bármelyik feltétel nem teljesül, a számlát személyesen nyithatja meg. Egy értékpapírszámlának csak egy tulajdonosa lehet; ha családtagja is befektetne, neki saját számlát kell nyitnia.",
        },
      ],
    },
    {
      id: "mit-keszitsen-elo",
      heading: "Mit készítsen elő?",
      blocks: [
        {
          type: "list",
          items: [
            "személyazonosság igazolására alkalmas hatósági igazolvány: személyi igazolvány, útlevél vagy kártya formátumú vezetői engedély;",
            "lakcímet igazoló hatósági igazolvány (lakcímkártya);",
            "adóazonosító jel;",
            "e-mail-cím és mobiltelefonszám;",
            "egy saját nevére szóló bankszámla – más banknál vezetett számla is megfelelő; személyes számlanyitásnál ennek igazolását (például bankszámlakivonatot) is be kell mutatni;",
            "online számlanyitáshoz kamerás mobiltelefon vagy webkamerás számítógép. A K&H a mobilt ajánlja, mert a folyamat során az okmányokat be kell olvasni, és fényképet, rövid videót is kell készíteni.",
          ],
        },
      ],
    },
    {
      id: "online-szamlanyitas-lepesei",
      heading: "Az online számlanyitás lépései",
      blocks: [
        {
          type: "steps",
          items: [
            {
              title: "Regisztráció",
              text: "A K&H Értékpapír számlanyitási oldalán adja meg e-mail-címét és egy jelszót, amellyel később belép, majd fogadja el a feltételeket. A visszaigazoló e-mailben kapott link 60 percig érvényes, és csak egyszer használható.",
            },
            {
              title: "Személyes adatok",
              text: "Adja meg teljes nevét pontosan úgy, ahogy a személyi igazolványán szerepel (a „dr.”, „ifj.” és hasonló előtagokkal együtt), a telefonszámát, majd az adóazonosító jelét, a születési országát és az adóilletőségét. A születési dátum az adóazonosító jel alapján automatikusan kitöltődik.",
            },
            {
              title: "Ügyfélismereti kérdőív",
              text: "Rövid kérdőív következik, többek között arról, hogy Ön vagy a családi, ismerősi köréből valaki kiemelt közszereplő-e. Egyes igen válaszoknál további kérdések jelennek meg.",
            },
            {
              title: "Személyazonosítás",
              text: "A felület utasításai szerint készítsen magáról fényképet és rövid videót, majd fotózza vagy videózza le az okmányait. Számítógépről indulva QR-kóddal válthat át mobilra. A képek legyenek világosak, és rajtuk kívül más ne szerepeljen.",
            },
            {
              title: "Megerősítés SMS-kóddal",
              text: "A megadott telefonszámra aktiváló kód érkezik SMS-ben, ezzel erősíti meg az adatait.",
            },
            {
              title: "Ellenőrzés",
              text: "A K&H Értékpapír ügyfélszolgálata legfeljebb 2 napon belül – általában még aznap – ellenőrzi az adatokat, és e-mailben értesíti az eredményről.",
            },
            {
              title: "Alapmegállapodás aláírása",
              text: "Ezután lépjen be a K&H webtraderbe, és írja alá digitálisan az Alapmegállapodást. Itt néhány további dokumentum is kitöltésre vár, mielőtt megkezdheti a kereskedést.",
            },
          ],
        },
      ],
    },
    {
      id: "szemelyes-szamlanyitas",
      heading: "Személyes számlanyitás",
      blocks: [
        {
          type: "steps",
          items: [
            {
              title: "Időpontfoglalás",
              text: "Számlanyitásra csak előre egyeztetett időpontban lehet érkezni: a K&H Értékpapír központi ügyfélszolgálatára (+36 1 455 1500) vagy a kijelölt K&H bankfiókokba.",
              link: KH_CONTACT,
            },
            {
              title: "Személyes azonosítás",
              text: "Az ügyintézőnek mutassa be az okmányait és a bankszámlája igazolását; az ügyintéző másolatot készít róluk.",
            },
            {
              title: "Véglegesítés a K&H webtraderben",
              text: "Az első belépéskor módosítsa a belépési adatokat, írja alá az Alapmegállapodást, és töltse ki a befektetővédelmi kérdőívet, valamint a szociális hozzájárulási adóra vonatkozó nyilatkozatot.",
            },
          ],
        },
      ],
    },
    {
      id: "a-szamlanyitas-utan",
      heading: "A számlanyitás után",
      blocks: [
        {
          type: "list",
          items: [
            "Befektetővédelmi kérdőív: az ismereteire, tapasztalataira, pénzügyi helyzetére, kockázattűrésére és befektetési céljaira kérdez rá. A kitöltést el lehet utasítani, de ilyenkor a szolgáltatások egy része nem vehető igénybe; fontos, hogy a válaszok a valóságnak megfelelők legyenek.",
            "Pénz befizetése: a számlára banki átutalással fizethet be. A közleményben a 8 számjegyű ügyfélazonosítóját kell megadni; ezt és az aktuális beutalási adatokat a K&H webtraderben és a K&H mobiltraderben találja.",
            "K&H mobiltrader: az alkalmazás a számlanyitás véglegesítése és az Alapmegállapodás aláírása után, az új felhasználónévvel és jelszóval használható.",
          ],
        },
        {
          type: "p",
          text: "Tartós befektetési számlát (TBSZ) a meglévő értékpapírszámla mellett, a K&H webtraderben lehet nyitni.",
          link: { label: "TBSZ-útmutatónk", href: "/tbsz" },
        },
        {
          type: "p",
          text: "A K&H webtrader és a K&H mobiltrader felületét a főoldalon mutatjuk be.",
          link: { label: "Kereskedési felületek", href: "/#kereskedesi-feluletek" },
        },
      ],
    },
  ],
  sources: [KH_ACCOUNT_GUIDE, KH_DOCUMENTS, KH_ONLINE_KYC, KH_CONTACT, AGENCY_NOTICE],
  notice: COMMON_NOTICE,
};

export const tbszGuide: Guide = {
  slug: "tbsz",
  metaTitle: "TBSZ nyitása a K&H Értékpapírnál",
  metaDescription:
    "Mi a TBSZ, hogyan működik a gyűjtőév és a lekötési idő, mikor adómentes a hozam, és hogyan nyitható TBSZ a K&H Értékpapírnál? Lépésről lépésre.",
  shortName: "TBSZ nyitása",
  navLabel: "TBSZ nyitása a K&H Értékpapírnál",
  heading: "TBSZ nyitása a K&H Értékpapírnál",
  lead: "A Tartós Befektetési Számla (TBSZ) olyan számlatípus, amely a feltételek teljesítése esetén adókedvezményt biztosíthat a befektetések hozamára. Az útmutató a K&H Értékpapír tájékoztatói alapján mutatja be a működését és a nyitás lépéseit.",
  updated: UPDATED,
  sections: [
    {
      id: "mi-a-tbsz",
      heading: "Mi a TBSZ?",
      blocks: [
        {
          type: "p",
          text: "A TBSZ olyan pénz- és értékpapírszámla, amelyet elsősorban magánszemélyek nyithatnak hitelintézeteknél és befektetési szolgáltatóknál. A számlanyitás éve a gyűjtőév: ekkor lehet pénzt befizetni. Ezt követi a lekötési időszak, amely alatt új befizetés már nem lehetséges, a számlán lévő pénzből azonban továbbra is lehet értékpapírokat venni és eladni.",
        },
      ],
    },
    {
      id: "hogyan-mukodik",
      heading: "Hogyan működik?",
      blocks: [
        {
          type: "list",
          items: [
            "Gyűjtőév (a nyitás éve): bármikor és bármennyit befizethet. A számla legalább 25 000 forint vagy annak megfelelő deviza egyösszegű befizetésével válik aktívvá.",
            "Lekötési időszak (a gyűjtőévet követő évtől): új befizetés nem lehetséges, a számlán lévő eszközökkel viszont szabadon kereskedhet, a portfólió bármikor átrendezhető.",
            "Lejárat: a lekötési időszak végén dönthet, hogy kiveszi a pénzt, vagy a lejáró számla eszközeit átviszi egy gyűjtőévben lévő TBSZ-re.",
            "Minden évben egy új TBSZ nyitható, így párhuzamosan több, különböző évben nyitott számlája is lehet.",
          ],
        },
      ],
    },
    {
      id: "adozas",
      heading: "Hogyan adózik a TBSZ hozama?",
      blocks: [
        {
          type: "table",
          caption:
            "A hozam után fizetendő adó a felvétel időpontja szerint, 2025. január 1. után nyitott számlák esetén (a K&H Értékpapír tájékoztatója alapján)",
          head: ["Felvétel", "SZJA", "Szocho", "Összesen"],
          rows: [
            ["3 éven belül", "15%", "13%", "28%"],
            ["3 és 5 év között", "10%", "8%", "18%"],
            ["Lejáratkor (5 év után)", "0%", "0%", "0%"],
          ],
          note: "A 2025 előtt nyitott számlákon a K&H tájékoztatója szerint szocho-fizetési kötelezettség nincs. Az adót a K&H Értékpapír megállapítja, de nem vonja le: a tárgyévet követő év január 31-ig adóigazolást küld, az adót pedig az ügyfélnek kell bevallania és megfizetnie. Külföldi értékpapíroknál a külföldön már levont adók (például az osztalékadó) a TBSZ-en is levonásra kerülnek.",
        },
        {
          type: "p",
          text: "A lekötési idő alatti bármilyen pénzfelvétel a TBSZ megszűnésével jár; kivétel a 3. év végi részkivét. A gyűjtőévben történő pénzfelvétel is megszünteti a számlát, adókedvezmény nélkül, és abban az évben a K&H Értékpapírnál új TBSZ már nem nyitható.",
        },
      ],
    },
    {
      id: "tbsz-nyitas-lepesei",
      heading: "TBSZ nyitása a K&H Értékpapírnál",
      blocks: [
        {
          type: "steps",
          items: [
            {
              title: "Normál értékpapírszámla",
              text: "TBSZ a K&H Értékpapírnál vezetett normál értékpapírszámla mellett nyitható. Ha még nincs ilyen számlája, először azt kell megnyitnia.",
              link: { label: "Számlanyitás lépésről lépésre", href: "/szamlanyitas" },
            },
            {
              title: "Szerződés aláírása",
              text: "A K&H webtraderben, a „Fiók beállítások / termék engedélyek” menüpontban írja alá elektronikusan a TBSZ-szerződést.",
            },
            {
              title: "Kezdő befizetés",
              text: "Vezessen át legalább 25 000 forintot vagy annak megfelelő devizát a normál számlájáról a TBSZ-re; enélkül a folyamat nem folytatható.",
            },
            {
              title: "Kész",
              text: "A TBSZ a normál számla mellett, attól elkülönítve jelenik meg a K&H webtraderben. A K&H Értékpapír tájékoztatása szerint a TBSZ megnyitásáról Önnek nincs bejelentési kötelezettsége az adóhatóság felé.",
            },
          ],
        },
      ],
    },
    {
      id: "befizetes-es-kereskedes",
      heading: "Befizetés és kereskedés",
      blocks: [
        {
          type: "list",
          items: [
            "Befizetni csak a gyűjtőévben lehet: átvezetéssel a normál számláról, vagy közvetlen banki átutalással. Átutalásnál a közleménybe a TBSZ-hez tartozó kódot kell írni, amelyet a K&H webtraderben és a K&H mobiltraderben talál.",
            "A TBSZ-re csak pénz fizethető be, meglévő értékpapír nem tehető át rá.",
            "A számlán részvény, kötvény, befektetési jegy, ETF és külföldi értékpapír is tartható és kereskedhető.",
            "A TBSZ számlavezetési díját a K&H Értékpapír hatályos díjjegyzéke tartalmazza.",
          ],
        },
      ],
    },
    {
      id: "tbsz-athozatala",
      heading: "TBSZ áthozása más szolgáltatótól",
      blocks: [
        {
          type: "p",
          text: "Más szolgáltatónál vezetett TBSZ is áthelyezhető a K&H Értékpapírhoz. Idei TBSZ esetén előbb nyisson TBSZ-t a K&H webtraderben; korábbi évben nyitott számlánál azonos évjáratú számlát kell nyitni a K&H Értékpapír központi ügyfélszolgálatán. Ezután a korábbi szolgáltatótól kell kérnie, hogy küldje meg a számla igazolását a K&H Értékpapírnak. Az áthelyezésről érdemes előre egyeztetni a K&H Értékpapír ügyfélszolgálatával.",
          link: KH_CONTACT,
        },
      ],
    },
  ],
  sources: [KH_TBSZ, KH_ACCOUNT_GUIDE, KH_FEES, NAV_TBSZ, AGENCY_NOTICE],
  notice: `A TBSZ adókedvezménye nem jelent hozamígéretet vagy tőkevédelmet: a befektetések értéke a lekötési idő alatt is csökkenhet. Az adózás az egyéni körülményektől is függ, és a szabályok változhatnak. ${COMMON_NOTICE}`,
};

export const guides = [accountOpeningGuide, tbszGuide] as const;
