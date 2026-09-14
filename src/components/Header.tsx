"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { meta, nav } from "@/content/homepage";

/**
 * Header — v0.2, Graphite × Aubergine × Silver.
 *
 * Nyugodt, editorial, private-client hangulat: sok whitespace, egyszerű
 * szöveges wordmark (nincs ikon, nincs monogram, nincs végleges logó),
 * visszafogott Aubergine CTA gradiens/glow nélkül, finom hajszálvonal-osztó.
 *
 * A mobilmenü billentyűzettel is teljesen használható: a gomb aria-expanded
 * állapotot közöl, nyitáskor a fókusz a panel első linkjére kerül, Tab/
 * Shift+Tab a panelen belül csapdázva marad (focus trap), Escape zár és
 * visszaadja a fókuszt a nyitó gombra.
 */
export default function Header() {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const panel = panelRef.current;
    const focusable = panel
      ? Array.from(
          panel.querySelectorAll<HTMLElement>(
            'a[href], button:not([disabled])',
          ),
        )
      : [];
    focusable[0]?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
        return;
      }

      if (event.key !== "Tab" || focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-surface/95 backdrop-blur-sm">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-5 py-4 sm:px-6 lg:px-8 lg:py-5">
        <Link
          href="/#top"
          className="flex min-h-11 items-center rounded font-display text-[1.0625rem] text-text-primary sm:text-xl"
        >
          {meta.wordmark}
        </Link>

        <nav aria-label={nav.menuLabel} className="hidden min-w-0 lg:block">
          {/* A lista törhet: 200%-os szövegnagyításnál sem okoz vízszintes overflow-t. */}
          <ul className="flex flex-wrap items-center justify-end gap-2">
            {nav.items.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="flex min-h-11 items-center rounded px-3.5 text-[0.95rem] text-text-secondary transition-colors hover:text-text-primary"
                >
                  {item.label}
                </a>
              </li>
            ))}
            <li aria-hidden="true" className="mx-1 h-6 w-px bg-border-strong" />
            <li>
              <Link
                href="/#kapcsolat"
                className="flex min-h-11 items-center rounded-md bg-accent px-5 text-[0.95rem] font-medium text-white transition-colors hover:bg-accent-hover"
              >
                Kapcsolatfelvétel
              </Link>
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
          className="flex h-11 min-w-11 items-center justify-center gap-2 rounded-md border border-border px-3 text-sm font-medium text-text-primary lg:hidden"
        >
          <span
            aria-hidden="true"
            className="flex h-3.5 w-5 flex-col justify-between"
          >
            <span className="block h-px w-full bg-text-primary" />
            <span className="block h-px w-full bg-text-primary" />
            <span className="block h-px w-full bg-text-primary" />
          </span>
          {open ? nav.closeMenu : nav.openMenu}
        </button>
      </div>

      {/* A panel csak nyitva renderelődik, így zárt állapotban nem fókuszálható. */}
      {open ? (
        <div
          ref={panelRef}
          id={panelId}
          className="border-t border-border bg-surface lg:hidden"
        >
          <nav aria-label={nav.menuLabel}>
            <ul className="mx-auto w-full max-w-6xl px-5 py-2 sm:px-6">
              {nav.items.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="flex min-h-11 items-center border-b border-border text-base text-text-primary"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
              <li className="py-3">
                <Link
                  href="/#kapcsolat"
                  onClick={() => setOpen(false)}
                  className="flex min-h-11 items-center justify-center rounded-md bg-accent px-4 text-base font-medium text-white"
                >
                  Kapcsolatfelvétel
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
