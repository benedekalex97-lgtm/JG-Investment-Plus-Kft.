/**
 * HeroAssembly — KÖZPONTI HANGOLÁS.
 *
 * Ez az EGYETLEN hely, ahol a görgetésre összeálló embléma kamerája,
 * mozgási távolságai, görgetési hossza, anyagai és fényei állíthatók. A
 * komponensek és a Three.js-színpad nem tartalmaznak saját hangolási
 * értéket, mindent innen olvasnak.
 *
 * MÉRTÉKEGYSÉGEK
 *   – a mozgás az embléma MAGASSÁGÁHOZ viszonyított arány (1 = teljes
 *     emblémamagasság), így a jelenet mérete nem befolyásolja;
 *   – a geometria logóegységben értendő (az SVG viewBoxa 88 × 99 egység);
 *   – a görgetési hossz a viewport magasságának többszöröse.
 *
 * SZÍNEK: itt nincs nyers HEX. Az anyagszíneket a színpad futásidőben a
 * globals.css tokenjeiből olvassa ki (--color-porcelain, --color-cool-silver,
 * --color-aubergine, --color-ink).
 */

export type AssemblyLayout = "wide" | "compact";
export type MaterialKind = "porcelain" | "silver" | "glass";

export const ASSEMBLY = {
  /**
   * SZÉTHÚZÁS a kezdőállapotban (progress = 0).
   *   lift   — a felső rombusz felfelé tolása;
   *   spread — a két pillér vízszintes eltolása (tükrösen, azonos mértékben).
   * A pillérek LEFELÉ mozdulása NEM hangolási érték: a színpad úgy számolja
   * ki, hogy a három elem felület-súlypontja (a csoport optikai középpontja)
   * helyben maradjon — ld. geometry.ts, explodeOffsets().
   */
  explode: {
    wide: { lift: 0.24, spread: 0.23 },
    compact: { lift: 0.17, spread: 0.16 },
  },

  scroll: {
    /**
     * Rögzített (sticky) desktop-hero: a görgetési út a viewport
     * magasságának többszörösében. A CSS ezzel a szorzóval méretezi a
     * pályát, a ScrollTrigger pedig a pálya tényleges magasságát olvassa.
     */
    pinnedDistance: 1,
    /**
     * A pálya ekkora hányadánál áll össze TELJESEN az embléma; a maradék
     * rövid szakaszban összeállt állapotban marad, mielőtt a hero továbbgördül.
     */
    assembleAt: 0.8,
    /** GSAP scrub: a görgetési pozíciót ennyi másodperc alatt éri utol. */
    scrub: 0.3,
    /**
     * A normalizált előrehaladás görbéje (GSAP ease-név). Mindhárom elem
     * ugyanezt a görbét és ugyanazt az értéket kapja. Nincs túllövés.
     */
    ease: "sine.inOut",
    /**
     * Rögzítés nélküli (mobil / tablet / alacsony ablak) változat: az embléma
     * akkor áll össze, amikor a színpad középpontja a header alatti látható
     * terület ekkora hányadához ér. A pálya hossza a viewport magasságának
     * inlineMin–inlineMax többszöröse közé van szorítva.
     */
    inlineTarget: 0.5,
    inlineMin: 0.3,
    inlineMax: 0.62,
  },

  camera: {
    /**
     * Függőleges látószög (fok). Hosszú fókusz: kicsi perspektivikus torzítás.
     */
    fov: 30,
    /**
     * A kamera enyhén felülről néz (fok), hogy a padlón ülő lágy árnyék
     * olvasható legyen. Az embléma síkja a nézési irányra MERŐLEGES marad
     * (a csoport ugyanennyivel hátra van döntve), tehát az összeállt állapot
     * továbbra is az SVG sziluettjének pontos, arányos vetülete.
     */
    pitch: 9,
    /**
     * Keret: a széthúzott állapot + árnyék a látható félméret legfeljebb
     * (1 - margin) részét foglalja el.
     */
    margin: 0.07,
    /** Az összeállt embléma legfeljebb a színpad magasságának ekkora része. */
    maxEmblemFraction: { wide: 0.54, compact: 0.6 },
  },

  /** Geometria logóegységben (az embléma 99 egység magas). */
  emblem: {
    /** Teljes lapvastagság. */
    depth: 6,
    /** Élletörés szélessége; a sziluett ettől NEM nő (bevelOffset = -bevel). */
    bevel: 1.05,
    bevelSegments: 3,
    /** E szög alatt a szomszédos lapok normálisai simítva (fok). */
    creaseAngle: 40,
  },

  /**
   * ANYAGKIOSZTÁS — melyik emblémaelem milyen anyagot kap. Ezt követi a 3D
   * színpad, a statikus fallback és a H1 is: a főcím három kifejezése
   * sorrendben a `headline` elemeinek anyagszínét viseli.
   */
  pieceMaterials: { cap: "silver", left: "porcelain", right: "glass" },
  headline: ["cap", "left", "right"],

  materials: {
    /**
     * Matt porcelán (Porcelain #F4F3F1) — jelenleg a bal pillér. A lap
     * tónusleképezés NÉLKÜL jelenik meg (toneMapped: false), így a
     * megvilágított felülete egy árnyalattal a Porcelain háttér FÖLÉ
     * emelkedik, és nem olvad bele. falloff: a lágy fényesés bal felső ->
     * jobb alsó szorzója (1 = teljes fény).
     */
    porcelain: { roughness: 0.6, envMapIntensity: 1, falloff: [1, 0.965] as const },
    /**
     * Szatén, szálcsiszolt ezüstszürke (Cool Silver #BEC1C7) — jelenleg a
     * felső rombusz. brushed: a vízszintes csiszolásnyomok érdesség-szórása;
     * brushedRowsPerUnit: a rajzolat sűrűsége logóegységenként, így az elem
     * méretétől függetlenül ugyanolyan finom. envMapIntensity: a felső elem
     * a magas softbox közelében tükröz, ezért visszafogott — így a lap
     * közepe a Cool Silver tónusában marad, nem fehéredik ki.
     */
    silver: { roughness: 0.3, brushed: 0.16, brushedRowsPerUnit: 3.4, envMapIntensity: 0.72 },
    /**
     * Füstös, részben áttetsző padlizsánüveg — a jobb pillér. A szín a
     * vastagságon át elnyelt fényből adódik (Beer–Lambert): a vastagabb
     * felső rész az Aubergine tónust, a vékonyabb, átvilágított alsó rész a
     * Muted Plum felé húzó tónust adja. thicknessTop / thicknessBottom az
     * attenuationDistance-hez viszonyított relatív vastagság.
     */
    glass: {
      roughness: 0.18,
      ior: 1.5,
      thicknessTop: 1,
      thicknessBottom: 0.5,
      clearcoat: 1,
      clearcoatRoughness: 0.12,
      envMapIntensity: 1,
    },
  },

  light: {
    /** Tónusleképezés expozíciója (Neutral — a márkaszín-árnyalatot megtartja). */
    exposure: 1,
    /** A stúdiókörnyezet (nagy, lágy softboxok) közös szorzója — minden anyag envMapIntensity-jével szorzódik. */
    environment: 1,
    /** Irányított kulcsfény bal felülről. */
    key: 1.1,
  },

  shadow: {
    /** A padló távolsága a (széthúzott) pillérek legalsó pontja alatt, logóegységben. */
    floorGap: 3.5,
    /** E magasság (logóegység) fölött egy elem már nem vet kontaktárnyékot. */
    reach: 55,
    /** Elmosás mértéke (texelben, két menetben). */
    blur: 4,
    /** Az árnyék átlátszatlansága. */
    opacity: 0.34,
    /** Az üveg átengedi a fényt: halványabb árnyékot vet. */
    glassStrength: 0.62,
    resolution: 512,
  },

  render: {
    /** Pixel ratio plafon — éles, de nem pazarló. */
    maxPixelRatio: { wide: 2, compact: 2 },
    /** Az üveg-transmission render target felbontása a canvashoz képest. */
    transmissionScale: 1,
  },
} as const;
