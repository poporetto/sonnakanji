import { catchChance, damage, gainXp, maxHp, typeBonus, xpReward, xpToNext, type Fighter, type Move, type Species } from './battle';
import { asleep, bear, kanjiSprite, loadLettering, MARGIN, person } from './sprites';
import { music, setSound, sfx, silence, sound, unlock } from './audio';
import { beginFrame, burst, charm, CENTRE, charmArt, drawBits, drawCharm, drawKanji, drip, easeOut, endFrame, flashScreen, lerp, newView, pause, seal, sealArt, shakeScreen, still, tween, veil, views } from './fx';
import { withRomaji } from './kana';
import { MAPS, SOLID, type Door, type Npc } from './maps';
import { ICONS, INKS } from './gear';
import { charmsIn, CHARMS, healed, holdChance, INKWELL, ITEMS, JOKES, PRIZES, revived, SHELF, yenFor, type Charm } from './shop';
import { lured, CHECKS, CLOSED, LEVELS, POOLS, QUESTS, SIGNS, type Level, type LevelId, type Quest, type Read } from './story';
import { backdrop, paintMap } from './world';

const screen = document.getElementById('screen') as HTMLCanvasElement;
const ctx = screen.getContext('2d')!;
ctx.imageSmoothingEnabled = false;
const stage = document.getElementById('stage')!;
const textEl = document.getElementById('text')!;
const statusEl = document.getElementById('status')!;
const panelEl = document.getElementById('panel')!;
const hudEl = document.getElementById('hud')!;
const sideEl = document.querySelector<HTMLElement>('.side')!;
const choicesEl = document.getElementById('choices')!;
const T = 16;

interface Save { map: string; x: number; y: number; dir: string; party: Fighter[]; box: Fighter[]; seen: string[]; caught: string[]; charms: number; starter?: string; chapter: 'home' | 'dojo' | 'choose' | 'journey'; trials: LevelId[]; active: string[]; done: string[]; yen: number; bag: Record<string, number>; prizes: string[]; rest: { map: string; x: number; y: number } }
const KEY = 'kanjimon.save.v2';
let dex = new Map<string, Species>();
let all: Species[] = [];
let save: Save;
const spec = (k: string) => dex.get(k)!;
const rand = (n: number) => Math.floor(Math.random() * n);
const shuffle = <T,>(a: T[]) => a.map((v) => [Math.random(), v] as const).sort((x, y) => x[0] - y[0]).map((x) => x[1]);

function store() {
  try { localStorage.setItem(KEY, JSON.stringify(save)); } catch {}
}
function restore(): Save | null {
  try {
    const old: Save | null = JSON.parse(localStorage.getItem(KEY) ?? 'null');
    if (old) { old.yen ??= 150; old.bag ??= {}; old.prizes ??= []; }
    return old;
  } catch { return null; }
}

// ---- Panel: everything said or chosen goes through these two.
let waiting: ((value: number) => void) | null = null;
let selected = 0;

function mark() {
  [...choicesEl.children].forEach((b, i) => {
    b.classList.toggle('on', i === selected);
    if (i === selected) b.scrollIntoView({ block: 'nearest' });
  });
}

// A speaker's name gets its own line, so dialogue reads like a conversation.
// Children mode adds small romaji beside hiragana and katakana.
let kids = false;
try { kids = localStorage.getItem('kanjimon.kids.v1') === 'on'; } catch {}

// Haru can be played as a boy or a girl.
let haru = 'hero';
try { haru = localStorage.getItem('kanjimon.look.v1') ?? 'hero'; } catch {}
// On the ?lukas page the hero is Lukas, whatever the settings say.
const lukas = new URLSearchParams(location.search).has('lukas');
if (lukas) haru = 'lukas';

function spelled<T extends HTMLElement>(el: T, raw: string) {
  const text = lukas ? raw.replaceAll('Haru', 'Lukas') : raw;
  el.dataset.raw = text;
  if (!kids) { el.textContent = text; return el; }
  el.replaceChildren(...withRomaji(text).flatMap((p) => (p.roma ? [p.text, Object.assign(document.createElement('small'), { className: 'roma', textContent: p.roma })] : [p.text])));
  return el;
}

// Dialogue sits on the game screen, except in battle, where it would cover the fighters' cards.
function dock() {
  if (panelEl.parentElement !== (foe ? sideEl : stage)) { if (foe) sideEl.prepend(panelEl); else stage.append(panelEl); }
  hudEl.hidden = !!foe;
  panelEl.hidden = !foe && (textEl.hidden || !textEl.textContent) && !panelEl.querySelector('#choices button');
}

// Letters appear one at a time. They hold their places from the start, so lines never reflow as they fill in.
let typing: (() => void) | null = null;
function typeOut() {
  if (still) return;
  const line = textEl.querySelector('span');
  if (!line) return;
  const nodes: Text[] = [];
  const walker = document.createTreeWalker(line, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) nodes.push(walker.currentNode as Text);
  const letters = nodes.flatMap((node) => {
    const held = Array.from(node.data, (ch) => Object.assign(document.createElement('span'), { textContent: ch, className: 'unread' }));
    node.replaceWith(...held);
    return held;
  });
  let i = 0;
  const finish = () => { clearInterval(timer); for (const l of letters) l.classList.remove('unread'); typing = null; panelEl.classList.remove('typing'); };
  const timer = setInterval(() => { letters[i++]?.classList.remove('unread'); if (i >= letters.length) finish(); }, 20);
  typing = finish;
  panelEl.classList.add('typing');
}

