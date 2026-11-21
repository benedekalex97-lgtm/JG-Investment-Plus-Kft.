import type { Metadata, Viewport } from "next";
import { Inter, Newsreader } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import ContactClickTracker from "@/components/ContactClickTracker";
import { SITE_URL } from "@/lib/site";
import { SITE_DESCRIPTION, SITE_TITLE, baseOpenGraph } from "@/lib/seo";
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
  /*
   * SEO-audit (2026-11-20): csak a ténylegesen használt vastagságok — a
   * renderelt oldalakon mérve Newsreader 400/500, Inter 400/500/600; dőlt
   * stílus és Inter 700 sehol. Új vastagság használata előtt ide is fel kell
   * venni, különben a böngésző műfélkövért rajzol.
   */
  weight: ["400", "500"],
  style: ["normal"],
  variable: "--font-newsreader",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600"],
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
 * PRODUCTION CANONICAL HOST — ld. src/lib/site.ts (SITE_URL).
 *
 * A `metadataBase` innen ad abszolút alapot minden relatív URL-nek
 * (canonical, Open Graph); enélkül a Next.js a build-környezet URL-jét
 * (pl. egy preview deployment címét) használná alapértelmezésként, ami
 * helytelen canonicalt eredményezne. A canonical oldalanként más, ezért
 * azt az egyes oldalak saját metadata exportja adja meg.
 */

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  robots: isProductionEnvironment
    ? { index: true, follow: true }
    : { index: false, follow: false },
  /*
   * Open Graph — a jóváhagyott title/description értékekből (src/lib/seo.ts).
   * Az og:url-t és a saját og:title-t minden oldal maga adja meg (baseOpenGraph
   * kiterjesztésével), mert az oldalszintű openGraph a gyökérét egészében
   * lecseréli; itt ezért nincs url, így egyetlen oldal sem örököl hibásat.
   */
  openGraph: baseOpenGraph,
  /*
   * A megosztási kép (public/og-image.png, ld. src/lib/seo.ts baseOpenGraph)
   * a nagy képes kártyával az X/Twitter előnézetben is megjelenik.
   */
  twitter: { card: "summary_large_image" },
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
      <body>
        {children}
        {/*
          Vercel Web Analytics — süti (cookie) nélküli, összesített
          látogatottsági statisztika; fejlesztői módban nem mér. Az adatkezelési
          tájékoztató 7. pontja (privacy-policy.ts → `analytics`) írja le.
          Csak akkor gyűjt adatot, ha a Vercel-projektben a Web Analytics be
          van kapcsolva.
        */}
        <Analytics />
        {/* Telefonszámra / e-mail-címre kattintás névtelen mérése (contact_click). */}
        <ContactClickTracker />
      </body>
    </html>
  );
}
