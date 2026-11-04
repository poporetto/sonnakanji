import raw from '../data/kanji.json';
import mnemonics from '../data/mnemonics.json';
import partNames from '../data/parts.json';
import meaningFixes from '../data/meanings.json';
import handArt from '../data/hand-art.json';
import slugs from '../data/slugs.json';

export type LevelId = 'N5' | 'N4' | 'N3' | 'N2' | 'N1';
export interface Reading { kana: string; romaji: string }
export interface Glyph { era: string; label: string; src: string; char: string; page: string; license: string; artist: string }
export interface Word { w: string; r: string; m: string }
export interface KanjiPart { el: string | null; original: string | null }
export interface Kanji {
  kanji: string;
  level: LevelId;
  trad: string | null;
  meanings: string[];
  on: Reading[];
  kun: Reading[];
  strokes: number;
  grade: number | null;
  freq: number;
  originType: string | null;
  glyphs: Glyph[];
  vg: { strokes: { d: string; part: number }[]; parts: KanjiPart[] };
  words: Word[];
  mnemonic: string;
}

const notes = mnemonics as Record<string, string>;
const names = partNames as Record<string, string>;
const fixes = meaningFixes as Record<string, string[]>;

// KANJIDIC's order and dictionary notes don't suit a flashcard headline.
function cleanMeanings(k: { kanji: string; meanings: string[] }) {
  const clean = k.meanings.filter((m) => !/radical|\*\*|katakana|counter for|sign of|\d(AM|PM)/.test(m));
  return fixes[k.kanji] ?? (clean.length ? clean : k.meanings);
}

export const allKanji = (raw as Omit<Kanji, 'mnemonic'>[]).map((k) => ({
  ...k,
  meanings: cleanMeanings(k),
  kun: [...new Map(k.kun.map((r) => [r.romaji, r])).values()],
  mnemonic: notes[k.kanji] ?? '',
})) as Kanji[];

export const byLevel = (level: string) => allKanji.filter((k) => k.level === level);

export const LEVELS = [
  { id: 'N5', slug: 'n5', beta: false, blurb: 'The first 79 kanji: numbers, days, people and everyday verbs.' },
  { id: 'N4', slug: 'n4', beta: false, blurb: 'The next 166 kanji: family, places, seasons and daily life.' },
  { id: 'N3', slug: 'n3', beta: true, blurb: 'Kanji for everyday reading: news headlines, signs and simple articles.' },
  { id: 'N2', slug: 'n2', beta: true, blurb: 'Kanji for work, newspapers and general adult reading.' },
  { id: 'N1', slug: 'n1', beta: true, blurb: 'The advanced set, for literature, editorials and specialist writing.' },
] as const;

const betaLevels: Set<string> = new Set(LEVELS.filter((l) => l.beta).map((l) => l.id));
export const isBeta = (k: Kanji) => betaLevels.has(k.level);

export const partName = (p: KanjiPart) => names[p.original ?? p.el ?? ''] ?? names[p.el ?? ''] ?? null;
export const slugOf = (c: string) => (slugs as Record<string, string>)[c];
export const kanjiPath = (c: string) => `/kanji/${slugOf(c)}/`;
const levelOf = new Map(allKanji.map((k) => [k.kanji, k.level]));

// Beta kanji have no drawing yet, so callers fall back to the character itself.
export const artPath = (c: string) =>
  betaLevels.has(levelOf.get(c) ?? '')
    ? null
    : (handArt as Record<string, string>)[c] ?? `/art/${c.codePointAt(0)!.toString(16)}.svg`;
