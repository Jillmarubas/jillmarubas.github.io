// Munchkin country (Baum, ch. 2): green grass, stately fruit trees, banks of gorgeous flowers, brilliant birds,
// a brook sparkling between green banks, and round blue houses with domed roofs. Fully saturated.
import React from 'react';
import {random} from 'remotion';
import {Cut, Pt, ellipsePts, rectPts} from '../paperkite/kit';
import {cutC, mix, OZ, W} from './look';

export const OzSky: React.FC<{t: number; y1?: number}> = ({t, y1 = 1080}) => (
  <g>
    <rect x={-1500} y={-1500} width={W + 3000} height={y1 + 1500} fill="url(#skyO)" />
    <circle cx={1500} cy={170} r={260} fill="url(#sunGlow)" />
    <circle cx={1500} cy={170} r={56} fill="#FFF7D6" />
    {Array.from({length: 6}, (_, i) => {
      const cx = ((random(`oc${i}`) * 3000 + t * 10) % 3400) - 700;
      const cy = 110 + random(`ocy${i}`) * 200;
      const w = 240 + random(`ocw${i}`) * 260;
      const pts: Pt[] = [
        [-w / 2, 26], [-w * 0.44, -6], [-w * 0.3, -40], [-w * 0.08, -52], [w * 0.08, -74], [w * 0.3, -56], [w * 0.44, -20], [w / 2, 26],
      ];
      return (
        <g key={i}>
          <Cut d={cutC(pts.map(([x, y]) => [x + cx, y + cy + 10]), `ocs${i}`, 2, 16)} fill="#C9DCEB" lift={0} edge={0} />
          <Cut d={cutC(pts.map(([x, y]) => [x + cx, y + cy]), `ocl${i}`, 2, 16)} fill="#FFFFFF" lift={1} edge={0.2} />
        </g>
      );
    })}
  </g>
);

// Rolling hills in bands. Far hills are bluer (aerial perspective), near ones richer green.
export const Hills: React.FC<{y: number; k: number; seed: string; amp?: number}> = ({y, k, seed, amp = 60}) => {
  const col = mix('#8FC7A0', OZ.grassO, k);
  const pts: Pt[] = [];
  for (let x = -1600; x <= W + 1600; x += 120) pts.push([x, y - amp * (0.5 + 0.5 * Math.sin(x * 0.003 + random(seed) * 6)) - random(`${seed}${x}`) * 8]);
  pts.push([W + 1600, 1600], [-1600, 1600]);
  return <Cut d={cutC(pts, seed, 2, 40)} fill={col} lift={1} edge={0.15} />;
};

// A Munchkin house: round, blue walls, domed roof.
export const DomeHouse: React.FC<{x: number; y: number; s: number; seed: string}> = ({x, y, s, seed}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <Cut d={cutC(rectPts(-60, -70, 120, 70), seed + 'w', 1, 12)} fill="#3F6FCF" lift={1} edge={0.2} />
    <Cut d={cutC([[-70, -66], [-62, -110], [-34, -142], [0, -152], [34, -142], [62, -110], [70, -66]], seed + 'd', 1, 12)} fill="#2A4FA6" lift={1} edge={0.2} />
    <rect x={-14} y={-46} width={28} height={46} rx={14} fill="#1C2F66" />
    <circle cx={36} cy={-40} r={10} fill="#BFE6FF" />
  </g>
);

