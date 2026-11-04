import type { APIRoute } from 'astro';
import { allKanji, artPath, kanjiPath } from '../lib/kanji';

// The small payload the review page needs, separate from the indexable pages.
export const GET: APIRoute = () =>
  new Response(
    JSON.stringify(
      allKanji.map((k) => ({
        k: k.kanji,
        l: k.level,
        m: k.meanings,
        on: k.on.map((r) => r.kana),
        kun: k.kun.map((r) => r.kana),
        n: k.mnemonic,
        a: artPath(k.kanji),
        u: kanjiPath(k.kanji),
      })),
    ),
    { headers: { 'Content-Type': 'application/json' } },
  );
