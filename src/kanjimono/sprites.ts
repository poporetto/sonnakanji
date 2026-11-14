import type { Species } from './battle';
import { GEAR, INKS, LOOSE, LOW, ON_TOP, PICKS } from './gear';

export const OUTLINE = '#2b2036';

export function canvas(w: number, h: number) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return c;
}

export const hash = (x: number, y: number) => {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return s - Math.floor(s);
};

// Each creature is its kanji drawn as a chunky bubble letter: one bright colour, a thick outline,
// a small face resting on the strokes, and a little accessory that hints at the meaning.
type Ramp = [string, string, string, string];
const PAINT: Record<string, Ramp> = {
  pink: ['#d94f86', '#f27aa8', '#fbb0cb', '#ffe0ea'],
  red: ['#d13c44', '#ef5f62', '#fa9490', '#ffd0c8'],
  orange: ['#dd7426', '#f4983e', '#fbbd6e', '#ffe2b0'],
  peach: ['#d98a4e', '#f0ab70', '#f9c999', '#ffe8cc'],
  yellow: ['#dfa41f', '#f6c63c', '#fde077', '#fff4b8'],
  green: ['#3f9c46', '#68bf52', '#99da72', '#d0f0a4'],
  mint: ['#2f9e8e', '#52c3ac', '#88e0c8', '#c8f5e6'],
  sky: ['#2f80d8', '#55a8ee', '#8ccdf7', '#ccecff'],
  lilac: ['#8558d0', '#a884ea', '#c9aef5', '#ebdffc'],
  dark: ['#3a3640', '#55505e', '#74707e', '#9a96a4'],
  white: ['#b8c2d8', '#d8e0ee', '#f2f6fb', '#ffffff'],
};
const OUTLINE_OF: Record<string, string> = {
  pink: '#6e1f4c', red: '#6e1a26', orange: '#6e3414', peach: '#6a3a22', yellow: '#6e4a12', green: '#1f4f2c',
  mint: '#14504c', sky: '#143a78', lilac: '#3a2480', dark: '#17151c', white: '#333a50',
};

const BRIGHT = ['pink', 'orange', 'yellow', 'green', 'sky', 'lilac', 'mint', 'peach', 'red'];

function styleOf(s: Species) {
  const seed = s.k.codePointAt(0)!;
  if (s.k === '火') return { paint: 'orange', gear: 'flame', split: 'fire' };
  if (s.k === '水') return { paint: 'sky', gear: 'drop', split: '' };
  if (s.k === '木') return { paint: 'peach', gear: 'sprout', split: 'moss' };
  if (s.k === '山') return { paint: 'green', gear: 'rays', split: 'snow' };
  if (s.k === '川') return { paint: 'sky', gear: 'wave', split: '' };
  if (s.k === '月') return { paint: 'yellow', gear: 'moon', split: 'dusk' };
  if (s.k === '日') return { paint: 'orange', gear: 'sun', split: '' };
  const hit = PICKS.find(([kanji]) => kanji.includes(s.k));
  if (hit) return { paint: hit[1] || BRIGHT[seed % BRIGHT.length], gear: hit[2], split: '' };
  const type = ({ fire: 'orange', water: 'sky', wood: 'green', earth: 'peach', metal: 'yellow' } as Record<string, string>)[s.type];
  return { paint: type ?? BRIGHT[seed % BRIGHT.length], gear: seed % 3 ? 'rays' : 'star', split: '' };
}

const blend = (a: string, b: string, t: number) => {
  const at = (hex: string, i: number) => parseInt(hex.slice(i, i + 2), 16);
  return `rgb(${[1, 3, 5].map((i) => Math.round(at(a, i) + (at(b, i) - at(a, i)) * t)).join(',')})`;
};

// Accessories are drawn on a coarse grid, then grown threefold with their diagonals rounded off,
// so they sit at the same pixel size as the kanji they belong to.
function rounded(rows: string[]) {
  const at = (x: number, y: number) => { const ch = rows[y]?.[x]; return ch && INKS[ch] ? ch : '.'; };
  const out: string[][] = Array.from({ length: rows.length * 3 }, () => []);
  for (let y = 0; y < rows.length; y++) for (let x = 0; x < rows[0].length; x++) {
    const [A, B, C, D, E, F, G, H, I] = [at(x - 1, y - 1), at(x, y - 1), at(x + 1, y - 1), at(x - 1, y), at(x, y), at(x + 1, y), at(x - 1, y + 1), at(x, y + 1), at(x + 1, y + 1)];
    const cut = B !== H && D !== F;
    const cells = !cut ? [E, E, E, E, E, E, E, E, E] : [
      D === B ? D : E, (D === B && E !== C) || (B === F && E !== A) ? B : E, B === F ? F : E,
      (D === B && E !== G) || (D === H && E !== A) ? D : E, E, (B === F && E !== I) || (H === F && E !== C) ? F : E,
      D === H ? D : E, (D === H && E !== I) || (H === F && E !== G) ? H : E, H === F ? F : E,
    ];
    cells.forEach((ch, i) => { out[y * 3 + Math.floor(i / 3)][x * 3 + (i % 3)] = ch; });
  }
  return out.map((row) => row.join(''));
}

export const MARGIN = 26;
interface Body { art: HTMLCanvasElement; fx: number; fy: number; gap: number; tiny: boolean; pale: boolean; size: number; seed: number }
const bodies = new Map<string, Body>();

