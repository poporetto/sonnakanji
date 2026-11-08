import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { READINGS, withRomaji } from './kana.ts';
import { UNSUITABLE } from './meanings.ts';
import { COMMON, commonReading } from '../lib/reading.ts';
import { MAPS, SOLID } from './maps.ts';
import { WORDS } from './meanings.ts';
import { CHARMS, charmsIn, healed, holdChance, INKWELL, ITEMS, JOKES, KEEPSAKES, MANGA, mangaIn, PRIZES, revived, shelfIn } from './shop.ts';
import { GEAR, ICONS, INKS, PICKS } from './gear.ts';
import { frequency, parse, TRACKS } from './music.ts';
import { yenFor } from './shop.ts';
import { CHECKS, LEVELS, lured, POOLS, QUESTS, SIGNS } from './story.ts';

const data: { kanji: string; level: string }[] = JSON.parse(readFileSync('src/data/kanji.json', 'utf8'));
const levelOf = new Map(data.map((k) => [k.kanji, k.level]));
const pooled = Object.values(POOLS).flatMap((p) => [...p]);

test('every N5 and N4 kanji lives in exactly one wild area', () => {
  const wanted = [...data.filter((k) => k.level === 'N5' || k.level === 'N4').map((k) => k.kanji), '耳'].sort();
  assert.deepEqual([...pooled].sort(), wanted);
});

test('each level has enough kanji for its trial', () => {
  for (const l of LEVELS) assert.ok(pooled.filter((k) => levelOf.get(k) === l.id).length >= l.need);
});

test('missions only ask for kanji that can be caught, and teams use real kanji', () => {
  for (const q of QUESTS) {
    if ('catch' in q.task) for (const k of q.task.catch) assert.ok(pooled.includes(k), `${q.id} ${k}`);
    if ('beat' in q.task) for (const k of q.task.beat.team) assert.ok(levelOf.has(k), `${q.id} ${k}`);
  }
  for (const l of LEVELS) for (const k of l.team) assert.ok(levelOf.has(k), k);
});

test('every mission giver exists, and every reading has one clear answer', () => {
  const people = new Set(Object.values(MAPS).flatMap((m) => m.npcs.map((n) => n.name)));
  for (const q of QUESTS) {
    assert.ok(people.has(q.giver), q.giver);
    const home = Object.values(MAPS).find((m) => m.name === q.where.replace('the ', ''));
    assert.ok(home?.npcs.some((n) => n.name === q.giver), `${q.id}: ${q.giver} is not in ${q.where}`);
  }
  for (const r of [...Object.values(CHECKS).flat(), ...QUESTS.flatMap((q) => ('read' in q.task ? q.task.read : []))]) {
    assert.equal(new Set([r.a, ...r.wrong]).size, 4, r.q);
  }
  for (const id of Object.keys(CHECKS)) assert.ok(QUESTS.some((q) => q.id === id), id);
});

test('signs use kanji that can be caught', () => {
  for (const s of SIGNS) assert.ok(pooled.includes(s.k), `${s.word} ${s.k}`);
});

test('maps are the right size and everything can be reached on foot', () => {
  for (const [id, m] of Object.entries(MAPS)) {
    assert.equal(m.rows.length, 16, id);
    for (const r of m.rows) assert.equal(r.length, m.rows[0].length, `${id}: ${r}`);
    const blocked = new Set(m.npcs.map((n) => `${n.x},${n.y}`));
    const open = (x: number, y: number) => x >= 0 && y >= 0 && x < m.rows[0].length && y < 16 && !SOLID.includes(m.rows[y][x]) && !blocked.has(`${x},${y}`);
    for (const n of m.npcs) assert.ok(!SOLID.includes(m.rows[n.y][n.x]), `${id} ${n.name} stands on a wall`);
    const start = m.room ? [7, 8] : m.west ? [0, 9] : [12, 9];
    const seen = new Set([start.join()]);
    const queue = [start];
    while (queue.length) {
      const [x, y] = queue.pop()!;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        if (open(x + dx, y + dy) && !seen.has(`${x + dx},${y + dy}`)) { seen.add(`${x + dx},${y + dy}`); queue.push([x + dx, y + dy]); }
      }
    }
    const beside = (x: number, y: number) => [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => seen.has(`${x + dx},${y + dy}`));
    // Shop staff stand behind a counter and are spoken to across it.
    const across = (n: { x: number; y: number }) => 'xy'.includes(m.rows[n.y + 1]?.[n.x] ?? '') && seen.has(`${n.x},${n.y + 2}`);
    for (const n of m.npcs) assert.ok(beside(n.x, n.y) || across(n), `${id}: can't reach ${n.name}`);
    for (const d of m.doors ?? []) assert.ok(beside(d.x, d.y), `${id}: can't reach door to ${d.to}`);
    for (const s of SIGNS.filter((s) => s.map === id)) assert.ok(beside(s.x, s.y), `${id}: can't reach sign ${s.word}`);
    const edge = m.rows[0].length - 1;
    if (m.east) assert.ok(seen.has(`${edge},9`) || seen.has(`${edge},10`), `${id}: no way east`);
    for (const d of m.doors ?? []) assert.ok(!SOLID.includes(MAPS[d.to].rows[d.ty][d.tx]), `${id}: door lands on a wall`);
  }
});

