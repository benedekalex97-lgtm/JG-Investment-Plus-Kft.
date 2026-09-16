"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { meta, nav } from "@/content/homepage";

/**
 * Header — v1.4: „az oldal első prémium részlete".
 *
 * A v1.3-as header egyetlen lapos, egyszínű sötét sáv volt: funkcionálisan
 * rendben, vizuálisan viszont gyakorlatilag egy alap Tailwind navigation bar.
 * A v1.4 NEM tesz bele glassmorphismot, blurt vagy fényes SaaS-hatást; ehelyett
 * öt visszafogott eszközzel ad neki karaktert és mélységet:
 *
 *   1) .jg-header — függőleges tonális gradiens (raise -> deep -> sink), 1 px
 *      belső felső fény, 1 px belső alsó határvonal és egy nagyon halvány
 *      vetett árnyék (ld. globals.css);
 *   2) a határvonal box-shadow, NEM border: így NEM ad hozzá magasságot, a
 *      header külső magassága PONTOSAN 72 px (mobil) és 80 px (desktop) —
 *      ugyanaz a két érték, amire a html { scroll-padding-top } is be van
 *      állítva, tehát az anchor-eltolás ±0 px;
 *   3) a wordmark nagyobb, feszesebb betűközzel és egy hajszálvékony
 *      függőleges Berry/Aubergine signature-ruddal — ez GEOMETRIAI jel, nem
 *      logó, és NEM ad új szövegcsomópontot a DOM-hoz (aria-hidden span);
 *   4) a nav itemek szélesebb ritmust és középről kifutó Berry sínt kapnak,
 *      ami hoverre ÉS :focus-visible-re is működik;
 *   5) a CTA finomabb élkezelést kap (belső felső fény + alsó Berry
 *      jelzővonal + szűk vetett árnyék), és hoverkor 1 px-t emelkedik.
 *
 * A header VÉGIG sötét, nem csak a Hero fölött: így nincs scroll-függő
 * állapotváltás (nincs villanás, nincs layout shift), és a sticky állapot
 * ugyanolyan olvasható marad. Porcelain szöveg a sávon 15.05–16.85:1 (AAA).
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
    A külső magasság PONTOSAN 72 / 80 px: a záró hajszálvonal box-shadow
    (ld. .jg-header), nem border, ezért nem növeli a sávot. Erre épül az
    anchor-eltolás is (html { scroll-padding-top: 72px / 80px }).
  */
  return (
    <header className="jg-header on-dark sticky top-0 z-50">
      <div className="mx-auto flex h-[72px] w-full max-w-[1280px] items-center justify-between gap-x-10 px-5 sm:px-6 lg:h-20 lg:px-8">
        <Link
          href="/#top"
          className="group flex min-h-11 shrink-0 items-center gap-3 rounded"
        >
          {/*
            Geometriai signature a wordmark mellett — NEM logó és NEM új
            szöveg: aria-hidden, tartalom nélküli span. Egy rövid függőleges
            Berry rúd, Aubergine-be futó alsó véggel.
          */}
          <span
            aria-hidden="true"
            className="jg-wordmark-rule block h-6 w-0.5 shrink-0 rounded-full lg:h-7"
          />
          <span className="font-display text-[1.1875rem] leading-none tracking-[-0.015em] whitespace-nowrap text-porcelain transition-colors duration-200 group-hover:text-white sm:text-[1.3125rem] lg:text-[1.4375rem]">
            {meta.wordmark}
          </span>
        </Link>

        <nav aria-label={nav.menuLabel} className="hidden min-w-0 lg:block">
          {/* A lista törhet: 200%-os szövegnagyításnál sem okoz vízszintes overflow-t. */}
          <ul className="flex flex-wrap items-center justify-end gap-x-1">
            {nav.items.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="jg-nav-item relative flex min-h-11 items-center rounded px-4 text-[0.9375rem] tracking-[0.005em] text-cool-silver transition-colors duration-200 hover:text-porcelain focus-visible:text-porcelain"
                >
                  {item.label}
                  {/* Hover/fókusz-jelölés: középről kifutó, hajszálvékony Berry sín. */}
                  <span
                    aria-hidden="true"
                    className="jg-nav-rail pointer-events-none absolute inset-x-4 bottom-[0.6875rem] h-px bg-signal-berry-light"
                  />
                </a>
              </li>
            ))}
            <li aria-hidden="true" className="mx-4 h-6 w-px bg-white/12" />
            <li>
              <Link
                href="/#kapcsolat"
                className="jg-header-cta flex min-h-11 items-center rounded-[0.5rem] bg-porcelain px-6 text-[0.9375rem] font-semibold tracking-[0.005em] text-ink hover:-translate-y-px hover:bg-white"
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
          className="flex h-11 min-w-11 shrink-0 items-center justify-center gap-2.5 rounded-[0.5rem] border border-white/20 bg-white/[0.04] px-3.5 text-sm font-medium text-porcelain transition-colors hover:border-white/35 hover:bg-white/[0.08] lg:hidden"
        >
          <span
            aria-hidden="true"
            className="flex h-3.5 w-[1.125rem] flex-col justify-between"
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
          className="border-t border-white/10 bg-surface-sink shadow-[0_24px_48px_-28px_rgb(0_0_0/90%)] lg:hidden"
        >
          <nav aria-label={nav.menuLabel}>
            <ul className="mx-auto w-full max-w-[1280px] px-5 pt-1 pb-4 sm:px-6">
              {nav.items.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="group flex min-h-14 items-center gap-3.5 border-b border-white/10 text-base text-porcelain"
                  >
                    <span
                      aria-hidden="true"
                      className="block h-px w-4 shrink-0 bg-white/25 transition-all duration-200 group-hover:w-7 group-hover:bg-signal-berry-light"
                    />
                    {item.label}
                  </a>
                </li>
              ))}
              <li className="pt-4">
                <Link
                  href="/#kapcsolat"
                  onClick={() => setOpen(false)}
                  className="jg-header-cta flex min-h-13 items-center justify-center rounded-[0.5rem] bg-porcelain px-4 text-base font-semibold text-ink"
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
