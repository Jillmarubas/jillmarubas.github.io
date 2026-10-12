import React from 'react';
import {AbsoluteFill, Audio, Easing, interpolate, OffthreadVideo, random, Sequence, useCurrentFrame} from 'remotion';

/*
 * Shared pieces for the sleep-ambience films (RainyNightSanctuary, MidnightFireplaceSanctuary,
 * SnowfallCabinSanctuary):
 * extending a short generated clip past its own length without repeating on a fixed period.
 */

export type Grain = {from: number; src: number; len: number};

/**
 * Lays short slices of a clip end to end, each overlapping the next by `overlap` frames.
 * Seeded random lengths and in-points, so the extension never repeats on a fixed period.
 */
export const grains = (seed: string, regions: [number, number][], start: number, end: number, minLen: number, maxLen: number, overlap: number): Grain[] => {
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

/** Equal-power in/out envelope for a slice `len` frames long that overlaps its neighbours by `x` frames. */
export const equalPower = (f: number, len: number, x: number, fadeIn = true) => {
  const tin = fadeIn && f < x ? Math.sin((Math.PI / 2) * (f / x)) : 1;
  const tout = f >= len - x ? Math.cos((Math.PI / 2) * ((f - (len - x)) / x)) : 1;
  return tin * tout;
};

/** Master fade for every track, by composition frame. */
export const masterFade = (f: number, duration: number, fadeIn: number, fadeOut: number) =>
  interpolate(f, [0, fadeIn], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.sin)}) *
  interpolate(f, [duration - fadeOut, duration - 1], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.sin)});

/** Black overlay opacity: fade up from black at the start, down to black at the end. */
export const blackLevel = (f: number, duration: number, fadeIn: number, fadeOut: number) =>
  Math.max(
    interpolate(f, [0, fadeIn], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
    interpolate(f, [duration - fadeOut, duration - 1], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
  );

/** One muted slice of the clip, dissolving in over the slice beneath it. Place inside a Sequence. */
export const PictureGrain: React.FC<{clip: string; src: number; len: number; dissolve: number}> = ({clip, src, len, dissolve}) => {
  const f = useCurrentFrame();
  const opacity = interpolate(f, [0, dissolve], [0, 1], {extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{opacity}}>
      <OffthreadVideo src={clip} trimBefore={src} trimAfter={src + len} muted />
    </AbsoluteFill>
  );
};

/**
 * A music-led ambience film with no narration: the music plays once, start to finish; the clip
 * plays once, whole, with its own sound in sync and its sharp events ridden down; then the clip's
 * clean audio and picture continue as seeded, crossfaded slices to the end.
 */
export type AmbienceSpec = {
  clip: string;
  music: string;
  duration: number;
  clipFrames: number;
  fadeIn: number;
  fadeOut: number;
  pictureFadeIn: number;
  /** Sharp events in clip frames, inclusive, ridden down to the `events` gain. */
  events: [number, number][];
  /** Event-free audio and picture stretches of the clip, [first, end). */
  audioRegions: [number, number][];
  pictureRegions: [number, number][];
  audioXfade: number;
  pictureDissolve: number;
  audioGrains: Grain[];
  pictureGrains: Grain[];
};

export type AmbienceGains = {music: number; clip: number; events: number};

/** Builds the audio and picture grain lists for a spec; seeds keep each film's timeline fixed. */
export const ambienceGrains = (
  seed: {audio: string; picture: string},
  s: Omit<AmbienceSpec, 'audioGrains' | 'pictureGrains'>,
  audioLen: [number, number],
  pictureLen: [number, number],
): AmbienceSpec => ({
  ...s,
  audioGrains: grains(seed.audio, s.audioRegions, s.clipFrames - s.audioXfade, s.duration, audioLen[0], audioLen[1], s.audioXfade),
  pictureGrains: grains(seed.picture, s.pictureRegions, s.clipFrames - s.pictureDissolve, s.duration, pictureLen[0], pictureLen[1], s.pictureDissolve),
});

export const AmbienceFilm: React.FC<{spec: AmbienceSpec; gains: AmbienceGains}> = ({spec, gains}) => {
  const frame = useCurrentFrame();
  const master = (f: number) => masterFade(f, spec.duration, spec.fadeIn, spec.fadeOut);
  const clipGain = (f: number) => (spec.events.some(([a, b]) => f >= a && f <= b) ? gains.events : gains.clip);
  const black = blackLevel(frame, spec.duration, spec.pictureFadeIn, spec.fadeOut);

  return (
    <AbsoluteFill style={{backgroundColor: 'black'}}>
      {/* The clip, whole, with its own sound in sync; it hands over to the extension over its last audioXfade frames. */}
      <Sequence durationInFrames={spec.clipFrames} name="Higgsfield clip">
        <OffthreadVideo src={spec.clip} volume={(f) => clipGain(f) * equalPower(f, spec.clipFrames, spec.audioXfade, false) * master(f)} />
      </Sequence>

      {/* Picture after the clip: muted, event-free slices, dissolved into each other. */}
      {spec.pictureGrains.map((g, i) => (
        <Sequence key={`p${i}`} from={g.from} durationInFrames={g.len} name={`picture ${i}`}>
          <PictureGrain clip={spec.clip} src={g.src} len={g.len} dissolve={spec.pictureDissolve} />
        </Sequence>
      ))}

      {/* Sound after the clip: event-free slices of its audio, crossfaded. */}
      {spec.audioGrains.map((g, i) => (
        <Sequence key={`a${i}`} from={g.from} durationInFrames={g.len} name={`ambience ${i}`} layout="none">
          <Audio
            src={spec.clip}
            trimBefore={g.src}
            trimAfter={g.src + g.len}
            volume={(f) => gains.clip * equalPower(f, g.len, spec.audioXfade) * master(g.from + f)}
          />
        </Sequence>
      ))}

      {/* The music: one pass, start to finish. */}
      <Audio src={spec.music} volume={(f) => gains.music * master(f)} name="Music" />

      <AbsoluteFill style={{backgroundColor: 'black', opacity: black}} />
    </AbsoluteFill>
  );
};
