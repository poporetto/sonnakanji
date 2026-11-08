// Dictionaries list the oldest sense first. These are the words a learner actually meets.
export const WORDS: Record<string, string> = {
  円: 'yen', 話: 'talk', 気: 'energy', 中: 'middle', 上: 'up', 下: 'down', 後: 'after', 先: 'ahead', 前: 'before', 間: 'between',
  画: 'picture', 計: 'measure', 漢: 'Chinese', 以: 'using', 仕: 'serve', 堂: 'hall', 館: 'large hall', 主: 'master', 自: 'self',
  世: 'society', 員: 'member', 族: 'family', 長: 'long', 明: 'bright', 工: 'craft', 通: 'pass through',
};

// Kanjimono is played by children, so battle words never touch on sex, killing, bodies or drugs.
// Checked against every sense of a word, not just the first one shown.
export const UNSUITABLE = /prostitut|brothel|\bsex|sexual|opposite sex|\brape|porn|erotic|\bnude|naked|harlot|whore|mistress|concubine|adulter|intercourse|genital|lewd|obscen|seduc|lover|corpse|dead body|carcass|murder|suicide|\bkill|slaughter|massacre|execution|tortur|assassin|narcotic|\bdrug|opium|gambl|drunk/i;
