import type { Metadata } from "next";
import About from "@/components/About";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import HeroAssembly from "@/components/hero-assembly/HeroAssembly";
import OfficialDocuments from "@/components/OfficialDocuments";
import ServicesShowcase from "@/components/services-showcase/ServicesShowcase";
import WhyJG from "@/components/WhyJG";
import { meta, nav } from "@/content/homepage";

/*
 * /preview/hero-motion — BELSŐ ELŐNÉZET, nem publikus oldal.
 *
 * A teljes homepage-t mutatja a jelenlegi szekciósorrendben (src/app/page.tsx):
 *
 *   HeroAssembly  →  01 Rólunk  →  02 Szolgáltatások (ServicesShowcase)
 *   →  03 Miért mi?  →  04 Hivatalos dokumentumok  →  05 Kapcsolat  →  Footer
 *
 * Két szekció tér el a homepage-től: a görgetésre összeálló 3D hero
 * (HeroAssembly) és a négy nagy kép–szöveg blokkos Szolgáltatások
 * (ServicesShowcase). Minden más szekció ugyanaz a komponens, ugyanazzal a
 * tartalommal, jogi közléssel, elérhetőséggel és dokumentumlinkkel.
 *
 *   – noindex, nofollow MINDEN környezetben (a production is), ld. robots;
 *   – nem szerepel a navigációban, és nincs sitemap, amibe bekerülhetne;
 *   – a homepage-et NEM cseréli le: a src/app/page.tsx és a Services.tsx
 *     változatlan. A header navigációja és a CTA-k a homepage horgonyaira
 *     ("/#…") mutatnak, ahogy élesben is; az előnézeten belüli horgonycélok
 *     (id-k) ugyanazok, tehát élesítéskor változtatás nélkül működnek.
 *
 * Élesítéskor a homepage-en a <Hero /> helyére a <HeroAssembly />, a
 * <Services /> helyére a <ServicesShowcase /> kerül, az <About /> pedig
 * transitionFrom="canvas"-t kap (ld. About.tsx).
 */
export const metadata: Metadata = {
  title: `Hero-mozgás előnézet · ${meta.wordmark}`,
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false },
  },
};

export default function HeroMotionPreviewPage() {
  return (
    <>
      <a
        href="#fotartalom"
        className="on-dark sr-only rounded-lg bg-ink text-base font-medium text-porcelain focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-[100] focus:inline-flex focus:min-h-12 focus:items-center focus:px-5"
      >
        {nav.skipLink}
      </a>

      <Header />

      <main id="fotartalom">
        <HeroAssembly />
        <About transitionFrom="canvas" />
        <ServicesShowcase />
        <WhyJG />
        <OfficialDocuments />
        <Contact />
      </main>

      <Footer />
    </>
  );
}
