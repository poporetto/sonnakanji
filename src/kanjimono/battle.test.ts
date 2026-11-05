import assert from 'node:assert/strict';
import { test } from 'node:test';
import { attack, catchChance, damage, gainXp, maxHp, typeBonus, xpToNext, type Species } from './battle.ts';

const mon = (k: string, type: Species['type'], strokes = 4): Species => ({ k, m: k, type, strokes, moves: [], level: 'N5', d: [] });
const move = { w: '', r: '', m: '', power: 40 };

test('the starters form a triangle', () => {
  assert.equal(typeBonus('water', 'fire'), 2);
  assert.equal(typeBonus('fire', 'wood'), 2);
  assert.equal(typeBonus('wood', 'water'), 2);
  assert.equal(typeBonus('fire', 'water'), 0.5);
});

test('spirit is neutral both ways', () => {
  assert.equal(typeBonus('spirit', 'fire'), 1);
  assert.equal(typeBonus('fire', 'spirit'), 1);
});

test('a right answer always hits harder than a wrong one', () => {
  const [a, b] = [mon('火', 'fire'), mon('人', 'spirit')];
  assert.ok(damage(a, 5, b, 5, move, true) > damage(a, 5, b, 5, move, false));
});

test('a strong matchup hits harder and damage is never zero', () => {
  const [w, f] = [mon('水', 'water'), mon('火', 'fire')];
  assert.ok(damage(w, 5, f, 5, move, true) > damage(f, 5, w, 5, move, true));
  assert.ok(damage(f, 1, w, 50, { ...move, power: 1 }, false) >= 1);
});

test('wounded kanji are easier to catch, but never certain', () => {
  assert.ok(catchChance(1, 40) > catchChance(40, 40));
  assert.ok(catchChance(0, 40) <= 0.95);
});

test('levels raise stats and spend experience', () => {
  const m = mon('火', 'fire');
  assert.ok(maxHp(m, 10) > maxHp(m, 5));
  assert.ok(attack(m, 10) > attack(m, 5));
  const f = { k: '火', lv: 5, xp: 0, hp: 10 };
  assert.equal(gainXp(f, xpToNext(5)), 1);
  assert.equal(f.lv, 6);
  assert.equal(f.xp, 0);
});
