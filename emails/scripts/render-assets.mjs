/**
 * JG Investment Plus — email raster assets (v2).
 *
 * Builds every PNG the email template uses, from repository sources only:
 *   - the JG mark from the CANONICAL path (public/brand/jg-mark.svg and
 *     src/components/Logo.tsx; the script stops if they disagree with the
 *     approved v1.0 geometry),
 *   - the icons from emails/src/icons/*.svg,
 *   - the K&H partner logo: a BYTE-IDENTICAL copy, never re-rendered —
 *       SOURCE:            public/brand/kh-logo-dark.png (canonical website asset)
 *       EMAIL PRIVATE COPY: emails/assets/kh-logo-dark.png (CID khPartnerLogo)
 *
 * The email has no hero image: the candlestick hero was rejected in review
 * (brand: no trading / chart visuals), so the hero is typographic only.
 *
 * Output: emails/assets/ (private; see emails/scripts/cid-assets.mjs for the
 * CID names). Email clients do not render inline SVG reliably, so the email
 * uses these rasters, embedded as CID inline MIME parts. Each one has its cell's background colour baked in (no
 * transparency), so the mark stays readable when a client inverts colours in
 * dark mode.
 *
 * No new project dependency: this uses the globally installed Playwright and
 * its Chromium build.
 *
 *   NODE_PATH="$(npm root -g)" node emails/scripts/render-assets.mjs
 */
import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
// Private email assets — embedded as CID inline images, never hosted publicly.
const OUT = join(ROOT, "emails/assets");

/** JG Logo System v1.0 — docs/brand/logo-system-v1.md §3. Never edit here. */
const CANONICAL_PATH =
  "M44 0 80 18 44 36 8 18Z M0 23 32 39 32 83 0 99Z M88 23 56 39 56 83 88 99Z";
const CANONICAL_VIEWBOX = "0 0 88 99";

const COLORS = {
  carbon: "#18181B",
  porcelain: "#F4F3F1",
  aubergine: "#493447",
  noticeBg: "#ECE9E6",
};

function assertCanonicalMark() {
  const sources = {
    "public/brand/jg-mark.svg": readFileSync(join(ROOT, "public/brand/jg-mark.svg"), "utf8"),
    "public/brand/jg-mark-inverse.svg": readFileSync(
      join(ROOT, "public/brand/jg-mark-inverse.svg"),
      "utf8",
    ),
    "src/components/Logo.tsx": readFileSync(join(ROOT, "src/components/Logo.tsx"), "utf8"),
  };
  for (const [file, text] of Object.entries(sources)) {
    if (!text.includes(CANONICAL_PATH) || !text.includes(CANONICAL_VIEWBOX)) {
      throw new Error(`${file} does not contain the canonical JG mark geometry — aborting.`);
    }
  }
}

const markSvg = (fill) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${CANONICAL_VIEWBOX}"><path fill="${fill}" d="${CANONICAL_PATH}"/></svg>`;

const page = (body, bg) =>
  `<!doctype html><html><head><style>html,body{margin:0;padding:0;background:${bg}}
   svg,img,canvas{display:block}</style></head><body>${body}</body></html>`;

/** Renders an SVG string at an exact pixel size on a solid background. */
async function renderSvg(browser, svg, width, height, bg, file) {
  const p = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
  const sized = svg.replace("<svg ", `<svg width="${width}" height="${height}" `);
  await p.setContent(page(sized, bg));
  const buf = await p.screenshot({ clip: { x: 0, y: 0, width, height }, type: "png" });
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, buf);
  await p.close();
  console.log(`  ${file.replace(ROOT + "/", "")} (${width}×${height})`);
}

assertCanonicalMark();

// K&H partner logo: copied byte for byte from the canonical website asset
// (white on transparent, made for dark backgrounds — the email shows it on
// the Aubergine partner band). Not recoloured, cropped or re-rendered.
const KH_SOURCE = join(ROOT, "public/brand/kh-logo-dark.png");
const KH_COPY = join(OUT, "kh-logo-dark.png");
copyFileSync(KH_SOURCE, KH_COPY);
if (!readFileSync(KH_SOURCE).equals(readFileSync(KH_COPY))) throw new Error("K&H logo copy is not byte-identical");
console.log("  emails/assets/kh-logo-dark.png (byte-identical copy of public/brand/kh-logo-dark.png)");
console.log("Canonical JG mark geometry verified.");

const browser = await chromium.launch();
try {
  // Logo marks: displayed at 40×45 CSS px (88:99), rendered @2x = 80×90.
  await renderSvg(browser, markSvg(COLORS.carbon), 80, 90, COLORS.porcelain, join(OUT, "jg-mark-carbon@2x.png"));
  // Header mark: Porcelain on Aubergine — the header background (= CTA colour).
  await renderSvg(browser, markSvg(COLORS.porcelain), 80, 90, COLORS.aubergine, join(OUT, "jg-mark-porcelain@2x.png"));

  // Icons: displayed at 32×32, rendered @2x = 64×64.
  for (const name of ["opportunities", "savings", "digital", "relationship"]) {
    const svg = readFileSync(join(ROOT, `emails/src/icons/${name}.svg`), "utf8").replace(/<!--[\s\S]*?-->/g, "");
    await renderSvg(browser, svg.replace(/ width="32" height="32"/, ""), 64, 64, COLORS.porcelain, join(OUT, `icons/${name}.png`));
  }
  const notice = readFileSync(join(ROOT, "emails/src/icons/notice.svg"), "utf8").replace(/<!--[\s\S]*?-->/g, "");
  await renderSvg(browser, notice.replace(/ width="32" height="32"/, ""), 64, 64, COLORS.noticeBg, join(OUT, "icons/notice.png"));
} finally {
  await browser.close();
}
