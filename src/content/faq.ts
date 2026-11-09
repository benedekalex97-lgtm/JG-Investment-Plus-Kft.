/**
 * Gyakori kérdések — a főoldal 04. szakaszának tartalma.
 *
 * A kérdések, válaszok és a közös tájékoztatás szövege Alex által
 * implementációra elfogadott tervezet (karakterre változatlanul beépítve; a
 * válaszokon belüli bekezdéstörés megengedett, ezért a hosszabb válaszok
 * `answer` tömbje több bekezdésből áll). Ez NEM jelent K&H Compliance
 * jóváhagyást.
 *
 * A források renderelhető adatként élnek: minden kérdés a saját linkjeit
 * kapja, közérthető felirattal. A 10. kérdéshez nem tartozik külső forrás.
 * Az URL-ek a tervezetben megadott, ellenőrzött címek; nem származtatunk,
 * nem találunk ki mélylinket.
 */

export type FaqSource = { readonly label: string; readonly href: string };

export type FaqItem = {
  readonly question: string;
  /** Az elsődlegesen megjelenő szöveg; minden elem külön bekezdés. */
  readonly answer: readonly string[];
  readonly sources: readonly FaqSource[];
};

const AGENCY_NOTICE: FaqSource = {
  label: "JG ügynöki hirdetmény",
  href: "https://www.khertekpapir.hu/ugyfeltamogatas/dokumentumok/dokumentum/4225",
};

const FEE_SCHEDULE: FaqSource = {
  label: "Kondíciós Lista",
  href: "https://www.khertekpapir.hu/ugyfeltamogatas/dokumentumok/dokumentum/4993",
};

const TBSZ_PAGE_URL = "https://www.khertekpapir.hu/szolgaltatasok/tartos-befektetesi-szamla-tbsz";
const ETF_PAGE_URL = "https://www.khertekpapir.hu/befektetesek/etf-ek";

