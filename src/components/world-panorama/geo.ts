/**
 * Közös vetítés a világpanorámához.
 *
 * A kontinensek, a városjelölők és a HTML-hotspotok UGYANEZT a vetítést
 * használják, így a pontok pontosan a geometrián ülnek.
 *
 * Vetítés: Miller-hengervetület (a Mercatornál kisebb sarki torzítás, a
 * síktérkép mégis megszokott arányú). A világkoordináta-rendszer:
 *   x  = kelet  (+), 1 fok hosszúság = MAP_SCALE egység
 *   z  = dél    (+)  — a kamera délről néz észak felé
 *   y  = fel    (+)  — a kontinensek vastagsága ebbe az irányba nő
 */

/** 1 fok hosszúság világegységben. A térkép így ~36 egység széles. */
export const MAP_SCALE = 0.1;

const DEG = Math.PI / 180;

/** Miller y (a hosszúsággal azonos „fok" mértékegységben). */
export function millerY(latDeg: number) {
  const phi = latDeg * DEG;
  return (1.25 * Math.log(Math.tan(Math.PI / 4 + 0.4 * phi))) / DEG;
}

/** Hosszúság/szélesség → sík (x, y) a Shape-ekhez (y = észak, pozitív). */
export function projectPlanar(lon: number, lat: number): [number, number] {
  return [lon * MAP_SCALE, millerY(lat) * MAP_SCALE];
}

/** Hosszúság/szélesség → világkoordináta (x, z) a térkép síkján. */
export function projectWorld(lon: number, lat: number): { x: number; z: number } {
  const [x, y] = projectPlanar(lon, lat);
  return { x, z: -y };
}
