# Kereskedési felületek (04) — forrásjegyzék

A főoldal „Kereskedési felületek” szakaszának képernyői kizárólag a K&H
Értékpapír nyilvános, hivatalos anyagaiból származnak. Generált, kitalált vagy
utólag átrajzolt felületelem nincs; az eszközkeretek CSS-ből készülnek.

Letöltés dátuma: **2026-11-16** (UTC). Az eredeti, nagy forrásfájlok nem
részei a repositorynak; a feldolgozást a
`scripts/trading-platforms/build-assets.py` reprodukálja.

## Felhasználási jog

**2026-11-19 — K&H Értékpapír jóváhagyás** (Jánosi Renáta, K&H
Értékpapír; a megrendelő által 2026-11-20-án bemutatott
e-mail-képernyőképek alapján, a levelezést a fejlesztő közvetlenül nem
látta):

- A preview-ról: „Tök jó lett, pár komment” — három kérés (a közlés-szöveg,
  a lead a címsor alá, a mobilos görgetés javítása), majd: „Persze, ha
  ezeket javítottad, élesítheted is!”
- A kérdésre, hogy a négy webtrader-oktatóvideóból kivágott képek
  felhasználhatók-e a görgetéses mozgáshoz: „Ja, persze, annyi, hogy ha
  videó részletet is felhasználsz, akkor azt jelöld ebben a mondatban: A
  képek és videók forrása: K&H Értékpapír.” — a közlés utolsó mondata ennek
  megfelelően módosítva.
- Kérés: „Majd szólsz, ha éles?” — az élesítésről a megrendelő értesíti.

A jóváhagyás a megtekintett szakaszra (mobiltrader-képsor, webtrader-képek)
és a négy webtrader-videó kivágott képeire vonatkozik.

## 1. K&H mobiltrader — „értékpapírok” animáció

| | |
|---|---|
| Forrásoldal | https://www.khertekpapir.hu/szolgaltatasok/kereskedesi-rendszereink/mobiltrader (szakasz: „értékpapírok”) |
| Közvetlen média | https://www.khertekpapir.hu/filestorage/13112.gif?t=1703003025 |
| SHA-256 | `94d0f7466039e34ae120a43466d7bfbc820f8acf870326b18e97d02a13d1db02` |
| Felület | K&H mobiltrader, Android (a felvétel órája 14:40–14:41; a grafikon dátuma 2023.12.19) |
| Formátum | GIF, 376 × 834 px, 198 képkocka, minden kocka 100 ms, összesen 19,8 s, 11,1 MB |
| Tartalom | Áttekintés (portfólióérték, kedvencek) → Keresés → „tesla” begépelése → találati lista → Tesla Inc adatlap → grafikon betöltése → 5D grafikon → görgetés a Teljesítmény-adatokig → vissza a lap tetejére |
| Felhasznált kockák | 68 kocka a 0–185. közül (lista: `src/content/trading-platforms-frames.ts`). Kimaradt: a hosszú állóképek ismétlődő kockái, a betöltés-pörgettyű minden harmadik kockán kívül, valamint a 186–197. kocka (visszagörgetés) |
| Feldolgozás | nincs vágás, nincs átméretezés; WebP q80 kockánként; összesen 946 KB |
| Végső fájlok | `public/trading-platforms/mobiltrader/f-###.webp` (376 × 834) |
| Személyes adat | nincs látható név vagy ügyfélazonosító (ellenőrizve a kontaktlapokon) |

Görgetési hozzárendelés (v1.2): 0–6 % kezdőállás (kocka 0), 6–94 % között
minden kiválasztott kocka közel azonos görgetési lépést kap (a betöltés-
pörgettyű 120–156. kockái fél súllyal), 94–100 % záróállás. A v1.0 a forrás
idejéhez kötött hozzárendelése mobilon „beragad, majd ugrik” érzetet adott
(hosszú mozdulatlan sávok, majd 10 kocka ~20 px görgetésen).

A mobilos felvételek közül ez az egyetlen, amely egy folyamatos felvételben
mutatja a részvény kiválasztását, az adatlapot és a grafikont. A „befektetésed
részletei” animáció (13912.gif) portfólióból választ, de grafikon nélküli
pozíció-nézetbe jut; a két felvétel másik számlát/portfóliót mutat, ezért
nem fűztük össze.

### Megvizsgált, nem felhasznált mobiltrader-anyagok

Mind a fenti oldalon, mind 376 × 834 px GIF; kontaktlapon megnézve.

