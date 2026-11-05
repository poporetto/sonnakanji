import { canvas, hash, OUTLINE } from './sprites';

const T = 16;

const noise = (x: number, y: number) => {
  const xi = Math.floor(x), yi = Math.floor(y);
  const sx = (x - xi) ** 2 * (3 - 2 * (x - xi)), sy = (y - yi) ** 2 * (3 - 2 * (y - yi));
  const a = hash(xi, yi), b = hash(xi + 1, yi), c = hash(xi, yi + 1), d = hash(xi + 1, yi + 1);
  return a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy;
};
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => (v + 0.5) / 16);
const bayer = (x: number, y: number) => BAYER[(y & 3) * 4 + (x & 3)];
const rgb = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));

// Each area has its own light: fresh spring, ripe summer and cool highland.
const GRASS: Record<string, string[]> = {
  village: ['#4f9e5a', '#68b862', '#82cc6c', '#a4dc7c'],
  fields: ['#6a9e48', '#8ab552', '#a8c95e', '#c8dc74'],
  pass: ['#3f7f62', '#57966a', '#74ad78', '#94c288'],
  kawabe: ['#4a9a6a', '#62b470', '#7cc87a', '#a0dc8c'],
  forest: ['#2c6a58', '#3f8460', '#559c68', '#74b478'],
  onsen: ['#5f8a5a', '#78a260', '#92b86c', '#b0cc80'],
  castle: ['#7a9448', '#94ac52', '#aec060', '#ccd47c'],
};
const FLOWERS: Record<string, string[]> = { village: ['#fff4f4', '#f7a8c4'], fields: ['#fff0a0', '#ffffff'], pass: ['#c8c8ff', '#ffffff'], kawabe: ['#ffffff', '#ffd23f'], forest: ['#c8e8c8', '#ffffff'], onsen: ['#ffd0a0', '#ffffff'], castle: ['#f4c060', '#ffffff'] };
const SAND = ['#b08f5e', '#d2b27a', '#e4cb96', '#f1deb2'];
const WATER = ['#2c6ea8', '#3c8fc8', '#54ace0', '#8ad4ee', '#dcf6f6'];
const ROCK = ['#3e3d55', '#5a5a70', '#7b7b8c', '#9c9ca6', '#bfc2b8'];

type Kind = 0 | 1 | 2 | 3 | 4;
const GROUND = 0, PATH = 1, POND = 2, PADDY = 3, STONE = 4;
const kindOf = (c: string): Kind => (c === ',' || c === 't' || c === 's' || c === 'C' || c === 'Q' ? PATH : c === '~' ? POND : c === 'r' ? PADDY : c === 'P' ? STONE : GROUND);

function tree(pink: boolean, seed: number) {
  const W = 30, H = 34;
  const c = canvas(W, H);
  const g = c.getContext('2d')!;
  const ramp = (pink ? ['#a84f7a', '#d9779c', '#f4a8c0', '#ffcfdc', '#fff0f2'] : ['#163f44', '#1f5f50', '#2f7f58', '#55a564', '#93cc78']).map(rgb);
  const blobs = pink
    ? [[8, 16, 8, 7], [22, 17, 7, 7], [15, 19, 12, 7], [15, 10, 12, 9]]
    : [[15, 22, 13, 7], [15, 15, 11, 7], [15, 8, 8, 7]];
  const img = g.createImageData(W, H);
  const mask = new Uint8Array(W * H);
  const put = (x: number, y: number, v: number[]) => {
    const i = (y * W + x) * 4;
    img.data[i] = v[0]; img.data[i + 1] = v[1]; img.data[i + 2] = v[2]; img.data[i + 3] = 255;
  };
  for (const [bx, by, rx, ry] of blobs) for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const nx = (x - bx) / rx, ny = (y - by) / ry;
    const wob = (noise(x / 3 + seed * 7, y / 3) - 0.5) * 0.5;
    if (nx * nx + ny * ny > 1 + wob) continue;
    const lum = 0.5 - nx * 0.25 - ny * 0.42 + (noise(x / 2.3 + seed, y / 2.3) - 0.5) * 0.7 + (bayer(x, y) - 0.5) * 0.18;
    put(x, y, ramp[Math.max(0, Math.min(4, Math.floor(lum * 5)))]);
    mask[y * W + x] = 1;
  }
  const on = (x: number, y: number) => x >= 0 && y >= 0 && x < W && y < H && mask[y * W + x] === 1;
  const outline = rgb(pink ? '#6e2f5c' : '#10282f');
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (!on(x, y) && (on(x + 1, y) || on(x - 1, y) || on(x, y + 1) || on(x, y - 1))) put(x, y, outline);
  }
  g.fillStyle = 'rgba(30,30,70,.3)'; g.fillRect(6, 30, 18, 3); g.fillRect(8, 33, 14, 1);
  g.fillStyle = OUTLINE; g.fillRect(11, 25, 8, 8);
  g.fillStyle = '#7a5230'; g.fillRect(12, 25, 6, 7);
  g.fillStyle = '#54382a'; g.fillRect(15, 25, 3, 7);
  g.fillStyle = '#9c7048'; g.fillRect(13, 27, 1, 3);
  const top = canvas(W, H);
  const t = top.getContext('2d')!;
  t.putImageData(img, 0, 0);
  g.drawImage(top, 0, 0);
  return c;
}

const roofs = { indigo: ['#28304e', '#3d4a72', '#5a6c9a', '#8ca2c8'], charcoal: ['#2c2a38', '#454454', '#65647a', '#9090a4'] };

