// "The Keeper": a 60-second wordless paper-cutout short, 1080x1920 at 23.976 fps.
import React from 'react';
import {AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {PaperFinish} from '../paperkite/kit';
import {FPS, fr} from './stage';
import {S1, S10, S11, S2, S3, S4, S5, S6a, S6b, S6c, S6d, S6e, S7, S8, S9} from './shots';

// Shot list and review chapters live in review.json, shared with the review room.
import REVIEW from './review.json';
const COMPS: React.FC[] = [S1, S2, S3, S4, S5, S6a, S6b, S6c, S6d, S6e, S7, S8, S9, S10, S11];
export const SHOTS: [number, React.FC, string][] = REVIEW.shots.map((s, i) => [s.start, COMPS[i], s.label]);
export const KEEPER_DURATION = REVIEW.frames;

// Grade follows the tension curve: brightness falls to its lowest in the dark lamp room, then lifts with the lanterns.
const GRADE: [number, number, number][] = [
  // second, brightness, saturation
  [0, 1.0, 0.95],
  [19, 0.96, 0.9],
  [26, 0.93, 0.86],
  [30, 0.86, 0.8],
  [31.4, 0.8, 0.74],
  [35, 0.83, 0.8],
  [39.5, 0.92, 0.95],
  [45.5, 1.0, 1.0],
  [51.5, 1.04, 1.06],
  [60, 1.04, 1.06],
];

export const Keeper: React.FC<{sound?: boolean}> = ({sound = true}) => {
  const s = useCurrentFrame() / FPS;
  const xs = GRADE.map((g) => g[0]);
  const b = interpolate(s, xs, GRADE.map((g) => g[1]), {extrapolateRight: 'clamp'});
  const sat = interpolate(s, xs, GRADE.map((g) => g[2]), {extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{background: '#1E2229'}}>
      <AbsoluteFill style={{filter: `brightness(${b.toFixed(3)}) saturate(${sat.toFixed(3)})`}}>
        {SHOTS.map(([start, Comp], i) => {
          const from = fr(start);
          const to = i + 1 < SHOTS.length ? fr(SHOTS[i + 1][0]) : KEEPER_DURATION;
          return (
            <Sequence key={i} from={from} durationInFrames={to - from}>
              <Comp />
            </Sequence>
          );
        })}
      </AbsoluteFill>
      <PaperFinish night={s < 45.5 ? 0.6 : 0} />
      {sound && <Audio src={staticFile('keeper/mix.m4a')} />}
    </AbsoluteFill>
  );
};
