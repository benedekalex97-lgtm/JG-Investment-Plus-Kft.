#!/usr/bin/env node
/**
 * Hero-embléma rétegképek előállítása a JG_hero_3D_alap csomagból.
 *
 *   node scripts/build-hero-emblem.mjs <layers-könyvtár> [--out public/hero-emblem]
 *
 * Bemenet: jg_cap_aubergine.png, jg_panel_silver.png, jg_panel_carbon.png —
 * azonos méretű, azonos kameranézetből renderelt, alfa-csatornás vásznak.
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
const WIDTHS = [480, 720, 1000];
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
console.log(`Összesen ${(total / 1024).toFixed(1)} KB`);

const cfgPath = "src/components/hero-intro/emblemAssets.ts";
let cfg = readFileSync(cfgPath, "utf8");
cfg = cfg
  .replace(/width: \d+,/, `width: ${cw},`)
  .replace(/height: \d+,/, `height: ${ch},`)
  .replace(/widths: \[[^\]]*\],/, `widths: [${uniqueWidths.join(", ")}],`);
writeFileSync(cfgPath, cfg);
console.log(`Frissítve: ${cfgPath} (width ${cw}, height ${ch}, widths ${uniqueWidths.join("/")})`);
