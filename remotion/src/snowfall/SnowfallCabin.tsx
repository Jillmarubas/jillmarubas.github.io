import React from 'react';
import {staticFile} from 'remotion';
import {AmbienceFilm, ambienceGrains} from '../ambience/kit';

/*
 * "Snowfall at the Mountain Cabin": sleep ambience, same rules as MidnightFireplaceSanctuary.
 * The Suno track plays whole as the bed; the 8 s Higgsfield clip plays once with its own room
 * sound in sync, then that sound and the picture continue as seeded, crossfaded slices.
 *
 * Measured sources (ffmpeg ebur128 / astats):
 *   music.mp3     168.024 s, 48 kHz stereo, -17.3 LUFS, peak -5.7 dBFS, all energy < 1 kHz,
 *                 its own fade-out over the last ~8 s.
 *   snowfall.mp4  8.000 s = 192 frames @ 24 fps, 1920x1080, AAC 48 kHz stereo, locked-off camera
 *                 (0 px movement), steady brightness: a cabin bedroom with snow falling outside.
 *                 Audio: a steady, non-tonal room/wind bed at -36.1 LUFS (LRA 0.7) that fades in
 *                 over its first 0.75 s, with five 1-17 ms clicks at 0.77, 5.16, 5.92, 6.43
 *                 (-4 dBFS, a 1 ms tick) and 7.66 s; every other transient peaks <= -21 dBFS.
 *                 The picture dims slightly over the last 8 frames.
 */

export const SNOW_FPS = 24;
const sec = (s: number) => Math.round(s * SNOW_FPS);

export const SNOW_CLIP_FRAMES = 192; // 8.000 s, played once, whole, at native speed
/** The whole music track, so its own fade-out is kept. */
export const SNOW_DURATION = Math.ceil(168.024 * SNOW_FPS); // 4033 = 168.042 s

/*
 * Linear gains, as for the fireplace film: the music at 0.4 (about -25 LUFS), the room sound about
 * 16 dB under it (0.6, about -40.5 LUFS), and the clicks ridden down to 0.12, which brings the
 * loudest to about -22 dBFS, level with the room sound's own small transients.
 */
export type SnowfallMix = {
  music: number;
  room: number;
  clicks: number;
};

export const SNOWFALL_MIX: SnowfallMix = {
  music: 0.4,
  room: 0.6,
  clicks: 0.12,
};

export type SnowfallProps = {mix: SnowfallMix};

/* Clicks in clip frames, inclusive, with a frame of margin either side. */
const CLICKS: [number, number][] = [
  [17, 19], // 0.77 s
  [122, 124], // 5.16 s
  [141, 143], // 5.92 s
  [153, 155], // 6.43 s
  [182, 184], // 7.66 s
];

const SPEC = ambienceGrains(
  {audio: 'snow-room', picture: 'snow-picture'},
  {
    clip: staticFile('snowfall/snowfall.mp4'),
    music: staticFile('snowfall/music.mp3'),
    duration: SNOW_DURATION,
    clipFrames: SNOW_CLIP_FRAMES,
    fadeIn: sec(2),
    fadeOut: sec(6),
    pictureFadeIn: sec(1.5),
    events: CLICKS,
    // Click-free room sound after its own fade-in.
    audioRegions: [
      [21, 121],
      [157, 182],
    ],
    // Before the slight dimming at the end.
    pictureRegions: [[8, 184]],
    audioXfade: sec(0.5),
    pictureDissolve: sec(1),
  },
  [25, 48],
  [60, 120],
);

export const SNOW_AUDIO_GRAINS = SPEC.audioGrains;
export const SNOW_PICTURE_GRAINS = SPEC.pictureGrains;

export const SnowfallCabin: React.FC<SnowfallProps> = ({mix}) => (
  <AmbienceFilm spec={SPEC} gains={{music: mix.music, clip: mix.room, events: mix.clicks}} />
);
