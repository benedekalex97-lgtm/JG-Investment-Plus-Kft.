/**
 * JG hero — a nyitójelenet vezérlője (v0.4).
 *
 * Inline, szinkron script a főoldal LEGELEJÉN (a fejléc előtt): az ELSŐ
 * FESTÉS ELŐTT eldönti, hogy jár-e a külön nyitóképernyő. Ha igen, a
 * Graphite nyitóháttér (`.jg-intro-overlay`) és a „Kihagyás" gomb már az
 * első festéskor látszik — a weboldal mögötte marad.
 *
 * A NYITÁS MENETE (a 3D-részt ld. hero-3d):
 *   pending  — nyitóképernyő; a 3D (modul, GLB, shaderek) itt töltődik.
 *   playing  — a három elem a képernyő közepén összeáll (a 3D-canvas a
 *              nyitóháttér fölött).
 *   flight   — az összeállt embléma nagyobb lesz és a hero helyére érkezik;
 *              közben a nyitóháttér feloldódik, feltárul a fejléc, a szöveg és
 *              a CTA (a feloldódás csak akkor indul, amikor az objektum már
 *              nem takarná a szöveget). A weboldal ettől kezdve kezelhető.
 *   done     — kész; `result` mondja meg, hogyan.
 *
 * HATÁRIDŐK (mind véges; végtelen takarás nem lehetséges):
 *   readyBudgetMs — ennyit vár a nyitóképernyő a 3D-re (a vezérlő futásától).
 *                   Ha addig nem indul, a nyitóháttér rövid áttűnéssel
 *                   eltűnik, a kész oldal látszik (a 3D később a hero helyén
 *                   jelenik meg, vagy marad a statikus PNG).
 *   playLimitMs   — a lejátszás biztonsági felső korlátja.
 *   hardLimitMs   — abszolút korlát a vezérlő futásától: ennél tovább
 *                   semmilyen állapotban nem takar. Ezek a scriptben futnak,
 *                   tehát akkor is érvényesek, ha a JS-csomag be sem töltődik.
 *
 * NEM JÁR NYITÁS (közvetlenül a kész oldal): nem a főoldal; mélyhivatkozás
 * (#hash); görgetett helyzet; böngészős vissza/előre és prerender; ha már
 * volt festés (a nyitóháttér nem takarhat le látott tartalmat); reduced-
 * motion; adatkímélő vagy 2G/3G hálózat; nincs (működő) WebGL; tiltott
 * storage; a munkamenetben már megtekintve. JS nélkül a nyitóháttér
 * CSS-ből rejtett.
 *
 * „MEGTEKINTVE" jelző (sessionStorage, `storageKey`): csak sikeres befejezés
 * vagy tudatos kihagyás (gomb, Escape, billentyű, kattintás, görgetés, Tab)
 * UTÁN íródik — betöltési hiba, időtúllépés, háttérfül vagy átméretezés után
 * nem.
 *
 * ÚJRAJÁTSZÁS (csak preview/helyi build, `allowReplay`): `/?intro=replay`
 * a jelzőtől függetlenül lejátssza a nyitást.
 *
 * FÓKUSZ: a takart oldal `inert` (a 3D-komponens hidratálás után kapcsolja
 * be); a hidratálás előtti rövid ablakban az oldalra kerülő fókusz azonnal
 * lezárja a nyitást, így láthatatlan elemen soha nincs fókusz.
 *
 * Az állapot egy saját <style id="jg-hero-intro"> elemben él a <head>-ben,
 * nem a React által hidratált elemeken. Diagnosztika: window.jgHeroIntro.
 */

export type IntroConfig = {
  storageKey: string;
  modelUrl: string;
  readyBudgetMs: number;
  playLimitMs: number;
  hardLimitMs: number;
  /** Intro nélküli érkezés: ennyi ideig rejtjük a PNG-t, amíg a 3D készül. */
  pngHoldMs: number;
  /** A nyitóháttér áttűnése, ha a 3D nélkül adja át a helyét. */
  leaveMs: number;
  allowReplay: boolean;
  css: { cover: string; flight: string; leave: string; hold: string };
};

export const introConfig: IntroConfig = {
  storageKey: "jg-hero-intro-v2",
  modelUrl: "/models/jg-core-animated.glb",
  readyBudgetMs: 3500,
  playLimitMs: 4600,
  hardLimitMs: 9000,
  pngHoldMs: 1600,
  leaveMs: 320,
  allowReplay: false,
  css: {
    // nyitóképernyő: Graphite háttér + Kihagyás; a hero PNG-je és padlófénye rejtve
    cover:
      ".jg-intro-overlay{display:block}.jg-intro-skip{display:inline-flex}" +
      "[data-emblem-fallback]{opacity:0}.hero-emblem-floor{opacity:0}",
    // helyére érkezés: a nyitóháttér feloldódik (átlátszóságát a 3D-loop
    // képkockánként írja, az objektum pályájához igazítva); kattintás átmegy
    flight:
      ".jg-intro-overlay{display:block;pointer-events:none}" +
      "[data-emblem-fallback]{opacity:0}.hero-emblem-floor{opacity:0}",
    // 3D nélküli átadás (határidő, hiba): rövid áttűnés
    leave: ".jg-intro-overlay{display:block;opacity:0;pointer-events:none;transition:opacity 320ms ease}",
    // intro nélküli érkezés a lap tetejére: a PNG ne villanjon fel a 3D előtt
    hold: "[data-emblem-fallback]{opacity:0}",
  },
};

