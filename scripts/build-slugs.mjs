#!/usr/bin/env node
// Assigns each kanji a permanent URL like /kanji/above-ue/ and writes the
// redirects from the original /kanji/上/ URLs. Existing slugs are never changed,
// so editing a meaning later cannot break a URL that search engines already know.
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const read = (f) => JSON.parse(readFileSync(path.join(ROOT, f), 'utf8'));
const records = read('src/data/kanji.json');
const fixes = read('src/data/meanings.json');
const slugFile = path.join(ROOT, 'src/data/slugs.json');
const slugs = existsSync(slugFile) ? read('src/data/slugs.json') : {};

const clean = (s) => s.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const used = new Set(Object.values(slugs));
for (const r of records) {
  if (slugs[r.kanji]) continue;
  const meaning = (fixes[r.kanji] ?? r.meanings.filter((m) => !/radical|\*\*|katakana|counter for|sign of/.test(m)))[0] ?? r.meanings[0] ?? 'kanji';
  const hex = r.kanji.codePointAt(0).toString(16);
  const words = clean(meaning).split('-').slice(0, 4).join('-') || 'kanji';
  const base = `${words}-${clean((r.kun[0] ?? r.on[0])?.romaji ?? hex) || hex}`;
  const alt = `${base}-${clean((r.on[0] ?? r.kun[0])?.romaji ?? hex) || hex}`;
  const slug = [base, alt, `${base}-${hex}`].find((option) => !used.has(option));
  used.add(slug);
  slugs[r.kanji] = slug;
}
writeFileSync(slugFile, `${JSON.stringify(slugs, null, 0)}\n`);

// Only N5 and N4 ever had /kanji/字/ URLs, so only they need redirects.
const redirects = records.filter((r) => r.level === 'N5' || r.level === 'N4').map((r) => ({
  source: `/kanji/${encodeURIComponent(r.kanji)}/`,
  destination: `/kanji/${slugs[r.kanji]}/`,
  permanent: true,
}));
writeFileSync(path.join(ROOT, 'vercel.json'), `${JSON.stringify({ trailingSlash: true, redirects }, null, 2)}\n`);
console.log(Object.keys(slugs).length, 'slugs;', Object.values(slugs).slice(0, 6).join(' '));