function house(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, ramp: string[], dojo = false) {
  const r = (c: string, a: number, b: number, rw: number, rh: number) => { g.fillStyle = c; g.fillRect(x + a, y + b, rw, rh); };
  const roofH = h - 20, wallY = roofH - 2;
  r('rgba(30,30,70,.3)', 1, h, w + 3, 3);
  // Plaster walls framed in dark timber.
  r(OUTLINE, 3, wallY, w - 6, h - wallY);
  r('#f0e4cc', 4, wallY, w - 8, h - wallY - 1);
  r('#d9c8ac', 4, wallY, w - 8, 3);
  r('#8d8796', 4, h - 4, w - 8, 3); r('#b0abb4', 4, h - 4, w - 8, 1);
  for (let i = 4; i < w - 4; i += 14) { r('#54382a', i, wallY, 2, h - wallY - 4); r('#7a5230', i, wallY, 1, h - wallY - 4); }
  r('#54382a', w - 6, wallY, 2, h - wallY - 4);
  r('#54382a', 4, wallY + 7, w - 8, 1);
  // Paper windows with a wooden lattice.
  for (const wx of [8, w - 19]) {
    r(OUTLINE, wx - 1, wallY + 9, 13, 8);
    r('#fff0bc', wx, wallY + 10, 11, 6); r('#ffdf94', wx, wallY + 14, 11, 2);
    for (let i = 3; i < 11; i += 4) r('#7a5230', wx + i, wallY + 10, 1, 6);
    r('#7a5230', wx, wallY + 12, 11, 1);
  }
  // Doorway with a split noren.
  const dx = Math.floor(w / 2) - 7;
  r(OUTLINE, dx - 1, wallY + 7, 16, h - wallY - 7);
  r('#3a2a30', dx, wallY + 8, 14, h - wallY - 8);
  const noren = dojo ? ['#c23a32', '#e8625a', '#8c1f28'] : ['#2f4f9e', '#4466aa', '#1e3470'];
  r(noren[0], dx, wallY + 8, 14, 7); r(noren[1], dx, wallY + 8, 14, 1); r(noren[2], dx, wallY + 14, 14, 1);
  r(OUTLINE, dx + 6, wallY + 9, 2, 6);
  r('#f6f1e2', dx + 2, wallY + 10, 2, 2); r('#f6f1e2', dx + 10, wallY + 10, 2, 2);
  // Kawara tiles: columns of rounded channels, stepped row by row.
  for (let py = 0; py < roofH; py++) {
    const inset = Math.round((roofH - 1 - py) * 0.32) - 3;
    for (let px = inset; px < w - inset; px++) {
      const row = py >> 2, cx = (px + (row & 1) * 2) & 3, cy = py & 3;
      let i = cx === 0 ? 0 : cx === 1 ? 2 : cx === 2 ? 1 : 1;
      if (cy === 3) i = 0;
      if (cy === 0 && cx === 1) i = 3;
      if (py < 3 && i > 0) i--;
      r(ramp[i], px, py, 1, 1);
    }
    r(OUTLINE, inset - 1, py, 1, 1); r(OUTLINE, w - inset, py, 1, 1);
  }
  const top = Math.round((roofH - 1) * 0.32) - 3;
  r(OUTLINE, top - 2, -3, w - top * 2 + 4, 4); r(ramp[1], top - 1, -2, w - top * 2 + 2, 2); r(ramp[3], top - 1, -2, w - top * 2 + 2, 1);
  r(OUTLINE, top - 4, -5, 4, 5); r(OUTLINE, w - top, -5, 4, 5); r(ramp[2], top - 3, -4, 2, 3); r(ramp[2], w - top + 1, -4, 2, 3);
  r(OUTLINE, -3, roofH - 1, w + 6, 2); r(ramp[0], -2, roofH - 1, w + 4, 1);
  r('rgba(30,30,70,.35)', 4, roofH + 1, w - 8, 2);
}

function castle(g: CanvasRenderingContext2D, x: number, y: number) {
  const r = (c: string, a: number, b: number, w: number, h: number) => { g.fillStyle = c; g.fillRect(x + a, y + b, w, h); };
  r('rgba(30,30,70,.3)', 0, 96, 128, 4);
  // Sloped stone base.
  for (let py = 56; py < 96; py++) {
    const inset = Math.round((96 - py) * 0.3);
    for (let px = inset; px < 128 - inset; px++) {
      const row = py >> 2, joint = py % 4 === 3 || (px + (row & 1) * 4) % 8 === 0;
      r(joint ? '#5a5a70' : hash(px >> 3, row) < 0.4 ? '#9c9ca6' : '#8a8a96', px, py, 1, 1);
    }
    r(OUTLINE, inset - 1, py, 1, 1); r(OUTLINE, 128 - inset, py, 1, 1);
  }
  r('#2b2036', 54, 72, 20, 24); r(OUTLINE, 52, 70, 24, 2); r('#54382a', 56, 74, 16, 22); r('#7a5230', 63, 74, 2, 22);
  // Three white tiers under dark roofs, with gold at the ridge.
  const tier = (top: number, w: number, h: number) => {
    const left = 64 - w / 2;
    r(OUTLINE, left, top, w, h); r('#f6f1e2', left + 1, top, w - 2, h - 1); r('#d9d2c8', left + 1, top, w - 2, 2);
    for (let i = left + 7; i < left + w - 8; i += 12) { r(OUTLINE, i, top + 5, 6, h - 9); r('#3a3048', i + 1, top + 6, 4, h - 11); }
    for (let py = 0; py < 9; py++) {
      const inset = 8 - py;
      const ex = left - 6 + inset, ew = w + 12 - inset * 2;
      r(OUTLINE, ex - 1, top - 9 + py, ew + 2, 1);
      for (let px = 0; px < ew; px++) r(roofs.indigo[px % 4 === 0 ? 0 : py < 2 ? 1 : 2], ex + px, top - 9 + py, 1, 1);
    }
    r(OUTLINE, left - 8, top - 1, w + 16, 2);
  };
  tier(44, 96, 14); tier(26, 72, 12); tier(10, 46, 10);
  r(OUTLINE, 44, -2, 40, 4); r('#ffd23f', 45, -1, 38, 2); r('#fff0a0', 45, -1, 38, 1);
}

