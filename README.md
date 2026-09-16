# JG Investment Plus – weboldal

Ez a repository a JG Investment Plus Kft. weboldalát tartalmazza.

## Jelenlegi állapot: v1.2 — a referenciaoldal (Lovable) teljes copyja

**A prototípus nem publikálásra kész.** Kifejezetten *nem*:

- nem MNB-megfelelő,
- nem jogilag végleges,
- nem K&H-jóváhagyott,
- nem production-ready.

Az élesítéshez a K&H Compliance és Kommunikáció írásbeli jóváhagyása
szükséges, a tartalmi source of truth 11. szakaszában felsorolt ellenőrzési
pontokkal együtt.

A v0.2 vezette be a partnerileg jóváhagyott Graphite × Aubergine × Silver
vizuális irányt a v0.1 (Steel Azure) helyett. A v0.3-ban a v0.2 Hero
mozgásrendszere ("Continuous Market Journey" — futó/sétáló figura, mozgó
gyertyák, parallax, kamerakövetés) megszűnt, és egy statikus figura +
japángyertya-kompozíció váltotta. A v0.4-ben ez a statikus vizuális elem
is teljes egészében eltávolításra került. A v0.5-ben a Hero copy középre
került, és a szekció egy üres, animációra előkészített réteget kapott. A
v0.6 ezt a réteget tölti ki: egy saját fejlesztésű, absztrakt
japángyertya-háttéranimáció (`HeroMarketMotion`).

