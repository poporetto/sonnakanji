import type { APIRoute } from 'astro';
import { allKanji, byLevel, type Kanji } from '../../lib/kanji';
import type { Element, Move, Species } from '../../kanjimono/battle';
import { UNSUITABLE, WORDS } from '../../kanjimono/meanings';
import { commonReading } from '../../lib/reading';

const TYPES: Record<Element, string> = {
  fire: '火日電光赤夏朝昼晩熱明暑急走発動強力', water: '水川雨海魚洋飲氷冬青注池泳雪洗港', wood: '木本花林森茶竹草葉春秋野緑生物米', earth: '土山田地石町国道場京外東西南北原店屋室家', metal: '金銀鉄車工銭電刀', spirit: '',
};
const typeOf = (k: string): Element => (Object.keys(TYPES) as Element[]).find((t) => TYPES[t].includes(k)) ?? 'spirit';

function movesFor(k: Kanji): Move[] {
  const moves = k.words.filter((w) => [...w.w].length >= 2 && !UNSUITABLE.test(w.m)).slice(0, 4)
    .map((w, i) => ({ w: w.w, r: w.r, m: w.m.split(';')[0], power: 30 + i * 8 + [...w.w].length * 4 }));
  return moves.length ? moves : [{ w: '突撃', r: 'とつげき', m: 'charge', power: 36 }];
}

const toSpecies = (k: Kanji): Species => ({
  k: k.kanji, m: WORDS[k.kanji] ?? k.meanings[0], r: commonReading(k), type: typeOf(k.kanji), strokes: k.strokes, moves: movesFor(k),
  level: k.level as 'N5' | 'N4', d: k.vg.strokes.map((s) => s.d),
});

// Useful kanji from higher levels that the game teaches early, with the body parts.
const EXTRAS = allKanji.filter((k) => k.kanji === '耳').map((k) => ({ ...k, level: 'N4' as const }));

export const GET: APIRoute = () =>
  new Response(JSON.stringify([...byLevel('N5'), ...byLevel('N4'), ...EXTRAS].map(toSpecies)), { headers: { 'Content-Type': 'application/json' } });