// The 6-7 Kombini: a flat-roofed shop with a lit sign and a glass front.
function kombini(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  const r = (c: string, a: number, b: number, rw: number, rh: number) => { g.fillStyle = c; g.fillRect(x + a, y + b, rw, rh); };
  r('rgba(30,30,70,.3)', 1, h, w + 2, 3);
  r(OUTLINE, 0, 0, w, h);
  r('#f6f8fb', 1, 1, w - 2, h - 2);
  // Roof edge and sign band.
  r('#c8d0da', 1, 1, w - 2, 3);
  r('#2f6fd0', 1, 4, w - 2, 14); r('#5a94e8', 1, 4, w - 2, 1);
  r('#ffd23f', 1, 18, w - 2, 2);
  // "6-7" in chunky pixels.
  const glyphs: Record<string, string[]> = { 6: ['###', '#..', '###', '#.#', '###'], '-': ['...', '...', '###', '...', '...'], 7: ['###', '..#', '.#.', '.#.', '.#.'] };
  [...'6-7'].forEach((ch, i) => glyphs[ch].forEach((row, py) => [...row].forEach((on, px) => {
    if (on === '#') r('#ffffff', Math.floor(w / 2) - 13 + i * 9 + px * 2, 6 + py * 2, 2, 2);
  })));
  // Glass front with shelves showing through, either side of sliding doors.
  const top = 21, tall = h - top - 3, door = 18, dx = Math.floor((w - door) / 2);
  for (const [a, b] of [[3, dx - 4], [dx + door + 1, w - dx - door - 4]]) {
    r(OUTLINE, a - 1, top - 1, b + 2, tall + 2);
    r('#cfeefc', a, top, b, tall);
    r('#ffffff', a + 1, top + 1, 2, tall - 2);
    for (let row = top + 3; row < top + tall - 2; row += 6) {
      r('#8d97a8', a, row + 4, b, 1);
      for (let i = 3; i < b - 1; i += 3) { g.fillStyle = ['#e0483e', '#ffd23f', '#74bf48', '#ff8ab0'][(i + row) % 4]; g.fillRect(x + a + i, y + row, 2, 4); }
    }
  }
  r(OUTLINE, dx - 1, top - 1, door + 2, h - top);
  r('#bfeaff', dx, top, door, h - top - 2);
  r('#ffffff', dx + 2, top + 2, 2, 12);
  r('#ffffff', dx + 11, top + 2, 2, 12);
  r('#6a7486', dx + 8, top, 2, h - top - 2);
  r('#8d97a8', 1, h - 3, w - 2, 2);
}

function sign(g: CanvasRenderingContext2D, x: number, y: number) {
  const r = (c: string, a: number, b: number, w: number, h: number) => { g.fillStyle = c; g.fillRect(x + a, y + b, w, h); };
  r('rgba(30,30,70,.3)', 2, 13, 12, 3);
  r(OUTLINE, 6, 8, 4, 8); r('#7a5230', 7, 8, 2, 7);
  r(OUTLINE, 1, 1, 14, 10); r('#d9b078', 2, 2, 12, 8); r('#f1deb2', 2, 2, 12, 1); r('#a87848', 2, 9, 12, 1);
}

function shrine(g: CanvasRenderingContext2D, x: number, y: number) {
  const r = (c: string, a: number, b: number, w: number, h: number) => { g.fillStyle = c; g.fillRect(x + a, y + b, w, h); };
  r('rgba(30,30,70,.25)', -2, 32, 52, 2);
  r(OUTLINE, 4, 12, 40, 21); r('#3a2a30', 5, 13, 38, 19); r('#52363a', 16, 13, 16, 19);
  for (const px of [6, 21, 25, 40]) { r('#d6332a', px, 12, 3, 20); r('#f0645a', px, 12, 1, 20); r('#8c1f28', px + 2, 12, 1, 20); }
  // Copper-green roof with upswept ends.
  const G = ['#1f5f5c', '#2f8a7a', '#55b89a', '#9fe0c0'];
  for (let py = 0; py < 13; py++) {
    const inset = Math.round(9 - py * 0.9 + (py > 9 ? (py - 9) * -1.2 : 0));
    for (let px = inset; px < 48 - inset; px++) {
      const c = px % 4 === 0 ? 0 : px % 4 === 1 ? 2 : 1;
      r(G[py < 2 && c ? c - 1 : c], px, py - 8, 1, 1);
    }
    r(OUTLINE, inset - 1, py - 8, 1, 1); r(OUTLINE, 48 - inset, py - 8, 1, 1);
  }
  r(OUTLINE, -4, 5, 56, 2); r(G[0], -3, 5, 54, 1);
  r(OUTLINE, -5, 2, 3, 4); r(OUTLINE, 50, 2, 3, 4);
  r(OUTLINE, 6, -10, 36, 3); r('#7a5230', 7, -9, 34, 1);
  // Sacred rope and paper streamers.
  for (let i = 0; i < 36; i++) { const sag = Math.round(Math.sin((i / 35) * Math.PI) * 3); r(OUTLINE, 6 + i, 12 + sag, 1, 3); r('#e8d49a', 6 + i, 12 + sag, 1, 2); if (i % 3 === 0) r('#b89a5a', 6 + i, 13 + sag, 1, 1); }
  for (const px of [12, 23, 34]) { r('#ffffff', px, 16, 2, 4); r('#c9c2d0', px + 1, 18, 2, 3); }
  // Offering box.
  r(OUTLINE, 17, 24, 14, 8); r('#7a5230', 18, 25, 12, 6); r('#54382a', 18, 27, 12, 1); r('#54382a', 18, 29, 12, 1); r('#a87848', 18, 25, 12, 1);
}

function torii(base: CanvasRenderingContext2D, fg: CanvasRenderingContext2D, x: number, y: number) {
  for (const [g, parts] of [[base, 'pillars'], [fg, 'beams']] as const) {
    const r = (c: string, a: number, b: number, w: number, h: number) => { g.fillStyle = c; g.fillRect(x + a, y + b, w, h); };
    if (parts === 'pillars') {
      for (const px of [5, 37]) {
        r('rgba(30,30,70,.3)', px, 15, 9, 2);
        r(OUTLINE, px, -24, 6, 39); r('#d6332a', px + 1, -24, 4, 38); r('#f0645a', px + 1, -24, 1, 38); r('#8c1f28', px + 4, -24, 1, 38);
        r(OUTLINE, px - 1, 10, 8, 6); r('#3a3048', px, 11, 6, 4);
      }
    } else {
      r(OUTLINE, -2, -26, 52, 7); r('#2f2433', -1, -25, 50, 5); r('#4d3f55', -1, -25, 50, 1);
      r(OUTLINE, -4, -29, 4, 5); r(OUTLINE, 48, -29, 4, 5); r('#2f2433', -3, -28, 3, 3); r('#2f2433', 48, -28, 3, 3);
      r(OUTLINE, 2, -18, 44, 5); r('#d6332a', 3, -17, 42, 3); r('#f0645a', 3, -17, 42, 1);
      r(OUTLINE, 21, -22, 6, 6); r('#ffd23f', 22, -21, 4, 4);
    }
  }
}