function inked(s: Species, size: number, width: number) {
  const scratch = canvas(size, size);
  const g = scratch.getContext('2d', { willReadFrequently: true })!;
  g.scale(size / 109, size / 109);
  g.lineCap = 'round'; g.lineJoin = 'round';
  g.lineWidth = width;
  for (const d of s.d) g.stroke(new Path2D(d));
  const data = g.getImageData(0, 0, size, size).data;
  const mask = new Uint8Array(size * size);
  for (let i = 0; i < mask.length; i++) mask[i] = data[i * 4 + 3] > 90 ? 1 : 0;
  // A soft pass rounds every join into the same pudgy shape.
  const soft = new Uint8Array(mask.length);
  const r = Math.round(size / 36);
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    let on = 0, all = 0;
    for (let j = -r; j <= r; j++) for (let i = -r; i <= r; i++) {
      const a = x + i, b = y + j;
      all++;
      if (a >= 0 && b >= 0 && a < size && b < size && mask[b * size + a]) on++;
    }
    soft[y * size + x] = on / all > 0.5 ? 1 : 0;
  }
  return soft;
}

// Each kanji gets as chunky as it can without closing a gap or merging its bars.
const FACE = '"M PLUS Rounded 1c"';

// Fetches the heavy rounded lettering, remembering which kanji have really arrived.
const lettering = new Set<string>();
export const loadLettering = (kanji: string) => Promise.all([document.fonts.load(`900 64px ${FACE}`, kanji), document.fonts.load(`700 64px ${FACE}`, kanji)]).then(() => {
  for (const k of kanji) lettering.add(k);
});

// The kanji as a heavy rounded letter, filling the sprite, then fattened by a few pixels.
function lettered(s: Species, size: number, grow: number, weight = 900, need = 5) {
  const big = size * 3;
  const scratch = canvas(big, big);
  const g = scratch.getContext('2d', { willReadFrequently: true })!;
  g.font = `${weight} ${big}px ${FACE}`;
  g.textAlign = 'center'; g.textBaseline = 'alphabetic';
  const m = g.measureText(s.k);
  const inkW = m.actualBoundingBoxLeft + m.actualBoundingBoxRight, inkH = m.actualBoundingBoxAscent + m.actualBoundingBoxDescent;
  const fit = Math.min((big * 0.94) / inkW, (big * 0.94) / inkH);
  g.translate(big / 2, big / 2);
  g.scale(fit, fit);
  g.fillText(s.k, (m.actualBoundingBoxLeft - m.actualBoundingBoxRight) / 2, (m.actualBoundingBoxAscent - m.actualBoundingBoxDescent) / 2);
  const data = g.getImageData(0, 0, big, big).data;
  let mask = new Uint8Array(size * size);
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    let on = 0;
    for (let j = 0; j < 3; j++) for (let i = 0; i < 3; i++) if (data[((y * 3 + j) * big + x * 3 + i) * 4 + 3] > 120) on++;
    mask[y * size + x] = on >= need ? 1 : 0;
  }
  for (let step = 0; step < grow; step++) {
    const next = new Uint8Array(mask);
    for (let y = 1; y < size - 1; y++) for (let x = 1; x < size - 1; x++) {
      const c = y * size + x;
      if (mask[c - 1] || mask[c + 1] || mask[c - size] || mask[c + size]) next[c] = 1;
    }
    mask = next;
  }
  return mask;
}

// The lettering already keeps its gaps open, so only the simplest kanji get any extra weight.
// The small runners on the title screen are a shade lighter, so busy kanji stay readable:
// simple ones keep the full weight, and busy ones use the bold face filled out by about half a pixel.
function chunky(s: Species, size: number, slim = false) {
  if (!lettering.has(s.k)) return inked(s, size, slim ? 6 : 9);
  return slim ? lettered(s, size, 0, s.strokes <= 8 ? 900 : 700, s.strokes <= 8 ? 5 : 3) : lettered(s, size, s.strokes <= 5 ? 1 : 0);
}

