import React from 'react';
import {Series} from 'remotion';
import {RAINY_DURATION, RainyMix, RainyNight} from '../rain/RainyNight';
import {FIRE_DURATION, FireplaceMix, MidnightFireplace} from './MidnightFireplace';

/*
 * Both films back to back: the narrated rainy night, then the fireplace with no narration.
 * Each already fades to and from black (picture and sound), so the join is a soft dip to black.
 */
export const SANCTUARY_DURATION = RAINY_DURATION + FIRE_DURATION; // 6919 = 288.292 s

export type SanctuaryProps = {rain: RainyMix; fire: FireplaceMix};

export const SanctuaryNights: React.FC<SanctuaryProps> = ({rain, fire}) => (
  <Series>
    <Series.Sequence durationInFrames={RAINY_DURATION} name="Rainy Night Sanctuary">
      <RainyNight mix={rain} />
    </Series.Sequence>
    <Series.Sequence durationInFrames={FIRE_DURATION} name="Midnight Fireplace Sanctuary">
      <MidnightFireplace mix={fire} />
    </Series.Sequence>
  </Series>
);
