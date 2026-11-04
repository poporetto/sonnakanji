import type { APIRoute } from 'astro';
import { allKanji } from '../lib/kanji';

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
        g: k.glyphs[0]?.src ?? null,
        ge: k.glyphs[0]?.label ?? null,
      })),
    ),
    { headers: { 'Content-Type': 'application/json' } },
  );