function body(s: Species, size: number, back = false, slim = false): Body {
  const key = `${s.k}${size}${back}${slim}${lettering.has(s.k)}`;
  const hit = bodies.get(key);
  if (hit) return hit;
  const k = size / 72, W = size + MARGIN * 2, seed = s.k.codePointAt(0)!;
  const { paint, gear, split } = styleOf(s);
  const ramp = PAINT[paint], line = OUTLINE_OF[paint];
  const mask = chunky(s, size, slim);
  const on = (x: number, y: number) => x >= 0 && y >= 0 && x < size && y < size && mask[y * size + x] === 1;

  // The face sits high on the kanji, like a head: the first place from the top with room for it.
  // The busiest kanji have nowhere to put one, and go without.
  const solid = (x0: number, y0: number, x1: number, y1: number) => {
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (!on(x, y)) return false;
    return true;
  };
  const u = (v: number) => Math.round(v * k);
  let top = size, bottom = 0, left = size, right = 0;
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) if (on(x, y)) { top = Math.min(top, y); bottom = Math.max(bottom, y); left = Math.min(left, x); right = Math.max(right, x); }
  const high = bottom - top + 1;
  // A hat or sprout on top of the kanji must not land on the face.
  const hat = ON_TOP.includes(gear) && gear !== 'umbrella' && GEAR[gear] ? (GEAR[gear][0].length * Math.max(1, Math.round(3 * k))) / 2 : 0;
  // Narrow strokes get a smaller face, down to a tiny one that fits a single slim stroke.
  let fx = -1, fy = -1, gap = 0, tiny = false;
  for (const [g, small] of [[6, false], [5, false], [4, false], [3, false], [3, true], [2, true]] as [number, boolean][]) {
    const w = u(g) + u(small ? 2 : 3), tall = u(small ? 4 : 6);
    let best = -1e9;
    for (let y = 0; y < size * 0.8; y++) for (let x = Math.floor(size * 0.1); x < size * 0.9; x++) {
      if (hat && y < top + u(7) && Math.abs(x - (left + right) / 2) < hat + w) continue;
      if (!solid(x - w, y - 1, x + w, y + tall)) continue;
      const score = -y * 1.1 - Math.abs(x - size / 2) * 0.45;
      if (score > best) { best = score; fx = x; fy = y; gap = u(g); tiny = small; }
    }
    if (gap) break;
  }


  const art = canvas(W, W);
  const g = art.getContext('2d')!;
  const dot = (c: string, x: number, y: number, w = 1, h = 1) => { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), w, h); };
  // A soft oval shadow on the ground, denser towards the middle.
  const sx = MARGIN + (left + right) / 2, sy = MARGIN + bottom + 4 * k, srx = Math.max(4, (right - left) * 0.46), sry = Math.max(1.5, 3.2 * k);
  for (let y = -Math.ceil(sry); y <= Math.ceil(sry); y++) for (let x = -Math.ceil(srx); x <= Math.ceil(srx); x++) {
    const d = (x / srx) ** 2 + (y / sry) ** 2;
    if (d <= 1 && (d < 0.55 || (x + y) % 2 === 0)) dot('rgba(30,30,70,.22)', sx + x, sy + y);
  }

  // A bold outline, then the body with a light band along the top of each stroke and a shaded band below it.
  const reach = Math.max(1, Math.round(2.4 * k));
  const lit = blend(line, ramp[0], 0.4);
  const fine = size >= 48, a = Math.max(1, Math.round(2 * k));
  for (let y = -reach; y < size + reach; y++) for (let x = -reach; x < size + reach; x++) {
    if (on(x, y)) continue;
    let near = false;
    for (let j = -reach; j <= reach && !near; j++) for (let i = -reach; i <= reach && !near; i++) if (i * i + j * j <= reach * reach + 1 && on(x + i, y + j)) near = true;
    // The outline is a touch lighter where the light falls, along the top of each stroke.
    if (near) dot(on(x, y + 1) || on(x, y + 2) ? lit : line, MARGIN + x, MARGIN + y);
  }
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    if (!on(x, y)) continue;
    const t = (y - top) / high;
    let shade = ramp;
    if (split === 'fire') shade = t < 0.34 ? PAINT.yellow : t < 0.68 ? PAINT.orange : PAINT.red;
    if (split === 'moss' && t < 0.42) shade = PAINT.green;
    if (split === 'snow' && t < 0.3) shade = PAINT.white;
    if (split === 'dusk' && t > 0.7) shade = PAINT.lilac;
    let c = !on(x, y + 2) || !on(x + 2, y + 1) ? shade[0] : !on(x, y - 2) || !on(x - 2, y) ? shade[3] : !on(x, y - 4) ? shade[2] : shade[1];
    if (fine) {
      // The underside falls into deeper shade, and a small glint sits in the top left of every stroke.
      if (!on(x, y + 1)) c = blend(shade[0], line, 0.3);
      else if (on(x, y - a) && !on(x, y - a * 2) && on(x - a, y) && !on(x - a * 2 - 1, y) && on(x + 2, y + 1) && on(x, y + 2)) c = blend(shade[3], '#ffffff', 0.75);
    }
    dot(c, MARGIN + x, MARGIN + y);
  }

  // The accessory.
  const cell = Math.max(1, Math.round(3 * k));
  if (gear === 'rays') {
    const ray = '#ffc83a', [cx, cy] = [MARGIN + right, MARGIN + top + 2 * k];
    const rays = [[6, -11, 3, 8], [13, -5, 8, 3], [12, 5, 6, 3]], rim = Math.max(1, Math.round(k));
    for (const [dx, dy, w, h] of rays) dot(INKS.o, cx + dx * k - rim, cy + dy * k - rim, Math.round(w * k) + rim * 2, Math.round(h * k) + rim * 2);
    for (const [dx, dy, w, h] of rays) { dot(ray, cx + dx * k, cy + dy * k, Math.round(w * k), Math.round(h * k)); dot('#fff0a0', cx + dx * k, cy + dy * k, Math.round(w * k), 1); }
  } else if (GEAR[gear]) {
    // At full size each grid square is three pixels, which is where the rounding applies.
    const smooth = cell === 3, rows = smooth ? rounded(GEAR[gear]) : GEAR[gear], step = smooth ? 1 : cell;
    const gw = rows[0].length * step, gh = rows.length * step;
    const above = ON_TOP.includes(gear);
    // Beside the kanji, but never so far out that the edge of the battle screen cuts it off.
    const gx = gear === 'umbrella' ? MARGIN + right - gw + 7 * k : above ? MARGIN + (left + right) / 2 - gw / 2 : Math.min(MARGIN + right + (gear.startsWith('die') ? 8 : 3) * k - gw / 2, MARGIN + size + 12 * k - gw);
    const gy = gear === 'umbrella' ? MARGIN + top - 7 * cell : above ? MARGIN + top - gh + 4 * k : LOW.includes(gear) ? MARGIN + bottom - gh + 3 * k : MARGIN + top - gh / 2 + 4 * k;
    const edge = Math.max(1, Math.round(1.6 * k));
    if (LOOSE.includes(gear)) rows.forEach((row, y) => [...row].forEach((ch, x) => { if (INKS[ch]) dot(INKS.o, gx + x * step - edge, gy + y * step - edge, step + edge * 2, step + edge * 2); }));
    rows.forEach((row, y) => [...row].forEach((ch, x) => { if (INKS[ch]) dot(INKS[ch], gx + x * step, gy + y * step, step, step); }));
  }

  const made = { art, fx: MARGIN + fx, fy: MARGIN + fy, gap, tiny, pale: paint === 'dark', size, seed };
  bodies.set(key, made);
  return made;
}

