// The one room: board walls, plank floor, cast-iron cookstove, table and chairs, the big bed and Dorothy's cot,
// a dish shelf, a kerosene lamp, a rag rug and the trapdoor to the cyclone cellar. 18 ft wide, 8 ft walls.
import React from 'react';
import {random} from 'remotion';
import {Cut, Pt, ellipsePts, rectPts} from '../paperkite/kit';
import {cutC, mix, OZ} from './look';

export type RoomLight = {day: number; storm: number; oz: number}; // 0..1 each

// Board-and-batten interior on a 1920x1080 reference plane. Back wall spans x 160..1760, floor line at y 760.
const BX0 = 160;
const BX1 = 1760;
const TOP = 120;
const FLOOR = 760;
const FT = (BX1 - BX0) / 18;

export const roomFt = FT;
export const ROOM = {BX0, BX1, TOP, FLOOR, FT};

const tone = (base: string, L: RoomLight) => {
  const dark = mix(base, '#141516', 0.72);
  const day = mix(dark, base, L.day);
  return L.oz > 0 ? mix(day, mix(base, '#FFE9B8', 0.18), L.oz) : day;
};

export const RoomShell: React.FC<{L: RoomLight; t: number; winLight?: number; doorOpen?: number; doorGlow?: string}> = ({L, t, winLight = 1, doorOpen = 0, doorGlow}) => {
  const wall = tone(OZ.wood, L);
  const wall2 = tone(OZ.woodDark, L);
  const floor = tone('#7A6450', L);
  const sky = L.oz > 0.5 ? '#9FD3F2' : mix('#8E9AA0', '#2C3532', L.storm);
  const winX = BX0 + 11 * FT;
  const winW = 2.5 * FT;
  const winY = FLOOR - 7.5 * FT;
  const winH = 5 * FT;
  const doorX = BX0 + 3 * FT;
  const doorW = (32 / 12) * FT;
  const doorH = (80 / 12) * FT;
  return (
    <g>
      {/* side walls and floor in one-point perspective */}
      <Cut d={cutC([[-400, -300], [BX0, TOP], [BX0, FLOOR], [-400, 1400]], 'lwall', 1.4, 30)} fill={wall2} lift={0} edge={0.1} />
      <Cut d={cutC([[2320, -300], [BX1, TOP], [BX1, FLOOR], [2320, 1400]], 'rwall', 1.4, 30)} fill={wall2} lift={0} edge={0.1} />
      <Cut d={cutC([[-400, 1400], [BX0, FLOOR], [BX1, FLOOR], [2320, 1400]], 'floor', 1.4, 30)} fill={floor} lift={0} edge={0.1} />
      {Array.from({length: 26}, (_, i) => {
        const xb = -1200 + i * 170;
        const xt = BX0 + ((xb + 1200) / (26 * 170)) * (BX1 - BX0);
        return <line key={i} x1={xt} y1={FLOOR} x2={xb} y2={1400} stroke="rgba(30,22,16,0.3)" strokeWidth={3} />;
      })}
      {/* ceiling joists */}
      <Cut d={cutC([[-400, -300], [2320, -300], [BX1, TOP], [BX0, TOP]], 'ceil', 1.4, 30)} fill={tone('#5C5248', L)} lift={0} edge={0} />
      {/* back wall: boards and battens */}
      <Cut d={cutC(rectPts(BX0, TOP, BX1 - BX0, FLOOR - TOP), 'bwall', 1.2, 30)} fill={wall} lift={0} edge={0.1} />
      <rect x={BX0} y={TOP} width={BX1 - BX0} height={FLOOR - TOP} fill="url(#grain)" opacity={0.6} />
      {Array.from({length: 18}, (_, i) => (
        <rect key={i} x={BX0 + i * FT + FT * 0.45} y={TOP} width={FT * 0.12} height={FLOOR - TOP} fill="rgba(30,22,16,0.2)" />
      ))}
      {/* window on the back wall */}
      <rect x={winX - FT * 0.3} y={winY - FT * 0.3} width={winW + FT * 0.6} height={winH + FT * 0.6} fill={tone(OZ.woodLight, L)} />
      <rect x={winX} y={winY} width={winW} height={winH} fill={sky} />
      {L.oz < 0.5 && L.storm < 0.5 && <rect x={winX} y={winY + winH * 0.62} width={winW} height={winH * 0.38} fill="#9A8C70" />}
      <rect x={winX} y={winY + winH / 2 - FT * 0.07} width={winW} height={FT * 0.14} fill={tone(OZ.woodLight, L)} />
      <rect x={winX + winW / 2 - FT * 0.05} y={winY} width={FT * 0.1} height={winH} fill={tone(OZ.woodLight, L)} />
      {/* door on the back wall (opens inward to the left) */}
      <rect x={doorX} y={FLOOR - doorH} width={doorW} height={doorH} fill={doorOpen > 0 ? doorGlow ?? sky : tone(OZ.woodDark, L)} />
      {doorOpen > 0 && <rect x={doorX} y={FLOOR - doorH * 0.35} width={doorW} height={doorH * 0.35} fill={L.oz > 0.5 ? '#3E9B3A' : '#8C7356'} />}
      <g transform={`translate(${doorX} 0) skewY(${doorOpen * -8}) scale(${1 - doorOpen * 0.82} 1)`}>
        <rect x={0} y={FLOOR - doorH} width={doorW} height={doorH} fill={tone(OZ.woodDark, L)} />
        {[0.33, 0.66].map((k) => (
          <line key={k} x1={doorW * k} y1={FLOOR - doorH} x2={doorW * k} y2={FLOOR} stroke="rgba(20,16,12,0.4)" strokeWidth={3} />
        ))}
        <circle cx={doorW * 0.85} cy={FLOOR - doorH * 0.48} r={6} fill="#1E1A16" />
      </g>
      {/* sunlight shaft from the window (morning in Oz) or a pale gray square (Kansas) */}
      {winLight > 0 && (
        <path d={`M${winX} ${winY} L${winX + winW} ${winY} L${winX + winW + 520} ${FLOOR + 380} L${winX + 120} ${FLOOR + 380} Z`} fill={L.oz > 0.5 ? 'url(#beam)' : 'rgba(230,232,226,0.08)'} opacity={winLight * (0.4 + L.oz * 0.6)} style={{mixBlendMode: 'screen'}} />
      )}
      {/* dust motes in the beam */}
      {L.oz > 0.5 &&
        Array.from({length: 24}, (_, i) => (
          <circle key={i} cx={winX + 60 + random(`m${i}`) * 520 + Math.sin(t + i) * 10} cy={winY + 40 + ((random(`n${i}`) * 700 + t * 12) % 700)} r={2.5} fill="#FFF6D8" opacity={0.6} />
        ))}
    </g>
  );
};

