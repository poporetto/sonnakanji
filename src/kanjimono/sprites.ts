import type { Element, Species } from './battle';

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

// Colours and accessories follow meaning. Anything unlisted gets a colour of its own.
const STYLES: [string, string, string][] = [
  ['言語話読書聞文字音歌説答', 'lilac', 'speech'], ['問何', 'pink', 'question'], ['本', 'orange', 'book'],
  ['上起立', 'lilac', 'up'], ['下', 'sky', 'down'], ['右', 'green', 'right'], ['左', 'green', 'left'], ['前', 'orange', 'right'], ['後', 'red', 'left'],
  ['時分半午間', 'orange', 'clock'], ['年週曜今毎', 'pink', 'calendar'], ['開門外出入', 'sky', 'door'],
  ['見目', 'peach', 'lens'], ['耳手足体心口', 'peach', 'rays'], ['食肉飯', 'orange', 'fork'], ['飲茶', 'peach', 'cup'], ['買店品', 'peach', 'bag'], ['売', 'orange', 'horn'],
  ['円金銀百千万', 'yellow', 'coin'], ['人男女子父母友兄弟姉妹親族', 'pink', 'heart'], ['電', 'yellow', 'bolt'], ['天空雲風', 'sky', 'cloud'], ['雨海洋青', 'sky', 'drop'],
  ['学校教習試験勉', 'lilac', 'star'], ['家屋室館堂院駅社国町京', 'lilac', 'rays'], ['行来走歩動運発車', 'mint', 'speed'], ['白', 'white', 'rays'], ['黒', 'dark', 'rays'], ['赤', 'red', 'rays'],
];
const BRIGHT = ['pink', 'orange', 'yellow', 'green', 'sky', 'lilac', 'mint', 'peach', 'red'];

function styleOf(s: Species) {
  const seed = s.k.codePointAt(0)!;
  if (s.k === '火') return { paint: 'orange', gear: 'flame', split: 'fire' };
  if (s.k === '水') return { paint: 'sky', gear: 'drop', split: '' };
  if (s.k === '木') return { paint: 'peach', gear: 'sprout', split: 'moss' };
  if (s.k === '山') return { paint: 'green', gear: 'rays', split: 'snow' };
  if (s.k === '川') return { paint: 'sky', gear: 'drop', split: '' };
  if (s.k === '月') return { paint: 'yellow', gear: 'moon', split: 'dusk' };
  if (s.k === '日') return { paint: 'orange', gear: 'rays', split: '' };
  const hit = STYLES.find(([kanji]) => kanji.includes(s.k));
  if (hit) return { paint: hit[1], gear: hit[2], split: '' };
  const type = ({ fire: 'orange', water: 'sky', wood: 'green', earth: 'peach', metal: 'yellow' } as Record<string, string>)[s.type];
  return { paint: type ?? BRIGHT[seed % BRIGHT.length], gear: seed % 3 ? 'rays' : 'star', split: '' };
}

