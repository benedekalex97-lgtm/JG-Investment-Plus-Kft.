# JG Investment Plus — Bemutatkozó e-mail v2 — specifikáció

Branch: `feature/jg-email-template-v2` · Státusz: **COMPLIANCE REVIEW REQUIRED BEFORE EXTERNAL USE**

## 1. Source of truth

| Terület | Forrás |
| --- | --- |
| Vizuális irány | Alex által csatolt e-mail screenshot (art direction; **nem** logó- és nem tartalmi forrás) |
| Logó | JG Logo System v1.0: `src/components/Logo.tsx`, `public/brand/jg-mark*.svg`, `docs/brand/logo-system-v1.md` |
| Tartalom / compliance | `src/content/homepage.ts` |
| Hero kép | `src/assets/hero-market-corridor.webp` (csak olvasva, módosítatlan) |

A screenshot hibás emblémája **nincs** felhasználva: se asset, se trace, se formai referencia.

## 2. Logó az e-mailben

- Geometria: `M44 0 80 18 44 36 8 18Z M0 23 32 39 32 83 0 99Z M88 23 56 39 56 83 88 99Z`, viewBox `0 0 88 99`. Változatlan.
- `render-assets.mjs` a kanonikus pathból renderel, és leáll, ha a `Logo.tsx` vagy a `public/brand/*.svg` eltér tőle.
- Asset: `public/email/jg-mark-porcelain@2x.png` (Porcelain jel Carbon alapon, fejléc) és `jg-mark-carbon@2x.png` (Carbon jel Porcelain alapon, lábléc), 80×90 px, megjelenítés 40×45 px.
- A háttérszín bele van égetve (nem átlátszó PNG): ha egy kliens dark módban invertálja a háttereket, a jel nem tűnik el. Ilyenkor a jel egy kis, saját alapszínű téglalapon látszik — ez szándékos kompromisszum.
- Wordmark: élő szöveg (`JG Investment Plus`, CSS-sel nagybetűs), Inter 500, 0,12em tracking, fallback `Inter, Arial, Helvetica, sans-serif`. Fejlécben 18 px → jel 2,5em = 45 px, térköz 14 px (≈ 1,25X), a logo-system §5 horizontális lockupja szerint.
- A lockupban a jel `alt=""`: a nevet a mellette álló wordmark adja (logo-system §5 akadálymentességi szabály), így a képek letiltásakor sem duplázódik.

## 3. Elrendezés

| Blokk | Megoldás |
| --- | --- |
| Szélesség | 640 px konténer, középre; mobilon 100% |
| Külső háttér | `#E9E7E3` (meleg, a Porcelain-nél kissé sötétebb); konténer Porcelain `#F4F3F1` |
| View-in-browser | 11 px, jobbra zárt, `{{VIEW_ONLINE_URL}}` |
| Fejléc | Carbon `#18181B`; bal: jel + wordmark + `hero.eyebrowLines`; jobb: hajszálvonal + „Szakmai rend, emberi kapcsolattal.” (Newsreader) |
| Hero | Newsreader 36/42 főcím, „Átláthatóság.” Signal Berry `#8E3F67` (mint a weboldalon); intro Inter 15/25; jobb oldalt 200×300 px hero-kép, Porcelainbe olvadó széllel |
| Mobil hero | A jobb oldali kép rejtett; helyette 640×200-as sötét sáv a fejléc alatt (`jg-email-hero-mobile.jpg`) |
| Státuszközlés | `#ECE9E6` doboz, saját „i” ikon (rombusz + pillér), függőleges elválasztó, `statusNotice.body` szó szerint |
| Miben segítünk? | Aubergine tracked címke + hajszálvonal, `services.lead`, majd 4 kompakt sor: 32 px ikon, Newsreader 20 px cím, Inter 14/22 szöveg |
| Idézet | `about.quote`, Newsreader italic 21/31, Signal Berry „ ” (mint az About szakaszban), két oldalt hajszálvonal |
| CTA | Bulletproof gomb: `<a>` + Outlookhoz VML `roundrect`; Aubergine `#493447`, Porcelain szöveg; felirat = `contact.heading` nagybetűvel; alatta szöveges link |
| Lábléc | Carbon jel + wordmark + eyebrow sorok; jobbra: E-mail `info@jginvst.com`, Weboldal `jg-investment-plus-kft.vercel.app` |
| Jogi rész | `footer.statusLine`, a `footer.disclaimerLine` e-mailre igazítva, `footer.brandLine`, jogi linkek, `footer.copyright` |

