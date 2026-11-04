// The drawing kit: every sprite is centred on (0,0) and spans about ±50 units.
// The root <g> in compose.mjs sets the ink outline, so shapes only choose a fill.
export const INK = '#1c1633';
export const C = {
  red: '#ff5a5f', orange: '#ff9f43', yellow: '#ffd23f', green: '#5dd39e', teal: '#2ec4b6',
  blue: '#4d96ff', purple: '#9b5de5', pink: '#ff8fc7', white: '#ffffff', brown: '#a9714b',
  grey: '#b8b5d0', dark: '#3a2a5d', skin: '#ffd2a8', leaf: '#3fb96b', gold: '#ffc233',
};
const colorOf = (args, fallback) => C[args.find((a) => C[a])] ?? fallback;
const limb = (d, color, w = 7) =>
  `<path d="${d}" fill="none" stroke-width="${w + 6}"/><path d="${d}" fill="none" stroke="${color}" stroke-width="${w}"/>`;
const none = 'fill="none"';

const POSES = {
  stand: ['M-13-4L-22 15', 'M13-4L22 15', 'M-7 18L-8 44', 'M7 18L8 44'],
  walk: ['M-13-4L-25 8', 'M13-4L24 12', 'M-6 18L-19 43', 'M6 18L17 43'],
  run: ['M-13-4L-27 2L-32-10', 'M13-4L27 8L36-2', 'M-6 18L-24 30L-36 24', 'M6 18L14 32L12 47'],
  up: ['M-13-5L-27-30', 'M13-5L27-30', 'M-7 18L-8 44', 'M7 18L8 44'],
  wide: ['M-13-4L-44-8', 'M13-4L44-8', 'M-6 18L-26 46', 'M6 18L26 46'],
  sit: ['M-13-4L-20 14', 'M13-4L26 10', 'M-6 18L22 20L22 44', 'M6 18L30 20L30 44'],
  kneel: ['M-13-4L-14 14L4 14', 'M13-4L14 14L-2 14', 'M-7 18L-22 30L-4 34', 'M7 18L20 30L2 34'],
  carry: ['M-13-5L-24-20L-14-38', 'M13-5L24-20L14-38', 'M-7 18L-9 44', 'M7 18L9 44'],
  point: ['M-13-4L-22 15', 'M13-4L46-14', 'M-7 18L-8 44', 'M7 18L8 44'],
  think: ['M-13-4L-22 15', 'M13-4L26 6L10-16', 'M-7 18L-8 44', 'M7 18L8 44'],
  hold: ['M-13-4L-22 15', 'M13-4L34 4', 'M-7 18L-8 44', 'M7 18L8 44'],
};
const MOODS = {
  smile: '<circle cx="-6" cy="-33" r="2.2" fill="#1c1633" stroke="none"/><circle cx="6" cy="-33" r="2.2" fill="#1c1633" stroke="none"/><path d="M-6-26q6 6 12 0" fill="none" stroke-width="3"/>',
  wow: '<circle cx="-6" cy="-34" r="2.6" fill="#1c1633" stroke="none"/><circle cx="6" cy="-34" r="2.6" fill="#1c1633" stroke="none"/><ellipse cx="0" cy="-25" rx="3.6" ry="4.6" fill="#1c1633" stroke="none"/>',
  sleep: '<path d="M-10-33q4 3 7 0M3-33q4 3 7 0" fill="none" stroke-width="3"/><path d="M-3-26q3 2 6 0" fill="none" stroke-width="3"/>',
  sad: '<circle cx="-6" cy="-33" r="2.2" fill="#1c1633" stroke="none"/><circle cx="6" cy="-33" r="2.2" fill="#1c1633" stroke="none"/><path d="M-6-24q6-5 12 0" fill="none" stroke-width="3"/>',
};
const HAIR = {
  short: (c) => `<path d="M-17-32q-1-18 17-18t17 18q-8-9-17-9t-17 9z" fill="${c}"/>`,
  bun: (c) => `<circle cx="0" cy="-53" r="7" fill="${c}"/><path d="M-17-32q-1-18 17-18t17 18q-8-9-17-9t-17 9z" fill="${c}"/>`,
  long: (c) => `<path d="M-19-30q-3-21 19-21t19 21l2 26q-5 3-9 0l-1-30q-11-3-22 0l-1 30q-4 3-9 0z" fill="${c}"/>`,
  bald: () => '',
  cap: () => `<path d="M-18-36q2-16 18-16t18 16z" fill="${C.red}"/><path d="M14-37h13" fill="none" stroke-width="6"/>`,
  samurai: (c) => `<path d="M-17-32q-1-18 17-18t17 18q-8-9-17-9t-17 9z" fill="${c}"/><path d="M-8-50q8-12 16 0z" fill="${c}"/>`,
  crown: () => `<path d="M-17-44l-2-17 10 8 9-12 9 12 10-8-2 17z" fill="${C.gold}"/>`,
};

