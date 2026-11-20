# N2 illustration progress

The N2 deck contains 367 cards. The branch `codex/n2-mnemonic-art` has 88 accepted illustrations and 279 cards left to illustrate. The first 160 cards have briefs in `n2-shape-briefs.json` in deck order.

Start with 州 (card 32), then fill the remaining gaps in deck order beginning with 賞 (card 74). Some later cards already have illustrations. Check for a source in `art-source/hand/` before generating a card. The first 州 draft put all three islands on the same side of the channels and was saved in the ignored cache for reference. Its revised brief specifies one island per channel.

Use the built-in image generator with true transparency. Use only the user's `before.png`, `Cheerful Nine Kanji Mascot_gbc.png`, and `yasumu.png` in `/Users/andriastaniwan/Downloads/Sonna Kanji new images/` as style references. The briefs describe shape mnemonics. The monochrome book examples inform the connection between pictures and kanji components.

Import accepted assets with `node scripts/art/import-generated.mjs N2 KANJI PNG`. Review the result at flashcard size with `node scripts/art/make-contact-sheets.mjs N2` and run `node scripts/art/check-hand-art.mjs N2`. `npm run art` wires those sources into the deck, then `npm test` and `npm run build` verify the integration.

On 21 November 2026, the generator reported a usage limit reset at 3:59 pm Sydney time. The 88 accepted sources in the first batch are wired on this branch.
