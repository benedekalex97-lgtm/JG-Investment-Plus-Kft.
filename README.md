# JG Investment Plus – weboldal

Ez a repository a JG Investment Plus Kft. weboldalát tartalmazza.

## Jelenlegi állapot: v0.4 tiszta, szövegközpontú Hero

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
is teljes egészében eltávolításra került — szándékosan nincs
helyettesítő illusztráció, mockup vagy placeholder. A Hero jobb oldali
vizuális eleme csak egy későbbi, professzionálisan kidolgozott rendszer
részeként kerül majd vissza; addig a Hero tudatosan tiszta, szövegközpontú
kompozíció. A tartalmi source of truth és a compliance-szabályok a
v0.1-hez képest változatlanok.

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

## Hero — tiszta, szövegközpontú kompozíció (v0.4)

A v0.1–v0.3 Hero jobb oldalán mindig volt valamilyen vizuális elem (előbb
mozgó, majd statikus figura + japángyertya-kompozíció). A v0.4-ben ez
teljes egészében megszűnt — nincs jobb oldali vizuális oszlop, és nincs
helyettesítő illusztráció, chart, mockup vagy placeholder sem. Az elem
csak egy későbbi, professzionálisan kidolgozott vizuális rendszer
részeként kerül majd vissza.

A Hero mostantól egyoszlopos, balra igazított, kontrollált olvasási
szélességre korlátozott (`max-w-3xl`, ~768px): eyebrow → főcím → bevezető
→ CTA-k, erős tipográfiai hierarchiával és rendezett whitespace-szel.

A Hero — és az oldal egésze — a betöltés után AZONNAL, teljes egészében
látható, minden módban; a globális `prefers-reduced-motion: reduce`
támogatás a dekoratív effektekre (smooth scroll, hover/menüátmenetek)
vonatkozik.

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
    globals.css              design tokenek (@theme), reduced-motion (globális, nem-Hero)
    layout.tsx                next/font/google (Newsreader, Inter)
    page.tsx                  skip link + szakaszok összeállítása
  components/
    Header.tsx                wordmark, navigáció, billentyűzetes mobilmenü + focus trap
    Hero.tsx                  Hero + kötelező státuszközlés + kockázati figyelmeztetés (v0.4: nincs jobb oldali vizuális elem)
    RoleClarification.tsx
    About.tsx  Services.tsx  WhyJG.tsx  Process.tsx
    Contact.tsx                elérhetőségek, üzleti órák, űrlap-prototípus
    LegalRiskBlock.tsx         jogi tájékoztató, panaszkezelés, impresszum
    Footer.tsx
    Section.tsx                közös szakaszkeret
  content/
    homepage.ts                TARTALMI SOURCE OF TRUTH
```
