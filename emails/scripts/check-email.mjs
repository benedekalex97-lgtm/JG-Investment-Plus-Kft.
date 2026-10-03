/**
 * JG Investment Plus — email QA (v2).
 *
 * Checks the send template and its plain-text version against the content
 * source of truth (src/content/homepage.ts) and the email technical rules:
 *   - every approved string used by the email appears verbatim (HTML + text);
 *   - no <script>, no inline <svg>, no data: URIs, no emoji, no icon fonts;
 *   - every <img> has alt, width and height, and points at an existing asset;
 *   - every link is on the allow-list (verified URL or documented placeholder);
 *   - customer-facing URLs are on https://www.jginvst.hu: no vercel.app, no
 *     localhost, CTA = https://www.jginvst.hu/#kapcsolat, images from
 *     https://www.jginvst.hu/email/ (absolute, never relative);
 *   - the review preview (public/email-preview/) is in sync with the send
 *     template and loads its images from existing /email/… files;
 *   - none of the retired March 2026 claims are present;
 *   - the HTML stays under Gmail's ~102 KB clipping limit.
 *
 *   node emails/scripts/check-email.mjs
 *
 * Needs Node ≥ 22.18 (built-in TypeScript type stripping, used to import
 * homepage.ts directly).
 */
import { readFileSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { toPreview, PREVIEW_ROUTE } from "./build-preview.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const { hero, statusNotice, services, about, contact, footer, meta } = await import(
  pathToFileURL(join(ROOT, "src/content/homepage.ts")).href
);

const htmlRaw = readFileSync(join(ROOT, "emails/jg-introduction-v2.html"), "utf8");
const text = readFileSync(join(ROOT, "emails/jg-introduction-v2.txt"), "utf8");

const errors = [];
const fail = (msg) => errors.push(msg);

/** Visible text of the HTML: comments, head and tags removed, entities decoded. */
const visible = htmlRaw
  .replace(/<!--[\s\S]*?-->/g, " ")
  .replace(/<head>[\s\S]*?<\/head>/, " ")
  .replace(/<br\s*\/?>/g, " ")
  .replace(/<[^>]+>/g, "")
  .replace(/&nbsp;/g, " ")
  .replace(/&amp;/g, "&")
  .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
  .replace(/\s+/g, " ");
const flatText = text.replace(/\s+/g, " ");

// ---- 1. Approved copy (verbatim) -------------------------------------------
const disclaimerTail = footer.disclaimerLine.replace(/^A weboldal /, "");
if (disclaimerTail === footer.disclaimerLine) fail("footer.disclaimerLine no longer starts with „A weboldal” — re-check the email adaptation.");

const approved = {
  "hero.headlineLines[0]": hero.headlineLines[0],
  "hero.headlineLines[1]": hero.headlineLines[1],
  "hero.intro": hero.intro,
  "hero.eyebrowLines[0]": hero.eyebrowLines[0],
  "hero.eyebrowLines[1]": hero.eyebrowLines[1],
  "statusNotice.body": statusNotice.body,
  "services.heading": services.heading,
  "services.lead": services.lead,
  ...Object.fromEntries(
    services.items.flatMap((item, i) => [
      [`services.items[${i}].title`, item.title],
      [`services.items[${i}].body`, item.body],
    ]),
  ),
  "about.quote": about.quote,
  "footer.statusLine": footer.statusLine,
  "footer.disclaimerLine (email adaptation)": `A jelen e-mail ${disclaimerTail}`,
  "footer.brandLine": footer.brandLine,
  "footer.copyright": footer.copyright,
  "meta.wordmark": meta.wordmark,
  "contact e-mail": contact.details.find((d) => d.label === "E-mail").value,
};
const ciIncludes = (hay, needle) =>
  hay.toLocaleLowerCase("hu").includes(needle.toLocaleLowerCase("hu"));
for (const [key, value] of Object.entries(approved)) {
  if (!visible.includes(value) && !ciIncludes(visible, value)) fail(`HTML is missing approved copy: ${key}`);
  if (!flatText.includes(value) && !ciIncludes(flatText, value)) fail(`Plain text is missing approved copy: ${key}`);
}
// CTA label = contact.heading, rendered in capitals.
if (!visible.includes(contact.heading.toLocaleUpperCase("hu"))) fail("HTML CTA label does not match contact.heading");

// ---- 2. Forbidden content --------------------------------------------------
const forbidden = [
  [/<script/i, "<script> tag"],
  [/<svg/i, "inline <svg>"],
  [/\bdata:/i, "data: URI"],
  [/font-awesome|material-icons|material-symbols|icomoon/i, "icon font"],
  [/jövedelmezőbb/i, "retired March 2026 claim (jövedelmezőbb)"],
  [/személyre szabott (befektetési )?(ajánlás|tanácsadás)t? (ad|nyújt|készít)/i, "personalised advice claim"],
  [/biztonságos befektetés/i, "„biztonságos befektetés” claim"],
  [/garantált|garantáljuk/i, "guarantee claim"],
  // Rejected in review: trading / candlestick hero (brand: no chart visuals).
  [/jg-email-hero|hero-market-corridor|candlestick/i, "rejected trading hero image"],
];
for (const [re, label] of forbidden) {
  if (re.test(htmlRaw)) fail(`HTML contains ${label}`);
  if (re.test(text)) fail(`Plain text contains ${label}`);
}
// Emoji: Extended_Pictographic minus the plain typographic ©, ®, ™.
const emoji = /(?![©®™])\p{Extended_Pictographic}/u;
if (emoji.test(htmlRaw)) fail("HTML contains an emoji");
if (emoji.test(text)) fail("Plain text contains an emoji");

