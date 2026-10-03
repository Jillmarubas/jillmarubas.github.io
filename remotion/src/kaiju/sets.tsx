import React from 'react';
import {interpolateColors, random} from 'remotion';
import {Car, Cloud, Pine, RoundTree, Tower} from '../dcc/art';

/*
 * Locations and effects for the monster short. Every set is drawn in 1920x1080 screen units.
 * Mood (0..4) is the colour script: 0 sunny morning, 1 grey storm, 2 orange smoke and fire,
 * 3 dramatic blue-gold (the hero), 4 sunset aftermath.
 */
const M = [0, 1, 2, 3, 4];
const SKY_T = ['#5DB8F2', '#6F7C8E', '#8A4A3A', '#28366E', '#5B3E8C'];
const SKY_B = ['#D8F1FF', '#B8C0CA', '#F2A25E', '#F0B070', '#FF9E6B'];
const SEA_T = ['#3AA6E0', '#4B6878', '#6A5A62', '#3D5A8A', '#6A4E7A'];
const SEA_B = ['#1E7FC0', '#2E4756', '#3E3444', '#243A66', '#3E2E52'];
const TINT = ['rgba(0,0,0,0)', 'rgba(40,52,70,0.18)', 'rgba(120,40,20,0.2)', 'rgba(20,30,80,0.12)', 'rgba(90,40,90,0.15)'];
export const skyTop = (m: number) => interpolateColors(m, M, SKY_T);
export const skyBot = (m: number) => interpolateColors(m, M, SKY_B);

export const Sky: React.FC<{mood: number; t: number; horizon?: number; sun?: [number, number]; clouds?: boolean}> = ({mood, t, horizon = 1080, sun = [1500, 220], clouds = true}) => {
  const id = `sky${Math.round(mood * 100)}`;
  const sunCol = interpolateColors(mood, M, ['#FFE680', '#E9ECEF', '#FFB35C', '#FFE9A8', '#FFC27A']);
  const VIS = [0.95, 0.12, 0.55, 0.85, 0.95];
  const i0 = Math.min(3, Math.floor(mood));
  const vis = VIS[i0] + (VIS[i0 + 1] - VIS[i0]) * (mood - i0);
  const cloudCol = interpolateColors(mood, M, ['#FFFFFF', '#8E97A3', '#6B4A44', '#5A6690', '#B98AA8']);
  return (
    <g>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={skyTop(mood)} />
          <stop offset="1" stopColor={skyBot(mood)} />
        </linearGradient>
      </defs>
      <rect x={-2000} y={-2000} width={6000} height={horizon + 2000} fill={`url(#${id})`} />
      <g transform={`translate(${sun[0]} ${sun[1]})`} opacity={Math.max(0.12, vis)}>
        <circle r={170} fill={sunCol} opacity={0.18} />
        <circle r={110} fill={sunCol} opacity={0.3} />
        <circle r={72} fill={sunCol} />
      </g>
      {clouds &&
        Array.from({length: 7}, (_, i) => {
          const x = ((i * 380 + t * (0.4 + (i % 3) * 0.15)) % 2600) - 400;
          const y = 90 + ((i * 137) % 260);
          return (
            <g key={i} transform={`translate(${x} ${y}) scale(${0.7 + (i % 3) * 0.3})`} opacity={0.95}>
              <g fill={cloudCol}>
                <Cloud />
              </g>
            </g>
          );
        })}
    </g>
  );
};

/** Screen-wide colour tint for the mood (drawn over a whole shot). */
export const Tint: React.FC<{mood: number}> = ({mood}) => <rect x={-2000} y={-2000} width={6000} height={6000} fill={interpolateColors(mood, M, TINT)} />;

export const Sea: React.FC<{mood: number; t: number; y: number; x0?: number; x1?: number; chop?: number}> = ({mood, t, y, x0 = -400, x1 = 2400, chop = 1}) => {
  const id = `sea${Math.round(mood * 100)}${y}`;
  const waves = [];
  for (let row = 0; row < 7; row++) {
    const yy = y + 18 + row * row * 9;
    const sp = 0.6 + row * 0.35;
    for (let x = x0 + ((t * sp * (row % 2 ? 1 : -1)) % 160); x < x1; x += 160) {
      const w = 34 + row * 10;
      waves.push(<path key={`${row}-${x}`} d={`M${x} ${yy} q ${w / 2} ${-6 * chop - row} ${w} 0`} stroke="#fff" strokeWidth={3 + row * 0.6} fill="none" opacity={0.35 + row * 0.05} strokeLinecap="round" />);
    }
  }
  return (
    <g>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={interpolateColors(mood, M, SEA_T)} />
          <stop offset="1" stopColor={interpolateColors(mood, M, SEA_B)} />
        </linearGradient>
      </defs>
      <rect x={x0} y={y} width={x1 - x0} height={2000} fill={`url(#${id})`} />
      <rect x={x0} y={y} width={x1 - x0} height={4} fill="#fff" opacity={0.35} />
      {waves}
    </g>
  );
};

