/**
 * JG Investment Plus — email QA (v2).
 *
 * Checks the send template and its plain-text version against the content
 * source of truth (src/content/homepage.ts) and the email technical rules:
 *   - every approved string used by the email appears verbatim (HTML + text);
 *   - no <script>, no inline <svg>, no data: URIs, no emoji, no icon fonts;
 *   - every <img> has alt, width and height, and points at an existing asset;
 *   - every link is on the allow-list (verified URL or documented placeholder);
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
const imgs = [...htmlRaw.matchAll(/<img\b[^>]*>/g)].map((m) => m[0]);
if (imgs.length === 0) fail("No <img> found");
for (const img of imgs) {
  for (const attr of ["alt", "width", "height", "src"]) {
    if (!new RegExp(`\\s${attr}="`).test(img)) fail(`<img> without ${attr}: ${img.slice(0, 90)}`);
  }
  const src = img.match(/src="([^"]+)"/)?.[1] ?? "";
  if (!src.startsWith("{{ASSET_BASE_URL}}/email/")) fail(`<img> src is not an email asset: ${src}`);
  const local = join(ROOT, "public", src.replace("{{ASSET_BASE_URL}}/", ""));
  if (!existsSync(local)) fail(`Missing asset: ${local.replace(ROOT + "/", "")}`);
}

// ---- 4. Links --------------------------------------------------------------
const allowed = [
  /^\{\{VIEW_ONLINE_URL\}\}$/,
  /^https:\/\/jg-investment-plus-kft\.vercel\.app(\/(#kapcsolat|jogi-tajekoztato(#panaszkezeles)?|adatkezelesi-tajekoztato))?$/,
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

// ---- 5. Size ---------------------------------------------------------------
const kb = Buffer.byteLength(htmlRaw) / 1024;
if (kb > 100) fail(`HTML is ${kb.toFixed(1)} KB — Gmail clips messages above ~102 KB`);

if (errors.length) {
  console.error(`✗ ${errors.length} problem(s):\n  - ${errors.join("\n  - ")}`);
  process.exit(1);
}
console.log(
  `✓ email QA passed — ${Object.keys(approved).length} approved strings, ${imgs.length} images, ${hrefs.length} links, ${kb.toFixed(1)} KB`,
);
