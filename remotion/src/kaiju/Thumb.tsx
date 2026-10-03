import React from 'react';
import {AbsoluteFill} from 'remotion';
import './fonts';
import {Human} from './cast';
import {HC, Hero, MC, Monster} from './giants';
import {Beam, Fire, Skyline, Sky, Smoke, Sparks} from './sets';

/*
 * YouTube thumbnail for "The Giant from the Sea": the beam clash at the climax, a
 * frightened girl up front, and the claim in four words: OPUS 5.5 ANIMATED THIS.
 */
const Spark: React.FC<{size: number}> = ({size}) => (
  <g>
    {Array.from({length: 12}, (_, i) => {
      const len = size * (i % 3 === 0 ? 1 : i % 3 === 1 ? 0.78 : 0.88);
      return <rect key={i} x={-size * 0.075} y={-len} width={size * 0.15} height={len} rx={size * 0.075} fill="#D97757" transform={`rotate(${(i / 12) * 360 + (i % 2 ? 8 : 0)})`} />;
    })}
    <circle r={size * 0.14} fill="#D97757" />
  </g>
);

export const KaijuThumb: React.FC = () => {
  const t = 120;
  const mood = 3.6;
  const meet = [1010, 600];
  const hand = [300 + 330 * 0.66, 1090 - 760 * 0.66];
  const mouth = [1620 - 380 * 0.66, 1090 - 870 * 0.66];
  const stroke = (w: number) => `${w}px ${w}px 0 #1A1230, -${w}px ${w}px 0 #1A1230, ${w}px -${w}px 0 #1A1230, -${w}px -${w}px 0 #1A1230, 0 ${w * 2}px 0 #1A1230, 0 16px 34px rgba(0,0,0,0.5)`;
  return (
    <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
      <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0}}>
        <Sky mood={mood} t={t} horizon={1090} sun={[1500, 330]} />
        <Skyline mood={mood} t={t} x={-200} y={1090} w={2400} s={1.15} fire={1} broken={[3, 9, 16, 22]} />
        <Smoke t={t} x={420} y={900} s={2.2} n={6} col="#3B3450" />
        <Smoke t={t + 40} x={1500} y={880} s={2.4} n={6} col="#3B3450" />
        <g transform="translate(300 1090) scale(0.66)">
          <Hero t={t} turn={0.85} armR={90} elbowR={0} armL={20} elbowL={110} legA={20} legB={-20} crouch={0.12} glow={1} />
        </g>
        <g transform="translate(1620 1090) scale(0.66)">
          <Monster t={t} charge={1} jaw={1} />
        </g>
        <Beam t={t} x1={hand[0]} y1={hand[1]} x2={meet[0]} y2={meet[1]} col={HC.gold} w={46} k={1} />
        <Beam t={t + 5} x1={mouth[0]} y1={mouth[1]} x2={meet[0]} y2={meet[1]} col={MC.glow} w={52} k={1} />
        <circle cx={meet[0]} cy={meet[1]} r={300} fill="#FFE8A8" opacity={0.28} />
        <circle cx={meet[0]} cy={meet[1]} r={150} fill="#FFFFFF" opacity={0.95} />
        <Sparks t={5} t0={0} x={meet[0]} y={meet[1]} n={36} life={40} seed={7} col="#FFF3C4" />
        <g transform="translate(1250 1095)">
          <Fire t={t} s={1.3} />
        </g>
        {/* the frightened girl up front, looking up at the fight */}
        <g transform="translate(190 1500) scale(4.3)">
          <Human kid seed={8} girl t={t} emo="scream" lookY={-0.9} look={0.7} pose={{armL: 150, armR: 150, elbowL: 110, elbowR: 110}} hold="teddy" />
        </g>
        <rect width={1920} height={1080} fill="url(#vig)" />
        <defs>
          <radialGradient id="vig" cx="0.5" cy="0.5" r="0.75">
            <stop offset="0.6" stopColor="#000" stopOpacity={0} />
            <stop offset="1" stopColor="#000" stopOpacity={0.45} />
          </radialGradient>
        </defs>
        <g transform="translate(690 160)">
          <circle r={130} fill="#FFFFFF" opacity={0.18} />
          <circle r={96} fill="#1A1230" opacity={0.55} />
          <Spark size={96} />
        </g>
      </svg>
      <div style={{position: 'absolute', left: 810, top: 58, fontFamily: 'Fraunces', fontWeight: 900, fontSize: 176, lineHeight: 1, color: '#FFFFFF', textShadow: stroke(7), letterSpacing: '-0.01em'}}>OPUS 5.5</div>
      <div style={{position: 'absolute', left: 816, top: 250, fontFamily: 'Poppins', fontWeight: 800, fontSize: 100, lineHeight: 1, color: '#FFD23F', textShadow: stroke(6), letterSpacing: '0.02em'}}>ANIMATED THIS</div>
    </AbsoluteFill>
  );
};
