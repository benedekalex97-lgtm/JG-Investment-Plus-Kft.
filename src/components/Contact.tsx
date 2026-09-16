import Reveal from "./Reveal";
import Section from "./Section";
import { contact } from "@/content/homepage";

/**
 * Contact — 05. szakasz.
 *
 * v1.3: a korábbi szürke kártyahalom helyett teljes szélességű, mély sötét
 * KONVERZIÓS szekció. Az e-mail és a két kapcsolattartó nagy, jól
 * kattintható elem (min. 64 px magas sorok), egyenrangú blokként; a székhely,
 * az üzleti órák és a K&H ügyfélszolgálat vizuálisan másodlagos, hogy ne
 * versenyezzenek a fő kapcsolatfelvétellel.
 *
 * Nincs űrlap, nincs adatgyűjtés, nincs stockfotó vagy portré.
 * A kapcsolatadatok SZÖVEGE karakterre változatlan — csak a megjelenítés
 * változott.
 */

/** Elsődleges kapcsolati sor: nagy, kattintható tel:/mailto: cél. */
function PrimaryContact({
  label,
  value,
  href,
}: {
  label: string;
  value: string;
  href?: string;
}) {
  /*
    A CÍMKE az <a>-n KÍVÜL marad — ahogy a v1.2-ben is volt. Ha a linken belülre
    kerülne, megváltoztatná a link akadálymentes nevét és a renderelt
    linkfeliratot, amit a copy freeze tilt. A `group` a külső dobozon ül, így a
    hover az érték színét így is eléri.
  */
  const valueClass =
    "font-display block text-[1.25rem] leading-tight break-words text-porcelain sm:text-[1.375rem]";

  return (
    <div className="group border-t border-white/12 py-5 first:border-t-0 sm:py-6">
      {/*
        NINCS `uppercase`: a CSS text-transform megváltoztatná a renderelt
        szöveget (innerText), amit a copy freeze tilt. Az eyebrow-karaktert a
        kis méret és a széles betűköz adja, nem a nagybetűsítés.
      */}
      <span className="text-xs font-semibold tracking-[0.14em] text-cool-silver">
        {label}
      </span>
      {href ? (
        <a
          href={href}
          className={`mt-1.5 flex min-h-12 items-center transition-colors hover:text-signal-berry-light ${valueClass}`}
        >
          {value}
        </a>
      ) : (
        <span className={`mt-1.5 ${valueClass}`}>{value}</span>
      )}
    </div>
  );
}

export default function Contact() {
  return (
    <Section
      id="kapcsolat"
      number={contact.sectionNumber}
      label={contact.sectionLabel}
      heading={contact.heading}
      headingId="kapcsolat-cim"
      lead={contact.lead}
      tone="deep"
    >
      {/* Elsődleges elérhetőségek — nagy, egyenrangú, kattintható blokkok. */}
      <Reveal>
        {contact.details.map((detail) => (
          <PrimaryContact
            key={detail.label}
            label={detail.label}
            value={detail.value}
            href={detail.href}
          />
        ))}
      </Reveal>

      {/* Másodlagos információk — kisebb súllyal, két hasábban. */}
      <Reveal delay={100} className="mt-12 grid gap-10 border-t border-white/12 pt-10 sm:grid-cols-2">
        <div>
          <h3 className="text-xs font-semibold tracking-[0.14em] text-signal-berry-light">
            {contact.businessHours.heading}
          </h3>
          <dl className="mt-4 space-y-3">
            {contact.businessHours.items.map((item) => (
              <div key={item.market}>
                <dt className="text-sm font-medium text-porcelain">{item.market}</dt>
                <dd className="mt-0.5 text-[0.9375rem] leading-relaxed text-cool-silver">
                  {item.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div>
          <h3 className="text-xs font-semibold tracking-[0.14em] text-signal-berry-light">
            {contact.khSupport.heading}
          </h3>
          <ul className="mt-4 space-y-2.5">
            {contact.khSupport.items.map((item) => (
              <li key={item.label} className="flex flex-col gap-0.5 sm:flex-row sm:gap-3">
                <span className="text-sm text-cool-silver sm:w-36 sm:shrink-0">
                  {item.label}
                </span>
                {item.href ? (
                  <a
                    href={item.href}
                    className="inline-flex min-h-11 items-center break-all text-[0.9375rem] font-medium text-porcelain underline underline-offset-4 transition-colors hover:text-signal-berry-light"
                  >
                    {item.value}
                  </a>
                ) : (
                  <span className="text-[0.9375rem] text-porcelain">{item.value}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </Reveal>

      <Reveal delay={160}>
        <p className="mt-10 max-w-[80ch] border-l-2 border-l-signal-berry-light pl-5 text-[0.9375rem] leading-relaxed text-cool-silver">
          {contact.orderNotice}
        </p>
      </Reveal>
    </Section>
  );
}
