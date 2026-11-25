import type { APIRoute } from 'astro';
import { allKanji, artPath, kanjiPath, LEVELS } from '../lib/kanji';
import { hubs, hubPath } from '../lib/links';
import lastmod from '../data/lastmod.json';

const pageDates = lastmod.pages as Record<string, string>;
const kanjiDates = lastmod.kanji as Record<string, string>;

export const GET: APIRoute = ({ site }) => {
  const abs = (p: string) => new URL(p, site).href;
  const entry = (path: string, date?: string, image?: string) =>
    `<url><loc>${abs(path)}</loc>${date ? `<lastmod>${date}</lastmod>` : ''}${image ? `<image:image><image:loc>${abs(image)}</image:loc></image:image>` : ''}</url>`;
  const paths = ['/', '/jlpt/', ...LEVELS.map((l) => `/jlpt/${l.slug}/`), '/components/', '/learn-kanji-with-pictures/', '/kanjimono/', '/review/', '/about/'];
  const urls = [
    ...paths.map((p) => entry(p, pageDates[p])),
    ...hubs.map((g) => entry(hubPath(g), g.kanji.map((k) => kanjiDates[k.kanji]).sort().at(-1))),
    ...allKanji.map((k) => entry(kanjiPath(k.kanji), kanjiDates[k.kanji], artPath(k.kanji))),
  ].join('');
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">${urls}</urlset>`,
    { headers: { 'Content-Type': 'application/xml' } },
  );
};