A **v1.2** a főoldal MARKETINGCOPYJÁT a jóváhagyott hero-referencia
(`jginvst.lovable.app`) szövegére állítja vissza. A v1.1-ben általunk
kitalált helyettesítő szövegek (pl. „Személyes kapcsolat. Egyértelmű
szerepek.", „Így indul a kapcsolat", „Ismerje meg a lehetőségeket…")
eltávolításra kerültek.

A marketingcopy elsődleges source of truthja a referenciaoldal. Ettől
KIZÁRÓLAG az alábbi okokból tértünk el:

1. konkrét compliance-javítás;
2. a valós kapcsolat- és cégadatok megtartása;
3. az Adatkezelési tájékoztató, Impresszum és Panaszkezelés változatlan
   megőrzése;
4. placeholder adatok eltávolítása;
5. a „partnerként", „közvetítő" és az ellenőrizetlen jogosultsági állítások
   javítása.

Szerkezet: Hero → 01 Rólunk → 02 Szolgáltatások → 03 Miért mi? →
04 Hivatalos dokumentumok → 05 Kapcsolat → Jogi tájékoztató.
A v1.1 külön FOLYAMAT szakasza és a konverziós CTA-sáv eltávolítva (egyik sem
része a referenciaoldalnak); a konverziós útvonalat a header-CTA, a hero-CTA
és a Kapcsolat szakasz biztosítja. A navigációban a „Hogyan működik?" pont
helyére a „Miért mi?" került.

A HeroMarketMotion animáció, a Graphite × Aubergine × Silver × Signal Berry
rendszer, a Newsreader + Inter tipográfia, a reszponzív rendszer és a
reduced-motion támogatás VÁLTOZATLAN — ebben a körben nem lett újraépítve
vagy áthangolva.

A karakteres/figurás koncepció véglegesen kikerült a scope-ból. Nincs
arany/sárga akcentus, nincs fekete–arany brand, nincs K&H-logó, nincs
trading-piros vagy trading-zöld.

**Változatlan maradt** (DOM-szinten igazolva): az Adatkezelési tájékoztató
tartalma (a `<main>` szövege bitre azonos, SHA-256 egyezés), az Impresszum, a
Panaszkezelés, a telefonszámok, e-mail-címek, cégadatok, üzleti órák, a K&H
ügyfélszolgálati adatok, a footer jogi szövege és minden meglévő hivatalos
link.

### Compliance-review tételek (jóváhagyásra várnak)

- a 03. szakasz címében a „**pénzügyi biztonsága**" fordulat;
- a hero főcím „**Biztonság.**" szava;
- a **KBC-adatok** (13 millió ügyfél, 397 milliárd euró mérlegfőösszeg) —
  időérzékenyek, ellenőrzött hivatalos forrás nélkül nem frissítendők;
- a **III. pillér** egésze (MNB-nyilvántartás, közös felügyelet,
  20 000 EUR befektetővédelmi összeghatár);
- a Rólunk infosáv **Felügyeleti hatóság** és **Befektetővédelem** tétele.

Ezek tényszerű közlésként, nem garanciaként jelennek meg; a content-modell
`complianceReview: true` jelöléssel tartja őket nyilván.

## Tartalmi source of truth

`docs/JG_Investment_weboldal_vegleges_szovegezes_v1.0.docx`

A weboldal minden üzleti, jogi és kockázati szövege ebből a dokumentumból
származik, szó szerint. A webes megjelenítés érdekében kizárólag tagolás
történt (szakasz, kártya, oszlop, lista) – a jelentés, a jogi tartalom, a
jogosultsági állítások, a kockázati közlések és a JG / K&H–Patria
szerepelhatárolás változatlan.

A szöveg egy helyen él: **`src/content/homepage.ts`**. Compliance-visszajelzés
esetén ezt a fájlt kell szerkeszteni; a komponensek nem tartalmaznak beégetett
üzleti szöveget. (A fájlban néhány, KIZÁRÓLAG a prototípus saját státuszát
leíró felirat is található – pl. hogy a kapcsolati űrlap "még nem aktív" –,
ezek nem a docx-ből származnak, és verzióváltáskor szabadon frissíthetők.)

### Amit a prototípus szándékosan nem tartalmaz

- Nincs kitalált pénzügyi állítás, szolgáltatás, jogosultság, ár, díj,
  hozamadat, ügyfélszám, statisztika, referencia, ügyfélvélemény,
  teljesítményadat, ígéret vagy garancia.
- Nincs K&H- vagy Patria-logó, és nincs a K&H logóját imitáló elem.
- A JG Investment Plus Kft. mellett a docx-alapú szövegekben kizárólag a
  „függő ügynök" jogállás szerepel. **Kivétel, jóváhagyásra várva:** a v1.1
  Hero preview-copyja az eyebrow-ban „KÖZVETÍTŐ" megjelölést, az introban
  pedig „a K&H Értékpapír partnereként" fordulatot használ — ld. a
  „Hero preview-copy" szakaszt.
- Az adatkezelési tájékoztató **nincs** saját készítésű jogi szöveggel
  pótolva. A K&H/Patria által átadott tájékoztató teljes, tartalmilag
  változatlan szövege szükséges hozzá; a hiányt az oldal láthatóan jelzi.
- Nincs végleges JG-logó: a wordmark egyszerű szöveges "JG Investment Plus"
  lockup, monogram vagy embléma nélkül.

### Kapcsolati űrlap

Az űrlap **kizárólag vizuális prototípus**. Nincs mögötte `<form>` elem,
backend, API route, adatmentés, e-mail-továbbítás, analitika vagy külső
űrlapszolgáltatás, és nem jelenít meg hamis sikeres beküldési állapotot.
A gomb nem továbbít adatot. A nem aktív státusz az oldalon is látszik.

## Design — Graphite × Aubergine × Silver

A színrendszer partnerileg jóváhagyott, de ideiglenes (nem tekintendő
végleges branddöntésnek a pontos árnyalatok és a tipográfia szintjén). A
tokenek a `src/app/globals.css` `@theme` blokkjában élnek — ez az EGYETLEN
helye a márkaszíneknek; komponensek nem tartalmaznak nyers HEX-et, csak
Tailwind-osztályt (pl. `bg-canvas`, `text-text-primary`) vagy `var()`-t.

| Core token | Érték | Szemantikus szerep |
| --- | --- | --- |
| Carbon | `#18181B` | sötét szakaszok háttere (`--color-surface-dark`) |
| Aubergine | `#493447` | **signature szín** — accent, CTA, kockázati/jogi jelzővonalak |
| Muted Plum | `#755D70` | másodlagos szöveg (`--color-text-secondary`) |
| Cool Silver | `#BEC1C7` | keret, sötét szakasz másodlagos szövege — **soha nem szöveg világos alapon** |
| Porcelain | `#F4F3F1` | oldalháttér (`--color-canvas`) |
| Ink | `#27262A` | törzsszöveg (`--color-text-primary`) |
| Surface (fehér) | `#FFFFFF` | kártyafelület a Porcelain fölött |

Minden szín-pár WCAG-kontrasztja számolva és dokumentálva a globals.css
fejlécében (Ink/Aubergine Porcelainen AAA; Cool Silver és Aubergine sötét
alapon szöveghez FAIL, ezért ott explicit módon csak keret/dekoráció).
Irányadó arány: Porcelain domináns (~55–60%), Carbon/Ink kontrollált
hangsúlyos szakaszokon (~20–25%), Cool Silver keretekben (~10–12%),
Aubergine signature-ként adagolva (~6–8%).

A K&H Értékpapír kék/cián arculatától tudatosan elkülönül: nincs bright-blue
CTA, nincs cyan, nincs neon fintech paletta.

### Tipográfia

Editorial serif heading (**Newsreader**) + modern sans body/UI (**Inter**),
`next/font/google`-lal build-időben self-hostolva, erős rendszerfont-
fallback stackkel (`src/app/globals.css` `--font-serif-display` /
`--font-sans`) — ha a betűtöltés a build-környezetben elérhetetlen lenne, a
megjelenés akkor is stabil marad.

## Hero — japángyertya-animáció + preview-copy (v1.1)

A Hero középre rendezett, tipográfia-vezérelt kompozíció (eyebrow → főcím →
rövid bevezető → egyetlen CTA), alatta két visszafogott információs sávval: a
kötelező státuszközléssel és a kiemelt kockázati figyelmeztetéssel. Mögötte
teljes felületen fut a japángyertya-háttéranimáció.

Rétegek (alulról):

1. Porcelain háttér
2. `HeroMarketMotion` canvas — `aria-hidden`, `pointer-events: none`
3. `.hero-veil` Porcelain kontrasztfátyol
4. HTML copy és CTA
5. sticky header (`z-50`)

### Hero- és főoldali copy — COMPLIANCE-REVIEW CANDIDATE

> A főoldali copy konverziófókuszú, de **írásbeli K&H Compliance/Kommunikáció
> jóváhagyás nélkül a verzió NEM nevezhető K&H-approved vagy
> compliance-approved változatnak.**

| Mező | Érték |
| --- | --- |
| eyebrow | `JG INVESTMENT PLUS KFT. · A K&H ÉRTÉKPAPÍR FÜGGŐ ÜGYNÖKE` |
| főcím | `Biztonság. Átláthatóság. Szakmai háttér.` |
| kiemelt szó | `Átláthatóság.` (Signal Berry) |
| bevezető | `Tájékoztatás a K&H Értékpapírnál elérhető befektetési szolgáltatásokról és pénzügyi eszközökről — személyes kapcsolattartással, érthető folyamatokkal.` |
| CTA | `KAPCSOLATFELVÉTEL` → `/#kapcsolat` |

**Elvégzett compliance-korrekciók** (a korábbi preview-copyhoz képest):

- a „**partnereként**" fordulat **visszavonva** — mindenhol „függő ügynök";
- a „**KÖZVETÍTŐ**" eyebrow-megjelölés **visszavonva**;
- az **MNB-nyilvántartásra hivatkozó marketingállítás visszavonva** a hero
  státuszközléséből (az Impresszum tényszerű felügyeleti adata változatlan);
- „az általa forgalmazott" → „**elérhető**";
- konkrét hirdetmény-dátum → „**mindenkor hatályos**";
- a „Feladatunk elsősorban új ügyfelek megszólítása" mondat **törölve**;
- mindenhol „**K&H Értékpapír (Patria Finance Magyarországi Fióktelepe)**";
- nincs személyre szóló ajánlás, eredmény-, hozam- vagy tőkebiztonsági ígéret.

**Nyitott compliance-kérdés:** a főcím „**Biztonság.**" szava — a megrendelő
döntése alapján egyelőre marad, de külön review-tétel.

A Hero **egyetlen** CTA-t jelenít meg. A „K&H Értékpapír dokumentumai"
hivatkozás a láblécben és a 05. szakaszban is elérhető.

### Jogi tartalom — háromszintű hierarchia

1. **Rövid státuszközlés a Heróban** — vizuálisan másodlagos (nincs kártya,
   nincs all-caps felirat), de mindig látható; 15 px mobilon, 16 px desktopon,
   Muted Plum Porcelainen 5.33:1 (AA).
2. **Egyetlen szereptisztázás a szolgáltatások alatt** („Fontos tudnivaló") —
   nem ismétlődik kártyánként.
3. **Részletes Jogi tájékoztató az oldal alján**, accordionban. A panelek
   alapállapotban összecsukva jelennek meg, de a tartalom **mindig a DOM-ban
   van** (csak `hidden`), tehát a szerveroldali HTML és a keresőmotorok
   számára teljes egészében elérhető. Valódi `<button>` vezérlő,
   `aria-expanded` / `aria-controls` / `role="region"` állapotokkal,
   billentyűzettel használható.

A **kockázati figyelmeztetés** az accordionon KÍVÜL, alapállapotban láthatóan
marad — a rövid, kiemelt összefoglaló ÉS a docx SOT teljes kockázati
bekezdése is. A Panaszkezelés és az Impresszum szintén mindig nyitva van,
saját horgonnyal. Az all-caps riasztó címek („KÖTELEZŐ STÁTUSZKÖZLÉS",
„FONTOS KORLÁT", „KIEMELT KOCKÁZATI FIGYELMEZTETÉS") helyett emberi
megfogalmazású címek állnak. A jogi szakaszban semmi nem kisebb 14 px-nél.

### Az animáció — rendezett market motion

`src/components/HeroMarketMotion.tsx` — saját, **külső függőség nélküli** 2D
Canvas rajzolás (nincs charting library, nincs animációs library, nincs
WebGL, nincs Rive).

**A v1.1 mozgási modellje.** A korábbi verzióban minden gyertya saját,
független fázisú szinuszon lebegett, és nagy (a Hero magasságának ~30%-át
kitevő) véletlen függőleges szórást kapott — ettől a mező kaotikusnak hatott.
A v1.1 ezt három eszközzel szünteti meg:

1. **Master market path** — egyetlen, közös, folytonos görbe (egész
   frekvenciájú térbeli szinuszok összege, nagyon lassú időbeli
   fázissodrással). Minden réteg minden gyertyája ennek a görbének a
   magasságát veszi fel; a rétegek csak amplitúdóban és egy kis fázisban
   térnek el. A mező így egyetlen, összefüggő piaci sziluettként olvasódik.
2. **Rendezett pozíciós sor** — egyenletes vízszintes rács (±6% jitter), és
   minden réteg ugyanabba az irányba (balra) sodródik, 8 / 10,5 / 13,5 px/s
   sebességgel: érzékelhető parallax, de nem szétszaladó mozgás.
3. **Szomszédkorreláció** — a gyertyánkénti animációs fázisok az INDEXBŐL
   származnak, kis lépésközzel (0,42–0,61 rad). A szomszédos gyertyák így
   közel fázisban vannak: a mozgás végigfutó hullámként halad a soron.

**A gyertyatest és a kanócok külön animálódnak.** A test lassan fel-le mozog
(8–20 px), a magassága is változik (3–8 px), a felső és az alsó kanóc végpontja
pedig egymástól részben függetlenül nyúlik és húzódik vissza (5–14 px), mindig
a test aktuális éléhez kapcsolódva. A ciklusidők 10–22 s. Minden animált érték
zárt alakú, C∞-sima függvénye az időnek és a gyertya indexének: **nincs
frame-random, nincs hard step, nincs jitter**. A sarokrádiusz a mindenkori
animált magassághoz van vágva, ezért a forma sosem válik kapszulává.

- **Determinisztikus kompozíció**: seedelt álvéletlen (`mulberry32`) — nincs
  hydration mismatch.
- **Seamless loop**: egész frekvenciájú térbeli komponensek → a világsáv
  határán nincs ugrás, nincs felismerhető loopkezdés.
- **Olvashatósági zóna**: a canvas kiméri a Hero copy-blokkjának valódi
  geometriáját (`[data-hero-copy]`), és e köré lágy ellipszisben csökkenti a
  gyertyák opacityjét.
- **Nincs pénzügyi tartalom**: nincs valós árfolyam, instrumentum, ticker,
  számadat vagy hozamábra; nincs piros–zöld színpár, nincs arany vagy sárga.
- **Kiemelő gyertyák**: desktopon 3, mobilon 2, mind egyetlen rétegben — így
  azonos sebességgel sodródnak, a köztük lévő távolság állandó, és sosem
  kerülnek közvetlenül egymás mellé.
- **Teljesítmény**: `ResizeObserver`, DPR-cap (desktop 2, mobil 1,5),
  `IntersectionObserver`, `visibilitychange`, teljes unmount-cleanup, nulla
  React state update frame-enként.
- **`prefers-reduced-motion: reduce`**: el sem indul a rAF-loop; statikus,
  rendezett, teljes értékű kompozíció — sem a test, sem a kanóc nem mozog.

### Signal Berry

A v1.1 egyetlen funkcionális accent színt használ — a **Signal Berry**
figyelemirányító jelzést. Ez az Aubergine és a vörös közötti, erősebb
lila–vörös árnyalat; **nem brandszín**, és kifejezetten **nem tőzsdei vörös**:
nem jelöl irányt, eredményt, hozamot vagy veszteséget.

| Token | Érték | Kontraszt Porcelainen | Használat |
| --- | --- | --- | --- |
| `--color-signal-berry` | `#8E3F67` | **6.19:1** (AA törzsszöveg, AAA nagy szöveg) | főcím kiemelt szava, CTA-jelzővonal, CTA-fókuszgyűrű, canvas-kiemelés |
| `--color-signal-berry-dark` | `#6F2D50` | 8.74:1 (AAA) | tartalék sötétebb változat, jelenleg nincs használva |
| `--color-signal-berry-soft` | `#EBD6E0` | 1.24:1 (FAIL — sosem szöveg) | definiált, jelenleg nincs használva |

A főcím a **base `#8E3F67`** változatot használja, mert Porcelainen mérve
6.19:1 — ez nem csak a nagy szövegre előírt 3:1-et, hanem a törzsszövegre
vonatkozó AA 4.5:1-et is teljesíti, így nem volt szükség a sötétebb
változatra.

A Signal Berry a teljes oldalon legfeljebb ~3–5%-os vizuális arányban jelenik
meg, és ebben a fázisban kizárólag a Heróban:

1. a főcím „Átláthatóság." szava,
2. az elsődleges CTA 2 px-es alsó jelzővonala és fókuszgyűrűje (a gomb
   töltőszíne végig Aubergine; nincs glow, gradient, színes árnyék vagy
   pulzálás),
3. a háttéranimáció 3 (mobilon 2) fókuszgyertyája.

A domináns színek továbbra is a Porcelain / Ink / Aubergine. A korábbi arany
kiemelőrendszer teljes egészében kikerült: a heróban és a dokumentációban
nem maradt arany, sárga vagy mustár árnyalat.

A Hero — és az oldal egésze — a betöltés után AZONNAL, teljes egészében
látható, minden módban; a szöveg megjelenése soha nem függ az animációtól.

## Futtatás

```bash
npm install
npm run dev        # fejlesztői szerver: http://localhost:3000
```

Production preview:

```bash
npm run build
npm run start      # http://localhost:3000
```

Ellenőrzések:

```bash
npm run typecheck
npm run lint
npm run build
```

## Komponensstruktúra

```
src/
  app/
    globals.css              design tokenek (@theme, Signal Berryvel), .hero-veil,
                              .hero-cta-primary, reduced-motion (globális CSS-effektek)
    layout.tsx                next/font/google (Newsreader, Inter)
    page.tsx                  skip link + szakaszok összeállítása
  components/
    Header.tsx                wordmark, navigáció, billentyűzetes mobilmenü + focus trap
    Hero.tsx                  Hero + rövid státuszközlés (jogi hierarchia 1. szint)
    HeroMarketMotion.tsx      rendezett japángyertya-háttéranimáció (kliens Canvas,
                              master market path; reduced-motion + pause-kezeléssel)
    About.tsx  Services.tsx  WhyJG.tsx  Process.tsx    01–04. szakasz
    CtaBand.tsx               konverziós CTA-sáv (az oldal egyetlen Carbon szakasza)
    OfficialDocuments.tsx     05. szakasz — hivatalos dokumentumok linklistája
    LegalAccordion.tsx        kliens accordion (aria-expanded/-controls; a tartalom
                              összecsukva is a DOM-ban marad)
    Contact.tsx                elérhetőségek, üzleti órák, űrlap-prototípus
    LegalRiskBlock.tsx         jogi tájékoztató, panaszkezelés, impresszum
    Footer.tsx
    Section.tsx                közös szakaszkeret
  content/
    homepage.ts                TARTALMI SOURCE OF TRUTH
```
