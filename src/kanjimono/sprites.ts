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

// Ramps run shadow to light. Shadows lean blue and lights lean warm, which is what makes shading feel painted.
type Ramp = [string, string, string, string, string];
const RAMPS: Record<Exclude<Element, 'spirit'>, Ramp> = {
  fire: ['#7a1f2e', '#c2382c', '#ee6a2c', '#fba93f', '#ffe27a'],
  water: ['#1d3f7a', '#2a6cc0', '#3f9be8', '#7fd0f5', '#d8f6ff'],
  wood: ['#1b4d3e', '#2c7a45', '#4faa4a', '#93d05a', '#e0f08a'],
  earth: ['#4e2f2a', '#84502f', '#b97d3f', '#dcae63', '#f5dfa0'],
  metal: ['#3a3f5c', '#626b87', '#8f9bb0', '#c3cdd8', '#f5f8fa'],
};
// Most kanji are spirit type, so each gets one of several ramps to keep the roster varied.
const SPIRITS: Ramp[] = [
  ['#3b2470', '#6a3bb0', '#9a62dc', '#c89af0', '#f4dcff'],
  ['#6b1f55', '#a8357a', '#dc5c9c', '#f59ac0', '#ffe0ea'],
  ['#14505a', '#1f8285', '#3cb8a8', '#85e0c0', '#e0fbe6'],
  ['#2b2f78', '#4250c0', '#6a82e8', '#a5bcf5', '#e4eeff'],
];

const sprites = new Map<string, HTMLCanvasElement>();

