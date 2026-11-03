"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { nav } from "@/content/homepage";
import Logo from "@/components/Logo";

gsap.registerPlugin(useGSAP);

// Csak kliensoldalon, eseménykezelőből / useGSAP-ból hívva.
const reducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Header v2.0 — PROTOTÍPUS (GSAP). NEM a production header.
 *
 * A production header (src/components/Header.tsx) érintetlen; ez a komponens
 * csak a /prototipusok/header-v2 oldalon él, ami production buildben 404.
 *
 * Felépítés és méretek megegyeznek a v1.4 headerrel (72 / 80 px, ugyanaz a
 * .jg-header felület), csak a mozgás GSAP-alapú:
 *   1) belépés: logó + nav itemek finom, staggerelt beúszása;
 *   2) nav sín: a Berry sín scaleX-e GSAP tweennel, hoverre és fókuszra;
 *   3) mobilpanel: clip-path nyitás/zárás timeline, staggerelt linkekkel;
 *      záráskor a timeline visszajátszik, a panel csak utána kerül ki a DOM-ból.
 *
 * Cleanup:
 *   - minden animáció useGSAP()-ban vagy contextSafe()-ben jön létre, így
 *     unmountkor (és StrictMode dupla futásakor) a context mindent revertál;
 *   - minden selector a rootRef scope-ra korlátozott;
 *   - prefers-reduced-motion: reduce esetén nincs belépés, a sín és a panel
 *     azonnal vált (duration 0).
 */
