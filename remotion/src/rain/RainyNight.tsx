import React from 'react';
import {AbsoluteFill, Audio, Easing, interpolate, OffthreadVideo, random, Sequence, staticFile, useCurrentFrame} from 'remotion';

/*
 * "Rainy Night Sanctuary": sleep ambience. A brown-noise bed, an ElevenLabs narration and the
 * 8 s Higgsfield rainy-bedroom clip (picture + its own rain/thunder audio), mixed in Remotion.
 *
 * Measured sources (ffmpeg ebur128 / astats):
 *   narration.mp3   81.633 s, 44.1 kHz mono,  -20.0 LUFS, peak -5.5 dBFS, speech 0.00-81.40 s
 *   brown-noise.mp3 129.98 s, 48 kHz stereo, -16.2 LUFS, all energy < 1 kHz, own fade-in 0-3 s
 *   bedroom.mp4     8.000 s = 192 frames @ 24 fps, 1920x1080, AAC 48 kHz stereo:
 *                   rain bed -38.3 LUFS (250 Hz-16 kHz), one thunder hit 3.45-5.4 s (-22.3 LUFS,
 *                   peak -8.4 dBFS), lightning flashes on frames 54-59 and 85-89, faint sky
 *                   flickers on frames 102-104 and 135-139.
 */

export const RAIN_FPS = 24;
const sec = (s: number) => Math.round(s * RAIN_FPS);

/** The Higgsfield clip: always played once, whole, at native speed. */
export const CLIP_FRAMES = 192; // 8.000 s
/** Ambience-only intro; the thunder (3.45-5.4 s) lands here, before the first word. */
export const VO_START = sec(5);
export const VO_FRAMES = Math.ceil(81.632653 * RAIN_FPS); // 1960, the whole file incl. its 0.2 s tail
/** Ambience after the narration file ends, covering the fade-out. */
export const TAIL_FRAMES = sec(4);
export const RAINY_DURATION = VO_START + VO_FRAMES + TAIL_FRAMES; // 2176 = 90.667 s

/*
 * Linear gains. The brief's starting points (brown 15-25 %, rain 8-15 %, thunder 5-10 %) were
 * re-derived from the measured levels: the clip's rain is 22 dB quieter than the brown noise, so
 * 8-15 % would put it ~35 dB under the bed and inaudible. Resulting mix levels:
 *   narration 1.0  -> -20 LUFS        brown 0.2 -> -30 LUFS (10 dB under the voice, < 1 kHz only)
 *   rain 0.5       -> -44 LUFS        thunder 0.3 -> -33 LUFS window, peak -19 dBFS (a low rumble)
 */
export type RainyMix = {
  narration: number;
  brownNoise: number;
  rain: number;
  thunder: number;
};

export const RAINY_MIX: RainyMix = {
  narration: 1.0,
  brownNoise: 0.2,
  rain: 0.5,
  thunder: 0.3,
};

export type RainyNightProps = {mix: RainyMix};

/** Brown noise starts 5 s into its file: skips its own fade-in and the 3-5 s swell that would stack on the thunder. */
const BROWN_TRIM_BEFORE = sec(5);
const FADE_IN = sec(2);
const FADE_OUT = sec(3);
const PICTURE_FADE_IN = sec(1.5);

/* Thunder automation on the clip's own audio (clip-local frames). The gain moves from the rain
 * level to the thunder level as the thunder rises out of the rain, so the rain dip is masked. */
const THUNDER_DOWN: [number, number] = [82, 87]; // 3.42-3.62 s
const THUNDER_UP: [number, number] = [129, 136]; // 5.38-5.67 s

/* Rain-only and flicker-free stretches of the clip, [first, end) in clip frames. */
const RAIN_AUDIO_REGIONS: [number, number][] = [
  [3, 79], // 0.13-3.29 s, before the thunder
  [138, 190], // 5.75-7.92 s, after it
];
const LOOP_PICTURE_REGIONS: [number, number][] = [
  [141, 192], // after the last sky flicker; least camera drift
];
/** Equal-power crossfade length between rain grains, and dissolve length between picture grains. */
const RAIN_XFADE = sec(0.5);
const PICTURE_DISSOLVE = 16;

type Grain = {from: number; src: number; len: number};

/**
 * Lays short slices of the clip end to end, each overlapping the next by `overlap` frames.
 * Seeded random lengths and in-points, so the extension never repeats on a fixed period.
 */
