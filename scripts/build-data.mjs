#!/usr/bin/env node
// Builds src/data/kanji.json and public/glyphs/ from kanjiapi, Wiktionary,
// Wikimedia Commons and KanjiVG. Every HTTP response is cached in .cache/, so
// reruns are offline. Hand-written mnemonics live in src/data/mnemonics.json
// and are never touched here.
import { mkdir, readFile, writeFile, access } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { toRomaji } from 'wanakana';

const ROOT = path.resolve(import.meta.dirname, '..');
const CACHE = path.join(ROOT, '.cache');
const GLYPHS = path.join(ROOT, 'public/glyphs');
const UA = 'sonnakanji-data-build/0.1 (https://github.com/poporetto/sonnakanji)';
const LEVELS = [5, 4, 3, 2, 1];
// Beta levels get dictionary and stroke data only for now. Wiktionary and Commons
// are slow to crawl politely, so their origins and ancient forms come later.
const FULL_LEVELS = [5, 4];

// Kyūjitai for shinjitai whose etymology and ancient forms are filed under the
// traditional character on Wiktionary and Commons.
const KYUJITAI = Object.fromEntries(
  [...'国國学學気氣来來円圓売賣図圖広廣楽樂発發転轉駅驛験驗体體会會万萬読讀医醫台臺写寫帰歸歩步毎每黒黑真眞研硏青靑飲飮画畫悪惡教敎昼晝海海社社者者'.matchAll(/(.)(.)/gu)]
    .map((m) => [m[1], m[2]])
    .filter(([a, b]) => a !== b),
);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const exists = (p) => access(p).then(() => true, () => false);

async function cached(url, { binary = false, delay = 0 } = {}) {
  const file = path.join(CACHE, createHash('sha1').update(url).digest('hex'));
  if (await exists(file)) return binary ? readFile(file) : readFile(file, 'utf8');
  for (let attempt = 0; attempt < 6; attempt++) {
    if (delay) await sleep(delay);
    const res = await fetch(url, { headers: { 'User-Agent': UA } }).catch(() => null);
    if (!res) {
      await sleep(2000 * 2 ** attempt);
      continue;
    }
    if (res.status === 404) {
      await writeFile(file, '');
      return binary ? Buffer.alloc(0) : '';
    }
    if (res.status === 429 || res.status >= 500) {
      await sleep(2000 * 2 ** attempt);
      continue;
    }
    if (!res.ok) throw new Error(`${res.status} for ${url}`);
    const buf = Buffer.from(await res.arrayBuffer());
    await writeFile(file, buf);
    return binary ? buf : buf.toString('utf8');
  }
  throw new Error(`gave up on ${url}`);
}

const api = async (p) => JSON.parse(await cached(`https://kanjiapi.dev/v1/${p}`));

// --- Wiktionary glyph origin -------------------------------------------------
const LIUSHU = {
  p: 'pictogram', i: 'ideogram', ic: 'compound', pc: 'phono-semantic',
  ps: 'phono-semantic', psc: 'phono-semantic', r: 'rebus', t: 'derivative',
};

