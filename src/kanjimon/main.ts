import { catchChance, damage, gainXp, maxHp, typeBonus, xpReward, xpToNext, type Fighter, type Move, type Species } from './battle';
import { bear, kanjiSprite, person } from './sprites';
import { music, setSound, sfx, silence, soundOn, unlock } from './audio';
import { beginFrame, burst, charm, CENTRE, charmArt, drawBits, drawCharm, drawKanji, drip, easeOut, endFrame, flashScreen, lerp, newView, pause, shakeScreen, still, tween, veil, views } from './fx';
import { MAPS, SOLID, type Door, type Npc } from './maps';
import { CHECKS, CLOSED, LEVELS, POOLS, QUESTS, SIGNS, type Level, type LevelId, type Quest, type Read } from './story';
import { backdrop, paintMap } from './world';

const screen = document.getElementById('screen') as HTMLCanvasElement;
const ctx = screen.getContext('2d')!;
ctx.imageSmoothingEnabled = false;
const stage = document.getElementById('stage')!;
const textEl = document.getElementById('text')!;
const statusEl = document.getElementById('status')!;
const choicesEl = document.getElementById('choices')!;
const T = 16;

interface Save { map: string; x: number; y: number; dir: string; party: Fighter[]; box: Fighter[]; seen: string[]; caught: string[]; charms: number; chapter: 'home' | 'dojo' | 'journey'; trials: LevelId[]; active: string[]; done: string[]; rest: { map: string; x: number; y: number } }
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
  try { return JSON.parse(localStorage.getItem(KEY) ?? 'null'); } catch { return null; }
}

// ---- Panel: everything said or chosen goes through these two.
let waiting: ((value: number) => void) | null = null;
let selected = 0;

function mark() {
  [...choicesEl.children].forEach((b, i) => b.classList.toggle('on', i === selected));
}

