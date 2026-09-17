import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { meta, nav } from "@/content/homepage";
import { legalNotice } from "@/content/legal-notice";

/**
 * Jogi tájékoztató — önálló oldal (v1.1, POST-LAUNCH UI & STRUCTURE POLISH).
 *
 * A korábban a homepage-en (LegalRiskBlock, #jogi-tajekoztato) élő,
 * összecsukható accordionban megjelenő részletes jogi tartalom KÖLTÖZÖTT
 * ide, változatlan szöveggel — ld. src/content/legal-notice.ts fejlécét a
 * pontos indoklásért.
 *
 * A rendszer (Header, visszalépési lehetőség, max-width/content layout,
 * tipográfiai hierarchia, section spacing, Footer, mobil viselkedés,
 * accessibility) SZÁNDÉKOSAN azonos a /adatkezelesi-tajekoztato oldaléval —
 * nem a tartalom másolása, hanem a keretrendszer következetessége miatt.
 * Ebből következik, hogy itt sincs accordion: a homepage-en az accordion
 * kizárólag azért csukta össze alapból a témaköröket, hogy ne uralják a
 * homepage első képernyőjét — ez az ok egy önálló, dedikált jogi oldalon
 * nem áll fenn, ezért itt minden szakasz kattintás nélkül, azonnal
 * olvasható, ugyanúgy, mint az adatkezelési tájékoztató oldalon.
 *
 * v1.1 — POST-LAUNCH UI POLISH v1.1 (LEGAL CONSOLIDATION). A Panaszkezelés
 * és az Impresszum a homepage-ről (törölt LegalRiskBlock komponens) IDE
 * költözött, a meglévő 1–5. szakasszal AZONOS, világos vizuális rendszerrel
 * (nem a homepage-en használt sötét tónussal) — 6. és 7. szakaszként, a
 * meglévő számozott mintát folytatva. Stabil horgonyaik (#panaszkezeles,
 * #impresszum) VÁLTOZATLANOK maradtak, hogy a footer és a külső hivatkozások
 * törés nélkül működjenek, csak a cél oldala változott
 * (/jogi-tajekoztato#panaszkezeles, /jogi-tajekoztato#impresszum).
 *
 * A lead bekezdés utáni két gyorsnavigációs link (Panaszkezelés, Impresszum)
 * a meglévő, már használt "szekunder gomb" mintát viseli (ugyanaz a
 * className, mint a lap alján lévő "← Vissza a főoldalra" gombé) — nem új
 * gomb-design, csak egy már létező stílus újrafelhasználása két belső
 * horgonyra.
 */

export const metadata: Metadata = {
  title: `${legalNotice.heading} · ${meta.wordmark}`,
};

