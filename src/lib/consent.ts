/**
 * Sütihozzájárulás — a döntés tárolása és jelzése (csak kliensen).
 *
 * A látogató döntését a böngésző localStorage-a tárolja (CONSENT_KEY), JSON-
 * ként: a döntés („granted" | „denied"), az időpontja (ISO) és az elfogadott
 * tájékoztató verziója (CONSENT_VERSION). Ez a hozzájárulás megjegyzéséhez és
 * igazolásához (GDPR 7. cikk (1)) feltétlenül szükséges tárolás; nem kerül a
 * szerverre, és nem azonosít senkit. Ld. az adatkezelési tájékoztató 8.
 * pontját (privacy-policy.ts → googleAnalytics).
 *
 * ÚJRAKÉRDEZÉS: a tárolt döntés érvénytelen (a sáv újra megjelenik), ha
 *   – régebbi, mint CONSENT_MAX_AGE_DAYS (12 hónap), vagy
 *   – a CONSENT_VERSION megváltozott (a 8. pont tartalmi módosításakor ezt
 *     KELL emelni, hogy minden látogató az új tájékoztatás alapján döntsön).
 *
 * A „Süti-beállítások" gomb (lábléc) a CONSENT_OPEN_EVENT eseménnyel nyitja
 * újra a sávot; a döntés változását a CONSENT_CHANGE_EVENT jelzi.
 */

export type ConsentChoice = "granted" | "denied";

export const CONSENT_KEY = "jg-consent-v1";
/** Az adatkezelési tájékoztató 8. pontjának verziója (dátum). Tartalmi változáskor emelendő. */
export const CONSENT_VERSION = "2026-11-23";
export const CONSENT_MAX_AGE_DAYS = 365;
export const CONSENT_CHANGE_EVENT = "jg-consent-change";
export const CONSENT_OPEN_EVENT = "jg-consent-open";

type StoredConsent = { choice: ConsentChoice; at: string; version: string };

/** Az érvényes tárolt döntés, vagy null (még nem döntött, lejárt, új verzió, vagy a tárolás nem elérhető). */
export function readConsent(): ConsentChoice | null {
  try {
    const raw = window.localStorage.getItem(CONSENT_KEY);
    if (!raw) return null;
    const v = JSON.parse(raw) as Partial<StoredConsent>;
    if (v.choice !== "granted" && v.choice !== "denied") return null;
    if (v.version !== CONSENT_VERSION) return null;
    const at = Date.parse(v.at ?? "");
    if (!Number.isFinite(at) || Date.now() - at > CONSENT_MAX_AGE_DAYS * 86_400_000) return null;
    return v.choice;
  } catch {
    return null;
  }
}

export function writeConsent(choice: ConsentChoice): void {
  try {
    const value: StoredConsent = { choice, at: new Date().toISOString(), version: CONSENT_VERSION };
    window.localStorage.setItem(CONSENT_KEY, JSON.stringify(value));
  } catch {
    /* privát mód / tiltott tárolás: a döntés csak erre a látogatásra él */
  }
  window.dispatchEvent(new CustomEvent<ConsentChoice>(CONSENT_CHANGE_EVENT, { detail: choice }));
}

/** A sáv újranyitása (lábléc „Süti-beállítások"). */
export function openConsentSettings(): void {
  window.dispatchEvent(new Event(CONSENT_OPEN_EVENT));
}
