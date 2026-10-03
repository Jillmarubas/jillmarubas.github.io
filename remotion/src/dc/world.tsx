import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, H, W} from './design';

/*
 * The animated flat-vector world behind every scene (colorful edition). Each chapter has its
 * own palette and time of day; the sky, sun or moon, drifting clouds, birds, sparkles and
 * three layers of rolling hills all move gently, so the frame is never static.
 */
type Theme = {top: string; bottom: string; hills: [string, string, string]; orb: 'sun' | 'moon'; orbColor: string; cloud: string; extra?: 'city' | 'dunes' | 'pines'};
export const THEMES: Theme[] = [
  {top: '#C9B8FF', bottom: '#FFE6CF', hills: ['#9C8CF0', '#6E5FD6', '#4A3FB0'], orb: 'moon', orbColor: C.yellow, cloud: '#E9E1FF', extra: 'pines'}, // cold open: dusk
  {top: '#8FD3FF', bottom: '#E9F7FF', hills: ['#8EE0B8', '#3BB273', '#23915A'], orb: 'sun', orbColor: C.yellow, cloud: '#FFFFFF', extra: 'pines'}, // the cloud: bright day
  {top: '#FFCB7A', bottom: '#FFF1DA', hills: ['#FFB25C', '#17B3A3', '#0E8A7E'], orb: 'sun', orbColor: C.hum, cloud: '#FFF6E8', extra: 'city'}, // the bill: warm afternoon
  {top: '#FFDFA0', bottom: '#FFF7E6', hills: ['#F6C57A', '#E9A85C', '#D48A3C'], orb: 'sun', orbColor: C.orange, cloud: '#FFF9EE', extra: 'dunes'}, // the water: desert
  {top: '#FFB8CC', bottom: '#FFEBDD', hills: ['#C58CE0', '#8C63C9', '#5B4399'], orb: 'moon', orbColor: C.cream, cloud: '#FFE3EC', extra: 'pines'}, // the neighbours: evening
  {top: '#A8EFD3', bottom: '#F0FFF8', hills: ['#8EE0B8', '#17B3A3', '#127E73'], orb: 'sun', orbColor: C.yellow, cloud: '#FFFFFF', extra: 'city'}, // the deal: fresh
  {top: '#D9CCFF', bottom: '#FFF0E6', hills: ['#B6A6FF', '#FF9FB8', '#7A5CFF'], orb: 'sun', orbColor: C.pink, cloud: '#FFFFFF', extra: 'pines'}, // who decides: lilac
  {top: '#FFD2B0', bottom: '#FFF8EC', hills: ['#8EE0B8', '#17B3A3', '#3D7BFF'], orb: 'sun', orbColor: C.orange, cloud: '#FFFFFF', extra: 'pines'}, // can it be fixed: sunrise
  {top: '#B9A8F5', bottom: '#FFE2D2', hills: ['#8C7CE8', '#5E4FC8', '#3A2F8F'], orb: 'moon', orbColor: C.yellow, cloud: '#EDE6FF', extra: 'pines'}, // ending: dusk
];

const cloudShape = (x: number, y: number, s: number, fill: string, key: string) => (
  <g key={key} transform={`translate(${x} ${y}) scale(${s})`} fill={fill}>
    <circle cx={0} cy={0} r={40} />
    <circle cx={46} cy={-16} r={52} />
    <circle cx={100} cy={2} r={36} />
    <rect x={-40} y={0} width={176} height={38} rx={19} />
  </g>
);

const hill = (base: number, amp: number, len: number, phase: number) => {
  const pts: string[] = [];
  for (let x = -100; x <= W + 100; x += 40) pts.push(`${x},${base - amp * (0.5 + 0.5 * Math.sin(x / len + phase))}`);
  return `M-100 ${H + 10} L${pts.join(' L')} L${W + 100} ${H + 10} Z`;
};


