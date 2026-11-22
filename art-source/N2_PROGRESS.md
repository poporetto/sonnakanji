# N2 illustration progress

The N2 deck contains 367 cards. The branch `codex/n2-mnemonic-art` has 253 accepted illustrations and 114 cards left to illustrate. `n2-shape-briefs.json` has a shape brief for every card in deck order.

Cards 1–218 have illustrations. Resume with 層 (card 219), then 裏 (card 220), and continue with missing cards in deck order. Some later cards through 爆 (card 269) already have illustrations. Check for a source in `art-source/hand/` before generating a card.

Use the built-in image generator with true transparency. Use only the user's `before.png`, `Cheerful Nine Kanji Mascot_gbc.png`, and `yasumu.png` in `/Users/andriastaniwan/Downloads/Sonna Kanji new images/` as style references. The briefs describe shape mnemonics. The monochrome book examples inform the connection between pictures and kanji components.

Import accepted assets with `node scripts/art/import-generated.mjs N2 KANJI PNG`. Review the result at flashcard size with `node scripts/art/make-contact-sheets.mjs N2` and run `node scripts/art/check-hand-art.mjs N2`. `npm run art` wires those sources into the deck, then `npm test` and `npm run build` verify the integration.

On 22 November 2026, the second batch added 165 illustrations, including the corrected 州 and the revised 印 with a blank wax seal. All 253 sources passed the flashcard review and transparency check. The generator reported a usage limit reset on Monday, 23 November 2026 at 9:23 pm Sydney time.
