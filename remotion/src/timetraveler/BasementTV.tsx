import React from 'react';
import {AbsoluteFill, Img, random, staticFile, useCurrentFrame} from 'remotion';

// The four friends watching TV in the basement, camera behind the couch.
// Assets: scripts/vectorcraft/basement.py. The TV plays the Jurassic forest (a still of
// JurassicLandscape). Light: the room is dark; the TV is the key light (cool, flickering a little),
// rimming their heads; a warm lamp on the left and faint light from the door up the stairs.

export const BASEMENT_DURATION = 180;
const W = 1920;
const H = 1080;
const SCREEN = {x: 690, y: 300, w: 540, h: 260};

const Back: React.FC<{who: string; x: number; y: number; s: number; tilt?: number}> = ({who, x, y, s, tilt = 0}) => (
  <Img
    src={staticFile(`timetraveler/basement/bBack${who}.svg`)}
    style={{position: 'absolute', left: x - 280 * s, top: y - 600 * s, width: 560 * s, height: 600 * s, transform: `rotate(${tilt}deg)`, transformOrigin: '50% 90%',
      filter: 'brightness(0.62) saturate(0.85) drop-shadow(0 0 3px rgba(150,200,255,0.9)) drop-shadow(0 0 10px rgba(110,170,255,0.45))'}}
  />
);

export const BasementTV: React.FC = () => {
  const f = useCurrentFrame();
  const flicker = 0.92 + 0.05 * Math.sin(f * 0.7) + 0.03 * Math.sin(f * 1.9);
  const pan = Math.sin(f / 60) * 6; // the TV picture drifts as if the show's camera is moving
  return (
    <AbsoluteFill style={{background: '#0d0f12', overflow: 'hidden'}}>
      <Img src={staticFile('timetraveler/basement/bRoom.svg')} style={{position: 'absolute', inset: 0, width: W, height: H}} />
      {/* the picture on the TV */}
      <div style={{position: 'absolute', left: SCREEN.x, top: SCREEN.y, width: SCREEN.w, height: SCREEN.h, overflow: 'hidden', background: '#000'}}>
        <Img src={staticFile('timetraveler/basement/tvshow.jpg')} style={{position: 'absolute', left: -20 + pan, top: -10, width: SCREEN.w + 40, height: SCREEN.h + 20, filter: `brightness(${1.1 * flicker}) saturate(1.1)`}} />
        <div style={{position: 'absolute', inset: 0, background: 'repeating-linear-gradient(rgba(0,0,0,0.12) 0 2px, rgba(0,0,0,0) 2px 4px)'}} />
        <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(120deg, rgba(255,255,255,0.12), rgba(255,255,255,0) 40%)'}} />
      </div>
      <Img src={staticFile('timetraveler/basement/bTV.svg')} style={{position: 'absolute', inset: 0, width: W, height: H}} />
      {/* darkness: the basement falls off into shadow away from the TV */}
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 60% 70% at 50% 42%, rgba(0,0,0,0) 0%, rgba(4,6,10,0.55) 55%, rgba(2,3,6,0.88) 100%)'}} />
      {/* the TV's cool glow on the wall, floor and ceiling */}
      <AbsoluteFill style={{mixBlendMode: 'screen', opacity: 0.55 * flicker, background: 'radial-gradient(ellipse 34% 40% at 50% 41%, rgba(140,190,255,0.75) 0%, rgba(90,140,220,0.25) 45%, rgba(0,0,0,0) 75%)'}} />
      {/* warm lamp glow at the left, and the door light at the top of the stairs */}
      <AbsoluteFill style={{mixBlendMode: 'screen', opacity: 0.5, background: 'radial-gradient(circle at 12% 70%, rgba(255,190,110,0.6) 0%, rgba(255,160,80,0.18) 18%, rgba(0,0,0,0) 34%)'}} />
      <AbsoluteFill style={{mixBlendMode: 'screen', opacity: 0.35, background: 'radial-gradient(ellipse 14% 22% at 77% 14%, rgba(255,210,140,0.75) 0%, rgba(0,0,0,0) 100%)'}} />
      {/* dust drifting in the TV light */}
      <svg width={W} height={H} style={{position: 'absolute', inset: 0, mixBlendMode: 'screen'}}>
        {Array.from({length: 40}).map((_, i) => {
          const x = 620 + random(`bx${i}`) * 680 + Math.sin(f / 50 + i) * 10;
          const y = 280 + ((random(`by${i}`) * 420 + f * 0.15) % 420);
          return <circle key={i} cx={x} cy={y} r={1 + random(`br${i}`) * 1.6} fill="#cfe2ff" opacity={0.45} />;
        })}
      </svg>
      {/* the four friends, from behind (left to right: Pip, the Traveler, Tank, Ria) */}
      <Back who="Pip" x={600} y={900} s={0.5} tilt={-3} />
      <Back who="Traveler" x={830} y={895} s={0.58} tilt={2} />
      <Back who="Tank" x={1100} y={890} s={0.66} />
      <Back who="Ria" x={1360} y={898} s={0.56} tilt={-2} />
      {/* the couch, in shadow, with the TV rim along its top */}
      <Img src={staticFile('timetraveler/basement/bCouch.svg')} style={{position: 'absolute', left: 0, top: 70, width: W, height: H, filter: 'brightness(0.5) drop-shadow(0 -2px 3px rgba(140,190,255,0.6))'}} />
      {/* a table lamp on the left side table, the warm light source */}
      <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
        <path d="M150 1080 L150 800 L330 800 L330 1080 Z" fill="#3a2a1c" stroke="#2a1b12" strokeWidth={5} />
        <path d="M230 800 L230 720" stroke="#2a1b12" strokeWidth={10} />
        <path d="M180 720 L280 720 L260 640 L200 640 Z" fill="#e8b46a" stroke="#2a1b12" strokeWidth={5} />
        <path d="M190 715 L270 715 L256 650 L204 650 Z" fill="#ffd89a" opacity={0.7} />
        <rect x={262} y={760} width={28} height={40} rx={4} fill="#b0303a" stroke="#2a1b12" strokeWidth={4} />
        <rect x={296} y={768} width={24} height={32} rx={4} fill="#3a7ab0" stroke="#2a1b12" strokeWidth={4} />
      </svg>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 60%, rgba(0,0,0,0.5) 100%)'}} />
      <AbsoluteFill style={{backgroundImage: `url(${staticFile('grain-1024.png')})`, backgroundSize: '1024px 1024px', mixBlendMode: 'overlay', opacity: 0.1}} />
    </AbsoluteFill>
  );
};
