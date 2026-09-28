import type { Metadata } from "next";
import About from "@/components/About";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import HeroAssembly from "@/components/hero-assembly/HeroAssembly";
import { meta, nav } from "@/content/homepage";

/*
 * /preview/hero-motion — BELSŐ ELŐNÉZET, nem publikus oldal.
 *
 * A görgetésre összeálló 3D hero (HeroAssembly) megítélésére szolgál a
 * valódi JG-headerrel, a valódi hero-szöveggel és utána a meglévő 01 Rólunk
 * szakasszal, hogy a továbbgörgetés is látható legyen.
 *
 *   – noindex, nofollow MINDEN környezetben (a production is), ld. robots;
 *   – nem szerepel a navigációban, és nincs sitemap, amibe bekerülhetne;
 *   – a homepage Heróját NEM cseréli le: a src/app/page.tsx változatlan.
 *
 * Élesítéskor a homepage-en a <Hero /> helyére a <HeroAssembly /> kerül, az
 * <About /> pedig transitionFrom="canvas"-t kap (ld. About.tsx).
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
      </main>

      <Footer />
    </>
  );
}
