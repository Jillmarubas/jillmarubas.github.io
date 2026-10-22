import React from 'react';
import {Composition} from 'remotion';
import {DemoDepth} from './DemoDepth';
import {DURATION_S, FPS, H, W} from './depthscene.js';

// Separate entry point so the demo doesn't touch the main Root.tsx.
export const DemoDepthRoot: React.FC = () => (
  <>
    <Composition id="DepthA" component={DemoDepth} durationInFrames={DURATION_S * FPS} fps={FPS} width={W} height={H} defaultProps={{method: 'depth' as const}} />
    <Composition id="DepthB" component={DemoDepth} durationInFrames={DURATION_S * FPS} fps={FPS} width={W} height={H} defaultProps={{method: 'hybrid' as const}} />
    <Composition id="DepthC" component={DemoDepth} durationInFrames={DURATION_S * FPS} fps={FPS} width={W} height={H} defaultProps={{method: 'holes' as const}} />
  </>
);
