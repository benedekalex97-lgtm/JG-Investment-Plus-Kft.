import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/*
 * robots.txt — a Next.js natív robots.ts konvenciója; nincs mellette
 * statikus public/robots.txt.
 *
 * A crawlolás nincs tiltva. A nem-production környezetek (Preview,
 * Development, helyi build) indexelés elleni védelme változatlanul a
 * gyökér layout `robots` metadata-ja (noindex, nofollow, VERCEL_ENV
 * alapján). Itt szándékosan nincs környezetfüggő Disallow: a noindex
 * direktívát a keresőnek be kell tudnia olvasni, amit egy robots.txt-tiltás
 * megakadályozna.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
