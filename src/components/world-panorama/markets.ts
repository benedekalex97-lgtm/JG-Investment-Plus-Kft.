/**
 * Világpiaci panoráma — regionális BEMUTATÓ válogatások.
 *
 * Ezek illusztratív listák: nem vételi ajánlások, nem rangsorok, és nem a
 * K&H Értékpapírnál elérhető instrumentumkínálat leírása. A panel minden
 * esetben ezt közli („Illusztratív válogatás, nem ajánlás.").
 *
 * A régió kapcsolódó városa (London / New York / Tokió) csak földrajzi
 * horgony a térképen: NEM állítjuk, hogy a lista minden papírja az adott
 * város tőzsdéjén forog — a jegyzési hely papíronként, metaadatként szerepel.
 *
 * v1.3 (2026-11-26) — RÉGIÓNKÉNT 30 TÉTEL
 * ---------------------------------------
 * A cégek köre, sorrendje és rövid leírása a megrendelő (Alex) listájából
 * származik (Amerika 1–30, Európa 1–30, Ázsia: a rangsor első 30 tétele).
 * A leírásokban a nyilvánvaló elírásokat és néhány ténybeli pontatlanságot
 * javítottuk (ld. a tételek melletti megjegyzéseket). A teljes cégnév, a
 * ticker, a jegyzési hely és a MIC az európai és ázsiai tételeknél — és az
 * amerikai tételek jegyzési helyénél — a fejlesztő ismeretéből származik.
 *
 * ELLENŐRZÉSI ÁLLAPOT
 * -------------------
 * Elsődleges forrásból (kibocsátói IR-oldal, tőzsdei adatlap, ISO 10383
 * MIC-lista) EBBEN A MUNKAMENETBEN SEM lettek ellenőrizve. Ezért minden
 * tétel `verification.status === "unverified"`, `checkedOn: null`.
 * Publikálás előtt tételenként ellenőrizendő, és csak utána állítható
 * "verified"-re, a tényleges dátummal és forrás-URL-lel. A `checkAt` a
 * jegyzési hely kezdőoldalát adja — NEM lekért forrás.
 */

export type RegionId = "americas" | "europe" | "asia";

export type Verification = {
  status: "unverified" | "verified";
  /** Az ellenőrzés napja (ISO dátum) — csak tényleges ellenőrzés után. */
  checkedOn: string | null;
  /** A ténylegesen megnyitott elsődleges forrás URL-je — csak ellenőrzés után. */
  sourceUrl: string | null;
  note: string;
};

export type Listing = {
  /** A kibocsátó teljes neve, rövidítés és ellipszis nélkül. */
  name: string;
  ticker: string;
  /** Részvényosztály, ahol releváns (pl. Alphabet Class A). */
  shareClass?: string;
  /** Jegyzési hely (emberi név) — a ticker akadálymentes kiegészítése. */
  exchange: string;
  /** ISO 10383 Market Identifier Code. */
  mic: string;
  /** Hol érdemes ellenőrizni (tőzsdei kezdőoldal) — NEM lekért forrás. */
  checkAt: string[];
  /**
   * Egymondatos, tényszerű bemutatás. A pörgő listában rejtve van; akkor
   * nyílik le, amikor a látogató megállítja a listát az adott soron.
   */
  description: string;
  verification: Verification;
};

export type Region = {
  id: RegionId;
  /** A régió felirata a panel tetején (eyebrow). */
  regionLabel: string;
  /** A térképen megjelenő város (földrajzi horgony). */
  city: { name: string; lat: number; lon: number };
  title: string;
  listings: Listing[];
};

export const PANEL_SUBTITLE = "Bemutató válogatás";
export const PANEL_NOTE = "Illusztratív válogatás, nem ajánlás.";

const PENDING: Verification = {
  status: "unverified",
  checkedOn: null,
  sourceUrl: null,
  note: "Elsődleges forrásból nem ellenőrizve (2026-11-26: a teljes cégnév, a ticker, a jegyzési hely és a MIC a fejlesztő ismeretéből származik).",
};

