import { SIGNS, type LevelId } from './story.ts';

export const SOLID = '~THRWtsPKwVcbonSCjexyihQplBkLvzgaMGEDNIJ';

export interface Npc { x: number; y: number; name: string; look?: string; lines: string[]; heal?: boolean; shop?: boolean; charms?: string; master?: LevelId; guide?: boolean; mom?: boolean; after?: string }
export interface Door { x: number; y: number; to: string; tx: number; ty: number; dir: string }
export interface Gate { quest?: string; trial?: LevelId; line: string }
export interface GameMap { name: string; levels?: [number, number]; rows: string[]; east?: string; west?: string; gate?: Gate; npcs: Npc[]; doors?: Door[]; room?: boolean; sky?: string; tune?: string }

// Rooms fill the 15 by 10 screen. The rest of the 24 by 16 grid stays dark.
const room = (rows: string[]) => [...rows.map((r) => r.padEnd(24, 'V')), ...Array<string>(6).fill('V'.repeat(24))];
const road = ','.repeat(24);

export const MAPS: Record<string, GameMap> = {
  village: {
    name: 'Sakura Village', east: 'fields',
    gate: { quest: 'first', line: 'Neighbour: Off so soon? Kanji Bear is expecting you at the dojo first.' },
    doors: [
      { x: 4, y: 4, to: 'home', tx: 7, ty: 8, dir: 'up' }, { x: 5, y: 4, to: 'home', tx: 7, ty: 8, dir: 'up' },
      { x: 18, y: 7, to: 'dojo', tx: 7, ty: 8, dir: 'up' }, { x: 19, y: 7, to: 'dojo', tx: 7, ty: 8, dir: 'up' },
      { x: 28, y: 4, to: 'shop-village', tx: 7, ty: 8, dir: 'up' }, { x: 29, y: 4, to: 'shop-village', tx: 7, ty: 8, dir: 'up' },
      { x: 27, y: 13, to: 'charm-village', tx: 7, ty: 8, dir: 'up' }, { x: 28, y: 13, to: 'charm-village', tx: 7, ty: 8, dir: 'up' },
    ],
    npcs: [
      { x: 13, y: 4, name: 'Miko', look: 'miko', heal: true, lines: ['Welcome to the shrine. Let me say a prayer for your team.'] },
      { x: 15, y: 8, name: 'Neighbour', look: 'oldwoman', lines: ['Kanji Bear taught my grandmother to read. The dojo is the house with the red curtain.'] },
      { x: 27, y: 8, name: 'Shopper', look: 'woman', lines: ['The 6-7 Kombini past the dojo sells rice balls. The charm shop is just south of it.'] },
      { x: 31, y: 12, name: 'Old fisher', look: 'oldman', lines: ['East of here the road runs to the rice fields. Mind the tall grass.'] },
      { x: 24, y: 2, name: 'Young reader', look: 'girl', lines: ['I can read 三 now! It only took me all week.'] },
    ],
    rows: [
      'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
      'K................................K.K',
      'K..HHHH.....sss.....K......QQQQ....K',
      'K..HHHH.....sss............QQQQ....K',
      'K..WWWW.....,,,............QQQQ....K',
      'K....,......,,,..HHHH.......,,.....K',
      'K....,,,,,,,,,,..HHHH.......,,.....K',
      'K......,..,,t,t..WWWW.......,,.....K',
      'K......,..,,,,,....,........,,.....K',
      'K..K...,,,,,,,,,,,,,,,,,,,,,,,,,,,,,',
      'K......,..,,,,,,,,,,,,,,,,,,,,,,,,,,',
      'K......,...........,......HHHH.....K',
      'K..~~~~....K.....K........HHHH...K.K',
      'K..~~~~...................WWWW.....K',
      'K..................................K',
      'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
    ],
  },
  fields: {
    name: 'Rice Fields', levels: [3, 7], west: 'village', east: 'kawabe',
    gate: { quest: 'farmer', line: "Farmer: The Kawabe bridge is shut until the harvest is counted. Come and talk to me!" },
    npcs: [{ x: 12, y: 3, name: 'Farmer', look: 'farmer', lines: ['Kanji hide in the tall rice. Every step could wake one.'] }],
    rows: [
      'TTTTTTTTTTTTTTTTTTTTTTTT',
      'T""""""""rrrrrr""""""""T',
      'T""""""""rrrrrr""""""""T',
      'T""""",,,,,,,,,,,,,""""T',
      'T""""",rrrrrrrrrr,,""""T',
      'T""""",rrrrrrrrrr,"""""T',
      'T""""",,,,,,,,,,,,"""""T',
      'T~~~~~~~,,,~~~~~~~~~~""T',
      'T~~~~~~~,,,~~~~~~~~~~""T',
      road, road,
      'T""""""""""""""""""""""T',
      'T"""""rrrrrrr""""""""""T',
      'T"""""rrrrrrr""""""""""T',
      'T""""""""""""""""""""""T',
      'TTTTTTTTTTTTTTTTTTTTTTTT',
    ],
  },
  kawabe: {
    name: 'Kawabe Town', levels: [7, 10], west: 'fields', east: 'forest',
    gate: { quest: 'market', line: 'Stall keeper: The forest road closes on market day. Help me out first!' },
    doors: [
      { x: 4, y: 4, to: 'school', tx: 7, ty: 8, dir: 'up' }, { x: 5, y: 4, to: 'school', tx: 7, ty: 8, dir: 'up' },
      { x: 12, y: 4, to: 'shop-kawabe', tx: 7, ty: 8, dir: 'up' }, { x: 13, y: 4, to: 'shop-kawabe', tx: 7, ty: 8, dir: 'up' },
      { x: 18, y: 5, to: 'charm-kawabe', tx: 7, ty: 8, dir: 'up' }, { x: 19, y: 5, to: 'charm-kawabe', tx: 7, ty: 8, dir: 'up' },
    ],
    npcs: [
      { x: 12, y: 8, name: 'Stall keeper', look: 'oldman', lines: ['Fresh tea and honest prices.'] },
      { x: 17, y: 7, name: 'Aoi', look: 'rival', after: 'roll', lines: ['Keep up, if you can.'] },
      { x: 9, y: 5, name: 'Officer', look: 'police', lines: ['Stay on the road after dark. The kanji by the river get lively.'] },
      { x: 2, y: 7, name: 'Tea seller', look: 'auntie', heal: true, lines: ['Sit down and have some tea. It does wonders.'] },
    ],
    rows: [
      'TTTTTTTTTTTTTTTTTTTTTTTT',
      'T.HHHHHH...............T',
      'T.HHHHHH...QQQQ........T',
      'T.HHHHHH...QQQQ..HHHH..T',
      'T.WWWWWW...QQQQ..HHHH..T',
      'T....,......,....WWWW..T',
      'T....,,,,,,,,,,,,,,,...T',
      'T.......,..,.....,.....T',
      'T.......,..,.....,.....T',
      road, road,
      'T""""""""""""""""""""""T',
      'T~~~~~~~~~~~~~~~~~~~~~~T',
      'T~~~~~~~~~~~~~~~~~~~~~~T',
      'T""""""""""""""""""""""T',
      'TTTTTTTTTTTTTTTTTTTTTTTT',
    ],
  },
  forest: {
    name: 'Cedar Forest', levels: [10, 14], west: 'kawabe', east: 'pass',
    gate: { trial: 'N5', line: 'Cedar Master: Nobody climbs the mountain without passing my N5 trial.' },
    npcs: [
      { x: 8, y: 13, name: 'Lost child', look: 'child', lines: ['Thank you for finding the way!'] },
      { x: 11, y: 8, name: 'Aoi', look: 'rival', after: 'lost', lines: ['The mountain is waiting.'] },
      { x: 17, y: 2, name: 'Cedar Master', look: 'master', master: 'N5', lines: [] },
    ],
    rows: [
      'TTTTTTTTTTTTTTTTTTTTTTTT',
      'TT""""""TTTTTT""""""""TT',
      'TT"",,""TTTTTT"",,,,""TT',
      'TT"",,""""""""""",,""TTT',
      'TT"",,,,,,,,,,,,,,,""TTT',
      'TTTT"",,TTTTTTT",,""TTTT',
      'TTTT"",,TTTTTTT",,""TTTT',
      'TTTT"",,TTTTTTT",,""TTTT',
      'TTTT"",,"""""""",,""TTTT',
      road, road,
      'TTT""""""TTTTTT""""""TTT',
      'TTT""~~""TTTTTT""""""TTT',
      'TTT""~~""""""""""""""TTT',
      'TTT"""""""TTTT""""""TTTT',
      'TTTTTTTTTTTTTTTTTTTTTTTT',
    ],
  },
  pass: {
    name: 'Mountain Pass', levels: [14, 18], west: 'forest', east: 'onsen',
    gate: { quest: 'seasons', line: 'Mountain guardian: The road east is closed until the seasons return.' },
    npcs: [
      { x: 19, y: 2, name: 'Mountain guardian', look: 'guardian', lines: ['The mountain is at peace. Walk well.'] },
      { x: 7, y: 7, name: 'Pilgrim', look: 'pilgrim', heal: true, lines: ['A hot spring! Your team feels restored.'] },
      { x: 13, y: 5, name: 'Hiker', look: 'farmer', lines: ['Up here, you can read the whole sky.'] },
    ],
    rows: [
      'PPPPPPPPPPPPPPPPPPPPPPPP',
      'P"""""""PPPPPPPP,,t,t,,P',
      'P"""""""PPPPPPPP,,,,,,,P',
      'P""""""""""""""",,,,,,,P',
      'P""""""""""""""",,"""""P',
      'PPPP"""",,,,,,,,,""""""P',
      'P"""""",,""""""""""""""P',
      'P"""""",,""""""PPPPPPPPP',
      'P"""""",,""""""PPPPPPPPP',
      road, road,
      'P""""""""""""""""""""""P',
      'P""""PPPP""""""""""""""P',
      'P""""PPPP""""""""""""""P',
      'P""""""""""""""""""""""P',
      'PPPPPPPPPPPPPPPPPPPPPPPP',
    ],
  },
  onsen: {
    name: 'Onsen Town', levels: [18, 22], west: 'pass', east: 'castle',
    gate: { quest: 'doctor', line: 'Doctor: The castle road stays closed until my clinic can be found. Please help!' },
    doors: [
      { x: 4, y: 4, to: 'inn', tx: 7, ty: 8, dir: 'up' }, { x: 5, y: 4, to: 'inn', tx: 7, ty: 8, dir: 'up' },
      { x: 19, y: 4, to: 'shop-onsen', tx: 7, ty: 8, dir: 'up' }, { x: 20, y: 4, to: 'shop-onsen', tx: 7, ty: 8, dir: 'up' },
      { x: 10, y: 13, to: 'charm-onsen', tx: 7, ty: 8, dir: 'up' }, { x: 11, y: 13, to: 'charm-onsen', tx: 7, ty: 8, dir: 'up' },
    ],
    npcs: [
      { x: 18, y: 8, name: 'Doctor', look: 'nurse', heal: true, lines: ['Let me look at your team. Good as new.'] },
      { x: 16, y: 8, name: 'Nurse', look: 'nurse', lines: ['The hot spring does wonders, but the doctor is right here if you need us.'] },
      { x: 10, y: 8, name: 'Aoi', look: 'rival', after: 'doctor', lines: ['Read every sign. I mean it.'] },
    ],
    rows: [
      'PPPPPPPPPPPPPPPPPPPPPPPP',
      'P......................P',
      'P..HHHH....~~~~~~~QQQQ.P',
      'P..HHHH....~~~~~~~QQQQ.P',
      'P..WWWW....~~~~~~~QQQQ.P',
      'P....,.................P',
      'P....,,,,,,,,,,,,,,....P',
      'P.................,....P',
      'P.................,....P',
      road, road,
      'P""""""""HHHH""""""""""P',
      'P""""""""HHHH""""""""""P',
      'P""""""""WWWW""""""""""P',
      'P""""""""""""""""""""""P',
      'PPPPPPPPPPPPPPPPPPPPPPPP',
    ],
  },
  castle: {
    name: 'Castle Town', levels: [22, 26], west: 'onsen', east: 'coast',
    gate: { trial: 'N4', line: "Officer: The sea gate opens only for those who have passed the Castle Scribe's N4 trial." },
    doors: [
      { x: 11, y: 6, to: 'hall', tx: 7, ty: 8, dir: 'up' }, { x: 12, y: 6, to: 'hall', tx: 7, ty: 8, dir: 'up' },
      { x: 3, y: 5, to: 'shop-castle', tx: 7, ty: 8, dir: 'up' }, { x: 4, y: 5, to: 'shop-castle', tx: 7, ty: 8, dir: 'up' },
      { x: 10, y: 13, to: 'charm-castle', tx: 7, ty: 8, dir: 'up' }, { x: 11, y: 13, to: 'charm-castle', tx: 7, ty: 8, dir: 'up' },
    ],
    npcs: [
      { x: 19, y: 7, name: 'Stationmaster', look: 'police', heal: true, lines: ['Trains on time, and a rest for the weary.'] },
      { x: 12, y: 8, name: 'Aoi', look: 'rival', after: 'station', lines: ['Go on. The Scribe is waiting.'] },
      { x: 6, y: 8, name: 'Officer', look: 'police', lines: ['The castle has been quiet since the signs went blank. Too quiet.'] },
      { x: 4, y: 7, name: 'Librarian', look: 'woman', lines: ['Quiet, please.'] },
    ],
    rows: [
      'TTTTTTTTTTTTTTTTTTTTTTTT',
      'T.......CCCCCCCC.......T',
      'T.......CCCCCCCC.......T',
      'T.QQQQ..CCCCCCCC..HHHH.T',
      'T.QQQQ..CCCCCCCC..HHHH.T',
      'T.QQQQ..CCCCCCCC..WWWW.T',
      'T.......CCCCCCCC.......T',
      'T...........,,.........T',
      'T...........,,.........T',
      road, road,
      'T""""""""HHHH""""""""""T',
      'T""""""""HHHH""""""""""T',
      'T""""""""WWWW""""""""""T',
      'T""""""""""""""""""""""T',
      'TTTTTTTTTTTTTTTTTTTTTTTT',
    ],
  },
  coast: {
    name: 'Seaside Road', levels: [26, 30], west: 'castle', east: 'minato',
    gate: { quest: 'tide', line: 'Fisher: The harbour gate is shut while nobody can read the tides. Come and talk to me on the beach!' },
    npcs: [
      { x: 8, y: 11, name: 'Fisher', look: 'oldman', lines: ['The sea gives up its kanji at low tide. Walk the long grass above the beach.'] },
      { x: 15, y: 8, name: 'Aoi', look: 'rival', after: 'tide', lines: ['Slow and steady. Who knew?'] },
      { x: 20, y: 11, name: 'Lifeguard', look: 'worker', heal: true, lines: ['Sit in the shade a moment. Your team looks worn out.'] },
    ],
    rows: [
      'TTTTTTTTTTTTTTTTTTTTTTTT',
      'T""""""""TTTT"""""""""kT',
      'T"""",,""TTTT"""",,,""BT',
      'T"""",,"""""""""",,""""T',
      'T"""",,,,,,,,,,,,,,""""T',
      'T""""""",,""""""""""""kT',
      'T""B""""",,""""""*"""""T',
      'T"""""""",,""""""""""""T',
      'T"""""""",,""""""""""""T',
      ',,,,,,,,,,,,,,,,,,,,,,,,',
      ',,,,,,,,,,,,,,,,,,,,,,,,',
      'k,,,,,,,,,,,,,,,,,,,,,,k',
      'k,,,,~~~~,,,,,,~~~~~,,,k',
      '~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~',
    ],
  },
  minato: {
    name: 'Minato Harbour', levels: [30, 33], west: 'coast', east: 'bamboo',
    gate: { quest: 'cargo', line: 'Harbour master: Nobody leaves port until my ledger is sorted. Lend me a hand!' },
    doors: [
      { x: 2, y: 4, to: 'shop-minato', tx: 7, ty: 8, dir: 'up' }, { x: 3, y: 4, to: 'shop-minato', tx: 7, ty: 8, dir: 'up' },
      { x: 10, y: 4, to: 'charm-minato', tx: 7, ty: 8, dir: 'up' }, { x: 11, y: 4, to: 'charm-minato', tx: 7, ty: 8, dir: 'up' },
    ],
    npcs: [
      { x: 12, y: 8, name: 'Harbour master', look: 'police', lines: ['Ships in, ships out, and every one of them on the page.'] },
      { x: 5, y: 8, name: 'Net mender', look: 'oldwoman', heal: true, lines: ['Sit by me and rest. Mending is slow work, and so is healing.'] },
      { x: 17, y: 11, name: 'Shipwright', look: 'artisan', lines: ['A boat is only as good as the plans you can read.'] },
      { x: 21, y: 6, name: 'Sailor', look: 'sailor', lines: ['The cape lighthouse has been dark for weeks. We steer by guesswork now.'] },
    ],
    rows: [
      'TTTTTTTTTTTTTTTTTTTTTTTT',
      'T""""""""""""""""""""""T',
      'T.QQQQ...HHHH....HHHH..T',
      'T.QQQQ...HHHH.l..HHHH..T',
      'T.QQQQ...WWWW....WWWW..T',
      'T..,,.....,,......,,...T',
      'T..,,,,,,,,,,,,,,,,,...T',
      'T..B....,,....*...,,.B.T',
      'T.......,,........,,...T',
      ',,,,,,,,,,,,,,,,,,,,,,,,',
      ',,,,,,,,,,,,,,,,,,,,,,,,',
      'T"""",,""""""",,"""""""T',
      '~~~~~,,~~~~~~~,,~~~~~~~~',
      '~~~~~,,~~~~~~~,,~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~',
    ],
  },
  bamboo: {
    name: 'Bamboo Grove', levels: [33, 36], west: 'minato', east: 'matsuri',
    gate: { quest: 'masks', line: 'Bamboo cutter: Wait! Do not go to the festival empty-handed. Help me with these masks first.' },
    npcs: [
      { x: 6, y: 3, name: 'Bamboo cutter', look: 'artisan', lines: ['Listen. When the wind is right, the whole grove laughs.'] },
      { x: 12, y: 8, name: 'Tea monk', look: 'pilgrim', heal: true, lines: ['Tea, and a quiet minute. Your team is whole again.'] },
      { x: 16, y: 13, name: 'Old poet', look: 'oldman', lines: ['Fifty years, and she still keeps that poem.'] },
    ],
    rows: [
      'TTTTTTTTTTTTTTTTTTTTTTTT',
      'TT""""""TTTT""""""""""TT',
      'TT"",,""TTTT"",,,,""l"TT',
      'TT"",,"""""""",,"""""TTT',
      'TT"",,,,,,,,,,,,""~~"TTT',
      'TTTT"",,TTTTT",,""~~"TTT',
      'TTTT"",,TTTTT",,"""""TTT',
      'TTTT"",,TTTTT",,""""TTTT',
      'TTTT"",,"""""",,""""TTTT',
      ',,,,,,,,,,,,,,,,,,,,,,,,',
      ',,,,,,,,,,,,,,,,,,,,,,,,',
      'TTT""""""TTTTTT""""""TTT',
      'TTT""k"""TTTTTT"""*""TTT',
      'TTT""""""""""""""""""TTT',
      'TTT"""""""TTTT""""""TTTT',
      'TTTTTTTTTTTTTTTTTTTTTTTT',
    ],
  },
  matsuri: {
    name: 'Lantern Town', levels: [36, 39], west: 'bamboo', east: 'cape',
    gate: { quest: 'festival', line: 'Festival chief: The cape road is closed for the festival, and there is no festival without a programme. Help!' },
    doors: [
      { x: 3, y: 4, to: 'charm-matsuri', tx: 7, ty: 8, dir: 'up' }, { x: 4, y: 4, to: 'charm-matsuri', tx: 7, ty: 8, dir: 'up' },
      { x: 18, y: 4, to: 'shop-matsuri', tx: 7, ty: 8, dir: 'up' }, { x: 19, y: 4, to: 'shop-matsuri', tx: 7, ty: 8, dir: 'up' },
    ],
    npcs: [
      { x: 13, y: 4, name: 'Shrine keeper', look: 'miko', heal: true, lines: ['The lanterns are lit for travellers. Let me bless your team.'] },
      { x: 6, y: 8, name: 'Festival chief', look: 'oldman', lines: ['Drums at dusk, dancing at dark!'] },
      { x: 14, y: 8, name: 'Aoi', look: 'rival', after: 'festival', lines: ['Try the candy apples. Trust me.'] },
      { x: 20, y: 8, name: 'Fortune teller', look: 'oldwoman', lines: ['Your future? Read more. It always comes to that.'] },
      { x: 5, y: 7, name: 'Drummer', look: 'child', lines: ['Don, don, ka! I get to play the big drum this year.'] },
    ],
    rows: [
      'KKKKKKKKKKKKKKKKKKKKKKKK',
      'K......................K',
      'K.HHHH..l.sss.l..QQQQ..K',
      'K.HHHH....sss....QQQQ..K',
      'K.WWWW....,,,....QQQQ..K',
      'K..,,.....,,,.....,,...K',
      'K..,,,,,,,,,,,,,,,,,...K',
      'K.l.....,t,t,.....l..*.K',
      'K.......,,,,,..........K',
      ',,,,,,,,,,,,,,,,,,,,,,,,',
      ',,,,,,,,,,,,,,,,,,,,,,,,',
      'K""""""""HHHH"""""""""lK',
      'K""""""""HHHH""""""""""K',
      'K""""""""WWWW""""""""""K',
      'K""""""""""""""""""""""K',
      'KKKKKKKKKKKKKKKKKKKKKKKK',
    ],
  },
  cape: {
    name: 'Inkstone Cape', levels: [39, 42], west: 'matsuri',
    npcs: [
      { x: 11, y: 4, name: 'Coast guard', look: 'police', lines: ['Keep back from the edge, and keep reading the boards.'] },
      { x: 9, y: 8, name: 'Aoi', look: 'rival', after: 'storm', lines: ['I will hold the lamp. Go on.'] },
      { x: 21, y: 5, name: 'Lamp lighter', look: 'pilgrim', heal: true, lines: ['Warm yourself by the lamp oil stove. There, your team is restored.'] },
      { x: 19, y: 7, name: 'Inkstone Keeper', look: 'master', master: 'N3', lines: [] },
    ],
    rows: [
      'PPPPPPPPPPPPPPPPPPPPPPPP',
      'P"""""""PPPPPP.........P',
      'P"""""""PPPPPP.....k...P',
      'P""""""""""""",...LL...P',
      'P""""""""""""",,..LL...P',
      'PPPP"""",,,,,,,,..LL...P',
      'P"""""",,"""""",,.LL.B.P',
      'P"""""",,""""""",,,,,..P',
      'P"""""",,""""""PPPPPPPPP',
      ',,,,,,,,,,,,,,,,,,,,,,,P',
      ',,,,,,,,,,,,,,,,,,,,,,,P',
      'P""""""""""""""""""""""P',
      'P""""PPPP"""""""""k""""P',
      'P""""PPPP""""""""""""""P',
      '~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~',
    ],
  },
  home: {
    name: 'Home', room: true,
    doors: [{ x: 7, y: 9, to: 'village', tx: 4, ty: 5, dir: 'down' }],
    npcs: [{ x: 5, y: 4, name: 'Mom', look: 'mom', mom: true, heal: true, lines: [] }],
    rows: room([
      'wwwwwwwwwwwwwww',
      'wnwwwwwwwwwwnww',
      'wccmmmmmmmmuumw',
      'wmmmmmmmmmmuumw',
      'wmmmmmmmmmmmmmw',
      'wmmmmbbmmmmmmmw',
      'wmmmmbbmmmmmmmw',
      'wmmmmmmmmmmmccw',
      'wmmmmmmmmmmmmmw',
      'wwwwwwwdwwwwwww',
    ]),
  },
  dojo: {
    name: "Kanji Bear's dojo", room: true,
    doors: [{ x: 7, y: 9, to: 'village', tx: 18, ty: 8, dir: 'down' }],
    npcs: [{ x: 7, y: 4, name: 'Kanji Bear', guide: true, lines: [] }],
    rows: room([
      'wwwwwwwwwwwwwww',
      'wwnwwnwnwnwwnww',
      'wfffoffoffofffw',
      'wfffffffffffffw',
      'wfmmmmmmmmmmmfw',
      'wfmmmmmmmmmmmfw',
      'wfmmmmmmmmmmmfw',
      'wfmmmmmmmmmmmfw',
      'wfffffffffffffw',
      'wwwwwwwdwwwwwww',
    ]),
  },
  school: {
    name: 'Kawabe school', room: true,
    doors: [{ x: 7, y: 9, to: 'kawabe', tx: 4, ty: 5, dir: 'down' }],
    npcs: [{ x: 7, y: 3, name: 'Teacher', look: 'teacher', lines: ['Read a little every day. That is the whole secret.'] }],
    rows: room([
      'wwwwwwwwwwwwwww',
      'wwwwwwwwwwwwwww',
      'wfffffffffffffw',
      'wfffffffffffffw',
      'wffbbffffffbbfw',
      'wffbbffffffbbfw',
      'wfffffffffffffw',
      'wffbbffffffbbfw',
      'wffbbffffffbbfw',
      'wwwwwwwdwwwwwww',
    ]),
  },
  inn: {
    name: 'Onsen inn', room: true,
    doors: [{ x: 7, y: 9, to: 'onsen', tx: 4, ty: 5, dir: 'down' }],
    npcs: [
      { x: 7, y: 4, name: 'Innkeeper', look: 'mom', heal: true, lines: ['Rest as long as you like.'] },
      { x: 3, y: 6, name: 'Grandmother', look: 'oldwoman', lines: ['Such a kind young one.'] },
    ],
    rows: room([
      'wwwwwwwwwwwwwww',
      'wnwwwwnwwwwnwww',
      'wccmmmmmmmmmccw',
      'wmmmmmmmmmmmmmw',
      'wmmmmmmmmmmmmmw',
      'wmmmmmmmmmbbmmw',
      'wmmmmmmmmmbbmmw',
      'wmmmmmmmmmmmmmw',
      'wmmmmmmmmmmmmmw',
      'wwwwwwwdwwwwwww',
    ]),
  },
  hall: {
    name: 'Castle hall', room: true, sky: 'castle',
    doors: [{ x: 7, y: 9, to: 'castle', tx: 12, ty: 7, dir: 'down' }],
    npcs: [{ x: 7, y: 3, name: 'Castle Scribe', look: 'guardian', master: 'N4', lines: [] }],
    rows: room([
      'wwwwwwwwwwwwwww',
      'wnwnwnwnwnwnwnw',
      'wfffffffffffffw',
      'wfmmmmmmmmmmmfw',
      'wfmmmmmmmmmmmfw',
      'wfmmmmmmmmmmmfw',
      'wfmmmmmmmmmmmfw',
      'wfmmmmmmmmmmmfw',
      'wfffffffffffffw',
      'wwwwwwwdwwwwwww',
    ]),
  },
};

