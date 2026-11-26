"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import type { Listing } from "./markets";

/**
 * MarketReel — a regionális panel 30 tételes, lassan pörgő listája.
 *
 * MŰKÖDÉS
 *   - A lista egy rögzített magasságú ablakban folyamatosan, lassan
 *     görget felfelé; a végén varrat nélkül kezdődik újra (a lista egy
 *     második, akadálymentesen rejtett példánya követi az elsőt).
 *   - MEGÁLL, amikor a látogató „rámegy egyre": egérrel a lista fölött,
 *     billentyűzetfókusszal egy soron, vagy érintésre (koppintás, húzás).
 *     A kiválasztott sor alatt ilyenkor lenyílik a cég rövid leírása.
 *   - Megállítva a lista kézzel is görgethető (egérgörgő, ujjal húzás);
 *     a billentyűzettel fókuszált sor mindig az ablakba gördül.
 *   - Nem pörög: csökkentett mozgás beállításnál, ha a látogató a
 *     „Mozgás leállítása" gombbal megállította a mozgást, és rejtett lapon
 *     (`running` = false). Ilyenkor statikus, kézzel görgethető lista.
 *
 * ÜTEMEZÉS: egyetlen listener a meglévő gsap.tickeren, csak amíg a lista
 * mozog; a sebesség megálláskor gyorsan (τ ≈ 0,12 s), induláskor lágyan
 * (τ ≈ 0,6 s) áll be — ugyanaz a viselkedés, mint a kameránál.
 *
 * AKADÁLYMENTESSÉG: az első példány sorai valódi gombok (aria-expanded,
 * aria-controls a leírásra); a második, ismétlő példány aria-hidden és
 * nem fókuszálható. A sorrend a felolvasó számára állandó (a mozgás csak
 * transform), a szöveg nem változik.
 */

/** Görgetési sebesség (CSS px / s). */
const SPEED = 22;
/** Panelnyitás után ennyi ideig áll a lista, hogy az első sorok olvashatók legyenek. */
const START_DELAY_MS = 1200;
/** Egér távozása / érintés után ennyi idő múlva indul újra. */
const RESUME_DELAY_MS = 450;
const TOUCH_RESUME_DELAY_MS = 2200;

type Props = {
  listings: Listing[];
  /** Szabad-e automatikusan mozognia (mozgás engedélyezett, látható lap). */
  running: boolean;
};

type OpenRow = { copy: 0 | 1; index: number } | null;

