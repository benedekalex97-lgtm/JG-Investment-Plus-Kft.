import Link from "next/link";
import ContactCta from "@/components/ContactCta";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { contact, nav } from "@/content/homepage";
import { guideCta, guideRoleNote, type Guide, type GuideBlock, type GuideLink } from "@/content/guides";
import { tradingPlatforms } from "@/content/trading-platforms";
import { guideJsonLd, serializeJsonLd } from "@/lib/seo";

/**
 * GuidePage — az útmutató-aloldalak (/szamlanyitas, /tbsz) közös kerete.
 *
 * A keret a jogi oldalaké (Header, 800 px-es cikk, Porcelain felület,
 * számozott, hajszálvonallal elválasztott H2-szakaszok, Footer), így nincs új
 * vizuális rendszer. Új elemek, a meglévő tokenekből:
 *   – morzsamenü (Főoldal / útmutató), BreadcrumbList sémával;
 *   – tartalomjegyzék a szakaszhorgonyokra;
 *   – számozott lépéslista (Aubergine sorszámkör);
 *   – a JG szerepe: a GYIK közös közlésének bal szegélyes mintája;
 *   – két utat kínáló sötét blokk: a „Számlanyitás” elsődleges CTA (a
 *     kereskedési felületek szakaszéval azonos, refcode-os cél) és a két
 *     kapcsolattartó telefonszáma.
 * A szöveg kizárólag a src/content/guides.ts-ből jön.
 */

const h2Class =
  "font-display mt-14 scroll-mt-24 border-t border-border-strong pt-8 text-2xl leading-snug text-text-primary sm:text-[1.75rem]";
const pClass = "mt-4 text-base leading-relaxed text-text-primary sm:text-[1.0625rem]";
const linkClass =
  "font-medium text-accent underline underline-offset-4 transition-colors hover:text-signal-berry";

function InlineLink({ link }: { link: GuideLink }) {
  const external = /^https?:\/\//.test(link.href);
  if (!external) {
    return (
      <Link href={link.href} className={linkClass}>
        {link.label} →
      </Link>
    );
  }
  return (
    <a href={link.href} target="_blank" rel="noopener noreferrer" className={linkClass}>
      {link.label}
      <span className="sr-only"> (új lapon nyílik meg)</span>
    </a>
  );
}

