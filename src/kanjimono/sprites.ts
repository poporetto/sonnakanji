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

// Each creature keeps its kanji's silhouette, merges fine strokes into chunky shapes,
// wears its face in the middle, and gets a motif from its element or theme.
type Ramp = [string, string, string, string, string];
interface Style { ramp: Ramp; edge: string; motif: string }

const STYLES: Record<Exclude<Element, 'spirit'>, Style> = {
  fire: { ramp: ['#b3301e', '#e8572a', '#f9932e', '#fcc24a', '#ffe98a'], edge: '#5a1420', motif: 'flame' },
  water: { ramp: ['#1f6fd1', '#3f9be8', '#6cc4f5', '#a8e4fb', '#e6fbff'], edge: '#132c6e', motif: 'drops' },
  wood: { ramp: ['#7a4a24', '#a8673a', '#c98a52', '#e0ac74', '#f2cda0'], edge: '#3a2218', motif: 'leaves' },
  earth: { ramp: ['#a8683a', '#c98a52', '#e0ac74', '#f0cc98', '#fbeccc'], edge: '#4a2a20', motif: 'rocks' },
  metal: { ramp: ['#5d6888', '#8592ae', '#b0bccf', '#d6dee8', '#f8fbfd'], edge: '#39405e', motif: 'shine' },
};
const THEMES: { kanji: string; look: Style }[] = [
  { kanji: '語話言読書聞文字音歌説問答教習題試験意味', look: { ramp: ['#7a55c8', '#a37fe6', '#c9aef5', '#e2d2fb', '#f6efff'], edge: '#37217e', motif: 'speech' } },
  { kanji: '月夜天空星明朝昼夕春秋夏冬風今時間週午', look: { ramp: ['#d9a93f', '#f2cd68', '#fbe79a', '#fff3bd', '#fffbe6'], edge: '#4a2f7a', motif: 'moon' } },
  { kanji: '人男女子父母友兄弟姉妹親族者員先生私自主', look: { ramp: ['#d9568c', '#ee84ad', '#f8afc9', '#fcd3e0', '#fff0f5'], edge: '#8c2f6a', motif: 'heart' } },
  { kanji: '一二三四五六七八九十百千万円半多少', look: { ramp: ['#d98a1f', '#f2b23a', '#fcd25e', '#ffe89a', '#fffbdc'], edge: '#8a4a1a', motif: 'star' } },
  { kanji: '食飲茶肉飯魚味料牛鳥犬花', look: { ramp: ['#d97a4a', '#f09c68', '#f9bd8e', '#fdd9b8', '#fff1e0'], edge: '#8a4230', motif: 'bloom' } },
  { kanji: '家屋店町校駅院館国京道室社場堂建図', look: { ramp: ['#4a78b0', '#6a9ad0', '#94bce6', '#bcd8f2', '#e6f2fc'], edge: '#2c4a80', motif: 'roof' } },
  { kanji: '行来走歩動運発起立帰通入出送転急開止', look: { ramp: ['#2f9a8a', '#4fbea8', '#7ddcc2', '#b0eedb', '#e4fbf2'], edge: '#1c5f64', motif: 'speed' } },
];
const SPARES: Style[] = [
  { ramp: ['#8a62d0', '#ad8aea', '#cdb5f6', '#e6d9fb', '#f8f2ff'], edge: '#4f3498', motif: 'star' },
  { ramp: ['#d9568c', '#ee84ad', '#f8afc9', '#fcd3e0', '#fff0f5'], edge: '#8c2f6a', motif: 'bloom' },
  { ramp: ['#2f9a8a', '#4fbea8', '#7ddcc2', '#b0eedb', '#e4fbf2'], edge: '#1c5f64', motif: 'star' },
  { ramp: ['#4a78b0', '#6a9ad0', '#94bce6', '#bcd8f2', '#e6f2fc'], edge: '#2c4a80', motif: 'bloom' },
];

