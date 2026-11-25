// Quiz rules only, no DOM, so they can be tested on their own.
import { buildQueue, type Store } from './srs.ts';

export interface QuizCard { k: string; l: string; m: string[] }
export type Rng = () => number;

export const ROUND = 10;
const CHOICES = 4;
// Seconds over which the speed bonus drains to nothing.
export const BONUS_SECONDS = 8;

export function shuffle<T>(list: readonly T[], rng: Rng = Math.random) {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

// "to see", "See" and "see (a film)" all count as one meaning.
const plain = (m: string) => m.toLowerCase().replace(/\(.*?\)/g, '').replace(/^(to|the|an?) /, '').trim();

// Wrong answers come from the same level, and never share any sense with the right one.
export function buildChoices(card: QuizCard, all: QuizCard[], rng: Rng = Math.random): QuizCard[] {
  const senses = new Set(card.m.map(plain));
  const used = new Set([plain(card.m[0])]);
  const picked = [card];
  for (const c of shuffle(all.filter((x) => x.l === card.l && x.k !== card.k), rng)) {
    if (picked.length === CHOICES) break;
    if (used.has(plain(c.m[0])) || c.m.some((m) => senses.has(plain(m)))) continue;
    used.add(plain(c.m[0]));
    picked.push(c);
  }
  return shuffle(picked, rng);
}

// Due and new cards are scheduled. The rest of the round is practice: kanji already met in any mode, then unseen ones in teaching order.
export function buildRound(store: Store, kanji: string[], newPerDay: number, now: Date, rng: Rng = Math.random) {
  const scheduled = buildQueue(store, kanji, 'quiz', newPerDay, now).slice(0, ROUND);
  const taken = new Set(scheduled);
  const met = new Set(Object.keys(store.cards).map((key) => key.slice(key.indexOf(':') + 1)));
  const rest = kanji.filter((k) => !taken.has(k));
  const filler = [...shuffle(rest.filter((k) => met.has(k)), rng), ...rest.filter((k) => !met.has(k))];
  return { scheduled, queue: [...scheduled, ...filler.slice(0, ROUND - scheduled.length)] };
}

// A right answer earns 100, up to 50 for speed, and 20 for each earlier link in the combo.
export function points(combo: number, seconds: number) {
  const speed = Math.round(50 * Math.max(0, 1 - seconds / BONUS_SECONDS));
  return 100 + speed + 20 * Math.min(Math.max(combo - 1, 0), 5);
}

export function rank(right: number, total: number, endedEarly = false) {
  const share = total ? right / total : 0;
  if (share === 1 && !endedEarly) return { title: 'Perfect round!', stamp: ['たいへん', 'よくでき', 'ました'], label: 'Stamp: excellent' };
  if (share >= 0.7) return { title: 'Nice work!', stamp: ['よくでき', 'ました'], label: 'Stamp: well done' };
  return { title: 'Good effort!', stamp: ['がんばり', 'ました'], label: 'Stamp: you tried hard' };
}
