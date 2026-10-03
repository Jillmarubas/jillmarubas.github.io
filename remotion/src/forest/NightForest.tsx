import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';

/*
 * "Night forest": an original flat-vector scene (mushroom house in a pine forest at night),
 * drawn entirely in SVG and animated as a seamless 10 s loop at 30 fps.
 * Every motion uses a whole number of cycles per LOOP frames, so frame LOOP == frame 0.
 */
export const FOREST_LOOP = 300;
const W = 1080;
const H = 1920;
const TAU = Math.PI * 2;

const P = {
  sky: '#0E1F30',
  sky2: '#15304A',
  hillFar: '#1B4A68',
  hillMid: '#1F6380',
  teal: '#1E8A84',
  teal2: '#2BA394',
  mint: '#8FCFA4',
  mint2: '#C4E5B2',
  ground: '#6FBF9A',
  ground2: '#4FA98A',
  navy: '#163A55',
  orange: '#F59A2A',
  red: '#EE5D35',
  cream: '#FBF1D6',
  white: '#FFFFFF',
  glow: '#FFD45A',
};

/** sin with k whole cycles per loop, so every motion loops seamlessly */
const wave = (f: number, k: number, phase = 0) => Math.sin((TAU * k * f) / FOREST_LOOP + phase);

/* ------------------------------------------------------------------ pieces */
const Pine: React.FC<{x: number; base: number; h: number; c1: string; c2: string; trunk?: string; f: number; k?: number; ph?: number}> = ({x, base, h, c1, c2, trunk = P.navy, f, k = 1, ph = 0}) => {
  const w = h * 0.52;
  const sway = wave(f, k, ph) * 1.6; // degrees at the tip
  const tiers = [0, 1, 2];
  return (
    <g transform={`translate(${x} ${base}) rotate(${sway} 0 0)`}>
      <rect x={-w * 0.06} y={-h * 0.18} width={w * 0.12} height={h * 0.2} fill={trunk} />
      {tiers.map((i) => {
        const top = -h + i * h * 0.24;
        const bot = -h * 0.14 - (2 - i) * h * 0.2;
        const hw = w * (0.3 + i * 0.2);
        return (
          <g key={i}>
            <path d={`M0 ${top} L${hw} ${bot} L${-hw} ${bot} Z`} fill={c1} />
            <path d={`M0 ${top} L${hw} ${bot} L0 ${bot} Z`} fill={c2} />
            <rect x={-hw * 0.72} y={bot - (bot - top) * 0.22} width={hw * 1.44} height={(bot - top) * 0.06} fill={c2} opacity={0.55} />
          </g>
        );
      })}
    </g>
  );
};

const Cloud: React.FC<{x: number; y: number; s: number; c: string}> = ({x, y, s, c}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} fill={c}>
    <circle cx={0} cy={0} r={48} />
    <circle cx={55} cy={-18} r={62} />
    <circle cx={118} cy={4} r={42} />
    <rect x={-48} y={0} width={210} height={46} />
  </g>
);

