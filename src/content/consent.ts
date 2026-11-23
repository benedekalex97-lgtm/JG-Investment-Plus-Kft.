/**
 * Sütihozzájárulás-sáv szövege (2026-11-23; a megrendelő döntésére élesítve,
 * K&H-/jogi átnézése utólag javasolt).
 * A részletes tájékoztatás az adatkezelési tájékoztató 8. pontjában van
 * (privacy-policy.ts → googleAnalytics).
 */
export const consent = {
  heading: "Sütik és mérés",
  text: "Hozzájárulása esetén a Google Analytics sütiket helyez el, hogy összesítve lássuk, hogyan használják a látogatók a weboldalt. Elutasítás esetén csak a süti nélküli, összesített látogatottsági statisztika működik. Döntését később a lábléc „Süti-beállítások” gombjával bármikor módosíthatja.",
  linkLabel: "Részletek az adatkezelési tájékoztatóban",
  linkHref: "/adatkezelesi-tajekoztato#google-analytics",
  accept: "Elfogadom",
  reject: "Elutasítom",
  /** A lábléc gombja, amellyel a döntés bármikor módosítható. */
  settingsLabel: "Süti-beállítások",
} as const;
