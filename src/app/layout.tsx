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

export const metadata: Metadata = {
  title: "JG Investment Plus Kft. · A K&H Értékpapír függő ügynöke",
  description:
    "A JG Investment Plus Kft. a K&H Értékpapír (Patria Finance Magyarországi Fióktelepe) függő ügynöke. A tényleges befektetési szolgáltató a Fióktelep; a JG Investment Plus Kft. nem nyújt befektetési tanácsadást.",
  // v0.2 prototípus: nem publikálásra kész, ezért nem indexelhető.
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // A 200%-os szövegnagyítás engedélyezett marad.
  maximumScale: 5,
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
