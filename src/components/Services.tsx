import Reveal from "./Reveal";
import Section from "./Section";
import { services } from "@/content/homepage";

/**
 * Services — 02. szakasz, „Miben segítünk?".
 *
 * v1.3: desktopon 2×2 rács, eltolt (staggered) második oszloppal. Minden
 * blokk nagy, Newsreader sorszámot kap (01–04), finom felső vonallal, ami
 * hoverre Berry színre vált — nincs négy azonos, vastag kártyadoboz.
 * A sorhossz rövid, a szolgáltatáscím nagy.
 *
 * Generikus ikon, pénzérme, grafikon vagy kézfogás NINCS: az egyetlen
 * grafikai elem a sorszám és a vonal.
 *
 * A közös jogi közlés visszafogott alsó sáv, nem ötödik kártya.
 */
export default function Services() {
  return (
    <Section
      id="szolgaltatasok"
      number={services.sectionNumber}
      label={services.sectionLabel}
      heading={services.heading}
      headingId="szolgaltatasok-cim"
      lead={services.lead}
      tone="surface"
    >
      <ul className="grid gap-x-14 gap-y-12 sm:grid-cols-2">
        {services.items.map((item, index) => (
          <Reveal
            as="li"
            key={item.title}
            delay={index * 80}
            /* Eltolt rács: a jobb oszlop desktopon lejjebb indul. */
            className={`group ${index % 2 === 1 ? "sm:mt-14" : ""}`}
          >
            <span
              aria-hidden="true"
              className="block h-px w-full bg-border transition-colors duration-300 group-hover:bg-signal-berry"
            />
            <span
              aria-hidden="true"
              className="font-display mt-5 block text-[1.75rem] leading-none tabular-nums text-border-strong transition-colors duration-300 group-hover:text-signal-berry"
            >
              {String(index + 1).padStart(2, "0")}
            </span>
            <h3 className="font-display mt-4 max-w-[22ch] text-[1.375rem] leading-[1.25] text-text-primary sm:text-[1.5rem]">
              {item.title}
            </h3>
            <p className="mt-3.5 max-w-[46ch] text-base leading-[1.7] text-text-secondary">
              {item.body}
            </p>
          </Reveal>
        ))}
      </ul>

      {/* EGYETLEN közös közlés — visszafogott alsó sáv, nem ötödik kártya. */}
      <Reveal delay={120} className="mt-16 border-t border-border pt-6 sm:mt-20">
        <p className="max-w-[80ch] border-l-2 border-l-accent pl-5 text-[0.9375rem] leading-relaxed text-text-secondary sm:text-base">
          {services.roleNote.body}
        </p>
      </Reveal>
    </Section>
  );
}
