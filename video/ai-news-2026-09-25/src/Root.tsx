import React from 'react';
import {Composition} from 'remotion';
import {Video} from './Video';
import {DURATION} from './lib/timeline';
import {FPS, H, W} from './theme';
import {fontsReady} from './lib/fonts';

void fontsReady;

export const Root: React.FC = () => (
  <Composition id="AINewsShort" component={Video} durationInFrames={Math.ceil(DURATION * FPS)} fps={FPS} width={W} height={H} />
);
