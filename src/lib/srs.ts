import { createEmptyCard, fsrs, generatorParameters, Rating, type Card, type Grade } from 'ts-fsrs';

export type Mode = 'meaning' | 'reading' | 'recall';
export const GRADES: { rating: Grade; label: string; key: string }[] = [
  { rating: Rating.Again, label: 'Again', key: '1' },
  { rating: Rating.Hard, label: 'Hard', key: '2' },
  { rating: Rating.Good, label: 'Good', key: '3' },
  { rating: Rating.Easy, label: 'Easy', key: '4' },
];

export interface Store {
  v: 1;
  cards: Record<string, Card>;
  // Number of new cards introduced per mode on a given local day.
  introduced: { day: string; counts: Partial<Record<Mode, number>> };
  settings: { level: 'all' | 'N5' | 'N4' | 'N3' | 'N2' | 'N1'; mode: Mode; newPerDay: number };
  // Consecutive days with at least one review.
  streak: { day: string; count: number };
}

const KEY = 'sonnakanji.srs.v1';
const scheduler = fsrs(generatorParameters({ enable_fuzz: true }));

export const emptyStore = (): Store => ({
  v: 1,
  cards: {},
  introduced: { day: '', counts: {} },
  settings: { level: 'all', mode: 'meaning', newPerDay: 10 },
  streak: { day: '', count: 0 },
});

export const dayOf = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const revive = (c: Card): Card => ({
  ...c,
  due: new Date(c.due),
  last_review: c.last_review ? new Date(c.last_review) : undefined,
});

export function parseStore(text: string | null): Store {
  if (!text) return emptyStore();
  const data = JSON.parse(text) as Store;
  if (data?.v !== 1 || typeof data.cards !== 'object') throw new Error('Not a SonnaKanji backup');
  const base = emptyStore();
  return {
    ...base,
    ...data,
    settings: { ...base.settings, ...data.settings },
    streak: data.streak ?? base.streak,
    cards: Object.fromEntries(Object.entries(data.cards).map(([k, c]) => [k, revive(c)])),
  };
}

export function loadStore(): Store {
  try {
    return parseStore(localStorage.getItem(KEY));
  } catch {
    return emptyStore();
  }
}

export function saveStore(store: Store) {
  try {
    localStorage.setItem(KEY, JSON.stringify(store));
  } catch {
    // Private windows may refuse storage; the session still works in memory.
  }
}

const cardKey = (kanji: string, mode: Mode) => `${mode}:${kanji}`;

export function introducedToday(store: Store, mode: Mode, now: Date) {
  return store.introduced.day === dayOf(now) ? (store.introduced.counts[mode] ?? 0) : 0;
}

export function summarize(store: Store, kanji: string[], mode: Mode, now: Date) {
  let due = 0, fresh = 0, learned = 0;
  for (const k of kanji) {
    const c = store.cards[cardKey(k, mode)];
    if (!c) fresh++;
    else {
      learned++;
      if (c.due <= now) due++;
    }
  }
  return { due, fresh, learned };
}

// Due reviews, most overdue first, then new cards in teaching order.
export function buildQueue(store: Store, kanji: string[], mode: Mode, newPerDay: number, now: Date) {
  const due = kanji
    .filter((k) => {
      const c = store.cards[cardKey(k, mode)];
      return c && c.due <= now;
    })
    .sort((a, b) => +store.cards[cardKey(a, mode)].due - +store.cards[cardKey(b, mode)].due);
  const room = Math.max(newPerDay - introducedToday(store, mode, now), 0);
  const fresh = kanji.filter((k) => !store.cards[cardKey(k, mode)]).slice(0, room);
  return [...due, ...fresh];
}

export function preview(store: Store, kanji: string, mode: Mode, now: Date) {
  const card = store.cards[cardKey(kanji, mode)] ?? createEmptyCard(now);
  const options = scheduler.repeat(card, now);
  return Object.fromEntries(GRADES.map(({ rating }) => [rating, options[rating].card.due])) as Record<Grade, Date>;
}

function touchStreak(store: Store, now: Date) {
  const today = dayOf(now);
  if (store.streak.day === today) return;
  const yesterday = dayOf(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1));
  store.streak = { day: today, count: store.streak.day === yesterday ? store.streak.count + 1 : 1 };
}

// The streak still counts until a full day has been missed.
export function currentStreak(store: Store, now: Date) {
  const yesterday = dayOf(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1));
  return store.streak.day === dayOf(now) || store.streak.day === yesterday ? store.streak.count : 0;
}

// Returns the next due date so the session can bring back cards due again soon.
export function grade(store: Store, kanji: string, mode: Mode, rating: Grade, now: Date) {
  const key = cardKey(kanji, mode);
  const isNew = !store.cards[key];
  const next = scheduler.next(store.cards[key] ?? createEmptyCard(now), now, rating).card;
  store.cards[key] = next;
  touchStreak(store, now);
  if (isNew) {
    const day = dayOf(now);
    if (store.introduced.day !== day) store.introduced = { day, counts: {} };
    store.introduced.counts[mode] = (store.introduced.counts[mode] ?? 0) + 1;
  }
  return next.due;
}

// Soonest scheduled card, so the finish screen can say when to come back.
export function nextDue(store: Store, kanji: string[], mode: Mode) {
  const dues = kanji.flatMap((k) => store.cards[cardKey(k, mode)]?.due ?? []);
  return dues.length ? new Date(Math.min(...dues.map(Number))) : null;
}

const LEARNED_MILESTONES = [10, 25, 50, 79, 100, 150, 200, 245, 500, 1000, 2000];
const STREAK_MILESTONES = [3, 7, 14, 30, 60, 100, 365];

// The largest milestone passed between two totals, if any.
const crossed = (marks: number[], before: number, after: number) =>
  [...marks].reverse().find((m) => before < m && after >= m) ?? null;
export const learnedMilestone = (before: number, after: number) => crossed(LEARNED_MILESTONES, before, after);
export const streakMilestone = (before: number, after: number) => crossed(STREAK_MILESTONES, before, after);

// The same wait as a phrase, for sentences rather than compact buttons.
export function formatWait(due: Date, now: Date) {
  const mins = Math.max(Math.round((+due - +now) / 60000), 1);
  const unit = (n: number, name: string) => `${n} ${name}${n === 1 ? '' : 's'}`;
  if (mins < 60) return unit(mins, 'minute');
  const hours = Math.round(mins / 60);
  return hours < 24 ? unit(hours, 'hour') : unit(Math.round(hours / 24), 'day');
}

export function formatInterval(due: Date, now: Date) {
  const mins = Math.max(Math.round((+due - +now) / 60000), 1);
  if (mins < 60) return `${mins}m`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d`;
  const months = Math.round(days / 30);
  return months < 12 ? `${months}mo` : `${(days / 365).toFixed(1)}y`;
}
