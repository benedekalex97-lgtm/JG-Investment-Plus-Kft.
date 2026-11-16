# Világpiaci panoráma — Hero (World Market Panorama v1.1)

Állapot: a v1.0 a `feat/jg-world-market-panorama-v1` ágon commitolva; a v1.1
(célzott vizuális javítás: ETF-elhelyezés, térképanyag és -kamera, közös CTA)
**helyi módosítás**, nincs commitolva, pusholva vagy deployolva. A vizuális
jóváhagyás Alex külön döntése.

## Felépítés

| Fájl | Szerep |
| --- | --- |
| `src/components/Hero.tsx` | Szerverkomponens. A Hero szövege (eyebrow, H1, bevezető, CTA) változatlan HTML a tartalmi modellből; a státuszközlés külön, átlátszatlan sötét sávban. |
| `src/components/world-panorama/WorldPanorama.tsx` | Kliens-komponens: 3D színpad, HTML-hotspotok, regionális panel, mozgásvezérlő, fallbackek. A 3D motort `import()`-tal, csak kliensen tölti be. |
| `src/components/world-panorama/engine.ts` | Three.js jelenet (csak dinamikusan töltődik): extrudált kontinensek simított falnormálisokkal, talaj kontaktárnyékkal, anyagok, fények, ívek, városjelölők; ütemezés a meglévő `gsap.ticker`-en. |
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
  kihagyása, kis szigetek kiszűrése, partvonal-simítás, topológia-őrző egyszerűsítés).
- **v1.1 — partvonal-simítás:** a 0,01°-ra kerekített, sűrű forrásvonalat a
  Miller-vetületben ívhossz szerinti Gauss-szűrő simítja (σ = 0,3° desktop,
  0,4° mobil), utána Douglas–Peucker (tolerancia 0,12° / 0,2°). Ok: a korábbi
  adat csúcsainak harmada 45°-nál élesebben fordult (cikcakk) — ez adta az
  oldalfalak fűrészfogas, oszlopos hatását. Ha a simított gyűrű önmetsző
  lenne, a szkript a simítatlannal dolgozik. Futtatás:
  `node scripts/world-panorama/build-land.mjs <csomagok> src/components/world-panorama/data 50m,0.12,0.5,0.3,110m,0.2,1.5,0.4`
  — a kimenet bájtra azonos. A v1.0 paramétereivel és σ = 0-val
  (`50m,0.08,0.5,0,110m,0.15,1.5,0`) a poligonadat a v1.0-val azonos (a fájl
  csak az új `smoothSigmaDeg` mezőben tér el).
- **Méret:** desktop 133 poligon / 5605 pont (72 KB); mobil 70 poligon /
  2089 pont (27 KB). Csak a dinamikusan betöltött 3D chunkkal töltődnek.

## Geometria, anyag, fény (v1.1)

- **Geometria:** extrudálási mélység 0,19 (mobil 0,21), befelé tolt perem
  0,032 (0,036) ≈ a mélység 17%-a, 1 peremszegmens. Az alsó lap és az alsó
  perem (a talajsík alatt) kimarad; a kontinensek egyetlen geometria, két
  anyagcsoport → 2 rajzolási hívás (korábban ~270). Csúcsszám desktop 82 ezer
  (korábban 303 ezer), mobil 31 ezer (66 ezer).
- **Sima fal:** a falnormális partvonalpontonként a ±0,22 egység ívhosszra lévő
  két pont húrjára merőleges, kifelé mutató irány (a fal alja és teteje
  azonos) — a fal egyenletes felületként olvas. A peremsáv normálisa a
  lekerekítés profilját követi (fent függőleges, lent vízszintes): lágy,
  fényben olvasható átmenet a felső lap és a fal között. A fal alján
  csúcsszínnel finom kontakt-sötétedés.
- **Anyag:** felső lap matt mályva-Aubergine (`#7a5a72`, roughness 0,74), két
  alacsony frekvenciájú oktávból álló, gyenge normal map (normalScale 0,18);
  oldalfal sötétebb szilva (`#5e4559`), nem fekete.
- **Talaj:** megvilágítás nélküli anyag — lágy Aubergine–Carbon ovális
  színátmenet (map) + a partvonalak elmosott lenyomatából készült
  kontaktárnyék (aoMap, külön UV-csatornán, csak a térkép körül, desktopon
  2048 px széles textúrával). A talaj széle a háttér/köd színe.
- **Fény:** kulcsfény bal felülről-hátulról (Porcelain), visszafogott elölről
  jövő Muted Plum derítés, hátulról súroló Cool Silver élfény; árnyék,
  bloom és utófeldolgozás nincs.

## Elrendezés (v1.1)

- **ETF-felirat:** alul, középen, a jogi sáv fölött (desktop 44 px, mobil
  28 px), minden szélességen; a RÉSZVÉNYEK / KÖTVÉNYEK feliratokkal azonos
  tipográfia és vonal, `aria-hidden`, `pointer-events: none`, a kamerától
  független. A hotspot nem kerülhet rá (és a mozgásvezérlőre sem): ezek
  területét a vetítés kizárja, a kameraút úgy hangolt, hogy erre ne is
  legyen szükség (szimuláció: 100% láthatóság minden szélességen).
