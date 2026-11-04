export type Theme = 'system' | 'light' | 'dark';
export interface Prefs { theme: Theme; romaji: boolean; motion: boolean }

const KEY = 'sonnakanji.prefs.v1';
export const defaultPrefs: Prefs = { theme: 'system', romaji: true, motion: true };

export function loadPrefs(): Prefs {
  try {
    return { ...defaultPrefs, ...JSON.parse(localStorage.getItem(KEY) ?? '{}') };
  } catch {
    return defaultPrefs;
  }
}

// Mirrors the inline script in Base.astro, which applies these before first paint.
export function applyPrefs(p: Prefs) {
  const root = document.documentElement;
  if (p.theme === 'system') root.removeAttribute('data-theme');
  else root.dataset.theme = p.theme;
  root.dataset.romaji = p.romaji ? 'on' : 'off';
  root.dataset.motion = p.motion ? 'full' : 'reduced';
}

export function savePrefs(p: Prefs) {
  try {
    localStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    // Private windows may refuse storage; the choice still applies to this page.
  }
  applyPrefs(p);
}