// A speaker's name gets its own line, so dialogue reads like a conversation.
function show(text: string, sub = '') {
  statusEl.hidden = true;
  textEl.hidden = false;
  const [, who, line] = text.match(/^([A-Z][A-Za-z' ]{2,20}): (.*)$/s) ?? [];
  const parts: HTMLElement[] = [];
  if (who) parts.push(Object.assign(document.createElement('strong'), { textContent: who }));
  parts.push(Object.assign(document.createElement('span'), { textContent: line ?? text }));
  if (sub) parts.push(Object.assign(document.createElement('small'), { textContent: sub }));
  textEl.replaceChildren(...parts);
  textEl.classList.toggle('bear', who === 'Kanji Bear');
}

// Leading kanji are set larger, in the Japanese face.
function label(b: HTMLButtonElement, text: string) {
  const [, kanji, rest] = text.match(/^([\u3005-\u9fff]+)(.*)$/s) ?? [];
  if (!kanji) { b.textContent = text; return; }
  b.replaceChildren(Object.assign(document.createElement('span'), { textContent: kanji, lang: 'ja', className: 'ja' }), rest);
}

function ask(text: string, options: string[]) {
  show(text);
  selected = 0;
  choicesEl.replaceChildren(...options.map((text, i) => {
    const b = document.createElement('button');
    label(b, text);
    if (options.length === 1) b.classList.add('full');
    if (text.length > 20) b.classList.add('long');
    b.addEventListener('click', () => pick(i));
    return b;
  }));
  mark();
  return new Promise<number>((resolve) => { waiting = resolve; });
}

function pick(i: number) {
  if (!waiting) return;
  sfx.pick();
  const done = waiting;
  waiting = null;
  choicesEl.replaceChildren();
  done(i);
}

const say = (text: string) => ask(text, ['Next']);
const clearPanel = (text = '', sub = '') => { show(text, sub); choicesEl.replaceChildren(); };

// While walking, the panel is a status screen: where you are, your mission, and your counts.
function place() {
  music(areaTune());
  const g = goal();
  const l = nextLevel() ?? LEVELS[LEVELS.length - 1];
  const total = all.filter((s) => s.level === l.id).length;
  const signs = SIGNS.filter((s) => save.caught.includes(s.k)).length;
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
    for (const [value, label] of [[`${caughtIn(l.id)} / ${total}`, `${l.id} kanji`], [`${save.charms}`, 'Charms'], [`${signs} / ${SIGNS.length}`, 'Signs']]) {
      const item = el('li');
      item.append(el('b', value), el('span', label));
      stats.append(item);
    }
    statusEl.append(stats);
  }
  textEl.hidden = true;
  statusEl.hidden = false;
  choicesEl.replaceChildren();
}

// ---- World
let mode: 'title' | 'world' | 'battle' | 'busy' = 'title';
const held = new Set<string>();
let slide = 0, stepFlip = false;
let foe: { s: Species; f: Fighter } | null = null;

const map = () => MAPS[save.map];
const tileAt = (x: number, y: number) => map().rows[y]?.[x] ?? 'T';
const TUNES: Record<string, string> = { home: 'home', dojo: 'home', school: 'kawabe', inn: 'onsen', hall: 'castle' };
const areaTune = () => TUNES[save.map] ?? save.map;
const npcsHere = () => map().npcs.filter((n) => !n.after || save.done.includes(n.after));
const npcAt = (x: number, y: number) => npcsHere().find((n) => n.x === x && n.y === y);
const DIRS: Record<string, [number, number]> = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };

function walk(dir: string) {
  save.dir = dir;
  const [dx, dy] = DIRS[dir];
  const [nx, ny] = [save.x + dx, save.y + dy];
  const m = map();
  if (nx >= 24 && m.east) {
    const closed = m.gate && (m.gate.quest ? !save.done.includes(m.gate.quest) : !save.trials.includes(m.gate.trial!));
    if (closed && !(m.gate!.quest === 'first' && save.chapter === 'journey')) return void notice(m.gate!.line);
    return travel(m.east, 0, save.y);
  }
  if (nx < 0 && m.west) return travel(m.west, 23, save.y);
  const door = m.doors?.find((d) => d.x === nx && d.y === ny);
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
  if (d.to === 'dojo' && save.chapter !== 'journey') void meetBear();
  else place();
}

function travel(to: string, x: number, y: number) {
  save.map = to; save.x = x; save.y = y;
  store();
  place();
}

async function talk() {
  const [dx, dy] = DIRS[save.dir];
  const [ax, ay] = [save.x + dx, save.y + dy];
  if (tileAt(ax, ay) === 'S') sfx.sign();
  if (tileAt(ax, ay) === 'S') return notice(signText(SIGNS.find((s) => s.map === save.map && s.x === ax && s.y === ay)!));
  const n = npcAt(ax, ay);
  if (!n) return;
  mode = 'busy';
  if (!(await questTalk(n))) for (const line of n.guide ? [bearTip()] : n.mom ? momLines() : n.lines) await say(`${n.name}: ${line}`);
  if (n.heal && save.party.length) {
    for (const f of save.party) f.hp = maxHp(spec(f.k), f.lv);
    save.charms = Math.max(save.charms, 10);
    save.rest = { map: save.map, x: save.x, y: save.y };
    await say('Your team is fully restored, and you have at least 10 paper charms.');
    store();
  }
  if (n.master) await trial(LEVELS.find((l) => l.id === n.master)!);
  backToWorld();
}

const signText = (s: { k: string; word: string; en: string }) =>
  save.caught.includes(s.k) ? `${s.word}\n${s.en}` : 'The sign is blank. Its kanji has wandered off.';

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
  stamp('完');
  await say(`Mission complete: ${q.title}${q.charms ? `\nYou received ${q.charms} paper charms.` : ''}`);
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
  if (tired) return 'Your team looks tired. Your mother, an innkeeper or a shrine can restore them.';
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
  const from = missing.length && Math.random() < 0.6 ? missing : pool;
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
  await tween(320, (t) => { veil.wipe = 1 - t; });
  veil.wipe = 0;
  opening = false;
  await tween(320, (t) => { views.me.x = lerp(-130, 0, easeOut(t)); });
}