- **Panel:** az ETF-felirat fölött ér véget. Desktopon a hotspot mellé
  horgonyzott elhelyezés alja az ETF teteje − 12 px. Mobilon/tableten a panel
  a térképsávot fedi, régióváltóval (Amerika · Európa · Ázsia, `aria-pressed`);
  a térképsáv magassága a leghosszabb panelhez igazodik (mobil 500 px,
  desktop 488 px). 320 px-en a leghosszabb (ázsiai) lista ~30 px-t a panelen
  belül görget.
- **Mozgásvezérlő:** mobilon a térképsáv bal felső sarkában, desktopon bal alul.

## Kameraút (24 s)

Egyetlen normalizált fázis vezérli: `p = aktívan futott idő / 24 mod 1`. A cél, azimut,
emelkedés, távolság és a vízszintes látószög periodikus, idő-arányos Hermite-interpolációval
mozog a kulcskockák között, ezért a pálya értékben és sebességben is folytonos, a
ciklushatáron is. Megállítás alatt a fázis nem halad (nincs „falióra-behozás").

v1.1 kompozíció — desktop: alacsony (16–23°), ferde panorámanézet délnyugat
felől; Amerika balra, London a kép közepe táján (~45%), Ázsia jobbra, a
mélységbe futva; a nézési cél az é. sz. ~35–40°-án, így Afrika nem uralja a
képet. Mobil: külön, átlós kompozíció (38–45°); széles mobil sávon (tablet)
legalább 72°-os függőleges látószög, hogy a pontok a sávban maradjanak.

## „A kereskedési nap" (v1.2)

A 24 s-os kör egy 24 órás kereskedési napot jelképez; a piacok átadják egymásnak a
napot (Tokió → London → New York). Minden effekt dekoratív, csendes, a meglévő
tokenekből (Berry Light, Porcelain); ragyogás, utófeldolgozás, render target és
árnyéktérkép nincs. Legfeljebb 5 további rajzolási hívás (2 impulzuscső, 3 gyűrűhullám),
és csak akkor, amikor láthatók.

| Elem | Hol | Paraméterek |
| --- | --- | --- |
| Impulzus az íveken | `trading-day.ts` (`ambientAt`), `engine.ts` | Tokió → London p 0,08 → 0,30; London → New York p 0,38 → 0,60; hossz az ív 12%-a (elöl 30%, hátul 70% lecsengés), szinusz-easing, a két végén lágy be-/kiúszás; Berry Light → Porcelain 70%-ban keverve, átlátszatlanság ≤ 0,9, a cső sugara az alapív 1,6-szorosa, csak a fej körüli szakasz rajzolódik (`setDrawRange`). |
| Nyitás (gyűrűhullám + gyűrűerősödés) | ua. | Tokió p 0,04, London 0,33, New York 0,63; egyetlen vékony gyűrű 2,4 s alatt a jelölőgyűrű 3,4-szereséig tágul, átlátszatlanság ≤ 0,43 (a gyűrű 0,02 egység vastag desktopon, 0,024 mobilon); a jelölőgyűrű 0,8 s felfutás, 1,2 s kitartás, 3 s lecsengés alatt finoman erősödik (Porcelain felé 45%, 0,85 → 1,0, +6% lépték). p ≈ 0,84 után ~3,9 s csend a kör zárásáig. |
| Élő fény | ua. | A kulcsfény azimutja ±6°, `sin(2πp)`; magasság és távolság változatlan. |
| Nyitány (egyszer) | `trading-day.ts` (`introAt`), `WorldPanorama.tsx` | 2,4 s, p-től független: impulzus New York → London → Tokió, hullám az érkezéskor (0 / 0,75 / 1,4 s), a hotspotfeliratok ugyanezekre az ütemekre jelennek meg (áttűnés + 6 px, 0,5 s). Megállításkor (rámutatás, koppintás, vezérlő, rejtett lap, kigördülés) 0,3 s alatt lágyan lezárul; utána a kör 0,8 s alatt veszi át. Reduced motion / tooSlow / fallback: nincs nyitány. |
| Görgetési emelés | `engine.setScroll`, `WorldPanorama.tsx` | Teljes kigördülésnél +4° emelkedés, +6% távolság, power1.out; passzív scroll-figyelő, kockánként egy frissítés (egyszeri gsap.ticker-hívás), csak látható Hero és engedélyezett mozgás mellett. Leállított mozgásnál / reduced motion mellett a kamera nem követi. |
| Szöveg-belépő | `globals.css` | Csak CSS: eyebrow → H1 → bevezető → CTA, áttűnés + 10 px, 600 ms, 90 ms-os lépcső (össz. 870 ms); `scripting: none` és `prefers-reduced-motion: reduce` esetén nincs. |

Mivel a kör minden effektje p tiszta függvénye, p = 0 ≡ p = 1, és pontosan akkor áll
meg, amikor a kamera. p = 0-ban minden effekt nyugalomban van: az első élő kocka (és a
reduced motion statikus térképe) pixelre azonos a korábbival, a posztereket nem kellett
újraexportálni.

## Részvényadatok — ellenőrzési állapot

Minden tétel `verification.status = "unverified"`. A nevek és tickerek a brief
listájából, a jegyzési hely és MIC a fejlesztő ismeretéből származik; elsődleges forrásból
(kibocsátói IR-oldal, tőzsde, ISO 10383) **nem lettek ellenőrizve**, mert a környezet
hálózati szabályzata ezeket a hostokat blokkolta (2026-11-04). Publikálás előtt
tételenként ellenőrizendő; a `checkAt` mező csak a javasolt ellenőrzési helyet adja.
