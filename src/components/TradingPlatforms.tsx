"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import Reveal from "./Reveal";
import { MaskWords, rv } from "./RevealParts";
import { tradingPlatforms as t } from "@/content/trading-platforms";
import {
  MOBILTRADER_FRAMES,
  MOBILTRADER_SIZE,
  WEBTRADER_SIZE,
} from "@/content/trading-platforms-frames";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const BASE = "/trading-platforms";
const frameSrc = (n: number) => `${BASE}/mobiltrader/f-${String(n).padStart(3, "0")}.webp`;
const FIRST_FRAME = MOBILTRADER_FRAMES[0][0];
/** Reduced motion / statikus végállapot: a Teljesítmény-adatok látszanak. */
const STILL_FRAME = 184;
const wtSet = (name: string) =>
  `${BASE}/${name}-760.webp 760w, ${BASE}/${name}-1268.webp 1268w`;
const WT_SIZES = "(min-width: 1024px) 860px, 92vw";

/*
 * A laptop két valódi webtrader-állapota közti áttűnés helye a közös
 * görgetési előrehaladáson. Ez visszafogott, REKONSTRUÁLT átmenet (opacity),
 * nem a webtrader saját animációja — a forrásban a kattintás nem látható.
 */
const WT_FADE_START = 0.34;
const WT_FADE_END = 0.44;

/** Az utolsó képkocka, amelynek előrehaladása <= p (bináris keresés). */
function frameIndexAt(p: number): number {
  let lo = 0;
  let hi = MOBILTRADER_FRAMES.length - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (MOBILTRADER_FRAMES[mid][1] <= p) lo = mid;
    else hi = mid - 1;
  }
  return lo;
}

/**
 * TradingPlatforms — 04. szakasz, „Kereskedési felületek".
 *
 * KOMPOZÍCIÓ: bal oldalt laptop (K&H webtrader), jobb oldalt álló telefon
 * (K&H mobiltrader), szemből, közös alapvonalon. Az eszközkeretek CSS-sel
 * készülnek és MOZDULATLANOK: csak a kijelzők tartalma változik.
 *
 * GÖRGETÉS: natív görgetés, nincs scroll-jacking. Desktopon (>= 1024 px
 * szélesség és >= 640 px magasság) a teljes jelenet CSS sticky; a
 * ScrollTrigger csak az előrehaladást méri (scrub), és egy proxy-értéken át
 * közvetlenül a DOM-ot/canvast frissíti — nincs React state képkockánként.
 * Keskeny nézetben a laptop a saját áthaladása alatt vált, a telefon egy
 * rövid sticky sávban fut végig a jeleneten.
 *
 * MÉDIA: a telefon képkockái (valódi GIF-kockák, WebP) a szakasz közelében
 * töltődnek, fokozatosan; amíg nincsenek meg, a statikus poszter látszik. A
 * canvas a forrás natív felbontásán rajzol (376×834), méretezést a CSS végez.
 *
 * REDUCED MOTION: nincs sticky sáv és nincs scrub (CSS + matchMedia); a
 * kijelzőkön informatív állóképek (adatlap grafikonnal) jelennek meg.
 */