/** Jegyzési helyek: emberi név (a ticker akadálymentes kiegészítése), MIC, kezdőoldal. */
const EXCHANGES = {
  nasdaq: { exchange: "Nasdaq", mic: "XNAS", site: "https://www.nasdaq.com" },
  nyse: { exchange: "New York-i Értéktőzsde", mic: "XNYS", site: "https://www.nyse.com" },
  ams: { exchange: "Euronext Amsterdam", mic: "XAMS", site: "https://live.euronext.com" },
  par: { exchange: "Euronext Paris", mic: "XPAR", site: "https://live.euronext.com" },
  mil: { exchange: "Euronext Milan", mic: "XMIL", site: "https://live.euronext.com" },
  xetra: { exchange: "Xetra (Frankfurt)", mic: "XETR", site: "https://www.boerse-frankfurt.de" },
  six: { exchange: "SIX Swiss Exchange", mic: "XSWX", site: "https://www.six-group.com" },
  lse: { exchange: "Londoni Értéktőzsde", mic: "XLON", site: "https://www.londonstockexchange.com" },
  cph: { exchange: "Nasdaq Copenhagen", mic: "XCSE", site: "https://www.nasdaqomxnordic.com" },
  sto: { exchange: "Nasdaq Stockholm", mic: "XSTO", site: "https://www.nasdaqomxnordic.com" },
  mad: { exchange: "Madridi Értéktőzsde", mic: "XMAD", site: "https://www.bolsasymercados.es" },
  tse: { exchange: "Tokiói Értéktőzsde", mic: "XTKS", site: "https://www.jpx.co.jp/english" },
  hkex: { exchange: "Hongkongi Értéktőzsde", mic: "XHKG", site: "https://www.hkex.com.hk" },
  twse: { exchange: "Tajvani Értéktőzsde", mic: "XTAI", site: "https://www.twse.com.tw" },
  krx: { exchange: "Koreai Értéktőzsde", mic: "XKRX", site: "https://global.krx.co.kr" },
  nse: { exchange: "Indiai Nemzeti Értéktőzsde", mic: "XNSE", site: "https://www.nseindia.com" },
  sse: { exchange: "Sanghaji Értéktőzsde", mic: "XSHG", site: "https://english.sse.com.cn" },
  szse: { exchange: "Sencseni Értéktőzsde", mic: "XSHE", site: "https://www.szse.cn/English" },
} as const;

type ExchangeKey = keyof typeof EXCHANGES;

function item(
  name: string,
  ticker: string,
  exchange: ExchangeKey,
  description: string,
  shareClass?: string,
): Listing {
  const ex = EXCHANGES[exchange];
  return {
    name,
    ticker,
    ...(shareClass ? { shareClass } : {}),
    exchange: ex.exchange,
    mic: ex.mic,
    checkAt: [ex.site],
    description,
    verification: PENDING,
  };
}