## 4. Tartalom

Minden szövegelem szó szerint a `homepage.ts`-ből származik (`check-email.mjs` 23 tételt ellenőriz a HTML-ben és a plain-textben is), két kivétellel:

1. **„Szakmai rend, emberi kapcsolattal.”** — a brief kérte (a screenshotból). **Nem** szerepel a jóváhagyott weboldalszövegezésben → Alex + compliance jóváhagyás szükséges.
2. **Disclaimer adaptáció:** „A weboldal általános tájékoztatást tartalmaz; …” → „A jelen e-mail általános tájékoztatást tartalmaz; …”. A mondat többi része karakterre azonos. (A brief „email” alakot írt; a weboldal „E-mail” helyesírását követtük: „e-mail”.)

Kizárva (a 2026. márciusi levélből és általában): „biztonságosabbá, hatékonyabbá és hosszú távon jövedelmezőbbé”, személyre szabott ajánlás vagy tanácsadás, a kockázati profil önálló vizsgálata, hozam- vagy biztonsági ígéret. A QA script ezekre is keres.

Nem került be: telefonszám (a brief szerint a jobb oldalon csak ellenőrzött e-mail és web), K&H-logó, leiratkozási sor (ld. nyitott pontok).

## 5. Ikonrendszer

32×32-es rács, kizárólag függőleges, vízszintes és 1:2 lejtésű élek (a JG jel geometriai nyelve), Aubergine, kitöltött formák, nincs görbe, nincs gradiens.

| Ikon | Forma | Jelentés |
| --- | --- | --- |
| `opportunities` | Három párhuzamos, 1:2 lejtésű panel | Egymás mellé rendezett, strukturált lehetőségek |
| `savings` | Fedőlap-rombusz + két egyenletes réteg | Rendezett, rétegzett megtakarítás |
| `digital` | Fejlécsáv, oldalsáv, két modul | Moduláris interfész |
| `relationship` | Két egymás felé dőlő elem, köztük összekötő modul, alattuk nyitott tér | Kapcsolat két fél között |
| `notice` | Rombusz + pillér (absztrakt „i”) | Tájékoztatás |

SVG-forrás: `emails/src/icons/`; e-mailben: `public/email/icons/*.png` (64×64, @2x, háttérszín beégetve).

## 6. Technikai szabályok

- Table-alapú elrendezés, `role="presentation"`, inline CSS; a `<style>` csak reset, mobil media query (`max-width: 639px`) és hover.
- Nincs JS, inline SVG, data URI, emoji, ikonfont, CSS-változó, flex vagy grid.
- Minden `<img>`-nek van `alt`, `width` és `height` attribútuma; dekoratív kép `alt=""`.
- Outlook: MSO feltételes 640 px-es ghost table, VML gomb, Arial/Georgia font override, `o:PixelsPerInch`.
- Webfontok (Inter, Newsreader) Google Fonts `<link>`-kel; Gmail és Outlook nem tölti be őket, ott a Georgia/Arial fallback él (`desktop-fallback.png`).
- Dark mode: `color-scheme: light` (Apple Mail nem színez át); invertáló kliensekben a beégetett hátterű képek és az explicit CTA-színek olvashatók maradnak.
- Méret: kb. 25 KB (a Gmail kb. 102 KB felett levág).

## 7. Ismert korlátok

- Gmail mobilalkalmazásban nem Google-fiókkal (IMAP/„GANGA”) a media query-k nem futnak: ott az asztali elrendezés jelenik meg.
- A mobil hero-sávot a media query kapcsolja be; media query nélküli kliensben nem jelenik meg (az asztali hero kép viszont igen).
- A screenshotok Linux Chromiumban készültek; a Georgia nincs telepítve, ezért a fallback screenshot Liberation Serifet mutat. A Georgia szélesebb, így asztali nézetben a főcím első sora két sorra törhet. Ez rendezett tördelés, nem overflow.
- Valódi kliensteszt (Gmail web/iOS/Android, Outlook desktop, Apple Mail) még nem történt; ehhez élő asset-URL kell.

## 8. Review-screenshotok

`docs/email/screenshots/`: `desktop.png` (1440 px, webfontokkal), `desktop-fallback.png` (webfontok nélkül), `mobile.png` (390 px, 2×), `images-off.png` (390 px, képek letiltva). Mindegyiknél 0 px vízszintes túlcsordulás.
