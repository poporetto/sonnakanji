#!/usr/bin/env node
// Create labeled visual review sheets from hand illustration sources.
import { readFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const level = process.argv[2] ?? 'N4';
const root = path.resolve(import.meta.dirname, '../..');
const records = JSON.parse(await readFile(path.join(root, 'src/data/kanji.json'), 'utf8'))
  .filter((item) => item.level === level);
if (!records.length) throw new Error(`No kanji found for ${level}`);
const sources = records
  .map(({ kanji }) => ({ kanji, file: path.join(root, 'art-source/hand', `${kanji}.webp`) }))
  .filter(({ file }) => existsSync(file));
const outDir = path.join(root, 'art-source/review');
await mkdir(outDir, { recursive: true });

for (let start = 0; start < sources.length; start += 20) {
  const items = sources.slice(start, start + 20);
  const layers = [];
  for (const [i, { kanji, file }] of items.entries()) {
    const col = i % 4;
    const row = Math.floor(i / 4);
    layers.push({
      input: await sharp(file).resize(190, 190, { fit: 'contain', background: '#0000' }).png().toBuffer(),
      left: col * 240 + 25,
      top: row * 240 + 5,
    });
    layers.push({
      input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="240" height="40"><text x="120" y="30" text-anchor="middle" font-size="26" font-family="Arial">${kanji}</text></svg>`),
      left: col * 240,
      top: row * 240 + 195,
    });
  }
  const page = Math.floor(start / 20) + 1;
  await sharp({ create: { width: 960, height: 1200, channels: 4, background: '#fff' } })
    .composite(layers)
    .webp({ quality: 85 })
    .toFile(path.join(outDir, `${level.toLowerCase()}-sheet-${page}.webp`));
}
console.log(`${level}: ${sources.length}/${records.length} sources in ${Math.ceil(sources.length / 20)} review sheets`);