// Small pixel drawings placed beside a kanji. Letters pick a colour.
const INKS: Record<string, string> = { o: '#2b2036', w: '#ffffff', y: '#ffd23f', Y: '#e8a020', r: '#e0483e', p: '#ff8ab0', b: '#4aa6ee', c: '#bfeaff', g: '#74bf48', G: '#3f8a3a', n: '#a8673a', N: '#7a4a24', s: '#c3cdd8', S: '#7b859c', l: '#a884ea', m: '#fdf8ef' };
const GEAR: Record<string, string[]> = {
  speech: ['.ooooooo.', 'ommmmmmmo', 'omlmlmlmo', 'ommmmmmmo', '.ooooooo.', '..oo.....', '..o......'],
  question: ['.ooooooo.', 'ommrrrmmo', 'ommmmrmmo', 'ommmrmmmo', 'ommmmmmmo', 'ommmrmmmo', '.ooooooo.', '..oo.....'],
  book: ['ooooooooo', 'omrrormmo', 'omrrormmo', 'omrrormmo', 'omrrormmo', 'ooooooooo'],
  up: ['...oo...', '..obbo..', '.obbbbo.', 'oobbbboo', '..obbo..', '..obbo..', '..obbo..', '..oooo..'],
  down: ['..oooo..', '..obbo..', '..obbo..', '..obbo..', 'oobbbboo', '.obbbbo.', '..obbo..', '...oo...'],
  right: ['....oo...', '....obo..', 'oooooybo.', 'oyyyyyybo', 'oooooybo.', '....obo..', '....oo...'],
  left: ['...oo....', '..obo....', '.obyooooo', 'obyyyyyyo', '.obyooooo', '..obo....', '...oo....'],
  clock: ['..ooooo..', '.ommmmmo.', 'ommmommmo', 'ommmommmo', 'ommmoormo', 'ommmmmmmo', '.ommmmmo.', '..ooooo..'],
  calendar: ['.o.o.o.o.', 'ooooooooo', 'orrrrrrro', 'ooooooooo', 'omomomomo', 'ommmmmmmo', 'omomomomo', 'ooooooooo'],
  door: ['ooooooo', 'onnnnno', 'onNNNno', 'onnnnno', 'onnnyno', 'onNNNno', 'onnnnno', 'ooooooo'],
  lens: ['.oooo...', 'ocwcco..', 'occcco..', 'occcco..', '.oooooo.', '....oYYo', '.....oYo', '......oo'],
  fork: ['s.s.s...', 's.s.s..S', 's.s.s..S', 'sssss..S', '..s...SS', '..s...SS', '..s....S', '..s....S'],
  cup: ['..oooooo.', '.occccco.', '.obbbbboo', '.obbbbb.o', '.obbbbboo', '.obbbbbo.', '..ooooo..'],
  bag: ['...ooo...', '..o...o..', 'ooooooooo', 'orrrrrrro', 'orrrrrrro', 'orrrrrrro', 'ooooooooo'],
  horn: ['.......oo', '.....oorr', '.ooooyrrr', 'oyyyyyrrr', '.ooooyrrr', '...oo.oor', '...oo..oo'],
  coin: ['..oooo..', '.oyyyyo.', 'oyyYYyyo', 'oyyYYyyo', 'oyyYYyyo', '.oyyyyo.', '..oooo..'],
  heart: ['.oo..oo.', 'oppooppo', 'opppwppo', 'oppppppo', '.oppppo.', '..oppo..', '...oo...'],
  bolt: ['...ooo', '..oyyo', '.oyyo.', 'oyyyoo', '..oyyo', '.oyyo.', '.oyo..', '.oo...'],
  cloud: ['..ooo....', '.owwwoo..', 'oowwwwwo.', 'owwwwwwwo', 'owwcccwwo', '.ooooooo.'],
  drop: ['...oo...', '..obbo..', '.obbbbo.', 'obcbbbbo', 'obcbbbbo', '.obbbbo.', '..oooo..'],
  star: ['....o....', '...oyo...', '.ooyyyoo.', 'oyyyyyyyo', '.oyyyyyo.', '.oyyoyyo.', '.oo...oo.'],
  moon: ['..oooo...', '.oyyyo...', 'oyyyo....', 'oyyyo....', 'oyyyo...o', '.oyyyoooy', '..oyyyyyo', '...ooooo.'],
  sprout: ['.oo...oo.', 'oggo.oggo', 'oGggoggGo', '.oogGgoo.', '...oGo...', '...oGo...'],
  flame: ['...oo...', '..oyro..', '.oyyro.o', 'oyyrrooy', 'oyyyrryo', '.oyyyyo.', '..oooo..'],
};
// Accessories that sit on top of the kanji rather than beside it.
const ON_TOP = ['sprout', 'moon', 'flame'];

export const MARGIN = 26;
interface Body { art: HTMLCanvasElement; fx: number; fy: number; gap: number; size: number; seed: number }
const bodies = new Map<string, Body>();

