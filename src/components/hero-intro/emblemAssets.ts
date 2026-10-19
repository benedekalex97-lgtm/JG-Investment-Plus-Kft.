/**
 * A hero-embléma rétegképei — GENERÁLT ÉRTÉKEK, ld. scripts/build-hero-emblem.mjs.
 *
 * A forrás három, azonos 1000×1100-as vászonra renderelt PNG
 * (JG_hero_3D_alap_v01 csomag, layers/). A build-script mindhármat UGYANAZZAL
 * a téglalappal vágja (a három réteg alfa-uniójának befoglaló doboza + ráhagyás),
 * így a regisztráció változatlan marad; utána azonos szélességekre méretez.
 */
export const emblemAssets = {
  width: 1000,
  height: 1100,
  widths: [480, 720, 1000],
  /* Desktopon a hero jobb oldali oszlopa, alatta a szöveg alatti hely. */
  sizes: "(min-width: 1024px) min(36vw, 480px), (min-width: 640px) 340px, 62vw",
  layers: [
    { role: "left", base: "/hero-emblem/jg-panel-silver" },
    { role: "right", base: "/hero-emblem/jg-panel-carbon" },
    { role: "cap", base: "/hero-emblem/jg-cap-aubergine" },
  ],
} as const;
