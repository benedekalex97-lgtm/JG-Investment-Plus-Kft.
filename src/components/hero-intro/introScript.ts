/**
 * JG hero — a 3D-nyitás vezérlője (v0.3).
 *
 * Inline, szinkron script a főoldal elején: az ELSŐ FESTÉS ELŐTT eldönti,
 * hogy a 3D-embléma összeállási introja szóba jöhet-e. Ha igen, a statikus
 * PNG-tartalékot átmenetileg elrejti (hogy ne a kész embléma látszódjon,
 * majd „szétessen"), és egy kis vezérlőt tesz ki a window.jgHeroIntro alá.
 *
 * A SZÖVEG, A CTA ÉS A FEJLÉC SOHA NINCS ELREJTVE — nincs takaró képernyő.
 * Az intro kizárólag az embléma saját területén zajlik (ld. hero-3d).
 *
 * Állapotok (window.jgHeroIntro; `intro`: jár-e összeállási intro):
 *   pending — a 3D-jelenet készül (modul, GLB, shaderek, első képkocka);
 *             a PNG rejtve. Ha `readyBudgetMs`-en belül nem indul, a PNG
 *             jelenik meg (és nincs intro). Intro nélküli érkezésnél is így
 *             kerüljük el, hogy a PNG után a 3D „ráugorjon" ugyanarra a helyre.
 *   playing — az intro fut; a kihagyó gomb látszik.
 *   done    — kész (a `result` mondja meg, hogyan).
 * Diagnosztika és tesztek: window.jgHeroIntro.{state,result}.
 *
 * Az állapot egy saját <style id="jg-hero-intro"> elemben él a <head>-ben,
 * nem a React által hidratált <html>-en (hidratálási eltérés nélkül).
 * Kliensoldali navigációnál a React nem futtatja ezt a scriptet.
 */

export type IntroConfig = {
  storageKey: string;
  modelUrl: string;
  /** Ennyi idő alatt (a vezérlő futásától) kell a 3D-nek elindulnia. */
  readyBudgetMs: number;
  /** Lassú hálózat: ha a vezérlő a navigációtól ennél később fut, nincs intro. */
  maxGateMs: number;
  /** Abszolút felső korlát a lejátszásra. */
  playLimitMs: number;
  css: { pending: string; playing: string };
};

export const introConfig: IntroConfig = {
  storageKey: "jg-hero-intro-v1",
  modelUrl: "/models/jg-core-animated.glb",
  readyBudgetMs: 1600,
  maxGateMs: 600,
  playLimitMs: 4000,
  css: {
    // a statikus PNG-tartalék és a mozgáskapcsoló rejtve, amíg a 3D készül
    pending: "[data-emblem-fallback]{opacity:0}.hero-emblem-toggle{visibility:hidden}",
    // lejátszás alatt a kihagyó gomb is látszik; a padlófény a megérkezéskor úszik be
    playing:
      "[data-emblem-fallback]{opacity:0}.hero-emblem-toggle{visibility:hidden}" +
      ".jg-intro-skip{display:inline-flex}.hero-emblem-floor{opacity:0}",
  },
};

