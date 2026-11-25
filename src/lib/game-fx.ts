// Small effects shared by the review games.
export function el(tag: string, cls: string, text = '', lang = '') {
  const n = document.createElement(tag);
  n.className = cls;
  n.textContent = text;
  if (lang) n.lang = lang;
  return n;
}

// Plays a CSS animation again even if it just ran.
export function replay(n: Element, cls: string) {
  n.classList.remove(cls);
  void (n as HTMLElement).offsetWidth;
  n.classList.add(cls);
}

export const CHEERS: [string, string][] = [
  ['やった！', 'Got it!'], ['すごい！', 'Amazing!'], ['いいね！', 'Nice!'], ['そのとおり！', 'Exactly!'], ['さすが！', 'Just like you!'],
];
export const OOPS: [string, string][] = [['おしい！', 'So close!'], ['ドンマイ！', 'No worries!']];
export const pick = <T>(list: T[]) => list[Math.floor(Math.random() * list.length)];

export const calm = () => document.documentElement.dataset.motion === 'reduced' || matchMedia('(prefers-reduced-motion: reduce)').matches;

function layer(cls: string, at: Element, life: number) {
  const box = at.getBoundingClientRect();
  const n = el('div', cls);
  n.setAttribute('aria-hidden', 'true');
  n.style.left = `${box.left + box.width / 2}px`;
  n.style.top = `${box.top + box.height / 2}px`;
  document.body.append(n);
  setTimeout(() => n.remove(), life);
  return n;
}

// Stars and paper scraps fly out from an element.
export function burst(at: Element, count = 14) {
  if (calm()) return;
  const n = layer('fx-burst', at, 1000);
  for (let i = 0; i < count; i++) {
    const bit = el('i', i % 2 ? 'fx-star' : '');
    const angle = (i / count) * Math.PI * 2 + Math.random() * 0.5;
    const reach = 60 + Math.random() * 55;
    bit.style.setProperty('--dx', `${Math.cos(angle) * reach}px`);
    bit.style.setProperty('--dy', `${Math.sin(angle) * reach}px`);
    bit.style.background = `var(--p${i % 5})`;
    n.append(bit);
  }
}

export function floatText(at: Element, text: string) {
  layer('fx-float', at, 1000).append(el('b', '', text));
}
