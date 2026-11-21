"use client";

import { useEffect } from "react";
import { track } from "@vercel/analytics";

/**
 * ContactClickTracker — a tel: és mailto: linkekre történő kattintás névtelen
 * mérése (Vercel Web Analytics „contact_click" esemény), EGY helyen, a gyökér
 * layoutban, eseménydelegálással: így a Kapcsolat szakasz, az útmutatók és a
 * lábléc linkjeit sem kell egyenként módosítani.
 *
 * Rögzített adatok: a csatorna („phone" | „email") és az oldal útvonala.
 * Telefonszám, e-mail-cím vagy más személyes adat NEM kerül az eseménybe.
 * Ld. az adatkezelési tájékoztató 7. pontját (privacy-policy.ts → analytics).
 */
export default function ContactClickTracker() {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = event.target as Element | null;
      const link = target?.closest?.('a[href^="tel:"], a[href^="mailto:"]');
      if (!link) return;
      const channel = link.getAttribute("href")!.startsWith("tel:") ? "phone" : "email";
      track("contact_click", { channel, page: window.location.pathname });
    };
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);

  return null;
}