const Fern: React.FC<{x: number; y: number; s: number; c: string; f: number; ph: number; flip?: boolean}> = ({x, y, s, c, f, ph, flip}) => (
  <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s}) rotate(${wave(f, 2, ph) * 3} 0 0)`}>
    <path d="M0 0 C 4 -120 -2 -220 0 -300" stroke={c} strokeWidth={8} fill="none" strokeLinecap="round" />
    {[0, 1, 2, 3, 4].map((i) => (
      <g key={i} transform={`translate(0 ${-40 - i * 52})`}>
        <path d={`M0 0 C 30 -10 60 -40 70 -70 C 40 -60 10 -40 0 0 Z`} fill={c} />
        <path d={`M0 0 C -30 -10 -60 -40 -70 -70 C -40 -60 -10 -40 0 0 Z`} fill={c} />
      </g>
    ))}
  </g>
);

const Twinkle: React.FC<{x: number; y: number; r: number; f: number; k: number; ph: number}> = ({x, y, r, f, k, ph}) => {
  const o = 0.35 + 0.65 * (0.5 + 0.5 * wave(f, k, ph));
  const s = 0.7 + 0.3 * (0.5 + 0.5 * wave(f, k, ph));
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
      <path d={`M0 ${-r} Q ${r * 0.14} ${-r * 0.14} ${r} 0 Q ${r * 0.14} ${r * 0.14} 0 ${r} Q ${-r * 0.14} ${r * 0.14} ${-r} 0 Q ${-r * 0.14} ${-r * 0.14} 0 ${-r} Z`} fill={P.white} />
    </g>
  );
};

const Firefly: React.FC<{cx: number; cy: number; ax: number; ay: number; f: number; kx: number; ky: number; ph: number}> = ({cx, cy, ax, ay, f, kx, ky, ph}) => {
  const x = cx + ax * wave(f, kx, ph);
  const y = cy + ay * wave(f, ky, ph * 1.7);
  const pulse = 0.5 + 0.5 * wave(f, 3, ph * 2.3);
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r={34} fill={P.glow} opacity={0.12 + 0.18 * pulse} />
      <circle r={16} fill={P.glow} opacity={0.25 + 0.25 * pulse} />
      <circle r={7} fill={P.glow} opacity={0.7 + 0.3 * pulse} />
    </g>
  );
};

/* ------------------------------------------------------------------ the mushroom house */
const MushroomHouse: React.FC<{f: number}> = ({f}) => {
  const lamp = 0.75 + 0.25 * (0.5 + 0.5 * wave(f, 5)) * (0.8 + 0.2 * wave(f, 13, 1));
  return (
    <g transform="translate(610 1330)">
      {/* stem / walls */}
      <path d="M-170 0 C -175 -120 -160 -220 -150 -290 L 150 -290 C 165 -220 180 -120 175 0 Z" fill={P.cream} />
      <path d="M40 0 C 45 -120 55 -220 60 -290 L 150 -290 C 165 -220 180 -120 175 0 Z" fill="#EFE0BC" />
      {/* door */}
      <path d="M-10 0 L -10 -130 A 58 58 0 0 1 106 -130 L 106 0 Z" fill={P.teal} />
      <path d="M48 -186 L 48 0" stroke={P.navy} strokeWidth={4} opacity={0.35} />
      <circle cx={88} cy={-70} r={7} fill={P.cream} />
      {/* round window with warm light */}
      <circle cx={-92} cy={-150} r={50} fill={P.navy} />
      <circle cx={-92} cy={-150} r={40} fill={P.glow} opacity={lamp} />
      <path d="M-92 -190 L -92 -110 M-132 -150 L -52 -150" stroke={P.navy} strokeWidth={7} />
      <circle cx={-92} cy={-150} r={90} fill={P.glow} opacity={0.10 * lamp} />
      {/* steps */}
      <rect x={-30} y={0} width={156} height={16} rx={6} fill="#D9C79E" />
      {/* cap */}
      <path d="M-250 -270 C -240 -470 -110 -560 20 -560 C 170 -560 280 -460 285 -270 C 150 -240 -120 -240 -250 -270 Z" fill={P.red} />
      <path d="M20 -560 C 170 -560 280 -460 285 -270 C 220 -256 150 -250 100 -250 C 150 -330 150 -470 20 -560 Z" fill="#D94A2A" />
      <path d="M-250 -270 C -120 -240 150 -240 285 -270 C 280 -250 270 -240 262 -232 C 120 -208 -110 -208 -240 -232 Z" fill={P.cream} />
      {[
        [-150, -390, 44],
        [-20, -480, 34],
        [110, -400, 48],
        [-60, -330, 26],
        [200, -330, 24],
      ].map(([cx, cy, r], i) => (
        <circle key={i} cx={cx} cy={cy} r={r} fill={P.cream} opacity={0.95} />
      ))}
      {/* chimney + smoke */}
      <rect x={150} y={-560} width={42} height={80} fill={P.navy} />
      <rect x={142} y={-574} width={58} height={18} fill="#0E2B41" />
      {[0, 1, 2, 3].map((i) => {
        const t = (((f / FOREST_LOOP) * 3 + i / 4) % 1 + 1) % 1; // 3 puffs per loop, staggered
        const y = -600 - t * 330;
        const x = 171 + Math.sin(t * TAU * 0.8 + i) * 28 + t * 50;
        return <circle key={i} cx={x} cy={y} r={16 + t * 38} fill="#BFD7E3" opacity={0.55 * (1 - t) * Math.min(1, t * 6)} />;
      })}
    </g>
  );
};

/* ------------------------------------------------------------------ the scene */
export const NightForest: React.FC = () => {
  const f = useCurrentFrame() % FOREST_LOOP;
  // gentle parallax: each layer sways sideways by a different amount, one cycle per loop
  const par = (depth: number) => wave(f, 1) * depth;
  // clouds drift across and wrap; two copies keep the loop seamless
  const drift = (speed: number, y: number, s: number, c: string, x0: number) => {
    const span = W + 500;
    const x = ((x0 + (f / FOREST_LOOP) * span * speed) % span) - 300;
    return (
      <>
        <Cloud x={x} y={y} s={s} c={c} />
        <Cloud x={x - span} y={y} s={s} c={c} />
      </>
    );
  };
  const moonGlow = 0.5 + 0.5 * wave(f, 2);

  return (
    <AbsoluteFill style={{background: P.sky}}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <defs>
          <linearGradient id="nf-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={P.sky} />
            <stop offset="0.6" stopColor={P.sky2} />
          </linearGradient>
        </defs>
        <rect width={W} height={H} fill="url(#nf-sky)" />

        {/* moon: a crescent with a soft halo */}
        <g transform={`translate(${250 + par(6)} 330)`}>
          <circle r={170} fill={P.glow} opacity={0.05 + 0.05 * moonGlow} />
          <circle r={120} fill={P.glow} opacity={0.08 + 0.06 * moonGlow} />
          <circle r={82} fill={P.orange} />
          <circle cx={36} cy={-22} r={70} fill={P.sky} />
        </g>

        {/* stars */}
        {[
          [140, 180, 18, 2, 0],
          [330, 420, 12, 3, 1],
          [560, 150, 16, 1, 2],
          [960, 560, 14, 2, 3],
          [90, 640, 10, 3, 4],
          [700, 620, 11, 1, 5],
          [430, 250, 8, 2, 6],
          [1000, 130, 9, 3, 1.5],
        ].map(([x, y, r, k, ph], i) => (
          <Twinkle key={i} x={x} y={y} r={r} f={f} k={k} ph={ph} />
        ))}

        {/* clouds, far and slow / near and faster */}
        {drift(1, 360, 0.9, P.hillFar, 100)}
        {drift(1, 520, 0.7, '#2B5A7A', 700)}
        {drift(2, 780, 0.8, P.white, 300)}

        {/* far hills */}
        <path transform={`translate(${par(10)} 0)`} d={`M-60 1010 C 120 880 300 900 480 960 C 660 1020 820 860 1140 900 L1140 ${H} L-60 ${H} Z`} fill={P.hillFar} />
        {/* mid hills */}
        <path transform={`translate(${par(18)} 0)`} d={`M-60 1130 C 160 1030 360 1080 560 1110 C 760 1140 900 1040 1140 1070 L1140 ${H} L-60 ${H} Z`} fill={P.hillMid} />

        {/* back forest */}
        <g transform={`translate(${par(26)} 0)`}>
          {[
            [40, 1260, 430],
            [190, 1230, 380],
            [330, 1270, 460],
            [860, 1250, 420],
            [1010, 1270, 470],
            [980, 1200, 330],
          ].map(([x, b, h], i) => (
            <Pine key={i} x={x} base={b} h={h} c1={P.teal} c2="#23978F" f={f} k={1} ph={i} />
          ))}
        </g>

        {/* ground */}
        <path d={`M-60 1300 C 200 1250 420 1290 620 1320 C 820 1350 960 1290 1140 1300 L1140 ${H} L-60 ${H} Z`} fill={P.ground2} />

        {/* the house */}
        <g transform={`translate(${par(34)} 0)`}>
          <MushroomHouse f={f} />
        </g>

        {/* front forest */}
        <g transform={`translate(${par(46)} 0)`}>
          {[
            [150, 1500, 620],
            [360, 1560, 420],
            [940, 1520, 560],
          ].map(([x, b, h], i) => (
            <Pine key={i} x={x} base={b} h={h} c1={P.mint} c2={P.mint2} trunk="#123049" f={f} k={2} ph={i * 2} />
          ))}
        </g>

        {/* foreground meadow, bushes and ferns */}
        <path d={`M-60 1560 C 180 1500 460 1560 680 1580 C 860 1600 980 1540 1140 1560 L1140 ${H} L-60 ${H} Z`} fill={P.ground} />
        <g transform={`translate(${par(60)} 0)`}>
          {[
            [470, 1640, 70],
            [540, 1650, 52],
            [790, 1700, 64],
            [860, 1706, 46],
          ].map(([x, y, r], i) => (
            <path key={i} d={`M${x - r} ${y + 20} A ${r} ${r} 0 0 1 ${x + r} ${y + 20} Z`} fill={i % 2 ? P.teal2 : P.navy} />
          ))}
          <Fern x={70} y={1920} s={1.25} c={P.navy} f={f} ph={0} />
          <Fern x={200} y={1930} s={0.9} c={P.mint2} f={f} ph={1.4} flip />
          <Fern x={1000} y={1920} s={1.15} c={P.navy} f={f} ph={2.1} flip />
          <Fern x={880} y={1935} s={0.85} c={P.mint2} f={f} ph={0.7} />
          {Array.from({length: 7}, (_, i) => (
            <path key={i} d={`M${300 + i * 90} 1920 l40 -60 l40 60 Z`} fill={P.navy} opacity={0.9} />
          ))}
        </g>

        {/* fireflies */}
        {[
          [300, 1040, 60, 40, 1, 2, 0],
          [860, 980, 50, 60, 2, 1, 1.3],
          [240, 1420, 70, 30, 1, 3, 2.1],
          [760, 1480, 40, 50, 3, 2, 0.6],
          [520, 900, 80, 30, 1, 2, 3.3],
          [980, 1340, 30, 60, 2, 3, 4.1],
        ].map(([cx, cy, ax, ay, kx, ky, ph], i) => (
          <Firefly key={i} cx={cx} cy={cy} ax={ax} ay={ay} f={f} kx={kx} ky={ky} ph={ph} />
        ))}
      </svg>
    </AbsoluteFill>
  );
};
