# GSAP — telepítés és ellenőrzés

Állapot: telepítve, csak a Header v2.0 prototípus használja. A production
header (`src/components/Header.tsx`) és a főoldal nem tölti be a GSAP-et.

## Mi lett telepítve

| Elem | Verzió / hely |
| --- | --- |
| GSAP AI Skills (`npx skills add https://github.com/greensock/gsap-skills`) | `.claude/skills/gsap-*` (8 skill), forrás + hash: `skills-lock.json` |
| `gsap` | 3.15.0 (`dependencies`) |
| `@gsap/react` | 2.1.2 (`dependencies`, peer: `gsap ^3.12.5`, `react >=17`) |

A skillek tisztán Markdown utasítások (nincs futtatható szkript): `gsap-core`,
`gsap-timeline`, `gsap-scrolltrigger`, `gsap-plugins`, `gsap-utils`,
`gsap-react`, `gsap-frameworks`, `gsap-performance`. Frissítés:
`npx skills update`.

## Kompatibilitás

- Next.js 16.3.4 + React 19.2.8: `npm run build`, `npm run typecheck`,
  `npm run lint` hibátlan.
- A GSAP-chunk kizárólag a `/prototipusok/header-v2` oldal bundle-jében van.

## Használati szabályok (a `gsap-react` skill alapján)

- Minden GSAP-kód `useGSAP()`-ban fut, `scope` reffel — SSR alatt nincs gsap-hívás.
- Eseménykezelőből indított animáció `contextSafe()`-be csomagolva. Ha a
  kezelő refet olvas, a csomagolás hívásidőben történjen
  (`() => contextSafe(fn)()`), különben a React 19 `react-hooks/refs`
  lint-szabálya hibát jelez. A `contextSafe` identitása stabil, így
  `useCallback` függőségként használható.
- `prefers-reduced-motion: reduce`: `gsap.matchMedia()`-val kikapcsolt
  belépés, egyéb animációk `duration: 0`.

## Prototípus és ellenőrzés

`/prototipusok/header-v2` — `src/prototypes/header-v2/`. Vercel Production
környezetben 404, mindig noindex; nincs a sitemapben.

Az oldal labor-sávja fel/le csatolja a headert, és kiírja a globális
timeline-on élő animációk számát. Playwright-tal ellenőrizve (dev, StrictMode):

- StrictMode dupla effektfutás után a belépő animáció teljesen látható állapotban ér véget;
- animáció közbeni unmount után 0 élő animáció (hover-tween és panel-timeline esetén is);
- mobilpanel: nyitás, Escape (fókusz vissza a gombra), külső kattintás,
  zárás közbeni újranyitás; zárás alatt a panel `inert`;
- reduced motion: azonnali állapotváltás;
- nincs konzolhiba vagy React-figyelmeztetés.
