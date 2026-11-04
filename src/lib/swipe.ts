// Touch-only horizontal drag. Browsers keep vertical scrolling because the
// target sets touch-action: pan-y, and they fire pointercancel if they take over.
export interface SwipeOptions {
  canSwipe?: (dir: 'left' | 'right') => boolean;
  onSwipe: (dir: 'left' | 'right') => void;
  onMove?: (dx: number) => void;
}

export function attachSwipe(el: HTMLElement, { canSwipe = () => true, onSwipe, onMove }: SwipeOptions) {
  let startX = 0;
  let startT = 0;
  let id: number | null = null;
  let dx = 0;

  const settle = () => {
    el.style.transition = 'transform .2s ease';
    el.style.transform = '';
    onMove?.(0);
    id = null;
    dx = 0;
  };

  el.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'mouse' || id !== null) return;
    id = e.pointerId;
    startX = e.clientX;
    startT = e.timeStamp;
    el.style.transition = 'none';
  });

  el.addEventListener('pointermove', (e) => {
    if (e.pointerId !== id) return;
    dx = e.clientX - startX;
    const blocked = !canSwipe(dx < 0 ? 'left' : 'right');
    const shown = blocked ? dx * 0.2 : dx;
    el.style.transform = `translateX(${shown}px) rotate(${shown / 60}deg)`;
    onMove?.(blocked ? 0 : dx);
  });

  el.addEventListener('pointerup', (e) => {
    if (e.pointerId !== id) return;
    const speed = Math.abs(dx) / Math.max(e.timeStamp - startT, 1);
    const dir = dx < 0 ? 'left' : 'right';
    const committed = (Math.abs(dx) > el.offsetWidth * 0.28 || (speed > 0.6 && Math.abs(dx) > 40)) && canSwipe(dir);
    if (!committed) return settle();
    id = null;
    dx = 0;
    el.style.transition = 'transform .18s ease-in, opacity .18s';
    el.style.transform = `translateX(${dir === 'left' ? -120 : 120}vw) rotate(${dir === 'left' ? -8 : 8}deg)`;
    el.style.opacity = '0';
    setTimeout(() => onSwipe(dir), 170);
  });

  el.addEventListener('pointercancel', (e) => {
    if (e.pointerId === id) settle();
  });
}
