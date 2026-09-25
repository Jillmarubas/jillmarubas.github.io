import React from 'react';
import {Composition, Still} from 'remotion';
import {Video} from './Video';
import {ThumbMystery, ThumbPriceWar, ThumbRisk, ThumbRiskWide} from './Thumbnails';
import {DURATION} from './lib/timeline';
import {FPS, H, W} from './theme';
import {fontsReady} from './lib/fonts';

void fontsReady;

export const Root: React.FC = () => (
  <>
    <Composition id="AINewsShort" component={Video} durationInFrames={Math.ceil(DURATION * FPS)} fps={FPS} width={W} height={H} />
    <Still id="ThumbRisk" component={ThumbRisk} width={W} height={H} />
    <Still id="ThumbPriceWar" component={ThumbPriceWar} width={W} height={H} />
    <Still id="ThumbMystery" component={ThumbMystery} width={W} height={H} />
    <Still id="ThumbRiskWide" component={ThumbRiskWide} width={1280} height={720} />
  </>
);
