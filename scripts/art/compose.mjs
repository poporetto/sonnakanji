import { C, INK, sprites } from './sprites.mjs';


// Wobbles every line like a marker, and shades the lower left of each shape.
const defs = (seed) => `<defs><filter id="w" filterUnits="userSpaceOnUse" x="-20" y="-20" width="240" height="240"><feTurbulence type="fractalNoise" baseFrequency=".018" numOctaves="2" seed="${seed}"/><feDisplacementMap in="SourceGraphic" scale="2.6"/></filter><filter id="s" x="-5%" y="-5%" width="110%" height="110%"><feOffset in="SourceAlpha" dx="7" dy="-6" result="o"/><feComposite in="SourceAlpha" in2="o" operator="out" result="c"/><feFlood flood-color="#8a4a20" flood-opacity=".3"/><feComposite in2="c" operator="in" result="d"/><feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="d"/></feMerge></filter></defs>`;

const toScene = (n) => 6 + n * (188 / 109);
const scalePath = (d) => d.replace(/-?\d*\.?\d+/g, (n) => (Number(n) * (188 / 109)).toFixed(1));

// The kanji's real strokes, mapped from KanjiVG's 109-unit box into the drawing.
const strokePaths = (vg, part = null) => vg.strokes.filter((st) => part === null || st.part === part).map((st) => `<path transform="translate(6 6)" d="${st.absD}"/>`).join('');

// Same order as --p0..--p4 on the card, so a part keeps its colour everywhere.
const PART_COLORS = ['#d4583f', '#3f7ea3', '#4b8f5e', '#8a5aa8', '#b57a14'];

// The kanji behind a compound's objects, in the same colours as its part list.
function tintedKanji(vg) {
  const width = Math.max(5, 11 - Math.max(vg.strokes.length - 8, 0) * 0.5);
  const inParts = vg.parts.map((p, i) => `<g stroke="${p.el ? PART_COLORS[i % 5] : '#7a6c5a'}" stroke-opacity=".45" stroke-width="${width}">${strokePaths(vg, i)}</g>`).join('');
  const loose = vg.strokes.some((st) => st.part < 0) ? `<g stroke="#7a6c5a" stroke-opacity=".45" stroke-width="${width}">${strokePaths(vg, -1)}</g>` : '';
  return inParts + loose;
}

function partBox(vg, index) {
  const pts = vg.strokes.filter((st) => st.part === index).flatMap((st) => st.pts);
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)].map(toScene);
  return { x: (x0 + x1) / 2, y: (y0 + y1) / 2, size: Math.max(x1 - x0, y1 - y0) };
}

// One layer: "name[:arg...] x y [scale] [f] [r45]", "name[:arg...] @part [scale] [f] [r45]"
// to sit on a component of the kanji, "strokes:color[:width]" for the kanji as an
// object, or "kanji" for the character tinted by part.
function layer(spec, vg, base) {
  const [id, ...rest] = spec.trim().split(/\s+/);
  const [name, ...args] = id.split(':');
  if (name === 'kanji') return tintedKanji(vg);
  if (name === 'strokes') {
    const color = C[args[0]] ?? args[0];
    // Dense kanji get finer strokes so the drawing still shows through.
    const n = vg.strokes.length;
    const width = n > 8 && color === C.white ? Math.max(3, Number(args[1]) - (n - 8) * 0.3) : Number(args[1] ?? 13);
    const lines = strokePaths(vg);
    return `<g stroke-width="${(width + Math.min(base * 1.6, width * 0.8)).toFixed(1)}">${lines}</g><g stroke="${color}" stroke-width="${width}">${lines}</g>`;
  }
  const draw = sprites[name];
  if (!draw) throw new Error(`Unknown sprite "${name}" in "${spec}"`);
  let x, y, scale, opts;
  if (rest[0]?.startsWith('@')) {
    const box = partBox(vg, Number(rest[0].slice(1)));
    opts = rest.slice(1);
    scale = Math.min((box.size / 100) * Number(opts.find((t) => /^[\d.]+$/.test(t)) ?? 1), 1.1);
    // Objects stay whole, even when their part hugs the edge of the kanji.
    const reach = 58 * scale;
    const keepIn = (v) => Math.min(Math.max(v, reach + 2), 198 - reach);
    x = keepIn(box.x);
    y = keepIn(box.y);
  } else {
    [x, y] = rest;
    opts = rest.slice(2);
    scale = Number(opts.find((t) => /^[\d.]+$/.test(t)) ?? 1);
  }
  const flip = opts.includes('f');
  const rot = opts.find((t) => /^r-?\d+$/.test(t))?.slice(1);
  const t = [`translate(${Number(x).toFixed(1)} ${Number(y).toFixed(1)})`, rot && `rotate(${rot})`, `scale(${(flip ? -scale : scale).toFixed(3)} ${scale.toFixed(3)})`].filter(Boolean).join(' ');
  // Lines stay one weight however large a sprite is drawn.
  return `<g transform="${t}" stroke-width="${(base / scale).toFixed(2)}">${draw(args)}</g>`;
}

export function renderScene(_scene, layers, seed, vg) {
  const base = 3.5;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">${defs(seed)}<g filter="url(#w)"><g stroke="${INK}" stroke-linecap="round" stroke-linejoin="round" fill="none">${layers.map((l) => layer(l, vg, base)).join('')}</g></g></svg>`;
}
