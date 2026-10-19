"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { EmblemEngine } from "./engine";

/**
 * EmblemCanvas — a valódi, böngészőben renderelt 3D JG-embléma.
 *
 * Egyetlen canvas és egyetlen WebGL-renderer adja az introt ÉS a kész herót
 * (nincs canvascsere, nincs második objektum). A three.js-t tartalmazó
 * `engine` modul dinamikus importtal, csak itt, csak a böngészőben töltődik.
 *
 * Mikor NEM indul 3D (a statikus PNG-tartalék marad):
 *   – prefers-reduced-motion, adatforgalom-kímélő / 2G–3G hálózat;
 *   – nincs WebGL, renderer-/modellhiba, context loss (újrapróbálás nincs);
 *   – a hero még messze van a látómezőtől (mélyhivatkozás) — ilyenkor csak
 *     a közelébe érve töltődik.
 *
 * Intro: csak akkor, ha a főoldali vezérlő (window.jgHeroIntro) „pending"
 * állapotban várja, és a jelenet első képkockája már elkészült. Különben a
 * kész póz jelenik meg rövid áttűnéssel a PNG helyén.
 */

type IntroApi = {
  state: string;
  intro: boolean;
  reveal: () => void;
  play: () => boolean;
  complete: () => void;
  fail: (reason: string) => void;
  subscribe: (fn: (result: string) => void) => () => void;
};

