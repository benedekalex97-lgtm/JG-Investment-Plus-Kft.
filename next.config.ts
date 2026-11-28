import type { NextConfig } from "next";

/*
 * BIZTONSÁGI VÁLASZFEJLÉCEK (2026-11-28, audit 1.2)
 *
 * Az oldal teljes egészében statikus (minden útvonal build időben készül),
 * ezért a CSP nonce nélküli — a Next.js dokumentációja ezt ajánlja statikus
 * oldalakra (node_modules/next/dist/docs/01-app/02-guides/
 * content-security-policy.md, „Without Nonces"). A HSTS-t a Vercel már
 * beállítja (max-age=63072000), itt nem írjuk felül.
 *
 * KÉTLÉPCSŐS CSP:
 *   1) KIKÉNYSZERÍTVE csak azok az irányelvek, amelyek semmilyen működő
 *      erőforrást nem tilthatnak: keretbe ágyazás, <base>, <object>, űrlap-cél.
 *   2) A TELJES szabályzat Report-Only módban fut: a böngésző a konzolban
 *      jelzi, mit tiltana, de nem tilt. Élesben, a sütihozzájárulás
 *      ELFOGADÁSA után (GA4 betölt) ellenőrizendő, hogy nincs-e jelzés;
 *      utána a Report-Only fejléc kulcsa átírható „Content-Security-Policy"-ra.
 *
 * Harmadik felek, amelyeket a teljes szabályzat enged:
 *   - Google Analytics 4 (csak hozzájárulás után tölt; ld.
 *     ConsentAndAnalytics.tsx): www.googletagmanager.com (szkript),
 *     *.google-analytics.com és *.analytics.google.com (mérés).
 *   - Vercel Web Analytics: azonos eredetű (/_vercel/insights), nem kell külön.
 * A 3D térkép (three.js) vászon-textúrái data:/blob: URL-ek.
 */

const isDev = process.env.NODE_ENV === "development";

const directives = (list: string[]) => list.join("; ");

/** Kikényszerített, működést nem korlátozó irányelvek. */
const enforcedCsp = directives([
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "object-src 'none'",
  "form-action 'self'",
]);

/** A teljes szabályzat — egyelőre csak jelentő (Report-Only) módban. */
const reportOnlyCsp = directives([
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' https://www.googletagmanager.com${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://www.google-analytics.com https://www.googletagmanager.com",
  "font-src 'self'",
  "connect-src 'self' https://www.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
]);

const securityHeaders = [
  { key: "Content-Security-Policy", value: enforcedCsp },
  { key: "Content-Security-Policy-Report-Only", value: reportOnlyCsp },
  // Régebbi böngészőknek a frame-ancestors megfelelője.
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  // A böngészők alapértelmezése, kifejezetten rögzítve: külső oldalra csak az eredet megy.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Az oldal egyiket sem használja.
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()",
  },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Ne árulja el a keretrendszert (X-Powered-By: Next.js).
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
