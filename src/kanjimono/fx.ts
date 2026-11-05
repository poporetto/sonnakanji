import type { Element, Species } from './battle';
import { canvas, hash, MARGIN, OUTLINE } from './sprites';

// Effects run from the game's frame loop, and every animation is a promise the story can wait on.
export const still = matchMedia('(prefers-reduced-motion: reduce)').matches;

export interface View { x: number; y: number; scale: number; alpha: number; flash: number; melt: number; ink: number; hidden: boolean }
export const newView = (): View => ({ x: 0, y: 0, scale: 1, alpha: 1, flash: 0, melt: 0, ink: 1, hidden: false });
export const views = { foe: newView(), me: newView() };
export const CENTRE = { foe: [187, 53], me: [59, 105] } as const;

interface Tween { start: number; ms: number; run: (t: number) => void; done: () => void }
let tweens: Tween[] = [];
let clock = 0;

export function tween(ms: number, run: (t: number) => void) {
  return new Promise<void>((done) => { tweens.push({ start: clock, ms: Math.max(1, still ? ms * 0.6 : ms), run, done }); });
}
export const pause = (ms: number) => tween(ms, () => {});
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const easeOut = (t: number) => 1 - (1 - t) ** 3;

interface Bit { x: number; y: number; vx: number; vy: number; gravity: number; life: number; max: number; colour: string; size: number }
const bits: Bit[] = [];
export const SPARK: Record<Element | 'ash' | 'bless', { colours: string[]; gravity: number; rise: number; spread: number }> = {
  fire: { colours: ['#ffe27a', '#fba93f', '#ee6a2c', '#c2382c'], gravity: -0.03, rise: 0.3, spread: 1 },
  water: { colours: ['#d8f6ff', '#7fd0f5', '#3f9be8'], gravity: 0.1, rise: 0.5, spread: 1.2 },
  wood: { colours: ['#e0f08a', '#93d05a', '#4faa4a'], gravity: 0.02, rise: 0.1, spread: 1.3 },
  earth: { colours: ['#f5dfa0', '#b97d3f', '#84502f', '#4e2f2a'], gravity: 0.16, rise: 0.9, spread: 1.4 },
  metal: { colours: ['#ffffff', '#f5f8fa', '#c3cdd8', '#ffd23f'], gravity: 0.05, rise: 0, spread: 2 },
  spirit: { colours: ['#ffffff', '#f4dcff', '#c89af0', '#9a62dc'], gravity: -0.01, rise: 0.1, spread: 0.9 },
  bless: { colours: ['#ffffff', '#fff0a0', '#ffd23f', '#ffc0d8'], gravity: -0.05, rise: 0.8, spread: 0.45 },
  ash: { colours: ['#8d8796', '#b0abb4', '#5a5a70', '#d9d2c8'], gravity: -0.05, rise: 0.5, spread: 0.7 },
};

export function burst(type: Element | 'ash' | 'bless', x: number, y: number, count: number, force = 1) {
  const s = SPARK[type];
  for (let i = 0; i < (still ? count / 2 : count); i++) {
    const a = Math.random() * Math.PI * 2, v = (0.4 + Math.random() * 1.6) * s.spread * force;
    const max = 22 + Math.random() * 22;
    bits.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - s.rise, gravity: s.gravity, life: max, max, colour: s.colours[Math.floor(Math.random() * s.colours.length)], size: Math.random() < 0.35 ? 3 : 2 });
  }
}

export function drip(x: number, y: number, colour: string) {
  bits.push({ x, y, vx: (Math.random() - 0.5) * 0.3, vy: 0.3 + Math.random(), gravity: 0.05, life: 34, max: 34, colour, size: 2 });
}

export function drawBits(ctx: CanvasRenderingContext2D) {
  for (let i = bits.length - 1; i >= 0; i--) {
    const b = bits[i];
    b.x += b.vx; b.y += b.vy; b.vy += b.gravity; b.life--;
    if (b.life <= 0) { bits.splice(i, 1); continue; }
    ctx.fillStyle = b.colour;
    const size = b.life < b.max / 3 ? 1 : b.size;
    ctx.fillRect(Math.round(b.x), Math.round(b.y), size, size);
  }
}

// ---- Screen-wide effects
let shake = 0;
let flash = 0, flashColour = '#ffffff';
export const veil = { wipe: 0, curtain: 0 };

// A seal stamped into the game screen itself, so it stays pixel art.
export const seal = { art: null as HTMLCanvasElement | null, grow: 1 };

