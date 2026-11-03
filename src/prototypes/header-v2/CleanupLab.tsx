"use client";

import { useState } from "react";
import { gsap } from "gsap";
import HeaderV2Prototype from "./HeaderV2Prototype";

/**
 * Prototípus-labor: a Header v2.0 fel/le csatolható, és kiolvasható, hány
 * GSAP-animáció él még a globális timeline-on. Unmount után a számnak 0-nak
 * kell lennie — ez igazolja, hogy a useGSAP cleanup mindent revertált.
 */
export default function CleanupLab() {
  const [mounted, setMounted] = useState(true);
  const [active, setActive] = useState<number | null>(null);

  const measure = () =>
    setActive(gsap.globalTimeline.getChildren(true, true, true).length);

  return (
    <>
      {mounted ? <HeaderV2Prototype /> : <div className="h-[72px] lg:h-20" />}

      <div className="jg-safe-x mx-auto flex max-w-[1280px] flex-wrap items-center gap-3 py-6 text-sm">
        <span className="font-semibold">Prototípus-labor</span>
        <button
          type="button"
          data-testid="toggle-mount"
          onClick={() => setMounted((v) => !v)}
          className="min-h-11 rounded-[0.5rem] border border-black/20 px-4"
        >
          {mounted ? "Header leválasztása (unmount)" : "Header visszacsatolása (mount)"}
        </button>
        <button
          type="button"
          data-testid="measure"
          onClick={measure}
          className="min-h-11 rounded-[0.5rem] border border-black/20 px-4"
        >
          Aktív GSAP-animációk mérése
        </button>
        <output data-testid="active-count" aria-live="polite">
          {active === null ? "—" : `${active} aktív animáció`}
        </output>
      </div>
    </>
  );
}
