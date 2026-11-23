import type { Metadata } from "next";
import GuidePage from "@/components/GuidePage";
import { meta } from "@/content/homepage";
import { accountOpeningGuide as guide } from "@/content/guides";
import { baseOpenGraph } from "@/lib/seo";

/** Útmutató-aloldal — tartalom: src/content/guides.ts, keret: GuidePage. */

const pageTitle = `${guide.metaTitle} · ${meta.wordmark}`;

export const metadata: Metadata = {
  title: pageTitle,
  description: guide.metaDescription,
  alternates: { canonical: "/szamlanyitas" },
  openGraph: {
    ...baseOpenGraph,
    type: "article",
    title: pageTitle,
    description: guide.metaDescription,
    url: "/szamlanyitas",
  },
};

export default function Page() {
  return <GuidePage guide={guide} />;
}
