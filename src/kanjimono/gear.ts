// Little pixel accessories that hint at each kanji's meaning. Letters pick a colour.
export const INKS: Record<string, string> = {
  o: '#2b2036', w: '#ffffff', m: '#fdf8ef', y: '#ffd23f', Y: '#e8a020', r: '#e0483e', R: '#a82c38', p: '#ff8ab0', P: '#d9568c',
  b: '#4aa6ee', B: '#2a6cc0', c: '#bfeaff', g: '#74bf48', G: '#3f8a3a', n: '#a8673a', N: '#7a4a24', s: '#c3cdd8', S: '#7b859c', l: '#a884ea', L: '#6a42c0', t: '#f4c79c', k: '#3a3640',
};

// Dice for one to six, then the same tile with more pips, so the number can always be counted.
// Each row is the top, middle and bottom line of pips, with a clear margin all round.
const line = (pips: string) => `..${[...pips].join('.')}..`;
const blank = '.........';
const PIPS: string[][] = [
  ['...', '.r.', '...'], ['..r', '...', 'r..'], ['..r', '.r.', 'r..'], ['r.r', '...', 'r.r'], ['r.r', '.r.', 'r.r'],
  ['r.r', 'r.r', 'r.r'], ['r.r', 'rrr', 'r.r'], ['rrr', 'r.r', 'rrr'], ['rrr', 'rrr', 'rrr'],
].map(([a, b, c]) => [blank, blank, line(a), blank, line(b), blank, line(c), blank, blank]);
// Ten has a fuller middle row of four.
PIPS.push([blank, blank, line('rrr'), blank, '.r.r.r.r.', blank, line('rrr'), blank, blank]);
const die = (pips: string[]) => ['.ooooooooo.', ...pips.map((row) => `o${row.replace(/\./g, 'm')}o`), '.ooooooooo.'];

