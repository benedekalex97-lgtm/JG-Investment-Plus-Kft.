/**
 * JG Investment Plus — email QA (v2).
 *
 * Checks the send template and its plain-text version against the content
 * source of truth (src/content/homepage.ts) and the email technical rules:
 *   - every approved string used by the email appears verbatim (HTML + text);
 *   - no <script>, no inline <svg>, no data: URIs, no emoji, no icon fonts;
 *   - every <img> has alt, width and height, and its src is a CID inline image
 *     (cid:<key>) from the LOCKED map in cid-assets.mjs — no hosted image URL;
 *   - every link is on the allow-list of verified URLs;
 *   - customer-facing URLs are on https://www.jginvst.hu: no vercel.app, no
 *     localhost, no view-online placeholder, CTA = https://www.jginvst.hu/#kapcsolat;
 *   - the local preview (emails/preview/) is in sync with the send template;
 *   - the Apps Script package (emails/apps-script/): generated files in sync,
 *     CID map complete both ways, valid syntax, gmail.compose-only manifest,
 *     UI ↔ server function names, and NO send call anywhere (draft only);
 *     then runs the Apps Script simulation (test-apps-script.mjs);
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
import { execFileSync } from "node:child_process";
import vm from "node:vm";
import { inflateSync } from "node:zlib";
import { toPreview, PREVIEW_FILE } from "./build-preview.mjs";
import { CID_ASSETS, ASSET_DIR } from "./cid-assets.mjs";
import { generateAppsScriptFiles, APPS_SCRIPT_DIR } from "./build-apps-script.mjs";

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
  "footer.khPartnerLogo.complianceLine": footer.khPartnerLogo.complianceLine,
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
  // No public online version / hosted images any more (CID inline delivery).
  [/\{\{VIEW_ONLINE_URL\}\}|nem jelenik meg megfelelően/i, "view-online line or placeholder"],
  [/jginvst\.hu\/email\/|\/email-preview\//i, "hosted email image / public preview URL"],
];
for (const [re, label] of forbidden) {
  if (re.test(htmlRaw)) fail(`HTML contains ${label}`);
  if (re.test(text)) fail(`Plain text contains ${label}`);
}
// Emoji: Extended_Pictographic minus the plain typographic ©, ®, ™.
const emoji = /(?![©®™])\p{Extended_Pictographic}/u;
if (emoji.test(htmlRaw)) fail("HTML contains an emoji");
if (emoji.test(text)) fail("Plain text contains an emoji");

// ---- 3. Images: CID inline only --------------------------------------------
const imgs = [...htmlRaw.matchAll(/<img\b[^>]*>/g)].map((m) => m[0]);
if (imgs.length === 0) fail("No <img> found");
const htmlCids = new Set();
for (const img of imgs) {
  for (const attr of ["alt", "width", "height", "src"]) {
    if (!new RegExp(`\\s${attr}="`).test(img)) fail(`<img> without ${attr}: ${img.slice(0, 90)}`);
  }
  const src = img.match(/src="([^"]+)"/)?.[1] ?? "";
  const cid = src.match(/^cid:([A-Za-z0-9]+)$/)?.[1];
  if (!cid) {
    fail(`<img> src is not a CID inline image: ${src}`);
    continue;
  }
  htmlCids.add(cid);
  if (!CID_ASSETS[cid]) fail(`Unknown CID (typo?): cid:${cid}`);
  else if (!existsSync(join(ROOT, ASSET_DIR, CID_ASSETS[cid].file))) fail(`Missing asset for cid:${cid}: ${CID_ASSETS[cid].file}`);
}
for (const cid of Object.keys(CID_ASSETS)) {
  if (!htmlCids.has(cid)) fail(`CID asset not used by the HTML: ${cid}`);
}

// ---- 4. Links --------------------------------------------------------------
const allowed = [
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
  for (const bad of ["vercel.app", "localhost", "127.0.0.1", "{{"]) {
    if (body.includes(bad)) fail(`${name} contains ${bad}`);
  }
  if (!body.includes(CONTACT_URL)) fail(`${name} does not contain ${CONTACT_URL}`);
}
const ctaHrefs = [...htmlRaw.matchAll(/class="cta" href="([^"]+)"|<v:roundrect[^>]*href="([^"]+)"/g)].map((m) => m[1] ?? m[2]);
if (ctaHrefs.length !== 2 || ctaHrefs.some((h) => h !== CONTACT_URL)) fail(`CTA hrefs must both be ${CONTACT_URL}: ${ctaHrefs}`);
if (!visible.includes("www.jginvst.hu")) fail("Visible website label www.jginvst.hu is missing");

// ---- 5b. Header colour = CTA colour (Aubergine) ----------------------------
// LOCKED: the whole header uses exactly the CTA background, #493447. Carbon
// stays legitimate elsewhere (e.g. the footer wordmark), so it is only
// forbidden on the header cell itself.
const AUBERGINE = "#493447";
const headerCell = htmlRaw.match(/<td class="px head"[^>]*>/)?.[0] ?? "";
if (!headerCell) fail("Header cell (td.px.head) not found");
if (!headerCell.includes(`bgcolor="${AUBERGINE}"`) || !headerCell.includes(`background-color:${AUBERGINE}`)) fail(`Header background must be ${AUBERGINE}: ${headerCell}`);
if (/18181B/i.test(headerCell)) fail("Header cell still uses Carbon #18181B");
const headerMark = htmlRaw.match(/<img src="cid:jgMarkPorcelain"[^>]*>/)?.[0] ?? "";
if (!headerMark.includes(`background-color:${AUBERGINE}`)) fail("Header mark <img> background must be Aubergine");
const ctaLink = htmlRaw.match(/<a class="cta"[^>]*>/)?.[0] ?? "";
if (!ctaLink.includes(`background-color:${AUBERGINE}`)) fail(`CTA background must be ${AUBERGINE}`);
if (!new RegExp(`<v:roundrect[^>]*fillcolor="${AUBERGINE}"`).test(htmlRaw)) fail(`Outlook CTA fillcolor must be ${AUBERGINE}`);

/** Minimal PNG decoder (8-bit RGB/RGBA, non-interlaced) → pixel rows. */
function decodePng(buffer) {
  let offset = 8;
  const idat = [];
  let width, height, colorType;
  while (offset < buffer.length) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.toString("ascii", offset + 4, offset + 8);
    const data = buffer.subarray(offset + 8, offset + 8 + length);
    if (type === "IHDR") [width, height, colorType] = [data.readUInt32BE(0), data.readUInt32BE(4), data[9]];
    if (type === "IDAT") idat.push(data);
    offset += 12 + length;
  }
  const bpp = colorType === 6 ? 4 : 3;
  const raw = inflateSync(Buffer.concat(idat));
  const stride = width * bpp;
  const out = Buffer.alloc(height * stride);
  for (let y = 0; y < height; y++) {
    const filter = raw[y * (stride + 1)];
    for (let x = 0; x < stride; x++) {
      const v = raw[y * (stride + 1) + 1 + x];
      const a = x >= bpp ? out[y * stride + x - bpp] : 0;
      const b = y > 0 ? out[(y - 1) * stride + x] : 0;
      const c = x >= bpp && y > 0 ? out[(y - 1) * stride + x - bpp] : 0;
      const p = a + b - c;
      const pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
      const pred = [0, a, b, (a + b) >> 1, pa <= pb && pa <= pc ? a : pb <= pc ? b : c][filter];
      out[y * stride + x] = (v + pred) & 255;
    }
  }
  return { width, height, bpp, pixel: (x, y) => [...out.subarray(y * stride + x * bpp, y * stride + x * bpp + 3)] };
}
const hex = (rgb) => "#" + rgb.map((v) => v.toString(16).padStart(2, "0")).join("").toUpperCase();
/** Every pixel must be a blend of `bg` and `fg` (anti-aliasing) — no third colour, no halo. */
function checkMarkRaster(file, bg, fg) {
  const img = decodePng(readFileSync(join(ROOT, ASSET_DIR, file)));
  const [B, F] = [bg, fg].map((h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)));
  // Background probes: the two top corners and the open aperture at the bottom
  // centre (the bottom corners are the pillars' own tips, not background).
  for (const [x, y] of [[0, 0], [img.width - 1, 0], [img.width >> 1, img.height - 1]]) {
    if (hex(img.pixel(x, y)) !== bg.toUpperCase()) fail(`${file}: corner (${x},${y}) is ${hex(img.pixel(x, y))}, expected ${bg}`);
  }
  let offBlend = 0;
  for (let y = 0; y < img.height; y++) {
    for (let x = 0; x < img.width; x++) {
      const px = img.pixel(x, y);
      const t = (px[0] - B[0]) / (F[0] - B[0]);
      if (t < -0.02 || t > 1.02 || px.some((v, i) => Math.abs(v - (B[i] + t * (F[i] - B[i]))) > 3)) offBlend++;
    }
  }
  if (offBlend) fail(`${file}: ${offBlend} pixel(s) are not ${fg} on ${bg} (foreign background / halo)`);
}
checkMarkRaster(CID_ASSETS.jgMarkPorcelain.file, AUBERGINE, "#F4F3F1");
checkMarkRaster(CID_ASSETS.jgMarkCarbon.file, "#F4F3F1", "#18181B");