export interface Scene { base: HTMLCanvasElement; fg: HTMLCanvasElement; shimmer: [number, number][] }
const scenes = new Map<string, Scene>();

// Colourful packets for konbini shelves.
const PACKETS = ['#e0483e', '#ffd23f', '#4aa6ee', '#74bf48', '#ff8ab0', '#f4983e', '#a884ea'];

function paintKonbini(g: CanvasRenderingContext2D, c: string, px: number, py: number, x: number, y: number, ch: (x: number, y: number) => string) {
  const r = (colour: string, a: number, b: number, w = 1, h = 1) => { g.fillStyle = colour; g.fillRect(px + a, py + b, w, h); };
  const pack = (a: number, b: number, w: number, h: number, seed: number) => {
    for (let i = 0; i < w; i += 3) { r(PACKETS[Math.floor(hash(seed, x * 7 + i + y) * PACKETS.length)], a + i, b, 2, h); r('#ffffff', a + i, b, 1, 1); }
  };
  // Bright tiled floor under everything.
  r((x + y) % 2 ? '#eef1f4' : '#dde3ea', 0, 0, T, T);
  r('#c8d0da', 0, 15, T, 1); r('#c8d0da', 15, 0, 1, T);
  r('#ffffff', 2, 2, 3, 1);
  if (c === 'j') {
    // Drinks fridge: steel frame, lit glass and rows of bottles.
    r(OUTLINE, 0, -9, T, 25); r('#8d97a8', 1, -8, 14, 23); r('#cfeefc', 2, -7, 12, 20);
    for (const row of [-6, 0, 6]) {
      r('#6a7486', 2, row + 6, 12, 1);
      for (let i = 0; i < 4; i++) { const col = PACKETS[Math.floor(hash(x + i, row + 30) * PACKETS.length)]; r(col, 3 + i * 3, row + 1, 2, 5); r('#ffffff', 3 + i * 3, row, 1, 1); }
    }
    r('#ffffff', 3, -6, 1, 16);
  }
  if (c === 'e' || c === 'h') {
    // A rack running front to back, seen from above: goods on both sides of a central spine.
    const first = ch(x, y - 1) !== c, last = ch(x, y + 1) !== c;
    r('rgba(30,30,70,.18)', 3, last ? 14 : 0, 12, last ? 2 : T);
    r('#6a7486', 2, first ? 1 : 0, 12, (first ? 15 : T) - (last ? 2 : 0));
    r('#e8ecf2', 3, first ? 2 : 0, 10, (first ? 14 : T) - (last ? 3 : 0));
    r('#8d97a8', 7, first ? 2 : 0, 2, (first ? 14 : T) - (last ? 3 : 0));
    for (let row = first ? 3 : 1; row < (last ? 12 : T - 1); row += 4) for (const side of [4, 10]) {
      const col = PACKETS[Math.floor(hash(x * 5 + side, y * 9 + row) * PACKETS.length)];
      if (c === 'e') { r(col, side - 1, row, 3, 3); r('#ffffff', side - 1, row, 3, 1); }
      else { r('#ffffff', side - 1, row, 3, 1); r(col, side - 1, row + 1, 3, 2); }
    }
  }
  if (c === 'p') {
    // Wall shelves behind the counter, stacked with boxes of goods.
    r(OUTLINE, 0, -9, T, 25); r('#a87848', 0, -8, T, 23); r('#d9b078', 0, -8, T, 1);
    for (const row of [-7, -1, 5]) {
      r('#7a5230', 0, row + 5, T, 1);
      for (let i = 1; i < T - 1; i += 3) { const col = PACKETS[Math.floor(hash(x * 3 + i, row + 40) * PACKETS.length)]; r(col, i, row, 2, 5); r('#ffffff', i, row, 2, 1); }
    }
  }
  if (c === 'i') {
    // Magazine rack.
    r(OUTLINE, 0, -6, T, 22); r('#a87848', 1, -5, 14, 20);
    for (const row of [-4, 3, 10]) for (let i = 0; i < 2; i++) {
      const col = PACKETS[Math.floor(hash(x * 3 + i, row + 9) * PACKETS.length)];
      r('#ffffff', 2 + i * 7, row, 5, 6); r(col, 2 + i * 7, row, 5, 3); r('#3a3048', 3 + i * 7, row + 4, 3, 1);
    }
  }
  if (c === 'x' || c === 'y') {
    // The checkout counter: wooden top with a white front and a store stripe.
    const left = ch(x - 1, y) !== 'x' && ch(x - 1, y) !== 'y', right = ch(x + 1, y) !== 'x' && ch(x + 1, y) !== 'y';
    r(OUTLINE, 0, 0, T, T);
    r('#d9b078', left ? 1 : 0, 1, T - (left ? 1 : 0) - (right ? 1 : 0), 6); r('#f1deb2', left ? 1 : 0, 1, T - (left ? 1 : 0) - (right ? 1 : 0), 2);
    r('#f6f8fb', left ? 1 : 0, 8, T - (left ? 1 : 0) - (right ? 1 : 0), 7);
    r('#2f6fd0', left ? 1 : 0, 9, T - (left ? 1 : 0) - (right ? 1 : 0), 2); r('#ffd23f', left ? 1 : 0, 11, T - (left ? 1 : 0) - (right ? 1 : 0), 1);
  }
  if (c === 'y') {
    // The register, with a small green screen.
    r(OUTLINE, 3, -6, 10, 11); r('#6a7486', 4, -5, 8, 9); r('#7fe0a8', 5, -4, 6, 3); r('#3a3048', 5, 0, 6, 1); r('#3a3048', 5, 2, 6, 1);
  }
  if (c === 'x' && x % 2) { r('#ffffff', 5, 2, 5, 3); r('#ff8ab0', 5, 2, 5, 1); }
}