export const GEAR: Record<string, string[]> = {
  ...Object.fromEntries(PIPS.map((pips, i) => [`die${i + 1}`, die(pips)])),
  speech: ['.ooooooo.', 'ommmmmmmo', 'omlmlmlmo', 'ommmmmmmo', '.ooooooo.', '..oo.....', '..o......'],
  question: ['.ooooooo.', 'ommrrrmmo', 'ommmmrmmo', 'ommmrmmmo', 'ommmmmmmo', 'ommmrmmmo', '.ooooooo.', '..oo.....'],
  book: ['ooooooooo', 'omrrormmo', 'omrrormmo', 'omrrormmo', 'omrrormmo', 'ooooooooo'],
  up: ['...oo...', '..obbo..', '.obbbbo.', 'oobbbboo', '..obbo..', '..obbo..', '..obbo..', '..oooo..'],
  down: ['..oooo..', '..obbo..', '..obbo..', '..obbo..', 'oobbbboo', '.obbbbo.', '..obbo..', '...oo...'],
  right: ['....oo...', '....oyo..', 'oooooyyo.', 'oyyyyyyyo', 'oooooyyo.', '....oyo..', '....oo...'],
  left: ['...oo....', '..oyo....', '.oyyooooo', 'oyyyyyyyo', '.oyyooooo', '..oyo....', '...oo....'],
  clock: ['..ooooo..', '.ommmmmo.', 'ommmommmo', 'ommmommmo', 'ommmoormo', 'ommmmmmmo', '.ommmmmo.', '..ooooo..'],
  calendar: ['.o.o.o.o.', 'ooooooooo', 'orrrrrrro', 'ooooooooo', 'omomomomo', 'ommmmmmmo', 'omomomomo', 'ooooooooo'],
  door: ['ooooooo', 'onnnnno', 'onNNNno', 'onnnnno', 'onnnyno', 'onNNNno', 'onnnnno', 'ooooooo'],
  lens: ['.oooo...', 'ocwcco..', 'occcco..', 'occcco..', '.oooooo.', '....oYYo', '.....oYo', '......oo'],
  fork: ['s.s.s...', 's.s.s..S', 's.s.s..S', 'sssss..S', '..s...SS', '..s...SS', '..s....S', '..s....S'],
  teacup: ['..w.w....', '...w.....', 'ooooooo..', 'oGGGGGoo.', 'ommmmmo.o', 'ommmmmooo', '.ommmo...', '..ooo....'],
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
  // Nature and weather.
  sun: ['y...y...y', '.y.ooo.y.', '..oyyyo..', 'yoyyyyyoy', '..oyyyo..', '.y.ooo.y.', 'y...y...y'],
  sunrise: ['....y....', '.y..y..y.', '...ooo...', '..oyyyo..', 'oooooooo.', 'obbbbbbbo', 'ooooooooo'],
  sunset: ['...ooo...', '..orrro..', '.orryrro.', 'ooooooooo', '.Y.Y.Y.Y.', 'obbbbbbbo', 'ooooooooo'],
  umbrella: ['....ooo....', '..oowrwoo..', '.orwwrwwro.', '.orwwrwwro.', 'orrwwrwwrro', 'orrwwrwwrro', 'oo..ooo..oo', '.....o.....', '.o...o.....', '..ooo......'],
  swirl: ['..ccccc..', '.c.....c.', '.c.ccc.c.', '.c.c.c.c.', '.c...c.c.', '..ccc..c.', 'ccc...c..'],
  snow: ['....c....', '.c..c..c.', '..c.c.c..', '...ccc...', 'cccccccc.', '...ccc...', '..c.c.c..', '.c..c..c.', '....c....'],
  wave: ['..ooo.....', '.obbbo.oo.', 'obcbbbobbo', 'obbbbbbbbo', 'obbbbbbbbo', 'oooooooooo'],
  blossom: ['..oo.oo..', '.oppoppo.', '.oppppPo.', 'oppyyyppo', 'oppyyyppo', '.oppppPo.', '.oppoppo.', '..oo.oo..'],
  maple: ['....o....', '...oro...', '.o.oro.o.', '.orrrrro.', 'orrrrrrro', '.oorRroo.', '...oNo...', '...oN....'],
  wheat: ['.Y..Y..Y.', 'YyY.YyY.Y', '.Y.Y.Y.Y.', 'YyY.YyY.Y', '.Y..Y..Y.', '.G..G..G.', '.G..G..G.', '.GG.G.GG.'],
  globe: ['..ooooo..', '.obgbbbo.', 'obggbbgbo', 'obbgbggbo', 'obbbbbgbo', '.obbgbbo.', '..ooooo..'],
  flower: ['.o.o.', 'opopo', '.oyo.', 'opopo', '.oGo.', '..G..'],
  // People and bodies.
  tie: ['.ooooo.', '.orrro.', '..oro..', '.orrro.', '.orrro.', '.orrro.', '..oro..', '...o...'],
  ribbon: ['oo...oo', 'opo.opo', 'oppoppo', 'opppppo', 'oppoppo', 'opo.opo', 'oo...oo'],
  ball: ['..ooooo..', '.orrwrro.', 'orrwwwrro', 'owwwwwwwo', 'obbwwwbbo', '.obbwbbo.', '..ooooo..'],
  ear: ['.y......', '..y..y..', '...y..y.', '...y..y.', '...y..y.', '..y..y..', '.y......'],
  mitt: ['...oo.oo.', '..ottotto', 'ooototoo.', 'ottttttto', 'ottttttto', '.otttttto', '..oooooo.'],
  shoe: ['ooooo....', 'orrrro...', 'orrrrrooo', 'orrrrrrro', 'ommmmmmmo', 'ooooooooo'],
  dumbbell: ['oo.....oo', 'oSo...oSo', 'oSoooooSo', 'oSsssssSo', 'oSoooooSo', 'oSo...oSo', 'oo.....oo'],
  // Language and study.
  note: ['...ooooo', '...ooooo', '...o..oo', '...o...o', 'ooo..ooo', 'oooo.ooo', '.oo...oo'],
  pencil: ['......oo', '.....oro', '....oyoo', '...oyyo.', '..oyyo..', '.otyo...', '.oto....', 'oo......'],
  paper: ['ooooooo.', 'ommmmmoo', 'ommmmmmo', 'omkkkkmo', 'ommmmmmo', 'omkkkkmo', 'ommmmmmo', 'oooooooo'],
  map: ['ooooooooo', 'ogggbbggo', 'oggbbgggo', 'ogrggbggo', 'ogggggbbo', 'ooooooooo'],
  camera: ['..ooo....', 'ooooooooo', 'okkkoookk', 'okkocwokk', 'okkoccokk', 'okkkoookk', 'ooooooooo'],
  palette: ['..ooooo..', '.ommmmmo.', 'omrmmbmmo', 'ommmmmmoo', 'omymgmo..', '.ommmmmo.', '..ooooo..'],
  check: ['.......oo', '......ogo', '.....oggo', 'oo..oggo.', 'ogooggo..', '.ogggo...', '..ogo....', '...o.....'],
  bulb: ['..ooooo..', '.oyyyyyo.', 'oyywyyyyo', 'oyyyyyyyo', '.oyyyyyo.', '..ooooo..', '..osSso..', '...ooo...'],
  cap: ['....oo....', '..ooLLoo..', 'ooLLLLLLoo', '..ooLLoo.y', '..oLLLLo.y', '..oooooo.y'],
  school: ['....r....', '...ooo...', '..ommmo..', 'ooommmooo', 'ommmmmmmo', 'omcmmmcmo', 'ommonommo', 'ooooooooo'],
  tomato: ['...oGo...', '.ooGGGoo.', 'orrGGGrro', 'orwrrrrro', 'orrrrrrro', '.orrrrro.', '..ooooo..'],
  dots: ['.k...k.', 'kkk.kkk', '.k...k.', '...k...', '..kkk..', '...k...'],
  // Food and animals.
  bowl: ['..wmwmw..', '.wmwmwmw.', 'ooooooooo', 'orrmrrmro', '.orrrrro.', '..ooooo..'],
  meat: ['..oooo...', '.orRrro..', 'orrrRrroo', 'orRrrrrmo', '.orrrroo.', '..oooo...'],
  fish: ['...ooo..o', '.oobbboob', 'obwbbbbbo', 'obbbbbbbo', '.oobbboob', '...ooo..o'],
  feather: ['.....ooo', '...oyyyo', '..oyyyyo', '.oyyyyo.', '.oyyoo..', 'oNoo....', 'o.......'],
  paw: ['.o.o.o.', 'ononono', '.o.o.o.', '..ooo..', '.onnno.', 'onnnnno', '.ooooo.'],
  // Places and travel.
  house: ['....o....', '...oro...', '..orrro..', '.orrrrro.', 'ooooooooo', '.ommommo.', '.ommommo.', '.ooooooo.'],
  office: ['.ooooooo.', '.olclclo.', '.olllllo.', '.olclclo.', '.olllllo.', '.olclclo.', '.ollnllo.', 'ooooooooo'],
  medkit: ['...ooo...', '..o...o..', 'ooooooooo', 'ommmrmmmo', 'ommrrrmmo', 'ommmrmmmo', 'ooooooooo'],
  train: ['.ooooooo.', 'obbbbbbbo', 'ocmcmcmco', 'obbbbbbbo', 'obbbbbbbo', '.ooooooo.', '.oo...oo.'],
  car: ['...oooo...', '..ocbcbo..', '.oooooooo.', 'orrrrrrrro', 'orrrrrrrro', '.oooooooo.', '..oo..oo..'],
  signpost: ['oooooooo.', 'onnnnnnno', 'onnnnnnno', 'oooooooo.', '...on....', '...on....', '...on....', '.ggoogg..'],
  flag: ['oo.......', 'oooooooo.', 'omrrrrmo.', 'omrrrrmo.', 'oooooooo.', 'oo.......', 'oo.......', 'oo.......'],
  awning: ['ooooooooo', 'ormrmrmro', 'ormrmrmro', '.ooooooo.', '.ommomno.', '.ommomno.', '.ooooooo.'],
  box: ['ooooooooo', 'onnYYnnno', 'ooooooooo', 'onnnnnnno', 'onnnnnnno', 'onnnnnnno', 'ooooooooo'],
  suitcase: ['...ooo...', '..o...o..', 'ooooooooo', 'onnYnYnno', 'onnnnnnno', 'onnYnYnno', 'ooooooooo'],
  hammer: ['ooooooo..', 'oSSSSSo..', 'oSSSSSooo', 'ooooooonn', '.....onnn', '....onnno', '...onnno.', '...ooo...'],
  bed: ['..lll....', '....l.ll.', '...l...l.', '..lll.l..', 'oo....ll.',  'omoooooo.', 'ommbbbbbo', 'ooooooooo'],
  shirt: ['.oo...oo.', 'oppooppPo', 'ooppppoo.', '..opppo..', '..opppo..', '..opppo..', '..ooooo..'],
  crown: ['y..y..y', 'yy.y.yy', 'yyyyyyy', 'yryyryy', 'YYYYYYY'],
  bell: ['...ooo...', '..oYYYo..', '.oyyyyyo.', '.oyyyyyo.', 'oyyyyyyyo', 'ooooooooo', '...oYo...'],
  rock: ['...oooo..', '..osssso.', '.osgsssSo', 'osssSssso', 'oSSSSSSSo', '.ooooooo.'],
  ruler: ['ooooooooo', 'oyoyoyoyo', 'oyyyyyyyo', 'ooooooooo'],
  sparkle: ['...y.....', '...y..y..', 'yyyyy.y..', '...y.yyy.', '...y..y..', '......y..'],
  stars: ['.y.....y.', 'yyy...yyy', '.y..y..y.', '...yyy...', '....y....'],
  skull: ['.ooooo.', 'ommmmmo', 'okmmkmo', 'ommmmmo', '.omomo.', '..ooo..'],
  stop: ['..ooooo..', '.orrrrro.', 'orrrrrrro', 'ommmmmmmo', 'orrrrrrro', '.orrrrro.', '..ooooo..'],
  scissors: ['s.....s', '.s...s.', '..s.s..', '...s...', '.ss.ss.', 's.s.s.s', '.s...s.'],
  compass: ['..ooooo..', '.ommrmmo.', 'ommrrrmmo', 'ommmommmo', 'ommSSSmmo', '.ommSmmo.', '..ooooo..'],
  target: ['..ooooo..', '.orrrrro.', 'orrmmmrro', 'ormrrrmro', 'orrmmmrro', '.orrrrro.', '..ooooo..'],
  link: ['.yy..yy.', 'y..yy..y', 'y..yy..y', '.yy..yy.'],
};
// Shop and bag icons.
// A manga cover: a coloured jacket with a dark spine and a small picture on the front.
const cover = (face: string, spine: string, picture: string[]) => [
  'ooooooooo', `o${spine}${face.repeat(6)}o`, ...picture.map((row) => `o${spine}${row.replaceAll('.', face)}${face}o`), `o${spine}${face.repeat(6)}o`, 'ooooooooo',
];