// ---- 5c. CTA fallback removed / K&H partner row ----------------------------
// The CTA is the only visible way to the contact anchor in the HTML: the old
// underlined „www.jginvst.hu/#kapcsolat” line below the button is gone. The
// plain text keeps the URL (it has no button), checked in section 5.
if (visible.includes("jginvst.hu/#kapcsolat")) fail("HTML still shows the CTA fallback URL www.jginvst.hu/#kapcsolat");
const contactHrefCount = (htmlRaw.match(/href="https:\/\/www\.jginvst\.hu\/#kapcsolat"/g) ?? []).length;
if (contactHrefCount !== 2) fail(`Contact URL must appear only on the CTA (button + Outlook VML): found ${contactHrefCount} hrefs`);

if (Object.keys(CID_ASSETS).length !== 8) fail(`Expected 8 CID assets, found ${Object.keys(CID_ASSETS).length}`);
const khImg = htmlRaw.match(/<img src="cid:khPartnerLogo"[^>]*>/)?.[0] ?? "";
if (!khImg) fail("K&H partner logo (cid:khPartnerLogo) missing");
const khAlt = khImg.match(/alt="([^"]*)"/)?.[1]?.replace(/&amp;/g, "&");
if (khAlt !== footer.khPartnerLogo.alt) fail(`K&H logo alt must be „${footer.khPartnerLogo.alt}”, got „${khAlt}”`);
if (!/width="50"/.test(khImg) || !/height="39"/.test(khImg)) fail("K&H logo must render 50×39 (39 px tall, native 1024:800 ratio)");
if (/<a\b[^>]*>(?:(?!<\/a>)[\s\S])*cid:khPartnerLogo/.test(htmlRaw)) fail("K&H logo must not be a link");
if (htmlRaw.indexOf("cid:khPartnerLogo") < htmlRaw.indexOf(footer.copyright)) fail("K&H partner row must come after the copyright line");
const khCanonical = readFileSync(join(ROOT, "public/brand/kh-logo-dark.png"));
if (!khCanonical.equals(readFileSync(join(ROOT, ASSET_DIR, CID_ASSETS.khPartnerLogo.file)))) fail("emails/assets/kh-logo-dark.png is not a byte-identical copy of public/brand/kh-logo-dark.png");

