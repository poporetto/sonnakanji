import { toRomaji } from 'wanakana';

const READING = /[ぁ-ゖァ-ヺー]+/g;
const KANJI = /[々一-鿿]/;

// Splits text so a reading can carry its romaji. Kana joined to a kanji, like the end of 止まれ, stays as it is.
export function withRomaji(text: string) {
  const parts: { text: string; roma?: string }[] = [];
  let last = 0;
  for (const m of text.matchAll(READING)) {
    const at = m.index, end = at + m[0].length;
    if (KANJI.test(text[at - 1] ?? '') || KANJI.test(text[end] ?? '')) continue;
    parts.push({ text: text.slice(last, end), roma: toRomaji(m[0]) });
    last = end;
  }
  if (last < text.length) parts.push({ text: text.slice(last) });
  return parts;
}
