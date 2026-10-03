# JG Investment Plus — e-mail sablonok

> **STÁTUSZ: COMPLIANCE REVIEW REQUIRED BEFORE EXTERNAL USE**
> A sablon új e-mail-kommunikációs kompozíció. A szövegelemek a jóváhagyott
> weboldalszövegezésből (`src/content/homepage.ts`) származnak, de az e-mailes
> összeállítást a K&H Compliance még **nem** hagyta jóvá.

Izolált, **privát** e-mail rendszer: nem része a Next.js alkalmazásnak, a weboldal
nem szolgál ki belőle semmit (nincs `public/` fájl, nincs publikus route).

## Kézbesítési architektúra (canonical)

```
PRIVÁT E-MAIL SABLON (emails/)
→ CID INLINE KÉPEK (emails/assets/, a levélbe ágyazva)
→ GOOGLE APPS SCRIPT (emails/apps-script/)
→ GMAIL PISZKOZAT
→ EMBERI ELLENŐRZÉS
→ KÉZI KÜLDÉS
```

- **Nincs publikus képhosting.** A HTML minden képe `src="cid:<kulcs>"`; a képek a
  MIME-üzenet inline részei. A levél nem tölt be külső képet.
- **Nincs online változat.** A korábbi „Ha a levél nem jelenik meg megfelelően…” sor
  és a `{{VIEW_ONLINE_URL}}` helyőrző megszűnt.
- **Nincs automatikus küldés.** Az Apps Script kizárólag piszkozatot hoz létre.
- A webes **linkek** megmaradnak (CTA, weboldal, jogi oldalak, K&H): ezek
  link-célok, nem képforrások.

A korábbi Vercel preview és a `https://www.jginvst.hu/email/…` képhosting csak
fejlesztés közbeni, **megszűnt** megoldás volt, nem production függőség.

## Fájlok

| Fájl | Szerep |
| --- | --- |
| `jg-introduction-v2.html` | **Küldendő** HTML sablon, CID képekkel |
| `jg-introduction-v2.txt` | Plain-text alternatíva |
| `assets/` | Privát e-mail képek (logó, ikonok), CID inline képként ágyazva be |
| `scripts/cid-assets.mjs` | **Rögzített** CID-térkép (kulcs → fájl). A kulcsok nem változnak |
| `apps-script/` | JG Email Draft Generator v1 (Apps Script csomag), ld. `apps-script/README.md` |
| `preview/jg-introduction-v2.preview.html` | **Helyi** fejlesztői előnézet (CID → `../assets/…`). Nem publikus, nem küldendő, generált fájl |
| `src/icons/*.svg` | A szolgáltatásikonok és a státuszikon SVG-forrása |
| `scripts/render-assets.mjs` | PNG-k renderelése az `assets/` mappába (kanonikus logógeometriából) |
| `scripts/build-preview.mjs` | Helyi előnézet + screenshotok (`docs/email/screenshots/`) |
| `scripts/build-apps-script.mjs` | Az Apps Script generált fájljai (`Assets.gs`, sablonmásolatok) |
| `scripts/check-email.mjs` | QA: approved copy, CID-térkép, linkek, tiltott elemek, Apps Script (send guard, scope, szintaxis, szimuláció) |
| `scripts/test-apps-script.mjs` | Az Apps Script helyi szimulációja és a keletkező MIME ellenőrzése |
| `../docs/email/jg-email-v2-spec.md` | Részletes specifikáció és döntések |

## CID-térkép (LOCKED)

| CID | Fájl |
| --- | --- |
| `jgMarkPorcelain` | `assets/jg-mark-porcelain@2x.png` |
| `jgMarkCarbon` | `assets/jg-mark-carbon@2x.png` |
| `noticeIcon` | `assets/icons/notice.png` |
| `opportunitiesIcon` | `assets/icons/opportunities.png` |
| `savingsIcon` | `assets/icons/savings.png` |
| `digitalIcon` | `assets/icons/digital.png` |
| `relationshipIcon` | `assets/icons/relationship.png` |
| `khPartnerLogo` | `assets/kh-logo-dark.png` — byte-azonos másolat: `public/brand/kh-logo-dark.png` (a `render-assets.mjs` másolja) |

## Linkek (LOCKED)

| Szerep | URL |
| --- | --- |
| Kapcsolatfelvétel (CTA + szöveges link + plain text) | `https://www.jginvst.hu/#kapcsolat` |
| Weboldal (látható: `www.jginvst.hu`) | `https://www.jginvst.hu` |
| Jogi oldalak | `https://www.jginvst.hu/jogi-tajekoztato`, `…/jogi-tajekoztato#panaszkezeles`, `…/adatkezelesi-tajekoztato` |
| K&H külső link | `https://www.khertekpapir.hu/ugyfeltamogatas/dokumentumok` |

`*.vercel.app`, `localhost` és hostolt e-mail-kép URL nem kerülhet a küldendő
HTML-be vagy a plain textbe: a `check-email.mjs` FAIL-t ad rá.

## Munkafolyamat a sablon módosítása után

```bash
# 1. (csak ha ikon/logó változott) képek renderelése — globális Playwright
NODE_PATH="$(npm root -g)" node emails/scripts/render-assets.mjs
# 2. Apps Script generált fájlok frissítése
node emails/scripts/build-apps-script.mjs
# 3. Helyi előnézet + screenshotok (proxy mögött: NODE_USE_ENV_PROXY=1)
NODE_PATH="$(npm root -g)" node emails/scripts/build-preview.mjs --screenshots
# 4. QA (Node ≥ 22.18)
node emails/scripts/check-email.mjs
```

A QA FAIL-t ad, ha az előnézet vagy az Apps Script-másolatok elavultak.

Előnézet: nyisd meg böngészőben az `emails/preview/jg-introduction-v2.preview.html`
fájlt (a képeket a `../assets/` mappából tölti).

## Gmail-piszkozat

A telepítés és a használat lépései: **`apps-script/README.md`**. Röviden: a JG
Workspace fiókban létrehozott Apps Script projekt piszkozatot készít; Alex a Gmail
Piszkozatok mappájában ellenőrzi, majd kézzel küldi.

## Szabályok

- A logó kizárólag a kanonikus JG Logo System v1.0 geometriából készülhet
  (`render-assets.mjs` ellenőrzi).
- Szöveget csak a `src/content/homepage.ts` alapján lehet módosítani; új pénzügyi
  állítás nem kerülhet be.
- Az e-mail HTML-ben nincs JavaScript, inline SVG, data URI, emoji vagy ikonfont.
- Az Apps Script csomagban nincs küldési hívás (send guard).