// ---- 6. Local preview (emails/preview/) ------------------------------------
const previewPath = join(ROOT, PREVIEW_FILE);
if (!existsSync(previewPath)) {
  fail(`Missing local preview: ${PREVIEW_FILE} — run build-preview.mjs`);
} else {
  try {
    if (readFileSync(previewPath, "utf8") !== toPreview(htmlRaw)) fail("Local preview is out of date — run build-preview.mjs");
  } catch (e) {
    fail(`Local preview cannot be built: ${e.message}`);
  }
}
for (const leftover of ["public/email", "public/email-preview"]) {
  if (existsSync(join(ROOT, leftover))) fail(`${leftover}/ must not exist — email files are private`);
}

// ---- 6b. Apps Script package -----------------------------------------------
const AS = (name) => join(ROOT, APPS_SCRIPT_DIR, name);
for (const [path, content] of Object.entries(generateAppsScriptFiles())) {
  if (!existsSync(join(ROOT, path)) || readFileSync(join(ROOT, path), "utf8") !== content) {
    fail(`${path} is out of date — run build-apps-script.mjs`);
  }
}
const gsFiles = ["Code.gs", "Assets.gs"];
const indexHtml = existsSync(AS("Index.html")) ? readFileSync(AS("Index.html"), "utf8") : "";
const uiScript = [...indexHtml.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1]).join("\n");
const sources = Object.fromEntries(gsFiles.map((f) => [f, existsSync(AS(f)) ? readFileSync(AS(f), "utf8") : ""]));
sources["Index.html <script>"] = uiScript;