function paintRoom(rows: string[], konbini = false): Scene {
  const base = canvas(24 * T, 16 * T);
  const g = base.getContext('2d')!;
  const r = (c: string, x: number, y: number, w = 1, h = 1) => { g.fillStyle = c; g.fillRect(x, y, w, h); };
  const ch = (x: number, y: number) => rows[y]?.[x] ?? 'V';
  const under = (c: string) => 'cbo'.includes(c);
  for (let y = 0; y < 16; y++) for (let x = 0; x < 24; x++) {
    const c = ch(x, y), px = x * T, py = y * T;
    if (c === 'V') { r('#14162e', px, py, T, T); continue; }
    if (konbini && 'qjexyihp'.includes(c)) { paintKonbini(g, c, px, py, x, y, ch); continue; }
    if (konbini && (c === 'w' || c === 'd') && y < 9) {
      if (y === 0 || x === 0 || x === 14) { r('#3a3f5c', px, py, T, T); r('#4a5070', px, py, T, 2); continue; }
      // Bright wall with the shop's green and orange stripes.
      r('#f6f8fb', px, py, T, T); r('#2f6fd0', px, py + 3, T, 3); r('#ffd23f', px, py + 6, T, 1); r('#c8d0da', px, py + 14, T, 2);
      continue;
    }
    if (konbini && c === 'd') {
      // Automatic glass doors.
      r('#3a3f5c', px, py, T, T); r('#bfeaff', px + 1, py, 14, T); r('#ffffff', px + 3, py + 2, 2, 8); r('#6a7486', px + 7, py, 2, T);
      continue;
    }
    const floor = under(c) ? (ch(x, y + 1) === 'm' || ch(x - 1, y) === 'm' ? 'm' : 'f') : c;
    if (floor === 'm' || floor === 'u') {
      // Tatami: fine woven rows, with a dark cloth edge every three tiles.
      r('#c4c282', px, py, T, T);
      for (let i = 0; i < T; i += 2) r(i % 4 ? '#b6b474' : '#d0ce92', px, py + i, T, 1);
      if (y % 3 === 2) { r('#3f6a54', px, py + 14, T, 2); r('#2c4f40', px, py + 15, T, 1); }
    } else if (floor === 'f') {
      r('#b9854f', px, py, T, T);
      for (let i = 0; i < T; i += 5) { r('#8a5c34', px, py + i + 4, T, 1); r('#cf9c64', px, py + i, T, 1); }
      r('#8a5c34', px + ((x * 5 + y * 3) % 7) * 2, py, 1, 4);
    }
    if (c === 'w' || c === 'n') {
      if (rows[y + 1]?.[x] && !'wnV'.includes(ch(x, y + 1)) && y < 8) {
        r('#f0e4cc', px, py, T, T); r('#d9c8ac', px, py, T, 4); r('#b8a688', px, py + 13, T, 3);
        r('#54382a', px, py + 14, T, 2);
        if (x % 3 === 0) { r('#54382a', px, py, 2, T); r('#7a5230', px, py, 1, T); }
      } else if (y > 0 && y < 9 && (x === 0 || x === 14) === false && c === 'n') {
        r('#f0e4cc', px, py, T, T); r('#d9c8ac', px, py, T, 4); r('#b8a688', px, py + 13, T, 3); r('#54382a', px, py + 14, T, 2);
      } else {
        r('#2b2036', px, py, T, T); r('#3a2d48', px, py, T, 2);
      }
      if (y === 1 && c !== 'n' && !'wV'.includes(ch(x, 2))) { r('#f0e4cc', px, py, T, T); r('#d9c8ac', px, py, T, 4); r('#b8a688', px, py + 13, T, 3); r('#54382a', px, py + 14, T, 2); if (x % 3 === 0) { r('#54382a', px, py, 2, T); r('#7a5230', px, py, 1, T); } }
      if (c === 'n') {
        // Hanging scroll with a brushed mark.
        r(OUTLINE, px + 3, py + 1, 10, 13); r('#fdf8ef', px + 4, py + 2, 8, 11); r('#7a5230', px + 3, py + 1, 10, 2); r('#7a5230', px + 3, py + 12, 10, 2);
        r(OUTLINE, px + 7, py + 4, 2, 7); r(OUTLINE, px + 5, py + 6, 6, 1); r(OUTLINE, px + 5, py + 9, 6, 1);
      }
    }
    if (c === 'd') {
      r('#2b2036', px, py, T, T); r('#d9c8ac', px + 1, py, 14, T); r('#f4ead0', px + 2, py + 2, 12, 12);
      r('#7a5230', px + 7, py, 2, T);
    }
    if (c === 'u') {
      r(OUTLINE, px, py, T, T); r('#f6f1e2', px + (ch(x - 1, y) === 'u' ? 0 : 1), py + 1, 15, 14);
      if (ch(x, y + 1) !== 'u') { r('#6f8fc8', px + (ch(x - 1, y) === 'u' ? 0 : 1), py + 3, 15, 12); r('#90b0e0', px + (ch(x - 1, y) === 'u' ? 0 : 1), py + 3, 15, 2); }
    }
    if (c === 'c') {
      r('rgba(30,30,70,.3)', px, py + 14, T, 2);
      r(OUTLINE, px, py - 6, T, 20); r('#8a5c34', px + 1, py - 5, 14, 18); r('#a87848', px + 1, py - 5, 14, 2);
      for (const i of [-1, 5]) { r('#54382a', px + 2, py + i, 12, 5); r('#b58a56', px + 3, py + i, 10, 4); r('#ffd23f', px + 7, py + i + 1, 2, 2); }
    }
    if (c === 'b') {
      const left = ch(x - 1, y) !== 'b', top = ch(x, y - 1) !== 'b';
      r('#6e4628', px, py + (top ? 3 : 0), T, top ? 13 : T);
      r('#94663c', px + (left ? 1 : 0), py + (top ? 4 : 0), left ? 15 : 14, top ? 11 : 10);
      if (top) r('#b58a56', px + (left ? 1 : 0), py + 4, left ? 15 : 14, 1);
      if (!top) r('#54382a', px, py + 11, T, 3);
    }
    if (c === 'o') {
      r('rgba(30,30,70,.3)', px + 2, py + 13, 12, 3);
      r(OUTLINE, px + 1, py + 8, 14, 6); r('#a02f36', px + 2, py + 9, 12, 3); r('#d9534f', px + 2, py + 9, 12, 1);
    }
  }
  return { base, fg: canvas(24 * T, 16 * T), shimmer: [] };
}

