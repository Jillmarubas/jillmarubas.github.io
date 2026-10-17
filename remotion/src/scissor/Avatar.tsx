// SCISSOR TALES profile picture: a paper-cutout film camera whose projected light is a pair of open scissors.
import React from 'react';
import {AbsoluteFill, staticFile} from 'remotion';
import {Cut, cut, ellipsePts, Pt, PaperDefs, rectPts} from '../paperkite/kit';

const NAVY = '#1C2A4D';
const INK = '#2B2A30';
const BODY = '#3A3840';
const HI = '#55525E';
const GOLD = '#F2B33D';

const ring = (cx: number, cy: number, r: number, n = 28): Pt[] => ellipsePts(cx, cy, r, r, n);

const Reel: React.FC<{cx: number; cy: number; r: number; seed: string}> = ({cx, cy, r, seed}) => (
  <g>
    <Cut d={cut(ring(cx, cy, r, 40), seed, 1.4, 14)} fill={INK} lift={2} />
    <Cut d={cut(ring(cx, cy, r * 0.86, 36), seed + 'rim', 1.0, 12)} fill={BODY} lift={1} edge={0.2} />
    {[0, 90, 180, 270].map((a) => {
      const rad = ((a + 45) * Math.PI) / 180;
      return <Cut key={a} d={cut(ring(cx + Math.cos(rad) * r * 0.48, cy + Math.sin(rad) * r * 0.48, r * 0.24, 18), seed + a, 0.7, 8)} fill={NAVY} lift={0} edge={0.15} />;
    })}
    <Cut d={cut(ring(cx, cy, r * 0.16, 16), seed + 'hub', 0.5, 8)} fill={INK} lift={1} edge={0.25} />
  </g>
);

// Open scissors made of light, floating in the projector beam: handle loops nearest the lens, pivot in the beam,
// two broad pointed blades opening outward.
const ScissorBeam: React.FC<{px: number; py: number; open: number; len: number; lens: Pt}> = ({px, py, open, len, lens}) => {
  const part = (sign: number, key: string) => {
    const a = (sign * open * Math.PI) / 180;
    const ux = Math.cos(a), uy = Math.sin(a);
    const nx = -uy * sign, ny = ux * sign; // outward side of this blade
    // blade: flat inner edge, curved back, sharp tip
    const P = (along: number, side: number): Pt => [px + ux * along + nx * side, py + uy * along + ny * side];
    const blade: Pt[] = [P(-6, -6), P(len * 0.2, -8), P(len * 0.62, -5), P(len, 0), P(len * 0.72, 20), P(len * 0.36, 36), P(len * 0.08, 32), P(-6, 22)];
    // handle: shank running back past the pivot to an oval loop
    const b = a + Math.PI; // opposite direction
    const hx = Math.cos(b), hy = Math.sin(b);
    const lc: Pt = [px + hx * 78 - nx * 6, py + hy * 78 - ny * 6];
    const ang = (b * 180) / Math.PI;
    return (
      <g key={key}>
        <Cut d={cut([P(-4, -10), P(-4, 10), [px + hx * 52 - nx * 2, py + hy * 52 - ny * 2], [px + hx * 52 + nx * 14, py + hy * 52 + ny * 14]], key + 's', 0.6, 8)} fill={GOLD} lift={3} edge={0.4} />
        <g transform={`translate(${lc[0]} ${lc[1]}) rotate(${ang})`}>
          <Cut d={cut(ellipsePts(0, 0, 40, 28, 30), key + 'o', 0.9, 10)} fill={GOLD} lift={3} edge={0.45} />
          <Cut d={cut(ellipsePts(2, 0, 25, 15, 24), key + 'i', 0.6, 8)} fill="#2E4580" lift={0} edge={0} />
        </g>
        <Cut d={cut(blade, key + 'b', 1.0, 14)} fill="url(#beamFill)" lift={3} edge={0.6} />
      </g>
    );
  };
  const [lx, ly] = lens;
  return (
    <g>
      {/* cone of light from the lens, wide enough to hold the scissors */}
      <path d={`M${lx} ${ly - 46} L${px + len * 1.05} ${py - len * 0.72} L${px + len * 1.05} ${py + len * 0.72} L${lx} ${ly + 46} Z`} fill="url(#coneFill)" />
      {part(-1, 'u')}
      {part(1, 'd')}
      <Cut d={cut(ring(px, py, 13, 16), 'pivot', 0.5, 6)} fill="#FFF8DE" lift={3} edge={0} />
      <circle cx={px} cy={py} r={5} fill="#C98A1E" />
    </g>
  );
};

