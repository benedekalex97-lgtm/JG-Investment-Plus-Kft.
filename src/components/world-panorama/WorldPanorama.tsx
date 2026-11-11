"use client";

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { gsap } from "gsap";
import type { Rig } from "./camera-path";
import type { Panorama, Projection } from "./engine";
import { PANEL_NOTE, PANEL_SUBTITLE, REGIONS, type RegionId } from "./markets";
import { INTRO_BEATS, INTRO_DURATION } from "./trading-day";

/**
 * WorldPanorama — „Világpiaci panoráma" a Hero mögött.
 *
 * Felelősségek:
 *   - a Hero szövege (children) VÁLTOZATLANUL szerveroldali HTML marad;
 *   - a 3D jelenet (engine.ts + three) dinamikus importtal, csak kliensen
 *     töltődik be; addig — és WebGL2 / hiba / context loss esetén — a
 *     jelenetből exportált statikus kép látszik;
 *   - három HTML-hotspot (a vetített városkoordinátán), egyetlen regionális
 *     panel, mozgásvezérlő.
 *
 * MOZGÁS-ÁLLAPOT: a kameraút akkor fut, ha EGYIK tiltó feltétel sem áll fenn:
 *   userChoice ("paused") / reducedMotion és tooSlow (ha a felhasználó nem
 *   indította el kifejezetten) / documentHidden / heroOutOfView /
 *   panelActive. Mindegyik külön
 *   állapot; egy feltétel megszűnése nem indítja el a kamerát, ha egy másik
 *   még fennáll (ld. syncRunning).
 *
 * PANEL: rámutatás (egér) → előnézet, a kamera megáll; elhagyáskor 250 ms
 * türelmi idő, a panelre lépés törli. Kattintás / Enter / Space / koppintás
 * → rögzített panel; bezárás: bezárógomb, Escape, másik régió, külső
 * kattintás. Egyszerre egy panel; régióváltáskor a tartalom vált.
 *
 * NYITÁNY (oldalbetöltésenként egyszer, csak ha az első élő kockánál a mozgás
 * engedélyezett és fut): egy GSAP-timeline ~2,4 s alatt végigvezet egy
 * impulzust New York → London → Tokió irányban (engine.setIntro), és ugyanezekre
 * az ütemekre jelennek meg a hotspotfeliratok (áttűnés + 6 px emelkedés). A
 * hotspotok az első élő kockától kattinthatók. Ha a kamera bármi miatt megáll
 * (rámutatás, koppintás, mozgásvezérlő, rejtett lap, kigördülés), a nyitány
 * azonnal, lágyan (0,3 s) lezárul. Reduced motion / tooSlow / fallback: nincs
 * nyitány, a feliratok azonnal látszanak.
 *
 * GÖRGETÉS: passzív scroll-figyelő, kockánként legfeljebb egy frissítés (a
 * gsap.tickeren, egyszeri hívással), csak amíg a Hero látható és a mozgás
 * engedélyezett — a kamera finoman emelkedik és hátrál (engine.setScroll).
 * Leállított mozgásnál (és reduced motion mellett) a kamera nem követi.
 */

type Mode = "loading" | "live" | "fallback";
type UserChoice = "auto" | "playing" | "paused";
type PanelPlacement = { left: number; top: number; anchorX: number; anchorY: number; edgeX: number; edgeY: number };
/** Doboz a színpad koordinátáiban (CSS px). */
type Box = { left: number; top: number; right: number; bottom: number };

const CLOSE_GRACE_MS = 250;

/**
 * WebGL2-képesség előzetes vizsgálata egy eldobható canvasszal, hogy a
 * three.js chunk se töltődjön be (és ne naplózzon hibát), ha nincs WebGL2.
 */
function hasWebGL2() {
  if (typeof WebGL2RenderingContext === "undefined") return false;
  try {
    const gl = document.createElement("canvas").getContext("webgl2");
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
    return gl !== null;
  } catch {
    return false;
  }
}
const HOTSPOT_HALF = 22; // 44 × 44 px érintési felület

