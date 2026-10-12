/**
 * „Megtakarítási és adózási lehetőségek" — a négy vízszintes réteg 3D-
 * jelenetének KÖZPONTI HANGOLÁSA. A színpad (layers-stage.ts) és a vezérlő
 * komponens (SavingsLayers.tsx) mindent innen olvas.
 *
 * MÉRTÉKEGYSÉG: a lap oldalhossza = 1. A referencia
 * (src/assets/services/szolgaltatas-02-megtakaritas-adozas-negy-vizszintes-reteg.jpg)
 * arányai: négyzetes alaprajz, vastagság ≈ 0,07, középtől középig mért
 * rétegtávolság ≈ 0,17 (≈ 0,10 levegős rés a lapok között).
 *
 * SZÍNEK: nincs nyers HEX — a lapok anyagszínét a színpad a globals.css
 * tokenjeiből olvassa (porcelain, cool-silver, muted-plum, aubergine, ink).
 */

export type LayersLayout = "wide" | "compact";

export const LAYERS = {
  slab: {
    /** Teljes lapvastagság. */
    thickness: 0.07,
    /** A négyzet sarkainak lekerekítése. */
    cornerRadius: 0.075,
    /** Megmunkált él: befelé induló élletörés (a körvonal nem nő). */
    bevel: 0.016,
    bevelSegments: 3,
    /** Sarokív-felbontás — mérsékelt geometriai részletesség. */
    curveSegments: 8,
  },

  /**
   * Középtől középig mért rétegtávolság. A négy lap a csoport közepe körül
   * szimmetrikusan áll (±0,5 és ±1,5 távolság), így a rések szűkülésekor a
   * felső lapok lefelé, az alsók felfelé mozdulnak, a kompozíció közepe helyben
   * marad. A végállapot rése is levegős: a lapok sosem érnek össze.
   */
  spacing: {
    closed: 0.17,
    open: { wide: 0.3, compact: 0.25 },
  },

  camera: {
    /** Hosszú fókusz: közel ortografikus vetület. */
    fov: 12,
    /** Enyhe felülnézet (fok) — a referencia felső lapjainak rövidüléséből. */
    elevation: 20,
    /** A lapok elforgatása a függőleges tengely körül (fok). */
    yaw: -38,
    /** A NYITOTT állapot + árnyék a képmező legfeljebb (1 - margin) részét tölti ki. */
    margin: 0.12,
  },

  /**
   * A képlap háttere a referenciakép mért hátterét követi (Porcelain-szorzók):
   * alap ≈ #E8E7E3, bal közép felé világosodik (≈ #F0EFED), jobbra és felül
   * sötétedik (≈ #E2E1DD). Így a 3D-lap ugyanúgy olvas, mint a fotó, és nem
   * jelenik meg új canvas-szegély.
   */
  backdrop: { base: 0.951, highlight: 0.983, shade: 0.927 },

  /**
   * edge: az üveg oldalfalának fényút-szorzója (sötétebb, füstösebb él).
   * Az üveg fedőlapja visszafogottan tükröz (clearcoat, envMapIntensity): a
   * súrló nézőszögben különben a tükrözés elnyomná az átlátszóságot.
   */
  materials: {
    porcelain: { roughness: 0.62, envMapIntensity: 0.9 },
    silver: { roughness: 0.38, brushed: 0.3, brushedRowsPerUnit: 140, envMapIntensity: 1.4 },
    /** Tompa szilvaszínű, áttetsző üveg (Muted Plum) — 3. réteg. */
    plumGlass: { roughness: 0.1, ior: 1.5, attenuation: 1.5, edge: 3, clearcoat: 0.25, envMapIntensity: 0.6 },
    /** Füstös padlizsánüveg (Aubergine) — legfelső réteg. */
    aubergineGlass: { roughness: 0.08, ior: 1.5, attenuation: 1.7, edge: 4, clearcoat: 0.25, envMapIntensity: 0.6 },
  },

  light: { exposure: 1, key: 1.05 },

  shadow: {
    /** A padlóárnyék a legalsó lap alatt ennyivel (állandó). */
    floorGap: 0.07,
    /** Rétegközi kontaktárnyék erőssége szűk, ill. tág résnél. */
    between: { near: 0.3, far: 0.1 },
    /** Padlóárnyék erőssége. */
    floor: 0.3,
    /** Üveg fölötte: halványabb, tónusos árnyék. */
    glassFactor: 0.6,
  },

  render: {
    maxPixelRatio: { wide: 2, compact: 1.5 },
    /** Az üveg-transmission render target felbontása (mobilon könnyebb). */
    transmissionScale: { wide: 1, compact: 0.5 },
  },

  scroll: {
    /** Indulás: a képmező teteje a viewport ennyi részénél. */
    start: 0.88,
    /**
     * Vége: a képmező KÖZEPE a sticky header alatti látható terület ennyi
     * részénél (1440×900-on ≈ a viewport 37%-a, 390×844-en ≈ 37%).
     */
    end: 0.31,
    /** Rövid scrub: nincs hosszú utómozgás. */
    scrub: 0.3,
    /** Rövid lágy indulás és érkezés, hosszú egyenletes közép (ld. motion/curves.ts). */
    ramp: 0.16,
  },
} as const;
