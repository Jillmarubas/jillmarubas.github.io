// How loud the music bed sits, second by second: ducked while Joey speaks, lifted in the
// gaps, 0.4 s ramps, 1 s fade-in, 3 s fade-out. The synth bakes this into music.mp3, so
// Remotion plays the bed at a fixed volume: a per-frame volume function on a 10-minute
// track became a huge ffmpeg expression that timed out Lambda's audio chunks.
// No imports: Node loads this file directly (synth/build.mjs).
import type {Block} from './runningOrder';

export const MUSIC = {
  underVoice: 0.16, // -16 dB → bed ≈ -32 LUFS under speech (VO is -16 LUFS)
  open: 0.45, // -7 dB → ≈ -23 LUFS on cards, stings and the end card
};

const ramp = (t: number, a0: number, a1: number, b0: number, b1: number) => {
  if (t <= a0 || t >= b1) return 0;
  if (t < a1) return (t - a0) / (a1 - a0);
  if (t <= b0) return 1;
  return 1 - (t - b0) / (b1 - b0);
};

export const musicGainAt = (t: number, blocks: Block[], total: number) => {
  let duck = 0;
  for (const b of blocks) {
    if (b.kind !== 'vo') continue;
    const s = b.start - 0.35;
    const e = b.start + b.len + 0.15;
    duck = Math.max(duck, ramp(t, s - 0.4, s, e, e + 0.5));
  }
  const level = MUSIC.open + (MUSIC.underVoice - MUSIC.open) * duck;
  const fadeIn = Math.min(1, Math.max(0, t / 1));
  const fadeOut = Math.min(1, Math.max(0, (total - 4 / 30 - t) / (3 - 4 / 30)));
  return level * fadeIn * fadeOut;
};