/* eslint-disable @typescript-eslint/no-explicit-any */
function heroIntro(cfg: IntroConfig) {
  const w = window as any;
  const d = document;
  const h = d.documentElement;

  // --- 3D-előtöltés: csak ha a 3D egyáltalán szóba jöhet ---------------------
  let canGo3d = false;
  try {
    const conn = (navigator as any).connection;
    const slowNet = !!conn && (conn.saveData || /2g|3g/.test(String(conn.effectiveType || "")));
    canGo3d =
      location.pathname === "/" &&
      !!w.matchMedia &&
      !w.matchMedia("(prefers-reduced-motion: reduce)").matches &&
      "WebGLRenderingContext" in w &&
      !slowNet;
    if (canGo3d && !location.hash) {
      const l = d.createElement("link");
      l.rel = "preload";
      l.as = "fetch";
      l.href = cfg.modelUrl;
      l.crossOrigin = "anonymous";
      d.head.appendChild(l);
    }
  } catch {
    canGo3d = false;
  }

  // A 3D előkészülhet-e úgy, hogy a PNG-tartalék addig ne is látszódjon?
  // (Csak a lap tetejére, nem lassú hálózaton érkezve — különben a PNG marad.)
  try {
    if (!canGo3d || location.hash) return;
    if (performance.now() > cfg.maxGateMs) return;
    if ((w.scrollY || h.scrollTop || 0) > 0) return;
    const navs = performance.getEntriesByType ? performance.getEntriesByType("navigation") : [];
    const navType = navs.length ? (navs[0] as any).type : "navigate";
    if (navType === "back_forward" || navType === "prerender") return;
  } catch {
    return;
  }

  // Intro csak munkamenetenként egyszer; tiltott/hibás storage: nincs intro.
  let intro = false;
  try {
    const ss = w.sessionStorage;
    if (!ss.getItem(cfg.storageKey)) {
      ss.setItem(cfg.storageKey, "1");
      intro = ss.getItem(cfg.storageKey) === "1";
    }
  } catch {
    intro = false;
  }

  const style = d.createElement("style");
  style.id = "jg-hero-intro";
  const subs: ((result: string) => void)[] = [];
  const timers: number[] = [];
  const api: any = { state: "pending", intro: intro, result: null };
  w.jgHeroIntro = api;

  function setCss(t: string) {
    style.textContent = t;
    if (!style.parentNode) d.head.appendChild(style);
  }

  function onSkipEl(): boolean {
    const a = d.activeElement as any;
    return !!(a && a.closest && a.closest("[data-intro-skip]"));
  }

  function finish(result: string, moveFocus?: boolean) {
    if (api.state === "done") return;
    api.state = "done";
    api.result = result;
    for (let i = 0; i < timers.length; i++) clearTimeout(timers[i]);
    if (style.parentNode) style.parentNode.removeChild(style);
    off();
    if (moveFocus) {
      // A kihagyó gomb eltűnik; a fókusz a hero-címre kerül, nem a body-ra.
      const hd = d.getElementById("hero-cim");
      if (hd) {
        if (!hd.hasAttribute("tabindex")) hd.setAttribute("tabindex", "-1");
        try {
          hd.focus({ preventScroll: true });
        } catch {
          hd.focus();
        }
      }
    }
    for (let i = 0; i < subs.length; i++) {
      try {
        subs[i](result);
      } catch {}
    }
  }

  /** A 3D-komponens hívja, amikor az első képkocka kész: pending → playing. */
  const t0 = performance.now();
  api.play = function (): boolean {
    if (api.state !== "pending" || !api.intro) return false;
    // Ha egy főszál-blokkolás miatt a határidő-időzítő még nem futott le, a
    // határidőt itt is betartatjuk: késői előkészítés után nincs intro.
    if (performance.now() - t0 > cfg.readyBudgetMs) {
      finish("slow-3d");
      return false;
    }
    api.state = "playing";
    setCss(cfg.css.playing);
    timers.push(setTimeout(() => finish("timeout"), cfg.playLimitMs) as any);
    return true;
  };
  api.complete = function () {
    finish("complete");
  };
  /** Intro nélküli érkezés: a 3D élő, a vezérlő visszavonul. */
  api.reveal = function () {
    finish("no-intro");
  };
  api.fail = function (reason: string) {
    finish(reason || "3d-error");
  };
  api.subscribe = function (fn: (result: string) => void) {
    subs.push(fn);
    return function () {
      const i = subs.indexOf(fn);
      if (i > -1) subs.splice(i, 1);
    };
  };

  // --- Megszakítás: billentyű, érdemi interakció, környezetváltozás ----------
  function onKey(e: KeyboardEvent) {
    if (e.key === "Escape") return finish("escape", onSkipEl());
    if (e.key === "Tab") {
      // Lejátszás alatt az első Tab a kihagyó gombra visz; onnan tovább lépve
      // (vagy Shift+Tabbal) kész állapot, és a böngésző természetesen folytatja.
      if (onSkipEl() || e.shiftKey) finish("tab");
      return;
    }
    if (e.key === "Shift" || e.key === "Control" || e.key === "Alt" || e.key === "Meta") return;
    if ((e.key === "Enter" || e.key === " ") && onSkipEl()) return;
    finish("key");
  }
  function onPointer(e: Event) {
    const t = e.target as any;
    if (t && t.closest && t.closest("[data-intro-skip]")) return;
    finish("pointer");
  }
  function onClick(e: Event) {
    const t = e.target as any;
    if (t && t.closest && t.closest("[data-intro-skip]")) {
      e.preventDefault();
      finish("skip", true);
    }
  }
  function onFocus(e: FocusEvent) {
    const t = e.target as any;
    if (t && t.closest && !t.closest("[data-intro-skip]")) finish("focus");
  }
  function onScroll() {
    if ((w.scrollY || h.scrollTop || 0) > 0) finish("scroll");
  }
  function onResize() {
    finish("resize");
  }
  function onHidden() {
    if (d.visibilityState === "hidden") finish("hidden");
  }
  function onPageHide() {
    finish("pagehide");
  }
  function onWheel() {
    finish("wheel");
  }

  const opts = { capture: true, passive: true } as any;
  function on() {
    d.addEventListener("keydown", onKey, true);
    d.addEventListener("pointerdown", onPointer, opts);
    d.addEventListener("click", onClick, true);
    d.addEventListener("focusin", onFocus, true);
    d.addEventListener("wheel", onWheel, opts);
    d.addEventListener("touchmove", onWheel, opts);
    w.addEventListener("scroll", onScroll, opts);
    w.addEventListener("resize", onResize, opts);
    w.addEventListener("orientationchange", onResize, opts);
    d.addEventListener("visibilitychange", onHidden, true);
    w.addEventListener("pagehide", onPageHide, true);
  }
  function off() {
    d.removeEventListener("keydown", onKey, true);
    d.removeEventListener("pointerdown", onPointer, opts);
    d.removeEventListener("click", onClick, true);
    d.removeEventListener("focusin", onFocus, true);
    d.removeEventListener("wheel", onWheel, opts);
    d.removeEventListener("touchmove", onWheel, opts);
    w.removeEventListener("scroll", onScroll, opts);
    w.removeEventListener("resize", onResize, opts);
    w.removeEventListener("orientationchange", onResize, opts);
    d.removeEventListener("visibilitychange", onHidden, true);
    w.removeEventListener("pagehide", onPageHide, true);
  }

  setCss(cfg.css.pending);
  if (intro) on();
  // Ha a 3D nem áll készen időben: nincs intro, a PNG azonnal látszik.
  timers.push(
    setTimeout(() => {
      if (api.state === "pending") finish("slow-3d");
    }, cfg.readyBudgetMs) as any,
  );
}
/* eslint-enable @typescript-eslint/no-explicit-any */

/** A HTML-be ágyazandó, önálló script. */
export function heroIntroScript(cfg: IntroConfig = introConfig): string {
  return "(" + heroIntro.toString() + ")(" + JSON.stringify(cfg) + ");";
}