export const ICONS: Record<string, string[]> = {
  melon: ['...ooo...', '.oogggoo.', 'ogGgGgGgo', 'ogggGgggo', 'oGgGgGgGo', '.oyyyyyo.', '..ooooo..'],
  rice: ['....o....', '...omo...', '..ommmo..', '.ommmmmo.', 'ommmmmmmo', 'omkkkkkmo', 'okkkkkkko', '.ooooooo.'],
  soda: ['...ooo...', '...ocwo..', '...ooo...', '..obbbo..', '.obcbbbo.', '.obcbbbo.', '.obbbbbo.', '.ooooooo.'],
  teacup: ['..w.w....', '...w.....', 'ooooooo..', 'oGGGGGoo.', 'ommmmmo.o', 'ommmmmooo', '.ommmo...', '..ooo....'],
  bento: ['ooooooooo', 'ommmromgo', 'ommmromgo', 'oooooooo.', 'ononnomno', 'ononnoomo', 'ooooooooo'],
  magazine: ['ooooooo..', 'orrrrroo.', 'ommmmmoo.', 'omkkkmoo.', 'omkkkmoo.', 'ommmmmoo.', 'ooooooo..'],
  capsule: ['..ooooo..', '.orrrrro.', 'orwrrrrro', 'ooooooooo', 'ommmmmmmo', '.ommmmmo.', '..ooooo..'],
  plush: ['.oo...oo.', 'onnooonno', 'onnnnnnno', 'onknnnkno', 'onntttnno', '.onnknno.', 'orrrrrrro', '.oo...oo.'],
  ink: ['...ooo...', '...oso...', '..ooooo..', '.okkkkko.', '.okSkkko.', '.okkkkko.', '.okkkkko.', '.ooooooo.'],
  goldink: ['...ooo...', '...oyo...', '..ooooo..', '.oyyyyyo.', '.oywyyyo.', '.oyyyyyo.', '.oYYYYYo.', '.ooooooo.'],
  sakuramochi: ['..ggg....', '.oGgoooo.', 'oppppppPo', 'opwpppppo', 'oppppppPo', '.oPPPPPo.', '..ooooo..'],
  ayu: ['..oooo..o', '.osssSoso', 'osksssSoo', 'ossssSoso', '.ooooo..o'],
  onsenegg: ['...ooo...', '..ommmo..', '.ommwmmo.', '.ommmmmo.', 'ooooooooo', 'onNNNNNno', '.ooooooo.'],
  dango: ['.ooo.', 'opppo', 'opppo', '.ooo.', 'ommmo', 'ommmo', '.ooo.', 'ogggo', 'ogggo', '.ooo.', '..n..'],
  miniplush: ['oo...oo', 'onooono', 'onnnnno', 'oknnnko', 'onntnno', '.ooooo.'],
  keychain: ['..sss..', '.s...s.', '..sss..', '...s...', '.ooooo.', 'orrrrro', 'orwrrro', 'orrrrro', '.ooooo.'],
  mikofig: ['..ooo..', '.okkko.', '.ottto.', '.ommmo.', 'ommmmmo', '.orrro.', '.orrro.', '.ooooo.'],
  aoifig: ['..ooo..', '.oBBBo.', '.ottto.', '.okkko.', 'okkkkko', '.okkko.', '.okkko.', '.ooooo.'],
  sticker: ['....o....', '...oro...', 'ooorrrooo', 'orrrwrrro', '.orrrrro.', '.orrorro.', '.oo...oo.'],
  cat: ['.o...o.', 'omo.omo', 'ommmmmo', 'omkmkmo', 'ommrmmo', 'ormmmro', '.oyyyo.', '.ooooo.'],
  torii: ['ooooooooo', 'orrrrrrro', 'ooooooooo', '.orrrrro.', '.or...ro.', '.or...ro.', '.oo...oo.'],
  threepieces: cover('r', 'R', ['.ggg.', 'gGgGg', '.ggg.']),
  dragonbox: cover('y', 'Y', ['ooooo', 'onnno', 'ooooo']),
  snacktitan: cover('n', 'N', ['.yyy.', 'yyyyy', '.yyy.']),
  demonlaundry: cover('l', 'L', ['wwwww', '.www.', '.www.']),
  deathnotepad: cover('k', 'o', ['.mmm.', '.mmm.', '.mmm.']),
  heroaccounts: cover('b', 'B', ['.yyy.', 'yYyYy', '.yyy.']),
  sailornoon: cover('p', 'P', ['y.y.y', '.yyy.', 'y.y.y']),
  huntergatherer: cover('g', 'G', ['.n.n.', 'nnnnn', '.nnn.']),
  charm: ['ooooooo', 'orrrrro', 'ommmmmo', 'omkkkmo', 'ommkmmo', 'omkkkmo', 'ommrmmo', 'ooooooo'],
};

