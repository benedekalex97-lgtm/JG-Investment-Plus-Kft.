import About from "@/components/About";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import LegalRiskBlock from "@/components/LegalRiskBlock";
import Process from "@/components/Process";
import RoleClarification from "@/components/RoleClarification";
import Services from "@/components/Services";
import WhyJG from "@/components/WhyJG";
import { nav } from "@/content/homepage";

export default function Home() {
  return (
    <>
      {/* Skip link: az első fókuszálható elem, csak fókuszban látható. */}
      <a
        href="#fotartalom"
        className="sr-only rounded-lg bg-graphite text-base font-semibold text-paper focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-[100] focus:inline-flex focus:min-h-12 focus:items-center focus:px-5"
      >
        {nav.skipLink}
      </a>

      <Header />

      <main id="fotartalom">
        <Hero />
        <RoleClarification />
        <About />
        <Services />
        <WhyJG />
        <Process />
        <Contact />
        <LegalRiskBlock />
      </main>

      <Footer />
    </>
  );
}
