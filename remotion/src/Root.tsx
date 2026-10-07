import React from 'react';
import {Composition} from 'remotion';
import {N1Test} from './news1001/Test';
import {N1_CHAPTERS, N1_DURATION, N1Film, N1Part} from './news1001/Film';
import {N1_QA, N1QA} from './news1001/QA';
import {N3_CHAPTERS, N3_DURATION, N3Film, N3Part} from './news1003/Film';
import {N3_QA, N3QA} from './news1003/QA';
import {N3ThumbA, N3ThumbB, N3ThumbC} from './news1003/Thumbnail';
import {N1ThumbD, N1ThumbE, N1ThumbF} from './news1001/Thumbnail';
import {PROMO_DURATION, Promo, PromoProps} from './promo/Promo';
import {SPACE_DURATION, Space} from './space/Space';
import {REAL_DURATION, RealMoon} from './real/RealMoon';
import {COLA_DURATION, ColaOrigin} from './cola/ColaOrigin';
import {DC_CHAPTERS, DC_DURATION, DCFilm, DCPart} from './dc/DC';
import {FOREST_LOOP, NightForest} from './forest/NightForest';
import {RainyTavern, TAVERN_FULL, TAVERN_TEST} from './tavern/RainyTavern';
import {VEO_FULL, VEO_TEST, VeoTavern} from './tavern/VeoTavern';
import {MULTI_FULL, MULTI_TEST, MultiTavern} from './tavern/MultiTavern';
import {STILL_FULL, STILL_TEST, StillTavern} from './tavern/StillTavern';
import {REAL_TAVERN_FULL, REAL_TAVERN_TEST, RealTavern} from './tavern/RealTavern';
import {Thumbnail} from './dcc/Thumbnail';
import {KaijuThumb} from './kaiju/Thumb';
import {GRADIENT_LOOP, GradientLoop, GradientLoopNewsDemo} from './gradient/GradientLoop';
import {KAIJU_DURATION, KAIJU_QA, KaijuFilm, KaijuQA} from './kaiju/Film';
import {CITY_CHAPTERS, CITY_DURATION, CITY_QA, CityFilm, CityPart, CityQA} from './dcc/Film';
import {DEMO_DURATION, TutorialDemo} from './tutorial/Demo';
import {CC_DURATION, CC_PARTS, CCFilm, CCPart} from './cc1003/Film';
import {CCThumbA, CCThumbB, CCThumbC, CCThumbD} from './cc1003/Thumbnail';
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
      <Composition id="TavernVeoTest" component={VeoTavern} durationInFrames={VEO_TEST} fps={30} width={1920} height={1080} defaultProps={{frames: VEO_TEST, sound: true}} />
      <Composition id="TavernVeoFull" component={VeoTavern} durationInFrames={VEO_FULL} fps={30} width={1920} height={1080} defaultProps={{frames: VEO_FULL, sound: true}} />
      <Composition id="TavernMultiTest" component={MultiTavern} durationInFrames={MULTI_TEST} fps={30} width={1920} height={1080} defaultProps={{frames: MULTI_TEST, sound: true}} />
      <Composition id="TavernMultiFull" component={MultiTavern} durationInFrames={MULTI_FULL} fps={30} width={1920} height={1080} defaultProps={{frames: MULTI_FULL, sound: true}} />
      <Composition id="TavernStillTest" component={StillTavern} durationInFrames={STILL_TEST} fps={30} width={1920} height={1080} defaultProps={{frames: STILL_TEST, sound: true}} />
      <Composition id="TavernStillFull" component={StillTavern} durationInFrames={STILL_FULL} fps={30} width={1920} height={1080} defaultProps={{frames: STILL_FULL, sound: true}} />
      <Composition id="TavernRealTest" component={RealTavern} durationInFrames={REAL_TAVERN_TEST} fps={30} width={1920} height={1080} defaultProps={{frames: REAL_TAVERN_TEST, sound: true}} />
      <Composition id="TavernRealFull" component={RealTavern} durationInFrames={REAL_TAVERN_FULL} fps={30} width={1920} height={1080} defaultProps={{frames: REAL_TAVERN_FULL, sound: true}} />
      <Composition id="TavernTest" component={RainyTavern} durationInFrames={TAVERN_TEST} fps={30} width={1920} height={1080} defaultProps={{frames: TAVERN_TEST, sound: true}} />
      <Composition id="TavernFull" component={RainyTavern} durationInFrames={TAVERN_FULL} fps={30} width={1920} height={1080} defaultProps={{frames: TAVERN_FULL, sound: true}} />
      <Composition id="NightForest" component={NightForest} durationInFrames={FOREST_LOOP} fps={30} width={1080} height={1920} />
    <Composition id="ClaudeCodeMods" component={CCFilm} durationInFrames={CC_DURATION} fps={60} width={1920} height={1080} />
    {CC_PARTS.map((p, i) => (
      <Composition key={`cc${i}`} id={`ClaudeCodeMods-part${i}`} component={CCPart} durationInFrames={p.to - p.from} fps={60} width={1920} height={1080} defaultProps={{part: i}} />
    ))}
    <Composition id="CCThumbA" component={CCThumbA} durationInFrames={1} fps={30} width={1920} height={1080} />
    <Composition id="CCThumbB" component={CCThumbB} durationInFrames={1} fps={30} width={1920} height={1080} />
    <Composition id="CCThumbC" component={CCThumbC} durationInFrames={1} fps={30} width={1920} height={1080} />
    <Composition id="CCThumbD" component={CCThumbD} durationInFrames={1} fps={30} width={1920} height={1080} />
    <Composition id="TutorialDemo" component={TutorialDemo} durationInFrames={DEMO_DURATION} fps={30} width={1920} height={1080} />
    <Composition id="AINews1001" component={N1Film} durationInFrames={N1_DURATION} fps={24} width={1920} height={1080} defaultProps={{offset: 0}} />
    {N1_CHAPTERS.map((c, i) => (
      <Composition key={`n1${i}`} id={`AINews1001-part${i}`} component={N1Part} durationInFrames={c.to - c.from} fps={24} width={1920} height={1080} defaultProps={{part: i}} />
    ))}
    <Composition id="AINews1003" component={N3Film} durationInFrames={N3_DURATION} fps={24} width={1920} height={1080} defaultProps={{offset: 0}} />
    {N3_CHAPTERS.map((c, i) => (
      <Composition key={`n3${i}`} id={`AINews1003-part${i}`} component={N3Part} durationInFrames={c.to - c.from} fps={24} width={1920} height={1080} defaultProps={{part: i}} />
    ))}
    <Composition id="N3ThumbA" component={N3ThumbA} durationInFrames={1} fps={24} width={1920} height={1080} />
    <Composition id="N3ThumbB" component={N3ThumbB} durationInFrames={1} fps={24} width={1920} height={1080} />
    <Composition id="N3ThumbC" component={N3ThumbC} durationInFrames={1} fps={24} width={1920} height={1080} />
    <Composition id="AINews1003QA" component={N3QA} durationInFrames={N3_QA.length} fps={24} width={1920} height={1080} />
    <Composition id="AINews1001QA" component={N1QA} durationInFrames={N1_QA.length} fps={24} width={1920} height={1080} />
    <Composition id="N1ThumbD" component={N1ThumbD} durationInFrames={1} fps={24} width={1920} height={1080} />
    <Composition id="N1ThumbE" component={N1ThumbE} durationInFrames={1} fps={24} width={1920} height={1080} />
    <Composition id="N1ThumbF" component={N1ThumbF} durationInFrames={1} fps={24} width={1920} height={1080} />
    <Composition id="N1Test" component={N1Test} durationInFrames={120} fps={24} width={1920} height={1080} defaultProps={{logos: ['anthropic', 'kimi', 'oura'], place: 'whitehouse' as 'whitehouse' | 'ftc' | 'none'}} />
    </>
);
