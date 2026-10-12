/**
 * Trapéz sebességprofilú görbe görgetéshez kötött mozgáshoz: `ramp` hosszú
 * lágy indulás és érkezés, közte egyenletes mozgás; 0 = lineáris. Folytonos,
 * a két végén nulla sebességgel, túllövés nélkül — és nem lassul le idő
 * előtt, tehát a mozgás nem tűnik késznek, mielőtt a pálya véget ér.
 * Használja: a hero rögzítés nélküli pályája és a szolgáltatási rétegjelenet.
 */
export function ramped(t: number, ramp: number) {
  if (ramp <= 0) return t;
  const speed = 1 / (1 - ramp);
  if (t < ramp) return (speed * t * t) / (2 * ramp);
  if (t > 1 - ramp) return 1 - (speed * (1 - t) * (1 - t)) / (2 * ramp);
  return speed * (t - ramp / 2);
}
