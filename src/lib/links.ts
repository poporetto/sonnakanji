import componentSlugs from '../data/component-slugs.json';
import { allKanji, kanjiPath, partName, type Kanji, type KanjiPart } from './kanji';

const byChar = new Map(allKanji.map((k) => [k.kanji, k]));
export const hasPage = (c: string) => byChar.has(c);

// The character a component stands for: 氵 is 水, 艹 is 艸. 儿 and 八 only look alike.
const sourceOf = (p: KanjiPart) => {
  const original = p.el === '儿' ? null : p.original;
  if (original && hasPage(original)) return original;
  return p.el && hasPage(p.el) ? p.el : original ?? p.el;
};

interface Group { key: string; name: string | null; forms: Set<string>; kanji: Kanji[] }
const groups = new Map<string, Group>();
for (const k of allKanji) {
  for (const p of k.vg.parts) {
    const key = sourceOf(p);
    if (!key || key === k.kanji) continue;
    const g = groups.get(key) ?? { key, name: null, forms: new Set<string>(), kanji: [] };
    g.name ??= partName(p);
    g.forms.add(p.el ?? key);
    if (!g.kanji.includes(k)) g.kanji.push(k);
    groups.set(key, g);
  }
}

// Permanent URLs, like slugs.json: add entries here for new component pages, never change or remove them.
const hubSlugs = componentSlugs as Record<string, string>;

/** Components that aren't JLPT kanji themselves but have a page of their own. */
export const hubs = [...groups.values()]
  .filter((g) => hubSlugs[g.key])
  .sort((a, b) => b.kanji.length - a.kanji.length);
export const hubSlug = (g: Group) => hubSlugs[g.key];
export const hubPath = (g: Group) => `/components/${hubSlug(g)}/`;
export const hubForms = (g: Group) => [...g.forms].join(' ');

/** Where a component chip should lead, if anywhere. */
export function partPath(k: Kanji, p: KanjiPart) {
  const key = sourceOf(p);
  if (!key || key === k.kanji) return null;
  if (hasPage(key)) return kanjiPath(key);
  return hubSlugs[key] ? hubPath(groups.get(key)!) : null;
}

/** Kanji built from this one, easiest level first. */
export const containing = (c: string) => groups.get(c)?.kanji ?? [];

/** Neighbours sharing a component. Walking the group in a circle spreads links over every kanji in it. */
export function siblings(k: Kanji, perPart = 6) {
  const seen = new Set<string>();
  return k.vg.parts.flatMap((p) => {
    const key = sourceOf(p);
    const g = key && key !== k.kanji && !seen.has(key) ? groups.get(key) : undefined;
    if (!g || g.kanji.length < 2) return [];
    seen.add(g.key);
    const at = g.kanji.indexOf(k);
    const near = Array.from({ length: Math.min(perPart, g.kanji.length - 1) }, (_, i) => g.kanji[(at + i + 1) % g.kanji.length]);
    return [{ el: p.el ?? g.key, path: partPath(k, p), total: g.kanji.length, kanji: near }];
  }).slice(0, 3);
}
