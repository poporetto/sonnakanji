# N3 illustration progress

- Branch: `codex/n3-mnemonic-art`, based on the N5/N4 production release. Other site commits may appear on this shared branch; do not revert them.
- Target: 367 N3 kanji in `src/data/kanji.json`.
- Accepted transparent WebP sources: **367/367** in `art-source/hand/`, following N3 deck order from 石 through 幾. All 19 contact sheets at `art-source/review/n3-sheet-1.webp` through `n3-sheet-19.webp` were reviewed at card size. `node scripts/art/check-hand-art.mjs N3` reports zero translucent edge flags. All 367 sources are wired into `src/data/hand-art.json` and `public/art/` through `npm run art`.
- `art-source/n3-shape-briefs.json` covers all 367 kanji, with all 367 shape briefs reviewed in deck order.
- Use only the three colorful user-supplied images for visual style: `before.png`, `Cheerful Nine Kanji Mascot_gbc.png`, and `yasumu.png` from `/Users/andriastaniwan/Downloads/Sonna Kanji new images/`. Do not pass any repository image, including N5/N4/N3 art, as an image reference. The monochrome book examples inform component placement in words, not visual style.
- These are shape mnemonics. Do not present an unverified mnemonic story as a historical origin.
- Artwork generation is complete. The built-in image service moderation blocks for 認 and 痛 were resolved by revising the briefs to gentler scenes; both final images were generated, reviewed and imported. 許 was regenerated to remove a translucent edge flag.
- N5, N4 and N3 together have 612 hand illustrations. The N3 deck remains in beta for its mnemonic text and level settings.