| Fájl | Kockák / hossz | Tartalom |
|---|---|---|
| 7220.gif | 192 / 48,0 s | aktiválás, bejelentkezés, PIN, mobilkulcs |
| 13077.gif | 200 / 14,0 s | biometrikus beállítás; a menüben a „Haszon Teszt” fióknév látszik |
| 13078.gif | 197 / 49,25 s | kedvencek-listák szerkesztése |
| 7221.gif | 200 / 14,0 s | portfólió: értékpapír- és pénz-fül |
| 13912.gif | 199 / 17,91 s | befektetés részletei (Allianz US High Yield), grafikon nélkül |
| 7361.gif | 199 / 19,9 s | díjcsomag |
| 17546.gif | 200 / 10,0 s | eredmény-kimutatás nézetváltás |
| 13113.gif | 198 / 49,5 s | árszintfigyelés (Tesla Inc) |
| 21463.jpg, 7180.png | állókép 486 × 1080 | pénzműveletek menü; több számla kezelése |

## 2. K&H webtrader (új, „webtrader 2.0”)

> **Elavult (2026-11-16-i állapot).** A 2. és 3. szakasz a videók nélküli
> időszak története; a jelenlegi megoldást a 4. szakasz írja le.

Forrásoldal:
https://www.khertekpapir.hu/szolgaltatasok/kereskedesi-rendszereink/webtrader2

Az oldal négy beágyazott YouTube-videója (K&H Értékpapír csatorna, címek az
oEmbed szerint): „K&H webtrader - portfólió menü áttekintése” (pqAbdMKSSvM),
„K&H webtrader - megbízás beadása” (v_AP_bpaKkI), „K&H webtrader -
pénzműveletek” (75gK6HnQPvA), „K&H webtrader - rendszeres befektetés”
(MJRRY_CtKSk).

**A videókat nem tudtuk megnézni.** A YouTube a feldolgozó környezetből
érkező kérést bot-ellenőrzésre (Google „sorry”/captcha oldal) irányította; ezt
a hozzáférési korlátozást nem kerültük meg. Csak a YouTube által nyilvánosan
közzétett, a videóból automatikusan kivett 1280 × 720-as bélyegkockák
(`maxres1/2/3.jpg`, kb. a videó 25/50/75 %-ánál) voltak elérhetők. Ezekből
kettő mutat teljes képernyős webtrader-felületet:

| Állapot | Forrás (közvetlen URL) | SHA-256 | Tartalom |
|---|---|---|---|
| Portfólió | https://i.ytimg.com/vi/pqAbdMKSSvM/maxres2.jpg | `db5bb039…a185df` | wt.khertekpapir.hu/portfolio, értékpapír-lista, a nyitott „frissítés / oszlopok beállítása / Export” menüvel; óra: 2025-04-04 10:47 |
| OTP Bank részletek | https://i.ytimg.com/vi/v_AP_bpaKkI/maxres2.jpg | `539f9a40…cfb75a` | wt.khertekpapir.hu/product-detail/…, OTP Bank adatlap, 5Y grafikon, vállalatleírás, „A webtrader 2.0 tesztelési fázisban van” sáv; óra: 2025-04-03 15:28 |

Verzió: mindkettő az új webtrader 2.0 (azonos navigáció, azonos demófiók).
A két kép két különböző videóból és két különböző napról származik.

Feldolgozás: vágás `(0, 0, 1268, 686)` — a böngésző címsora megmarad, a
Windows-tálca (y ≥ 687) és a görgetősáv (x ≥ 1268) kimarad; a jobb felső „TA”
monogramos avatar végleges pixelezéssel kitakarva. WebP 1268 × 686 (q86) és
760 × 411 (q82).

| Végső fájl | Méret |
|---|---|
| `public/trading-platforms/webtrader-portfolio-1268.webp` | 50 KB |
| `public/trading-platforms/webtrader-portfolio-760.webp` | 23 KB |
| `public/trading-platforms/webtrader-otp-detail-1268.webp` | 56 KB |
| `public/trading-platforms/webtrader-otp-detail-760.webp` | 25 KB |

A két állapot közti váltás egy visszafogott, görgetéshez kötött **áttűnés
(rekonstruált átmenet)**; nem a webtrader saját animációja, és nem mutat
kattintást.

Megvizsgált, nem felhasznált: a többi bélyegkocka a videók „ÉN&” nyitó-
grafikáját (kis monitoros webtrader-áttekintéssel), a K&H főoldalát, illetve
a régi webtrader egy dialógusát mutatja; a webtrader2 oldal 22305.jpg
bannere (630 × 360) marketinggrafika.