// Every town shop is the same little store with a different keeper.
const KONBINI = room([
  'wwwwwwwwwwwwwww',
  'wwwwwwwwwwwwwww',
  'wjjiipppppiijjw',
  'wqqqqqqqqqqqqqw',
  'wqqqqxxyxxqqqqw',
  'wqeqeqqqqqhqhqw',
  'wqeqeqqqqqhqhqw',
  'wqeqeqqqqqhqhqw',
  'wqqqqqqqqqqqqqw',
  'wwwwwwwdwwwwwww',
]);

const store = (name: string, town: string, tx: number, ty: number, keeper: Npc, rows?: string[]): GameMap => ({
  name, room: true,
  doors: [{ x: 7, y: 9, to: town, tx, ty, dir: 'down' }],
  npcs: [keeper],
  rows: rows ?? room([
    'wwwwwwwwwwwwwww',
    'wnwwwwwnwwwwwnw',
    'wccccfffffccccw',
    'wfffffffffffffw',
    'wfffffffffffffw',
    'wfbbfffffffbbfw',
    'wfbbfffffffbbfw',
    'wfffffffffffffw',
    'wfffffffffffffw',
    'wwwwwwwdwwwwwww',
  ]),
});
const clerk: Npc = { x: 7, y: 3, name: 'Clerk', look: 'worker', shop: true, lines: [] };
const charmer = (town: string): Npc => ({ x: 7, y: 4, name: 'Charm maker', look: 'miko', charms: town, lines: [] });
MAPS['shop-village'] = store('6-7 Kombini', 'village', 28, 5, clerk, KONBINI);
MAPS['shop-kawabe'] = store('6-7 Kombini', 'kawabe', 12, 5, clerk, KONBINI);
MAPS['shop-onsen'] = store('6-7 Kombini', 'onsen', 19, 5, clerk, KONBINI);
MAPS['shop-castle'] = store('6-7 Kombini', 'castle', 3, 6, clerk, KONBINI);
MAPS['charm-village'] = store('Sakura charm shop', 'village', 27, 14, charmer('village'));
MAPS['charm-kawabe'] = store('Kawabe charm shop', 'kawabe', 18, 6, charmer('kawabe'));
MAPS['charm-onsen'] = store('Onsen charm shop', 'onsen', 10, 14, charmer('onsen'));
MAPS['charm-castle'] = store('Castle charm shop', 'castle', 10, 14, charmer('castle'));
MAPS['shop-minato'] = store('6-7 Kombini', 'minato', 2, 5, clerk, KONBINI);
MAPS['shop-matsuri'] = store('6-7 Kombini', 'matsuri', 18, 5, clerk, KONBINI);
MAPS['charm-minato'] = store('Harbour charm shop', 'minato', 10, 5, charmer('minato'));
MAPS['charm-matsuri'] = store('Lantern charm shop', 'matsuri', 3, 5, charmer('matsuri'));

