import { toRomaji } from 'wanakana';
import type { Kanji } from './kanji';

// The reading most learners know each N5 to N2 kanji by, where the rule below would pick a rarer one. Dictionaries list the oldest first, which is often rare: 百 is momo there, but hyaku to everyone.
export const COMMON: Record<string, string> = Object.fromEntries(`
日 nichi 一 ichi 人 hito 年 nen 大 dai 十 juu 二 ni 本 hon 中 naka 出 deru 三 san 見 miru 月 tsuki 生 sei 五 go 上 ue 四 yon 金 kin 九 kyuu 入 hairu 学 gaku
円 en 子 ko 八 hachi 六 roku 下 shita 気 ki 小 chiisai 七 nana 山 yama 女 onna 百 hyaku 先 sen 名 na 川 kawa 千 sen 水 mizu 男 otoko 校 kou 土 tsuchi 木 ki 車 kuruma
白 shiro 天 ten 火 hi 右 migi 左 hidari 休 yasumu 雨 ame 国 kuni 長 nagai 時 ji 行 iku 後 ato 前 mae 間 aida 東 higashi 今 ima 高 takai 外 soto 来 kuru 話 hanasu
北 kita 午 go 書 kaku 半 han 西 nishi 電 den 語 go 聞 kiku 食 taberu 何 nani 南 minami 万 man 毎 mai 母 haha 読 yomu 友 tomo 父 chichi 立 tatsu 手 te 力 chikara
目 me 田 ta 正 tadashii 文 bun 口 kuchi 町 machi 空 sora 足 ashi 早 hayai 字 ji 音 oto 花 hana 赤 aka 青 ao 夕 yuu 犬 inu 会 kai 同 onaji 自 ji 社 sha 地 chi
方 hou 新 atarashii 場 ba 明 akarui 京 kyou 通 tooru 言 iu 理 ri 体 karada 作 tsukuru 用 you 強 tsuyoi 公 kou 野 no 思 omou 家 ie 多 ooi 心 kokoro 教 oshieru
元 gen 近 chikai 考 kangaeru 画 ga 海 umi 売 uru 知 shiru 道 michi 計 kei 朝 asa 台 dai 広 hiroi 少 sukoshi 工 kou 止 tomaru 切 kiru 楽 tanoshii 店 mise 親 oya
答 kotae 夜 yoru 帰 kaeru 古 furui 歌 uta 買 kau 図 zu 週 shuu 室 shitsu 歩 aruku 風 kaze 紙 kami 黒 kuro 春 haru 色 iro 走 hashiru 秋 aki 夏 natsu 曜 you 肉 niku
鳥 tori 冬 fuyu 昼 hiru 茶 cha 弟 otouto 牛 ushi 魚 sakana 兄 ani 妹 imouto 姉 ane 事 koto 発 hatsu 者 sha 業 gyou 員 in 開 hiraku 問 mon 代 dai 動 ugoku 主 shu
題 dai 意 i 度 do 持 motsu 世 se 安 yasui 院 in 界 kai 重 omoi 集 atsumaru 物 mono 使 tsukau 品 hin 死 shinu 始 hajimeru 運 un 終 owaru 住 sumu 真 shin 有 yuu
急 kyuu 送 okuru 転 ten 研 ken 究 kyuu 起 okiru 着 kiru 病 byou 待 matsu 族 zoku 銀 gin 医 i 仕 shi 去 kyo 味 aji 写 sha 注 chuu 悪 warui 館 kan 屋 ya 習 narau
駅 eki 洋 you 旅 tabi 服 fuku 飲 nomu 勉 ben 漢 kan 不 fu 以 i 別 betsu 特 toku 料 ryou 建 tateru 試 shi 験 ken 英 ei 借 kariru 堂 dou 飯 han 質 shitsu 貸 kasu
私 watashi 映 ei 耳 mimi
石 ishi 合 au 米 kome 組 kumi 引 hiku 直 choku 絵 e 頭 atama 太 futoi 園 en 遠 tooi 鳴 naku 対 tai 相 sou 実 jitsu 取 toru 都 to 受 ukeru 向 mukau 感 kan 投 nageru
打 utsu 消 kesu 乗 noru 落 ochiru 負 makeru 由 yuu 追 ou 助 tasukeru 深 fukai 登 noboru 速 hayai 返 kaesu 遊 asobu 悲 kanashii 暗 kurai 寒 samui 最 sai 要 you
続 tsuzuku 初 hajime 共 tomo 位 kurai 置 oku 付 tsuku 残 nokoru 然 zen 好 suki 末 sue 良 yoi 単 tan 冷 tsumetai 努 do 静 shizuka 喜 yorokobu 徒 to 覚 oboeru 折 oru
現 gen 増 fueru 易 yasashii 適 teki 余 yo 居 iru 迷 mayou 慣 nareru 割 wari 難 muzukashii 若 wakai 値 ne 否 hi 降 furu 危 abunai 背 se 困 komaru 痛 itai 閉 shimeru
暮 kurasu 吸 suu 洗 arau 与 ataeru 違 chigau 捕 tsukamaeru 迎 mukaeru 頼 tanomu 倒 taoreru 払 harau 遅 osoi 更 sara 抱 daku 恐 kowai 戻 modoru 逃 nigeru 掛 kakeru
寝 neru 盗 nusumu 御 go 怒 okoru 杯 hai 疲 tsukareru 眠 nemuru 偶 guu 偉 erai 育 sodateru 放 hanasu 面 men 進 susumu 決 kimeru 流 nagareru
羽 hane 弱 yowai 黄 ki 短 mijikai 軽 karui 温 atatakai 植 ueru 祭 matsuri 拾 hirou 競 kyou 印 in 帯 obi 固 katai 焼 yaku 照 teru 包 tsutsumu 灯 tou 勢 ikioi 導 dou
額 gaku 復 fuku 移 utsuru 技 gi 豊 yutaka 厚 atsui 略 ryaku 仏 hotoke 燃 moeru 延 nobiru 裏 ura 届 todokeru 片 kata 伸 nobiru 香 kaori 汚 kitanai 替 kaeru 雇 yatou
薄 usui 詰 tsumeru 刺 sasu 硬 katai 叫 sakebu 祈 inoru 辛 karai 枯 kareru 涼 suzushii 舟 fune 燥 sou 占 uranau 患 kan 絡 raku 募 bo 造 tsukuru 極 kyoku 管 kan
省 shou 軒 ken
`.trim().split(/\s+/).reduce<[string, string][]>((pairs, part, i, all) => (i % 2 ? pairs : [...pairs, [part, all[i + 1]]]), []));

// A kanji's headline reading: the hand-picked one, or else one of its two most common words if that stands alone
// (押す osu, 星 hoshi), or else the sound it has in compounds.
export function commonReading(k: Pick<Kanji, 'kanji' | 'on' | 'kun' | 'words'>) {
  const alone = new RegExp(`^${k.kanji}[ぁ-ん]*$`);
  const word = k.words.slice(0, 2).find((w) => alone.test(w.w));
  return COMMON[k.kanji] ?? (word && toRomaji(word.r)) ?? k.on[0]?.romaji ?? k.kun[0]?.romaji ?? '';
}
