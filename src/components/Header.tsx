"use client";

import { useEffect, useId, useRef, useState } from "react";
import { meta, nav } from "@/content/homepage";

/**
 * Header — wordmark és főnavigáció.
 * A wordmark egyszerű szöveges megoldás; nincs végleges logó, monogram-embléma,
 * és nem jelenik meg K&H- vagy Patria-logó.
 *
 * A mobilmenü billentyűzettel is használható: a gomb aria-expanded állapotot
 * közöl, Escape-re zár és visszaadja a fókuszt, a panel pedig valódi
 * dokumentumsorrendben követi a gombot, így a Tab-sorrend természetes marad.
 */
export default function Header() {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <header className="sticky top-0 z-50 border-b border-silver/60 bg-paper/95 backdrop-blur-sm">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3 sm:px-6 lg:px-8">
        <a
          href="#top"
          className="flex min-h-11 items-center gap-2 rounded font-semibold tracking-tight text-graphite"
        >
          <span
            aria-hidden="true"
            className="inline-block h-6 w-1.5 shrink-0 rounded-full bg-action"
          />
          <span className="text-base sm:text-lg">{meta.wordmark}</span>
        </a>

        <nav aria-label={nav.menuLabel} className="hidden min-w-0 lg:block">
          {/* A lista törhet: 200%-os szövegnagyításnál sem okoz vízszintes overflow-t. */}
          <ul className="flex flex-wrap items-center justify-end gap-1">
            {nav.items.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="flex min-h-11 items-center rounded px-3 text-[0.95rem] font-medium text-steel transition-colors hover:bg-ice hover:text-graphite"
                >
                  {item.label}
                </a>
              </li>
            ))}
            <li>
              <a
                href="#kapcsolat"
                className="flex min-h-11 items-center rounded-lg bg-action px-4 text-[0.95rem] font-semibold text-paper transition-colors hover:bg-graphite"
              >
                Kapcsolatfelvétel
              </a>
            </li>
          </ul>
        </nav>

        <button
          ref={toggleRef}
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls={panelId}
          aria-label={open ? nav.closeMenuAccessible : nav.openMenuAccessible}
          className="flex h-11 min-w-11 items-center justify-center gap-2 rounded-lg border border-silver px-3 text-sm font-semibold text-graphite lg:hidden"
        >
          <span
            aria-hidden="true"
            className="flex h-4 w-5 flex-col justify-between"
          >
            <span className="block h-0.5 w-full rounded-full bg-graphite" />
            <span className="block h-0.5 w-full rounded-full bg-graphite" />
            <span className="block h-0.5 w-full rounded-full bg-graphite" />
          </span>
          {open ? nav.closeMenu : nav.openMenu}
        </button>
      </div>

      {/* A panel csak nyitva renderelődik, így zárt állapotban nem fókuszálható. */}
      {open ? (
        <div id={panelId} className="border-t border-silver/60 bg-paper lg:hidden">
          <nav aria-label={nav.menuLabel}>
            <ul className="mx-auto w-full max-w-6xl px-4 py-2 sm:px-6">
              {nav.items.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="flex min-h-11 items-center border-b border-ice text-base font-medium text-graphite"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
              <li className="py-3">
                <a
                  href="#kapcsolat"
                  onClick={() => setOpen(false)}
                  className="flex min-h-11 items-center justify-center rounded-lg bg-action px-4 text-base font-semibold text-paper"
                >
                  Kapcsolatfelvétel
                </a>
              </li>
            </ul>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