// Shades the kanji's real strokes as solid forms, so the creature stays readable as the character.
export function kanjiSprite(s: Species, size = 64, back = false) {
  const key = `${s.k}${size}${back}`;
  const hit = sprites.get(key);
  if (hit) return hit;
  const seed = s.k.codePointAt(0)!;
  const ramp = s.type === 'spirit' ? SPIRITS[seed % SPIRITS.length] : RAMPS[s.type];
  const M = 7;
  const scratch = canvas(size, size);
  const g = scratch.getContext('2d', { willReadFrequently: true })!;
  g.scale(size / 109, size / 109);
  g.lineCap = 'round'; g.lineJoin = 'round';
  g.lineWidth = s.strokes > 13 ? 8 : s.strokes > 8 ? 10.5 : 13;
  for (const d of s.d) g.stroke(new Path2D(d));
  const data = g.getImageData(0, 0, size, size).data;
  const on = (x: number, y: number) => x >= 0 && y >= 0 && x < size && y < size && data[(y * size + x) * 4 + 3] > 100;

  const out = canvas(size + M * 2, size + M * 2);
  const o = out.getContext('2d')!;
  const dot = (c: string, x: number, y: number, w = 1, h = 1) => { o.fillStyle = c; o.fillRect(x + M, y + M, w, h); };

  // Decorations go down first so outline and body sit cleanly over them.
  const tops: [number, number][] = [];
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) if (on(x, y) && !on(x, y - 1) && !on(x, y - 2)) tops.push([x, y]);
  const pick = (i: number) => tops[Math.floor(hash(seed, i) * tops.length)];
  if (s.type === 'fire') {
    for (let i = 0; i < 26; i++) {
      const [x, y] = pick(i);
      const h = 2 + Math.floor(hash(i, seed) * 6);
      dot(OUTLINE, x - 1, y - h - 1, 3, h + 1);
      dot(ramp[2], x, y - h, 1, h); dot(ramp[4], x, y - Math.ceil(h / 2), 1, Math.ceil(h / 2));
    }
  } else if (s.type === 'wood') {
    for (let i = 0; i < 9; i++) {
      const [x, y] = pick(i);
      dot(OUTLINE, x - 2, y - 3, 6, 4); dot(OUTLINE, x - 1, y - 4, 4, 6);
      dot(ramp[3], x - 1, y - 3, 4, 3); dot(ramp[4], x - 1, y - 3, 2, 1); dot(ramp[1], x + 1, y - 1, 2, 1);
    }
  } else if (s.type === 'water') {
    for (let i = 0; i < 6; i++) {
      const x = Math.floor(hash(i, seed) * size), y = Math.floor(hash(seed, i * 3) * size);
      if (on(x, y)) continue;
      dot(OUTLINE, x - 1, y - 2, 3, 5); dot(ramp[2], x, y - 1, 1, 3); dot(ramp[4], x, y - 1, 1, 1);
    }
  }

  for (let y = -1; y <= size; y++) for (let x = -1; x <= size; x++) {
    if (!on(x, y) && (on(x + 1, y) || on(x - 1, y) || on(x, y + 1) || on(x, y - 1))) dot(OUTLINE, x, y);
  }
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    if (!on(x, y)) continue;
    let i = 2;
    if (!on(x, y - 1) || !on(x - 1, y)) i = 3;
    if (!on(x - 1, y - 1) && !on(x, y - 1) && (x + y) % 2) i = 4;
    if (!on(x, y + 2) || !on(x + 2, y)) i = 1;
    if (!on(x, y + 1) || !on(x + 1, y)) i = 0;
    if (y > size * 0.7 && i > 1 && (x + y) % 2 === 0) i--;
    if (s.type === 'metal' && (x + y) % 26 < 3 && i > 0) i = 4;
    if (s.type === 'earth' && hash(x, y) < 0.09 && i > 1) i = 1;
    if (s.type === 'fire' && y < size * 0.4 && i > 0 && i < 4 && (x + y) % 2) i++;
    if (s.type !== 'metal' && s.type !== 'earth' && s.type !== 'fire' && hash(x + seed, y) < 0.03 && i === 2) i = 3;
    dot(ramp[i], x, y);
  }

  // Short legs sprout from the lowest stroke on each side.
  const low = (x: number) => { for (let y = size - 1; y > 0; y--) if (on(x, y)) return y; return 0; };
  const widest = (from: number, to: number) => { let best = from; for (let x = from; x < to; x++) if (low(x) > low(best)) best = x; return best; };
  const cx = Math.floor(size / 2);
  const legs = [widest(Math.floor(size * 0.15), cx - 4), widest(cx + 4, Math.floor(size * 0.85))];
  const foot = Math.min(size + 3, Math.max(...legs.map(low)) + 6);
  const w = Math.max(4, Math.round(size / 13));
  for (const fx of legs) {
    const top = low(fx) - 2;
    dot(OUTLINE, fx - 1, top, w + 2, foot - top);
    dot(ramp[1], fx, top, w, foot - top - 1);
    dot(ramp[2], fx, top, 1, foot - top - 1);
    dot(OUTLINE, fx - 2, foot - 2, w + 5, 4);
    dot(ramp[2], fx - 1, foot - 1, w + 3, 2);
    dot(ramp[3], fx - 1, foot - 1, Math.ceil((w + 3) / 2), 1);
  }

  if (!back) {
    let ink = 0, sum = 0, row = 0, densest = 0;
    for (let y = Math.floor(size * 0.2); y < size * 0.6; y++) {
      let run = 0;
      for (let x = 0; x < size; x++) if (on(x, y)) { run++; ink++; sum += x; }
      if (run > densest) { densest = run; row = y; }
    }
    const mid = Math.round(ink ? sum / ink : cx);
    const ew = Math.round(size * 0.12), eh = Math.round(size * 0.15), gap = Math.round(size * 0.05);
    const ey = Math.min(row, Math.floor(size * 0.42)) - Math.floor(eh / 2);
    for (const dir of [-1, 1]) {
      const ex = dir < 0 ? mid - gap - ew : mid + gap;
      dot(OUTLINE, ex - 1, ey, ew + 2, eh);
      dot(OUTLINE, ex, ey - 1, ew, eh + 2);
      dot('#fffdf5', ex, ey, ew, eh);
      const pw = Math.ceil(ew * 0.55), px = dir < 0 ? ex + ew - pw : ex;
      dot(OUTLINE, px, ey + 1, pw, eh - 1);
      dot('#fffdf5', px, ey + 2, Math.ceil(pw / 2), 2);
      if (seed % 3 === 1) for (let i = 0; i < ew + 2; i++) dot(OUTLINE, ex - 1 + i, ey - 2 + (dir < 0 ? i >> 1 : (ew + 1 - i) >> 1), 1, 2);
    }
    const my = ey + eh + 2;
    dot(OUTLINE, mid - 3, my, 6, seed % 2 ? 3 : 2);
    dot(OUTLINE, mid - 4, my - 1, 1, 2); dot(OUTLINE, mid + 3, my - 1, 1, 2);
    if (seed % 2) dot('#e8646a', mid - 2, my, 4, 2);
  }
  sprites.set(key, out);
  return out;
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
