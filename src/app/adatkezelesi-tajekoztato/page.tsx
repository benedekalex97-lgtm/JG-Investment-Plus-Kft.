import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { meta, nav } from "@/content/homepage";
import { privacyPolicy } from "@/content/privacy-policy";

export const metadata: Metadata = {
  title: `${privacyPolicy.title} · ${meta.wordmark}`,
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

/**
 * A "Fogalmak" szakasz bekezdései a forrásban "kifejezés: meghatározás"
 * mintát követik. A kifejezés kiemelése kizárólag vizuális tagolás — az
 * első ": " mentén történő szétválasztás nem módosítja a szöveget, csak
 * megjeleníti a már a forrásban is jelen lévő szerkezetet.
 */
function splitDefinition(text: string): [string, string] {
  const idx = text.indexOf(": ");
  if (idx === -1) return [text, ""];
  return [text.slice(0, idx), text.slice(idx + 2)];
}

/**
 * A hosting.noticeText mondatot három részre bontja a benne szereplő
 * hosting.noticeLinkLabel kifejezés mentén, hogy az kattintható linkként
 * jelenhessen meg a mondat közepén, a mondat szövegének módosítása nélkül.
 */
function splitAroundLabel(text: string, label: string): [string, string, string] {
  const at = text.indexOf(label);
  if (at === -1) return [text, "", ""];
  return [text.slice(0, at), label, text.slice(at + label.length)];
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

export default function AdatkezelesiTajekoztatoPage() {
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
            Visszafogott, szöveges "felső" visszalink a H1 előtt — a "/#top"
            cél determinisztikus: a Hero id="top" elemére navigál, nem a
            böngésző korábbi görgetési pozíciójára (ami relatív "/" linknél
            mobilböngészőkben előfordulhatna).
          */}
          <Link
            href="/#top"
            className="inline-flex min-h-11 items-center text-sm font-medium text-text-secondary underline underline-offset-4 hover:text-text-primary"
          >
            ← Vissza a főoldalra
          </Link>

          <h1 className="font-display mt-6 text-[2rem] leading-[1.15] text-text-primary sm:text-[2.5rem]">
            {privacyPolicy.title}
          </h1>

          <p className="mt-6 text-base leading-relaxed text-text-primary">
            {privacyPolicy.intro}
          </p>

          {/* 1. Fogalmak */}
          <h2
            id={slugify(privacyPolicy.definitions.heading)}
            className="font-display mt-14 scroll-mt-24 border-t border-border-strong pt-8 text-2xl leading-snug text-text-primary sm:text-[1.75rem]"
          >
            1. {privacyPolicy.definitions.heading}
          </h2>
          <ul className="mt-4 space-y-4">
            {privacyPolicy.definitions.items.map((item) => {
              const [term, definition] = splitDefinition(item);
              return (
                <li
                  key={term}
                  className="text-base leading-relaxed text-text-primary"
                >
                  <span className="font-medium">{term}</span>
                  {definition ? <>: {definition}</> : null}
                </li>
              );
            })}
          </ul>

          {/* 2. Jogalapok */}
          <h2
            id={slugify(privacyPolicy.legalBases.heading)}
            className="font-display mt-14 scroll-mt-24 border-t border-border-strong pt-8 text-2xl leading-snug text-text-primary sm:text-[1.75rem]"
          >
            2. {privacyPolicy.legalBases.heading}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-text-primary">
            {privacyPolicy.legalBases.intro}
          </p>
          {privacyPolicy.legalBases.items.map((item, index) => (
            <div key={item.heading}>
              <h3
                id={slugify(item.heading)}
                className="mt-8 scroll-mt-24 text-lg font-medium text-text-primary"
              >
                2.{index + 1} {item.heading}
              </h3>
              <p className="mt-3 text-base leading-relaxed text-text-primary">
                {item.body}
              </p>
            </div>
          ))}

          {/* 3. Érintettek jogai */}
          <h2
            id={slugify(privacyPolicy.rights.heading)}
            className="font-display mt-14 scroll-mt-24 border-t border-border-strong pt-8 text-2xl leading-snug text-text-primary sm:text-[1.75rem]"
          >
            3. {privacyPolicy.rights.heading}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-text-primary">
            {privacyPolicy.rights.intro}
          </p>
          <BulletList items={privacyPolicy.rights.contactMethods} />
          {privacyPolicy.rights.afterContact.map((paragraph) => (
            <p
              key={paragraph.slice(0, 48)}
              className="mt-4 text-base leading-relaxed text-text-primary"
            >
              {paragraph}
            </p>
          ))}

          {privacyPolicy.rights.items.map((item, index) => (
            <div key={item.heading}>
              <h3
                id={slugify(item.heading)}
                className="mt-8 scroll-mt-24 text-lg font-medium text-text-primary"
              >
                3.{index + 1} {item.heading}
              </h3>
              {item.body.map((paragraph) => (
                <p
                  key={paragraph.slice(0, 48)}
                  className="mt-3 text-base leading-relaxed text-text-primary"
                >
                  {paragraph}
                </p>
              ))}
              {item.list ? <BulletList items={item.list} /> : null}
            </div>
          ))}

          {/* 4. Jogorvoslat */}
          <h2
            id={slugify(privacyPolicy.remedy.heading)}
            className="font-display mt-14 scroll-mt-24 border-t border-border-strong pt-8 text-2xl leading-snug text-text-primary sm:text-[1.75rem]"
          >
            4. {privacyPolicy.remedy.heading}
          </h2>
          {privacyPolicy.remedy.body.map((paragraph) => (
            <p
              key={paragraph.slice(0, 48)}
              className="mt-4 text-base leading-relaxed text-text-primary"
            >
              {paragraph}
            </p>
          ))}

          {/* 5. Záró rendelkezés */}
          <h2
            id={slugify(privacyPolicy.closing.heading)}
            className="font-display mt-14 scroll-mt-24 border-t border-border-strong pt-8 text-2xl leading-snug text-text-primary sm:text-[1.75rem]"
          >
            5. {privacyPolicy.closing.heading}
          </h2>
          {privacyPolicy.closing.body.map((paragraph) => (
            <p
              key={paragraph.slice(0, 48)}
              className="mt-4 text-base leading-relaxed text-text-primary"
            >
              {paragraph}
            </p>
          ))}

          {/*
            6. Weboldal technikai kiszolgálása — v1.0 kiegészítés.

            Ez a szakasz NEM a DOCX-forrásból származik (ld. a
            privacy-policy.ts fejlécének megjegyzését): a production hosting
            platform a Vercel lesz, ezért a weboldal-üzemeltetés technikai
            tényét itt, a DOCX-eredetű jogi törzsszöveg UTÁN, önálló,
            számozott szakaszként közöljük — additív kiegészítésként, a
            meglévő szakaszok tartalmának módosítása nélkül.
          */}
          <h2
            id={slugify(privacyPolicy.hosting.heading)}
            className="font-display mt-14 scroll-mt-24 border-t border-border-strong pt-8 text-2xl leading-snug text-text-primary sm:text-[1.75rem]"
          >
            6. {privacyPolicy.hosting.heading}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-text-primary">
            {privacyPolicy.hosting.intro}
          </p>

          <p className="mt-4 text-base leading-relaxed text-text-primary">
            <span className="font-medium">Szolgáltató:</span>
            <br />
            {privacyPolicy.hosting.provider.name}
            {privacyPolicy.hosting.provider.addressLines.map((line) => (
              <span key={line}>
                <br />
                {line}
              </span>
            ))}
          </p>

          <p className="mt-4 text-base leading-relaxed text-text-primary">
            {privacyPolicy.hosting.dataIntro}
          </p>
          <BulletList items={privacyPolicy.hosting.dataItems} />

          <p className="mt-4 text-base leading-relaxed text-text-primary">
            {privacyPolicy.hosting.notUsedIntro}
          </p>
          <BulletList items={privacyPolicy.hosting.notUsedItems} />

          <p className="mt-4 text-base leading-relaxed text-text-primary">
            {(() => {
              const [before, label, after] = splitAroundLabel(
                privacyPolicy.hosting.noticeText,
                privacyPolicy.hosting.noticeLinkLabel,
              );
              return (
                <>
                  {before}
                  {label ? (
                    <a
                      href={privacyPolicy.hosting.noticeUrl}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="font-medium text-accent underline underline-offset-4 hover:text-text-primary"
                    >
                      {label}
                      <span className="sr-only"> (új lapon nyílik meg)</span>
                    </a>
                  ) : null}
                  {after}
                </>
              );
            })()}
          </p>

          <p className="mt-14 border-t border-border-strong pt-8 text-sm text-text-secondary">
            {privacyPolicy.effectiveDate}
          </p>

          {/*
            Jól látható záró visszalink, közvetlenül a Footer előtt. A "/#top"
            cél ugyanazért determinisztikus, mint a fenti felső visszalinké.
          */}
          <p className="mt-8">
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
