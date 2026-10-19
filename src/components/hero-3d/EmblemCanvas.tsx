"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import type { EmblemEngine, EmblemLayout } from "./engine";

/**
 * EmblemCanvas — a valódi, böngészőben renderelt 3D JG-embléma.
 *
 * Egyetlen canvas és egyetlen WebGL-renderer adja a nyitójelenetet ÉS a kész
 * herót (nincs canvascsere, nincs második objektum). A three.js-t tartalmazó
 * `engine` modul dinamikus importtal, csak itt, csak a böngészőben töltődik.
 *
 * ELHELYEZÉS: a canvas portálon át közvetlenül a <body> alatt, abszolút
 * pozícióval, DOKUMENTUM-koordinátákban áll (a body/html nem pozicionált,
 * nincs rajtuk transform). Így a hero `overflow-hidden` szekciója és a slot
 * sem vágja le, és a nyitás alatt a nyitóháttér (z 60) fölé emelhető
 * (z 61), utána a sticky fejléc (z 50) alá kerül (z 40). A canvas a lappal
 * együtt görög, görgetéskor nem kell újrarajzolni. Helye és mérete a hero-
 * slot (és a nyitás alatt a képernyő közepe) tényleges DOM-méreteiből jön.
 *
 * Mikor NEM indul 3D (a statikus PNG-tartalék marad):
 *   – prefers-reduced-motion, adatforgalom-kímélő / 2G–3G hálózat;
 *   – nincs WebGL, renderer-/modellhiba, context loss (újrapróbálás nincs);
 *   – a hero még messze van a látómezőtől (mélyhivatkozás) — ilyenkor csak
 *     a közelébe érve töltődik.
 *
 * Nyitás: csak ha a főoldali vezérlő (window.jgHeroIntro) nyitóképernyővel
 * várja. Különben a kész póz jelenik meg rövid áttűnéssel a PNG helyén.
 */

type IntroApi = {
  state: string;
  intro: boolean;
  lock: () => void;
  play: () => boolean;
  flight: () => void;
  complete: () => void;
  release: () => void;
  fail: (reason: string) => void;
  subscribe: (fn: (result: string) => void) => () => void;
};

type Props = {
  /** A PNG-tartalék elrejtése / megmutatása. */
  onLiveChange: (live: boolean) => void;
};

const MODEL_URL = "/models/jg-core-animated.glb";
const noopSubscribe = () => () => {};

function webglAvailable() {
  try {
    const c = document.createElement("canvas");
    const gl = (c.getContext("webgl2") || c.getContext("webgl")) as WebGLRenderingContext | null;
    if (!gl) return false;
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return true;
  } catch {
    return false;
  }
}

