// Everything the story is made of: no drawing or input, so it can be checked by tests.
export type LevelId = 'N5' | 'N4' | 'N3';

// Each wild area teaches one themed set of kanji. Together they hold every N5, N4 and N3 kanji exactly once.
export const POOLS: Record<string, string> = {
  fields: '一二三四五六七八九十百千万円山川水火木土金雨天日月',
  kawabe: '人男女子父母友生学校先名年本書読語話聞見食何大小高長白気休',
  forest: '上下左右中外前後東西南北今時間午半毎来行出入国電車',
  pass: '春夏秋冬赤青黒色空海風花鳥犬魚牛夕朝昼夜田野地洋音歌明早新古多少広近強力場京道方',
  onsen: '手足目耳口体心兄弟姉妹親家族茶肉飯飲味料医病院死服着住屋室館堂旅安起待歩走帰楽',
  castle: '立正文町字会同自社通言理作用公思教元考画売知計台工止切店答買図週紙曜事発者業員開問代動主題意度持世界重集物使品始運終真有急送転研究銀仕去写注悪習駅勉漢不以別特建試験英借質貸私映',
  // N3: the sea road, from the shore below the castle out to the cape where ink is made.
  coast: '石草米原光馬船遠晴雪鳴葉落横深港路登速曲泳寒陽昔暗流飛浮渡越降吹煙景候種果冷熱静散頂途到遊球投打追逃戻返向進乗引回放消平和園庭猫靴活満太直当',
  minato: '市商客宿薬酒箱具産費給利得財富貧値払収割資件務職労働勤役係局官政治制規法権民都部科組号番数点席列位段格類等式便機内所側宅居窓杯済供配取受与',
  bamboo: '王君夫妻婦娘彼祖老若師徒首頭顔歯指背腹髪息声感想情愛悲喜笑怒恐怖苦痛疲眠寝夢幸福美優恥忙困迷欲望願念好良偉才能命神礼育助抱座吸洗忘覚慣努',
  matsuri: '記談議論説告報伝申呼招訪迎約束信頼許認賛否疑確判断決定選解調表示演舞絵形面化変合交共互相対反関連続参加増婚様御皆他両次予期初末昨晩暮歳刻際辞',
  cape: '戦争勝負敗守破倒突捕盗犯罪殺害危険難易警察責任限絶退残失亡欠余過最必要常非未然由因状程在存現実全完成達積更単幾偶緒込掛付置抜押折閉誤違似差例適備構術精識観探留求寄除処容経性支雑遅',
};

export interface Duel { team: string[]; lv: number }
export interface Read { q: string; a: string; wrong: string[]; why: string }
export type Task =
  | { catch: string[] }
  | { count: number }
  | { deliver: string }
  | { read: Read[] }
  | { beat: Duel };

export interface Quest {
  id: string; title: string; giver: string; where: string; level?: LevelId; after?: string;
  task: Task; offer: string[]; wait: string; done: string[]; charms?: number;
}

export interface Level { id: LevelId; land: string; master: string; team: string[]; lv: number; need: number; win: string[] }
export const LEVELS: Level[] = [
  { id: 'N5', land: 'the Cedar Forest', master: 'Cedar Master', team: ['山', '雨', '電'], lv: 14, need: 40, win: ['You read the forest as well as I do. The mountain road is yours.', 'One warning. The further you climb, the blanker the world becomes. Something up there is wrong.'] },
  { id: 'N4', land: 'Castle Town', master: 'Castle Scribe', team: ['海', '強', '験'], lv: 26, need: 80, win: ['Then it is true. You can read what the rest of Japan has forgotten.', 'The Great Inkstone cracked, and every kanji in the land woke and fled. With what you have learned, I can write its seal again.'] },
  { id: 'N3', land: 'Inkstone Cape', master: 'Inkstone Keeper', team: ['石', '難', '識'], lv: 46, need: 120, win: ['You ground the ink with your own hands, and read every line of the old recipe. The seal will hold.', 'Here is what the Scribe would not say. The Great Inkstone was never struck. It dried out. Each year fewer people ground ink and wrote by hand, and a stone nobody uses will split.', 'So the mending was never mine to do, nor the Scribe\'s. It belongs to everyone who picks up a brush. Keep reading, keep writing, and the stone will not crack again.'] },
];
// Lands still to come would be listed here. For now the story ends at Inkstone Cape.
export const CLOSED: string[] = [];

