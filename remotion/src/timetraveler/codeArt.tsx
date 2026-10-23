import React from 'react';
import {ICE, PIECES, PieceId} from './pieces';

// The original code-drawn Ice Age pieces: flat shapes, one outline weight.
// Kept as the fallback for the VectorCraft art (IceAgeScene art="code").

const {ink, line} = ICE;
const S = {stroke: ink, strokeWidth: line, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const};

type Peak = [number, number]; // x, top y
const mountainRange = (w: number, h: number, peaks: Peak[], fill: string, snow: string, lw: number) => {
  const base = h + 10;
  const pts: [number, number][] = [[-10, base]];
  peaks.forEach(([x, y], i) => {
    if (i > 0) {
      const [px, py] = peaks[i - 1];
      pts.push([(px + x) / 2, Math.max(py, y) + (h - Math.max(py, y)) * 0.45]);
    }
    pts.push([x, y]);
  });
  pts.push([w + 10, base]);
  const ridge = `M${pts.map((p) => p.join(' ')).join(' L')} Z`;
  // snow caps: the top third of each peak, with a zigzag lower edge
  const caps = peaks.map(([x, y], i) => {
    const prev = pts[pts.findIndex((p) => p[0] === x && p[1] === y) - 1];
    const next = pts[pts.findIndex((p) => p[0] === x && p[1] === y) + 1];
    const t = 0.32;
    const lx = x + (prev[0] - x) * t;
    const ly = y + (prev[1] - y) * t;
    const rx = x + (next[0] - x) * t;
    const ry = y + (next[1] - y) * t;
    const midY = (ly + ry) / 2;
    const zig = [0.25, 0.5, 0.75].map((k, j) => `${lx + (rx - lx) * k} ${midY + (j % 2 ? -14 : 10)}`).join(' L');
    return <path key={i} d={`M${x} ${y} L${lx} ${ly} L${zig} L${rx} ${ry} Z`} fill={snow} {...S} strokeWidth={lw} />;
  });
  return (
    <>
      <path d={ridge} fill={fill} {...S} strokeWidth={lw} />
      {caps}
    </>
  );
};

const FarMountains = () =>
  mountainRange(
    PIECES.farMountains.w,
    PIECES.farMountains.h,
    [[120, 160], [420, 60], [700, 190], [960, 40], [1260, 150], [1560, 70], [1860, 180], [2150, 90], [2330, 170]],
    ICE.far,
    ICE.farSnow,
    4,
  );

const MidMountains = () =>
  mountainRange(
    PIECES.midMountains.w,
    PIECES.midMountains.h,
    [[60, 200], [380, 90], [760, 220], [1080, 110], [1420, 240], [1760, 80], [2120, 210], [2480, 120]],
    ICE.mid,
    ICE.midSnow,
    4.5,
  );

const Hills = () => {
  const {w, h} = PIECES.hills;
  const bumps = [0, 380, 820, 1300, 1760, 2240, 2700, 3000];
  const tops = [120, 70, 130, 60, 110, 80, 130, 90];
  let d = `M-10 ${h + 10} L-10 ${tops[0]}`;
  for (let i = 1; i < bumps.length; i++) {
    const cx = (bumps[i - 1] + bumps[i]) / 2;
    d += ` Q${cx} ${Math.min(tops[i - 1], tops[i]) - 60} ${bumps[i]} ${tops[i]}`;
  }
  d += ` L${w + 10} ${h + 10} Z`;
  return <path d={d} fill={ICE.hill} {...S} />;
};

const Pine = () => (
  <>
    <rect x={106} y={318} width={28} height={78} fill={ICE.bark} {...S} />
    {[
      [120, 20, 70, 160],
      [120, 100, 95, 250],
      [120, 180, 115, 330],
    ].map(([cx, top, half, bot], i) => (
      <React.Fragment key={i}>
        <path d={`M${cx} ${top} L${cx + half} ${bot} L${cx - half} ${bot} Z`} fill={ICE.pine} {...S} />
        <path d={`M${cx} ${top} L${cx + half * 0.35} ${top + (bot - top) * 0.35} L${cx - half * 0.35} ${top + (bot - top) * 0.35} Z`} fill={ICE.snow} {...S} strokeWidth={line * 0.7} />
      </React.Fragment>
    ))}
  </>
);

const Cave = () => (
  <>
    <path d="M10 440 Q20 200 180 110 Q360 20 540 100 Q700 180 712 440 Z" fill={ICE.rock} {...S} />
    <path d="M150 140 Q360 40 560 120 Q500 150 430 130 Q360 110 300 140 Q220 170 150 140 Z" fill={ICE.snow} {...S} />
    <path d="M250 440 Q250 250 360 230 Q470 250 470 440 Z" fill={ICE.cave} {...S} />
  </>
);