export function paintMap(id: string, rows: string[]): Scene {
  const hit = scenes.get(id);
  if (hit) return hit;
  if (!GRASS[id]) {
    const scene = paintRoom(rows, id.startsWith('shop-'));
    scenes.set(id, scene);
    return scene;
  }
  const across = rows[0].length, down = rows.length;
  const W = across * T, H = down * T;
  const base = canvas(W, H), fg = canvas(W, H);
  const b = base.getContext('2d')!, f = fg.getContext('2d')!;
  const ch = (x: number, y: number) => rows[Math.max(0, Math.min(down - 1, y))]?.[Math.max(0, Math.min(across - 1, x))] ?? 'T';

  // Terrain boundaries are nudged by noise, so ponds and paths get soft natural edges rather than squares.
  const kinds = new Uint8Array(W * H);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const raw = kindOf(ch(x >> 4, y >> 4));
    const wx = Math.round((noise(x / 7, y / 7) - 0.5) * 5), wy = Math.round((noise(x / 7 + 9, y / 7 + 4) - 0.5) * 5);
    const near = kindOf(ch((x + wx) >> 4, (y + wy) >> 4));
    kinds[y * W + x] = raw === STONE || near === STONE ? raw : near;
  }
  const k = (x: number, y: number) => kinds[Math.max(0, Math.min(H - 1, y)) * W + Math.max(0, Math.min(W - 1, x))];
  const edge = (x: number, y: number, kind: number, d: number) => k(x + d, y) !== kind || k(x - d, y) !== kind || k(x, y + d) !== kind || k(x, y - d) !== kind;

  const grass = GRASS[id].map(rgb), sand = SAND.map(rgb), water = WATER.map(rgb), rock = ROCK.map(rgb);
  const soil = rgb('#8a6a42'), paddy = ['#6fb0a0', '#8cc8b0', '#b4e0cc'].map(rgb);
  const img = b.createImageData(W, H);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const kind = k(x, y);
    let c = grass[1];
    if (kind === GROUND) {
      const v = noise(x / 13, y / 13) + (bayer(x, y) - 0.5) * 0.16;
      c = v < 0.42 ? grass[1] : v < 0.62 ? grass[2] : grass[2];
      if (v > 0.74 && (x + y) % 2) c = grass[3];
      if (hash(x >> 2, y >> 2) < 0.22 && x % 4 === 1 && y % 4 < 2) c = grass[0];
      if (hash((x >> 2) + 5, y >> 2) < 0.16 && x % 4 === 2 && y % 4 === 1) c = grass[3];
    } else if (kind === PATH) {
      const v = noise(x / 8, y / 8) + (bayer(x, y) - 0.5) * 0.2;
      c = v < 0.4 ? sand[1] : v < 0.68 ? sand[2] : sand[3];
      if (hash(x, y) < 0.025) c = sand[0];
      if (edge(x, y, PATH, 2)) c = sand[1];
      if (edge(x, y, PATH, 1)) c = sand[0];
    } else if (kind === POND) {
      const wave = Math.sin(x / 5 + Math.sin(y / 3) * 2 + y * 0.9);
      c = wave > 0.86 ? water[3] : noise(x / 16, y / 16) + (bayer(x, y) - 0.5) * 0.14 > 0.5 ? water[2] : water[1];
      if (edge(x, y, POND, 3)) c = water[3];
      if (edge(x, y, POND, 1)) c = water[4];
      if (k(x, y - 1) !== POND || k(x, y - 2) !== POND || k(x, y - 3) !== POND) c = water[0];
    } else if (kind === PADDY) {
      c = paddy[noise(x / 10, y / 7) + (bayer(x, y) - 0.5) * 0.2 > 0.5 ? 1 : 0];
      if (y % 7 === 3 && hash(x >> 3, y) < 0.5) c = paddy[2];
      if (edge(x, y, PADDY, 2)) c = soil;
    } else {
      let d = 0;
      while (d < 12 && ch(x >> 4, (y + d + 1) >> 4) === 'P') d++;
      if (d < 12) {
        // Cliff faces: vertical columns of rock, lit at the top and dark at the foot.
        const column = Math.floor(noise(x / 5, 2) * 5) + Math.floor(x / 5);
        const lip = 1 - d / 12 + (hash(column, 3) - 0.5) * 0.35;
        c = rock[Math.max(0, Math.min(3, Math.floor(lip * 4)))];
        if ((x + Math.floor(hash(column, 8) * 4)) % 5 === 0) c = rock[Math.max(0, Math.floor(lip * 3) - 1)];
        if (d === 11) c = rock[4];
      } else {
        const v = noise(x / 12, y / 12);
        c = v < 0.5 ? rock[2] : rock[3];
        if (v > 0.5 && v < 0.54) c = rock[1];
        if (noise(x / 9 + 3, y / 9) > 0.7) c = (x + y) % 2 ? grass[1] : grass[0];
      }
    }
    const i = (y * W + x) * 4;
    img.data[i] = c[0]; img.data[i + 1] = c[1]; img.data[i + 2] = c[2]; img.data[i + 3] = 255;
  }
  b.putImageData(img, 0, 0);

  const r = (c: string, x: number, y: number, w = 1, h = 1) => { b.fillStyle = c; b.fillRect(x, y, w, h); };
  const shimmer: [number, number][] = [];
  const pines = [0, 1, 2].map((s) => tree(false, s)), blossoms = [0, 1, 2].map((s) => tree(true, s));
  const [g0, , g2, g3] = GRASS[id];

  for (let y = 0; y < down; y++) for (let x = 0; x < across; x++) {
    const c = ch(x, y), px = x * T, py = y * T, seed = hash(x, y);
    if (c === '.' && seed < 0.1) {
      const [a, e] = FLOWERS[id];
      for (const [fx, fy] of [[3, 4], [10, 9], [6, 12]]) { r(a, px + fx, py + fy, 3, 1); r(a, px + fx + 1, py + fy - 1, 1, 3); r(e, px + fx + 1, py + fy, 1, 1); }
    }
    if (c === '"') {
      for (let i = 0; i < 11; i++) {
        const tx = px - 1 + Math.floor(hash(x * 3 + i, y) * 15), ty = py - 1 + Math.round((i / 10) * 12 + hash(x, y + i) * 3);
        const dark = noise((tx) / 11, ty / 11) < 0.5;
        const [low, mid, tip] = dark ? [g0, GRASS[id][1], g2] : [GRASS[id][1], g2, g3];
        r(low, tx, ty + 2, 5, 3);
        r(mid, tx, ty + 3, 1, 2); r(mid, tx + 2, ty + 1, 1, 4); r(mid, tx + 4, ty + 2, 1, 3);
        r(tip, tx + 2, ty, 1, 2); r(tip, tx + 4, ty + 1, 1, 1);
        r(g0, tx + 1, ty + 5, 1, 1); r(g0, tx + 3, ty + 5, 1, 1);
      }
    }
    if (c === 'r') {
      for (let ry = 2; ry < T; ry += 5) for (let rx = 1 + (ry % 2) * 2; rx < T; rx += 5) {
        r('#2c7a45', px + rx, py + ry + 1, 3, 2); r('#4faa4a', px + rx + 1, py + ry - 1, 1, 3); r('#93d05a', px + rx, py + ry, 1, 1); r('#93d05a', px + rx + 2, py + ry, 1, 1);
      }
    }
    if (c === '~' && ch(x - 1, y) === '~' && ch(x + 1, y) === '~' && ch(x, y - 1) === '~' && ch(x, y + 1) === '~') shimmer.push([px, py]);
    if (c === ',') {
      let a = x, e = x;
      while (ch(a, y) === ',' && a > 0) a--;
      while (ch(e, y) === ',' && e < across - 1) e++;
      if (ch(a, y) === '~' && ch(e, y) === '~') {
        for (let i = 0; i < T; i += 4) { r('#b58a56', px, py + i, T, 3); r('#d9b078', px, py + i, T, 1); r('#54382a', px, py + i + 3, T, 1); }
        if (ch(x - 1, y) === '~') { r(OUTLINE, px, py, 2, T); r('#7a5230', px, py, 1, T); }
        if (ch(x + 1, y) === '~') { r(OUTLINE, px + 14, py, 2, T); r('#7a5230', px + 15, py, 1, T); }
      }
    }
  }

  // Whatever rises above its own footprint can pass in front of the walker, but only the building itself, never the ground around it.
  const standing = (from: number, draw: (g: CanvasRenderingContext2D) => void) => {
    const layer = canvas(W, H);
    draw(layer.getContext('2d')!);
    b.drawImage(layer, 0, 0);
    f.save(); f.beginPath(); f.rect(0, 0, W, from); f.clip(); f.drawImage(layer, 0, 0); f.restore();
  };

  // Buildings are found as whole blocks, then painted as a single piece.
  const seen = new Set<string>();
  let houses = 0;
  for (let y = 0; y < down; y++) for (let x = 0; x < across; x++) {
    const c = ch(x, y);
    if (seen.has(`${x},${y}`)) continue;
    if (c === 'H' || c === 's' || c === 'Q') {
      const inBlock = (v: string) => (c === 's' ? v === 's' : c === 'Q' ? v === 'Q' : 'HWR'.includes(v));
      let w = 0, h = 0;
      while (inBlock(ch(x + w, y)) && x + w < across) w++;
      while (inBlock(ch(x, y + h)) && y + h < down) h++;
      for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) seen.add(`${x + i},${y + j}`);
      standing(y * T, (g) => {
        if (c === 's') shrine(g, x * T, y * T);
        else if (c === 'Q') kombini(g, x * T, y * T, w * T, h * T);
        else house(g, x * T, y * T, w * T, h * T, houses % 2 ? roofs.charcoal : roofs.indigo, id === 'village' && houses++ % 2 === 1);
      });
    }
    if (c === 't' && ch(x + 2, y) === 't') torii(b, f, x * T - 8, y * T);
    if (c === 'S') sign(b, x * T, y * T);
    if (c === 'C' && !seen.has('castle')) {
      seen.add('castle');
      standing(y * T, (g) => castle(g, x * T, y * T));
    }
  }

  // Trees run top to bottom so nearer ones overlap. Anything above a tree's own row can pass in front of the walker.
  for (let y = 0; y < down; y++) for (let x = 0; x < across; x++) {
    const c = ch(x, y);
    if (c !== 'T' && c !== 'K') continue;
    const seed = hash(x * 3, y * 7);
    const rim = x === 0 || y === 0 || x === across - 1 || y === down - 1;
    const pink = c === 'K' && !(rim && seed < 0.4);
    const art = (pink ? blossoms : pines)[Math.floor(seed * 3)];
    const dx = x * T - 7, dy = (y + 1) * T - 34;
    b.drawImage(art, dx, dy);
    f.save(); f.beginPath(); f.rect(dx, 0, 30, y * T); f.clip(); f.drawImage(art, dx, dy); f.restore();
  }

  const scene = { base, fg, shimmer };
  scenes.set(id, scene);
  return scene;
}