// Measures a kanji's structure: the gaps it encloses, and how many separate bars of ink
// you cross scanning along every row and column. Open slots between strokes show up in that count too.
function shapeOf(mask: Uint8Array, size: number, roomy = true) {
  // Grown by a pixel first, so a slot that the outline would swallow counts as closed.
  // Busy kanji skip this: their gaps may narrow to thin dark lines, which keeps them bold.
  const grown = new Uint8Array(mask);
  if (roomy) for (let y = 1; y < size - 1; y++) for (let x = 1; x < size - 1; x++) {
    const c = y * size + x;
    if (mask[c - 1] || mask[c + 1] || mask[c - size] || mask[c + size]) grown[c] = 1;
  }
  let bars = 0;
  for (let i = 0; i < size; i++) for (let j = 1; j < size; j++) {
    if (grown[i * size + j] && !grown[i * size + j - 1]) bars++;
    if (grown[j * size + i] && !grown[(j - 1) * size + i]) bars++;
  }
  const seen = new Uint8Array(size * size);
  let gaps = 0;
  for (let start = 0; start < mask.length; start++) {
    if (seen[start] || mask[start]) continue;
    const stack = [start];
    let cells = 0, open = false;
    seen[start] = 1;
    while (stack.length) {
      const c = stack.pop()!;
      cells++;
      const x = c % size, y = (c - x) / size;
      if (x === 0 || y === 0 || x === size - 1 || y === size - 1) open = true;
      for (const n of [x > 0 ? c - 1 : -1, x < size - 1 ? c + 1 : -1, y > 0 ? c - size : -1, y < size - 1 ? c + size : -1]) {
        if (n >= 0 && !seen[n] && !mask[n]) { seen[n] = 1; stack.push(n); }
      }
    }
    if (!open && cells >= size * size * 0.004) gaps++;
  }
  return { bars, gaps };
}

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

// Fetches the heavy rounded lettering for these kanji.
export const loadLettering = (kanji: string) => document.fonts.load(`900 64px ${FACE}`, kanji);

