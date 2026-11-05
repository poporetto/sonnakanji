// Rules only, no drawing or input, so they can be tested on their own.
export type Element = 'fire' | 'water' | 'wood' | 'earth' | 'metal' | 'spirit';
export interface Move { w: string; r: string; m: string; power: number }
export interface Species { k: string; m: string; type: Element; strokes: number; moves: Move[]; level: 'N5' | 'N4'; d: string[] }
export interface Fighter { k: string; lv: number; xp: number; hp: number }

const STRONG: Record<Element, Element[]> = {
  fire: ['wood', 'metal'], water: ['fire', 'earth'], wood: ['water', 'earth'],
  earth: ['fire'], metal: ['wood'], spirit: [],
};

export function typeBonus(attacker: Element, defender: Element) {
  if (STRONG[attacker].includes(defender)) return 2;
  if (STRONG[defender].includes(attacker)) return 0.5;
  return 1;
}

// More strokes make a tougher creature; every level adds to all of it.
export const maxHp = (s: Species, lv: number) => Math.floor(16 + s.strokes * 0.9 + lv * 3.2);
export const attack = (s: Species, lv: number) => 6 + Math.min(s.strokes, 14) * 0.25 + lv * 1.4;
export const defence = (s: Species, lv: number) => 6 + Math.min(s.strokes, 14) * 0.3 + lv * 1.2;

export function damage(a: Species, aLv: number, d: Species, dLv: number, move: Move, correct: boolean, roll = 1) {
  const base = (move.power * attack(a, aLv)) / (defence(d, dLv) * 5) + 1 + aLv * 0.25;
  return Math.max(1, Math.round(base * typeBonus(a.type, d.type) * (correct ? 1.5 : 0.6) * roll));
}

// Weaker wild kanji are easier to bind. Knowing its name is required first.
export const catchChance = (hp: number, max: number) => Math.min(0.95, 0.3 + 0.65 * (1 - hp / max));

export const xpToNext = (lv: number) => 20 + lv * 12;
export const xpReward = (lv: number) => 8 + lv * 5;

// Adds experience, returning how many levels were gained.
export function gainXp(f: Fighter, amount: number) {
  f.xp += amount;
  let levels = 0;
  while (f.xp >= xpToNext(f.lv)) {
    f.xp -= xpToNext(f.lv);
    f.lv++;
    levels++;
  }
  return levels;
}