export function sealArt(mark: string) {
  const size = 34, wide = [...mark].length * size + 6, big = 4;
  const scratch = canvas(wide * big, 40 * big);
  const g = scratch.getContext('2d', { willReadFrequently: true })!;
  g.font = `900 ${size * big}px "M PLUS Rounded 1c"`;
  g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText(mark, (wide * big) / 2, 21 * big);
  const data = g.getImageData(0, 0, wide * big, 40 * big).data;
  const c = canvas(wide, 40);
  const o = c.getContext('2d')!;
  o.fillStyle = '#c7302c'; o.fillRect(2, 0, wide - 4, 40); o.fillRect(0, 2, wide, 36);
  o.fillStyle = '#fdf8ef'; o.fillRect(3, 2, wide - 6, 36); o.fillRect(2, 3, wide - 4, 34);
  o.fillStyle = '#c7302c';
  for (let y = 0; y < 40; y++) for (let x = 0; x < wide; x++) {
    let on = 0;
    for (let j = 0; j < big; j++) for (let i = 0; i < big; i++) if (data[((y * big + j) * wide * big + x * big + i) * 4 + 3] > 120) on++;
    if (on > big * big * 0.45) o.fillRect(x, y, 1, 1);
  }
  return c;
}
export const shakeScreen = (amount: number) => { if (!still) shake = amount; };
export const flashScreen = (amount: number, colour = '#ffffff') => { flash = still ? 0 : amount; flashColour = colour; };

export function beginFrame(ctx: CanvasRenderingContext2D, now: number) {
  clock = now;
  const running = tweens;
  tweens = [];
  for (const t of running) {
    const p = Math.min(1, (now - t.start) / t.ms);
    t.run(p);
    if (p >= 1) t.done(); else tweens.push(t);
  }
  ctx.save();
  if (shake > 0.4) {
    ctx.translate(Math.round((Math.random() - 0.5) * shake), Math.round((Math.random() - 0.5) * shake));
    shake *= 0.82;
  }
}

// Brush strokes sweep in from alternating sides.
export function endFrame(ctx: CanvasRenderingContext2D) {
  ctx.restore();
  if (flash > 0.02) {
    ctx.globalAlpha = flash; ctx.fillStyle = flashColour; ctx.fillRect(0, 0, 240, 160); ctx.globalAlpha = 1;
    flash *= 0.8;
  }
  if (veil.wipe > 0) {
    ctx.fillStyle = OUTLINE;
    for (let row = 0; row < 8; row++) {
      const w = Math.min(1, veil.wipe * (1.25 + hash(row, 2) * 0.5)) * 252;
      ctx.fillRect(row % 2 ? 240 - w : 0, row * 20, w, 21);
      ctx.fillRect(row % 2 ? 240 - w - 5 : w, row * 20 + 7, 5, 8);
    }
  }
  if (seal.art) {
    const w = seal.art.width * seal.grow, h = seal.art.height * seal.grow;
    ctx.drawImage(seal.art, Math.round(232 - w), 8, Math.round(w), Math.round(h));
  }
  if (veil.curtain > 0) {
    ctx.globalAlpha = Math.min(1, veil.curtain); ctx.fillStyle = OUTLINE; ctx.fillRect(0, 0, 240, 160); ctx.globalAlpha = 1;
    veil.curtain -= 0.06;
  }
}

// ---- Kanji creatures
const white = new WeakMap<HTMLCanvasElement, HTMLCanvasElement>();
function tinted(sprite: HTMLCanvasElement) {
  let c = white.get(sprite);
  if (!c) {
    c = canvas(sprite.width, sprite.height);
    const g = c.getContext('2d')!;
    g.drawImage(sprite, 0, 0);
    g.globalCompositeOperation = 'source-in';
    g.fillStyle = '#ffffff';
    g.fillRect(0, 0, c.width, c.height);
    white.set(sprite, c);
  }
  return c;
}

const lengths = new Map<string, number>();
function strokeLength(d: string) {
  let n = lengths.get(d);
  if (n === undefined) {
    const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    p.setAttribute('d', d);
    n = p.getTotalLength();
    lengths.set(d, n);
  }
  return n;
}

