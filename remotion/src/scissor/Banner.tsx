// SCISSOR TALES YouTube banner (2560x1440). Text and logo inside the 1546x423 safe area (x 507-2053, y 508-931);
// story vignettes in the desktop/TV band on both sides.
import React from 'react';
import {AbsoluteFill, staticFile} from 'remotion';
import {Cut, cut, ellipsePts, Pt, PaperDefs, rectPts, Strip} from '../paperkite/kit';
import {House} from '../oz/kansas';
import {OzDefs} from '../oz/look';

const NAVY = '#1C2A4D';
const GOLD = '#F2B33D';

const hillBand = (y: number, amp: number, seed: string, k: number): Pt[] => {
  const pts: Pt[] = [];
  for (let x = -40; x <= 2600; x += 80) pts.push([x, y - amp * (0.5 + 0.5 * Math.sin(x * 0.0026 + k)) - ((x * 37 + k * 11) % 9)]);
  pts.push([2600, 1500], [-40, 1500]);
  return pts;
};

const Scissors: React.FC<{x: number; y: number; s: number; rot?: number; col?: string}> = ({x, y, s, rot = 0, col = GOLD}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    {[-1, 1].map((sg) => (
      <g key={sg} transform={`rotate(${sg * 16})`}>
        <Cut d={cut([[0, -5], [120, -3], [150, 0], [120, 9], [0, 12]], 'bl' + sg, 0.6, 10)} fill="#E9EEF5" lift={2} edge={0.5} />
        <Cut d={cut(ellipsePts(-44, 0, 30, 20, 22), 'lp' + sg, 0.6, 8)} fill={col} lift={2} edge={0.4} />
        <ellipse cx={-42} cy={0} rx={17} ry={10} fill={NAVY} />
      </g>
    ))}
    <circle r={8} fill="#C9D1D9" />
  </g>
);

const Tornado: React.FC<{x: number; y: number}> = ({x, y}) => {
  const pts: Pt[] = [];
  const N = 14;
  for (let i = 0; i <= N; i++) {
    const k = i / N;
    pts.push([x - (20 + 160 * Math.pow(k, 1.6)) + Math.sin(k * 5) * 18, y - k * 460]);
  }
  for (let i = N; i >= 0; i--) {
    const k = i / N;
    pts.push([x + (20 + 160 * Math.pow(k, 1.6)) + Math.sin(k * 5) * 18, y - k * 460]);
  }
  return (
    <g>
      <Cut d={cut(pts, 'tor', 3, 24)} fill="#5E6C7E" lift={2} edge={0.25} />
      {[0.25, 0.45, 0.65, 0.85].map((k, i) => (
        <path key={i} d={`M${x - (20 + 160 * Math.pow(k, 1.6)) + Math.sin(k * 5) * 18} ${y - k * 460} q${20 + 160 * Math.pow(k, 1.6)} ${22} ${2 * (20 + 160 * Math.pow(k, 1.6))} -6`} stroke="rgba(25,30,40,0.35)" strokeWidth={8} fill="none" />
      ))}
      <Cut d={cut([[x - 300, y - 470], [x + 280, y - 480], [x + 200, y - 410], [x - 220, y - 400]], 'torcl', 4, 30)} fill="#46546A" lift={2} edge={0.15} />
    </g>
  );
};

const Beanstalk: React.FC<{x: number; y: number}> = ({x, y}) => {
  const path: Pt[] = [];
  for (let i = 0; i <= 20; i++) {
    const k = i / 20;
    path.push([x + Math.sin(k * 9) * 46 * (1 - k * 0.4), y - k * 520]);
  }
  const stalk = path.map(([px, py], i) => `${i ? 'L' : 'M'}${px.toFixed(1)} ${py.toFixed(1)}`).join('');
  return (
    <g>
      <path d={stalk} stroke="#2E8F2E" strokeWidth={26} fill="none" strokeLinecap="round" filter="url(#lift2)" />
      <path d={stalk} stroke="#5FBF3E" strokeWidth={8} fill="none" strokeLinecap="round" opacity={0.7} />
      {path.filter((_, i) => i % 2 === 1 && i < 19).map(([px, py], i) => (
        <g key={i} transform={`translate(${px} ${py}) rotate(${i % 2 ? -30 : 210})`}>
          <Cut d={cut([[0, 0], [30, -26], [74, -18], [96, 0], [70, 16], [30, 14]], 'leaf' + i, 0.8, 10)} fill={i % 3 ? '#3FAE3B' : '#2E8F2E'} lift={2} edge={0.3} />
        </g>
      ))}
      {/* cloud and castle at the top */}
      <Cut d={cut([[x - 230, y - 520], [x - 190, y - 580], [x - 110, y - 600], [x - 40, y - 640], [x + 60, y - 620], [x + 140, y - 640], [x + 220, y - 590], [x + 250, y - 520]], 'bcloud', 3, 20)} fill="#F4F1EA" lift={2} edge={0.4} />
      <g transform={`translate(${x - 40} ${y - 600})`}>
        <Cut d={cut(rectPts(-70, -110, 140, 110), 'keep', 1, 12)} fill="#8E8AA8" lift={2} edge={0.3} />
        {[-70, 70].map((tx, i) => (
          <g key={i}>
            <Cut d={cut(rectPts(tx - 26, -170, 52, 170), 'twr' + i, 1, 12)} fill="#7A7694" lift={2} edge={0.3} />
            <Cut d={cut([[tx - 34, -170], [tx, -232], [tx + 34, -170]], 'cone' + i, 0.8, 10)} fill="#C2453A" lift={2} edge={0.3} />
          </g>
        ))}
        <rect x={-16} y={-48} width={32} height={48} rx={16} fill="#3A3650" />
        <rect x={-64 - 6} y={-130} width={12} height={20} fill="#FFD66B" />
        <rect x={76 - 6} y={-130} width={12} height={20} fill="#FFD66B" />
      </g>
    </g>
  );
};

