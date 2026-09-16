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
 *
 * v1.4: az elsődleges elérhetőségek nagyobb léptéket (22 -> 25 px) és
 * irányított, hoverre megnyúló Berry elválasztót kaptak; a másodlagos adatok
 * több levegővel, jelölt fejléccel kerültek lejjebb a hierarchiában. A
 * szakasz a Section `deep` tónusán át atmoszférát és szakaszhatárt kap.
 */

/** Elsődleges kapcsolati sor: nagy, kattintható tel:/mailto: cél. */
function PrimaryContact({
  label,
  value,
  href,
  first = false,
}: {
  label: string;
  value: string;
  href?: string;
  /** Az első sor fölé nem kerül elválasztó. */
  first?: boolean;
}) {
  /*
    A CÍMKE az <a>-n KÍVÜL marad — ahogy a v1.2-ben is volt. Ha a linken belülre
    kerülne, megváltoztatná a link akadálymentes nevét és a renderelt
    linkfeliratot, amit a copy freeze tilt. A `group` a külső dobozon ül, így a
    hover az érték színét így is eléri.
  */
  const valueClass =
    "font-display block text-[1.375rem] leading-tight tracking-[-0.01em] break-words text-porcelain sm:text-[1.5625rem]";

  return (
    <div className={`group relative pb-6 sm:pb-7 ${first ? "pt-0" : "pt-6 sm:pt-7"}`}>
      {/*
        v1.4 — irányított elválasztó: balról induló, jobbra elhalványuló
        fényvonal, rövid Berry indítással, ami hoverre megnyúlik. Ettől a
        kapcsolati sorok egyértelműen kattintható, egyenrangú blokként
        olvasódnak, nem szürke adatlistaként.
      */}
      {first ? null : (
        <>
          <span
            aria-hidden="true"
            className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-white/20 via-white/8 to-transparent"
          />
          <span
            aria-hidden="true"
            className="absolute top-0 left-0 h-px w-10 bg-signal-berry-light/70 transition-all duration-300 group-hover:w-20"
          />
        </>
      )}
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
          className={`mt-2 flex min-h-12 items-center transition-colors hover:text-signal-berry-light ${valueClass}`}
        >
          {value}
        </a>
      ) : (
        <span className={`mt-2 ${valueClass}`}>{value}</span>
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
        {contact.details.map((detail, index) => (
          <PrimaryContact
            key={detail.label}
            label={detail.label}
            value={detail.value}
            href={detail.href}
            first={index === 0}
          />
        ))}
      </Reveal>

      {/* Másodlagos információk — kisebb súllyal, két hasábban. A vizuális
          leválasztás erősebb, mint a v1.3-ban: a fő elérhetőségek alatt
          nagyobb a levegő, így a másodlagos adatok nem versenyeznek velük. */}
      <Reveal delay={100} className="mt-14 grid gap-10 border-t border-white/12 pt-11 sm:mt-16 sm:grid-cols-2 sm:gap-14">
        <div>
          <h3 className="flex items-center gap-3 text-xs font-semibold tracking-[0.14em] text-signal-berry-light">
            <span aria-hidden="true" className="block h-px w-5 bg-signal-berry-light/60" />
            {contact.businessHours.heading}
          </h3>
          <dl className="mt-5 space-y-3">
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
          <h3 className="flex items-center gap-3 text-xs font-semibold tracking-[0.14em] text-signal-berry-light">
            <span aria-hidden="true" className="block h-px w-5 bg-signal-berry-light/60" />
            {contact.khSupport.heading}
          </h3>
          <ul className="mt-5 space-y-2.5">
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
        <p className="mt-12 max-w-[80ch] border-l-2 border-l-signal-berry-light/70 pl-5 text-[0.9375rem] leading-relaxed text-cool-silver">
          {contact.orderNotice}
        </p>
      </Reveal>
    </Section>
  );
}
