// Animated scenes by name, as edits.json and strip.json refer to them (mode anim, anim3d or image).
import React from 'react';
import {AnimProps} from './akit';
import {Chain} from './Chain';
import {Coins} from './Coins';
import {Laptop} from './Laptop';
import {Goliath, Newspaper} from './Paper';
import {Glass, Thinker} from './Three3D';
import {Town} from './Town';

export const ANIMS: Record<string, React.FC<AnimProps>> = {
  laptop: Laptop,
  town: Town,
  newspaper: Newspaper,
  goliath: Goliath,
  glass: Glass,
  coins: Coins,
  chain: Chain,
  thinker: Thinker,
};
