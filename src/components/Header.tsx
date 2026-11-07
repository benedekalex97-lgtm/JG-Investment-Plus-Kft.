"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type FocusEvent as ReactFocusEvent,
} from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { nav } from "@/content/homepage";
import ContactCta, { CtaArrow } from "./ContactCta";
import Logo from "./Logo";

gsap.registerPlugin(useGSAP);

/**
 * Header — v2.0 „JG Editorial Signature".
 *
 * KOMPOZÍCIÓ (a teljes vizuális rendszer: globals.css, HEADER — v2.0)
 *   márkablokk | függőleges hajszálvonal | navigáció … CTA
 *
 *   - A márka a Logo System v1.0 horizontal lockupja, nagyobb méretben
 *     (desktopon 40 px-es jel). A lockup arányai a Logo komponensből jönnek;
 *     itt csak a betűméret (= a lockup skálája) változik.
 *   - Navigáció: a négy felirat sorszám nélkül (v2.1: a korábbi 01–04
 *     sorszámok a desktop és a mobil navigációból is kikerültek).
 *   - Aktív állapot: az éppen olvasott szakasz menüpontja Porcelain
 *     feliratot és aria-current="location"-t kap (mobilmenüben Berry
 *     nyilat); desktopon alatta a
 *     header alsó vonalán egy 2 : 1-es rombusz jelöl. Hoverre / billentyűzetes
 *     fókuszra a jelölő az adott pontra csúszik, elhagyáskor visszatér.
 *
 * MOZGÁS (GSAP, useGSAP + scope, teljes cleanup)
 *   - nav: a jelölő x-pozíciója;
 *   - CTA: a közös ContactCta komponens saját mikrointerakciója (a nyíl
 *     szára megnyúlik, a hegye előre lép, a lemez tónusosodik);
 *   - mobilmenü: GSAP timeline (háttér kifutása felülről, a sorok rövid
 *     staggerrel, az ikon két vonala 1 : 2 lejtésű X-be fordul). Záráskor a
 *     timeline visszajátszik, a panel csak a végén kerül ki a DOM-ból.
 *   Nincs belépő animáció és nincs folyamatosan futó mozgás. Minden
 *   eseménykezelőből indított tween contextSafe; prefers-reduced-motion
 *   esetén minden időtartam 0 — a működés ugyanaz, csak mozgás nélkül.
 *
 * SCROLL-STATE: egyetlen IntersectionObserver egy oldaltetejei sentinelen;
 *   csak az árnyékréteg opacity-je vált (ld. .jg-header::after). Az aktív
 *   szakaszt szintén IntersectionObserver adja — nincs scroll-figyelő, nincs
 *   ScrollTrigger.
 *
 * MÉRETEK: a külső magasság PONTOSAN 72 px (mobil) és 80 px (≥ 1024 px) —
 *   erre épül a html { scroll-padding-top }. Minden vonal box-shadow,
 *   pszeudo-elem vagy abszolút pozicionált elem, nem ad magasságot.
 *
 * MOBILMENÜ: NEM modális, lenyitható navigáció (disclosure), mint a v1.4-ben:
 *   aria-expanded + aria-controls (csak amíg a panel a DOM-ban van), Escape
 *   zár és a gombra viszi a fókuszt, a menün kívüli fókusz vagy kattintás
 *   zár, a panel a header alatt lebeg (nem tolja el a tartalmat). Záró
 *   animáció alatt a panel `inert`, tehát billentyűzettel már nem érhető el;
 *   bezárt állapotban nincs is a DOM-ban.
 */

const CTA_LABEL = "Kapcsolatfelvétel";
const CTA_HREF = "/#kapcsolat";

const ITEMS = nav.items.map((item) => ({
  ...item,
  id: item.href.split("#")[1] ?? "",
}));
const SECTION_IDS: readonly string[] = ITEMS.map((item) => item.id);

