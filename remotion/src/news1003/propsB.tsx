import React from 'react';
import {random, useCurrentFrame} from 'remotion';
import {BLUE_FILL, C, F, R} from './design';
import {e01, Lines} from './kit';
import {Box3} from './propsA';

/* Objects for the academy, video-call and agent stories (Autopilot Blue: one cobalt object per view). */

/* ------------------------------------------------------------------ academy */
export const Doors: React.FC<{w?: number; open: number}> = ({w = 520, open}) => {
  const h = w * 1.05;
  return (
    <div style={{position: 'relative', width: w, height: h, perspective: 1400}}>
      <div style={{position: 'absolute', inset: 0, borderRadius: `${R.xl}px ${R.xl}px 0 0`, background: 'linear-gradient(180deg,#F7F9FB,#D3DBE6)'}} />
      <div style={{position: 'absolute', left: w * 0.12, right: w * 0.12, top: w * 0.12, bottom: 0, borderRadius: `${R.lg}px ${R.lg}px 0 0`, background: `radial-gradient(90% 70% at 50% 100%, rgba(129,162,246,.9), ${C.face} 70%)`, overflow: 'hidden'}} />
      {[0, 1].map((s) => (
        <div
          key={s}
          style={{
            position: 'absolute',
            top: w * 0.12,
            bottom: 0,
            width: w * 0.38,
            [s ? 'right' : 'left']: w * 0.12,
            background: 'linear-gradient(160deg,#FFFFFF,#E3E8EF)',
            borderRadius: s ? `0 ${R.lg}px 0 0` : `${R.lg}px 0 0 0`,
            transformOrigin: s ? 'right center' : 'left center',
            transform: `rotateY(${(s ? 1 : -1) * open * 72}deg)`,
            boxShadow: 'inset 0 1px 0 #fff',
          }}
        >
          <div style={{position: 'absolute', top: '50%', [s ? 'left' : 'right']: 16, width: 10, height: 64, borderRadius: 5, background: '#9AA7B8'}} />
        </div>
      ))}
    </div>
  );
};

/** One person figure (head + shoulders). */
export const Person: React.FC<{w?: number; blue?: boolean; color?: string}> = ({w = 40, blue, color}) => (
  <svg width={w} height={w * 1.2} viewBox="0 0 40 48" style={{display: 'block'}}>
    <circle cx={20} cy={13} r={9} fill={color ?? (blue ? C.core : '#9AA7B8')} />
    <path d="M3 48 C4 32 12 26 20 26 C28 26 36 32 37 48 Z" fill={color ?? (blue ? C.core : '#9AA7B8')} />
  </svg>
);

export const Tower: React.FC<{w?: number; lit?: number[]}> = ({w = 300, lit = []}) => {
  const cols = 5;
  const rows = 14;
  return (
    <div style={{width: w, height: w * 2.6, borderRadius: `${R.md}px ${R.md}px 0 0`, background: 'linear-gradient(90deg,#F7F9FB,#D3DBE6)', padding: w * 0.08, boxSizing: 'border-box', display: 'grid', gridTemplateColumns: `repeat(${cols},1fr)`, gap: w * 0.04}}>
      {Array.from({length: cols * rows}, (_, i) => (
        <div key={i} style={{borderRadius: 4, background: lit.includes(i) ? BLUE_FILL : '#C7D3E2', boxShadow: lit.includes(i) ? '0 0 14px rgba(46,134,255,.7)' : 'none'}} />
      ))}
    </div>
  );
};

export const Toolbox: React.FC<{w?: number}> = ({w = 300}) => (
  <svg width={w} height={w * 0.7} viewBox="0 0 100 70" style={{overflow: 'visible', display: 'block'}}>
    <path d="M36 18 V10 Q36 6 40 6 H60 Q64 6 64 10 V18" fill="none" stroke="#5E6B7C" strokeWidth={4} />
    <rect x={4} y={18} width={92} height={50} rx={7} fill="#3B4757" />
    <rect x={4} y={18} width={92} height={14} rx={7} fill="#4A586A" />
    <rect x={44} y={28} width={12} height={10} rx={2} fill="#E8C46A" />
  </svg>
);

