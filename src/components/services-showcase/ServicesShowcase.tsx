import Image, { type StaticImageData } from "next/image";

import Reveal from "../Reveal";
import Section from "../Section";
import ShowcaseMotion from "./ShowcaseMotion";
import panels from "@/assets/services/szolgaltatas-01-penzugyi-lehetosegek-negy-fuggoleges-panel.jpg";
import layers from "@/assets/services/szolgaltatas-02-megtakaritas-adozas-negy-vizszintes-reteg.jpg";
import frames from "@/assets/services/szolgaltatas-03-digitalis-megoldasok-harom-nyitott-keret.jpg";
import curves from "@/assets/services/szolgaltatas-04-kapcsolattartas-edukacio-ket-ives-forma.jpg";
import { services } from "@/content/homepage";

type ServiceTitle = (typeof services.items)[number]["title"];

/**
 * Szolgáltatás → vizuál összerendelés a CÍM alapján, nem index szerint: ha a
 * tartalom sorrendje változik, a kép a saját szövegével együtt mozog. Ha egy
 * cím megváltozik, vagy új szolgáltatás kerül be kép nélkül, a `satisfies`
 * fordítási hibát ad — rossz vagy hiányzó kép nem kerülhet a blokkokba.
 */
const VISUALS = {
  "Pénzügyi lehetőségek bemutatása": panels, // négy függőleges panel
  "Megtakarítási és adózási lehetőségek": layers, // négy egymás fölötti réteg
  "Digitális pénzügyi megoldások": frames, // három nyitott keret
  "Kapcsolattartás és pénzügyi edukáció": curves, // két egymás felé forduló íves forma
} satisfies Record<ServiceTitle, StaticImageData>;

/**
 * A kép renderelt szélessége a layouttal egyezően (ld. a rácsot lent):
 *   ≥ 1280 px: 6/12 oszlop a 1216 px-es tartalomsávban = 592 px;
 *   1024–1279 px: 6/12 oszlop = 50vw − 48 px;
 *   640–1023 px: max-w-xl = 576 px;
 *   < 640 px: a teljes tartalomszélesség (2 × 20 px margó).
 */
const IMAGE_SIZES =
  "(min-width: 1280px) 592px, (min-width: 1024px) calc(50vw - 48px), (min-width: 640px) 576px, calc(100vw - 40px)";

/**
 * ServicesShowcase — 02. szakasz, „Miben segítünk?" — ELŐNÉZETI változat
 * (/preview/hero-motion). A homepage Services.tsx-e változatlan; élesítéskor
 * ez a komponens váltja ki (ugyanaz az id, horgony, tónus és szakaszátmenet),
 * és akkor a közös közlés és a CTA ismétlődő markupja is megszűnik.
 *
 * A korábbi 2×2 szövegrács helyett négy nagy, egymást követő kép–szöveg blokk.
 * Desktopon váltakozó oldal (1, 3: szöveg balra; 2, 4: kép balra), mobilon
 * mindig cím és szöveg → kép. A DOM-sorrend minden blokkban szöveg → kép; a
 * desktop váltakozást kizárólag a rácspozíció adja. A képek dekoratívak
 * (alt=""), nincs bennük fókuszálható elem, így a vizuális és az olvasási
 * sorrend eltérése nem érinti a billentyűzetes és felolvasós használatot.
 *
 * KÉPFELÜLET. A négy kép saját, meleg világosszürke háttérrel érkezik
 * (a peremek átlaga ≈ #E8E7E3, a sarkok #DDDCD8 és #F1F0EB között, a jobb
 * felső sarok felé sötétedő vignettával), a tárgyak árnyéka pedig a kép
 * széléig fut. Teljes összeolvadás ezért nem érhető el: peremáttűnéssel az
 * árnyékok végét vágnánk le, keverési móddal vagy szintkorrekcióval pedig a
 * tárgyakat színeznénk át. Helyette KÖVETKEZETES, SZÁNDÉKOS KÉPFELÜLET: a
 * teljes, vágatlan négyzetes kép, egységes (kártya-)lekerekítéssel — a
 * sarkokban csak háttér van —, díszkeret és kártyaárnyék nélkül, a meglévő
 * fehér (surface) szakaszfelületen, ahol mind a négy kép ugyanúgy, rendezett
 * lapként olvas. Porcelain alapon a kép bal alsó sarka (≈ #F1F0EB) szinte
 * beleolvadna az oldalba, a jobb felső (≈ #DDDCD8) viszont kiválna — ez
 * véletlenszerű, félig eltűnő szélnek hatna.
 *
 * A mozgást a ShowcaseMotion adja (belépés + desktopon enyhe, görgetéshez
 * kötött képelmozdulás); JavaScript nélkül minden azonnal, statikusan látszik.
 */
export default function ServicesShowcase() {
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
      layout="stack"
    >
      <ShowcaseMotion className="lg:mt-20">
        <ul className="grid gap-y-16 sm:gap-y-20 lg:gap-y-28">
          {services.items.map((item, index) => {
            const imageLeft = index % 2 === 1;
            return (
              <li
                key={item.title}
                data-showcase-block=""
                className="grid items-center gap-y-7 sm:gap-y-9 lg:grid-cols-12 lg:gap-x-8"
              >
                <div
                  data-showcase-text=""
                  className={`lg:col-span-5 lg:row-start-1 ${imageLeft ? "lg:col-start-8" : "lg:col-start-1"}`}
                >
                  <div data-showcase-reveal="">
                    <p aria-hidden="true" className="flex items-center gap-4">
                      <span className="font-display text-[1.375rem] leading-none tabular-nums text-accent">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="block h-px w-10 bg-border-strong" />
                    </p>
                    <h3 className="font-display mt-5 max-w-[20ch] text-[1.625rem] leading-[1.16] tracking-[-0.012em] text-balance text-text-primary sm:text-[1.875rem] lg:mt-6 lg:text-[2rem]">
                      {item.title}
                    </h3>
                    <p className="mt-4 max-w-[46ch] text-base leading-[1.72] text-pretty text-text-secondary sm:mt-5 sm:text-[1.0625rem]">
                      {item.body}
                    </p>
                  </div>
                </div>

                <div
                  data-showcase-media=""
                  className={`w-full max-w-xl lg:col-span-6 lg:row-start-1 lg:max-w-none ${imageLeft ? "lg:col-start-1" : "lg:col-start-7"}`}
                >
                  <div data-showcase-reveal="">
                    <div data-showcase-shift="">
                      <Image
                        src={VISUALS[item.title]}
                        alt=""
                        sizes={IMAGE_SIZES}
                        placeholder="blur"
                        className="block aspect-square h-auto w-full rounded-card"
                      />
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </ShowcaseMotion>

      {/* EGYETLEN közös közlés — ugyanaz, mint a homepage Services.tsx-ében. */}
      <Reveal delay={120} className="mt-20 border-t border-border pt-7 sm:mt-24 lg:mt-28">
        <p className="max-w-[80ch] border-l-2 border-l-accent pl-5 text-[0.9375rem] leading-relaxed text-text-secondary sm:text-base">
          {services.roleNote.body}
        </p>
      </Reveal>

      {/* Kontextuális CTA — cél, felirat és forma a homepage-ével azonos. */}
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