// A tiny face that fits inside a single stroke: dot eyes, a small smile between them, and a hint of blush.
function face(o: CanvasRenderingContext2D, b: Body, blink = false) {
  if (!b.gap) return;
  const k = b.size / 72, n = (v: number) => Math.max(1, Math.round(v * k));
  const r = (c: string, x: number, y: number, w = 1, h = 1) => { o.fillStyle = c; o.fillRect(Math.round(x), Math.round(y), w, h); };
  const { fx, fy, seed, gap, tiny, pale } = b;
  const INK = pale ? '#fdf8ef' : '#241c2e';
  const ew = n(tiny ? 2 : 3), eh = n(tiny ? 3 : 4), my = fy + n(tiny ? 2 : 2), mouth = seed % 6;
  for (const x of [fx - gap - ew + 1, fx + gap]) {
    // Shut eyes are a single line; open ones catch a speck of light.
    if (blink) r(INK, x, fy + eh - n(2), ew, n(1));
    else {
      r(INK, x, fy, ew, eh);
      if (ew >= 3 && !pale) r('#ffffff', x, fy, 1, 1);
    }
    if (!tiny && gap >= n(4)) {
      o.globalAlpha = 0.5;
      r('#ff7f9e', x + (x < fx ? -n(3) : n(3)), fy + n(3), n(3), n(2));
      o.globalAlpha = 1;
    }
  }
  if (tiny) r(INK, fx - n(1), my + n(1), n(2) + 1, n(1.4));
  else if (mouth === 4) r(INK, fx - n(1.5), my, n(3), n(3));
  else if (mouth === 5) r(INK, fx - n(2), my + n(1), n(4), n(1.4));
  else { r(INK, fx - n(3), my, n(1.4), n(2)); r(INK, fx - n(2), my + n(1.6), n(4), n(1.4)); r(INK, fx + n(2), my, n(1.4), n(2)); }
}

const sprites = new Map<string, HTMLCanvasElement>();

// Your own kanji is seen from behind in battle, so its back view has no face.
export function kanjiSprite(s: Species, size = 72, back = false, blink = false, slim = false) {
  const key = `${s.k}${size}${back}${blink}${slim}${lettering.has(s.k)}`;
  const hit = sprites.get(key);
  if (hit) return hit;
  const b = body(s, size, back, slim);
  const c = canvas(b.art.width, b.art.height);
  const o = c.getContext('2d')!;
  o.drawImage(b.art, 0, 0);
  if (!back) face(o, b, blink);
  sprites.set(key, c);
  return c;
}