/* ------------------------------------------------------------------ the little town along the bottom */
const TownHouse: React.FC<{x: number; y: number; s: number; roof: string; wall: string; f: number; i: number}> = ({x, y, s, roof, wall, f, i}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-30} y={-44} width={60} height={44} rx={4} fill={wall} />
    <rect x={0} y={-44} width={30} height={44} fill="#000" opacity={0.08} />
    <path d="M-38 -42 L0 -74 L38 -42 Z" fill={roof} />
    <path d="M0 -74 L38 -42 L0 -42 Z" fill="#000" opacity={0.12} />
    <rect x={-8} y={-22} width={16} height={22} rx={6} fill={C.navy} />
    <rect x={-24} y={-36} width={12} height={12} rx={3} fill={C.yellow} opacity={0.6 + 0.4 * Math.sin(f / 9 + i)} />
    <rect x={14} y={-66} width={9} height={18} fill={C.navy} />
    {[0, 1].map((k) => {
      const u = ((f * 0.8 + k * 30 + i * 11) % 60) / 60;
      return <circle key={k} cx={18 + u * 10} cy={-70 - u * 40} r={4 + u * 8} fill="#FFFFFF" opacity={0.6 * (1 - u)} />;
    })}
  </g>
);

const RoundTree: React.FC<{x: number; y: number; s: number; c1: string; c2: string; f: number; i: number}> = ({x, y, s, c1, c2, f, i}) => (
  <g transform={`translate(${x} ${y}) scale(${s}) rotate(${Math.sin(f / 20 + i) * 3})`}>
    <rect x={-4} y={-30} width={8} height={30} rx={3} fill="#7E4B29" />
    <circle cx={0} cy={-44} r={26} fill={c1} />
    <path d="M0 -70 A26 26 0 0 1 0 -18 Z" fill={c2} />
  </g>
);

/** A little person walking along the path, legs swinging. */
const Walker: React.FC<{x: number; y: number; s: number; shirt: string; f: number; i: number; dir: 1 | -1}> = ({x, y, s, shirt, f, i, dir}) => {
  const step = Math.sin(f / 4 + i) * 22;
  const bob = Math.abs(Math.cos(f / 4 + i)) * 2;
  return (
    <g transform={`translate(${x} ${y - bob}) scale(${s * dir} ${s})`}>
      <line x1={0} y1={-18} x2={Math.sin((step * Math.PI) / 180) * 12} y2={0} stroke={C.navy} strokeWidth={5} strokeLinecap="round" />
      <line x1={0} y1={-18} x2={-Math.sin((step * Math.PI) / 180) * 12} y2={0} stroke={C.navy} strokeWidth={5} strokeLinecap="round" />
      <rect x={-8} y={-44} width={16} height={28} rx={7} fill={shirt} />
      <line x1={0} y1={-38} x2={Math.sin((-step * Math.PI) / 180) * 12} y2={-22} stroke={shirt} strokeWidth={5} strokeLinecap="round" />
      <circle cx={0} cy={-52} r={9} fill="#F2B48C" />
    </g>
  );
};

const Town: React.FC<{f: number; T: Theme}> = ({f, T}) => {
  const roofs = [C.hum, C.blue, C.purple, C.orange, C.pink, C.teal];
  const walls = [C.cream, '#FFFFFF', '#FFE6D5', '#E4F3FF'];
  // buildings cluster on the right
  const blocks = [
    [1420, 90, 150], [1500, 70, 110], [1580, 80, 190], [1668, 64, 130], [1740, 90, 160],
  ];
  return (
    <g>
      {blocks.map(([x, w, h], i) => (
        <g key={i}>
          <rect x={x} y={1006 - h} width={w} height={h} rx={6} fill={[C.blue, C.purple, C.teal, C.navy, C.pink][i]} opacity={0.92} />
          <rect x={x + w / 2} y={1006 - h} width={w / 2} height={h} fill="#000" opacity={0.1} />
          {Array.from({length: Math.floor(h / 28)}, (_, j) =>
            [0, 1].map((k) => <rect key={`${j}-${k}`} x={x + 12 + k * (w / 2)} y={1020 - h + j * 28} width={12} height={12} rx={2} fill={C.yellow} opacity={Math.sin(f / 13 + i * 3 + j + k) > 0 ? 0.95 : 0.35} />),
          )}
        </g>
      ))}
      {/* houses and trees along the ridge */}
      {[120, 330, 560, 820, 1060, 1280].map((x, i) => (
        <TownHouse key={i} x={x} y={1006 + (i % 2) * 6} s={1 + (i % 3) * 0.1} roof={roofs[i]} wall={walls[i % 4]} f={f} i={i} />
      ))}
      {[40, 230, 450, 690, 940, 1180, 1360, 1860].map((x, i) => (
        <RoundTree key={i} x={x} y={1010} s={0.9 + (i % 3) * 0.2} c1={i % 2 ? C.green : T.hills[0]} c2={i % 2 ? '#2E9A60' : T.hills[1]} f={f} i={i} />
      ))}
    </g>
  );
};