function show(text: string, sub = '') {
  typing?.();
  textEl.hidden = false;
  const [, who, line] = text.match(/^([A-Z][A-Za-z' ]{2,20}): (.*)$/s) ?? [];
  const parts: HTMLElement[] = [];
  if (who) parts.push(Object.assign(document.createElement('strong'), { textContent: who }));
  parts.push(spelled(document.createElement('span'), line ?? text));
  if (sub) parts.push(Object.assign(document.createElement('small'), { textContent: sub }));
  textEl.replaceChildren(...parts);
  textEl.classList.toggle('bear', who === 'Kanji Bear');
  dock();
}

// Leading kanji are set larger, in the Japanese face.
function label(b: HTMLButtonElement, text: string) {
  const [, kanji, rest] = text.match(/^([\u3005-\u9fff]+)(.*)$/s) ?? [];
  if (!kanji) { b.append(spelled(document.createElement('span'), text)); return; }
  b.replaceChildren(Object.assign(document.createElement('span'), { textContent: kanji, lang: 'ja', className: 'ja' }), spelled(document.createElement('span'), rest));
}

// A shop or bag row: a pixel icon, the Japanese name with English under it, and a price or count.
interface Ware { icon: string; tint?: string; jp: string; en: string; tag: string }

function iconOf(name: string, tint?: string) {
  const rows = ICONS[name];
  const c = Object.assign(document.createElement('canvas'), { width: rows[0].length, height: rows.length, className: 'icon' });
  const g = c.getContext('2d')!;
  rows.forEach((row, y) => [...row].forEach((ch, x) => {
    if (!INKS[ch]) return;
    g.fillStyle = tint && ch === 'r' ? tint : INKS[ch];
    g.fillRect(x, y, 1, 1);
  }));
  return c;
}

function wareRow(b: HTMLButtonElement, w: Ware) {
  b.classList.add('ware');
  const words = document.createElement('span');
  words.className = 'words';
  words.append(spelled(Object.assign(document.createElement('b'), { lang: 'ja' }), w.jp), Object.assign(document.createElement('small'), { textContent: w.en }));
  b.replaceChildren(iconOf(w.icon, w.tint), words, Object.assign(document.createElement('span'), { className: 'price', textContent: w.tag }));
}

const wareOf = (it: { icon: string; name: string; en: string }, tag: string): Ware => ({ icon: it.icon, jp: it.name, en: it.en, tag });
const charmWare = (c: Charm, tag: string): Ware => ({ icon: 'charm', tint: c.ink, jp: c.name, en: c.en, tag });

function ask(text: string, options: (string | Ware)[]) {
  show(text);
  selected = 0;
  choicesEl.replaceChildren(...options.map((text, i) => {
    const b = document.createElement('button');
    if (typeof text === 'string') {
      label(b, text);
      if (text.length > 20) b.classList.add('long');
    } else wareRow(b, text);
    if (options.length === 1) b.classList.add('full');
    b.addEventListener('click', () => pick(i));
    return b;
  }));
  mark();
  typeOut();
  dock();
  return new Promise<number>((resolve) => { waiting = resolve; });
}

function pick(i: number) {
  if (!waiting) return;
  // The first press finishes a line that's still being typed.
  if (typing && !choicesEl.children.length) return typing();
  sfx.pick();
  const done = waiting;
  waiting = null;
  panelEl.classList.remove('waiting');
  choicesEl.replaceChildren();
  done(i);
}

// A line of dialogue waits for the action button, with a small triangle showing there's more.
function say(text: string) {
  show(text);
  choicesEl.replaceChildren();
  panelEl.classList.add('waiting');
  panelEl.scrollTop = 0;
  typeOut();
  dock();
  return new Promise<number>((resolve) => { waiting = resolve; });
}
const clearPanel = (text = '', sub = '') => { show(text, sub); choicesEl.replaceChildren(); dock(); };

// While walking, the panel is a status screen: where you are, your mission, and your counts.
function place() {
  music(areaTune());
  const g = goal();
  const l = nextLevel() ?? LEVELS[LEVELS.length - 1];
  const total = all.filter((s) => s.level === l.id).length;
  const el = (tag: string, text = '', cls = '') => Object.assign(document.createElement(tag), { textContent: text, className: cls });
  const mission = el('div', '', 'mission');
  mission.append(el('h3', g.title), el('p', g.text));
  if (g.need) {
    const bar = el('div', '', 'bar');
    const fill = el('div');
    fill.style.width = `${(Math.min(g.have!, g.need) / g.need) * 100}%`;
    bar.append(fill);
    const row = el('div', '', 'progress');
    row.append(bar, el('span', `${Math.min(g.have!, g.need)} / ${g.need}`));
    mission.append(row);
  }
  const head = el('header');
  head.append(el('h2', map().name), el('span', l.id, 'tag'));
  statusEl.replaceChildren(head, mission);
  if (save.chapter === 'journey') {
    const stats = el('ul', '', 'stats');
    for (const [value, label] of [[`${caughtIn(l.id)} / ${total}`, `${l.id} kanji`], [`${charmTotal()}`, 'Charms'], [`¥${save.yen}`, 'Yen']]) {
      const item = el('li');
      item.append(el('b', value), el('span', label));
      stats.append(item);
    }
    statusEl.append(stats);
  }
  textEl.hidden = true;
  statusEl.hidden = false;
  choicesEl.replaceChildren();
  facing = null;
  dock();
}

// ---- World
let mode: 'title' | 'world' | 'battle' | 'busy' = 'title';
const held = new Set<string>();
let slide = 0, stepFlip = false;
let foe: { s: Species; f: Fighter } | null = null;

const map = () => MAPS[save.map];
const tileAt = (x: number, y: number) => map().rows[y]?.[x] ?? 'T';
const TUNES: Record<string, string> = { 'shop-village': 'home', 'shop-kawabe': 'kawabe', 'shop-onsen': 'onsen', 'shop-castle': 'castle', 'charm-village': 'home', 'charm-kawabe': 'kawabe', 'charm-onsen': 'onsen', 'charm-castle': 'castle', home: 'home', dojo: 'home', school: 'kawabe', inn: 'onsen', hall: 'castle' };
const areaTune = () => TUNES[save.map] ?? save.map;
const npcsHere = () => map().npcs.filter((n) => !n.after || save.done.includes(n.after));
const npcAt = (x: number, y: number) => npcsHere().find((n) => n.x === x && n.y === y);
const DIRS: Record<string, [number, number]> = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };

function walk(dir: string) {
  save.dir = dir;
  const [dx, dy] = DIRS[dir];
  const [nx, ny] = [save.x + dx, save.y + dy];
  const m = map();
  const wide = m.rows[0].length;
  if (nx >= wide && m.east) {
    const closed = m.gate && (m.gate.quest ? !save.done.includes(m.gate.quest) : !save.trials.includes(m.gate.trial!));
    if (closed && !(m.gate!.quest === 'first' && save.chapter === 'journey')) return void notice(m.gate!.line);
    return travel(m.east, 0, save.y);
  }
  if (nx < 0 && m.west) return travel(m.west, MAPS[m.west].rows[0].length - 1, save.y);
  const door = m.doors?.find((d) => d.x === nx && d.y === ny);
  if (door && save.chapter === 'choose') return void notice('Kanji Bear: Not yet! Talk to the kanji you want to travel with.');
  if (door) return enter(door);
  if (SOLID.includes(tileAt(nx, ny)) || npcAt(nx, ny)) return;
  save.x = nx; save.y = ny;
  slide = T; stepFlip = !stepFlip;
  if ('"r'.includes(tileAt(nx, ny))) {
    sfx.rustle();
    if (Math.random() < 0.16) void encounter();
  }
}

async function notice(text: string) {
  mode = 'busy';
  await say(text);
  backToWorld();
}

function enter(d: Door) {
  sfx.door();
  veil.curtain = 1.2;
  travel(d.to, d.tx, d.ty);
  save.dir = d.dir;
  if (d.to === 'dojo' && (save.chapter === 'home' || save.chapter === 'dojo')) void meetBear();
  else place();
}

function travel(to: string, x: number, y: number) {
  save.map = to; save.x = x; save.y = y;
  store();
  place();
}

// Things to look at inside the 6-7 Kombini.
const SHELVES: Record<string, string[]> = {
  j: ['So many drinks to choose from. It makes you thirsty.', 'Tea, coffee, ramune and melon soda. It makes you thirsty.', 'Rows of cold drinks hum behind the glass. It makes you thirsty.'],
  e: ['Crisps, rice crackers and seaweed snacks. It makes you hungry.', 'Bags and bags of snacks. It makes you hungry.', 'Soy sauce crackers, cheese puffs and dried squid. It makes you hungry.'],
  h: ['Chocolate, gummies and strawberry sweets. It makes you hungry.', 'So many sweets! It makes you hungry.', 'Mochi, melon candy and little biscuits. It makes you hungry.'],
  p: ['Shelves of everyday things: batteries, umbrellas, tissues and notebooks.', 'Boxes stacked neatly behind the counter. Staff only.'],
  i: ['Rows of magazines. The clerk sells them at the counter.', 'Someone left a kanji joke magazine open. You can buy one at the counter.'],
};

// Golden sparkles rise around the hero while a healer prays.
async function blessing() {
  sfx.bless();
  flashScreen(0.35, '#fff0c0');
  let beat = 0;
  await tween(1100, (t) => {
    if (++beat % 3) return;
    const a = t * Math.PI * 6, r = 14 - t * 6;
    burst('bless', heroAt[0] + Math.cos(a) * r, heroAt[1] + 16, 3, 0.6);
    burst('bless', heroAt[0] - Math.cos(a) * r, heroAt[1] + 8, 2, 0.5);
  });
}

async function talk() {
  const [dx, dy] = DIRS[save.dir];
  const [ax, ay] = [save.x + dx, save.y + dy];
  if (save.chapter === 'choose' && tileAt(ax, ay) === 'o') return chooseStarter([4, 7, 10].indexOf(ax));
  const shelf = SHELVES[tileAt(ax, ay)];
  if (shelf && map().room) return notice(shelf[rand(shelf.length)]);
  if (tileAt(ax, ay) === 'S') sfx.sign();
  if (tileAt(ax, ay) === 'S') return notice(signText(SIGNS.find((s) => s.map === save.map && s.x === ax && s.y === ay)!));
  // Shop staff can be spoken to across the counter.
  const n = npcAt(ax, ay) ?? ('xy'.includes(tileAt(ax, ay)) ? npcAt(ax + dx, ay + dy) : undefined);
  if (!n) return;
  mode = 'busy';
  facing = n;
  if (!(await questTalk(n))) for (const line of n.guide ? [bearTip()] : n.mom ? momLines() : n.lines) await say(`${n.name}: ${line}`);
  if (n.shop) await konbini();
  if (n.charms) await charmShop(n.charms);
  if (n.heal && save.party.length) {
    await blessing();
    for (const f of save.party) f.hp = maxHp(spec(f.k), f.lv);
    const gift = charmTotal() < 3;
    if (gift) save.charms = 3;
    save.rest = { map: save.map, x: save.x, y: save.y };
    await say(`Your team is fully restored.${gift ? ' Here are 3 paper charms to help you on your way.' : ''}`);
    store();
  }
  if (n.master) await trial(LEVELS.find((l) => l.id === n.master)!);
  backToWorld();
}

const signText = (s: { k: string; word: string; en: string }) =>
  save.caught.includes(s.k) ? `${s.word}\n${s.en}` : 'The sign is blank. Its kanji has wandered off.';

// ---- Shop and bag
const charmTotal = () => save.charms + CHARMS.reduce((sum, c) => sum + (save.bag[c.id] ?? 0), 0);

async function konbini() {
  await say('Clerk: Irasshaimase! Welcome to 6-7 Kombini.');
  for (;;) {
    const i = await ask(`You have ¥${save.yen}. What would you like?`, [...SHELF.map((it) => wareOf(it, `¥${it.price}`)), 'Leave']);
    const item = SHELF[i];
    if (!item) return;
    if (save.yen < item.price) { sfx.wrong(); await say(`Clerk: Sorry, that is ¥${item.price} and you have ¥${save.yen}.`); continue; }
    save.yen -= item.price;
    if (item.keep) save.prizes.push(item.keep);
    else save.bag[item.id] = (save.bag[item.id] ?? 0) + 1;
    sfx.right();
    store();
    if (item.keep) await say(`You bought the ${item.keep}! It joins your Collection.`);
  }
}

async function charmShop(town: string) {
  await say('Charm maker: Every charm here is written by hand. My special one is only sold in this town.');
  const shelf = charmsIn(town);
  for (;;) {
    const pick = await ask(`You have ¥${save.yen} and ${charmTotal()} ${charmTotal() === 1 ? 'charm' : 'charms'}.`, [...shelf.map((x) => charmWare(x, `¥${x.price}`)), ...INKWELL.map((x) => wareOf(x, `¥${x.price}`)), 'Leave']);
    const ink = INKWELL[pick - shelf.length];
    if (ink) {
      if (save.yen < ink.price) { sfx.wrong(); await say(`Charm maker: Sorry, you need ¥${ink.price}.`); continue; }
      save.yen -= ink.price;
      save.bag[ink.id] = (save.bag[ink.id] ?? 0) + 1;
      sfx.right();
      store();
      continue;
    }
    const c = shelf[pick];
    if (!c) return;
    if ((await ask(`${c.en}: ${c.note} Buy one for ¥${c.price}?`, ['Buy', 'No thanks'])) !== 0) continue;
    if (save.yen < c.price) { sfx.wrong(); await say(`Charm maker: Sorry, you need ¥${c.price}.`); continue; }
    save.yen -= c.price;
    if (c.id === 'paper') save.charms++;
    else save.bag[c.id] = (save.bag[c.id] ?? 0) + 1;
    sfx.right();
    store();
  }
}

const owned = () => ITEMS.filter((it) => (save.bag[it.id] ?? 0) > 0);

// Returns true when an item was really used.
async function useItem(target?: Fighter) {
  const have = owned().filter((it) => !target || it.heal || it.full || it.revive);
  if (!have.length) { await say('Your bag is empty. The 6-7 Kombini sells snacks.'); return false; }
  const i = await ask('Use which item?', [...have.map((it) => wareOf(it, `x${save.bag[it.id]}`)), 'Back']);
  const item = have[i];
  if (!item) return false;
  if (item.read) {
    save.bag[item.id]--;
    await say(`You flip through the magazine.\n${JOKES[rand(JOKES.length)]}`);
    store();
    return false;
  }
  if (item.open) {
    save.bag[item.id]--;
    const prize = PRIZES[rand(PRIZES.length)], again = save.prizes.includes(prize);
    save.prizes.push(prize);
    sfx.caught();
    await say(`The capsule pops open!\nYou got: ${prize}${again ? ' (another one!)' : ''}`);
    store();
    return false;
  }
  if (item.revive) {
    const down = save.party.filter((p) => p.hp <= 0);
    if (!down.length) { await say('None of your kanji have fainted.'); return false; }
    const c = down.length > 1 ? await ask('Revive which kanji?', [...down.map((p) => `${p.k} Lv${p.lv}`), 'Back']) : 0;
    const k = down[c];
    if (!k) return false;
    k.hp = revived(item, maxHp(spec(k.k), k.lv));
    save.bag[item.id]--;
    sfx.level();
    await say(`The ink flows back into ${k.k}. It has ${k.hp} health.`);
    store();
    return true;
  }
  let f = target;
  if (!f) {
    const hurt = save.party.filter((p) => p.hp > 0 && p.hp < maxHp(spec(p.k), p.lv));
    if (!hurt.length) { await say('Your team is already at full health.'); return false; }
    const c = hurt.length > 1 ? await ask('Use it on which kanji?', [...hurt.map((p) => `${p.k} ${p.hp}/${maxHp(spec(p.k), p.lv)}`), 'Back']) : 0;
    f = hurt[c];
    if (!f) return false;
  }
  const max = maxHp(spec(f.k), f.lv), gain = healed(item, f.hp, max);
  if (gain <= 0) { await say(`${f.k} is already at full health.`); return false; }
  f.hp += gain;
  save.bag[item.id]--;
  sfx.level();
  if (foe) { popup(`+${gain}`, 'me', 'good'); burst('metal', ...CENTRE.me, 14, 0.7); }
  await say(`${f.k} recovered ${gain} health.`);
  store();
  return true;
}

// ---- Missions
const home = (q: Quest) => q.where.replace('the ', '');
const mains = (id?: LevelId) => QUESTS.filter((q) => q.level && (!id || q.level === id));

function unlocked(q: Quest) {
  if (q.after) return save.done.includes(q.after);
  const line = mains();
  const before = line[line.indexOf(q) - 1];
  if (q.level === 'N4' && !save.trials.includes('N5')) return false;
  return !before || save.done.includes(before.id);
}

function progress(q: Quest): [number, number] | null {
  if ('catch' in q.task) return [q.task.catch.filter((k) => save.caught.includes(k)).length, q.task.catch.length];
  if ('count' in q.task) return [save.caught.length - 1, q.task.count];
  return null;
}
const ready = (q: Quest) => { const p = progress(q); return !p || p[0] >= p[1]; };

async function reading(r: Read) {
  for (;;) {
    const options = shuffle([r.a, ...r.wrong]);
    if (options[await ask(r.q, options)] === r.a) { sfx.right(); await say(`Yes! ${r.why}`); return; }
    sfx.wrong();
    await say(`Not quite. ${r.why} Try again.`);
  }
}

async function finish(q: Quest, who: string) {
  if ('beat' in q.task && !(await duel(q.giver, q.task.beat.team, q.task.beat.lv))) return;
  for (const r of [...('read' in q.task ? q.task.read : []), ...(CHECKS[q.id] ?? [])]) await reading(r);
  for (const line of q.done) await say(`${who}: ${line}`);
  save.active = save.active.filter((id) => id !== q.id);
  save.done.push(q.id);
  save.charms += q.charms ?? 0;
  save.yen += 100;
  stamp('完');
  await say(`Mission complete: ${q.title}\nYou received ¥100${q.charms ? ` and ${q.charms} paper charms` : ''}.`);
  store();
}

// Returns true when a mission took over the conversation.
async function questTalk(n: Npc) {
  const here = map().name;
  const handing = QUESTS.find((q) => save.active.includes(q.id) && (('deliver' in q.task ? q.task.deliver : q.giver) === n.name) && ('deliver' in q.task || home(q) === here));
  if (handing) {
    if (!ready(handing)) { await say(`${n.name}: ${handing.wait}`); return true; }
    await finish(handing, n.name);
    return true;
  }
  const fresh = QUESTS.find((q) => q.giver === n.name && home(q) === here && !save.active.includes(q.id) && !save.done.includes(q.id) && unlocked(q));
  if (!fresh) return false;
  for (const line of fresh.offer) await say(`${n.name}: ${line}`);
  save.active.push(fresh.id);
  store();
  if ('beat' in fresh.task || 'read' in fresh.task || ready(fresh) && !('deliver' in fresh.task)) await finish(fresh, n.name);
  return true;
}

function backToWorld() {
  mode = 'world';
  foe = null;
  place();
}

const caughtIn = (id: LevelId) => save.caught.filter((k) => spec(k).level === id).length;
const nextLevel = () => LEVELS.find((l) => !save.trials.includes(l.id));

// The current goal is always on screen, so the story never leaves you guessing.
function goal(): { title: string; text: string; have?: number; need?: number } {
  if (save.chapter === 'choose') return { title: 'Choose your partner', text: 'Walk up to a kanji on the stands and talk to it.' };
  if (save.chapter !== 'journey') return { title: 'Off to the dojo', text: 'Find Kanji Bear in the house with the red curtain.' };
  const l = nextLevel();
  if (!l) return { title: 'Keep reading', text: 'Catch every kanji and fill in every sign.', have: save.caught.length, need: all.length };
  const q = mains(l.id).find((m) => !save.done.includes(m.id));
  if (q) {
    if (!save.active.includes(q.id)) return { title: q.title, text: q.giver === 'Mom' ? 'Go home and talk to Mom.' : `Talk to ${['Aoi', 'Kanji Bear'].includes(q.giver) ? q.giver : `the ${q.giver}`} in ${q.where}.` };
    const p = progress(q);
    if (!p) return { title: q.title, text: q.wait };
    return p[0] < p[1] ? { title: q.title, text: q.wait, have: p[0], need: p[1] } : { title: q.title, text: `Report to the ${q.giver} in ${q.where}.`.replace('the Kanji Bear', 'Kanji Bear'), have: p[0], need: p[1] };
  }
  const have = caughtIn(l.id);
  if (have < l.need) return { title: `${l.id} trial`, text: `Catch ${l.need} ${l.id} kanji to earn your trial.`, have, need: l.need };
  return { title: `${l.id} trial`, text: `You have earned it. Challenge the ${l.master} in ${l.land}.` };
}

function momLines() {
  if (!save.party.length) return ['What are you waiting for? Kanji Bear is expecting you. Look for the red curtain.'];
  if (!save.trials.length) return ['Have you eaten? Rest a moment, then back to your lessons.'];
  if (nextLevel()) return [`You passed ${save.trials.at(-1)}! I knew you could. Sit down, you must be tired.`];
  return ['You read me the whole newspaper this morning. The world looks bigger now, does it not?'];
}

// Kanji Bear reads your progress and gives the most useful next step.
function bearTip() {
  const tired = save.party.some((f) => f.hp < maxHp(spec(f.k), f.lv) / 2);
  if (tired) return 'Your team looks tired. Your mother, an innkeeper or the miko at the shrine can restore them.';
  if (save.charms === 0) return 'Out of paper charms? Any healer in town will give you more.';
  const l = nextLevel();
  if (l) return `${goal().text} And read every sign on the way.`;
  const left = all.length - save.caught.length;
  if (left) return `You passed N5 and N4! The roads to N3, N2 and N1 are still closed, so keep catching. ${left} kanji are left to find.`;
  return 'You found every kanji! I could not be prouder.';
}

// ---- Battle
const lead = () => save.party.find((f) => f.hp > 0);

async function encounter() {
  mode = 'busy';
  const m = map();
  const pool = [...POOLS[save.map]].map(spec);
  const missing = pool.filter((p) => !save.caught.includes(p.k));
  // Uncaught kanji show up more often, so a long region never turns into a grind.
  const sought = pool.filter((p) => lured(save.active, save.caught).includes(p.k));
  const from = sought.length && Math.random() < 0.6 ? sought : missing.length && Math.random() < 0.6 ? missing : pool;
  const s = from[rand(from.length)];
  const [low, high] = m.levels!;
  const lv = low + rand(high - low + 1);
  await battleOpen('battle');
  await bringIn(s, lv);
  await say(`A wild ${s.k} appeared!`);
  await fight(true);
  backToWorld();
}

// ---- Battle staging
// The kanji standing on the field, which stays put until its faint has played out.
let onField: Fighter | null = null;

async function battleOpen(tune: string) {
  mode = 'busy';
  silence();
  sfx.alert();
  alarm = true;
  await pause(420);
  alarm = false;
  sfx.wipe();
  music(tune);
  await tween(380, (t) => { veil.wipe = t; });
  opening = true;
  views.foe = newView();
  views.foe.hidden = true;
  views.me = newView();
  views.me.x = -130;
  onField = lead() ?? null;
  await tween(320, (t) => { veil.wipe = 1 - t; });
  veil.wipe = 0;
  await tween(320, (t) => { views.me.x = lerp(-130, 0, easeOut(t)); });
}

// A new kanji writes itself in stroke order, then bursts into life.
async function bringIn(s: Species, lv: number) {
  await loadLettering(s.k);
  foe = { s, f: { k: s.k, lv, xp: 0, hp: maxHp(s, lv) } };
  opening = false;
  if (!save.seen.includes(s.k)) save.seen.push(s.k);
  const v = views.foe = newView();
  v.ink = 0;
  const per = Math.min(90, 620 / s.d.length);
  let last = 0;
  await tween(per * s.d.length, (t) => {
    v.ink = t;
    const stroke = Math.floor(t * s.d.length);
    if (stroke > last) { last = stroke; sfx.brush(); }
  });
  v.ink = 1;
  v.flash = 1;
  burst(s.type, ...CENTRE.foe, 26, 1.2);
  sfx.cry(s.k.codePointAt(0)!);
  v.scale = 0.7;
  await tween(300, (t) => { v.scale = lerp(0.7, 1, easeOut(t)); v.flash = 1 - t; });
}

async function sendOut() {
  onField = lead() ?? null;
  const v = views.me = newView();
  v.scale = 0;
  v.flash = 1;
  sfx.pop();
  if (onField) burst(spec(onField.k).type, ...CENTRE.me, 14);
  await tween(260, (t) => { v.scale = easeOut(t); v.flash = 1 - t; });
}

async function attackFx(side: 'me' | 'foe', s: Species, move: Move, right: boolean, bonus: number, land: () => void) {
  const other = side === 'me' ? 'foe' : 'me';
  const [fx, fy] = CENTRE[side], [tx, ty] = CENTRE[other];
  const way = side === 'me' ? 1 : -1;
  callout(move.w, brief(move.m));
  await tween(150, (t) => { views[side].x = -way * 7 * t; });
  sfx.attack(s.type);
  await tween(110, (t) => { views[side].x = lerp(-7, 15, t) * way; });
  let trail = 0;
  await tween(360, (t) => {
    const p = easeOut(t);
    views[side].x = lerp(15, 0, t) * way;
    if (++trail % 2 === 0) burst(s.type, lerp(fx, tx, p), lerp(fy, ty, p) - Math.sin(p * Math.PI) * 18, 10, 0.8);
  });
  const strong = right || bonus > 1;
  burst(s.type, tx, ty, strong ? 46 : 24, strong ? 1.8 : 1.1);
  sfx.hit(strong);
  shakeScreen(strong ? 9 : 5);
  if (bonus > 1) flashScreen(0.35);
  land();
  const v = views[other];
  await tween(380, (t) => { v.flash = Math.sin(t * Math.PI * 4) > 0 ? 0.9 : 0; v.x = Math.sin(t * Math.PI * 6) * (1 - t) * 5; });
  v.flash = 0; v.x = 0;
}

async function faint(side: 'me' | 'foe', s: Species) {
  const v = views[side];
  const [x, y] = CENTRE[side];
  sfx.faint();
  await tween(800, (t) => {
    v.melt = t;
    v.alpha = 1 - t * t;
    if (Math.random() < 0.5) drip(x - 34 + Math.random() * 68, y + 8 + t * 24, s.type === 'spirit' ? '#3b2470' : '#2b2036');
  });
  v.hidden = true;
}

// Returns once the charm has settled, with the outcome already decided.
// A wrong name: the charm bounces off, smoulders and drops.
async function fizzleFx(s: Species, ink: string) {
  const [tx, ty] = CENTRE.foe;
  charm.art = charmArt(s, ink);
  charm.show = true;
  sfx.throw();
  await tween(420, (t) => {
    charm.x = lerp(70, tx - 14, t);
    charm.y = lerp(112, ty, t) - Math.sin(t * Math.PI) * 36;
    charm.turn = t * Math.PI * 4;
  });
  sfx.fizzle();
  burst('ash', tx - 14, ty, 26, 1);
  await tween(620, (t) => {
    charm.x = tx - 14 - t * 20;
    charm.y = ty + t * t * 44;
    charm.turn = t * 1.4;
    if (Math.random() < 0.4) burst('ash', charm.x, charm.y, 2, 0.4);
  });
  charm.show = false;
}

async function catchFx(s: Species, caught: boolean, ink: string) {
  const v = views.foe;
  const [tx, ty] = CENTRE.foe;
  charm.art = charmArt(s, ink);
  charm.show = true;
  sfx.throw();
  await tween(460, (t) => {
    charm.x = lerp(70, tx, t);
    charm.y = lerp(112, ty, t) - Math.sin(t * Math.PI) * 42;
    charm.turn = t * Math.PI * 5;
  });
  charm.turn = 0;
  sfx.absorb();
  flashScreen(0.3);
  await tween(300, (t) => { v.flash = t; v.scale = lerp(1, 0.05, t * t); });
  v.hidden = true;
  await tween(240, (t) => { charm.y = lerp(ty, 72, t * t); });
  sfx.wobble();
  const shakes = caught ? 3 : 1 + rand(2);
  for (let i = 0; i < shakes; i++) {
    await pause(180);
    sfx.wobble();
    await tween(260, (t) => { charm.turn = Math.sin(t * Math.PI * 2) * 0.42; });
    charm.turn = 0;
  }
  await pause(220);
  if (caught) {
    sfx.caught();
    silence();
    burst('metal', charm.x, charm.y, 34, 1.3);
    popup('Caught!', 'foe', 'good');
    stamp('捕');
    await pause(650);
    charm.show = false;
    return;
  }
  sfx.burst();
  charm.show = false;
  burst('spirit', charm.x, charm.y, 30, 1.6);
  v.hidden = false;
  v.flash = 1;
  await tween(280, (t) => { v.scale = lerp(0.3, 1, easeOut(t)); v.flash = 1 - t; });
  sfx.cry(s.k.codePointAt(0)!);
}

const stageEl = document.getElementById('stage')!;

function overlay(cls: string, ms: number) {
  const el = document.createElement('div');
  el.className = cls;
  stageEl.append(el);
  setTimeout(() => el.remove(), ms);
  return el;
}

function popup(text: string, side: 'me' | 'foe', tone = '') {
  const [x, y] = CENTRE[side];
  const el = overlay(`pop ${tone}`, 900);
  el.textContent = text;
  el.style.left = `${(x / 240) * 100}%`;
  el.style.top = `${(y / 160) * 100}%`;
}

function callout(word: string, meaning: string) {
  const el = overlay('callout', 1150);
  el.append(Object.assign(document.createElement('b'), { textContent: word, lang: 'ja' }), Object.assign(document.createElement('span'), { textContent: meaning }));
}

function stamp(mark: string) {
  seal.art = sealArt(mark);
  sfx.stamp();
  void tween(1300, (t) => {
    seal.grow = t < 0.12 ? lerp(2, 1, t / 0.12) : 1;
    if (t >= 1) seal.art = null;
  });
}

async function duel(name: string, team: string[], lv: number) {
  await battleOpen('trial');
  for (const k of team) {
    await say(`${name === 'Aoi' ? 'Aoi' : `The ${name}`} sends out ${k}!`);
    await bringIn(spec(k), lv);
    if (!(await fight(false))) { foe = null; return false; }
  }
  silence();
  sfx.win();
  await pause(900);
  foe = null;
  music(areaTune());
  return true;
}

async function trial(l: Level) {
  if (save.trials.includes(l.id)) { await say(`${l.master}: You have nothing left to prove here. Keep reading!`); return; }
  if (mains(l.id).some((q) => !save.done.includes(q.id))) { await say(`${l.master}: The people of this land still need you. Finish your missions, then come to me.`); return; }
  const have = caughtIn(l.id);
  if (have < l.need) { await say(`${l.master}: Bring me ${l.need} ${l.id} kanji and I will test you. You have ${have}.`); return; }
  await say(`${l.master}: So Kanji Bear sent you. Show me what you have learned!`);
  if (!(await duel(l.master, l.team, l.lv))) return;
  save.trials.push(l.id);
  stamp('合格');
  for (const line of l.win) await say(`${l.master}: ${line}`);
  await say(`You mastered ${l.id}!`);
  if (!nextLevel()) {
    await say('Letter by letter, the signs of Japan fill with ink again.');
    await say('Kanji Bear: You did it, my student. Go home and tell your mother. You can read the world now.');
  }
  store();
}

// One quiz: pick the English meaning from four options.
// Dictionary notes in brackets don't fit a button, so answers show just the core meaning.
const brief = (m: string) => m.replace(/\s*\([^)]*\)/g, '').split(/[;,]/)[0].trim() || m;

async function quiz(prompt: string, right: string, pool: string[], few = false) {
  const answer = brief(right);
  const options = shuffle([answer, ...shuffle([...new Set(pool.map(brief))].filter((m) => m !== answer)).slice(0, few ? 1 : 3)]);
  const good = options[await ask(prompt, options)] === answer;
  (good ? sfx.right : sfx.wrong)();
  return good;
}

async function useMove(me: Fighter) {
  const s = spec(me.k);
  const i = await ask(`Choose a word for ${s.k}.`, [...s.moves.map((m) => `${m.w} (${m.r})`), 'Back']);
  return s.moves[i] ?? null;
}

async function fight(wild: boolean) {
  for (;;) {
    const me = lead();
    if (!me) return lose();
    const action = await ask(`What will ${spec(me.k).k} do?`, wild ? ['Attack', 'Charm', 'Item', 'Switch', 'Run'] : ['Attack', 'Item', 'Switch']);
    const label = wild ? ['attack', 'charm', 'item', 'switch', 'run'][action] : ['attack', 'item', 'switch'][action];
    if (label === 'run') { await say('You got away safely.'); veil.curtain = 1.2; return true; }
    if (label === 'switch') {
      if (await switchLead()) { await sendOut(); await enemyTurn(); }
      continue;
    }
    if (label === 'item') {
      if (await useItem(me) && !(await enemyTurn()) && !lead()) return lose();
      continue;
    }
    if (label === 'charm') {
      const thrown = await throwCharm();
      if (thrown === null) continue;
      if (thrown) return true;
      if (!(await enemyTurn()) && !lead()) return lose();
      continue;
    }
    const move = await useMove(me);
    if (!move) continue;
    if (await playerTurn(me, move)) return reward(me, wild);
    if (!(await enemyTurn())) { if (!lead()) return lose(); }
  }
}

async function playerTurn(me: Fighter, move: Move) {
  const s = spec(me.k);
  const right = await quiz(`${move.w} (${move.r}) means...`, move.m, all.flatMap((x) => x.moves.map((m) => m.m)));
  const dealt = damage(s, me.lv, foe!.s, foe!.f.lv, move, right, 0.9 + Math.random() * 0.2);
  const bonus = typeBonus(s.type, foe!.s.type);
  await attackFx('me', s, move, right, bonus, () => {
    foe!.f.hp = Math.max(0, foe!.f.hp - dealt);
    popup(`-${dealt}`, 'foe', bonus > 1 ? 'big' : '');
  });
  await say(`${right ? 'Correct! Full power!' : `Not quite: it means "${move.m}".`}\n${s.k} used ${move.w}! ${dealt} damage.${bonus > 1 ? ' Super strong!' : bonus < 1 ? ' Weak...' : ''}`);
  return foe!.f.hp <= 0;
}

async function enemyTurn() {
  const me = onField ?? lead();
  if (!me) return false;
  const s = spec(me.k);
  const move = foe!.s.moves[rand(foe!.s.moves.length)];
  const correct = Math.random() < 0.5;
  // No single wild hit takes more than half your health, so a full-health kanji always gets a turn.
  const dealt = Math.min(damage(foe!.s, foe!.f.lv, s, me.lv, move, correct, 0.9 + Math.random() * 0.2), Math.ceil(maxHp(s, me.lv) * 0.5));
  const bonus = typeBonus(foe!.s.type, s.type);
  await attackFx('foe', foe!.s, move, correct, bonus, () => {
    me.hp = Math.max(0, me.hp - dealt);
    popup(`-${dealt}`, 'me', bonus > 1 ? 'big' : '');
  });
  await say(`${foe!.s.k} used ${move.w} (${move.m})! ${dealt} damage.`);
  if (me.hp > 0) return true;
  card(cards.me, s.m, me.lv, 0, maxHp(s, me.lv));
  await faint('me', s);
  await say(`${s.k} fainted!`);
  if (!lead()) return false;
  await sendOut();
  return true;
}

async function reward(me: Fighter, wild: boolean) {
  await faint('foe', foe!.s);
  if (wild) { silence(); sfx.win(); }
  const gained = xpReward(foe!.f.lv), yen = yenFor(foe!.f.lv);
  save.yen += yen;
  const levels = gainXp(me, gained);
  const before = spec(me.k);
  await say(`${wild ? 'Wild ' : ''}${foe!.s.k} fainted. ${before.k} gained ${gained} XP and you found ¥${yen}.${levels ? `\n${before.k} grew to Lv${me.lv}!` : ''}`);
  if (levels) {
    me.hp = Math.min(maxHp(before, me.lv), me.hp + levels * 4);
    sfx.level();
    for (let i = 0; i < 3; i++) burst('metal', CENTRE.me[0], CENTRE.me[1] + 12 - i * 12, 12, 0.7);
    popup('Level up!', 'me', 'good');
    }
  store();
  return true;
}

// Returns null if the player backed out, so no turn is spent.
async function throwCharm(): Promise<boolean | null> {
  const kinds = CHARMS.filter((c) => (c.id === 'paper' ? save.charms : save.bag[c.id] ?? 0) > 0);
  if (!kinds.length) { await say('You have no charms left. Charm shops sell more.'); return null; }
  const count = (c: Charm) => (c.id === 'paper' ? save.charms : save.bag[c.id]);
  const c: Charm | undefined = kinds.length > 1 ? kinds[await ask('Throw which charm?', [...kinds.map((x) => charmWare(x, `x${count(x)}`)), 'Back'])] : kinds[0];
  if (!c) return null;
  const s = foe!.s;
  const right = await quiz(`Name it! What does ${s.k} mean?`, s.m, all.map((x) => x.m), c.easy);
  if (!right) {
    await fizzleFx(s, c.ink);
    await say(`The charm fizzles. ${s.k} means "${s.m}".`);
    return false;
  }
  if (c.id === 'paper') save.charms--;
  else save.bag[c.id]--;
  const max = maxHp(s, foe!.f.lv);
  if (c.soothe && onField) {
    const room = maxHp(spec(onField.k), onField.lv) - onField.hp, gain = Math.min(c.soothe, room);
    if (gain > 0) { onField.hp += gain; popup(`+${gain}`, 'me', 'good'); }
  }
  const caught = Math.random() <= holdChance(c, catchChance(foe!.f.hp, max));
  await catchFx(s, caught, c.ink);
  if (!caught) { await say(`Right name, but ${s.k} broke free!`); return false; }
  const f = { ...foe!.f };
  if (c.refresh) f.hp = max;
  const fresh = !save.caught.includes(s.k);
  if (fresh) save.caught.push(s.k);
  (save.party.length < 6 ? save.party : save.box).push(f);
  await say(`Gotcha! ${s.k} (${s.m}) was caught!\n${save.caught.length} of ${all.length} kanji found.`);
  store();
  return true;
}

async function lose() {
  await say('Kanji Bear: Your team is out of strength! I carried you back to safety.');
  silence();
  veil.curtain = 1.2;
  Object.assign(save, save.rest);
  for (const f of save.party) f.hp = maxHp(spec(f.k), f.lv);
  store();
  return false;
}

async function switchLead() {
  const live = save.party.map((f, i) => [f, i] as const).filter(([f]) => f.hp > 0);
  const i = await ask('Who goes next?', [...live.map(([f]) => `${f.k} Lv${f.lv} HP ${f.hp}`), 'Back']);
  if (!live[i]) return false;
  const [chosen, at] = live[i];
  save.party.splice(at, 1);
  save.party.unshift(chosen);
  return true;
}

// ---- Menu
async function menu() {
  mode = 'busy';
  for (;;) {
    const options = save.chapter === 'journey' ? ['Team', 'Bag', 'Collection', 'Missions', 'Zukan', 'Journey', 'Ask Bear', 'Save', 'Close'] : ['Save', 'Close'];
    const chosen = options[await ask(`Found ${save.caught.length} of ${all.length} · Charms ${save.charms}`, options)];
    if (chosen === 'Close') break;
    if (chosen === 'Save') { store(); await say('Saved.'); }
    if (chosen === 'Ask Bear') await say(`Kanji Bear: ${bearTip()}`);
    if (chosen === 'Bag') await useItem();
    if (chosen === 'Collection') {
      const tally = new Map<string, number>();
      for (const p of save.prizes) tally.set(p, (tally.get(p) ?? 0) + 1);
      await say(tally.size ? [...tally].map(([p, n]) => (n > 1 ? `${p} x${n}` : p)).join('\n') : 'Nothing yet. Gachapon capsules from the 6-7 Kombini hold little prizes.');
    }
    if (chosen === 'Missions') {
      const open = QUESTS.filter((q) => save.active.includes(q.id)).map((q) => { const p = progress(q); return `${q.title}${p ? ` (${Math.min(p[0], p[1])} of ${p[1]})` : ''}\n${q.wait}`; });
      await say([...open, `${save.done.length} of ${QUESTS.length} missions complete.`].join('\n\n'));
    }
    if (chosen === 'Journey') await say([`${SIGNS.filter((g) => save.caught.includes(g.k)).length} of ${SIGNS.length} signs restored`, ...LEVELS.map((l) => `${l.id}  ${l.land}: ${save.trials.includes(l.id) ? 'mastered' : `${caughtIn(l.id)} caught`}`), ...CLOSED.map((id) => `${id}  road closed`)].join('\n'));
    if (chosen === 'Team') await say(save.party.map((f) => { const s = spec(f.k); return `${s.k} ${s.m}  Lv${f.lv}  HP ${f.hp}/${maxHp(s, f.lv)}  XP ${f.xp}/${xpToNext(f.lv)}`; }).join('\n'));
    if (chosen === 'Zukan') await say(all.filter((s) => save.caught.includes(s.k)).slice(-14).map((s) => `${s.k} ${s.m}`).join(' · ') || 'Nothing caught yet.');
  }
  backToWorld();
}

// ---- Title and starter
async function title() {
  const old = restore();
  if (old && sessionStorage.getItem('kanjimon.jump')) {
    sessionStorage.removeItem('kanjimon.jump');
    save = old;
    return backToWorld();
  }
  if (!still) void nextChase();
  // The menu sits on the title screen, then goes back to the panel for the game.
  const [home, next] = [choicesEl.parentElement!, choicesEl.nextSibling];
  stage.append(choicesEl);
  const i = await ask('', old ? ['Continue', 'Start game'] : ['Start game']);
  home.insertBefore(choicesEl, next);
  if (old && i === 0) {
    save = old;
    if (save.map === 'dojo' && (save.chapter === 'home' || save.chapter === 'dojo')) return meetBear();
    return backToWorld();
  }
  music('home');
  veil.curtain = 1.2;
  save = { map: 'home', x: 11, y: 4, dir: 'left', party: [], box: [], seen: [], caught: [], charms: 0, chapter: 'home', trials: [], active: [], done: [], yen: 200, bag: { rice: 2 }, prizes: [], rest: { map: 'village', x: 12, y: 5 } };
  mode = 'busy';
  place();
  const scene: NonNullable<typeof intro> = { x: 5 * T, dir: 'right', walking: false, asleep: true, startled: false, hop: null };
  intro = scene;
  const momWalks = async (to: number) => {
    const from = scene.x;
    scene.walking = true;
    await tween(Math.abs(to - from) * 20, (t) => { scene.x = lerp(from, to, t); });
    scene.walking = false;
  };
  await pause(1200);
  await momWalks(10 * T);
  await say('Mom: Wake up, Haru. Today is the day.');
  clearPanel();
  sfx.alert();
  scene.startled = true;
  await pause(500);
  scene.startled = false;
  scene.asleep = false;
  sfx.pop();
  await tween(520, (t) => { scene.hop = [lerp(BED.x, 11 * T, t), lerp(BED.y, 4 * T, t) - Math.sin(t * Math.PI) * 20]; });
  scene.hop = [11 * T, 4 * T];
  sfx.rustle();
  await pause(250);
  await say('Mom: Every sign, every story and every letter in this world is written in kanji. Read them, and you will understand the world.');
  await say('Mom: But something is wrong. This week the signs in the village went blank, one by one, and nobody knows why.');
  await say('Mom: So I am sending you to Kanji Bear, the greatest teacher in Japan. Learn from the bear and master kanji.');
  await say('Mom: The dojo is on the east side of the village, the house with the red curtain. Take these rice balls and some yen. Off you go, and be polite!');
  clearPanel();
  scene.dir = 'left';
  await momWalks(5 * T);
  intro = null;
  store();
  backToWorld();
}

async function meetBear() {
  mode = 'busy';
  save.chapter = 'dojo';
  await say('Kanji Bear: Ah, you must be Haru. Your mother wrote to me about you. Welcome to my dojo!');
  await say('Kanji Bear: Here is something the books leave out. Kanji are alive. They have woken and walked off every sign in Japan, and that is why the world is going blank.');
  await say('Kanji Bear: You can only befriend a kanji by knowing its meaning. Catch them, and their signs will come back.');
  await say('Kanji Bear: No student walks alone. Three kanji on those stands want to travel with you. Go and talk to the one you like!');
  save.chapter = 'choose';
  store();
  backToWorld();
}

async function chooseStarter(i: number) {
  mode = 'busy';
  const s = spec(STARTERS[i]);
  sfx.cry(s.k.codePointAt(0)!);
  if ((await ask(`${s.k} (${s.m}) looks at you. Travel with ${s.k}?`, ['Yes', 'Not yet'])) !== 0) return backToWorld();
  save.party.push({ k: s.k, lv: 5, xp: 0, hp: maxHp(s, 5) });
  save.seen.push(s.k); save.caught.push(s.k);
  save.starter = s.k;
  save.charms = 5; save.chapter = 'journey'; save.active.push('first');
  sfx.caught();
  STARTERS.forEach((k, n) => { if (k !== s.k) burst('spirit', 80 + n * 48, 30, 26, 1.2); });
  await say(`${s.k} (${s.m}) joined you!`);
  await say('Kanji Bear: A fine choice. The other two will rest in their charms until the next student comes.');
  await say('Kanji Bear: Attacks are real words, so answer their meanings to hit hard. A paper charm only binds a kanji you can name.');
  await say('Kanji Bear: Your path runs through five levels, from N5 up to N1. Today, two lands are open. N5 runs from the Rice Fields to the Cedar Forest, and N4 from the Mountain Pass to Castle Town.');
  await say('Kanji Bear: Take your time. Help the people you meet, read everything, and each master will test you when you are ready.');
  await say('Kanji Bear: Your first lesson: catch 3 kanji in the Rice Fields, then come back to me.');
  store();
  backToWorld();
}

// ---- Drawing
let alarm = false, opening = false;
// Whoever Haru is talking to turns to face them.
let facing: Npc | null = null;
function toward(n: Npc) {
  const [dx, dy] = [save.x - n.x, save.y - n.y];
  return Math.abs(dx) >= Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : dy > 0 ? 'down' : 'up';
}
// The opening scene: Mom walks over and Haru jumps out of bed.
const BED = { x: 184, y: 38 };
let intro: { x: number; dir: string; walking: boolean; asleep: boolean; startled: boolean; hop: number[] | null } | null = null;
function introMarks() {
  if (!intro) return;
  ctx.fillStyle = '#2b2036';
  if (intro.startled) { ctx.fillRect(BED.x + 6, BED.y - 17, 4, 8); ctx.fillRect(BED.x + 6, BED.y - 8, 4, 3); ctx.fillStyle = '#ffffff'; ctx.fillRect(BED.x + 7, BED.y - 16, 2, 6); ctx.fillRect(BED.x + 7, BED.y - 7, 2, 1); return; }
  if (!intro.asleep) return;
  // Three z's drifting up from the pillow.
  ctx.fillStyle = '#3a4a8c';
  for (let i = 0; i < 3; i++) {
    const t = (tick / 90 + i / 3) % 1, [x, y, size] = [BED.x + 16 + Math.round(t * 8), BED.y - 2 - Math.round(t * 16), t < 0.5 ? 3 : 4];
    ctx.fillRect(x, y, size, 1); ctx.fillRect(x, y + size - 1, size, 1); ctx.fillRect(x + 1, y + 1, Math.max(1, size - 2), Math.max(1, size - 2));
  }
}
let heroAt: [number, number] = [120, 80];
const petals = Array.from({ length: 16 }, (_, i) => ({ x: (i * 53) % 240, y: (i * 37) % 160, v: 0.2 + (i % 4) * 0.08 }));
let tick = 0;

function drawWorld() {
  const m = map();
  const w = paintMap(save.map, m.rows);
  const [dx, dy] = DIRS[save.dir];
  const px = save.x * T - dx * slide, py = save.y * T - dy * slide;
  const cx = m.room ? 0 : Math.round(Math.max(0, Math.min(px - 112, m.rows[0].length * T - 240))), cy = m.room ? 0 : Math.round(Math.max(0, Math.min(py - 72, 16 * T - 160)));
  ctx.drawImage(w.base, -cx, -cy);
  if (!still) for (const [x, y] of w.shimmer) {
    const glint = (tick / 90 + (x * 7 + y * 13) / 160) % 1;
    if (glint > 0.5) continue;
    ctx.fillStyle = '#dcf6f6';
    ctx.fillRect(x + 3 + (y % 5) - cx, y + 5 + (x % 7) - cy, glint < 0.25 ? 5 : 3, 1);
  }
  if (save.map === 'dojo' && save.chapter === 'journey') starterRow.forEach((s, i) => { if (s.k !== save.starter) ctx.drawImage(charmArt(s), 80 - cx + i * 48 - 16, 6 - cy); });
  if (save.map === 'dojo' && save.chapter !== 'journey') starterRow.forEach((s, i) => ctx.drawImage(kanjiSprite(s, 32), 56 - MARGIN + i * 48, 14 - MARGIN + Math.round(Math.sin(tick / 20 + i))));
  heroAt = [Math.round(px - cx) + 8, Math.round(py - cy)];
  const step = slide > 8 ? (stepFlip ? 1 : 2) : 0;
  const actors = [...npcsHere().map((n) => ({ y: n.y * T, draw: () => {
    if (n.guide) bear(ctx, n.x * T - cx, n.y * T - cy);
    else if (intro && n.mom) person(ctx, n.look ?? 'hero', Math.round(intro.x), n.y * T, intro.dir, intro.walking ? [1, 0, 2, 0][Math.floor(tick / 6) % 4] : 0);
    else person(ctx, n.look ?? 'hero', n.x * T - cx, n.y * T - cy, n === facing ? toward(n) : 'down', 0);
  } })), { y: py, draw: () => {
    if (intro?.asleep) return asleep(ctx, haru, BED.x, BED.y);
    const [hx, hy] = intro?.hop ?? [px, py];
    person(ctx, haru, Math.round(hx - cx), Math.round(hy - cy), save.dir, intro ? 0 : step);
  } }];
  for (const a of actors.sort((p, q) => p.y - q.y)) a.draw();
  // Tall grass and rice close over the walker's legs.
  if ('"r'.includes(m.rows[save.y][save.x])) ctx.drawImage(w.base, save.x * T, save.y * T + 10, T, 6, save.x * T - cx, save.y * T + 10 - cy, T, 6);
  ctx.drawImage(w.fg, -cx, -cy);
  introMarks();
  if (alarm) {
    ctx.fillStyle = '#2b2036'; ctx.fillRect(Math.round(px - cx) + 6, Math.round(py - cy) - 15, 4, 11);
    ctx.fillStyle = '#ffffff'; ctx.fillRect(Math.round(px - cx) + 7, Math.round(py - cy) - 14, 2, 6); ctx.fillRect(Math.round(px - cx) + 7, Math.round(py - cy) - 7, 2, 2);
  }
  if (save.map === 'village' && !still) drawPetals('#ffd5e2', '#f4a8c0');
  if (save.map === 'onsen' && !still) drawPetals('#ffffff', '#e8eef4');
}

function drawPetals(light: string, dark: string) {
  for (const p of petals) {
    p.y += p.v; p.x += Math.sin((tick + p.y) / 24) * 0.3 - p.v * 0.4;
    if (p.y > 160) p.y = -4;
    if (p.x < -4) p.x = 244;
    ctx.fillStyle = light; ctx.fillRect(Math.round(p.x), Math.round(p.y), 2, 1);
    ctx.fillStyle = dark; ctx.fillRect(Math.round(p.x) + 1, Math.round(p.y) + 1, 1, 1);
  }
}

// Status cards are real interface elements, so names and numbers stay sharp at any size.
const cards = { foe: document.getElementById('foe-card')!, me: document.getElementById('me-card')! };
const shown = new Map<HTMLElement, string>();

function card(el: HTMLElement, name: string, lv: number, hp: number, max: number) {
  const key = `${name}|${lv}|${hp}|${max}`;
  if (shown.get(el) === key) return;
  shown.set(el, key);
  const f = Math.max(0, Math.min(hp / max, 1));
  el.querySelector('b')!.textContent = name[0].toUpperCase() + name.slice(1);
  el.querySelector('i')!.textContent = `Lv ${lv}`;
  el.querySelector('output')!.textContent = `${Math.max(0, hp)} / ${max}`;
  const fill = el.querySelector<HTMLElement>('.fill')!;
  fill.style.width = `${f * 100}%`;
  fill.dataset.level = f > 0.5 ? 'good' : f > 0.2 ? 'low' : 'danger';
}

function drawBattle() {
  ctx.drawImage(backdrop(map().sky ?? save.map), 0, 0);
  const bob = still ? 0 : Math.round(Math.sin(tick / 24));
  const me = onField;
  if (foe) {
    drawKanji(ctx, views.foe, kanjiSprite(foe.s, 72), foe.s, 151 - MARGIN, 20 - MARGIN + bob, 72);
    card(cards.foe, save.caught.includes(foe.s.k) ? foe.s.m : 'Unknown kanji', foe.f.lv, foe.f.hp, maxHp(foe.s, foe.f.lv));
  }
  if (me) {
    const s = spec(me.k);
    drawKanji(ctx, views.me, kanjiSprite(s, 80, true), s, 19 - MARGIN, 68 - MARGIN - bob, 80);
    card(cards.me, s.m, me.lv, me.hp, maxHp(s, me.lv));
    cards.me.classList.toggle('danger', me.hp / maxHp(s, me.lv) < 0.2);
  }
  drawCharm(ctx);
}

// Behind the title menu Haru chases a kanji across the field. Every round has a new kanji and a new way of running.
interface Chase { s: Species; dir: number; speed: number; hop: number; gap: number; size: number; turned: boolean; x: number }
const GROUND = 140;
let chase: Chase | null = null;
const dust: { x: number; y: number; drift: number; age: number }[] = [];

async function nextChase() {
  chase = null;
  const s = all[rand(all.length)], dir = rand(2) ? 1 : -1;
  await loadLettering(s.k);
  // Now and then the tables turn, and the kanji chases Haru instead.
  chase = { s, dir, speed: 0.8 + Math.random() * 0.7, hop: 2 + rand(5), gap: 34 + rand(26), size: 24 + rand(3) * 6, turned: rand(4) === 0, x: dir > 0 ? -20 : 260 };
}

function drawTitle() {
  ctx.drawImage(backdrop('title'), 0, 0);
  if (still) {
    person(ctx, lukas ? 'lukas' : 'hero', 96, GROUND - 16, 'right', 0);
    ctx.drawImage(kanjiSprite(starterRow[0], 30), 130 - MARGIN, GROUND - 30 - MARGIN);
    return;
  }
  for (const d of dust) {
    d.age++; d.x += d.drift; d.y -= 0.08;
    ctx.fillStyle = d.age < 10 ? '#fbf3df' : '#dfd2ad';
    const size = d.age < 8 ? 3 : d.age < 16 ? 2 : 1;
    ctx.fillRect(Math.round(d.x), Math.round(d.y), size, size);
  }
  dust.splice(0, dust.findIndex((d) => d.age <= 24) >>> 0);
  if (!chase) return;
  const c = chase;
  c.x += c.dir * c.speed;
  const [boyX, kanjiX] = c.turned ? [c.x, c.x - c.dir * c.gap] : [c.x - c.dir * c.gap, c.x];
  const rear = Math.min(c.dir * boyX, c.dir * kanjiX) * c.dir;
  const hop = Math.abs(Math.sin(tick * 0.2 * c.speed)) * c.hop;
  const kick = (x: number) => dust.push({ x: x + Math.random() * 6 - 3, y: GROUND - 2 - Math.random() * 3, drift: -c.dir * (0.2 + Math.random() * 0.4), age: 0 });
  if (tick % 4 === 0) kick(boyX + (c.dir > 0 ? 3 : 13));
  if (hop < 1 && tick % 2 === 0) kick(kanjiX + c.size / 2 - c.dir * c.size / 3);
  ctx.fillStyle = 'rgba(30,30,70,.28)';
  ctx.fillRect(Math.round(kanjiX + c.size / 6), GROUND - 1, Math.round(c.size * 2 / 3), 2);
  const runners = [
    () => ctx.drawImage(kanjiSprite(c.s, c.size), Math.round(kanjiX) - MARGIN, Math.round(GROUND - c.size - hop) - MARGIN),
    () => person(ctx, lukas ? 'lukas' : 'hero', Math.round(boyX), GROUND - 16, c.dir > 0 ? 'right' : 'left', [1, 0, 2, 0][Math.floor(tick / 5) % 4]),
  ];
  for (const run of runners) run();
  if (c.dir > 0 ? rear > 260 : rear < -c.size - 20) void nextChase();
}

const STARTERS = ['火', '水', '木'];
let starterRow: Species[] = [];

function frame(now = 0) {
  tick++;
  beginFrame(ctx, now);
  ctx.imageSmoothingEnabled = false;
  if (mode === 'world' || (mode === 'busy' && !foe)) {
    if (slide > 0) slide = Math.max(0, slide - 2);
    else if (mode === 'world') {
      const dir = ['up', 'down', 'left', 'right'].find((d) => held.has(d));
      if (dir) walk(dir);
    }
  }
  stage.dataset.scene = mode === 'title' ? 'title' : foe || opening ? 'battle' : 'world';
  if (mode === 'title') drawTitle();
  else if (foe || opening) drawBattle();
  else if (save) drawWorld();
  drawBits(ctx);
  endFrame(ctx);
  requestAnimationFrame(frame);
}

// ---- Input
const KEYS: Record<string, string> = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right', w: 'up', s: 'down', a: 'left', d: 'right', z: 'a', Enter: 'a', ' ': 'a', x: 'menu', Escape: 'menu' };

function press(action: string) {
  unlock();
  const count = choicesEl.children.length;
  if (count) {
    const columns = getComputedStyle(choicesEl).gridTemplateColumns.split(' ').length;
    if (action === 'a') return pick(selected);
    const move = { left: -1, right: 1, up: -columns, down: columns }[action];
    if (move) { selected = Math.max(0, Math.min(count - 1, selected + move)); mark(); sfx.move(); }
    return;
  }
  if (waiting) {
    if (action === 'a') pick(0);
    return;
  }
  if (mode !== 'world') return;
  if (action === 'a') void talk();
  if (action === 'menu') void menu();
}

addEventListener('keydown', (e) => {
  if (settings.open) return;
  const action = KEYS[e.key];
  if (!action) return;
  e.preventDefault();
  if (DIRS[action]) held.add(action);
  if (!e.repeat) press(action);
});
addEventListener('keyup', (e) => held.delete(KEYS[e.key]));

document.querySelectorAll<HTMLButtonElement>('#pad button').forEach((b) => {
  const action = b.dataset.key!;
  b.addEventListener('pointerdown', (e) => { e.preventDefault(); if (DIRS[action]) held.add(action); press(action); });
  for (const end of ['pointerup', 'pointerleave', 'pointercancel']) b.addEventListener(end, () => held.delete(action));
});

panelEl.addEventListener('click', () => { if (waiting && !choicesEl.children.length) pick(0); });

// ---- Thumbstick: pushing it holds a direction, and each new direction also moves through menus.
const stick = document.getElementById('stick')!;
const knob = document.getElementById('knob')!;
let pushed = '';

function aim(dir: string) {
  if (dir === pushed) return;
  if (pushed) held.delete(pushed);
  pushed = dir;
  if (dir) { held.add(dir); press(dir); }
}

function pushStick(e: PointerEvent) {
  const box = stick.getBoundingClientRect();
  const reach = box.width / 2 - 24;
  const [dx, dy] = [e.clientX - box.left - box.width / 2, e.clientY - box.top - box.height / 2];
  const pull = Math.hypot(dx, dy), scale = pull > reach ? reach / pull : 1;
  knob.style.transform = `translate(${dx * scale}px, ${dy * scale}px)`;
  if (pull < 16) return aim('');
  // The current direction is favoured slightly, so a push near a diagonal doesn't flicker.
  const sideways = pushed === 'left' || pushed === 'right', upright = pushed === 'up' || pushed === 'down';
  const across = Math.abs(dx) * (sideways ? 1.3 : 1), along = Math.abs(dy) * (upright ? 1.3 : 1);
  aim(across > along ? (dx > 0 ? 'right' : 'left') : dy > 0 ? 'down' : 'up');
}

function releaseStick() {
  stick.classList.remove('on');
  knob.style.transform = '';
  aim('');
}

stick.addEventListener('pointerdown', (e) => { e.preventDefault(); unlock(); stick.setPointerCapture(e.pointerId); stick.classList.add('on'); pushStick(e); });
stick.addEventListener('pointermove', (e) => { if (stick.classList.contains('on')) pushStick(e); });
for (const end of ['pointerup', 'pointercancel']) stick.addEventListener(end, releaseStick);

// ---- Debug menu, only with ?debug in the address.
function debugStops() {
  const line = mains();
  const stops: { label: string; done: string[]; trials: LevelId[]; who: string; level: LevelId }[] = [];
  for (const l of LEVELS) {
    const earlier = LEVELS.slice(0, LEVELS.indexOf(l)).map((x) => x.id);
    for (const q of mains(l.id)) stops.push({ label: `${l.id}: ${q.title}`, done: line.slice(0, line.indexOf(q)).map((m) => m.id), trials: earlier, who: q.giver, level: l.id });
    stops.push({ label: `${l.id}: trial with the ${l.master}`, done: line.filter((m) => m.level === l.id || earlier.includes(m.level!)).map((m) => m.id), trials: earlier, who: l.master, level: l.id });
  }
  stops.push({ label: 'After the ending', done: line.map((m) => m.id), trials: LEVELS.map((l) => l.id), who: 'Castle Scribe', level: 'N4' });
  return stops;
}

function debugJump(stop: ReturnType<typeof debugStops>[number], lv: number) {
  const [id, m] = Object.entries(MAPS).find(([, map]) => map.npcs.some((n) => n.name === stop.who))!;
  const quest = QUESTS.find((q) => q.giver === stop.who && stop.label.endsWith(q.title));
  const [mapId, place2] = quest ? (Object.entries(MAPS).find(([, map]) => map.name === home(quest) && map.npcs.some((n) => n.name === quest.giver)) ?? [id, m]) : [id, m];
  const n = place2.npcs.find((p) => p.name === stop.who)!;
  const spot = [[0, 1], [0, -1], [1, 0], [-1, 0]].map(([dx, dy]) => [n.x + dx, n.y + dy]).find(([x, y]) => !SOLID.includes(place2.rows[y]?.[x] ?? 'T')) ?? [n.x, n.y + 1];
  const caught = ['火', ...stop.trials.flatMap((t) => all.filter((s) => s.level === t).map((s) => s.k))];
  const next: Save = {
    map: mapId, x: spot[0], y: spot[1], dir: spot[1] > n.y ? 'up' : 'down',
    party: [{ k: '火', lv, xp: 0, hp: maxHp(spec('火'), lv) }], box: [], seen: caught, caught,
    charms: 20, starter: '火', chapter: 'journey', trials: stop.trials, active: [], done: stop.done, yen: 3000, bag: {}, prizes: [], rest: { map: 'village', x: 12, y: 5 },
  };
  localStorage.setItem(KEY, JSON.stringify(next));
  sessionStorage.setItem('kanjimon.jump', '1');
  location.reload();
}

if (new URLSearchParams(location.search).has('debug')) {
  const tune = (() => { try { return JSON.parse(localStorage.getItem('kanjimon.debug.v1') ?? '{}'); } catch { return {}; } })();
  for (const l of LEVELS) if (tune[l.id]) l.need = tune[l.id];
  const box = document.createElement('dialog');
  box.id = 'debug';
  const button = (id: string, text: string) => `<button class="tool" type="button" data-do="${id}">${text}</button>`;
  box.innerHTML = `<h2>Debug</h2>
    <label class="field">Jump to<select id="dbg-stop"></select></label>
    <label class="field">Team level<input id="dbg-lv" type="number" min="1" max="99" value="20" /></label>
    <button class="done" type="button" data-do="jump">Jump there</button>
    ${LEVELS.map((l) => `<label class="field">${l.id} trial needs<input data-need="${l.id}" type="number" min="0" max="166" value="${l.need}" /> kanji</label>`).join('')}
    <div class="tools">${button('level', 'Set team level')}${button('heal', 'Heal team')}${button('yen', 'Add ¥1000')}${button('charms', 'Add 5 of each charm')}${button('items', 'Add 5 of each item')}${button('catch', 'Catch 10 here')}${button('mission', 'Finish missions')}${button('win', 'Weaken this foe')}</div>
    <button class="done" type="button" data-do="close">Close</button>`;
  document.body.append(box);
  const open = Object.assign(document.createElement('button'), { className: 'back', type: 'button', textContent: 'Debug' });
  document.querySelector('.links')!.prepend(open);
  open.addEventListener('click', () => { box.showModal(); open.blur(); });
  const refresh = () => { store(); if (mode === 'world') place(); };
  const pick = box.querySelector('#dbg-stop') as HTMLSelectElement;
  const lvIn = box.querySelector('#dbg-lv') as HTMLInputElement;
  const fill = () => { pick.replaceChildren(...debugStops().map((s, i) => new Option(s.label, String(i)))); };
  box.querySelectorAll<HTMLInputElement>('[data-need]').forEach((inp) => inp.addEventListener('change', () => {
    const l = LEVELS.find((x) => x.id === inp.dataset.need)!;
    l.need = Number(inp.value);
    tune[l.id] = l.need;
    localStorage.setItem('kanjimon.debug.v1', JSON.stringify(tune));
    if (save) refresh();
  }));
  box.addEventListener('click', (e) => {
    const act = (e.target as HTMLElement).dataset.do;
    if (!act) return;
    if (act === 'close') return box.close();
    if (act === 'jump') return debugJump(debugStops()[Number(pick.value)], Number(lvIn.value) || 20);
    if (!save) return;
    if (act === 'level') for (const f of save.party) { f.lv = Number(lvIn.value) || f.lv; f.hp = maxHp(spec(f.k), f.lv); }
    if (act === 'heal') for (const f of save.party) f.hp = maxHp(spec(f.k), f.lv);
    if (act === 'yen') save.yen += 1000;
    if (act === 'charms') { save.charms += 5; for (const c of CHARMS) if (c.id !== 'paper') save.bag[c.id] = (save.bag[c.id] ?? 0) + 5; }
    if (act === 'items') for (const it of ITEMS) save.bag[it.id] = (save.bag[it.id] ?? 0) + 5;
    if (act === 'catch') { const left = [...(POOLS[save.map] ?? '')].filter((k) => !save.caught.includes(k)).slice(0, 10); save.caught.push(...left); save.seen.push(...left); }
    if (act === 'mission') { for (const id of save.active) save.done.push(id); save.active = []; }
    if (act === 'win' && foe) foe.f.hp = 1;
    refresh();
  });
  (window as unknown as { kanjimonoDebugReady: () => void }).kanjimonoDebugReady = fill;
}

// ---- Settings
const settings = document.getElementById('settings') as HTMLDialogElement;
const switches = [...settings.querySelectorAll<HTMLButtonElement>('[role="switch"]')];
const values: Record<string, () => boolean> = { music: () => sound.music, effects: () => sound.effects, kids: () => kids };
const showSwitches = () => { for (const b of switches) b.setAttribute('aria-checked', String(values[b.dataset.set!]())); };

for (const b of switches) b.addEventListener('click', () => {
  unlock();
  const part = b.dataset.set!;
  if (part === 'kids') {
    kids = !kids;
    try { localStorage.setItem('kanjimon.kids.v1', kids ? 'on' : 'off'); } catch {}
    document.querySelectorAll<HTMLElement>('#panel [data-raw]').forEach((el) => spelled(el, el.dataset.raw!));
  } else setSound(part as 'music' | 'effects', !sound[part as 'music' | 'effects']);
  showSwitches();
  sfx.pick();
});
const looks = [...settings.querySelectorAll<HTMLButtonElement>('[data-look]')];
if (lukas) document.querySelector<HTMLElement>('.pick[aria-label="Character"]')!.closest<HTMLElement>('.row')!.style.display = 'none';
const showLook = () => { for (const b of looks) b.setAttribute('aria-pressed', String(b.dataset.look === haru)); };
for (const b of looks) b.addEventListener('click', () => {
  unlock();
  haru = b.dataset.look!;
  try { localStorage.setItem('kanjimon.look.v1', haru); } catch {}
  showLook();
  sfx.pick();
});
showLook();
document.getElementById('open-settings')!.addEventListener('click', (e) => { unlock(); settings.showModal(); (e.currentTarget as HTMLElement).blur(); });
document.getElementById('close-settings')!.addEventListener('click', () => settings.close());
addEventListener('pointerdown', unlock);
addEventListener('keydown', (e) => {
  unlock();
  if (e.key === 'm' && !settings.open) settings.showModal();
});
showSwitches();

// ---- Boot
fetch('/kanjimono/data.json')
  .then((r) => r.json())
  .then(async (data: Species[]) => {
    all = data;
    await loadLettering('捕完合格');
    (window as unknown as { kanjimonoDebugReady?: () => void }).kanjimonoDebugReady?.();
    await loadLettering(STARTERS.join(''));
    void loadLettering(data.map((s) => s.k).join(''));
    dex = new Map(data.map((s) => [s.k, s]));
    starterRow = STARTERS.map(spec);
    requestAnimationFrame(frame);
    await title();
  })
  .catch(() => clearPanel("Couldn't load the game. Refresh to try again."));