## 3. v1.1 — folyamatos webtrader-felvétel keresése (2026-11-16)

Cél: egyetlen összefüggő, azonos verziójú webtrader 2.0 felvétel a
portfólió → sor kiválasztása (kurzorral) → adatlap → grafikon → görgetés
jelenetsorhoz, a kétképes áttűnés kiváltására. **Eredmény: nem érhető el;
a laptopos javítás blokkolt.** A futó kód nem változott, a kétképes
változat ideiglenesen marad; a mobiltrader-bemutató változatlan.

Elvégzett próbálkozások (hálózati/biztonsági beállítás nem módosult):

| # | Próbálkozás | Eredmény |
|---|---|---|
| 1 | `yt-dlp` metaadat-lekérés, pqAbdMKSSvM | „Sign in to confirm you're not a bot” — bot-ellenőrzés; nem kerültük meg |
| 2 | A YouTube watch-oldal közvetlen lekérése | 302 → google.com/sorry (captcha); nem kerültük meg |
| 3 | Beágyazott lejátszó Chromiumban (`www.youtube.com/embed/pqAbdMKSSvM`) | „Error 153 – Video player configuration error”; videó nem töltött be |
| 4 | A hivatalos webtrader2 oldal böngészőben | a `youtube-nocookie.com` iframe és a videótárhely nem érhető el a környezetből |
| 5 | Aláírás nélküli YouTube storyboard (`i.ytimg.com/sb/...`) | 403; egyébként is csak 160–320 px-es előnézet lenne |
| 6 | khertekpapir.hu sitemap (3410 URL), 16 releváns oldal átnézve (tudástár, videótár, kereskedési rendszerek, webtrader-problémák) | webtraderhez GIF/MP4 nincs; a `/ugyfeltamogatas/videotar` 404, a `/ugyfeltamogatas/tudastar/webtrader` üres |
| 7 | A K&H Értékpapír YouTube-csatorna listája | további webtrader 2.0 videók: `yQpFRrAD-aI` (számlanyitás véglegesítése), `H63e__DghQA` (új K&H webtrader – pénzműveletek), `Pnrjq9M_Al0` (befektetővédelmi kérdőív) — mind YouTube, ugyanúgy nem feldolgozható |
| 8 | A `/szolgaltatasok/kereskedesi-rendszereink/webtrader` oldal 7 videója | a RÉGI webtrader felülete — verziókeverés miatt nem használható |
| 9 | Webes keresés további hivatalos K&H/Patria bemutatóra | nincs más K&H-tárhely; a Patria Finance WebTrader másik (cseh) termék, nem helyettesítheti |

### Hiányzó forrás (pontosan)

A `v_AP_bpaKkI` („K&H webtrader - megbízás beadása”) videó MP4-fájlja vagy
1:1 képernyőfelvétele, amelyből a 2025-04-03-i OTP Bank adatlap-kocka
származik; ennek a portfóliónézettől az adatlap görgetéséig tartó
szakasza. Ha ebben nincs portfólióból indított kiválasztás, akkor a
`pqAbdMKSSvM` („portfólió menü áttekintése”) videó egy sor-kiválasztást
tartalmazó szakasza — egyetlen felvételből, hogy a verzió, a demófiók és
a papír ne keveredjen.

Beérkezés után a feldolgozás terve: a kiválasztott időszak ffprobe-mérése,
kontaktlap, majd a jelenetsor kockáinak kinyerése (`ffmpeg -ss … -to …`),
ugyanazzal a vágással és avatar-kitakarással, mint a mostani képeknél,
és a telefonnal azonos, canvasra rajzolt, görgetéssel vezérelt képsor.

## 4. v2.0 — webtrader képsor a négy hivatalos videóból (2026-11-20)

A 2–3. szakaszban leírt akadály (YouTube bot-ellenőrzés) a fejlesztő helyi
gépéről nem állt fenn: a négy videót `yt-dlp` letöltötte, és a kockákat
tényleges megtekintés (kontaktlapok, teljes felbontású kockák) után
választottuk ki. **A 2. szakasz két állóképe és a kétképes áttűnés ezzel
megszűnt**; a régi `webtrader-*-{1268,760}.webp` fájlok törölve.

Letöltés: **2026-11-20**, parancs:
`yt-dlp -f "bv*[height<=1080][ext=mp4]+ba[ext=m4a]/b[ext=mp4]" -o "%(id)s.%(ext)s" <URL>`.
Forrásoldal: https://www.khertekpapir.hu/szolgaltatasok/kereskedesi-rendszereink/webtrader2

