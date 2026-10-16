import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/*
 * sitemap.xml — a Next.js natív sitemap.ts konvenciója.
 *
 * Kizárólag a létező, indexelhető, átirányítás nélküli (200-as) oldalak
 * végső production URL-je szerepel benne, az oldalak saját canonicaljával
 * megegyezően. A hash-horgonyok nem külön oldalak, ezért nincsenek itt.
 *
 * `lastModified` szándékosan nincs: nincs igazolható tartalmi módosítási
 * dátum-forrás, a build ideje pedig nem tartalmi módosítás. Új oldal
 * létrehozásakor ezt a listát is bővíteni kell.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${SITE_URL}/` },
    { url: `${SITE_URL}/jogi-tajekoztato` },
    { url: `${SITE_URL}/adatkezelesi-tajekoztato` },
  ];
}
