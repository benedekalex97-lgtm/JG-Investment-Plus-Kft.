# JG Investment Plus — Bemutatkozó e-mail v2 — specifikáció

Branch: `feature/jg-email-template-v2` · Státusz: **COMPLIANCE REVIEW REQUIRED BEFORE EXTERNAL USE**

**Kézbesítési architektúra (canonical):** privát e-mail sablon → CID inline képek → Google Apps Script → Gmail piszkozat → emberi ellenőrzés → kézi küldés. Nincs publikus képhosting, nincs online változat, nincs automatikus küldés. Részletek: §8.

## 1. Source of truth

| Terület | Forrás |
| --- | --- |
| Vizuális irány | Alex által csatolt e-mail screenshot (art direction; **nem** logó- és nem tartalmi forrás) |
| Logó | JG Logo System v1.0: `src/components/Logo.tsx`, `public/brand/jg-mark*.svg`, `docs/brand/logo-system-v1.md` |
| Tartalom / compliance | `src/content/homepage.ts` |
| Hero kép | **Nincs.** A candlestick hero-képet (`hero-market-corridor.webp`-ből) Alex review-ja elutasította: túl „traderes”, ellentétes a JG márkairánnyal. A hero tipográfiai. |

A screenshot hibás emblémája **nincs** felhasználva: se asset, se trace, se formai referencia.

## 2. Logó az e-mailben

- Geometria: `M44 0 80 18 44 36 8 18Z M0 23 32 39 32 83 0 99Z M88 23 56 39 56 83 88 99Z`, viewBox `0 0 88 99`. Változatlan.
- `render-assets.mjs` a kanonikus pathból renderel, és leáll, ha a `Logo.tsx` vagy a `public/brand/*.svg` eltér tőle.
- Asset: `emails/assets/jg-mark-porcelain@2x.png` (CID `jgMarkPorcelain`; Porcelain jel Aubergine `#493447` alapon, fejléc) és `emails/assets/jg-mark-carbon@2x.png` (CID `jgMarkCarbon`; Carbon jel Porcelain alapon, lábléc), 80×90 px, megjelenítés 40×45 px. Privát fájlok, a weboldal nem szolgálja ki őket.
- A háttérszín bele van égetve (nem átlátszó PNG): ha egy kliens dark módban invertálja a háttereket, a jel nem tűnik el. Ilyenkor a jel egy kis, saját alapszínű téglalapon látszik — ez szándékos kompromisszum.
- Wordmark: élő szöveg (`JG Investment Plus`, CSS-sel nagybetűs), Inter 500, 0,12em tracking, fallback `Inter, Arial, Helvetica, sans-serif`. Fejlécben 18 px → jel 2,5em = 45 px, térköz 14 px (≈ 1,25X), a logo-system §5 horizontális lockupja szerint.
- A lockupban a jel `alt=""`: a nevet a mellette álló wordmark adja (logo-system §5 akadálymentességi szabály), így a képek letiltásakor sem duplázódik.

## 3. Elrendezés