function person(args) {
  const pose = args.find((a) => POSES[a]) ?? 'stand';
  const mood = args.find((a) => MOODS[a]) ?? 'smile';
  const hair = args.find((a) => HAIR[a]) ?? 'short';
  const shirt = colorOf(args, C.blue);
  const hairColor = args.includes('elder') ? C.white : C.dark;
  const [a1, a2, l1, l2] = POSES[pose];
  const pants = shirt === C.dark ? C.blue : C.dark;
  return (
    limb(l1, pants) + limb(l2, pants) + limb(a1, C.skin) +
    `<rect x="-15" y="-14" width="30" height="35" rx="11" fill="${shirt}"/>` +
    limb(a2, C.skin) +
    `<circle cx="0" cy="-32" r="18" fill="${C.skin}"/>` + HAIR[hair](hairColor) + MOODS[mood]
  );
}

const leaf = `<path d="M0 0q-13-13 0-30q13 17 0 30z" fill="${C.leaf}"/>`;
const flame = (c1, c2) =>
  `<path d="M0-48q8 18 22 28t8 30q-8 26-30 26t-30-26q-3-20 11-30q2 10 8 13q-4-22 11-41z" fill="${c1}"/><path d="M0-8q18 16 12 30q-4 12-12 12t-13-12q-3-14 13-30z" fill="${c2}"/>`;
const animalFace = (y = -8, gap = 12) =>
  `<circle cx="${-gap}" cy="${y}" r="3" fill="#1c1633" stroke="none"/><circle cx="${gap}" cy="${y}" r="3" fill="#1c1633" stroke="none"/>`;