| Videó | URL | Felbontás / fps | Hossz | Felvétel |
|---|---|---|---|---|
| Portfólió menü áttekintése | https://www.youtube.com/watch?v=pqAbdMKSSvM | 1920×1080, 29,97 | 38,0 s | 2025-04-04 (óra: 10:47) |
| Megbízás beadása | https://www.youtube.com/watch?v=v_AP_bpaKkI | 1920×1080, 29,97 | 47,8 s | 2025-04-03 (óra: 15:27–15:29) |
| Pénzműveletek | https://www.youtube.com/watch?v=75gK6HnQPvA | 1920×1080, 29,97 | 174,0 s | 2025-04-04 (a felület ideje: 13:38) |
| Rendszeres befektetés | https://www.youtube.com/watch?v=MJRRY_CtKSk | 1920×1080, 29,97 | 61,3 s | 2025-05-28 (adatlap-idő: 10:35) |

Mind a négy az új webtrader 2.0 felülete (azonos navigáció, „A webtrader 2.0
tesztelési fázisban van" sáv). Minden videó a K&H „ÉN&" nyitó- és záró-
grafikájával kezdődik és végződik, a vágásoknál kék „söprés" átmenet van;
ezek NEM kerültek be (a kockaidők mind tiszta felületkockák).

### Felhasznált időszakok és kockák

A kockaidők (mp) a `build-assets.py` `WT_SEGMENTS` listájában vannak; a
fájlnév a manifeszt (`WEBTRADER_FRAMES`) sorszáma, az előrehaladás a
szakaszon belül egyenletes.

| # | Szakasz | Videó, időszak | Kocka | Előrehaladás |
|---|---|---|---|---|
| 1 | Portfólió áttekintése: áttekintés → Portfólió, fülek (Normál, TBSZ, NYESZ), pénznemváltás, oszlopbeállítás | pqAbdMKSSvM 4,5–23,6 s | 23 | 0,02–0,28 |
| 2 | Részvény kiválasztása kurzorral: Kereskedés → Részvények → keresés „otp" → találat | v_AP_bpaKkI 4,5–20,2 s | 17 | 0,296–0,587 |
| 3 | OTP Bank adatlap grafikonnal, görgetés a Teljesítmény-adatokig és vissza | v_AP_bpaKkI 21,4–26,8 s | 12 | 0,608–0,70 |
| 4 | Megbízás beadása: vétel panel, portfólió, mennyiség, limitár-grafikon, összefoglaló, mobilkulcs | v_AP_bpaKkI 27,6–42,2 s | 12 | 0,712–0,822 |
| 5 | Pénzműveletek: menü, beutalás (portfólió, pénznem), devizakonverzió, pénzátvezetés | 75gK6HnQPvA 4,5–19,5 s és 127–165 s | 11 | 0,834–0,906 |
| 6 | Rendszeres befektetés: lista, ETF-ek, piaci adatok, vétel űrlap, összefoglaló, siker, lista | MJRRY_CtKSk 25,8–52,3 s | 11 | 0,918–0,97 |

Összesen **86 kocka**. A telefon az adatlapot a 0,594–0,608 előrehaladásnál
nyitja meg; a laptop az OTP Bank adatlapja ugyanitt tölt be (a 2. szakasz
utolsó, betöltő-vázas kockája 0,587, a 3. szakasz első kockája 0,608).

### Vágás, maszkolás, méret

- Minden videóban a böngészőoldal ablaka (viewport) ugyanott van, ezért egy
  vágás szolgál mind a négyre: `(7, 95, 1904, 1024)` az 1920×1080-as kockán
  (1897 × 929 px, 2,04 : 1). A böngésző címsora a bővítmény-ikonokkal, a
  Windows-tálca az órával és a jobb szélső görgetősáv ezzel lekerül. (A
  pénzműveletes videóban a böngésző- és tálcasáv eleve fehérre van kitakarva,
  ezért a címsor megtartása nem lett volna egységes; a böngészősáv
  elhagyása a korábbi „címsor maradhat" kérésnél szigorúbb, de nem sért
  semmit.) A laptop kijelzőjének képaránya ennek megfelelően 1280 : 627.
- Személyes adat: a jobb felső „TA" monogramos avatar minden kockán
  végleges pixelezéssel (12 px-es blokkok + elmosás, a képbe égetve)
  kitakarva, ahol nem takarja a jobb oldali panel; a „megbízás összefoglaló"
  panel „számlára" sorában megjelenő kis monogram ugyanígy. A script minden
  kockára automatikusan ellenőrzi a két helyet (sötét-pixel arány), és
  kiírja a kitakarás nélküli kockákat (ezek a panel alatt lévők). Átnézve:
  nevet, ügyfélazonosítót, számlaszámot, e-mail-címet egyetlen felhasznált
  kocka sem mutat. A pénzműveletes videó 1:04–2:00 közötti része (másik
  számla, ügyfélnév, bankszámlaszámok) és a beutalás-űrlap számlaszám/IBAN
  sorai (22 s után) szándékosan kimaradtak.
- Kimenet: `public/trading-platforms/webtrader/{1280,760}/f-###.webp`, WebP
  (q74 / q72). Összméret: **1280 px: 2,88 MB**, **760 px: 1,36 MB**.
- A canvas a kijelzőhöz illő méretet tölti (CSS-szélesség × DPR, legfeljebb 2;
  800 px fölött a 1280-as, alatta a 760-as). Poszter: az 1. kocka;
  reduced motion alatt a 41. kocka (OTP Bank adatlap grafikonnal).

### Memória (Chromium 1440×900, Playwright)

A dekódolt kockákból csak a kért körüli ±5 kockás ablak él (ImageBitmap). A
renderer-folyamat privát memóriája végigmenve a teljes jeleneten: 96–155 MB
(a betöltés utáni 97–118 MB-hoz képest legfeljebb +40 MB). Összehasonlításul
mind a 86–87 kocka egyidejű dekódolása +265 MB lenne (83 → 348 MB; elméleti
87 × 1280 × 627 × 4 B = 266 MB). Mobil (760 px-es kockák): 95–116 MB.

### Ismert ugrások (két videó találkozása)

A négy videó három külön napon, külön demófiók-állapotban készült; a felület
azonos, a számok nem. Ahol két videó találkozik, a két kocka ugyanannak a
felületnek két oldala, de a demófiók adatai ugranak:

1. **Portfólió (pqAbdMKSSvM) → Részvény keresése (v_AP_bpaKkI):** mindkét
   kocka a Portfólió oldal „Összes" fülével indul; az összérték 286 146 HUF →
   287 813 HUF (kb. 0,6 %-os eltérés), az értékpapírlista azonos.
2. **Megbízás (v_AP_bpaKkI) → Pénzműveletek (75gK6HnQPvA):** az OTP-adatlapról
   az Áttekintés oldalra váltunk, ahol az összérték 82 460 HUF (másik számla-
   állapot). Az oldalváltás miatt természetesnek hat, de a számok nem
   folytatják az előző kockát.
3. **Pénzműveletek → Rendszeres befektetés (MJRRY_CtKSk):** másik nap
   (2025-05-28); az Áttekintés oldalról a Rendszeres befektetés oldalra váltunk.

Rövid, egy-egy kockányi ugrások; kitalált átmenetet nem alkalmaztunk.

## Ismert korlátok

- A webtrader-jelenetben a felhasználó nem ugyanazt a papírt veszi meg,
  mint amit a portfólióban lát, és a pénzműveletek, illetve a rendszeres
  befektetés egy másik számlaállapotból és napról való (ld. a fenti ugrások).
  A felvételek „demó"-fiókból vannak; az ábrázolt adatok nem élők.
- A videók közti kapcsolat nem a webtrader saját animációja: a kockák
  közti váltás görgetés-vezérelt kockacsere, nem folyamatos videó.
- Telefonos nézetben (< 768 px szélesség, illetve fekvő telefon: < 500 px
  magas és < 1024 px széles) a laptop NEM jelenik meg, csak a K&H
  mobiltrader: a két eszköz egymás alatt futott volna, és a szakasz
  túl hosszú lett (390 × 844-en 2609 px a korábbi ~5200 px helyett). Ott a
  webtrader-kockák le sem töltődnek. Tableten (768 px-től) a laptop és a
  telefon egymás alatt, azonos hosszú sávban fut.
- A két eszköz két különböző papírt mutat (webtrader: OTP Bank; mobiltrader:
  Tesla Inc), mert a források nem tartalmaznak közös papírt mindkét
  felületen. A feliratok ezt nevesítik.
- A mobiltrader-felvétel 2023 decemberi, a webtrader-kockák 2025 áprilisiak;
  a mobilalkalmazás azóta változhatott.
- A forrás felbontása (376 px széles GIF, 1280 × 720 JPEG-bélyegkocka) a
  legkisebb szövegek olvashatóságát korlátozza.
