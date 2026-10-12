import React from 'react';
import {Series} from 'remotion';
import {RAINY_DURATION, RainyMix, RainyNight} from '../rain/RainyNight';
import {SNOW_DURATION, SnowfallCabin, SnowfallMix} from '../snowfall/SnowfallCabin';
import {FIRE_DURATION, FireplaceMix, MidnightFireplace} from './MidnightFireplace';

/*
 * The films back to back: the narrated rainy night, then the fireplace and the snowfall cabin with
 * no narration. Each already fades to and from black (picture and sound), so every join is a soft
 * dip to black.
 */
export const SANCTUARY_DURATION = RAINY_DURATION + FIRE_DURATION + SNOW_DURATION; // 10952 = 456.333 s

export type SanctuaryProps = {rain: RainyMix; fire: FireplaceMix; snow: SnowfallMix};

export const SanctuaryNights: React.FC<SanctuaryProps> = ({rain, fire, snow}) => (
  <Series>
    <Series.Sequence durationInFrames={RAINY_DURATION} name="Rainy Night Sanctuary">
      <RainyNight mix={rain} />
    </Series.Sequence>
    <Series.Sequence durationInFrames={FIRE_DURATION} name="Midnight Fireplace Sanctuary">
      <MidnightFireplace mix={fire} />
    </Series.Sequence>
    <Series.Sequence durationInFrames={SNOW_DURATION} name="Snowfall at the Mountain Cabin">
      <SnowfallCabin mix={snow} />
    </Series.Sequence>
  </Series>
);