// Main missions run in this order. Side missions name what they follow.
export const QUESTS: Quest[] = [
  {
    id: 'first', title: 'The blank signs', giver: 'Kanji Bear', where: "Kanji Bear's dojo", level: 'N5', task: { count: 3 },
    offer: [], wait: 'Catch 3 kanji in the Rice Fields, then come back to the dojo.',
    done: ['You catch them gently. That is rare.', 'The signs you pass stay blank until you catch the kanji that left them. Read them as you go. They will teach you more than I can.', 'Go and see the farmer. The rice fields have lost their records.'], charms: 3,
  },
  {
    id: 'farmer', title: "The farmer's count", giver: 'Farmer', where: 'the Rice Fields', level: 'N5', task: { catch: ['一', '二', '三'] },
    offer: ['Every sack in my barn had a number on it. Now they are all blank!', 'Find 一, 二 and 三 for me. Then I can start counting again.'], wait: 'Bring me 一, 二 and 三.',
    done: ['Ha! There they are. Three strokes for three. Numbers are the kindest kanji.', 'The bridge to Kawabe was shut until the harvest was counted. It is open now.'], charms: 3,
  },
  {
    id: 'letter', title: "Mom's letter", giver: 'Mom', where: 'Home', level: 'N5', task: { deliver: 'Teacher' },
    offer: ['Haru, you came home! Are you eating properly?', 'Please take this letter to the teacher at Kawabe school. We were classmates, a long time ago.'], wait: 'Take the letter to the Teacher at Kawabe school.',
    done: ['A letter from your mother! She always wrote the neatest kanji in class.', 'She says you are stubborn and kind. I can use both.'],
  },
  {
    id: 'roll', title: 'Roll call', giver: 'Teacher', where: 'Kawabe school', level: 'N5', task: { catch: ['男', '女', '子', '友'] },
    offer: ['My register has gone blank. I cannot tell who is who!', 'Catch 男, 女, 子 and 友 by the river, and the register will fill in again.'], wait: 'Catch 男, 女, 子 and 友 on the Kawabe riverbank.',
    done: ['Wonderful. The register is full again.'], charms: 3,
  },
  {
    id: 'rival1', title: 'Aoi on the road', giver: 'Aoi', where: 'Kawabe Town', level: 'N5', task: { beat: { team: ['見', '話'], lv: 11 } },
    offer: ['So you are Haru, the new student. I am Aoi, and I have studied with Kanji Bear for three years.', 'Catching kanji one at a time will take forever. Let me see if you are any good.'], wait: 'Ready for another try?',
    done: ['Not bad. Still, I am heading for the source of all this. Try to keep up.'],
  },
  {
    id: 'market', title: 'Market day', giver: 'Stall keeper', where: 'Kawabe Town', level: 'N5', task: { catch: ['百', '千', '円'] },
    offer: ['My price tags are empty! I sold a teapot for almost nothing this morning.', 'Bring me 百, 千 and 円, then help me read the tags.'], wait: 'Bring me 百, 千 and 円 from the Rice Fields.',
    done: ['You saved my shop! Take these charms.'], charms: 5,
  },
  {
    id: 'lost', title: 'Lost in the cedars', giver: 'Lost child', where: 'the Cedar Forest', level: 'N5', task: { catch: ['東', '西', '南', '北'] },
    offer: ['The signposts are blank and I cannot find the way home!', 'If you find 東, 西, 南 and 北, maybe the signs will point again.'], wait: 'Catch 東, 西, 南 and 北 in the Cedar Forest.',
    done: ['I can see the way home now. Thank you!'], charms: 3,
  },
  {
    id: 'rival2', title: 'Aoi in the forest', giver: 'Aoi', where: 'the Cedar Forest', level: 'N5', task: { beat: { team: ['国', '電', '車'], lv: 14 } },
    offer: ['You again? I found something. Every blank sign points the same way: up the mountain.', 'Prove you are ready for it.'], wait: 'Back for more?',
    done: ['You really are getting stronger. Pass the Cedar Master, and I will see you on the mountain.'],
  },
  {
    id: 'seasons', title: 'The four seasons', giver: 'Mountain guardian', where: 'the Mountain Pass', level: 'N4', task: { catch: ['春', '夏', '秋', '冬'] },
    offer: ['Halt. The seasons have fled the mountain, and it no longer knows spring from winter.', 'Bring back 春, 夏, 秋 and 冬, and I will open the road east.'], wait: 'Bring me 春, 夏, 秋 and 冬.',
    done: ['The mountain remembers. Pass, student of the bear.'], charms: 5,
  },
  {
    id: 'menu', title: "The inn's menu", giver: 'Innkeeper', where: 'the Onsen inn', level: 'N4', task: { catch: ['魚', '肉', '茶', '飯'] },
    offer: ['Welcome! I am sorry, but my menu is blank, and my guests are hungry.', 'Could you find 魚, 肉, 茶 and 飯? Then help me take the orders.'], wait: 'Catch 魚, 肉, 茶 and 飯. Fish lives on the pass, the rest in Onsen valley.',
    done: ['Dinner is saved. Stay as long as you like.'], charms: 5,
  },
  {
    id: 'family', title: 'A family photo', giver: 'Grandmother', where: 'the Onsen inn', level: 'N4', task: { catch: ['兄', '弟', '姉', '妹'] },
    offer: ['The names on the back of my old photo have faded. I had four grandchildren, you know.', 'Find 兄, 弟, 姉 and 妹 for me, dear.'], wait: 'Catch 兄, 弟, 姉 and 妹 in Onsen valley.',
    done: ['That is them. Thank you, dear.'], charms: 3,
  },
  {
    id: 'doctor', title: "Doctor's orders", giver: 'Doctor', where: 'Onsen Town', level: 'N4', task: { catch: ['医', '病', '院'] },
    offer: ['A traveller collapsed on the road, and nobody can read the way to my clinic.', 'Catch 医, 病 and 院 so the signs work again. The road to Castle Town stays shut until then.'], wait: 'Catch 医, 病 and 院 in Onsen valley.',
    done: ['Correct. The traveller will be fine, and the castle road is open.'], charms: 3,
  },
  {
    id: 'rival3', title: 'Aoi at the spring', giver: 'Aoi', where: 'Onsen Town', level: 'N4', task: { beat: { team: ['鳥', '海', '力'], lv: 21 } },
    offer: ['I went up alone, and I could not read a single thing up there.', 'I have been rushing for three years. Fight me properly, so I can see what I missed.'], wait: 'Once more.',
    done: ['You stopped to read every sign, did you not? I never did.'],
  },
  {
    id: 'station', title: 'The last train', giver: 'Stationmaster', where: 'Castle Town', level: 'N4', task: { catch: ['駅', '発', '着'] },
    offer: ['My timetable is blank, and the whole town is late!', 'Catch 駅, 発 and 着 around the castle, then help me read it.'], wait: 'Catch 駅, 発 and 着 near the castle.',
    done: ['All aboard! The town is moving again.'], charms: 5,
  },
  {
    id: 'rival4', title: 'Aoi at the gate', giver: 'Aoi', where: 'Castle Town', level: 'N4', task: { beat: { team: ['意', '動', '真'], lv: 25 } },
    offer: ['The Castle Scribe knows why this happened, and will only speak to someone who can read.', 'One last match. Then you go in, for both of us.'], wait: 'One last match.',
    done: ['Go on, Haru. And thanks. I think I will start again from N5.'],
  },
  {
    id: 'ink', title: 'Thin ink', giver: 'Castle Scribe', where: 'Castle hall', level: 'N3', task: { read: [
      { q: 'The Scribe points at the map: 海の道. Which road is that?', a: 'the sea road', wrong: ['the mountain road', 'the castle road', 'the forest road'], why: '海 is sea and 道 is road.' },
      { q: 'Past the town the map says 東の港. What is waiting in the east?', a: 'a harbour', wrong: ['a temple', 'a bridge', 'a school'], why: '東 is east. 港 is harbour, and you will meet it on the road.' },
    ] },
    offer: ['I wrote the seal, and by morning it had faded. My ink is too thin to hold a land full of kanji.', 'True ink is ground in one place only: Inkstone Cape, at the end of the sea road. Let me show you the way on the map.'], wait: 'Shall we look at the map again?',
    done: ['Good. The sea gate below the castle is open to you now.', 'Aoi left by that road a week ago, starting again from the very first kanji. You may catch up.'], charms: 5,
  },
  {
    id: 'tide', title: 'The tide table', giver: 'Fisher', where: 'the Seaside Road', level: 'N3', task: { catch: ['船', '港', '泳'] },
    offer: ['The tide table on my boat is blank. I nearly sailed onto the rocks this morning!', 'Catch 船, 港 and 泳 along the shore. The harbour gate stays shut while nobody can read the tides.'], wait: 'Catch 船, 港 and 泳 on the Seaside Road.',
    done: ['High tide at six. I can read it again!', 'Tell the harbour master the boats are coming in.'], charms: 5,
  },
  {
    id: 'rival5', title: 'Aoi by the sea', giver: 'Aoi', where: 'the Seaside Road', level: 'N3', task: { beat: { team: ['晴', '速', '船'], lv: 30 } },
    offer: ['Haru! I did it. I went back to 一 and read every sign from the village to the castle.', 'It took a month. I have never been so happy to be slow. Want to see what I learned?'], wait: 'Again? Gladly.',
    done: ['Ha! You are still ahead. Good. I like having someone to chase.'],
  },
  {
    id: 'cargo', title: 'The harbour ledger', giver: 'Harbour master', where: 'Minato Harbour', level: 'N3', task: { catch: ['商', '客', '箱', '数'] },
    offer: ['Three ships in port, and my ledger is as blank as the fog. I cannot tell cargo from passengers.', 'Bring me 商, 客, 箱 and 数. They hide in the grass along the quay.'], wait: 'Catch 商, 客, 箱 and 数 around the harbour.',
    done: ['Every crate counted, every guest ashore.', 'The grove road is open. The cape lies beyond it, past the festival town.'], charms: 5,
  },
  {
    id: 'masks', title: 'The blank masks', giver: 'Bamboo cutter', where: 'the Bamboo Grove', level: 'N3', task: { catch: ['笑', '喜', '悲', '怒'] },
    offer: ['I carve the masks for the lantern festival. Look at them. Not one has a face left.', 'The feelings ran off into the bamboo. Find 笑, 喜, 悲 and 怒, or the dancers will have nothing to wear.'], wait: 'Catch 笑, 喜, 悲 and 怒 in the Bamboo Grove.',
    done: ['There. A laughing one, a crying one, and one that is very cross indeed.', 'Take the east path to Lantern Town. They will be glad to see these.'], charms: 5,
  },
  {
    id: 'festival', title: 'The festival programme', giver: 'Festival chief', where: 'Lantern Town', level: 'N3', task: { catch: ['舞', '演', '絵', '招'] },
    offer: ['The festival is tonight, and the programme is an empty sheet. Nobody knows when to dance!', 'Find 舞, 演, 絵 and 招 in the fields south of town.'], wait: 'Catch 舞, 演, 絵 and 招 around Lantern Town.',
    done: ['Light the lanterns! The festival is on.', 'The cape road is open, but mind yourself. The lighthouse has been dark for weeks.'], charms: 5,
  },
  {
    id: 'rival6', title: 'Aoi at the festival', giver: 'Aoi', where: 'Lantern Town', level: 'N3', task: { beat: { team: ['夢', '愛', '信'], lv: 39 } },
    offer: ['I asked the lantern makers about the Inkstone. Nobody here has ground ink in years. They buy it in bottles.', 'I think that matters. But first, one match, before the fireworks.'], wait: 'One more before the fireworks?',
    done: ['You read faster than I can think. Go on to the cape. I will follow the lanterns.'],
  },
  {
    id: 'storm', title: 'The dark lighthouse', giver: 'Coast guard', where: 'Inkstone Cape', level: 'N3', task: { catch: ['危', '険', '警', '守'] },
    offer: ['The warning boards along the cliff are bare, and the lamp is out. Ships cannot tell rock from open water.', 'Catch 危, 険, 警 and 守 before the next fog comes in.'], wait: 'Catch 危, 険, 警 and 守 on the cape.',
    done: ['Danger, warning, guard. Every board reads true again.', 'The keeper will see you now. Nobody else has got this far.'], charms: 5,
  },
  {
    id: 'rival7', title: 'Aoi at the lighthouse', giver: 'Aoi', where: 'Inkstone Cape', level: 'N3', task: { beat: { team: ['戦', '勝', '完'], lv: 43 } },
    offer: ['So this is where ink comes from. A quarry, a lamp and one old keeper.', 'Before you go in, give me everything. I want to know how far I still have to walk.'], wait: 'Everything you have, Haru.',
    done: ['That far, then. Good. Go and grind the ink. I will hold the lamp.'],
  },
  {
    id: 'payday', title: 'Payday', giver: 'Shipwright', where: 'Minato Harbour', after: 'cargo', task: { read: [
      { q: 'The pay slip says 給料. What is it?', a: 'salary', wrong: ['holiday', 'cargo', 'ticket'], why: '給 is to supply and 料 is a fee: the pay you are given.' },
      { q: 'The shop sign says 二割引. What does the shop offer?', a: '20% off', wrong: ['2 yen off', 'two for one', 'half price'], why: '割 is a tenth, so 二割 is two tenths, and 引 means pulled off the price.' },
      { q: 'What does 値段 mean?', a: 'price', wrong: ['stairs', 'weight', 'change'], why: '値 is value and 段 is step: the level of value, a price.' },
    ] },
    offer: ['My crew gets paid today and I cannot read a single slip. Help me?'], wait: 'Shall we go through the pay slips?', done: ['Everyone paid, and nobody short. Bless you.'], charms: 5,
  },
  {
    id: 'poem', title: "The poet's wish", giver: 'Old poet', where: 'the Bamboo Grove', after: 'masks', task: { read: [
      { q: 'The poem begins with 夢. What is it about?', a: 'a dream', wrong: ['a storm', 'a river', 'a journey'], why: '夢 means dream.' },
      { q: 'What does 幸福 mean?', a: 'happiness', wrong: ['sadness', 'a blessing of rain', 'good health'], why: '幸 is happiness and 福 is good fortune.' },
      { q: 'The last line says 愛情. What does the poet feel?', a: 'love', wrong: ['fear', 'anger', 'tiredness'], why: '愛 is love and 情 is feeling.' },
    ] },
    offer: ['I wrote a poem for my wife fifty years ago. Now I cannot read my own hand. Would you?'], wait: 'Shall we read the poem?', done: ['Yes. That is what I wrote. That is exactly what I meant.'], charms: 5,
  },
  {
    id: 'fortune', title: 'Paper fortunes', giver: 'Fortune teller', where: 'Lantern Town', after: 'festival', task: { read: [
      { q: 'Your fortune says 約束. What must you keep?', a: 'a promise', wrong: ['a secret', 'a lantern', 'your money'], why: '約 and 束 both mean to bind: a promise.' },
      { q: 'It warns of 失敗. What should you watch out for?', a: 'failure', wrong: ['rain', 'a stranger', 'the sea'], why: '失 is to lose and 敗 is defeat.' },
      { q: 'The last line says 成功. How does it end?', a: 'with success', wrong: ['with a journey', 'with a wedding', 'with a storm'], why: '成 is to become and 功 is achievement: success.' },
    ] },
    offer: ['Every fortune in my box has gone blank. Draw one, and let us read it together.'], wait: 'Draw a fortune?', done: ['A promise kept, a stumble, and success at the end. A fine fortune.'], charms: 5,
  },
  {
    id: 'calendar', title: 'The shrine calendar', giver: 'Miko', where: 'Sakura Village', after: 'farmer', task: { read: [
      { q: 'The shrine calendar says 月曜日. Which day is that?', a: 'Monday', wrong: ['Friday', 'Sunday', 'Tuesday'], why: '月 is the moon, so 月曜日 is moon day, Monday.' },
      { q: 'The festival is on 土曜日. Which day is that?', a: 'Saturday', wrong: ['Wednesday', 'Thursday', 'Monday'], why: '土 is soil, so 土曜日 is earth day, Saturday.' },
      { q: 'We rest on 日曜日. Which day is that?', a: 'Sunday', wrong: ['Tuesday', 'Saturday', 'Friday'], why: '日 is the sun, so 日曜日 is sun day, Sunday.' },
    ] },
    offer: ['Could you help? I need to rewrite the shrine calendar for this month.'], wait: 'Shall we go through the calendar?', done: ['Thank you. The festival will happen on the right day after all.'], charms: 3,
  },
  {
    id: 'birds', title: 'Bird watching', giver: 'Hiker', where: 'the Mountain Pass', after: 'seasons', task: { catch: ['鳥', '空', '風'] },
    offer: ['My field notes have gone blank! Find 鳥, 空 and 風 and I can write them again.'], wait: 'Catch 鳥, 空 and 風 on the pass.', done: ['Bird, sky and wind. A perfect morning on paper.'], charms: 5,
  },
  {
    id: 'exam', title: 'The school exam', giver: 'Librarian', where: 'Castle Town', after: 'station', task: { read: [
      { q: 'What does 図書館 mean?', a: 'library', wrong: ['hospital', 'station', 'restaurant'], why: '図 map, 書 write, 館 building: a building of books.' },
      { q: 'What does 銀行 mean?', a: 'bank', wrong: ['silver mine', 'road', 'shop'], why: '銀 silver and 行 go: where money goes.' },
      { q: 'What does 映画 mean?', a: 'movie', wrong: ['painting', 'mirror', 'letter'], why: '映 reflect and 画 picture: a picture on a screen.' },
    ] },
    offer: ['The library needs readers. Pass my little exam?'], wait: 'Ready for the exam?', done: ['Top marks! The library is proud of you.'], charms: 5,
  },
];