const grains = (seed: string, regions: [number, number][], start: number, end: number, minLen: number, maxLen: number, overlap: number): Grain[] => {
  const out: Grain[] = [];
  let from = start;
  for (let i = 0; from < end; i++) {
    const [a, b] = regions[Math.floor(random(`${seed}-r${i}`) * regions.length)];
    const len = Math.min(b - a, Math.round(minLen + random(`${seed}-l${i}`) * (maxLen - minLen)));
    const src = a + Math.floor(random(`${seed}-s${i}`) * (b - a - len + 1));
    out.push({from, src, len});
    from += len - overlap;
  }
  return out;
};

export const RAIN_GRAINS = grains('rain', RAIN_AUDIO_REGIONS, CLIP_FRAMES - RAIN_XFADE, RAINY_DURATION, 32, 52, RAIN_XFADE);
export const PICTURE_GRAINS = grains('picture', LOOP_PICTURE_REGIONS, CLIP_FRAMES - PICTURE_DISSOLVE, RAINY_DURATION, 36, 51, PICTURE_DISSOLVE);

/** Master fade applied to every track, by composition frame. */
const master = (f: number) =>
  interpolate(f, [0, FADE_IN], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.sin)}) *
  interpolate(f, [RAINY_DURATION - FADE_OUT, RAINY_DURATION - 1], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.sin)});

/** Equal-power in/out envelope for a slice `len` frames long that overlaps its neighbours by `x` frames. */
const equalPower = (f: number, len: number, x: number, fadeIn = true) => {
  const tin = fadeIn && f < x ? Math.sin((Math.PI / 2) * (f / x)) : 1;
  const tout = f >= len - x ? Math.cos((Math.PI / 2) * ((f - (len - x)) / x)) : 1;
  return tin * tout;
};

const clipGain = (f: number, mix: RainyMix) =>
  f < THUNDER_UP[0]
    ? interpolate(f, THUNDER_DOWN, [mix.rain, mix.thunder], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})
    : interpolate(f, THUNDER_UP, [mix.thunder, mix.rain], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

const CLIP = staticFile('rain/bedroom.mp4');

export const RainyNight: React.FC<RainyNightProps> = ({mix}) => {
  const frame = useCurrentFrame();
  const black = Math.max(
    interpolate(frame, [0, PICTURE_FADE_IN], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
    interpolate(frame, [RAINY_DURATION - FADE_OUT, RAINY_DURATION - 1], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
  );

  return (
    <AbsoluteFill style={{backgroundColor: 'black'}}>
      {/* The clip, whole, with its own rain and thunder in sync with the picture. It hands over to
          the rain extension with an equal-power crossfade over its last 0.5 s. */}
      <Sequence durationInFrames={CLIP_FRAMES} name="Higgsfield clip">
        <OffthreadVideo
          src={CLIP}
          volume={(f) => clipGain(f, mix) * equalPower(f, CLIP_FRAMES, RAIN_XFADE, false) * master(f)}
        />
      </Sequence>

      {/* Picture after 8 s: muted, flicker-free slices of the clip, dissolved into each other. */}
      {PICTURE_GRAINS.map((g, i) => (
        <Sequence key={`p${i}`} from={g.from} durationInFrames={g.len} name={`picture ${i}`}>
          <PictureGrain src={g.src} len={g.len} />
        </Sequence>
      ))}

      {/* Rain after 8 s: rain-only slices of the clip's audio (no thunder), crossfaded. */}
      {RAIN_GRAINS.map((g, i) => (
        <Sequence key={`r${i}`} from={g.from} durationInFrames={g.len} name={`rain ${i}`} layout="none">
          <Audio
            src={CLIP}
            trimBefore={g.src}
            trimAfter={g.src + g.len}
            volume={(f) => mix.rain * equalPower(f, g.len, RAIN_XFADE) * master(g.from + f)}
          />
        </Sequence>
      ))}

      {/* Brown noise: one continuous pass under the whole composition. */}
      <Audio
        src={staticFile('rain/brown-noise.mp3')}
        trimBefore={BROWN_TRIM_BEFORE}
        volume={(f) => mix.brownNoise * master(f)}
        name="Brown noise"
      />

      {/* Narration: the whole file, untouched apart from the master fade (which ends before it starts). */}
      <Sequence from={VO_START} durationInFrames={VO_FRAMES} name="Narration" layout="none">
        <Audio src={staticFile('rain/narration.mp3')} volume={(f) => mix.narration * master(VO_START + f)} />
      </Sequence>

      <AbsoluteFill style={{backgroundColor: 'black', opacity: black}} />
    </AbsoluteFill>
  );
};

const PictureGrain: React.FC<{src: number; len: number}> = ({src, len}) => {
  const f = useCurrentFrame();
  const opacity = interpolate(f, [0, PICTURE_DISSOLVE], [0, 1], {extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{opacity}}>
      <OffthreadVideo src={CLIP} trimBefore={src} trimAfter={src + len} muted />
    </AbsoluteFill>
  );
};
