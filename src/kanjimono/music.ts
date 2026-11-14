// Original adventure tunes, one for each place. One token is an eighth note: a pitch, '-' to hold, '.' for silence.
export interface Track { bpm: number; lead: string; bass: string; drums?: boolean; voice?: OscillatorType }

export const TRACKS: Record<string, Track> = {
  // Home and the dojo: a warm little lullaby.
  home: {
    bpm: 84, voice: 'triangle',
    lead: `F5 - A5 - G5 - F5 - | D5 - C5 - A4 - - - | Bb4 - D5 - C5 - Bb4 - | A4 - C5 - F5 - - - |
           F5 - A5 - C6 - A5 - | G5 - F5 - D5 - - - | E5 - G5 - Bb5 - A5 G5 | F5 - - - . . . .`,
    bass: `F3 . C4 . F3 . C4 . | D3 . A3 . D3 . A3 . | Bb3 . F3 . Bb3 . F3 . | F3 . C4 . F3 . C4 . |
           F3 . C4 . F3 . C4 . | Bb3 . F3 . Bb3 . F3 . | C3 . G3 . C3 . G3 . | F3 . C4 . F3 . . .`,
  },
  // Sakura Village: a bright, skipping start to the day.
  village: {
    bpm: 120, drums: true,
    lead: `G4 . B4 D5 G5 - D5 . | E5 - C5 E5 D5 - B4 . | C5 . E5 G5 C6 - B5 A5 | G5 - - - D5 - - - |
           G4 . B4 D5 G5 - A5 B5 | C6 - B5 A5 G5 - E5 . | A5 . G5 F#5 G5 - A5 . | G5 - - - . . . .`,
    bass: `G2 . D3 . G3 . D3 . | C3 . G3 . G2 . D3 . | C3 . G3 . A2 . E3 . | D3 . A3 . D3 . F#3 . |
           G2 . D3 . E3 . B3 . | C3 . G3 . C3 . G3 . | D3 . A3 . D3 . A3 . | G2 . D3 . G2 . . .`,
  },
  // Rice Fields: the first big step outside, quick and open.
  fields: {
    bpm: 144, drums: true,
    lead: `C5 - E5 G5 - E5 G5 - | A5 - G5 E5 - C5 D5 - | E5 - F5 G5 - C6 B5 A5 | G5 - - - - - . . |
           A5 - G5 F5 - E5 F5 - | G5 - F5 E5 - D5 E5 - | F5 E5 D5 C5 B4 C5 D5 B4 | C5 - - - G4 - - - |
           E5 E5 . E5 G5 - E5 - | F5 F5 . F5 A5 - F5 - | G5 G5 . G5 C6 - B5 - | A5 - G5 - - - . . |
           C6 - B5 A5 - G5 A5 - | G5 - F5 E5 - D5 E5 - | F5 A5 G5 F5 E5 G5 D5 E5 | C5 - - - . . . .`,
    bass: `C3 G3 C3 G3 C3 G3 C3 G3 | F3 C3 F3 C3 C3 G3 C3 G3 | C3 G3 C3 G3 F3 C3 F3 C3 | G2 D3 G2 D3 G2 D3 G2 D3 |
           F3 C3 F3 C3 F3 C3 F3 C3 | C3 G3 C3 G3 C3 G3 C3 G3 | D3 A3 D3 A3 G2 D3 G2 D3 | C3 G3 C3 G3 C3 G3 C3 G3 |
           C3 G3 C3 G3 C3 G3 C3 G3 | F3 C3 F3 C3 F3 C3 F3 C3 | C3 G3 C3 G3 C3 G3 C3 G3 | F3 C3 F3 C3 G2 D3 G2 D3 |
           F3 C3 F3 C3 F3 C3 F3 C3 | C3 G3 C3 G3 A2 E3 A2 E3 | D3 A3 D3 A3 G2 D3 G2 D3 | C3 G3 C3 G3 C3 . . .`,
  },
  // Kawabe Town: market-day bustle, all offbeats and chatter.
  kawabe: {
    bpm: 128, drums: true,
    lead: `. F5 . A5 C6 - A5 . | . G5 . Bb5 D6 - Bb5 . | . A5 . C6 F6 - D6 C6 | Bb5 A5 G5 A5 F5 - - - |
           . F5 . A5 C6 - A5 . | . Bb5 . A5 G5 - E5 . | F5 G5 A5 Bb5 C6 - E5 - | F5 - - - . . . .`,
    bass: `F2 . C3 F3 F2 . C3 F3 | Bb2 . F3 Bb3 Bb2 . F3 Bb3 | F2 . C3 F3 D3 . A3 D4 | G2 . D3 G3 C3 . G3 C4 |
           F2 . C3 F3 F2 . C3 F3 | Bb2 . F3 Bb3 C3 . G3 C4 | D3 . A3 D4 C3 . G3 C4 | F2 . C3 F3 F2 . . .`,
  },
  // Cedar Forest: tiptoeing, curious and a little spooky.
  forest: {
    bpm: 104, drums: true, voice: 'triangle',
    lead: `A4 . C5 . E5 . D5 C5 | B4 . D5 . G5 - E5 . | F5 . E5 . D5 . C5 B4 | C5 - A4 - E4 - - - |
           A4 . C5 . E5 . G5 . | A5 - G5 E5 F5 - D5 . | E5 . D5 C5 B4 . G#4 . | A4 - - - . . . .`,
    bass: `A2 . E3 . A2 . E3 . | G2 . D3 . G2 . D3 . | F2 . C3 . G2 . D3 . | A2 . E3 . A2 . E3 . |
           A2 . E3 . C3 . G3 . | F2 . C3 . D3 . A3 . | E2 . B2 . E2 . B2 . | A2 . E3 . A2 . . .`,
  },
  // Mountain Pass: wide leaps and a heroic climb.
  pass: {
    bpm: 112, drums: true,
    lead: `D5 - - A4 D5 - F#5 - | A5 - - - G5 F#5 E5 - | B4 - - G4 B4 - E5 - | G5 - - - F#5 E5 D5 - |
           A4 - - D5 F#5 - A5 - | D6 - - - C#6 B5 A5 - | B5 - A5 G5 F#5 - E5 - | D5 - - - - - . . `,
    bass: `D3 A3 D4 A3 D3 A3 D4 A3 | A2 E3 A3 E3 A2 E3 A3 E3 | G2 D3 G3 D3 G2 D3 G3 D3 | E3 B3 E4 B3 A2 E3 A3 E3 |
           D3 A3 D4 A3 D3 A3 D4 A3 | B2 F#3 B3 F#3 G2 D3 G3 D3 | G2 D3 G3 D3 A2 E3 A3 E3 | D3 A3 D4 A3 D3 . . .`,
  },
  // Onsen Town: steam, slippers and a lazy shuffle.
  onsen: {
    bpm: 92, voice: 'triangle',
    lead: `Bb4 - - D5 F5 - D5 - | G5 - - F5 D5 - Bb4 - | C5 - - Eb5 G5 - Eb5 - | F5 - - - - - D5 - |
           Bb4 - - D5 F5 - A5 - | Bb5 - - A5 G5 - F5 - | Eb5 - G5 - F5 - A4 - | Bb4 - - - . . . .`,
    bass: `Bb2 . F3 . D3 . F3 . | G2 . D3 . G3 . D3 . | Eb3 . Bb3 . C3 . G3 . | F2 . C3 . F3 . C3 . |
           Bb2 . F3 . D3 . F3 . | G2 . D3 . Eb3 . Bb3 . | C3 . G3 . F2 . C3 . | Bb2 . F3 . Bb2 . . .`,
  },
  // Castle Town: a proud royal march.
  castle: {
    bpm: 108, drums: true,
    lead: `C5 . C5 C5 E5 - G5 - | C6 - - - G5 - E5 - | F5 . F5 F5 A5 - C6 - | B5 - - - G5 - - - |
           C6 . C6 B5 A5 - G5 - | A5 . A5 G5 F5 - E5 - | D5 . E5 F5 G5 - B4 - | C5 - - - . . . .`,
    bass: `C3 . G3 . C3 . G3 . | C3 . G3 . E3 . G3 . | F2 . C3 . F2 . C3 . | G2 . D3 . G2 . D3 . |
           A2 . E3 . E3 . B3 . | F2 . C3 . C3 . G3 . | D3 . A3 . G2 . D3 . | C3 . G3 . C3 . . .`,
  },
  // The Seaside Road: an easy stroll with the wind behind you.
  coast: {
    bpm: 116, drums: true,
    lead: `D5 - G5 - B5 - A5 G5 | E5 - G5 - D5 - - - | C5 - E5 - G5 - F#5 E5 | D5 - - - B4 - - - |
           D5 - G5 - B5 - D6 - | C6 - B5 A5 G5 - E5 - | F#5 - A5 - D5 - F#5 - | G5 - - - . . . .`,
    bass: `G2 . D3 . G3 . D3 . | C3 . G3 . G2 . D3 . | C3 . G3 . C3 . G3 . | G2 . D3 . G2 . D3 . |
           G2 . D3 . B2 . F#3 . | C3 . G3 . E3 . B3 . | D3 . A3 . D3 . A3 . | G2 . D3 . G2 . . .`,
  },
  // Minato Harbour: a jaunty tune for a busy quay.
  minato: {
    bpm: 132, drums: true,
    lead: `A4 D5 F#5 A5 - F#5 D5 . | B4 E5 G5 B5 - G5 E5 . | A4 C#5 E5 A5 - G5 F#5 E5 | D5 - F#5 - A5 - - - |
           B5 - A5 G5 F#5 - D5 . | G5 - F#5 E5 D5 - B4 . | E5 . F#5 G5 A5 - C#5 - | D5 - - - . . . .`,
    bass: `D3 . A3 . D3 . A3 . | E3 . B3 . E3 . B3 . | A2 . E3 . A2 . E3 . | D3 . A3 . D3 . F#3 . |
           G2 . D3 . D3 . A3 . | G2 . D3 . B2 . F#3 . | A2 . E3 . A2 . E3 . | D3 . A3 . D3 . . .`,
  },
  // Bamboo Grove: slow and still, like light through the leaves.
  bamboo: {
    bpm: 96, voice: 'triangle',
    lead: `E5 - - G5 A5 - B5 - | D6 - B5 - A5 - - - | G5 - - A5 B5 - A5 G5 | E5 - - - D5 - - - |
           E5 - - G5 A5 - D6 - | E6 - D6 B5 A5 - G5 - | A5 - B5 - G5 - D5 - | E5 - - - . . . .`,
    bass: `E2 . B2 . E3 . B2 . | G2 . D3 . G3 . D3 . | C3 . G3 . C3 . G3 . | A2 . E3 . B2 . F#3 . |
           E2 . B2 . E3 . B2 . | C3 . G3 . G2 . D3 . | A2 . E3 . B2 . F#3 . | E2 . B2 . E2 . . .`,
  },
  // Lantern Town: festival drums and a tune to dance to.
  matsuri: {
    bpm: 138, drums: true,
    lead: `A5 A5 . C6 A5 . G5 E5 | A5 A5 . C6 D6 - C6 - | G5 G5 . A5 G5 . E5 D5 | E5 - G5 - A5 - - - |
           C6 C6 . D6 E6 . D6 C6 | A5 A5 . C6 A5 - G5 - | E5 G5 A5 C6 D6 C6 A5 G5 | A5 - - - . . . .`,
    bass: `A2 . E3 A2 . E3 A2 . | A2 . E3 A2 . E3 A2 . | G2 . D3 G2 . D3 G2 . | A2 . E3 A2 . E3 A2 . |
           C3 . G3 C3 . G3 C3 . | A2 . E3 A2 . E3 A2 . | G2 . D3 G2 . D3 E2 . | A2 . E3 A2 . . . .`,
  },
  // Inkstone Cape: grave and windswept, at the end of the road.
  cape: {
    bpm: 100, drums: true,
    lead: `D5 - - F5 A5 - - G5 | F5 - E5 - D5 - - - | Bb4 - - D5 F5 - - E5 | A4 - - - C#5 - - - |
           D5 - - F5 A5 - - C6 | D6 - - C6 A5 - G5 - | F5 - G5 - E5 - C#5 - | D5 - - - . . . .`,
    bass: `D3 A3 D4 A3 D3 A3 D4 A3 | D3 A3 D4 A3 D3 A3 D4 A3 | Bb2 F3 Bb3 F3 Bb2 F3 Bb3 F3 | A2 E3 A3 E3 A2 E3 A3 E3 |
           D3 A3 D4 A3 F2 C3 F3 C3 | Bb2 F3 Bb3 F3 C3 G3 C4 G3 | G2 D3 G3 D3 A2 E3 A3 E3 | D3 A3 D4 A3 D3 . . .`,
  },
  // Wild battles: fast, bright and a bit cheeky.
  battle: {
    bpm: 172, drums: true,
    lead: `A5 A5 . A5 C6 - A5 - | G5 G5 . G5 B5 - G5 - | F5 F5 . F5 A5 - F5 - | E5 - G#5 - B5 - E6 - |
           A5 - E5 A5 C6 - B5 A5 | G5 - D5 G5 B5 - A5 G5 | F5 - C5 F5 A5 G5 F5 E5 | D5 E5 F5 G5 G#5 - B5 - |
           C6 - - B5 A5 - - G5 | F5 - - G5 A5 - - - | C6 - - D6 E6 - D6 C6 | B5 - - - E5 - - - |
           A5 C6 E6 C6 A5 C6 E6 C6 | G5 B5 D6 B5 G5 B5 D6 B5 | F5 A5 C6 A5 E5 G#5 B5 G#5 | A5 - - - E5 - - - `,
    bass: `A2 A3 A2 A3 A2 A3 A2 A3 | G2 G3 G2 G3 G2 G3 G2 G3 | F2 F3 F2 F3 F2 F3 F2 F3 | E2 E3 E2 E3 E2 E3 E2 E3 |
           A2 A3 A2 A3 A2 A3 A2 A3 | G2 G3 G2 G3 G2 G3 G2 G3 | F2 F3 F2 F3 F2 F3 F2 F3 | E2 E3 E2 E3 E2 E3 E2 E3 |
           F2 F3 F2 F3 F2 F3 F2 F3 | D2 D3 D2 D3 D2 D3 D2 D3 | A2 A3 A2 A3 A2 A3 A2 A3 | E2 E3 E2 E3 E2 E3 E2 E3 |
           A2 A3 A2 A3 A2 A3 A2 A3 | G2 G3 G2 G3 G2 G3 G2 G3 | F2 F3 F2 F3 E2 E3 E2 E3 | A2 A3 A2 A3 A2 . . .`,
  },
  // Masters and rivals: the big showdown.
  trial: {
    bpm: 184, drums: true,
    lead: `D5 - D5 F5 A5 - D6 - | C6 - A5 F5 G5 - A5 - | Bb5 - Bb5 A5 G5 - F5 - | E5 - F5 G5 A5 - - - |
           D6 - C6 Bb5 A5 - G5 - | F5 - G5 A5 D5 - - - | Bb5 - A5 G5 C6 - Bb5 A5 | D6 - - - A5 - - - |
           F5 F5 . F5 A5 A5 . A5 | C6 - Bb5 - A5 - G5 - | Bb5 Bb5 . Bb5 D6 D6 . D6 | C6 - - - - - . . |
           D5 F5 A5 D6 A5 F5 D5 F5 | C5 F5 A5 C6 A5 F5 C5 F5 | Bb4 D5 G5 Bb5 C5 E5 G5 C6 | D6 - - - A5 - - - `,
    bass: `D2 D3 D2 D3 D2 D3 D2 D3 | F2 F3 F2 F3 C3 C4 C3 C4 | Bb2 Bb3 Bb2 Bb3 G2 G3 G2 G3 | A2 A3 A2 A3 A2 A3 A2 A3 |
           D2 D3 D2 D3 C3 C4 C3 C4 | Bb2 Bb3 Bb2 Bb3 D2 D3 D2 D3 | G2 G3 G2 G3 C3 C4 C3 C4 | A2 A3 A2 A3 A2 A3 A2 A3 |
           F2 F3 F2 F3 F2 F3 F2 F3 | C3 C4 C3 C4 C3 C4 C3 C4 | Bb2 Bb3 Bb2 Bb3 Bb2 Bb3 Bb2 Bb3 | F2 F3 F2 F3 C3 C4 C3 C4 |
           D2 D3 D2 D3 D2 D3 D2 D3 | F2 F3 F2 F3 F2 F3 F2 F3 | G2 G3 G2 G3 C3 C4 C3 C4 | A2 A3 A2 A3 A2 . . .`,
  },
};

const STEPS: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

export const parse = (line: string) => line.replace(/\|/g, ' ').trim().split(/\s+/);

export function frequency(note: string) {
  const [, name, accidental, octave] = /^([A-G])([#b]?)(\d)$/.exec(note) ?? [];
  if (!name) throw new Error(`Bad note: ${note}`);
  const shift = accidental === '#' ? 1 : accidental === 'b' ? -1 : 0;
  return 440 * 2 ** ((STEPS[name] + shift + (Number(octave) + 1) * 12 - 69) / 12);
}
