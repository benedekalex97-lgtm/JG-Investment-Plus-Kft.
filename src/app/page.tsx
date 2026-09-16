import About from "@/components/About";
import Contact from "@/components/Contact";
import CtaBand from "@/components/CtaBand";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import LegalRiskBlock from "@/components/LegalRiskBlock";
import OfficialDocuments from "@/components/OfficialDocuments";
import Process from "@/components/Process";
import Services from "@/components/Services";
import WhyJG from "@/components/WhyJG";
import { nav } from "@/content/homepage";

/**
 * Főoldal — konverziós sorrend (v1.1).
 *
 * A látogató ebben a sorrendben érti meg az ajánlatot:
 *   Hero (mit kap)  →  01 Rólunk (kik vagyunk)  →  02 Miben segítünk
 *   →  03 Miért a JG  →  04 Hogyan működik  →  CTA-sáv (kapcsolatfelvétel)
 *   →  05 Hivatalos dokumentumok  →  Kapcsolat  →  Jogi tájékoztató.
 *
 * A részletes jogi blokk TUDATOSAN az értékajánlat és a szolgáltatások UTÁN
 * áll — de semmi nincs elrejtve: a rövid státuszközlés már a Heróban, a
 * szereptisztázás a szolgáltatások alatt, a kockázati figyelmeztetés pedig a
 * jogi szakasz tetején, összecsukhatatlanul olvasható.
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
        <Process />
        <CtaBand />
        <OfficialDocuments />
        <Contact />
        <LegalRiskBlock />
      </main>

      <Footer />
    </>
  );
}
