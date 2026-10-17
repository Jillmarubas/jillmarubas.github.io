// Scenery pieces, all cut from paper: sun, clouds, houses, trees, hills, waves, mountains, stars.
import React from 'react';
import {random} from 'remotion';
import {C, Cut, cut, bandPts, burstPts, ellipsePts, Pt, rectPts, W, H} from './kit';

export const Sky: React.FC<{color: string}> = ({color}) => <rect x={-50} y={-50} width={W + 100} height={H + 100} fill={color} />;

export const Sun: React.FC<{x: number; y: number; r?: number; f: number; color?: string}> = ({x, y, r = 110, f, color = C.sun}) => (
  <g transform={`translate(${x} ${y}) rotate(${f * 0.25})`}>
    <Cut d={cut(burstPts(0, 0, r * 1.32, r * 1.08, 16), 'sunRays', 1.2, 14)} fill="#F0E2BE" lift={1} />
    <Cut d={cut(ellipsePts(0, 0, r, r), 'sunDisc', 1.4)} fill={color} lift={2} />
  </g>
);

export const Cloud: React.FC<{x: number; y: number; s?: number; seed: string; color?: string}> = ({x, y, s = 1, seed, color = C.white}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <Cut d={cut(ellipsePts(-70, 10, 80, 50), `${seed}a`, 1.6)} fill={color} lift={2} />
    <Cut d={cut(ellipsePts(60, 14, 90, 52), `${seed}b`, 1.6)} fill={color} lift={2} />
    <Cut d={cut(ellipsePts(0, -24, 92, 70), `${seed}c`, 1.6)} fill={color} lift={2} />
    <Cut d={cut(rectPts(-140, 10, 290, 52), `${seed}d`, 1.2, 20)} fill={color} lift={0} edge={0} />
  </g>
);

export const House: React.FC<{
  x: number;
  base: number;
  w: number;
  h: number;
  wall: string;
  roof: string;
  seed: string;
  lit?: number;
  chimney?: boolean;
}> = ({x, base, w, h, wall, roof, seed, lit = 0, chimney}) => {
  const top = base - h;
  const peak = top - w * 0.5;
  const win = lit > 0 ? mix(C.window, '#F1DEAA', lit) : C.window;
  const ww = Math.min(42, w * 0.22);
  return (
    <g>
      {chimney && <Cut d={cut(rectPts(x + w * 0.18, peak + w * 0.12, 30, 90), `${seed}ch`, 1)} fill={C.roof3} lift={1} />}
      <Cut d={cut(rectPts(x - w / 2, top, w, h), `${seed}w`, 1.5)} fill={wall} lift={2} />
      <Cut d={cut([[x - w / 2 - 22, top + 6], [x, peak], [x + w / 2 + 22, top + 6]], `${seed}r`, 1.5)} fill={roof} lift={2} />
      <Cut d={cut(rectPts(x - 22, base - 86, 44, 86), `${seed}d`, 1)} fill={C.roof3} lift={1} edge={0.2} />
      {[-1, 1].map((k) => (
        <g key={k}>
          <Cut d={cut(rectPts(x + k * w * 0.27 - ww / 2, top + h * 0.22, ww, ww * 1.1), `${seed}win${k}`, 0.8, 12)} fill={win} lift={1} edge={0.2} />
          <path
            d={`M${x + k * w * 0.27} ${top + h * 0.22} v${ww * 1.1} M${x + k * w * 0.27 - ww / 2} ${top + h * 0.22 + ww * 0.55} h${ww}`}
            stroke={wall}
            strokeWidth={4}
          />
        </g>
      ))}
    </g>
  );
};

// Chimney smoke: paper puffs that rise and shrink away.
export const Smoke: React.FC<{x: number; y: number; f: number; seed: string}> = ({x, y, f, seed}) => (
  <g>
    {[0, 1, 2, 3].map((i) => {
      const t = ((f / 2 + i * 12) % 48) / 48;
      return (
        <g key={i} opacity={1 - t * t}>
          <Cut d={cut(ellipsePts(x + t * 60, y - t * 190, 14 + t * 22, 12 + t * 18, 12), `${seed}${i}`, 1)} fill={C.white} lift={1} edge={0} />
        </g>
      );
    })}
  </g>
);

export const Tree: React.FC<{x: number; base: number; s?: number; seed: string; sway?: number}> = ({x, base, s = 1, seed, sway = 0}) => (
  <g transform={`translate(${x} ${base}) scale(${s})`}>
    <Cut d={cut([[-14, 0], [14, 0], [10, -170], [-10, -170]], `${seed}t`, 1)} fill={C.roof3} lift={1} />
    <g transform={`rotate(${sway} 0 -170)`}>
      <Cut d={cut(ellipsePts(-50, -210, 70, 64), `${seed}a`, 1.4)} fill={C.sage4} lift={2} />
      <Cut d={cut(ellipsePts(48, -220, 72, 66), `${seed}b`, 1.4)} fill={C.sage3} lift={2} />
      <Cut d={cut(ellipsePts(0, -290, 82, 74), `${seed}c`, 1.4)} fill={C.sage3} lift={2} />
    </g>
  </g>
);