// Furniture, drawn in the same reference plane (positions in feet from the left of the back wall).
export const Stove: React.FC<{L: RoomLight; t: number; x?: number}> = ({L, x = 0.6}) => {
  const X = BX0 + x * FT;
  const iron = tone('#2E2B29', L);
  const Y = FLOOR + 20;
  return (
    <g>
      {/* stovepipe to the ceiling */}
      <rect x={X + 2.4 * FT} y={TOP - 40} width={FT * 0.5} height={Y - 5 * FT - TOP + 40} fill={iron} />
      <Cut d={cutC(rectPts(X, Y - 5 * FT, 3.6 * FT, FT * 0.3), 'warm', 0.8, 12)} fill={iron} lift={1} edge={0.15} />
      <Cut d={cutC(rectPts(X, Y - 2.5 * FT, 3.6 * FT, 2.2 * FT), 'stove', 0.8, 14)} fill={iron} lift={2} edge={0.15} />
      <rect x={X + 0.4 * FT} y={Y - 1.9 * FT} width={1.3 * FT} height={0.9 * FT} fill={tone('#4A4440', L)} />
      <rect x={X + 1.9 * FT} y={Y - 1.9 * FT} width={1.3 * FT} height={0.9 * FT} fill={tone('#4A4440', L)} />
      <rect x={X} y={Y - 2.6 * FT} width={3.6 * FT} height={FT * 0.12} fill={tone('#5A5550', L)} />
      {[0.3, 3.1].map((k) => (
        <rect key={k} x={X + k * FT} y={Y - 0.3 * FT} width={FT * 0.25} height={0.3 * FT} fill={iron} />
      ))}
      {/* kettle */}
      <Cut d={cutC(ellipsePts(X + 1 * FT, Y - 2.9 * FT, 0.5 * FT, 0.35 * FT, 12), 'kettle', 0.6, 8)} fill={tone('#5F5A54', L)} lift={1} edge={0.2} />
    </g>
  );
};