async function wiktionaryOrigin(ch) {
  const raw = await cached(
    `https://en.wiktionary.org/w/index.php?title=${encodeURIComponent(ch)}&action=raw`,
    { delay: 250 },
  );
  const chinese = raw.split(/^==Chinese==$/m)[1]?.split(/^==[^=]/m)[0] ?? '';
  const section = chinese.match(/^={3,4}Glyph origin={3,4}\n([\s\S]*?)(?=^={2,4}[^=])/m)?.[1]?.trim();
  if (!section) return null;
  const code = section.match(/\{\{liushu\|(\w+)/)?.[1] ?? section.match(/\{\{Han compound[^}]*\|ls=(\w+)/)?.[1];
  return { type: LIUSHU[code] ?? null, text: section };
}

// --- Commons ancient forms ---------------------------------------------------
const ERAS = [
  ['oracle', 'Oracle bone', ['oracle']],
  ['bronze', 'Bronze', ['bronze', 'bronze-shang', 'bronze-zhou', 'bronze-spring', 'bronze-warring']],
  ['seal', 'Seal', ['seal', 'bigseal', 'seal-liding', 'seal-yanshiliding', 'slip', 'silk']],
];
const strip = (html = '') => html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

async function commonsInfo(titles) {
  const info = {};
  for (let i = 0; i < titles.length; i += 50) {
    const qs = new URLSearchParams({
      action: 'query', format: 'json', prop: 'imageinfo',
      iiprop: 'url|extmetadata', titles: titles.slice(i, i + 50).join('|'),
    });
    const data = JSON.parse(await cached(`https://commons.wikimedia.org/w/api.php?${qs}`, { delay: 300 }));
    const renamed = Object.fromEntries((data.query.normalized ?? []).map((n) => [n.to, n.from]));
    for (const page of Object.values(data.query.pages)) {
      if (page.missing !== undefined || !page.imageinfo) continue;
      const ii = page.imageinfo[0];
      info[renamed[page.title] ?? page.title] = {
        url: ii.url.split('?')[0],
        page: ii.descriptionurl?.split('?')[0],
        license: strip(ii.extmetadata?.LicenseShortName?.value),
        artist: strip(ii.extmetadata?.Artist?.value),
      };
    }
  }
  return info;
}

// --- KanjiVG -----------------------------------------------------------------
// The top-level element groups become colour-coded parts; a part's strokes keep
// their stroke-order index so the same data also drives the animation.
function parseKanjiVG(svg) {
  const body = svg.slice(svg.indexOf('<g id="kvg:StrokePaths'), svg.indexOf('<g id="kvg:StrokeNumbers'));
  const stack = [];
  const strokes = [];
  const parts = [];
  for (const [tag] of body.matchAll(/<\/?(?:g|path)\b[^>]*>/g)) {
    if (tag.startsWith('</g')) { stack.pop(); continue; }
    if (tag.startsWith('<g')) {
      const element = tag.match(/kvg:element="([^"]+)"/)?.[1];
      const original = tag.match(/kvg:original="([^"]+)"/)?.[1];
      const depth = stack.length;
      // depth 0 = wrapper, 1 = the kanji, 2 = its first-level parts
      let part = stack.at(-1)?.part ?? null;
      if (depth === 2) {
        const name = element ?? null;
        const continued = tag.match(/kvg:part="([2-9])"/) && parts.find((p) => p.el === name);
        part = continued || { el: name, original: original ?? null };
        if (!continued) parts.push(part);
      }
      stack.push({ part });
      continue;
    }
    const d = tag.match(/\sd="([^"]+)"/)[1];
    strokes.push({ d, part: stack.at(-1)?.part ? parts.indexOf(stack.at(-1).part) : -1 });
  }
  return { strokes, parts: parts.map(({ el, original }) => ({ el, original })) };
}

// --- Display helpers ---------------------------------------------------------
const kunDisplay = (r) => {
  const clean = r.replace(/^-|-$/g, '');
  const [stem, okuri] = clean.split('.');
  return okuri ? `${stem}(${okuri})` : stem;
};
const romaji = (r) => toRomaji(r.replace(/[-.]/g, ''));
const isCommon = (p) => p.some((x) => /^(ichi1|news1|spec1|gai1)$/.test(x));

function pickWords(entries, ch, known) {
  const out = [];
  const seen = new Set();
  for (const e of entries) {
    const v = e.variants.find((x) => x.written?.includes(ch) && isCommon(x.priorities));
    if (!v || seen.has(v.written) || v.written.length > 4) continue;
    seen.add(v.written);
    const gloss = e.meanings[0]?.glosses?.slice(0, 2).join('; ');
    if (!gloss) continue;
    const kanjiInWord = [...v.written].filter((c) => /\p{Script=Han}/u.test(c));
    const score = (kanjiInWord.every((c) => known.has(c)) ? 0 : 10) + v.written.length
      + (v.priorities.includes('ichi1') ? 0 : 1);
    out.push({ w: v.written, r: v.pronounced, m: gloss, score });
  }
  return out.sort((a, b) => a.score - b.score).slice(0, 4).map(({ score, ...w }) => w);
}

// --- Main --------------------------------------------------------------------
await mkdir(CACHE, { recursive: true });
await mkdir(GLYPHS, { recursive: true });

const lists = Object.fromEntries(
  await Promise.all(LEVELS.map(async (l) => [l, await api(`kanji/jlpt-${l}`)])),
);
// Example words prefer kanji a learner at this level has already met.
const knownAt = (level) => new Set(LEVELS.filter((l) => (level >= 4 ? l >= 4 : l >= level)).flatMap((l) => lists[l]));
const chars = LEVELS.flatMap((l) => lists[l].map((c) => [c, l]));

// Fill the cache for beta levels in parallel, so the loop below stays simple.
const urls = (c) => [
  `https://kanjiapi.dev/v1/kanji/${encodeURIComponent(c)}`,
  `https://kanjiapi.dev/v1/words/${encodeURIComponent(c)}`,
  `https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji/${c.codePointAt(0).toString(16).padStart(5, '0')}.svg`,
];
const pending = chars.filter(([, l]) => !FULL_LEVELS.includes(l)).flatMap(([c]) => urls(c));
let done = 0;
await Promise.all(Array.from({ length: 8 }, async () => {
  while (pending.length) {
    await cached(pending.pop());
    if (++done % 500 === 0) console.log(`fetched ${done}`);
  }
}));

