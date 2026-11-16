"use client";

import { useEffect, useRef } from "react";

/**
 * ReadingProgress — olvasási előrehaladás-hajszál a sticky header alsó élén.
 *
 * Orientáció („hol tartok az oldalon?"): 2 px-es, Muted Plum vonal, ami a
 * görgetéssel arányosan nő balról jobbra. A header alsó vonalán él, MELLETT a
 * desktop aktív szakasz-jelölővel (Signal Berry Light rombusz) — annál
 * szándékosan halkabb: sötétebb tónus, nincs rombusz-súly, nincs animáció.
 *
 * Mozgás: kizárólag `transform: scaleX()`. A görgetés közben NINCS
 * elrendezés-olvasás: az oldal görgethető magasságát csak méretváltozáskor
 * mérjük (ResizeObserver + resize), görgetéskor csak a `scrollY`-t olvassuk,
 * és egyetlen rAF-fojtott írás megy a vonalra. Nincs state, nincs re-render.
 *
 * Dekoratív: aria-hidden, pointer-events: none. Az érték a görgetési
 * helyzetet 1 : 1-ben követi (nincs simítás), tehát prefers-reduced-motion
 * mellett is helyes, mozgásmentes állapotot mutat.
 *
 * A markupban scaleX(0) az alapállapot: JS nélkül a vonal nem látszik.
 */
export default function ReadingProgress() {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let max = 1;
    let frame = 0;
    let last = -1;

    const write = () => {
      frame = 0;
      const p = Math.min(1, Math.max(0, window.scrollY / max));
      if (p === last) return;
      last = p;
      el.style.transform = `scaleX(${p})`;
    };
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(write);
    };
    const measure = () => {
      max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      schedule();
    };

    measure();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", measure, { passive: true });
    // A tartalom magassága (betöltődő betűtípus, mobil címsor-átméretezés) változhat.
    const observer = new ResizeObserver(measure);
    observer.observe(document.documentElement);

    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", measure);
      observer.disconnect();
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <span
      ref={ref}
      aria-hidden="true"
      className="jg-progress"
      style={{ transform: "scaleX(0)" }}
    />
  );
}
