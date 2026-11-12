#!/usr/bin/env node
// Flags generated cutouts whose translucent pixels spill into the outer margin.
// A high fringe score often means image generation left a noisy background halo.
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const level = process.argv[2] ?? 'N4';
const root = path.resolve(import.meta.dirname, '../..');
const records = JSON.parse(await readFile(path.join(root, 'src/data/kanji.json'), 'utf8'))
  .filter((item) => item.level === level);
if (!records.length) throw new Error(`No kanji found for ${level}`);

const flagged = [];
let found = 0;
for (const { kanji } of records) {
  const file = path.join(root, 'art-source/hand', `${kanji}.webp`);
  if (!existsSync(file)) continue;
  found++;
  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let fringe = 0;
  let margin = 0;
  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      if (x > info.width * .12 && x < info.width * .88 &&
          y > info.height * .12 && y < info.height * .88) continue;
      margin++;
      const alpha = data[(y * info.width + x) * info.channels + 3];
      if (alpha > 0 && alpha < 220) fringe++;
    }
  }
  const share = fringe / margin;
  if (share > .05) flagged.push({ kanji, share: `${(share * 100).toFixed(1)}%` });
}
console.log(`${level}: ${found}/${records.length} sources; ${flagged.length} edge flags`);
for (const { kanji, share } of flagged) console.log(`  ${kanji}: ${share} translucent outer pixels`);
