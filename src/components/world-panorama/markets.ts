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
 * ELLENŐRZÉSI ÁLLAPOT (2026-11-04)
 * --------------------------------
 * A cégnevek és tickerek a brief tartalmi referenciájából / kezdő
 * mintalistájából származnak; a jegyzési hely és a MIC kód a fejlesztő
 * ismeretéből. Elsődleges forrásból (kibocsátói IR-oldal, tőzsdei adatlap,
 * ISO 10383 MIC-lista) EBBEN A MUNKAMENETBEN NEM LETTEK ELLENŐRIZVE: a
 * fejlesztői környezet hálózati szabályzata minden ilyen hostot blokkolt.
 * Ezért minden tétel `verification.status === "unverified"`, `checkedOn:
 * null`. Publikálás előtt tételenként ellenőrizendő, és csak utána
 * állítható "verified"-re, a tényleges dátummal és forrás-URL-lel.
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
  /** Hol érdemes ellenőrizni (kibocsátói / tőzsdei kezdőoldal) — NEM lekért forrás. */
  checkAt: string[];
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
  note: "Elsődleges forrásból nem ellenőrizve (2026-11-04: a környezet hálózati szabályzata blokkolta a kibocsátói és tőzsdei oldalakat).",
};

export const REGIONS: Region[] = [
  {
    id: "americas",
    regionLabel: "Amerika",
    city: { name: "New York", lat: 40.7128, lon: -74.006 },
    title: "Amerikai részvények",
    listings: [
      { name: "Apple Inc.", ticker: "AAPL", exchange: "Nasdaq", mic: "XNAS", checkAt: ["https://investor.apple.com", "https://www.nasdaq.com"], verification: PENDING },
      { name: "Microsoft Corporation", ticker: "MSFT", exchange: "Nasdaq", mic: "XNAS", checkAt: ["https://www.microsoft.com/en-us/investor", "https://www.nasdaq.com"], verification: PENDING },
      { name: "Amazon.com, Inc.", ticker: "AMZN", exchange: "Nasdaq", mic: "XNAS", checkAt: ["https://ir.aboutamazon.com", "https://www.nasdaq.com"], verification: PENDING },
      { name: "Alphabet Inc.", ticker: "GOOGL", shareClass: "Class A", exchange: "Nasdaq", mic: "XNAS", checkAt: ["https://abc.xyz/investor", "https://www.nasdaq.com"], verification: PENDING },
      { name: "NVIDIA Corporation", ticker: "NVDA", exchange: "Nasdaq", mic: "XNAS", checkAt: ["https://investor.nvidia.com", "https://www.nasdaq.com"], verification: PENDING },
    ],
  },
  {
    id: "europe",
    regionLabel: "Európa",
    city: { name: "London", lat: 51.5074, lon: -0.1278 },
    title: "Európai részvények",
    listings: [
      { name: "ASML Holding N.V.", ticker: "ASML", exchange: "Euronext Amsterdam", mic: "XAMS", checkAt: ["https://www.asml.com", "https://live.euronext.com"], verification: PENDING },
      { name: "LVMH Moët Hennessy Louis Vuitton SE", ticker: "MC", exchange: "Euronext Paris", mic: "XPAR", checkAt: ["https://www.lvmh.com", "https://live.euronext.com"], verification: PENDING },
      { name: "Nestlé S.A.", ticker: "NESN", exchange: "SIX Swiss Exchange", mic: "XSWX", checkAt: ["https://www.nestle.com/investors", "https://www.six-group.com"], verification: PENDING },
      { name: "SAP SE", ticker: "SAP", exchange: "Xetra (Frankfurt)", mic: "XETR", checkAt: ["https://www.sap.com/investors", "https://www.boerse-frankfurt.de"], verification: PENDING },
      { name: "Siemens AG", ticker: "SIE", exchange: "Xetra (Frankfurt)", mic: "XETR", checkAt: ["https://www.siemens.com/investor", "https://www.boerse-frankfurt.de"], verification: PENDING },
    ],
  },
  {
    id: "asia",
    regionLabel: "Ázsia",
    city: { name: "Tokió", lat: 35.6762, lon: 139.6503 },
    title: "Ázsiai részvények",
    listings: [
      { name: "Toyota Motor Corporation", ticker: "7203", exchange: "Tokiói Értéktőzsde", mic: "XTKS", checkAt: ["https://global.toyota/en/ir", "https://www.jpx.co.jp/english"], verification: PENDING },
      { name: "Sony Group Corporation", ticker: "6758", exchange: "Tokiói Értéktőzsde", mic: "XTKS", checkAt: ["https://www.sony.com/en/SonyInfo/IR", "https://www.jpx.co.jp/english"], verification: PENDING },
      { name: "Nintendo Co., Ltd.", ticker: "7974", exchange: "Tokiói Értéktőzsde", mic: "XTKS", checkAt: ["https://www.nintendo.co.jp/ir/en", "https://www.jpx.co.jp/english"], verification: PENDING },
      { name: "Alibaba Group Holding Limited", ticker: "9988", exchange: "Hongkongi Értéktőzsde", mic: "XHKG", checkAt: ["https://www.alibabagroup.com", "https://www.hkex.com.hk"], verification: PENDING },
      { name: "Taiwan Semiconductor Manufacturing Company Limited", ticker: "2330", exchange: "Tajvani Értéktőzsde", mic: "XTAI", checkAt: ["https://investor.tsmc.com", "https://www.twse.com.tw"], verification: PENDING },
    ],
  },
];
