"use client";

import { useEffect, useRef, useState } from "react";
import { emblemAssets } from "./emblemAssets";

/**
 * HeroEmblem — a térbeli JG-embléma a hero saját kompozíciójában.
 *
 * Ez az EGYETLEN megjelenítés: a nyitóanimáció (introScript.ts) ugyanezt a
 * rétegrendszert mozgatja a végleges helyéről indított transzformmal, tehát
 * nincs képcsere, nincs második objektum. A helyet és a képarányt a slot
 * előre lefoglalja (aspect-ratio), a mozgás kizárólag transform/opacity.
 *
 * Rétegek: [data-emblem-root] (intro: pálya + méret) → [data-emblem-tilt]
 * (nyugalmi dőlés) → .hero-emblem-layer (nyugalmi lebegés) → img[data-layer]
 * (intro: összeállás). Így egyik animáció sem írja felül a másikat.
 *
 * Nyugalmi mozgás (CSS, ~8 s): csak JavaScripttel, csak reduced-motion
 * nélkül, és csak akkor fut, ha az embléma látszik és a fül aktív. A
 * „Mozgás megállítása" gombbal megállítható. Dekoratív: aria-hidden.
 */
export default function HeroEmblem() {
  const slotRef = useRef<HTMLDivElement>(null);
  const [motionAllowed, setMotionAllowed] = useState(false);
  const [paused, setPaused] = useState(false);
  const [inView, setInView] = useState(true);
  const [pageVisible, setPageVisible] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setMotionAllowed(!mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!motionAllowed) return;
    const slot = slotRef.current;
    const onVisibility = () => setPageVisible(document.visibilityState === "visible");
    onVisibility();
    document.addEventListener("visibilitychange", onVisibility);

    let io: IntersectionObserver | null = null;
    if (slot && "IntersectionObserver" in window) {
      io = new IntersectionObserver((entries) => {
        for (const entry of entries) setInView(entry.isIntersecting);
      });
      io.observe(slot);
    }
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      io?.disconnect();
    };
  }, [motionAllowed]);

  const idle = !motionAllowed ? undefined : paused || !inView || !pageVisible ? "paused" : "run";
  const { widths, sizes, layers, width, height } = emblemAssets;

  return (
    <div className="hero-emblem-wrap">
      <div
        ref={slotRef}
        data-hero-emblem=""
        data-idle={idle}
        className="hero-emblem-slot"
        style={{ aspectRatio: `${width} / ${height}` }}
        aria-hidden="true"
      >
        <div data-emblem-root="" className="hero-emblem-root">
          <div data-emblem-tilt="" className="hero-emblem-tilt">
            {layers.map((layer) => (
              <div key={layer.role} className="hero-emblem-layer" data-idle-role={layer.role}>
                {/* Előre méretezett, alfa-csatornás WebP-k; a regisztráció
                    miatt mindhárom réteg azonos dobozt és srcsetet kap. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  data-layer={layer.role}
                  src={`${layer.base}-${widths[widths.length - 1]}.webp`}
                  srcSet={widths.map((w) => `${layer.base}-${w}.webp ${w}w`).join(", ")}
                  sizes={sizes}
                  width={width}
                  height={height}
                  alt=""
                  decoding="async"
                  fetchPriority="high"
                  draggable={false}
                  className="hero-emblem-img"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {motionAllowed ? (
        <button
          type="button"
          data-intro-hidden=""
          className="hero-emblem-toggle"
          aria-pressed={paused}
          onClick={() => setPaused((p) => !p)}
        >
          <span aria-hidden="true" className={paused ? "hero-emblem-toggle-play" : "hero-emblem-toggle-pause"} />
          <span className="sr-only">Az embléma mozgásának megállítása</span>
        </button>
      ) : null}
    </div>
  );
}
