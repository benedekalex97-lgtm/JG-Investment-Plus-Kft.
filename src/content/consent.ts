/**
 * Sütihozzájárulás-sáv szövege — TERVEZET, K&H-jóváhagyásra vár (2026-11-23).
 * A részletes tájékoztatás az adatkezelési tájékoztató 8. pontjában van
 * (privacy-policy.ts → googleAnalytics).
 */
export const consent = {
  heading: "Sütik és mérés",
  text: "Hozzájárulása esetén a Google Analytics sütiket helyez el, hogy összesítve lássuk, hogyan használják a látogatók a weboldalt. Elutasítás esetén csak a süti nélküli, összesített látogatottsági statisztika működik.",
  linkLabel: "Részletek az adatkezelési tájékoztatóban",
  linkHref: "/adatkezelesi-tajekoztato#google-analytics",
  accept: "Elfogadom",
  reject: "Elutasítom",
  /** A lábléc gombja, amellyel a döntés bármikor módosítható. */
  settingsLabel: "Süti-beállítások",
} as const;