export const ScissorAvatar: React.FC = () => (
  <AbsoluteFill style={{background: NAVY}}>
    <svg width={800} height={800} viewBox="0 0 800 800">
      <PaperDefs />
      <defs>
        <radialGradient id="bgGlow" cx="0.62" cy="0.5" r="0.7">
          <stop offset="0" stopColor="#2C4277" />
          <stop offset="1" stopColor="#141E38" />
        </radialGradient>
        <linearGradient id="beamFill" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#FFFBE6" />
          <stop offset="0.5" stopColor="#FFE58A" />
          <stop offset="1" stopColor="#FFC93C" />
        </linearGradient>
        <linearGradient id="coneFill" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#FFEFB0" stopOpacity={0.85} />
          <stop offset="1" stopColor="#FFE9A0" stopOpacity={0} />
        </linearGradient>
      </defs>
      <rect width={800} height={800} fill="url(#bgGlow)" />
      {/* paper stars */}
      {[
        [90, 110, 7], [180, 70, 5], [640, 120, 6], [720, 230, 4], [110, 560, 5], [700, 620, 6], [560, 700, 4],
      ].map(([x, y, r], i) => (
        <Cut key={i} d={cut(ellipsePts(x, y, r, r, 10), 'st' + i, 0.4, 6)} fill="#E9DFC4" lift={1} edge={0} opacity={0.75} />
      ))}
      <g transform="translate(400 400) scale(0.78) translate(-470 -400)">
      {/* ground shadow */}
      <ellipse cx={300} cy={706} rx={190} ry={22} fill="rgba(0,0,0,0.28)" />
      {/* tripod */}
      <g>
        <Cut d={cut([[284, 470], [306, 470], [210, 700], [190, 700]], 'legL', 1, 12)} fill={INK} lift={2} />
        <Cut d={cut([[294, 470], [316, 470], [410, 700], [390, 700]], 'legR', 1, 12)} fill={INK} lift={2} />
        <Cut d={cut([[290, 470], [310, 470], [308, 704], [292, 704]], 'legM', 1, 12)} fill={BODY} lift={2} />
        <path d="M232 640 L300 560 L368 640" stroke={INK} strokeWidth={9} fill="none" strokeLinejoin="round" />
        {[[180, 696], [292, 698], [384, 696]].map(([x, y], i) => (
          <Cut key={i} d={cut(rectPts(x, y, 36, 14), 'foot' + i, 0.6, 8)} fill={INK} lift={1} edge={0.2} />
        ))}
        <Cut d={cut(rectPts(262, 440, 76, 36), 'head', 0.8, 10)} fill={BODY} lift={2} />
        <Cut d={cut([[262, 462], [272, 470], [176, 532], [168, 522]], 'pan', 0.8, 10)} fill={INK} lift={2} />
      </g>
      {/* film strip between the reels */}
      <path d="M232 222 L338 250 M372 212 L432 248" stroke={INK} strokeWidth={8} fill="none" />
      <Reel cx={232} cy={238} r={66} seed="reelS" />
      <Reel cx={372} cy={206} r={88} seed="reelB" />
      {/* camera body */}
      <Cut d={cut([[156, 300], [452, 300], [466, 316], [466, 436], [452, 450], [156, 450], [142, 436], [142, 316]], 'body', 1.4, 16)} fill={BODY} lift={3} />
      <Cut d={cut(rectPts(170, 318, 220, 46), 'panel', 0.9, 12)} fill={HI} lift={1} edge={0.3} />
      {[205, 255, 305].map((x, i) => (
        <Cut key={i} d={cut(ring(x, 341, 14, 16), 'knob' + i, 0.5, 6)} fill={INK} lift={1} edge={0.3} />
      ))}
      <Cut d={cut(ring(198, 408, 22, 20), 'dial', 0.6, 8)} fill={INK} lift={1} edge={0.3} />
      <circle cx={360} cy={410} r={10} fill="#E1543A" />
      <circle cx={392} cy={410} r={10} fill="#F4EFE4" />
      {/* eyepiece */}
      <Cut d={cut([[142, 350], [104, 342], [96, 412], [142, 404]], 'eye', 0.8, 10)} fill={INK} lift={2} />
      {/* lens barrel and hood */}
      <Cut d={cut(rectPts(466, 344, 54, 72), 'barrel', 0.8, 10)} fill={INK} lift={2} />
      {[478, 492, 506].map((x) => (
        <rect key={x} x={x} y={346} width={4} height={68} fill={HI} />
      ))}
      <Cut d={cut([[520, 352], [584, 312], [584, 448], [520, 408]], 'hood', 1, 12)} fill={BODY} lift={3} />
      {/* the light: open scissors */}
      <ScissorBeam px={705} py={380} open={18} len={230} lens={[584, 380]} />
      </g>
    </svg>
    <img src={staticFile('paperkite/fiber.png')} style={{position: 'absolute', inset: 0, width: 800, height: 800, mixBlendMode: 'multiply', opacity: 0.35}} />
  </AbsoluteFill>
);
