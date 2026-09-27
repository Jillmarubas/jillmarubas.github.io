import React from 'react';
import {AbsoluteFill} from 'remotion';
import './fonts';
import {K, Person} from './art';
import {NO_FLAGS, P, World} from './world';

/*
 * YouTube thumbnail for the city-world edition: the data-centre campus at dusk (or night)
 * with the hum rolling out, angry neighbours up front, and four huge words.
 */
export const Thumbnail: React.FC<{night?: boolean}> = ({night}) => {
  const t = 200;
  const outline = (w: number, c = K.navy) => `${w}px ${w}px 0 ${c}, -${w}px ${w}px 0 ${c}, ${w}px -${w}px 0 ${c}, -${w}px -${w}px 0 ${c}, 0 ${w * 2}px 0 ${c}, 0 14px 30px rgba(0,0,0,0.35)`;
  return (
    <AbsoluteFill style={{background: K.sky1, overflow: 'hidden'}}>
      <World cam={{x: P.hallA - 330, y: -300, z: 1.0}} t={t} sky={night ? 4 : 0.35} fl={{...NO_FLAGS, hum: 1, hot: 1}} />
      {/* a red glow behind the building */}
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 30% 35% at 73% 62%, rgba(232,64,58,0.22), transparent 70%)'}} />
      {/* angry neighbours up front */}
      <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
        <g transform="translate(150 1060)">
          <Person seed={11} t={t} s={2.3} sign="NO!" wave />
        </g>
        <g transform="translate(330 1075)">
          <Person seed={7} t={t + 9} s={2.5} sign="NOT HERE" dir={-1} />
        </g>
        <g transform="translate(500 1060)">
          <Person seed={23} t={t + 4} s={2.3} wave />
        </g>
      </svg>
      {/* the words */}
      <div style={{position: 'absolute', left: 70, top: 44, fontFamily: 'Poppins', fontWeight: 800, fontSize: 158, lineHeight: 0.98, color: K.white, textShadow: outline(7), letterSpacing: '-0.01em', transform: 'rotate(-2deg)'}}>
        <div>THEY HATE</div>
        <div>
          THIS <span style={{color: K.yellow}}>BOX</span>
        </div>
      </div>
      {/* arrow to the building */}
      <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
        <path d="M 930 300 C 1120 260, 1270 330, 1330 470" fill="none" stroke={K.navy} strokeWidth={40} strokeLinecap="round" />
        <path d="M 1275 445 L 1340 525 L 1395 430" fill="none" stroke={K.navy} strokeWidth={40} strokeLinecap="round" strokeLinejoin="round" />
        <path d="M 930 300 C 1120 260, 1270 330, 1330 470" fill="none" stroke={K.red} strokeWidth={24} strokeLinecap="round" />
        <path d="M 1275 445 L 1340 525 L 1395 430" fill="none" stroke={K.red} strokeWidth={24} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </AbsoluteFill>
  );
};
