/**
 * Világpiaci panoráma — kontinensadat előállítása (egyszeri, fejlesztői lépés).
 *
 * FORRÁS: Natural Earth v4.1.0 „land" (1:50m és 1:110m), közkincs (public
 * domain), a world-atlas@2.0.2 npm-csomag TopoJSON-terjesztésén keresztül
 * (ISC licenc, © Michael Bostock). A kimenet a projektben él:
 *   src/components/world-panorama/data/land-desktop.json  (1:50m)
 *   src/components/world-panorama/data/land-mobile.json   (1:110m)
 * Futás közben nincs külső térképszolgáltatás, API-kulcs vagy CDN.
 *
 * FELDOLGOZÁS
 *   1) TopoJSON → poligonok (topojson-client feature());
 *   2) dátumválasztó: minden gyűrű hosszúságát folytonossá „kibontjuk",
 *      majd gyűrűnként (külső és lyuk KÜLÖN) azzal a 360°-os eltolással
 *      tesszük, amellyel a pontok többsége [-180, 180]-ba esik — így pl.
 *      Csukotka folytonosan, a keleti szélen túl marad;
 *   3) Antarktisz kihagyva (nem része a kompozíciónak), kis szigetek
 *      területküszöb alatt kihagyva;
 *   4) koordináták 0,01°-ra kerekítve;
 *   5) partvonal-simítás a Miller-vetületben: ívhossz szerinti Gauss-szűrő
 *      (σ = 0,12° desktop, 0,2° mobil) — a sűrű forrásvonal apró cikcakkjai
 *      ne adjanak az egyszerűsítés után fűrészfogas, oszlopos falat;
 *   6) Douglas–Peucker egyszerűsítés; ha egy gyűrű a Miller-vetületben
 *      önmetszővé válna, a tolerancia felezésével újra egyszerűsítjük
 *      (topológia-őrző). Ha a simított gyűrű így sem tiszta, a simítatlan
 *      gyűrűvel ismételjük.
 *
 * FUTTATÁS (függőség telepítése nélkül, egy üres munkakönyvtárban):
 *   npm pack world-atlas@2.0.2 topojson-client@3.1.0
 *   (a két .tgz kibontva: world-atlas-2.0.2/, topojson-client-3.1.0/)
 *   node scripts/world-panorama/build-land.mjs <kibontott-csomagok-mappája> \
 *     src/components/world-panorama/data 50m,0.08,0.5,0.12,110m,0.15,1.5,0.2
 */
import fs from 'node:fs';
const [,, pkgDir, outDir, mode] = process.argv;
const { feature } = await import(`${pkgDir}/topojson-client-3.1.0/package/dist/topojson-client.js`);
const load = res => { const t = JSON.parse(fs.readFileSync(`${pkgDir}/world-atlas-2.0.2/package/land-${res}.json`)); const g = feature(t, t.objects.land); return (g.features ? g.features.map(f => f.geometry) : [g.geometry]).flatMap(x => x.type === 'Polygon' ? [x.coordinates] : x.coordinates); };

// 1) antimeridian: unwrap each ring, then shift the polygon so most points lie in [-180, 180]
function unwrap(ring) { let off = 0; const out = [[ring[0][0], ring[0][1]]]; for (let i = 1; i < ring.length; i++) { const d = ring[i][0] - ring[i - 1][0]; if (d > 180) off -= 360; else if (d < -180) off += 360; out.push([ring[i][0] + off, ring[i][1]]); } return out; }
// Minden gyűrű (külső és lyuk) KÜLÖN kap 360°-os eltolást: a többségi pontja legyen [-180, 180]-ban.
function normalizeRing(ring) {
  let best = 0, bestN = -1; for (const k of [-360, 0, 360]) { const n = ring.filter(([x]) => x + k >= -180 && x + k <= 180).length; if (n > bestN) { bestN = n; best = k; } }
  return ring.map(([x, y]) => [x + best, y]);
}
function normalizePolygon(poly) { return poly.map(unwrap).map(normalizeRing); }
// 2) Douglas–Peucker (iterative), closed rings
function dp(pts, tol) {
  if (pts.length < 5) return pts; const keep = new Uint8Array(pts.length); keep[0] = keep[pts.length - 1] = 1; const st = [[0, pts.length - 1]];
  while (st.length) { const [a, b] = st.pop(); let md = 0, mi = -1; const [ax, ay] = pts[a], [bx, by] = pts[b]; const dx = bx - ax, dy = by - ay, L = Math.hypot(dx, dy) || 1e-12;
    for (let i = a + 1; i < b; i++) { const d = L > 1e-9 ? Math.abs(dy * pts[i][0] - dx * pts[i][1] + bx * ay - by * ax) / L : Math.hypot(pts[i][0] - ax, pts[i][1] - ay); if (d > md) { md = d; mi = i; } }
    if (md > tol && mi > 0) { keep[mi] = 1; st.push([a, mi], [mi, b]); } }
  return pts.filter((_, i) => keep[i]);
}
// Önmetszés-ellenőrzés (szegmenspárok) — a DP egyszerűsítés okozhat ilyet.
// A vizsgálat a Miller-vetületben fut — a geometria ott egyenes szakaszokból áll.
const millerY = lat => (1.25 * Math.log(Math.tan(Math.PI / 4 + 0.4 * lat * Math.PI / 180))) * 180 / Math.PI;
function selfIntersects(raw) { const r = raw.map(([x, y]) => [x, millerY(y)]); const n = r.length; const o = (a, b, c) => Math.sign((b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]));
  for (let i = 0; i < n; i++) { const a = r[i], b = r[(i + 1) % n]; const minX = Math.min(a[0], b[0]), maxX = Math.max(a[0], b[0]);
    for (let j = i + 2; j < n; j++) { if (i === 0 && j === n - 1) continue; const c = r[j], d = r[(j + 1) % n];
      if (Math.max(c[0], d[0]) < minX || Math.min(c[0], d[0]) > maxX) continue;
      if (o(a, b, c) * o(a, b, d) < 0 && o(c, d, a) * o(c, d, b) < 0) return true; } } return false; }