test('every tune uses real notes, and its parts stay in step', () => {
  for (const [name, t] of Object.entries(TRACKS)) {
    const lead = parse(t.lead), bass = parse(t.bass);
    assert.equal(lead.length, bass.length, name);
    assert.equal(lead.length % 8, 0, name);
    for (const n of [...lead, ...bass]) if (n !== '.' && n !== '-') assert.ok(frequency(n) > 30, n);
  }
});

test('every kanji has an accessory tied to its meaning, drawn in known colours', () => {
  const picked = PICKS.flatMap(([kanji]) => [...kanji]);
  const own = ['火', '水', '木', '山', '川', '月', '日'];
  const missing = pooled.filter((k) => !picked.includes(k) && !own.includes(k));
  assert.deepEqual(missing, []);
  for (const [, , gear] of PICKS) assert.ok(GEAR[gear], gear);
  for (const rows of Object.values(GEAR)) for (const ch of rows.join('')) assert.ok(ch === '.' || INKS[ch], ch);
});

test('children mode adds romaji to readings, but leaves kana joined to a kanji alone', () => {
  assert.deepEqual(withRomaji('花火 (はなび) means...'), [{ text: '花火 (はなび', roma: 'hanabi' }, { text: ') means...' }]);
  assert.equal(withRomaji('カタカナ')[0].roma, 'katakana');
  assert.deepEqual(withRomaji('止まれ'), [{ text: '止まれ' }]);
  assert.deepEqual(withRomaji('Stop'), [{ text: 'Stop' }]);
});

test('each number kanji shows that many pips', () => {
  [...'一二三四五六七八九十'].forEach((k, i) => {
    const [, , gear] = PICKS.find(([kanji]) => kanji.includes(k))!;
    assert.equal([...GEAR[gear].join('')].filter((c) => c === 'r').length, i + 1, k);
  });
});

test('friendlier meanings only cover kanji in the game', () => {
  for (const k of Object.keys(WORDS)) assert.ok(pooled.includes(k), k);
  assert.equal(WORDS['円'], 'yen');
});

test('every town has a shop you can walk into, and items heal correctly', () => {
  for (const town of ['village', 'kawabe', 'onsen', 'castle']) {
    assert.ok(MAPS[town].doors!.some((d) => d.to.startsWith('shop')), town);
    assert.ok(MAPS[town].doors!.some((d) => d.to.startsWith('charm')), town);
    assert.equal(charmsIn(town).length, 3, town);
  }
  const by = (id: string) => ITEMS.find((i) => i.id === id)!;
  assert.equal(healed(by('rice'), 10, 100), 30);
  assert.equal(healed(by('rice'), 90, 100), 10);
  assert.equal(healed(by('bento'), 10, 100), 90);
});

test('charm effects and the konbini shelves work as described', () => {
  const by = (id: string) => CHARMS.find((c) => c.id === id)!;
  assert.equal(holdChance(by('paper'), 0.4), 0.4);
  assert.equal(Math.round(holdChance(by('gold'), 0.4) * 10), 7);
  assert.equal(holdChance(by('scribe'), 0.1), 1);
  assert.ok(JOKES.length >= 10);
  for (const i of ITEMS) assert.ok(ICONS[i.icon], i.id);
  assert.ok(ITEMS.some((i) => i.open) && ITEMS.some((i) => i.keep));
  assert.equal(revived(INKWELL[0], 41), 21);
  assert.equal(revived(INKWELL[1], 41), 41);
  for (const rows of Object.values(ICONS)) for (const ch of rows.join('')) assert.ok(ch === '.' || INKS[ch], ch);
});

test('missions favour only the kanji still needed, and only while active', () => {
  assert.deepEqual(lured([], []), []);
  assert.deepEqual(lured(['first'], []), []);
  assert.deepEqual(lured(['farmer'], ['二']), ['一', '三']);
  assert.deepEqual(lured(['farmer'], ['一', '二', '三']), []);
  assert.deepEqual(lured(['roll'], []), ['男', '女', '子', '友']);
  assert.deepEqual(lured(['farmer', 'roll'], ['一', '二', '三', '男', '女', '子']), ['友']);
});

test('a defeated kanji drops ¥5 to ¥40', () => {
  const drops = Array.from({ length: 2000 }, yenFor);
  assert.equal(Math.min(...drops), 5);
  assert.equal(Math.max(...drops), 40);
  assert.ok(drops.every(Number.isInteger));
});