/** A distant city across the bay. */
export const Skyline: React.FC<{mood: number; t: number; x: number; y: number; w: number; s?: number; fire?: number; broken?: number[]}> = ({mood, t, x, y, w, s = 1, fire = 0, broken = []}) => {
  const col = interpolateColors(mood, M, ['#8FB3D9', '#6E7A88', '#5E3A3A', '#3E4E80', '#6E5A8A']);
  const col2 = interpolateColors(mood, M, ['#7AA0CA', '#5E6977', '#4A2C2E', '#33416E', '#5A4878']);
  const n = Math.floor(w / (70 * s));
  return (
    <g transform={`translate(${x} ${y})`}>
      {Array.from({length: n}, (_, i) => {
        const h = (120 + random(`sk${i}`) * 260) * s;
        const bw = (50 + random(`skw${i}`) * 40) * s;
        const bx = i * 70 * s;
        const br = broken.includes(i);
        return (
          <g key={i}>
            <rect x={bx} y={-(br ? h * 0.45 : h)} width={bw} height={br ? h * 0.45 : h} fill={i % 2 ? col : col2} />
            {!br &&
              Array.from({length: Math.floor(h / (26 * s))}, (_, j) => (
                <rect key={j} x={bx + 8 * s} y={-h + 12 * s + j * 26 * s} width={bw - 16 * s} height={8 * s} fill={mood > 1.8 ? '#FFD27A' : '#DDEBFF'} opacity={Math.sin(i * 3 + j * 1.7 + t / 20) > 0.2 ? 0.55 : 0.12} />
              ))}
            {br && <path d={`M${bx} ${-h * 0.45} l ${bw * 0.3} ${-18 * s} l ${bw * 0.3} ${14 * s} l ${bw * 0.4} ${-24 * s} L ${bx + bw} ${-h * 0.45} Z`} fill={i % 2 ? col : col2} />}
          </g>
        );
      })}
      {fire > 0 &&
        broken.map((i) => (
          <g key={`f${i}`} transform={`translate(${i * 70 * s + 30 * s} ${-(120 + random(`sk${i}`) * 260) * s * 0.45})`}>
            <Fire t={t} s={s * 0.8 * fire} />
            <Smoke t={t} x={0} y={-20} s={s * 1.4} n={5} />
          </g>
        ))}
    </g>
  );
};

export const Fire: React.FC<{t: number; s?: number}> = ({t, s = 1}) => (
  <g transform={`scale(${s})`}>
    {[0, 1, 2, 3].map((k) => {
      const f = Math.sin(t * 0.7 + k * 1.9);
      return <path key={k} d={`M${-30 + k * 20} 0 Q ${-40 + k * 20} ${-50 - f * 10} ${-20 + k * 20} ${-90 - f * 20} Q ${k * 20} ${-50} ${-10 + k * 20} 0 Z`} fill={['#FF6A2B', '#FFB020', '#FF8A2B', '#FFE08A'][k]} />;
    })}
  </g>
);

export const Smoke: React.FC<{t: number; x: number; y: number; s?: number; n?: number; col?: string}> = ({t, x, y, s = 1, n = 6, col = '#4A4448'}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {Array.from({length: n}, (_, k) => {
      const u = ((t * 0.6 + k * (70 / n)) % 70) / 70;
      return <circle key={k} cx={u * 60 + Math.sin(k) * 10} cy={-u * 260} r={20 + u * 60} fill={col} opacity={0.55 * (1 - u)} />;
    })}
  </g>
);