// Extra reading that each mission does when it is handed in.
export const CHECKS: Record<string, Read[]> = {
  farmer: [{ q: 'This sack says 三. How many sacks are in the row?', a: '3', wrong: ['1', '2', '10'], why: '三 has three strokes, and means three.' }],
  roll: [
    { q: 'What does 女の子 mean?', a: 'girl', wrong: ['boy', 'friend', 'teacher'], why: '女 is woman and 子 is child.' },
    { q: 'Who is your 友?', a: 'your friend', wrong: ['your father', 'your teacher', 'your child'], why: '友 means friend.' },
  ],
  market: [
    { q: 'The tag says 三百円. How much is that?', a: '300 yen', wrong: ['30 yen', '3,000 yen', '30,000 yen'], why: '三 three and 百 hundred make 300.' },
    { q: 'Which tag costs the most?', a: '五千円', wrong: ['五百円', '九百円', '千円'], why: '五千 is five thousand, more than any of the others.' },
    { q: 'The tag says 二千五百円. How much is that?', a: '2,500 yen', wrong: ['250 yen', '25,000 yen', '2,005 yen'], why: '二千 is 2,000 and 五百 is 500.' },
  ],
  lost: [
    { q: 'The child lives where the sun rises. Which sign do you follow?', a: '東', wrong: ['西', '南', '北'], why: '東 is east, where the sun rises.' },
    { q: 'The sign says 北へ. Which way does it point?', a: 'north', wrong: ['south', 'east', 'west'], why: '北 means north.' },
  ],
  menu: [
    { q: 'A guest wants grilled fish. Which do you write?', a: '魚', wrong: ['肉', '茶', '飯'], why: '魚 is fish. Its lower strokes began as a tail.' },
    { q: 'What is お茶?', a: 'tea', wrong: ['rice', 'meat', 'water'], why: '茶 means tea.' },
    { q: 'Which word means a meal in the morning?', a: '朝ご飯', wrong: ['昼ご飯', '夕飯', '肉'], why: '朝 is morning and ご飯 is a meal.' },
  ],
  family: [
    { q: 'Which one is an older sister?', a: '姉', wrong: ['妹', '兄', '弟'], why: '姉 is older sister and 妹 is younger sister.' },
    { q: 'Which one is a younger brother?', a: '弟', wrong: ['兄', '姉', '妹'], why: '弟 is younger brother and 兄 is older brother.' },
  ],
  doctor: [
    { q: 'Where do you take a sick traveller?', a: '病院', wrong: ['銀行', '駅', '学校'], why: '病 illness and 院 institution make hospital.' },
    { q: 'Who works there?', a: '医者', wrong: ['学生', '店員', '先生'], why: '医者 means doctor.' },
  ],
  tide: [
    { q: 'The table says 満. What is the tide doing?', a: 'It is full', wrong: ['It is out', 'It is frozen', 'It is quiet'], why: '満 means full, as in 満ち潮, high tide.' },
    { q: 'A red flag says 遊泳禁止. What must you not do?', a: 'swim', wrong: ['fish', 'run', 'sail'], why: '泳 is to swim, and 禁止 means forbidden.' },
  ],
  cargo: [
    { q: 'The ledger says 客船. What kind of ship is it?', a: 'a passenger ship', wrong: ['a fishing boat', 'a cargo ship', 'a warship'], why: '客 is guest and 船 is ship.' },
    { q: 'A crate is stamped 商品. What is inside?', a: 'goods for sale', wrong: ['letters', 'a gift', 'rubbish'], why: '商 is trade and 品 is goods.' },
  ],
  masks: [
    { q: 'Which mask is laughing?', a: '笑', wrong: ['悲', '怒', '恐'], why: '笑 means laugh. Its top is bamboo, swaying as if with laughter.' },
    { q: 'What does 喜ぶ mean?', a: 'to be glad', wrong: ['to be angry', 'to be sad', 'to be afraid'], why: '喜 means rejoice.' },
  ],
  festival: [
    { q: 'The programme says 舞台. Where do the dancers go?', a: 'the stage', wrong: ['the shrine', 'the harbour', 'the kitchen'], why: '舞 is dance and 台 is a stand: a stage.' },
    { q: 'You are handed a 招待. What is it?', a: 'an invitation', wrong: ['a bill', 'a map', 'a warning'], why: '招 is to invite and 待 is to wait for a guest.' },
  ],
  storm: [
    { q: 'The board says 危険. What does it tell you?', a: 'Danger', wrong: ['Welcome', 'Exit', 'Quiet'], why: '危 and 険 both mean danger.' },
    { q: 'Who wears a badge that says 警察?', a: 'the police', wrong: ['a doctor', 'a teacher', 'a sailor'], why: '警 is to warn and 察 is to look into: the police.' },
  ],
  station: [
    { q: 'The board says 九時発. What happens at nine?', a: 'The train departs', wrong: ['The train arrives', 'The station closes', 'Lunch begins'], why: '発 means depart.' },
    { q: 'The board says 十時半着. When does it arrive?', a: '10:30', wrong: ['10:00', '11:30', '1:30'], why: '半 is half, and 着 means arrive.' },
  ],
};

