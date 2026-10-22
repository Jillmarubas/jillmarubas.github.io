import React from 'react';
import {Composition} from 'remotion';
import {ArchiveParallax} from '../parallax/ArchiveParallax';
import {DURATION_S, FPS, H, W} from '../parallax/depthscene.js';

// Separate entry point so the demo doesn't touch the main Root.tsx.
// Layers in public/demodepth come from:
//   prep_depth.py dust.jpg public/demodepth --crop 0.038,0.960 --cy 0.585
const common = {component: ArchiveParallax, durationInFrames: DURATION_S * FPS, fps: FPS, width: W, height: H};
export const DemoDepthRoot: React.FC = () => (
  <>
    <Composition id="DepthA" {...common} defaultProps={{dir: 'demodepth', method: 'depth' as const}} />
    <Composition id="DepthB" {...common} defaultProps={{dir: 'demodepth', method: 'hybrid' as const}} />
    <Composition id="DepthC" {...common} defaultProps={{dir: 'demodepth', method: 'holes' as const}} />
  </>
);