export const FruitTree: React.FC<{x: number; y: number; s: number; seed: string; t: number; fruit?: string}> = ({x, y, s, seed, t, fruit}) => {
  const sway = Math.sin(t * 0.9 + random(seed) * 6) * 1.5;
  const f = fruit ?? ['#F28C1E', '#D7262E', '#E8C93A', '#6A2A6E'][Math.floor(random(seed + 'f') * 4)];
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <Cut d={cutC([[-16, 0], [16, 0], [12, -120], [30, -170], [20, -176], [4, -140], [-10, -180], [-22, -170], [-10, -120]], seed + 'tr', 1, 10)} fill="#5A3E2B" lift={1} edge={0.15} />
      <g transform={`rotate(${sway} 0 -150)`}>
        {[
          [-70, -200, 90, 70],
          [60, -210, 86, 68],
          [0, -260, 110, 80],
          [-30, -170, 80, 50],
          [40, -170, 80, 50],
        ].map(([cx, cy, rx, ry], i) => (
          <Cut key={i} d={cutC(ellipsePts(cx, cy, rx, ry, 18), `${seed}c${i}`, 3, 12)} fill={i % 2 ? '#4FA83D' : i === 2 ? '#3F9A3A' : '#2E8436'} lift={2} edge={0.15} />
        ))}
        {Array.from({length: 14}, (_, i) => (
          <circle key={i} cx={(random(`${seed}fx${i}`) - 0.5) * 230} cy={-150 - random(`${seed}fy${i}`) * 150} r={11} fill={f} stroke="rgba(0,0,0,0.15)" strokeWidth={2} />
        ))}
      </g>
    </g>
  );
};

export const FlowerBank: React.FC<{x0: number; x1: number; y: number; seed: string; t: number; size?: number}> = ({x0, x1, y, seed, t, size = 1}) => {
  const cols = ['#E5372F', '#F6C21C', '#D23C8A', '#7A4FC2', '#FBF8F0', '#F28A1E'];
  const n = Math.round((x1 - x0) / (26 * size));
  return (
    <g>
      <Cut d={cutC([[x0, y + 20], [x0 + 40, y - 30 * size], [x1 - 40, y - 34 * size], [x1, y + 20]], seed + 'mound', 2, 20)} fill="#2E8F2E" lift={1} edge={0.15} />
      {Array.from({length: n}, (_, i) => {
        const fx = x0 + 20 + random(`${seed}x${i}`) * (x1 - x0 - 40);
        const fy = y - random(`${seed}y${i}`) * 40 * size;
        const c = cols[Math.floor(random(`${seed}c${i}`) * cols.length)];
        const r = (8 + random(`${seed}r${i}`) * 6) * size;
        const b = Math.sin(t * 1.6 + fx * 0.02) * 2;
        return (
          <g key={i} transform={`translate(${fx + b} ${fy})`}>
            <line x1={0} y1={0} x2={-b} y2={r * 2.4} stroke="#2E7A2E" strokeWidth={2 * size} />
            {[0, 72, 144, 216, 288].map((a) => (
              <ellipse key={a} cx={Math.cos((a * Math.PI) / 180) * r * 0.6} cy={Math.sin((a * Math.PI) / 180) * r * 0.6} rx={r * 0.55} ry={r * 0.4} fill={c} transform={`rotate(${a} ${Math.cos((a * Math.PI) / 180) * r * 0.6} ${Math.sin((a * Math.PI) / 180) * r * 0.6})`} />
            ))}
            <circle r={r * 0.35} fill={c === '#F6C21C' ? '#8A4A12' : '#F7E08A'} />
          </g>
        );
      })}
    </g>
  );
};