/* ------------------------------------------------------------------ the playground */
export const SwingSet: React.FC<{t: number; a1: number; a2: number; kid1?: React.ReactNode; kid2?: React.ReactNode}> = ({a1, a2, kid1, kid2}) => (
  <g>
    <path d="M-260 0 L-200 -330 L-140 0 M140 0 L200 -330 L260 0" stroke="#E8403A" strokeWidth={18} strokeLinecap="round" fill="none" />
    <rect x={-210} y={-340} width={420} height={20} rx={10} fill="#E8403A" />
    {[
      [-80, a1, kid1],
      [80, a2, kid2],
    ].map(([x, a, kid], i) => (
      <g key={i} transform={`translate(${x as number} -330) rotate(${a as number})`}>
        <path d="M-40 0 L-40 230 M40 0 L40 230" stroke="#6B7686" strokeWidth={4} />
        <rect x={-50} y={228} width={100} height={14} rx={7} fill="#FFC928" />
        {kid && <g transform="translate(0 228)">{kid as React.ReactNode}</g>}
      </g>
    ))}
  </g>
);

export const Slide: React.FC = () => (
  <g>
    <rect x={-190} y={-300} width={16} height={300} fill="#3A86E8" />
    <rect x={-120} y={-300} width={16} height={300} fill="#3A86E8" />
    {[0, 1, 2, 3, 4].map((i) => (
      <rect key={i} x={-190} y={-60 - i * 55} width={86} height={10} rx={5} fill="#2C6BC4" />
    ))}
    <rect x={-200} y={-310} width={110} height={22} rx={8} fill="#FFC928" />
    <path d="M-100 -300 C 0 -300, 40 -60, 190 -20 L 190 0 C 30 -40, -10 -270, -100 -270 Z" fill="#FF9A3C" />
    <path d="M-100 -288 C 0 -288, 40 -50, 190 -10" stroke="#FFD08A" strokeWidth={6} fill="none" />
  </g>
);

export const SeeSaw: React.FC<{a: number}> = ({a}) => (
  <g>
    <path d="M-30 0 L0 -60 L30 0 Z" fill="#7D6BE0" />
    <g transform={`translate(0 -60) rotate(${a})`}>
      <rect x={-220} y={-10} width={440} height={20} rx={10} fill="#2FB39A" />
      <rect x={-200} y={-40} width={10} height={32} fill="#1E2A44" />
      <rect x={190} y={-40} width={10} height={32} fill="#1E2A44" />
    </g>
  </g>
);

/** The hill park above the bay: grass, fence, trees and a sandpit. */
export const ParkGround: React.FC<{t: number; y: number; mood: number}> = ({t, y, mood}) => {
  const g1 = interpolateColors(mood, M, ['#6CCB6F', '#5E8A63', '#6C6A48', '#3E6A62', '#6A6A58']);
  const g2 = interpolateColors(mood, M, ['#4FB35A', '#4A7250', '#56533A', '#2F5650', '#55543F']);
  return (
    <g>
      <path d={`M-400 ${y} Q 600 ${y - 60} 1300 ${y - 10} T 2400 ${y + 10} L 2400 1400 L -400 1400 Z`} fill={g1} />
      <path d={`M-400 ${y + 120} Q 800 ${y + 60} 2400 ${y + 140} L 2400 1400 L -400 1400 Z`} fill={g2} />
      {Array.from({length: 24}, (_, i) => (
        <rect key={i} x={-300 + i * 110} y={y - 70} width={10} height={70} rx={4} fill="#FFFFFF" opacity={0.9} />
      ))}
      <rect x={-300} y={y - 58} width={2700} height={8} fill="#FFFFFF" opacity={0.9} />
      <rect x={-300} y={y - 30} width={2700} height={8} fill="#FFFFFF" opacity={0.9} />
      {[0, 1, 2].map((i) => (
        <g key={i} transform={`translate(${[120, 1760, 1950][i]} ${y + 10})`}>
          <RoundTree t={t} s={1.5} seed={i} />
        </g>
      ))}
    </g>
  );
};

/* ------------------------------------------------------------------ city pieces */
export const StreetRow: React.FC<{t: number; y: number; mood: number; seed?: number; x0?: number; n?: number; lit?: boolean}> = ({t, y, mood, seed = 0, x0 = -200, n = 9, lit}) => {
  const cols = [
    ['#FF8A6A', '#E0674A'],
    ['#7FB2F0', '#5B8FD0'],
    ['#FFD166', '#E8B640'],
    ['#9C8CF0', '#7A68D6'],
    ['#6ED3B0', '#48B08E'],
    ['#F7A8C8', '#DB82A8'],
  ];
  const dark = interpolateColors(mood, M, ['#00000000', '#00000030', '#00000045', '#00000035', '#00000030']);
  return (
    <g>
      {Array.from({length: n}, (_, i) => {
        const w = 220 + random(`sw${seed}${i}`) * 80;
        const h = 420 + random(`sh${seed}${i}`) * 420;
        const [c1, c2] = cols[(i + seed) % cols.length];
        return (
          <g key={i} transform={`translate(${x0 + i * 250 + w / 2} ${y})`}>
            <Tower w={w} h={h} c1={c1} c2={c2} t={lit ? t : 0} seed={i + seed * 10} roof />
          </g>
        );
      })}
      <rect x={-400} y={y - 1200} width={2800} height={1200} fill={dark} />
    </g>
  );
};

