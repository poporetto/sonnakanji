import { toRomaji } from 'wanakana';

const RUN = /[々一-鿿ぁ-ゖァ-ヺー]+/g;
const KANJI = /[々一-鿿]/;

// What the game's Japanese words sound like. Each kanji and battle word is added as the game loads.
export const READINGS = new Map(Object.entries({
  桜餅: 'sakuramochi', 鮎の塩焼き: 'ayu no shioyaki', 温泉たまご: 'onsen tamago', 三色団子: 'sanshoku dango', 弁当: 'bentou', お茶: 'ocha', 雑誌: 'zasshi',
  墨: 'sumi', 金墨: 'kinboku', 紙札: 'kamifuda', 金札: 'kinfuda', 桜札: 'sakurafuda', 川札: 'kawafuda', 湯札: 'yufuda', 筆札: 'fudefuda',
  たこ焼き: 'takoyaki', りんご飴: 'ringoame', 波札: 'namifuda', 灯札: 'akarifuda',
  巫女: 'miko', 葵: 'aoi', 消しゴム: 'keshigomu', 招き猫: 'manekineko', 鳥居: 'torii', 漢字: 'kanji',
}));
export function learnReadings(species: { k: string; r: string; moves: { w: string; r: string }[] }[]) {
  for (const s of species) {
    if (s.r) READINGS.set(s.k, s.r);
    for (const m of s.moves) READINGS.set(m.w, toRomaji(m.r));
  }
}

// Splits text so each Japanese word can carry its romaji, longest known word first.
// A word already followed by its reading in brackets leaves the romaji to the reading.
export function withRomaji(text: string) {
  const parts: { text: string; roma?: string }[] = [];
  let last = 0;
  const mark = (end: number, roma: string) => { parts.push({ text: text.slice(last, end), roma }); last = end; };
  for (const m of text.matchAll(RUN)) {
    const run = m[0], at = m.index;
    if (!KANJI.test(run)) { mark(at + run.length, toRomaji(run)); continue; }
    if (text.slice(at + run.length, at + run.length + 2) === ' (') continue;
    for (let i = 0; i < run.length;) {
      const len = [...Array(run.length - i).keys()].map((n) => run.length - i - n).find((n) => READINGS.has(run.slice(i, i + n)));
      if (!len) { i++; continue; }
      mark(at + i + len, READINGS.get(run.slice(i, i + len))!);
      i += len;
    }
  }
  if (last < text.length) parts.push({ text: text.slice(last) });
  return parts;
}
