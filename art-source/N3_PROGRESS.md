# N3 illustration progress

- Branch: `codex/n3-mnemonic-art`, based on the completed N5/N4 production release.
- Target: 367 N3 kanji in `src/data/kanji.json`.
- `art-source/n3-shape-briefs.json` contains a meaning, existing memory cue, component labels, inferred placement, and a proposed visual for every N3 kanji. The first 20 are manually reviewed; the other 347 remain drafts. There are 66 draft entries with unnamed or encoded components that must be clarified before their images are generated.
- No N3 hand illustration has been generated yet. The built-in image service returned `usage_limit_reached` on 13 November 2026, with reset reported for 14 November 2026 at 10:42 am AEDT. Do not mark a brief as an accepted image.
- Use only the three colorful user-supplied images for visual style: `before.png`, `Cheerful Nine Kanji Mascot_gbc.png`, and `yasumu.png` from `/Users/andriastaniwan/Downloads/Sonna Kanji new images/`. Do not pass any repository image, including N5/N4 art, as an image reference. The monochrome book images are ideas for putting illustration objects in the corresponding stroke/component positions, not style references.
- The briefs are memory aids based on visible kanji shape; do not present unverified mnemonic stories as historical origins.
- When image generation resumes, generate a small pilot from reviewed briefs, review at flashcard size, then continue in batches. Save transparent 92-quality WebP source files to `art-source/hand/<kanji>.webp`. Run `node scripts/art/check-hand-art.mjs N3` and `node scripts/art/make-contact-sheets.mjs N3`, review and correct the art, then run `npm run art`, `npm test`, and `npm run build` before committing a complete set.
- The user previously declined a daily continuation automation; no automation should be created for this work without a new request.