/** A hospital-style ID badge on a lanyard; `title` is the badge's printed name. */
export const IDBadge: React.FC<{w?: number; title: string; blue?: boolean}> = ({w = 300, title, blue}) => (
  <div style={{width: w, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
    <div style={{width: w * 0.08, height: w * 0.32, background: blue ? C.core : '#5E6B7C', borderRadius: 4}} />
    <div style={{width: w * 0.22, height: w * 0.06, background: '#9AA7B8', borderRadius: 4, marginTop: -4}} />
    <div style={{width: w, height: w * 1.25, borderRadius: R.md, background: blue ? BLUE_FILL : 'linear-gradient(160deg,#FFFFFF,#E9EDF2)', boxShadow: blue ? `inset 1.5px 0 0 ${C.rim}, inset 0 1.5px 0 ${C.rim}` : 'inset 0 1px 0 #fff', padding: w * 0.1, boxSizing: 'border-box', marginTop: 4}}>
      <div style={{width: w * 0.36, height: w * 0.42, borderRadius: R.sm, background: blue ? 'rgba(255,255,255,.22)' : '#C7D3E2', margin: '0 auto'}} />
      <div style={{fontFamily: F.display, fontWeight: 600, fontSize: w * 0.085, color: blue ? '#fff' : C.ink, textAlign: 'center', marginTop: w * 0.07, lineHeight: 1.1, letterSpacing: '-0.01em'}}>{title}</div>
      <div style={{height: 7, borderRadius: 4, background: blue ? 'rgba(255,255,255,.3)' : 'rgba(16,21,28,.12)', width: '70%', margin: `${w * 0.06}px auto 0`}} />
    </div>
  </div>
);

export const Stethoscope: React.FC<{w?: number}> = ({w = 260}) => (
  <svg width={w} height={w} viewBox="0 0 100 100" style={{overflow: 'visible', display: 'block'}}>
    <path d="M24 8 V34 Q24 56 46 56 Q68 56 68 34 V8" fill="none" stroke="#3B4757" strokeWidth={5} strokeLinecap="round" />
    <path d="M46 56 V70 Q46 90 66 90 Q80 90 80 76 V64" fill="none" stroke="#3B4757" strokeWidth={5} strokeLinecap="round" />
    <circle cx={80} cy={58} r={11} fill="#C9D2DE" stroke="#7B8695" strokeWidth={3} />
    <circle cx={24} cy={8} r={4} fill="#7B8695" />
    <circle cx={68} cy={8} r={4} fill="#7B8695" />
  </svg>
);

/** A row of week blocks; the first `n` are filled. */
export const Weeks: React.FC<{total: number; n: number; w?: number}> = ({total, n, w = 1200}) => {
  const bw = w / total - 10;
  return (
    <div style={{display: 'flex', gap: 10}}>
      {Array.from({length: total}, (_, i) => {
        const k = Math.max(0, Math.min(1, n - i));
        return (
          <div key={i} style={{width: bw, height: bw * 1.3, borderRadius: R.sm, background: C.surface, position: 'relative', overflow: 'hidden', boxShadow: 'inset 0 1px 0 #fff'}}>
            <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: `${k * 100}%`, background: BLUE_FILL}} />
            <div style={{position: 'absolute', left: 0, right: 0, top: 8, textAlign: 'center', fontFamily: F.mono, fontSize: 15, color: k > 0.6 ? '#fff' : C.ink3}}>{i + 1}</div>
          </div>
        );
      })}
    </div>
  );
};

