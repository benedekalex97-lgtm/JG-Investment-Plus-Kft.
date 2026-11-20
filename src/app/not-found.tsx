import type { Metadata } from "next";
import Link from "next/link";
import ContactCta from "@/components/ContactCta";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { hero, meta, nav } from "@/content/homepage";

/**
 * 404 — magyar, arculatos „nem található" oldal (SEO-audit, 2026-11-20).
 *
 * Korábban a Next.js alapértelmezett, angol nyelvű oldala jelent meg
 * („404: This page could not be found."), visszaút nélkül. A HTTP-státusz
 * továbbra is 404, és a Next.js ehhez automatikusan noindex-et ad, így az
 * oldal nem kerül a keresőkbe.
 *
 * A keret (Header, max-width cikk, „Vissza a főoldalra" gomb, Footer)
 * ugyanaz, mint a jogi oldalaké; a második gomb a Hero meglévő ContactCta-ja
 * (felirat és cél a tartalmi modellből). Csak felhasználói mikroszöveg, pénzügyi állítás nincs.
 */

export const metadata: Metadata = {
  title: `Az oldal nem található · ${meta.wordmark}`,
};

export default function NotFound() {
  return (
    <>
      <a
        href="#fotartalom"
        className="on-dark sr-only rounded-lg bg-ink text-base font-medium text-porcelain focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-[100] focus:inline-flex focus:min-h-12 focus:items-center focus:px-5"
      >
        {nav.skipLink}
      </a>

      <Header />

      <main id="fotartalom" className="bg-canvas">
        <article className="jg-safe-x mx-auto w-full max-w-[800px] py-20 sm:py-24 lg:py-32">
          <p className="text-sm font-medium tracking-[0.12em] text-text-secondary uppercase">404-es hiba</p>

          <h1 className="font-display mt-4 text-[2rem] leading-[1.15] text-text-primary sm:text-[2.5rem]">
            Az oldal nem található
          </h1>

          <p className="mt-6 max-w-[60ch] text-base leading-relaxed text-text-primary sm:text-lg">
            A keresett oldal nem létezik, vagy megváltozott a címe. A főoldalról minden tartalmunk elérhető, és
            kérdés esetén szívesen segítünk.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link
              href="/#top"
              className="inline-flex min-h-12 items-center justify-center rounded-md border border-border-strong bg-transparent px-6 text-base font-medium text-text-primary transition-colors hover:border-ink"
            >
              ← Vissza a főoldalra
            </Link>
            <ContactCta
              href={hero.primaryCta.href}
              label={hero.primaryCta.label}
              tone="light"
              display="inline-flex"
              className="min-h-12 gap-6 pr-5 pl-6 text-base"
            />
          </div>
        </article>
      </main>

      <Footer />
    </>
  );
}