// Every town has grown a side street to the east, with two homes you can visit.
// The people inside remember how things were, and what went wrong.
const STREET = ['', '........', '..HHHH..', '..HHHH..', '..WWWW..', '...,,...', '...,,...', '...,,...', '...,,...', ',,,,,,,,', ',,,,,,,,', '.,HHHH..', '.,HHHH..', '.,WWWW..', '.,,,,,..', ''];
const LIVING = room([
  'wwwwwwwwwwwwwww',
  'wnwwwwwnwwwwwnw',
  'wccmmmmmmmmmccw',
  'wmmmmmmmmmmmmmw',
  'wmmmmbbmmmmmmmw',
  'wmmmmbbmmmmmmmw',
  'wmmmmmmmmmmmmmw',
  'wmmmmmmmmmmuumw',
  'wmmmmmmmmmmuumw',
  'wwwwwwwdwwwwwww',
]);
// Each home lists what stands along its back wall: the tools of whoever lives there.
type Home = [name: string, people: Npc[], things: [x: number, tile: string][]];
function street(town: string, upper: Home, lower: Home) {
  const m = MAPS[town], at = m.rows[0].length - 1;
  m.rows = m.rows.map((row, y) => row.slice(0, at) + (STREET[y] || row[0].repeat(8)) + row.slice(at));
  m.doors ??= [];
  [upper, lower].forEach(([name, npcs, things], i) => {
    const id = `house-${town}-${i ? 'b' : 'a'}`, y = i ? 13 : 4;
    for (const x of [at + 3, at + 4]) m.doors!.push({ x, y, to: id, tx: 7, ty: 8, dir: 'up' });
    MAPS[id] = { name, room: true, tune: town, doors: [{ x: 7, y: 9, to: town, tx: at + 3, ty: y + 1, dir: 'down' }], npcs, rows: (i ? [...MAPS['charm-village'].rows] : [...LIVING]).map((row, y) => (y === 2 ? things.reduce((r, [x, tile]) => r.slice(0, x) + tile + r.slice(x + 1), row) : row)) };
  });
}
street('village',
  ["Old scribe's house", [
    { x: 7, y: 3, name: 'Old scribe', look: 'oldman', lines: ['I ground ink for the castle for forty years. Round and round, until the water went black.', 'Nobody asks for it now. They want it ready in a bottle.'] },
    { x: 10, y: 6, name: 'Granddaughter', look: 'girl', lines: ['Grandpa says a stone gets lonely if nobody uses it. Stones cannot be lonely. Can they?'] },
  ], [[4, 'I'], [9, 'v'], [10, 'v']]],
  ["Carpenter's house", [{ x: 7, y: 4, name: 'Carpenter', look: 'artisan', lines: ['I built the dojo roof. Kanji Bear paid me in handwriting lessons. Best bargain I ever made.'] }], [[5, 'D'], [9, 'D']]]);