// Syntax (V8): every .gs file and the UI script must parse.
for (const [name, src] of Object.entries(sources)) {
  if (!src) fail(`Apps Script source missing or empty: ${name}`);
  try {
    new vm.Script(src, { filename: name });
  } catch (e) {
    fail(`Apps Script syntax error in ${name}: ${e.message}`);
  }
}

// CID map: Assets.gs keys = CID_ASSETS keys = HTML cids, bytes = emails/assets.
try {
  const ctx = vm.createContext({});
  vm.runInContext(sources["Assets.gs"], ctx);
  const assets = vm.runInContext("JG_EMAIL_ASSETS", ctx);
  const keys = Object.keys(assets).sort().join(",");
  if (keys !== Object.keys(CID_ASSETS).sort().join(",")) fail(`Assets.gs CIDs (${keys}) differ from cid-assets.mjs`);
  if (keys !== [...htmlCids].sort().join(",")) fail(`Assets.gs CIDs (${keys}) differ from the HTML cid: references`);
  for (const [cid, asset] of Object.entries(assets)) {
    const file = CID_ASSETS[cid] && join(ROOT, ASSET_DIR, CID_ASSETS[cid].file);
    if (!file || !Buffer.from(asset.base64, "base64").equals(readFileSync(file))) fail(`Assets.gs ${cid} bytes differ from ${ASSET_DIR}`);
  }
} catch (e) {
  fail(`Assets.gs could not be evaluated: ${e.message}`);
}

