import React from 'react';
import {Composition} from 'remotion';
import {AV, TeardownAvatar} from './Avatar';

// Channel brand stills (separate entry point).
export const BrandRoot: React.FC = () => <Composition id="TeardownAvatar" component={TeardownAvatar} durationInFrames={1} fps={30} width={AV} height={AV} />;
