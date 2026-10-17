// Thumbnail for "The Cyclone": a frightened Dorothy holding Toto, the cyclone lifting the house behind her.
// Blue storm vs warm orange light (complementary). Text top-right, bottom-right left clear for the timestamp.
import React from 'react';
import {AbsoluteFill, staticFile} from 'remotion';
import {Person, Toto} from '../oz/human';
import {DOROTHY} from '../oz/cast';
import {House} from '../oz/kansas';
import {OzDefs, cutC} from '../oz/look';
import {Cut, Pt} from '../paperkite/kit';

type V = {gaze: number; flip: boolean; text: [string, string]};
const VARIANTS: Record<string, V> = {
  a: {gaze: -1, flip: false, text: ['HOLD ON,', 'TOTO!']},
  b: {gaze: 1, flip: true, text: ['HOLD ON,', 'TOTO!']},
  c: {gaze: -1, flip: false, text: ['IT’S', 'COMING']},
};

const Funnel: React.FC<{x: number; y: number; w: number; h: number}> = ({x, y, w, h}) => {
  const N = 16;
  const L: Pt[] = [];
  const R: Pt[] = [];
  for (let i = 0; i <= N; i++) {
    const k = i / N;
    const half = w * (0.1 + 0.9 * Math.pow(k, 1.7)) * 0.5;
    const cx = x + Math.sin(k * 4) * w * 0.08;
    L.push([cx - half, y - k * h]);
    R.push([cx + half, y - k * h]);
  }
  return (
    <g>
      <Cut d={cutC([...L, ...R.reverse()], 'tfun', 5, 24)} fill="#3C4A57" lift={2} edge={0.2} />
      {[0.2, 0.38, 0.56, 0.74, 0.9].map((k, i) => {
        const half = w * (0.1 + 0.9 * Math.pow(k, 1.7)) * 0.5;
        const cx = x + Math.sin(k * 4) * w * 0.08;
        return <path key={i} d={`M${cx - half} ${y - k * h} q${half} 26 ${half * 2} -8`} stroke="rgba(15,20,28,0.4)" strokeWidth={10} fill="none" />;
      })}
    </g>
  );
};

export const OzThumb: React.FC<{v?: string}> = ({v = 'a'}) => {
  const V = VARIANTS[v] ?? VARIANTS.a;
  return (
    <AbsoluteFill style={{background: '#14202C'}}>
      <svg width={1920} height={1080} viewBox="0 0 1920 1080">
        <OzDefs />
        <defs>
          <linearGradient id="thSky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#0F1A2A" />
            <stop offset="0.55" stopColor="#24425E" />
            <stop offset="0.82" stopColor="#E0742A" />
            <stop offset="1" stopColor="#F2A23A" />
          </linearGradient>
          <radialGradient id="rim" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#FFB04A" stopOpacity={0.55} />
            <stop offset="1" stopColor="#FFB04A" stopOpacity={0} />
          </radialGradient>
          <filter id="soft"><feGaussianBlur stdDeviation="5" /></filter>
        </defs>
        {/* background: storm, horizon glow, the funnel lifting the house (soft focus) */}
        <g filter="url(#soft)">
          <rect width={1920} height={1080} fill="url(#thSky)" />
          <path d="M0 860 L1920 840 L1920 1080 L0 1080 Z" fill="#3A2A1E" />
          <Funnel x={1300} y={900} w={560} h={900} />
          <g transform="translate(1250 360) rotate(-18) scale(0.85) translate(-198 -90)">
            <House x={0} y={0} ft={22} paint={0.3} noFound />
          </g>
          {[[1120, 560], [1460, 420], [1530, 640], [1080, 300]].map(([x, y], i) => (
            <rect key={i} x={x} y={y} width={46} height={12} fill="#2A2018" transform={`rotate(${i * 50} ${x} ${y})`} />
          ))}
        </g>
        {/* warm rim light behind her */}
        <circle cx={560} cy={560} r={560} fill="url(#rim)" />
        {/* Dorothy, big, holding Toto */}
        <g transform={V.flip ? 'translate(1080 0) scale(-1 1)' : ''}>
          <Person x={540} y={2560} h={2480} look={DOROTHY} t={0} expr="scared" talk={0.55} gaze={V.flip ? 1 : V.gaze} shF={14} elF={104} shB={10} elB={108} head={-4} wind={0.9} shadow={0} />
          {/* Toto clutched to her chest, her hands around him */}
          <Toto x={590} y={1150} h={300} t={0} sit flip />
          <ellipse cx={440} cy={1030} rx={52} ry={36} fill="#F0C9A8" transform="rotate(-20 440 1030)" />
          <ellipse cx={740} cy={1060} rx={52} ry={36} fill="#F0C9A8" transform="rotate(25 740 1060)" />
        </g>
      </svg>
      <img src={staticFile('paperkite/fiber.png')} style={{position: 'absolute', inset: 0, width: 1920, height: 1080, mixBlendMode: 'multiply', opacity: 0.25, objectFit: 'cover'}} />
      {/* text: three words max, white with heavy black outline, top right */}
      <div style={{position: 'absolute', right: 70, top: 60, textAlign: 'right', fontFamily: 'Fraunces', fontWeight: 900, fontSize: 168, lineHeight: 0.95, color: '#fff', WebkitTextStroke: '14px #000', paintOrder: 'stroke fill', letterSpacing: 2}}>
        {V.text[0]}
        <br />
        <span style={{color: '#FFD23F'}}>{V.text[1]}</span>
      </div>
    </AbsoluteFill>
  );
};
export const OzThumbA: React.FC = () => <OzThumb v="a" />;
export const OzThumbB: React.FC = () => <OzThumb v="b" />;
export const OzThumbC: React.FC = () => <OzThumb v="c" />;