/** 2.5D landmark replicas, drawn from reference photos (shape only, no photo reuse). */
export const Landmark: React.FC<{which: 'sf' | 'ny' | 'ldn'; h?: number; blue?: boolean}> = ({which, h = 420, blue}) => {
  const body = blue ? C.core : '#B8C3D2';
  const lit = blue ? C.face : '#E9EDF2';
  if (which === 'sf')
    // Transamerica Pyramid: tall four-sided pyramid with two "wings" and a spire
    return (
      <svg width={h * 0.42} height={h} viewBox="0 0 42 100" style={{overflow: 'visible', display: 'block'}}>
        <path d="M21 0 L21.6 12 L33 100 L9 100 L20.4 12 Z" fill={lit} />
        <path d="M21 4 L21.6 12 L33 100 L23 100 Z" fill={body} />
        <path d="M14.4 46 L10 46 L12 60 L15.6 60 Z M27.6 46 L32 46 L30 60 L26.4 60 Z" fill={body} />
        {Array.from({length: 18}, (_, i) => (
          <line key={i} x1={21 - (i + 3) * 0.62} y1={14 + i * 4.8} x2={21 + (i + 3) * 0.62} y2={14 + i * 4.8} stroke="rgba(16,21,28,.12)" strokeWidth={0.4} />
        ))}
      </svg>
    );
  if (which === 'ny')
    // Empire State Building: stepped Art Deco setbacks, mast
    return (
      <svg width={h * 0.4} height={h} viewBox="0 0 40 100" style={{overflow: 'visible', display: 'block'}}>
        <rect x={19.3} y={0} width={1.4} height={12} fill={body} />
        <rect x={17.5} y={10} width={5} height={6} fill={lit} />
        <rect x={15.5} y={16} width={9} height={8} fill={lit} />
        <rect x={13} y={24} width={14} height={50} fill={lit} />
        <rect x={20} y={24} width={7} height={50} fill={body} />
        <rect x={9} y={74} width={22} height={8} fill={lit} />
        <rect x={20} y={74} width={11} height={8} fill={body} />
        <rect x={4} y={82} width={32} height={18} fill={lit} />
        <rect x={20} y={82} width={16} height={18} fill={body} />
        {Array.from({length: 6}, (_, i) => (
          <line key={i} x1={14.5 + i * 2.2} y1={26} x2={14.5 + i * 2.2} y2={73} stroke="rgba(16,21,28,.14)" strokeWidth={0.5} />
        ))}
      </svg>
    );
  // Elizabeth Tower (Big Ben): square tower, clock faces, belfry and spire
  return (
    <svg width={h * 0.3} height={h} viewBox="0 0 30 100" style={{overflow: 'visible', display: 'block'}}>
      <path d="M15 0 L18 18 L12 18 Z" fill={body} />
      <rect x={10.5} y={18} width={9} height={8} fill={lit} />
      <rect x={10} y={26} width={10} height={4} fill={body} />
      <rect x={9} y={30} width={12} height={13} fill={lit} />
      <circle cx={15} cy={36.5} r={4.6} fill="#fff" stroke={body} strokeWidth={0.8} />
      <line x1={15} y1={36.5} x2={15} y2={33.4} stroke={C.ink} strokeWidth={0.6} />
      <line x1={15} y1={36.5} x2={17.2} y2={36.5} stroke={C.ink} strokeWidth={0.6} />
      <rect x={9.5} y={43} width={11} height={57} fill={lit} />
      <rect x={15} y={43} width={5.5} height={57} fill={body} />
      {Array.from({length: 9}, (_, i) => (
        <line key={i} x1={9.5} y1={48 + i * 6} x2={20.5} y2={48 + i * 6} stroke="rgba(16,21,28,.12)" strokeWidth={0.4} />
      ))}
    </svg>
  );
};

/** A bottle whose narrow neck is the bottleneck. */
export const Bottle: React.FC<{w?: number}> = ({w = 360}) => (
  <svg width={w} height={w * 1.6} viewBox="0 0 100 160" style={{overflow: 'visible', display: 'block'}}>
    <defs>
      <linearGradient id="btl" x1="0" x2="1">
        <stop offset="0" stopColor="rgba(255,255,255,.85)" />
        <stop offset="1" stopColor="rgba(201,210,222,.75)" />
      </linearGradient>
    </defs>
    <path d="M40 4 H60 V36 Q92 52 92 84 V148 Q92 156 84 156 H16 Q8 156 8 148 V84 Q8 52 40 36 Z" fill="url(#btl)" stroke="#AFBCCD" strokeWidth={2} />
    <path d="M18 90 V146" stroke="rgba(255,255,255,.9)" strokeWidth={4} strokeLinecap="round" />
  </svg>
);

/* ------------------------------------------------------------------ video call */
/** A laptop showing a video call; `tiles` are silhouettes (no generated faces). */
export const Laptop: React.FC<{w?: number; children?: React.ReactNode}> = ({w = 900, children}) => {
  const h = w * 0.62;
  return (
    <div style={{width: w * 1.12, position: 'relative'}}>
      <div style={{width: w, height: h, margin: '0 auto', borderRadius: R.md, background: '#1C232D', padding: w * 0.025, boxSizing: 'border-box'}}>
        <div style={{width: '100%', height: '100%', borderRadius: R.sm, overflow: 'hidden', background: '#0F141B', position: 'relative'}}>{children}</div>
      </div>
      <div style={{height: w * 0.035, borderRadius: `0 0 ${R.md}px ${R.md}px`, background: 'linear-gradient(180deg,#E9EDF2,#B8C3D2)'}} />
    </div>
  );
};

