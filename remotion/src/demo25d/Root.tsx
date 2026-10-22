import React from 'react';
import {Composition} from 'remotion';
import {Demo25D} from './Demo25D';
import {DURATION, FPS, H, W} from './shot';

// Separate entry point so the demo doesn't touch the main Root.tsx.
export const DemoRoot: React.FC = () => (
  <>
    <Composition id="Demo25D" component={Demo25D} durationInFrames={DURATION} fps={FPS} width={W} height={H} defaultProps={{engine: 'three' as const}} />
    <Composition id="Demo25DCss" component={Demo25D} durationInFrames={DURATION} fps={FPS} width={W} height={H} defaultProps={{engine: 'css' as const}} />
  </>
);