// The kanji as a heavy rounded letter, filling the sprite, then fattened by a few pixels.
function lettered(s: Species, size: number, grow: number) {
  const big = size * 3;
  const scratch = canvas(big, big);
  const g = scratch.getContext('2d', { willReadFrequently: true })!;
  g.font = `900 ${big}px ${FACE}`;
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
    mask[y * size + x] = on >= 5 ? 1 : 0;
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

function chunky(s: Species, size: number) {
  if (!document.fonts.check(`900 64px ${FACE}`, s.k)) return inked(s, size, s.strokes > 8 ? 12 : 17);
  const target = shapeOf(lettered(s, size, 0), size, false);
  for (let grow = 2; grow > 0; grow--) {
    const mask = lettered(s, size, grow), shape = shapeOf(mask, size, false);
    if (shape.gaps === target.gaps && shape.bars >= target.bars * 0.93) return mask;
  }
  return lettered(s, size, 0);
}

function body(s: Species, size: number, back = false): Body {
  const key = `${s.k}${size}${back}${document.fonts.check(`900 64px ${FACE}`, s.k)}`;
  const hit = bodies.get(key);
  if (hit) return hit;
  const k = size / 72, W = size + MARGIN * 2, seed = s.k.codePointAt(0)!;
  const { paint, gear, split } = styleOf(s);
  const ramp = PAINT[paint], line = OUTLINE_OF[paint];
  const mask = chunky(s, size);
  const on = (x: number, y: number) => x >= 0 && y >= 0 && x < size && y < size && mask[y * size + x] === 1;

  // The face sits high on the kanji, like a head: the first place from the top with room for it.
  // The busiest kanji have nowhere to put one, and go without.
  const solid = (x0: number, y0: number, x1: number, y1: number) => {
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (!on(x, y)) return false;
    return true;
  };
  const u = (v: number) => Math.round(v * k);
  const spots: [number, number, number][] = [];
  for (const g of [8, 7, 6].map(u)) {
    let best = -1e9, spot: [number, number, number] | null = null;
    for (let y = 0; y < size * 0.72; y++) for (let x = Math.floor(size * 0.2); x < size * 0.8; x++) {
      const fits = solid(x - g - u(4), y, x - g + u(1), y + u(6)) && solid(x + g - u(1), y, x + g + u(4), y + u(6)) && solid(x - u(4), y + u(3), x + u(4), y + u(8));
      if (!fits) continue;
      const score = -y * 1.1 - Math.abs(x - size / 2) * 0.45;
      if (score > best) { best = score; spot = [x, y, g]; }
    }
    if (spot) { spots.push(spot); break; }
  }
  const [fx, fy, gap] = spots[0] ?? [-1, -1, 0];

  let top = size, bottom = 0, left = size, right = 0;
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) if (on(x, y)) { top = Math.min(top, y); bottom = Math.max(bottom, y); left = Math.min(left, x); right = Math.max(right, x); }
  const high = bottom - top + 1;

  const art = canvas(W, W);
  const g = art.getContext('2d')!;
  const dot = (c: string, x: number, y: number, w = 1, h = 1) => { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), w, h); };
  dot('rgba(30,30,70,.2)', MARGIN + left + 4, MARGIN + bottom + 5 * k, right - left - 7, 2);

  // A bold outline, then the body with a light band along the top of each stroke and a shaded band below it.
  const reach = Math.max(1, Math.round(2.4 * k));
  for (let y = -reach; y < size + reach; y++) for (let x = -reach; x < size + reach; x++) {
    if (on(x, y)) continue;
    let near = false;
    for (let j = -reach; j <= reach && !near; j++) for (let i = -reach; i <= reach && !near; i++) if (i * i + j * j <= reach * reach + 1 && on(x + i, y + j)) near = true;
    if (near) dot(line, MARGIN + x, MARGIN + y);
  }
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    if (!on(x, y)) continue;
    const t = (y - top) / high;
    let shade = ramp;
    if (split === 'fire') shade = t < 0.34 ? PAINT.yellow : t < 0.68 ? PAINT.orange : PAINT.red;
    if (split === 'moss' && t < 0.42) shade = PAINT.green;
    if (split === 'snow' && t < 0.3) shade = PAINT.white;
    if (split === 'dusk' && t > 0.7) shade = PAINT.lilac;
    const c = !on(x, y + 2) || !on(x + 2, y + 1) ? shade[0] : !on(x, y - 2) || !on(x - 2, y) ? shade[3] : !on(x, y - 4) ? shade[2] : shade[1];
    dot(c, MARGIN + x, MARGIN + y);
  }

  // The accessory.
  const cell = Math.max(1, Math.round(2.2 * k));
  if (gear === 'rays') {
    const ray = '#ffc83a', [cx, cy] = [MARGIN + right, MARGIN + top + 2 * k];
    for (const [dx, dy, w, h] of [[6, -11, 4, 9], [13, -5, 9, 4], [12, 5, 8, 4]]) dot(ray, cx + dx * k, cy + dy * k, Math.round(w * k), Math.round(h * k));
  } else if (GEAR[gear]) {
    const rows = GEAR[gear], gw = rows[0].length * cell, gh = rows.length * cell;
    const above = ON_TOP.includes(gear);
    const gx = above ? MARGIN + (left + right) / 2 - gw / 2 : MARGIN + right + 3 * k - gw / 2;
    const gy = above ? MARGIN + top - gh + 4 * k : ['clock', 'calendar', 'lens', 'fork', 'cup', 'bag', 'coin', 'door', 'book', 'right', 'left', 'down'].includes(gear) ? MARGIN + bottom - gh + 3 * k : MARGIN + top - gh / 2 + 4 * k;
    rows.forEach((row, y) => [...row].forEach((ch, x) => { if (INKS[ch]) dot(INKS[ch], gx + x * cell, gy + y * cell, cell, cell); }));
  }

  const made = { art, fx: MARGIN + fx, fy: MARGIN + fy, gap, size, seed };
  bodies.set(key, made);
  return made;
}