function lookOf(s: Species) {
  if (s.type !== 'spirit') return STYLES[s.type];
  return THEMES.find((t) => t.kanji.includes(s.k))?.look ?? SPARES[s.k.codePointAt(0)! % SPARES.length];
}

export const MARGIN = 26;
interface Body { art: HTMLCanvasElement; fx: number; fy: number; top: number; size: number; faceScale: number; seed: number }
const bodies = new Map<string, Body>();

// Measures a kanji's structure: the gaps it encloses, and how many separate bars of ink
// you cross scanning along every row and column. Open slots between strokes show up in that count too.
function shapeOf(mask: Uint8Array, size: number) {
  // Grown by a pixel first, so a slot that the outline would swallow counts as closed.
  const grown = new Uint8Array(mask);
  for (let y = 1; y < size - 1; y++) for (let x = 1; x < size - 1; x++) {
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
function chunky(s: Species, size: number) {
  const target = shapeOf(inked(s, size, 6.5), size);
  const widest = s.strokes > 11 ? 12 : s.strokes > 8 ? 14 : s.strokes > 5 ? 18 : 26;
  for (let width = widest; width > 8; width -= 1) {
    const mask = inked(s, size, width), shape = shapeOf(mask, size);
    if (shape.gaps === target.gaps && shape.bars >= target.bars * 0.88) return mask;
  }
  return inked(s, size, 8);
}

function distances(mask: Uint8Array, size: number) {
  const d = new Float32Array(size * size);
  const at = (x: number, y: number) => (x < 0 || y < 0 || x >= size || y >= size ? 0 : d[y * size + x]);
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    if (mask[y * size + x]) d[y * size + x] = Math.min(at(x - 1, y) + 1, at(x, y - 1) + 1, at(x - 1, y - 1) + 1.4, at(x + 1, y - 1) + 1.4);
  }
  for (let y = size - 1; y >= 0; y--) for (let x = size - 1; x >= 0; x--) {
    if (mask[y * size + x]) d[y * size + x] = Math.min(d[y * size + x], at(x + 1, y) + 1, at(x, y + 1) + 1, at(x + 1, y + 1) + 1.4, at(x - 1, y + 1) + 1.4);
  }
  return d;
}

function body(s: Species, size: number, back = false): Body {
  const key = `${s.k}${size}${back}`;
  const hit = bodies.get(key);
  if (hit) return hit;
  const k = size / 72, W = size + MARGIN * 2, seed = s.k.codePointAt(0)!;
  const { ramp, edge, motif } = lookOf(s);
  const mask = chunky(s, size);
  let dist = distances(mask, size);

  // The face sits on the thickest part near the middle, with a little belly added if the kanji is thin.
  let fx = size >> 1, fy = size >> 1, best = -1e9;
  for (let y = Math.floor(size * 0.3); y < size * 0.72; y++) for (let x = Math.floor(size * 0.2); x < size * 0.8; x++) {
    const score = dist[y * size + x] - Math.abs(x - size / 2) * 0.09 - Math.abs(y - size * 0.5) * 0.07;
    if (score > best) { best = score; fx = x; fy = y; }
  }
  // A belly only goes in if it leaves the kanji's structure alone.
  const belly = size * (s.strokes > 8 ? 0.13 : 0.19);
  const rounder = new Uint8Array(mask);
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    if (((x - fx) / 1.25) ** 2 + (y - fy) ** 2 < belly * belly) rounder[y * size + x] = 1;
  }
  const before = shapeOf(mask, size), after = shapeOf(rounder, size);
  const open = after.gaps < before.gaps || after.bars < before.bars * 0.97;
  if (!open) mask.set(rounder);
  // A narrower stroke gets a smaller face, so it stays on the body.
  const faceScale = open ? Math.max(0.75, Math.min(1, dist[fy * size + fx] / (9 * k))) : 1;
  dist = distances(mask, size);

  const px: (string | null)[] = new Array(W * W).fill(null);
  const set = (x: number, y: number, c: string) => { if (x >= 0 && y >= 0 && x < W && y < W) px[Math.round(y) * W + Math.round(x)] = c; };
  // Paints any shape with a bold outline.
  const line2 = Math.max(1, Math.round(2 * k));
  const paint = (x0: number, y0: number, x1: number, y1: number, test: (x: number, y: number) => boolean, fill: (x: number, y: number) => string, line = edge) => {
    const [a, b, c, d] = [Math.floor(x0) - line2, Math.floor(y0) - line2, Math.ceil(x1) + line2, Math.ceil(y1) + line2];
    for (let y = b; y <= d; y++) for (let x = a; x <= c; x++) {
      if (test(x, y)) continue;
      let near = false;
      for (let j = -line2; j <= line2 && !near; j++) for (let i = -line2; i <= line2 && !near; i++) {
        if (Math.abs(i) + Math.abs(j) <= line2 + (line2 > 1 ? 1 : 0) && (i || j) && test(x + i, y + j)) near = true;
      }
      if (near) set(x, y, line);
    }
    for (let y = b; y <= d; y++) for (let x = a; x <= c; x++) if (test(x, y)) set(x, y, fill(x, y));
  };
  const round = (cx: number, cy: number, r: number, fill: string | ((x: number, y: number) => string), line = edge, squash = 1) =>
    paint(cx - r, cy - r * squash, cx + r, cy + r * squash, (x, y) => ((x - cx) ** 2 + ((y - cy) / squash) ** 2 < r * r), typeof fill === 'string' ? () => fill : fill, line);
  const flame = (cx: number, by: number, w: number, h: number) => {
    const half = (t: number) => (w / 2) * (t < 0.35 ? Math.sqrt(t / 0.35) : (1 - t) / 0.65);
    const mid = (t: number) => cx + Math.sin(t * 3.4) * w * 0.14 * t;
    paint(cx - w, by - h, cx + w, by, (x, y) => { const t = (by - y) / h; return t > 0 && t < 1 && Math.abs(x - mid(t)) < half(t); }, (x, y) => {
      const t = (by - y) / h, rel = Math.abs(x - mid(t)) / Math.max(0.5, half(t));
      return rel > 0.7 || t > 0.8 ? ramp[1] : rel > 0.42 || t > 0.6 ? ramp[2] : rel > 0.2 && t > 0.3 ? ramp[3] : ramp[4];
    });
  };
  const drop = (cx: number, cy: number, r: number) => {
    paint(cx - r, cy - r * 2, cx + r, cy + r, (x, y) => { const t = (y - (cy - r * 2)) / (r * 2); return y < cy ? Math.abs(x - cx) < r * t : (x - cx) ** 2 + (y - cy) ** 2 < r * r; }, () => ramp[2]);
    set(cx - r * 0.3, cy - r * 0.1, ramp[4]);
  };
  const leaf = (cx: number, cy: number, r: number, tilt: number) => {
    paint(cx - r * 1.5, cy - r * 1.5, cx + r * 1.5, cy + r * 1.5, (x, y) => {
      const u = (x - cx) * Math.cos(tilt) + (y - cy) * Math.sin(tilt), v = -(x - cx) * Math.sin(tilt) + (y - cy) * Math.cos(tilt);
      return (u / (r * 1.4)) ** 2 + (v / (r * 0.7)) ** 2 < 1;
    }, (x, y) => (y < cy ? '#8fce4e' : '#5fae3c'), '#2f6a30');
  };
  const star = (cx: number, cy: number, r: number, fill = '#ffd23f') => {
    paint(cx - r, cy - r, cx + r, cy + r, (x, y) => {
      const a = Math.atan2(y - cy, x - cx) + Math.PI / 2, l = Math.hypot(x - cx, y - cy);
      const wedge = Math.abs(((a % (Math.PI * 0.4)) + Math.PI * 0.4) % (Math.PI * 0.4) - Math.PI * 0.2) / (Math.PI * 0.2);
      return l < r * (0.5 + 0.5 * wedge);
    }, () => fill, '#b57a1a');
  };
  const spark = (cx: number, cy: number, r: number, fill = '#ffffff') => {
    for (let i = -r; i <= r; i++) { set(cx + i, cy, fill); set(cx, cy + i, fill); }
  };

  const ox = MARGIN, oy = MARGIN;
  const inside = (x: number, y: number) => { const a = x - ox, b = y - oy; return a >= 0 && b >= 0 && a < size && b < size && mask[b * size + a] === 1; };
  let topY = size, topX = size >> 1;
  for (let y = 0; y < size && topY === size; y++) for (let x = 0; x < size; x++) if (mask[y * size + x]) { topY = y; topX = x; break; }
  const top: number[] = [];
  for (let x = 0; x < size; x++) { let y = 0; while (y < size && !mask[y * size + x]) y++; top.push(y); }
  const sides = [ox + size * 0.06, ox + size * 0.94];

  // Motifs behind the body.
  if (motif === 'flame') {
    const [fcx, fby] = [ox + topX, oy + topY + 14 * k];
    flame(fcx - 13 * k, fby + 2 * k, 20 * k, 24 * k);
    flame(fcx + 13 * k, fby + 2 * k, 20 * k, 27 * k);
    flame(fcx, fby, 28 * k, 33 * k);
    flame(sides[0] - 2, oy + size * 0.26, 10 * k, 16 * k);
    flame(sides[1] + 2, oy + size * 0.3, 9 * k, 14 * k);
    flame(sides[1] + 4, oy + size * 0.74, 7 * k, 11 * k);
  }
  if (motif === 'moon') {
    const puffY = oy + topY + size * 0.2;
    for (const x of [ox + size * 0.14, ox + size * 0.86]) round(x, puffY, 13 * k, (a, b) => (b < puffY ? '#fbf3ff' : '#e6d8f8'), '#7a55c8', 0.62);
    // Enclosed gaps in the kanji become little windows of night sky.
    if (!back) {
      const open = new Uint8Array(size * size), stack: number[] = [];
      for (let i = 0; i < size; i++) stack.push(i, size * (size - 1) + i, i * size, i * size + size - 1);
      while (stack.length) {
        const c = stack.pop()!;
        if (open[c] || mask[c]) continue;
        open[c] = 1;
        const x = c % size;
        if (x > 0) stack.push(c - 1);
        if (x < size - 1) stack.push(c + 1);
        if (c >= size) stack.push(c - size);
        if (c < size * (size - 1)) stack.push(c + size);
      }
      for (let c = 0; c < size * size; c++) if (!mask[c] && !open[c]) set(ox + c % size, oy + Math.floor(c / size), hash(c, 7) < 0.05 ? '#ffe98a' : '#4a2f94');
    }
  }
  if (motif === 'roof') {
    const [cx, cy, w, h] = [ox + topX, oy + topY + 4 * k, 17 * k, 12 * k];
    paint(cx - w, cy - h, cx + w, cy, (x, y) => y > cy - h && y <= cy && Math.abs(x - cx) < w * ((y - (cy - h)) / h), (x, y) => (y > cy - 2 ? '#c23a32' : (x + y) % 3 ? '#e8625a' : '#c23a32'), '#7a1f2e');
  }

  // The body: soft light from the upper left, with the brightest part around the face.
  const faceX = ox + fx, faceY = oy + fy;
  paint(ox, oy, ox + size, oy + size, inside, (x, y) => {
    const a = x - ox, b = y - oy, d = dist[b * size + a];
    if (motif === 'flame' && back) { const t = (y - oy) / size; return t < 0.45 ? ramp[3] : t < 0.62 ? ramp[2] : t < 0.8 ? ramp[1] : ramp[0]; }
    if (motif === 'flame') { const t = Math.hypot(x - faceX, y - faceY) / size; return t < 0.17 ? ramp[4] : t < 0.27 ? ramp[3] : t < 0.4 ? ramp[2] : t < 0.5 ? ramp[1] : ramp[0]; }
    if (!inside(x + 1, y + 1)) return ramp[0];
    if (!inside(x + 3, y + 3)) return ramp[1];
    if (!inside(x - 2, y - 2)) return ramp[3];
    return ramp[2];
  });
  // Gloss on the upper strokes.
  for (let i = 0; i < 10; i++) {
    const a = Math.floor(hash(seed, i) * size), b = Math.floor(hash(i, seed) * size * 0.7);
    if (dist[b * size + a] > 5 * k && Math.hypot(ox + a - faceX, oy + b - faceY) > 15 * k) {
      const r = Math.max(1, Math.round((motif === 'drops' ? 3.5 : 2) * k));
      for (let y = -r; y <= r; y++) for (let x = -r; x <= r; x++) if (x * x + y * y <= r * r) set(ox + a + x, oy + b + y, ramp[4]);
    }
  }

  // Motifs in front of the body.
  if (motif === 'leaves') {
    // A wide cap of moss, bumpy on top and shaded underneath, with a sprout growing from it.
    const [cx, cy, w, h] = [ox + topX, oy + topY + 7 * k, 35 * k, 11 * k];
    const bump = (x: number) => Math.sin(x / (4.6 * k) + seed) * 2.6 * k + Math.sin(x / (2.1 * k)) * 1.2 * k;
    leaf(cx - 7 * k, cy - h - 2 * k, 6.5 * k, 0.7);
    leaf(cx + 7 * k, cy - h - 2 * k, 6.5 * k, -0.7);
    for (let i = 0; i < 6 * k; i++) set(cx, cy - h + i, '#3f8a3a');
    paint(cx - w, cy - h - 6, cx + w, cy + h + 6, (x, y) => {
      const t = (x - cx) / w;
      if (Math.abs(t) >= 1) return false;
      const edge2 = h * Math.sqrt(1 - t * t);
      return y > cy - edge2 + bump(x) * 0.6 && y < cy + edge2 * 0.72 + bump(x + 9) * 0.5;
    }, (x, y) => { const v = (y - (cy - h)) / (h * 2) + (hash(x >> 1, y >> 1) - 0.5) * 0.14; return v < 0.32 ? '#a4dc5e' : v < 0.58 ? '#74bf48' : v < 0.78 ? '#4f9a3c' : '#357a34'; }, '#23562c');
    leaf(sides[0] - 3, oy + size * 0.64, 7 * k, -0.4);
    leaf(sides[1] + 3, oy + size * 0.58, 7 * k, 0.4);
  }
  if (motif === 'drops') {
    drop(sides[0] - 2, oy + size * 0.3, 4.5 * k);
    drop(sides[1] + 2, oy + size * 0.56, 4 * k);
    const bubble = (x: number, y: number, r: number) => {
      round(x, y, r, ramp[4], ramp[0]);
      round(x, y, r * 0.62, ramp[3], ramp[3]);
      set(x - r * 0.4, y - r * 0.4, '#ffffff');
    };
    bubble(ox + size * 0.76, oy + 1 * k, 6 * k);
    bubble(ox + size * 0.9, oy + size * 0.2, 3 * k);
    bubble(sides[0] + 4, oy + size * 0.14, 4 * k);
    // A puddle and a small splash underneath.
    const base = oy + size + 6 * k;
    for (let x = -30; x <= 30; x++) if (Math.abs(x) % 9 < 7) { set(ox + size / 2 + x * k, base, ramp[2]); set(ox + size / 2 + x * k * 0.7, base + 2, ramp[3]); }
    for (const dir of [-1, 1]) for (let i = 0; i < 6; i++) { set(ox + size / 2 + dir * (22 + i) * k, base - 1 - Math.sin(i / 2) * 5 * k, ramp[1]); }
  }
  if (motif === 'shine') {
    spark(sides[0], oy + size * 0.22, Math.round(4 * k));
    spark(sides[1], oy + size * 0.4, Math.round(3 * k), '#ffd23f');
    spark(ox + size * 0.72, oy + 2, Math.round(3 * k));
  }
  if (motif === 'moon') {
    const [cx, cy, r] = [ox + topX, oy + topY - 1 * k, 15 * k];
    paint(cx - r, cy - r, cx + r, cy + r, (x, y) => (x - cx) ** 2 + (y - cy) ** 2 < r * r && (x - cx - r * 0.5) ** 2 + (y - cy + r * 0.32) ** 2 > (r * 0.8) ** 2, (x, y) => (y < cy ? '#ffe36a' : '#f5bb3a'), '#a8681a');
    star(sides[0] - 3, oy + size * 0.56, 7 * k);
    spark(sides[1] + 3, oy + size * 0.6, Math.round(5 * k), '#ffd23f');
    for (const [x, r] of [[0.14, 10], [0.5, 8], [0.86, 10]]) round(ox + size * x, oy + size + 1 * k, r * k, (a, b) => (b < oy + size ? '#f6efff' : '#d9c4f4'), '#7a55c8', 0.72);
  }
  if (motif === 'speech') {
    const [x, y, w, h] = [ox + size * 0.76, oy + 2 * k, 17 * k, 11 * k];
    paint(x - w, y - h, x + w, y + h + 4, (a, b) => (Math.abs(a - x) < w && Math.abs(b - y) < h && !(Math.abs(a - x) > w - 2 && Math.abs(b - y) > h - 2)) || (b >= y + h && b < y + h + 4 * k && a > x - 6 * k && a < x - 6 * k + (y + h + 4 * k - b)), () => '#fdf8ef', edge);
    for (const i of [-1, 0, 1]) for (const dx of [0, 1]) for (const dy of [0, 1]) set(x + i * 7 * k + dx, y - 1 + dy, ramp[1]);
  }
  if (motif === 'heart') {
    const [x, y, r] = [sides[1] - 2, oy + 4 * k, 6 * k];
    paint(x - r * 2, y - r, x + r * 2, y + r * 2, (a, b) => (a - x + r * 0.8) ** 2 + (b - y) ** 2 < r * r || (a - x - r * 0.8) ** 2 + (b - y) ** 2 < r * r || (b >= y && Math.abs(a - x) < (y + r * 1.8 - b) * 0.98), () => '#ff6a8a', '#a82c5a');
    set(x - r * 0.9, y - r * 0.3, '#ffffff');
  }
  if (motif === 'star') { star(sides[1] - 1, oy + 5 * k, 7.5 * k); star(sides[0] + 2, oy + size * 0.56, 4.5 * k, '#fff0a0'); }
  if (motif === 'bloom') {
    const flower = (x: number, y: number, r: number) => {
      for (let i = 0; i < 5; i++) round(x + Math.cos(i * 1.257) * r, y + Math.sin(i * 1.257) * r, r * 0.85, '#fff4f4', '#d9568c');
      round(x, y, r * 0.6, '#ffd23f', '#d98a1f');
    };
    flower(sides[1] - 3, oy + 6 * k, 4 * k);
    flower(sides[0] + 3, oy + size * 0.6, 3 * k);
  }
  if (motif === 'speed') {
    for (const [y, w] of [[0.3, 12], [0.44, 16], [0.58, 10]]) for (let i = 0; i < w * k; i++) if (i % 5 < 3) set(sides[0] - 5 * k + i * 0.6, oy + size * y, ramp[3]);
    spark(sides[1], oy + size * 0.2, Math.round(3 * k), '#fff8d0');
  }

  const art = canvas(W, W);
  const g = art.getContext('2d')!;
  g.fillStyle = 'rgba(30,30,70,.2)';
  let lowest = 0;
  for (let c = 0; c < mask.length; c++) if (mask[c]) lowest = Math.floor(c / size);
  const shadowY = oy + lowest + 3 * k;
  g.fillRect(ox + size * 0.1, shadowY, size * 0.8, 2);
  g.fillRect(ox + size * 0.16, shadowY + 2, size * 0.68, 1);
  for (let y = 0; y < W; y++) for (let x = 0; x < W; x++) {
    const c = px[y * W + x];
    if (c) { g.fillStyle = c; g.fillRect(x, y, 1, 1); }
  }
  const made = { art, fx: faceX, fy: faceY, top: oy + topY, size, faceScale, seed };
  bodies.set(key, made);
  return made;
}