street('kawabe',
  ["Bookbinder's house", [{ x: 7, y: 3, name: 'Bookbinder', look: 'auntie', lines: ['Every book in town went blank on the same night. I keep binding them anyway.', 'The words will want somewhere to come home to.'] }], [[4, 'v'], [5, 'v'], [9, 'v'], [10, 'I']]],
  ["Ferryman's house", [{ x: 7, y: 4, name: 'Ferryman', look: 'sailor', lines: ['That Aoi rode my ferry three times in one week. Never once looked at the river.'] }], [[5, 'N'], [9, 'N']]]);
street('onsen',
  ["Potter's house", [{ x: 7, y: 3, name: 'Potter', look: 'artisan', lines: ['I press my name under every bowl. This month the stamp leaves nothing at all.', 'A bowl with no name. Who would know I made it?'] }], [[4, 'z'], [5, 'z'], [10, 'z']]],
  ["Bath keeper's house", [
    { x: 7, y: 4, name: 'Bath keeper', look: 'auntie', lines: ['Guests used to brush poems on the bathhouse wall. Come back and read them when the kanji are home.'] },
    { x: 4, y: 7, name: "Bath keeper's son", look: 'child', lines: ['I heard a big crack from under the mountain. Mum says it was thunder. It was not thunder.'] },
  ], [[5, 'J'], [9, 'J']]]);