// ---- People. Front and back views are half drawings, mirrored so they stay symmetrical.
type Look = Record<string, string>;
const SKIN = { s: '#f5cda0', S: '#d99e74', e: OUTLINE, o: OUTLINE };
export const LOOKS: Record<string, Look> = {
  hero: { ...SKIN, h: '#f0a890', k: '#2a2530', K: '#4c4658', r: '#e0483e', R: '#a82c38', c: '#3a58a0', C: '#243a74', w: '#fdf3dc', y: '#ffc857', B: '#8a5a34', p: '#ece0c4', P: '#c4b490', b: '#7a4a24' },
  heroine: { ...SKIN, h: '#f0a890', k: '#3a2c4c', K: '#6a5484', r: '#e0483e', R: '#a82c38', c: '#2f9e8e', C: '#1f6f68', w: '#fdf3dc', y: '#ffc857', B: '#8a5a34', p: '#ece0c4', P: '#c4b490', b: '#7a4a24' },
  // More townspeople: a ginger-haired girl, a craftsman in a white headcloth, a sailor in a white cap and an auntie with her hair up.
  girl: { ...SKIN, h: '#d9783c', j: '#f0a05c', H: '#a8542c', k: '#d9783c', c: '#ffd23f', C: '#d9a020', w: '#fdf3dc', p: '#ffd23f', P: '#d9a020', b: '#e0483e' },
  artisan: { ...SKIN, h: '#f6f1e2', j: '#ffffff', H: '#c9c2d0', k: '#3a2c30', c: '#34508c', C: '#22366a', w: '#f6f1e2', y: '#f6f1e2', p: '#5a5048', P: '#40382f', b: '#3a3048' },
  sailor: { ...SKIN, h: '#f6f8fb', j: '#ffffff', H: '#2a3c78', k: '#4a3428', c: '#f6f8fb', C: '#c8d4e4', w: '#2a3c78', y: '#ffd23f', p: '#2a3c78', P: '#1c2a58', b: '#17151c' },
  auntie: { ...SKIN, h: '#3a2c30', j: '#5c4a50', H: '#241c20', k: '#3a2c30', c: '#5a9a5c', C: '#3c7444', w: '#f6e9c8', p: '#5a9a5c', P: '#3c7444', b: '#7a4a24' },
  woman: { ...SKIN, h: '#6a3a2c', j: '#8a5240', H: '#4a2820', k: '#6a3a2c', c: '#e0a03c', C: '#b87820', w: '#fdf3dc', p: '#e0a03c', P: '#b87820', b: '#7a4a24' },
  oldman: { ...SKIN, h: '#f5cda0', j: '#ffe0bc', H: '#d99e74', k: '#c8c8d0', c: '#6a7a5c', C: '#4e5c44', w: '#d9d2c0', p: '#5a5048', P: '#40382f', b: '#3a3048' },
  oldwoman: { ...SKIN, h: '#c8c8d0', j: '#e6e6ec', H: '#a0a0ac', k: '#c8c8d0', c: '#8a5a8c', C: '#6a3f6c', w: '#e6d8c0', p: '#8a5a8c', P: '#6a3f6c', b: '#3a3048' },
  police: { ...SKIN, h: '#26366a', j: '#3a4e8c', H: '#182448', k: '#33283f', c: '#2f4f9e', C: '#1e3470', w: '#a8c4f0', y: '#ffd23f', p: '#1e2a58', P: '#141c40', b: '#17151c' },
  nurse: { ...SKIN, h: '#6a3a2c', j: '#8a5240', H: '#4a2820', k: '#6a3a2c', c: '#fdfdff', C: '#c8d4e4', w: '#7fc8e8', m: '#fdfdff', r: '#e0483e', p: '#fdfdff', P: '#c8d4e4', b: '#fdfdff' },
  worker: { ...SKIN, h: '#2f6fd0', j: '#5a94e8', H: '#1f4f9e', k: '#33283f', c: '#2f6fd0', C: '#1f4f9e', w: '#ffd23f', y: '#ffd23f', p: '#39405e', P: '#262b45', b: '#17151c' },
  child: { ...SKIN, h: '#e8c36a', j: '#f8e6a0', H: '#b58838', k: '#4a3030', c: '#d9668a', C: '#a8446c', w: '#f6f1e2', p: '#c9a26b', P: '#94703f', b: '#5b3b2c' },
  rival: { ...SKIN, h: '#1f7f86', j: '#3cb8a8', H: '#14505a', k: '#1f7f86', c: '#2b2f4e', C: '#1b1e38', w: '#3cb8a8', p: '#2b2f4e', P: '#1b1e38', b: '#f6f1e2' },
  miko: { ...SKIN, h: '#2f2433', j: '#4d3f55', H: '#1e1824', k: '#2f2433', c: '#f6f1e2', C: '#c9c2d0', w: '#d6332a', p: '#d6332a', P: '#9c1f28', b: '#f6f1e2' },
  farmer: { ...SKIN, h: '#d9b860', j: '#f4e08f', H: '#a07c34', k: '#6b6b6b', c: '#4f8a4a', C: '#2f5f3a', w: '#d9c58f', p: '#5a6480', P: '#3e4560', b: '#5b3b2c' },
  pilgrim: { ...SKIN, h: '#ece6d4', j: '#ffffff', H: '#b9b2a4', k: '#8a8a9a', c: '#ece6d4', C: '#b9b2a4', w: '#6a6a7a', p: '#ece6d4', P: '#b9b2a4', b: '#7a5230' },
  teacher: { ...SKIN, f: '#b98a52', k: '#4a3428', K: '#7a5a48', c: '#3f8f6a', C: '#2a6a4e', m: '#fdfdff', w: '#e8f4ff', p: '#2f3a5e', P: '#1f2844', b: '#3a2a30' },
  ailsey: { ...SKIN, k: '#1e1a24', K: '#4a4258', c: '#8f5ad0', C: '#6238a0', b: '#fdfdff' },
  lukas: { ...SKIN, k: '#2a2230', K: '#544860', c: '#fbfaf4', C: '#c6ccdc', p: '#7a5230', P: '#5a3a22', b: '#3a3048' },
  mom: { ...SKIN, h: '#5a3a30', j: '#7a5244', H: '#3f2822', k: '#5a3a30', c: '#d9668a', C: '#a8446c', w: '#f6e9c8', p: '#d9668a', P: '#a8446c', b: '#f6f1e2' },
  master: { ...SKIN, h: '#6b8a3a', j: '#a4c45a', H: '#46602a', k: '#e6e0d0', c: '#7a5230', C: '#54382a', w: '#ffd23f', p: '#54382a', P: '#3a2a24', b: '#2b2036' },
  guardian: { ...SKIN, s: '#c9b0d8', S: '#9478b0', h: '#3b2470', j: '#6a3bb0', H: '#241650', k: '#e0dcf0', c: '#3b2470', C: '#241650', w: '#ffd23f', p: '#6a3bb0', P: '#3b2470', b: '#241650' },
};