export const ScissorBanner: React.FC = () => (
  <AbsoluteFill style={{background: NAVY}}>
    <svg width={2560} height={1440} viewBox="0 0 2560 1440">
      <OzDefs />
      <PaperDefs />
      <defs>
        <radialGradient id="bannerSky" cx="0.5" cy="0.45" r="0.75">
          <stop offset="0" stopColor="#2F4880" />
          <stop offset="1" stopColor="#141E38" />
        </radialGradient>
      </defs>
      <rect width={2560} height={1440} fill="url(#bannerSky)" />
      {Array.from({length: 46}, (_, i) => {
        const x = (i * 557) % 2560;
        const y = 60 + ((i * 331) % 820);
        const r = 3 + (i % 4) * 1.6;
        return <Cut key={i} d={cut(ellipsePts(x, y, r, r, 10), 'bs' + i, 0.4, 6)} fill="#E9DFC4" lift={0} edge={0} opacity={0.65} />;
      })}
      <Cut d={cut(ellipsePts(1990, 200, 70, 70, 36), 'moon', 1.2, 12)} fill="#F6E9BE" lift={2} edge={0.3} />
      {/* layered paper hills */}
      <Cut d={cut(hillBand(1010, 90, 'h1', 0), 'h1', 3, 40)} fill="#24406E" lift={1} edge={0.15} />
      <Cut d={cut(hillBand(1080, 70, 'h2', 2), 'h2', 3, 40)} fill="#1F5E4A" lift={2} edge={0.15} />
      <Cut d={cut(hillBand(1160, 50, 'h3', 4), 'h3', 3, 40)} fill="#2E8F4A" lift={2} edge={0.15} />
      {/* left vignette: the little house swept up by the cyclone */}
      <Tornado x={300} y={990} />
      <g transform="translate(230 760) rotate(-14) scale(0.55)">
        <House x={0} y={0} ft={22} paint={0.3} noFound />
      </g>
      {/* right vignette: the beanstalk to the castle in the clouds */}
      <g transform="translate(2300 975) scale(0.6) translate(-2300 -975)"><Beanstalk x={2300} y={1010} /></g>
      {/* centre: title on a paper strip with a cut-here line */}
      <g>
        <Cut d={cut(rectPts(560, 540, 1440, 230), 'strip', 2.4, 26)} fill="#F6F0E2" lift={3} />
        <rect x={560} y={540} width={1440} height={230} fill="url(#grain)" opacity={0.25} />
        <text x={1280} y={700} textAnchor="middle" fontFamily="Fraunces" fontWeight={900} fontSize={136} fill="#1C2A4D" letterSpacing={4} textLength={1290} lengthAdjust="spacingAndGlyphs">
          SCISSOR TALES
        </text>
        <line x1={640} y1={808} x2={1990} y2={808} stroke="#F6F0E2" strokeWidth={5} strokeDasharray="22 16" opacity={0.85} />
        <Scissors x={600} y={808} s={0.5} />
      </g>
      <text x={1280} y={890} textAnchor="middle" fontFamily="Caveat" fontWeight={600} fontSize={62} fill="#FFE7A6">
        Classic tales, cut from paper and brought to life
      </text>
    </svg>
    <img src={staticFile('paperkite/fiber.png')} style={{position: 'absolute', inset: 0, width: 2560, height: 1440, mixBlendMode: 'multiply', opacity: 0.3, objectFit: 'cover'}} />
  </AbsoluteFill>
);
