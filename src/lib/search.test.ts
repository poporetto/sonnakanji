import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { search, type Card } from './search.ts';

const card = (k: string, l: string, m: string[], on: string[], kun: string[]): Card => ({ k, l, m, on, kun, n: '', a: '', u: '' });
const cards = [
  card('日', 'N5', ['day', 'sun', 'Japan'], ['ニチ', 'ジツ'], ['ひ', 'び', 'か']),
  card('火', 'N5', ['fire'], ['カ'], ['ひ']),
  card('食', 'N5', ['eat', 'food'], ['ショク'], ['た(べる)', 'く(う)']),
  card('花', 'N4', ['flower'], ['カ'], ['はな']),
  card('山', 'N5', ['mountain'], ['サン'], ['やま']),
  card('盛', 'N1', ['boom', 'prosper'], ['セイ'], ['も(る)']),
];
const hits = (q: string, level?: string) => search(cards, q, level).map((c) => c.k);

test('finds a kanji by its character', () => assert.deepEqual(hits('火'), ['火']));
test('a pasted word returns each kanji in order', () => assert.deepEqual(hits('花火'), ['花', '火']));
test('finds meanings, ignoring case, with the first meaning ranked higher', () => {
  assert.deepEqual(hits('FIRE'), ['火']);
  assert.deepEqual(hits('day')[0], '日');
  assert.deepEqual(hits('moun'), ['山']);
});
test('finds readings in romaji, hiragana and katakana', () => {
  assert.ok(hits('hi').includes('火'));
  assert.deepEqual(hits('やま'), ['山']);
  assert.deepEqual(hits('サン'), ['山']);
  assert.deepEqual(hits('hana'), ['花']);
});
test('matches a kun reading without its okurigana, and with it', () => {
  assert.deepEqual(hits('taberu'), ['食']);
  assert.deepEqual(hits('た'), ['食']);
});
test('filters by level', () => assert.deepEqual(hits('ka', 'N4'), ['花']));
test('finds nothing for an empty or unmatched search', () => {
  assert.deepEqual(hits('   '), []);
  assert.deepEqual(hits('zzzz'), []);
});
test('works on the real card data', () => {
  const all: Card[] = JSON.parse(readFileSync('dist/cards.json', 'utf8'));
  assert.equal(search(all, 'water')[0].k, '水');
  assert.equal(search(all, 'yama')[0].k, '山');
  assert.ok(search(all, 'たべる').some((c) => c.k === '食'));
  assert.ok(search(all, 'miru').some((c) => c.k === '見'));
  assert.equal(search(all, '学校').length, 2);
});
