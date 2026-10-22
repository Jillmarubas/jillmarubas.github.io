import React from 'react';
import {Composition} from 'remotion';
import {CompressorCutaway} from './Compressor';
import {DURATION_S, FPS, H, W} from './compressor';

// Separate entry point so the demo doesn't touch the main Root.tsx.
export const CutawayRoot: React.FC = () => (
  <>
    <Composition id="CompressorCutaway" component={CompressorCutaway} durationInFrames={DURATION_S * FPS} fps={FPS} width={W} height={H} defaultProps={{sound: true}} />
  </>
);