test('everything in the Collection has pixel art, and every manga has a joke', () => {
  const kept = [...PRIZES, ...MANGA.map((m) => m.name), ...ITEMS.flatMap((i) => (i.keep ? [i.keep] : []))];
  for (const name of kept) assert.ok(KEEPSAKES[name] && ICONS[KEEPSAKES[name].icon], name);
  for (const m of MANGA) assert.ok(m.note.length > 10, m.name);
  for (const rows of Object.values(ICONS)) assert.equal(new Set(rows.map((r) => r.length)).size, 1, rows.join());
});

test('every kombini sells the next volume of every manga', () => {
  const towns = Object.keys(MAPS).filter((id) => id.startsWith('shop-')).map((id) => id.replace('shop-', ''));
  assert.equal(towns.length, 4);
  for (const town of towns) assert.equal(mangaIn(town).length, 8, town);
  assert.deepEqual(mangaIn('kawabe').map((m) => m.name)[0], 'Three Pieces #2');
  assert.equal(new Set(MANGA.map((m) => m.note)).size, MANGA.length);
  assert.ok(MANGA.some((m) => m.name === 'Dragon Box'), 'first volumes keep their names, so saves still match');
});

test('every kombini has one food of its own, on top of the usual shelf', () => {
  const usual = ITEMS.filter((i) => !i.town && !i.revive).map((i) => i.id);
  const specials = ['village', 'kawabe', 'onsen', 'castle'].map((town) => {
    const shelf = shelfIn(town).map((i) => i.id);
    for (const id of usual) assert.ok(shelf.includes(id), `${town} ${id}`);
    assert.equal(shelf.length, usual.length + 1, town);
    return shelf.find((id) => !usual.includes(id));
  });
  assert.equal(new Set(specials).size, 4);
  for (const i of ITEMS.filter((x) => x.town)) assert.ok(i.heal! / i.price >= 0.65, i.id);
});

test('children mode gives romaji for kanji and whole words, not just kana', () => {
  READINGS.set('火', 'hi').set('学校', 'gakkou');
  assert.deepEqual(withRomaji('A wild 火 appeared!'), [{ text: 'A wild 火', roma: 'hi' }, { text: ' appeared!' }]);
  assert.deepEqual(withRomaji('学校'), [{ text: '学校', roma: 'gakkou' }]);
  assert.deepEqual(withRomaji('桜餅'), [{ text: '桜餅', roma: 'sakuramochi' }]);
  assert.equal(withRomaji('メロンパン')[0].roma, 'meronpan');
  READINGS.delete('火'); READINGS.delete('学校');
});

test('kanji use their everyday reading, not the first one in the dictionary', () => {
  const k = (kanji: string) => ({ kanji, on: [], kun: [], words: [] });
  assert.equal(commonReading(k('百')), 'hyaku');
  assert.equal(commonReading(k('千')), 'sen');
  assert.equal(commonReading(k('山')), 'yama');
  for (const s of data.filter((x) => x.level === 'N5' || x.level === 'N4')) assert.ok(COMMON[s.kanji], s.kanji);
  assert.equal(commonReading({ kanji: '押', on: [{ romaji: 'ou' }], kun: [], words: [{ w: '押す', r: 'おす' }] } as never), 'osu');
  assert.equal(commonReading({ kanji: '議', on: [{ romaji: 'gi' }], kun: [], words: [] } as never), 'gi');
});

test('nobody stands where a tree hides them, and everyone can be reached', () => {
  for (const [id, m] of Object.entries(MAPS)) {
    if (m.room) continue;
    const walkable = new Set<string>();
    const start = m.rows.findIndex((r) => r.includes(','));
    const queue = [[m.rows[start].indexOf(','), start]];
    while (queue.length) {
      const [x, y] = queue.pop()!;
      if (walkable.has(`${x},${y}`) || !m.rows[y]?.[x] || SOLID.includes(m.rows[y][x])) continue;
      walkable.add(`${x},${y}`);
      queue.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
    }
    for (const n of m.npcs) {
      assert.notEqual(m.rows[n.y + 1]?.[n.x], 'T', `${id} ${n.name} is behind a tree`);
      assert.ok([[1, 0], [-1, 0], [0, 1], [0, -1]].some(([a, b]) => walkable.has(`${n.x + a},${n.y + b}`)), `${id} ${n.name} cannot be reached`);
    }
  }
});

test('battle words stay suitable for children', () => {
  // Read from the build, like the search test, so this checks exactly what players get.
  const species: { k: string; moves: { w: string; m: string }[] }[] = JSON.parse(readFileSync('dist/kanjimono/data.json', 'utf8'));
  const all: { kanji: string; words: { w: string; m: string }[] }[] = JSON.parse(readFileSync('src/data/kanji.json', 'utf8'));
  const gloss = new Map(all.flatMap((k) => k.words.map((w) => [w.w, w.m] as const)));
  for (const s of species) for (const m of s.moves) assert.ok(!UNSUITABLE.test(gloss.get(m.w) ?? m.m), `${s.k} ${m.w} ${m.m}`);
  for (const w of ['売春', '死体', '死人', '持て']) assert.ok(!species.some((s) => s.moves.some((m) => m.w === w)), w);
});