/** One call tile: a silhouette on a dim background, optional cobalt ring when "human?" */
export const Tile: React.FC<{w: number; on?: number; seed?: number}> = ({w, on = 0, seed = 0}) => {
  const hue = ['#2A3442', '#253040', '#2E3848'][seed % 3];
  return (
    <div style={{width: w, height: w * 0.75, borderRadius: R.xs, background: hue, position: 'relative', overflow: 'hidden', boxShadow: on > 0 ? `inset 0 0 0 ${3 * on}px ${C.core}` : 'none'}}>
      <svg viewBox="0 0 40 30" width={w} height={w * 0.75} style={{position: 'absolute', inset: 0}}>
        <circle cx={20} cy={13} r={6} fill={on > 0.5 ? C.lift : '#4B5563'} />
        <path d="M8 30 C9 22 14 20 20 20 C26 20 31 22 32 30 Z" fill={on > 0.5 ? C.lift : '#4B5563'} />
      </svg>
    </div>
  );
};

export const Webcam: React.FC<{w?: number}> = ({w = 200}) => (
  <svg width={w} height={w * 1.1} viewBox="0 0 100 110" style={{overflow: 'visible', display: 'block'}}>
    <rect x={10} y={8} width={80} height={56} rx={28} fill="#2A3442" />
    <circle cx={50} cy={36} r={20} fill="#0F141B" />
    <circle cx={50} cy={36} r={12} fill={C.core} />
    <circle cx={45} cy={31} r={4} fill="rgba(255,255,255,.7)" />
    <rect x={44} y={64} width={12} height={26} fill="#5E6B7C" />
    <rect x={24} y={90} width={52} height={10} rx={5} fill="#5E6B7C" />
  </svg>
);

export const Mic: React.FC<{w?: number}> = ({w = 140}) => (
  <svg width={w} height={w * 1.8} viewBox="0 0 60 108" style={{overflow: 'visible', display: 'block'}}>
    <rect x={16} y={4} width={28} height={50} rx={14} fill="#3B4757" />
    {Array.from({length: 5}, (_, i) => (
      <line key={i} x1={20} y1={14 + i * 8} x2={40} y2={14 + i * 8} stroke="rgba(255,255,255,.2)" strokeWidth={2} />
    ))}
    <path d="M8 38 Q8 66 30 66 Q52 66 52 38" fill="none" stroke="#5E6B7C" strokeWidth={4} />
    <rect x={28} y={66} width={4} height={30} fill="#5E6B7C" />
    <rect x={14} y={96} width={32} height={8} rx={4} fill="#5E6B7C" />
  </svg>
);

/** A speech waveform from frame `at`, `len` frames long; it fills left to right. */
export const Wave: React.FC<{w: number; h?: number; at: number; len: number; color?: string; seed?: string}> = ({w, h = 120, at, len, color = C.ink2, seed = 'w'}) => {
  const f = useCurrentFrame();
  const n = 60;
  const k = e01(f, at, len, (x) => x);
  return (
    <svg width={w} height={h} style={{display: 'block', overflow: 'visible'}}>
      {Array.from({length: n}, (_, i) => {
        if (i / n > k) return null;
        const a = (0.25 + 0.75 * random(`${seed}${i}`)) * (0.5 + 0.5 * Math.sin(i * 0.5 + random(seed) * 6));
        const bh = Math.max(6, a * h);
        return <rect key={i} x={(i * w) / n} y={(h - bh) / 2} width={(w / n) * 0.55} height={bh} rx={3} fill={color} />;
      })}
    </svg>
  );
};

export const Salt: React.FC<{w?: number; tilt?: number}> = ({w = 180, tilt = 0}) => (
  <svg width={w} height={w * 1.6} viewBox="0 0 60 96" style={{overflow: 'visible', display: 'block', transform: `rotate(${tilt}deg)`, transformOrigin: '50% 30%'}}>
    <path d="M14 18 Q14 6 30 6 Q46 6 46 18 Z" fill="#9AA7B8" />
    {[22, 30, 38].map((x) => (
      <circle key={x} cx={x} cy={12} r={1.4} fill="#3B4757" />
    ))}
    <path d="M12 20 H48 L52 90 Q30 96 8 90 Z" fill="rgba(255,255,255,.75)" stroke="#BCC7D5" strokeWidth={1.5} />
    <path d="M10 50 H50 L52 90 Q30 96 8 90 Z" fill="#FFFFFF" />
  </svg>
);

export const Phone: React.FC<{w?: number; children?: React.ReactNode}> = ({w = 300, children}) => (
  <div style={{width: w, height: w * 2.05, borderRadius: w * 0.16, background: '#1C232D', padding: w * 0.045, boxSizing: 'border-box'}}>
    <div style={{width: '100%', height: '100%', borderRadius: w * 0.12, overflow: 'hidden', background: '#0F141B', position: 'relative'}}>{children}</div>
  </div>
);

