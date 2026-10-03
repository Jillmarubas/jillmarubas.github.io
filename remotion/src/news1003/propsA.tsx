import React, {useEffect, useState} from 'react';
import {continueRender, delayRender, random, staticFile, useCurrentFrame} from 'remotion';
import {geoEqualEarth, geoIdentity, geoPath} from 'd3-geo';
import type {Feature, FeatureCollection, Geometry} from 'geojson';
import {BLUE_FILL, C, F, R} from './design';
import {e01, settle} from './kit';

/*
 * Objects for the hardware, money and town stories, drawn as solid 2.5D objects in Autopilot
 * Blue: neutral bodies in the blue-biased greys, and a single cobalt object per view
 * (`blue` prop). Light comes from the top left; faces are lit-plane gradients.
 */
const G = {top: '#FBFCFD', face: '#E9EDF2', side: '#CFD7E2', edge: '#B8C3D2', dark: '#2A3442'};
const B = {top: '#5A9BFF', face: C.face, side: C.core, edge: '#0453B8'};
const pal = (blue?: boolean) => (blue ? B : G);

/* ------------------------------------------------------------------ a box in 2.5D (top, front, right side) */
export const Box3: React.FC<{w: number; h: number; d?: number; blue?: boolean; children?: React.ReactNode; front?: string}> = ({w, h, d = 0.28, blue, children, front}) => {
  const p = pal(blue);
  const dx = w * d * 0.55;
  const dy = w * d * 0.32;
  return (
    <svg width={w + dx} height={h + dy} style={{overflow: 'visible', display: 'block'}}>
      <defs>
        <linearGradient id={`bf${w}${h}${blue}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={p.face} />
          <stop offset="1" stopColor={blue ? C.core : '#DDE3EA'} />
        </linearGradient>
      </defs>
      <path d={`M0 ${dy} L${dx} 0 L${w + dx} 0 L${w} ${dy} Z`} fill={p.top} />
      <path d={`M${w} ${dy} L${w + dx} 0 L${w + dx} ${h} L${w} ${h + dy} Z`} fill={p.side} />
      <rect x={0} y={dy} width={w} height={h} fill={front ?? `url(#bf${w}${h}${blue})`} />
      {blue && <path d={`M0 ${dy + h} L0 ${dy} L${w} ${dy}`} fill="none" stroke={C.rim} strokeWidth={1.5} />}
      <g transform={`translate(0 ${dy})`}>{children}</g>
    </svg>
  );
};

/* ------------------------------------------------------------------ memory */
export const RamStick: React.FC<{w?: number; blue?: boolean; rot?: number}> = ({w = 520, blue, rot = 0}) => {
  const h = w * 0.24;
  const pcb = blue ? BLUE_FILL : 'linear-gradient(160deg,#3B4757,#252E3A)';
  return (
    <div style={{width: w, height: h, position: 'relative', transform: `rotate(${rot}deg)`}}>
      <div style={{position: 'absolute', inset: 0, borderRadius: 8, background: pcb, boxShadow: blue ? `inset 1.5px 0 0 ${C.rim}, inset 0 1.5px 0 ${C.rim}` : 'inset 0 1px 0 rgba(255,255,255,.18)'}} />
      {Array.from({length: 8}, (_, i) => (
        <div key={i} style={{position: 'absolute', top: h * 0.16, left: w * (0.05 + i * 0.115), width: w * 0.095, height: h * 0.5, borderRadius: 4, background: 'linear-gradient(180deg,#1A2029,#0E1218)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,.12)'}} />
      ))}
      <div style={{position: 'absolute', left: w * 0.03, right: w * 0.03, bottom: 0, height: h * 0.16, background: 'repeating-linear-gradient(90deg,#E8C46A 0 7px,transparent 7px 10px)', opacity: 0.95}} />
      <div style={{position: 'absolute', left: w * 0.46, bottom: 0, width: w * 0.03, height: h * 0.22, background: blue ? C.core : '#252E3A'}} />
    </div>
  );
};

export const PriceTag: React.FC<{price: string; w?: number; blue?: boolean; sub?: string}> = ({price, w = 300, blue, sub}) => (
  <div style={{position: 'relative', width: w, height: w * 0.5}}>
    <svg width={w} height={w * 0.5} style={{position: 'absolute', inset: 0}}>
      <defs>
        <linearGradient id={`pt${blue}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={blue ? C.face : '#FFFFFF'} />
          <stop offset="1" stopColor={blue ? C.core : '#E4E9F0'} />
        </linearGradient>
      </defs>
      <path d={`M${w * 0.18} 0 H${w - 14} Q${w} 0 ${w} 14 V${w * 0.5 - 14} Q${w} ${w * 0.5} ${w - 14} ${w * 0.5} H${w * 0.18} L0 ${w * 0.25} Z`} fill={`url(#pt${blue})`} />
      <circle cx={w * 0.17} cy={w * 0.25} r={w * 0.035} fill={C.hi} />
    </svg>
    <div style={{position: 'absolute', left: w * 0.25, right: 10, top: 0, bottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
      <div style={{fontFamily: F.display, fontWeight: 600, fontSize: w * 0.16, letterSpacing: '-0.03em', color: blue ? '#fff' : C.ink, whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums'}}>{price}</div>
      {sub && <div style={{fontFamily: F.mono, fontSize: w * 0.05, letterSpacing: '0.06em', color: blue ? 'rgba(255,255,255,.85)' : C.ink2, textTransform: 'uppercase', marginTop: 4}}>{sub}</div>}
    </div>
  </div>
);

/** Unified memory as stacked slabs; `n` slabs of which `on` are lit. */
export const MemStack: React.FC<{n: number; on?: number; w?: number; blue?: boolean; label?: string; dim?: boolean}> = ({n, on = n, w = 360, blue, label, dim}) => {
  const sh = w * 0.11;
  return (
    <div style={{position: 'relative', width: w * 1.15, height: n * sh * 0.62 + sh * 1.6}}>
      {Array.from({length: n}, (_, i) => (
        <div key={i} style={{position: 'absolute', left: 0, bottom: i * sh * 0.62, opacity: i < on ? 1 : 0.18, transition: 'none'}}>
          <Box3 w={w} h={sh * 0.45} d={0.22} blue={blue && !dim} />
        </div>
      ))}
      {label && <div style={{position: 'absolute', left: 0, right: 0, bottom: -64, textAlign: 'center', fontFamily: F.display, fontWeight: 600, fontSize: 48, color: C.ink, letterSpacing: '-0.03em'}}>{label}</div>}
    </div>
  );
};

export const CalPage: React.FC<{month: string; day: string | number; year?: string; w?: number; blue?: boolean}> = ({month, day, year, w = 260, blue}) => (
  <div style={{width: w, borderRadius: R.md, overflow: 'hidden', background: C.surface, boxShadow: 'inset 0 1px 0 #fff'}}>
    <div style={{background: blue ? BLUE_FILL : '#2A3442', color: '#fff', fontFamily: F.mono, fontWeight: 500, fontSize: w * 0.1, letterSpacing: '0.12em', textAlign: 'center', padding: `${w * 0.05}px 0`}}>{month}</div>
    <div style={{fontFamily: F.display, fontWeight: 600, fontSize: w * 0.46, textAlign: 'center', color: C.ink, letterSpacing: '-0.04em', lineHeight: 1.1, padding: `${w * 0.04}px 0 ${year ? 0 : w * 0.06}px`}}>{day}</div>
    {year && <div style={{fontFamily: F.mono, fontSize: w * 0.07, textAlign: 'center', color: C.ink3, paddingBottom: w * 0.07}}>{year}</div>}
  </div>
);

/** A balance scale; `tip` -1..1 (positive = right side down). Items sit on the pans. */
export const Balance: React.FC<{w?: number; tip: number; left?: React.ReactNode; right?: React.ReactNode}> = ({w = 900, tip, left, right}) => {
  const a = tip * 9;
  const top = 90;
  const half = w * 0.4;
  const dy = Math.sin((a * Math.PI) / 180) * half;
  const L = 200;
  const pans: [number, number, React.ReactNode][] = [
    [w / 2 - half, top - dy, left],
    [w / 2 + half, top + dy, right],
  ];
  return (
    <div style={{position: 'relative', width: w, height: top + L + 260}}>
      <div style={{position: 'absolute', left: w / 2 - 14, top, width: 28, height: L + 200, borderRadius: 14, background: 'linear-gradient(90deg,#F7F9FB,#C9D2DE)'}} />
      <div style={{position: 'absolute', left: w * 0.36, right: w * 0.36, top: top + L + 190, height: 26, borderRadius: 13, background: 'linear-gradient(180deg,#F7F9FB,#C9D2DE)'}} />
      <div style={{position: 'absolute', left: w / 2 - half - 10, width: half * 2 + 20, top: top - 8, height: 16, borderRadius: 8, background: '#2A3442', transform: `rotate(${a}deg)`}} />
      <div style={{position: 'absolute', left: w / 2 - 20, top: top - 20, width: 40, height: 40, borderRadius: 20, background: '#2A3442'}} />
      {pans.map(([x, y, node], i) => (
        <React.Fragment key={i}>
          <div style={{position: 'absolute', left: x - 1.5, top: y, width: 3, height: L, background: '#7B8695'}} />
          <div style={{position: 'absolute', left: x - w * 0.15, top: y + L, width: w * 0.3, height: 20, borderRadius: '0 0 80px 80px', background: 'linear-gradient(180deg,#F7F9FB,#BCC7D5)'}} />
          <div style={{position: 'absolute', left: x - w * 0.2, width: w * 0.4, top: y + L - 400, height: 400, display: 'flex', alignItems: 'flex-end', justifyContent: 'center'}}>{node}</div>
        </React.Fragment>
      ))}
    </div>
  );
};

/** A processor with a 4x5 grid of cores; the first `lit` cores glow cobalt. */
export const Chip: React.FC<{w?: number; lit?: number; label?: string}> = ({w = 420, lit = 0, label}) => (
  <div style={{position: 'relative', width: w, height: w}}>
    {[0, 1, 2, 3].map((side) => (
      <div key={side} style={{position: 'absolute', inset: 0, transform: `rotate(${side * 90}deg)`}}>
        {Array.from({length: 10}, (_, i) => (
          <div key={i} style={{position: 'absolute', top: -w * 0.05, left: w * (0.14 + i * 0.08), width: w * 0.03, height: w * 0.09, borderRadius: 3, background: 'linear-gradient(180deg,#E8C46A,#B8913A)'}} />
        ))}
      </div>
    ))}
    <div style={{position: 'absolute', inset: w * 0.04, borderRadius: R.md, background: 'linear-gradient(150deg,#3B4757,#1C232D)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,.15)'}} />
    <div style={{position: 'absolute', inset: w * 0.14, display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gridTemplateRows: 'repeat(4,1fr)', gap: w * 0.025}}>
      {Array.from({length: 20}, (_, i) => (
        <div key={i} style={{borderRadius: 6, background: i < lit ? BLUE_FILL : 'rgba(255,255,255,.08)', boxShadow: i < lit ? '0 0 18px rgba(46,134,255,.6)' : 'none'}} />
      ))}
    </div>
    {label && <div style={{position: 'absolute', left: 0, right: 0, bottom: -70, textAlign: 'center', fontFamily: F.display, fontWeight: 600, fontSize: 44, color: C.ink}}>{label}</div>}
  </div>
);

export const Gear: React.FC<{r: number; teeth?: number; rot: number; blue?: boolean}> = ({r, teeth = 12, rot, blue}) => {
  const pts: string[] = [];
  for (let i = 0; i < teeth * 2; i++) {
    const a = (i / (teeth * 2)) * Math.PI * 2;
    const rr = i % 2 ? r * 0.82 : r;
    const a2 = a + Math.PI / (teeth * 2);
    pts.push(`${r + rr * Math.cos(a)},${r + rr * Math.sin(a)}`, `${r + rr * Math.cos(a2)},${r + rr * Math.sin(a2)}`);
  }
  return (
    <svg width={r * 2} height={r * 2} style={{transform: `rotate(${rot}deg)`, overflow: 'visible'}}>
      <defs>
        <linearGradient id={`gr${blue}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={blue ? C.face : '#F7F9FB'} />
          <stop offset="1" stopColor={blue ? C.core : '#BCC7D5'} />
        </linearGradient>
      </defs>
      <polygon points={pts.join(' ')} fill={`url(#gr${blue})`} />
      <circle cx={r} cy={r} r={r * 0.28} fill={C.hi} />
    </svg>
  );
};

/* ------------------------------------------------------------------ town and buildings */
export const DataCentre: React.FC<{w?: number; blue?: boolean}> = ({w = 760, blue}) => {
  const h = w * 0.26;
  return (
    <div style={{position: 'relative', width: w * 1.15, height: h * 1.5}}>
      {/* rooftop cooling units */}
      {Array.from({length: 6}, (_, i) => (
        <div key={i} style={{position: 'absolute', left: w * (0.1 + i * 0.14), top: 0, width: w * 0.1, height: h * 0.18, borderRadius: 6, background: 'linear-gradient(180deg,#F7F9FB,#C9D2DE)'}}>
          <div style={{position: 'absolute', inset: '22% 20%', borderRadius: '50%', background: '#7B8695', opacity: 0.6}} />
        </div>
      ))}
      <div style={{position: 'absolute', left: 0, top: h * 0.16}}>
        <Box3 w={w} h={h} d={0.18} blue={blue}>
          {Array.from({length: 18}, (_, i) => (
            <rect key={i} x={w * (0.04 + i * 0.052)} y={h * 0.2} width={w * 0.03} height={h * 0.55} rx={3} fill={blue ? 'rgba(255,255,255,.18)' : 'rgba(42,52,66,.16)'} />
          ))}
          <rect x={w * 0.44} y={h * 0.55} width={w * 0.1} height={h * 0.45} rx={4} fill={blue ? 'rgba(255,255,255,.3)' : '#9AA7B8'} />
        </Box3>
      </div>
    </div>
  );
};

export const House: React.FC<{w?: number; blue?: boolean; upgrade?: number; tone?: number}> = ({w = 260, blue, upgrade = 0, tone = 0}) => {
  const p = pal(blue);
  const wall = tone ? ['#F4F1EC', '#E5EAF0', '#EEF1F5'][tone % 3] : p.face;
  return (
    <svg width={w} height={w * 0.95} viewBox="0 0 100 95" style={{overflow: 'visible', display: 'block'}}>
      <path d="M8 44 L50 10 L92 44 Z" fill={blue ? C.core : '#5E6B7C'} />
      <path d="M50 10 L92 44 L86 44 L50 15 Z" fill="rgba(0,0,0,.12)" />
      <rect x={16} y={44} width={68} height={48} fill={blue ? C.face : wall} />
      <rect x={42} y={64} width={16} height={28} rx={1.5} fill={blue ? 'rgba(255,255,255,.35)' : '#9AA7B8'} />
      <rect x={22} y={52} width={14} height={12} rx={1.5} fill={upgrade > 0.5 ? '#FFE9A8' : '#C7D3E2'} />
      <rect x={64} y={52} width={14} height={12} rx={1.5} fill={upgrade > 0.5 ? '#FFE9A8' : '#C7D3E2'} />
      {/* heat-pump unit and roof insulation line appear with the upgrade */}
      <g opacity={upgrade}>
        <rect x={86} y={76} width={14} height={16} rx={2} fill={C.surface} stroke="#9AA7B8" strokeWidth={0.8} />
        <circle cx={93} cy={84} r={4.5} fill="none" stroke={C.core} strokeWidth={1.4} />
        <path d="M14 45 L50 15.5 L86 45" fill="none" stroke={C.core} strokeWidth={2.2} strokeLinejoin="round" />
      </g>
    </svg>
  );
};

export const School: React.FC<{w?: number; upgrade?: number}> = ({w = 420, upgrade = 0}) => (
  <svg width={w} height={w * 0.62} viewBox="0 0 160 100" style={{overflow: 'visible', display: 'block'}}>
    <rect x={10} y={40} width={140} height={58} fill="#EEF1F5" />
    <path d="M60 40 L80 16 L100 40 Z" fill="#5E6B7C" />
    <rect x={74} y={6} width={1.6} height={14} fill="#5E6B7C" />
    <path d="M75.6 6 L88 9 L75.6 12 Z" fill={C.core} />
    {Array.from({length: 10}, (_, i) => (
      <rect key={i} x={18 + (i % 5) * 26 + (i % 5 > 1 ? 8 : 0)} y={50 + Math.floor(i / 5) * 22} width={14} height={13} rx={1.5} fill={upgrade > 0.5 ? '#FFE9A8' : '#C7D3E2'} />
    ))}
    <rect x={72} y={70} width={16} height={28} fill="#9AA7B8" />
    <g opacity={upgrade}>
      {Array.from({length: 6}, (_, i) => (
        <rect key={i} x={16 + i * 22} y={30} width={18} height={9} fill={C.core} transform={`skewX(-20)`} opacity={0.9} />
      ))}
    </g>
    <rect x={0} y={97} width={160} height={3} fill="#C9D2DE" />
  </svg>
);

export const Tree: React.FC<{w?: number; seed?: number}> = ({w = 120, seed = 0}) => {
  const s = 0.9 + random(`t${seed}`) * 0.2;
  return (
    <svg width={w} height={w * 1.5} viewBox="0 0 60 90" style={{overflow: 'visible', display: 'block'}}>
      <rect x={28} y={56} width={4} height={34} rx={2} fill="#7B8695" />
      <ellipse cx={30} cy={36} rx={22 * s} ry={30 * s} fill="#AFC0D2" />
      <ellipse cx={24} cy={30} rx={12} ry={16} fill="#C3D1E0" opacity={0.8} />
    </svg>
  );
};

export const Lamp: React.FC<{h?: number}> = ({h = 240}) => (
  <svg width={h * 0.3} height={h} viewBox="0 0 30 100" style={{overflow: 'visible', display: 'block'}}>
    <rect x={13.5} y={10} width={3} height={90} fill="#5E6B7C" />
    <path d="M15 10 Q15 2 24 4" fill="none" stroke="#5E6B7C" strokeWidth={3} />
    <rect x={20} y={3} width={9} height={5} rx={2} fill="#5E6B7C" />
  </svg>
);

/** A blank protest sign: a board on a stick (no words). */
export const Sign: React.FC<{w?: number; rot?: number}> = ({w = 150, rot = 0}) => (
  <div style={{width: w, transform: `rotate(${rot}deg)`, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
    <div style={{width: w, height: w * 0.62, borderRadius: 8, background: GREY_BOARD, boxShadow: 'inset 0 1px 0 #fff'}}>
      <div style={{margin: `${w * 0.16}px ${w * 0.14}px`, height: w * 0.08, borderRadius: 4, background: 'rgba(16,21,28,.25)'}} />
      <div style={{margin: `0 ${w * 0.22}px`, height: w * 0.08, borderRadius: 4, background: 'rgba(16,21,28,.18)'}} />
    </div>
    <div style={{width: w * 0.06, height: w * 0.9, background: '#9AA7B8', borderRadius: 3}} />
  </div>
);
const GREY_BOARD = 'linear-gradient(160deg,#FFFFFF,#E3E8EF)';

/** The cobalt money block (one per view): a solid brick with its value in mono. */
export const Brick: React.FC<{w?: number; label?: string; blue?: boolean}> = ({w = 420, label, blue = true}) => {
  const h = w * 0.32;
  return (
    <div style={{position: 'relative'}}>
      <Box3 w={w} h={h} d={0.42} blue={blue}>
        <rect x={w * 0.06} y={h * 0.18} width={w * 0.88} height={h * 0.64} rx={10} fill="none" stroke={blue ? 'rgba(255,255,255,.35)' : 'rgba(16,21,28,.12)'} strokeWidth={2} />
        {label && (
          <text x={w / 2} y={h * 0.63} textAnchor="middle" fontFamily={F.display} fontWeight={600} fontSize={h * 0.46} letterSpacing="-0.03em" fill={blue ? '#fff' : C.ink}>
            {label}
          </text>
        )}
      </Box3>
    </div>
  );
};

/** A field of dots: each dot is one unit; the first `shown` are cobalt. */
export const DotField: React.FC<{cols: number; rows: number; shown: number; w: number; r?: number; blue?: boolean}> = ({cols, rows, shown, w, r, blue = true}) => {
  const gap = w / cols;
  const rr = r ?? gap * 0.32;
  return (
    <svg width={w} height={rows * gap} style={{display: 'block'}}>
      {Array.from({length: cols * rows}, (_, i) => {
        const x = (i % cols) * gap + gap / 2;
        const y = Math.floor(i / cols) * gap + gap / 2;
        return <circle key={i} cx={x} cy={y} r={rr} fill={i < shown ? (blue ? C.core : C.ink2) : 'rgba(16,21,28,.1)'} />;
      })}
    </svg>
  );
};

export const GradCap: React.FC<{w?: number; blue?: boolean}> = ({w = 300, blue = true}) => (
  <svg width={w} height={w * 0.7} viewBox="0 0 100 70" style={{overflow: 'visible', display: 'block'}}>
    <path d="M28 34 L28 52 Q50 64 72 52 L72 34 Z" fill={blue ? C.core : '#2A3442'} />
    <path d="M2 28 L50 8 L98 28 L50 48 Z" fill={blue ? C.face : '#3B4757'} />
    <path d="M2 28 L50 8 L52 9 L6 28 Z" fill="rgba(255,255,255,.4)" />
    <path d="M50 28 L84 34 L84 54" fill="none" stroke="#E8C46A" strokeWidth={2} />
    <circle cx={84} cy={57} r={3.5} fill="#E8C46A" />
  </svg>
);

export const HardHat: React.FC<{w?: number}> = ({w = 180}) => (
  <svg width={w} height={w * 0.6} viewBox="0 0 100 60" style={{overflow: 'visible', display: 'block'}}>
    <path d="M14 48 Q14 10 50 10 Q86 10 86 48 Z" fill="#F2C94C" />
    <path d="M44 10 h12 v38 h-12 Z" fill="#E3B536" />
    <rect x={4} y={46} width={92} height={9} rx={4.5} fill="#E3B536" />
    <path d="M24 40 Q26 18 46 14" fill="none" stroke="rgba(255,255,255,.55)" strokeWidth={3} strokeLinecap="round" />
  </svg>
);

export const Certificate: React.FC<{w?: number}> = ({w = 300}) => (
  <div style={{width: w, height: w * 0.72, borderRadius: R.sm, background: 'linear-gradient(160deg,#FFFFFF,#EEF1F5)', boxShadow: 'inset 0 1px 0 #fff', padding: w * 0.09, boxSizing: 'border-box', position: 'relative'}}>
    <div style={{height: w * 0.05, width: '60%', borderRadius: 5, background: 'rgba(16,21,28,.28)', margin: '0 auto'}} />
    <div style={{height: 7, width: '80%', borderRadius: 4, background: 'rgba(16,21,28,.12)', margin: `${w * 0.08}px auto 0`}} />
    <div style={{height: 7, width: '70%', borderRadius: 4, background: 'rgba(16,21,28,.12)', margin: '10px auto 0'}} />
    <div style={{position: 'absolute', right: w * 0.1, bottom: w * 0.08, width: w * 0.2, height: w * 0.2, borderRadius: '50%', background: BLUE_FILL, boxShadow: `inset 1.5px 1.5px 0 ${C.rim}`}} />
  </div>
);

export const TrainingCentre: React.FC<{w?: number; blue?: boolean}> = ({w = 120, blue}) => (
  <svg width={w} height={w * 0.8} viewBox="0 0 100 80" style={{overflow: 'visible', display: 'block'}}>
    <path d="M4 36 L50 14 L96 36 Z" fill={blue ? C.core : '#5E6B7C'} />
    <rect x={10} y={36} width={80} height={42} fill={blue ? C.face : '#EEF1F5'} />
    <rect x={40} y={52} width={20} height={26} fill={blue ? 'rgba(255,255,255,.35)' : '#9AA7B8'} />
    <path d="M36 30 Q36 18 50 18 Q64 18 64 30 Z" fill="#F2C94C" />
  </svg>
);

/* ------------------------------------------------------------------ comparisons */
export const Bucket: React.FC<{w?: number; drop?: number}> = ({w = 360, drop = 0}) => (
  <div style={{position: 'relative', width: w, height: w * 1.4}}>
    <svg width={w} height={w * 1.4} viewBox="0 0 100 140" style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
      <defs>
        <linearGradient id="bk" x1="0" x2="1">
          <stop offset="0" stopColor="#FDFDFE" />
          <stop offset="1" stopColor="#BCC7D5" />
        </linearGradient>
      </defs>
      <path d="M14 60 Q50 20 86 60" fill="none" stroke="#7B8695" strokeWidth={2.5} />
      <path d="M10 60 L22 136 Q50 142 78 136 L90 60 Z" fill="url(#bk)" />
      <ellipse cx={50} cy={60} rx={40} ry={8} fill="#DCE3ED" stroke="#C9D2DE" strokeWidth={1.5} />
      <ellipse cx={50} cy={62} rx={34} ry={5.5} fill="rgba(5,113,248,.12)" />
      {drop > 0 && drop < 1 && <path d={`M50 ${-30 + drop * 88} q-6 9 0 14 q6 -5 0 -14 Z`} fill={C.core} />}
      {drop >= 1 && <ellipse cx={50} cy={62} rx={8 + (drop - 1) * 40} ry={1.5 + (drop - 1) * 4} fill="none" stroke={C.core} strokeWidth={1.4} opacity={Math.max(0, 1 - (drop - 1) * 1.2)} />}
    </svg>
  </div>
);

export const Gauge: React.FC<{w?: number; v: number}> = ({w = 300, v}) => {
  const a = -120 + 240 * v;
  return (
    <svg width={w} height={w * 0.8} viewBox="0 0 100 80" style={{overflow: 'visible', display: 'block'}}>
      <circle cx={50} cy={50} r={44} fill={C.surface} />
      <path d="M17 69 A38 38 0 1 1 83 69" fill="none" stroke="#DCE3ED" strokeWidth={7} strokeLinecap="round" />
      <path d="M17 69 A38 38 0 1 1 83 69" fill="none" stroke={C.core} strokeWidth={7} strokeLinecap="round" pathLength={1} strokeDasharray={`${v} 1`} />
      <line x1={50} y1={50} x2={50 + 30 * Math.sin((a * Math.PI) / 180)} y2={50 - 30 * Math.cos((a * Math.PI) / 180)} stroke={C.ink} strokeWidth={3} strokeLinecap="round" />
      <circle cx={50} cy={50} r={4.5} fill={C.ink} />
    </svg>
  );
};

/* ------------------------------------------------------------------ maps (public-domain Census / Natural Earth shapes) */
type FC = FeatureCollection<Geometry, Record<string, unknown>>;
const cache: Record<string, FC> = {};
const useGeo = (name: string) => {
  const [g, setG] = useState<FC | null>(cache[name] ?? null);
  const [h] = useState(() => (cache[name] ? null : delayRender(`geo ${name}`)));
  useEffect(() => {
    if (cache[name]) return;
    fetch(staticFile(`dc/geo/${name}.json`))
      .then((r) => r.json())
      .then((j) => {
        cache[name] = j;
        setG(j);
        if (h !== null) continueRender(h);
      });
  }, [name, h]);
  return g;
};
const nameOf = (f: Feature<Geometry, Record<string, unknown>>) => String(f.properties?.name ?? f.properties?.NAME ?? f.id ?? '');

/** Lower 48 (+ AK/HI dropped) in blue-greys; `fill` lifts named states (with a time each); pins drop as dots. */
export const USMap: React.FC<{w: number; at: number; fill?: Record<string, number>; pins?: number; pinsAt?: number; pinsDur?: number; label?: boolean}> = ({w, at, fill = {}, pins = 0, pinsAt = 0, pinsDur = 30, label = true}) => {
  const f = useCurrentFrame();
  const geo = useGeo('states');
  if (!geo) return null;
  const feats = geo.features.filter((ft) => !['Alaska', 'Hawaii', 'Puerto Rico'].includes(nameOf(ft)));
  const fc = {...geo, features: feats};
  const h = w * 0.6;
  const proj = geoIdentity().reflectY(false).fitExtent([[0, 0], [w, h]], fc);
  const path = geoPath(proj);
  const shown = Math.floor(pins * e01(f, pinsAt, pinsDur));
  const pts: [number, number][] = [];
  for (let i = 0; pts.length < shown && i < pins * 8; i++) {
    const ft = feats[Math.floor(random(`pf${i}`) * feats.length)];
    const b = path.bounds(ft);
    const x = b[0][0] + random(`px${i}`) * (b[1][0] - b[0][0]);
    const y = b[0][1] + random(`py${i}`) * (b[1][1] - b[0][1]);
    pts.push([x, y]);
  }
  return (
    <svg width={w} height={h} style={{overflow: 'visible', display: 'block'}}>
      <defs>
        <clipPath id="us48">
          {feats.map((ft, i) => (
            <path key={i} d={path(ft) ?? ''} />
          ))}
        </clipPath>
      </defs>
      {feats.map((ft, i) => {
        const n = nameOf(ft);
        const t = fill[n];
        const k = t === undefined ? 0 : e01(f, t, 9);
        return <path key={i} d={path(ft) ?? ''} fill={k > 0 ? `rgba(5,113,248,${0.25 + 0.75 * k})` : '#C3CFDE'} stroke={C.surface} strokeWidth={1.4} opacity={e01(f, at + random(`s${i}`) * 10, 9)} />;
      })}
      <g clipPath="url(#us48)">
        {pts.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={6} fill={C.core} stroke="#fff" strokeWidth={1.5} />
        ))}
      </g>
      {label && (
        <text x={w} y={h + 30} textAnchor="end" fontFamily={F.mono} fontSize={13} fill={C.ink3}>
          MAP: U.S. CENSUS BUREAU (PUBLIC DOMAIN)
        </text>
      )}
    </svg>
  );
};

/** A world (or regional) map; `hi` lifts named countries; pins at lon/lat. */
export const WorldMap: React.FC<{w: number; h: number; at: number; hi?: Record<string, number>; pins?: {lon: number; lat: number; at: number}[]; center?: [number, number]; scale?: number}> = ({w, h, at, hi = {}, pins = [], center = [0, 10], scale = 1}) => {
  const f = useCurrentFrame();
  const geo = useGeo('world');
  if (!geo) return null;
  const proj = geoEqualEarth().rotate([-center[0], 0]).center([0, center[1]]).scale((w / 6.2) * scale).translate([w / 2, h / 2]);
  const path = geoPath(proj);
  return (
    <svg width={w} height={h} style={{overflow: 'hidden', display: 'block'}}>
      {geo.features.map((ft, i) => {
        const t = hi[nameOf(ft)];
        const k = t === undefined ? 0 : e01(f, t, 9);
        return <path key={i} d={path(ft) ?? ''} fill={k > 0 ? `rgba(5,113,248,${0.25 + 0.75 * k})` : '#C3CFDE'} stroke={C.surface} strokeWidth={0.6} opacity={e01(f, at, 12)} />;
      })}
      {pins.map((p, i) => {
        const xy = proj([p.lon, p.lat]);
        if (!xy) return null;
        const k = settle((f - p.at) / 10);
        return (
          <g key={i} transform={`translate(${xy[0]} ${xy[1] - (1 - k) * 40})`} opacity={k}>
            <circle r={26 * k} fill="rgba(5,113,248,.18)" />
            <circle r={10} fill={C.core} stroke="#fff" strokeWidth={3} />
          </g>
        );
      })}
    </svg>
  );
};