| Blokk | Megoldás |
| --- | --- |
| Szélesség | 640 px konténer, középre; mobilon 100% |
| Külső háttér | `#E9E7E3` (meleg, a Porcelain-nél kissé sötétebb); konténer Porcelain `#F4F3F1` |
| View-in-browser | **Megszűnt.** Nincs publikus online változat, ezért a sor és a `{{VIEW_ONLINE_URL}}` helyőrző kikerült. A konténer fölött 28 px térköz maradt. |
| Fejléc | Kompakt (24 px függőleges padding, mobilon 18 px). **Aubergine `#493447`, pontosan a CTA gomb színe (LOCKED)**; a jel PNG-jének háttere is `#493447`, ezért nincs körülötte eltérő folt. Bal: jel + wordmark + `hero.eyebrowLines` (Porcelain / Cool Silver); jobb: Muted Plum `#755D70` hajszálvonal + „Szakmai rend, emberi kapcsolattal.” (Newsreader 16 px). Mobilon a tagline egy sorban, 14 px, Cool Silver színnel a wordmark alá igazítva. |
| Hero | Kép nélküli, tipográfiai: 32×2 px-es Signal Berry jelzővonal (a weboldal lábléc-osztójának mintájára), Newsreader 40/46 főcím (mobilon 31/37), „Átláthatóság.” Signal Berry `#8E3F67`; intro Inter 16/26 (mobilon 15/24), asztali nézetben 90 px jobb oldali térközzel a sorhossz miatt |
| Státuszközlés | `#ECE9E6` doboz, saját „i” ikon (rombusz + pillér), függőleges elválasztó, `statusNotice.body` szó szerint |
| Miben segítünk? | Aubergine tracked címke + hajszálvonal, `services.lead`, majd 4 kompakt sor: 32 px ikon, Newsreader 20 px cím, Inter 14/22 szöveg |
| Idézet | `about.quote`, Newsreader italic 21/31, Signal Berry „ ” (mint az About szakaszban), két oldalt hajszálvonal |
| CTA | Bulletproof gomb: `<a>` + Outlookhoz VML `roundrect`; Aubergine `#493447`, Porcelain szöveg; felirat = `contact.heading` nagybetűvel; mindkét cél (gomb + VML): `https://www.jginvst.hu/#kapcsolat`. A gomb alatti szöveges `www.jginvst.hu/#kapcsolat` link **megszűnt**; a plain textben a kapcsolati URL megmarad. |
| Lábléc | Carbon jel + wordmark + eyebrow sorok; jobbra: E-mail `info@jginvst.com`, Weboldal `www.jginvst.hu` (href `https://www.jginvst.hu`) |
| Jogi rész | `footer.statusLine`, a `footer.disclaimerLine` e-mailre igazítva, `footer.brandLine`, jogi linkek, `footer.copyright` |
| K&H partner sor | A footer legvégén, a copyright után: a weboldal Footer.tsx legalsó sávjának e-mailes megfelelője. `cid:khPartnerLogo` (byte-azonos másolat: `public/brand/kh-logo-dark.png` → `emails/assets/kh-logo-dark.png`), alt „K&H Értékpapír logó”, 50×39 px (39 px magas, mint a weboldalon), nem kattintható. Mellette Cool Silver 12/19 px-es szövegként a `footer.khPartnerLogo.complianceLine` szó szerint; mobilon a szöveg a logó alá tördel. **Aubergine `#493447` sávon áll**, mert a kanonikus logó fehér, sötét alapra készült (a weboldalon is sötét footeren van); átszínezni vagy vágni tilos. |

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

SVG-forrás: `emails/src/icons/`; e-mailben: `emails/assets/icons/*.png` (64×64, @2x, háttérszín beégetve), CID inline képként (`noticeIcon`, `opportunitiesIcon`, `savingsIcon`, `digitalIcon`, `relationshipIcon`).

## 6. Technikai szabályok

- Table-alapú elrendezés, `role="presentation"`, inline CSS; a `<style>` csak reset, mobil media query (`max-width: 639px`) és hover.
- Nincs JS, inline SVG, data URI, emoji, ikonfont, CSS-változó, flex vagy grid.
- Minden kép `src="cid:<kulcs>"` (rögzített kulcsok: `emails/scripts/cid-assets.mjs`); nincs hostolt kép-URL.
- Minden `<img>`-nek van `alt`, `width` és `height` attribútuma; dekoratív kép `alt=""`.
- Outlook: MSO feltételes 640 px-es ghost table, VML gomb, Arial/Georgia font override, `o:PixelsPerInch`.
- Webfontok (Inter, Newsreader) Google Fonts `<link>`-kel; Gmail és Outlook nem tölti be őket, ott a Georgia/Arial fallback él (`desktop-fallback.png`).
- Dark mode: `color-scheme: light` (Apple Mail nem színez át); invertáló kliensekben a beégetett hátterű képek és az explicit CTA-színek olvashatók maradnak.
- Méret: kb. 25 KB (a Gmail kb. 102 KB felett levág).

## 7. Ismert korlátok

