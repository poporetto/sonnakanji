import type { Element } from './battle';
import { frequency, parse, TRACKS } from './music';

const KEY = 'kanjimon.sound.v1';
const VOLUME = 0.5;
let ac: AudioContext | null = null;
let master: GainNode;
let mix: GainNode;
let musicBus: GainNode | null = null;
let timer = 0;
let wanted = '';
let playing = '';

// Saved as "music,effects". Older saves held one switch for both.
const saved = (() => { try { return localStorage.getItem(KEY); } catch { return null; } })();
export const sound = { music: saved !== 'off' && saved !== 'off,on' && saved !== 'off,off', effects: saved !== 'off' && saved !== 'on,off' && saved !== 'off,off' };

export function setSound(part: 'music' | 'effects', value: boolean) {
  sound[part] = value;
  try { localStorage.setItem(KEY, `${sound.music ? 'on' : 'off'},${sound.effects ? 'on' : 'off'}`); } catch {}
  if (ac) (part === 'music' ? mix : master).gain.setTargetAtTime(value ? VOLUME : 0, ac.currentTime, 0.02);
}

// Browsers only allow sound after a tap or key press.
export function unlock() {
  if (!ac) {
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    ac = new Ctx();
    master = ac.createGain();
    master.gain.value = sound.effects ? VOLUME : 0;
    master.connect(ac.destination);
    mix = ac.createGain();
    mix.gain.value = sound.music ? VOLUME : 0;
    mix.connect(ac.destination);
    if (wanted) start(wanted);
  }
  if (ac.state === 'suspended') void ac.resume();
}

document.addEventListener('visibilitychange', () => {
  if (ac) void (document.hidden ? ac.suspend() : ac.resume());
});

function tone(freq: number, length: number, type: OscillatorType, volume: number, at = 0, slide?: number, out: AudioNode = master) {
  if (!ac) return;
  const t = ac.currentTime + at;
  const o = ac.createOscillator();
  const g = ac.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + length);
  g.gain.setValueAtTime(volume, t);
  g.gain.setTargetAtTime(0, t + length * 0.6, length * 0.2);
  o.connect(g).connect(out);
  o.start(t);
  o.stop(t + length * 1.6);
}

