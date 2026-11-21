import type { Metadata } from "next";
import { contact, meta } from "@/content/homepage";
import { faq } from "@/content/faq";
import type { Guide } from "@/content/guides";
import { legalNotice } from "@/content/legal-notice";
import { SITE_URL } from "@/lib/site";

/*
 * SEO-segédek — EGY helyen a keresőknek szóló, a látható tartalomból
 * származtatott adatok (SEO-audit, 2026-11-20, 1. csomag).
 *
 * SZABÁLY: itt NINCS új marketingszöveg. A title és a description a
 * korábban jóváhagyott, változatlan szöveg (a gyökér layoutból ide
 * költöztetve); a strukturált adat minden mezője a tartalmi fájlokból
 * (homepage.ts, legal-notice.ts, faq.ts) jön. Új cím vagy leírás csak
 * K&H-jóváhagyás után kerülhet ide.
 */

export const SITE_TITLE = "JG Investment Plus Kft. · A K&H Értékpapír függő ügynöke";

export const SITE_DESCRIPTION =
  "A JG Investment Plus Kft. a K&H Értékpapír (Patria Finance Magyarországi Fióktelepe) függő ügynöke. A tényleges befektetési szolgáltató a Fióktelep; a pontos szolgáltatási kört a K&H Értékpapír honlapján közzétett hatályos hirdetmény tartalmazza.";

/**
 * A FŐOLDAL keresőknek szóló címe és leírása — TERVEZET, K&H-jóváhagyásra
 * vár (2026-11-21). A szervezet sémában továbbra is a jóváhagyott
 * SITE_DESCRIPTION szerepel; ez csak a találati lista szövege.
 */
export const HOME_TITLE = "Értékpapírszámla a K&H Értékpapírnál · JG Investment Plus";

export const HOME_DESCRIPTION =
  "A JG Investment Plus a K&H Értékpapír függő ügynöke. Segítünk megismerni a számlanyitás folyamatát és a TBSZ-t, személyes kapcsolattartással, országosan.";

/**
 * Az oldalak közös Open Graph alapja. A Next.js az oldalszintű `openGraph`
 * mezővel a gyökérét EGÉSZÉBEN lecseréli (nem mélyen olvasztja össze), ezért
 * minden oldal ezt terjeszti ki a saját címével és URL-jével:
 *   openGraph: { ...baseOpenGraph, title, url }
 */
export const baseOpenGraph = {
  title: SITE_TITLE,
  /*
   * Megosztási kép (public/og-image.png, 1200 × 630) — TERVEZET,
   * K&H-jóváhagyásra vár. Kifejezetten itt, és nem fájlkonvencióval
   * (app/opengraph-image.png), mert az oldalszintű openGraph felülírása a
   * fájlalapú képet nem örökölné minden oldalon.
   */
  images: [
    {
      url: "/og-image.png",
      width: 1200,
      height: 630,
      alt: "JG Investment Plus – Értékpapírszámla a K&H Értékpapírnál, személyes kapcsolattartással. A K&H Értékpapír függő ügynöke.",
    },
  ],
  description: SITE_DESCRIPTION,
  siteName: meta.wordmark,
  type: "website",
  locale: "hu_HU",
} satisfies NonNullable<Metadata["openGraph"]>;

/* ------------------------------------------------------------------------
 * Strukturált adat (JSON-LD, schema.org) — a főoldalon.
 *
 * Organization: szándékosan NEM FinancialService / LocalBusiness — a JG
 * függő ügynök, a tényleges befektetési szolgáltató a K&H Értékpapír
 * (Patria Finance Magyarországi Fióktelepe); ezt a `description` (a
 * jóváhagyott meta leírás) mondja ki. Nincs `parentOrganization` sem, mert
 * az tulajdonosi kapcsolatot állítana.
 * ---------------------------------------------------------------------- */

const ORG_ID = `${SITE_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;

function imprintValue(label: string): string | undefined {
  return legalNotice.imprint.items.find((item) => item.label === label)?.value;
}

/** „2336 Dunavarsány, Nagyvarsányi utca 133." → PostalAddress; ha a minta nem illeszkedik, nincs cím. */
function postalAddress(raw: string | undefined) {
  const m = raw?.match(/^(\d{4})\s+([^,]+),\s*(.+?)\.?$/);
  if (!m) return undefined;
  return {
    "@type": "PostalAddress",
    postalCode: m[1],
    addressLocality: m[2],
    streetAddress: m[3],
    addressCountry: "HU",
  };
}

const email = contact.details.find((d) => d.href?.startsWith("mailto:"))?.value;

const contactPoints = contact.details
  .filter((d) => d.href?.startsWith("tel:"))
  .map((d) => ({
    "@type": "ContactPoint",
    name: d.label,
    telephone: d.href!.slice("tel:".length),
    contactType: "customer service",
    areaServed: "HU",
    availableLanguage: "hu",
  }));

const registrationNumber = imprintValue("Cégjegyzékszám");

const organization = {
  "@type": "Organization",
  "@id": ORG_ID,
  name: meta.companyShort,
  legalName: imprintValue("Szolgáltató neve") ?? meta.companyLong,
  alternateName: meta.wordmark,
  url: `${SITE_URL}/`,
  logo: `${SITE_URL}/apple-icon.png`,
  description: SITE_DESCRIPTION,
  ...(email ? { email } : {}),
  ...(postalAddress(imprintValue("Székhely")) ? { address: postalAddress(imprintValue("Székhely")) } : {}),
  ...(imprintValue("Adószám") ? { taxID: imprintValue("Adószám") } : {}),
  ...(registrationNumber
    ? { identifier: { "@type": "PropertyValue", propertyID: "Cégjegyzékszám", value: registrationNumber } }
    : {}),
  contactPoint: contactPoints,
};

const website = {
  "@type": "WebSite",
  "@id": WEBSITE_ID,
  url: `${SITE_URL}/`,
  name: meta.wordmark,
  inLanguage: "hu-HU",
  publisher: { "@id": ORG_ID },
};

/** A GYIK a főoldalon látható kérdés–válasz párjai, karakterre azonosan. */
const faqPage = {
  "@type": "FAQPage",
  "@id": `${SITE_URL}/#gyakori-kerdesek`,
  inLanguage: "hu-HU",
  isPartOf: { "@id": WEBSITE_ID },
  mainEntity: faq.items.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: { "@type": "Answer", text: item.answer.join("\n\n") },
  })),
};

export const homeJsonLd = {
  "@context": "https://schema.org",
  "@graph": [organization, website, faqPage],
};

/** <script type="application/ld+json"> tartalma; a `<` escape-elve, hogy a szöveg ne zárhassa le a scriptet. */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

/**
 * Útmutató-aloldalak sémája: Article (szerző és kiadó a JG szervezet) +
 * BreadcrumbList. A szervezetet @id-vel hivatkozzuk, a teljes leírása a
 * főoldalon él.
 */
export function guideJsonLd(guide: Guide) {
  const url = `${SITE_URL}/${guide.slug}`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        "@id": `${url}#article`,
        headline: guide.heading,
        description: guide.metaDescription,
        inLanguage: "hu-HU",
        url,
        mainEntityOfPage: url,
        dateModified: guide.updated.iso,
        author: { "@id": ORG_ID },
        publisher: { "@id": ORG_ID },
        isPartOf: { "@id": WEBSITE_ID },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Főoldal", item: `${SITE_URL}/` },
          { "@type": "ListItem", position: 2, name: guide.shortName, item: url },
        ],
      },
    ],
  };
}
