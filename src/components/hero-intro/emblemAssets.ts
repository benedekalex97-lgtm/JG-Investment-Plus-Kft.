/**
 * A hero-embléma rétegképei — GENERÁLT ÉRTÉKEK, ld. scripts/build-hero-emblem.mjs.
 *
 * A forrás három, azonos 1000×1100-as vászonra renderelt PNG
 * (JG_hero_3D_alap_v01 csomag, layers/). A build-script mindhármat UGYANAZZAL
 * a téglalappal vágja (a három réteg alfa-uniójának befoglaló doboza + ráhagyás),
 * így a regisztráció változatlan marad; utána azonos szélességekre méretez.
 *
 * `canvas`: az eredeti vászon és a vágás bal felső sarka — a teljes vásznon
 * álló padlófény-réteg ebből kapja a pontos, regisztrált helyét.
 */
export const emblemAssets = {
  width: 814,
  height: 906,
  widths: [400, 600, 814],
  canvas: { width: 1000, height: 1100, left: 93, top: 93 },
  /* Desktopon a hero jobb oldali oszlopa, alatta a szöveg alatti hely. */
  sizes: "(min-width: 1024px) min(36vw, 480px), (min-width: 640px) 340px, min(56vw, 280px)",
  layers: [
    { role: "left", base: "/hero-emblem/jg-panel-silver" },
    { role: "right", base: "/hero-emblem/jg-panel-carbon" },
    { role: "cap", base: "/hero-emblem/jg-cap-aubergine" },
  ],
  /* A background.png-ből kinyert, csak fényt hordozó réteg (ld. build-script);
     floorRect: a fénysáv helye az eredeti vásznon. */
  floorLight: "/hero-emblem/jg-floor-light-480.webp",
  floorRect: { left: 90, top: 845, width: 828, height: 241 },
} as const;