export const Shelf: React.FC<{L: RoomLight; t: number; rattle?: number; x?: number}> = ({L, t, rattle = 0, x = 7.2}) => {
  const X = BX0 + x * FT;
  const Y = FLOOR - 5.6 * FT;
  const dish = ['#E4E0D6', '#C9D2DA', '#E4E0D6', '#B9A88E', '#E4E0D6'];
  return (
    <g>
      <rect x={X} y={Y} width={3.5 * FT} height={FT * 0.18} fill={tone(OZ.woodDark, L)} />
      {dish.map((c, i) => {
        const jx = rattle ? Math.sin(t * 40 + i * 2) * 3 * rattle : 0;
        const jr = rattle ? Math.sin(t * 33 + i) * 6 * rattle : 0;
        return (
          <g key={i} transform={`translate(${X + (0.35 + i * 0.68) * FT + jx} ${Y}) rotate(${jr})`}>
            {i % 2 ? (
              <Cut d={cutC(ellipsePts(0, -0.55 * FT, 0.32 * FT, 0.55 * FT, 14), `plate${i}`, 0.5, 8)} fill={tone(c, L)} lift={1} edge={0.25} />
            ) : (
              <Cut d={cutC([[-0.28 * FT, 0], [0.28 * FT, 0], [0.34 * FT, -0.6 * FT], [-0.34 * FT, -0.6 * FT]], `cup${i}`, 0.5, 8)} fill={tone(c, L)} lift={1} edge={0.25} />
            )}
          </g>
        );
      })}
    </g>
  );
};

export const Table: React.FC<{L: RoomLight; t: number; lamp?: number; x?: number}> = ({L, t, lamp = 0, x = 5}) => {
  const X = BX0 + x * FT;
  const Y = FLOOR + 70;
  const wood = tone('#6E5A45', L);
  const lampLit = lamp * (0.85 + Math.sin(t * 13) * 0.08);
  return (
    <g>
      {/* two chairs */}
      {[-0.9, 4.3].map((cx, i) => (
        <g key={i}>
          <rect x={X + cx * FT} y={Y - 3.4 * FT} width={FT * 0.14} height={3.4 * FT} fill={tone('#5E4C3A', L)} />
          <rect x={X + (cx + 0.6) * FT} y={Y - 1.5 * FT} width={FT * 0.14} height={1.5 * FT} fill={tone('#5E4C3A', L)} />
          <rect x={X + (cx - 0.1) * FT} y={Y - 1.6 * FT} width={1.0 * FT} height={FT * 0.15} fill={tone('#5E4C3A', L)} />
          {[1.2, 2.2, 3.0].map((ry) => (
            <rect key={ry} x={X + cx * FT} y={Y - ry * FT} width={FT * 0.7} height={FT * 0.09} fill={tone('#5E4C3A', L)} />
          ))}
        </g>
      ))}
      <Cut d={cutC(rectPts(X, Y - 2.6 * FT, 4 * FT, FT * 0.2), 'tabletop', 0.8, 14)} fill={wood} lift={2} edge={0.2} />
      <rect x={X + 0.2 * FT} y={Y - 2.4 * FT} width={FT * 0.2} height={2.4 * FT} fill={wood} />
      <rect x={X + 3.6 * FT} y={Y - 2.4 * FT} width={FT * 0.2} height={2.4 * FT} fill={wood} />
      {/* kerosene lamp */}
      <g transform={`translate(${X + 2.6 * FT} ${Y - 2.6 * FT})`}>
        <Cut d={cutC([[-0.35 * FT, 0], [0.35 * FT, 0], [0.25 * FT, -0.5 * FT], [-0.25 * FT, -0.5 * FT]], 'lampbase', 0.5, 8)} fill={tone('#B9A06A', L)} lift={1} edge={0.25} />
        <Cut d={cutC(ellipsePts(0, -1 * FT, 0.22 * FT, 0.5 * FT, 14), 'chimney', 0.4, 8)} fill={lampLit ? '#FFE8A8' : tone('#C9D2D2', L)} lift={1} edge={0.3} opacity={0.85} />
        {lampLit > 0 && <circle cx={0} cy={-1 * FT} r={3 * FT} fill="url(#sunGlow)" opacity={lampLit * 0.6} style={{mixBlendMode: 'screen'}} />}
      </g>
    </g>
  );
};

