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
| `jg-introduction-v2.html` | **Küldendő** HTML sablon (helyőrzőkkel) |
| `jg-introduction-v2.txt` | Plain-text változat (multipart/alternative) |
| `preview/jg-introduction-v2.preview.html` | Helyi előnézet, böngészőben megnyitható — **nem küldendő** |
| `src/icons/*.svg` | A négy szolgáltatásikon + a státuszközlés ikonjának SVG-forrása |
| `scripts/render-assets.mjs` | PNG/JPG-k generálása a `public/email/` mappába |
| `scripts/build-preview.mjs` | Előnézet + review-screenshotok (`docs/email/screenshots/`) |
| `scripts/check-email.mjs` | QA: approved copy, linkek, képek, tiltott elemek |
| `../public/email/` | E-mail képek (logó, hero, ikonok) |
| `../docs/email/jg-email-v2-spec.md` | Részletes specifikáció és döntések |

## Helyőrzők

| Helyőrző | Jelentés | Javasolt érték |
| --- | --- | --- |
| `{{ASSET_BASE_URL}}` | A `public/` mappa nyilvános, abszolút HTTPS-gyökere | `https://jg-investment-plus-kft.vercel.app` — **csak miután** a `public/email/` mappa élesben elérhető (merge + deploy után; ez a kör nem deployol) |
| `{{VIEW_ONLINE_URL}}` | A levél online változata | Nincs ellenőrzött URL — nyitott pont |

A CTA, a weboldal- és a jogi linkek a `src/app/layout.tsx` `PRODUCTION_URL`
értékére (`https://jg-investment-plus-kft.vercel.app`) mutatnak. Ha egyedi domain
érkezik, ezeket is cserélni kell (a `check-email.mjs` allow-listjével együtt).

## Parancsok

```bash
# QA (Node ≥ 22.18)
node emails/scripts/check-email.mjs

# Képek újragenerálása (globális Playwright + Chromium, nincs új projekt-függőség)
NODE_PATH="$(npm root -g)" node emails/scripts/render-assets.mjs

# Előnézet + screenshotok (proxy mögött: NODE_USE_ENV_PROXY=1)
NODE_PATH="$(npm root -g)" node emails/scripts/build-preview.mjs --screenshots
```

Előnézet: nyisd meg böngészőben az `emails/preview/jg-introduction-v2.preview.html`
fájlt (a képeket relatív úton a `public/email/` mappából tölti).

## Gmail-draft workflow (későbbi kör — most NEM fut)

Folyamat: **jóváhagyott HTML → Gmail draft → Alex review → kézi küldés.**
Automatikus küldés nincs, és ebben a körben Google Workspace-konfiguráció sem változik.

1. Előfeltétel: compliance-jóváhagyás, a `public/email/` élesben elérhető, a
   helyőrzők értéke eldöntve.
2. Helyőrzők cseréje egy másolatban (a sablon maradjon változatlan), pl.:
   `sed 's#{{ASSET_BASE_URL}}#https://jg-investment-plus-kft.vercel.app#g' …`
3. QA: `node emails/scripts/check-email.mjs`, majd ellenőrizd, hogy minden kép URL-je
   200-zal válaszol.
4. Draft létrehozása — két lehetőség:
   - **Gmail API / Claude Gmail connector (ajánlott):** `multipart/alternative` üzenet
     a HTML-lel és a `.txt` változattal, draftként mentve (nem küldve). Ez a
     következő, külön kör feladata.
   - **Kézi:** nyisd meg a helyőrző-mentes HTML-t böngészőben, jelöld ki a teljes
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
