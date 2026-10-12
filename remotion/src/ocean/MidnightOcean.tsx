import React from 'react';
import {random, staticFile} from 'remotion';
import {AmbienceFilm, AmbienceSpec, Grain} from '../ambience/kit';

/*
 * "Midnight Ocean Retreat": sleep ambience, same rules as the other music-led films, with one
 * difference: the clip's sound is waves, not a steady bed, so the extension is built from whole
 * wave cycles joined at their troughs instead of short random slices (which would cut waves
 * mid-swell). Picture and sound use the same cycles, so the wash you see is the wash you hear.
 *
 * Measured sources (ffmpeg ebur128 / astats, per-frame levels):
 *   music.mp3  223.224 s, 48 kHz stereo, -17.0 LUFS, peak -3.9 dBFS, nearly all energy < 1 kHz;
 *              a quiet first 4 s and its own fade-out.
 *   ocean.mp4  8.000 s = 192 frames @ 24 fps, 1920x1080, AAC 48 kHz stereo, locked-off camera
 *              (0 px movement), steady brightness: a moonlit beach under palms. Audio -34.0 LUFS,
 *              energy 250 Hz-4 kHz, no sharp events (loudest -17.8 dBFS, a smooth crest).
 *              It fades in over frames 0-10. Wave A rises from the trough level (-48 dB) at
 *              frame 11, crests at frames 75-87 (-30 dB) and recedes to a trough at frame 139
 *              (-48 dB). Wave B, smaller, rises from frame 139, crests at frame 179 (-35.5 dB)
 *              and is receding (-38 dB) when the clip ends; its tail matches wave A's backwash
 *              at frame 103 in level and spectrum.
 */

export const OCEAN_FPS = 24;
const sec = (s: number) => Math.round(s * OCEAN_FPS);

export const OCEAN_CLIP_FRAMES = 192; // 8.000 s, played once, whole, at native speed
/** The whole music track, so its own fade-out is kept. */
export const OCEAN_DURATION = Math.ceil(223.224 * OCEAN_FPS); // 5358 = 223.250 s

/*
 * Linear gains, as for the other music-led films: the music at 0.4 (about -25 LUFS) and the waves
 * about 16 dB under it (0.45, about -41 LUFS). The clip has no sharp events, so nothing is ridden
 * down.
 */
export type OceanMix = {
  music: number;
  waves: number;
};

export const OCEAN_MIX: OceanMix = {
  music: 0.4,
  waves: 0.45,
};

export type OceanProps = {mix: OceanMix};

const XFADE = sec(0.5);

/* Clip-frame segments, [first, end). A wave is one or more segments played back to back. */
const A_FULL: [number, number] = [11, 139]; // trough to trough, 5.3 s
const B_RISE: [number, number] = [139, 188]; // wave B's rise and crest
const A_BACKWASH: [number, number] = [103, 139]; // finishes wave B, from the matching level to the trough
const WAVE_A = [A_FULL];
const WAVE_B = [B_RISE, A_BACKWASH]; // about 3.5 s

/**
 * The extension: first finish the wave the clip ends in, then a seeded random run of big (A) and
 * small (B) waves, never more than two of the same in a row. Every segment overlaps the next by
 * XFADE frames, so joins between waves fall in the troughs.
 */
const waveCycles = (start: number, end: number): Grain[] => {
  const out: Grain[] = [];
  let from = start;
  const push = ([a, b]: [number, number]) => {
    out.push({from, src: a, len: b - a});
    from += b - a - XFADE;
  };
  push(A_BACKWASH);
  const history: string[] = [];
  for (let i = 0; from < end; i++) {
    let pick = random(`ocean-wave-${i}`) < 0.5 ? 'A' : 'B';
    if (history.length >= 2 && history[history.length - 1] === pick && history[history.length - 2] === pick) {
      pick = pick === 'A' ? 'B' : 'A';
    }
    history.push(pick);
    (pick === 'A' ? WAVE_A : WAVE_B).forEach(push);
  }
  return out;
};

const WAVES = waveCycles(OCEAN_CLIP_FRAMES - XFADE, OCEAN_DURATION);

const SPEC: AmbienceSpec = {
  clip: staticFile('ocean/ocean.mp4'),
  music: staticFile('ocean/music.mp3'),
  duration: OCEAN_DURATION,
  clipFrames: OCEAN_CLIP_FRAMES,
  fadeIn: sec(2),
  fadeOut: sec(6),
  pictureFadeIn: sec(1.5),
  events: [],
  audioRegions: [A_FULL, B_RISE],
  pictureRegions: [A_FULL, B_RISE],
  audioXfade: XFADE,
  pictureDissolve: XFADE,
  // Whole wave cycles for both sound and picture.
  audioGrains: WAVES,
  pictureGrains: WAVES,
};

export const OCEAN_WAVES = WAVES;

export const MidnightOcean: React.FC<OceanProps> = ({mix}) => (
  <AmbienceFilm spec={SPEC} gains={{music: mix.music, clip: mix.waves, events: 0}} />
);
