#!/usr/bin/env node
/*
  Optimize public image assets IN PLACE (perf audit finding F1 — P0).
  Resizes every PNG to ~2x its real rendered size and re-encodes with a
  palette (transparency preserved), so file PATHS never change and no code
  needs touching. Backgrounds convert to WebP (gradient-heavy art bands with
  palette PNG) — their 3 CSS references live in AppShell.

  Max display sizes in the app (see AppAssetIcon / Avatar presets):
    icons        ≤ ~140px artwork  → 280px assets
    avatars      ≤ 72px            → 224px (headroom for future hero uses)
    badges       ≤ ~96px           → 192px
    illustrations≤ ~200px          → 512px
    backgrounds  decorative full-bleed (currently unused) → 828/1600px WebP

  Usage: node scripts/optimize-assets.mjs          (writes files)
         node scripts/optimize-assets.mjs --dry    (report only)
*/
import { readdirSync, statSync, writeFileSync, unlinkSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";

const DRY = process.argv.includes("--dry");

const RULES = [
  { dir: "public/assets/icons", max: 280, format: "png" },
  { dir: "public/assets/avatars", max: 224, format: "png" },
  { dir: "public/assets/badges", max: 192, format: "png" },
  { dir: "public/assets/illustrations", max: 512, format: "png" },
  { dir: "public/backgrounds", max: 1600, maxMobile: 828, format: "webp" },
];

const kb = (n) => Math.round(n / 1024);
let beforeTotal = 0;
let afterTotal = 0;

for (const rule of RULES) {
  let files = [];
  try {
    files = readdirSync(rule.dir).filter((f) => /\.(png|webp)$/i.test(f));
  } catch {
    continue;
  }
  console.log(`\n== ${rule.dir} ==`);
  for (const file of files) {
    const path = join(rule.dir, file);
    const before = statSync(path).size;
    beforeTotal += before;
    const img = sharp(path);
    const meta = await img.metadata();
    const max = rule.maxMobile && /mobile/i.test(file) ? rule.maxMobile : rule.max;
    const resize = Math.max(meta.width ?? 0, meta.height ?? 0) > max;

    let pipeline = sharp(path);
    if (resize) pipeline = pipeline.resize({ width: max, height: max, fit: "inside" });
    const buffer =
      rule.format === "webp"
        ? await pipeline.webp({ quality: 72 }).toBuffer()
        : await pipeline.png({ palette: true, quality: 82, compressionLevel: 9 }).toBuffer();

    // never make a file bigger
    const target = rule.format === "webp" ? path.replace(/\.png$/i, ".webp") : path;
    const after = Math.min(buffer.length, before);
    afterTotal += after;
    console.log(
      `  ${file.padEnd(38)} ${String(meta.width + "x" + meta.height).padEnd(11)} ${String(kb(before) + "KB").padStart(8)} → ${String(kb(buffer.length) + "KB").padStart(7)}${resize ? ` (resized ≤${max}px)` : ""}${buffer.length >= before ? " [kept original]" : ""}`,
    );
    if (!DRY && buffer.length < before) {
      writeFileSync(target, buffer);
      if (target !== path) unlinkSync(path); // png → webp conversion
    }
  }
}

console.log(`\nTOTAL: ${kb(beforeTotal)}KB → ${kb(afterTotal)}KB (${Math.round((1 - afterTotal / beforeTotal) * 100)}% saved)${DRY ? " [dry run]" : ""}`);
