# N1 illustration progress

The N1 deck has 1,232 cards. The branch `codex/n1-mnemonic-art` contains 383 accepted transparent illustrations, with 849 cards left to illustrate. The branch is checked out in `.cache/n1-worktree` inside the main SonnaKanji checkout. The original checkout has independent work in progress.

`n1-shape-briefs.json` has briefs for the first 500 cards in deck order. The first 355 cards have accepted images. Resume at 症 (card 356), then fill the remaining gaps in deck order. The revised 墓 and 模 images put the grass above the sunset, 避 places the detour to the left and below, and 房 places the flag below the roof. The first 巡 draft is in `.cache/n1-withheld/` because the transparency check flagged its outer edge. Keep more clear margin in the new render.

Use the built-in image generator with true transparency and the three user-supplied colorful style references in `/Users/andriastaniwan/Downloads/Sonna Kanji new images/`: `before.png`, `Cheerful Nine Kanji Mascot_gbc.png`, and `yasumu.png`. Use the monochrome examples for ideas about connecting the kanji parts to the scene. The briefs describe visual mnemonics. Use only the three originals as image references.

Import each accepted output with `node scripts/art/import-generated.mjs N1 KANJI PNG`. Review with `node scripts/art/make-contact-sheets.mjs N1` and `node scripts/art/check-hand-art.mjs N1`. Run `npm run art`, `npm run lastmod`, `npm run build`, and `npm test`. The tests use files from the build. Verify the built cards reference the accepted WebP assets and commit the N1 batch on its branch.

The 28 November 2026 run recovered drafts from the previous session and advanced the accepted total from 142 to 383. The image service reached its quota and reported a reset on Saturday, 28 November 2026 at 6:19 pm Sydney time.
