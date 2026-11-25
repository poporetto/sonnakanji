import assert from 'node:assert/strict';
import { test } from 'node:test';
import { Rating } from 'ts-fsrs';
import { buildBoard, finishBonus, matchRank, pairPoints, PAIRS, pickPairs } from './match.ts';
import { emptyStore, grade } from './srs.ts';

const now = new Date('2026-11-04T09:00:00');
const deck = [...'一二三四五六七八九十百千万円日月火水木金土山川田人口目耳手足'].map((k, i) => ({ k, l: 'N5', m: [`meaning ${i}`] }));

test('met kanji come first, and a board is always full', () => {
  const s = emptyStore();
  grade(s, '足', 'meaning', Rating.Good, now);
  const pairs = pickPairs(s, deck, now).map((c) => c.k);
  assert.equal(pairs[0], '足');
  assert.equal(new Set(pairs).size, PAIRS);
});

test('newcomers only meet early kanji', () => {
  const early = new Set(deck.slice(0, 24).map((c) => c.k));
  for (let i = 0; i < 50; i++) assert.ok(pickPairs(emptyStore(), deck, now).every((c) => early.has(c.k)));
});

test('two pairs never share a sense', () => {
  const twins = [{ k: '早', l: 'N4', m: ['early', 'fast'] }, { k: '速', l: 'N4', m: ['quick', 'Fast'] }];
  assert.equal(pickPairs(emptyStore(), twins, now).length, 1);
});

test('the board holds one picture and one kanji for each', () => {
  const board = buildBoard(['一', '二']);
  assert.deepEqual(board.map((t) => t.side + t.k).sort(), ['kanji一', 'kanji二', 'picture一', 'picture二']);
});

test('combos add points and misses cost the bonus', () => {
  assert.equal(pairPoints(1), 100);
  assert.equal(pairPoints(3), 200);
  assert.equal(finishBonus(2), 250);
  assert.equal(finishBonus(99), 0);
  assert.equal(matchRank(2, true).title, 'Super memory!');
  assert.equal(matchRank(0, false).title, 'Good effort!');
});
