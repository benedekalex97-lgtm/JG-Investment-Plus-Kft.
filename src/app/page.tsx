import type { Metadata } from "next";
import About from "@/components/About";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import OfficialDocuments from "@/components/OfficialDocuments";
import Services from "@/components/Services";
import WhyJG from "@/components/WhyJG";
import { nav } from "@/content/homepage";

/*
 * v1.0 — a főoldal SAJÁT canonicalja, itt és nem a gyökér layoutban.
 *
 * A `metadataBase` (layout.tsx) minden oldalra érvényes, de a canonical URL
 * oldalanként más: a főoldalé "/", az adatkezelési tájékoztatóé viszont
 * "/adatkezelesi-tajekoztato" kellene, hogy legyen. Ha a canonicalt a
 * layoutban állítanánk be, minden aloldal (a privacy oldal is) örökölné a
 * főoldal "/" canonicaljét — ez téves duplikált-tartalom jelzés lenne a
 * keresőmotorok felé. Ezért a canonical kizárólag itt, a főoldal saját
 * metadata exportjában él; a privacy oldal emiatt nem kap (téves) örökölt
 * canonicalt.
 */
export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

/**
 * Főoldal — v1.2, a jóváhagyott hero-referencia (Lovable) szerkezete szerint.
 *
 *   Hero  →  01 Rólunk  →  02 Szolgáltatások  →  03 Miért mi?
 *   →  04 Hivatalos dokumentumok  →  05 Kapcsolat
 *
 * A v1.1-ben általunk hozzáadott külön FOLYAMAT szakasz és a konverziós
 * CTA-sáv eltávolítva: egyik sem része a referenciaoldal szövegének. A
 * konverziós útvonalat a header-CTA, a hero-CTA, a Services/WhyJG utáni
 * kontextuális CTA-k és a Kapcsolat szakasz biztosítja.
 *
 * v1.1 — POST-LAUNCH UI POLISH v1.1 (LEGAL CONSOLIDATION): a korábbi,
 * homepage-en álló `<LegalRiskBlock />` (Panaszkezelés + Impresszum) törölve
 * — mindkét tartalom átköltözött a /jogi-tajekoztato oldalra, ld.
 * src/content/legal-notice.ts. A Kapcsolat szakasz után így közvetlenül a
 * Footer következik; a jogi hierarchia rövid, homepage-en kötelező része
 * (Heró státuszközlés → Services alatti közös közlés) változatlan, csak a
 * részletes jogi dokumentum és a Panaszkezelés/Impresszum él most kizárólag
 * a dedikált jogi oldalon.
 */
export default function Home() {
  return (
    <>
      {/* Skip link: az első fókuszálható elem, csak fókuszban látható. */}
      <a
        href="#fotartalom"
        className="on-dark sr-only rounded-lg bg-ink text-base font-medium text-porcelain focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-[100] focus:inline-flex focus:min-h-12 focus:items-center focus:px-5"
      >
        {nav.skipLink}
      </a>

      <Header />

      <main id="fotartalom">
        <Hero />
        <About />
        <Services />
        <WhyJG />
        <OfficialDocuments />
        <Contact />
      </main>

      <Footer />
    </>
  );
}
