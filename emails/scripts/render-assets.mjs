/**
 * JG Investment Plus — email raster assets (v2).
 *
 * Builds every PNG/JPG the email template uses, from repository sources only:
 *   - the JG mark from the CANONICAL path (public/brand/jg-mark.svg and
 *     src/components/Logo.tsx; the script stops if they disagree with the
 *     approved v1.0 geometry),
 *   - the icons from emails/src/icons/*.svg,
 *   - the hero from src/assets/hero-market-corridor.webp (read only).
 *
 * Email clients do not render inline SVG reliably, so the email uses these
 * rasters. Each one has its cell's background colour baked in (no
 * transparency), so the mark stays readable when a client inverts colours in
 * dark mode.
 *
 * No new project dependency: this uses the globally installed Playwright and
 * its Chromium build.
 *
 *   NODE_PATH="$(npm root -g)" node emails/scripts/render-assets.mjs
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const OUT = join(ROOT, "public/email");

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

/**
 * Crops the hero source and fades its edges into the email background, then
 * exports a JPEG. `fades` lists the edges that blend into Porcelain.
 */
async function renderHero(browser, { crop, width, height, fades, file }) {
  const src = readFileSync(join(ROOT, "src/assets/hero-market-corridor.webp")).toString("base64");
  const p = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
  await p.setContent(page(`<canvas id="c" width="${width}" height="${height}"></canvas>`, "#fff"));
  const dataUrl = await p.evaluate(
    async ({ src, crop, width, height, fades, bg }) => {
      const img = new Image();
      img.src = `data:image/webp;base64,${src}`;
      await img.decode();
      const ctx = document.getElementById("c").getContext("2d");
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, crop.x, crop.y, crop.w, crop.h, 0, 0, width, height);
      const fade = (x0, y0, x1, y1, stops) => {
        const g = ctx.createLinearGradient(x0, y0, x1, y1);
        for (const [at, alpha] of stops) g.addColorStop(at, `rgba(${bg},${alpha})`);
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, width, height);
      };
      // Eased ramp (smoothstep-like), so the photo melts into Porcelain
      // without a visible grey band.
      const soft = [
        [0, 1],
        [0.15, 0.97],
        [0.3, 0.88],
        [0.45, 0.72],
        [0.6, 0.5],
        [0.75, 0.28],
        [0.9, 0.09],
        [1, 0],
      ];
      if (fades.left) fade(0, 0, width * fades.left, 0, soft);
      if (fades.right) fade(width, 0, width * (1 - fades.right), 0, soft);
      if (fades.bottom) fade(0, height, 0, height * (1 - fades.bottom), soft);
      if (fades.top) fade(0, 0, 0, height * fades.top, soft);
      return document.getElementById("c").toDataURL("image/jpeg", 0.84);
    },
    { src, crop, width, height, fades, bg: "244,243,241" },
  );
  writeFileSync(file, Buffer.from(dataUrl.split(",")[1], "base64"));
  await p.close();
  console.log(`  ${file.replace(ROOT + "/", "")} (${width}×${height})`);
}

assertCanonicalMark();
console.log("Canonical JG mark geometry verified.");

const browser = await chromium.launch();
try {
  // Logo marks: displayed at 40×45 CSS px (88:99), rendered @2x = 80×90.
  await renderSvg(browser, markSvg(COLORS.carbon), 80, 90, COLORS.porcelain, join(OUT, "jg-mark-carbon@2x.png"));
  await renderSvg(browser, markSvg(COLORS.porcelain), 80, 90, COLORS.carbon, join(OUT, "jg-mark-porcelain@2x.png"));

  // Icons: displayed at 32×32, rendered @2x = 64×64.
  for (const name of ["opportunities", "savings", "digital", "relationship"]) {
    const svg = readFileSync(join(ROOT, `emails/src/icons/${name}.svg`), "utf8").replace(/<!--[\s\S]*?-->/g, "");
    await renderSvg(browser, svg.replace(/ width="32" height="32"/, ""), 64, 64, COLORS.porcelain, join(OUT, `icons/${name}.png`));
  }
  const notice = readFileSync(join(ROOT, "emails/src/icons/notice.svg"), "utf8").replace(/<!--[\s\S]*?-->/g, "");
  await renderSvg(browser, notice.replace(/ width="32" height="32"/, ""), 64, 64, COLORS.noticeBg, join(OUT, "icons/notice.png"));

  // Desktop hero: right-hand column, displayed 200×300, rendered @2x.
  await renderHero(browser, {
    crop: { x: 1045, y: 0, w: 627, h: 941 },
    width: 400,
    height: 600,
    fades: { left: 0.62, bottom: 0.32 },
    file: join(OUT, "jg-email-hero.jpg"),
  });
  // Mobile hero: full-width dark banner under the header, displayed up to
  // 640×200, rendered @2x. No fade: it sits directly below the Carbon header.
  await renderHero(browser, {
    crop: { x: 0, y: 150, w: 1672, h: 522 },
    width: 1280,
    height: 400,
    fades: {},
    file: join(OUT, "jg-email-hero-mobile.jpg"),
  });
} finally {
  await browser.close();
}