export const faq: {
  sectionNumber: string;
  sectionLabel: string;
  heading: string;
  items: readonly FaqItem[];
  /** A GYIK alatti, mindig látható közös tájékoztatás. */
  notice: string;
} = {
  sectionNumber: "04",
  sectionLabel: "Gyakori kérdések",
  heading: "Gyakori kérdések",
  items: [
    {
      question: "Miben segít a JG Investment Plus?",
      answer: [
        "A K&H Értékpapírnál elérhető befektetési szolgáltatások, pénzügyi eszközök és számlatípusok megismerésében segítünk, személyes kapcsolattartással és közérthető tájékoztatással. Bemutatjuk a számlanyitás folyamatát és az online felületek lehetőségeit, valamint segítünk eligazodni a hivatalos tájékoztatók között. A tényleges befektetési szolgáltatást a K&H Értékpapír nyújtja.",
      ],
      sources: [AGENCY_NOTICE],
    },
    {
      question: "Mit jelent, hogy a JG a K&H Értékpapír függő ügynöke?",
      answer: [
        "A JG Investment Plus Kft. a Patria Finance Magyarországi Fióktelepe – kereskedelmi nevén K&H Értékpapír – megbízásából, a hatályos ügynöki hirdetményben meghatározott keretek között jár el. Az értékpapírszámlát a K&H Értékpapír vezeti, és a befektetési szolgáltatásra vonatkozó szerződést is vele köti meg. A JG szerepe a szolgáltatások bemutatása, közvetítése és a kapcsolattartás támogatása.",
      ],
      sources: [AGENCY_NOTICE],
    },
    {
      question: "Hogyan nyithatok értékpapírszámlát a K&H Értékpapírnál?",
      answer: [
        "Magánszemélyként, a szolgáltató feltételeinek teljesülése esetén online is kezdeményezheti az értékpapírszámla megnyitását. A folyamat része az azonosítás, a szükséges adatok és nyilatkozatok megadása, valamint a szerződések aláírása. Személyes ügyintézésre is van lehetőség előzetes egyeztetéssel. A JG a folyamat megismerésében segít; a számlanyitás a K&H Értékpapírnál történik.",
      ],
      sources: [
        {
          label: "Számlanyitási útmutató",
          href: "https://www.khertekpapir.hu/szamlanyitas-utmutato",
        },
      ],
    },
    {
      question: "Mekkora összeggel lehet elkezdeni a befektetést?",
      answer: [
        "A szükséges induló összeg a számlatípustól, a választott pénzügyi eszköztől és a kapcsolódó költségektől függ. Egy értékpapír megvásárlásánál annak árfolyama, kereskedési egysége és a minimumdíjak is számítanak. TBSZ esetén a számla induló befizetése legalább 25 000 forint vagy ennek megfelelő deviza; ez a számla aktiválásának feltétele, nem egy konkrét befektetés ajánlott összege.",
      ],
      sources: [{ label: "TBSZ feltételek", href: TBSZ_PAGE_URL }, FEE_SCHEDULE],
    },
    {
      question: "Milyen díjakkal és költségekkel kell számolnom?",
      answer: [
        "A befektetéshez számlavezetési és kereskedési díjak, továbbá az igénybe vett szolgáltatásoktól függően devizaváltási, átutalási vagy értékpapír-transzferköltségek kapcsolódhatnak. Egyes termékeknek – például befektetési alapoknak és ETF-eknek – saját működési költségeik is vannak. A díjak a számlatípustól, a díjcsomagtól, a piactól és a megbízás módjától is függhetnek. A pontos feltételeket a K&H Értékpapír hatályos Kondíciós Listája és az adott termék dokumentumai tartalmazzák.",
      ],
      sources: [FEE_SCHEDULE, { label: "ETF-ek és termékköltségek", href: ETF_PAGE_URL }],
    },
    {
      question: "Szükséges K&H bankszámla az értékpapírszámla megnyitásához?",
      answer: [
        "Nem szükséges kizárólag emiatt K&H bankszámlát nyitnia: más banknál vezetett, saját névre szóló bankszámla is használható a szolgáltató feltételei szerint. A bankszámlát a számlanyitás során meg kell adni, és igazolni kell, hogy az Ön nevére szól. Az átutalások díjai a számlavezető banktól és az alkalmazandó kondícióktól függhetnek.",
      ],
      sources: [
        {
          label: "Számlanyitáshoz szükséges dokumentumok",
          href: "https://www.khertekpapir.hu/ugyfeltamogatas/tudastar/milyen-dokumentumok-szuksegesek-az-ugyfelszamla-megnyitasahoz-termeszetes-szemelytol",
        },
        FEE_SCHEDULE,
      ],
    },
    {
      question: "Mi az a TBSZ, és hogyan lehet megnyitni?",
      answer: [
        "A Tartós Befektetési Számla, röviden TBSZ, olyan számlatípus, amely meghatározott feltételek teljesítésével adókedvezményt biztosíthat a befektetések hozamára. A számlanyitás évét gyűjtőévnek nevezik; ezt követi az ötéves lekötési időszak. A számlán belül ezalatt is lehet értékpapírokat vásárolni és eladni, a pénzkivonás azonban befolyásolhatja az adózást.",
        "A K&H Értékpapírnál meglévő normál értékpapírszámla mellett, elektronikusan kezdeményezhető TBSZ nyitása. Az adózási következmények a szerződés időpontjától és az egyéni körülményektől is függhetnek; a lejárat előtti megszüntetés adófizetési kötelezettséggel járhat.",
      ],
      sources: [
        { label: "TBSZ ismertető", href: TBSZ_PAGE_URL },
        {
          label: "NAV: TBSZ szochokötelezettsége",
          href: "https://nav.gov.hu/ado/szocialis_hozzajarulasi_ado/A_tartos_befektetesbol_szarmazo_jovedelem_szochokotelezettsege",
        },
      ],
    },
    {
      question: "Mi az az ETF, és miben különbözik egy részvénytől?",
      answer: [
        "Az ETF tőzsdén kereskedett befektetési alap. Egy részvény megvásárlásával egy adott vállalatban szerez részesedést, míg egy ETF-en keresztül az alap befektetéseinek teljesítményéből részesülhet. Sok ETF például egy részvényindexet követ, és több vállalat részvényét fogja össze.",
        "Az ETF kockázata az összetételétől és működésétől függ: értéke csökkenhet, és devizakockázat is felmerülhet. A több eszköz közötti megosztás sem jelent tőkevédelmet vagy garantált hozamot.",
      ],
      sources: [
        {
          label: "Az ETF fogalma",
          href: "https://www.khertekpapir.hu/ugyfeltamogatas/tudastar/mi-az-az-etf",
        },
        { label: "ETF-ek működése és kockázatai", href: ETF_PAGE_URL },
      ],
    },
    {
      question: "Hol tartják nyilván a pénzemet és az értékpapírjaimat?",
      answer: [
        "Pénzeszközeit és értékpapírjait a K&H Értékpapírként működő Patria Finance Magyarországi Fióktelepe által vezetett ügyfél- és értékpapírszámlákon tartják nyilván. A pénzeszközök elhelyezésének és az értékpapírok letétkezelésének részletes szabályait a szolgáltató hivatalos dokumentumai tartalmazzák. A JG nem vezet ügyfélszámlát, és ügyfélpénzt vagy értékpapírt nem vehet át. Az ügyfélvagyon védelmére vonatkozó szabályok nem jelentenek védelmet a befektetések árfolyamveszteségével szemben.",
      ],
      sources: [
        {
          label: "Az ügyfelek tulajdonának védelme",
          href: "https://www.khertekpapir.hu/ugyfeltamogatas/dokumentumok/dokumentum/2973",
        },
        AGENCY_NOTICE,
      ],
    },
    {
      question: "Mi történik az első kapcsolatfelvétel után?",
      answer: [
        "Elsőként egyeztetjük, milyen témában szeretne tájékoztatást kapni, és milyen kérdésekre keresi a választ. Bemutatjuk a JG szerepét, a kapcsolódó szolgáltatásokat és az ügyintézés lehetséges következő lépéseit. Ha számlanyitást szeretne kezdeményezni, tájékoztatjuk a K&H Értékpapír hivatalos folyamatáról és a szükséges előkészületekről.",
      ],
      sources: [],
    },
  ],
  notice:
    "A válaszok általános tájékoztatást tartalmaznak, nem minősülnek személyre szabott befektetési ajánlásnak, illetve befektetési, adó- vagy jogi tanácsadásnak. A befektetések kockázattal járnak, és tőkevesztést okozhatnak. A részletes feltételeket a K&H Értékpapír mindenkor hatályos dokumentumai tartalmazzák.",
};
