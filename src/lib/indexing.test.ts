// Checks the built site, so run it after `npm run build`.
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { test } from 'node:test';
import handArt from '../data/hand-art.json' with { type: 'json' };
import kanji from '../data/kanji.json' with { type: 'json' };
import slugs from '../data/slugs.json' with { type: 'json' };

const page = (slug: string) => readFileSync(`dist/kanji/${slug}/index.html`, 'utf8');
const drawn = handArt as Record<string, string>;
const slugOf = slugs as Record<string, string>;

test('every kanji page can be indexed and is in the sitemap, beta or not', () => {
  const sitemap = readFileSync('dist/sitemap.xml', 'utf8');
  const robots = readFileSync('dist/robots.txt', 'utf8');
  assert.match(robots, /Allow: \//);
  assert.doesNotMatch(robots, /Disallow: \/\S/);
  const dirs = readdirSync('dist/kanji');
  assert.equal(dirs.length >= kanji.length, true);
  for (const k of kanji) {
    const html = page(slugOf[k.kanji]);
    assert.doesNotMatch(html, /name="robots"/, `${k.kanji} has a robots meta tag`);
    assert.match(html, new RegExp(`rel="canonical" href="[^"]*/kanji/${slugOf[k.kanji]}/"`), `${k.kanji} canonical`);
    assert.ok(sitemap.includes(`/kanji/${slugOf[k.kanji]}/</loc>`), `${k.kanji} missing from the sitemap`);
  }
});

test('N1 cards with their final drawing drop the Beta tag; the rest keep it', () => {
  const n1 = kanji.filter((k) => k.level === 'N1');
  const done = n1.find((k) => drawn[k.kanji])!;
  const draft = n1.find((k) => !drawn[k.kanji]);
  assert.doesNotMatch(page(slugOf[done.kanji]), /class="chip">Beta</);
  if (draft) assert.match(page(slugOf[draft.kanji]), /class="chip">Beta</);
  for (const k of kanji.filter((k) => k.level === 'N2')) assert.doesNotMatch(page(slugOf[k.kanji]), /class="chip">Beta</);
});

test('every URL the site has ever used still lands on a page', async () => {
  const vercel = JSON.parse(readFileSync('vercel.json', 'utf8')) as { redirects: { source: string; destination: string }[]; headers?: unknown[] };
  const retired = JSON.parse(readFileSync('src/data/retired-slugs.json', 'utf8')) as Record<string, string>;
  assert.ok(vercel.headers?.length, 'vercel.json lost its cache headers');
  const to = new Map(vercel.redirects.map((r) => [r.source, r.destination]));
  for (const [old, k] of Object.entries(retired)) assert.equal(to.get(`/kanji/${old}/`), `/kanji/${slugOf[k]}/`);
  for (const dest of to.values()) assert.ok(readdirSync(`dist${dest}`).includes('index.html'), `${dest} is not a page`);
});
