"use client";

import { useEffect, useState } from "react";
import ContactCta from "./ContactCta";
import { CTA_HREF, CTA_LABEL } from "./Header";

/**
 * MobileContactBar — „a következő lépés mindig egy koppintásra van".
 *
 * Desktopon a header CTA-ja mindig látszik; mobilon a menü mögött van. Ez a
 * karcsú alsó sáv (56 px + safe-area) EGY ContactCta-t tartalmaz, ugyanazzal a
 * felirattal és céllal, mint a header (a Header.tsx exportjai — új szöveg
 * nincs). Kizárólag < 1024 px-en létezik: efölött a komponens nem renderel.
 *
 * MEGJELENIK, ha a hero SAJÁT CTA-ja már kiment a látótérből (felül). A
 * hero-ban, az oldal tetején tehát nem látszik.
 * ELREJTŐDIK, amíg
 *   – a Kapcsolat szakasz vagy a lábléc látszik (ott maga a cél van);
 *   – a mobilmenü nyitva van;
 *   – a viewport nagyon alacsony (< 420 px: képernyő-billentyűzet vagy zoom).
 *
 * MIÉRT NEM IntersectionObserver: ugyanazért, amiért a Reveal sem (ld.
 * Reveal.tsx): gyors görgetésnél / ugrásnál az elem két kézbesítés között
 * átugorhatja a viewportot, és a sáv rossz állapotban ragadna (mérve: a hero
 * CTA-ja alulról felülre, majd vissza ugrott, IO-callback nélkül). Ehelyett
 * rAF-fojtott scroll/resize mérés dönt a tényleges geometriából — csak
 * olvasás, nincs írás és nincs elrendezés-kikényszerítés görgetés közben.
 *
 * FÓKUSZ (WCAG 2.4.11): amíg a sáv látszik, a <html> `data-jg-bar="on"`
 * attribútumot kap, és a globals.css ehhez illeszkedő `scroll-padding-bottom`-ot
 * ad — a billentyűzettel fókuszált elem így sosem kerül a sáv mögé. Rejtve a
 * sáv `inert` + `visibility: hidden`: nincs a tab-sorrendben.
 *
 * Nincs elrendezés-ugrás: fix pozíció; csak transform + opacity (240 ms),
 * reduced-motion alatt átmenet nélkül (ld. globals.css).
 */

const MIN_VIEWPORT_HEIGHT = 420;
/** A sticky header magassága mobilon — a hero CTA „kiment" ez alatt. */
const HEADER_H = 72;

export default function MobileContactBar() {
  const [visible, setVisible] = useState(false);
  const [desktop, setDesktop] = useState(false);

  // < 1024 px-en létezik; fölötte nem renderelünk.
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const sync = () => setDesktop(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    // Desktopon nincs mit figyelni (a komponens ilyenkor nem is renderel).
    if (desktop) return;

    const heroCta = document.querySelector("#top .jg-cta");
    const targets = [
      document.getElementById("kapcsolat"),
      document.querySelector("footer"),
    ].filter((el): el is HTMLElement => el !== null);
    const header = document.querySelector("header");
    const vv = window.visualViewport;
    let frame = 0;

    const measure = () => {
      frame = 0;
      const vh = window.innerHeight;

      // 1) A hero saját CTA-ja a fejléc alá, FELÜL kiment.
      const past = heroCta
        ? heroCta.getBoundingClientRect().bottom <= HEADER_H
        : false;
      // 2) Kapcsolat / lábléc: amíg bármelyik látszik, a sáv rejtve.
      const atTarget = targets.some((el) => {
        const r = el.getBoundingClientRect();
        return r.bottom > 0 && r.top < vh;
      });
      // 3) Mobilmenü: a header gombjának aria-expanded állapotából.
      const menuOpen =
        header?.querySelector('button[aria-expanded="true"]') != null;
      // 4) Nagyon alacsony viewport (billentyűzet, zoom): a vizuális viewport.
      const tooShort = (vv?.height ?? vh) < MIN_VIEWPORT_HEIGHT;

      setVisible(past && !atTarget && !menuOpen && !tooShort);
    };
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    vv?.addEventListener("resize", schedule);
    // A menü nyitása/zárása: a header aria-expanded attribútuma.
    const mutation = new MutationObserver(schedule);
    if (header) {
      mutation.observe(header, {
        subtree: true,
        attributes: true,
        attributeFilter: ["aria-expanded"],
      });
    }
    // A tartalom magassága változhat (betűtípus-csere): a pozíciók újramérése.
    const resize = new ResizeObserver(schedule);
    resize.observe(document.documentElement);

    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      vv?.removeEventListener("resize", schedule);
      mutation.disconnect();
      resize.disconnect();
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [desktop]);

  // A görgetési tartalék csak akkor él, amíg a sáv ténylegesen látszik.
  useEffect(() => {
    const root = document.documentElement;
    if (visible && !desktop) root.dataset.jgBar = "on";
    else delete root.dataset.jgBar;
    return () => {
      delete root.dataset.jgBar;
    };
  }, [visible, desktop]);

  if (desktop) return null;

  return (
    <div
      data-visible={visible ? "true" : "false"}
      inert={!visible}
      className="jg-contact-bar jg-safe-x on-dark"
    >
      <ContactCta
        href={CTA_HREF}
        label={CTA_LABEL}
        tone="dark"
        className="min-h-11 w-full gap-6 px-5 text-[0.9375rem]"
      />
    </div>
  );
}
