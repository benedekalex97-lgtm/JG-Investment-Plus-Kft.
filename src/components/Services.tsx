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
 * v1.4 — A STAGGER JAVÍTÁSA. A v1.3 a `sm:mt-14` grid-margóval tolta el a
 * jobb oszlopot. Ez azonban BELESZÁMÍT a grid sor magasságába: a mérés
 * szerint a sor 56 px-szel felfúvódott, az eltolt <li> pedig 331 px helyett
 * 275 px-re nyomódott össze (align-items: stretch). Ezért a margót egy
 * `translate-y` VIZUÁLIS eltolás váltja, ami nem befolyásolja a layoutot, és
 * 56 px helyett a kért 32–40 px sávban, 36 px-en áll. A rács alsó paddingje
 * kompenzálja az eltolást, hogy a második sor ne lógjon rá a záró közlésre.
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
      {/*
        A rács alsó paddingje pontosan a vizuális eltolás mértéke: így a
        második sor eltolt eleme nem lóg rá az alatta lévő közlésre, a grid
        sorainak magassága viszont érintetlen marad.
      */}
      <ul className="grid gap-x-16 gap-y-14 sm:grid-cols-2 sm:pb-9">
        {services.items.map((item, index) => (
          <Reveal
            as="li"
            key={item.title}
            delay={index * 80}
            /* Eltolt rács: a jobb oszlop desktopon 36 px-szel lejjebb indul.
               TRANSFORM, nem margó — nem fújja fel a grid sormagasságát. */
            className={`group ${index % 2 === 1 ? "sm:translate-y-9" : ""}`}
          >
            <span
              aria-hidden="true"
              className="block h-px w-full bg-border transition-colors duration-300 group-hover:bg-signal-berry"
            />
            <div className="flex items-baseline gap-4">
              <span
                aria-hidden="true"
                className="font-display mt-5 block text-[1.875rem] leading-none tabular-nums text-border-strong transition-colors duration-300 group-hover:text-signal-berry"
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              {/* A sorszám mellől induló, hoverre Berryre váltó rövid sín. */}
              <span
                aria-hidden="true"
                className="mt-5 block h-px w-5 shrink-0 bg-border transition-all duration-300 group-hover:w-9 group-hover:bg-signal-berry"
              />
            </div>
            <h3 className="font-display mt-5 max-w-[22ch] text-[1.4375rem] leading-[1.22] tracking-[-0.008em] text-text-primary sm:text-[1.5625rem]">
              {item.title}
            </h3>
            <p className="mt-4 max-w-[46ch] text-base leading-[1.72] text-text-secondary">
              {item.body}
            </p>
          </Reveal>
        ))}
      </ul>

      {/* EGYETLEN közös közlés — visszafogott alsó sáv, nem ötödik kártya. */}
      <Reveal delay={120} className="mt-16 border-t border-border pt-7 sm:mt-20">
        <p className="max-w-[80ch] border-l-2 border-l-accent pl-5 text-[0.9375rem] leading-relaxed text-text-secondary sm:text-base">
          {services.roleNote.body}
        </p>
      </Reveal>
    </Section>
  );
}