- Gmail mobilalkalmazásban nem Google-fiókkal (IMAP/„GANGA”) a media query-k nem futnak: ott az asztali elrendezés jelenik meg.
- A screenshotok Linux Chromiumban készültek; a Georgia nincs telepítve, ezért a fallback screenshot Liberation Serifet mutat. A Georgia szélesebb, így asztali nézetben a főcím első sora két sorra törhet. Ez rendezett tördelés, nem overflow.
- Valódi kliensteszt (Gmail web/iOS/Android, Outlook desktop, Apple Mail) még nem történt. Az első lépés: egy Apps Scripttel létrehozott próbapiszkozat (ld. `emails/apps-script/README.md`).
- A CID inline képeket egyes kliensek a levél alján csatolmányként is listázhatják; ez kliensfüggő, a valódi teszten kell ellenőrizni.

## 8. Kézbesítés és URL-szerepek (LOCKED)

### Képek: CID inline

- A HTML képei `cid:` hivatkozások; a nyolc PNG (7 JG + a K&H partnerlogó) a MIME-üzenet `multipart/related` része, `Content-ID: <kulcs>` és `Content-Disposition: inline` fejléccel.
- Forrás: `emails/assets/` (privát). A `public/email/` és a `public/email-preview/` mappa megszűnt; a weboldal semmilyen e-mail-fájlt nem szolgál ki.
- A korábbi `https://www.jginvst.hu/email/…` képhosting és a Vercel review preview csak fejlesztés közbeni megoldás volt, **nem** production függőség.

### Gmail-piszkozat: Google Apps Script

- Csomag: `emails/apps-script/` (`Code.gs`, `Assets.gs`, `JGIntroductionV2.html`, `JGIntroductionV2Text.html`, `Index.html`, `appsscript.json`).
- A piszkozatot a Gmail API `users.drafts.create` hozza létre (Apps Script Gmail advanced service), egyetlen OAuth scope-pal: `https://www.googleapis.com/auth/gmail.compose`. A `GmailApp.createDraft()` a teljes `https://mail.google.com/` scope-ot igényelné, ezért a script a MIME-üzenetet maga állítja össze.
- Nincs küldési hívás. A `check-email.mjs` send guardja FAIL-t ad bármilyen `send…`, `MailApp`, `GmailApp`, `Users.Messages` vagy `UrlFetchApp` használatra.
- Fiók: a piszkozat abban a Google-fiókban jön létre, amelyik a scriptet futtatja (web app: *Execute as: User accessing the web app*). Nincs beégetett fiók.

### Linkek

- Ügyfélnek szánt: `https://www.jginvst.hu`; kapcsolat: `https://www.jginvst.hu/#kapcsolat`; jogi oldalak: `https://www.jginvst.hu/jogi-tajekoztato` (`#panaszkezeles`), `https://www.jginvst.hu/adatkezelesi-tajekoztato`; K&H: `https://www.khertekpapir.hu/ugyfeltamogatas/dokumentumok`.
- A `check-email.mjs` FAIL-t ad, ha a küldendő HTML vagy a TXT `vercel.app`-ot, `localhost`-ot, hostolt képet, `{{…}}` helyőrzőt vagy nem a `#kapcsolat`-ra mutató CTA-t tartalmaz.

### Helyi előnézet

`emails/preview/jg-introduction-v2.preview.html`, generálja: `build-preview.mjs`. A küldendő sablontól csak ennyiben tér el: `cid:<kulcs>` → `../assets/<fájl>`, valamint `noindex` meta. Csak fejlesztői ellenőrzésre szolgál: nem publikus és nem küldendő.

## 9. Review-screenshotok

`docs/email/screenshots/`, a helyi előnézet HTTP-n kiszolgálva: `desktop.png` (1440×900, webfontokkal), `desktop-fallback.png` (webfontok nélkül), `mobile.png` (390×844, 2×), `images-off.png` (390×844, képek letiltva). Mindegyiknél 0 px vízszintes túlcsordulás, 0 törött kép, 0 console error.
