// The quiz screen. Rules live in quiz.ts; the review page owns the store and the finish screen.
import { BONUS_SECONDS, buildChoices, points, type QuizCard } from './quiz';

export interface GameCard extends QuizCard { on: string[]; kun: string[]; n: string; a: string }
export interface QuizResult { answered: string[]; right: number; score: number; bestCombo: number }
interface Options {
  cards: GameCard[];
  // Called once per kanji, with the first answer only.
  onAnswer: (kanji: string, correct: boolean) => void;
  onFinish: (result: QuizResult) => void;
}

const CHEERS: [string, string][] = [
  ['やった！', 'Got it!'], ['すごい！', 'Amazing!'], ['いいね！', 'Nice!'], ['そのとおり！', 'Exactly!'], ['さすが！', 'Just like you!'],
];
const OOPS: [string, string][] = [['おしい！', 'So close!'], ['ドンマイ！', 'No worries!']];
const pick = <T>(list: T[]) => list[Math.floor(Math.random() * list.length)];
// Long enough to enjoy the picture without breaking the rhythm.
const ADVANCE_MS = 1300;

const $ = (id: string) => document.getElementById(id)!;

function el(tag: string, cls: string, text = '', lang = '') {
  const n = document.createElement(tag);
  n.className = cls;
  n.textContent = text;
  if (lang) n.lang = lang;
  return n;
}

// Plays a CSS animation again even if it just ran.
function replay(n: Element, cls: string) {
  n.classList.remove(cls);
  void (n as HTMLElement).offsetWidth;
  n.classList.add(cls);
}

export function startQuiz(kanji: string[], { cards, onAnswer, onFinish }: Options) {
  const byKanji = new Map(cards.map((c) => [c.k, c]));
  const queue = [...kanji];
  const total = kanji.length;
  const answered = new Set<string>();
  const controller = new AbortController();
  const { signal } = controller;
  let solved = 0, right = 0, score = 0, combo = 0, bestCombo = 0;
  let choices: QuizCard[] = [];
  let open = false;
  let shownAt = 0;
  let timer = 0;
  let over = false;

  function hud() {
    $('q-count').textContent = `${solved} / ${total}`;
    $('q-score').textContent = String(score);
    $('q-combo').textContent = combo > 1 ? `${combo} combo` : '';
    $('q-trail').style.setProperty('--done', `${(solved / total) * 100}%`);
  }

  function ask() {
    const c = byKanji.get(queue[0])!;
    choices = buildChoices(c, cards);
    $('q-card').className = 'flash q-card';
    $('q-front').replaceChildren(
      el('div', 'big q-pop', c.k, 'ja'),
      el('div', 'ask', answered.has(c.k) ? 'Try this one again' : 'What does it mean?'),
    );
    $('q-status').textContent = '';
    $('q-cheer').hidden = true;
    $('q-next').hidden = true;
    $('q-choices').replaceChildren(...choices.map((choice, i) => {
      const b = el('button', 'q-choice') as HTMLButtonElement;
      b.type = 'button';
      b.style.setProperty('--i', String(i));
      const key = el('span', 'q-key', String(i + 1));
      key.setAttribute('aria-hidden', 'true');
      b.append(key, el('span', '', choice.m[0]));
      b.addEventListener('click', () => answer(i));
      return b;
    }));
    replay($('q-bonus'), 'run');
    hud();
    // The next drawing is ready by the time it is needed.
    new Image().src = c.a;
    $('q-card').focus({ preventScroll: true });
    shownAt = performance.now();
    open = true;
  }

  function answer(index: number) {
    if (!open || !choices[index]) return;
    open = false;
    const c = byKanji.get(queue.shift()!)!;
    const correct = choices[index].k === c.k;
    const first = !answered.has(c.k);
    answered.add(c.k);

    if (correct) {
      solved++;
      if (first) {
        combo++;
        bestCombo = Math.max(bestCombo, combo);
        right++;
        score += points(combo, (performance.now() - shownAt) / 1000);
      }
    } else {
      combo = 0;
      queue.push(c.k);
    }
    if (first) onAnswer(c.k, correct);

    [...$('q-choices').children].forEach((b, i) => {
      // aria-disabled keeps the focus ring where the player left it.
      b.setAttribute('aria-disabled', 'true');
      b.classList.add(choices[i].k === c.k ? 'right' : i === index ? 'wrong' : 'faded');
    });
    $('q-bonus').classList.remove('run');
    replay($('q-card'), correct ? 'hit' : 'miss');
    explain(c, correct);
    hud();

    const [jp, en] = pick(correct ? CHEERS : OOPS);
    $('q-cheer').textContent = jp;
    $('q-cheer').hidden = false;
    replay($('q-cheer'), 'say');
    $('q-status').textContent = `${correct ? 'Correct' : 'Not quite'}. ${en} ${c.k} means ${c.m[0]}.`;
    if (correct) {
      replay($('q-bear'), 'hop');
      if (first && combo > 1) replay($('q-combo'), 'bump');
      timer = window.setTimeout(next, ADVANCE_MS);
    } else {
      $('q-next').hidden = false;
      $('q-next').focus({ preventScroll: true });
      $('q-next').scrollIntoView({ block: 'nearest' });
    }
  }

  function explain(c: GameCard, correct: boolean) {
    const pic = el('div', 'pic');
    const art = document.createElement('img');
    art.src = c.a;
    art.alt = '';
    pic.append(art, el('div', 'big', c.k, 'ja'));
    $('q-front').replaceChildren(pic, el('div', 'answer', c.m.slice(0, 3).join(', ')));
    if (correct) return;
    const readings = [...c.on.slice(0, 2), ...c.kun.slice(0, 2)].join('、');
    $('q-front').append(el('div', 'rd', readings, 'ja'));
    if (c.n) $('q-front').append(el('p', 'note', c.n));
  }

  function next() {
    if (open || over) return;
    clearTimeout(timer);
    if (queue.length) ask();
    else finish();
  }

  function finish() {
    if (over) return;
    over = true;
    open = false;
    clearTimeout(timer);
    controller.abort();
    onFinish({ answered: [...answered], right, score, bestCombo });
  }

  $('q-next').addEventListener('click', next, { signal });
  $('q-quit').addEventListener('click', finish, { signal });
  $('q-card').addEventListener('click', next, { signal });
  addEventListener('keydown', (e) => {
    if (e.repeat || e.metaKey || e.ctrlKey || e.altKey) return;
    if (/^[1-4]$/.test(e.key)) answer(Number(e.key) - 1);
    // An answered choice still holds focus, and should move on rather than click itself.
    const target = e.target as Element;
    if ((e.key === ' ' || e.key === 'Enter') && !open && (!target.closest('button, a') || target.closest('.q-choice'))) {
      e.preventDefault();
      next();
    }
  }, { signal });

  $('q-bonus').style.setProperty('--secs', `${BONUS_SECONDS}s`);
  ask();
}