export const Warning: React.FC<{w?: number; blue?: boolean}> = ({w = 200, blue = true}) => (
  <svg width={w} height={w * 0.9} viewBox="0 0 100 90" style={{overflow: 'visible', display: 'block'}}>
    <path d="M50 4 Q54 4 56 8 L96 80 Q98 86 92 86 H8 Q2 86 4 80 L44 8 Q46 4 50 4 Z" fill={blue ? C.core : '#F2C94C'} />
    <rect x={46} y={28} width={8} height={32} rx={4} fill="#fff" />
    <circle cx={50} cy={71} r={5} fill="#fff" />
  </svg>
);

export const BankCard: React.FC<{w?: number}> = ({w = 320}) => (
  <div style={{width: w, height: w * 0.63, borderRadius: R.sm, background: 'linear-gradient(150deg,#3B4757,#1C232D)', position: 'relative', boxShadow: 'inset 0 1px 0 rgba(255,255,255,.15)'}}>
    <div style={{position: 'absolute', left: w * 0.09, top: w * 0.2, width: w * 0.16, height: w * 0.12, borderRadius: 6, background: 'linear-gradient(135deg,#F2D68A,#B8913A)'}} />
    <div style={{position: 'absolute', left: w * 0.09, bottom: w * 0.12, fontFamily: F.mono, fontSize: w * 0.055, letterSpacing: '0.12em', color: 'rgba(255,255,255,.7)'}}>•••• •••• •••• 0000</div>
  </div>
);

export const Mask: React.FC<{w?: number}> = ({w = 280}) => (
  <svg width={w} height={w * 0.7} viewBox="0 0 100 70" style={{overflow: 'visible', display: 'block'}}>
    <path d="M4 18 Q50 0 96 18 Q98 52 70 62 Q58 66 50 54 Q42 66 30 62 Q2 52 4 18 Z" fill="#E9EDF2" stroke="#BCC7D5" strokeWidth={1.5} />
    <path d="M18 30 Q28 22 38 30 Q28 36 18 30 Z M62 30 Q72 22 82 30 Q72 36 62 30 Z" fill="#2A3442" />
  </svg>
);

export const Headset: React.FC<{w?: number}> = ({w = 260}) => (
  <svg width={w} height={w} viewBox="0 0 100 100" style={{overflow: 'visible', display: 'block'}}>
    <path d="M16 56 V48 Q16 12 50 12 Q84 12 84 48 V56" fill="none" stroke="#3B4757" strokeWidth={7} />
    <rect x={6} y={50} width={20} height={32} rx={9} fill="#3B4757" />
    <rect x={74} y={50} width={20} height={32} rx={9} fill="#3B4757" />
    <path d="M18 80 Q22 94 46 92" fill="none" stroke="#3B4757" strokeWidth={4} />
    <rect x={44} y={88} width={12} height={8} rx={4} fill="#5E6B7C" />
  </svg>
);

/** A road in perspective; the guardrail runs along it except for a gap. */
export const Road: React.FC<{w?: number; gap?: number}> = ({w = 1500, gap = 1}) => {
  const h = w * 0.45;
  return (
    <svg width={w} height={h} viewBox="0 0 150 45" style={{overflow: 'visible', display: 'block'}}>
      <path d="M62 0 H88 L150 45 H0 Z" fill="#9AA7B8" />
      {Array.from({length: 6}, (_, i) => {
        const t = i / 6;
        const y = 2 + t * t * 40;
        return <rect key={i} x={74.5 - t * 1.6} y={y} width={1 + t * 3} height={1.2 + t * 3} fill="#F7F9FB" />;
      })}
      {/* rail posts and rail on the right edge, broken where the gap is */}
      {Array.from({length: 14}, (_, i) => {
        const t = i / 13;
        const x = 88 + t * 62 * 0.98;
        const y = t * 45;
        const inGap = t > 0.35 && t < 0.35 + 0.3 * gap;
        if (inGap) return null;
        return <rect key={i} x={x} y={y - 4 - t * 4} width={0.6 + t} height={4 + t * 4} fill="#5E6B7C" />;
      })}
      <path d={`M88 -4 L${88 + 0.35 * 62} ${0.35 * 45 - 4 - 0.35 * 4}`} stroke={C.core} strokeWidth={1.2} />
      <path d={`M${88 + (0.35 + 0.3 * gap) * 62} ${(0.35 + 0.3 * gap) * 45 - 4 - (0.35 + 0.3 * gap) * 4} L150 37`} stroke={C.core} strokeWidth={1.8} />
    </svg>
  );
};

