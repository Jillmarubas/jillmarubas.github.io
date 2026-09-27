import React from 'react';
import {Composition} from 'remotion';
import {PROMO_DURATION, Promo, PromoProps} from './promo/Promo';
import {SPACE_DURATION, Space} from './space/Space';
import {REAL_DURATION, RealMoon} from './real/RealMoon';
import {COLA_DURATION, ColaOrigin} from './cola/ColaOrigin';
import {DC_CHAPTERS, DC_DURATION, DCFilm, DCPart} from './dc/DC';
import {FOREST_LOOP, NightForest} from './forest/NightForest';
import {CITY_CHAPTERS, CITY_DURATION, CITY_QA, CityFilm, CityPart, CityQA} from './dcc/Film';
import {BG_DURATION, BgDrafting, BgFizz, BgKinetic} from './cola/Backgrounds';

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
    <Composition id="ColaOrigin" component={ColaOrigin} durationInFrames={COLA_DURATION} fps={30} width={1080} height={1920} defaultProps={{sound: true}} />
    <Composition id="BgA" component={BgDrafting} durationInFrames={BG_DURATION} fps={30} width={1080} height={1920} />
    <Composition id="BgB" component={BgKinetic} durationInFrames={BG_DURATION} fps={30} width={1080} height={1920} />
    <Composition id="BgC" component={BgFizz} durationInFrames={BG_DURATION} fps={30} width={1080} height={1920} />
      <Composition id="DataCentres" component={DCFilm} durationInFrames={DC_DURATION} fps={30} width={1920} height={1080} defaultProps={{offset: 0}} />
    {DC_CHAPTERS.map((c, i) => (
      <Composition key={i} id={`DataCentres-part${i}`} component={DCPart} durationInFrames={c.to - c.from} fps={30} width={1920} height={1080} defaultProps={{part: i}} />
    ))}
      <Composition id="CityQA" component={CityQA} durationInFrames={CITY_QA.length} fps={30} width={1920} height={1080} />
      <Composition id="DataCentresCity" component={CityFilm} durationInFrames={CITY_DURATION} fps={30} width={1920} height={1080} defaultProps={{offset: 0}} />
      {CITY_CHAPTERS.map((c, i) => (
        <Composition key={`city${i}`} id={`DataCentresCity-part${i}`} component={CityPart} durationInFrames={c.to - c.from} fps={30} width={1920} height={1080} defaultProps={{part: i}} />
      ))}
      <Composition id="NightForest" component={NightForest} durationInFrames={FOREST_LOOP} fps={30} width={1080} height={1920} />
  </>
);
