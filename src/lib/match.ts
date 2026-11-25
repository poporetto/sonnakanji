// Picture match rules only, no DOM, so they can be tested on their own.
import { plain, shuffle, type QuizCard, type Rng } from './quiz.ts';
import type { Store } from './srs.ts';

export const PAIRS = 6;
// Matching isn't scheduled, so newcomers draw from a window of early kanji to keep boards fresh.
const NEW_WINDOW = 24;

export interface Tile { k: string; side: 'picture' | 'kanji' }

// Kanji due in any mode, then others already met, then early unseen ones. No two share a sense.
export function pickPairs<C extends QuizCard>(store: Store, pool: C[], now: Date, rng: Rng = Math.random): C[] {
  const due = new Set<string>(), met = new Set<string>();
  for (const [key, card] of Object.entries(store.cards)) {
    const k = key.slice(key.indexOf(':') + 1);
    met.add(k);
    if (card.due <= now) due.add(k);
  }
  const unseen = pool.filter((c) => !met.has(c.k));
  const order = [
    ...shuffle(pool.filter((c) => due.has(c.k)), rng),
    ...shuffle(pool.filter((c) => met.has(c.k) && !due.has(c.k)), rng),
    ...shuffle(unseen.slice(0, NEW_WINDOW), rng),
    ...unseen.slice(NEW_WINDOW),
  ];
  const senses = new Set<string>();
  const out: C[] = [];
  for (const c of order) {
    if (out.length === PAIRS) break;
    const own = c.m.map(plain);
    if (own.some((m) => senses.has(m))) continue;
    own.forEach((m) => senses.add(m));
    out.push(c);
  }
  return out;
}

export const buildBoard = (kanji: string[], rng: Rng = Math.random): Tile[] =>
  shuffle(kanji.flatMap((k): Tile[] => [{ k, side: 'picture' }, { k, side: 'kanji' }]), rng);

export const pairPoints = (combo: number) => 100 + 50 * Math.min(Math.max(combo - 1, 0), 5);
// Fewer misses leave more of the bonus.
export const finishBonus = (misses: number) => Math.max(0, 300 - misses * 25);

export function matchRank(misses: number, finished: boolean) {
  if (finished && misses <= 3) return { title: 'Super memory!', stamp: ['たいへん', 'よくでき', 'ました'], label: 'Stamp: excellent' };
  if (finished && misses <= 9) return { title: 'Nice work!', stamp: ['よくでき', 'ました'], label: 'Stamp: well done' };
  return { title: 'Good effort!', stamp: ['がんばり', 'ました'], label: 'Stamp: you tried hard' };
}
