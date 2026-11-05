// What the konbini and charm shops sell.
export interface Item { id: string; icon: string; name: string; en: string; price: number; heal?: number; full?: boolean; read?: boolean; open?: boolean; keep?: string; revive?: number }

export const ITEMS: Item[] = [
  { id: 'melon', icon: 'melon', name: 'メロンパン', en: 'melon bread', price: 30, heal: 15 },
  { id: 'rice', icon: 'rice', name: 'おにぎり', en: 'rice ball', price: 50, heal: 30 },
  { id: 'soda', icon: 'soda', name: 'ラムネ', en: 'ramune soda', price: 70, heal: 45 },
  { id: 'tea', icon: 'teacup', name: 'お茶', en: 'tea', price: 120, heal: 80 },
  { id: 'bento', icon: 'bento', name: '弁当', en: 'bento', price: 300, full: true },
  { id: 'magazine', icon: 'magazine', name: '雑誌', en: 'magazine', price: 20, read: true },
  { id: 'ink', icon: 'ink', name: '墨', en: 'ink, revives at half health', price: 150, revive: 0.5 },
  { id: 'goldink', icon: 'goldink', name: '金墨', en: 'gold ink, revives at full health', price: 450, revive: 1 },
  { id: 'capsule', icon: 'capsule', name: 'ガチャ', en: 'gachapon capsule', price: 100, open: true },
  { id: 'plush', icon: 'plush', name: 'ぬいぐるみ', en: 'Kanji Bear plushie', price: 500, keep: 'Kanji Bear plushie' },
];

export interface Charm { id: string; name: string; en: string; price: number; town?: string; ink: string; note: string; bonus?: number; sure?: boolean; easy?: boolean; refresh?: boolean; soothe?: number }

export const CHARMS: Charm[] = [
  { id: 'paper', name: '紙札', en: 'Paper charm', price: 30, ink: '#d6332a', note: 'A plain charm.' },
  { id: 'gold', name: '金札', en: 'Gold charm', price: 90, ink: '#e8a020', note: 'Much harder to break free from.', bonus: 0.3 },
  { id: 'sakura', name: '桜札', en: 'Sakura charm', price: 70, town: 'village', ink: '#f27aa8', note: 'The kanji joins you at full health.', refresh: true },
  { id: 'river', name: '川札', en: 'River charm', price: 70, town: 'kawabe', ink: '#2f80d8', note: 'Narrows the naming quiz to two answers.', easy: true },
  { id: 'spring', name: '湯札', en: 'Spring charm', price: 90, town: 'onsen', ink: '#2f9e8e', note: 'Heals your kanji 30 health when thrown.', soothe: 30 },
  { id: 'scribe', name: '筆札', en: 'Scribe charm', price: 200, town: 'castle', ink: '#6a42c0', note: 'If you name the kanji, it never breaks free.', sure: true },
];

// What a gachapon capsule can hold.
export const PRIZES = ['Mini Kanji Bear plushie', '火 keychain', '水 keychain', '木 keychain', 'Tiny Miko figure', 'Tiny Aoi figure', 'Rice ball eraser', 'Melon bread eraser', 'Sparkly 一 sticker', 'Golden 金 sticker', 'Lucky cat charm', 'Pocket torii gate'];

// A town's shelf: the two everyday charms, plus its own special one.
export const charmsIn = (town: string) => CHARMS.filter((c) => !c.town || c.town === town);

// Ink is sold by the charm makers, and everything else at the 6-7 Kombini.
export const INKWELL = ITEMS.filter((i) => i.revive);
export const SHELF = ITEMS.filter((i) => !i.revive);

// How much health an item would really restore.
export const revived = (item: Item, max: number) => Math.ceil(max * (item.revive ?? 0));
export const healed = (item: Item, hp: number, max: number) => (item.full ? max - hp : Math.min(item.heal ?? 0, max - hp));

// Tougher kanji pay better.
export const yenFor = (lv: number) => 15 + lv * 6;

// The chance a thrown charm holds, once its effect is counted.
export const holdChance = (charm: Charm, base: number) => (charm.sure ? 1 : Math.min(0.97, base + (charm.bonus ?? 0)));

// The magazines' whole content.
export const JOKES = [
  'Why was 木 lonely? It needed a friend. Now they are 林, a small wood.',
  'How do you make 森, a forest? Keep inviting 木 until the party gets out of hand.',
  'What did 人 do next to the tree? 休. It just leaned on 木 and took a rest.',
  'What happens when 日 and 月 team up? 明. Things get bright.',
  'Why is 田 so strong? Add 力 and you get 男. It was the rice field workout.',
  'Who is the tallest number? Nobody. But 十 is the only one that can do a handstand and stay the same.',
  'How did 口 get so big? It ate another 口 and became 回. Now it just goes round and round.',
  'What did 一 say to 二? You are twice the kanji I am.',
  'What did 二 say to 三? Stop showing off. It is only one more stroke.',
  'Why did 王 feel dropped? It lost a dot and could not become 玉, the jewel.',
  'Why is 犬 always ahead of 大? It has a spot it just cannot stop licking.',
  'What is the laziest kanji? 一. One stroke and it calls it a day.',
  'What did 上 say to 下? See you when I get back down.',
  'Why did the student bring a ladder to class? To read 高 properly.',
];
