"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import Link from "next/link";
import ContactCta from "./ContactCta";
import Reveal from "./Reveal";
import { MaskWords, rv } from "./RevealParts";
import { tradingPlatforms as t } from "@/content/trading-platforms";
import {
  MOBILTRADER_FRAMES,
  MOBILTRADER_SIZE,
  WEBTRADER_FRAMES,
  WEBTRADER_SIZE,
} from "@/content/trading-platforms-frames";
import {
  createWindowedPlayer,
  frameIndexAt,
  loadInOrder,
  nearestAvailable,
  type WindowedPlayer,
} from "@/lib/frame-sequence";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const BASE = "/trading-platforms";
const frameSrc = (n: number) => `${BASE}/mobiltrader/f-${String(n).padStart(3, "0")}.webp`;
const FIRST_FRAME = MOBILTRADER_FRAMES[0][0];
/** Reduced motion / statikus végállapot: a Teljesítmény-adatok látszanak. */
const STILL_FRAME = 184;
const MT_PROGRESS = MOBILTRADER_FRAMES.map((f) => f[1]);

/* Webtrader: a kockák a négy hivatalos oktatóvideóból valók; a fájlnév a
   WEBTRADER_FRAMES-beli sorszám. 1280 px (desktop) és 760 px (mobil). */
const wtSrc = (size: "1280" | "760", i: number) =>
  `${BASE}/webtrader/${size}/f-${String(i).padStart(3, "0")}.webp`;
const wtSet = (i: number) => `${wtSrc("760", i)} 760w, ${wtSrc("1280", i)} 1280w`;
const WT_SIZES = "(min-width: 1024px) 860px, 92vw";
const WT_PROGRESS = WEBTRADER_FRAMES.map((f) => f[2]);
/** Poszter: a jelenetsor első kockája (portfólió áttekintése). */
const WT_POSTER = 0;
/** Reduced motion: az OTP Bank adatlapja grafikonnal (a 3. szakasz eleje). */
const WT_STILL = WEBTRADER_FRAMES.findIndex((f) => f[0] === "v_AP_bpaKkI" && f[1] === 22);
/** Telefonos nézet: a laptop nem jelenik meg, csak a K&H mobiltrader (ld. CSS). */
const PHONE_QUERY = "(max-width: 767px), (max-height: 499px) and (max-width: 1023px)";
/** A kijelző (CSS px × DPR, legfeljebb 2) e fölött a 1280-as, alatta a 760-as kockákat tölti. */
const WT_BIG_ABOVE = 800;
/** A Számlanyitás gomb egyszeri kiemelése ennél a közös előrehaladásnál indul. */
const CUE_AT = 0.9;

/**
 * TradingPlatforms — 04. szakasz, „Kereskedési felületek".
 *
 * KOMPOZÍCIÓ: bal oldalt laptop (K&H webtrader), jobb oldalt álló telefon
 * (K&H mobiltrader), szemből, közös alapvonalon. Az eszközkeretek CSS-sel
 * készülnek és MOZDULATLANOK: csak a kijelzők tartalma változik.
 *
 * GÖRGETÉS: natív görgetés, nincs scroll-jacking. Desktopon (>= 1024 px
 * szélesség és >= 640 px magasság) a teljes jelenet CSS sticky; egyetlen
 * ScrollTrigger méri az előrehaladást (scrub), és egy proxy-értéken át
 * közvetlenül a canvasokat frissíti — nincs React state képkockánként.
 * Telefonos nézetben (< 768 px) csak a K&H mobiltrader látszik. Tableten és
 * keskeny desktopon a laptop és a telefon egyaránt a saját, AZONOS magasságú
 * sticky sávjában fut végig a jeleneten (.tp-laptop-track / .tp-phone-track,
 * azonos start/end logika), ezért a két kijelző scroll-hossza pixelre egyezik.
 *
 * MÉDIA: mindkét eszköz képkockái (valódi felvételkockák, WebP) a szakasz
 * közelében töltődnek, fokozatosan (frame-sequence.ts); amíg nincsenek meg, a
 * statikus poszter látszik. A telefon canvasa a forrás natív felbontásán
 * rajzol (376×834); a laptopé a nézethez illő méretet (1280 vagy 760 px)
 * tölti, és a dekódolt kockákból csak a kért körüli ablakot tartja memóriában.
 *
 * REDUCED MOTION: nincs sticky sáv, nincs scrub és nincs kocka-letöltés (CSS +
 * matchMedia); a kijelzőkön informatív állóképek jelennek meg (adatlap
 * grafikonnal).
 */