export default function HeaderV2Prototype() {
  // `open` = logikai állapot (aria-expanded); `rendered` = a panel a DOM-ban
  // van-e. Záráskor `open` azonnal false, `rendered` csak az animáció végén.
  const [open, setOpen] = useState(false);
  const [rendered, setRendered] = useState(false);
  const panelId = useId();
  const rootRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const panelTl = useRef<gsap.core.Timeline | null>(null);

  // 1) Belépés — egyszer, mountkor.
  const { contextSafe } = useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(".hv2-intro", {
          autoAlpha: 0,
          y: -6,
          duration: 0.5,
          ease: "power2.out",
          stagger: 0.05,
          delay: 0.05,
        });
      });
    },
    { scope: rootRef },
  );

  // 3) Mobilpanel timeline — minden alkalommal újraépül, amikor a panel bekerül.
  useGSAP(
    () => {
      if (!rendered || !panelRef.current) return;
      const duration = reducedMotion() ? 0 : 1;
      panelTl.current = gsap
        .timeline({ defaults: { ease: "power3.out" } })
        .fromTo(
          panelRef.current,
          { clipPath: "inset(0% 0% 100% 0%)" },
          { clipPath: "inset(0% 0% 0% 0%)", duration: 0.34 * duration },
        )
        .from(
          ".hv2-panel-item",
          { autoAlpha: 0, y: -8, duration: 0.24 * duration, stagger: 0.04 * duration },
          "<0.08",
        );
      return () => {
        panelTl.current = null;
      };
    },
    { scope: rootRef, dependencies: [rendered], revertOnUpdate: true },
  );

  // 2) Nav sín — eseménykezelőből indul, ezért contextSafe.
  const rail = contextSafe((target: EventTarget, show: boolean) => {
    const el = (target as HTMLElement).querySelector(".hv2-rail");
    if (!el) return;
    gsap.to(el, {
      scaleX: show ? 1 : 0,
      duration: reducedMotion() ? 0 : 0.26,
      ease: "power2.out",
      overwrite: "auto",
    });
  });

  // A ref-olvasó kezelőket csak hívásidőben csomagoljuk contextSafe-be
  // (nem render közben) — így a React 19 react-hooks/refs szabálya is teljesül.
  const openMenu = () =>
    contextSafe(() => {
      setOpen(true);
      if (rendered && panelTl.current) {
        // Zárás közbeni újranyitás: a timeline megfordul, a panel marad.
        panelTl.current.eventCallback("onReverseComplete", null).play();
      } else {
        setRendered(true);
      }
    })();

  // A contextSafe identitása stabil (useRef a @gsap/react-ben), így a
  // closeMenu is az: a lenti useEffect nem csatol újra minden renderkor.
  const closeMenu = useCallback(
    (instant = false) =>
      contextSafe(() => {
        setOpen(false);
        const tl = panelTl.current;
        if (!tl || instant || reducedMotion()) {
          setRendered(false);
          return;
        }
        tl.eventCallback("onReverseComplete", () => setRendered(false)).reverse();
      })(),
    [contextSafe],
  );

  // Billentyűzet, fókusz és külső kattintás — a v1.4 header viselkedése.
  useEffect(() => {
    if (!open) return;

    const inMenu = (node: EventTarget | null) =>
      node instanceof Node &&
      (toggleRef.current?.contains(node) || panelRef.current?.contains(node));

    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      closeMenu();
      toggleRef.current?.focus();
    }
    function onFocusIn(event: FocusEvent) {
      if (!inMenu(event.target)) closeMenu();
    }
    let downOutside = false;
    function onPointerDown(event: PointerEvent) {
      downOutside = !inMenu(event.target);
    }
    function onPointerUp(event: PointerEvent) {
      if (downOutside && !inMenu(event.target)) closeMenu();
      downOutside = false;
    }
    function onPointerCancel() {
      downOutside = false;
    }
    const desktop = window.matchMedia("(min-width: 1024px)");
    function onBreakpoint(event: MediaQueryListEvent) {
      if (event.matches) closeMenu(true);
    }

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("focusin", onFocusIn);
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("pointerup", onPointerUp);
    document.addEventListener("pointercancel", onPointerCancel);
    desktop.addEventListener("change", onBreakpoint);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("focusin", onFocusIn);
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("pointerup", onPointerUp);
      document.removeEventListener("pointercancel", onPointerCancel);
      desktop.removeEventListener("change", onBreakpoint);
    };
  }, [open, closeMenu]);

  return (
    <header
      ref={rootRef}
      data-prototype="header-v2"
      className="jg-header on-dark sticky top-0 z-50"
    >
      <div className="jg-safe-x mx-auto flex h-[72px] w-full max-w-[1280px] items-center justify-between gap-x-10 lg:h-20">
        <Link
          href="/#top"
          className="hv2-intro group flex min-h-11 shrink-0 items-center rounded"
        >
          <Logo
            variant="horizontal"
            theme="dark"
            className="text-[0.6875rem] transition-colors duration-200 group-hover:text-white sm:text-[0.8125rem] lg:text-[0.78125rem] xl:text-[0.875rem]"
            wordmarkClassName="max-[374px]:sr-only"
          />
        </Link>

        <nav aria-label={nav.menuLabel} className="hidden min-w-0 lg:block">
          <ul className="flex flex-wrap items-center justify-end gap-x-1">
            {nav.items.map((item) => (
              <li key={item.href} className="hv2-intro">
                <a
                  href={item.href}
                  onPointerEnter={(e) => rail(e.currentTarget, true)}
                  onPointerLeave={(e) => {
                    // Billentyűzetes fókusz alatt a sín marad.
                    if (!e.currentTarget.matches(":focus-visible")) {
                      rail(e.currentTarget, false);
                    }
                  }}
                  onFocus={(e) => {
                    if (e.currentTarget.matches(":focus-visible")) {
                      rail(e.currentTarget, true);
                    }
                  }}
                  onBlur={(e) => rail(e.currentTarget, false)}
                  className="relative flex min-h-11 items-center rounded px-4 text-[0.9375rem] tracking-[0.005em] text-cool-silver transition-colors duration-200 hover:text-porcelain focus-visible:text-porcelain max-[1080px]:px-3"
                >
                  {item.label}
                  <span
                    aria-hidden="true"
                    className="hv2-rail pointer-events-none absolute inset-x-4 bottom-[0.6875rem] h-px origin-center scale-x-0 bg-signal-berry-light max-[1080px]:inset-x-3"
                  />
                </a>
              </li>
            ))}
            <li aria-hidden="true" className="hv2-intro mx-4 h-6 w-px bg-white/12 max-[1080px]:mx-3" />
            <li className="hv2-intro">
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
          onClick={() => (open ? closeMenu() : openMenu())}
          aria-expanded={open}
          aria-controls={rendered ? panelId : undefined}
          aria-label={open ? nav.closeMenuAccessible : nav.openMenuAccessible}
          className="hv2-intro flex h-11 min-w-11 shrink-0 items-center justify-center gap-2.5 rounded-[0.5rem] border border-white/20 bg-white/[0.04] px-3.5 text-sm font-medium text-porcelain transition-colors hover:border-white/35 hover:bg-white/[0.08] lg:hidden"
        >
          <span aria-hidden="true" className="flex h-3.5 w-[1.125rem] flex-col justify-between">
            <span className="block h-px w-full bg-porcelain" />
            <span className="block h-px w-full bg-porcelain" />
            <span className="block h-px w-full bg-porcelain" />
          </span>
          {open ? nav.closeMenu : nav.openMenu}
        </button>
      </div>

      {rendered ? (
        <div
          ref={panelRef}
          id={panelId}
          // Zárás közben (animáció alatt) a panel már nem fókuszálható.
          inert={!open}
          className="absolute inset-x-0 top-full max-h-[calc(100svh-72px)] scroll-py-2 overflow-y-auto overscroll-contain border-t border-white/10 bg-surface-sink shadow-[0_24px_48px_-28px_rgb(0_0_0/90%)] lg:hidden"
        >
          <nav aria-label={nav.menuLabel}>
            <ul className="jg-safe-x mx-auto w-full max-w-[1280px] pt-1.5 pb-3.5">
              {nav.items.map((item) => (
                <li key={item.href} className="hv2-panel-item">
                  <a
                    href={item.href}
                    onClick={() => closeMenu(true)}
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
              <li className="hv2-panel-item pt-4">
                <Link
                  href="/#kapcsolat"
                  onClick={() => closeMenu(true)}
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