const HAT = ['.....ooo', '...oojjj', '..ojjjhh', '.ojjhhhh', '.ohhhhhh', 'oHHHHHHH', '.ooooooo'];
// Heads for the townspeople who don't wear a straw hat.
const LONG_HAIR = ['........', '.....ooo', '...oohhh', '..ohjjhh', '..ohhhhh', '.ohhhhhh', '.ohhhhhh'];
const HEADS: Record<string, string[]> = {
  miko: LONG_HAIR, mom: LONG_HAIR, rival: LONG_HAIR, woman: LONG_HAIR,
  oldman: ['........', '.....ooo', '...oohhh', '..ohjhhh', '..ohhhhh', '.okhhhhh', '.okhhhhh'],
  oldwoman: ['.....ooo', '....ohhh', '...oojjh', '..ohjhhh', '..ohhhhh', '.ohhhhhh', '.ohhhhhh'],
  police: ['.....ooo', '...oohhh', '..ohhhyy', '.ohhhhyy', '.oHHHHHH', 'oHHHHHHH', '.ooooooo'],
  nurse: ['.....ooo', '...oommm', '..ommmmr', '..ommmrr', '..ohhhhh', '.ohhhhhh', '.ohhhhhh'],
  worker: ['.....ooo', '...oohhh', '..ohjjhh', '.ohhhhhy', '.oHHHHHH', 'oHHHHHHH', '.ooooooo'],
};
const FRONT = ['..okkkss', '..oksess', '..oksess', '...osssS', '..ocwccc', '.oCcwccc', '.osCwccc', '.oSoCwCC', '..ooppPp'];
const BACK = ['..okkkkk', '..okkkkk', '..okkkkk', '...okkkk', '..ocCwcc', '.oCcCwcc', '.osCcCcc', '.oSoCcCC', '..ooppPp'];
const SIDE = [
  '.....oooooo.....', '...oojjjjhhoo...', '..ojjjhhhhhhho..', '.ojjhhhhhhhhHHo.', '.ohhhhhhhhhhHHo.', 'oHHHHHHHHHHHHHHo', '.oooooooooooooo.',
  '...osssskkkko...', '...osessskkko...', '...osesskkkko...', '...oSsssskko....', '....ocwcccco....', '....ocwcCcco....', '....ocwsSCco....', '....ocwoSCco....', '....oppppPo.....',
];
// Side views match each head above; everyone else keeps the straw hat in SIDE.
const LONG_SIDE = [
  '.....ooooo......', '...oohhhhhoo....', '..ohjjhhhhhho...', '..ohjhhhhhhhho..', '..ohhhhhhhhhho..', '..ohhhhhhhhhho..', '..osshhhhhhhho..',
  '..osesshhhhhho..', '..osesshhhhhho..', '..osssssshhhho..', '...oSSsssshhho..', '...ocwcccchhho..', '...ocwcCccchho..', '...ocwsSCcchho..', '...ocwoSCcoo....', '....oppppPo.....',
];
HEADS.girl = LONG_HAIR; HEADS.artisan = HEADS.worker; HEADS.sailor = HEADS.police; HEADS.auntie = HEADS.oldwoman;
const sideHead = (rows: string[]) => [...rows, ...SIDE.slice(7)];
const SIDES: Record<string, string[]> = {
  miko: LONG_SIDE, mom: LONG_SIDE, rival: LONG_SIDE, woman: LONG_SIDE,
  oldman: sideHead(['................', '.....ooooo......', '...oohhhhhoo....', '..ohjjhhhhhho...', '..ohhhhhhhhho...', '..ohhhhhhkkkko..', '..ohhhhhkkkkko..']),
  oldwoman: sideHead(['.........ooo....', '.....oooohhho...', '...oojjhhooo....', '..ohjhhhhhhoo...', '..ohhhhhhhhho...', '..ohhhhhhhhho...', '..osshhhhhhho...']),
  police: sideHead(['.....oooooo.....', '...oohhhhhhoo...', '..ohhhyyhhhhho..', '..ohhhyyhhhhho..', '..oHHHHHHHHHHo..', 'oHHHHHHHHHHHHo..', '.ooooooooooooo..']),
  nurse: sideHead(['.....oooooo.....', '...oommmmmmoo...', '..ommrrmmmmmmo..', '..ommrrmmmmmmo..', '..ohhhhhhhhhho..', '..ohhhhhhhhhho..', '..osshhhhhhhho..']),
  worker: sideHead(['.....oooooo.....', '...oohhhhhhoo...', '..ohjjhhhhhhho..', '..ohhhhyhhhhho..', '..oHHHHHHHHHHo..', 'oHHHHHHHHHHHHo..', '.ooooooooooooo..']),
};
SIDES.girl = LONG_SIDE; SIDES.artisan = SIDES.worker; SIDES.sailor = SIDES.police; SIDES.auntie = SIDES.oldwoman;
// Haru: tousled black hair with a tuft on top, a red scarf, an indigo jacket tied with a yellow sash,
// and the handle of a writing brush showing at the back.
const HERO = {
  front: ['......oo', '....ookk', '..ookkKk', '.okkKKkk', '.okkkkkk', '.okkkkkk', '.okksksk', '.okssess', '..ossess', '..oshsss', '..orrrrr', '.orRrrRr', '.oCcwccc', '.oscwccc', '.oSoyyyy', '..ooppPp'],
  back: ['......oo', '....ookk', '..ookkKk', '.okkKKkk', '.okkkkkk', '.okkkkkk', '.okkkkkk', '.okkkkkk', '..okkkkk', '..okkkkk', '..orrrrr', '.orRrrrr', '.oCccccB', '.osCcccB', '.oSoyyyy', '..ooppPp'],
  side: [
    '.......oo.......', '....oookkkoo....', '...okkKkkkkkoo..', '..okkKKkkkkkkko.', '..okkkkkkkkkkko.', '..okkkkkkkkkkko.', '..osskskkkkkkko.',
    '..osesskkkkkkko.', '..osesskkkkkkko.', '..oshsssskkkko..', '..orrrrrrrroo...', '...orRrrrrrrroo.', '...occwccccBorro', '..osccwccCcBo.o.', '...ooyyyyyyyo...', '....oppppppPo...',
  ],
};
// Haru as a girl: dark hair in two buns tied with red and a fringe swept to one side, with the same scarf and a teal jacket.
// Her front view is drawn in full, since the fringe isn't symmetrical.
const HEROINE = {
  front: [
    '..oo........oo..', '.okko.oooo.okko.', '.okKookkkkooKko.', '..orokKkkKkoro..', '..okkKkkkkKkko..', '.okkkkkkkkkkkko.', '.okkkkkkkksskko.',
    '.okkkesssseskko.', '.okksesssseskko.', '.okoshsssshsoko.', '.okorrrrrrrroko.', '.oorRrrRRrrRroo.', '.oCcwccccccwcCo.', '.oscwccccccwcso.', '.oSoyyyyyyyyoSo.', '..ooppPppPppoo..',
  ],
  back: ['..oo....', '.okko.oo', '.okKookk', '..orokKk', '..okkKkk', '.okkkkkk', '.okkkkkk', '.okkkkkk', '.okkkkkk', '.okokkkk', '.okorrrr', '.oorRrrr', '.oCccccB', '.osCcccB', '.oSoyyyy', '..ooppPp'],
  side: [
    '..........oo....', '....ooooookkoo..', '...okkKkkkokKko.', '..okkKKkkkkrrko.', '..okkkkkkkkkkko.', '..okkkkkkkkkkko.', '..okkskkkkkkkko.',
    '..okesskkkkkkko.', '..osesskkkkkkko.', '..oshssskkkkko..', '..orrrrrrrkkoo..', '...orRrrrrrrroo.', '...occwccccBorro', '..osccwccCcBo.o.', '...ooyyyyyyyo...', '....oppppppPo...',
  ],
};
// Lukas, on the ?lukas page: short round hair with a slightly spiky fringe, a white shirt and brown trousers.
const LUKAS = {
  front: ['.....ooo', '...ookkk', '..okKkkk', '.okKkkkk', '.okkkkkk', '.okkkkkk', '.okkkskk', '.oksssss', '..oksess', '..oksess', '...osssk', '..occccc', '.oCccccc', '.osCcccc', '.oSoCCCC', '..ooppPp'],
  back: ['.....ooo', '...ookkk', '..okKkkk', '.okKkkkk', '.okkkkkk', '.okkkkkk', '.okkkkkk', '.okkkkkk', '.okkkkkk', '..okkkkk', '...okkkk', '..occccc', '.oCcCccc', '.osCcCcc', '.oSoCCCC', '..ooppPp'],
  side: [
    '.....oooooo.....', '...ookkkkkkoo...', '..okKkkkkkkkko..', '..okKkkkkkkkkko.', '..okkkkkkkkkkko.', '..okkkkkkkkkkko.', '..okskkkkkkkko..',
    '..osssskkkkkko..', '..osesskkkkkko..', '..osesskkkkko...', '...oSSsssskko...', '...occcccCco....', '..oscccCcccCo...', '..oSscCccCCo....', '...oCCCCCCCo....', '....oppppppPo...',
  ],
};
// Ailsey, on the ?ailsey page: long black hair with a bang swept to the right, and a purple dress.
// Her front view is drawn in full, since the bang isn't symmetrical.
const AILSEY = {
  front: [
    '.....oooooo.....', '...ookkkkkkoo...', '..okKkkkkkkkko..', '.okKkkkkkkkkkko.', '.okkkkkkkkkkkko.', '.okksssskkkkkko.', '.okksssssskkkko.',
    '.okksesssseskko.', '.okksesssseskko.', '.okksssssssskko.', '.okkossssssokko.', '.okkcccccccckko.', '.oCccccccccccCo.', '.osCccccccccCso.', '.oSoCCCCCCCCoSo.', '..occcccccccco..',
  ],
  back: ['.....ooo', '...ookkk', '..okKkkk', '.okKkkkk', '.okkkkkk', '.okkkkkk', '.okkkkkk', '.okkkkkk', '.okkkkkk', '.okkkkkk', '.okkkkkk', '.okkkkkk', '.oCkkkkk', '.osCkkkk', '.oSoCCCC', '..occccc'],
  side: [
    '.....ooooo......', '...ookkkkkoo....', '..okKkkkkkkko...', '..okKkkkkkkkko..', '..okkkkkkkkkko..', '..okkkkkkkkkko..', '..osskkkkkkkko..',
    '..osesskkkkkko..', '..osesskkkkkko..', '..osssssskkkko..', '...oSSsssskkko..', '...occcccckkko..', '..oscccCcckkko..', '..oSscCccCCkko..', '...oCCCCCCCo....', '...occcccccco...',
  ],
  // The dress falls two rows further than the usual legs, over white shoes.
  legs: {
    front: [
      ['..occcccccccco..', '..oCCCCCCCCCCo..', '...obbboobbbo...', '....ooo..ooo....'],
      ['..occcccccccco..', '..oCCCCCCCCCCo..', '....ooo.obbbo...', '.........ooo....'],
      ['..occcccccccco..', '..oCCCCCCCCCCo..', '...obbbo.ooo....', '....ooo.........'],
    ],
    side: [
      ['...occcccccco...', '...oCCCCCCCCo...', '....obbbobbbo...', '.....ooo.ooo....'],
      ['...occcccccco...', '...oCCCCCCCCo...', '..obbbo...obbbo.', '...ooo.....ooo..'],
      ['...occcccccco...', '...oCCCCCCCCo...', '....obbbobbbo...', '.....ooo.ooo....'],
    ],
  },
};
// The Kawabe teacher: hair in a bun, round glasses, a green cardigan over a white blouse.
const TEACHER = {
  front: ['......oo', '.....okk', '...ookkk', '..okKkkk', '.okKkkkk', '.okkkkkk', '.okkssss', '.okffffS', '.okfweff', '.okffffS', '..ossssS', '..oCcccm', '.oCccccm', '.osCcccm', '.oSoCCcm', '..oppppp'],
  back: ['......oo', '.....okk', '...ookkk', '..okKkkk', '.okKkkkk', '.okkkkkk', '.okkkkkk', '.okkkkkk', '.okkkkkk', '.okkkkkk', '..okkkkk', '..oCcccc', '.oCccccc', '.osCcccc', '.oSoCCCC', '..oppppp'],
  side: [
    '.....oooo.......', '...ookkkkoo.oo..', '..okKkkkkkkokko.', '..okKkkkkkkkkko.', '..okkkkkkkkkoo..', '..okkkkkkkkko...', '..osskkkkkkko...',
    '.ffffsskkkkko...', '.fwefsskkkkko...', '.ffffskkkkko....', '...oSSsssko.....', '...omcccCCo.....', '...omcccCcCo....', '..osmcCccCCo....', '...oCCCCCCo.....', '....oppppPo.....',
  ],
};
const LEADS: Record<string, { front: string[]; back: string[]; side: string[]; legs?: { front: string[][]; side: string[][] } }> = { hero: HERO, heroine: HEROINE, lukas: LUKAS, ailsey: AILSEY, teacher: TEACHER };
const mirror = (rows: string[]) => rows.map((r) => r + [...r].reverse().join(''));
const LEGS = {
  front: [
    ['...oppPoopPpo...', '...oppPoopPpo...', '...obbboobbbo...', '....ooo..ooo....'],
    ['...oppPoopPpo...', '...obbboopPpo...', '....ooo.obbbo...', '.........ooo....'],
    ['...oppPoopPpo...', '...oppPoobbbo...', '...obbbo.ooo....', '....ooo.........'],
  ],
  side: [
    ['....oppPoppPo...', '....oppPoppPo...', '....obbbobbbo...', '.....ooo.ooo....'],
    ['...oppPo.oppPo..', '..oppPo...oppo..', '..obbbo...obbbo.', '...ooo.....ooo..'],
    ['....oppPoppPo...', '....oppPoppPo...', '....obbbobbbo...', '.....ooo.ooo....'],
  ],
};

