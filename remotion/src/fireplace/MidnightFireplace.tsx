import React from 'react';
import {staticFile} from 'remotion';
import {AmbienceFilm, ambienceGrains} from '../ambience/kit';

/*
 * "Midnight Fireplace Sanctuary": sleep ambience, same rules as RainyNightSanctuary, no narration.
 * The Suno track plays whole as the bed; the 8 s Higgsfield fireplace clip plays once with its
 * own crackle in sync, then crackle and picture continue as seeded, crossfaded slices.
 *
 * Measured sources (ffmpeg ebur128 / astats):
 *   music.mp3      197.592 s, 48 kHz stereo, -16.5 LUFS, peak -3.4 dBFS, all energy < 1 kHz;
 *                  a slow B-major drone with its own 2 s fade-in and ~12 s fade-out.
 *   fireplace.mp4  8.000 s = 192 frames @ 24 fps, 1920x1080, AAC 48 kHz stereo, locked-off
 *                  camera (0 px movement): fire crackle -39.4 LUFS with a low rumble; pops at
 *                  1.85 s (-2.8 dBFS), 3.12 s (-10.8) and 4.78 s (-8.3); every other crackle
 *                  peaks <= -14.5 dBFS. Two fire flares brighten the room on frames 33-47, and
 *                  the mug's steam only appears from about frame 48.
 */

export const FIRE_FPS = 24;
const sec = (s: number) => Math.round(s * FIRE_FPS);

export const FIRE_CLIP_FRAMES = 192; // 8.000 s, played once, whole, at native speed
/** The whole music track, so its own fade-out and return to the home chord are kept. */
export const FIRE_DURATION = Math.ceil(197.592 * FIRE_FPS); // 4743 = 197.625 s

/*
 * Linear gains. With no narration the music is the programme, so it sits higher than the brown
 * noise did under the voice (0.2): 0.4 puts it at about -24.5 LUFS, a few dB under the narrated
 * film, so the combined video gets quieter as it goes rather than louder. The crackle sits about
 * 16 dB under the music, as the rain did under the brown noise; it lives above 1 kHz, where the
 * music has nothing, so it stays audible (this clip's crackle is 4.6 dB quieter above 1.5 kHz
 * than the first take's, hence unity gain). The three pops are ridden down to `pops`, which
 * brings the loudest to about -15 dBFS, level with the ordinary crackles.
 */
export type FireplaceMix = {
  music: number;
  crackle: number;
  pops: number;
};

export const FIREPLACE_MIX: FireplaceMix = {
  music: 0.4,
  crackle: 1.0,
  pops: 0.25,
};

export type FireplaceProps = {mix: FireplaceMix};

const FADE_IN = sec(2);
const FADE_OUT = sec(6);
const PICTURE_FADE_IN = sec(1.5);

/* Pops in clip frames, inclusive, with a frame of margin either side (volume steps per frame). */
const POPS: [number, number][] = [
  [43, 45], // 1.85 s
  [73, 75], // 3.12 s
  [113, 115], // 4.78 s
];

/* Pop-free crackle, and the picture after the flares once the steam is up, [first, end). */
const CRACKLE_REGIONS: [number, number][] = [
  [2, 41],
  [47, 71],
  [77, 111],
  [117, 190],
];
const LOOP_PICTURE_REGIONS: [number, number][] = [[52, 192]];
const CRACKLE_XFADE = sec(0.5);
/* The camera is locked off, so picture slices can be long and dissolve slowly. */
const PICTURE_DISSOLVE = sec(1);

const SPEC = ambienceGrains(
  {audio: 'crackle', picture: 'fire-picture'},
  {
    clip: staticFile('fireplace/fireplace.mp4'),
    music: staticFile('fireplace/music.mp3'),
    duration: FIRE_DURATION,
    clipFrames: FIRE_CLIP_FRAMES,
    fadeIn: FADE_IN,
    fadeOut: FADE_OUT,
    pictureFadeIn: PICTURE_FADE_IN,
    events: POPS,
    audioRegions: CRACKLE_REGIONS,
    pictureRegions: LOOP_PICTURE_REGIONS,
    audioXfade: CRACKLE_XFADE,
    pictureDissolve: PICTURE_DISSOLVE,
  },
  [32, 48],
  [60, 120],
);

export const CRACKLE_GRAINS = SPEC.audioGrains;
export const FIRE_PICTURE_GRAINS = SPEC.pictureGrains;

export const MidnightFireplace: React.FC<FireplaceProps> = ({mix}) => (
  <AmbienceFilm spec={SPEC} gains={{music: mix.music, clip: mix.crackle, events: mix.pops}} />
);
