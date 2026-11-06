// What the konbini and charm shops sell.
export interface Item { id: string; icon: string; name: string; en: string; price: number; town?: string; heal?: number; full?: boolean; open?: boolean; keep?: string; revive?: number }

export const ITEMS: Item[] = [
  { id: 'melon', icon: 'melon', name: 'メロンパン', en: 'melon bread', price: 30, heal: 15 },
  { id: 'rice', icon: 'rice', name: 'おにぎり', en: 'rice ball', price: 50, heal: 30 },
  { id: 'soda', icon: 'soda', name: 'ラムネ', en: 'ramune soda', price: 70, heal: 45 },
  { id: 'tea', icon: 'teacup', name: 'お茶', en: 'tea', price: 120, heal: 80 },
  // Each town's own treat, a little better value than the everyday food.
  { id: 'mochi', icon: 'sakuramochi', name: '桜餅', en: 'sakura mochi, town special', price: 60, town: 'village', heal: 40 },
  { id: 'ayu', icon: 'ayu', name: '鮎の塩焼き', en: 'grilled sweetfish, town special', price: 90, town: 'kawabe', heal: 60 },
  { id: 'egg', icon: 'onsenegg', name: '温泉たまご', en: 'hot-spring egg, town special', price: 100, town: 'onsen', heal: 70 },
  { id: 'dango', icon: 'dango', name: '三色団子', en: 'tri-colour dango, town special', price: 150, town: 'castle', heal: 110 },
  { id: 'bento', icon: 'bento', name: '弁当', en: 'bento', price: 300, full: true },
  { id: 'magazine', icon: 'magazine', name: '雑誌', en: 'joke magazine', price: 20, keep: 'Joke magazine' },
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

// The kombini's manga rack. Each town sells the next volume of every series, so the stories carry on as you travel.
const TOWNS = ['village', 'kawabe', 'onsen', 'castle'];
const SERIES = [
  { icon: 'threepieces', title: 'Three Pieces', volumes: [
    "It's a manga about pirates who like to eat fruit.",
    'The captain tries a vegetable. The crew is shaken, and a mutiny begins.',
    'They reach the legendary treasure island at last. The treasure is a fruit salad.',
    'Final volume! The true treasure was the friends they ate fruit with along the way.',
  ] },
  { icon: 'dragonbox', title: 'Dragon Box', volumes: [
    'I heard if you collect the boxes you get to call a dragon.',
    'They find six boxes. The seventh is in the attic, full of Christmas decorations.',
    'The dragon finally appears. It asks if anyone kept the receipt.',
    'Final volume! With one wish left, the heroes ask for more shelves.',
  ] },
  { icon: 'snacktitan', title: 'Snack on Titan', volumes: [
    'Giants climb over the wall. All they want is your crisps.',
    'The wall is rebuilt, twice as tall. The giants come back with a ladder.',
    'A shocking twist! One of the soldiers is a giant, and he just wanted the cheese puffs.',
    'Final volume! Humans and giants sign a peace treaty over one family-size bag.',
  ] },
  { icon: 'demonlaundry', title: 'Demon Laundry', volumes: [
    'A boy takes up the ancient art of getting evil out of whites.',
    'He trains in the mountains to master the Breath of the Spin Cycle.',
    'The Demon Lord arrives. His cape says dry clean only. Our hero is powerless.',
    'Final volume! Evil is washed away forever. One sock is still missing.',
  ] },
  { icon: 'deathnotepad', title: 'Death Notepad', volumes: [
    'Anyone whose name is written in it must attend the Monday meeting.',
    'A brilliant detective closes in, and proves the meeting could have been an email.',
    'The meeting moves to Tuesday. Nobody is safe.',
    'Final volume! He writes his own name by mistake. At least there are biscuits.',
  ] },
  { icon: 'heroaccounts', title: 'My Hero Accountancy', volumes: [
    'Everyone has superpowers. Someone still has to file the taxes.',
    'A new villain appears, claiming his secret lair as a home office.',
    'Tournament arc! The strongest heroes fight to the end over a ¥40 receipt.',
    'Final volume! The world is saved. The paperwork takes three more years.',
  ] },
  { icon: 'sailornoon', title: 'Sailor Noon', volumes: [
    'She fights evil, but only until lunchtime.',
    'Her greatest enemy strikes at 12:01. He knows her schedule.',
    'She meets Sailor Midnight, who works nights. They mostly leave each other notes.',
    'Final volume! Her lunch break is cancelled. Evil has made a terrible mistake.',
  ] },
  { icon: 'huntergatherer', title: 'Hunter x Gatherer', volumes: [
    'Two friends search the world for berries. Then they find agriculture.',
    'They invent the fence. Their friendship is tested.',
    'The Farmer Exam begins. Only one in a hundred can name every berry.',
    'Final volume! They find the last berry on earth, and open a jam shop.',
  ] },
];
export const MANGA = SERIES.flatMap((m) => m.volumes.map((note, i) => ({
  icon: m.icon, note, town: TOWNS[i], name: i ? `${m.title} #${i + 1}` : m.title, en: `manga, volume ${i + 1}`, price: 80,
})));
export const mangaIn = (town: string) => MANGA.filter((m) => m.town === town);

// What each thing in the Collection looks like, and what you notice when you pick it up.
export interface Keepsake { icon: string; jp: string; en?: string; tint?: string; note: string }
export const KEEPSAKES: Record<string, Keepsake> = {
  'Kanji Bear plushie': { icon: 'plush', jp: 'ぬいぐるみ', note: 'Soft, round and very wise. It smells faintly of ink.' },
  'Joke magazine': { icon: 'magazine', jp: '雑誌', note: '' },
  'Mini Kanji Bear plushie': { icon: 'miniplush', jp: 'ミニぬいぐるみ', note: 'Small enough for a pocket. It still looks disappointed in your handwriting.' },
  '火 keychain': { icon: 'keychain', jp: '火', tint: '#e0483e', note: 'Warm to the touch. Probably just your pocket.' },
  '水 keychain': { icon: 'keychain', jp: '水', tint: '#4aa6ee', note: 'It sloshes when you shake it. Nobody knows why.' },
  '木 keychain': { icon: 'keychain', jp: '木', tint: '#74bf48', note: 'It smells a little like a forest.' },
  'Tiny Miko figure': { icon: 'mikofig', jp: '巫女', note: 'Hold it up and you feel slightly more rested.' },
  'Tiny Aoi figure': { icon: 'aoifig', jp: '葵', note: 'Even as a figure, it looks like it is judging you.' },
  'Rice ball eraser': { icon: 'rice', jp: '消しゴム', note: 'Do not eat it. You have checked.' },
  'Melon bread eraser': { icon: 'melon', jp: '消しゴム', note: 'It smells delicious. It tastes like an eraser.' },
  'Sparkly 一 sticker': { icon: 'sticker', jp: '一', tint: '#ff8ab0', note: 'One stroke, a thousand sparkles.' },
  'Golden 金 sticker': { icon: 'sticker', jp: '金', tint: '#ffd23f', note: 'Worth nothing, which is ironic.' },
  'Lucky cat charm': { icon: 'cat', jp: '招き猫', note: 'It waves at you. You wave back. Nobody saw.' },
  'Pocket torii gate': { icon: 'torii', jp: '鳥居', note: 'You can walk through it, if you are very small.' },
  ...Object.fromEntries(MANGA.map((m) => [m.name, { icon: m.icon, jp: m.name, en: m.en, note: `${m.name}: ${m.note}` }])),
};

// A town's shelf: the two everyday charms, plus its own special one.
export const charmsIn = (town: string) => CHARMS.filter((c) => !c.town || c.town === town);

// Ink is sold by the charm makers, and everything else at the 6-7 Kombini.
export const INKWELL = ITEMS.filter((i) => i.revive);
export const shelfIn = (town: string) => ITEMS.filter((i) => !i.revive && (!i.town || i.town === town));

// How much health an item would really restore.
export const revived = (item: Item, max: number) => Math.ceil(max * (item.revive ?? 0));
export const healed = (item: Item, hp: number, max: number) => (item.full ? max - hp : Math.min(item.heal ?? 0, max - hp));

// Defeated kanji drop a little loose change, ¥5 to ¥40.
export const yenFor = () => 5 + Math.floor(Math.random() * 36);

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