// A compact face: small oval eyes close together, a tiny smile tucked between them, and pale blush outside.
function face(o: CanvasRenderingContext2D, b: Body) {
  if (!b.gap) return;
  const k = b.size / 72, n = (v: number) => Math.max(1, Math.round(v * k));
  const r = (c: string, x: number, y: number, w = 1, h = 1) => { o.fillStyle = c; o.fillRect(Math.round(x), Math.round(y), w, h); };
  const { fx, fy, seed, gap } = b;
  const INK = '#241c2e';
  const ew = n(4), eh = n(6), my = fy + n(3), mouth = seed % 6;
  for (const x of [fx - gap - ew + 1, fx + gap]) {
    r(INK, x + (ew > 2 ? 1 : 0), fy, Math.max(1, ew - (ew > 2 ? 2 : 0)), eh);
    r(INK, x, fy + 1, ew, Math.max(1, eh - 2));
    r('#ffffff', x + (ew > 2 ? 1 : 0), fy + 1, n(1.5), n(1.5));
    o.globalAlpha = 0.55;
    r('#ff7f9e', x + (x < fx ? -n(5) : n(4)), fy + n(5), n(5), n(2.4));
    o.globalAlpha = 1;
  }
  if (mouth === 4) { r(INK, fx - n(3), my + n(1), n(6), n(4)); r('#d83a4a', fx - n(2), my + n(1.4), n(4), n(2.4)); }
  else if (mouth === 5) r(INK, fx - n(3), my + n(2), n(6), n(1.6));
  else { r(INK, fx - n(4), my + n(1), n(1.8), n(2)); r(INK, fx - n(3), my + n(2.6), n(6), n(1.8)); r(INK, fx + n(2.4), my + n(1), n(1.8), n(2)); }
}

const sprites = new Map<string, HTMLCanvasElement>();

// Your own kanji is seen from behind in battle, so its back view has no face.
export function kanjiSprite(s: Species, size = 72, back = false) {
  const key = `${s.k}${size}${back}${document.fonts.check(`900 64px ${FACE}`, s.k)}`;
  const hit = sprites.get(key);
  if (hit) return hit;
  const b = body(s, size, back);
  const c = canvas(b.art.width, b.art.height);
  const o = c.getContext('2d')!;
  o.drawImage(b.art, 0, 0);
  if (!back) face(o, b);
  sprites.set(key, c);
  return c;
}

// ---- People. Front and back views are half drawings, mirrored so they stay symmetrical.
type Look = Record<string, string>;
const SKIN = { s: '#f5cda0', S: '#d99e74', e: OUTLINE, o: OUTLINE };
export const LOOKS: Record<string, Look> = {
  hero: { ...SKIN, k: '#33283f', K: '#5c4a70', r: '#e0483e', R: '#a82c38', c: '#2f78c8', C: '#1f4f94', w: '#fdf3dc', y: '#ffc857', B: '#8a5a34', p: '#39405e', P: '#262b45', b: '#e0483e' },
  child: { ...SKIN, h: '#e8c36a', j: '#f8e6a0', H: '#b58838', k: '#4a3030', c: '#d9668a', C: '#a8446c', w: '#f6f1e2', p: '#c9a26b', P: '#94703f', b: '#5b3b2c' },
  rival: { ...SKIN, h: '#1f7f86', j: '#3cb8a8', H: '#14505a', k: '#1f7f86', c: '#2b2f4e', C: '#1b1e38', w: '#3cb8a8', p: '#2b2f4e', P: '#1b1e38', b: '#f6f1e2' },
  miko: { ...SKIN, h: '#2f2433', j: '#4d3f55', H: '#1e1824', k: '#2f2433', c: '#f6f1e2', C: '#c9c2d0', w: '#d6332a', p: '#d6332a', P: '#9c1f28', b: '#f6f1e2' },
  farmer: { ...SKIN, h: '#d9b860', j: '#f4e08f', H: '#a07c34', k: '#6b6b6b', c: '#4f8a4a', C: '#2f5f3a', w: '#d9c58f', p: '#5a6480', P: '#3e4560', b: '#5b3b2c' },
  pilgrim: { ...SKIN, h: '#ece6d4', j: '#ffffff', H: '#b9b2a4', k: '#8a8a9a', c: '#ece6d4', C: '#b9b2a4', w: '#6a6a7a', p: '#ece6d4', P: '#b9b2a4', b: '#7a5230' },
  mom: { ...SKIN, h: '#5a3a30', j: '#7a5244', H: '#3f2822', k: '#5a3a30', c: '#d9668a', C: '#a8446c', w: '#f6e9c8', p: '#d9668a', P: '#a8446c', b: '#f6f1e2' },
  master: { ...SKIN, h: '#6b8a3a', j: '#a4c45a', H: '#46602a', k: '#e6e0d0', c: '#7a5230', C: '#54382a', w: '#ffd23f', p: '#54382a', P: '#3a2a24', b: '#2b2036' },
  guardian: { ...SKIN, s: '#c9b0d8', S: '#9478b0', h: '#3b2470', j: '#6a3bb0', H: '#241650', k: '#e0dcf0', c: '#3b2470', C: '#241650', w: '#ffd23f', p: '#6a3bb0', P: '#3b2470', b: '#241650' },
};

