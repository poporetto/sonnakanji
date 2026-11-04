import { C, INK, sprites } from './sprites.mjs';

const sky = (c) => `<rect width="200" height="200" fill="${c}" stroke="none"/>`;
const ground = (c, y = 158) => `<path d="M0 ${y}q100-16 200 0v42H0z" fill="${c}" stroke="none"/>`;
const stars = '<g fill="#fff" stroke="none"><circle cx="30" cy="30" r="2.5"/><circle cx="76" cy="22" r="2"/><circle cx="168" cy="36" r="2.5"/><circle cx="140" cy="16" r="1.8"/><circle cx="22" cy="86" r="2"/><circle cx="184" cy="92" r="2"/></g>';

const SCENES = {
  sky: sky('#b9e8ff'),
  park: sky('#b9e8ff') + ground('#7fdc9f'),
  dusk: sky('#ffb26b') + ground('#a06cd5'),
  night: sky('#2d2670') + stars + ground('#3f3592'),
  room: sky('#ffe0ee') + '<rect y="154" width="200" height="46" fill="#ffc2dc" stroke="none"/>',
  sea: sky('#b9e8ff'),
  snow: sky('#cfe3ff') + ground('#ffffff'),
  street: sky('#d6cdfb') + '<rect y="156" width="200" height="44" fill="#a59fc9" stroke="none"/>',
  yellow: sky('#ffe27a'), mint: sky('#a8f0cf'), pink: sky('#ffc2dc'),
  lilac: sky('#d6cdfb'), blue: sky('#b9d4ff'), peach: sky('#ffd0b0'),
};

export const SCENE_NAMES = Object.keys(SCENES);

// One layer: "name[:arg...] x y [scale] [f] [r45]"
function layer(spec) {
  const [id, ...rest] = spec.trim().split(/\s+/);
  const [name, ...args] = id.split(':');
  const draw = sprites[name];
  if (!draw) throw new Error(`Unknown sprite "${name}" in "${spec}"`);
  const [x, y] = rest;
  const scale = rest.slice(2).find((t) => /^[\d.]+$/.test(t)) ?? 1;
  const flip = rest.includes('f');
  const rot = rest.find((t) => /^r-?\d+$/.test(t))?.slice(1);
  const t = [`translate(${x} ${y})`, rot && `rotate(${rot})`, `scale(${flip ? -scale : scale} ${scale})`].filter(Boolean).join(' ');
  return `<g transform="${t}">${draw(args)}</g>`;
}

export function renderScene(scene, layers) {
  if (!SCENES[scene]) throw new Error(`Unknown scene "${scene}"`);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">${SCENES[scene]}<g stroke="${INK}" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" fill="none">${layers.map(layer).join('')}</g></svg>`;
}

export { C };