const people = new Map<string, HTMLCanvasElement>();

// Outlines take on the colour they enclose, so hair is edged in dark brown and a white coat in grey-blue,
// and only the feet and the underside keep the full dark line.
function raster(rows: string[], look: Look, flip: boolean, blink = false) {
  const c = canvas(16, rows.length);
  const g = c.getContext('2d')!;
  const fill = (x: number, y: number) => { const ch = rows[y]?.[x]; return ch && ch !== '.' && ch !== 'o' && ch !== 'e' && look[ch]?.startsWith('#') ? look[ch] : null; };
  rows.forEach((row, y) => [...row].forEach((ch, x) => {
    if (ch === '.') return;
    let colour = look[ch] ?? ch;
    if (ch === 'o') {
      const inner = fill(x, y + 1) ?? fill(x + 1, y) ?? fill(x - 1, y);
      if (inner) colour = blend(inner, OUTLINE, 0.62);
    }
    // Shut eyes: the upper pixel of each eye turns to skin.
    if (blink && ch === 'e' && rows[y + 1]?.[x] === 'e') colour = look.s;
    g.fillStyle = colour;
    g.fillRect(flip ? 15 - x : x, y, 1, 1);
  }));
  return c;
}

// A head on a pillow, eyes shut. The body is under the covers.
export function asleep(ctx: CanvasRenderingContext2D, look: string, x: number, y: number) {
  ctx.save();
  ctx.beginPath(); ctx.rect(x - 8, y - 6, 32, 13); ctx.clip();
  person(ctx, look, x, y, 'down', 0);
  ctx.restore();
  const eyes = y - 4 + LEADS[look].front.findIndex((row) => row.includes('e'));
  ctx.fillStyle = LOOKS[look].s;
  ctx.fillRect(x + 5, eyes, 1, 1); ctx.fillRect(x + 10, eyes, 1, 1);
  ctx.fillStyle = LOOKS[look].e;
  ctx.fillRect(x + 4, eyes + 1, 2, 1); ctx.fillRect(x + 10, eyes + 1, 2, 1);
}

