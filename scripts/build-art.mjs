#!/usr/bin/env node
// Renders scripts/art/scenes.mjs to one small SVG per kanji in public/art/.
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { renderScene } from './art/compose.mjs';
import { scenes } from './art/scenes.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const out = path.join(ROOT, 'public/art');
await mkdir(out, { recursive: true });
const kanji = JSON.parse(await readFile(path.join(ROOT, 'src/data/kanji.json'), 'utf8')).map((k) => k.kanji);
const missing = kanji.filter((k) => !scenes[k]);
if (missing.length) throw new Error(`No scene for: ${missing.join(' ')}`);
let bytes = 0;
for (const k of kanji) {
  const [scene, ...layers] = scenes[k];
  const svg = renderScene(scene, layers);
  bytes += svg.length;
  await writeFile(path.join(out, `${k.codePointAt(0).toString(16)}.svg`), svg);
}
console.log(`${kanji.length} scenes, ${(bytes / 1024).toFixed(0)} KB total, ${(bytes / kanji.length / 1024).toFixed(1)} KB average`);
