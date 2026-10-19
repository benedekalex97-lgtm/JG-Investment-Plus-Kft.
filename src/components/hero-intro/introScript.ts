/**
 * JG összeálló embléma → hero átvezetés — a nyitóanimáció vezérlője.
 *
 * MIÉRT INLINE, React nélkül: a nyitásnak az ELSŐ festés előtt kell
 * eldöntenie, hogy fut-e (különben a kész hero egy pillanatra megjelenne,
 * majd a takarás rácsúszna). A hidratálás lassú mobilon 1 s fölött is lehet,
 * ezért a vezérlő a HTML-be ágyazott, szinkron script; a React-bundle-től
 * független. A függvényt `toString()`-gel szerializáljuk, ezért NEM
 * hivatkozhat a modul más azonosítóira — minden paramétert a `cfg` kap.
 *
 * Kliensoldali (React) navigációnál a React ezt a scriptet nem futtatja le,
 * így oldalon belüli navigáció soha nem indít intrót.
 *
 * Állapotok — egy saját, a <head>-be tett <style id="jg-hero-intro">
 * elem tartalmaként (a szabályok: `introCss`):
 *   wait   — takarás látszik, az assetekre várunk (korlátos ideig);
 *   play   — az embléma összeáll és a hero-helyére mozdul;
 *   reveal — a header és a hero-szöveg előtűnik;
 *   (nincs <style>) — kész, statikus oldal.
 * Szándékosan NEM a <html> attribútuma: azt a React hidratálja, és egy
 * hidratálás előtti attribútum valódi eltérésként jelenne meg — elnémítani
 * (suppressHydrationWarning) pedig a jövőbeli valódi hibákat is elfedné.
 * A React 19 a <head>-be külső script által tett elemeket kihagyja.
 * Diagnosztika és tesztek: window.jgHeroIntro = { state, result }.
 *
 * A mozgás kizárólag Web Animations API: nem ír style-attribútumot a
 * React által kezelt elemekre, és a cancel() után az elemek pontosan a
 * CSS-ben rögzített végállapotba kerülnek — ez a biztos lezárás alapja.
 */

export type IntroConfig = {
  storageKey: string;
  css: { active: string; hidden: string; wait: string };
  /** Ennyi ideig várunk a rétegekre és a fontokra; utána intró nélkül megy tovább. */
  assetWaitMs: number;
  /**
   * Ha a vezérlő a navigáció kezdetétől ennél később fut (a HTML és a CSS
   * maga is lassan érkezett), a hálózat túl lassú a nyitáshoz: azonnal
   * kimarad, takarás nélkül — így lassú kapcsolaton nincs várakozás.
   */
  maxGateMs: number;
  /** Abszolút felső korlát: ekkor mindenképp kész állapot. */
  hardLimitMs: number;
  assembleMs: number;
  settleMs: number;
  flightMs: number;
  revealDelayMs: number;
  revealMs: number;
  revealStaggerMs: number;
  /** A kezdő méret a végleges emblémához képest legfeljebb ennyi. */
  maxStartScale: number;
  /** A kezdő embléma magassága a viewport magasságához képest. */
  startHeightVh: number;
  /** A kezdő embléma szélessége a viewport szélességéhez képest (felső korlát). */
  startWidthVw: number;
  layers: Record<string, { from: string; delay: number }>;
};

/**
 * A futó intró CSS-e. A vizuális stílusok (takarás, kihagyó gomb) a
 * globals.css-ben vannak, alapból display: none; ezek csak bekapcsolják őket.
 */
