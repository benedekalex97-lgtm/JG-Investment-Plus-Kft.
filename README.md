# JG Investment Plus – weboldal

Ez a repository a JG Investment Plus Kft. weboldalát tartalmazza.

## Jelenlegi állapot: v0.2 vizuális rendszer + Hero motion

**A prototípus nem publikálásra kész.** Kifejezetten *nem*:

- nem MNB-megfelelő,
- nem jogilag végleges,
- nem K&H-jóváhagyott,
- nem production-ready.

Az élesítéshez a K&H Compliance és Kommunikáció írásbeli jóváhagyása
szükséges, a tartalmi source of truth 11. szakaszában felsorolt ellenőrzési
pontokkal együtt.

A v0.2 a partnerileg jóváhagyott Graphite × Aubergine × Silver vizuális
irányt és a "Continuous Market Journey" Hero-mozgáskoncepciót vezeti be a
v0.1 (Steel Azure) helyett. A tartalmi source of truth és a compliance-
szabályok a v0.1-hez képest változatlanok.

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
- A JG Investment Plus Kft. mellett kizárólag a „függő ügynök" jogállás
  szerepel.
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

## Hero motion — "Continuous Market Journey"

Egy absztrakt, arctalan, nemsemleges figura ténylegesen, folyamatosan halad
egy rétegzett, japán-gyertya alapú környezetben — nem helyben lengeti a
végtagjait ("futópad-hatás", a v0.1 fő hibája).

Részletek: `src/components/hero-motion/`

- **`physics.ts`** — DOM-mentes, tiszta mozgásmatematika: a karakter
  world-koordinátája monoton nő; a támaszláb bokáját minden képkockán egy
  2-bone IK zárja a talajra lépés world-pontjára (zéró talpcsúszás); a
  lengő láb szinusz-alapú eljárási mozgás; terep-profil (lépcsőzetes
  emelkedés/süllyedés); kamera-parallax; a loop varratát egy fix
  előtér-gyertya takarása és széli elhalványodás rejti el.
- **`HeroMotion.tsx`** — hierarchikus SVG-rig (pelvis → torso → head;
  pelvis → thigh → shin → foot) + egyetlen `requestAnimationFrame`-hurok,
  közvetlen `transform`-attribútum-írással — React-állapot és re-render
  nélkül a 60fps-es ágon.

Nincs WebGL, Three.js, React Three Fiber, Canvas vagy nagy 3D-engine.

`prefers-reduced-motion: reduce` esetén a rAF-hurok el sem indul: egy
tudatosan a mozgó szakasztól távol eső, nyitott jelenetrészletre eső
statikus póz látszik — teljes, prémium kompozíció, elhalványodás és
takarás nélkül. A szöveg láthatósága sosem függ JavaScripttől.

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
    globals.css              design tokenek (@theme), reveal-animáció, reduced-motion
    layout.tsx                next/font/google (Newsreader, Inter)
    page.tsx                  skip link + szakaszok összeállítása
  components/
    Header.tsx                wordmark, navigáció, billentyűzetes mobilmenü + focus trap
    Hero.tsx                  Hero + kötelező státuszközlés + kockázati figyelmeztetés
    hero-motion/
      physics.ts               mozgásmatematika (IK, terep, parallax, loop-álcázás)
      HeroMotion.tsx            SVG-rig + rAF-orchestráció
    RoleClarification.tsx
    About.tsx  Services.tsx  WhyJG.tsx  Process.tsx
    Contact.tsx                elérhetőségek, üzleti órák, űrlap-prototípus
    LegalRiskBlock.tsx         jogi tájékoztató, panaszkezelés, impresszum
    Footer.tsx
    Section.tsx                közös szakaszkeret
  content/
    homepage.ts                TARTALMI SOURCE OF TRUTH
```