street('castle',
  ["Ink seller's house", [{ x: 7, y: 3, name: 'Ink seller', look: 'artisan', lines: ['Bottled ink, ten yen. It never dries and it never runs out. Why would anyone grind their own?', 'The Scribe says mine is too thin. Hmph. It sells.'] }], [[4, 'G'], [5, 'G'], [9, 'G'], [10, 'I']]],
  ["Guard's house", [{ x: 7, y: 4, name: 'Night guard', look: 'police', lines: ['I was on watch the night it happened. A sound like ice breaking on a pond, far down under the keep.', 'By morning every sign in the town was bare.'] }], [[5, 'E'], [9, 'E']]]);
street('minato',
  ["Captain's house", [{ x: 7, y: 3, name: 'Old captain', look: 'sailor', lines: ['I have sailed past the cape a thousand times. The keeper always swung the lamp to say hello.', 'This season the lamp is dark. Something is wrong out there.'] }], [[4, 'M'], [10, 'v']]],
  ["Sailor's house", [{ x: 7, y: 4, name: "Sailor's wife", look: 'woman', lines: ['My husband writes from every port, and every letter arrives blank. I keep them all.', 'When this is over I shall read the lot in one sitting.'] }], [[5, 'N'], [9, 'I']]]);
street('matsuri',
  ["Lantern maker's house", [
    { x: 7, y: 3, name: 'Lantern maker', look: 'artisan', lines: ['Each lantern carries a wish in ink. This year they are bare paper.', 'Pretty enough. But they say nothing.'] },
    { x: 10, y: 6, name: 'Apprentice', look: 'girl', lines: ['I am learning to write the wishes. So far I can do 夢. It took me nine tries.'] },
  ], [[4, 'g'], [5, 'g'], [9, 'g'], [10, 'g']]],
  ["Drum maker's house", [{ x: 7, y: 4, name: 'Drum maker', look: 'oldman', lines: ['My grandfather ground his own ink for the festival banners. I buy mine in a bottle.', 'Do not tell him.'] }], [[5, 'a'], [9, 'a']]]);