// ---- Battle and title backdrops
interface Sky { sky: string[]; hills: string[][]; ground: string[]; snow?: boolean; pad: string[] }
const SKIES: Record<string, Sky> = {
  village: { sky: ['#7cc4ee', '#a4dcf2', '#d0eef0', '#ffe9dc'], hills: [['#a4c8d8', '#bcd8dc'], ['#e8a8c4', '#f4c4d4']], ground: GRASS.village, pad: ['#4f9e5a', '#82cc6c', '#a4dc7c', '#d0eca0'] },
  fields: { sky: ['#66b8e8', '#9cd8ee', '#d4f0d8', '#fff4c0'], hills: [['#9cc4a8', '#b4d4b0'], ['#7fb068', '#98c474']], ground: GRASS.fields, pad: ['#6a9e48', '#a8c95e', '#c8dc74', '#e8ec98'] },
  pass: { sky: ['#5c78b8', '#8ca8d0', '#c0d4dc', '#f0e8d4'], hills: [['#7c88ac', '#98a4c0'], ['#4f7a78', '#648f84']], ground: GRASS.pass, snow: true, pad: ['#5a5a70', '#7b7b8c', '#9c9ca6', '#bfc2b8'] },
  kawabe: { sky: ['#70c0ec', '#a0dcf2', '#d4f0ec', '#fff0d0'], hills: [['#a4c8d8', '#bcd8dc'], ['#7cb890', '#94c89c']], ground: GRASS.kawabe, pad: ['#4a9a6a', '#7cc87a', '#a0dc8c', '#d0eca8'] },
  forest: { sky: ['#4f9cb8', '#7cc0c0', '#b0dcc0', '#e0ecc0'], hills: [['#2f7f6a', '#3f9070'], ['#1f5f50', '#2c6f5a']], ground: GRASS.forest, pad: ['#2c6a58', '#559c68', '#74b478', '#a0d090'] },
  onsen: { sky: ['#e08a7c', '#f0b090', '#f8d4a8', '#fff0cc'], hills: [['#a88aa0', '#c0a0ac'], ['#6f8a6a', '#88a070']], ground: GRASS.onsen, snow: true, pad: ['#5f8a5a', '#92b86c', '#b0cc80', '#dce4a0'] },
  castle: { sky: ['#6a7cc0', '#a090c8', '#e0a8b0', '#ffd8a8'], hills: [['#8078a8', '#9888b4'], ['#7a9448', '#94ac52']], ground: GRASS.castle, pad: ['#7a9448', '#aec060', '#ccd47c', '#ece8a0'] },
  title: { sky: ['#8fd4f4', '#b8e8f6', '#dcf5ee', '#fff3d6'], hills: [['#f4bcd0', '#fbd4e0'], ['#8fd07c', '#a8dc88']], ground: ['#5fae5a', '#78c468', '#94d67a', '#b4e48c'], pad: [] },
};

