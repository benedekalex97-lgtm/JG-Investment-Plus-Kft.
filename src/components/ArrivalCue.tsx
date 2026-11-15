"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * ArrivalCue — „megérkeztél" visszajelzés a Kapcsolat elsődleges blokkján.
 *
 * EGYETLEN, halk megerősítés: egy Signal Berry tónusú, nagyon gyenge sáv
 * egyszer végigsöpör a blokkon (≤ 700 ms, kizárólag transform + opacity; ld.
 * globals.css, ÉRKEZÉS A KAPCSOLATHOZ). Nem ismétlődik, nem figyelemfelkeltő.
 *
 * MIKOR játszik:
 *   – a lap `#kapcsolat` horgonnyal töltődik be;
 *   – bármely, a #kapcsolat felé mutató link (header-CTA, hero-CTA,
 *     szakaszvégi CTA-k, mobilmenü, mobil sáv) kattintására;
 *   – `hashchange` a #kapcsolat-ra (előre/vissza gomb, kézi címszerkesztés).
 *   A lejátszás a görgetés MEGÉRKEZÉSE után indul (a simított görgetés
 *   végén), nem közben.
 *
 * MIKOR NEM:
 *   – közönséges görgetésnél (nincs hozzá eseményünk);
 *   – ha már lejátszott, és a blokk azóta nem hagyta el a látóteret
 *     („érkezésenként egyszer");
 *   – prefers-reduced-motion esetén soha.
 *
 * A sáv dekoratív réteg (aria-hidden, pointer-events: none); a tartalom
 * és a fókusz nem érinti. Nincs JS nélkül hatása, a szöveg sosem függ tőle.
 */

const TARGET_HASH = "#kapcsolat";

export default function ArrivalCue({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduced = () =>
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Új érkezésnek számít, ha a blokk közben elhagyta a látóteret.
    let armed = true;
    let pending = false;
    let raf = 0;

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) armed = true;
    });
    observer.observe(el);

    const inView = () => {
      const box = el.getBoundingClientRect();
      return box.bottom > 0 && box.top < window.innerHeight;
    };
    const play = () => {
      armed = false;
      // Újraindítható: az attribútum levétele + reflow + visszatétele.
      el.removeAttribute("data-cue");
      void el.offsetWidth;
      el.setAttribute("data-cue", "play");
    };

    /*
      Az érkezés megvárása: ha a görgetés elindult, megvárjuk, amíg 4
      képkockán át nem mozdul; ha nem is indul el (már ott vagyunk), rövid
      várakozás után játszik. Horgonyos betöltésnél a böngésző a görgetést
      csak később végzi el: addig, amíg a blokk nincs a látótérben, várunk.
      Felső időkorlát: 2,5 s (utána nem játszik — nem érkeztünk meg).
    */
    const arrive = () => {
      if (pending || !armed || reduced()) return;
      pending = true;
      const t0 = performance.now();
      let lastY = window.scrollY;
      let moved = false;
      let still = 0;
      const tick = () => {
        const y = window.scrollY;
        if (y !== lastY) {
          moved = true;
          still = 0;
          lastY = y;
        } else {
          still += 1;
        }
        const elapsed = performance.now() - t0;
        const settled = (moved && still >= 4) || (!moved && elapsed > 160);
        if (settled && inView()) {
          pending = false;
          play();
          return;
        }
        if (elapsed > 2500) {
          pending = false;
          return;
        }
        raf = window.requestAnimationFrame(tick);
      };
      raf = window.requestAnimationFrame(tick);
    };

    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = (event.target as Element | null)?.closest?.("a[href]");
      if (!(link instanceof HTMLAnchorElement)) return;
      if (link.target && link.target !== "_self") return;
      const url = new URL(link.href, window.location.href);
      if (
        url.origin === window.location.origin &&
        url.pathname === window.location.pathname &&
        url.hash === TARGET_HASH
      ) {
        arrive();
      }
    };
    const onHashChange = () => {
      if (window.location.hash === TARGET_HASH) arrive();
    };

    document.addEventListener("click", onClick);
    window.addEventListener("hashchange", onHashChange);
    if (window.location.hash === TARGET_HASH) arrive();

    return () => {
      document.removeEventListener("click", onClick);
      window.removeEventListener("hashchange", onHashChange);
      observer.disconnect();
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={ref} className="jg-arrive">
      {children}
      <span aria-hidden="true" className="jg-arrive-sweep" />
    </div>
  );
}