export const Pine: React.FC<{x: number; base: number; s?: number; fill: string; seed: string}> = ({x, base, s = 1, fill, seed}) => (
  <g transform={`translate(${x} ${base}) scale(${s})`}>
    <Cut d={cut([[-60, 0], [0, -110], [60, 0]], `${seed}1`, 1)} fill={fill} lift={1} edge={0.12} />
    <Cut d={cut([[-48, -70], [0, -175], [48, -70]], `${seed}2`, 1)} fill={fill} lift={1} edge={0.12} />
  </g>
);

export const Tuft: React.FC<{x: number; y: number; s?: number; fill?: string; seed: string; lean?: number}> = ({x, y, s = 1, fill = C.sage4, seed, lean = 0}) => (
  <g transform={`translate(${x} ${y}) scale(${s}) skewX(${lean})`}>
    <Cut d={cut([[-40, 0], [-30, -60], [-14, -8], [0, -86], [12, -8], [30, -66], [42, 0]], seed, 1, 12)} fill={fill} lift={3} edge={0.15} />
  </g>
);

export const Flower: React.FC<{x: number; y: number; seed: string}> = ({x, y, seed}) => (
  <g>
    <path d={`M${x} ${y} L${x} ${y + 40}`} stroke={C.sage4} strokeWidth={4} />
    <Cut d={cut(burstPts(x, y, 18, 10, 5), seed, 0.6, 8)} fill={C.white} lift={2} edge={0} />
    <circle cx={x} cy={y} r={6} fill={C.sun} />
  </g>
);

export const Band: React.FC<{f: (x: number) => number; fill: string; seed: string; lift?: 0 | 1 | 2 | 3 | 4; x0?: number; x1?: number; bottom?: number}> = ({
  f,
  fill,
  seed,
  lift = 1,
  x0 = -60,
  x1 = W + 60,
  bottom = H + 60,
}) => <Cut d={cut(bandPts(f, x0, x1, bottom, 24), seed, 1.6, 18)} fill={fill} lift={lift} />;

export const Fence: React.FC<{y: number; x0: number; x1: number; seed: string}> = ({y, x0, x1, seed}) => {
  const posts: number[] = [];
  for (let x = x0; x <= x1; x += 92) posts.push(x);
  return (
    <g>
      <Cut d={cut(rectPts(x0 - 20, y + 30, x1 - x0 + 40, 20), `${seed}r1`, 1.2, 20)} fill={C.tan2} lift={3} />
      <Cut d={cut(rectPts(x0 - 20, y + 92, x1 - x0 + 40, 20), `${seed}r2`, 1.2, 20)} fill={C.tan2} lift={3} />
      {posts.map((x, i) => (
        <Cut key={i} d={cut([[x - 18, y + 220], [x - 18, y + 12], [x, y - 6], [x + 18, y + 12], [x + 18, y + 220]], `${seed}p${i}`, 1, 14)} fill="#CFC2AC" lift={3} />
      ))}
    </g>
  );
};

// Mountain range: a zig-zag ridge with optional snow caps.
export const Range: React.FC<{base: number; peaks: [number, number][]; fill: string; seed: string; snow?: string; lift?: 0 | 1 | 2 | 3}> = ({
  base,
  peaks,
  fill,
  seed,
  snow,
  lift = 1,
}) => {
  const pts: Pt[] = [[peaks[0][0] - 300, base]];
  peaks.forEach(([x, h], i) => {
    pts.push([x, base - h]);
    if (i < peaks.length - 1) pts.push([(x + peaks[i + 1][0]) / 2, base - Math.min(h, peaks[i + 1][1]) * 0.45]);
  });
  pts.push([peaks[peaks.length - 1][0] + 300, base], [peaks[peaks.length - 1][0] + 300, H + 80], [peaks[0][0] - 300, H + 80]);
  return (
    <g>
      <Cut d={cut(pts, seed, 1.8, 20)} fill={fill} lift={lift} />
      {snow &&
        peaks.map(([x, h], i) => {
          const c = h * 0.2;
          return (
            <Cut
              key={i}
              d={cut([[x, base - h], [x + c * 0.9, base - h + c], [x + c * 0.3, base - h + c * 0.8], [x, base - h + c * 1.1], [x - c * 0.35, base - h + c * 0.75], [x - c * 0.9, base - h + c]], `${seed}s${i}`, 1, 10)}
              fill={snow}
              lift={1}
              edge={0}
            />
          );
        })}
    </g>
  );
};

export const Star: React.FC<{x: number; y: number; r: number; seed: string; fill?: string}> = ({x, y, r, seed, fill = '#F3E9CF'}) => (
  <Cut d={cut(burstPts(x, y, r, r * 0.45, 5, -Math.PI / 2), seed, 0.5, 8)} fill={fill} lift={1} edge={0} />
);

// Seeded star field positions.
export const STARS = Array.from({length: 34}, (_, i) => ({
  x: 40 + random(`sx${i}`) * 1000,
  y: 80 + random(`sy${i}`) * 820,
  r: 8 + random(`sr${i}`) * 12,
}));

// hex colour mix
export const mix = (a: string, b: string, t: number) => {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  const tt = Math.max(0, Math.min(1, t));
  return '#' + pa.map((v, i) => Math.round(v + (pb[i] - v) * tt).toString(16).padStart(2, '0')).join('');
};
