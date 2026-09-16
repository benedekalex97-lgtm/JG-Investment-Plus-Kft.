# JG Investment Plus – weboldal

Ez a repository a JG Investment Plus Kft. weboldalát tartalmazza.

## Jelenlegi állapot: v1.1 Hero — japángyertya-animáció + preview-copy

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

A **v1.1** három dolgot változtat, kizárólag a Heróban:

1. a Hero copy a jóváhagyott hero-referencia (preview) szövegezésére vált —
   **ez NEM a docx source of truth szövege**, ld. lentebb;
2. a v0.6 arany kiemelőszíne teljes egészében kikerült; helyette a lila–vörös
   **Signal Berry** funkcionális accent lépett be;
3. a Hero egyetlen CTA-ra egyszerűsödött, a kötelező státuszközlés pedig nagy
   kártya helyett visszafogott információs sávvá vált.

A karakteres/figurás koncepció **véglegesen kikerült a scope-ból**: a Hero
animációja kizárólag absztrakt, és nem tartalmaz emberi figurát, sétáló
karaktert, fotót vagy illusztrált személyt.

A Hero **alatti** összes szakasz — Szereptisztázás, Rólunk, Szolgáltatások,
Miért a JG, Hogyan működik, Kapcsolat, részletes Jogi tájékoztató,
Panaszkezelés, Impresszum, footer, valamint a külön oldalon élő Adatkezelési
tájékoztató — a v1.1-ben **byte-azonosan változatlan** maradt.

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

### Hero preview-copy — JÓVÁHAGYÁSRA VÁR

> **Ez a Hero-szövegezés NEM a docx source of truthból származik.** A v1.1-ben
> a Hero eyebrow / főcím / bevezető / CTA-felirat mezői és a kötelező
> státuszközlés törzsszövege a jóváhagyott hero-referencia (preview)
> szövegezésére cserélődtek, kifejezett megrendelői utasításra.

| Mező | Érték |
| --- | --- |
| eyebrow | `PATRIA FINANCE · K&H ÉRTÉKPAPÍR · KÖZVETÍTŐ` |
| főcím | `Biztonság. Átláthatóság. Szakmai háttér.` |
| kiemelt szó | `Átláthatóság.` (Signal Berry) |
| bevezető | `Tájékoztatás közvetített befektetési szolgáltatásainkról — a K&H Értékpapír partnereként.` |
| CTA | `KAPCSOLATFELVÉTEL` → `/#kapcsolat` |

**Compliance-szempontból nyitott pontok** — mindhárom K&H Compliance és
Kommunikáció írásbeli jóváhagyását igényli az élesítés előtt:

1. a bevezető **„a K&H Értékpapír partnereként"** megfogalmazása (a docx SOT
   szerinti jogállás „függő ügynök", nem „partner");
2. az eyebrow **„KÖZVETÍTŐ"** megjelölése (ugyanezen okból);
3. a státuszközlés **„a Magyar Nemzeti Bank nyilvántartásában szereplő
   társaságként"** fordulata (nyilvántartási állítás, ami a docx SOT-ban nem
   szerepel).

Emiatt a v1.1 **nem** tekinthető compliance-approved, K&H-approved vagy
public-ready változatnak. A preview-copy mezőket a
`src/content/homepage.ts` `hero` és `statusNotice` konstansai jelölik, saját
figyelmeztető kommenttel.

A Hero **egyetlen** CTA-t jelenít meg. A korábbi másodlagos
„K&H Értékpapír dokumentumai" gomb csak a Heróból került ki — ugyanez a
hivatkozás a **láblécben** (`footer.links`) és a jogi szakaszban változatlanul
elérhető, és az adatmező sem lett törölve a content modellből.

### Az animáció

`src/components/HeroMarketMotion.tsx` — saját, **külső függőség nélküli** 2D
Canvas rajzolás (nincs charting library, nincs animációs library, nincs
WebGL, nincs Rive).

- **Három mélységi réteg**, eltérő sebességgel (parallax): Cool Silver
  (nagyon lassú, nagyon alacsony kontraszt) → Muted Plum (lassú, közepes) →
  Aubergine (kissé gyorsabb, nagyobb és ritkább testek).
- **Determinisztikus kompozíció**: seedelt álvéletlen (`mulberry32`), így a
  Hero minden betöltésnél ugyanúgy néz ki, és nincs hydration mismatch.
- **Seamless loop**: a gyertyák egy, a viewportnál szélesebb világsávon
  ismétlődnek, az alapvonalat pedig egész frekvenciájú szinuszok összege adja
  — a wrap határán nincs ugrás, nincs felismerhető loopkezdés.
- **Olvashatósági zóna**: a canvas kiméri a Hero copy-blokkjának valódi
  geometriáját (`[data-hero-copy]`), és e köré egy lágy ellipszisben
  lecsökkenti a gyertyák opacityjét — a nagyobb vizuális aktivitás a bal/jobb
  szélre és a felső/alsó perifériára kerül. A `.hero-veil` gradient ezt
  egészíti ki.
- **Nincs pénzügyi tartalom**: nincs valós árfolyam, instrumentum, historikus
  adat, ticker, számadat, kereskedési jelzés vagy hozamábra. **Nincs
  piros–zöld színpár, és nincs arany vagy sárga** — a gyertya színét kizárólag
  a rétege adja; az irány (hosszabb felső vagy alsó kanóc) csak formai
  változatosság, és a Signal Berry kiemelés szándékosan mindkét alakon
  megjelenik, hogy ne kaphasson „nyereséges"/„vesztes" jelentést.
- **Kiemelő gyertyák**: desktopon pontosan 3, mobilon pontosan 2, mind
  ugyanabban a rétegben. Ez tudatos: egy rétegen belül azonos a sodródási
  sebesség, így a köztük lévő távolság állandó, és **sosem kerülnek
  közvetlenül egymás mellé**.
- **Teljesítmény**: `ResizeObserver`, DPR-cap (desktop 2, mobil 1.5),
  `IntersectionObserver` (képernyőn kívül a loop leáll), `visibilitychange`
  (háttérfülön leáll), unmountkor teljes cleanup. Mobilon kevesebb gyertya,
  lassabb mozgás és kisebb rétegkülönbség. Frame-enként nincs React state
  update — a rajzolás közvetlenül a canvasra megy.
- **`prefers-reduced-motion: reduce`**: el sem indul a
  `requestAnimationFrame`-loop; egyetlen statikus, teljes értékű
  gyertyakompozíció rajzolódik ki (nincs parallax, nincs sodródás, nincs
  opacity-pulzálás).

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
    Hero.tsx                  Hero + kötelező státuszközlés + kockázati figyelmeztetés
    HeroMarketMotion.tsx      absztrakt japángyertya-háttéranimáció (kliens Canvas,
                              külső dependency nélkül; reduced-motion + pause-kezeléssel)
    RoleClarification.tsx
    About.tsx  Services.tsx  WhyJG.tsx  Process.tsx
    Contact.tsx                elérhetőségek, üzleti órák, űrlap-prototípus
    LegalRiskBlock.tsx         jogi tájékoztató, panaszkezelés, impresszum
    Footer.tsx
    Section.tsx                közös szakaszkeret
  content/
    homepage.ts                TARTALMI SOURCE OF TRUTH
```