// Iron bedstead with a quilt. x in feet; which = 'big' (Em and Henry's) or 'cot' (Dorothy's).
export const Bed: React.FC<{L: RoomLight; x: number; which: 'big' | 'cot'; front?: boolean}> = ({L, x, which, front}) => {
  const X = BX0 + x * FT;
  const Y = FLOOR + (front ? 230 : 40);
  const w = (which === 'big' ? 6.25 : 6) * FT;
  const s = front ? 1.3 : 1;
  const iron = tone('#3B3835', L);
  const quilt = tone(which === 'big' ? '#7A5E4E' : '#8A6F5A', L);
  return (
    <g transform={`translate(${X} ${Y}) scale(${s})`}>
      <rect x={0} y={-2.6 * FT} width={FT * 0.14} height={2.6 * FT} fill={iron} />
      <rect x={w - FT * 0.14} y={-3.6 * FT} width={FT * 0.14} height={3.6 * FT} fill={iron} />
      <rect x={w - 1.4 * FT} y={-3.6 * FT} width={1.4 * FT} height={FT * 0.1} fill={iron} />
      {[0.3, 0.7, 1.1].map((k) => (
        <rect key={k} x={w - 1.4 * FT + k * FT} y={-3.6 * FT} width={FT * 0.06} height={1.6 * FT} fill={iron} />
      ))}
      <Cut d={cutC(rectPts(0, -1.9 * FT, w, 0.7 * FT), 'mat' + which, 0.8, 16)} fill={tone('#D9D1C0', L)} lift={1} edge={0.2} />
      <Cut d={cutC([[0, -2.0 * FT], [w * 0.8, -2.1 * FT], [w * 0.82, -0.9 * FT], [-0.1 * FT, -0.8 * FT]], 'quilt' + which, 1.2, 14)} fill={quilt} lift={2} edge={0.2} />
      {Array.from({length: 6}, (_, i) => (
        <rect key={i} x={(i * w * 0.8) / 6 + 4} y={-1.9 * FT} width={(w * 0.8) / 6 - 8} height={0.9 * FT} fill={tone(['#8C3B32', '#5C6E80', '#B79A5A'][i % 3], L)} opacity={0.35} />
      ))}
      <Cut d={cutC(ellipsePts(w * 0.88, -2.1 * FT, 0.6 * FT, 0.3 * FT, 12), 'pillow' + which, 0.6, 8)} fill={tone('#ECE6DA', L)} lift={2} edge={0.25} />
    </g>
  );
};

// The trapdoor (2 x 3 ft) in the middle of the floor, seen in perspective. open: 0..1 (lid swings up).
export const Trapdoor: React.FC<{L: RoomLight; open: number; cx?: number; cy?: number; s?: number; earUp?: number; t?: number}> = ({L, open, cx = 960, cy = 930, s = 1, earUp = 0, t = 0}) => {
  const w = 3 * FT * s * 1.25;
  const d = 2 * FT * s * 0.5;
  const hole: Pt[] = [
    [cx - w / 2 + 14, cy - d / 2], [cx + w / 2 - 14, cy - d / 2], [cx + w / 2, cy + d / 2], [cx - w / 2, cy + d / 2],
  ];
  return (
    <g>
      <Cut d={cutC(hole, 'hole', 0.8, 14)} fill="#0D0B0A" lift={0} edge={0} />
      {earUp > 0 && (
        <g transform={`translate(${cx + Math.sin(t * 9) * 6} ${cy + 6 - earUp * 34})`}>
          <Cut d={cutC([[-12, 30], [-6, -6], [6, -12], [14, 24]], 'totoear', 2, 6)} fill="#1C1916" lift={1} edge={0.15} />
        </g>
      )}
      {/* the lid, hinged at the back edge */}
      <g transform={`translate(0 ${cy - d / 2}) scale(1 ${1 - open * 2.6}) translate(0 ${-(cy - d / 2)})`}>
        <Cut d={cutC(hole, 'lid', 0.8, 14)} fill={tone('#6E5A45', L)} lift={open > 0.02 ? 2 : 1} edge={0.2} />
        {[0.33, 0.66].map((k) => (
          <line key={k} x1={cx - w / 2 + k * w} y1={cy - d / 2} x2={cx - w / 2 + k * w} y2={cy + d / 2} stroke="rgba(20,14,10,0.4)" strokeWidth={3} />
        ))}
        <circle cx={cx} cy={cy + d * 0.25} r={7} fill="#2A241F" />
      </g>
    </g>
  );
};

// Braided rag rug.
export const Rug: React.FC<{L: RoomLight; cx: number; cy: number}> = ({L, cx, cy}) => (
  <g>
    {[1, 0.8, 0.6, 0.4].map((k, i) => (
      <ellipse key={i} cx={cx} cy={cy} rx={260 * k} ry={60 * k} fill={tone(['#7A5A48', '#5E6B74', '#9C8250', '#7A4A40'][i], L)} />
    ))}
  </g>
);
