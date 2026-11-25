import assert from 'node:assert/strict';
import { test } from 'node:test';
import { Rating } from 'ts-fsrs';
import { buildChoices, buildRound, points, rank, ROUND } from './quiz.ts';
import { emptyStore, grade, parseStore } from './srs.ts';

const now = new Date('2026-11-04T09:00:00');
const card = (k: string, m: string[], l = 'N5') => ({ k, l, m });
const deck = [
  card('早', ['early', 'fast']), card('速', ['quick', 'fast']), card('朝', ['Early']), card('山', ['mountain']),
  card('岳', ['mountain']), card('川', ['river']), card('木', ['tree']), card('鬱', ['gloom'], 'N1'),
];

test('choices hold the answer once, and no ambiguous, repeated or other-level options', () => {
  for (let i = 0; i < 200; i++) {
    const c = buildChoices(deck[0], deck);
    assert.equal(c.length, 4);
    assert.equal(c.filter((x) => x.k === '早').length, 1);
    assert.equal(c.some((x) => ['速', '朝', '鬱'].includes(x.k)), false);
    assert.equal(new Set(c.map((x) => x.m[0])).size, 4);
  }
});

const kanji = [...'一二三四五六七八九十百千万円'];

test('a round is always full, with practice after the scheduled cards', () => {
  const s = emptyStore();
  grade(s, '円', 'meaning', Rating.Good, now);
  const { scheduled, queue } = buildRound(s, kanji, 3, now);
  assert.deepEqual(scheduled, ['一', '二', '三']);
  assert.equal(queue.length, ROUND);
  assert.equal(new Set(queue).size, ROUND);
  assert.equal(queue[3], '円');
});

test('unseen practice kanji come in teaching order', () => {
  assert.deepEqual(buildRound(emptyStore(), kanji, 2, now).queue, kanji.slice(0, ROUND));
});

test('quiz answers leave the flashcard schedules alone', () => {
  const s = emptyStore();
  grade(s, '一', 'quiz', Rating.Good, now);
  assert.deepEqual(Object.keys(s.cards), ['quiz:一']);
});

test('the picture quiz keeps its own schedule', () => {
  const s = emptyStore();
  grade(s, '一', 'quiz', Rating.Easy, now);
  assert.equal(buildRound(s, kanji, 3, now, 'picture').scheduled[0], '一');
});

test('points reward speed and combos, within limits', () => {
  assert.equal(points(1, 0), 150);
  assert.equal(points(1, 60), 100);
  assert.equal(points(99, 60), 200);
});

test('the rank follows the score', () => {
  assert.equal(rank(10, 10).title, 'Perfect round!');
  assert.equal(rank(3, 3, true).title, 'Nice work!');
  assert.equal(rank(7, 10).title, 'Nice work!');
  assert.equal(rank(0, 10).title, 'Good effort!');
});

test('backups from before the quiz still load', () => {
  const s = emptyStore() as Partial<ReturnType<typeof emptyStore>>;
  delete s.quizBest;
  assert.equal(parseStore(JSON.stringify(s)).quizBest, 0);
});
