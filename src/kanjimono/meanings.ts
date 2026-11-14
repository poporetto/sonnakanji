// Dictionaries list the oldest sense first. These are the words a learner actually meets.
export const WORDS: Record<string, string> = {
  円: 'yen', 話: 'talk', 気: 'energy', 中: 'middle', 上: 'up', 下: 'down', 後: 'after', 先: 'ahead', 前: 'before', 間: 'between',
  画: 'picture', 計: 'measure', 漢: 'Chinese', 以: 'using', 仕: 'serve', 堂: 'hall', 館: 'large hall', 主: 'master', 自: 'self',
  世: 'society', 員: 'member', 族: 'family', 長: 'long', 明: 'bright', 工: 'craft', 通: 'pass through',
  // N3.
  回: 'times', 対: 'opposite', 相: 'mutual', 申: 'say humbly', 様: 'Mr. or Ms.', 君: 'you', 号: 'number', 経: 'pass through', 機: 'machine', 参: 'take part',
  然: 'so', 由: 'reason', 反: 'against', 未: 'not yet', 非: 'not', 等: 'equal', 記: 'write down', 向: 'face toward', 変: 'strange', 状: 'condition',
  構: 'build', 戻: 'go back', 緒: 'together', 杯: 'cup', 髪: 'hair', 歳: 'years old', 頂: 'summit', 暮: 'dusk', 晩: 'evening', 更: 'further', 突: 'thrust',
  座: 'sit', 背: 'back', 腹: 'belly', 割: 'divide', 供: 'offer', 済: 'finish', 似: 'resemble', 余: 'extra', 険: 'steep', 識: 'knowledge', 断: 'refuse',
  術: 'skill', 過: 'pass by', 現: 'appear', 徒: 'pupil', 辞: 'word', 積: 'pile up', 達: 'reach', 観: 'view', 種: 'seed', 差: 'gap', 念: 'thought',
  付: 'attach', 必: 'surely', 官: 'official', 告: 'announce', 産: 'produce', 成: 'become', 治: 'heal', 法: 'law', 最: 'most', 連: 'connect', 議: 'discussion',
  昔: 'long ago', 礼: 'thanks', 列: 'row', 路: 'road', 命: 'life', 負: 'be defeated', 配: 'hand out', 役: 'role', 局: 'office', 流: 'flow', 式: 'ceremony',
  受: 'receive', 都: 'capital', 調: 'investigate', 実: 'real', 定: 'fixed', 部: 'part', 才: 'talent', 太: 'fat', 科: 'subject', 光: 'light', 直: 'straight',
  組: 'group', 交: 'mix', 活: 'active', 点: 'point', 選: 'choose', 戦: 'battle', 信: 'believe', 争: 'compete', 置: 'put', 説: 'explain', 望: 'hope',
  敗: 'defeat', 願: 'wish', 職: 'job', 師: 'teacher', 破: 'tear', 招: 'invite', 迷: 'lost', 優: 'gentle', 段: 'step', 与: 'give', 渡: 'cross', 性: 'nature',
  面: 'mask', 表: 'surface', 全: 'whole', 所: 'place', 次: 'next', 位: 'rank', 夫: 'husband', 民: 'people', 害: 'harm', 当: 'hit', 合: 'fit', 取: 'take',
};

// Kanjimono is played by children, so battle words never touch on sex, killing, bodies or drugs.
// Checked against every sense of a word, not just the first one shown.
export const UNSUITABLE = /prostitut|brothel|\bsex|sexual|opposite sex|\brape|porn|erotic|\bnude|naked|harlot|whore|mistress|concubine|adulter|intercourse|genital|lewd|obscen|seduc|lover|corpse|dead body|carcass|murder|suicide|\bkill|slaughter|massacre|execution|tortur|assassin|narcotic|\bdrug|opium|gambl|drunk/i;
