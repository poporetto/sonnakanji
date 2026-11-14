#!/usr/bin/env node
// Preserve a generated PNG in the ignored cache and ship a compact WebP source.
import { copyFile, mkdir, readFile, access } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const [level, kanji, png] = process.argv.slice(2);
if (!level || !kanji || !png) throw new Error('Usage: import-generated.mjs LEVEL KANJI PNG');
const root = path.resolve(import.meta.dirname, '../..');
const records = JSON.parse(await readFile(path.join(root, 'src/data/kanji.json'), 'utf8'));
if (!records.some((item) => item.level === level && item.kanji === kanji)) {
  throw new Error(`${kanji} is not a ${level} kanji`);
}
const output = path.join(root, 'art-source/hand', `${kanji}.webp`);
try {
  await access(output);
  throw new Error(`${output} exists; inspect it before replacing`);
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}
const cache = path.join(root, `.cache/${level.toLowerCase()}-original-png`);
await mkdir(cache, { recursive: true });
await copyFile(png, path.join(cache, `${kanji}-${level.toLowerCase()}.png`));
await sharp(png).webp({ quality: 92, alphaQuality: 100 }).toFile(output);
console.log(`${kanji} -> ${path.relative(root, output)}`);