// Signs stay blank until their kanji is caught.
export interface Sign { map: string; x: number; y: number; k: string; word: string; en: string }
export const SIGNS: Sign[] = [
  { map: 'village', x: 13, y: 11, k: '東', word: '東', en: 'East: the Rice Fields' },
  { map: 'village', x: 10, y: 4, k: '学', word: '学ぶ', en: "Learn here: Kanji Bear's dojo" },
  { map: 'village', x: 6, y: 6, k: '水', word: '水', en: 'Water: the village well' },
  { map: 'fields', x: 8, y: 11, k: '川', word: '川', en: 'River: mind your step' },
  { map: 'fields', x: 19, y: 11, k: '田', word: '田んぼ', en: 'Rice paddy: private' },
  { map: 'fields', x: 3, y: 11, k: '山', word: '山', en: 'Mountains ahead' },
  { map: 'kawabe', x: 7, y: 7, k: '校', word: '学校', en: 'School' },
  { map: 'kawabe', x: 15, y: 7, k: '本', word: '本', en: 'Books for sale' },
  { map: 'kawabe', x: 20, y: 8, k: '大', word: '大通り', en: 'Main street' },
  { map: 'forest', x: 12, y: 8, k: '左', word: '左', en: 'Left: Kawabe' },
  { map: 'forest', x: 10, y: 11, k: '右', word: '右', en: 'Right: the mountain' },
  { map: 'forest', x: 15, y: 8, k: '入', word: '入口', en: 'Entrance' },
  { map: 'pass', x: 12, y: 8, k: '道', word: '山道', en: 'Mountain road' },
  { map: 'pass', x: 20, y: 11, k: '風', word: '強風', en: 'Strong wind' },
  { map: 'onsen', x: 13, y: 7, k: '旅', word: '旅館', en: 'Inn' },
  { map: 'onsen', x: 8, y: 7, k: '家', word: '家', en: 'Houses' },
  { map: 'onsen', x: 21, y: 7, k: '止', word: '止まれ', en: 'Stop' },
  { map: 'castle', x: 9, y: 8, k: '町', word: '町', en: 'Town' },
  { map: 'castle', x: 15, y: 8, k: '駅', word: '駅', en: 'Station' },
  { map: 'castle', x: 5, y: 8, k: '店', word: '店', en: 'Shops' },
  { map: 'coast', x: 12, y: 8, k: '港', word: '港', en: 'Harbour: east' },
  { map: 'coast', x: 4, y: 8, k: '泳', word: '泳ぐな', en: 'No swimming' },
  { map: 'minato', x: 7, y: 8, k: '市', word: '市場', en: 'Market' },
  { map: 'minato', x: 13, y: 8, k: '船', word: '船', en: 'Ships' },
  { map: 'bamboo', x: 9, y: 8, k: '静', word: '静かに', en: 'Quiet, please' },
  { map: 'matsuri', x: 7, y: 8, k: '神', word: '神社', en: 'Shrine' },
  { map: 'matsuri', x: 15, y: 8, k: '遊', word: '遊び場', en: 'Games' },
  { map: 'cape', x: 10, y: 8, k: '危', word: '危険', en: 'Danger: cliffs' },
  { map: 'cape', x: 16, y: 4, k: '頂', word: '頂上', en: 'Summit' },
];

// Kanji the active missions are hunting, until each one is caught.
export const lured = (active: string[], caught: string[]) => QUESTS.filter((q) => active.includes(q.id)).flatMap((q) => ('catch' in q.task ? q.task.catch : [])).filter((k) => !caught.includes(k));
