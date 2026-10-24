import React from 'react';
import {staticFile} from 'remotion';
import {AmbienceFilm, ambienceGrains} from '../ambience/kit';

/*
 * "Midnight Rainforest Sanctuary": sleep ambience, same rules as the fireplace and snowfall films.
 * The Suno track plays whole as the bed; the 8 s Higgsfield clip plays once with its own jungle
 * sound in sync, then that sound and the picture continue as seeded, crossfaded slices.
 *
 * Measured sources (ffmpeg ebur128 / astats):
 *   music.mp3       298.032 s, 48 kHz stereo, -17.5 LUFS, peak -4.2 dBFS, nearly all energy
 *                   < 1 kHz; a quiet first 4 s and its own fade-out.
 *   rainforest.mp4  8.000 s = 192 frames @ 24 fps, 1920x1080, AAC 48 kHz stereo, locked-off
 *                   camera (0 px movement): a jungle hut at night with a lantern. Audio: a steady
 *                   insect chorus (-31.7 LUFS, LRA 0.3) centred near 5.2 kHz, chirping ~8 times a
 *                   second, with six 0-4 ms ticks at 0.34, 2.33, 3.90 (-12.6 dBFS), 4.02, 5.47 and
 *                   7.67 s; the chorus itself peaks around -24 dBFS. Picture: the scene brightens
 *                   over its first ~3 s, and the lantern flame flickers hard on frames 36-40.
 */

export const RAINFOREST_FPS = 24;
const sec = (s: number) => Math.round(s * RAINFOREST_FPS);

export const RAINFOREST_CLIP_FRAMES = 192; // 8.000 s, played once, whole, at native speed
/** The whole music track, so its own fade-out is kept. */
export const RAINFOREST_DURATION = Math.ceil(298.032 * RAINFOREST_FPS); // 7153 = 298.042 s

/*
 * Linear gains, as for the other music-led films: the music at 0.4 (about -25.5 LUFS) and the
 * chorus about 16 dB under it (0.3, about -42 LUFS). The chorus sits above 4 kHz, where the music
 * has nothing, so it stays clear without needing more. The ticks are ridden down to 0.08, which
 * brings the loudest to about -34.5 dBFS, level with the chorus's own peaks.
 */
export type RainforestMix = {
  music: number;
  chorus: number;
  ticks: number;
};

export const RAINFOREST_MIX: RainforestMix = {
  music: 0.4,
  chorus: 0.3,
  ticks: 0.08,
};

export type RainforestProps = {mix: RainforestMix};

/* Ticks in clip frames, inclusive, with a frame of margin either side. */
const TICKS: [number, number][] = [
  [7, 9], // 0.34 s
  [54, 56], // 2.33 s
  [92, 97], // 3.90 s and 4.02 s
  [130, 132], // 5.47 s
  [183, 185], // 7.67 s
];

const SPEC = ambienceGrains(
  {audio: 'rainforest-chorus', picture: 'rainforest-picture'},
  {
    clip: staticFile('rainforest/rainforest.mp4'),
    music: staticFile('rainforest/music.mp3'),
    duration: RAINFOREST_DURATION,
    clipFrames: RAINFOREST_CLIP_FRAMES,
    fadeIn: sec(2),
    fadeOut: sec(6),
    pictureFadeIn: sec(1.5),
    events: TICKS,
    // Tick-free chorus.
    audioRegions: [
      [10, 53],
      [58, 91],
      [99, 129],
      [134, 182],
    ],
    // After the scene has brightened and the hard lantern flicker has passed.
    pictureRegions: [[73, 188]],
    audioXfade: sec(0.5),
    pictureDissolve: sec(1),
  },
  [25, 48],
  [60, 100],
);

export const RAINFOREST_AUDIO_GRAINS = SPEC.audioGrains;
export const RAINFOREST_PICTURE_GRAINS = SPEC.pictureGrains;

export const MidnightRainforest: React.FC<RainforestProps> = ({mix}) => (
  <AmbienceFilm spec={SPEC} gains={{music: mix.music, clip: mix.chorus, events: mix.ticks}} />
);