const River: React.FC<{f: number}> = ({f}) => {
  const d = 'M-100 1068 C 200 1030 420 1090 700 1058 C 980 1026 1200 1086 1500 1052 C 1700 1030 1850 1060 2040 1046';
  return (
    <g>
      <path d={d} fill="none" stroke="#6EC4FF" strokeWidth={30} strokeLinecap="round" />
      <path d={d} fill="none" stroke="#FFFFFF" strokeWidth={4} strokeLinecap="round" strokeDasharray="30 70" strokeDashoffset={-f * 3} opacity={0.8} />
    </g>
  );
};

const Walkers: React.FC<{f: number}> = ({f}) => {
  const span = 2200;
  const shirts = [C.hum, C.yellow, C.purple, C.teal, C.pink, C.blue];
  return (
    <g>
      {shirts.map((c, i) => {
        const dir: 1 | -1 = i % 2 ? -1 : 1;
        const x = ((((i * 380 + f * (1.2 + (i % 3) * 0.4) * dir) % span) + span) % span) - 140;
        return <Walker key={i} x={x} y={1034 + (i % 2) * 4} s={0.9} shirt={c} f={f} i={i} dir={dir} />;
      })}
    </g>
  );
};

export const World: React.FC<{theme: number; f: number}> = ({theme, f}) => {
  const T = THEMES[Math.max(0, Math.min(THEMES.length - 1, theme))];
  const sway = (d: number) => Math.sin(f / 90) * d;
  const drift = (speed: number, x0: number) => {
    const span = W + 700;
    return ((((x0 + f * speed) % span) + span) % span) - 350;
  };
  const rays = f * 0.15;
  return (
    <AbsoluteFill>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <defs>
          <linearGradient id={`sky${theme}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={T.top} />
            <stop offset="0.85" stopColor={T.bottom} />
          </linearGradient>
        </defs>
        <rect width={W} height={H} fill={`url(#sky${theme})`} />
        {/* sun with turning rays, or a crescent moon with a halo */}
        <g transform={`translate(${1640 + sway(10)} 190)`}>
          {T.orb === 'sun' ? (
            <>
              <g transform={`rotate(${rays})`} opacity={0.35}>
                {Array.from({length: 12}, (_, i) => (
                  <path key={i} transform={`rotate(${i * 30})`} d="M-14 -120 L14 -120 L6 -190 L-6 -190 Z" fill={T.orbColor} />
                ))}
              </g>
              <circle r={96} fill={T.orbColor} opacity={0.25 + 0.08 * Math.sin(f / 20)} />
              <circle r={72} fill={T.orbColor} />
            </>
          ) : (
            <>
              <circle r={130} fill={T.orbColor} opacity={0.14 + 0.06 * Math.sin(f / 25)} />
              <circle r={70} fill={T.orbColor} />
              <circle cx={30} cy={-20} r={60} fill={T.top} />
            </>
          )}
        </g>
        {/* sparkles */}
        {Array.from({length: 10}, (_, i) => {
          const x = (i * 197) % W;
          const y = 60 + ((i * 131) % 420);
          const o = 0.25 + 0.5 * (0.5 + 0.5 * Math.sin(f / 13 + i * 1.7));
          const r = 6 + (i % 3) * 3;
          return <path key={i} transform={`translate(${x} ${y})`} d={`M0 ${-r} Q${r * 0.15} ${-r * 0.15} ${r} 0 Q${r * 0.15} ${r * 0.15} 0 ${r} Q${-r * 0.15} ${r * 0.15} ${-r} 0 Q${-r * 0.15} ${-r * 0.15} 0 ${-r} Z`} fill={C.card} opacity={o} />;
        })}
        {/* clouds, two speeds */}
        {cloudShape(drift(0.35, 200), 170, 1.1, T.cloud, 'c1')}
        {cloudShape(drift(0.35, 1300), 110, 0.8, T.cloud, 'c2')}
        {cloudShape(drift(0.6, 800), 330, 0.7, T.cloud, 'c3')}
        {/* a few birds */}
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const x = drift(1.4 + (i % 3) * 0.3, 300 + i * 90 + (i > 2 ? 900 : 0));
          const y = 250 + i * 26 + Math.sin(f / 12 + i) * 8;
          const flap = Math.sin(f / 3 + i) * 10;
          return <path key={i} d={`M${x - 16} ${y - flap} Q${x - 8} ${y - 6} ${x} ${y} Q${x + 8} ${y - 6} ${x + 16} ${y - flap}`} fill="none" stroke={C.navy} strokeWidth={4} strokeLinecap="round" opacity={0.55} />;
        })}
        {/* far hills */}
        <path transform={`translate(${sway(14)} 0)`} d={hill(930, 70, 180, 0.5)} fill={T.hills[0]} />
        {/* skyline, dunes or pines on the middle ridge */}
        <g transform={`translate(${sway(22)} 0)`}>
          {T.extra === 'city' &&
            Array.from({length: 14}, (_, i) => {
              const w = 60 + ((i * 37) % 50);
              const h = 60 + ((i * 53) % 120);
              const x = 60 + i * 135;
              return (
                <g key={i}>
                  <rect x={x} y={960 - h} width={w} height={h + 40} fill={T.hills[1]} opacity={0.75} />
                  {Array.from({length: Math.floor(h / 30)}, (_, j) => (
                    <rect key={j} x={x + 10} y={975 - h + j * 30} width={10} height={10} fill={C.yellow} opacity={Math.sin(f / 15 + i + j) > 0.3 ? 0.9 : 0.25} />
                  ))}
                </g>
              );
            })}
          {T.extra === 'pines' &&
            Array.from({length: 16}, (_, i) => {
              const x = 30 + i * 125 + ((i * 41) % 40);
              const h = 90 + ((i * 29) % 60);
              const s = Math.sin(f / 30 + i) * 2;
              return (
                <g key={i} transform={`translate(${x} 990) rotate(${s})`}>
                  <path d={`M0 ${-h} L${h * 0.32} 0 L${-h * 0.32} 0 Z`} fill={T.hills[1]} />
                  <path d={`M0 ${-h} L${h * 0.32} 0 L0 0 Z`} fill={T.hills[2]} opacity={0.6} />
                </g>
              );
            })}
          {T.extra === 'dunes' &&
            Array.from({length: 6}, (_, i) => (
              <g key={i} transform={`translate(${150 + i * 330} 985)`}>
                <rect x={-8} y={-90} width={16} height={90} rx={8} fill="#3BA06A" />
                <rect x={-34} y={-66} width={12} height={34} rx={6} fill="#3BA06A" />
                <rect x={-34} y={-40} width={30} height={10} rx={5} fill="#3BA06A" />
                <rect x={22} y={-76} width={12} height={30} rx={6} fill="#3BA06A" />
                <rect x={4} y={-50} width={30} height={10} rx={5} fill="#3BA06A" />
              </g>
            ))}
        </g>
        {/* mid and near hills */}
        <path transform={`translate(${sway(30)} 0)`} d={hill(1000, 50, 140, 2.1)} fill={T.hills[1]} />
        <g transform={`translate(${sway(36)} 0)`}>
          <Town f={f} T={T} />
        </g>
        <path transform={`translate(${sway(44)} 0)`} d={hill(1050, 34, 110, 4.2)} fill={T.hills[2]} />
        <g transform={`translate(${sway(50)} 0)`}>
          <River f={f} />
          <Walkers f={f} />
        </g>
      </svg>
    </AbsoluteFill>
  );
};
