// The three app tiles as standalone reference images for the user's Higgsfield thumbnail work.
// On a dark background: the coloured glow bands badly on transparency.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {B, ORDER, Tile} from './brand';

const BG = 'radial-gradient(70% 70% at 50% 50%, #17181C 0%, #0B0B0D 100%)';

export const IconTile: React.FC<{b: B}> = ({b}) => (
  <AbsoluteFill style={{background: BG, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
    <Tile b={b} size={620} glow={0.9} />
  </AbsoluteFill>
);

export const IconRow: React.FC = () => (
  <AbsoluteFill style={{background: BG, display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 160}}>
    {ORDER.map((b) => <Tile key={b} b={b} size={460} glow={0.9} />)}
  </AbsoluteFill>
);
