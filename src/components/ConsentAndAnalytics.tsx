"use client";

import { useEffect, useState } from "react";
import { consent } from "@/content/consent";
import { GA_HOSTNAMES, GA_MEASUREMENT_ID } from "@/lib/analytics";
import {
  CONSENT_CHANGE_EVENT,
  CONSENT_OPEN_EVENT,
  readConsent,
  writeConsent,
  type ConsentChoice,
} from "@/lib/consent";

/**
 * ConsentAndAnalytics — sütihozzájárulás-sáv + Google Analytics 4 betöltése.
 *
 * SZABÁLY: a GA4 (és vele bármilyen süti) KIZÁRÓLAG az „Elfogadom" után
 * töltődik be. Döntés előtt és elutasításnál a gtag-szkript le sem töltődik,
 * így süti sem keletkezik. Visszavonáskor a GA leáll (ga-disable + consent
 * update), a _ga sütik törlődnek.
 *
 * A két gomb egyenrangú (azonos méret és stílus) — a hozzájárulás akkor
 * érvényes, ha az elutasítás ugyanolyan könnyű, mint az elfogadás.
 *
 * A GA csak a production domainen (GA_HOSTNAMES) indul; preview-n és helyben
 * a sáv működik, de mérés nem történik.
 *
 * Ld. adatkezelési tájékoztató 8. pont (privacy-policy.ts → googleAnalytics).
 */

const DISABLE_KEY = `ga-disable-${GA_MEASUREMENT_ID}`;

function loadGa() {
  const w = window as unknown as Record<string, unknown> & Window;
  if (!GA_HOSTNAMES.includes(window.location.hostname as (typeof GA_HOSTNAMES)[number])) return;
  w[DISABLE_KEY] = false;
  if (window.gtag) {
    window.gtag("consent", "update", { analytics_storage: "granted" });
    return;
  }
  window.dataLayer = window.dataLayer || [];
  // A gtag az `arguments` objektumot várja (nem tömböt) — ezért function, nem nyílfüggvény.
  window.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer!.push(arguments);
  };
  window.gtag("consent", "default", {
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    analytics_storage: "granted",
  });
  window.gtag("js", new Date());
  window.gtag("config", GA_MEASUREMENT_ID, { allow_google_signals: false, allow_ad_personalization_signals: false });
  const s = document.createElement("script");
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_MEASUREMENT_ID)}`;
  document.head.appendChild(s);
}

function stopGa() {
  const w = window as unknown as Record<string, unknown>;
  w[DISABLE_KEY] = true;
  window.gtag?.("consent", "update", { analytics_storage: "denied" });
  // A korábban elhelyezett _ga / _ga_<azonosító> sütik törlése (a domainen és a fődomainen is).
  const host = window.location.hostname;
  const domains = ["", host, `.${host.replace(/^www\./, "")}`];
  for (const raw of document.cookie.split(";")) {
    const name = raw.split("=")[0].trim();
    if (!/^_ga(_|$)/.test(name)) continue;
    for (const d of domains) {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${d ? `; domain=${d}` : ""}`;
    }
  }
}

export default function ConsentAndAnalytics() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const apply = (choice: ConsentChoice | null) => {
      if (choice === "granted") loadGa();
      else if (choice === "denied") stopGa();
    };
    const initial = readConsent();
    apply(initial);
    // A sáv csak hidratálás után jelenik meg (a döntés a böngészőben van tárolva).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (initial === null) setOpen(true);

    const onChange = (e: Event) => apply((e as CustomEvent<ConsentChoice>).detail);
    const onOpen = () => setOpen(true);
    window.addEventListener(CONSENT_CHANGE_EVENT, onChange);
    window.addEventListener(CONSENT_OPEN_EVENT, onOpen);
    return () => {
      window.removeEventListener(CONSENT_CHANGE_EVENT, onChange);
      window.removeEventListener(CONSENT_OPEN_EVENT, onOpen);
    };
  }, []);

  if (!open) return null;

  const decide = (choice: ConsentChoice) => {
    writeConsent(choice);
    setOpen(false);
  };

  const buttonClass =
    "inline-flex min-h-11 flex-1 items-center justify-center rounded-md border border-porcelain/40 bg-porcelain/10 px-5 text-[0.9375rem] font-semibold text-porcelain transition-colors hover:border-porcelain hover:bg-porcelain/20 sm:flex-none sm:min-w-36";

  return (
    <section
      role="region"
      aria-labelledby="consent-cim"
      className="on-dark jg-safe-x fixed inset-x-0 bottom-0 z-[90] border-t border-white/12 bg-surface-deep pt-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] text-porcelain shadow-[0_-12px_32px_rgb(0_0_0/35%)]"
    >
      <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-4 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
        <div className="max-w-[72ch]">
          <h2 id="consent-cim" className="text-xs font-semibold tracking-[0.14em] text-cool-silver uppercase">
            {consent.heading}
          </h2>
          <p className="mt-1.5 text-[0.9375rem] leading-relaxed text-porcelain">
            {consent.text}{" "}
            <a
              href={consent.linkHref}
              className="font-medium text-porcelain underline decoration-white/40 underline-offset-4 hover:text-signal-berry-light"
            >
              {consent.linkLabel}
            </a>
          </p>
        </div>
        <div className="flex shrink-0 gap-3">
          <button type="button" className={buttonClass} onClick={() => decide("granted")}>
            {consent.accept}
          </button>
          <button type="button" className={buttonClass} onClick={() => decide("denied")}>
            {consent.reject}
          </button>
        </div>
      </div>
    </section>
  );
}
