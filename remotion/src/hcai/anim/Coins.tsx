// Cold open 0:46–0:56. "...earned less than two dollars an hour, reading some of the darkest things human beings
// have ever written, so that you would never have to." Three panels on one long wall; the camera swings across them:
// the pay (two coins and an hour), the work (a screen of flagged text), and what it buys you (a polite answer).
import React from 'react';
import {AbsoluteFill, random} from 'remotion';
import {AF, AnimProps, Note, P, Tag, at, ease, lerp, pop} from './akit';

const Coin: React.FC<{x: number; y: number; s?: number}> = ({x, y, s = 1}) => (
  <svg width={220 * s} height={110 * s} viewBox="0 0 220 110" style={{position: 'absolute', left: x - 110 * s, top: y - 55 * s}}>
    <ellipse cx={110} cy={66} rx={104} ry={40} fill="#C98A00" />
    <rect x={6} y={46} width={208} height={20} fill="#C98A00" />
    <ellipse cx={110} cy={46} rx={104} ry={40} fill={P.yellow} />
    <ellipse cx={110} cy={46} rx={78} ry={28} fill="none" stroke="#E0A800" strokeWidth={6} />
    <text x={110} y={60} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={42} fill="#B07800">$1</text>
  </svg>
);

export const Coins: React.FC<AnimProps> = ({f, t0}) => {
  const w = (abs: number) => at(t0, abs);
  const toWork = ease(f, w(47.45), 20);
  const toYou = ease(f, w(51.55), 20);
  const camX = lerp(lerp(0, 1920, toWork), 3840, toYou);
  const swing = Math.sin(Math.PI * toWork) + Math.sin(Math.PI * toYou); // the camera turns a little while it travels
  const c1 = Math.max(0, Math.min(1, (f - w(46.4)) / 9));
  const c2 = Math.max(0, Math.min(1, (f - w(46.55)) / 9));
  const hand = ((f - w(47.0)) / 300) * 360;
  const scroll = Math.max(0, f - w(47.6)) * 3;
  const clean = ease(f, w(52.1), 14);
  return (
    <AbsoluteFill style={{background: P.night, overflow: 'hidden'}}>
      <AbsoluteFill style={{transform: `perspective(2200px) rotateY(${-6 * swing}deg) translateX(${-camX}px)`, transformOrigin: '50% 50%'}}>
        {/* 1: the pay */}
        <div style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, background: `radial-gradient(ellipse at 40% 50%, ${P.navy}, ${P.night})`}}>
          <div style={{position: 'absolute', left: 150, top: 300, fontFamily: AF.head, fontWeight: 800, fontSize: 300, lineHeight: 1, color: P.yellow, letterSpacing: '-0.03em', opacity: ease(f, 0, 8), transform: `translateY(${(1 - ease(f, 0, 14)) * 50}px)`}}>
            {'<$2'}
            <span style={{color: P.white, fontSize: 170}}>/hr</span>
          </div>
          <Note style={{position: 'absolute', left: 160, top: 660}} size={26} color="rgba(255,255,255,0.85)">$1.32–$2 an hour, take-home · Nairobi</Note>
          <Note style={{position: 'absolute', left: 160, top: 704}} size={20} color="rgba(255,255,255,0.6)">Source · TIME (January 2023)</Note>
          <Coin x={1380} y={lerp(-200, 690, c1 * c1)} s={1.4} />
          <Coin x={1380} y={lerp(-200, 640, c2 * c2)} s={1.4} />
          <div style={{position: 'absolute', left: 1620, top: 330, opacity: pop(f, w(47.0), 12) > 0 ? 1 : 0, transform: `scale(${pop(f, w(47.0), 12)})`}}>
            <svg width={200} height={200} viewBox="0 0 200 200">
              <circle cx={100} cy={100} r={88} fill={P.white} />
              <circle cx={100} cy={100} r={88} fill="none" stroke={P.yellow} strokeWidth={12} />
              {Array.from({length: 12}, (_, i) => (
                <rect key={i} x={97} y={20} width={6} height={16} rx={3} fill={P.ink} transform={`rotate(${i * 30} 100 100)`} />
              ))}
              <rect x={95} y={40} width={10} height={64} rx={5} fill={P.red} transform={`rotate(${hand} 100 100)`} />
              <circle cx={100} cy={100} r={9} fill={P.ink} />
            </svg>
            <Note style={{textAlign: 'center', marginTop: 10}}>1 hour</Note>
          </div>
        </div>
        {/* 2: the work */}
        <div style={{position: 'absolute', left: 1920, top: 0, width: 1920, height: 1080, background: `linear-gradient(135deg, #3B0D22, ${P.night})`}}>
          <div style={{position: 'absolute', left: 380, top: 170, width: 1160, height: 640, borderRadius: 26, background: '#14151C', boxShadow: `0 0 0 14px #2A2C36, 0 40px 90px rgba(0,0,0,0.6)`, overflow: 'hidden'}}>
            {Array.from({length: 24}, (_, i) => {
              const y = ((((i * 52 - scroll) % 1248) + 1248) % 1248) - 30; // the feed wraps round
              const flag = random(`fl${i}`) < 0.42;
              const len = 380 + random(`ln${i}`) * 520;
              return (
                <div key={i} style={{position: 'absolute', left: 50, top: y, display: 'flex', alignItems: 'center', gap: 18}}>
                  <div style={{width: len, height: 18, borderRadius: 9, background: flag ? '#4B1020' : '#3A3D4A'}} />
                  {flag && <div style={{fontFamily: AF.mono, fontWeight: 500, fontSize: 18, color: P.white, background: P.red, padding: '4px 12px', borderRadius: 8}}>FLAGGED</div>}
                </div>
              );
            })}
          </div>
          <div style={{position: 'absolute', left: 0, right: 0, top: 870, textAlign: 'center', opacity: ease(f, w(47.9), 10)}}>
            <Tag bg={P.white} color={P.ink} size={40}>
              The job: read and label the worst text online
            </Tag>
          </div>
          <Note style={{position: 'absolute', left: 0, right: 0, top: 960, textAlign: 'center', opacity: ease(f, w(48.6), 10)}} size={22}>
            so the AI learns what not to say
          </Note>
        </div>
        {/* 3: what you see */}
        <div style={{position: 'absolute', left: 3840, top: 0, width: 1920, height: 1080, background: `linear-gradient(135deg, ${P.teal}, ${P.blue})`}}>
          {/* dark lines go in, a clean answer comes out */}
          {Array.from({length: 7}, (_, i) => {
            const k = Math.max(0, Math.min(1, (f - w(51.7) - i * 4) / 26));
            return <div key={i} style={{position: 'absolute', left: lerp(80, 720, k), top: 260 + i * 80 + k * (360 - 260 - i * 80), width: 420 * (1 - k), height: 22, borderRadius: 11, background: '#4B1020', opacity: 1 - k}} />;
          })}
          <svg width={390} height={450} viewBox="0 0 260 300" style={{position: 'absolute', left: 600, top: 300}}>
            <path d="M10 20 H250 L160 150 V270 L100 290 V150 Z" fill={P.white} opacity={0.95} />
          </svg>
          <div style={{position: 'absolute', left: 1060, top: 340, width: 760, background: P.white, borderRadius: 34, padding: '36px 44px', fontFamily: AF.body, fontWeight: 500, fontSize: 46, lineHeight: 1.4, color: P.ink, boxShadow: '0 30px 60px rgba(0,0,0,0.25)', opacity: clean, transform: `translateY(${(1 - clean) * 40}px)`}}>
            Of course! I'd be glad to help. What do you need?
          </div>
          <div style={{position: 'absolute', left: 1060, top: 680, opacity: ease(f, w(52.6), 10)}}>
            <Tag bg={P.yellow} color={P.ink} size={44}>What you see</Tag>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
