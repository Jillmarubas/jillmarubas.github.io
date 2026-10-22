import React from 'react';
import {Composition} from 'remotion';
import {Demo3D} from './Demo3D';
import {DURATION_S, FPS, H, W} from './city3d.js';

// Separate entry point so the demo doesn't touch the main Root.tsx.
export const Demo3DRoot: React.FC = () => (
  <Composition id="Demo3D" component={Demo3D} durationInFrames={DURATION_S * FPS} fps={FPS} width={W} height={H} />
);
