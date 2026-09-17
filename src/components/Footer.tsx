import Link from "next/link";
import { footer, meta } from "@/content/homepage";
import SectionTransition from "./SectionTransition";

/**
 * Footer — a SOT 10. szakaszának kötelező rövid változata, teljes szöveggel.
 * Nem jelenik meg K&H- vagy Patria-logó; a wordmark egyszerű szöveg.
 *
 * v1.4: a footer a legmélyebb felületre (surface-sink) került, felső élén
 * szakaszhatár-fényvonallal és nagyon gyenge Aubergine atmoszférával; a
 * wordmark ugyanazt a Berry signature-rudat kapja, mint a headerben, így a
 * lap eleje és vége ugyanazt a jelet zárja körbe.
 *
 * v0.2 anyagvilág: Carbon alap, Porcelain/Cool Silver tipográfia, egyetlen
 * nagyon visszafogott Aubergine jelzővonal a wordmark alatt — signature
 * érintés, nem dekoráció. A .on-dark osztály a fókuszgyűrűt Porcelainre
 * váltja (ld. globals.css), mert az Aubergine kontrasztja Carbonon 1.57:1,
 * ami sötét alapon nem elég szöveghez/fókuszhoz.
 */
export default function Footer() {
  return (
    <footer className="on-dark relative bg-surface-sink">
      {/*
        v1.4 — a footer valódi LEZÁRÁS, nem sötét doboz: nagyon gyenge
        Aubergine atmoszféra, amitől a szem lezárásként olvassa, nem egy újabb
        szakaszként. Dekoratív.
      */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_46%_at_18%_0%,rgb(97_70_94/22%)_0%,transparent_68%)]"
      />

      {/*
        v1.1 — POST-LAUNCH UI & STRUCTURE POLISH: a közvetlen előd immár a
        Panaszkezelés/Impresszum blokk (LegalRiskBlock), ami a részletes Jogi
        tájékoztató kiszervezése óta SÖTÉT felület (korábban Porcelain volt,
        amikor még ott állt a teljes Jogi tájékoztató szöveg is). A sáv ezért
        `deep`-ről, nem `canvas`-ról indul — mindkét oldala azonos tónusú,
        tehát a Kapcsolat → Panaszkezelés/Impresszum → Footer zóna egyetlen,
        folytonos sötét záró-egységként olvasódik, érzékelhető váltás nélkül.
      */}
      <SectionTransition from="deep" toDark />

      <div className="jg-safe-x jg-safe-b relative mx-auto w-full max-w-[1280px] py-16 lg:py-24 [--jg-safe-b-base:4rem] lg:[--jg-safe-b-base:6rem]">
        {/*
          Kétoszlopos hierarchia: balra a márka és a státusz, jobbra a
          hosszabb jogi szöveg. Mobilon egymás alatt, logikus sorrendben.
        */}
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-4">
            <Link
              href="/#top"
              className="group inline-flex min-h-11 items-center gap-3 rounded"
            >
              <span
                aria-hidden="true"
                className="jg-wordmark-rule block h-6 w-0.5 shrink-0 rounded-full"
              />
              <span className="font-display text-xl tracking-[-0.015em] text-porcelain transition-colors duration-200 group-hover:text-white">
                {meta.wordmark}
              </span>
            </Link>
            <span
              aria-hidden="true"
              className="mt-5 block h-px w-14 bg-gradient-to-r from-signal-berry-light to-transparent"
            />
            <p className="mt-6 max-w-[42ch] text-[0.9375rem] leading-relaxed font-medium text-porcelain">
              {footer.statusLine}
            </p>
          </div>

          <div className="space-y-4 lg:col-span-8">
            <p className="max-w-[80ch] text-[0.9375rem] leading-relaxed text-cool-silver">
              {footer.brandLine}
            </p>
            <p className="max-w-[80ch] text-sm leading-relaxed text-cool-silver">
              {footer.disclaimerLine}
            </p>
          </div>
        </div>

        <nav aria-label="Lábléc" className="mt-14 border-t border-white/12 pt-8">
          <ul className="flex flex-wrap items-center gap-x-9 gap-y-1">
            {footer.links.map((link) => (
              <li key={link.label}>
                {link.href ? (
                  <a
                    href={link.href}
                    {...(link.href.startsWith("http")
                      ? { target: "_blank", rel: "noreferrer noopener" }
                      : {})}
                    className="inline-flex min-h-11 items-center text-[0.9375rem] font-medium text-porcelain underline decoration-white/30 underline-offset-4 transition-colors hover:text-signal-berry-light hover:decoration-signal-berry-light"
                  >
                    {link.label}
                  </a>
                ) : (
                  /*
                    Célhivatkozás nélküli lábléc-tétel esetén (pl. jövőbeli,
                    élesítés előtt pótlandó jogi dokumentum) a prototípus ezt
                    láthatóan jelzi, saját megfogalmazású szöveggel nem pótolva.
                  */
                  <span className="inline-flex min-h-11 items-center text-[0.9375rem] text-cool-silver">
                    {link.label}
                    <span className="ml-2 rounded border border-white/20 px-1.5 py-0.5 text-xs font-medium text-cool-silver">
                      élesítés előtt pótlandó
                    </span>
                  </span>
                )}
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-10 border-t border-white/12 pt-8">
          <p className="text-sm text-cool-silver">{footer.copyright}</p>
        </div>
      </div>
    </footer>
  );
}