// Lanterns, bushes, boulders and flower beds dress the older towns. Each only ever replaces open grass.
const DECOR: Record<string, [number, number, string][]> = {
  village: [[9, 3, 'l'], [16, 3, 'l'], [22, 5, 'B'], [24, 7, 'B'], [2, 8, '*'], [3, 8, '*'], [9, 12, 'k'], [14, 13, '*'], [15, 13, '*'], [21, 13, 'B'], [32, 6, '*'], [33, 6, '*'], [24, 4, 'l'], [1, 14, 'B'], [20, 1, '*']],
  kawabe: [[9, 2, 'B'], [16, 1, '*'], [17, 1, '*'], [22, 6, 'l'], [3, 7, '*'], [14, 7, 'B'], [21, 8, 'k']],
  onsen: [[8, 2, 'l'], [9, 4, 'k'], [1, 1, 'B'], [22, 1, 'B'], [12, 7, '*'], [13, 7, '*'], [21, 6, 'l'], [2, 8, 'B']],
  castle: [[6, 2, 'B'], [17, 2, 'B'], [7, 6, 'l'], [16, 6, 'l'], [2, 7, '*'], [20, 8, '*'], [21, 8, '*'], [1, 1, 'k']],
};
for (const [id, things] of Object.entries(DECOR)) for (const [x, y, ch] of things) {
  const rows = MAPS[id].rows;
  if (rows[y][x] !== '.') throw new Error(`${id}: decoration at ${x},${y} would cover ${rows[y][x]}`);
  rows[y] = rows[y].slice(0, x) + ch + rows[y].slice(x + 1);
}

// Signs become solid tiles on their maps.
for (const s of SIGNS) {
  const rows = MAPS[s.map].rows;
  rows[s.y] = rows[s.y].slice(0, s.x) + 'S' + rows[s.y].slice(s.x + 1);
}
