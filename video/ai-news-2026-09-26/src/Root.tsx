import React from 'react';
import {Composition, Still} from 'remotion';
import {ThumbBreach, ThumbLocked, ThumbRace} from './Thumbnails';
import {FPS, H, W} from './theme';
import {TOTAL_FRAMES} from './timeline';
import {Video} from './Video';

export const Root: React.FC = () => (
  <>
    <Composition id="AINews" component={Video} durationInFrames={TOTAL_FRAMES} fps={FPS} width={W} height={H} />
    <Still id="ThumbBreach" component={ThumbBreach} width={1280} height={720} />
    <Still id="ThumbRace" component={ThumbRace} width={1280} height={720} />
    <Still id="ThumbLocked" component={ThumbLocked} width={1280} height={720} />
  </>
);
