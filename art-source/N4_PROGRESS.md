# N4 illustration set

- Branch: `codex/n4-mnemonic-art`.
- Coverage: all 166 N4 kanji in `src/data/kanji.json` have transparent WebP sources in `art-source/hand/`.
- `art-source/n4-shape-briefs.json` records a component arrangement and visual memory cue for each kanji. These cues help recall shape; they are not historical etymology claims.
- The images use only the three colorful user-supplied mascot examples as visual style references: `before.png`, `Cheerful Nine Kanji Mascot_gbc.png`, and `yasumu.png`. Existing repository images were not used as references. The later monochrome book examples informed the component placement in words, not the visual style.
- `art-source/review/n4-sheet-1.webp` through `n4-sheet-9.webp` show the complete set at card size. `node scripts/art/check-hand-art.mjs N4` reports 166/166 sources and zero translucent edge flags.
- Rebuild site assets with `npm run art`, then verify with `npm test` and `npm run build` after any source change.