const REGION_BY_ID = Object.fromEntries(REGIONS.map((r) => [r.id, r])) as Record<
  RegionId,
  (typeof REGIONS)[number]
>;
/* Nyugatról keletre — a billentyűzetes sorrend is ez. */
const ORDER: RegionId[] = ["americas", "europe", "asia"];

export default function WorldPanorama({ children }: { children: ReactNode }) {
  const panelId = useId();
  const titleId = useId();

  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const slotRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const connectorRef = useRef<SVGLineElement>(null);
  const etfRef = useRef<HTMLSpanElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const hotspotRefs = useRef<Partial<Record<RegionId, HTMLButtonElement | null>>>({});
  const fallbackRefs = useRef<Partial<Record<RegionId, HTMLButtonElement | null>>>({});

  const engineRef = useRef<Panorama | null>(null);
  const projectionRef = useRef<Projection | null>(null);
  const layoutRef = useRef({
    width: 0,
    height: 0,
    slotTop: 0,
    slotHeight: 0,
    /** Az ETF-felirat teteje a térképsávon belül (a panel e fölött marad). */
    etfTopInSlot: Infinity,
    /** Felületek, amelyeket a hotspot nem takarhat (ETF-felirat, mozgásvezérlő). */
    avoid: [] as Box[],
  });
  const runtimeRef = useRef({ hidden: false, inView: true });
  const closeTimer = useRef<number | null>(null);
  /* Programozott fókusz-visszaadás alatt a fókusz NEM nyit előnézetet. */
  const restoringFocus = useRef(false);

  const [mode, setMode] = useState<Mode>("loading");
  const [rig, setRig] = useState<Rig | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [userChoice, setUserChoice] = useState<UserChoice>("auto");
  /** Teljesítményvédelem: túl lassú renderelésnél az automatikus út leáll. */
  const [tooSlow, setTooSlow] = useState(false);
  const [active, setActive] = useState<RegionId | null>(null);
  const [pinned, setPinned] = useState(false);
  const [placement, setPlacement] = useState<PanelPlacement | null>(null);
  const activeRef = useRef<RegionId | null>(null);
  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  const motionAllowed = userChoice === "playing" || (userChoice === "auto" && !reducedMotion && !tooSlow);

  /* ---------------- Mozgás-állapot szinkron (egyetlen hely) ---------------- */
  const stateRef = useRef({ motionAllowed, active });
  useEffect(() => {
    stateRef.current = { motionAllowed, active };
  }, [motionAllowed, active]);

  /* ---------------- Nyitány (egyszer) ---------------- */
  const introPlayed = useRef(false);
  const introRef = useRef<gsap.core.Timeline | null>(null);
  const introFinishRef = useRef<gsap.core.Timeline | null>(null);
  const introProxy = useRef({ time: 0, gain: 1 });

  const introLabels = () =>
    ORDER.map((id) => hotspotRefs.current[id]?.querySelector<HTMLElement>(".wp-hotspot-label") ?? null);

  /** Leállítja a nyitányt (és a lezáró tweent), a feliratokat a CSS-re bízza. */
  const killIntro = useCallback(() => {
    introRef.current?.kill();
    introFinishRef.current?.kill();
    if (introRef.current || introFinishRef.current) {
      gsap.set(introLabels().filter((el): el is HTMLElement => el !== null), { clearProps: "all" });
    }
    introRef.current = null;
    introFinishRef.current = null;
  }, []);

  /**
   * Interakció (vagy bármilyen megállás) a nyitány alatt: azonnali, lágy
   * lezárás — a vászon-réteg 0,3 s alatt elhalkul, a feliratok 0,2 s alatt
   * teljesen megjelennek. Utána a kereskedési nap köre veszi át.
   */
  const finishIntro = useCallback(() => {
    const tl = introRef.current;
    if (!tl) return;
    tl.kill();
    introRef.current = null;
    const proxy = introProxy.current;
    const labels = introLabels().filter((el): el is HTMLElement => el !== null);
    introFinishRef.current = gsap
      .timeline({
        onComplete: () => {
          introFinishRef.current = null;
          engineRef.current?.setIntro(null);
          gsap.set(labels, { clearProps: "all" });
        },
      })
      .to(
        proxy,
        {
          gain: 0,
          duration: 0.3,
          ease: "power1.out",
          onUpdate: () => engineRef.current?.setIntro(proxy.time, proxy.gain),
        },
        0,
      )
      .to(labels, { autoAlpha: 1, y: 0, duration: 0.2, ease: "power1.out", overwrite: true }, 0);
  }, []);

  const syncRunning = useCallback(() => {
    const engine = engineRef.current;
    if (!engine) return;
    const { hidden, inView } = runtimeRef.current;
    const { motionAllowed: allowed, active: panel } = stateRef.current;
    const run = allowed && !hidden && inView && panel === null;
    engine.setRunning(run);
    if (!run) finishIntro();
  }, [finishIntro]);

  /* ---------------- Görgetéshez kötött kameraemelés ---------------- */
  /*
    Sorban áll-e már frissítés, és a sorban álló egyszeri ticker-hívás (a
    leiratkozáshoz). Külön jelző kell: ha a ticker alszik (autoSleep — pl.
    megállított kameránál), a gsap.ticker.add() felébreszti, és a hívást MÉG
    az add() visszatérése előtt lefuttathatja.
  */
  const scrollQueued = useRef(false);
  const scrollTick = useRef<gsap.TickerCallback | null>(null);
  const applyScroll = useCallback(() => {
    scrollQueued.current = false;
    scrollTick.current = null;
    const engine = engineRef.current;
    const root = rootRef.current;
    if (!engine || !root || !stateRef.current.motionAllowed || !runtimeRef.current.inView) return;
    const box = root.getBoundingClientRect();
    engine.setScroll(box.height > 0 ? -box.top / box.height : 0);
  }, []);
  /** Kockánként legfeljebb egy frissítés: egyszeri, előre sorolt gsap.ticker-hívás (nem saját loop). */
  const scheduleScroll = useCallback(() => {
    if (scrollQueued.current) return;
    scrollQueued.current = true;
    const tick = gsap.ticker.add(applyScroll, true, true);
    if (scrollQueued.current) scrollTick.current = tick; // ha már le is futott, nincs mit tárolni
  }, [applyScroll]);
  useEffect(() => {
    const onScroll = () => {
      if (runtimeRef.current.inView) scheduleScroll();
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (scrollTick.current) gsap.ticker.remove(scrollTick.current);
      scrollTick.current = null;
      scrollQueued.current = false;
    };
  }, [scheduleScroll]);
  // A Hero visszatérésekor / a mozgás engedélyezésekor a kamera felveszi az aktuális görgetést.
  useEffect(() => {
    if (mode === "live" && motionAllowed) scheduleScroll();
  }, [mode, motionAllowed, scheduleScroll]);

  useEffect(() => {
    syncRunning();
  }, [motionAllowed, active, mode, syncRunning]);

  /* ---------------- Rig (desktop / mobil) és reduced motion ---------------- */
  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1024px)");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      setRig(desktop.matches ? "desktop" : "mobile");
      setReducedMotion(reduce.matches);
    };
    update();
    desktop.addEventListener("change", update);
    reduce.addEventListener("change", update);
    return () => {
      desktop.removeEventListener("change", update);
      reduce.removeEventListener("change", update);
    };
  }, []);

  /* ---------------- Mérés (csak resize-kor, nem renderciklusban) ---------------- */
  const measure = useCallback(() => {
    const stage = stageRef.current;
    const slot = slotRef.current;
    if (!stage || !slot) return;
    const stageBox = stage.getBoundingClientRect();
    const slotBox = slot.getBoundingClientRect();
    const rel = (el: Element | null): Box | null => {
      if (!el) return null;
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height) return null;
      return { left: r.left - stageBox.left, top: r.top - stageBox.top, right: r.right - stageBox.left, bottom: r.bottom - stageBox.top };
    };
    const etf = rel(etfRef.current);
    layoutRef.current = {
      width: stageBox.width,
      height: stageBox.height,
      slotTop: slotBox.top - stageBox.top,
      slotHeight: slotBox.height,
      etfTopInSlot: etf ? etf.top - (slotBox.top - stageBox.top) : Infinity,
      avoid: [etf, rel(toggleRef.current)].filter((b): b is Box => b !== null),
    };
  }, []);

  const lensShiftFor = useCallback(() => {
    const { width, height, slotTop, slotHeight } = layoutRef.current;
    if (!height) return 0;
    // Mobil rig: a kompozíció kissé feljebb ül — kitölti a sáv felső részét,
    // alul (az ETF-felirat körül) nyugodtabb a felület; széles sávon (tablet)
    // erősebben, hogy a közelebbi (alsó) pont se fusson ki a sáv aljáról.
    if (slotTop === 0) return width / height > 1.2 ? -0.16 : -0.12;
    // Desktop: a térkép optikai középpontja a térképsáv felső részébe (36%)
    // essen — a három pont a teljes ciklusban a sávban marad, az ETF-feliratot
    // és a vezérlőt nem fedi (szimulációval ellenőrizve); a távoli
    // kontinensek a szöveg alsó része mögé futnak (ott a .wp-scrim nyugodtan
    // tartja a felületet), Afrika déli része a sáv aljára kerül.
    const centre = slotTop + slotHeight * 0.36;
    return Math.max(0, (2 * centre) / height - 1);
  }, []);

  /* ---------------- Vetített hotspotok — közvetlen DOM-frissítés ---------------- */
  const onProject = useCallback((projection: Projection) => {
    projectionRef.current = projection;
    const { width, height, slotTop, avoid } = layoutRef.current;
    const minY = slotTop + HOTSPOT_HALF + 4;
    const pad = HOTSPOT_HALF + 6;
    for (const id of ORDER) {
      const el = hotspotRefs.current[id];
      const p = projection[id];
      if (!el || !p) continue;
      // Az ETF-feliratot és a mozgásvezérlőt a hotspot nem takarhatja (és fordítva).
      const blocked = avoid.some(
        (b) => p.x > b.left - pad && p.x < b.right + pad && p.y > b.top - pad && p.y < b.bottom + pad,
      );
      const show =
        p.visible &&
        !blocked &&
        p.y >= minY &&
        p.y <= height - HOTSPOT_HALF - 4 &&
        p.x >= HOTSPOT_HALF &&
        p.x <= width - HOTSPOT_HALF;
      el.style.transform = `translate3d(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px, 0)`;
      const state = show ? "on" : "off";
      if (el.dataset.visible !== state) el.dataset.visible = state;
    }
    // A panel összekötő vonala a (megálló) hotspothoz igazodik.
    const line = connectorRef.current;
    const activeId = line?.dataset.region as RegionId | undefined;
    if (line && activeId && projection[activeId]) {
      line.setAttribute("x1", projection[activeId].x.toFixed(1));
      line.setAttribute("y1", (projection[activeId].y - slotTop).toFixed(1));
    }
  }, []);

  /*
    A hotspotok csak az első kocka után (mode === "live") kerülnek a DOM-ba,
    tehát az első vetítés idején még nem léteztek. Mountkor ezért a legutóbbi
    vetítést azonnal alkalmazzuk — álló kameránál (reduced motion, megállított
    mozgás) nincs következő kocka, ami ezt pótolná.
  */
  useLayoutEffect(() => {
    if (mode === "live" && projectionRef.current) onProject(projectionRef.current);
  }, [mode, onProject]);

  /*
    Nyitány: az első élő kockánál, festés ELŐTT (layout effect) döntünk —
    így a feliratok nem villannak fel. Oldalbetöltésenként egyszer; ha ekkor
    a mozgás nem engedélyezett vagy nem fut, a nyitány elmarad.
  */
  useLayoutEffect(() => {
    if (mode !== "live" || introPlayed.current) return;
    introPlayed.current = true;
    const engine = engineRef.current;
    const { hidden, inView } = runtimeRef.current;
    if (!engine || !motionAllowed || hidden || !inView || active !== null) return;
    const proxy = introProxy.current;
    proxy.time = 0;
    proxy.gain = 1;
    engine.setIntro(0, 1);
    const labels = introLabels();
    const present = labels.filter((el): el is HTMLElement => el !== null);
    gsap.set(present, { autoAlpha: 0, xPercent: -50, x: 0, y: 6 });
    const tl = gsap.timeline({
      onComplete: () => {
        introRef.current = null;
        engineRef.current?.setIntro(null);
        gsap.set(present, { clearProps: "all" });
      },
    });
    tl.to(
      proxy,
      {
        time: INTRO_DURATION,
        duration: INTRO_DURATION,
        ease: "none",
        onUpdate: () => engineRef.current?.setIntro(proxy.time, proxy.gain),
      },
      0,
    );
    labels.forEach((label, i) => {
      if (label) tl.to(label, { autoAlpha: 1, y: 0, duration: 0.5, ease: "power2.out" }, INTRO_BEATS[i]);
    });
    introRef.current = tl;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- csak az élővé váláskor dönt, egyszer
  }, [mode]);

  useEffect(() => () => killIntro(), [killIntro]);

  /* ---------------- Motor betöltése / újraépítése rigváltáskor ---------------- */
  useEffect(() => {
    if (!rig) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    let disposed = false;
    let engine: Panorama | null = null;

    (async () => {
      if (!hasWebGL2()) {
        setMode("fallback");
        return;
      }
      try {
        const [{ createPanorama }, landModule] = await Promise.all([
          import("./engine"),
          rig === "desktop" ? import("./data/land-desktop.json") : import("./data/land-mobile.json"),
        ]);
        if (disposed) return;
        measure();
        engine = createPanorama({
          canvas,
          rig,
          land: landModule.default,
          lensShift: lensShiftFor(),
          maxDpr: rig === "desktop" ? 1.5 : 1.25,
          maxPixels: rig === "desktop" ? 2_000_000 : 650_000,
          onProject,
          onFirstFrame: () => setMode("live"),
          onContextLost: () => {
            killIntro();
            engineRef.current = null;
            setMode("fallback");
          },
          onTooSlow: () => setTooSlow(true),
        });
        engineRef.current = engine;
        const { width, height } = layoutRef.current;
        engine.resize(width, height, lensShiftFor());
        syncRunning();
        scheduleScroll();
      } catch {
        if (!disposed) setMode("fallback");
      }
    })();

    return () => {
      disposed = true;
      killIntro();
      engineRef.current = null;
      engine?.dispose();
    };
  }, [rig, measure, lensShiftFor, onProject, syncRunning, scheduleScroll, killIntro]);

  /* ---------------- Méretváltozás, láthatóság, lapváltás ---------------- */
  useEffect(() => {
    const stage = stageRef.current;
    const root = rootRef.current;
    if (!stage || !root) return;
    const resizeObserver = new ResizeObserver(() => {
      measure();
      const { width, height } = layoutRef.current;
      engineRef.current?.resize(width, height, lensShiftFor());
    });
    resizeObserver.observe(stage);
    resizeObserver.observe(root);
    const viewObserver = new IntersectionObserver(([entry]) => {
      runtimeRef.current.inView = entry.isIntersecting;
      syncRunning();
      if (entry.isIntersecting) scheduleScroll();
    });
    viewObserver.observe(root);
    const onVisibility = () => {
      runtimeRef.current.hidden = document.hidden;
      syncRunning();
    };
    document.addEventListener("visibilitychange", onVisibility);
    onVisibility();
    return () => {
      resizeObserver.disconnect();
      viewObserver.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [measure, lensShiftFor, syncRunning, scheduleScroll]);

  /* ---------------- Panel: nyitás / zárás ---------------- */
  const clearCloseTimer = () => {
    if (closeTimer.current !== null) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  const open = useCallback((id: RegionId, pin: boolean) => {
    if (closeTimer.current !== null) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
    setActive(id);
    setPinned((was) => pin || was);
  }, []);

  const close = useCallback((returnFocus: boolean) => {
    if (closeTimer.current !== null) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
    const current = activeRef.current;
    if (current && returnFocus) {
      const hotspot = hotspotRefs.current[current];
      const target = hotspot?.dataset.visible === "on" ? hotspot : fallbackRefs.current[current] ?? hotspot;
      // A fókusz a panelt nyitó elemre tér vissza (a panel elrejtése után);
      // ez a fókusz nem nyitja újra a panelt.
      window.setTimeout(() => {
        restoringFocus.current = true;
        target?.focus();
        restoringFocus.current = false;
      }, 0);
    }
    setActive(null);
    setPinned(false);
    setPlacement(null);
  }, []);

  const scheduleClose = useCallback(() => {
    if (closeTimer.current !== null) window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => {
      closeTimer.current = null;
      close(false);
    }, CLOSE_GRACE_MS);
  }, [close]);

  // Escape és külső kattintás — csak nyitott panelnél.
  useEffect(() => {
    if (!active) return;
    const inWidget = (node: EventTarget | null) =>
      node instanceof Node &&
      (panelRef.current?.contains(node) ||
        ORDER.some((id) => hotspotRefs.current[id]?.contains(node) || fallbackRefs.current[id]?.contains(node)));
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      const focusInside = inWidget(document.activeElement);
      close(focusInside || pinned);
    };
    const onPointerDown = (event: PointerEvent) => {
      if (!inWidget(event.target)) close(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [active, pinned, close]);

  useEffect(() => () => clearCloseTimer(), []);

  /* Panel elhelyezése: nyitáskor EGYSZER mérünk (nem renderciklusban). */
  useLayoutEffect(() => {
    const panel = panelRef.current;
    if (!active || !panel) return;
    const { width, slotTop, slotHeight, etfTopInSlot } = layoutRef.current;
    const proj = projectionRef.current?.[active];
    if (rig !== "desktop" || mode !== "live" || !proj) {
      setPlacement(null); // CSS-alapú stabil elhelyezés (mobil / fallback)
      return;
    }
    const pw = panel.offsetWidth;
    const ph = panel.offsetHeight;
    const margin = 24;
    const gap = 56;
    const ax = proj.x;
    const ay = proj.y - slotTop;
    let left = ax + gap;
    if (left + pw > width - margin) left = ax - gap - pw;
    left = Math.max(margin, Math.min(left, width - margin - pw));
    // A panel alja az ETF-felirat fölött marad (12 px réssel).
    const floor = Math.min(slotHeight - 8, etfTopInSlot - 12);
    const top = Math.max(8, Math.min(ay - ph * 0.3, floor - ph));
    const edgeX = left > ax ? left : left + pw;
    const edgeY = Math.max(top + 28, Math.min(ay, top + ph - 28));
    setPlacement({ left, top, anchorX: ax, anchorY: ay, edgeX, edgeY });
  }, [active, rig, mode]);

  /* ---------------- Hotspot-kezelők ---------------- */
  const hotspotHandlers = (id: RegionId) => ({
    onPointerEnter: (event: React.PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      if (active !== id && pinned) return; // rögzített panelt hover nem vált
      open(id, false);
    },
    onPointerLeave: (event: React.PointerEvent) => {
      if (event.pointerType !== "mouse" || pinned) return;
      scheduleClose();
    },
    onFocus: (event: React.FocusEvent<HTMLButtonElement>) => {
      if (restoringFocus.current || !event.currentTarget.matches(":focus-visible")) return;
      if (pinned && active !== id) return;
      open(id, false);
    },
    onBlur: (event: React.FocusEvent<HTMLButtonElement>) => {
      const next = event.relatedTarget as Node | null;
      if (pinned || (next && panelRef.current?.contains(next))) return;
      if (next && ORDER.some((other) => hotspotRefs.current[other]?.contains(next))) return;
      close(false);
    },
    onClick: () => {
      if (active === id && pinned) close(false);
      else {
        setActive(id);
        setPinned(true);
        clearCloseTimer();
      }
    },
  });

  const region = active ? REGION_BY_ID[active] : null;
  const showHotspots = mode === "live";
  const showFallbackButtons = mode === "fallback";

  return (
    <div ref={rootRef} className="wp-root relative" data-mode={mode}>
      {/* 3D színpad: statikus kép (első festés / fallback) + canvas. */}
      <div ref={stageRef} aria-hidden="true" className="wp-stage pointer-events-none absolute">
        <picture>
          <source media="(min-width: 1024px)" srcSet="/hero/world-panorama-desktop.webp" />
          {/* Art direction: a statikus poszter a 3D jelenetből exportált kép (desktop / mobil). */}
          <img
            src="/hero/world-panorama-mobile.webp"
            alt=""
            className="wp-poster"
            decoding="async"
            fetchPriority="high"
          />
        </picture>
        <canvas key={rig ?? "none"} ref={canvasRef} className="wp-canvas" data-visible={mode === "live" ? "on" : "off"} />
      </div>
      <div aria-hidden="true" className="wp-scrim pointer-events-none absolute inset-0" />

      {/* A Hero szövege — szerveroldali HTML, a kamerától független. */}
      <div className="relative z-10">{children}</div>

      {/* Hotspot-réteg: a színpaddal azonos doboz, csak a gombok kattinthatók. */}
      {showHotspots ? (
        <div className="wp-hotspots pointer-events-none absolute">
          {ORDER.map((id) => {
            const r = REGION_BY_ID[id];
            return (
              <button
                key={id}
                ref={(el) => {
                  hotspotRefs.current[id] = el;
                }}
                type="button"
                className="wp-hotspot"
                data-visible="off"
                data-active={active === id ? "true" : undefined}
                aria-expanded={active === id}
                aria-controls={panelId}
                aria-label={`${r.city.name} — ${r.title}`}
                {...hotspotHandlers(id)}
              >
                <span aria-hidden="true" className="wp-hotspot-ring" />
                <span aria-hidden="true" className="wp-hotspot-label">
                  {r.city.name}
                </span>
              </button>
            );
          })}
        </div>
      ) : null}

      {/* Térképsáv: előre lefoglalt terület — itt él a panel, a vezérlő és a feliratok. */}
      <div ref={slotRef} className="wp-slot relative z-30">
        <div aria-hidden="true" className="wp-deco">
          <span className="wp-deco-item wp-deco--left">Részvények</span>
          <span className="wp-deco-item wp-deco--right">Kötvények</span>
          {/* Alul, középen, a jogi sáv fölött — a kamerától független, nem kattintható. */}
          <span ref={etfRef} className="wp-deco-item wp-deco--etf">
            ETF
          </span>
        </div>

        {showFallbackButtons ? (
          <div className="wp-fallback-regions">
            {ORDER.map((id) => {
              const r = REGION_BY_ID[id];
              return (
                <button
                  key={id}
                  ref={(el) => {
                    fallbackRefs.current[id] = el;
                  }}
                  type="button"
                  className="wp-fallback-button"
                  aria-expanded={active === id}
                  aria-controls={panelId}
                  onClick={() => (active === id ? close(false) : open(id, true))}
                >
                  {r.regionLabel} · {r.city.name}
                </button>
              );
            })}
          </div>
        ) : null}

        {placement ? (
          <svg aria-hidden="true" className="wp-connector">
            <line
              ref={connectorRef}
              data-region={active ?? undefined}
              x1={placement.anchorX}
              y1={placement.anchorY}
              x2={placement.edgeX}
              y2={placement.edgeY}
            />
          </svg>
        ) : null}

        <section
          ref={panelRef}
          id={panelId}
          aria-labelledby={titleId}
          hidden={!region}
          className="wp-panel"
          data-placed={placement ? "anchored" : "default"}
          style={placement ? { left: placement.left, top: placement.top } : undefined}
          onPointerEnter={(event) => {
            if (event.pointerType === "mouse") clearCloseTimer();
          }}
          onPointerLeave={(event) => {
            if (event.pointerType === "mouse" && !pinned) scheduleClose();
          }}
          onBlur={(event) => {
            const next = event.relatedTarget as Node | null;
            if (pinned || (next && event.currentTarget.contains(next))) return;
            if (next && ORDER.some((id) => hotspotRefs.current[id]?.contains(next))) return;
            close(false);
          }}
        >
          {region ? (
            <>
              {/* Mobilon a panel a térképsávot fedi: a régióváltás itt, a panelen belül érhető el. */}
              <div role="group" aria-label="Régió" className="wp-panel-regions">
                {ORDER.map((id) => (
                  <button
                    key={id}
                    type="button"
                    className="wp-panel-region"
                    aria-pressed={active === id}
                    onClick={() => {
                      setActive(id);
                      setPinned(true);
                      clearCloseTimer();
                    }}
                  >
                    {REGION_BY_ID[id].regionLabel}
                  </button>
                ))}
              </div>
              <div className="wp-panel-head">
                <p className="wp-panel-eyebrow">{region.regionLabel}</p>
                <h2 id={titleId} className="wp-panel-title">
                  {region.title}
                </h2>
                <p className="wp-panel-subtitle">{PANEL_SUBTITLE}</p>
                <button type="button" className="wp-panel-close" onClick={() => close(true)}>
                  <span className="sr-only">Panel bezárása</span>
                  <svg aria-hidden="true" viewBox="0 0 16 16" width="16" height="16">
                    <path d="M3 3l10 10M13 3L3 13" />
                  </svg>
                </button>
              </div>
              <ul className="wp-list">
                {region.listings.map((listing) => (
                  <li key={listing.ticker} className="wp-row">
                    <span className="wp-name">
                      {listing.name}
                      {listing.shareClass ? <span className="sr-only">, {listing.shareClass}</span> : null}
                    </span>
                    <span className="wp-ticker">
                      {listing.ticker}
                      <span className="sr-only"> ({listing.exchange})</span>
                    </span>
                  </li>
                ))}
              </ul>
              <p className="wp-panel-note">{PANEL_NOTE}</p>
            </>
          ) : null}
        </section>

        {mode !== "fallback" ? (
          <button
            ref={toggleRef}
            type="button"
            className="wp-motion-toggle"
            onClick={() => setUserChoice(motionAllowed ? "paused" : "playing")}
          >
            {motionAllowed ? "Mozgás leállítása" : "Mozgás indítása"}
          </button>
        ) : null}

        {/* JavaScript nélkül: natív HTML-lenyitók a három regionális listával. */}
        <noscript>
          <div className="wp-noscript">
            {REGIONS.map((r) => (
              <details key={r.id} className="wp-noscript-item">
                <summary>
                  {r.regionLabel} · {r.city.name}
                </summary>
                <p className="wp-panel-subtitle">
                  {r.title} — {PANEL_SUBTITLE}
                </p>
                <ul className="wp-list">
                  {r.listings.map((listing) => (
                    <li key={listing.ticker} className="wp-row">
                      <span className="wp-name">{listing.name}</span>
                      <span className="wp-ticker">{listing.ticker}</span>
                    </li>
                  ))}
                </ul>
                <p className="wp-panel-note">{PANEL_NOTE}</p>
              </details>
            ))}
          </div>
        </noscript>
      </div>
    </div>
  );
}