// Every kanji has its own personality, from a mix of eyes and mouths.
function face(o: CanvasRenderingContext2D, b: Body) {
  const k = (b.size / 72) * b.faceScale, n = (v: number) => Math.max(1, Math.round(v * k));
  const r = (c: string, x: number, y: number, w = 1, h = 1) => { o.fillStyle = c; o.fillRect(Math.round(x), Math.round(y), w, h); };
  const { fx, fy, seed } = b;
  const INK = '#1e2352';
  const eyes = (seed >> 3) % 4, mouth = seed % 7;
  const gap = n(9), ew = n(3.5), eh = eyes === 1 ? n(4) : n(7), ey = fy - n(eyes === 1 ? 5 : 7);
  for (const x of [fx - gap - Math.floor(ew / 2), fx + gap - Math.floor(ew / 2)]) {
    r(INK, x + (ew > 2 ? 1 : 0), ey, Math.max(1, ew - (ew > 2 ? 2 : 0)), eh);
    r(INK, x, ey + 1, ew, Math.max(1, eh - 2));
    r('#ffffff', x + (ew > 2 ? 1 : 0), ey + 1, n(1.4), n(2));
    if (eyes === 2) r(INK, x - 1, ey - 1, ew + 2, n(2));
    if (eyes === 3) { const inward = x < fx ? 1 : -1; r(INK, x + inward, ey - n(3), ew, n(1.2)); }
  }
  for (const x of [fx - gap - n(11), fx + gap + n(4)]) {
    const [w, h] = [n(7), n(3)];
    r('#ff94a4', x + 1, fy + n(1), Math.max(1, w - 2), h);
    r('#ff94a4', x, fy + n(1) + 1, w, Math.max(1, h - 2));
  }
  const my = fy + n(1);
  if (mouth <= 1) {
    // A wide open smile, flat on top and curved along the bottom.
    const mw = n(8), mh = n(6), flat = Math.ceil(mh * 0.3);
    const span = (y: number, inset: number) => { const t = y <= flat ? 0 : (y - flat) / (mh - flat); return Math.round((mw / 2) * Math.sqrt(Math.max(0, 1 - t * t))) - inset; };
    for (let y = 0; y <= mh; y++) { const w = span(y, 0); if (w > 0) r(INK, fx - w, my + y, w * 2, 1); }
    for (let y = 1; y < mh; y++) {
      const w = span(y, 1);
      if (w > 0) r(y > mh * 0.5 ? '#ff9aa8' : '#c8283e', fx - w, my + y, w * 2, 1);
    }
  } else if (mouth === 2) { // A small closed smile.
    r(INK, fx - n(3), my, n(1.4), n(2)); r(INK, fx - n(2), my + n(1.4), n(4), n(1.4)); r(INK, fx + n(2), my, n(1.4), n(2));
  } else if (mouth === 3) { // Calm.
    r(INK, fx - n(2.5), my + n(1), n(5), n(1.4));
  } else if (mouth === 4) { // Surprised.
    r(INK, fx - n(2), my, n(4), n(5)); r(INK, fx - n(3), my + 1, n(6), n(3)); r('#c8283e', fx - n(1.4), my + n(1.4), n(3), n(2.4));
  } else if (mouth === 5) { // Unimpressed.
    r(INK, fx - n(3), my + n(2), n(1.4), n(1.4)); r(INK, fx - n(2), my + n(1), n(4), n(1.4)); r(INK, fx + n(2), my + n(2), n(1.4), n(1.4));
  } else { // A sideways smirk.
    r(INK, fx - n(2), my + n(1.4), n(5), n(1.4)); r(INK, fx + n(2.6), my, n(1.4), n(2));
  }
}

const sprites = new Map<string, HTMLCanvasElement>();

// Your own kanji is seen from behind in battle, so its back view has no face.
export function kanjiSprite(s: Species, size = 72, back = false) {
  const key = `${s.k}${size}${back}`;
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
