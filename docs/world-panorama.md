# Világpiaci panoráma — Hero (World Market Panorama v1.0)

Állapot: **helyi implementáció**, nincs commitolva, pusholva vagy deployolva.
A vizuális jóváhagyás Alex külön döntése.

## Felépítés

| Fájl | Szerep |
| --- | --- |
| `src/components/Hero.tsx` | Szerverkomponens. A Hero szövege (eyebrow, H1, bevezető, CTA) változatlan HTML a tartalmi modellből; a státuszközlés külön, átlátszatlan sötét sávban. |
| `src/components/world-panorama/WorldPanorama.tsx` | Kliens-komponens: 3D színpad, HTML-hotspotok, regionális panel, mozgásvezérlő, fallbackek. A 3D motort `import()`-tal, csak kliensen tölti be. |
| `src/components/world-panorama/engine.ts` | Three.js jelenet (csak dinamikusan töltődik): extrudált kontinensek, anyagok, fények, ívek, városjelölők; ütemezés a meglévő `gsap.ticker`-en. |
| `src/components/world-panorama/camera-path.ts` | Zárt, 24 s-os kameraút (periodikus Hermite-interpoláció, desktop és mobil kulcskockák). |
| `src/components/world-panorama/geo.ts` | Közös Miller-vetület (kontinensek, városok, hotspotok). |
| `src/components/world-panorama/markets.ts` | Regionális bemutató listák + strukturált metaadat (jegyzési hely, MIC, ellenőrzési állapot). |
| `src/components/world-panorama/data/land-*.json` | Előfeldolgozott kontinensadat (desktop 1:50m, mobil 1:110m). |
| `scripts/world-panorama/build-land.mjs` | Az adat reprodukálható előállítása (bájtra azonos kimenet). |
| `public/hero/world-panorama-{desktop,mobile}.webp` | A tényleges jelenetből (t = 0 póz) exportált statikus poszter: első festés, WebGL-fallback, JS nélküli nézet. |

## Térképadat és licenc

- **Forrás:** Natural Earth v4.1.0, `land` réteg, 1:50m (desktop) és 1:110m (mobil).
- **Terjesztés:** `world-atlas@2.0.2` npm-csomag (TopoJSON), ISC licenc, © 2013–2019 Michael Bostock.
- **Natural Earth licenc:** közkincs (public domain) a Natural Earth saját közlése szerint.
  A naturalearthdata.com felhasználási feltételei oldalt **ebben a munkamenetben nem
  sikerült megnyitni** (a környezet hálózati szabályzata blokkolta); a public domain
  állapot a world-atlas README-jén és a Natural Earth ismert közlésén alapul — publikálás
  előtt a https://www.naturalearthdata.com/about/terms-of-use/ oldalon ellenőrizendő.
- **Feldolgozás:** ld. a build-szkript fejlécét (dátumválasztó kezelése, Antarktisz
  kihagyása, kis szigetek kiszűrése, topológia-őrző egyszerűsítés).
- **Méret:** desktop 133 poligon / ~13,4 ezer pont (165 KB, gzip ~55 KB);
  mobil 70 poligon / ~2,8 ezer pont (35 KB). Csak a dinamikusan betöltött 3D chunkkal
  töltődnek.

## Kameraút (24 s)

Egyetlen normalizált fázis vezérli: `p = aktívan futott idő / 24 mod 1`. A cél, azimut,
emelkedés, távolság és a vízszintes látószög periodikus, idő-arányos Hermite-interpolációval
mozog a kulcskockák között, ezért a pálya értékben és sebességben is folytonos, a
ciklushatáron is. Megállítás alatt a fázis nem halad (nincs „falióra-behozás").

## Részvényadatok — ellenőrzési állapot

Minden tétel `verification.status = "unverified"`. A nevek és tickerek a brief
listájából, a jegyzési hely és MIC a fejlesztő ismeretéből származik; elsődleges forrásból
(kibocsátói IR-oldal, tőzsde, ISO 10383) **nem lettek ellenőrizve**, mert a környezet
hálózati szabályzata ezeket a hostokat blokkolta (2026-11-04). Publikálás előtt
tételenként ellenőrizendő; a `checkAt` mező csak a javasolt ellenőrzési helyet adja.