// The brook: a winding band of water between green banks, with moving sparkles.
export const Brook: React.FC<{y: number; t: number; amp?: number; width?: number}> = ({y, t, amp = 40, width = 70}) => {
  const top: Pt[] = [];
  const bot: Pt[] = [];
  for (let x = -1400; x <= W + 1400; x += 80) {
    const k = (x + 1400) / (W + 2800);
    const wd = width * (0.4 + k);
    const yy = y + Math.sin(x * 0.004) * amp + k * 80;
    top.push([x, yy - wd / 2]);
    bot.push([x, yy + wd / 2]);
  }
  return (
    <g>
      <Cut d={cutC([...top.map(([x, yy]) => [x, yy - 8] as Pt), ...[...bot].reverse().map(([x, yy]) => [x, yy + 10] as Pt)], 'bank', 2, 30)} fill="#24543A" lift={1} edge={0} />
      <Cut d={cutC([...top, ...[...bot].reverse()], 'water', 2, 30)} fill="#2FA3C8" lift={1} edge={0.25} />
      {Array.from({length: 40}, (_, i) => {
        const x = ((random(`sp${i}`) * (W + 2400) + t * 60) % (W + 2400)) - 1200;
        const k = (x + 1400) / (W + 2800);
        const yy = y + Math.sin(x * 0.004) * amp + k * 80 + (random(`sq${i}`) - 0.5) * width * (0.4 + k) * 0.6;
        const on = (Math.sin(t * 6 + i * 1.7) + 1) / 2;
        return <path key={i} d={`M${x - 12} ${yy} L${x + 12} ${yy}`} stroke="#E8FAFF" strokeWidth={3} opacity={on} strokeLinecap="round" />;
      })}
    </g>
  );
};

// Birds with rare and brilliant plumage, flapping on twos.
export const OzBird: React.FC<{x: number; y: number; s: number; t: number; col: string; seed: string}> = ({x, y, s, t, col, seed}) => {
  const up = Math.floor(t * 12 + random(seed) * 4) % 2 === 0;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx={0} cy={0} rx={22} ry={11} fill={col} />
      <circle cx={20} cy={-6} r={8} fill={col} />
      <path d="M27 -6 L36 -3 L27 -1 Z" fill="#E8A23A" />
      <circle cx={22} cy={-8} r={1.8} fill="#000" />
      <path d="M-20 0 L-38 -6 L-36 6 Z" fill={mix(col, '#000', 0.25)} />
      <path d={up ? 'M-4 -4 L-18 -34 L10 -6 Z' : 'M-4 2 L-16 26 L10 4 Z'} fill={mix(col, '#fff', 0.15)} />
    </g>
  );
};

// The Wicked Witch of the East's feet, sticking out from under the corner of the house, shod in silver shoes.
export const SilverFeet: React.FC<{x: number; y: number; s: number; t: number; shine?: number}> = ({x, y, s, t, shine = 0}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {[0, 1].map((i) => (
      <g key={i} transform={`translate(${i * 70} ${i * 14}) rotate(${-8 + i * 10})`}>
        {/* striped stocking (a period woman's stocking, dark) */}
        <Cut d={cutC([[-60, -30], [10, -26], [12, 2], [-60, 4]], `leg${i}`, 1, 10)} fill="#3A3540" lift={1} edge={0.15} />
        {/* silver shoe: pointed toe, low heel */}
        <Cut d={cutC([[0, -30], [40, -30], [86, -12], [96, 4], [10, 6], [2, 18], [-8, 18], [-6, 4]], `shoe${i}`, 0.8, 8)} fill={OZ.silver} lift={2} edge={0.4} />
        <path d="M18 -24 Q50 -26 80 -10" stroke="#FFFFFF" strokeWidth={5} opacity={0.6 + shine * 0.4} fill="none" strokeLinecap="round" />
        <path d="M10 2 L90 2" stroke="#8C939E" strokeWidth={4} />
      </g>
    ))}
    {shine > 0 && (
      <g opacity={shine}>
        {[
          [70, -40],
          [140, -24],
        ].map(([sx, sy], i) => (
          <path key={i} d={`M${sx} ${sy - 22} L${sx + 4} ${sy - 4} L${sx + 22} ${sy} L${sx + 4} ${sy + 4} L${sx} ${sy + 22} L${sx - 4} ${sy + 4} L${sx - 22} ${sy} L${sx - 4} ${sy - 4} Z`} fill="#FFFFFF" transform={`rotate(${t * 40} ${sx} ${sy})`} />
        ))}
      </g>
    )}
  </g>
);