/* eslint-disable @typescript-eslint/no-explicit-any */
function heroIntro(cfg: IntroConfig) {
  const w = window as any;
  const d = document;
  const h = d.documentElement;
  const t0 = performance.now();

  // --- Jöhet-e egyáltalán 3D? -------------------------------------------------
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

  // Csak a lap tetejére, normál navigációval, festés előtt érkezve.
  let painted = false;
  try {
    if (!canGo3d || location.hash) return;
    if ((w.scrollY || h.scrollTop || 0) > 0) return;
    const navs = performance.getEntriesByType ? performance.getEntriesByType("navigation") : [];
    const navType = navs.length ? (navs[0] as any).type : "navigate";
    if (navType === "back_forward" || navType === "prerender") return;
    painted = performance.getEntriesByType ? performance.getEntriesByType("paint").length > 0 : false;
  } catch {
    return;
  }

  // Munkamenetenként egyszer; tiltott/hibás storage: nincs nyitás.
  const replay = cfg.allowReplay && /(?:^|&)intro=replay(?:&|$)/.test(location.search.slice(1));
  let seen = true;
  try {
    seen = !!w.sessionStorage.getItem(cfg.storageKey);
    // a jelző később írható-e (különben minden betöltéskor újra jönne)
    w.sessionStorage.setItem(cfg.storageKey + ":probe", "1");
    w.sessionStorage.removeItem(cfg.storageKey + ":probe");
  } catch {
    seen = true;
  }

  // Valódi WebGL-kontextus (tiltólistás GPU-n a konstruktor létezik, a context nem).
  function webglOk(): boolean {
    try {
      const c = d.createElement("canvas");
      const gl = (c.getContext("webgl2") || c.getContext("webgl")) as any;
      if (!gl) return false;
      const ext = gl.getExtension("WEBGL_lose_context");
      if (ext) ext.loseContext();
      return true;
    } catch {
      return false;
    }
  }

  // Háttérfülben betöltve nincs nyitás (ott nem futna a jelenet).
  const intro = !painted && d.visibilityState !== "hidden" && (replay || !seen) && webglOk();
  if (painted && !intro) return; // festés után a PNG-t sem rejtjük el utólag

  const style = d.createElement("style");
  style.id = "jg-hero-intro";
  const subs: ((result: string) => void)[] = [];
  const timers: number[] = [];
  let locked: Element[] = [];
  const api: any = { state: "pending", intro: intro, replay: replay, result: null, t0: t0 };
  w.jgHeroIntro = api;

  function setCss(t: string) {
    style.textContent = t;
    if (!style.parentNode) d.head.appendChild(style);
  }
  function dropCss() {
    if (style.parentNode) style.parentNode.removeChild(style);
  }

  /** A takart oldal inert (a nyitóháttér, a gomb és a 3D-canvas kivételével). */
  api.lock = function () {
    if (!intro || locked.length || (api.state !== "pending" && api.state !== "playing")) return;
    const kids = d.body ? d.body.children : ([] as any);
    for (let i = 0; i < kids.length; i++) {
      const el = kids[i];
      const tag = el.tagName;
      if (tag === "SCRIPT" || tag === "STYLE" || tag === "LINK" || tag === "TEMPLATE") continue;
      if (el.hasAttribute("data-jg-intro") || el.hasAttribute("inert")) continue;
      el.setAttribute("inert", "");
      locked.push(el);
    }
  };
  function unlock() {
    for (let i = 0; i < locked.length; i++) locked[i].removeAttribute("inert");
    locked = [];
  }

  function inIntroUi(t: any): boolean {
    return !!(t && t.closest && t.closest("[data-jg-intro]"));
  }

  /** A „Kihagyás" gomb eltűnik: ha nála volt a fókusz, a hero-címre kerül. */
  function rescueFocus() {
    const a = d.activeElement as any;
    if (!a || !a.closest || !a.closest("[data-intro-skip]")) return;
    const hd = d.getElementById("hero-cim");
    if (!hd) return;
    if (!hd.hasAttribute("tabindex")) hd.setAttribute("tabindex", "-1");
    try {
      hd.focus({ preventScroll: true });
    } catch {
      hd.focus();
    }
  }

  // Tudatos befejezés / kihagyás: ekkor íródik a „megtekintve" jelző.
  const deliberate: Record<string, 1> = {
    complete: 1,
    skip: 1,
    escape: 1,
    key: 1,
    pointer: 1,
    wheel: 1,
    scroll: 1,
    focus: 1,
  };
  // 3D nélküli átadás: a nyitóháttér rövid áttűnéssel megy el.
  const fades: Record<string, 1> = { "slow-3d": 1, "3d-error": 1, "no-webgl": 1, timeout: 1, "context-lost": 1, unmount: 1 };

  function finish(result: string) {
    if (api.state === "done") return;
    const covering = intro && (api.state === "pending" || api.state === "playing");
    api.state = "done";
    api.result = result;
    for (let i = 0; i < timers.length; i++) clearTimeout(timers[i]);
    off();
    unlock();
    // a repülés alatt képkockánként írt átlátszóság ne maradjon a nyitóháttéren
    const ov = d.querySelector(".jg-intro-overlay") as any;
    if (ov && ov.style) ov.style.opacity = "";
    if (intro && deliberate[result]) {
      try {
        w.sessionStorage.setItem(cfg.storageKey, "1");
      } catch {}
    }
    if (covering && fades[result]) {
      setCss(cfg.css.leave);
      setTimeout(dropCss, cfg.leaveMs + 40);
    } else {
      dropCss();
    }
    rescueFocus();
    for (let i = 0; i < subs.length; i++) {
      try {
        subs[i](result);
      } catch {}
    }
  }

  /** A 3D kész (első kép kirajzolva): pending → playing. */
  api.play = function (): boolean {
    if (api.state !== "pending" || !intro) return false;
    // főszál-blokkolás esetén a határidő-időzítő késhet: itt is betartatjuk
    if (performance.now() - t0 > cfg.readyBudgetMs) {
      finish("slow-3d");
      return false;
    }
    api.state = "playing";
    timers.push(setTimeout(() => finish("timeout"), cfg.playLimitMs) as any);
    return true;
  };
  /** A helyére érkezés kezdete: a nyitóháttér feloldódik, az oldal kezelhető. */
  api.flight = function () {
    if (api.state !== "playing") return;
    api.state = "flight";
    setCss(cfg.css.flight);
    unlock();
    rescueFocus();
  };
  api.complete = function () {
    finish("complete");
  };
  /** Intro nélküli érkezés: a 3D élő, a PNG-t rejtő stílus visszavonul. */
  api.release = function () {
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

  // --- Megszakítás: Kihagyás, Escape, érdemi interakció, környezetváltozás ---
  function onKey(e: KeyboardEvent) {
    if (e.key === "Escape") return finish("escape");
    // Tab: az oldal inert, a fókusz a gombon / a böngészőn marad.
    if (e.key === "Tab" || e.key === "Shift" || e.key === "Control" || e.key === "Alt" || e.key === "Meta") return;
    if ((e.key === "Enter" || e.key === " ") && inIntroUi(d.activeElement)) return;
    finish("key");
  }
  function onSkip(t: any): boolean {
    return !!(t && t.closest && t.closest("[data-intro-skip]"));
  }
  function onPointer(e: Event) {
    if (onSkip(e.target)) return;
    finish("pointer");
  }
  function onClick(e: Event) {
    if (onSkip(e.target)) {
      e.preventDefault();
      finish("skip");
    }
  }
  function onFocus(e: FocusEvent) {
    if (!inIntroUi(e.target)) finish("focus");
  }
  function onScroll() {
    if ((w.scrollY || h.scrollTop || 0) > 0) finish("scroll");
  }
  const w0 = w.innerWidth;
  const h0 = w.innerHeight;
  function onResize() {
    // mobil böngészősáv-mozgás (csak kis magasságváltozás) nem szakít meg
    if (w.innerWidth !== w0 || Math.abs(w.innerHeight - h0) > 140) finish("resize");
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

  if (intro) {
    setCss(cfg.css.cover);
    on();
    timers.push(
      setTimeout(() => {
        if (api.state === "pending") finish("slow-3d");
      }, cfg.readyBudgetMs) as any,
    );
    timers.push(setTimeout(() => finish("timeout"), cfg.hardLimitMs) as any);
  } else {
    setCss(cfg.css.hold);
    timers.push(
      setTimeout(() => {
        if (api.state === "pending") finish("slow-3d");
      }, cfg.pngHoldMs) as any,
    );
  }
}
/* eslint-enable @typescript-eslint/no-explicit-any */

/** A HTML-be ágyazandó, önálló script. */
export function heroIntroScript(cfg: IntroConfig = introConfig): string {
  return "(" + heroIntro.toString() + ")(" + JSON.stringify(cfg) + ");";
}