const HAT = ['.....ooo', '...oojjj', '..ojjjhh', '.ojjhhhh', '.ohhhhhh', 'oHHHHHHH', '.ooooooo'];
const FRONT = ['..okkkss', '..oksess', '..oksess', '...osssS', '..ocwccc', '.oCcwccc', '.osCwccc', '.oSoCwCC', '..ooppPp'];
const BACK = ['..okkkkk', '..okkkkk', '..okkkkk', '...okkkk', '..ocCwcc', '.oCcCwcc', '.osCcCcc', '.oSoCcCC', '..ooppPp'];
const SIDE = [
  '.....oooooo.....', '...oojjjjhhoo...', '..ojjjhhhhhhho..', '.ojjhhhhhhhhHHo.', '.ohhhhhhhhhhHHo.', 'oHHHHHHHHHHHHHHo', '.oooooooooooooo.',
  '...osssskkkko...', '...osessskkko...', '...osesskkkko...', '...oSsssskko....', '....ocwcccco....', '....ocwcCcco....', '....ocwsSCco....', '....ocwoSCco....', '....oppppPo.....',
];
// The hero: spiky hair, a red headband, a blue jacket and a satchel with a scroll on his back.
const HERO = {
  front: ['....o.oo', '...okokk', '..okKkkk', '.okKkkkk', '.orrrrrr', '.oRRRRRR', '..okkskk', '..oksess', '..oksess', '..okssss', '...osssS', '..ocwccc', '.oCcCwcc', '.osCcCwy', '.oSoyyyy', '..ooppPp'],
  back: ['....o.oo', '...okokk', '..okKkkk', '.okKkkkk', '.orrrrrr', '.oRRRRRR', '..okkkkk', '..okkkkk', '..okkkkk', '..okkkkk', '...okkkk', '..ocBwww', '.oCcBBcw', '.osCcBBw', '.oSoyyyy', '..ooppPp'],
  side: [
    '.....oo.o.o.....', '....okkokkoko...', '...okKkkkkkkko..', '..okKkkkkkkkkko.', '.orrrrrrrrrrrro.', '.oRRRRRRRRRRRoro', '..osskkkkkkkko..',
    '..osesskkkkkko..', '..osesskkkkkko..', '..osssssskkkko..', '...oSSsssskko...', '...owwccccBBo...', '..oscwcCcccBBo..', '..oSswcCccCBBo..', '...ooyyyyyyyo...', '....oppppppPo...',
  ],
};
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

function raster(rows: string[], look: Look, flip: boolean) {
  const c = canvas(16, rows.length);
  const g = c.getContext('2d')!;
  rows.forEach((row, y) => [...row].forEach((ch, x) => {
    if (ch === '.') return;
    g.fillStyle = look[ch] ?? ch;
    g.fillRect(flip ? 15 - x : x, y, 1, 1);
  }));
  return c;
}

export function person(ctx: CanvasRenderingContext2D, look: string, x: number, y: number, dir: string, step: number) {
  const key = `${look}${dir}${step}`;
  let c = people.get(key);
  if (!c) {
    const hat = ['miko', 'mom', 'rival'].includes(look) ? ['........', '.....ooo', '...oohhh', '..ohjjhh', '..ohhhhh', '.ohhhhhh', '.ohhhhhh'] : HAT;
    const hero = look === 'hero';
    const front = hero ? HERO.front : [...hat, ...FRONT], rear = hero ? HERO.back : [...hat, ...BACK], side = hero ? HERO.side : SIDE;
    const rows = dir === 'down' ? [...mirror(front), ...LEGS.front[step]]
      : dir === 'up' ? [...mirror(rear), ...LEGS.front[step]]
      : [...side, ...LEGS.side[step]];
    c = raster(rows, LOOKS[look], dir === 'right');
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
  ctx.fillStyle = 'rgba(30,30,70,.28)';
  ctx.fillRect(x + 3, y + 13, 10, 3);
  ctx.fillRect(x + 2, y + 14, 12, 1);
}