/* ------------------------------------------------------------------ agents */
/** The sealed glass test box; `crack` 0..1 draws a fracture on its right wall. */
export const GlassBox: React.FC<{w?: number; crack?: number; children?: React.ReactNode}> = ({w = 640, crack = 0, children}) => {
  const h = w * 0.68;
  return (
    <div style={{position: 'relative', width: w, height: h}}>
      <div style={{position: 'absolute', inset: 0, borderRadius: R.lg, background: 'linear-gradient(160deg,rgba(255,255,255,.55),rgba(205,221,236,.35))', boxShadow: 'inset 0 0 0 2px rgba(255,255,255,.9), inset 0 -30px 60px rgba(129,162,246,.25)'}} />
      <div style={{position: 'absolute', inset: 0}}>{children}</div>
      <svg width={w} height={h} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        <path d={`M${w - 4} ${h * 0.22} L${w - 40} ${h * 0.36} L${w - 12} ${h * 0.46} L${w - 52} ${h * 0.62} L${w - 20} ${h * 0.78}`} fill="none" stroke={C.core} strokeWidth={4} strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - crack} />
        <path d={`M${w - 40} ${h * 0.36} L${w - 70} ${h * 0.3} M${w - 52} ${h * 0.62} L${w - 86} ${h * 0.66}`} fill="none" stroke={C.core} strokeWidth={2.5} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - Math.max(0, crack * 2 - 1)} />
      </svg>
      <div style={{position: 'absolute', left: 30, top: 24, right: 30, height: 10, borderRadius: 5, background: 'rgba(255,255,255,.8)'}} />
    </div>
  );
};

export const Agent: React.FC<{w?: number; blue?: boolean}> = ({w = 110, blue = true}) => (
  <div style={{width: w, height: w}}>
    <Box3 w={w * 0.78} h={w * 0.62} d={0.36} blue={blue}>
      <circle cx={w * 0.26} cy={w * 0.28} r={w * 0.06} fill="#fff" />
      <circle cx={w * 0.52} cy={w * 0.28} r={w * 0.06} fill="#fff" />
    </Box3>
  </div>
);

export const Server: React.FC<{w?: number; lit?: number}> = ({w = 200, lit = 0}) => (
  <div style={{width: w, height: w * 1.3, borderRadius: R.sm, background: 'linear-gradient(160deg,#3B4757,#1C232D)', padding: w * 0.09, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: w * 0.06}}>
    {Array.from({length: 5}, (_, i) => (
      <div key={i} style={{flex: 1, borderRadius: 6, background: '#2A3442', position: 'relative'}}>
        <div style={{position: 'absolute', right: 10, top: '50%', marginTop: -5, width: 10, height: 10, borderRadius: 5, background: lit > 0.5 ? C.lift : '#4B5563', boxShadow: lit > 0.5 ? '0 0 12px rgba(77,143,252,.9)' : 'none'}} />
        <div style={{position: 'absolute', left: 10, top: '50%', marginTop: -2, width: '50%', height: 4, borderRadius: 2, background: 'rgba(255,255,255,.12)'}} />
      </div>
    ))}
  </div>
);

export const Keycard: React.FC<{w?: number}> = ({w = 280}) => (
  <div style={{width: w, height: w * 0.63, borderRadius: R.sm, background: BLUE_FILL, position: 'relative', boxShadow: `inset 1.5px 0 0 ${C.rim}, inset 0 1.5px 0 ${C.rim}`}}>
    <div style={{position: 'absolute', left: w * 0.1, top: w * 0.14, width: w * 0.18, height: w * 0.14, borderRadius: 6, background: 'linear-gradient(135deg,#F2D68A,#B8913A)'}} />
    <svg style={{position: 'absolute', right: w * 0.1, top: w * 0.12}} width={w * 0.2} height={w * 0.2} viewBox="0 0 20 20">
      {[4, 8, 12].map((r) => (
        <path key={r} d={`M${10 - r * 0.7} ${10 + r * 0.7} A${r} ${r} 0 0 1 ${10 + r * 0.7} ${10 + r * 0.7}`} fill="none" stroke="rgba(255,255,255,.8)" strokeWidth={1.6} transform="rotate(180 10 10)" />
      ))}
    </svg>
    <div style={{position: 'absolute', left: w * 0.1, bottom: w * 0.12, width: w * 0.5, height: 8, borderRadius: 4, background: 'rgba(255,255,255,.4)'}} />
  </div>
);

