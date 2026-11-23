# N2 illustration progress

All 367 N2 cards have accepted transparent WebP illustrations on `codex/n2-mnemonic-art`. `n2-shape-briefs.json` has a shape brief for every card in deck order. The finished illustrations appear in 19 contact sheets under `art-source/review/`.

Use the built-in image generator with true transparency. Use only the user's `before.png`, `Cheerful Nine Kanji Mascot_gbc.png`, and `yasumu.png` in `/Users/andriastaniwan/Downloads/Sonna Kanji new images/` as style references. The briefs describe shape mnemonics. The monochrome book examples inform the connection between pictures and kanji components.

Import accepted assets with `node scripts/art/import-generated.mjs N2 KANJI PNG`. Review the result at flashcard size with `node scripts/art/make-contact-sheets.mjs N2` and run `node scripts/art/check-hand-art.mjs N2`. `npm run art` wires those sources into the deck, then `npm test` and `npm run build` verify the integration.

The final batch on 23 November 2026 added 114 illustrations. The final review corrected the cutout edge on 硬, joined the middle bay to the frame on 巨, and aligned the two wings on 濯. All 367 illustrations are wired into the built N2 cards.
