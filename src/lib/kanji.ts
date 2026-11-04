import raw from '../data/kanji.json';
import mnemonics from '../data/mnemonics.json';
import partNames from '../data/parts.json';
import meaningFixes from '../data/meanings.json';

export interface Reading { kana: string; romaji: string }
export interface Glyph { era: string; label: string; src: string; char: string; page: string; license: string; artist: string }
export interface Word { w: string; r: string; m: string }
export interface KanjiPart { el: string | null; original: string | null }
export interface Kanji {
  kanji: string;
  level: 'N5' | 'N4';
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
const cleanMeanings = (k: { kanji: string; meanings: string[] }) =>
  fixes[k.kanji] ?? k.meanings.filter((m) => !/radical|\*\*|katakana|counter for|sign of|\d(AM|PM)/.test(m));

export const allKanji = (raw as Omit<Kanji, 'mnemonic'>[]).map((k) => ({
  ...k,
  meanings: cleanMeanings(k),
  mnemonic: notes[k.kanji] ?? '',
})) as Kanji[];

export const byLevel = (level: string) => allKanji.filter((k) => k.level === level);

export const LEVELS = [
  { id: 'N5', slug: 'n5', blurb: 'The first 79 kanji: numbers, days, people and everyday verbs.' },
  { id: 'N4', slug: 'n4', blurb: 'The next 166 kanji: family, places, seasons and daily life.' },
] as const;

export const partName = (p: KanjiPart) => names[p.original ?? p.el ?? ''] ?? names[p.el ?? ''] ?? null;
export const kanjiPath = (c: string) => `/kanji/${c}/`;
export const artPath = (c: string) => `/art/${c.codePointAt(0)!.toString(16)}.svg`;
