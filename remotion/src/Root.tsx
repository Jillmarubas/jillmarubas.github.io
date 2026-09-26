import React from 'react';
import {Composition} from 'remotion';
import {PROMO_DURATION, Promo, PromoProps} from './promo/Promo';
import {SPACE_DURATION, Space} from './space/Space';
import {REAL_DURATION, RealMoon} from './real/RealMoon';

export const Root: React.FC = () => (
  <>
    <Composition
      id="BrandStory"
      component={Promo}
      durationInFrames={PROMO_DURATION}
      fps={30}
      width={1080}
      height={1920}
      defaultProps={
        {
          brand: 'Moonbrew',
          from: 'a $40K garage',
          valuation: '200 MILLION',
          years: 'in just 4 years',
          proof: 'From one borrowed espresso machine to shelves in 30 countries, without a single TV ad.',
          notJust: 'it was never just',
          product: 'about coffee',
          insight: 'People line up for how the can makes them feel, not for the caffeine.',
          selling: "they're selling a",
          idea: 'RITUAL',
          ideaBody: 'Same time, same can, same late-night feeling. That habit is the real product.',
          ctaSmall: 'DM for',
          ctaBig: 'BRAND VIDEOS',
          sound: true,
        } satisfies PromoProps
      }
    />
    <Composition id="MoonDistance" component={Space} durationInFrames={SPACE_DURATION} fps={30} width={1080} height={1920} defaultProps={{sound: true}} />
    <Composition id="RealMoon" component={RealMoon} durationInFrames={REAL_DURATION} fps={30} width={1080} height={1920} defaultProps={{sound: true}} />
  </>
);
