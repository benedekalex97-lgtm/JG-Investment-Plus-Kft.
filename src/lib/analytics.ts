import { track } from "@vercel/analytics";

/**
 * Mérés — EGY belépési pont a gombkattintásokhoz és hasonló eseményekhez.
 *
 *  - Vercel Web Analytics: süti nélkül, mindig (ld. adatkezelési tájékoztató
 *    7. pont). A Hobby csomagban az egyedi események nem kérdezhetők le, de a
 *    beküldésük nem árt, és csomagváltáskor azonnal láthatók.
 *  - Google Analytics 4: CSAK ha a látogató hozzájárult, és a GA betöltődött
 *    (ld. ConsentAndAnalytics, 8. pont). Hozzájárulás nélkül a gtag nincs
 *    jelen, ezért itt semmi nem történik.
 *
 * Személyes adat (név, telefonszám, e-mail-cím) egyik eseménybe sem kerülhet.
 */

/** A GA4 mérési azonosító (jginvst.hu / „JG weboldal" adatfolyam). Nem titkos. */
export const GA_MEASUREMENT_ID = "G-F2DXQQQJZK";

/** A GA csak a production domainen tölt be; preview-n és helyben nem szennyezi az adatokat. */
export const GA_HOSTNAMES = ["www.jginvst.hu"] as const;

type EventParams = Record<string, string>;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export function trackEvent(name: string, params: EventParams): void {
  track(name, params);
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag("event", name, params);
  }
}