export const Envelope: React.FC<{w?: number; open?: number; blue?: boolean; children?: React.ReactNode}> = ({w = 320, open = 0, blue, children}) => {
  const h = w * 0.64;
  return (
    <div style={{position: 'relative', width: w, height: h}}>
      <div style={{position: 'absolute', left: w * 0.08, right: w * 0.08, top: -h * 0.6 * open + h * 0.1, height: h * 0.8, borderRadius: 8, background: '#FFFFFF', padding: 18, boxSizing: 'border-box', boxShadow: 'inset 0 1px 0 #fff'}}>{children ?? <Lines n={4} w={w * 0.7} seed="env" />}</div>
      <svg width={w} height={h} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        <rect x={0} y={0} width={w} height={h} rx={10} fill={blue ? C.core : '#E9EDF2'} />
        <path d={`M0 ${h} L${w / 2} ${h * 0.45} L${w} ${h}`} fill={blue ? C.face : '#F7F9FB'} />
        <path d={open > 0.2 ? `M0 0 L${w / 2} ${-h * 0.45 * open} L${w} 0` : `M0 0 L${w / 2} ${h * 0.5} L${w} 0`} fill={blue ? '#0B5FD0' : '#DCE3ED'} />
      </svg>
    </div>
  );
};

export const Browser: React.FC<{w?: number; children?: React.ReactNode}> = ({w = 420, children}) => (
  <div style={{width: w, borderRadius: R.sm, overflow: 'hidden', background: C.surface, boxShadow: 'inset 0 1px 0 #fff'}}>
    <div style={{height: 34, background: '#E3E6EB', display: 'flex', alignItems: 'center', gap: 7, paddingLeft: 14}}>
      {[0, 1, 2].map((i) => (
        <div key={i} style={{width: 11, height: 11, borderRadius: 6, background: '#B8C3D2'}} />
      ))}
      <div style={{marginLeft: 12, height: 16, width: w * 0.5, borderRadius: 8, background: '#F3F4F6'}} />
    </div>
    <div style={{padding: 22, display: 'flex', alignItems: 'center', gap: 20, minHeight: w * 0.42, boxSizing: 'border-box'}}>{children}</div>
  </div>
);

export const Drive: React.FC<{w?: number}> = ({w = 120}) => (
  <div style={{width: w, height: w * 0.62, borderRadius: 8, background: 'linear-gradient(160deg,#5E6B7C,#2A3442)', position: 'relative', boxShadow: 'inset 0 1px 0 rgba(255,255,255,.2)'}}>
    <div style={{position: 'absolute', right: 8, top: 8, width: 7, height: 7, borderRadius: 4, background: C.lift}} />
    <div style={{position: 'absolute', left: 8, bottom: 8, width: '55%', height: 4, borderRadius: 2, background: 'rgba(255,255,255,.18)'}} />
  </div>
);

export const Chair: React.FC<{w?: number; tilt?: number}> = ({w = 220, tilt = 0}) => (
  <svg width={w} height={w * 1.3} viewBox="0 0 100 130" style={{overflow: 'visible', display: 'block', transform: `rotate(${tilt}deg)`}}>
    <rect x={22} y={4} width={56} height={58} rx={14} fill="#3B4757" />
    <rect x={14} y={64} width={72} height={16} rx={8} fill="#2A3442" />
    <rect x={47} y={80} width={6} height={28} fill="#7B8695" />
    <path d="M18 122 L50 106 L82 122 M50 106 V124" stroke="#7B8695" strokeWidth={5} strokeLinecap="round" fill="none" />
    <circle cx={18} cy={124} r={5} fill="#3B4757" />
    <circle cx={82} cy={124} r={5} fill="#3B4757" />
    <circle cx={50} cy={126} r={5} fill="#3B4757" />
  </svg>
);

export const Folder: React.FC<{w?: number; blue?: boolean; children?: React.ReactNode}> = ({w = 360, blue, children}) => (
  <div style={{position: 'relative', width: w, height: w * 0.74}}>
    <div style={{position: 'absolute', left: 0, top: 0, width: w * 0.4, height: w * 0.12, borderRadius: '12px 12px 0 0', background: blue ? C.core : '#B8C3D2'}} />
    <div style={{position: 'absolute', left: 0, right: 0, top: w * 0.1, bottom: 0, borderRadius: R.sm, background: blue ? BLUE_FILL : 'linear-gradient(160deg,#E9EDF2,#C9D2DE)', boxShadow: blue ? `inset 1.5px 1.5px 0 ${C.rim}` : 'inset 0 1px 0 #fff', padding: 26, boxSizing: 'border-box'}}>{children}</div>
  </div>
);

