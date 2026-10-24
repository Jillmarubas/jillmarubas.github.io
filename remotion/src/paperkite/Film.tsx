// "The Paper Kite": a 60-second paper-cutout short, 1080x1920 at 23 fps.
import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {C, Cut, H, PaperDefs, PaperFinish, W, cut, io, ramp, rectPts} from './kit';
import {Dawn, EndCard, Gust, HillRun, Night, Sea, TitleScene, TownMorning} from './scenes';

// Scene cuts in frames (23 fps): title, town, hill, gust, sea, night, dawn, end.
export const CUTS = [0, 115, 311, 495, 644, 851, 1058, 1277, 1380];
export const PK_DURATION = CUTS[CUTS.length - 1];
const SCENES = [TitleScene, TownMorning, HillRun, Gust, Sea, Night, Dawn, EndCard];
const WIPE = 14; // frames; the sheet covers the frame exactly on the cut

// A big sheet of paper slides across the lens to hide each cut; directions alternate.
const PaperWipe: React.FC<{dir: 1 | -1; color: string; seed: string}> = ({dir, color, seed}) => {
  const f = useCurrentFrame();
  const x = ramp(f, 0, WIPE, dir * (W / 2 + 1000), -dir * (W / 2 + 1000), io) + W / 2;
  return (
    <AbsoluteFill>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <PaperDefs />
        <g transform={`translate(${x} ${H / 2}) rotate(${dir * -5})`}>
          <Cut d={cut(rectPts(-850, -1250, 1700, 2500), seed, 7, 40)} fill={color} lift={4} />
        </g>
      </svg>
    </AbsoluteFill>
  );
};

const WIPE_COLORS = [C.paper2, '#E4DCCB', C.white, '#DCE1DE', '#D8CEC6', '#E6DCCF', C.paper2];

export const PaperKite: React.FC<{sound?: boolean}> = ({sound = true}) => {
  const frame = useCurrentFrame();
  const night = frame >= CUTS[5] && frame < CUTS[6] ? ramp(frame - CUTS[5], 20, 130) : 0;
  return (
    <AbsoluteFill style={{background: C.paper}}>
      {SCENES.map((Scene, i) => (
        <Sequence key={i} from={CUTS[i]} durationInFrames={CUTS[i + 1] - CUTS[i]}>
          <Scene dur={CUTS[i + 1] - CUTS[i]} />
        </Sequence>
      ))}
      {CUTS.slice(1, -1).map((c, i) => (
        <Sequence key={`w${i}`} from={c - WIPE / 2} durationInFrames={WIPE}>
          <PaperWipe dir={i % 2 ? -1 : 1} color={WIPE_COLORS[i]} seed={`wipe${i}`} />
        </Sequence>
      ))}
      <PaperFinish night={night} />
      {sound && <Audio src={staticFile('paperkite/mix.m4a')} />}
    </AbsoluteFill>
  );
};
