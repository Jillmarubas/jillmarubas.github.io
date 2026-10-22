import React from 'react';
import {Composition} from 'remotion';
import {DURATION, DocFxDemo, FPS} from './DocFxDemo';

// Separate entry point so the demo doesn't touch the main Root.tsx.
// Needs public/demodepth (run parallax/prep_depth.py first; see demodepth/README.md).
export const DocFxRoot: React.FC = () => (
  <Composition id="DocFxDemo" component={DocFxDemo} durationInFrames={DURATION} fps={FPS} width={1920} height={1080} />
);
