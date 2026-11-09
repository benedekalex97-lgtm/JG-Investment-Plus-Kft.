"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

/**
 * ContactCta — a kapcsolatfelvételi CTA-k KÖZÖS megjelenése.
 *
 * Forrás: a Header v2.0 „Kapcsolatfelvétel" gombja (korábban a Header.tsx
 * belső komponense), változatlan formavilággal: szögletes Aubergine lemez,
 * 1 : 2 lejtésű levágott jobb felső sarok, hajszálvékony él, tipográfiai nyíl
 * és EGYETLEN GSAP-mikrointerakció (a nyíl szára megnyúlik, a hegye 6 px-et
 * előre lép, a lemez Muted Plum felé tónusosodik). A rétegek és a
 * színváltozatok a globals.css .jg-cta blokkjában élnek — egy helyen.
 *
 * Használat: Header (desktop + mobilmenü), Hero, Szolgáltatások, Miért mi?.
 * A feliratok és a célok a tartalmi modellből / a hívótól jönnek, változatlanul.
 *
 * tone:
 *   "dark"  — sötét felületen (header, Hero, sötét szakaszok). A vezérlőhatár
 *             a tömör él (Muted Plum 70% + Cool Silver 30%), ≥ 4:1 a sötét
 *             felületekhez képest.
 *   "light" — világos (Canvas / Porcelain) felületen. A határ maga az
 *             Aubergine lemez (10,15 : 1), sötétebb Aubergine hajszálvonallal.
 * A felirat mindkét változatban Porcelain az Aubergine lemezen (10,15 : 1),
 * hover-tónusnál 7,08 : 1. A clip-path a dekoratív rétegeken van, nem a
 * linken, így a fókuszjelölés nem vágódik le, és a teljes látható felület
 * kattintható.
 *
 * Szándékosan sima <a>, nem next/link: ugyanarra a hash-re (#kapcsolat)
 * ismételt kattintásra is görget.
 */

const reducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Tipográfiai nyíl: 14 px szár, 1 : 2 lejtésű hegy; a GSAP nyújtja. */
export function CtaArrow({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 21 10"
      width="21"
      height="10"
      className={`jg-arrow shrink-0 overflow-visible ${className}`}
    >
      <line className="jg-arrow-shaft" x1="0.5" y1="5" x2="14" y2="5" />
      <polyline className="jg-arrow-head" points="9,2.5 14,5 9,7.5" />
    </svg>
  );
}

type ContactCtaProps = {
  href: string;
  label: string;
  tone?: "dark" | "light";
  /** "flex": kitölti a szülő szélességét (Hero mobilon, mobilmenü); "inline-flex": természetes szélesség. */
  display?: "flex" | "inline-flex";
  className?: string;
  onClick?: () => void;
};

export default function ContactCta({
  href,
  label,
  tone = "dark",
  display = "flex",
  className = "",
  onClick,
}: ContactCtaProps) {
  const ref = useRef<HTMLAnchorElement>(null);
  // Saját, scope-olt GSAP-context: unmountkor minden tween visszaáll.
  const { contextSafe } = useGSAP({ scope: ref });

  const motion = (el: HTMLElement, on: boolean) =>
    contextSafe(() => {
      const d = reducedMotion() ? 0 : 1;
      const ease = "power3.out";
      gsap.to(el.querySelector(".jg-arrow-shaft"), {
        scaleX: on ? 1.43 : 1,
        transformOrigin: "0% 50%",
        duration: 0.42 * d,
        ease,
        overwrite: "auto",
      });
      gsap.to(el.querySelector(".jg-arrow-head"), { x: on ? 6 : 0, duration: 0.42 * d, ease, overwrite: "auto" });
      gsap.to(el.querySelector(".jg-cta-tint"), {
        opacity: on ? 0.55 : 0,
        duration: 0.3 * d,
        ease: "power1.out",
        overwrite: "auto",
      });
    })();

  // Csupa nagybetűs (tartalmi modellből érkező) feliratnál nagyobb betűköz.
  const caps = label === label.toLocaleUpperCase("hu");

  return (
    <a
      ref={ref}
      href={href}
      onClick={onClick}
      data-tone={tone}
      onPointerEnter={(e) => motion(e.currentTarget, true)}
      onPointerLeave={(e) => {
        if (!e.currentTarget.matches(":focus-visible")) motion(e.currentTarget, false);
      }}
      onFocus={(e) => {
        if (e.currentTarget.matches(":focus-visible")) motion(e.currentTarget, true);
      }}
      onBlur={(e) => motion(e.currentTarget, false)}
      className={`jg-cta relative isolate ${display} items-center justify-between font-semibold text-porcelain ${
        caps ? "tracking-[0.08em]" : "tracking-[0.01em]"
      } ${className}`}
    >
      <span aria-hidden="true" className="jg-cta-edge" />
      <span aria-hidden="true" className="jg-cta-plate" />
      <span aria-hidden="true" className="jg-cta-tint" />
      <span>{label}</span>
      <CtaArrow />
    </a>
  );
}