// SEND GUARD — draft creation only. Comments are stripped so documentation
// text cannot cause false positives; only real source code is checked.
const stripComments = (src) => src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:\\])\/\/.*$/gm, "$1");
const sendPatterns = [
  [/\bsendEmail\s*\(/, "sendEmail()"],
  [/\b(GmailApp|MailApp)\s*\.\s*send/, "GmailApp/MailApp send"],
  [/\bMailApp\b/, "MailApp"],
  [/\.\s*send\s*\(/, ".send() (e.g. draft.send / Drafts.send)"],
  [/\bsendDraft\b/, "sendDraft"],
  [/\bUsers\s*\.\s*Messages\b/, "Gmail Users.Messages (send/insert/import)"],
  [/\bUrlFetchApp\b/, "UrlFetchApp (raw API calls)"],
  [/\bGmailApp\b/, "GmailApp (needs the full mail scope; not used)"],
];
for (const [name, src] of Object.entries(sources)) {
  const code = stripComments(src);
  for (const [re, label] of sendPatterns) if (re.test(code)) fail(`SEND GUARD: ${name} contains ${label}`);
}
const gmailCalls = new Set([...stripComments(sources["Code.gs"]).matchAll(/\bGmail\.Users\.[\w.]+/g)].map((m) => m[0]));
for (const call of gmailCalls) {
  if (!["Gmail.Users.Drafts.create", "Gmail.Users.getProfile"].includes(call)) fail(`Unexpected Gmail API call: ${call}`);
}
if (!gmailCalls.has("Gmail.Users.Drafts.create")) fail("Code.gs does not create a draft (Gmail.Users.Drafts.create)");

// Manifest: V8, gmail.compose only, Gmail advanced service, no anonymous access.
try {
  const manifest = JSON.parse(readFileSync(AS("appsscript.json"), "utf8"));
  if (manifest.runtimeVersion !== "V8") fail("appsscript.json: runtimeVersion must be V8");
  const scopes = JSON.stringify(manifest.oauthScopes);
  if (scopes !== JSON.stringify(["https://www.googleapis.com/auth/gmail.compose"])) fail(`appsscript.json: oauthScopes must be exactly gmail.compose, got ${scopes}`);
  const gmailService = manifest.dependencies?.enabledAdvancedServices?.find((s) => s.serviceId === "gmail");
  if (!gmailService || gmailService.userSymbol !== "Gmail" || gmailService.version !== "v1") fail("appsscript.json: Gmail advanced service (Gmail, v1) not enabled");
  if (["ANYONE", "ANYONE_ANONYMOUS"].includes(manifest.webapp?.access)) fail(`appsscript.json: web app access must not be ${manifest.webapp.access}`);
  if (manifest.webapp?.executeAs !== "USER_ACCESSING") fail("appsscript.json: web app must execute as USER_ACCESSING");
} catch (e) {
  fail(`appsscript.json invalid: ${e.message}`);
}

// UI ↔ server: every google.script.run target exists in Code.gs and is public.
const runChains = [...uiScript.matchAll(/google\.script\.run([\s\S]*?);/g)].map((m) => m[1]);
if (runChains.length === 0) fail("Index.html never calls google.script.run");
for (const chain of runChains) {
  const targets = [...chain.matchAll(/\.\s*(\w+)\s*\(/g)].map((m) => m[1]).filter((n) => !/^with(Success|Failure)Handler$|^withUserObject$/.test(n));
  for (const fn of targets) {
    if (fn.endsWith("_")) fail(`UI calls private server function ${fn} (trailing _ is not callable)`);
    if (!new RegExp(`^function ${fn}\\s*\\(`, "m").test(sources["Code.gs"])) fail(`UI calls ${fn}(), which Code.gs does not define`);
  }
}
if (!/^function doGet\s*\(/m.test(sources["Code.gs"])) fail("Code.gs has no doGet() for the web app");

// Runtime simulation (Node vm with Apps Script stand-ins).
try {
  execFileSync(process.execPath, [join(ROOT, "emails/scripts/test-apps-script.mjs")], { stdio: "pipe" });
} catch (e) {
  fail(`Apps Script simulation failed:\n${(e.stderr || e.stdout || "").toString().trim()}`);
}

// ---- 7. Size ---------------------------------------------------------------
const kb = Buffer.byteLength(htmlRaw) / 1024;
if (kb > 100) fail(`HTML is ${kb.toFixed(1)} KB — Gmail clips messages above ~102 KB`);

if (errors.length) {
  console.error(`✗ ${errors.length} problem(s):\n  - ${errors.join("\n  - ")}`);
  process.exit(1);
}
console.log(
  `✓ email QA passed — ${Object.keys(approved).length} approved strings, ${imgs.length} CID images, ${hrefs.length} links, ${kb.toFixed(1)} KB; Apps Script package: CID map, syntax, scope, send guard, simulation OK`,
);
