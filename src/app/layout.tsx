import type { Metadata, Viewport } from "next";
import { Inter, Newsreader } from "next/font/google";
import "./globals.css";

/*
 * Tipográfia — jóváhagyott irány: editorial serif heading + modern sans body/UI.
 *
 * Newsreader (display/heading): kifejezetten hosszú, szerkesztői szövegek
 * olvashatóságára tervezett Google Font, mérsékelt kontraszttal — visszafogott,
 * irodalmi karakter, nem divat-serif (nincs Didot/Bodoni-szerű éles kontraszt)
 * és nem dekoratív luxusbetű. Az "optical size" tengelye miatt a nagyobb
 * display méreteknél is arányos marad.
 *
 * Inter (body/UI): semleges, neo-grotesque sans, kifejezetten UI-precizitásra
 * tervezve; nem geometrikus (nem Futura/Poppins-jellegű "startup-tech"
 * túlsúly), rendkívül stabil és széles nyelvi lefedettségű (magyar
 * ékezetekkel is), ezért biztonságos választás egy szabályozott pénzügyi
 * oldalhoz.
 *
 * next/font/google build időben tölti le és self-hostolja a fontfájlokat —
 * ha ez a build-környezetben elérhetetlen lenne, a build ELÉRHETETLEN
 * fontfájl miatt hibázna; ezért a globals.css --font-serif-display és
 * --font-sans változói mindenképp erős rendszerfont-fallback stacket is
 * tartalmaznak, hogy a megjelenés font nélkül is stabil és olvasható legyen.
 */
const newsreader = Newsreader({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-newsreader",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

/*
 * Robots — környezetfüggő indexelés.
 * A VERCEL_ENV-et csak a Vercel-buildek állítják be ("production" |
 * "preview" | "development"); helyi buildnél és fejlesztésnél undefined,
 * ezért ott is a nem-indexelhető ág érvényesül. Csak a Vercel Production
 * környezet (a Vercel-projekt Production Branch-éről, jelenleg "main")
 * indexelhető; Preview és Development mindig noindex, nofollow.
 */
const isProductionEnvironment = process.env.VERCEL_ENV === "production";

/*
 * v1.0 — PRODUCTION CANONICAL HOST.
 *
 * A jelenlegi, hivatalos production hostname a Vercel-projekt stabil
 * vercel.app domainje — ez NEM egy feature preview URL és NEM egy
 * commit-specifikus deployment URL, hanem a projekt "Production Branch"-éhez
 * (main) tartozó, állandó cím. Ha később egyedi domain érkezik, ezt az
 * értéket egy külön, célzott commitban kell majd az új domainre cserélni —
 * ez a mostani érték nem végleges, csak a jelenlegi valóságot tükrözi.
 *
 * A `metadataBase` innen ad abszolút alapot minden relatív URL-nek
 * (canonical, Open Graph); enélkül a Next.js a build-környezet URL-jét
 * (pl. egy preview deployment címét) használná alapértelmezésként, ami
 * helytelen canonicalt eredményezne.
 */
const PRODUCTION_URL = "https://jg-investment-plus-kft.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(PRODUCTION_URL),
  title: "JG Investment Plus Kft. · A K&H Értékpapír függő ügynöke",
  description:
    "A JG Investment Plus Kft. a K&H Értékpapír (Patria Finance Magyarországi Fióktelepe) függő ügynöke. A tényleges befektetési szolgáltató a Fióktelep; a JG Investment Plus Kft. nem nyújt befektetési tanácsadást.",
  robots: isProductionEnvironment
    ? { index: true, follow: true }
    : { index: false, follow: false },
  /*
   * Minimális Open Graph — kizárólag a már jóváhagyott title/description
   * értékekből, új marketingcopy és OG image nélkül. Azok az oldalak, amelyek
   * nem definiálnak saját openGraph mezőt (pl. az adatkezelési tájékoztató),
   * ezt öröklik alapértelmezésként — ez nem szándékolt pontatlanság, csak a
   * jelenlegi minimális, egy szintű OG-lefedettség.
   */
  openGraph: {
    title: "JG Investment Plus Kft. · A K&H Értékpapír függő ügynöke",
    description:
      "A JG Investment Plus Kft. a K&H Értékpapír (Patria Finance Magyarországi Fióktelepe) függő ügynöke. A tényleges befektetési szolgáltató a Fióktelep; a JG Investment Plus Kft. nem nyújt befektetési tanácsadást.",
    type: "website",
    locale: "hu_HU",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // A 200%-os szövegnagyítás engedélyezett marad.
  maximumScale: 5,
  /*
   * v1.5.3 — SAFE AREA.
   *
   * Enélkül az iOS Safari FEKVŐ tájolásban a teljes dokumentumot a
   * „safe area" DOBOZÁBA rendezi: a Dynamic Island / notch oldalán és a
   * szemközti oldalon marad egy sáv, amit nem a dokumentum, hanem a
   * böngésző fest ki — a `body` háttérszínével. A `body` háttere Porcelain,
   * ezért a bejelentett világos oldalsávok. Ez tehát NEM a szakaszok
   * szélességének hibája (mérve: minden szakasz pontosan 100% széles,
   * vízszintes overflow 0 px minden viewporton), hanem a hiányzó
   * `viewport-fit=cover`.
   *
   * A `cover` a dokumentumot a kijelző TELJES szélességére engedi, tehát a
   * hátterek élig érnek. A szöveg viszont nem kerülhet a lekerekített sarkok
   * vagy a kamerasziget alá: ezért a TARTALMI konténerek — és kizárólag azok —
   * kapnak `env(safe-area-inset-*)` alapú belső margót a `.jg-safe-x` /
   * `.jg-safe-b` segédosztályokon keresztül (ld. globals.css). A `body`-ra
   * vagy a teljes oldalkeretre tett padding pontosan azt a hibát hozná
   * vissza, amit javítunk.
   */
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="hu" className={`${newsreader.variable} ${inter.variable}`}>
      <body>{children}</body>
    </html>
  );
}
