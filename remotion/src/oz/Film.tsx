// The Cyclone: shots placed on the narration clock, grade curve, voice + sound mix.
import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame} from 'remotion';
import TL from './timeline.json';
import {FPS} from './look';
import * as X from './shots';
import {S, E} from './scenes';

type Row = [number, React.FC<{at: number}>];
const V = (n: number): React.FC<{at: number}> => (p) => <X.S45Oz {...p} view={n} />;
// [start second, shot] in order. Cuts land on the narration (and a beat before a line when the picture should lead).
export const SHOTS: Row[] = [
  [0, X.S01Flying],
  [S(2) + 5.5, X.S02Inside],
  [E(2) + 0.2, X.S02bTitle],
  [S(3) - 0.4, X.S03Still],
  [S(4), X.S04Farm],
  [S(4) + 15, X.S05Room],
  [S(5), X.S06Doorway],
  [S(5) + 7.5, X.S07Prairie],
  [S(5) + 17.5, X.S08Cracks],
  [S(6), X.S09Paint],
  [S(7), X.S10Em],
  [S(7) + 18, X.S11Startle],
  [S(8) - 0.4, X.S12EmSpeaks],
  [S(9), X.S13Henry],
  [S(10), X.S14Toto],
  [S(11), X.S15NotPlaying],
  [S(12), X.S16HenrySky],
  [S(12) + 9, X.S17North],
  [S(12) + 16, X.S18South],
  [S(13) - 0.3, X.S19HenryStands],
  [S(15), X.S20HenryRuns],
  [S(15) + 4.6, X.S21EmDoor],
  [S(16) - 0.2, X.S22EmScreams],
  [S(17), X.S23TotoHides],
  [S(18) - 0.2, X.S24DorothyCalls],
  [S(19), X.S25Trapdoor],
  [S(20), X.S26Halfway],
  [S(21) - 0.3, X.S27Falls],
  [S(22), X.S28Strange],
  [S(23), X.S29Lift],
  [S(24), X.S30Center],
  [S(24) + 15, X.S31Top],
  [S(25), X.S32Rocked],
  [S(26), X.S33TotoFalls],
  [S(27) - 0.15, X.S34TotoCry],
  [S(28), X.S35Ear],
  [S(28) + 12, X.S36Rescue],
  [S(29), X.S37Lonely],
  [S(30), X.S38Whisper],
  [S(32), X.S39Sleep],
  [S(33) - 0.5, X.S40Shock],
  [S(34), X.S41Silence],
  [S(35), X.S42Sunshine],
  [S(36), X.S43Door],
  [S(37) - 0.3, X.S44Amazed],
  [S(38), V(0)],
  [S(38) + 9, V(1)],
  [S(38) + 18, V(2)],
  [S(38) + 26, V(3)],
  [S(38) + 33, V(4)],
  [S(39), X.S46Munchkins],
  [S(40), X.S47Bow],
  [S(41) - 0.2, X.S48Welcome],
  [S(42), X.S49LooksBehind],
  [S(43), X.S50Feet],
];
export const OZ_FRAMES = TL.frames;

// Grade: brightness/saturation follow the tension curve. Kansas dusty but rich; darkest in the night flight; Oz full.
const GRADE: [number, number, number][] = [
  // [sec, brightness, saturation]
  [0, 0.78, 0.9],
  [S(3), 1.0, 1.0],
  [S(12), 0.95, 1.0],
  [S(16), 0.85, 1.0],
  [S(25), 0.7, 0.9],
  [S(32), 0.6, 0.85],
  [S(35), 0.9, 1.0],
  [S(36), 1.0, 1.15],
  [S(38), 1.04, 1.25],
  [E(43), 1.04, 1.25],
];
const gradeAt = (s: number) => {
  for (let i = 0; i < GRADE.length - 1; i++) {
    const [a, b0, s0] = GRADE[i];
    const [b, b1, s1] = GRADE[i + 1];
    if (s <= b) {
      const k = Math.max(0, Math.min(1, (s - a) / (b - a)));
      return [b0 + (b1 - b0) * k, s0 + (s1 - s0) * k];
    }
  }
  return [GRADE[GRADE.length - 1][1], GRADE[GRADE.length - 1][2]];
};

export const OzCyclone: React.FC<{sound?: boolean; voiceOnly?: boolean}> = ({sound = false, voiceOnly = false}) => {
  const f = useCurrentFrame();
  const [br, sat] = gradeAt(f / FPS);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <AbsoluteFill style={{filter: `brightness(${br.toFixed(3)}) saturate(${sat.toFixed(3)})`}}>
        {SHOTS.map(([from, C], i) => {
          const a = Math.round(from * FPS);
          const b = i + 1 < SHOTS.length ? Math.round(SHOTS[i + 1][0] * FPS) : OZ_FRAMES;
          return (
            <Sequence key={i} from={a} durationInFrames={b - a} name={`shot ${i + 1}`}>
              <C at={from} />
            </Sequence>
          );
        })}
      </AbsoluteFill>
      {sound && !voiceOnly && <Audio src={staticFile('oz/mix.m4a')} />}
      {voiceOnly &&
        TL.lines.map((l) => (
          <Sequence key={l.line} from={Math.round(l.start * FPS)} durationInFrames={Math.ceil(l.dur * FPS) + 2}>
            <Audio src={staticFile(l.file)} />
          </Sequence>
        ))}
    </AbsoluteFill>
  );
};
