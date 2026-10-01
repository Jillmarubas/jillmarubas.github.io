import React from 'react';
import {Composition} from 'remotion';
import {N1Test} from './news1001/Test';
import {N1_CHAPTERS, N1_DURATION, N1Film, N1Part} from './news1001/Film';
import {N1_QA, N1QA} from './news1001/QA';
import {PROMO_DURATION, Promo, PromoProps} from './promo/Promo';
import {SPACE_DURATION, Space} from './space/Space';
import {REAL_DURATION, RealMoon} from './real/RealMoon';
import {COLA_DURATION, ColaOrigin} from './cola/ColaOrigin';
import {DC_CHAPTERS, DC_DURATION, DCFilm, DCPart} from './dc/DC';
import {FOREST_LOOP, NightForest} from './forest/NightForest';
import {Thumbnail} from './dcc/Thumbnail';
import {KaijuThumb} from './kaiju/Thumb';
import {GRADIENT_LOOP, GradientLoop, GradientLoopNewsDemo} from './gradient/GradientLoop';
import {KAIJU_DURATION, KAIJU_QA, KaijuFilm, KaijuQA} from './kaiju/Film';
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
      <Composition id="GiantFromTheSea" component={KaijuFilm} durationInFrames={KAIJU_DURATION} fps={30} width={1920} height={1080} defaultProps={{offset: 0}} />
      <Composition id="GradientLoop4K" component={GradientLoop} durationInFrames={GRADIENT_LOOP} fps={30} width={3840} height={2160} />
      <Composition id="GradientNewsDemo" component={GradientLoopNewsDemo} durationInFrames={GRADIENT_LOOP} fps={30} width={1920} height={1080} />
      <Composition id="KaijuThumb" component={KaijuThumb} durationInFrames={1} fps={30} width={1920} height={1080} />
      <Composition id="KaijuQA" component={KaijuQA} durationInFrames={KAIJU_QA.length} fps={30} width={1920} height={1080} />
      <Composition id="CityThumb" component={Thumbnail} durationInFrames={1} fps={30} width={1920} height={1080} defaultProps={{night: false}} />
      <Composition id="CityQA" component={CityQA} durationInFrames={CITY_QA.length} fps={30} width={1920} height={1080} />
      <Composition id="DataCentresCity" component={CityFilm} durationInFrames={CITY_DURATION} fps={30} width={1920} height={1080} defaultProps={{offset: 0}} />
      {CITY_CHAPTERS.map((c, i) => (
        <Composition key={`city${i}`} id={`DataCentresCity-part${i}`} component={CityPart} durationInFrames={c.to - c.from} fps={30} width={1920} height={1080} defaultProps={{part: i}} />
      ))}
      <Composition id="NightForest" component={NightForest} durationInFrames={FOREST_LOOP} fps={30} width={1080} height={1920} />
    <Composition id="AINews1001" component={N1Film} durationInFrames={N1_DURATION} fps={24} width={1920} height={1080} defaultProps={{offset: 0}} />
    {N1_CHAPTERS.map((c, i) => (
      <Composition key={`n1${i}`} id={`AINews1001-part${i}`} component={N1Part} durationInFrames={c.to - c.from} fps={24} width={1920} height={1080} defaultProps={{part: i}} />
    ))}
    <Composition id="AINews1001QA" component={N1QA} durationInFrames={N1_QA.length} fps={24} width={1920} height={1080} />
    <Composition id="N1Test" component={N1Test} durationInFrames={120} fps={24} width={1920} height={1080} defaultProps={{logos: ['anthropic', 'kimi', 'oura'], place: 'whitehouse' as 'whitehouse' | 'ftc' | 'none'}} />
    </>
);