type Props = {
  /** A PNG-tartalék elrejtése / megmutatása. */
  onLiveChange: (live: boolean) => void;
  paused: boolean;
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

export default function EmblemCanvas({ onLiveChange, paused }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<EmblemEngine | null>(null);
  const revealPending = useRef(false);
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
    const canvas = canvasRef.current;
    if (!mounted || !canvas) return;
    const intro = (window as unknown as { jgHeroIntro?: IntroApi }).jgHeroIntro;
    const failIntro = (reason: string) => {
      if (intro && (intro.state === "pending" || intro.state === "playing")) intro.fail(reason);
    };

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

    const wrap = canvas.parentElement as HTMLElement;
    const slotEl = wrap.querySelector("[data-hero-emblem]") as HTMLElement;

    const measure = () => {
      const c = canvas.getBoundingClientRect();
      const s = slotEl.getBoundingClientRect();
      return { canvas: { w: c.width, h: c.height }, slot: { x: s.left - c.left, y: s.top - c.top, w: s.width, h: s.height } };
    };
    // Intro kezdőpont: desktopon a slottól kissé balra (a szöveg felé, de nem
    // rá), mobilon a slot közepén — az objektum nem halad át szövegen.
    const introStart = () => {
      const m = measure();
      const desktop = window.matchMedia("(min-width: 1024px)").matches;
      const cx = m.slot.x + m.slot.w / 2;
      const cy = m.slot.y + m.slot.h / 2;
      if (!desktop) return { x: cx, y: cy - m.slot.h * 0.04, scale: 0.6 };
      const copy = document.querySelector("[data-hero-copy]") as HTMLElement | null;
      const c = canvas.getBoundingClientRect();
      const textRight = copy ? copy.getBoundingClientRect().right - c.left : 0;
      // a kis (0,6-os) objektum bal széle se érjen a szövegoszlopba
      const minX = textRight + m.slot.w * 0.34;
      return { x: Math.max(minX, cx - m.slot.w * 0.2), y: cy, scale: 0.6 };
    };

    const coarse = window.matchMedia("(pointer: coarse)").matches;

    const onLost = () => {
      // Felépítés közbeni hiba esetén a motor maga engedi el a contextet —
      // azt a boot() catch-ága kezeli; itt csak egy élő jelenet elvesztése számít.
      if (!engineRef.current) return;
      // Nincs újrapróbálás: azonnal a statikus tartalék.
      failIntro("context-lost");
      disposed = true;
      setShown(false);
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
          canvas: canvas as HTMLCanvasElement,
          modelUrl: MODEL_URL,
          measure,
          introStart,
          maxDpr: coarse ? 1.5 : 1.75,
          maxPixels: coarse ? 900_000 : 1_600_000,
          onContextLost: onLost,
          signal: ac.signal,
        });
        if (disposed) {
          engine.dispose();
          return;
        }
        engineRef.current = engine;
        (window as unknown as { __jgEmblem3D?: unknown }).__jgEmblem3D = engine.stats;

        if (intro && intro.state === "pending" && intro.intro) {
          engine.prepareIntro();
          if (intro.play()) {
            started = true;
            onLiveChange(true);
            setShown(true);
            unsub = intro.subscribe(() => engine?.finishIntro());
            await engine.playIntro();
            if (!disposed) intro.complete();
            return;
          }
        }
        // Intro nélkül: kész póz. A PNG azonnal rejtve (nincs két objektum),
        // a canvas rövid áttűnéssel jelenik meg.
        engine.startIdle();
        started = true;
        // A vezérlő csak a React-commit UTÁN engedi el a PNG-t (ld. az alábbi
        // effektet) — különben egy képkockára a PNG is látszhatna.
        if (intro && intro.state === "pending") revealPending.current = true;
        onLiveChange(true);
        setShown(true);
      } catch (err) {
        if ((err as Error)?.name === "AbortError" || disposed) return;
        failIntro("3d-error");
        setFailed(true);
        onLiveChange(false);
        if (process.env.NODE_ENV !== "production") console.warn("[hero-3d]", err);
      }
    }

    // Ha intro vár (a PNG rejtve), azonnal indulunk. Különben a 3D nem
    // versenyezhet a kezdeti betöltéssel (LCP): a `load` után, üresjáratban.
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

    // Pointer: kis térbeli elfordulás, csak finom (egér) mutatóval.
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || !engineRef.current) return;
      const s = slotEl.getBoundingClientRect();
      const nx = (e.clientX - (s.left + s.width / 2)) / (window.innerWidth * 0.5);
      const ny = (e.clientY - (s.top + s.height / 2)) / (window.innerHeight * 0.5);
      engineRef.current.setPointer(nx, ny);
    };
    const onLeave = () => engineRef.current?.setPointer(0, 0);
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);

    const ro = new ResizeObserver(() => engineRef.current?.resize());
    ro.observe(wrap);

    // Képernyőn kívül és háttérfülön a renderloop áll — közvetlenül, React-
    // állapot nélkül, hogy terhelt főszálon se fusson felesleges képkocka.
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
      ro.disconnect();
      viewIo.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      activeSync.current = null;
      unsub?.();
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      if (started && intro && intro.state === "playing") intro.fail("unmount");
      try {
        engineRef.current?.dispose();
      } catch {}
      engineRef.current = null;
      (window as unknown as { __jgEmblem3D?: unknown }).__jgEmblem3D = undefined;
      onLiveChange(false);
    };
    // onLiveChange a szülő stabil state-settere: a jelenet egyszer épül fel.
  }, [mounted, onLiveChange]);

  // Intro nélküli érkezés: a 3D már a DOM-ban látható (data-live), most
  // vonulhat vissza a vezérlő (és vele a PNG-t rejtő stílus).
  useEffect(() => {
    if (!shown || !revealPending.current) return;
    revealPending.current = false;
    const intro = (window as unknown as { jgHeroIntro?: IntroApi }).jgHeroIntro;
    if (intro && intro.state === "pending") intro.reveal();
  }, [shown]);

  // Szünet / láthatóság: a renderloop is áll (ld. engine.setPaused / setActive).
  useEffect(() => {
    engineRef.current?.setPaused(paused);
  }, [paused, shown]);
  // Amikor a jelenet élővé válik, a már ismert láthatósági állapotot alkalmazzuk.
  useEffect(() => {
    if (shown) activeSync.current?.();
  }, [shown]);

  if (!mounted || failed) return null;
  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      data-emblem-canvas=""
      data-shown={shown ? "true" : undefined}
      className="hero-emblem-canvas"
    />
  );
}