/** Szomszédos, menüpont nélküli szakaszok: Hero (#top) és Kapcsolat. */
const BOUNDARY_IDS = ["top", CTA_HREF.split("#")[1]];

/* Csak kliensoldalon, effektből vagy eseménykezelőből hívva. */
const reducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const dur = (seconds: number) => (reducedMotion() ? 0 : seconds);

/**
 * A jelölő a header alsó vonalán, a cél menüpont felirata alá csúszik.
 * `target === null` → elrejtés. Kizárólag transform és opacity.
 */
function moveMarker(
  marker: HTMLElement | null,
  target: HTMLElement | null,
  instant = false,
) {
  if (!marker) return;
  const host = marker.offsetParent as HTMLElement | null; // null, ha rejtett (mobil)
  const shown = marker.dataset.shown === "true";

  if (!target || !host) {
    if (shown) {
      marker.dataset.shown = "false";
      gsap.to(marker, {
        autoAlpha: 0,
        duration: instant ? 0 : dur(0.2),
        ease: "power1.out",
        overwrite: "auto",
      });
    }
    return;
  }

  const label = target.querySelector<HTMLElement>("[data-nav-label]") ?? target;
  const box = label.getBoundingClientRect();
  const hostBox = host.getBoundingClientRect();
  const x = box.left - hostBox.left + box.width / 2 - marker.offsetWidth / 2;
  marker.dataset.shown = "true";

  if (!shown || instant) {
    gsap.set(marker, { x });
    gsap.to(marker, {
      autoAlpha: 1,
      duration: instant ? 0 : dur(0.24),
      ease: "power1.out",
      overwrite: "auto",
    });
  } else {
    gsap.to(marker, {
      x,
      autoAlpha: 1,
      duration: dur(0.5),
      ease: "power3.out",
      overwrite: "auto",
    });
  }
}

/** Az aktuálisan olvasott szakasz (csak a nav szakaszai közül), vagy null. */
function useActiveSection() {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const observed = [BOUNDARY_IDS[0], ...SECTION_IDS, BOUNDARY_IDS[1]]
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    // A jogi aloldalakon nincsenek ilyen szakaszok: nincs aktív állapot.
    if (!observed.some((el) => SECTION_IDS.includes(el.id))) return;

    const inBand = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) inBand.add(entry.target.id);
          else inBand.delete(entry.target.id);
        }
        // Az olvasósávot (a viewport ~38–40%-a) metsző legalsó szakasz.
        const current =
          [...observed].reverse().find((el) => inBand.has(el.id))?.id ?? null;
        setActive(current && SECTION_IDS.includes(current) ? current : null);
      },
      { rootMargin: "-38% 0px -60% 0px" },
    );
    observed.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return active;
}

