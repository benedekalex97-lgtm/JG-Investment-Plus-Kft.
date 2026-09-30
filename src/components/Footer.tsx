import Image from "next/image";
import Link from "next/link";
import { footer } from "@/content/homepage";
import khLogo from "../../public/brand/kh-logo-dark.png";
import Logo from "./Logo";
import SectionTransition from "./SectionTransition";

/**
 * Footer — a SOT 10. szakaszának kötelező rövid változata, teljes szöveggel.
 * A márkaazonosító elsődlegesen a JG Logo System v1.0 horizontal lockupja
 * (ld. Logo.tsx). A legalsó, önálló sávban megjelenik a K&H Értékpapír
 * logója is (Reni által elfogadva), a JG brandnél vizuálisan kisebb súllyal,
 * a kötelező compliance-mondat mellett.
 *
 * v1.4: a footer a legmélyebb felületre (surface-sink) került, felső élén
 * szakaszhatár-fényvonallal és nagyon gyenge Aubergine atmoszférával; a
 * lockup ugyanaz, mint a headerben, így a lap eleje és vége ugyanazt a
 * jelet zárja körbe.
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
        v1.1 — LEGAL CONSOLIDATION: a Panaszkezelés/Impresszum blokk
        (korábban LegalRiskBlock) átköltözött a /jogi-tajekoztato oldalra és
        a komponens törölve — a Footer közvetlen előde ismét a Kapcsolat
        szakasz (Section tone="deep"). A sáv ezért továbbra is `deep`-ről
        indul, csak most eggyel közvetlenebbül: Kapcsolat → Footer egyetlen,
        folytonos sötét záró-zónaként olvasódik, érzékelhető váltás nélkül
        (mindkét oldal azonos tónuscsaládba tartozik).
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
              className="group inline-flex min-h-11 items-center rounded"
            >
              <Logo
                variant="horizontal"
                theme="dark"
                className="text-[0.875rem] transition-colors duration-200 group-hover:text-white lg:text-[0.9375rem]"
              />
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

        {/*
          K&H-LOGÓ — külön, alárendelt sáv a copyright alatt:
          a lap legkevésbé hangsúlyos pontja, szándékosan a JG saját
          brandingja (a footer tetején, ld. fent) UTÁN. A logó statikus, nem
          kattintható, nincs keret/árnyék/hover-CTA — pusztán másodlagos
          információs jelzés a kötelező compliance-mondat mellett.
        */}
        <div className="mt-8 flex flex-col items-start gap-4 border-t border-white/12 pt-8 sm:flex-row sm:items-center">
          {/*
            A logó magassága szándékosan a mellette futó szöveg 2 sornyi
            magasságához igazodik (text-xs · leading-relaxed = 1.625 →
            2 × 1.625 × 0.75rem = 2.4375rem), NEM önálló fix méretből indul —
            így a logó vizuális súlya mindig a szöveghez, nem egy tetszőleges
            pixelértékhez van kötve. A szélesség a logó saját arányából adódik
            (w-auto, a kép natív méretarányát megtartva).
          */}
          <Image
            src={khLogo}
            alt={footer.khPartnerLogo.alt}
            className="h-[2.4375rem] w-auto shrink-0 opacity-90"
          />
          <p className="max-w-[60ch] text-xs leading-relaxed text-cool-silver">
            {footer.khPartnerLogo.complianceLine}
          </p>
        </div>
      </div>
    </footer>
  );
}
