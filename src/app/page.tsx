import About from "@/components/About";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import LegalRiskBlock from "@/components/LegalRiskBlock";
import OfficialDocuments from "@/components/OfficialDocuments";
import Services from "@/components/Services";
import WhyJG from "@/components/WhyJG";
import { nav } from "@/content/homepage";

/**
 * Főoldal — v1.2, a jóváhagyott hero-referencia (Lovable) szerkezete szerint.
 *
 *   Hero  →  01 Rólunk  →  02 Szolgáltatások  →  03 Miért mi?
 *   →  04 Hivatalos dokumentumok  →  05 Kapcsolat  →  Jogi tájékoztató
 *
 * A v1.1-ben általunk hozzáadott külön FOLYAMAT szakasz és a konverziós
 * CTA-sáv eltávolítva: egyik sem része a referenciaoldal szövegének. A
 * konverziós útvonalat a header-CTA, a hero-CTA és a Kapcsolat szakasz
 * biztosítja.
 *
 * A jogi hierarchia változatlan: rövid státuszközlés a Heróban → egyetlen
 * közös közlés a szolgáltatások alatt → részletes Jogi tájékoztató az oldal
 * alján. Semmi nincs elrejtve.
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
        <LegalRiskBlock />
      </main>

      <Footer />
    </>
  );
}
