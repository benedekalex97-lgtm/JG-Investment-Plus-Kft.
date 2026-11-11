"use client";

import { useEffect, useRef, type ElementType, type ReactNode } from "react";
import { MaskWords } from "./RevealParts";

/**
 * Reveal — visszafogott prémium belépőanimáció, v2 (variánsokkal).
 *
 * MIÉRT NEM IntersectionObserver: az IO a megfigyeléseket aszinkron, kötegelve
 * kézbesíti. Gyors görgetésnél (vagy horgonyra ugrásnál) egy elem be- és
 * kiléphet két kézbesítés között, és a callback már NEM-metszőként látja —
 * ilyenkor rejtve ragadna, amíg a felhasználó vissza nem görget rá. Ezt
 * méréssel reprodukáltuk a Kapcsolat szakaszon (3 elem maradt opacity: 0-n).
 *
 * Helyette EGYETLEN, megosztott, requestAnimationFrame-mel fojtott
 * scroll/resize figyelő fut, ami determinisztikusan, a tényleges geometria
 * alapján dönt. Új dependency nélkül, natív API-kkal. (A ScrollTrigger
 * egyszeri belépőkhöz szándékosan nem kell; csak ott van helye, ahol a mozgás
 * a görgetéshez van kötve.)
 *
 * VARIÁNSOK (`variant`, a `data-reveal` attribútumra képezve; a stílus a
 * globals.css „REVEAL v2" blokkjában él):
 *   rise  — (alapértelmezett) áttűnés + 14 px emelkedés;
 *   fade  — csak áttűnés;
 *   rule  — hajszálvonal, ami balról jobbra „kirajzolódik" (scaleX 0 → 1);
 *   grow  — függőleges jelzősáv, ami fentről lefelé nő (scaleY 0 → 1);
 *   mask  — a (sztring) tartalom szavai külön, vágott sordobozból emelkednek
 *           ki (címsorokhoz);
 *   group — az elem maga NEM mozog: ő a kiváltó. A benne lévő
 *           `data-rv="rise|fade|rule|grow|mask"` leszármazottak egyetlen
 *           koreografált belépőt kapnak, saját késleltetéssel (`rv(ms)`,
 *           ld. RevealParts.tsx). Így egy szakasz belépője EGY nyilvántartási
 *           tétel, a gyerekek pedig szerverkomponensek maradhatnak.
 *
 * Biztonsági szempontok (változatlan garanciák):
 *   – az elem CSAK akkor kap rejtett kiindulóállapotot, ha a script már fut:
 *     a szerveroldali HTML-ben nincs .jg-reveal osztály, tehát JS nélkül a
 *     tartalom azonnal látszik. A szöveg SOSEM függ a scripttől;
 *   – prefers-reduced-motion esetén az osztály fel sem kerül;
 *   – egyszeri: megjelenés után az elem kikerül a nyilvántartásból;
 *   – a polling-failsafe miatt semmi nem ragadhat rejtve;
 *   – teljes cleanup: az utolsó elem leiratkozásakor a figyelő is leáll.
 *
 * ÚJ: ami a betöltés utáni első ~1,2 s-ban (horgonyra ugrás, újratöltés
 * utáni görgetés-visszaállítás), vagy a viewport FÖLÖTT jelenik meg, az
 * „azonnali" állapotot kap (`data-revealed="instant"`): nincs eltűnés–
 * újrabelépés villanás és nincs várakozás a késleltetésre. A belépőanimáció
 * a később, görgetéssel érkező elemeknek jár.
 */

export type RevealVariant = "rise" | "fade" | "rule" | "grow" | "mask" | "group";

type Entry = { el: HTMLElement };

/**
 * A betöltés utáni „bevezető ablak": ennyi ideig tartó (az első regisztrációtól
 * számított) megjelenések azonnaliak. Ide esik a böngésző görgetés-
 * visszaállítása újratöltés után és a horgonyra ugrás — ezek nem „érkezések".
 */
const INTRO_MS = 1200;

const registry = new Set<Entry>();
let epoch = 0;
let requestedAt = 0;
let frame = 0;
let listening = false;
let poll = 0;

/**
 * Egy elem megjelenik, ha a felső éle a viewport alsó 92%-a fölé ér. Ez a
 * feltétel a viewport FÖLÖTT lévő (már elgörgetett, negatív top értékű)
 * elemekre is teljesül, tehát horgonyra ugrás után sem maradhat rejtett
 * tartalom. Először minden mérés (olvasás), csak utána az írások: nincs
 * elrendezés-kikényszerítés a ciklusban.
 *
 * „Azonnali" (`instant`, animáció nélkül) a megjelenés, ha az elem már a
 * viewport FÖLÖTT van (nincs mit animálni), vagy a bevezető ablakban történik.
 */
function check() {
  frame = 0;
  const limit = window.innerHeight * 0.92;
  // A kérés (görgetés / regisztráció) idejét nézzük, nem a rAF tényleges
  // lefutását: egy lassú főszálon a képkocka késhet, az érkezés mégis „korai".
  const intro = requestedAt - epoch < INTRO_MS;
  const due: { entry: Entry; instant: boolean }[] = [];
  for (const entry of registry) {
    const box = entry.el.getBoundingClientRect();
    if (box.top < limit) due.push({ entry, instant: intro || box.bottom <= 0 });
  }
  for (const { entry, instant } of due) {
    entry.el.dataset.revealed = instant ? "instant" : "true";
    registry.delete(entry);
  }
  if (registry.size === 0) stopListening();
}

function schedule() {
  if (frame) return;
  requestedAt = performance.now();
  frame = window.requestAnimationFrame(check);
}

function startListening() {
  if (listening) return;
  listening = true;
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule, { passive: true });
  /*
    Biztonsági ellenőrzés: ha egy rAF bármiért kimaradna (pl. a főszálat
    hosszabb munka foglalja), a tartalom akkor sem ragadhat rejtve. Az
    időzítő magától leáll, amint minden elem megjelent — utána nulla a
    költsége.
  */
  poll = window.setInterval(schedule, 400);
}

function stopListening() {
  if (!listening) return;
  listening = false;
  window.removeEventListener("scroll", schedule);
  window.removeEventListener("resize", schedule);
  if (poll) {
    window.clearInterval(poll);
    poll = 0;
  }
  if (frame) {
    window.cancelAnimationFrame(frame);
    frame = 0;
  }
}

export default function Reveal({
  as: Tag = "div",
  delay = 0,
  variant = "rise",
  className = "",
  id,
  "aria-hidden": ariaHidden,
  children,
}: {
  as?: ElementType;
  /** Stagger-késleltetés ms-ban (csoportnál: a leszármazottak alapja). */
  delay?: number;
  variant?: RevealVariant;
  className?: string;
  id?: string;
  "aria-hidden"?: boolean | "true" | "false";
  children?: ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    el.classList.add("jg-reveal");
    el.style.setProperty("--reveal-delay", `${delay}ms`);

    const entry: Entry = { el };
    if (registry.size === 0 && !listening) epoch = performance.now();
    registry.add(entry);
    startListening();
    schedule();

    return () => {
      registry.delete(entry);
      if (registry.size === 0) stopListening();
    };
  }, [delay]);

  return (
    <Tag
      ref={ref}
      id={id}
      aria-hidden={ariaHidden}
      data-reveal={variant}
      className={className}
    >
      {variant === "mask" && typeof children === "string" ? (
        <MaskWords text={children} />
      ) : (
        children
      )}
    </Tag>
  );
}
