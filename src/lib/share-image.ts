import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { create } from 'fontkitten';
import sharp from 'sharp';
import { artPath, type Kanji } from './kanji';

const CACHE = 'node_modules/.astro/share-images';
await mkdir(CACHE, { recursive: true });
const TINTS = ['#ffd9d2', '#ffecb0', '#c9f0dc', '#cde5ff', '#e3dbff'];

// Text is drawn as outlines because the build server has no fonts of its own.
const face = create(await readFile('node_modules/@fontsource/m-plus-rounded-1c/files/m-plus-rounded-1c-latin-700-normal.woff2'));
if (face.isCollection) throw new Error('Expected a single font');
const font = face;
const width = (text: string) => font.glyphsForString(text).reduce((w, g) => w + g.advanceWidth, 0) / font.unitsPerEm;
function outline(text: string, centre: number, baseline: number, size: number, fill: string) {
  const s = size / font.unitsPerEm;
  let x = centre - (width(text) * size) / 2;
  const paths = font.glyphsForString(text).map((g) => {
    const d = `<path transform="translate(${x} ${baseline}) scale(${s} ${-s})" d="${g.path.toSVG()}"/>`;
    x += g.advanceWidth * s;
    return d;
  });
  return `<g fill="${fill}">${paths.join('')}</g>`;
}

/** A 1200x630 card with the drawing on the left, and the kanji and its meaning on the right. */
export async function shareImage(k: Kanji, index: number) {
  const source = await readFile(`public${artPath(k.kanji)}`);  const strokes = k.vg.strokes.map((s) => `<path d="${s.d}"/>`).join('');
  const label = k.meanings[0].replace(/^./, (c) => c.toUpperCase());
  const size = Math.min(64, 470 / width(label));
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
    <rect width="1200" height="630" fill="#f8edc9"/>
    <rect x="50" y="45" width="540" height="540" rx="56" fill="${TINTS[index % 5]}"/>
    <g transform="translate(745 55) scale(2.95)" fill="none" stroke="#2b1a12" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round">${strokes}</g>
    ${outline(label, 895, 465, size, '#2b1a12')}
    ${outline(`JLPT ${k.level}  |  SonnaKanji`, 895, 545, 34, '#5a3825')}
  </svg>`;
  // Where this folder survives between builds, unchanged cards are only drawn once.
  const cached = `${CACHE}/${createHash('sha1').update(svg).update(source).digest('hex')}.jpg`;
  const hit = await readFile(cached).catch(() => null);
  if (hit) return hit;
  const art = await sharp(source, { density: 200 }).resize(500, 500, { fit: 'inside' }).png().toBuffer();
  const card = await sharp(Buffer.from(svg)).composite([{ input: art, left: 70, top: 65 }]).flatten({ background: '#f8edc9' }).jpeg({ quality: 82 }).toBuffer();
  await writeFile(cached, card);
  return card;
}