export default function TradingPlatforms() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    (_context, contextSafe) => {
      const section = sectionRef.current;
      if (!section || !contextSafe) return;
      const q = gsap.utils.selector(section);
      const ctaWrap = q(".tp-cta")[0] as HTMLElement | undefined;
      const track = q(".tp-track")[0] as HTMLElement | undefined;
      const stage = q(".tp-stage")[0] as HTMLElement | undefined;
      const phoneTrack = q(".tp-phone-track")[0] as HTMLElement | undefined;
      const laptopTrack = q(".tp-laptop-track")[0] as HTMLElement | undefined;
      const phoneFig = q(".tp-phone-fig")[0] as HTMLElement | undefined;
      const laptopFig = q(".tp-laptop-fig")[0] as HTMLElement | undefined;
      const wtScreen = q(".tp-screen--wt")[0] as HTMLElement | undefined;
      const wtCanvas = q(".tp-canvas--wt")[0] as HTMLCanvasElement | undefined;
      const canvas = q(".tp-canvas--mt")[0] as HTMLCanvasElement | undefined;
      if (
        !track || !stage || !phoneTrack || !laptopTrack || !phoneFig || !laptopFig ||
        !wtScreen || !wtCanvas || !canvas
      ) {
        return;
      }
      const ctx2d = canvas.getContext("2d");

      /* ---- Telefon: képkocka-betöltés (a kockák mind dekódolva maradnak). ---- */
      const frames: (HTMLImageElement | null)[] = MOBILTRADER_FRAMES.map(() => null);
      let wanted = 0;
      let drawn = -1;
      let started = false;
      let disposed = false;

      const draw = () => {
        if (!ctx2d) return;
        // A kért kocka, vagy ha még nincs meg, a legközelebbi betöltött.
        const i = nearestAvailable(wanted, frames.length, (k) => frames[k] !== null);
        if (i < 0 || i === drawn) return;
        ctx2d.drawImage(frames[i]!, 0, 0, canvas.width, canvas.height);
        drawn = i;
        canvas.dataset.drawn = String(i);
        canvas.dataset.ready = "true";
      };

      const loadPhone = async () => {
        const loadOne = async (i: number) => {
          const img = new Image();
          img.decoding = "async";
          img.src = frameSrc(MOBILTRADER_FRAMES[i][0]);
          try {
            await img.decode();
            if (disposed) return;
            frames[i] = img;
            draw();
          } catch {
            /* Hibás kocka: kimarad, a legközelebbi kocka / poszter marad látható. */
          }
        };
        await loadInOrder(frames.length, loadOne, () => disposed);
      };

      /* ---- Laptop: képkocka-betöltés, dekódolt kockák csúszó ablakban. ---- */
      let wtPlayer: WindowedPlayer | null = null;
      let wtProgress = 0;
      // Telefonos nézetben a laptop nem jelenik meg (CSS), ezért nem is töltünk.
      let laptopOn = true;
      const startWebtrader = () => {
        if (wtPlayer || !laptopOn) return;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const big = wtScreen.getBoundingClientRect().width * dpr > WT_BIG_ABOVE;
        const size = big ? "1280" : "760";
        // A canvas a betöltött kockák natív méretén rajzol; a CSS méretezi.
        wtCanvas.width = big ? WEBTRADER_SIZE.width : 760;
        wtCanvas.height = big ? WEBTRADER_SIZE.height : Math.round((760 * WEBTRADER_SIZE.height) / WEBTRADER_SIZE.width);
        wtCanvas.dataset.size = size;
        wtPlayer = createWindowedPlayer({
          canvas: wtCanvas,
          progress: WT_PROGRESS,
          url: (i) => wtSrc(size, i),
        });
        wtPlayer.setProgress(wtProgress);
        wtPlayer.start();
      };

      const io = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) {
            io.disconnect();
            if (!started) {
              started = true;
              void loadPhone();
            }
            startWebtrader();
          }
        },
        { rootMargin: "400% 0px 400% 0px" },
      );
      // Csak mozgásos módban figyelünk (ld. matchMedia lent): reduced motion
      // esetén a canvasok rejtettek, a kockákra nincs szükség.
      let watching = false;
      const watchForLoad = () => {
        if (watching || started) return;
        watching = true;
        io.observe(section);
      };

      /* ---- Renderelés az előrehaladásból (nincs React state). ---- */
      const renderLaptop = (p: number) => {
        wtProgress = p;
        wtPlayer?.setProgress(p);
      };
      const renderPhone = (p: number) => {
        const i = frameIndexAt(MT_PROGRESS, p);
        if (i === wanted && i === drawn) return;
        wanted = i;
        canvas.dataset.wanted = String(i);
        draw();
      };

      const stickyTop = () => parseFloat(getComputedStyle(stage).top) || 0;
      const trackTop = (tr: HTMLElement) => {
        const sticky = tr.firstElementChild as HTMLElement | null;
        return sticky ? parseFloat(getComputedStyle(sticky).top) || 0 : 0;
      };
      // Teszteléshez / ellenőrzéshez: az egyes kijelzők trigger-hossza (px).
      const recordLen = (el: HTMLElement) => (self: ScrollTrigger) => {
        el.dataset.scrollLen = String(Math.round(self.end - self.start));
      };

      /* ---- Számlanyitás CTA: egyszeri, rövid kiemelés (desktop). ----
         Amikor a bemutató a végére ér (közös előrehaladás ≥ CUE_AT), a gombon
         egy fénycsík halad át, és a nyíl hegye apró előre-lökést tesz
         (összesen ~660 ms, csak transform + opacity). Oldalbetöltésenként
         legfeljebb EGYSZER (a jelző a matchMedia újrafutásait is túléli);
         reduced motion alatt soha (a lenti ág nem fut). < 1024 px-en a gomb
         rejtve van — ott nincs mit kiemelni, és a jelző sem fogy el. */
      let cuePlayed = false;
      const cue = contextSafe(() => {
        if (cuePlayed) return;
        const cta = section.querySelector<HTMLElement>(".tp-cta .jg-cta");
        if (!cta || cta.getClientRects().length === 0) return;
        // Csak ténylegesen látható gombon (pl. a szakasz utáni újratöltéskor a
        // scrub p = 1-gyel indul, de a gomb nincs a képernyőn: nem fogy el).
        const r = cta.getBoundingClientRect();
        if (r.top < 0 || r.bottom > window.innerHeight) return;
        cuePlayed = true;
        cta.dataset.cue = "played";
        const band = cta.querySelector(".jg-cta-sheen-band");
        const head = cta.querySelector(".jg-arrow-head");
        gsap
          .timeline()
          .fromTo(
            band,
            { xPercent: -110, opacity: 1 },
            { xPercent: 235, duration: 0.6, ease: "power2.inOut" },
            0,
          )
          .set(band, { opacity: 0 })
          .to(head, { x: 4, duration: 0.16, ease: "power2.out" }, 0.28)
          .to(head, { x: 0, duration: 0.22, ease: "power2.inOut" }, 0.44);
      });

      const mm = gsap.matchMedia();
      mm.add(
        {
          wide: "(min-width: 1024px) and (min-height: 640px)",
          tall: "(min-height: 500px)",
          motion: "(prefers-reduced-motion: no-preference)",
          phone: PHONE_QUERY,
        },
        (context) => {
          const { wide, tall, motion, phone } = context.conditions as {
            wide: boolean;
            tall: boolean;
            motion: boolean;
            phone: boolean;
          };
          laptopOn = !phone;
          if (!motion) return; // Statikus: a CSS az állóképeket mutatja; nincs scrub.

          watchForLoad();
          if (laptopOn && started) startWebtrader();

          if (wide) {
            // A) egyetlen közös trigger: a laptop és a telefon ugyanazt méri.
            const proxy = { p: 0 };
            gsap.to(proxy, {
              p: 1,
              ease: "none",
              onUpdate: () => {
                renderLaptop(proxy.p);
                renderPhone(proxy.p);
                if (proxy.p >= CUE_AT) cue();
              },
              scrollTrigger: {
                trigger: track,
                start: () => `top ${stickyTop()}px`,
                end: "bottom bottom",
                scrub: 0.35,
                invalidateOnRefresh: true,
                onRefresh: (self) => {
                  recordLen(laptopFig)(self);
                  recordLen(phoneFig)(self);
                },
              },
            });
            renderLaptop(0);
            renderPhone(0);
          } else {
            // B) sticky sáv (elég magas nézet) / C) azonos magasságú blokk
            // (alacsony nézet): a laptop és a telefon azonos logikát és azonos
            // magasságú sávot kap, ezért a trigger hossza pixelre egyezik.
            // A hossz EGYETLEN közös számítás (nem két külön „bottom bottom"
            // mérés), így a két trigger end − start értéke pixelre azonos —
            // a törtpixeles elrendezés sem tud 1 px eltérést okozni.
            const sharedLen = () => {
              const tallest = Math.max(laptopTrack.offsetHeight, phoneTrack.offsetHeight);
              return tall
                ? Math.round(tallest - (window.innerHeight - trackTop(phoneTrack)))
                : Math.round(tallest + window.innerHeight * 0.6);
            };
            const config = (tr: HTMLElement, fig: HTMLElement): ScrollTrigger.Vars => ({
              trigger: tr,
              start: tall ? () => `top ${trackTop(tr)}px` : "top 80%",
              end: () => `+=${sharedLen()}`,
              scrub: 0.35,
              invalidateOnRefresh: true,
              onRefresh: recordLen(fig),
            });
            if (!phone) {
              const lp = { p: 0 };
              gsap.to(lp, {
                p: 1,
                ease: "none",
                onUpdate: () => renderLaptop(lp.p),
                scrollTrigger: config(laptopTrack, laptopFig),
              });
              renderLaptop(0);
            }
            const pp = { p: 0 };
            gsap.to(pp, {
              p: 1,
              ease: "none",
              onUpdate: () => renderPhone(pp.p),
              scrollTrigger: config(phoneTrack, phoneFig),
            });
            renderPhone(0);
            // Alacsony desktop (>= 1024 px, < 640 px magas): nincs közös sticky
            // jelenet, a gomb a szakasz alján görget be — ott kap kiemelést,
            // amikor teljesen láthatóvá vált. (< 1024 px-en a gomb rejtve: a
            // cue() ilyenkor nem csinál semmit.)
            if (ctaWrap) {
              ScrollTrigger.create({
                trigger: ctaWrap,
                start: "bottom bottom-=16",
                onEnter: cue,
              });
            }
          }
        },
      );

      return () => {
        disposed = true;
        io.disconnect();
        wtPlayer?.dispose();
        mm.revert();
      };
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      id="kereskedesi-feluletek"
      aria-labelledby="kereskedesi-feluletek-cim"
      className="on-dark relative bg-surface-deep"
    >
      <div aria-hidden="true" className="jg-deep-atmosphere pointer-events-none absolute inset-0" />

      <div className="tp-track relative">
        <div className="tp-stage jg-safe-x relative mx-auto w-full max-w-[1280px]">
          <Reveal variant="group">
            <div className="tp-head">
              <div>
                <p className="flex items-baseline gap-3.5 text-sm font-semibold tracking-[0.18em] uppercase text-signal-berry-light">
                  <span className="tabular-nums text-cool-silver">{t.sectionNumber}</span>
                  <span
                    aria-hidden="true"
                    data-rv="rule"
                    style={rv(0)}
                    className="h-px w-7 bg-signal-berry-light/50"
                  />
                </p>
                <h2
                  id="kereskedesi-feluletek-cim"
                  data-rv="mask"
                  style={rv(140)}
                  className="font-display mt-5 text-[2rem] leading-[1.1] tracking-[-0.014em] text-balance text-porcelain sm:text-[2.5rem] lg:text-[2.75rem]"
                >
                  <MaskWords text={t.heading} />
                </h2>
              </div>
              <p
                data-rv="rise"
                style={rv(280)}
                className="max-w-xl text-base leading-[1.72] text-pretty text-cool-silver sm:text-[1.0625rem]"
              >
                {t.lead}
              </p>
            </div>
          </Reveal>

          <p className="sr-only">{t.description}</p>

          <div className="tp-devices">
            {/* ---------- Laptop: K&H webtrader ---------- */}
            <div className="tp-laptop-track">
              <div className="tp-laptop-sticky">
                <figure className="tp-laptop-fig">
                  <div className="tp-laptop">
                    <div className="tp-lid">
                      <span aria-hidden="true" className="tp-cam" />
                      <div
                        className="tp-screen tp-screen--wt"
                        role="img"
                        aria-label={t.webtrader.alt}
                        style={{ aspectRatio: `${WEBTRADER_SIZE.width} / ${WEBTRADER_SIZE.height}` }}
                      >
                        <picture>
                          {/* Reduced motion: informatív állókép (adatlap grafikonnal). */}
                          <source
                            media="(prefers-reduced-motion: reduce)"
                            srcSet={wtSet(WT_STILL)}
                            sizes={WT_SIZES}
                          />
                          {/* Poszter: azonnal látszik; a canvas a betöltött kockákat fölé rajzolja. */}
                          <img
                            className="tp-wt-poster"
                            src={wtSrc("1280", WT_POSTER)}
                            srcSet={wtSet(WT_POSTER)}
                            sizes={WT_SIZES}
                            width={WEBTRADER_SIZE.width}
                            height={WEBTRADER_SIZE.height}
                            alt=""
                            decoding="async"
                            loading="lazy"
                            draggable={false}
                          />
                        </picture>
                        <canvas
                          className="tp-canvas tp-canvas--wt"
                          width={WEBTRADER_SIZE.width}
                          height={WEBTRADER_SIZE.height}
                          aria-hidden="true"
                        />
                      </div>
                    </div>
                    <div aria-hidden="true" className="tp-base" />
                  </div>
                  <figcaption className="tp-caption">
                    <span className="tp-caption-name">{t.webtrader.name}</span>
                    <span className="tp-caption-detail">{t.webtrader.detail}</span>
                  </figcaption>
                </figure>
              </div>
            </div>

            {/* ---------- Telefon: K&H mobiltrader ---------- */}
            <div className="tp-phone-track">
              <div className="tp-phone-sticky">
                <figure className="tp-phone-fig">
                  <div className="tp-phone">
                    <div
                      className="tp-screen tp-screen--mt"
                      role="img"
                      aria-label={t.mobiltrader.alt}
                      style={{
                        aspectRatio: `${MOBILTRADER_SIZE.width} / ${MOBILTRADER_SIZE.height}`,
                      }}
                    >
                      <picture>
                        <source media="(prefers-reduced-motion: reduce)" srcSet={frameSrc(STILL_FRAME)} />
                        {/* Poszter: azonnal látszik; a canvas a betöltött kockákat fölé rajzolja. */}
                        <img
                          className="tp-poster"
                          src={frameSrc(FIRST_FRAME)}
                          width={MOBILTRADER_SIZE.width}
                          height={MOBILTRADER_SIZE.height}
                          alt=""
                          decoding="async"
                          loading="lazy"
                          draggable={false}
                        />
                      </picture>
                      <canvas
                        className="tp-canvas tp-canvas--mt"
                        width={MOBILTRADER_SIZE.width}
                        height={MOBILTRADER_SIZE.height}
                        aria-hidden="true"
                      />
                    </div>
                  </div>
                  <figcaption className="tp-caption">
                    <span className="tp-caption-name">{t.mobiltrader.name}</span>
                    <span className="tp-caption-detail">{t.mobiltrader.detail}</span>
                  </figcaption>
                </figure>
              </div>
            </div>
          </div>

          <div className="tp-foot">
            <p className="tp-note">{t.notice}</p>
            {/* Desktop: Számlanyitás CTA. < 1024 px-en az alsó kapcsolat-sáv veszi át
                (MobileContactBar), ezért itt a CSS elrejti. */}
            <div className="tp-actions">
              {/* Útmutató-link: minden szélességen látható (mobilon a közlés alatt). */}
              <p className="tp-guide">
                {/* A bevezető kérdés keskeny desktopon (1024–1279 px) rejtett, hogy
                    a közlés ne nyúljon túl a sticky színpadon; a link neve ekkor is
                    teljes marad (sr-only előtag). */}
                <span className="tp-guide-lead">{t.guideLink.lead} </span>
                <Link href={t.guideLink.href} className="tp-guide-link">
                  <span className="sr-only">Számlanyitás </span>
                  {t.guideLink.label} →
                </Link>
              </p>
              <div className="tp-cta">
                <ContactCta
                  href={t.cta.href}
                  label={t.cta.label}
                  tone="dark"
                  emphasis="primary"
                  display="inline-flex"
                  className="min-h-12 gap-6 pr-5 pl-6 text-[0.9375rem]"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