export default function MarketReel({ listings, running }: Props) {
  const uid = useId();
  const windowRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const [open, setOpen] = useState<OpenRow>(null);

  // Mozgásállapot (refben: a ticker nem renderel).
  const motion = useRef({
    offset: 0,
    speed: 0,
    cycle: 1, // az első példány magassága (a varrat helye)
    hover: false,
    focus: false,
    touch: false,
    held: false, // megnyitott sor
    waitUntil: 0,
    listening: false,
  });
  const runningRef = useRef(running);

  const apply = () => {
    const m = motion.current;
    const track = trackRef.current;
    if (!track) return;
    m.offset = ((m.offset % m.cycle) + m.cycle) % m.cycle;
    track.style.transform = `translate3d(0, ${(-m.offset).toFixed(2)}px, 0)`;
  };

  const shouldRun = () => {
    const m = motion.current;
    return runningRef.current && !m.hover && !m.focus && !m.touch && !m.held && performance.now() >= m.waitUntil;
  };

  const tick = (_time: number, deltaTime: number) => {
    const m = motion.current;
    const dt = Math.min(deltaTime, 100) / 1000;
    const target = shouldRun() ? 1 : 0;
    const tau = target > m.speed ? 0.6 : 0.12;
    m.speed += (target - m.speed) * (1 - Math.exp(-dt / tau));
    if (target === 0 && m.speed < 0.005) m.speed = 0;
    if (m.speed > 0) {
      m.offset += SPEED * m.speed * dt;
      apply();
    }
    // Leállás: ha áll és nem is fog elindulni, a listener lekerül.
    if (m.speed === 0 && !runningRef.current) stop();
  };

  const start = () => {
    const m = motion.current;
    if (m.listening) return;
    m.listening = true;
    gsap.ticker.add(tick);
  };
  const stop = () => {
    const m = motion.current;
    if (!m.listening) return;
    m.listening = false;
    gsap.ticker.remove(tick);
  };

  /* Indulás / leállás a külső mozgásengedély szerint. */
  useEffect(() => {
    runningRef.current = running;
    if (running) start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  /* Mount: indulási késleltetés, takarítás. */
  useEffect(() => {
    motion.current.waitUntil = performance.now() + START_DELAY_MS;
    if (runningRef.current) start();
    return () => stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* A varrat helye = az első példány magassága (lenyíló leírásnál is követi). */
  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const measure = () => {
      motion.current.cycle = Math.max(1, list.offsetHeight);
      apply();
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(list);
    return () => ro.disconnect();
  }, []);

  /* A sor nyitva tartása megállítja a listát; bezárás után rövid szünettel indul újra
     (a panelnyitáskori, hosszabb indulási várakozást nem írja felül). */
  const wasOpen = useRef(false);
  useEffect(() => {
    const m = motion.current;
    m.held = open !== null;
    if (open === null && wasOpen.current) m.waitUntil = Math.max(m.waitUntil, performance.now() + RESUME_DELAY_MS);
    wasOpen.current = open !== null;
  }, [open]);

  /* Kézi görgetés: egérgörgő (nem passzív listener, hogy az oldal ne görögjön). */
  useEffect(() => {
    const win = windowRef.current;
    if (!win) return;
    const onWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaY) < Math.abs(event.deltaX)) return;
      event.preventDefault();
      const m = motion.current;
      m.offset += event.deltaMode === 1 ? event.deltaY * 18 : event.deltaY;
      m.speed = 0;
      apply();
    };
    win.addEventListener("wheel", onWheel, { passive: false });
    return () => win.removeEventListener("wheel", onWheel);
  }, []);

  /* A fókuszált / kiválasztott sor legyen teljesen az ablakban. */
  const reveal = (row: HTMLElement) => {
    const win = windowRef.current;
    const list = listRef.current;
    if (!win || !list) return;
    const m = motion.current;
    const top = row.offsetTop + (row.closest("[data-copy='1']") ? m.cycle : 0);
    const bottom = top + row.offsetHeight;
    const view = win.clientHeight;
    if (top < m.offset) m.offset = top;
    else if (bottom > m.offset + view) m.offset = bottom - view;
    m.speed = 0;
    apply();
  };

  /* Egér: csak VALÓDI egérmozgás vált sort — a lista elmozdulásakor a
     böngésző által küldött szintetikus események nem nyitnak másik sort. */
  const lastPointer = useRef({ x: -1, y: -1 });
  const onPointerMove = (event: React.PointerEvent) => {
    if (event.pointerType !== "mouse") return;
    const { clientX: x, clientY: y } = event;
    if (x === lastPointer.current.x && y === lastPointer.current.y) return;
    lastPointer.current = { x, y };
    const row = (event.target as Element).closest<HTMLElement>("[data-row]");
    if (!row) return;
    const copy = row.dataset.copy === "1" ? 1 : 0;
    const index = Number(row.dataset.row);
    setOpen((was) => (was && was.copy === copy && was.index === index ? was : { copy, index }));
  };

  /* Érintés: húzással görgethető; koppintás nyit / zár. */
  const drag = useRef({ id: -1, y: 0, moved: false });
  const onPointerDown = (event: React.PointerEvent) => {
    if (event.pointerType === "mouse") return;
    motion.current.touch = true;
    drag.current = { id: event.pointerId, y: event.clientY, moved: false };
  };
  const onPointerMoveTouch = (event: React.PointerEvent) => {
    const d = drag.current;
    if (event.pointerId !== d.id) return;
    const dy = event.clientY - d.y;
    if (!d.moved && Math.abs(dy) < 6) return;
    d.moved = true;
    d.y = event.clientY;
    const m = motion.current;
    m.offset -= dy;
    m.speed = 0;
    apply();
  };
  const onPointerUp = (event: React.PointerEvent) => {
    if (event.pointerId !== drag.current.id) return;
    drag.current.id = -1;
    motion.current.touch = false;
    motion.current.waitUntil = performance.now() + TOUCH_RESUME_DELAY_MS;
  };

  const onRowClick = (event: React.MouseEvent<HTMLButtonElement>, copy: 0 | 1, index: number) => {
    if (drag.current.moved) {
      drag.current.moved = false;
      event.preventDefault();
      return;
    }
    const row = event.currentTarget.closest<HTMLElement>("[data-row]");
    setOpen((was) => {
      const same = was && was.copy === copy && was.index === index;
      if (!same && row) window.requestAnimationFrame(() => reveal(row));
      return same ? null : { copy, index };
    });
  };

  const renderList = (copy: 0 | 1) => (
    <ul
      ref={copy === 0 ? listRef : undefined}
      className="wp-list wp-reel-list"
      data-copy={copy}
      aria-hidden={copy === 1 ? true : undefined}
    >
      {listings.map((listing, index) => {
        const isOpen = open !== null && open.copy === copy && open.index === index;
        const descId = `${uid}-d${copy}-${index}`;
        return (
          <li key={`${listing.mic}:${listing.ticker}`} className="wp-row" data-row={index} data-copy={copy} data-open={isOpen || undefined}>
            <button
              type="button"
              className="wp-row-button"
              tabIndex={copy === 1 ? -1 : undefined}
              aria-expanded={copy === 0 ? isOpen : undefined}
              aria-controls={copy === 0 ? descId : undefined}
              onClick={(event) => onRowClick(event, copy, index)}
              onFocus={(event) => {
                // Csak billentyűzetes fókusz nyit: koppintásnál / kattintásnál a
                // kattintáskezelő dönt (különben a fókusz nyitna, a kattintás zárna).
                if (copy === 1 || !event.currentTarget.matches(":focus-visible")) return;
                const row = event.currentTarget.closest<HTMLElement>("[data-row]");
                setOpen({ copy, index });
                if (row) window.requestAnimationFrame(() => reveal(row));
              }}
            >
              <span className="wp-name">
                {listing.name}
                {listing.shareClass ? <span className="sr-only">, {listing.shareClass}</span> : null}
              </span>
              <span className="wp-ticker">
                {listing.ticker}
                <span className="sr-only"> ({listing.exchange})</span>
              </span>
            </button>
            <div id={copy === 0 ? descId : undefined} className="wp-row-desc">
              <p>{listing.description}</p>
            </div>
          </li>
        );
      })}
    </ul>
  );

  return (
    <div className="wp-reel-frame">
    <div
      ref={windowRef}
      className="wp-reel"
      onPointerEnter={(event) => {
        if (event.pointerType === "mouse") motion.current.hover = true;
      }}
      onPointerLeave={(event) => {
        if (event.pointerType !== "mouse") return;
        motion.current.hover = false;
        lastPointer.current = { x: -1, y: -1 };
        if (!motion.current.focus) setOpen(null);
        motion.current.waitUntil = performance.now() + RESUME_DELAY_MS;
      }}
      onPointerMove={(event) => {
        onPointerMove(event);
        onPointerMoveTouch(event);
      }}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onFocus={() => {
        motion.current.focus = true;
      }}
      onBlur={(event) => {
        if (event.currentTarget.contains(event.relatedTarget as Node | null)) return;
        motion.current.focus = false;
        if (!motion.current.hover) setOpen(null);
      }}
    >
      <div ref={trackRef} className="wp-reel-track">
        {renderList(0)}
        {renderList(1)}
      </div>
    </div>
    </div>
  );
}
