// Animated scenes by name, as edits.json and strip.json refer to them (mode anim, anim3d or image).
import React from 'react';
import {AnimProps} from './akit';
import {Chain} from './Chain';
import {Coins} from './Coins';
import {Laptop} from './Laptop';
import {Goliath, Gpu, Gpu2, Newspaper} from './Paper';
import {Glass, Thinker} from './Three3D';
import {Town} from './Town';
import {CoBoxtown, CoCampus} from './co';
import {C1Cloud, C1Buildings, C1Journey, C1DiveIn, C1Games, C1Parallel, C1Watts, C1Scale, C1Heat, C1HotAisle, C1Sound} from './ch1a';
import {C1Neighbours, C1Training, C1Factory, C1Inference, C1Users, C1Tiny, C1Heavier, C1Bigger, C1Stargate, C1HalfTrillion, C1Loop, C1TwoThings, C1Strange} from './ch1b';

export const ANIMS: Record<string, React.FC<AnimProps>> = {
  laptop: Laptop,
  town: Town,
  newspaper: Newspaper,
  goliath: Goliath,
  glass: Glass,
  coins: Coins,
  chain: Chain,
  thinker: Thinker,
  gpu: Gpu,
  gpu2: Gpu2,
  cocampus: CoCampus,
  coboxtown: CoBoxtown,
  c1cloud: C1Cloud,
  c1buildings: C1Buildings,
  c1journey: C1Journey,
  c1divein: C1DiveIn,
  c1games: C1Games,
  c1parallel: C1Parallel,
  c1watts: C1Watts,
  c1scale: C1Scale,
  c1heat: C1Heat,
  c1hotaisle: C1HotAisle,
  c1sound: C1Sound,
  c1neighbours: C1Neighbours,
  c1training: C1Training,
  c1factory: C1Factory,
  c1inference: C1Inference,
  c1users: C1Users,
  c1tiny: C1Tiny,
  c1heavier: C1Heavier,
  c1bigger: C1Bigger,
  c1stargate: C1Stargate,
  c1halftrillion: C1HalfTrillion,
  c1loop: C1Loop,
  c1twothings: C1TwoThings,
  c1strange: C1Strange,
};