const backs = new Map<string, HTMLCanvasElement>();

export function backdrop(id: string) {
  const hit = backs.get(id);
  if (hit) return hit;
  const P = SKIES[id];
  const W = 240, H = 160, horizon = id === 'title' ? 104 : 78;
  const c = canvas(W, H);
  const g = c.getContext('2d')!;
  const img = g.createImageData(W, H);
  const sky = P.sky.map(rgb), ground = P.ground.map(rgb), hills = P.hills.map((h) => h.map(rgb));
  const cloud = rgb('#ffffff'), cloudLow = rgb(id === 'title' ? '#e4d8f8' : '#dce8f4'), snow = rgb('#f4f8ff');
  const ridge = (x: number, i: number) => {
    const n = noise(x / (i ? 46 : 70) + i * 5, i) * 0.7 + noise(x / 15, i + 3) * 0.3;
    if (i === 0 && P.snow) return horizon - 12 - Math.max(0, 68 - Math.abs(x - 130) * 0.8) + n * 12;
    return horizon - (i ? 4 : 12) - n * (i ? 14 : 24);
  };
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    let col: number[];
    if (y < horizon) {
      const t = (y / horizon) * (sky.length - 1), i = Math.floor(t);
      col = sky[Math.min(sky.length - 1, i + (t - i > bayer(x, y) ? 1 : 0))];
      const puff = noise(x / 26 + 3, y / 8) * 0.8 + noise(x / 9, y / 4) * 0.2;
      if (y < horizon * 0.6 && puff > 0.68) col = puff + (bayer(x, y) - 0.5) * 0.04 > 0.72 ? cloud : cloudLow;
      for (let i = 0; i < 2; i++) {
        const top = ridge(x, i);
        if (y >= top) {
          col = hills[i][(y - top) * 0.09 + (bayer(x, y) - 0.5) + noise(x / 7, i) * 0.6 < 0.7 ? 1 : 0];
          if (i === 0 && P.snow && y < 44 + noise(x / 4, 1) * 14) col = snow;
        }
      }
    } else {
      const t = Math.min(0.99, (y - horizon) / (H - horizon)) * 2 + 1;
      const i = Math.floor(t);
      col = ground[Math.min(3, 3 - i + (t - i > bayer(x, y) ? 0 : 1))];
      const row = Math.floor(Math.sqrt(y - horizon) * 3.2);
      if (hash(x >> 2, row) < 0.13 && (y & 1)) col = ground[0];
    }
    const i = (y * W + x) * 4;
    img.data[i] = col[0]; img.data[i + 1] = col[1]; img.data[i + 2] = col[2]; img.data[i + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  if (P.pad.length) for (const [cx, cy, rx, ry] of [[186, 92, 48, 11], [58, 148, 62, 13]]) {
    for (let y = -ry - 3; y <= ry + 4; y++) for (let x = -rx - 3; x <= rx + 3; x++) {
      const d = (x / rx) ** 2 + (y / ry) ** 2;
      const below = (x / rx) ** 2 + ((y - 3) / ry) ** 2;
      if (d <= 1) {
        const v = 0.6 - y / ry * 0.25 + (noise((cx + x) / 7, (cy + y) / 4) - 0.5) * 0.6 + (bayer(cx + x, cy + y) - 0.5) * 0.2;
        g.fillStyle = P.pad[Math.max(1, Math.min(3, Math.floor(v * 4)))];
        if (d > 0.84 && y > 0) g.fillStyle = P.pad[1];
      } else if (below <= 1) g.fillStyle = P.pad[0];
      else continue;
      g.fillRect(cx + x, cy + y, 1, 1);
    }
  }
  backs.set(id, c);
  return c;
}