const introCss = {
  // minden fázisban: takarás + kihagyó gomb látszik, az embléma a takarás
  // fölött mozog, a nyugalmi mozgás áll, a takart vezérlők nem fókuszálhatók
  active:
    ".jg-intro-cover{display:block}.jg-intro-skip{display:inline-flex}" +
    // a fejléc mögött a body látszik át áttűnés közben: ne világos legyen
    "body{background-color:var(--color-surface-deep)}" +
    ".hero-content{z-index:45}" +
    "[data-intro-hidden],a[href='#fotartalom']{visibility:hidden}" +
    ".hero-emblem-slot *{animation:none!important}" +
    ".hero-emblem-root,.hero-emblem-img,.hero-emblem-floor{will-change:transform,opacity}",
  // wait + play: a fejléc és a hero-copy még rejtett
  hidden: ".jg-header,[data-intro-reveal]{visibility:hidden}",
  // wait: az embléma még nem látszik
  wait: ".hero-emblem-root{opacity:0}",
};

export const introConfig: IntroConfig = {
  storageKey: "jg-hero-intro-v1",
  css: introCss,
  assetWaitMs: 800,
  maxGateMs: 600,
  hardLimitMs: 4200,
  assembleMs: 700,
  settleMs: 200,
  flightMs: 900,
  // a copy akkor tűnik elő, amikor az embléma már jórészt elhagyta a szöveg-
  // oszlopot (desktopon a középről jobbra tartó pálya ne fussa át a címet)
  revealDelayMs: 1250,
  revealMs: 650,
  revealStaggerMs: 70,
  maxStartScale: 0.72,
  startHeightVh: 0.4,
  startWidthVw: 0.56,
  layers: {
    // Kis távolságok, enyhén eltérő dőlés. A százalék a réteg saját
    // (teljes vászon méretű) dobozára vonatkozik, így méretfüggetlen.
    cap: { from: "translate3d(0,-8%,0) rotate(-3deg)", delay: 0 },
    left: { from: "translate3d(-7%,2.5%,0) rotate(2.4deg)", delay: 50 },
    right: { from: "translate3d(7%,2.5%,0) rotate(-2deg)", delay: 90 },
  },
};

