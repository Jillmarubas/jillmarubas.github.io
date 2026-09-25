import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useVideoConfig} from 'remotion';
import {Field} from './components/Field';
import {PlateCredit, Plates} from './components/Plates';
import {Captions} from './components/Captions';
import {StoryMarks, TopBar} from './components/Chrome';
import {Hook} from './scenes/Hook';
import {PriceWar} from './scenes/PriceWar';
import {Enzyme} from './scenes/Enzyme';
import {Meta} from './scenes/Meta';
import {Gemini, Island, Outro, UN} from './scenes/Rest';
import {useT} from './lib/anim';
import {cue, PARAS} from './lib/timeline';

type Sfx = {at: number; src: 'whoosh' | 'impact' | 'pop'; volume: number};

// Sound design, placed on the same cues as the graphics they belong to. Kept well under the
// voice: the finished mix gets ~10 dB of gain for YouTube loudness, and the SFX get it too.
const SFX: Sfx[] = [
  // a soft whoosh under every story wipe, and into the outro
  ...PARAS.slice(0, 7).map((p) => ({at: p.end + 0.02, src: 'whoosh' as const, volume: 0.2})),
  {at: cue("Here's your") + 0.05, src: 'impact', volume: 0.11},
  {at: cue('twenty dollars') - 0.05, src: 'impact', volume: 0.09},
  {at: cue('ten cents') - 0.05, src: 'impact', volume: 0.09},
  {at: cue('eighty percent'), src: 'impact', volume: 0.08},
  {at: cue('strongest'), src: 'pop', volume: 0.22},
  {at: cue('confirmed'), src: 'pop', volume: 0.22},
  {at: cue('ART') - 0.05, src: 'impact', volume: 0.09},
  {at: cue('December'), src: 'pop', volume: 0.22},
  {at: cue('six-point-four'), src: 'impact', volume: 0.11},
  {at: cue('rejected') - 0.02, src: 'impact', volume: 0.12},
  {at: cue('subscribe') + 0.35, src: 'pop', volume: 0.26},
];

const Scenes: React.FC = () => {
  const t = useT();
  // mount each story only around its own span, so the page never holds all of them at once
  const near = (i: number) => t > PARAS[i].start - 1.5 && t < PARAS[i].end + 1.5;
  return (
    <>
      {near(0) ? <Hook /> : null}
      {near(1) ? <PriceWar /> : null}
      {near(2) ? <Enzyme /> : null}
      {near(3) ? <Meta /> : null}
      {near(4) ? <Gemini /> : null}
      {near(5) ? <Island /> : null}
      {near(6) ? <UN /> : null}
      {t > PARAS[7].start - 1.5 ? <Outro /> : null}
    </>
  );
};

export const Video: React.FC = () => {
  const {fps} = useVideoConfig();
  return (
    <AbsoluteFill style={{background: '#0a0a0a'}}>
      <Field />
      <Plates />
      <StoryMarks layer="back" />
      <Scenes />
      <StoryMarks layer="front" />
      <Captions />
      <TopBar />
      <PlateCredit />

      <Audio src={staticFile('audio/vo-spaced.wav')} />
      <Audio src={staticFile('audio/music-bed.wav')} />
      {SFX.map((s, i) => (
        <Sequence key={i} from={Math.max(0, Math.round(s.at * fps))} durationInFrames={Math.round(2.2 * fps)} layout="none">
          <Audio src={staticFile(`audio/sfx/${s.src}-soft.wav`)} volume={s.volume} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