function Block({ block }: { block: GuideBlock }) {
  switch (block.type) {
    case "p":
      return (
        <p className={pClass}>
          {block.text}
          {block.link ? (
            <>
              {" "}
              <InlineLink link={block.link} />
            </>
          ) : null}
        </p>
      );
    case "list":
      return (
        <ul className="mt-4 space-y-3">
          {block.items.map((item) => (
            <li
              key={item.slice(0, 48)}
              className="flex gap-3 text-base leading-relaxed text-text-primary sm:text-[1.0625rem]"
            >
              <span aria-hidden="true" className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      );
    case "steps":
      return (
        <ol className="mt-6 space-y-6">
          {block.items.map((step, index) => (
            <li key={step.title} className="grid grid-cols-[2.5rem_1fr] gap-x-4">
              <span
                aria-hidden="true"
                className="font-display flex size-10 items-center justify-center rounded-full bg-accent text-lg leading-none text-porcelain tabular-nums"
              >
                {index + 1}
              </span>
              <div className="pt-1.5">
                <h3 className="text-[1.0625rem] font-semibold leading-snug text-text-primary">
                  <span className="sr-only">{index + 1}. lépés: </span>
                  {step.title}
                </h3>
                <p className="mt-1.5 text-base leading-relaxed text-text-primary">
                  {step.text}
                  {step.link ? (
                    <>
                      {" "}
                      <InlineLink link={step.link} />
                    </>
                  ) : null}
                </p>
              </div>
            </li>
          ))}
        </ol>
      );
    case "table":
      return (
        <div className="mt-6">
          <div className="overflow-x-auto rounded-md border border-border-strong bg-surface">
            <table className="w-full border-collapse text-left text-sm sm:text-base">
              <caption className="border-b border-border px-3 py-3 text-left sm:px-4 text-sm leading-relaxed text-text-secondary">
                {block.caption}
              </caption>
              <thead>
                <tr>
                  {block.head.map((cell) => (
                    <th
                      key={cell}
                      scope="col"
                      className="border-b border-border px-2 py-3 text-[0.6875rem] font-semibold tracking-[0.02em] text-text-secondary uppercase sm:px-4 sm:text-xs sm:tracking-[0.1em]"
                    >
                      {cell}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {block.rows.map((row) => (
                  <tr key={row[0]} className="border-b border-border last:border-b-0">
                    {row.map((cell, i) =>
                      i === 0 ? (
                        <th key={cell} scope="row" className="px-2 py-3 font-medium text-text-primary sm:px-4">
                          {cell}
                        </th>
                      ) : (
                        <td
                          key={`${row[0]}-${i}`}
                          className={`px-2 py-3 tabular-nums text-text-primary sm:px-4 ${i === row.length - 1 ? "font-semibold" : ""}`}
                        >
                          {cell}
                        </td>
                      ),
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {block.note ? <p className="mt-3 text-sm leading-relaxed text-text-secondary">{block.note}</p> : null}
        </div>
      );
  }
}

export default function GuidePage({ guide }: { guide: Guide }) {
  const phones = contact.details.filter((d) => d.href?.startsWith("tel:"));
  const email = contact.details.find((d) => d.href?.startsWith("mailto:"));

  return (
    <>
      <a
        href="#fotartalom"
        className="on-dark sr-only rounded-lg bg-ink text-base font-medium text-porcelain focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-[100] focus:inline-flex focus:min-h-12 focus:items-center focus:px-5"
      >
        {nav.skipLink}
      </a>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(guideJsonLd(guide)) }}
      />

      <Header />

      <main id="fotartalom" className="bg-canvas">
        <article className="jg-safe-x mx-auto w-full max-w-[800px] py-14 sm:py-20 lg:py-24">
          <nav aria-label="Morzsamenü">
            <ol className="flex flex-wrap items-center gap-x-2 text-sm text-text-secondary">
              <li>
                <Link href="/#top" className="inline-flex min-h-11 items-center underline underline-offset-4 hover:text-text-primary">
                  Főoldal
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="text-text-primary">
                {guide.shortName}
              </li>
            </ol>
          </nav>

          <p className="mt-6 text-sm font-medium tracking-[0.12em] text-text-secondary uppercase">Útmutató</p>
          <h1 className="font-display mt-3 text-[2rem] leading-[1.15] text-balance text-text-primary sm:text-[2.5rem]">
            {guide.heading}
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-text-primary">{guide.lead}</p>
          <p className="mt-4 text-sm text-text-secondary">
            Frissítve: <time dateTime={guide.updated.iso}>{guide.updated.label}</time> · Összeállította: JG Investment Plus
            Kft.
          </p>

          {/* Tartalomjegyzék */}
          <nav aria-labelledby="tartalom-cim" className="mt-10 rounded-md border border-border-strong bg-surface px-5 py-4">
            <p id="tartalom-cim" className="text-xs font-semibold tracking-[0.14em] text-text-secondary uppercase">
              Tartalom
            </p>
            <ol className="mt-2 space-y-0.5">
              {guide.sections.map((section, i) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    className="inline-flex min-h-11 items-center gap-3 text-base text-text-primary underline-offset-4 hover:text-accent hover:underline"
                  >
                    <span className="w-5 shrink-0 text-text-secondary tabular-nums">{i + 1}.</span>
                    {section.heading}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          {guide.sections.map((section, i) => (
            <section key={section.id} aria-labelledby={section.id}>
              <h2 id={section.id} className={h2Class}>
                {i + 1}. {section.heading}
              </h2>
              {section.blocks.map((block, j) => (
                <Block key={`${section.id}-${j}`} block={block} />
              ))}
            </section>
          ))}

          {/* A JG szerepe */}
          <aside className="mt-14 border-l-2 border-l-accent pl-5">
            <h2 className="font-display text-xl leading-snug text-text-primary">{guideRoleNote.heading}</h2>
            <p className="mt-3 text-base leading-relaxed text-text-primary">{guideRoleNote.text}</p>
          </aside>

          {/* Két út: online számlanyitás vagy telefon */}
          <section
            aria-labelledby="kovetkezo-lepes"
            className="on-dark mt-12 rounded-md bg-surface-deep px-6 py-8 text-porcelain sm:px-10 sm:py-10"
          >
            <h2 id="kovetkezo-lepes" className="font-display text-[1.625rem] leading-tight sm:text-[1.875rem]">
              {guideCta.heading}
            </h2>
            <p className="mt-3 max-w-[56ch] text-base leading-relaxed text-cool-silver">{guideCta.text}</p>
            <div className="mt-7">
              <ContactCta
                href={tradingPlatforms.cta.href}
                label={tradingPlatforms.cta.label}
                tone="dark"
                emphasis="primary"
                display="inline-flex"
                className="min-h-12 gap-6 pr-5 pl-6 text-[0.9375rem]"
              />
            </div>
            <div className="mt-8 border-t border-white/12 pt-6">
              <p className="text-xs font-semibold tracking-[0.14em] text-cool-silver uppercase">{guideCta.phoneHeading}</p>
              <ul className="mt-2 grid gap-x-10 sm:grid-cols-2">
                {phones.map((p) => (
                  <li key={p.label} className="py-1">
                    <span className="block text-sm text-cool-silver">{p.label}</span>
                    <a
                      href={p.href}
                      className="font-display inline-flex min-h-11 items-center text-[1.375rem] leading-tight text-porcelain transition-colors hover:text-signal-berry-light"
                    >
                      {p.value}
                    </a>
                  </li>
                ))}
              </ul>
              {email ? (
                <p className="mt-2 text-sm text-cool-silver">
                  E-mail:{" "}
                  <a
                    href={email.href}
                    className="inline-flex min-h-11 items-center font-medium text-porcelain underline decoration-white/30 underline-offset-4 hover:text-signal-berry-light"
                  >
                    {email.value}
                  </a>
                </p>
              ) : null}
            </div>
          </section>

          {/* Források */}
          <section aria-labelledby="forrasok" className="mt-12 border-t border-border-strong pt-6">
            <h2 id="forrasok" className="text-xs font-semibold tracking-[0.14em] text-text-secondary uppercase">
              Források
            </h2>
            <ul className="mt-2">
              {guide.sources.map((source) => (
                <li key={source.href}>
                  <a
                    href={source.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-11 items-center text-[0.9375rem] font-medium text-accent underline underline-offset-4 transition-colors hover:text-signal-berry"
                  >
                    {source.label}
                    <span className="sr-only"> (új lapon nyílik meg)</span>
                  </a>
                </li>
              ))}
            </ul>
          </section>

          <p className="mt-8 border-l-2 border-l-accent pl-5 text-base leading-[1.7] text-text-primary">{guide.notice}</p>

          <p className="mt-12 border-t border-border-strong pt-8">
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
