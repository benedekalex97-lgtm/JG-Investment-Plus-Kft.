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

  /*
    v1.3: a header VÉGIG sötét (Deep) felületen áll, nem csak a Hero fölött.
    Ez tudatos: így nincs scroll-függő állapotváltás (nincs villanás, nincs
    layout shift, nincs blur/glassmorphism), a sticky állapot pedig ugyanolyan
    olvasható és prémium marad, mint a Hero fölött.
    Porcelain szöveg Deep alapon 16.07:1 (AAA).
  */
  return (
    <header className="on-dark sticky top-0 z-50 border-b border-white/10 bg-surface-deep">
      <div className="mx-auto flex h-[72px] w-full max-w-[1280px] items-center justify-between gap-x-8 px-5 sm:px-6 lg:h-20 lg:px-8">
        <Link
          href="/#top"
          className="flex min-h-11 shrink-0 items-center rounded font-display text-lg leading-none whitespace-nowrap text-porcelain sm:text-xl lg:text-[1.375rem]"
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
                  className="group relative flex min-h-11 items-center rounded px-3 text-[0.9375rem] text-cool-silver transition-colors hover:text-porcelain"
                >
                  {item.label}
                  {/* Hover-jelölés: hajszálvékony Berry vonal, nem aláhúzás. */}
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-3 bottom-2 h-px origin-left scale-x-0 bg-signal-berry-light transition-transform duration-200 group-hover:scale-x-100"
                  />
                </a>
              </li>
            ))}
            <li aria-hidden="true" className="mx-2 h-5 w-px bg-white/15" />
            <li>
              <Link
                href="/#kapcsolat"
                className="flex min-h-11 items-center rounded-md bg-porcelain px-5 text-[0.9375rem] font-semibold text-ink transition-colors hover:bg-white"
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
          className="flex h-11 min-w-11 shrink-0 items-center justify-center gap-2 rounded-md border border-white/20 px-3 text-sm font-medium text-porcelain lg:hidden"
        >
          <span
            aria-hidden="true"
            className="flex h-3.5 w-5 flex-col justify-between"
          >
            <span className="block h-px w-full bg-porcelain" />
            <span className="block h-px w-full bg-porcelain" />
            <span className="block h-px w-full bg-porcelain" />
          </span>
          {open ? nav.closeMenu : nav.openMenu}
        </button>
      </div>

      {/* A panel csak nyitva renderelődik, így zárt állapotban nem fókuszálható. */}
      {open ? (
        <div
          ref={panelRef}
          id={panelId}
          className="border-t border-white/10 bg-surface-deep lg:hidden"
        >
          <nav aria-label={nav.menuLabel}>
            <ul className="mx-auto w-full max-w-[1280px] px-5 py-2 sm:px-6">
              {nav.items.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="flex min-h-12 items-center border-b border-white/10 text-base text-porcelain"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
              <li className="py-3">
                <Link
                  href="/#kapcsolat"
                  onClick={() => setOpen(false)}
                  className="flex min-h-12 items-center justify-center rounded-md bg-porcelain px-4 text-base font-semibold text-ink"
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
