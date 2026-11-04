import type { APIRoute } from 'astro';
import { allKanji, kanjiPath, LEVELS } from '../lib/kanji';

export const GET: APIRoute = ({ site }) => {
  const paths = ['/', ...LEVELS.map((l) => `/jlpt/${l.slug}/`), '/learn-kanji-with-pictures/', '/review/', '/about/', ...allKanji.map((k) => kanjiPath(k.kanji))];
  const urls = paths.map((p) => `<url><loc>${new URL(p, site).href}</loc></url>`).join('');
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`,
    { headers: { 'Content-Type': 'application/xml' } },
  );
};