/** Igaz, ha az oldal már nincs a legtetején (sentinel alapján). */
function useScrolled() {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(([entry]) =>
      setScrolled(!entry.isIntersecting),
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  return { sentinelRef, scrolled };
}

export default function Header() {
  // `open` = logikai állapot (aria-expanded); `rendered` = a panel a DOM-ban
  // van-e. Záráskor `open` azonnal false, `rendered` csak az animáció végén.
  const [open, setOpen] = useState(false);
  const [rendered, setRendered] = useState(false);
  const panelId = useId();
  const active = useActiveSection();
  const { sentinelRef, scrolled } = useScrolled();

  const rootRef = useRef<HTMLElement>(null);
  const navListRef = useRef<HTMLUListElement>(null);
  const markerRef = useRef<HTMLSpanElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const panelTl = useRef<gsap.core.Timeline | null>(null);

  /*
    Jelölő követi a méretváltozásokat (ablakméret, webfont-csere): a pozíció
    ilyenkor animáció nélkül igazodik. A ResizeObserver a context része,
    unmountkor bontjuk.
  */
  const { contextSafe } = useGSAP(
    (_context, safe) => {
      const list = navListRef.current;
      const root = rootRef.current;
      if (!list || !root || !safe) return;
      const realign = safe(() => {
        const current = list.querySelector<HTMLElement>("a[aria-current]");
        if (markerRef.current?.dataset.shown === "true" || current) {
          moveMarker(markerRef.current, current, true);
        }
      });
      const observer = new ResizeObserver(realign);
      observer.observe(list);
      observer.observe(root);
      return () => observer.disconnect();
    },
    { scope: rootRef },
  );

  // Aktív szakasz változása → a jelölő az aktív pontra (ha épp nem hover/fókusz
  // vezérli).
  useGSAP(
    () => {
      const list = navListRef.current;
      if (!list || list.matches(":hover") || list.contains(document.activeElement)) {
        return;
      }
      const link = active
        ? list.querySelector<HTMLElement>(`a[href$="#${active}"]`)
        : null;
      moveMarker(markerRef.current, link);
    },
    { scope: rootRef, dependencies: [active] },
  );

  // Mobilmenü timeline — újraépül, valahányszor a panel bekerül a DOM-ba.
  useGSAP(
    () => {
      if (!rendered || !panelRef.current) return;
      const k = reducedMotion() ? 0 : 1;
      panelTl.current = gsap
        .timeline({ defaults: { ease: "power3.out" } })
        .fromTo(
          ".jg-menu-bg",
          { scaleY: 0 },
          { scaleY: 1, duration: 0.42 * k, transformOrigin: "50% 0%" },
          0,
        )
        .from(
          ".jg-menu-item",
          { autoAlpha: 0, y: 10, duration: 0.36 * k, stagger: 0.045 * k },
          0.1 * k,
        )
        .to(".jg-toggle-a", { y: 3, rotation: 26.565, duration: 0.3 * k }, 0)
        .to(".jg-toggle-b", { y: -3, rotation: -26.565, duration: 0.3 * k }, 0);
      return () => {
        panelTl.current = null;
      };
    },
    { scope: rootRef, dependencies: [rendered], revertOnUpdate: true },
  );

  /*
    Eseménykezelők. A ref-olvasó függvényeket hívásidőben csomagoljuk
    contextSafe-be (nem render közben — React 19 react-hooks/refs). A
    contextSafe identitása stabil, így useCallback-függőségként használható.
  */
  const navHover = useCallback(
    (link: HTMLElement, on: boolean) =>
      contextSafe(() => {
        if (on) moveMarker(markerRef.current, link);
      })(),
    [contextSafe],
  );

  const navRelease = useCallback(
    () =>
      contextSafe(() => {
        const current =
          navListRef.current?.querySelector<HTMLElement>("a[aria-current]") ?? null;
        moveMarker(markerRef.current, current);
      })(),
    [contextSafe],
  );

  const openMenu = () =>
    contextSafe(() => {
      setOpen(true);
      if (rendered && panelTl.current) {
        // Zárás közbeni újranyitás: ugyanaz a timeline fordul vissza.
        panelTl.current.eventCallback("onReverseComplete", null).timeScale(1).play();
      } else {
        setRendered(true);
      }
    })();

  const closeMenu = useCallback(
    (instant = false) =>
      contextSafe(() => {
        setOpen(false);
        const tl = panelTl.current;
        if (!tl || instant || reducedMotion()) {
          setRendered(false);
          return;
        }
        tl.eventCallback("onReverseComplete", () => setRendered(false))
          .timeScale(1.3)
          .reverse();
      })(),
    [contextSafe],
  );

  // Billentyűzet, fókusz és külső kattintás — a v1.4 viselkedése változatlan.
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

    // A navigáción kívülre lépő fókusz zárja a panelt; a fókuszt nem mozgatjuk.
    function onFocusIn(event: FocusEvent) {
      if (!inMenu(event.target)) closeMenu();
    }

    // Külső kattintás/érintés: ha a lenyomás ÉS a felengedés is a menün kívül
    // történt. Érintős görgetésnél pointercancel jön, így a görgetés nem zár.
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

    // Asztali szélességen a panel és a gomb rejtett: azonnal zárunk.
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

  const onNavFocus = (event: ReactFocusEvent<HTMLAnchorElement>) => {
    if (event.currentTarget.matches(":focus-visible")) navHover(event.currentTarget, true);
  };
  const onNavBlur = (event: ReactFocusEvent<HTMLAnchorElement>) => {
    navHover(event.currentTarget, false);
    // Ha a fókusz nem egy másik menüpontra lép tovább, a jelölő visszatér.
    if (!navListRef.current?.contains(event.relatedTarget as Node | null)) navRelease();
  };

  return (
    <>
      {/* Scroll-state sentinel: az oldal legtetején, nem foglal helyet. */}
      <div
        ref={sentinelRef}
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-0 h-px w-px"
      />

      <header
        ref={rootRef}
        data-scrolled={scrolled ? "true" : undefined}
        className="jg-header on-dark sticky top-0 z-50"
      >
        <div className="jg-safe-x mx-auto flex h-[72px] w-full max-w-[1280px] items-stretch lg:h-20">
          {/*
            Márkablokk — Logo System v1.0 horizontal lockup. A lockup a
            betűmérettel skálázódik: 12 px (mobil, 30 px-es jel), 13 px
            (640–1279), 16 px (≥ 1280, 40 px-es jel). 1024–1279 között a nav
            és a CTA belső térközei is szűkebbek, hogy egy sorban elférjenek.
            375 px alatt csak a jel látszik (a wordmark sr-only marad, így a
            link neve változatlanul „JG Investment Plus").
          */}
          {/*
            Sima <a> (nem next/link): ismételt kattintásra is a lap tetejére
            görget — a Next routere ugyanarra a hash-re másodszor nem görget.
          */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- szándékos horgonylink, ld. fent */}
          <a
            href="/#top"
            className="group flex min-h-11 shrink-0 items-center self-center rounded"
          >
            <Logo
              variant="horizontal"
              theme="dark"
              className="text-[0.75rem] transition-colors duration-200 group-hover:text-white sm:text-[0.8125rem] xl:text-[1rem]"
              wordmarkClassName="max-[374px]:sr-only"
            />
          </a>

          {/* Masthead-tagolás: teljes magasságú függőleges hajszálvonal. */}
          <span
            aria-hidden="true"
            className="mx-5 hidden w-px shrink-0 bg-porcelain/10 lg:block xl:mx-10"
          />

          <nav aria-label={nav.menuLabel} className="hidden min-w-0 flex-1 items-center lg:flex">
            <ul
              ref={navListRef}
              onPointerLeave={navRelease}
              className="-ml-2.5 flex items-center xl:-ml-4"
            >
              {ITEMS.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    aria-current={active === item.id ? "location" : undefined}
                    onPointerEnter={(e) => navHover(e.currentTarget, true)}
                    onPointerLeave={(e) => {
                      if (!e.currentTarget.matches(":focus-visible")) {
                        navHover(e.currentTarget, false);
                      }
                    }}
                    onFocus={onNavFocus}
                    onBlur={onNavBlur}
                    className="group flex min-h-11 items-center rounded px-2.5 whitespace-nowrap text-cool-silver transition-colors duration-200 hover:text-porcelain focus-visible:text-porcelain aria-[current=location]:text-porcelain xl:px-4"
                  >
                    <span data-nav-label="" className="text-[0.875rem] tracking-[0.005em] xl:text-[0.9375rem]">
                      {item.label}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="hidden shrink-0 items-center lg:flex">
            <ContactCta
              href={CTA_HREF}
              label={CTA_LABEL}
              className="min-h-11 gap-3 pr-3.5 pl-4 text-[0.875rem] xl:gap-5 xl:pr-[1.125rem] xl:pl-5 xl:text-[0.9375rem]"
            />
          </div>

          {/*
            Mobil menügomb — a header jobb oldali „cellája" (bal oldali
            hajszálvonallal), teljes sávmagasságú érintési felülettel. A két
            felirat egymásra rakva foglal helyet, így a nyitás/zárás nem
            változtatja a gomb szélességét.
          */}
          <button
            ref={toggleRef}
            type="button"
            onClick={() => (open ? closeMenu() : openMenu())}
            aria-expanded={open}
            aria-controls={rendered ? panelId : undefined}
            aria-label={open ? nav.closeMenuAccessible : nav.openMenuAccessible}
            className="relative ml-auto flex shrink-0 items-center gap-3 self-stretch pl-5 text-[0.9375rem] font-medium text-porcelain before:absolute before:inset-y-0 before:left-0 before:w-px before:bg-porcelain/10 focus-visible:outline-offset-[-6px] lg:hidden"
          >
            <span aria-hidden="true" className="grid text-left">
              <span className={`col-start-1 row-start-1 ${open ? "invisible" : ""}`}>
                {nav.openMenu}
              </span>
              <span className={`col-start-1 row-start-1 ${open ? "" : "invisible"}`}>
                {nav.closeMenu}
              </span>
            </span>
            <span aria-hidden="true" className="relative block h-3.5 w-[1.125rem]">
              <span className="jg-toggle-a absolute top-1 left-0 block h-px w-full bg-porcelain" />
              <span className="jg-toggle-b absolute top-2.5 left-0 block h-px w-full bg-porcelain" />
            </span>
          </button>
        </div>

        {/* Aktív szakasz-jelölő (desktop), a header alsó hajszálvonalán. */}
        <span
          ref={markerRef}
          aria-hidden="true"
          className="jg-nav-marker pointer-events-none absolute left-0 hidden lg:block"
        />

        {/*
          Mobilpanel — csak nyitva (és a záróanimáció végéig) van a DOM-ban. A
          header alatt lebeg (absolute, top-full), nem tolja el a tartalmat. A
          háttér külön rétegen fut ki (scaleY), a görgethető tartalom fölötte.
          A háttér a Sink tónus (a Deep-nél sötétebb): így a sötét szakaszok
          fölött is elválik az oldaltól (Porcelain rajta 16.85:1, AAA);
          a magasság a header alatti képernyőhelyre korlátozott, alacsony
          viewporton / nagy szövegnagyításnál belül görgethető.
        */}
        {rendered ? (
          <div
            ref={panelRef}
            id={panelId}
            inert={!open}
            className="absolute inset-x-0 top-full lg:hidden"
          >
            <div
              aria-hidden="true"
              className="jg-menu-bg absolute inset-0 bg-surface-sink shadow-[0_28px_48px_-30px_rgb(0_0_0/90%),inset_0_-1px_0_0_rgb(244_243_241/10%)]"
            />
            <div className="relative max-h-[calc(100svh-72px)] scroll-py-2 overflow-y-auto overscroll-contain">
              <nav aria-label={nav.menuLabel}>
                <ul className="jg-safe-x mx-auto w-full max-w-[1280px] pt-2 pb-7">
                  {ITEMS.map((item) => (
                    <li key={item.href} className="jg-menu-item border-b border-porcelain/10">
                      <a
                        href={item.href}
                        onClick={() => closeMenu()}
                        aria-current={active === item.id ? "location" : undefined}
                        className="group grid min-h-16 grid-cols-[1fr_auto] items-center gap-y-1 py-3 text-porcelain"
                      >
                        <span className="font-display text-[1.5rem] leading-[1.15] tracking-[-0.01em] sm:text-[1.75rem]">
                          {item.label}
                        </span>
                        <CtaArrow className="ml-4 text-cool-silver/60 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-porcelain group-aria-[current=location]:text-signal-berry-light" />
                      </a>
                    </li>
                  ))}
                  <li className="jg-menu-item pt-7">
                    <ContactCta
                      href={CTA_HREF}
                      label={CTA_LABEL}
                      onClick={() => closeMenu()}
                      className="min-h-14 w-full px-5 text-base"
                    />
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        ) : null}
      </header>
    </>
  );
}