let hiss: AudioBuffer | null = null;
function noise(length: number, volume: number, from: number, to = from, at = 0, out: AudioNode = master) {
  if (!ac) return;
  if (!hiss) {
    hiss = ac.createBuffer(1, ac.sampleRate, ac.sampleRate);
    const d = hiss.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  const t = ac.currentTime + at;
  const s = ac.createBufferSource();
  s.buffer = hiss;
  const f = ac.createBiquadFilter();
  f.type = 'bandpass';
  f.frequency.setValueAtTime(from, t);
  f.frequency.exponentialRampToValueAtTime(to, t + length);
  const g = ac.createGain();
  g.gain.setValueAtTime(volume, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + length);
  s.connect(f).connect(g).connect(out);
  s.start(t, Math.random() * 0.5, length + 0.05);
}

// ---- Music: a small sequencer that schedules a little ahead of the clock.
function start(name: string) {
  if (!ac) return;
  stopMusic();
  const track = TRACKS[name];
  const lead = parse(track.lead), bass = parse(track.bass);
  const bus = ac.createGain();
  const soften = ac.createBiquadFilter();
  soften.type = 'lowpass';
  soften.frequency.value = 2800;
  bus.gain.value = 0;
  bus.gain.linearRampToValueAtTime(0.42, ac.currentTime + 0.3);
  bus.connect(soften).connect(mix);
  musicBus = bus;
  playing = name;
  const step = 30 / track.bpm;
  let next = ac.currentTime + 0.05, i = 0;
  const hold = (line: string[], at: number) => { let n = 1; while (line[(at + n) % line.length] === '-' && n < 16) n++; return n; };
  const schedule = () => {
    if (!ac) return;
    while (next < ac.currentTime + 0.25) {
      const at = next - ac.currentTime;
      const l = lead[i % lead.length], b = bass[i % bass.length];
      if (l !== '.' && l !== '-') {
        const length = hold(lead, i % lead.length) * step;
        tone(frequency(l), length, track.voice ?? 'square', track.voice ? 0.2 : 0.1, at, undefined, bus);
        tone(frequency(l) * 1.004, length, 'triangle', 0.07, at, undefined, bus);
      }
      if (b !== '.' && b !== '-') tone(frequency(b), step * 0.9, 'triangle', 0.22, at, undefined, bus);
      if (track.drums) {
        if (i % 4 === 0) tone(120, 0.1, 'sine', 0.22, at, 45, bus);
        if (i % 4 === 2) noise(0.08, 0.1, 1800, 1200, at, bus);
        noise(0.03, 0.035, 7000, 7000, at, bus);
      }
      next += step;
      i++;
    }
  };
  schedule();
  timer = window.setInterval(schedule, 80);
}

function stopMusic() {
  clearInterval(timer);
  playing = '';
  if (ac && musicBus) {
    const old = musicBus;
    old.gain.setTargetAtTime(0, ac.currentTime, 0.06);
    setTimeout(() => old.disconnect(), 500);
    musicBus = null;
  }
}

export function music(name: string) {
  wanted = name;
  if (ac && playing !== name) start(name);
}

export function silence() {
  wanted = '';
  stopMusic();
}

// ---- Sound effects
const notes = (list: [string, number][], type: OscillatorType = 'square', volume = 0.16) => {
  let at = 0;
  for (const [n, length] of list) { tone(frequency(n), length * 1.3, type, volume, at); at += length; }
};

export const sfx = {
  move: () => tone(660, 0.04, 'square', 0.06),
  pick: () => tone(880, 0.06, 'square', 0.09, 0, 1180),
  right: () => notes([['E5', 0.07], ['A5', 0.07], ['E6', 0.14]]),
  wrong: () => notes([['E4', 0.1], ['C4', 0.2]], 'sawtooth', 0.09),
  rustle: () => noise(0.08, 0.05, 2600, 1400),
  door: () => { noise(0.18, 0.1, 500, 1500); tone(180, 0.1, 'triangle', 0.14, 0.14, 110); },
  sign: () => notes([['G5', 0.06], ['D6', 0.12]], 'triangle', 0.16),
  alert: () => notes([['E6', 0.06], ['B6', 0.14]], 'square', 0.13),
  wipe: () => noise(0.42, 0.14, 500, 3600),
  // Every kanji's cry is its own, pitched from its character.
  cry(seed: number) {
    const base = 240 + (seed % 19) * 22;
    tone(base, 0.16, 'square', 0.12, 0, base * 1.6);
    tone(base * 1.6, 0.24, 'sawtooth', 0.08, 0.14, base * 0.8);
  },
  brush: () => noise(0.09, 0.07, 3000, 1600),
  pop: () => tone(300, 0.14, 'square', 0.13, 0, 900),
  attack(type: Element) {
    if (type === 'fire') noise(0.45, 0.2, 400, 1800);
    if (type === 'water') for (let i = 0; i < 5; i++) tone(320 + i * 90, 0.07, 'sine', 0.16, i * 0.06, 800 + i * 120);
    if (type === 'wood') for (let i = 0; i < 4; i++) noise(0.09, 0.1, 3500, 2000, i * 0.08);
    if (type === 'earth') { tone(90, 0.35, 'triangle', 0.3, 0, 40); noise(0.3, 0.14, 300, 140); }
    if (type === 'metal') { noise(0.12, 0.14, 6000, 3000); tone(1800, 0.3, 'triangle', 0.1, 0.02, 1500); tone(2640, 0.25, 'sine', 0.06, 0.02); }
    if (type === 'spirit') for (let i = 0; i < 5; i++) tone(700 + i * 210, 0.1, 'triangle', 0.1, i * 0.05);
  },
  hit(strong: boolean) {
    noise(0.14, strong ? 0.3 : 0.2, 1400, 240);
    tone(strong ? 150 : 200, 0.14, 'square', 0.17, 0, 60);
    if (strong) tone(880, 0.1, 'square', 0.08, 0.05, 1320);
  },
  faint() {
    tone(620, 0.75, 'sawtooth', 0.1, 0, 70);
    noise(0.7, 0.06, 1400, 200);
  },
  bless: () => notes([['D5', 0.12], ['G5', 0.12], ['A5', 0.12], ['D6', 0.12], ['G6', 0.5]], 'triangle', 0.17),
  throw: () => noise(0.32, 0.1, 900, 3200),
  fizzle() {
    noise(0.5, 0.14, 2600, 260);
    tone(420, 0.4, 'sawtooth', 0.07, 0.04, 90);
  },
  absorb: () => tone(280, 0.32, 'triangle', 0.18, 0, 1400),
  wobble: () => tone(190, 0.08, 'square', 0.13, 0, 150),
  burst() {
    noise(0.22, 0.2, 2600, 500);
    tone(520, 0.2, 'square', 0.1, 0, 180);
  },
  caught: () => notes([['C5', 0.09], ['E5', 0.09], ['G5', 0.09], ['C6', 0.09], ['G5', 0.09], ['C6', 0.28]]),
  win: () => notes([['A4', 0.1], ['A4', 0.1], ['A4', 0.1], ['D5', 0.14], ['F5', 0.14], ['A5', 0.42]]),
  level: () => notes([['G5', 0.08], ['A5', 0.08], ['B5', 0.08], ['D6', 0.08], ['G6', 0.3]], 'square', 0.13),
  stamp() {
    tone(110, 0.16, 'triangle', 0.32, 0, 50);
    noise(0.1, 0.16, 900, 300);
    notes([['D5', 0.09], ['G5', 0.09], ['B5', 0.09], ['D6', 0.26]], 'square', 0.12);
  },
};
