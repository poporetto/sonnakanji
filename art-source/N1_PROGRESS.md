# N1 illustration progress

The N1 deck has 1,232 cards. `codex/n1-mnemonic-art` contains 142 accepted transparent illustrations and 1,090 cards left to illustrate. The branch is checked out in `.cache/n1-worktree` inside the main SonnaKanji checkout. The original checkout has independent work in progress.

`n1-shape-briefs.json` has briefs for the first 220 cards in deck order. The first 79 cards have accepted images. Resume at 災 (card 80), then fill the remaining gaps in deck order. Some later cards through 渉 (card 199) already have accepted images. The first 墓 and 模 drafts were set aside because they placed the grass below the sunset. Their revised briefs put it at the top. The final 率 image places all four counters beside the center ribbon.

Use the built-in image generator with true transparency and the three user-supplied colorful style references in `/Users/andriastaniwan/Downloads/Sonna Kanji new images/`: `before.png`, `Cheerful Nine Kanji Mascot_gbc.png`, and `yasumu.png`. Use the monochrome examples for ideas about connecting the kanji parts to the scene. The briefs describe visual mnemonics. Use only the three originals as image references.

Import each accepted output with `node scripts/art/import-generated.mjs N1 KANJI PNG`. Review with `node scripts/art/make-contact-sheets.mjs N1` and `node scripts/art/check-hand-art.mjs N1`. Run `npm run art`, `npm run lastmod`, `npm run build`, and `npm test`. The tests use files from the build. Verify the built cards reference the accepted WebP assets and commit the N1 batch on its branch.

On 25 November 2026, the first run reached its image quota. The service reported a reset on Thursday, 26 November 2026 at 9:53 am Sydney time.