/** A legal document: a heading bar, a seal slot and grey lines. `title` is printed small. */
export const Doc: React.FC<{w?: number; title?: string; seal?: React.ReactNode; lines?: number; seed?: string; tear?: number}> = ({w = 440, title, seal, lines = 9, seed = 'd', tear = 0}) => {
  const h = w * 1.3;
  const body = (
    <div style={{width: w, height: h, borderRadius: R.sm, background: '#FFFFFF', padding: w * 0.09, boxSizing: 'border-box', boxShadow: 'inset 0 1px 0 #fff'}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 16, marginBottom: w * 0.07}}>
        {seal}
        {title && <div style={{fontFamily: F.mono, fontWeight: 500, fontSize: w * 0.05, letterSpacing: '0.12em', color: C.ink, textTransform: 'uppercase'}}>{title}</div>}
      </div>
      <Lines n={lines} w={w * 0.82} gap={w * 0.07} seed={seed} />
    </div>
  );
  if (!tear) return body;
  // torn in two along a jagged vertical line, halves drifting apart
  const jag = 'polygon(0 0, 52% 0, 47% 12%, 54% 26%, 46% 40%, 53% 55%, 47% 70%, 54% 84%, 49% 100%, 0 100%)';
  const jag2 = 'polygon(52% 0, 100% 0, 100% 100%, 49% 100%, 54% 84%, 47% 70%, 53% 55%, 46% 40%, 54% 26%, 47% 12%)';
  return (
    <div style={{position: 'relative', width: w, height: h}}>
      <div style={{position: 'absolute', inset: 0, clipPath: jag, transform: `translateX(${-tear * 60}px) rotate(${-tear * 7}deg)`}}>{body}</div>
      <div style={{position: 'absolute', inset: 0, clipPath: jag2, transform: `translateX(${tear * 60}px) rotate(${tear * 7}deg)`}}>{body}</div>
    </div>
  );
};

export const Magnifier: React.FC<{size?: number; children?: React.ReactNode}> = ({size = 320, children}) => (
  <div style={{position: 'relative', width: size, height: size}}>
    <div style={{position: 'absolute', inset: 0, borderRadius: '50%', border: `${size * 0.06}px solid #2A3442`, background: 'radial-gradient(circle at 35% 30%, rgba(255,255,255,.65), rgba(205,221,236,.3))', overflow: 'hidden', display: 'grid', placeItems: 'center'}}>{children}</div>
    <div style={{position: 'absolute', width: size * 0.14, height: size * 0.5, right: -size * 0.12, bottom: -size * 0.38, background: '#2A3442', borderRadius: size * 0.07, transform: 'rotate(-45deg)'}} />
  </div>
);

/** A red-thread tangle in blue ink that unknots as `k` goes 0 → 1. */
export const Tangle: React.FC<{w?: number; k: number}> = ({w = 700, k}) => {
  const pts = Array.from({length: 26}, (_, i) => {
    const a = i * 2.4;
    const r = (0.2 + 0.25 * random(`tg${i}`)) * (1 - k);
    return [w / 2 + Math.cos(a) * r * w + (i / 25 - 0.5) * w * 0.9 * k, w * 0.3 + Math.sin(a) * r * w * 0.6];
  });
  const d = pts.map((p, i) => (i ? 'T' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
  return (
    <svg width={w} height={w * 0.6} style={{overflow: 'visible', display: 'block'}}>
      <path d={d} fill="none" stroke={C.blueInk} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

/** The Autopilot signature: a cobalt pill that widens into a card with rows. */
export const MorphPill: React.FC<{k: number; label: string; rows: [string, string][]}> = ({k, label, rows}) => {
  const w = 300 + 360 * k;
  const h = 96 + 300 * k;
  return (
    <div style={{width: w, height: h, borderRadius: 52 - 18 * k, background: BLUE_FILL, boxShadow: `inset 1.5px 0 0 ${C.rim}, inset 0 1.5px 0 ${C.rim}, 0 34px 80px -22px rgba(5,113,248,.55)`, color: '#fff', padding: '0 40px', boxSizing: 'border-box', position: 'relative', overflow: 'hidden'}}>
      <div style={{fontFamily: F.display, fontWeight: 500, fontSize: 40, letterSpacing: '-0.01em', position: 'absolute', left: 40, top: 26 + 8 * k, whiteSpace: 'nowrap'}}>{label}</div>
      <div style={{position: 'absolute', left: 40, right: 40, top: 110, opacity: Math.max(0, (k - 0.55) / 0.45)}}>
        {rows.map(([a, b], i) => (
          <div key={i} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 0', borderTop: i ? '1px solid rgba(255,255,255,.18)' : 'none', fontFamily: F.body, fontSize: 32}}>
            <span>{a}</span>
            <span style={{fontFamily: F.mono, fontSize: 20, opacity: 0.75}}>{b}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