export default function TradingPlatforms() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section) return;
      const q = gsap.utils.selector(section);
      const track = q(".tp-track")[0] as HTMLElement | undefined;
      const stage = q(".tp-stage")[0] as HTMLElement | undefined;
      const phoneTrack = q(".tp-phone-track")[0] as HTMLElement | undefined;
      const laptop = q(".tp-laptop")[0] as HTMLElement | undefined;
      const wtNext = q(".tp-wt-next")[0] as HTMLImageElement | undefined;
      const canvas = q(".tp-canvas")[0] as HTMLCanvasElement | undefined;
      if (!track || !stage || !phoneTrack || !laptop || !wtNext || !canvas) return;
      const ctx2d = canvas.getContext("2d");

      /* ---- Képkocka-betöltés: csak a szakasz közelében, fokozatosan. ---- */
      const frames: (HTMLImageElement | null)[] = MOBILTRADER_FRAMES.map(() => null);
      let wanted = 0;
      let drawn = -1;
      let started = false;
      let disposed = false;

      const draw = () => {
        if (!ctx2d) return;
        // A kért kocka, vagy ha még nincs meg, a legközelebbi korábbi betöltött.
        let i = wanted;
        while (i >= 0 && !frames[i]) i--;
        if (i < 0 || i === drawn) return;
        ctx2d.drawImage(frames[i]!, 0, 0, canvas.width, canvas.height);
        drawn = i;
        canvas.dataset.ready = "true";
      };

      const load = async () => {
        if (started) return;
        started = true;
        const order = MOBILTRADER_FRAMES.map((_, i) => i);
        let next = 0;
        const worker = async () => {
          while (!disposed && next < order.length) {
            const i = order[next++];
            const img = new Image();
            img.decoding = "async";
            img.src = frameSrc(MOBILTRADER_FRAMES[i][0]);
            try {
              await img.decode();
              if (disposed) return;
              frames[i] = img;
              if (i <= wanted) draw();
            } catch {
              /* Hibás kocka: kimarad, a korábbi kocka / poszter marad látható. */
            }
          }
        };
        await Promise.all([worker(), worker(), worker()]);
      };

      const io = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) {
            io.disconnect();
            void load();
          }
        },
        { rootMargin: "150% 0px 150% 0px" },
      );
      io.observe(section);

      /* ---- Renderelés az előrehaladásból (nincs React state). ---- */
      const renderLaptop = (p: number) => {
        const o = gsap.utils.clamp(0, 1, (p - WT_FADE_START) / (WT_FADE_END - WT_FADE_START));
        wtNext.style.opacity = String(o);
      };
      const renderPhone = (p: number) => {
        const i = frameIndexAt(p);
        if (i === wanted && i === drawn) return;
        wanted = i;
        draw();
      };

      // Hibás webtrader-kép esetén az első állapot marad.
      const onWtError = () => {
        wtNext.dataset.failed = "true";
      };
      wtNext.addEventListener("error", onWtError);

      const stickyTop = () => parseFloat(getComputedStyle(stage).top) || 0;
      const phoneTop = () => {
        const sticky = phoneTrack.firstElementChild as HTMLElement | null;
        return sticky ? parseFloat(getComputedStyle(sticky).top) || 0 : 0;
      };

      const mm = gsap.matchMedia();
      mm.add(
        {
          wide: "(min-width: 1024px) and (min-height: 640px)",
          tall: "(min-height: 560px)",
          motion: "(prefers-reduced-motion: no-preference)",
        },
        (context) => {
          const { wide, tall, motion } = context.conditions as {
            wide: boolean;
            tall: boolean;
            motion: boolean;
          };
          if (!motion) {
            // Statikus: a CSS a végállapot-képeket mutatja; nincs scrub.
            wtNext.style.opacity = "";
            return;
          }

          if (wide) {
            const proxy = { p: 0 };
            gsap.to(proxy, {
              p: 1,
              ease: "none",
              onUpdate: () => {
                renderLaptop(proxy.p);
                renderPhone(proxy.p);
              },
              scrollTrigger: {
                trigger: track,
                start: () => `top ${stickyTop()}px`,
                end: "bottom bottom",
                scrub: 0.35,
                invalidateOnRefresh: true,
              },
            });
            renderLaptop(0);
            renderPhone(0);
          } else {
            const lp = { p: 0 };
            gsap.to(lp, {
              p: 1,
              ease: "none",
              onUpdate: () => renderLaptop(lp.p),
              scrollTrigger: {
                // Az áttűnés (0,34–0,44) így nagyjából a nézet közepén történik.
                trigger: laptop,
                start: "top 70%",
                end: "bottom 30%",
                scrub: 0.35,
              },
            });
            const pp = { p: 0 };
            gsap.to(pp, {
              p: 1,
              ease: "none",
              onUpdate: () => renderPhone(pp.p),
              // B) sticky sáv (elég magas nézet) / C) sima áthaladás (alacsony nézet).
              scrollTrigger: tall
                ? {
                    trigger: phoneTrack,
                    start: () => `top ${phoneTop()}px`,
                    end: "bottom bottom",
                    scrub: 0.35,
                    invalidateOnRefresh: true,
                  }
                : {
                    trigger: phoneTrack,
                    start: "top 80%",
                    end: "bottom 20%",
                    scrub: 0.35,
                  },
            });
            renderLaptop(0);
            renderPhone(0);
          }

          return () => {
            wtNext.style.opacity = "";
          };
        },
      );

      return () => {
        disposed = true;
        io.disconnect();
        wtNext.removeEventListener("error", onWtError);
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
                className="max-w-md text-base leading-[1.72] text-pretty text-cool-silver sm:text-[1.0625rem]"
              >
                {t.lead}
              </p>
            </div>
          </Reveal>

          <p className="sr-only">{t.description}</p>

          <div className="tp-devices">
            {/* ---------- Laptop: K&H webtrader ---------- */}
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
                    {/* eslint-disable-next-line @next/next/no-img-element -- valódi képernyőkép, srcset-tel; az optimalizálás előre megtörtént */}
                    <img
                      className="tp-wt tp-wt-first"
                      src={`${BASE}/webtrader-portfolio-1268.webp`}
                      srcSet={wtSet("webtrader-portfolio")}
                      sizes={WT_SIZES}
                      width={WEBTRADER_SIZE.width}
                      height={WEBTRADER_SIZE.height}
                      alt=""
                      decoding="async"
                      loading="lazy"
                      draggable={false}
                    />
                    {/* eslint-disable-next-line @next/next/no-img-element -- ld. fent */}
                    <img
                      className="tp-wt tp-wt-next"
                      src={`${BASE}/webtrader-otp-detail-1268.webp`}
                      srcSet={wtSet("webtrader-otp-detail")}
                      sizes={WT_SIZES}
                      width={WEBTRADER_SIZE.width}
                      height={WEBTRADER_SIZE.height}
                      alt=""
                      decoding="async"
                      loading="lazy"
                      draggable={false}
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
                        className="tp-canvas"
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

          <p className="tp-note">
            <span>{t.disclaimer}</span> <span className="text-cool-silver/70">{t.sourceNote}</span>
          </p>
        </div>
      </div>
    </section>
  );
}
