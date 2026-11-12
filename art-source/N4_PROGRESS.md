# N4 illustration progress

- Branch: `codex/n4-mnemonic-art` (N5 production release is commit `2f0a508` on `main`).
- Target: all 166 N4 kanji in `src/data/kanji.json`.
- Accepted draft sources: 立 手 力 目 田 正 文 口 町 空 in `art-source/hand/`.
- Needs a new image: 足. Its first draft is in `art-source/drafts/n4/足.webp`; its transparent edge is noisy and the leg scene does not read clearly enough.
- The other 155 N4 images have not been generated. The built-in image service returned `usage_limit_reached` on 12 November 2026 and reported a reset at 13 November 2026, 10:41 AEDT.
- `art-source/n4-shape-briefs.json` contains text memory cues and component layout for all 166. These are design briefs, not claims that every scene is a historical etymology.
- Use **only** these three user images as visual style references: `/Users/andriastaniwan/Downloads/Sonna Kanji new images/before.png`, `/Users/andriastaniwan/Downloads/Sonna Kanji new images/Cheerful Nine Kanji Mascot_gbc.png`, and `/Users/andriastaniwan/Downloads/Sonna Kanji new images/yasumu.png`. Do not pass existing repository drawings or N5 images as image references.
- When generation is available again, create one image per remaining kanji with the built-in imagegen tool. Save transparent 92-quality WebP sources to `art-source/hand/`. Review contact sheets at card size, correct shape or origin misses, update memory lines where needed, run `npm run art`, `npm test`, and `npm run build`, then commit the completed N4 set.
- The ten accepted N4 source images are not yet added to `src/data/hand-art.json` or deployed. `art-source/review/n4-pilot.webp` previews them.
