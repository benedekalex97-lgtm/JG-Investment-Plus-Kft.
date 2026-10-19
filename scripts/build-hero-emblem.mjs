#!/usr/bin/env node
/**
 * Hero-embléma rétegképek előállítása a JG_hero_3D_alap csomagból.
 *
 *   node scripts/build-hero-emblem.mjs <layers-könyvtár> [--out public/hero-emblem]
 *
 * Bemenet: jg_cap_aubergine.png, jg_panel_silver.png, jg_panel_carbon.png —
 * azonos méretű, azonos kameranézetből renderelt, alfa-csatornás vásznak.
 *
 * Opcionálisan: background.png (átlátszatlan, ugyanabból a kameranézetből).
 * Ebből CSAK a fény kerül át: a render közel fekete alapszínét levonjuk, az
 * alfa a maradék fényességből és egy lágy radiális maszkból áll — így a
 * háttér nem jelenik meg téglalapként, csak a padlófény marad a hero
 * saját felületén.
 *
 * Lépések (a regisztráció megőrzésével):
 *   1) a három réteg alfa-uniójának befoglaló doboza + ráhagyás;
 *   2) MINDHÁROM réteg ugyanazzal a téglalappal vágva;
 *   3) azonos célszélességekre méretezés (a magasság az arányból), alfa-
 *      csatornás WebP;
 *   4) a vágott méret beírása a src/components/hero-intro/emblemAssets.ts-be.
 *
 * A forráscsomag (ZIP, .blend, GLB, videó, referencia-HTML) NEM kerül a
 * repositoryba és a public könyvtárba — csak ennek a scriptnek a kimenete.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const args = process.argv.slice(2);
const srcDir = args[0];
const outIdx = args.indexOf("--out");
const outDir = outIdx > -1 ? args[outIdx + 1] : "public/hero-emblem";
if (!srcDir) {
  console.error("Használat: node scripts/build-hero-emblem.mjs <layers-könyvtár> [--out dir]");
  process.exit(1);
}

const LAYERS = [
  { file: "jg_cap_aubergine.png", out: "jg-cap-aubergine" },
  { file: "jg_panel_silver.png", out: "jg-panel-silver" },
  { file: "jg_panel_carbon.png", out: "jg-panel-carbon" },
];
const WIDTHS = [400, 600, 1000];
const BG_FILE = "background.png";
const BG_WIDTH = 480; // a padlófény sima gradiens: egy méret elég
const BG_BASE = [11, 11, 13]; // a render háttérszíne; ami e fölött van, az „fény"
const PAD = 0.04; // ráhagyás a vágott doboz méretéhez képest (árnyék, élsimítás)
const ALPHA_MIN = 4; // ennél halványabb pixel nem számít a befoglaló dobozba

const inputs = await Promise.all(
  LAYERS.map(async (l) => {
    const p = path.join(srcDir, l.file);
    if (!existsSync(p)) throw new Error(`Hiányzó réteg: ${p}`);
    const img = sharp(p).ensureAlpha();
    const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
    return { ...l, path: p, data, info };
  }),
);

const { width: W, height: H } = inputs[0].info;
for (const i of inputs) {
  if (i.info.width !== W || i.info.height !== H) {
    throw new Error(`Eltérő vászonméret: ${i.file} ${i.info.width}×${i.info.height} ≠ ${W}×${H}`);
  }
}

let minX = W, minY = H, maxX = -1, maxY = -1;
for (const { data, info } of inputs) {
  const ch = info.channels;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      if (data[(y * W + x) * ch + 3] > ALPHA_MIN) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
}
if (maxX < 0) throw new Error("A rétegek teljesen átlátszók.");

const bw = maxX - minX + 1;
const bh = maxY - minY + 1;
const pad = Math.round(Math.max(bw, bh) * PAD);
const left = Math.max(0, minX - pad);
const top = Math.max(0, minY - pad);
const cw = Math.min(W, maxX + pad + 1) - left;
const ch = Math.min(H, maxY + pad + 1) - top;
console.log(`Vászon ${W}×${H} → közös vágás x=${left} y=${top} ${cw}×${ch}`);

mkdirSync(outDir, { recursive: true });
const widths = WIDTHS.filter((w) => w < cw).concat(cw <= WIDTHS.at(-1) ? [cw] : []);
const uniqueWidths = [...new Set(widths)].sort((a, b) => a - b);

let total = 0;
for (const l of inputs) {
  for (const w of uniqueWidths) {
    const file = path.join(outDir, `${l.out}-${w}.webp`);
    const info = await sharp(l.path)
      .extract({ left, top, width: cw, height: ch })
      .resize({ width: w, kernel: "lanczos3" })
      .webp({ quality: 84, alphaQuality: 90, effort: 6, smartSubsample: true })
      .toFile(file);
    total += info.size;
    console.log(`  ${file}  ${info.width}×${info.height}  ${(info.size / 1024).toFixed(1)} KB`);
  }
}
// --- Háttér → „csak fény" réteg (teljes vászon, a regisztráció változatlan) ---
const bgPath = path.join(srcDir, BG_FILE);
let floorRect = null;
if (existsSync(bgPath)) {
  const { data, info } = await sharp(bgPath).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  if (info.width !== W || info.height !== H) throw new Error("A háttér vászonmérete eltér.");
  const out = Buffer.alloc(W * H * 4);
  // A maszk a vászon alsó éle ELŐTT nullára fogy: nincs vágott él.
  const cx = W / 2, cy = H * 0.86, rx = W * 0.48, ry = H * 0.135;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 3;
      const l = [0, 1, 2].map((k) => Math.max(0, data[i + k] - BG_BASE[k]));
      const m = Math.max(l[0], l[1], l[2]);
      // lágy ellipszis-maszk: a vászon peremén nulla
      const d = Math.hypot((x - cx) / rx, (y - cy) / ry);
      const mask = d >= 1 ? 0 : 0.5 + 0.5 * Math.cos(Math.PI * d);
      const a = (m / 255) * mask;
      const o = (y * W + x) * 4;
      if (m > 0) {
        out[o] = Math.min(255, Math.round((l[0] / m) * 255));
        out[o + 1] = Math.min(255, Math.round((l[1] / m) * 255));
        out[o + 2] = Math.min(255, Math.round((l[2] / m) * 255));
      }
      out[o + 3] = Math.round(a * 255);
    }
  }
  // Csak a ténylegesen fényt hordozó sáv marad (kisebb fájl, kisebb doboz).
  let fx0 = W, fy0 = H, fx1 = -1, fy1 = -1;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      if (out[(y * W + x) * 4 + 3] > 1) {
        if (x < fx0) fx0 = x;
        if (x > fx1) fx1 = x;
        if (y < fy0) fy0 = y;
        if (y > fy1) fy1 = y;
      }
    }
  }
  floorRect = { left: fx0, top: fy0, width: fx1 - fx0 + 1, height: fy1 - fy0 + 1 };
  const file = path.join(outDir, `jg-floor-light-${BG_WIDTH}.webp`);
  const info2 = await sharp(out, { raw: { width: W, height: H, channels: 4 } })
    .extract(floorRect)
    .resize({ width: BG_WIDTH, kernel: "lanczos3" })
    .webp({ quality: 80, alphaQuality: 80, effort: 6 })
    .toFile(file);
  total += info2.size;
  console.log(`  ${file}  ${info2.width}×${info2.height}  ${(info2.size / 1024).toFixed(1)} KB (padlófény)`);
}
console.log(`Összesen ${(total / 1024).toFixed(1)} KB`);

const cfgPath = "src/components/hero-intro/emblemAssets.ts";
let cfg = readFileSync(cfgPath, "utf8");
cfg = cfg
  .replace(/width: \d+,/, `width: ${cw},`)
  .replace(/height: \d+,/, `height: ${ch},`)
  .replace(/widths: \[[^\]]*\],/, `widths: [${uniqueWidths.join(", ")}],`)
  .replace(/canvas: \{[^}]*\},/, `canvas: { width: ${W}, height: ${H}, left: ${left}, top: ${top} },`);
if (floorRect) {
  cfg = cfg.replace(
    /floorRect: \{[^}]*\},/,
    `floorRect: { left: ${floorRect.left}, top: ${floorRect.top}, width: ${floorRect.width}, height: ${floorRect.height} },`,
  );
}
writeFileSync(cfgPath, cfg);
console.log(`Frissítve: ${cfgPath} (width ${cw}, height ${ch}, widths ${uniqueWidths.join("/")})`);