// A new kanji writes itself in stroke order, then bursts into life.
async function bringIn(s: Species, lv: number) {
  foe = { s, f: { k: s.k, lv, xp: 0, hp: maxHp(s, lv) } };
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
  const v = views.me = newView();
  v.scale = 0;
  v.flash = 1;
  sfx.pop();
  const me = lead();
  if (me) burst(spec(me.k).type, ...CENTRE.me, 14);
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
async function catchFx(s: Species, caught: boolean) {
  const v = views.foe;
  const [tx, ty] = CENTRE.foe;
  charm.art = charmArt(s);
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
  await tween(240, (t) => { charm.y = lerp(ty, 80, t * t); });
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
  overlay('stamp', 1250).textContent = mark;
  document.querySelector('.stamp')?.setAttribute('lang', 'ja');
  sfx.stamp();
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

async function quiz(prompt: string, right: string, pool: string[]) {
  const answer = brief(right);
  const options = shuffle([answer, ...shuffle([...new Set(pool.map(brief))].filter((m) => m !== answer)).slice(0, 3)]);
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
    const action = await ask(`What will ${spec(me.k).k} do?`, wild ? ['Attack', 'Charm', 'Switch', 'Run'] : ['Attack', 'Switch']);
    const label = wild ? ['attack', 'charm', 'switch', 'run'][action] : ['attack', 'switch'][action];
    if (label === 'run') { await say('You got away safely.'); veil.curtain = 1.2; return true; }
    if (label === 'switch') {
      if (await switchLead()) { await sendOut(); await enemyTurn(); }
      continue;
    }
    if (label === 'charm') {
      if (await throwCharm()) return true;
      if (!(await enemyTurn())) return lose();
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
  const me = lead();
  if (!me) return false;
  const s = spec(me.k);
  const move = foe!.s.moves[rand(foe!.s.moves.length)];
  const correct = Math.random() < 0.5;
  const dealt = damage(foe!.s, foe!.f.lv, s, me.lv, move, correct, 0.9 + Math.random() * 0.2);
  const bonus = typeBonus(foe!.s.type, s.type);
  await attackFx('foe', foe!.s, move, correct, bonus, () => {
    me.hp = Math.max(0, me.hp - dealt);
    popup(`-${dealt}`, 'me', bonus > 1 ? 'big' : '');
  });
  await say(`${foe!.s.k} used ${move.w} (${move.m})! ${dealt} damage.`);
  if (me.hp > 0) return true;
  await faint('me', s);
  await say(`${s.k} fainted!`);
  if (!lead()) return false;
  await sendOut();
  return true;
}

async function reward(me: Fighter, wild: boolean) {
  await faint('foe', foe!.s);
  if (wild) { silence(); sfx.win(); }
  const gained = xpReward(foe!.f.lv);
  const levels = gainXp(me, gained);
  const before = spec(me.k);
  await say(`${wild ? 'Wild ' : ''}${foe!.s.k} fainted. ${before.k} gained ${gained} XP.${levels ? `\n${before.k} grew to Lv${me.lv}!` : ''}`);
  if (levels) {
    me.hp = Math.min(maxHp(before, me.lv), me.hp + levels * 4);
    sfx.level();
    for (let i = 0; i < 3; i++) burst('metal', CENTRE.me[0], CENTRE.me[1] + 12 - i * 12, 12, 0.7);
    popup('Level up!', 'me', 'good');
  }
  store();
  return true;
}

async function throwCharm() {
  if (save.charms <= 0) { await say('No paper charms left. Pray at a shrine for more.'); return false; }
  const s = foe!.s;
  const right = await quiz(`Name it! What does ${s.k} mean?`, s.m, all.map((x) => x.m));
  if (!right) { await say(`The charm fizzles. ${s.k} means "${s.m}".`); return false; }
  save.charms--;
  const caught = Math.random() <= catchChance(foe!.f.hp, maxHp(s, foe!.f.lv));
  await catchFx(s, caught);
  if (!caught) { await say(`Right name, but ${s.k} broke free!`); return false; }
  const f = { ...foe!.f };
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
    const options = save.chapter === 'journey' ? ['Team', 'Missions', 'Zukan', 'Journey', 'Ask Bear', 'Save', 'Close'] : ['Save', 'Close'];
    const chosen = options[await ask(`Found ${save.caught.length} of ${all.length} · Charms ${save.charms}`, options)];
    if (chosen === 'Close') break;
    if (chosen === 'Save') { store(); await say('Saved.'); }
    if (chosen === 'Ask Bear') await say(`Kanji Bear: ${bearTip()}`);
    if (chosen === 'Missions') {
      const open = QUESTS.filter((q) => save.active.includes(q.id)).map((q) => { const p = progress(q); return `${q.title}${p ? ` (${Math.min(p[0], p[1])} of ${p[1]})` : ''}\n${q.wait}`; });
      await say([...open, `${save.done.length} of ${QUESTS.length} missions complete.`].join('\n\n'));
    }
    if (chosen === 'Journey') await say([...LEVELS.map((l) => `${l.id}  ${l.land}: ${save.trials.includes(l.id) ? 'mastered' : `${caughtIn(l.id)} caught`}`), ...CLOSED.map((id) => `${id}  road closed`)].join('\n'));
    if (chosen === 'Team') await say(save.party.map((f) => { const s = spec(f.k); return `${s.k} ${s.m}  Lv${f.lv}  HP ${f.hp}/${maxHp(s, f.lv)}  XP ${f.xp}/${xpToNext(f.lv)}`; }).join('\n'));
    if (chosen === 'Zukan') await say(all.filter((s) => save.caught.includes(s.k)).slice(-14).map((s) => `${s.k} ${s.m}`).join(' · ') || 'Nothing caught yet.');
  }
  backToWorld();
}

// ---- Title and starter
async function title() {
  const old = restore();
  const i = await ask('Catch every kanji in Japan.', old ? ['Continue', 'New game'] : ['New game']);
  if (old && i === 0) {
    save = old;
    if (save.map === 'dojo' && save.chapter !== 'journey') return meetBear();
    return backToWorld();
  }
  music('home');
  veil.curtain = 1.2;
  save = { map: 'home', x: 11, y: 3, dir: 'down', party: [], box: [], seen: [], caught: [], charms: 0, chapter: 'home', trials: [], active: [], done: [], rest: { map: 'village', x: 12, y: 5 } };
  mode = 'busy';
  await say('Mom: Wake up, sleepyhead. Today is the day.');
  await say('Mom: Every sign, every story and every letter in this world is written in kanji. Read them, and you will understand the world.');
  await say('Mom: But something is wrong. This week the signs in the village went blank, one by one, and nobody knows why.');
  await say('Mom: So I am sending you to Kanji Bear, the greatest teacher in Japan. Learn from the bear and master kanji.');
  await say('Mom: The dojo is on the east side of the village, the house with the red curtain. Off you go, and be polite!');
  store();
  backToWorld();
}

async function meetBear() {
  mode = 'busy';
  save.chapter = 'dojo';
  await say('Kanji Bear: Ah, you must be the one your mother wrote to me about. Welcome to my dojo!');
  await say('Kanji Bear: Here is something the books leave out. Kanji are alive. They have woken and walked off every sign in Japan, and that is why the world is going blank.');
  await say('Kanji Bear: You can only befriend a kanji by knowing its meaning. Catch them, and their signs will come back.');
  const c = await ask('Kanji Bear: No student walks alone. Three kanji here want to travel with you. Choose one!', ['火 Fire', '水 Water', '木 Tree']);
  const s = spec(STARTERS[c]);
  save.party.push({ k: s.k, lv: 5, xp: 0, hp: maxHp(s, 5) });
  save.seen.push(s.k); save.caught.push(s.k);
  save.charms = 5; save.chapter = 'journey'; save.active.push('first');
  await say(`${s.k} (${s.m}) joined you!`);
  await say('Kanji Bear: Attacks are real words, so answer their meanings to hit hard. A paper charm only binds a kanji you can name.');
  await say('Kanji Bear: Your path runs through five levels, from N5 up to N1. Today, two lands are open. N5 runs from the Rice Fields to the Cedar Forest, and N4 from the Mountain Pass to Castle Town.');
  await say('Kanji Bear: Take your time. Help the people you meet, read everything, and each master will test you when you are ready.');
  await say('Kanji Bear: Your first lesson: catch 3 kanji in the Rice Fields, then come back to me.');
  store();
  backToWorld();
}

// ---- Drawing
let alarm = false, opening = false;
const petals = Array.from({ length: 16 }, (_, i) => ({ x: (i * 53) % 240, y: (i * 37) % 160, v: 0.2 + (i % 4) * 0.08 }));
let tick = 0;

function drawWorld() {
  const m = map();
  const w = paintMap(save.map, m.rows);
  const [dx, dy] = DIRS[save.dir];
  const px = save.x * T - dx * slide, py = save.y * T - dy * slide;
  const cx = m.room ? 0 : Math.round(Math.max(0, Math.min(px - 112, 24 * T - 240))), cy = m.room ? 0 : Math.round(Math.max(0, Math.min(py - 72, 16 * T - 160)));
  ctx.drawImage(w.base, -cx, -cy);
  if (!still) for (const [x, y] of w.shimmer) {
    const glint = (tick / 90 + (x * 7 + y * 13) / 160) % 1;
    if (glint > 0.5) continue;
    ctx.fillStyle = '#dcf6f6';
    ctx.fillRect(x + 3 + (y % 5) - cx, y + 5 + (x % 7) - cy, glint < 0.25 ? 5 : 3, 1);
  }
  if (save.map === 'dojo' && save.chapter !== 'journey') starterRow.forEach((s, i) => ctx.drawImage(kanjiSprite(s, 32), 49 + i * 48, 4 + Math.round(Math.sin(tick / 20 + i))));
  const step = slide > 8 ? (stepFlip ? 1 : 2) : 0;
  const actors = [...npcsHere().map((n) => ({ y: n.y * T, draw: () => {
    if (n.guide) bear(ctx, n.x * T - cx, n.y * T - cy);
    else person(ctx, n.look ?? 'hero', n.x * T - cx, n.y * T - cy, 'down', 0);
  } })), { y: py, draw: () => person(ctx, 'hero', Math.round(px - cx), Math.round(py - cy), save.dir, step) }];
  for (const a of actors.sort((p, q) => p.y - q.y)) a.draw();
  // Tall grass and rice close over the walker's legs.
  if ('"r'.includes(m.rows[save.y][save.x])) ctx.drawImage(w.base, save.x * T, save.y * T + 10, T, 6, save.x * T - cx, save.y * T + 10 - cy, T, 6);
  ctx.drawImage(w.fg, -cx, -cy);
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
  const me = lead();
  if (foe) {
    drawKanji(ctx, views.foe, kanjiSprite(foe.s, 72), foe.s, 144, 10 + bob, 72);
    card(cards.foe, save.caught.includes(foe.s.k) ? foe.s.m : 'Unknown kanji', foe.f.lv, foe.f.hp, maxHp(foe.s, foe.f.lv));
  }
  if (me) {
    const s = spec(me.k);
    drawKanji(ctx, views.me, kanjiSprite(s, 88, true), s, 8, 54 - bob, 88);
    card(cards.me, s.m, me.lv, me.hp, maxHp(s, me.lv));
    cards.me.classList.toggle('danger', me.hp / maxHp(s, me.lv) < 0.2);
  }
  drawCharm(ctx);
}

function drawTitle() {
  ctx.drawImage(backdrop('title'), 0, 0);
  ctx.fillStyle = '#ffe9b0'; ctx.beginPath(); ctx.arc(214, 70, 13, 0, 7); ctx.fill();
  starterRow.forEach((s, i) => ctx.drawImage(kanjiSprite(s, 48), 26 + i * 62, 88 + (still ? 0 : Math.round(Math.sin(tick / 20 + i)))));
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
  if (mode !== 'world') return;
  if (action === 'a') void talk();
  if (action === 'menu') void menu();
}

addEventListener('keydown', (e) => {
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

// ---- Sound control
const soundBtn = document.getElementById('sound') as HTMLButtonElement;
const showSound = () => { soundBtn.textContent = soundOn() ? 'Sound on' : 'Sound off'; soundBtn.setAttribute('aria-pressed', String(soundOn())); };
soundBtn.addEventListener('click', () => { unlock(); setSound(!soundOn()); showSound(); soundBtn.blur(); });
addEventListener('pointerdown', unlock);
addEventListener('keydown', (e) => { unlock(); if (e.key === 'm') soundBtn.click(); });
showSound();

// ---- Boot
fetch('/kanjimon/data.json')
  .then((r) => r.json())
  .then(async (data: Species[]) => {
    all = data;
    dex = new Map(data.map((s) => [s.k, s]));
    starterRow = STARTERS.map(spec);
    requestAnimationFrame(frame);
    await title();
  })
  .catch(() => clearPanel("Couldn't load the game. Refresh to try again."));