// ---- 3. Images -------------------------------------------------------------
const ASSET_BASE = "https://www.jginvst.hu/email/";
const imgs = [...htmlRaw.matchAll(/<img\b[^>]*>/g)].map((m) => m[0]);
if (imgs.length === 0) fail("No <img> found");
for (const img of imgs) {
  for (const attr of ["alt", "width", "height", "src"]) {
    if (!new RegExp(`\\s${attr}="`).test(img)) fail(`<img> without ${attr}: ${img.slice(0, 90)}`);
  }
  const src = img.match(/src="([^"]+)"/)?.[1] ?? "";
  if (!src.startsWith(ASSET_BASE) || src.includes("/email/email/")) fail(`<img> src is not a production email asset: ${src}`);
  const local = join(ROOT, "public/email", src.slice(ASSET_BASE.length));
  if (!existsSync(local)) fail(`Missing asset: ${local.replace(ROOT + "/", "")}`);
}

// ---- 4. Links --------------------------------------------------------------
const allowed = [
  /^\{\{VIEW_ONLINE_URL\}\}$/,
  // Public JG domain — only routes that exist in src/app (+ the #kapcsolat anchor).
  /^https:\/\/www\.jginvst\.hu(\/(#kapcsolat|jogi-tajekoztato(#(panaszkezeles|impresszum))?|adatkezelesi-tajekoztato))?$/,
  /^https:\/\/www\.khertekpapir\.hu\/ugyfeltamogatas\/dokumentumok$/,
  /^mailto:info@jginvst\.com$/,
  /^https:\/\/fonts\.googleapis\.com\/css2\?/,
];
const hrefs = [...htmlRaw.matchAll(/href="([^"]+)"/g)].map((m) => m[1].replace(/&amp;/g, "&"));
for (const href of hrefs) {
  if (!allowed.some((re) => re.test(href))) fail(`Unverified link: ${href}`);
}
const textUrls = [...text.matchAll(/https?:\/\/[^\s)]+|\{\{[A-Z_]+\}\}/g)].map((m) => m[0]);
for (const url of textUrls) {
  if (!allowed.some((re) => re.test(url))) fail(`Unverified link in plain text: ${url}`);
}

// ---- 5. Customer-facing domain ----------------------------------------------
const CONTACT_URL = "https://www.jginvst.hu/#kapcsolat";
for (const [name, body] of [["HTML", htmlRaw], ["Plain text", text]]) {
  for (const bad of ["vercel.app", "localhost", "127.0.0.1", "{{ASSET_BASE_URL}}", "{{CONTACT_URL}}"]) {
    if (body.includes(bad)) fail(`${name} contains ${bad}`);
  }
  if (!body.includes(CONTACT_URL)) fail(`${name} does not contain ${CONTACT_URL}`);
}
if (!htmlRaw.includes(ASSET_BASE)) fail(`HTML does not load images from ${ASSET_BASE}`);
if (/\bsrc="(?!https:\/\/)/.test(htmlRaw)) fail("HTML has a relative or non-HTTPS image src");
const ctaHrefs = [...htmlRaw.matchAll(/class="cta" href="([^"]+)"|<v:roundrect[^>]*href="([^"]+)"/g)].map((m) => m[1] ?? m[2]);
if (ctaHrefs.length !== 2 || ctaHrefs.some((h) => h !== CONTACT_URL)) fail(`CTA hrefs must both be ${CONTACT_URL}: ${ctaHrefs}`);
if (!visible.includes("www.jginvst.hu")) fail("Visible website label www.jginvst.hu is missing");

// ---- 6. Review preview (public/email-preview/) -----------------------------
const previewPath = join(ROOT, "public", PREVIEW_ROUTE);
if (!existsSync(previewPath)) {
  fail(`Missing review preview: public${PREVIEW_ROUTE} — run build-preview.mjs`);
} else {
  const preview = readFileSync(previewPath, "utf8");
  if (preview !== toPreview(htmlRaw)) fail("Review preview is out of date — run build-preview.mjs");
  for (const [, src] of preview.matchAll(/<img\b[^>]*src="([^"]+)"/g)) {
    if (!src.startsWith("/email/") || !existsSync(join(ROOT, "public", src))) fail(`Preview image not served from /email/: ${src}`);
  }
}

// ---- 7. Size ---------------------------------------------------------------
const kb = Buffer.byteLength(htmlRaw) / 1024;
if (kb > 100) fail(`HTML is ${kb.toFixed(1)} KB — Gmail clips messages above ~102 KB`);

if (errors.length) {
  console.error(`✗ ${errors.length} problem(s):\n  - ${errors.join("\n  - ")}`);
  process.exit(1);
}
console.log(
  `✓ email QA passed — ${Object.keys(approved).length} approved strings, ${imgs.length} images, ${hrefs.length} links, ${kb.toFixed(1)} KB`,
);
