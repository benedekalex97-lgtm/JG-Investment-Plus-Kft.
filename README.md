# JG Investment Plus – weboldal

Ez a repository a JG Investment Plus Kft. weboldalát tartalmazza.

## Jelenlegi állapot: v0.1 vizuális prototípus

**A prototípus nem publikálásra kész.** Kifejezetten *nem*:

- nem MNB-megfelelő,
- nem jogilag végleges,
- nem K&H-jóváhagyott,
- nem production-ready.

Az élesítéshez a K&H Compliance és Kommunikáció írásbeli jóváhagyása
szükséges, a tartalmi source of truth 11. szakaszában felsorolt ellenőrzési
pontokkal együtt.

## Tartalmi source of truth

`docs/JG_Investment_weboldal_vegleges_szovegezes_v1.0.docx`

A weboldal minden üzleti, jogi és kockázati szövege ebből a dokumentumból
származik, szó szerint. A webes megjelenítés érdekében kizárólag tagolás
történt (szakasz, kártya, oszlop, lista) – a jelentés, a jogi tartalom, a
jogosultsági állítások, a kockázati közlések és a JG / K&H–Patria
szerepelhatárolás változatlan.

A szöveg egy helyen él: **`src/content/homepage.ts`**. Compliance-visszajelzés
esetén ezt a fájlt kell szerkeszteni; a komponensek nem tartalmaznak beégetett
üzleti szöveget.

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

### Kapcsolati űrlap

Az űrlap **kizárólag vizuális prototípus**. Nincs mögötte `<form>` elem,
backend, API route, adatmentés, e-mail-továbbítás, analitika vagy külső
űrlapszolgáltatás, és nem jelenít meg hamis sikeres beküldési állapotot.
A gomb nem továbbít adatot. A nem aktív státusz az oldalon is látszik.

## Design

A **Steel Azure** színrendszer ideiglenes, nem végleges branddöntés. A tokenek
a `src/app/globals.css` `@theme` blokkjában élnek, a számított WCAG-kontraszt
arányokkal együtt dokumentálva.

| Token | Érték | Használat |
| --- | --- | --- |
| Deep Graphite | `#182631` | törzsszöveg, címek, hangsúlyos sötét szakaszok |
| Steel Gray | `#5B7184` | másodlagos szöveg |
| Action Blue | `#256FD1` | CTA, link, kontrollált kiemelés |
| Hero Azure | `#2F80ED` | **csak dekoratív és mozgási kiemelés** – törzsszöveghez nem |
| Silver | `#B7C2CA` | keretek, sötét szakasz másodlagos szövege |
| Ice Canvas | `#F3F6F8` | világos szakaszháttér |
| White | `#FFFFFF` | alapháttér |

A wordmark egyszerű szöveg, a tipográfia rendszerfont-alapú – mindkettő
provisional, nincs végleges logó és nincs külső fizetős font.

## Hero animáció

Könnyű, CSS/SVG-alapú megoldás: inline SVG + CSS keyframes, kizárólag
`transform` és `opacity`. Nincs WebGL, Three.js, React Three Fiber, Canvas
vagy animációs framework.

`prefers-reduced-motion: reduce` esetén minden dekoratív mozgás leáll, a
szöveg azonnal láthatóvá válik, és statikus, jelentésében azonos
Hero-kompozíció marad. A tartalom láthatósága nem függ JavaScripttől.

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
    globals.css        design tokenek, animációk, reduced-motion
    layout.tsx
    page.tsx           skip link + szakaszok összeállítása
  components/
    Header.tsx         wordmark, navigáció, billentyűzetes mobilmenü
    Hero.tsx           Hero + kötelező státuszközlés + kockázati figyelmeztetés
    HeroMotion.tsx     SVG figura és gyertyák, CSS keyframes
    RoleClarification.tsx
    About.tsx  Services.tsx  WhyJG.tsx  Process.tsx
    Contact.tsx        elérhetőségek, üzleti órák, űrlap-prototípus
    LegalRiskBlock.tsx jogi tájékoztató, panaszkezelés, impresszum
    Footer.tsx
    Section.tsx        közös szakaszkeret
  content/
    homepage.ts        TARTALMI SOURCE OF TRUTH
```
