#!/usr/bin/env node
// Writes src/data/lastmod.json: the day each page's content last changed, from git history.
// Vercel builds from a shallow clone, so this runs locally. Rerun it after changing content, before committing.
import { execFileSync } from 'node:child_process';
import { readFileSync, existsSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

// The last time the kanji and level pages themselves gained content. Bump it for changes readers would notice.
const TEMPLATES = '2026-11-25';

const git = (...a) => execFileSync('git', a, { encoding: 'utf8', maxBuffer: 1 << 29, stdio: ['ignore', 'pipe', 'ignore'] });
const DATA = ['kanji', 'mnemonics', 'meanings', 'parts', 'hand-art'].map((n) => `src/data/${n}.json`);
const today = new Date().toLocaleDateString('sv');
const latest = (...d) => d.filter(Boolean).sort().at(-1);

const blobs = new Map();
const load = (read) => DATA.map((f) => { try { return JSON.parse(read(f)); } catch { return f.includes('/kanji.') ? [] : {}; } });
const fromGit = (rev) => load((f) => {
  const id = git('rev-parse', `${rev}:${f}`).trim();
  if (!blobs.has(id)) blobs.set(id, git('cat-file', 'blob', id));
  return blobs.get(id);
});

const hashes = {}, dates = {};
const record = ([records, notes, fixes, , hand], date, artId) => {
  for (const k of records) {
    const art = hand[k.kanji] ?? `/art/${k.kanji.codePointAt(0).toString(16)}.svg`;
    const h = createHash('sha1').update(JSON.stringify([k, notes[k.kanji], fixes[k.kanji], artId(`public${art}`)])).digest('hex');
    if (hashes[k.kanji] !== h) { hashes[k.kanji] = h; dates[k.kanji] = date; }
  }
};
const revs = git('log', '--first-parent', '--reverse', '--format=%H %cs', '--', ...DATA, 'public/art').trim().split('\n');
for (const line of revs) {
  const [rev, date] = line.split(' ');
  const tree = new Map(git('ls-tree', '-r', rev, 'public/art').trim().split('\n').map((l) => { const [meta, f] = l.split('\t'); return [f, meta.split(' ')[2]]; }));
  record(fromGit(rev), date, (f) => tree.get(f));
}
const blobId = (f) => { const b = readFileSync(f); return createHash('sha1').update(`blob ${b.length}\0`).update(b).digest('hex'); };
record(load((f) => readFileSync(f, 'utf8')), today, (f) => (existsSync(f) ? blobId(f) : undefined));

const records = JSON.parse(readFileSync(DATA[0], 'utf8'));
const kanji = Object.fromEntries(records.map((k) => [k.kanji, latest(dates[k.kanji], TEMPLATES)]));
const pageDate = (f) => (git('status', '--porcelain', '--', f).trim() ? today : git('log', '-1', '--format=%cs', '--', f).trim());
const newest = (list) => latest(...list.map((k) => kanji[k.kanji]));
const pages = {
  '/': pageDate('src/pages/index.astro'),
  '/jlpt/': pageDate('src/pages/jlpt/index.astro'),
  '/learn-kanji-with-pictures/': pageDate('src/pages/learn-kanji-with-pictures.astro'),
  '/kanjimono/': pageDate('src/kanjimono'),
  '/review/': pageDate('src/pages/review.astro'),
  '/about/': pageDate('src/pages/about.astro'),
  '/components/': pageDate('src/pages/components/index.astro'),
};
for (const l of ['N5', 'N4', 'N3', 'N2', 'N1']) {
  const raw = records.filter((k) => k.level === l).map((k) => dates[k.kanji]);
  pages[`/jlpt/${l.toLowerCase()}/`] = latest(...raw, pageDate('src/pages/jlpt/[level].astro'));
}
writeFileSync('src/data/lastmod.json', `${JSON.stringify({ pages, kanji }, null, 1)}\n`);
console.log(`Dated ${records.length} kanji and ${Object.keys(pages).length} pages. Newest kanji change: ${newest(records)}`);
