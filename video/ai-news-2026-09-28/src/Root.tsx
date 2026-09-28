import React from 'react';
import {Composition, Still} from 'remotion';
import {ThumbEscape, ThumbHotline, ThumbRivals} from './Thumbnails';
import {FPS, H, W} from './theme';
import {TOTAL_FRAMES} from './timeline';
import {Video} from './Video';

export const Root: React.FC = () => (
  <>
    <Composition id="AINews" component={Video} durationInFrames={TOTAL_FRAMES} fps={FPS} width={W} height={H} />
    <Still id="ThumbEscape" component={ThumbEscape} width={1280} height={720} />
    <Still id="ThumbRivals" component={ThumbRivals} width={1280} height={720} />
    <Still id="ThumbHotline" component={ThumbHotline} width={1280} height={720} />
  </>
);
