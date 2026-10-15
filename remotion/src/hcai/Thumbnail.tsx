import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {Words} from '../thumbs/HighlightThumb';
import type {ThumbStyle} from '../thumbs/HighlightThumb';

/*
 * YouTube thumbnails for "The Hidden Cost of AI" in the approved style (SOP "Thumbnails"):
 * a real, licensed photo full-bleed, a scrim in the film's darkest colour over the left
 * third, at most three accurate words. The story: The Dalles' water use, 355 million gallons in 2021,
 * which the city called a trade secret until a newspaper sued (The Oregonian, 2022).
 * Photos: Google data center, The Dalles (Tony Webster, CC BY 2.0); The Dalles from the air
 * (Sam Beebe, CC BY 2.0); water bottle cut out with rembg (Wikimedia Commons).
 */
const INK = '#1D1B18';
const rgba = (a: number) => `rgba(29,27,24,${a})`;
const Thumb: React.FC<{photo: string; style: ThumbStyle; pos?: string}> = ({photo, style, pos = '60% 50%'}) => (
  <AbsoluteFill style={{background: INK, overflow: 'hidden'}}>
    <Img src={staticFile(`hcai/img/${photo}.jpg`)} style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, objectFit: 'cover', objectPosition: pos, filter: 'contrast(1.1) saturate(1.15)'}} />
    <AbsoluteFill style={{background: `linear-gradient(90deg, ${rgba(0.96)} 0%, ${rgba(0.9)} 30%, ${rgba(0.35)} 52%, ${rgba(0)} 66%)`}} />
    {/* the bottle: the water the town wasn't allowed to know about */}
    <div style={{position: 'absolute', right: 120, top: 120, filter: 'drop-shadow(6px 0 0 #fff) drop-shadow(-6px 0 0 #fff) drop-shadow(0 6px 0 #fff) drop-shadow(0 -6px 0 #fff) drop-shadow(0 30px 40px rgba(0,0,0,0.6))', transform: 'rotate(8deg)'}}>
      <Img src={staticFile('hcai/cut/water_bottle.webp')} style={{display: 'block', height: 860}} />
    </div>
    <div style={{position: 'absolute', left: 80, top: style === 'highlighter' ? 250 : 110}}>
      <Words words={['355M', 'GALLONS', 'SECRET']} style={style} ink={INK} />
    </div>
    <AbsoluteFill style={{background: `radial-gradient(ellipse 80% 80% at 60% 50%, rgba(0,0,0,0) 55%, ${rgba(0.45)} 100%)`}} />
  </AbsoluteFill>
);
/** A (recommended): Google's data center in The Dalles, marker words. */
export const HCThumbA: React.FC = () => <Thumb photo="google_dalles" style="marker" pos="55% 60%" />;
/** B: same photo, highlighter words. */
export const HCThumbB: React.FC = () => <Thumb photo="google_dalles" style="highlighter" pos="55% 60%" />;
/** C: same words, The Dalles and the Columbia River from the air. */
export const HCThumbC: React.FC = () => <Thumb photo="dalles" style="marker" pos="50% 45%" />;