/* eslint-disable @typescript-eslint/no-explicit-any */
function heroIntro(cfg: IntroConfig) {
  const w = window as any;
  const d = document;
  const h = d.documentElement;

  // --- 1. Jogosultság: csak friss, főoldali, tetejére érkezés -------------
  try {
    if (location.pathname !== "/" || location.hash) return;
    if (performance.now() > cfg.maxGateMs) return;
    if (!w.matchMedia || w.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (typeof (Element.prototype as any).animate !== "function") return;
    if ((w.scrollY || h.scrollTop || 0) > 0) return;
    const navs = performance.getEntriesByType ? performance.getEntriesByType("navigation") : [];
    const navType = navs.length ? (navs[0] as any).type : "navigate";
    if (navType === "back_forward" || navType === "prerender") return;
    const conn = (navigator as any).connection;
    if (conn && (conn.saveData || /2g|3g/.test(String(conn.effectiveType || "")))) return;
    const ss = w.sessionStorage;
    if (ss.getItem(cfg.storageKey)) return;
    ss.setItem(cfg.storageKey, "1");
    if (ss.getItem(cfg.storageKey) !== "1") return;
  } catch {
    // Tiltott vagy hibás storage: nem kockáztatunk ismétlődő intrót.
    return;
  }

  let done = false;
  const anims: any[] = [];
  let timers: number[] = [];
  const t0 = performance.now();

  const style = d.createElement("style");
  style.id = "jg-hero-intro";
  w.jgHeroIntro = { state: "idle", result: null };

  function set(state: string) {
    style.textContent =
      cfg.css.active + (state === "reveal" ? "" : cfg.css.hidden) + (state === "wait" ? cfg.css.wait : "");
    if (!style.parentNode) d.head.appendChild(style);
    w.jgHeroIntro.state = state;
  }

  function heading(): HTMLElement | null {
    return d.getElementById("hero-cim");
  }

  function onSkip(): boolean {
    const a = d.activeElement as any;
    return !!(a && a.closest && a.closest("[data-intro-skip]"));
  }

  function finish(result: string, moveFocus?: boolean) {
    if (done) return;
    done = true;
    for (let i = 0; i < anims.length; i++) {
      try {
        anims[i].cancel();
      } catch {}
    }
    for (let j = 0; j < timers.length; j++) clearTimeout(timers[j]);
    if (style.parentNode) style.parentNode.removeChild(style);
    w.jgHeroIntro = { state: "done", result: result };
    off();
    if (moveFocus) {
      // A kihagyó gomb eltűnik; a fókusz a frissen feltárt hero-címre kerül
      // (nem a body-ra), innen a Tab a CTA-ra visz tovább.
      const hd = heading();
      if (hd) {
        if (!hd.hasAttribute("tabindex")) hd.setAttribute("tabindex", "-1");
        try {
          hd.focus({ preventScroll: true });
        } catch {
          hd.focus();
        }
      }
    }
  }

  // --- 2. Megszakítás: billentyű, érdemi interakció, környezetváltozás -----
  function onKey(e: KeyboardEvent) {
    if (e.key === "Escape") return finish("escape", onSkip());
    if (e.key === "Tab") {
      // Az első Tab a kihagyó gombra visz (a DOM első fókuszálható eleme).
      // Ha onnan — vagy Shift+Tabbal visszafelé — lépne tovább, a jelenet
      // kész állapotba ugrik, és a böngésző a természetes sorrendben folytatja.
      if (onSkip() || e.shiftKey) finish("tab");
      return;
    }
    if (e.key === "Shift" || e.key === "Control" || e.key === "Alt" || e.key === "Meta") return;
    if ((e.key === "Enter" || e.key === " ") && onSkip()) return; // a click kezeli
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
    // Takart elem nem kaphat láthatatlan fókuszt: bármi más fókusza lezár.
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

  set("wait");
  on();
  timers.push(setTimeout(function () {
    finish("timeout");
  }, cfg.hardLimitMs) as any);

  // --- 3. Assetek: a három réteg + fontok, korlátos várakozással -----------
  function ready(img: HTMLImageElement): Promise<void> {
    if (img.decode) return img.decode();
    return new Promise(function (res, rej) {
      if (img.complete && img.naturalWidth) return res();
      img.addEventListener("load", function () {
        res();
      });
      img.addEventListener("error", rej);
    });
  }

  function start() {
    if (done) return;
    try {
      const slot = d.querySelector("[data-hero-emblem]") as HTMLElement | null;
      const root = d.querySelector("[data-emblem-root]") as HTMLElement | null;
      const imgs = root ? root.querySelectorAll("img[data-layer]") : [];
      if (!slot || !root || imgs.length !== 3) return finish("missing");
      const waits: Promise<unknown>[] = [];
      for (let i = 0; i < imgs.length; i++) waits.push(ready(imgs[i] as HTMLImageElement));
      if ((d as any).fonts && (d as any).fonts.ready) waits.push((d as any).fonts.ready);
      const left = Math.max(0, cfg.assetWaitMs - (performance.now() - t0));
      timers.push(setTimeout(function () {
        finish("slow-assets");
      }, left) as any);
      Promise.all(waits).then(
        function () {
          if (!done) play(slot as HTMLElement, root as HTMLElement);
        },
        function () {
          finish("asset-error");
        },
      );
    } catch {
      finish("error");
    }
  }

  // --- 4. Lejátszás ---------------------------------------------------------
  function play(slot: HTMLElement, root: HTMLElement) {
    try {
      for (let k = 0; k < timers.length; k++) clearTimeout(timers[k]);
      timers = [];
      timers.push(setTimeout(function () {
        finish("timeout");
      }, cfg.hardLimitMs) as any);

      const r = slot.getBoundingClientRect();
      const vw = w.innerWidth;
      const vh = w.innerHeight;
      if (!r.width || !r.height || !vw || !vh) return finish("layout");

      // A célhelyzet a TÉNYLEGES elrendezésből: a slot közepe -> viewport közepe.
      const startH = Math.min(vh * cfg.startHeightVh, ((vw * cfg.startWidthVw) * r.height) / r.width);
      const s0 = Math.min(cfg.maxStartScale, startH / r.height);
      const dx = vw / 2 - (r.left + r.width / 2);
      const dy = vh / 2 - (r.top + r.height / 2);
      const startT = "translate3d(" + dx.toFixed(1) + "px," + dy.toFixed(1) + "px,0) scale(" + s0.toFixed(4) + ")";

      const hold = cfg.assembleMs + cfg.settleMs;
      const total = hold + cfg.flightMs;
      const fill = "both";

      anims.push(
        root.animate(
          [
            { transform: startT, offset: 0 },
            { transform: startT, offset: hold / total, easing: "cubic-bezier(0.65,0,0.25,1)" },
            { transform: "translate3d(0,0,0) scale(1)", offset: 1 },
          ],
          { duration: total, fill: fill } as any,
        ),
      );

      const layers = root.querySelectorAll("img[data-layer]");
      for (let i = 0; i < layers.length; i++) {
        const el = layers[i] as HTMLElement;
        const spec = cfg.layers[el.getAttribute("data-layer") || ""];
        if (!spec) continue;
        anims.push(
          el.animate(
            [
              { transform: spec.from, opacity: 0 },
              { opacity: 1, offset: 0.4 },
              { transform: "none", opacity: 1 },
            ],
            {
              duration: cfg.assembleMs - spec.delay,
              delay: spec.delay,
              easing: "cubic-bezier(0.22,0.9,0.3,1)",
              fill: fill,
            } as any,
          ),
        );
      }

      // A padlófény a megérkezéssel együtt jelenik meg: az összeállás alatt
      // az embléma még a takarás „semleges" terében lebeg.
      const floor = root.querySelector("[data-emblem-floor]") as HTMLElement | null;
      if (floor) {
        anims.push(
          floor.animate([{ opacity: 0 }, { opacity: 1 }], {
            delay: cfg.assembleMs,
            duration: cfg.settleMs + cfg.flightMs,
            easing: "ease-in-out",
            fill: fill,
          } as any),
        );
      }

      const cover = d.querySelector("[data-intro-cover]") as HTMLElement | null;
      if (cover) {
        anims.push(
          cover.animate([{ opacity: 1 }, { opacity: 0 }], {
            delay: hold,
            duration: cfg.flightMs * 0.85,
            easing: "cubic-bezier(0.4,0,0.2,1)",
            fill: fill,
          } as any),
        );
      }

      const header = d.querySelector(".jg-header") as HTMLElement | null;
      if (header) {
        anims.push(
          header.animate([{ opacity: 0 }, { opacity: 1 }], {
            delay: cfg.revealDelayMs,
            duration: cfg.revealMs,
            easing: "ease-out",
            fill: fill,
          } as any),
        );
      }

      const reveal = d.querySelectorAll("[data-intro-reveal]");
      for (let j = 0; j < reveal.length; j++) {
        anims.push(
          (reveal[j] as HTMLElement).animate(
            [
              { opacity: 0, transform: "translate3d(0,10px,0)" },
              { opacity: 1, transform: "translate3d(0,0,0)" },
            ],
            {
              delay: cfg.revealDelayMs + j * cfg.revealStaggerMs,
              duration: cfg.revealMs,
              easing: "cubic-bezier(0.22,0.61,0.36,1)",
              fill: fill,
            } as any,
          ),
        );
      }

      set("play");
      timers.push(setTimeout(function () {
        if (!done) set("reveal");
      }, cfg.revealDelayMs) as any);

      const all: Promise<unknown>[] = [];
      for (let a = 0; a < anims.length; a++) all.push(anims[a].finished);
      Promise.all(all).then(
        function () {
          finish("complete");
        },
        function () {
          finish("cancelled");
        },
      );
    } catch {
      finish("error");
    }
  }

  if (d.readyState === "loading") {
    d.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
}
/* eslint-enable @typescript-eslint/no-explicit-any */

/** A HTML-be ágyazandó, önálló script. */
export function heroIntroScript(cfg: IntroConfig = introConfig): string {
  return "(" + heroIntro.toString() + ")(" + JSON.stringify(cfg) + ");";
}
