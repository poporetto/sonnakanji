# SonnaKanji

Kanji mnemonics for JLPT N5 and N4: a static, SEO-friendly Astro site with one
page per kanji, swipeable cards and browser-based spaced repetition (FSRS).
There is no database. Review progress lives in the visitor's `localStorage`.

```bash
npm install
npm run dev     # http://localhost:4321
npm test        # SRS logic
npm run build   # static site in dist/, deploy to any static host
```

Pushing to `main` deploys to Vercel. Canonical URLs and the sitemap use Vercel's
production domain automatically; set `SITE_URL` in Vercel to override it.

## Content

| File | Written by | Purpose |
| --- | --- | --- |
| `src/data/kanji.json`, `public/glyphs/` | `npm run data` | Generated from the sources below |
| `src/data/mnemonics.json` | Hand | One sentence per kanji |
| `src/data/meanings.json` | Hand | Replaces noisy KANJIDIC headline meanings |
| `src/data/parts.json` | Hand | English names for kanji components |

`npm run data` caches every response in `.cache/`, so reruns are offline and
never touch the hand-written files. To add N3, add `3` to `LEVELS` in
`scripts/build-data.mjs` and to `LEVELS` in `src/lib/kanji.ts`, then write its
mnemonics.

## Licences

Kanji data (KANJIDIC2, JMdict) and Wiktionary-derived material are CC BY-SA, and
KanjiVG stroke data is CC BY-SA 3.0, so the site's data must stay share-alike.
Ancient forms come from Wikimedia Commons; per-file credits are on `/about/`.
