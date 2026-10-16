/*
 * A weboldal végleges production alapcíme — EGYETLEN forrás.
 *
 * Ezt használja a gyökér layout `metadataBase`-e (canonical, Open Graph),
 * a robots.txt és a sitemap.xml. A cím szándékosan fix érték: nem a Host
 * headerből, nem a VERCEL_URL-ből és nem a build-környezet címéből
 * származik, ezért helyi vagy preview buildben sem kerülhet a canonicalba
 * localhost / preview / vercel.app cím.
 *
 * Záró perjel nélkül — az útvonalakat "/"-lel kezdve kell hozzáfűzni.
 */
export const SITE_URL = "https://www.jginvst.hu";