// Open shapes with no outline of their own, which need one to show up against the sky.
export const LOOSE = ['swirl', 'snow', 'sparkle', 'stars', 'fork', 'ear', 'scissors', 'link', 'wheat', 'dots', 'sun', 'sunrise'];
// Accessories that sit on top of the kanji, not beside it.
export const ON_TOP = ['sprout', 'moon', 'flame', 'crown', 'cap', 'tomato', 'umbrella', 'flower'];
// Held low at the side, rather than floating by the top corner.
export const LOW = ['wave', 'clock', 'calendar', 'lens', 'fork', 'teacup', 'bag', 'coin', 'door', 'book', 'right', 'left', 'down', 'pencil', 'car', 'shoe', 'bowl', 'meat', 'signpost', 'box', 'suitcase', 'train', ...PIPS.map((_, i) => `die${i + 1}`), 'palette', 'hammer', 'house', 'school'];

// Which colour and accessory each kanji gets. A blank colour means one of its own.
export const PICKS: [string, string, string][] = [
  ...[...'一二三四五六七八九十'].map((k, i): [string, string, string] => [k, '', `die${i + 1}`]),
  ['百千万円金銀', 'yellow', 'coin'], ['時分半午早待', 'orange', 'clock'], ['年週曜今毎代世', 'pink', 'calendar'],
  ['明昼夏', 'yellow', 'sun'], ['朝', 'orange', 'sunrise'], ['夕', 'orange', 'sunset'], ['夜', 'lilac', 'moon'], ['天空', 'sky', 'cloud'], ['雨', 'sky', 'umbrella'],
  ['風気', 'sky', 'swirl'], ['電', 'yellow', 'bolt'], ['青', 'sky', 'drop'], ['海洋', 'sky', 'wave'], ['冬', 'sky', 'snow'], ['春', 'pink', 'blossom'], ['花', 'pink', 'blossom'],
  ['秋', 'orange', 'maple'], ['田野', 'green', 'wheat'], ['土生', 'green', 'sprout'], ['地', 'mint', 'globe'], ['場', 'green', 'flag'],
  ['人友親族', 'pink', 'heart'], ['男父兄弟', 'sky', 'tie'], ['女母姉妹', 'pink', 'ribbon'], ['子', 'pink', 'heart'], ['私自者', 'peach', 'star'], ['心', 'red', 'heart'],
  ['目見', 'peach', 'lens'], ['耳聞', 'lilac', 'ear'], ['手持', 'peach', 'mitt'], ['足歩走', 'peach', 'shoe'], ['体力強重', 'red', 'dumbbell'],
  ['言話語説口', 'lilac', 'speech'], ['問何題', 'pink', 'question'], ['答正真同', 'green', 'check'], ['音歌', 'lilac', 'note'], ['読本', 'orange', 'book'], ['書字文写', 'lilac', 'pencil'],
  ['紙', 'white', 'paper'], ['図', 'sky', 'map'], ['画映', 'lilac', 'camera'], ['色', 'pink', 'palette'], ['赤', 'red', 'tomato'], ['白', 'white', 'cloud'], ['黒', 'dark', 'dots'],
  ['学', 'lilac', 'cap'], ['校教', 'yellow', 'school'], ['習勉試験研究', 'lilac', 'pencil'], ['知理考思意', 'yellow', 'bulb'],
  ['上起立高', 'lilac', 'up'], ['下', 'sky', 'down'], ['右前発行来通', 'green', 'right'], ['左後帰去', 'green', 'left'], ['長広', 'peach', 'ruler'],
  ['開門外出入間', 'sky', 'door'], ['家屋室住', 'peach', 'house'], ['館堂院社業員', 'lilac', 'office'], ['医病', 'red', 'medkit'], ['駅', 'lilac', 'train'],
  ['車運転送動', 'mint', 'car'], ['道近方', 'green', 'signpost'], ['国', 'red', 'flag'], ['京町公', 'lilac', 'house'], ['店', 'red', 'awning'], ['売', 'orange', 'horn'],
  ['買', 'peach', 'bag'], ['品物', 'peach', 'box'], ['食味料', 'orange', 'fork'], ['飲茶', 'green', 'teacup'], ['飯', 'orange', 'bowl'], ['肉', 'red', 'meat'], ['牛', 'peach', 'bell'],
  ['魚', 'sky', 'fish'], ['鳥', 'yellow', 'feather'], ['犬', 'peach', 'paw'], ['服着', 'pink', 'shirt'], ['休安楽', 'mint', 'bed'], ['旅', 'mint', 'suitcase'],
  ['工作建仕用', 'orange', 'hammer'], ['主', 'yellow', 'crown'], ['新', 'pink', 'sparkle'], ['古', 'peach', 'rock'], ['多', '', 'stars'], ['少小', '', 'sparkle'], ['大', 'red', 'stars'],
  ['東西南北', 'mint', 'compass'], ['中', 'red', 'target'], ['先特', 'yellow', 'star'], ['名事', 'peach', 'paper'], ['会集', 'pink', 'link'], ['元', 'pink', 'sparkle'],
  ['計', 'mint', 'ruler'], ['台', 'peach', 'box'], ['度', 'peach', 'ruler'], ['界英', 'mint', 'globe'], ['使', 'orange', 'hammer'], ['始', 'green', 'flag'], ['終', 'green', 'check'],
  ['有', 'peach', 'bag'], ['急', 'yellow', 'bolt'], ['注', 'sky', 'drop'], ['漢', 'orange', 'book'], ['不', 'red', 'stop'], ['以', 'green', 'right'], ['借貸', 'yellow', 'coin'], ['質', 'pink', 'question'],
  ['止', 'red', 'stop'], ['切別', 'mint', 'scissors'], ['死悪', 'dark', 'skull'],
];
