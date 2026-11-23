/**
 * Sütihozzájárulás — a döntés tárolása és jelzése (csak kliensen).
 *
 * A látogató döntése („granted" | „denied") a böngésző localStorage-ában él
 * (CONSENT_KEY). Ez a hozzájárulás megjegyzéséhez feltétlenül szükséges
 * tárolás, nem kerül a szerverre, és nem azonosít senkit. Ld. az adatkezelési
 * tájékoztató 8. pontját (privacy-policy.ts → googleAnalytics).
 *
 * A „Süti-beállítások" gomb (lábléc) a CONSENT_OPEN_EVENT eseménnyel nyitja
 * újra a sávot; a döntés változását a CONSENT_CHANGE_EVENT jelzi.
 */

export type ConsentChoice = "granted" | "denied";

export const CONSENT_KEY = "jg-consent-v1";
export const CONSENT_CHANGE_EVENT = "jg-consent-change";
export const CONSENT_OPEN_EVENT = "jg-consent-open";

/** A tárolt döntés, vagy null (még nem döntött, vagy a tárolás nem elérhető). */
export function readConsent(): ConsentChoice | null {
  try {
    const v = window.localStorage.getItem(CONSENT_KEY);
    return v === "granted" || v === "denied" ? v : null;
  } catch {
    return null;
  }
}

export function writeConsent(choice: ConsentChoice): void {
  try {
    window.localStorage.setItem(CONSENT_KEY, choice);
  } catch {
    /* privát mód / tiltott tárolás: a döntés csak erre a látogatásra él */
  }
  window.dispatchEvent(new CustomEvent<ConsentChoice>(CONSENT_CHANGE_EVENT, { detail: choice }));
}

/** A sáv újranyitása (lábléc „Süti-beállítások"). */
export function openConsentSettings(): void {
  window.dispatchEvent(new Event(CONSENT_OPEN_EVENT));
}