const Logs = () => (
  <>
    <g transform="rotate(-14 110 55)">
      <rect x={18} y={40} width={184} height={30} rx={14} fill={ICE.log} {...S} />
      <ellipse cx={198} cy={55} rx={11} ry={15} fill={ICE.logEnd} {...S} />
    </g>
    <g transform="rotate(14 110 55)">
      <rect x={18} y={40} width={184} height={30} rx={14} fill={ICE.log} {...S} />
      <ellipse cx={22} cy={55} rx={11} ry={15} fill={ICE.logEnd} {...S} />
    </g>
  </>
);

const Rock = () => (
  <>
    <path d="M20 400 Q10 220 160 140 Q300 70 460 110 Q660 170 690 400 Z" fill={ICE.rock} {...S} />
    <path d="M130 170 Q300 70 480 120 Q560 150 600 200 Q480 170 380 180 Q240 200 130 170 Z" fill={ICE.snow} {...S} />
  </>
);

const Branch = () => (
  <>
    <path d="M910 40 Q600 70 300 190 Q160 250 40 270" fill="none" stroke={ink} strokeWidth={34} strokeLinecap="round" />
    <path d="M910 40 Q600 70 300 190 Q160 250 40 270" fill="none" stroke={ICE.bark} strokeWidth={34 - line * 2} strokeLinecap="round" />
    {[120, 260, 400, 540, 680, 820].map((x, i) => {
      const y = 260 - (x / 900) * 220;
      return <path key={i} d={`M${x - 70} ${y + 30} L${x - 40} ${y + 70} L${x - 10} ${y + 30} L${x + 20} ${y + 75} L${x + 50} ${y + 30} L${x + 70} ${y + 60}`} fill="none" {...S} stroke={ICE.pine} strokeWidth={14} />;
    })}
    <path d="M60 250 Q300 160 600 70 Q760 30 900 22 L900 46 Q600 80 310 196 Q170 252 60 276 Z" fill={ICE.snow} {...S} strokeWidth={line * 0.8} />
  </>
);

// ---- mammoth (faces right) ----
const leg = (x: number, top: number, fill: string) => (
  <>
    <path d={`M${x - 26} ${top} L${x - 24} 384 Q${x} 396 ${x + 24} 384 L${x + 26} ${top} Z`} fill={fill} {...S} strokeWidth={8} />
    <path d={`M${x - 22} 380 Q${x} 392 ${x + 22} 380`} fill="none" stroke={ICE.tusk} strokeWidth={6} />
  </>
);

const MammothBody = () => (
  <>
    <path d="M90 200 Q60 230 70 260" fill="none" stroke={ink} strokeWidth={10} strokeLinecap="round" />
    <path d="M120 270 Q90 150 200 100 Q300 60 400 110 Q450 160 430 270 Q300 320 120 270 Z" fill={ICE.fur} {...S} strokeWidth={8} />
  </>
);
const MammothHead = () => (
  <path d="M380 120 Q420 70 470 100 Q510 130 500 190 Q470 230 420 220 Q380 200 380 120 Z" fill={ICE.fur} {...S} strokeWidth={8} />
);
const MammothTrunk = () => (
  <path d="M460 190 Q500 220 498 290 Q496 340 520 350 L506 362 Q470 350 474 290 Q476 240 446 214 Z" fill={ICE.fur} {...S} strokeWidth={8} />
);
const MammothTusks = () => (
  <path d="M470 214 Q560 240 540 160 Q548 250 462 232 Z" fill={ICE.tusk} {...S} strokeWidth={7} />
);

const CODE: Record<PieceId, React.FC> = {
  farMountains: FarMountains,
  midMountains: MidMountains,
  hills: Hills,
  pine: Pine,
  cave: Cave,
  logs: Logs,
  rock: Rock,
  branch: Branch,
  mammothBody: MammothBody,
  mammothHead: MammothHead,
  mammothTrunk: MammothTrunk,
  mammothTusks: MammothTusks,
  mammothLegFrontNear: () => leg(372, 250, ICE.fur),
  mammothLegFrontFar: () => leg(340, 246, ICE.furDark),
  mammothLegBackNear: () => leg(190, 250, ICE.fur),
  mammothLegBackFar: () => leg(222, 246, ICE.furDark),
};

export const CodePiece: React.FC<{id: PieceId}> = ({id}) => {
  const {w, h} = PIECES[id];
  const C = CODE[id];
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
      <C />
    </svg>
  );
};
