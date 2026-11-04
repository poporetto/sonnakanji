import assert from 'node:assert/strict';
import { test } from 'node:test';
import { Rating } from 'ts-fsrs';
import { buildQueue, currentStreak, emptyStore, formatWait, grade, learnedMilestone, nextDue, parseStore, preview, streakMilestone, summarize } from './srs.ts';

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

test('the streak grows on consecutive days and resets after a gap', () => {
  const s = emptyStore();
  grade(s, '一', 'meaning', Rating.Good, now);
  grade(s, '二', 'meaning', Rating.Good, now);
  assert.equal(currentStreak(s, now), 1);
  const nextDay = new Date('2026-11-05T09:00:00');
  grade(s, '三', 'meaning', Rating.Good, nextDay);
  assert.equal(currentStreak(s, nextDay), 2);
  assert.equal(currentStreak(s, new Date('2026-11-06T09:00:00')), 2);
  assert.equal(currentStreak(s, new Date('2026-11-07T09:00:00')), 0);
  grade(s, '四', 'meaning', Rating.Good, new Date('2026-11-08T09:00:00'));
  assert.equal(s.streak.count, 1);
});

test('backups from before streaks still load', () => {
  const s = emptyStore() as Partial<ReturnType<typeof emptyStore>>;
  delete s.streak;
  assert.equal(parseStore(JSON.stringify(s)).streak.count, 0);
});

test('nextDue finds the soonest card, or nothing for a fresh deck', () => {
  const s = emptyStore();
  assert.equal(nextDue(s, kanji, 'meaning'), null);
  const easy = grade(s, '一', 'meaning', Rating.Easy, now);
  const again = grade(s, '二', 'meaning', Rating.Again, now);
  assert.equal(+nextDue(s, kanji, 'meaning')!, Math.min(+easy, +again));
});

test('milestones only fire when a threshold is crossed', () => {
  assert.equal(learnedMilestone(8, 12), 10);
  assert.equal(learnedMilestone(10, 12), null);
  assert.equal(learnedMilestone(0, 60), 50);
  assert.equal(streakMilestone(2, 3), 3);
  assert.equal(streakMilestone(3, 3), null);
});

test('waits read naturally in a sentence', () => {
  assert.equal(formatWait(new Date(+now + 60000), now), '1 minute');
  assert.equal(formatWait(new Date(+now + 5 * 3600000), now), '5 hours');
  assert.equal(formatWait(new Date(+now + 6 * 86400000), now), '6 days');
});