export const Road: React.FC<{y: number; t: number; lines?: boolean}> = ({y, lines = true}) => (
  <g>
    <rect x={-400} y={y} width={2800} height={40} fill="#C9CFDA" />
    <rect x={-400} y={y + 40} width={2800} height={220} fill="#4A4F5A" />
    {lines && Array.from({length: 20}, (_, i) => <rect key={i} x={-380 + i * 150} y={y + 144} width={80} height={10} rx={5} fill="#F2E6B8" />)}
    <rect x={-400} y={y + 260} width={2800} height={60} fill="#C9CFDA" />
  </g>
);

export {Car, Pine, RoundTree, Tower};

/* ------------------------------------------------------------------ effects */
/** Chunks thrown up and falling under gravity. */
export const Debris: React.FC<{t: number; t0: number; x: number; y: number; n?: number; spread?: number; up?: number; seed?: number; cols?: string[]; size?: number; g?: number}> = ({
  t,
  t0,
  x,
  y,
  n = 24,
  spread = 300,
  up = 18,
  seed = 1,
  cols = ['#8C8F99', '#6E717B', '#B7BCC6', '#5B5F69'],
  size = 26,
  g = 0.8,
}) => {
  const tt = t - t0;
  if (tt < 0) return null;
  return (
    <g>
      {Array.from({length: n}, (_, i) => {
        const r = (k: string) => random(`d${seed}${i}${k}`);
        const vx = (r('x') - 0.5) * spread * 0.06;
        const vy = -up * (0.4 + r('y'));
        const px = x + vx * tt * 3;
        const py = y + vy * tt + 0.5 * g * tt * tt;
        const sz = size * (0.4 + r('s'));
        if (py > y + 1400) return null;
        return <rect key={i} x={px - sz / 2} y={py - sz / 2} width={sz} height={sz * (0.6 + r('h') * 0.6)} rx={3} fill={cols[i % cols.length]} transform={`rotate(${tt * (r('r') - 0.5) * 30} ${px} ${py})`} />;
      })}
    </g>
  );
};

/** Billowing dust that grows and fades. */
export const Dust: React.FC<{t: number; t0: number; x: number; y: number; r?: number; n?: number; col?: string; life?: number; spread?: number}> = ({t, t0, x, y, r = 120, n = 9, col = '#B9AFA3', life = 90, spread = 1}) => {
  const tt = t - t0;
  if (tt < 0 || tt > life * 1.6) return null;
  const u = tt / life;
  return (
    <g opacity={Math.max(0, 1 - Math.max(0, u - 0.6) / 1)}>
      {Array.from({length: n}, (_, i) => {
        const a = (i / n) * Math.PI * 2;
        const d = r * spread * (0.3 + Math.min(1.4, u) * 1.4);
        return <circle key={i} cx={x + Math.cos(a) * d * 1.6} cy={y + Math.sin(a) * d * 0.35 - u * r * 0.6} r={r * (0.5 + Math.min(1.5, u) * 0.8)} fill={col} opacity={0.8} />;
      })}
    </g>
  );
};

/** Water thrown up by something huge: a sheet, a crown and droplets. */
export const Splash: React.FC<{t: number; t0: number; x: number; y: number; s?: number; life?: number}> = ({t, t0, x, y, s = 1, life = 80}) => {
  const tt = t - t0;
  if (tt < 0 || tt > life * 2) return null;
  const u = Math.min(1, tt / life);
  const rise = Math.sin(Math.min(1, tt / (life * 0.9)) * Math.PI);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d={`M-420 0 Q -300 ${-500 * rise} -120 ${-760 * rise} Q 0 ${-900 * rise} 120 ${-760 * rise} Q 300 ${-500 * rise} 420 0 Z`} fill="#CFF1FF" opacity={0.75 * (1 - u * 0.6)} />
      <path d={`M-300 0 Q -200 ${-380 * rise} -60 ${-560 * rise} Q 60 ${-620 * rise} 200 ${-420 * rise} Q 280 ${-240 * rise} 300 0 Z`} fill="#FFFFFF" opacity={0.7 * (1 - u * 0.5)} />
      {Array.from({length: 40}, (_, i) => {
        const r = (k: string) => random(`sp${i}${k}`);
        const vx = (r('x') - 0.5) * 24;
        const vy = -(14 + r('y') * 18);
        const px = vx * tt;
        const py = vy * tt + 0.35 * tt * tt;
        if (py > 60) return null;
        return <ellipse key={i} cx={px} cy={py} rx={10 + r('s') * 16} ry={14 + r('s') * 20} fill="#E8FAFF" opacity={0.9} />;
      })}
    </g>
  );
};

