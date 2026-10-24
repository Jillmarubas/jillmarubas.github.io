import React from 'react';
import {Composition} from 'remotion';
import {AV, TeardownAvatar} from './Avatar';
import {BH, BW, TeardownBanner} from './Banner';

// Channel brand stills (separate entry point).
export const BrandRoot: React.FC = () => (
  <>
    <Composition id="TeardownAvatar" component={TeardownAvatar} durationInFrames={1} fps={30} width={AV} height={AV} />
    <Composition id="TeardownBanner" component={TeardownBanner} durationInFrames={1} fps={30} width={BW} height={BH} defaultProps={{guides: false}} />
  </>
);
