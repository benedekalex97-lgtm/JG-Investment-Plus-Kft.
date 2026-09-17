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
 * v1.4 — A STAGGER JAVÍTÁSA (időközben visszavonva, ld. lent). A v1.3 a
 * `sm:mt-14` grid-margóval tolta el a jobb oszlopot. Ez azonban BELESZÁMÍT a
 * grid sor magasságába: a mérés szerint a sor 56 px-szel felfúvódott, az
 * eltolt <li> pedig 331 px helyett 275 px-re nyomódott össze
 * (align-items: stretch). A v1.4 ezt egy `translate-y` VIZUÁLIS eltolással
 * váltotta ki (nem befolyásolta a layoutot, 36 px-en állt).
 *
 * v1.1 (POST-LAUNCH UI & STRUCTURE POLISH) — A STAGGER TELJES ELTÁVOLÍTÁSA.
 * A `translate-y` megoldás technikailag helyes volt, de vizuálisan pontosan
 * azt idézte elő, aminek elkerülésére szánták: a jobb oszlop (02, 04) 36
 * px-szel lejjebb indult, mint a bal oszlop (01, 03) — desktopon úgy
 * hatott, mintha a négy blokk nem egy közös rácsra illeszkedne. A cél most
 * a PONTOS közös grid-igazítás: 01 és 02 azonos felső grid-vonalról, 03 és
 * 04 azonos második sor grid-vonalról induljon. A stagger (és a hozzá
 * tartozó `sm:pb-9` kompenzáció, ami csak az eltolt elem alsó túllógását
 * védte) ezért teljesen megszűnt; a `gap-x-16 gap-y-14` önmagában adja a
 * két oszlop és a két sor közötti, mindkét irányban egyenletes távolságot.
 * A négy szövegdoboz szándékosan NEM egyenlő magasságú (a tartalom
 * természetes hossza dönti el), csak a KEZDŐPONTJUK közös.
 *
 * Generikus ikon, pénzérme, grafikon vagy kézfogás NINCS: az egyetlen
 * grafikai elem a sorszám és a vonal.
 *
 * A közös jogi közlés visszafogott alsó sáv, nem ötödik kártya.
 */
export default function Services() {
  return (
    <Section
      transitionFrom="canvas"
      id="szolgaltatasok"
      number={services.sectionNumber}
      label={services.sectionLabel}
      heading={services.heading}
      headingId="szolgaltatasok-cim"
      lead={services.lead}
      tone="surface"
    >
      <ul className="grid gap-x-16 gap-y-14 sm:grid-cols-2">
        {services.items.map((item, index) => (
          <Reveal
            as="li"
            key={item.title}
            delay={index * 80}
            className="group"
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

      {/*
        v1.1 — POST-LAUNCH UI POLISH v1.1: kontextuális CTA a szakasz végén.
        Meglévő tokenek: Aubergine háttér + Porcelain felirat (a design
        rendszer saját, eddig csak háttér/keret/fókusz szerepben használt
        accent/accent-hover párja) — világos (surface) szakaszon ez ad
        kellő, de nem harsány súlyt, új szín vagy gradiens nélkül. Ugyanaz a
        forma (rounded-md, min-h-14, hover:-translate-y-px), mint a Hero és
        a Header CTA-ján, csak a világos háttérhez illő színpárral.
      */}
      <Reveal delay={160} className="mt-10 sm:mt-12">
        <a
          href={services.cta.href}
          className="inline-flex min-h-14 items-center justify-center rounded-md bg-accent px-10 text-center text-sm font-semibold tracking-[0.1em] text-porcelain transition duration-200 hover:-translate-y-px hover:bg-accent-hover sm:text-[0.9375rem]"
        >
          {services.cta.label}
        </a>
      </Reveal>
    </Section>
  );
}
