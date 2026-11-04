#!/usr/bin/env node
// Renders scripts/art/scenes.mjs to one small SVG per kanji in public/art/.
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { renderScene } from './art/compose.mjs';
import { svgPathProperties } from 'svg-path-properties';
import { scenes } from './art/scenes.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const out = path.join(ROOT, 'public/art');
await mkdir(out, { recursive: true });
const records = JSON.parse(await readFile(path.join(ROOT, 'src/data/kanji.json'), 'utf8'));
const kanji = records.map((k) => k.kanji);

// Samples each stroke so scenes can read part positions and redraw the strokes.
function prepare(vg) {
  const unit = 188 / 109;
  return {
    ...vg,
    strokes: vg.strokes.map((st) => {
      const line = new svgPathProperties(st.d);
      const len = line.getTotalLength();
      const pts = Array.from({ length: 13 }, (_, i) => line.getPointAtLength((len * i) / 12)).map((p) => [p.x, p.y]);
      const steps = Math.max(Math.ceil(len / 3), 4);
      const fine = Array.from({ length: steps + 1 }, (_, i) => line.getPointAtLength((len * i) / steps));
      return { ...st, pts, absD: `M${fine.map((p) => `${(p.x * unit).toFixed(1)} ${(p.y * unit).toFixed(1)}`).join('L')}` };
    }),
  };
}
const missing = kanji.filter((k) => !scenes[k]);
if (missing.length) throw new Error(`No scene for: ${missing.join(' ')}`);

// Hand drawings in art-source/hand/<kanji>.<ext> replace the generated scene.
const handDir = path.join(ROOT, 'art-source/hand');
const hand = {};
for (const file of await readdir(handDir).catch(() => [])) {
  const k = path.parse(file).name;
  if (!kanji.includes(k)) throw new Error(`${file} is not named after a known kanji`);
  const name = `${k.codePointAt(0).toString(16)}.webp`;
  await sharp(path.join(handDir, file)).resize(640, 640, { fit: 'contain', background: '#0000' }).webp({ quality: 86, alphaQuality: 90 }).toFile(path.join(out, name));
  hand[k] = `/art/${name}`;
}
await writeFile(path.join(ROOT, 'src/data/hand-art.json'), JSON.stringify(hand));

let bytes = 0;
for (const [i, k] of kanji.entries()) {
  if (hand[k]) continue;
  const [scene, ...layers] = scenes[k];
  const svg = renderScene(scene, layers, i + 1, prepare(records[i].vg));
  bytes += svg.length;
  await writeFile(path.join(out, `${k.codePointAt(0).toString(16)}.svg`), svg);
}
console.log(`${Object.keys(hand).length} hand drawings; ${kanji.length} scenes, ${(bytes / 1024).toFixed(0)} KB total, ${(bytes / kanji.length / 1024).toFixed(1)} KB average`);
