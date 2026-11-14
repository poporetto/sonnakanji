# N3 illustration progress

- Branch: `codex/n3-mnemonic-art`, based on the N5/N4 production release. Other site commits may appear on this shared branch; do not revert them.
- Target: 367 N3 kanji in `src/data/kanji.json`.
- Accepted transparent WebP sources: 160/367 in `art-source/hand/`, following N3 deck order through 付. Eight contact sheets at `art-source/review/n3-sheet-1.webp` through `n3-sheet-8.webp` were reviewed at card size. `node scripts/art/check-hand-art.mjs N3` reports zero translucent edge flags.
- `art-source/n3-shape-briefs.json` covers all 367 kanji, with all 367 shape briefs reviewed in deck order. Entries 161–367 (説 through 幾) have reviewed briefs but no accepted images yet. Image prompts should use these as shape mnemonics, then verify generated stroke/component placement at card size.
- The built-in image service returned `usage_limit_reached` on 14 November 2026 after the first 160 images and two revisions. Its reported reset is Sunday 15 November 2026 at 11:01 am Sydney time. The next image to generate is 説.
- Use only the three colorful user-supplied images for visual style: `before.png`, `Cheerful Nine Kanji Mascot_gbc.png`, and `yasumu.png` from `/Users/andriastaniwan/Downloads/Sonna Kanji new images/`. Do not pass any repository image, including N5/N4/N3 art, as an image reference. The monochrome book examples inform component placement in words, not visual style.
- These are shape mnemonics. Do not present an unverified mnemonic story as a historical origin.
- The N3 hand sources have not been added to `src/data/hand-art.json` or deployed. Continue to review brief batches, generate with the built-in image tool, import using `node scripts/art/import-generated.mjs N3 KANJI PNG`, review contact sheets, correct misses, then run `npm run art`, `npm test`, and `npm run build` for the complete level.
- The user previously declined a daily continuation automation; no automation is set for this work.