export default function EmblemCanvas({ onLiveChange }: Props) {
  const anchorRef = useRef<HTMLSpanElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<EmblemEngine | null>(null);
  const releasePending = useRef(false);
  const activeSync = useRef<(() => void) | null>(null);
  const [shown, setShown] = useState(false);
  const [failed, setFailed] = useState(false);
  // A canvas csak kliensoldalon jön létre (JS nélkül nincs üres canvas).
  const mounted = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );

  useEffect(() => {
    const cv = canvasRef.current;
    const anchor = anchorRef.current;
    if (!mounted || !cv || !anchor) return;
    const canvas: HTMLCanvasElement = cv;
    const intro = (window as unknown as { jgHeroIntro?: IntroApi }).jgHeroIntro;
    const failIntro = (reason: string) => {
      if (intro && intro.state !== "done") intro.fail(reason);
    };
    // A takart oldal ne kaphasson fókuszt (hidratálás után biztonságos).
    if (intro && intro.intro && intro.state === "pending") intro.lock();

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const conn = (navigator as unknown as { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
    const slowNet = !!conn && (conn.saveData || /2g|3g/.test(String(conn.effectiveType || "")));
    if (reduced || slowNet || !webglAvailable()) {
      failIntro(reduced ? "reduced-motion" : slowNet ? "slow-net" : "no-webgl");
      return;
    }

    const ac = new AbortController();
    let engine: EmblemEngine | null = null;
    let disposed = false;
    let unsub: (() => void) | null = null;
    let started = false;

    const wrap = anchor.closest(".hero-emblem-wrap") as HTMLElement;
    const slotEl = wrap.querySelector("[data-hero-emblem]") as HTMLElement;
    const heroEl = (wrap.closest("section") as HTMLElement | null) ?? wrap;
    const copyEl = heroEl.querySelector("[data-hero-copy]") as HTMLElement | null;
    const overlayEl = document.querySelector(".jg-intro-overlay") as HTMLElement | null;

    /**
     * A hero szövegének és CTA-jának TÉNYLEGES kiterjedése (a sorok és a gomb
     * dobozai, nem a teljes oszlop), dokumentum-koordinátában.
     */
    const inkRect = () => {
      if (!copyEl) return undefined;
      let l = Infinity, t = Infinity, r = -Infinity, b = -Infinity;
      const add = (q: DOMRect) => {
        if (q.width <= 0 || q.height <= 0) return;
        l = Math.min(l, q.left);
        t = Math.min(t, q.top);
        r = Math.max(r, q.right);
        b = Math.max(b, q.bottom);
      };
      const range = document.createRange();
      const tw = document.createTreeWalker(copyEl, NodeFilter.SHOW_TEXT);
      for (let n = tw.nextNode(); n; n = tw.nextNode()) {
        if (!n.textContent || !n.textContent.trim()) continue;
        range.selectNodeContents(n);
        for (const q of Array.from(range.getClientRects())) add(q);
      }
      copyEl.querySelectorAll("a, button").forEach((el) => add(el.getBoundingClientRect()));
      if (!Number.isFinite(l)) return undefined;
      return { x: l + window.scrollX, y: t + window.scrollY, w: r - l, h: b - t };
    };

    /** A nyitóképernyő közepe (dokumentum-koordináta), a nyitás elején rögzítve. */
    let introCenter: { cx: number; cy: number } | null = null;
    const desktopMq = window.matchMedia("(min-width: 1024px)");

    /**
     * Elrendezés a tényleges DOM-méretekből. A régió a slotot (a pointer-
     * dőlés miatt bővítve) és — nyitás alatt — a képernyő közepén összeálló
     * objektumot is lefedi; a vízszintes túlcsordulás kizárva.
     */
    const measure = (center: { cx: number; cy: number } | null): EmblemLayout => {
      const W = document.documentElement.clientWidth;
      const r = slotEl.getBoundingClientRect();
      const slot = { x: r.left + window.scrollX, y: r.top + window.scrollY, w: r.width, h: r.height };
      const desktop = desktopMq.matches;
      const p = desktop ? [0.34, 0.14, 1.44, 1.28] : [0.18, 0.1, 1.36, 1.2];
      let x0 = slot.x - slot.w * p[0];
      let y0 = slot.y - slot.h * p[1];
      let x1 = x0 + slot.w * p[2];
      let y1 = y0 + slot.h * p[3];
      let introL: EmblemLayout["intro"];
      if (center) {
        // középen kisebb, a helyére érkezve láthatóan nagyobb lesz
        const size = slot.h * 0.86 * (desktop ? 0.6 : 0.72);
        const e = size * 1.35; // a szétnyílt elemek és az elfordulás helye
        x0 = Math.min(x0, center.cx - e);
        y0 = Math.min(y0, center.cy - e);
        x1 = Math.max(x1, center.cx + e);
        y1 = Math.max(y1, center.cy + e);
        introL = { cx: center.cx, cy: center.cy, size };
      }
      x0 = Math.max(0, Math.floor(x0));
      y0 = Math.max(0, Math.floor(y0));
      x1 = Math.min(W, Math.ceil(x1));
      y1 = Math.ceil(y1);
      return {
        region: { x: x0, y: y0, w: Math.max(1, x1 - x0), h: Math.max(1, y1 - y0) },
        slot,
        intro: introL,
        avoid: center ? inkRect() : undefined,
      };
    };

    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const setPhase = (p: "intro" | "final") => {
      canvas.dataset.phase = p;
    };

    /** Kész póz a hero helyén; a canvas a fejléc alá kerül — egy feladatban. */
    const toFinal = () => {
      if (overlayEl) overlayEl.style.opacity = "";
      const e = engineRef.current;
      if (!e) return;
      e.finishIntro();
      setPhase("final");
      e.setLayout(measure(null));
      activeSync.current?.();
    };

    const onLost = () => {
      // Felépítés közbeni hibát a boot() catch-ága kezeli.
      if (!engineRef.current) return;
      failIntro("context-lost");
      disposed = true;
      delete canvas.dataset.shown;
      setFailed(true);
      onLiveChange(false);
      try {
        engineRef.current?.dispose();
      } catch {}
      engineRef.current = null;
    };

    async function boot() {
      try {
        const mod = await import("./engine");
        if (disposed) return;
        engine = await mod.createEmblemEngine({
          canvas,
          modelUrl: MODEL_URL,
          maxDpr: coarse ? 1.5 : 1.75,
          // a régió a nyitás alatt nagyobb (középtől a slotig)
          maxPixels: coarse ? 1_300_000 : 2_600_000,
          onFlight: () => {
            // a slot helye a betűtípusok betöltése után módosulhatott
            if (engineRef.current && introCenter) engineRef.current.setLayout(measure(introCenter));
            intro?.flight();
          },
          onReveal: (r) => {
            if (overlayEl && intro && intro.state === "flight") overlayEl.style.opacity = String(1 - r);
          },
          onContextLost: onLost,
          signal: ac.signal,
        });
        if (disposed) {
          engine.dispose();
          return;
        }
        engineRef.current = engine;
        (window as unknown as { __jgEmblem3D?: unknown }).__jgEmblem3D = engine.stats;

        if (intro && intro.intro && intro.state === "pending") {
          introCenter = { cx: document.documentElement.clientWidth / 2, cy: window.scrollY + window.innerHeight / 2 };
          engine.setLayout(measure(introCenter));
          engine.prepareIntro();
          if (intro.play()) {
            started = true;
            setPhase("intro");
            canvas.dataset.shown = "";
            onLiveChange(true);
            unsub = intro.subscribe(() => toFinal());
            await engine.playIntro();
            if (!disposed) intro.complete();
            return;
          }
        }
        // Nyitás nélkül: kész póz, a canvas rövid áttűnéssel jelenik meg.
        engine.setLayout(measure(null));
        engine.showFinal();
        setPhase("final");
        started = true;
        // A vezérlő csak a React-commit UTÁN engedi el a PNG-t (ld. alább).
        if (intro && intro.state === "pending") releasePending.current = true;
        canvas.dataset.shown = "";
        onLiveChange(true);
        setShown(true);
        activeSync.current?.();
      } catch (err) {
        if ((err as Error)?.name === "AbortError" || disposed) return;
        failIntro("3d-error");
        setFailed(true);
        onLiveChange(false);
        if (process.env.NODE_ENV !== "production") console.warn("[hero-3d]", err);
      }
    }

    // Ha nyitás vár, azonnal indulunk. Különben a 3D nem versenyezhet a
    // kezdeti betöltéssel (LCP): a `load` után, üresjáratban.
    let idleId = 0;
    let loadCb: (() => void) | null = null;
    const startWhenIdle = () => {
      if (intro && intro.state === "pending") return void boot();
      const go = () => {
        if (disposed) return;
        const ric = (window as unknown as { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }).requestIdleCallback;
        if (ric) idleId = ric(() => void boot(), { timeout: 1500 });
        else idleId = window.setTimeout(() => void boot(), 200);
      };
      if (document.readyState === "complete") go();
      else {
        loadCb = go;
        window.addEventListener("load", go, { once: true });
      }
    };

    // Mélyhivatkozásnál a hero nincs a képen: csak a közelébe érve töltünk.
    // A böngésző a horgonyra a hidratálás körül görget, ezért a „látszik"
    // jelzést 350 ms múlva újra ellenőrizzük; ha addig elgörgetett, várunk.
    let io: IntersectionObserver | null = null;
    let settle = 0;
    const settleMs = location.hash.length > 1 && location.hash !== "#top" ? 350 : 0;
    const near = () => {
      const r = wrap.getBoundingClientRect();
      return r.bottom > -300 && r.top < window.innerHeight + 300;
    };
    io = new IntersectionObserver(
      (entries) => {
        const hit = entries.some((e) => e.isIntersecting);
        clearTimeout(settle);
        if (!hit) return;
        settle = window.setTimeout(() => {
          if (disposed || !near()) return;
          io?.disconnect();
          io = null;
          startWhenIdle();
        }, settleMs);
      },
      { rootMargin: "300px 0px" },
    );
    io.observe(wrap);

    // Pointer: kis térbeli elfordulás, csak egérrel és csak a kész heróban.
    const onMove = (e: PointerEvent) => {
      const en = engineRef.current;
      if (e.pointerType !== "mouse" || !en || en.isIntro()) return;
      const s = slotEl.getBoundingClientRect();
      const nx = (e.clientX - (s.left + s.width / 2)) / (window.innerWidth * 0.5);
      const ny = (e.clientY - (s.top + s.height / 2)) / (window.innerHeight * 0.5);
      en.setPointer(nx, ny);
    };
    const onLeave = () => {
      const en = engineRef.current;
      if (en && !en.isIntro()) en.setPointer(0, 0);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);

    // Elrendezésváltozás (átméretezés, betűtípus, tördelés): újramérés,
    // egyetlen újrarajzolás. Képkockánként legfeljebb egyszer.
    let relayoutRaf = 0;
    const relayout = () => {
      if (relayoutRaf) return;
      relayoutRaf = requestAnimationFrame(() => {
        relayoutRaf = 0;
        const en = engineRef.current;
        if (!en || disposed) return;
        en.setLayout(measure(en.isIntro() ? introCenter : null));
      });
    };
    const ro = new ResizeObserver(relayout);
    ro.observe(wrap);
    ro.observe(heroEl);
    window.addEventListener("resize", relayout, { passive: true });
    void document.fonts?.ready.then(relayout);

    // Képernyőn kívül és háttérfülön nincs renderelés — közvetlenül, React-
    // állapot nélkül.
    let inView = true;
    let pageVisible = document.visibilityState === "visible";
    const syncActive = () => engineRef.current?.setActive(inView && pageVisible);
    const viewIo = new IntersectionObserver((entries) => {
      for (const e of entries) inView = e.isIntersecting;
      syncActive();
    });
    viewIo.observe(wrap);
    const onVisibility = () => {
      pageVisible = document.visibilityState === "visible";
      syncActive();
    };
    document.addEventListener("visibilitychange", onVisibility);
    activeSync.current = syncActive;

    return () => {
      disposed = true;
      ac.abort();
      io?.disconnect();
      clearTimeout(settle);
      if (loadCb) window.removeEventListener("load", loadCb);
      const cic = (window as unknown as { cancelIdleCallback?: (id: number) => void }).cancelIdleCallback;
      if (cic) cic(idleId);
      clearTimeout(idleId);
      if (relayoutRaf) cancelAnimationFrame(relayoutRaf);
      ro.disconnect();
      window.removeEventListener("resize", relayout);
      viewIo.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      activeSync.current = null;
      unsub?.();
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      if (started && intro && (intro.state === "playing" || intro.state === "flight")) intro.fail("unmount");
      try {
        engineRef.current?.dispose();
      } catch {}
      engineRef.current = null;
      delete canvas.dataset.shown;
      (window as unknown as { __jgEmblem3D?: unknown }).__jgEmblem3D = undefined;
      onLiveChange(false);
    };
    // onLiveChange a szülő stabil state-settere: a jelenet egyszer épül fel.
  }, [mounted, onLiveChange]);

  // Intro nélküli érkezés: a 3D már a DOM-ban látható (data-live), most
  // vonulhat vissza a vezérlő (és vele a PNG-t rejtő stílus).
  useEffect(() => {
    if (!shown || !releasePending.current) return;
    releasePending.current = false;
    const intro = (window as unknown as { jgHeroIntro?: IntroApi }).jgHeroIntro;
    if (intro && intro.state === "pending") intro.release();
  }, [shown]);

  if (!mounted) return null;
  return (
    <>
      <span ref={anchorRef} hidden />
      {failed
        ? null
        : createPortal(
            <canvas
              ref={canvasRef}
              aria-hidden="true"
              data-emblem-canvas=""
              data-jg-intro=""
              className="jg-emblem-canvas"
            />,
            document.body,
          )}
    </>
  );
}
