# JG Investment Plus — e-mail sablonok

> **STÁTUSZ: COMPLIANCE REVIEW REQUIRED BEFORE EXTERNAL USE**
> A sablon új e-mail-kommunikációs kompozíció. A szövegelemek a jóváhagyott
> weboldalszövegezésből (`src/content/homepage.ts`) származnak, de az e-mailes
> összeállítást a K&H Compliance még **nem** hagyta jóvá.

Izolált e-mail rendszer: nem része a Next.js alkalmazásnak, nincs React-, Tailwind-
vagy JavaScript-függősége. A weboldal UI-ját nem érinti.

## Fájlok

| Fájl | Szerep |
| --- | --- |
| `jg-introduction-v2.html` | **Küldendő** HTML sablon — képek és linkek a `https://www.jginvst.hu` domainen |
| `jg-introduction-v2.txt` | Plain-text változat (multipart/alternative) |
| `../public/email-preview/jg-introduction-v2.html` | **Review-only** előnézet (`/email-preview/jg-introduction-v2.html` route), relatív `/email/…` képekkel — **nem küldendő**, generált fájl |
| `src/icons/*.svg` | A négy szolgáltatásikon + a státuszközlés ikonjának SVG-forrása |
| `scripts/render-assets.mjs` | PNG/JPG-k generálása a `public/email/` mappába |
| `scripts/build-preview.mjs` | Review-előnézet + screenshotok (`docs/email/screenshots/`) |
| `scripts/check-email.mjs` | QA: approved copy, linkek, képek, tiltott elemek |
| `../public/email/` | E-mail képek (logó, ikonok; hero-kép nincs) |
| `../docs/email/jg-email-v2-spec.md` | Részletes specifikáció és döntések |

## URL-ek (LOCKED)

| Szerep | URL |
| --- | --- |
| Publikus domain | `https://www.jginvst.hu` (látható címként: `www.jginvst.hu`) |
| Kapcsolatfelvétel (CTA + szöveges link + plain text) | `https://www.jginvst.hu/#kapcsolat` |
| E-mail képek | `https://www.jginvst.hu/email/…` (abszolút) |
| Jogi oldalak | `https://www.jginvst.hu/jogi-tajekoztato`, `…/jogi-tajekoztato#panaszkezeles`, `…/adatkezelesi-tajekoztato` |
| K&H külső link | `https://www.khertekpapir.hu/ugyfeltamogatas/dokumentumok` (változatlan) |

A `*.vercel.app` domain **soha nem** kerülhet a küldendő HTML-be vagy a plain textbe
(a `check-email.mjs` FAIL-t ad rá). Vercel-URL kizárólag a fejlesztői review
preview hostja lehet.

**Fontos:** a `https://www.jginvst.hu/email/…` képek csak akkor élnek, ha ez a
branch a mainbe kerül és production deploy történik. Addig a küldendő HTML képei
nem töltenek be; a review a preview-n történik.

Egyetlen megmaradt helyőrző: `{{VIEW_ONLINE_URL}}` (a levél online változata) —
nincs ellenőrzött, ügyfélnek szánt URL, nyitott pont. Fejlesztői preview URL ide
**nem** írható.

## Parancsok

```bash
# QA (Node ≥ 22.18)
node emails/scripts/check-email.mjs

# Képek újragenerálása (globális Playwright + Chromium, nincs új projekt-függőség)
NODE_PATH="$(npm root -g)" node emails/scripts/render-assets.mjs

# Review-előnézet + screenshotok (proxy mögött: NODE_USE_ENV_PROXY=1)
NODE_PATH="$(npm root -g)" node emails/scripts/build-preview.mjs --screenshots
```

A küldendő HTML minden módosítása után futtasd a `build-preview.mjs`-t: a QA
FAIL-t ad, ha a preview elavult.

Előnézet: `npm run dev`, majd `http://localhost:3000/email-preview/jg-introduction-v2.html`;
vagy a feature branch Vercel Preview deploymentjén ugyanezen az útvonalon.
A preview-ban `noindex, nofollow` meta van, de a `public/` mappa része, így merge után
a productionön is elérhető lenne — merge előtt dönteni kell róla (ld. spec).

## Gmail-draft workflow (későbbi kör — most NEM fut)

Folyamat: **jóváhagyott HTML → Gmail draft → Alex review → kézi küldés.**
Automatikus küldés nincs, és ebben a körben Google Workspace-konfiguráció sem változik.

1. Előfeltétel: compliance-jóváhagyás, és a `https://www.jginvst.hu/email/…` képek
   élesben 200-zal válaszolnak (merge + production deploy után).
2. `{{VIEW_ONLINE_URL}}`: vagy egy jóváhagyott, ügyfélnek szánt URL, vagy a
   „view online” sor eltávolítása — ezt Alex dönti el.
3. QA: `node emails/scripts/check-email.mjs`.
4. Draft létrehozása — két lehetőség:
   - **Gmail API / Claude Gmail connector (ajánlott):** `multipart/alternative` üzenet
     a HTML-lel és a `.txt` változattal, draftként mentve (nem küldve). Ez a
     következő, külön kör feladata.
   - **Kézi:** nyisd meg a küldendő HTML-t böngészőben, jelöld ki a teljes
     levelet (Ctrl/Cmd + A), másold, majd illeszd be egy új Gmail-levélbe. A
     beillesztés az inline stílusokat nagyrészt megtartja, de a `<style>`-ban lévő
     mobil media query-k elveszhetnek — az API-s út ezért megbízhatóbb.
5. Tárgy javaslat (a jóváhagyott oldalcímből): `JG Investment Plus Kft. · A K&H Értékpapír függő ügynöke`
6. Alex a draftot Gmailben ellenőrzi (asztali + mobil), majd kézzel küldi.

## Szabályok

- A logó kizárólag a kanonikus JG Logo System v1.0 geometriából készülhet
  (`render-assets.mjs` ellenőrzi). A referencia-screenshot logója nem használható.
- Szöveget csak a `src/content/homepage.ts` alapján lehet módosítani; új pénzügyi
  állítás nem kerülhet be.
- Az e-mail HTML-ben nincs JavaScript, inline SVG, data URI, emoji vagy ikonfont.