// The kanji writes itself in its real stroke order.
function drawStrokes(ctx: CanvasRenderingContext2D, s: Species, x: number, y: number, size: number, ink: number) {
  ctx.save();
  ctx.translate(x + MARGIN, y + MARGIN);
  ctx.scale(size / 109, size / 109);
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.lineWidth = 7; ctx.strokeStyle = OUTLINE;
  const progress = ink * s.d.length;
  s.d.forEach((d, i) => {
    if (i >= Math.ceil(progress)) return;
    const part = Math.min(1, progress - i), full = strokeLength(d);
    ctx.setLineDash([full * part, full]);
    ctx.stroke(new Path2D(d));
  });
  ctx.restore();
}

export function drawKanji(ctx: CanvasRenderingContext2D, v: View, sprite: HTMLCanvasElement, s: Species, x: number, y: number, size: number) {
  if (v.hidden) return;
  const dx = x + v.x, dy = y + v.y, w = sprite.width, h = sprite.height;
  if (v.ink < 1) return drawStrokes(ctx, s, dx, dy, size, v.ink);
  ctx.globalAlpha = v.alpha;
  if (v.melt > 0) {
    // Each column of pixels slides down at its own speed, so the kanji runs like wet ink.
    for (let col = 0; col < w; col += 2) {
      const drop = hash(col, 5) * 0.8 + 0.2;
      ctx.drawImage(sprite, col, 0, 2, h, dx + col, dy + v.melt * v.melt * drop * 70, 2, h * (1 - v.melt * 0.5));
    }
  } else {
    const sw = w * v.scale, sh = h * v.scale;
    const left = dx + (w - sw) / 2, top = dy + h - sh;
    ctx.drawImage(sprite, left, top, sw, sh);
    if (v.flash > 0) { ctx.globalAlpha = v.flash * v.alpha; ctx.drawImage(tinted(sprite), left, top, sw, sh); }
  }
  ctx.globalAlpha = 1;
}

// ---- The paper charm: a tall paper talisman brushed with the name of the kanji it binds.
export const charm = { show: false, x: 0, y: 0, turn: 0, art: null as HTMLCanvasElement | null };
const charms = new Map<string, HTMLCanvasElement>();

export function charmArt(s: Species, tint = '#d6332a') {
  const key = s.k + tint;
  const hit = charms.get(key);
  if (hit) return hit;
  const W = 32, H = 50, G = 28, big = G * 4;
  const c = canvas(W, H);
  const g = c.getContext('2d')!;
  const r = (colour: string, x: number, y: number, w: number, h: number) => { g.fillStyle = colour; g.fillRect(x, y, w, h); };
  r(OUTLINE, 1, 0, W - 2, H); r(OUTLINE, 0, 1, W, H - 2);
  r('#fdf8ef', 1, 1, W - 2, H - 2);
  r('#efe4cc', W - 3, 1, 2, H - 2);
  // Coloured frame and header band, as on a shrine talisman.
  r(tint, 2, 2, W - 4, 3); r(tint, 2, H - 4, W - 4, 2); r(tint, 2, 2, 1, H - 5); r(tint, W - 3, 2, 1, H - 5);
  r('#fdf8ef', 12, 3, 8, 1);
  // The kanji's name, lettered large in the rounded face and cut to hard pixels.
  const scratch = canvas(big, big);
  const ink = scratch.getContext('2d', { willReadFrequently: true })!;
  ink.font = `700 ${big * 0.96}px "M PLUS Rounded 1c"`;
  ink.textAlign = 'center'; ink.textBaseline = 'middle';
  ink.fillText(s.k, big / 2, big / 2 + big * 0.03);
  const px = ink.getImageData(0, 0, big, big).data;
  for (let y = 0; y < G; y++) for (let x = 0; x < G; x++) {
    let on = 0;
    for (let j = 0; j < 4; j++) for (let i = 0; i < 4; i++) if (px[((y * 4 + j) * big + x * 4 + i) * 4 + 3] > 120) on++;
    if (on >= 7) r(OUTLINE, 2 + x, 7 + y, 1, 1);
  }
  // A little seal under the name.
  r(tint, 12, 37, 8, 8); r('#fdf8ef', 14, 39, 4, 4); r(tint, 15, 40, 2, 2);
  charms.set(key, c);
  return c;
}

export function drawCharm(ctx: CanvasRenderingContext2D) {
  if (!charm.show || !charm.art) return;
  ctx.save();
  ctx.translate(Math.round(charm.x), Math.round(charm.y));
  ctx.rotate(charm.turn);
  ctx.drawImage(charm.art, -charm.art.width / 2, -charm.art.height / 2);
  ctx.restore();
}