export function person(ctx: CanvasRenderingContext2D, look: string, x: number, y: number, dir: string, step: number, blink = false) {
  const key = `${look}${dir}${step}${blink}`;
  let c = people.get(key);
  if (!c) {
    const hat = HEADS[look] ?? HAT;
    const lead = LEADS[look];
    const front = lead ? lead.front : [...hat, ...FRONT], rear = lead ? lead.back : [...hat, ...BACK], side = lead ? lead.side : SIDES[look] ?? SIDE;
    const whole = (half: string[]) => (half[0].length < 16 ? mirror(half) : half);
    const legs = lead?.legs ?? LEGS;
    const rows = dir === 'down' ? [...whole(front), ...legs.front[step]]
      : dir === 'up' ? [...whole(rear), ...legs.front[step]]
      : [...side, ...legs.side[step]];
    c = raster(rows, LOOKS[look], dir === 'right', blink);
    people.set(key, c);
  }
  shadow(ctx, x, y);
  ctx.drawImage(c, x, y - 4 - (step ? 1 : 0));
}

const BEAR = [
  '..ooo...', '.obbbooo', '.obBbbbb', '..obbbbb', '.obbbbbb', '.obbbbbb', '.obebbll', '.obebbln', '.oBbblll', '..oBBbbb', '...ooooo',
  '..occccw', '.obcccCw', '.obbcccw', '.oboCccw', '..ooCcCC', '...obbbb', '...obBbo', '...obbbo', '....ooo.',
];
const BEARLOOK = { o: OUTLINE, b: '#ac7c5c', B: '#7f5540', l: '#e6c4a0', n: OUTLINE, e: OUTLINE, c: '#ec7444', C: '#b84a3a', w: '#ffd9a0' };
let bearSprite: HTMLCanvasElement | null = null;

// Kanji Bear, the guide, keeps the mascot's brown fur, orange top and big brush.
export function bear(ctx: CanvasRenderingContext2D, x: number, y: number) {
  bearSprite ??= raster(mirror(BEAR), BEARLOOK, false);
  shadow(ctx, x, y);
  ctx.drawImage(bearSprite, x, y - 4);
  ctx.fillStyle = OUTLINE; ctx.fillRect(x + 14, y - 3, 4, 14);
  ctx.fillStyle = '#7f5540'; ctx.fillRect(x + 15, y - 2, 2, 8);
  ctx.fillStyle = '#fcbc54'; ctx.fillRect(x + 15, y + 6, 2, 1);
  ctx.fillStyle = '#3a3048'; ctx.fillRect(x + 15, y + 7, 2, 3);
}

function shadow(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.fillStyle = 'rgba(30,30,70,.2)';
  ctx.fillRect(x + 4, y + 13, 8, 4);
  ctx.fillRect(x + 2, y + 14, 12, 2);
  ctx.fillStyle = 'rgba(30,30,70,.14)';
  ctx.fillRect(x + 4, y + 14, 8, 2);
}