// Ancient forms, shinjitai first, then the kyūjitai.
const titles = chars.filter(([, l]) => FULL_LEVELS.includes(l)).flatMap(([c]) =>
  [c, KYUJITAI[c]].filter(Boolean).flatMap((x) =>
    ERAS.flatMap(([, , suffixes]) => suffixes.map((s) => `File:${x}-${s}.svg`)),
  ),
);
const commons = await commonsInfo(titles);

const records = [];
const originReport = [];
const gaps = { origin: [], glyphs: [], words: [], vg: [] };
const radicalLookup = new Map();

for (const [c, level] of chars) {
  const k = await api(`kanji/${encodeURIComponent(c)}`);
  const trad = KYUJITAI[c];
  const full = FULL_LEVELS.includes(level);
  const origin = full ? (await wiktionaryOrigin(c)) ?? (trad ? await wiktionaryOrigin(trad) : null) : null;
  if (full && !origin) gaps.origin.push(c);

  const glyphs = [];
  for (const [era, label, suffixes] of full ? ERAS : []) {
    let found = null;
    for (const x of [c, trad].filter(Boolean)) {
      for (const s of suffixes) {
        const f = commons[`File:${x}-${s}.svg`];
        if (f) { found = { ...f, char: x }; break; }
      }
      if (found) break;
    }
    if (!found) continue;
    const name = `${found.char.codePointAt(0).toString(16)}-${era}.svg`;
    const dest = path.join(GLYPHS, name);
    if (!(await exists(dest))) {
      await writeFile(dest, await cached(found.url, { binary: true, delay: 200 }));
    }
    glyphs.push({
      era, label, src: `/glyphs/${name}`, char: found.char,
      page: found.page, license: found.license, artist: found.artist,
    });
  }
  if (full && !glyphs.length) gaps.glyphs.push(c);

  const hex = c.codePointAt(0).toString(16).padStart(5, '0');
  const vgRaw = await cached(`https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji/${hex}.svg`);
  const vg = vgRaw ? parseKanjiVG(vgRaw) : { strokes: [], parts: [] };
  if (vg.strokes.length !== k.stroke_count) gaps.vg.push(`${c}(${vg.strokes.length}/${k.stroke_count})`);

  const wordEntries = await api(`words/${encodeURIComponent(c)}`);
  const words = pickWords(wordEntries, c, knownAt(level));
  if (!words.length) gaps.words.push(c);

  records.push({
    kanji: c,
    level: `N${level}`,
    trad: trad ?? null,
    meanings: k.meanings.slice(0, 5),
    on: k.on_readings.map((r) => ({ kana: r, romaji: romaji(r) })),
    kun: k.kun_readings.map((r) => ({ kana: kunDisplay(r), romaji: romaji(r) })),
    strokes: k.stroke_count,
    grade: k.grade,
    freq: k.freq_mainichi_shinbun ?? 9999,
    originType: origin?.type ?? null,
    glyphs,
    vg,
    words,
  });
  originReport.push(`${c}${trad ? `[${trad}]` : ''} ${level} ${k.meanings.slice(0, 3).join(', ')} | ${vg.parts.map((p) => p.el).join('+')} | ${origin?.type ?? '?'} | ${(origin?.text ?? '').replace(/\s+/g, ' ').slice(0, 260)}`);
}

// Stable teaching order: level, then school grade, then newspaper frequency.
records.sort((a, b) =>
  b.level.slice(1) - a.level.slice(1) || (a.grade ?? 9) - (b.grade ?? 9) || a.freq - b.freq,
);

await writeFile(path.join(ROOT, 'src/data/kanji.json'), JSON.stringify(records));
await writeFile(path.join(CACHE, 'origin-report.txt'), originReport.join('\n'));

const parts = new Set(records.flatMap((r) => r.vg.parts.map((p) => p.original ?? p.el)).filter(Boolean));
console.log(`records: ${records.length}`);
console.log(`no glyph origin (${gaps.origin.length}): ${gaps.origin.join(' ')}`);
console.log(`no ancient form (${gaps.glyphs.length}): ${gaps.glyphs.join(' ')}`);
console.log(`no words (${gaps.words.length}): ${gaps.words.join(' ')}`);
console.log(`stroke mismatch (${gaps.vg.length}): ${gaps.vg.join(' ')}`);
console.log(`first-level parts (${parts.size}): ${[...parts].join('')}`);
console.log('glyph counts:', Object.fromEntries(ERAS.map(([e]) => [e, records.filter((r) => r.glyphs.some((g) => g.era === e)).length])));
console.log('licenses:', [...new Set(records.flatMap((r) => r.glyphs.map((g) => g.license)))].join(' | '));
