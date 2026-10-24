import React from 'react';
import {AbsoluteFill, Img, random, staticFile, useCurrentFrame} from 'remotion';

// Close-up, over the shoulder: the Traveler from behind, big and slightly soft in the lower left;
// a Diplodocus head lowering toward him, sharp, upper right (its eye on a third); the jungle far
// behind, blurred (depth of field), with mist, light shafts and dust from the upper right.
// Assets: scripts/vectorcraft/closeup.py, plus the landscape assets for the background.

export const CLOSEUP_DURATION = 180;
const W = 1920;
const H = 1080;

const img = (path: string, style: React.CSSProperties) => <Img src={staticFile(path)} style={{position: 'absolute', ...style}} />;

export const CloseUpOTS: React.FC = () => {
  const f = useCurrentFrame();
  const lower = Math.sin(Math.min(1, f / 150) * Math.PI / 2); // the head eases down toward him
  const breathe = Math.sin(f / 40) * 2;
  return (
    <AbsoluteFill style={{background: '#cfdcd8', overflow: 'hidden'}}>
      {/* far background: soft and out of focus */}
      <AbsoluteFill style={{filter: 'blur(9px)'}}>
        <AbsoluteFill style={{background: 'radial-gradient(ellipse at 78% 10%, #fff4d6 0%, #eef0e0 22%, #c9d8d5 55%, #a9bcbe 100%)'}} />
        {img('timetraveler/jurassic/jFar.svg', {left: -400, top: 120, width: 2400, height: 1080})}
        {[[-80, 0.5], [260, 0.42], [1460, 0.55], [1760, 0.45], [980, 0.36]].map(([x, s], i) => (
          <Img key={i} src={staticFile(`timetraveler/jurassic/araucaria${[11, 23, 37][i % 3]}.svg`)} style={{position: 'absolute', left: x - 600 * s, top: 1180 - 1560 * s, width: 1200 * s, height: 1600 * s, opacity: 0.75, filter: 'saturate(0.6) brightness(1.1)'}} />
        ))}
        <div style={{position: 'absolute', left: 0, top: 560, width: W, height: 520, background: 'linear-gradient(rgba(214,226,228,0), rgba(214,226,228,0.85))'}} />
        {[[-60, 0.7], [420, 0.6], [1500, 0.75]].map(([x, s], i) => (
          <Img key={i} src={staticFile(`timetraveler/jurassic/${i % 2 ? 'pTreeFernA' : 'pTreeFernB'}.svg`)} style={{position: 'absolute', left: x, top: 1100 - 890 * s, width: 700 * s, height: 900 * s, opacity: 0.85}} />
        ))}
      </AbsoluteFill>
      {/* light shafts behind the subjects */}
      <AbsoluteFill style={{mixBlendMode: 'screen', opacity: 0.6}}>
        {[[1250, 260, 0.4], [1500, 200, 0.32], [1050, 160, 0.22]].map(([x, w, o], i) => (
          <div key={i} style={{position: 'absolute', left: x, top: -240, width: w, height: 1600, transformOrigin: 'top center', transform: `rotate(${24 + i * 3}deg)`, background: 'linear-gradient(rgba(255,240,205,0.95), rgba(255,240,205,0))', opacity: o, filter: 'blur(24px)'}} />
        ))}
      </AbsoluteFill>
      {/* the Diplodocus: sharp, the focal point */}
      <div style={{position: 'absolute', left: 430, top: -150 + lower * 40, width: 1400 * 1.15, height: 1000 * 1.15, transformOrigin: '100% 0%', transform: `rotate(${-2 + lower * 2}deg)`}}>
        {img('timetraveler/closeup/cuDiploHead.svg', {left: 0, top: 0, width: 1400 * 1.15, height: 1000 * 1.15})}
      </div>
      {/* dust in the light */}
      <svg width={W} height={H} style={{position: 'absolute', inset: 0, mixBlendMode: 'screen'}}>
        {Array.from({length: 70}).map((_, i) => {
          const x = 700 + random(`dx${i}`) * 1100 + Math.sin(f / 40 + i) * 14;
          const y = ((random(`dy${i}`) * 1000 + f * (0.25 + random(`ds${i}`) * 0.3)) % 1000) + 40;
          const r = 1 + random(`dr${i}`) * 3;
          return <circle key={i} cx={x} cy={y} r={r} fill="#fff4d6" opacity={0.5} style={{filter: r > 3 ? 'blur(1.5px)' : undefined}} />;
        })}
      </svg>
      {/* the Traveler from behind: big, slightly soft, a little darker (his back is in shade) */}
      <div style={{position: 'absolute', left: -70, top: 420 + breathe, width: 900 * 0.86, height: 1000 * 0.86, filter: 'blur(1.6px) brightness(0.9)'}}>
        {img('timetraveler/closeup/cuTravelerBack.svg', {left: 0, top: 0, width: 900 * 0.86, height: 1000 * 0.86})}
      </div>
      {/* finish */}
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 60% 42%, rgba(0,0,0,0) 48%, rgba(6,16,12,0.55) 100%)'}} />
      <AbsoluteFill style={{backgroundImage: `url(${staticFile('grain-1024.png')})`, backgroundSize: '1024px 1024px', mixBlendMode: 'overlay', opacity: 0.08}} />
    </AbsoluteFill>
  );
};
