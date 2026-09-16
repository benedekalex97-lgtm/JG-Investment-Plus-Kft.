"use client";

import { useEffect, useRef, type ElementType, type ReactNode } from "react";

/**
 * Reveal — visszafogott prémium belépőanimáció (14 px translate + opacity).
 *
 * MIÉRT NEM IntersectionObserver: az IO a megfigyeléseket aszinkron, kötegelve
 * kézbesíti. Gyors görgetésnél (vagy horgonyra ugrásnál) egy elem be- és
 * kiléphet két kézbesítés között, és a callback már NEM-metszőként látja —
 * ilyenkor rejtve ragadna, amíg a felhasználó vissza nem görget rá. Ezt
 * méréssel reprodukáltuk a Kapcsolat szakaszon (3 elem maradt opacity: 0-n).
 *
 * Helyette EGYETLEN, megosztott, requestAnimationFrame-mel fojtott
 * scroll/resize figyelő fut, ami determinisztikusan, a tényleges geometria
 * alapján dönt. Új dependency nélkül, natív API-kkal.
 *
 * Biztonsági szempontok:
 *   – az elem CSAK akkor kap rejtett kiindulóállapotot, ha a script már fut:
 *     a szerveroldali HTML-ben nincs .jg-reveal osztály, tehát JS nélkül a
 *     tartalom azonnal látszik. A szöveg SOSEM függ a scripttől;
 *   – prefers-reduced-motion esetén az osztály fel sem kerül;
 *   – egyszeri: megjelenés után az elem kikerül a nyilvántartásból;
 *   – teljes cleanup: az utolsó elem leiratkozásakor a figyelő is leáll.
 */

type Entry = { el: HTMLElement };

const registry = new Set<Entry>();
let frame = 0;
let listening = false;
let poll = 0;

/**
 * Egy elem megjelenik, ha a felső éle a viewport alsó 92%-a fölé ér. Ez a
 * feltétel a viewport FÖLÖTT lévő (már elgörgetett, negatív top értékű)
 * elemekre is teljesül, tehát horgonyra ugrás után sem maradhat rejtett
 * tartalom.
 */
function check() {
  frame = 0;
  const limit = window.innerHeight * 0.92;
  for (const entry of [...registry]) {
    if (entry.el.getBoundingClientRect().top < limit) {
      entry.el.dataset.revealed = "true";
      registry.delete(entry);
    }
  }
  if (registry.size === 0) stopListening();
}

function schedule() {
  if (frame) return;
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
  className = "",
  children,
}: {
  as?: ElementType;
  /** Stagger-késleltetés ms-ban. */
  delay?: number;
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    el.classList.add("jg-reveal");
    el.style.setProperty("--reveal-delay", `${delay}ms`);

    const entry: Entry = { el };
    registry.add(entry);
    startListening();
    schedule();

    return () => {
      registry.delete(entry);
      if (registry.size === 0) stopListening();
    };
  }, [delay]);

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}
