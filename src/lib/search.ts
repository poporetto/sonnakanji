import { isJapanese, isRomaji, toHiragana } from 'wanakana';

export interface Card { k: string; l: string; m: string[]; on: string[]; kun: string[]; n: string; a: string; u: string }

const KANJI = /[々一-鿿]/g;
// Readings mark okurigana in brackets: た(べる) matches both たべる and た.
const plain = (kana: string) => toHiragana(kana.replace(/[()]/g, ''));
const whole = (reading: string, q: string) => plain(reading) === q || toHiragana(reading.split('(')[0]) === q;

function score(c: Card, q: string, kana: string | null) {
  let best = 0;
  c.m.forEach((meaning, i) => {
    const m = meaning.toLowerCase();
    const first = i === 0 ? 8 : 0;
    if (m === q) best = Math.max(best, 90 + first);
    else if (m.split(/[\s,/-]+/).includes(q)) best = Math.max(best, 70 + first);
    else if (m.startsWith(q)) best = Math.max(best, 55 + first);
    else if (q.length > 2 && m.includes(q)) best = Math.max(best, 30);
  });
  if (kana) for (const r of [...c.on.map(toHiragana), ...c.kun]) {
    if (whole(r, kana)) best = Math.max(best, 80);
    else if (plain(r).startsWith(kana)) best = Math.max(best, 45);
  }
  return best;
}

// Finds kanji by the character itself, an English meaning, or a reading in kana or romaji.
export function search(cards: Card[], query: string, level = 'all') {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const pool = level === 'all' ? cards : cards.filter((c) => c.l === level);
  // Pasting a word returns each of its kanji, in the order they're written.
  const typed = [...new Set(q.match(KANJI) ?? [])];
  if (typed.length) return typed.flatMap((k) => pool.filter((c) => c.k === k));
  const kana = isJapanese(q) || isRomaji(q) ? toHiragana(q) : '';
  const usable = isJapanese(kana) ? kana : null;
  return pool
    .map((c, i) => ({ c, i, s: score(c, q, usable) }))
    .filter((r) => r.s > 0)
    .sort((a, b) => b.s - a.s || a.i - b.i)
    .map((r) => r.c);
}
