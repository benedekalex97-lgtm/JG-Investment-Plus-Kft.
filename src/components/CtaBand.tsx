import { ctaBand } from "@/content/homepage";

/**
 * CtaBand — konverziós sáv a folyamat után.
 *
 * Az oldal egyetlen sötét (Carbon) szakasza: a kontraszt maga adja a
 * hangsúlyt, nem harsány szín, gradient vagy glow. A `.on-dark` osztály a
 * fókuszgyűrűt Porcelainre váltja (ld. globals.css), mert az Aubergine
 * kontrasztja Carbonon 1.57:1 — sötét alapon nem elég.
 *
 * Tudatosan NINCS benne sürgetés, visszaszámlálás, hiányérzet, hozamígéret
 * vagy mesterséges exkluzivitás.
 */
export default function CtaBand() {
  return (
    <section
      id="kapcsolatfelvetel"
      aria-labelledby="cta-sav-cim"
      className="on-dark bg-surface-dark"
    >
      <div className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <div className="grid items-center gap-8 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-8">
            <h2
              id="cta-sav-cim"
              className="font-display text-[1.75rem] leading-[1.2] text-balance text-text-on-dark sm:text-[2.25rem]"
            >
              {ctaBand.heading}
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-text-on-dark-secondary sm:text-lg">
              {ctaBand.body}
            </p>
          </div>

          <div className="lg:col-span-4 lg:justify-self-end">
            <a
              href={ctaBand.cta.href}
              className="inline-flex min-h-13 w-full items-center justify-center rounded-md bg-porcelain px-8 text-center text-sm font-semibold tracking-[0.1em] text-ink transition-colors hover:bg-white sm:w-auto sm:text-base"
            >
              {ctaBand.cta.label}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
