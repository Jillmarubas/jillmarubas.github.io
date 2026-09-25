import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useVideoConfig} from 'remotion';
import {Field} from './components/Field';
import {Captions} from './components/Captions';
import {StoryMarks, TopBar} from './components/Chrome';
import {Hook} from './scenes/Hook';
import {PriceWar} from './scenes/PriceWar';
import {Enzyme} from './scenes/Enzyme';
import {Meta} from './scenes/Meta';
import {Gemini, Island, Outro, UN} from './scenes/Rest';
import {useT} from './lib/anim';
import {cue, PARAS} from './lib/timeline';

type Sfx = {at: number; src: 'whoosh' | 'impact' | 'pop' | 'riser' | 'glitch'; volume: number};

// Sound design, placed on the same cues as the graphics they belong to.
const SFX: Sfx[] = [
  // a whoosh under every story wipe, and into the outro
  ...PARAS.slice(0, 7).map((p) => ({at: p.end + 0.02, src: 'whoosh' as const, volume: 0.45})),
  {at: cue('risk') - 0.02, src: 'glitch', volume: 0.35},
  {at: cue("Here's your") - 1.5, src: 'riser', volume: 0.22},
  {at: cue("Here's your") + 0.05, src: 'impact', volume: 0.4},
  {at: cue('twenty dollars') - 0.05, src: 'impact', volume: 0.32},
  {at: cue('ten cents') - 0.05, src: 'impact', volume: 0.32},
  {at: cue('eighty percent'), src: 'impact', volume: 0.28},
  {at: cue('strongest'), src: 'pop', volume: 0.35},
  {at: cue('confirmed'), src: 'pop', volume: 0.35},
  {at: cue('ART') - 0.05, src: 'impact', volume: 0.3},
  {at: cue('Nobody knows'), src: 'glitch', volume: 0.25},
  {at: cue('December'), src: 'pop', volume: 0.35},
  {at: cue('six-point-four'), src: 'impact', volume: 0.38},
  {at: cue('rejected') - 0.02, src: 'impact', volume: 0.42},
  {at: cue('subscribe') + 0.35, src: 'pop', volume: 0.45},
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
      <StoryMarks layer="back" />
      <Scenes />
      <StoryMarks layer="front" />
      <Captions />
      <TopBar />

      <Audio src={staticFile('audio/vo-spaced.wav')} />
      <Audio src={staticFile('audio/music-bed.wav')} />
      {SFX.map((s, i) => (
        <Sequence key={i} from={Math.max(0, Math.round(s.at * fps))} durationInFrames={Math.round(2.2 * fps)} layout="none">
          <Audio src={staticFile(`audio/sfx/${s.src}.mp3`)} volume={s.volume} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
