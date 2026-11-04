import { C, INK, sprites } from './sprites.mjs';


// Wobbles every line like a marker, and shades the lower left of each shape.
const defs = (seed) => `<defs><filter id="w" filterUnits="userSpaceOnUse" x="-20" y="-20" width="240" height="240"><feTurbulence type="fractalNoise" baseFrequency=".018" numOctaves="2" seed="${seed}"/><feDisplacementMap in="SourceGraphic" scale="2.6"/></filter><filter id="s" x="-5%" y="-5%" width="110%" height="110%"><feOffset in="SourceAlpha" dx="7" dy="-6" result="o"/><feComposite in="SourceAlpha" in2="o" operator="out" result="c"/><feFlood flood-color="#8a4a20" flood-opacity=".3"/><feComposite in2="c" operator="in" result="d"/><feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="d"/></feMerge></filter></defs>`;

const toScene = (n) => 6 + n * (188 / 109);
const scalePath = (d) => d.replace(/-?\d*\.?\d+/g, (n) => (Number(n) * (188 / 109)).toFixed(1));

// The kanji's real strokes, mapped from KanjiVG's 109-unit box into the drawing.
const strokePaths = (vg) => vg.strokes.map((st) => `<path transform="translate(6 6)" d="${st.absD}"/>`).join('');

function partBox(vg, index) {
  const pts = vg.strokes.filter((st) => st.part === index).flatMap((st) => st.pts);
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)].map(toScene);
  return { x: (x0 + x1) / 2, y: (y0 + y1) / 2, size: Math.max(x1 - x0, y1 - y0) };
}

// One layer: "name[:arg...] x y [scale] [f] [r45]", "name[:arg...] @part [scale] [f] [r45]"
// to sit on a component of the kanji, or "strokes:color[:width]" for the kanji itself.
function layer(spec, vg, base) {
  const [id, ...rest] = spec.trim().split(/\s+/);
  const [name, ...args] = id.split(':');
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
    ({ x, y } = box);
    opts = rest.slice(1);
    scale = (box.size / 100) * Number(opts.find((t) => /^[\d.]+$/.test(t)) ?? 1);
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
