import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CleanupLab from "@/prototypes/header-v2/CleanupLab";

/*
 * Header v2.0 — GSAP prototípus-oldal. NEM része a production oldalnak:
 *   - Vercel Production környezetben 404 (notFound);
 *   - mindig noindex, nofollow; nincs a sitemapben és nincs rá link.
 * A production header (src/components/Header.tsx) változatlan.
 */
export const metadata: Metadata = {
  title: "Header v2.0 prototípus · JG Investment Plus",
  robots: { index: false, follow: false },
};

export default function HeaderV2PrototypePage() {
  if (process.env.VERCEL_ENV === "production") notFound();

  return (
    <>
      <CleanupLab />
      <main className="jg-safe-x mx-auto max-w-[1280px] space-y-6 pb-[150vh] text-base">
        <h1 className="font-display text-3xl">Header v2.0 — GSAP prototípus</h1>
        <p>
          Desktopon a nav itemek alatti sín GSAP-tweennel fut ki (hover és
          billentyűzetes fókusz). 1024 px alatt a mobilpanel GSAP-timeline-nal
          nyílik és zárul. A lenti térköz a sticky viselkedés teszteléséhez van.
        </p>
      </main>
    </>
  );
}
