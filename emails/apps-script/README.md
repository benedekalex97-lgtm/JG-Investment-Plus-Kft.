# JG Email Draft Generator v1 — Google Apps Script

Gmail-**piszkozatot** hoz létre a jóváhagyott bemutatkozó e-mailből (v2). **Soha
nem küld e-mailt.** A piszkozatot ember ellenőrzi a Gmailben, és kézzel küldi el.

```
privát sablon → CID inline képek → Apps Script → Gmail PISZKOZAT → emberi ellenőrzés → kézi küldés
```

> STÁTUSZ: **COMPLIANCE REVIEW REQUIRED BEFORE EXTERNAL USE** — ld. `../README.md`.

## Fájlok

| Fájl | Mi ez | Forrás |
| --- | --- | --- |
| `Code.gs` | Szerverlogika: validálás, MIME összeállítás, piszkozat létrehozása, `doGet()` | kézzel írt |
| `Assets.gs` | A 8 inline PNG (7 JG + K&H partnerlogó) base64-ben, a rögzített CID-nevek szerint | **generált** (`build-apps-script.mjs`) |
| `JGIntroductionV2.html` | Az e-mail HTML (`src="cid:…"`) | **generált** — `emails/jg-introduction-v2.html` másolata |
| `JGIntroductionV2Text.html` | Plain-text alternatíva | **generált** — `emails/jg-introduction-v2.txt` másolata |
| `Index.html` | Belső kezelőfelület (web app) | kézzel írt |
| `appsscript.json` | Manifest: V8, kizárólag `gmail.compose` scope, Gmail advanced service | kézzel írt |

A generált fájlokat ne szerkeszd kézzel. A források módosítása után futtasd:
`node emails/scripts/build-apps-script.mjs`, majd `node emails/scripts/check-email.mjs`.

## Hogyan működik

- A levél `multipart/related` MIME-üzenet: `multipart/alternative` (text/plain +
  text/html) és 8 inline PNG (`Content-ID: <jgMarkPorcelain>` … `<khPartnerLogo>`). A HTML a képekre
  `cid:` hivatkozással mutat, ezért **semmilyen külső képet nem tölt be**.
- A piszkozatot a Gmail API `users.drafts.create` hívása hozza létre (Apps Script
  **Gmail advanced service**). Ehhez elég a `gmail.compose` scope.
- **Miért nem `GmailApp.createDraft()`?** A `GmailApp` a teljes
  `https://mail.google.com/` scope-ot kéri (a teljes postafiók olvasása és törlése).
  A least-privilege elv miatt a script a MIME-üzenetet maga állítja össze, és az API-n
  keresztül menti piszkozatként. Gmailben az eredmény ugyanaz: HTML-piszkozat inline
  képekkel és plain-text alternatívával.
- Feladó: a piszkozat abban a fiókban jön létre, amelyik a scriptet futtatja. Ha a
  fiók címe kiolvasható, a `From` fejléc `"JG Investment Plus Kft." <fiók címe>`.
  Ha nem, a fejléc kimarad, és a Gmail a fiók alapértelmezett feladóját használja.
- A script nem tartalmaz és nem is tartalmazhat küldési hívást: a `check-email.mjs`
  FAIL-t ad bármilyen `send…` hívásra, `MailApp`/`GmailApp` használatra vagy
  `Users.Messages` hívásra.

## Telepítés (a JG Google Workspace fiókkal)

