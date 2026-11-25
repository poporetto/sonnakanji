// The flip-the-pairs screen. Rules live in match.ts; the review page owns the store and the finish screen.
import { buildBoard, finishBonus, pairPoints, type Tile } from './match';
import { burst, CHEERS, el, floatText, OOPS, pick, replay } from './game-fx';
import type { GameCard } from './quiz-game';

export interface MatchResult { found: string[]; misses: number; finished: boolean; score: number; bestCombo: number }
interface Options { onPair: (kanji: string) => void; onFinish: (result: MatchResult) => void }

const MISS_MS = 1200;
const WAVE_MS = 1500;
const $ = (id: string) => document.getElementById(id)!;

function drawing(c: GameCard) {
  const art = document.createElement('img');
  art.src = c.a;
  art.alt = '';
  art.draggable = false;
  return art;
}

export function startMatch(pairs: GameCard[], { onPair, onFinish }: Options) {
  const byKanji = new Map(pairs.map((c) => [c.k, c]));
  const board = buildBoard(pairs.map((c) => c.k));
  const controller = new AbortController();
  const { signal } = controller;
  const found: string[] = [];
  const up: number[] = [];
  let tiles: HTMLButtonElement[] = [];
  let misses = 0, score = 0, combo = 0, bestCombo = 0;
  let missTimer = 0, endTimer = 0;
  let over = false;

  function hud() {
    $('m-count').textContent = `${found.length} / ${pairs.length} pairs`;
    $('m-score').textContent = String(score);
    $('m-combo').textContent = combo > 1 ? `${combo} combo` : '';
    $('m-trail').style.setProperty('--done', `${(found.length / pairs.length) * 100}%`);
  }

  function say(list: [string, string][]) {
    const [jp] = pick(list);
    $('m-cheer').textContent = jp;
    $('m-cheer').hidden = false;
    replay($('m-cheer'), 'say');
  }

  const label = (i: number) => {
    const t = board[i];
    const face = t.side === 'picture' ? `picture of ${byKanji.get(t.k)!.m[0]}` : `kanji ${t.k}`;
    if (found.includes(t.k)) return `Card ${i + 1}, ${face}, matched`;
    return up.includes(i) ? `Card ${i + 1}, ${face}` : `Card ${i + 1}, face down`;
  };

  function sync(i: number) {
    const done = found.includes(board[i].k);
    tiles[i].classList.toggle('up', done || up.includes(i));
    tiles[i].classList.toggle('matched', done);
    tiles[i].setAttribute('aria-label', label(i));
    if (done) tiles[i].setAttribute('aria-disabled', 'true');
  }

  function makeTile(t: Tile, i: number) {
    const c = byKanji.get(t.k)!;
    const b = el('button', 'm-tile') as HTMLButtonElement;
    b.type = 'button';
    b.style.setProperty('--i', String(i));
    b.style.setProperty('--back', `var(--t${i % 5})`);
    const inner = el('span', 'm-inner');
    const back = el('span', 'm-face m-back');
    const bear = document.createElement('img');
    bear.src = '/mascot/bear.webp';
    bear.alt = '';
    bear.draggable = false;
    back.append(bear);
    const front = el('span', 'm-face m-front');
    if (t.side === 'picture') front.append(drawing(c), el('small', '', c.m[0]));
    else front.append(el('span', 'm-kanji', c.k, 'ja'));
    inner.append(back, front);
    b.append(inner);
    b.addEventListener('click', () => flip(i));
    return b;
  }

  function deal() {
    $('m-intro').hidden = true;
    $('m-play').hidden = false;
    $('m-board').classList.remove('wave');
    tiles = board.map(makeTile);
    $('m-board').replaceChildren(...tiles);
    tiles.forEach((_, i) => sync(i));
    $('m-note').textContent = 'Flip two cards to pair each drawing with its kanji.';
    tiles[0].focus({ preventScroll: true });
    $('match').scrollIntoView({ block: 'nearest' });
  }

  function turnBack() {
    clearTimeout(missTimer);
    const old = up.splice(0);
    old.forEach((i) => {
      tiles[i].classList.remove('miss');
      sync(i);
    });
  }

  function flip(i: number) {
    if (over || found.includes(board[i].k)) return;
    // A third tap hurries a missed pair back over instead of being ignored.
    if (up.length === 2) turnBack();
    if (up.includes(i)) return;
    up.push(i);
    sync(i);
    const c = byKanji.get(board[i].k)!;
    $('m-status').textContent = label(i);
    if (up.length < 2) return;
    const [a, b] = up;
    if (board[a].k === board[b].k) matched(a, b, c);
    else missed(a, b);
  }

  function matched(a: number, b: number, c: GameCard) {
    up.length = 0;
    found.push(c.k);
    combo++;
    bestCombo = Math.max(bestCombo, combo);
    const earned = pairPoints(combo);
    score += earned;
    onPair(c.k);
    const last = found.length === pairs.length;
    const bonus = last ? finishBonus(misses) : 0;
    score += bonus;
    [a, b].forEach((i) => sync(i));
    hud();
    say(CHEERS);
    replay($('m-bear'), 'hop');
    if (combo > 1) replay($('m-combo'), 'bump');
    $('m-note').replaceChildren(el('b', '', c.k, 'ja'), ` ${c.m[0]}. ${c.n}`);
    replay($('m-note'), 'say');
    $('m-status').textContent = `Match! ${c.k} means ${c.m[0]}. ${c.n}`;
    // The sparkle waits for the second card to finish turning.
    setTimeout(() => {
      if (over) return;
      for (const i of [a, b]) burst(tiles[i], combo > 2 ? 20 : 12);
      floatText(tiles[b], `+${earned}`);
      if (bonus) floatText($('m-score'), `+${bonus} bonus`);
    }, 300);
    if (last) {
      endTimer = window.setTimeout(() => {
        replay($('m-board'), 'wave');
        endTimer = window.setTimeout(finish, WAVE_MS);
      }, 900);
    }
  }

  function missed(a: number, b: number) {
    misses++;
    combo = 0;
    hud();
    say(OOPS);
    $('m-status').textContent = `${label(a)} and ${label(b)} don't match.`;
    for (const i of [a, b]) replay(tiles[i], 'miss');
    missTimer = window.setTimeout(turnBack, MISS_MS);
  }

  function finish() {
    if (over) return;
    over = true;
    clearTimeout(missTimer);
    clearTimeout(endTimer);
    controller.abort();
    onFinish({ found, misses, finished: found.length === pairs.length, score, bestCombo });
  }

  $('m-cheer').hidden = true;
  $('m-status').textContent = '';
  $('m-play').hidden = true;
  $('m-intro').hidden = false;
  $('m-list').replaceChildren(...pairs.map((c, i) => {
    const li = el('li', 'm-meet');
    li.style.setProperty('--i', String(i));
    li.style.background = `var(--t${i % 5})`;
    li.append(drawing(c), el('b', '', c.k, 'ja'), el('small', '', c.m[0]));
    return li;
  }));
  $('m-ready').addEventListener('click', deal, { signal });
  $('m-quit').addEventListener('click', finish, { signal });
  hud();
  $('m-ready').focus({ preventScroll: true });
}
