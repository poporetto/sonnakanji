import assert from 'node:assert/strict';
import { test } from 'node:test';
import { Rating } from 'ts-fsrs';
import { buildQueue, emptyStore, grade, parseStore, preview, summarize } from './srs.ts';

const now = new Date('2026-11-04T09:00:00');
const kanji = ['一', '二', '三', '四'];

test('new cards are capped per day and in teaching order', () => {
  const s = emptyStore();
  assert.deepEqual(buildQueue(s, kanji, 'meaning', 2, now), ['一', '二']);
  grade(s, '一', 'meaning', Rating.Good, now);
  assert.deepEqual(buildQueue(s, kanji, 'meaning', 2, now), ['二']);
});

test('the new card allowance resets the next day', () => {
  const s = emptyStore();
  grade(s, '一', 'meaning', Rating.Easy, now);
  const tomorrow = new Date('2026-11-05T09:00:00');
  assert.equal(buildQueue(s, kanji, 'meaning', 1, tomorrow).includes('二'), true);
});

test('modes are scheduled independently', () => {
  const s = emptyStore();
  grade(s, '一', 'meaning', Rating.Easy, now);
  assert.equal(summarize(s, kanji, 'meaning', now).learned, 1);
  assert.equal(summarize(s, kanji, 'reading', now).learned, 0);
});

test('due cards come first, most overdue first', () => {
  const s = emptyStore();
  grade(s, '二', 'meaning', Rating.Again, now);
  grade(s, '一', 'meaning', Rating.Easy, now);
  const later = new Date(+now + 365 * 864e5);
  assert.deepEqual(buildQueue(s, kanji, 'meaning', 0, later), ['二', '一']);
});

test('better grades never schedule sooner than Again', () => {
  const p = preview(emptyStore(), '一', 'meaning', now);
  assert.ok(+p[Rating.Again] <= +p[Rating.Good]);
  assert.ok(+p[Rating.Good] <= +p[Rating.Easy]);
});

test('a backup round-trips with real dates', () => {
  const s = emptyStore();
  grade(s, '一', 'meaning', Rating.Good, now);
  const back = parseStore(JSON.stringify(s));
  assert.ok(back.cards['meaning:一'].due instanceof Date);
  assert.deepEqual(buildQueue(back, kanji, 'meaning', 10, now).slice(0, 1), buildQueue(s, kanji, 'meaning', 10, now).slice(0, 1));
});

test('a foreign backup is rejected', () => {
  assert.throws(() => parseStore('{"hello":1}'));
});