export const Shockwave: React.FC<{t: number; t0: number; x: number; y: number; r?: number; life?: number; col?: string}> = ({t, t0, x, y, r = 900, life = 30, col = '#FFFFFF'}) => {
  const tt = t - t0;
  if (tt < 0 || tt > life) return null;
  const u = tt / life;
  return <ellipse cx={x} cy={y} rx={r * u} ry={r * u * 0.22} fill="none" stroke={col} strokeWidth={30 * (1 - u) + 2} opacity={1 - u} />;
};

/** A beam from (x1,y1) to (x2,y2): glow, core and crackle. */
export const Beam: React.FC<{t: number; x1: number; y1: number; x2: number; y2: number; col: string; w?: number; k?: number}> = ({t, x1, y1, x2, y2, col, w = 60, k = 1}) => {
  if (k <= 0) return null;
  const ex = x1 + (x2 - x1) * k;
  const ey = y1 + (y2 - y1) * k;
  const fl = 0.85 + 0.15 * Math.sin(t * 2.3);
  const ang = Math.atan2(ey - y1, ex - x1);
  const n = 8;
  const zig = Array.from({length: n + 1}, (_, i) => {
    const u = i / n;
    const off = (i === 0 || i === n ? 0 : Math.sin(t * 3 + i * 7) * w * 0.35);
    return `${x1 + (ex - x1) * u - Math.sin(ang) * off},${y1 + (ey - y1) * u + Math.cos(ang) * off}`;
  }).join(' ');
  return (
    <g>
      <line x1={x1} y1={y1} x2={ex} y2={ey} stroke={col} strokeWidth={w * 2.4 * fl} strokeLinecap="round" opacity={0.25} />
      <line x1={x1} y1={y1} x2={ex} y2={ey} stroke={col} strokeWidth={w * fl} strokeLinecap="round" opacity={0.8} />
      <line x1={x1} y1={y1} x2={ex} y2={ey} stroke="#FFFFFF" strokeWidth={w * 0.4} strokeLinecap="round" />
      <polyline points={zig} stroke="#FFFFFF" strokeWidth={4} fill="none" opacity={0.7} />
      <circle cx={ex} cy={ey} r={w * 1.2 * fl} fill="#FFFFFF" opacity={0.9} />
      <circle cx={ex} cy={ey} r={w * 2.2 * fl} fill={col} opacity={0.4} />
    </g>
  );
};

/** Sparks spraying from a point. */
export const Sparks: React.FC<{t: number; t0: number; x: number; y: number; n?: number; col?: string; life?: number; seed?: number}> = ({t, t0, x, y, n = 30, col = '#FFE08A', life = 24, seed = 3}) => {
  const tt = t - t0;
  if (tt < 0 || tt > life) return null;
  const u = tt / life;
  return (
    <g opacity={1 - u}>
      {Array.from({length: n}, (_, i) => {
        const a = random(`sk${seed}${i}`) * Math.PI * 2;
        const v = 20 + random(`sv${seed}${i}`) * 40;
        const d = v * tt;
        const l = 30 + v;
        return <line key={i} x1={x + Math.cos(a) * d} y1={y + Math.sin(a) * d} x2={x + Math.cos(a) * (d + l)} y2={y + Math.sin(a) * (d + l)} stroke={col} strokeWidth={5} strokeLinecap="round" />;
      })}
    </g>
  );
};

/** Camera shake offset: decays from t0 over `len` frames. */
export const shake = (t: number, t0: number, amp: number, len = 30) => {
  const tt = t - t0;
  if (tt < 0 || tt > len) return [0, 0];
  const d = amp * (1 - tt / len);
  return [Math.sin(tt * 2.9) * d, Math.cos(tt * 3.7) * d * 0.8];
};