// Partvonal-simítás: Gauss-szűrő ívhossz szerint, a Miller-vetület síkjában
// (a térkép ebben a síkban látszik). A nagyon kis gyűrűk változatlanok.
const DEG = Math.PI / 180;
const millerInv = y => (2.5 * (Math.atan(Math.exp((y * DEG) / 1.25)) - Math.PI / 4)) / DEG;
function smoothRing(raw, sigma) {
  const n = raw.length; if (n < 8 || sigma <= 0) return raw;
  const r = raw.map(([x, y]) => [x, millerY(y)]);
  const seg = r.map((a, i) => Math.hypot(r[(i + 1) % n][0] - a[0], r[(i + 1) % n][1] - a[1]));
  if (seg.reduce((s, d) => s + d, 0) < 8 * sigma) return raw;
  const R = 3 * sigma;
  return r.map(([x0, y0], i) => {
    let sx = x0, sy = y0, sw = 1;
    for (const dir of [1, -1]) {
      let d = 0;
      for (let k = 1; k < n; k++) {
        const j = (((i + dir * k) % n) + n) % n;
        d += seg[dir === 1 ? (j - 1 + n) % n : j];
        if (d > R) break;
        const w = Math.exp(-(d * d) / (2 * sigma * sigma));
        sx += w * r[j][0]; sy += w * r[j][1]; sw += w;
      }
    }
    return [sx / sw, millerInv(sy / sw)];
  });
}
// Topológia-őrző egyszerűsítés: önmetszés esetén felezett toleranciával újra.
function simplifySafe(ring, tol) { let t = tol, out = dp(ring, t); while (selfIntersects(out) && t > 0.004) { t /= 2; out = dp(ring, t); } return selfIntersects(out) ? ring : out; }
const area = r => { let s = 0; for (let i = 0, j = r.length - 1; i < r.length; j = i++) s += (r[j][0] + r[i][0]) * (r[j][1] - r[i][1]); return Math.abs(s / 2); };
function lod(res, tol, minArea, sigma) {
  const out = []; let pts = 0, holes = 0;
  for (const poly of load(res)) {
    const p = normalizePolygon(poly);
    if (Math.max(...p[0].map(c => c[1])) < -60) continue;          // Antarctica out
    if (area(p[0]) < minArea) continue;                              // small islands out
    const round2 = r => r.map(([x, y]) => [Math.round(x * 100) / 100, Math.round(y * 100) / 100]).filter((c, i, arr) => i === 0 || c[0] !== arr[i - 1][0] || c[1] !== arr[i - 1][1]);
    const rings = p.map(r => {
      const raw = round2(r.slice(0, -1));
      const smooth = simplifySafe(smoothRing(raw, sigma), tol);
      return selfIntersects(smooth) ? simplifySafe(raw, tol) : smooth;
    }).filter((r, i) => r.length >= 4 && (i === 0 || area(r) >= minArea * 0.5));
    if (!rings.length || rings[0].length < 4) continue;
    holes += rings.length - 1; pts += rings.reduce((s, r) => s + r.length, 0);
    out.push(rings.map(r => r.flatMap(([x, y]) => [Math.round(x * 100) / 100, Math.round(y * 100) / 100])));
  }
  const xs = out.flatMap(p => p[0].filter((_, i) => i % 2 === 0));
  return { out, stats: { res, tol, minArea, sigma, polygons: out.length, holes, points: pts, lonMin: Math.min(...xs), lonMax: Math.max(...xs) } };
}
if (mode === 'survey') {
  for (const [res, tol, a, sg] of [['50m', 0.08, 0.5, 0], ['50m', 0.08, 0.5, 0.12], ['110m', 0.15, 1.5, 0], ['110m', 0.15, 1.5, 0.2]]) console.log(lod(res, tol, a, sg).stats);
} else {
  const [dRes, dTol, dA, dSg, mRes, mTol, mA, mSg] = mode.split(',');
  for (const [name, res, tol, a, sg] of [['desktop', dRes, +dTol, +dA, +dSg], ['mobile', mRes, +mTol, +mA, +mSg]]) {
    const { out, stats } = lod(res, tol, a, sg);
    fs.writeFileSync(`${outDir}/land-${name}.json`, JSON.stringify({ source: 'Natural Earth v4.1.0 land (public domain) via world-atlas@2.0.2 (ISC)', scale: `1:${res}`, simplifyToleranceDeg: tol, minPolygonAreaDeg2: a, smoothSigmaDeg: sg, polygons: out }));
    console.log(name, stats, (fs.statSync(`${outDir}/land-${name}.json`).size / 1024).toFixed(1) + ' KB');
  }
}