export const REGIONS: Region[] = [
  {
    id: "americas",
    regionLabel: "Amerika",
    city: { name: "New York", lat: 40.7128, lon: -74.006 },
    title: "Amerikai részvények",
    listings: [
      // Javítva: „Az mesterséges" → „A mesterséges".
      item("NVIDIA Corporation", "NVDA", "nasdaq", "A mesterséges intelligencia (MI) hardveres alapját jelentő mikrochipek első számú gyártója és az MI-forradalom fő hajtóereje."),
      // Javítva: „meághatározó" → „meghatározó".
      item("Apple Inc.", "AAPL", "nasdaq", "A világ egyik legnagyobb piaci értékű vállalata, a fogyasztói elektronika és az ökoszisztéma-szolgáltatások abszolút meghatározó szereplője."),
      item("Microsoft Corporation", "MSFT", "nasdaq", "A felhőszolgáltatások (Azure), az üzleti szoftverek és a vállalati MI-integrációk globális piacvezetője."),
      item("Alphabet Inc.", "GOOGL", "nasdaq", "A digitális hirdetési piac, a keresőmotor-technológiák és az adatbázis-infrastruktúra meghatározó óriása (Google).", "Class A"),
      item("Amazon.com, Inc.", "AMZN", "nasdaq", "Az e-kereskedelem úttörője és az AWS révén a globális felhőinfrastruktúra legnagyobb szereplője."),
      // Javítva: „a félvezetőiparnak és … chiprendszereknek a kulcsszereplője" → nyelvtanilag egyeztetve.
      item("Broadcom Inc.", "AVGO", "nasdaq", "A félvezetőipar és a hálózati kommunikációs chiprendszerek kulcsszereplője."),
      item("Meta Platforms, Inc.", "META", "nasdaq", "A közösségi média (Facebook, Instagram, WhatsApp) domináns tulajdonosa és a digitális reklámozás fő alakítója."),
      item("Tesla, Inc.", "TSLA", "nasdaq", "Az elektromos járművek piacának úttörője, az energiatárolás és az önvezető technológiák kulcsfigurája."),
      // Pontosítva: Warren Buffett 2025 végén átadta a vezérigazgatói posztot (Greg Abel), ezért „által felépített".
      item("Berkshire Hathaway Inc.", "BRK.B", "nyse", "A Warren Buffett által felépített befektetési holding, amely óriási befolyással bír a pénzügyi, biztosítási és ipari szektorokra.", "Class B"),
      item("Eli Lilly and Company", "LLY", "nyse", "A gyógyszeripar vezető innovátora, különösen a metabolikus terápiák és a súlycsökkentő készítmények terén."),
      // Jegyzési hely: a Walmart 2025 decemberében a Nasdaqra tette át a jegyzését (ellenőrizendő).
      item("Walmart Inc.", "WMT", "nasdaq", "A világ legnagyobb kiskereskedelmi lánca, az amerikai fogyasztási trendek és a logisztika első számú lakmuszpapírja."),
      item("JPMorgan Chase & Co.", "JPM", "nyse", "Az Egyesült Államok legnagyobb és legbefolyásosabb kereskedelmi és befektetési bankja."),
      item("Visa Inc.", "V", "nyse", "A globális digitális fizetési infrastruktúra egyik alapköve.", "Class A"),
      item("Mastercard Incorporated", "MA", "nyse", "Meghatározó nemzetközi kártyás fizetési és tranzakciós hálózat.", "Class A"),
      item("Exxon Mobil Corporation", "XOM", "nyse", "A tradicionális energetikai és olajipari szektor legerősebb amerikai szereplője."),
      item("Advanced Micro Devices, Inc.", "AMD", "nasdaq", "Az NVIDIA és az Intel fő versenytársa a processzorok és grafikus gyorsítók piacán."),
      item("Oracle Corporation", "ORCL", "nyse", "A vállalati adatbázis-kezelés és felhőszoftver-infrastruktúra meghatározó szállítója."),
      // Javítva: „hztartási" → „háztartási".
      item("The Procter & Gamble Company", "PG", "nyse", "A fogyasztási cikkek (háztartási és higiéniai termékek) globális óriása."),
      item("Johnson & Johnson", "JNJ", "nyse", "Az egészségügyi szektor és az egészségügyi technológiák nagy múltú alapvállalata."),
      item("Chevron Corporation", "CVX", "nyse", "A világ egyik legnagyobb integrált olaj- és gázipari vállalata."),
      item("The Coca-Cola Company", "KO", "nyse", "A globális üdítőital-piac meghatározó óriása és a stabil osztalékfizető részvények mintapéldája."),
      // Javítva: „átalakulófélben lévő" → „átalakulóban lévő".
      item("Intel Corporation", "INTC", "nasdaq", "A hagyományos félvezetőgyártás és a PC-processzorok ikonikus, de átalakulóban lévő úttörője."),
      item("Morgan Stanley", "MS", "nyse", "Nemzetközi befektetési bank és pénzügyi szolgáltató óriás."),
      item("Caterpillar Inc.", "CAT", "nyse", "A nehézgépek, építőipari és bányászati berendezések legnagyobb globális gyártója."),
      item("Texas Instruments Incorporated", "TXN", "nasdaq", "Az analóg félvezetők és beágyazott processzorok piacának kulcsszereplője."),
      item("The Goldman Sachs Group, Inc.", "GS", "nyse", "A globális befektetési banki, értékpapír- és vagyonkezelési szektor éllovasa."),
      item("Netflix, Inc.", "NFLX", "nasdaq", "A világ vezető streaming-szolgáltatója és szórakoztatóipari platformja."),
      // Javítva: „vidékparkbirodalom" → „vidámparkbirodalom".
      item("The Walt Disney Company", "DIS", "nyse", "A globális média-, szórakoztató-, stúdió- és vidámparkbirodalom."),
      item("Citigroup Inc.", "C", "nyse", "Globális pénzintézet és multinacionális befektetési bank."),
      // Javítva: hiányzó mondatzáró pont.
      item("McDonald's Corporation", "MCD", "nyse", "A világ legnagyobb gyorsétterem-hálózata, amely az ingatlanpiacon és a globális vendéglátásban is óriási gazdasági súllyal bír."),
    ],
  },
  {
    id: "europe",
    regionLabel: "Európa",
    city: { name: "London", lat: 51.5074, lon: -0.1278 },
    title: "Európai részvények",
    listings: [
      item("ASML Holding N.V.", "ASML", "ams", "A globális félvezetőgyártás legkritikusabb szereplője; a világ egyetlen gyártója a legfejlettebb chipgyártáshoz használt EUV litográfiai gépeknek."),
      item("SAP SE", "SAP", "xetra", "Európa legnagyobb szoftvervállalata, a vállalati erőforrás-tervezési (ERP) rendszerek és felhőszoftverek globális piacvezetője."),
      item("LVMH Moët Hennessy Louis Vuitton SE", "MC", "par", "A világ legnagyobb luxusipari konglomerátuma (Louis Vuitton, Dior, Hennessy, Tiffany & Co.)."),
      item("Roche Holding AG", "ROG", "six", "A globális gyógyszeripar és diagnosztika egyik vezető szereplője, a rákkutatás és az onkológiai terápiák úttörője."),
      item("Nestlé S.A.", "NESN", "six", "A világ legnagyobb élelmiszer- és italgyártó vállalata."),
      item("Novo Nordisk A/S", "NOVO B", "cph", "A világ vezető cukorbetegség- és elhízáskezelési gyógyszergyártója (Ozempic, Wegovy)."),
      item("L'Oréal S.A.", "OR", "par", "A globális kozmetikai és szépségápolási piac legnagyobb szereplője."),
      item("AstraZeneca PLC", "AZN", "lse", "Biofarmáciai óriásvállalat, amely az onkológia, a kardiológia és a légzőszervi betegségek terápiáira specializálódott."),
      item("Siemens AG", "SIE", "xetra", "Az ipari automatizálás, a digitális ipari infrastruktúra, az okos hálózatok és a vasúti technológiák európai óriása."),
      item("Hermès International", "RMS", "par", "A prémium luxuscikkek (különösen a kézzel készített bőráruk és divatcikkek) ikonikus francia háza."),
      item("HSBC Holdings plc", "HSBA", "lse", "Európa legnagyobb bankcsoportja, kiemelkedő ázsiai és nemzetközi jelenléttel."),
      item("TotalEnergies SE", "TTE", "par", "Európa egyik legnagyobb integrált energia- és olajipari vállalata, amely gyorsan terjeszkedik a megújuló energiaforrások felé is."),
      item("Industria de Diseño Textil, S.A. (Inditex)", "ITX", "mad", "A világ legnagyobb divat-kiskereskedelmi csoportja (Zara, Pull&Bear, Massimo Dutti, Bershka)."),
      item("Shell plc", "SHEL", "lse", "A globális energetikai és LNG (cseppfolyósított földgáz) piac meghatározó szereplője."),
      item("Allianz SE", "ALV", "xetra", "Európa legnagyobb biztosítási és vagyonkezelési szolgáltatója."),
      item("Airbus SE", "AIR", "par", "A világ vezető polgári repülőgépgyártója és védelmi ipari vállalata."),
      item("Schneider Electric SE", "SU", "par", "Az energiamenedzsment, az ipari automatizálás és a fenntartható adatközponti infrastruktúra piacvezetője."),
      item("Banco Santander, S.A.", "SAN", "mad", "Európa és Latin-Amerika egyik legnagyobb lakossági és kereskedelmi bankcsoportja."),
      item("Deutsche Telekom AG", "DTE", "xetra", "Európa legnagyobb távközlési vállalata, amely az amerikai piacon is meghatározó szereplő."),
      item("UBS Group AG", "UBSG", "six", "A Credit Suisse integrációja óta a világ egyik legmeghatározóbb globális vagyonkezelője és privátbankja."),
      item("Sanofi", "SAN", "par", "Gyógyszeripari és vakcinagyártó óriás, az immunterápia és a cukorbetegség-kezelés kiemelt szereplője."),
      item("GSK plc", "GSK", "lse", "Globális biofarmáciai vállalat, amely az oltóanyagokra és a fertőző betegségek elleni gyógyszerekre specializálódott."),
      item("BP p.l.c.", "BP", "lse", "A világ egyik legnagyobb integrált olaj- és gázipari multinacionális vállalata."),
      item("Mercedes-Benz Group AG", "MBG", "xetra", "A prémium és luxus gépjárműgyártás ikonikus globális képviselője."),
      item("Bayerische Motoren Werke AG (BMW Group)", "BMW", "xetra", "A prémium autó- és motorkerékpár-gyártás másik meghatározó német pillére."),
      item("Rheinmetall AG", "RHM", "xetra", "Európa legfontosabb védelmi ipari vállalata és szárazföldi katonai járműgyártója."),
      item("AXA SA", "CS", "par", "Az egyik legnagyobb nemzetközi biztosítási és pénzügyi szolgáltató holding."),
      item("Ferrari N.V.", "RACE", "mil", "A szuper-luxus sportautó-gyártás leghíresebb, kiemelkedően magas árréssel működő márkája."),
      item("AB Volvo (Volvo Group)", "VOLV B", "sto", "A tehergépjárművek, buszok, építőipari gépek és ipari motorok globális svéd gyártója."),
      item("Heineken N.V.", "HEIA", "ams", "A világ egyik legnagyobb és leginkább nemzetközi sörfőzde-csoportja."),
    ],
  },
  {
    id: "asia",
    regionLabel: "Ázsia",
    city: { name: "Tokió", lat: 35.6762, lon: 139.6503 },
    title: "Ázsiai részvények",
    listings: [
      item("Taiwan Semiconductor Manufacturing Company Limited", "2330", "twse", "A globális félvezetőgyártás abszolút világvezetője; az Apple, az NVIDIA és az AMD chipjeinek első számú bérgyártója."),
      item("Samsung Electronics Co., Ltd.", "005930", "krx", "A világ egyik legnagyobb technológiai konglomerátuma (memóriachipek, okostelefonok, kijelzők)."),
      item("Tencent Holdings Limited", "0700", "hkex", "A kínai digitális ökoszisztéma óriása (WeChat, szórakoztatóipar, az egyik legnagyobb globális videójáték-befektető)."),
      item("Alibaba Group Holding Limited", "9988", "hkex", "Az ázsiai e-kereskedelem, a digitális fizetés (Alipay) és a felhőszolgáltatások úttörője."),
      item("Reliance Industries Limited", "RELIANCE", "nse", "India legértékesebb óriáskonglomerátuma (finomítás, petrolkémia, távközlés / Jio, kiskereskedelem)."),
      item("SK hynix Inc.", "000660", "krx", "A mesterséges intelligenciához elengedhetetlen nagy sávszélességű memória (HBM) piacvezető gyártója."),
      item("Industrial and Commercial Bank of China Limited", "1398", "hkex", "A világ legnagyobb bankja mérlegfőösszeg alapján."),
      item("Toyota Motor Corporation", "7203", "tse", "A világ egyik legnagyobb és legbefolyásosabb gépjárműgyártója."),
      item("Kweichow Moutai Co., Ltd.", "600519", "sse", "A világ legértékesebb szeszesital-gyártója, a prémium baijiu márka révén."),
      item("Tata Consultancy Services Limited", "TCS", "nse", "A globális IT-tanácsadás és kiszervezett szoftverfejlesztés egyik legnagyobb világpiaci szereplője."),
      item("Agricultural Bank of China Limited", "1288", "hkex", "Kína és a világ egyik legnagyobb állami kereskedelmi bankja."),
      item("China Construction Bank Corporation", "0939", "hkex", "A kínai infrastrukturális és ingatlanfinanszírozás meghatározó pénzintézete."),
      item("Contemporary Amperex Technology Co., Limited", "300750", "szse", "Az elektromos járművek akkumulátorgyártásának világelső beszállítója (CATL)."),
      item("Bharti Airtel Limited", "BHARTIARTL", "nse", "Ázsia és Afrika egyik legnagyobb távközlési és mobilhálózati szolgáltatója."),
      // Pontosítva: „észak-ázsiai" → „kínai" (a PetroChina Kína legnagyobb olaj- és gáztermelője).
      item("PetroChina Company Limited", "0857", "hkex", "A kínai energetikai és szénhidrogén-piac legnagyobb állami szereplője."),
      item("Mitsubishi UFJ Financial Group, Inc.", "8306", "tse", "Japán legnagyobb pénzügyi és bankcsoportja."),
      item("PDD Holdings Inc.", "PDD", "nasdaq", "A gyorsan növekvő globális e-kereskedelmi diszkontmodell úttörője (Pinduoduo, Temu)."),
      item("Fast Retailing Co., Ltd.", "9983", "tse", "Ázsia legnagyobb divat-kiskereskedelmi multinacionális vállalata (Uniqlo)."),
      item("Sony Group Corporation", "6758", "tse", "A globális szórakoztatóipar, a játékkonzolok (PlayStation), a zene, a film és a kameraszenzorok meghatározó óriása."),
      item("Bank of China Limited", "3988", "hkex", "A nemzetközi kereskedelemfinanszírozás és a kínai bankrendszer kulcsfigurája."),
      item("China Mobile Limited", "0941", "hkex", "A világ egyik legnépesebb országának legnagyobb, döntően állami távközlési és mobilhálózati szolgáltatója."),
      item("HDFC Bank Limited", "HDFCBANK", "nse", "India legnagyobb és legbefolyásosabb magánbanki pénzintézete."),
      item("Ping An Insurance (Group) Company of China, Ltd.", "2318", "hkex", "Ázsia egyik legértékesebb biztosítási, fintech és egészségügyi technológiai holdingja."),
      item("China Life Insurance Company Limited", "2628", "hkex", "A kínai életbiztosítási piac meghatározó állami óriása."),
      item("ICICI Bank Limited", "ICICIBANK", "nse", "Az indiai pénzügyi szektor és vállalati hitelezés másik vezető magánbankja."),
      item("Semiconductor Manufacturing International Corporation", "0981", "hkex", "Kína első számú, stratégiailag kiemelt chipbérgyártója (SMIC)."),
      // Javítva: „Paneurópai és ázsiai jelenlétű" → „Pánázsiai jelenlétű" (az AIA az ázsiai–csendes-óceáni térségben működik).
      item("AIA Group Limited", "1299", "hkex", "Pánázsiai jelenlétű, független életbiztosítási és vagyonkezelési óriás."),
      item("China Merchants Bank Co., Ltd.", "3968", "hkex", "A lakossági és vagyonkezelési szegmens leggyorsabban növekvő kínai kereskedelmi bankja."),
      item("SoftBank Group Corp.", "9984", "tse", "Masayoshi Son világhírű technológiai befektetési holdingja (Vision Fund, az Arm tulajdonosa)."),
      item("BYD Company Limited", "1211", "hkex", "A világ legnagyobb elektromos és plug-in hibrid autógyártója, saját akkumulátorgyártással."),
    ],
  },
];
