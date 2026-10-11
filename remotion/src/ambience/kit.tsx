import React from 'react';
import {AbsoluteFill, Easing, interpolate, OffthreadVideo, random, useCurrentFrame} from 'remotion';

/*
 * Shared pieces for the sleep-ambience films (RainyNightSanctuary, MidnightFireplaceSanctuary):
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