/** Ékezetek nélküli, kötőjeles azonosító a címsorokhoz (csak horgony-cél, nem tartalom). */
function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function BulletList({ items }: { items: readonly string[] }) {
  return (
    <ul className="mt-3 space-y-3">
      {items.map((item) => (
        <li
          key={item.slice(0, 48)}
          className="flex gap-3 text-base leading-relaxed text-text-primary"
        >
          <span
            aria-hidden="true"
            className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent"
          />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default function JogiTajekoztatoPage() {
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
        <article className="jg-safe-x mx-auto w-full max-w-[800px] py-16 sm:py-20 lg:py-24">
          {/*
            Ugyanaz a determinisztikus "/#top" cél, mint az adatkezelési
            tájékoztató oldalon — mindig a Hero id="top" elemére navigál.
          */}
          <Link
            href="/#top"
            className="inline-flex min-h-11 items-center text-sm font-medium text-text-secondary underline underline-offset-4 hover:text-text-primary"
          >
            ← Vissza a főoldalra
          </Link>

          <h1 className="font-display mt-6 text-[2rem] leading-[1.15] text-text-primary sm:text-[2.5rem]">
            {legalNotice.heading}
          </h1>

          <p className="mt-6 text-base leading-relaxed text-text-primary">
            {legalNotice.lead}
          </p>

          {/*
            Gyorsnavigáció a Panaszkezeléshez és az Impresszumhoz — a lap
            elején, hogy a footerből ide érkezők (vagy bárki, aki kifejezetten
            emiatt nyitja meg az oldalt) ne kelljen végiggörgetnie az 1–5.
            szakaszt. Szemantikailag navigáció, ezért valódi linkek, nem
            gombok. A meglévő, a lap alján is használt szekunder-gomb
            stílust viseli — nincs új szín vagy komponens.
          */}
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="#panaszkezeles"
              className="inline-flex min-h-12 items-center justify-center rounded-md border border-border-strong bg-transparent px-6 text-base font-medium text-text-primary transition-colors hover:border-ink"
            >
              Panaszkezelés
            </a>
            <a
              href="#impresszum"
              className="inline-flex min-h-12 items-center justify-center rounded-md border border-border-strong bg-transparent px-6 text-base font-medium text-text-primary transition-colors hover:border-ink"
            >
              Impresszum
            </a>
          </div>

          {/* 1. Szerepek és felelősség */}
          <h2
            id={slugify(legalNotice.status.heading)}
            className="font-display mt-14 scroll-mt-24 border-t border-border-strong pt-8 text-2xl leading-snug text-text-primary sm:text-[1.75rem]"
          >
            1. {legalNotice.status.heading}
          </h2>
          {legalNotice.status.paragraphs.map((paragraph) => (
            <p
              key={paragraph.slice(0, 48)}
              className="mt-4 text-base leading-relaxed text-text-primary"
            >
              {paragraph}
            </p>
          ))}

          {/* 2. Tevékenységi keretek */}
          <h2
            id={slugify(legalNotice.scope.heading)}
            className="font-display mt-14 scroll-mt-24 border-t border-border-strong pt-8 text-2xl leading-snug text-text-primary sm:text-[1.75rem]"
          >
            2. {legalNotice.scope.heading}
          </h2>
          {legalNotice.scope.paragraphs.map((paragraph) => (
            <p
              key={paragraph.slice(0, 48)}
              className="mt-4 text-base leading-relaxed text-text-primary"
            >
              {paragraph}
            </p>
          ))}

          {/* 3. Tevékenységi korlátok */}
          <h2
            id={slugify(legalNotice.limits.heading)}
            className="font-display mt-14 scroll-mt-24 border-t border-border-strong pt-8 text-2xl leading-snug text-text-primary sm:text-[1.75rem]"
          >
            3. {legalNotice.limits.heading}
          </h2>
          <BulletList items={legalNotice.limits.items} />

          {/* 4. Kockázatok */}
          <h2
            id={slugify(legalNotice.riskWarning.heading)}
            className="font-display mt-14 scroll-mt-24 border-t border-border-strong pt-8 text-2xl leading-snug text-text-primary sm:text-[1.75rem]"
          >
            4. {legalNotice.riskWarning.heading}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-text-primary">
            {legalNotice.riskWarning.body}
          </p>

          {/* 5. Jogi nyilatkozat */}
          <h2
            id={slugify(legalNotice.disclaimer.heading)}
            className="font-display mt-14 scroll-mt-24 border-t border-border-strong pt-8 text-2xl leading-snug text-text-primary sm:text-[1.75rem]"
          >
            5. {legalNotice.disclaimer.heading}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-text-primary">
            {legalNotice.disclaimer.body}
          </p>

          {/*
            6. Panaszkezelés — a homepage-ről költözött ide (törölt
            LegalRiskBlock). Stabil #panaszkezeles horgony, VÁLTOZATLAN
            szöveggel, a lap 1–5. szakaszával azonos világos stílusban.
          */}
          <h2
            id="panaszkezeles"
            className="font-display mt-14 scroll-mt-24 border-t border-border-strong pt-8 text-2xl leading-snug text-text-primary sm:text-[1.75rem]"
          >
            6. {legalNotice.complaints.heading}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-text-primary">
            {legalNotice.complaints.lead}
          </p>
          <ul className="mt-4 space-y-3">
            {legalNotice.complaints.items.map((item) => (
              <li
                key={item.label}
                className="flex flex-col gap-0.5 text-base leading-relaxed text-text-primary sm:flex-row sm:items-baseline sm:gap-4"
              >
                <span className="text-sm font-medium text-text-secondary sm:w-56 sm:shrink-0">
                  {item.label}
                </span>
                {item.href ? (
                  <a
                    href={item.href}
                    className="inline-flex min-h-11 items-center break-all font-medium text-accent underline underline-offset-4"
                  >
                    {item.value}
                  </a>
                ) : (
                  <span>{item.value}</span>
                )}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-base leading-relaxed text-text-primary">
            {legalNotice.complaints.closing}
          </p>

          {/*
            7. Impresszum — szintén a homepage-ről költözött ide. Stabil
            #impresszum horgony, VÁLTOZATLAN szöveggel.
          */}
          <h2
            id="impresszum"
            className="font-display mt-14 scroll-mt-24 border-t border-border-strong pt-8 text-2xl leading-snug text-text-primary sm:text-[1.75rem]"
          >
            7. {legalNotice.imprint.heading}
          </h2>
          <dl className="mt-4 grid gap-3 md:grid-cols-2">
            {legalNotice.imprint.items.map((item) => (
              <div key={item.label}>
                <dt className="text-sm font-medium text-text-secondary">
                  {item.label}
                </dt>
                <dd className="text-base leading-relaxed text-text-primary">
                  {item.value}
                </dd>
              </div>
            ))}
          </dl>

          {/*
            Jól látható záró visszalink, közvetlenül a Footer előtt — ugyanaz
            a minta, mint az adatkezelési tájékoztató oldalon.
          */}
          <p className="mt-14 border-t border-border-strong pt-8">
            <Link
              href="/#top"
              className="inline-flex min-h-12 items-center justify-center rounded-md border border-border-strong bg-transparent px-6 text-base font-medium text-text-primary transition-colors hover:border-ink"
            >
              ← Vissza a főoldalra
            </Link>
          </p>
        </article>
      </main>

      <Footer />
    </>
  );
}