1. Jelentkezz be a **JG Google Workspace** fiókkal, és nyisd meg a
   [script.google.com](https://script.google.com) oldalt.
2. **Új projekt** (standalone). Nevezd el: `JG Email Draft Generator`.
3. **Project Settings** (fogaskerék) → kapcsold be: *Show "appsscript.json" manifest
   file in editor*.
4. Hozd létre a fájlokat **pontosan ezekkel a nevekkel**, és másold be a tartalmukat
   ebből a mappából:
   - `Code.gs` (a meglévő `Code.gs` tartalmát cseréld le)
   - `Assets.gs` (*+ Script*)
   - `JGIntroductionV2` és `JGIntroductionV2Text` (*+ HTML*; a szerkesztő a
     `.html` kiterjesztést maga teszi hozzá)
   - `Index` (*+ HTML*)
   - `appsscript.json` (a meglévő tartalmát cseréld le)
5. Mentés. Az `appsscript.json` bekapcsolja a **Gmail API** advanced service-t
   (azonosító: `Gmail`). Ellenőrizd a bal oldali *Services* listában.
6. **Első futtatás / engedélyezés:** válaszd ki a `createSampleDraftToSelf`
   függvényt → *Run*. A Google engedélyt kér a Gmail-piszkozatok kezeléséhez
   (`gmail.compose`). Engedélyezd. A függvény **egy** piszkozatot hoz létre a saját
   címedre. Nyisd meg a Gmail → **Piszkozatok** mappát, és ellenőrizd a levelet
   (logó, ikonok, linkek, mobilnézet). Ha jó, a próbapiszkozatot törölheted.
7. **Web app (kezelőfelület):** *Deploy* → *New deployment* → típus: *Web app*.
   - **Execute as:** *User accessing the web app*. Így a piszkozat mindig annak a
     felhasználónak a Gmail-fiókjában jön létre, aki az oldalt használja (a saját
     engedélyével). A *Me* beállításnál minden piszkozat a telepítő fiókjában
     jönne létre, bárki használja is a felületet.
   - **Who has access:** *Only myself*, vagy ha több JG-munkatárs használja:
     *Anyone within <JG domain>*. **Ne** válaszd az *Anyone* lehetőséget
     (anonim/publikus hozzáférés).
   - A manifest `webapp` blokkja ugyanezt rögzíti (`USER_ACCESSING`, `DOMAIN`); a
     telepítéskor a párbeszédablakban választott érték érvényes.
8. Nyisd meg a telepítés **Web app URL**-jét (belső használatra, ne oszd meg
   publikusan).
9. Add meg a **címzettet** (több cím vesszővel) és szükség esetén módosítsd a
   **tárgyat** (alapértelmezés: `JG Investment Plus Kft. · A K&H Értékpapír függő ügynöke`).
10. Kattints: **GMAIL PISZKOZAT LÉTREHOZÁSA**. Sikeres létrehozás után megjelenik:
    „A Gmail piszkozat elkészült.”
11. Nyisd meg a Gmail → **Piszkozatok** mappát.
12. Ellenőrzés után **kézzel** küldd el.

## Validálás

- Címzett: kötelező; egy vagy több (max. 20) vesszővel elválasztott, egyszerű
  e-mail-cím (`nev@domain.tld`). Megjelenített név (`Név <cím>`) és sortörés nem
  megengedett. Ez véd a fejléc-befecskendezés ellen.
- Tárgy: kötelező, max. 200 karakter, sortörés nélkül.
- Hibás bemenetnél a függvény hibát dob (`throw Error`), és **nem** jön létre piszkozat.

## Helyi ellenőrzés (repository)

```bash
node emails/scripts/check-email.mjs        # teljes QA, a szimulációval együtt
node emails/scripts/test-apps-script.mjs   # csak az Apps Script-szimuláció
```

A szimuláció Node-ban, az Apps Script globálisainak helyettesítőivel futtatja a
`Code.gs`-t és az `Assets.gs`-t, majd a keletkező MIME-üzenetet bájtra pontosan
ellenőrzi. **Ez nem valódi Gmail-teszt:** az OAuth-engedélyezést, az advanced
service-t és a Gmail megjelenítését csak a fenti 6. lépés igazolja.

## Ismert, élesben ellenőrizendő pontok

- `Gmail.Users.getProfile('me')` a `gmail.compose` scope-pal: ha a Google mégis
  megtagadja, a `From` fejléc kimarad (a piszkozat ettől még létrejön), a
  `createSampleDraftToSelf` viszont ilyenkor hibát ad. Ebben az esetben a web
  felületről kell tesztelni.
- `HtmlService.createTemplateFromFile(...).getRawContent()` a sablont feldolgozás
  nélkül adja vissza. Az első próbapiszkozatnál ellenőrizd, hogy a levél pontosan
  úgy néz ki, mint a helyi előnézet.
