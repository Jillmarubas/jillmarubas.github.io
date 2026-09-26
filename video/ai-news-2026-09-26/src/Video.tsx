import React from 'react';
import {AbsoluteFill, Sequence, getInputProps, interpolate, useCurrentFrame} from 'remotion';
import {Chrome} from './components/Chrome';
import {Field} from './components/Field';
import {BrandSting, EndCard, RecapCard, StoryCard} from './scenes/Cards';
import {Mix} from './scenes/Mix';
import {SectionView} from './scenes/SectionView';
import {FPS} from './theme';
import {BLOCKS, TOTAL_FRAMES} from './timeline';

// The Lambda audio job only needs the audio tags. Laying out the picture as well made
// every frame ~0.4 s and timed that job out, so {audioOnly: true} renders just the mix.
const AUDIO_ONLY = Boolean((getInputProps() as {audioOnly?: boolean}).audioOnly);

export const Video: React.FC = () => {
  const frame = useCurrentFrame();
  if (AUDIO_ONLY) return <Mix />;
  const open = interpolate(frame, [0, 18], [0, 1], {extrapolateRight: 'clamp'});
  const close = interpolate(frame, [TOTAL_FRAMES - 30, TOTAL_FRAMES - 2], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{background: '#0a0a0a'}}>
      <AbsoluteFill style={{opacity: open * close}}>
        <Field />
        {BLOCKS.map((b, i) => {
          const from = Math.round(b.start * FPS);
          // VO sections keep rendering briefly after the voice ends so the last phrase can leave
          const len = Math.ceil(b.len * FPS) + (b.kind === 'vo' ? 14 : 0);
          const name = b.kind === 'vo' ? b.id : b.kind === 'card' ? `card ${b.story}` : b.kind;
          return (
            <Sequence key={i} from={from} durationInFrames={len} name={name}>
              {b.kind === 'vo' ? <SectionView id={b.id} /> : null}
              {b.kind === 'card' ? <StoryCard n={b.story} len={len} /> : null}
              {b.kind === 'sting' ? <BrandSting len={len} /> : null}
              {b.kind === 'recap' ? <RecapCard len={len} /> : null}
              {b.kind === 'end' ? <EndCard len={len} /> : null}
            </Sequence>
          );
        })}
        <Chrome />
      </AbsoluteFill>
      <Mix />
    </AbsoluteFill>
  );
};