export const sprites = {
  person,
  tree: () => `<path d="M-7 8h14l4 40h-22z" fill="${C.brown}"/><circle cx="-22" cy="-10" r="20" fill="${C.leaf}"/><circle cx="22" cy="-10" r="20" fill="${C.leaf}"/><circle cx="0" cy="-28" r="25" fill="${C.green}"/>`,
  sun: () => `<g fill="none" stroke="${C.orange}" stroke-width="7"><path d="M0-48v-9M0 48v9M-48 0h-9M48 0h9M-34-34l-6-6M34-34l6-6M-34 34l-6 6M34 34l6 6"/></g><circle r="34" fill="${C.yellow}"/><path d="M-12 4q12 12 24 0" ${none} stroke-width="3"/>${animalFace(-6, 10)}`,
  moon: () => `<path d="M16-42a44 44 0 1 0 26 58a36 36 0 1 1-26-58z" fill="${C.yellow}"/>`,
  star: (a) => `<path d="M0-26l8 17 18 2-13 13 3 19L0 16l-16 9 3-19L-26-7l18-2z" fill="${colorOf(a, C.yellow)}"/>`,
  cloud: (a) => `<path d="M-30 22q-22 0-22-18t22-18q4-22 28-20q18 2 22 18q26-2 30 18q2 20-22 20z" fill="${colorOf(a, C.white)}"/>`,
  rain: () => [[-24, -10], [0, 10], [24, -14], [-10, 30], [16, 28]].map(([x, y]) => `<path transform="translate(${x} ${y})" d="M0-10q9 11 0 15t0-15z" fill="${C.blue}"/>`).join(''),
  drop: (a) => `<path d="M0-40q30 34 18 52t-36 0q-12-18 18-52z" fill="${colorOf(a, C.blue)}"/>`,
  mountain: (a) => `<path d="M-60 40L-26-22l16 22 16-38 54 78z" fill="${colorOf(a, C.purple)}"/><path d="M6-38l16 23-9-3-8 7-8-7-5 5z" fill="${C.white}"/>`,
  river: () => `<g ${none} stroke-width="16" stroke="${INK}"><path d="M-30-46q-14 46 6 92M0-46q-14 46 6 92M30-46q-14 46 6 92"/></g><g ${none} stroke-width="8" stroke="${C.blue}"><path d="M-30-46q-14 46 6 92M0-46q-14 46 6 92M30-46q-14 46 6 92"/></g>`,
  wave: () => `<path d="M-60 10q15-22 30 0t30 0t30 0t30 0v36H-60z" fill="${C.blue}"/>`,
  flame: () => flame(C.red, C.yellow),
  bolt: () => `<path d="M10-46L-22 8h18L-12 46 24-12H4z" fill="${C.yellow}"/>`,
  wind: () => `<g ${none} stroke-width="7"><path d="M-46-14h50q18 0 16-14t-16-10"/><path d="M-46 6h74q14 0 12 12t-14 8"/><path d="M-36 24h30"/></g>`,
  snow: () => `<g ${none} stroke="${C.white}" stroke-width="5"><path d="M0-30v60M-26-15l52 30M-26 15l52-30"/></g>`,
  grass: () => `<path d="M-40 26q-4-26-14-34q18 6 22 22q0-24-6-36q16 12 16 36q4-16 14-26q-2 20-4 38z" fill="${C.leaf}"/><path d="M8 26q-2-22-10-32q14 6 18 20q2-16 12-30q2 24-4 42z" fill="${C.green}"/>`,
  sprout: () => `<path d="M0 34V-4" ${none} stroke-width="6"/><g transform="translate(0 -2) rotate(-50)">${leaf}</g><g transform="translate(0 -2) rotate(50)">${leaf}</g><path d="M-26 36q26-16 52 0z" fill="${C.brown}"/>`,
  flower: (a) => { const c = colorOf(a, C.pink); return `<path d="M0 12v36" ${none} stroke-width="6"/>${[0, 72, 144, 216, 288].map((r) => `<circle transform="rotate(${r} 0 -6) translate(0 -22)" r="12" fill="${c}"/>`).join('')}<circle cy="-6" r="10" fill="${C.yellow}"/>`; },
  wheat: () => `<path d="M0 46V-34" ${none} stroke-width="6"/>${[-30, -14, 2, 18].map((y) => `<ellipse cx="-10" cy="${y}" rx="11" ry="6" transform="rotate(35 -10 ${y})" fill="${C.gold}"/><ellipse cx="10" cy="${y}" rx="11" ry="6" transform="rotate(-35 10 ${y})" fill="${C.gold}"/>`).join('')}`,
  field: () => `<rect x="-52" y="-34" width="104" height="72" rx="8" fill="${C.green}"/><path d="M0-34v72M-52 2h104" ${none}/><path d="M-36-20v8M-20-20v8M16-20v8M34-20v8M-36 16v8M-20 16v8M16 16v8M34 16v8" ${none} stroke="${C.leaf}" stroke-width="6"/>`,
  bowl: (a) => `<path d="M-30-6q-6-30 30-30t30 30z" fill="${C.white}"/><path d="M-42-8h84q0 44-30 48h-24q-30-4-30-48z" fill="${colorOf(a, C.blue)}"/>`,
  steam: () => `<g ${none} stroke="${C.white}" stroke-width="7"><path d="M-16 30q-12-16 0-30t0-30M16 30q-12-16 0-30t0-30"/></g>`,
  cup: (a) => `<path d="M-28-26h52l-6 58q0 6-6 6h-28q-6 0-6-6z" fill="${colorOf(a, C.white)}"/><path d="M24-16q24-2 20 18t-24 18" ${none} stroke-width="6"/><path d="M-24-12h44" ${none} stroke="${C.green}" stroke-width="8"/>`,
  apple: () => `<path d="M0-18q30-16 34 16T8 38q-8-6-16 0T-34-2q4-32 34-16z" fill="${C.red}"/><path d="M0-18q0-12 10-18" ${none}/><g transform="translate(4 -22) rotate(70)">${leaf}</g>`,
  meat: () => `<path d="M-36 4q0-34 38-34t36 30q-2 34-40 34t-34-30z" fill="${C.red}"/><path d="M-12 2q10-14 28-8" ${none} stroke="${C.white}" stroke-width="8"/><circle cx="4" cy="2" r="10" fill="${C.white}"/>`,
  fish: (a) => `<path d="M-46 0q26-28 62-10l26-16q-6 26 0 52L16 10q-36 18-62-10z" fill="${colorOf(a, C.orange)}"/><circle cx="-26" cy="-4" r="4" fill="${INK}" stroke="none"/><path d="M-8-10q6 10 0 20" ${none} stroke-width="4"/>`,
  coin: () => `<circle r="32" fill="${C.gold}"/><circle r="22" ${none} stroke-width="3"/><path d="M-11-14L0 2l11-16M0 2v15M-10 4h20" ${none} stroke-width="4"/>`,
  shell: () => `<path d="M-40 26Q-46-34 0-34T40 26q-12 10-20 2q-10 12-20 2q-10 10-20-2q-10 8-20 2z" fill="${C.pink}"/><path d="M0-34v58M-16-28l-6 50M16-28l6 50" ${none} stroke-width="3.5"/>`,
  gem: (a) => `<path d="M-30-14l14-20h32l14 20L0 38z" fill="${colorOf(a, C.teal)}"/><path d="M-30-14h60M-12-14L0 38l12-52" ${none} stroke-width="3.5"/>`,
  nugget: () => `<path d="M-30 18l-8-16 16-22 22-4 26 14 10 24-16 16H-14z" fill="${C.gold}"/><path d="M-14-6l10-6M10 0l8 6" ${none} stroke="${C.white}" stroke-width="5"/>`,
  silver: () => `<path d="M-40 26l14-40h52l14 40z" fill="${C.grey}"/><path d="M-26-14l8 16h36l8-16M-18 2l-22 24M18 2l22 24" ${none} stroke-width="3.5"/><path d="M-12-6h16" ${none} stroke="${C.white}" stroke-width="5"/>`,
  book: (a) => { const c = colorOf(a, C.red); return `<path d="M0-26q-20-12-46-6v62q26-6 46 6z" fill="${c}"/><path d="M0-26q20-12 46-6v62q-26-6-46 6z" fill="${C.white}"/><path d="M12-14q12-4 24-2M12 2q12-4 24-2M12 18q12-4 24-2" ${none} stroke-width="3.5"/>`; },
  brush: () => `<path d="M-30 40L14-16l12 10-44 56z" fill="${C.brown}"/><path d="M14-16q6-26 32-30q4 26-20 40z" fill="${INK}"/>`,
  paper: () => `<path d="M-30-40h42l18 18v62h-60z" fill="${C.white}"/><path d="M12-40v18h18" ${none}/><path d="M-18-6h34M-18 10h34M-18 26h22" ${none} stroke-width="3.5"/>`,
  map: () => `<path d="M-44-30l28 10 30-12 30 12v60l-30-12-30 12-28-10z" fill="${C.yellow}"/><path d="M-16-20v60M14-32v60" ${none} stroke-width="3.5"/><path d="M-30 6q14-22 28-2t30-14" ${none} stroke="${C.red}" stroke-width="5"/>`,
  picture: () => `<rect x="-42" y="-34" width="84" height="68" rx="4" fill="${C.white}"/><path d="M-34 26l22-30 18 20 10-10 18 20z" fill="${C.green}"/><circle cx="18" cy="-14" r="9" fill="${C.yellow}"/>`,
  knife: () => `<path d="M-6-44q24 26 12 56H-8z" fill="${C.grey}"/><rect x="-10" y="12" width="16" height="34" rx="5" fill="${C.brown}"/>`,
  axe: () => `<path d="M-3-44h7l3 92H-6z" fill="${C.brown}"/><path d="M0-40q26-8 34 2q8 16 0 34q-14-10-34-6z" fill="${C.grey}"/>`,
  bow: () => `<path d="M-14-44Q36 0-14 44" ${none} stroke-width="7"/><path d="M-14-44V44" ${none} stroke-width="3"/>`,
  arrow: () => `<path d="M-44 0H30" ${none} stroke-width="6"/><path d="M26-13L48 0 26 13z" fill="${C.red}"/><path d="M-44 0l-8-10M-44 0l-8 10" ${none} stroke-width="5"/>`,
  dir: (a) => { const c = colorOf(a, C.red); return `<path d="M-14 42V-4h-22L0-44l36 40H14v46z" fill="${c}"/>`; },
  flag: (a) => `<path d="M-22-46v94" ${none} stroke-width="7"/><path d="M-22-44h60l-12 20 12 20h-60z" fill="${colorOf(a, C.red)}"/>`,
  gate: () => `<rect x="-46" y="-40" width="92" height="84" rx="6" fill="${C.brown}"/><rect x="-36" y="-30" width="32" height="74" fill="${C.orange}"/><rect x="4" y="-30" width="32" height="74" fill="${C.orange}"/><circle cx="-11" cy="8" r="3" fill="${INK}"/><circle cx="11" cy="8" r="3" fill="${INK}"/>`,
  gateopen: () => `<rect x="-46" y="-40" width="92" height="84" rx="6" fill="${C.brown}"/><rect x="-36" y="-30" width="72" height="74" fill="${C.yellow}"/><path d="M-36-30l16 10v64h-16zM36-30l-16 10v64h16z" fill="${C.orange}"/>`,
  house: (a) => `<path d="M-46-4L0-44l46 40z" fill="${colorOf(a, C.red)}"/><rect x="-34" y="-4" width="68" height="46" fill="${C.white}"/><rect x="-10" y="12" width="20" height="30" fill="${C.brown}"/><rect x="-26" y="6" width="11" height="11" fill="${C.blue}"/><rect x="15" y="6" width="11" height="11" fill="${C.blue}"/>`,
  shop: () => `<rect x="-42" y="-14" width="84" height="56" fill="${C.white}"/><path d="M-48-14l8-26h80l8 26q-8 12-16 0q-8 12-16 0q-8 12-16 0q-8 12-16 0q-8 12-16 0q-8 12-16 0z" fill="${C.red}"/><rect x="-30" y="6" width="26" height="36" fill="${C.brown}"/><rect x="6" y="6" width="26" height="20" fill="${C.blue}"/>`,
  tower: () => `<path d="M-30 46V-20L0-48l30 28v66z" fill="${C.teal}"/>${[-14, 6, 26].map((y) => `<rect x="-18" y="${y}" width="12" height="11" fill="${C.yellow}"/><rect x="6" y="${y}" width="12" height="11" fill="${C.yellow}"/>`).join('')}`,
  castle: () => `<path d="M-44 44V-16h12v12h12v-12h12v-12H8v12h12v12h12v-12h12v60z" fill="${C.grey}"/><path d="M-12 44V14q12-14 24 0v30z" fill="${C.brown}"/><path d="M0-28v-20" ${none} stroke-width="4"/><path d="M0-48h18l-6 6 6 6H0z" fill="${C.red}"/>`,
  torii: () => `<path d="M-52-34q52 10 104 0l-4 13h-96z" fill="${C.red}"/><rect x="-44" y="-12" width="88" height="9" fill="${C.red}"/><rect x="-34" y="-21" width="10" height="66" fill="${C.red}"/><rect x="24" y="-21" width="10" height="66" fill="${C.red}"/>`,
  temple: () => `<path d="M-52-14q30-4 52-32q22 28 52 32l-8 10h-88z" fill="${C.dark}"/><rect x="-32" y="-4" width="64" height="48" fill="${C.orange}"/><rect x="-10" y="10" width="20" height="34" fill="${C.brown}"/>`,
  bell: () => `<path d="M0-40q-26 2-28 30q-2 24-14 36h84q-12-12-14-36q-2-28-28-30z" fill="${C.gold}"/><circle cy="34" r="8" fill="${C.orange}"/>`,
  box: (a) => `<path d="M-38-16h76v56h-76z" fill="${colorOf(a, C.orange)}"/><path d="M-38-16l10-20h56l10 20z" fill="${C.yellow}"/><path d="M-10-16v14h20v-14" ${none} stroke-width="3.5"/>`,
  frame: (a) => `<rect x="-58" y="-58" width="116" height="116" rx="10" fill="none" stroke="${colorOf(a, C.red)}" stroke-width="11"/>`,
  pipe: () => `<rect x="-14" y="-52" width="28" height="104" rx="6" fill="${C.teal}"/><ellipse cy="-46" rx="14" ry="6" fill="${C.dark}"/>`,
  car: (a) => `<path d="M-52 14v-14l20-6 14-24h40l16 24 14 6v14z" fill="${colorOf(a, C.red)}"/><path d="M-14-22h14v16h-26zM8-22h12l10 16H8z" fill="${C.blue}"/><circle cx="-26" cy="16" r="12" fill="${C.dark}"/><circle cx="28" cy="16" r="12" fill="${C.dark}"/>`,
  cart: () => `<path d="M-46-20h76l-8 36h-60z" fill="${C.orange}"/><path d="M30-20l22-14" ${none} stroke-width="6"/><circle cx="-22" cy="26" r="16" fill="${C.white}"/><circle cx="-22" cy="26" r="4" fill="${INK}"/><path d="M-22 10v32M-38 26h32" ${none} stroke-width="3"/>`,
  train: () => `<rect x="-46" y="-34" width="92" height="66" rx="16" fill="${C.teal}"/><rect x="-34" y="-22" width="28" height="22" rx="4" fill="${C.white}"/><rect x="6" y="-22" width="28" height="22" rx="4" fill="${C.white}"/><circle cx="-24" cy="36" r="9" fill="${C.dark}"/><circle cx="24" cy="36" r="9" fill="${C.dark}"/>`,
  sign: () => `<path d="M-5 0h10v48H-5z" fill="${C.brown}"/><rect x="-42" y="-34" width="84" height="38" rx="6" fill="${C.yellow}"/><path d="M-26-15h52" ${none} stroke-width="5"/>`,
  road: () => `<path d="M-20-60h40l40 120H-60z" fill="${C.grey}"/><path d="M0-52v18M0-20v22M0 16v28" ${none} stroke="${C.white}" stroke-width="6"/>`,
  crossroad: () => `<path d="M-18-62h36v44h44v36H18v44h-36V18h-44v-36h44z" fill="${C.grey}"/><path d="M0-56v20M0 36v20M-56 0h20M36 0h20" ${none} stroke="${C.white}" stroke-width="5"/>`,
  foot: () => `<path d="M-16-6q-4-22 16-22t18 22l-4 34q-2 12-14 12t-14-12z" fill="${C.skin}"/>${[[-14, -38, 7], [0, -44, 8], [13, -41, 7], [23, -33, 5]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${C.skin}"/>`).join('')}`,
  hand: () => `<path d="M-30 4l-16-22q-4-10 6-10l16 16-4-32q2-8 10-4l8 32 2-38q6-8 12 0l-2 38 12-32q8-4 10 4l-10 34 18-12q10 2 4 12L28 22q-8 20-30 20q-22 0-28-38z" fill="${C.skin}"/>`,
  eye: () => `<path d="M-52 0q52-50 104 0q-52 50-104 0z" fill="${C.white}"/><circle r="18" fill="${C.blue}"/><circle r="9" fill="${INK}"/><circle cx="-5" cy="-6" r="4" fill="${C.white}" stroke="none"/>`,
  ear: () => `<path d="M-24-4q0-40 28-40t26 34q0 16-14 28q-8 8-10 18q-4 12-14 8q-12-4-12-20q0-14-4-28z" fill="${C.skin}"/><path d="M-8-8q0-20 12-20t12 14q0 8-8 14q-6 4-6 12" ${none} stroke-width="4"/>`,
  mouth: () => `<path d="M-46-14q46-18 92 0q-8 46-46 46t-46-46z" fill="${C.red}"/><path d="M-38-12q38-12 76 0v10h-76z" fill="${C.white}"/><ellipse cy="22" rx="16" ry="8" fill="${C.pink}"/>`,
  nose: () => `<path d="M-6-44q-4 34-24 56q-12 18 8 22q8-10 22-10t22 10q20-4 8-22q-20-22-24-56z" fill="${C.skin}"/><path d="M-14 22q4 4 8 0M6 22q4 4 8 0" ${none} stroke-width="4"/>`,
  heart: (a) => `<path d="M0 38Q-52 2-44-22q8-22 28-16q10 4 16 16q6-12 16-16q20-6 28 16q8 24-44 60z" fill="${colorOf(a, C.red)}"/><path d="M-30-16q2-8 10-8" ${none} stroke="${C.white}" stroke-width="5"/>`,
  bulb: () => `<path d="M0-44q32 2 32 32q0 16-14 28v12h-36V16Q-32 4-32-12q0-30 32-32z" fill="${C.yellow}"/><path d="M-16 36h32" ${none}/><path d="M-10 44h20" ${none}/>`,
  bubble: (a) => `<path d="M-46-34h92q8 0 8 8v40q0 8-8 8H-6l-22 22 4-22h-22q-8 0-8-8v-40q0-8 8-8z" fill="${colorOf(a, C.white)}"/><circle cx="-20" cy="-6" r="4.5" fill="${INK}" stroke="none"/><circle cx="0" cy="-6" r="4.5" fill="${INK}" stroke="none"/><circle cx="20" cy="-6" r="4.5" fill="${INK}" stroke="none"/>`,
  question: () => `<path d="M-20-22q2-24 22-24t22 22q0 14-14 20q-10 6-10 16" ${none} stroke-width="17"/><path d="M-20-22q2-24 22-24t22 22q0 14-14 20q-10 6-10 16" ${none} stroke="${C.yellow}" stroke-width="9"/><circle cx="0" cy="34" r="10" fill="${C.yellow}"/>`,
  bang: () => `<path d="M-10-46h20l-5 58H-5z" fill="${C.red}"/><circle cy="34" r="10" fill="${C.red}"/>`,
  note: () => `<path d="M-14 26V-30l36-10v52" ${none} stroke-width="7"/><ellipse cx="-24" cy="27" rx="13" ry="10" fill="${C.purple}"/><ellipse cx="12" cy="14" rx="13" ry="10" fill="${C.purple}"/>`,
  clock: () => `<circle r="40" fill="${C.white}"/><path d="M0-24V0l16 10" ${none} stroke-width="6"/><path d="M0-40v8M0 40v-8M-40 0h8M40 0h-8" ${none} stroke-width="3.5"/>`,
  calendar: () => `<rect x="-38" y="-34" width="76" height="72" rx="8" fill="${C.white}"/><path d="M-38-34h76q0-0 0 8v12h-76v-12q0-8 0-8z" fill="${C.red}"/><path d="M-20-44v16M20-44v16" ${none} stroke-width="6"/>${[-22, 0, 22].flatMap((x) => [6, 24].map((y) => `<rect x="${x - 6}" y="${y - 6}" width="12" height="11" fill="${C.teal}" stroke="none"/>`)).join('')}`,
  bed: () => `<path d="M-52 34V-22M52 34V-2" ${none} stroke-width="8"/><rect x="-52" y="4" width="104" height="22" rx="6" fill="${C.purple}"/><rect x="-46" y="-12" width="34" height="18" rx="8" fill="${C.white}"/>`,
  bag: () => `<path d="M-14-36q14 14 28 0l-4 16q26 12 26 42t-36 34q-36-4-36-34t26-42z" fill="${C.brown}"/><path d="M-12-20h24" ${none} stroke-width="5"/>`,
  dumbbell: () => `<rect x="-30" y="-6" width="60" height="12" fill="${C.grey}"/><rect x="-52" y="-24" width="24" height="48" rx="6" fill="${C.dark}"/><rect x="28" y="-24" width="24" height="48" rx="6" fill="${C.dark}"/>`,
  weight: () => `<path d="M-14-22q-4-22 14-22t14 22zM-30-22h60l16 66h-92z" fill="${C.dark}"/>`,
  bone: () => `<path d="M-34-14a14 14 0 1 1 20-16l32 30a14 14 0 1 1 16 20a14 14 0 1 1-20 16l-32-30a14 14 0 1 1-16-20z" fill="${C.white}"/>`,
  ghost: () => `<path d="M-32 42V-8q0-36 32-36t32 36v50l-11-10-10 10-11-10-11 10-10-10z" fill="${C.white}"/>${animalFace(-12, 11)}`,
  medkit: () => `<rect x="-42" y="-26" width="84" height="64" rx="8" fill="${C.white}"/><path d="M-16-26v-12h32v12" ${none} stroke-width="6"/><path d="M-9-6h18V2h8V14H9v14H-9V14h-8V2h8z" transform="translate(0 -2)" fill="${C.red}"/>`,
  thermo: () => `<rect x="-8" y="-46" width="16" height="66" rx="8" fill="${C.white}"/><circle cy="30" r="17" fill="${C.red}"/><path d="M0 22v-40" ${none} stroke="${C.red}" stroke-width="7"/>`,
  broom: () => `<path d="M-4-48h8v52h-8z" fill="${C.brown}"/><path d="M-10 4h20l18 44h-56z" fill="${C.gold}"/>`,
  cane: () => `<path d="M6 46V-28q0-14-14-14t-14 14" ${none} stroke-width="8" stroke="${C.brown}"/>`,
  scale: () => `<path d="M0-40V36M-24 38h48M-40-28h80" ${none} stroke-width="6"/><path d="M-40-28l-14 34h28zM40-28l-14 34h28z" fill="${C.yellow}"/>`,
  ruler: () => `<rect x="-52" y="-14" width="104" height="28" rx="3" fill="${C.yellow}"/><path d="M-36-14v12M-18-14v8M0-14v12M18-14v8M36-14v12" ${none} stroke-width="3.5"/>`,
  dipper: () => `<path d="M-30-16h60l-6 44h-48z" fill="${C.brown}"/><path d="M30-8L56-44" ${none} stroke-width="8"/>`,
  mic: () => `<circle cy="-24" r="20" fill="${C.grey}"/><path d="M-12-10L-4 36h8l8-46z" fill="${C.dark}"/>`,
  stage: () => `<path d="M-56 6h112l8 38H-64z" fill="${C.brown}"/><path d="M-56 6h112" ${none}/>`,
  table: () => `<rect x="-52" y="-12" width="104" height="11" rx="3" fill="${C.brown}"/><path d="M-40 0v44M40 0v44" ${none} stroke-width="8"/>`,
  chart: () => `<rect x="-42" y="-40" width="84" height="80" rx="6" fill="${C.white}"/><path d="M-30 28V8M-10 28V-6M10 28V4M30 28V-22" ${none} stroke="${C.blue}" stroke-width="11"/>`,
  magnifier: () => `<circle cx="-8" cy="-10" r="30" fill="${C.teal}"/><path d="M14 14l30 30" ${none} stroke-width="11"/>`,
  sparkle: (a) => `<path d="M0-30q5 25 30 30q-25 5-30 30q-5-25-30-30q25-5 30-30z" fill="${colorOf(a, C.yellow)}"/>`,
  zzz: () => `<path d="M-14-20h22l-22 24h22M18-40h14L18-24h14" ${none} stroke-width="5"/>`,
  dog: () => `<path d="M-34 18q-4-30 30-30h22q6-22 22-14l8 12 14 6q0 14-14 16v50H46l-4-30H-16l-4 30h-14z" fill="${C.orange}"/><path d="M38-22q-16 8-12 24q12-2 16-14z" fill="${C.brown}"/><path d="M-34 2q-14-4-16-20" ${none} stroke-width="7"/><circle cx="50" cy="-12" r="3" fill="${INK}" stroke="none"/><circle cx="68" cy="-6" r="4" fill="${INK}"/>`,
  cow: () => `<path d="M-34-30l-18-10q0 18 14 24M34-30l18-10q0 18-14 24" fill="${C.yellow}"/><path d="M-34-20q34-22 68 0q6 30-4 42q-8 22-30 22t-30-22q-10-12-4-42z" fill="${C.white}"/><path d="M-30-10q10-10 18 2q-4 14-20 8z" fill="${C.dark}"/><ellipse cy="26" rx="24" ry="17" fill="${C.pink}"/>${animalFace(-4, 12)}<circle cx="-8" cy="26" r="3" fill="${INK}" stroke="none"/><circle cx="8" cy="26" r="3" fill="${INK}" stroke="none"/>`,
  horse: () => `<path d="M-22 44V10q-4-34 22-46q10-6 14 2l28 30q4 8-8 10l-20-4-2 14 8 28z" fill="${C.brown}"/><path d="M-6-40q-20 6-26 40q8 6 10 8q0-32 22-40z" fill="${C.dark}"/><circle cx="16" cy="-14" r="3" fill="${INK}" stroke="none"/>`,
  pig: () => `<circle r="36" fill="${C.pink}"/><path d="M-30-22l-8-18 20 6M30-22l8-18-20 6" fill="${C.pink}"/><ellipse cy="8" rx="16" ry="11" fill="${C.white}"/><circle cx="-6" cy="8" r="3" fill="${INK}" stroke="none"/><circle cx="6" cy="8" r="3" fill="${INK}" stroke="none"/>${animalFace(-12, 15)}`,
  sheep: () => `<g fill="${C.white}">${[[-30, -6], [-14, -24], [12, -24], [30, -6], [24, 16], [0, 22], [-24, 16]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="20"/>`).join('')}</g><circle r="30" fill="${C.white}" stroke="none"/><ellipse cy="2" rx="15" ry="19" fill="${C.dark}"/><circle cx="-6" cy="-3" r="3" fill="${C.white}" stroke="none"/><circle cx="6" cy="-3" r="3" fill="${C.white}" stroke="none"/>`,
  bird: (a) => { const c = colorOf(a, C.yellow); return `<path d="M-38 6q0-34 36-34q26 0 32 22l18 6-18 8q-8 30-36 30t-32-32z" fill="${c}"/><path d="M-22 4q18-6 30 10q-20 16-34-2z" fill="${C.orange}"/><circle cx="12" cy="-10" r="3.6" fill="${INK}" stroke="none"/><path d="M-6 38v10M6 38v10" ${none} stroke-width="5"/>`; },
  pheasant: () => `<path d="M-52-32q18 10 34 30q16-12 34-6q8-18 24-14l14 6-14 6q0 38-34 40t-40-26z" fill="${C.teal}"/><path d="M-14 2q22-6 28 16" ${none} stroke="${C.gold}" stroke-width="6"/><circle cx="38" cy="-18" r="3" fill="${INK}" stroke="none"/>`,
  bug: () => `<path d="M-30-14l-14-10M-34 2h-16M-30 18l-14 10M30-14l14-10M34 2h16M30 18l14 10" ${none} stroke-width="5"/><ellipse cy="4" rx="34" ry="28" fill="${C.red}"/><path d="M0-24v56" ${none}/><circle cy="-30" r="14" fill="${C.dark}"/><circle cx="-16" cy="2" r="5" fill="${INK}"/><circle cx="16" cy="12" r="5" fill="${INK}"/>`,
  nest: () => `<path d="M-46 0h92q-4 34-46 34T-46 0z" fill="${C.brown}"/><path d="M-36 8l18 18M-10 6l14 22M18 6l-16 20M38 8L20 26" ${none} stroke-width="3.5"/>`,
  scarf: () => `<path d="M-34-20q34 14 68 0v20q-34 14-68 0z" fill="${C.red}"/><path d="M8 4v38h18V0z" fill="${C.red}"/>`,
  shirt: (a) => `<path d="M-16-40l-34 18 12 22 12-6v48h52V-6l12 6 12-22-34-18q-16 12-32 0z" fill="${colorOf(a, C.teal)}"/>`,
  dots: (a) => { const n = Number(a.find((x) => /^\d+$/.test(x))); const c = colorOf(a, C.red); const cols = Math.ceil(Math.sqrt(n)); const step = 112 / cols; return Array.from({ length: n }, (_, i) => `<circle cx="${(i % cols) * step - (cols - 1) * step / 2}" cy="${Math.floor(i / cols) * step - (Math.ceil(n / cols) - 1) * step / 2}" r="${step * .34}" fill="${c}"/>`).join(''); },
  sparkles: () => `<g transform="translate(-40 -28) scale(.5)">${'<path d="M0-30q5 25 30 30q-25 5-30 30q-5-25-30-30q25-5 30-30z" fill="#ffd23f"/>'}</g><g transform="translate(36 -10) scale(.7)">${'<path d="M0-30q5 25 30 30q-25 5-30 30q-5-25-30-30q25-5 30-30z" fill="#ffd23f"/>'}</g><g transform="translate(-10 34) scale(.4)">${'<path d="M0-30q5 25 30 30q-25 5-30 30q-5-25-30-30q25-5 30-30z" fill="#ffd23f"/>'}</g>`,
};
