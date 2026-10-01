import React from 'react';
import {random, useCurrentFrame} from 'remotion';
import {C, F} from './design';
import {Lines, Stamp, e01, settle} from './kit';

/*
 * Paper props for the collage, drawn by hand in SVG/CSS: documents, calendar pages, a phone,
 * banknote bricks, a bell, a distillation flask, a balance scale, a magnifier, folders.
 * Flat cut paper with a little tone; the shadow comes from the Piece they sit in.
 */
const K = {kraft: '#C9A878', kraft2: '#B8946A', grey: '#D8D2C6', money: '#B9C7A6', money2: '#8FA37F', moneyInk: '#3F5236', gold: '#C9A24A', gold2: '#9C7A2E', glass: 'rgba(196,220,228,0.55)', glassEdge: '#7E9AA5', steel: '#8E9397'};

/* ------------------------------------------------------------------ documents */
export const Doc: React.FC<{w?: number; h?: number; title?: string; sub?: string; seal?: React.ReactNode; stamp?: {text: string; at: number}; lines?: number; seed?: string; children?: React.ReactNode}> = ({
  w = 520,
  h = 680,
  title,
  sub,
  seal,
  stamp,
  lines = 14,
  seed = 'd',
  children,
}) => (
  <div style={{width: w, height: h, background: C.card, padding: '44px 46px', boxSizing: 'border-box', position: 'relative', overflow: 'hidden'}}>
    <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(160deg, rgba(255,255,255,0.4), rgba(0,0,0,0.04))'}} />
    {seal && <div style={{position: 'absolute', right: 40, top: 36}}>{seal}</div>}
    {title && <div style={{fontFamily: F.display, fontWeight: 900, fontSize: 34, color: C.ink, lineHeight: 1.08, maxWidth: w - (seal ? 200 : 90)}}>{title}</div>}
    {sub && <div style={{fontFamily: F.mono, fontSize: 15, letterSpacing: '0.12em', color: C.ink2, textTransform: 'uppercase', marginTop: 10}}>{sub}</div>}
    <div style={{height: 2, background: C.ink, opacity: 0.6, margin: '22px 0 26px'}} />
    {children ?? <Lines n={lines} w={w - 92} gap={26} seed={seed} />}
    {stamp && (
      <div style={{position: 'absolute', left: '50%', top: '58%', transform: 'translate(-50%,-50%)'}}>
        <Stamp text={stamp.text} at={stamp.at} size={56} />
      </div>
    )}
  </div>
);

/** A folder with a tab label. */
export const Folder: React.FC<{w?: number; h?: number; label: string; n?: number; color?: string; children?: React.ReactNode}> = ({w = 300, h = 220, label, n, color = K.kraft, children}) => (
  <div style={{width: w, height: h + 30, position: 'relative'}}>
    <div style={{position: 'absolute', left: 18, top: 0, width: w * 0.42, height: 40, background: color, borderRadius: '8px 8px 0 0'}} />
    <div style={{position: 'absolute', left: 0, top: 28, width: w, height: h, background: color, borderRadius: 4, boxShadow: 'inset 0 -6px 0 rgba(0,0,0,0.06)'}}>
      {n !== undefined && <div style={{position: 'absolute', left: 22, top: 14, fontFamily: F.display, fontWeight: 900, fontSize: 44, color: 'rgba(25,23,20,0.75)'}}>{n}</div>}
      <div style={{position: 'absolute', left: 22, bottom: 18, right: 18, fontFamily: F.mono, fontWeight: 500, fontSize: 16, letterSpacing: '0.12em', color: 'rgba(25,23,20,0.8)', textTransform: 'uppercase', lineHeight: 1.3}}>{label}</div>
      {children}
    </div>
  </div>
);

/* ------------------------------------------------------------------ calendar page */
export const CalPage: React.FC<{month: string; day: string | number; year?: string; w?: number; mark?: boolean; markAt?: number; cross?: number}> = ({month, day, year, w = 260, mark, markAt = 0, cross}) => {
  const f = useCurrentFrame();
  const h = w * 1.1;
  const k = cross !== undefined ? e01(f, cross, 10) : 0;
  return (
    <div style={{width: w, height: h, background: C.card, position: 'relative', overflow: 'hidden'}}>
      <div style={{height: h * 0.26, background: C.red, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F.mono, fontWeight: 500, fontSize: w * 0.11, letterSpacing: '0.2em', color: '#fff'}}>{month}</div>
      <div style={{position: 'absolute', top: h * 0.26, left: 0, right: 0, bottom: h * 0.14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F.display, fontWeight: 900, fontSize: w * 0.48, color: C.ink}}>{day}</div>
      {year && <div style={{position: 'absolute', bottom: h * 0.05, width: '100%', textAlign: 'center', fontFamily: F.mono, fontSize: w * 0.07, letterSpacing: '0.2em', color: C.ink2}}>{year}</div>}
      {[0.08, 0.92].map((x) => (
        <div key={x} style={{position: 'absolute', top: -8, left: w * x - 7, width: 14, height: 22, borderRadius: 7, background: '#444'}} />
      ))}
      {mark && (
        <svg width={w} height={h} style={{position: 'absolute', left: 0, top: 0}}>
          <ellipse cx={w / 2} cy={h * 0.58} rx={w * 0.36} ry={h * 0.26} fill="none" stroke={C.red} strokeWidth={6} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - e01(f, markAt, 12)} />
        </svg>
      )}
      {cross !== undefined && (
        <svg width={w} height={h} style={{position: 'absolute', left: 0, top: 0}}>
          <line x1={w * 0.15} y1={h * 0.35} x2={w * 0.85} y2={h * 0.85} stroke={C.red} strokeWidth={9} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - k} />
          <line x1={w * 0.85} y1={h * 0.35} x2={w * 0.15} y2={h * 0.85} stroke={C.red} strokeWidth={9} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - e01(f, (cross ?? 0) + 6, 10)} />
        </svg>
      )}
    </div>
  );
};

/* ------------------------------------------------------------------ money */
/** A banded brick of banknotes seen at an angle. */
export const Brick: React.FC<{w?: number}> = ({w = 150}) => {
  const h = w * 0.42;
  const t = w * 0.16;
  return (
    <svg width={w + t} height={h + t} viewBox={`0 0 ${w + t} ${h + t}`} style={{display: 'block'}}>
      <polygon points={`0,${t} ${t},0 ${w + t},0 ${w},${t}`} fill={K.money} stroke={K.money2} strokeWidth={1.5} />
      <polygon points={`${w},${t} ${w + t},0 ${w + t},${h} ${w},${h + t}`} fill={K.money2} />
      {Array.from({length: 7}, (_, i) => (
        <line key={i} x1={w} y1={t + (i * h) / 7} x2={w + t} y2={(i * h) / 7} stroke="rgba(255,255,255,0.35)" strokeWidth={1} />
      ))}
      <rect x={0} y={t} width={w} height={h} fill={K.money} stroke={K.money2} strokeWidth={1.5} />
      {Array.from({length: 8}, (_, i) => (
        <line key={i} x1={0} y1={t + (i * h) / 8} x2={w} y2={t + (i * h) / 8} stroke="rgba(63,82,54,0.18)" strokeWidth={1} />
      ))}
      <rect x={w * 0.38} y={t} width={w * 0.2} height={h} fill="#E9E1C8" />
      <ellipse cx={w * 0.2} cy={t + h / 2} rx={w * 0.08} ry={h * 0.3} fill="none" stroke={K.moneyInk} strokeWidth={1.5} opacity={0.5} />
      <text x={w * 0.82} y={t + h * 0.62} fontFamily={F.display} fontWeight={900} fontSize={h * 0.42} fill={K.moneyInk} opacity={0.65} textAnchor="middle">
        100
      </text>
    </svg>
  );
};

/** A pile of bricks that grows: `n` bricks appear over `dur` frames from `at`. */
export const MoneyPile: React.FC<{n: number; at: number; dur?: number; cols?: number; w?: number}> = ({n, at, dur = 30, cols = 4, w = 120}) => {
  const f = useCurrentFrame();
  const shown = Math.floor(n * settle((f - at) / dur));
  const bw = w + w * 0.16;
  const bh = w * 0.42;
  return (
    <div style={{position: 'relative', width: cols * bw * 0.86 + bw * 0.3, height: Math.ceil(n / cols) * bh * 0.98 + bh}}>
      {Array.from({length: shown}, (_, i) => {
        const row = Math.floor(i / cols);
        const col = i % cols;
        const k = e01(f, at + (i * dur) / n, 6);
        return (
          <div key={i} style={{position: 'absolute', left: col * bw * 0.86 + (row % 2) * bw * 0.15, bottom: row * bh * 0.98 + (1 - k) * 60, opacity: k, zIndex: row * 10 + (cols - col)}}>
            <Brick w={w} />
          </div>
        );
      })}
    </div>
  );
};

/* ------------------------------------------------------------------ objects */
export const Bell: React.FC<{w?: number; ring?: number; tag?: string; tagAt?: number}> = ({w = 260, ring, tag, tagAt = 0}) => {
  const f = useCurrentFrame();
  const sw = ring !== undefined && f >= ring ? Math.sin((f - ring) * 0.9) * 12 * Math.exp(-(f - ring) / 18) : 0;
  return (
    <div style={{position: 'relative', width: w, height: w * 1.15}}>
      <svg width={w} height={w * 1.15} viewBox="0 0 260 300" style={{transform: `rotate(${sw}deg)`, transformOrigin: '50% 8%'}}>
        <rect x={118} y={6} width={24} height={30} rx={6} fill={K.gold2} />
        <path d="M130 30 C 70 34, 64 90, 62 150 C 60 200, 40 220, 22 236 L 238 236 C 220 220, 200 200, 198 150 C 196 90, 190 34, 130 30 Z" fill={K.gold} />
        <path d="M130 30 C 100 34, 92 90, 90 150 C 88 200, 74 222, 60 236 L 92 236 C 104 210, 112 180, 112 140 C 112 80, 118 40, 130 30 Z" fill="rgba(255,255,255,0.28)" />
        <rect x={14} y={232} width={232} height={18} rx={9} fill={K.gold2} />
        <circle cx={130} cy={266} r={20} fill={K.gold2} />
      </svg>
      {tag && f >= tagAt && (
        <div style={{position: 'absolute', right: -40, top: w * 0.55, transform: `rotate(${8 + Math.sin(f / 12) * 3}deg)`, transformOrigin: '0 0'}}>
          <div style={{background: '#F3E7C7', padding: '10px 18px', fontFamily: F.mono, fontWeight: 500, fontSize: 22, letterSpacing: '0.14em', color: C.red, border: `2px solid ${C.red}`, borderRadius: 4}}>{tag}</div>
        </div>
      )}
    </div>
  );
};

export const Flask: React.FC<{w?: number; fill?: number; drip?: number}> = ({w = 300, fill = 0.4, drip}) => {
  const f = useCurrentFrame();
  const h = w * 1.25;
  const drops = drip !== undefined ? Array.from({length: 4}, (_, i) => ((f - drip + i * 9) % 36) / 36) : [];
  return (
    <svg width={w} height={h} viewBox="0 0 300 375" style={{overflow: 'visible'}}>
      <defs>
        <clipPath id="flaskc">
          <path d="M120 20 L180 20 L180 120 L270 330 Q275 350 255 352 L45 352 Q25 350 30 330 L120 120 Z" />
        </clipPath>
      </defs>
      <path d="M120 20 L180 20 L180 120 L270 330 Q275 350 255 352 L45 352 Q25 350 30 330 L120 120 Z" fill={K.glass} stroke={K.glassEdge} strokeWidth={4} />
      <rect x={0} y={352 - 230 * fill} width={300} height={230 * fill} fill="rgba(200,38,29,0.55)" clipPath="url(#flaskc)" />
      <path d="M134 140 L80 300" stroke="rgba(255,255,255,0.6)" strokeWidth={8} strokeLinecap="round" />
      <rect x={112} y={10} width={76} height={16} rx={6} fill={K.glassEdge} />
      {drops.map((d, i) => (
        <circle key={i} cx={150} cy={380 + d * 120} r={7} fill="rgba(200,38,29,0.7)" opacity={1 - d} />
      ))}
    </svg>
  );
};

/** A balance scale; `tip` in -1..1 tips it left/right. */
export const Scale: React.FC<{w?: number; tip: number; left?: React.ReactNode; right?: React.ReactNode}> = ({w = 640, tip, left, right}) => {
  const a = tip * 14;
  const arm = w * 0.42;
  const dy = Math.sin((a * Math.PI) / 180) * arm;
  return (
    <div style={{position: 'relative', width: w, height: w * 0.75}}>
      <svg width={w} height={w * 0.75} viewBox={`0 0 ${w} ${w * 0.75}`} style={{position: 'absolute', left: 0, top: 0}}>
        <rect x={w / 2 - 8} y={w * 0.12} width={16} height={w * 0.56} fill={K.steel} />
        <rect x={w / 2 - 90} y={w * 0.68} width={180} height={20} rx={6} fill={K.steel} />
        <g transform={`rotate(${a} ${w / 2} ${w * 0.12})`}>
          <rect x={w / 2 - arm} y={w * 0.12 - 6} width={arm * 2} height={12} rx={6} fill="#6E7377" />
        </g>
        <circle cx={w / 2} cy={w * 0.12} r={14} fill={K.gold} />
        {[-1, 1].map((s) => {
          const x = w / 2 + s * arm * Math.cos((a * Math.PI) / 180);
          const y = w * 0.12 + s * dy;
          return (
            <g key={s}>
              <line x1={x} y1={y} x2={x - 70} y2={y + w * 0.2} stroke="#6E7377" strokeWidth={3} />
              <line x1={x} y1={y} x2={x + 70} y2={y + w * 0.2} stroke="#6E7377" strokeWidth={3} />
              <path d={`M${x - 90} ${y + w * 0.2} Q ${x} ${y + w * 0.29} ${x + 90} ${y + w * 0.2} Z`} fill="#A3A8AB" />
            </g>
          );
        })}
      </svg>
      <div style={{position: 'absolute', left: w / 2 - arm * Math.cos((a * Math.PI) / 180) - 110, top: w * 0.12 - dy - 200 + w * 0.2, width: 220, height: 220, display: 'flex', alignItems: 'flex-end', justifyContent: 'center'}}>{left}</div>
      <div style={{position: 'absolute', left: w / 2 + arm * Math.cos((a * Math.PI) / 180) - 110, top: w * 0.12 + dy - 200 + w * 0.2, width: 220, height: 220, display: 'flex', alignItems: 'flex-end', justifyContent: 'center'}}>{right}</div>
    </div>
  );
};

export const Magnifier: React.FC<{size?: number; children?: React.ReactNode}> = ({size = 320, children}) => (
  <div style={{position: 'relative', width: size, height: size * 1.55}}>
    <div style={{position: 'absolute', left: 0, top: 0, width: size, height: size, borderRadius: '50%', border: `${size * 0.06}px solid #2B2B2B`, boxSizing: 'border-box', overflow: 'hidden', background: 'rgba(220,235,240,0.18)'}}>
      <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: 'scale(1.25)'}}>{children}</div>
      <div style={{position: 'absolute', left: '18%', top: '12%', width: '30%', height: '14%', borderRadius: '50%', background: 'rgba(255,255,255,0.45)', transform: 'rotate(-30deg)'}} />
    </div>
    <div style={{position: 'absolute', left: size * 0.68, top: size * 0.9, width: size * 0.16, height: size * 0.62, background: '#5B3A23', borderRadius: size * 0.05, transform: 'rotate(-38deg)', transformOrigin: '50% 0'}} />
  </div>
);

/** A smartphone with a Messages-style thread. */
export const Phone: React.FC<{w?: number; children?: React.ReactNode; title?: string}> = ({w = 360, children, title = 'DoorDash'}) => {
  const h = w * 2.05;
  return (
    <div style={{width: w, height: h, background: '#151515', borderRadius: w * 0.14, padding: w * 0.035, boxSizing: 'border-box', position: 'relative'}}>
      <div style={{width: '100%', height: '100%', background: '#FFFFFF', borderRadius: w * 0.11, overflow: 'hidden', position: 'relative'}}>
        <div style={{height: w * 0.3, background: '#F6F6F6', borderBottom: '1px solid #E2E2E2', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 10, boxSizing: 'border-box'}}>
          <div style={{width: w * 0.13, height: w * 0.13, borderRadius: '50%', background: '#FF3008'}} />
          <div style={{fontFamily: F.sans, fontWeight: 500, fontSize: w * 0.04, color: '#111', marginTop: 4}}>{title}</div>
        </div>
        <div style={{padding: w * 0.04, display: 'flex', flexDirection: 'column', gap: w * 0.03}}>{children}</div>
      </div>
      <div style={{position: 'absolute', top: w * 0.06, left: '50%', width: w * 0.3, height: w * 0.075, marginLeft: -w * 0.15, background: '#151515', borderRadius: w * 0.05}} />
    </div>
  );
};
export const Bubble: React.FC<{me?: boolean; at: number; children: React.ReactNode; w?: number}> = ({me, at, children, w = 360}) => {
  const f = useCurrentFrame();
  const k = e01(f, at, 8);
  if (f < at) return null;
  return (
    <div style={{alignSelf: me ? 'flex-end' : 'flex-start', maxWidth: '78%', background: me ? '#34C759' : '#E9E9EB', color: me ? '#fff' : '#111', fontFamily: F.sans, fontWeight: 500, fontSize: w * 0.048, lineHeight: 1.3, padding: `${w * 0.025}px ${w * 0.04}px`, borderRadius: w * 0.05, opacity: k, transform: `translateY(${(1 - k) * 14}px) scale(${0.9 + 0.1 * k})`, transformOrigin: me ? '100% 100%' : '0 100%'}}>
      {children}
    </div>
  );
};

export const Padlock: React.FC<{w?: number; open?: number}> = ({w = 160, open = 0}) => (
  <svg width={w} height={w * 1.25} viewBox="0 0 160 200">
    <path d={`M45 ${90 - open * 30} V60 a35 35 0 0 1 70 0 V90`} fill="none" stroke={K.steel} strokeWidth={16} />
    <rect x={20} y={88} width={120} height={100} rx={12} fill={K.gold} />
    <circle cx={80} cy={130} r={12} fill={K.gold2} />
    <rect x={75} y={134} width={10} height={28} rx={4} fill={K.gold2} />
  </svg>
);

export const Shield: React.FC<{w?: number; color?: string}> = ({w = 120, color = '#2F5D8A'}) => (
  <svg width={w} height={w * 1.18} viewBox="0 0 100 118">
    <path d="M50 4 L92 18 V54 C92 84 72 104 50 114 C28 104 8 84 8 54 V18 Z" fill={color} />
    <path d="M50 4 L92 18 V54 C92 84 72 104 50 114 Z" fill="rgba(0,0,0,0.12)" />
    <path d="M32 58 L46 72 L70 44" fill="none" stroke="#fff" strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/** A long paper receipt tape unrolling. */
export const Tape0: React.FC<{len: number; w?: number; seed?: string}> = ({len, w = 140, seed = 't'}) => (
  <div style={{width: w, height: len, background: C.card, padding: 14, boxSizing: 'border-box', overflow: 'hidden', clipPath: 'polygon(0 0,100% 0,100% 100%, 90% 98%, 80% 100%, 70% 98%, 60% 100%, 50% 98%, 40% 100%, 30% 98%, 20% 100%, 10% 98%, 0 100%)'}}>
    <Lines n={Math.max(1, Math.floor(len / 22))} w={w - 28} gap={22} seed={seed} />
  </div>
);

export const Sticky: React.FC<{text?: string; w?: number; color?: string; rot?: number}> = ({text, w = 200, color = '#F7E27A', rot = 0}) => (
  <div style={{width: w, height: w, background: color, transform: `rotate(${rot}deg)`, padding: 18, boxSizing: 'border-box', fontFamily: F.hand, fontWeight: 600, fontSize: w * 0.24, color: C.ink, lineHeight: 1}}>{text}</div>
);

/** A newspaper clipping with a headline-shaped bar and text columns (no real masthead). */
export const Clipping: React.FC<{w?: number; h?: number; label?: string; seed?: string; hl?: React.ReactNode}> = ({w = 520, h = 340, label, seed = 'c', hl}) => (
  <div style={{width: w, height: h, background: '#F1ECE0', padding: 26, boxSizing: 'border-box', position: 'relative', clipPath: `polygon(0 2%, ${30 + random(seed) * 20}% 0, 100% 3%, 99% 97%, 60% 100%, 1% 98%)`}}>
    {label && <div style={{fontFamily: F.mono, fontSize: 15, letterSpacing: '0.16em', color: C.ink2, textTransform: 'uppercase', marginBottom: 12}}>{label}</div>}
    {hl ?? <div style={{height: 22, background: 'rgba(25,23,20,0.75)', width: '86%', marginBottom: 10}} />}
    <div style={{display: 'flex', gap: 18, marginTop: 14}}>
      <Lines n={7} w={(w - 70) / 2} gap={18} seed={seed + 'a'} />
      <Lines n={7} w={(w - 70) / 2} gap={18} seed={seed + 'b'} />
    </div>
  </div>
);

/** A price tag. */
export const PriceTag: React.FC<{price: string; w?: number; color?: string}> = ({price, w = 200, color = '#F3E7C7'}) => (
  <div style={{position: 'relative', width: w, height: w * 0.55, background: color, clipPath: 'polygon(18% 0,100% 0,100% 100%,18% 100%,0 50%)', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingLeft: w * 0.12, boxSizing: 'border-box', fontFamily: F.display, fontWeight: 900, fontSize: w * 0.22, color: C.ink}}>
    <div style={{position: 'absolute', left: w * 0.1, top: '50%', width: w * 0.07, height: w * 0.07, marginTop: -w * 0.035, borderRadius: '50%', background: C.paper}} />
    {price}
  </div>
);

/** A GPU card cut-out. */
export const GPU: React.FC<{w?: number}> = ({w = 420}) => (
  <svg width={w} height={w * 0.42} viewBox="0 0 420 176">
    <rect x={0} y={20} width={400} height={130} rx={10} fill="#2A2C2E" />
    <rect x={12} y={30} width={376} height={110} rx={8} fill="#3A3D40" />
    {[100, 290].map((cx) => (
      <g key={cx}>
        <circle cx={cx} cy={85} r={48} fill="#1F2123" />
        {Array.from({length: 9}, (_, i) => (
          <path key={i} d={`M${cx} 85 L${cx + 44 * Math.cos((i * 2 * Math.PI) / 9)} ${85 + 44 * Math.sin((i * 2 * Math.PI) / 9)}`} stroke="#4B4F53" strokeWidth={8} strokeLinecap="round" />
        ))}
        <circle cx={cx} cy={85} r={12} fill="#76B900" />
      </g>
    ))}
    <rect x={30} y={150} width={300} height={16} fill="#C9A24A" />
    {Array.from({length: 30}, (_, i) => (
      <rect key={i} x={34 + i * 10} y={152} width={5} height={12} fill="#9C7A2E" />
    ))}
    <rect x={400} y={20} width={14} height={130} fill="#8E9397" />
  </svg>
);

/** A data-centre building model (paper). */
export const DataCentre: React.FC<{w?: number}> = ({w = 460}) => (
  <svg width={w} height={w * 0.55} viewBox="0 0 460 253">
    <polygon points="20,90 300,90 440,40 160,40" fill="#E6E1D6" />
    <polygon points="300,90 440,40 440,180 300,230" fill="#B9B3A6" />
    <rect x={20} y={90} width={280} height={140} fill="#D3CDBF" />
    {Array.from({length: 7}, (_, i) => (
      <rect key={i} x={36 + i * 38} y={110} width={26} height={100} fill="#9C968A" />
    ))}
    {Array.from({length: 4}, (_, i) => (
      <g key={i}>
        <rect x={190 + i * 60} y={22} width={44} height={22} fill="#8E9397" />
        <circle cx={212 + i * 60} cy={33} r={8} fill="#6E7377" />
      </g>
    ))}
  </svg>
);

/** An Oura-style smart ring: a titanium band seen at an angle. */
export const Ring: React.FC<{w?: number}> = ({w = 200}) => (
  <svg width={w} height={w * 0.8} viewBox="0 0 200 160">
    <ellipse cx={100} cy={86} rx={88} ry={64} fill="#4B4E52" />
    <ellipse cx={100} cy={78} rx={88} ry={64} fill="#9A9EA3" />
    <ellipse cx={100} cy={80} rx={66} ry={46} fill={C.paper} />
    <path d="M14 70 Q 100 10 186 70" stroke="rgba(255,255,255,0.55)" strokeWidth={5} fill="none" />
  </svg>
);

/** Six chairs around a round table (seen from above). */
export const RoundTable: React.FC<{w?: number; n?: number}> = ({w = 360, n = 6}) => (
  <svg width={w} height={w} viewBox="0 0 360 360">
    {Array.from({length: n}, (_, i) => {
      const a = (i * 2 * Math.PI) / n - Math.PI / 2;
      return <rect key={i} x={180 + Math.cos(a) * 140 - 30} y={180 + Math.sin(a) * 140 - 30} width={60} height={60} rx={10} fill="#8C6B4F" transform={`rotate(${(a * 180) / Math.PI + 90} ${180 + Math.cos(a) * 140} ${180 + Math.sin(a) * 140})`} />;
    })}
    <circle cx={180} cy={180} r={104} fill="#B08A63" />
    <circle cx={180} cy={180} r={92} fill="#C29B72" />
  </svg>
);

/** A dial gauge (monitoring controls). */
export const Gauge: React.FC<{w?: number; v: number}> = ({w = 260, v}) => {
  const a = -120 + 240 * v;
  return (
    <svg width={w} height={w * 0.8} viewBox="0 0 260 208">
      <circle cx={130} cy={130} r={120} fill="#2A2C2E" />
      <circle cx={130} cy={130} r={104} fill={C.card} />
      {Array.from({length: 13}, (_, i) => {
        const t = ((-120 + i * 20 - 90) * Math.PI) / 180;
        return <line key={i} x1={130 + Math.cos(t) * 92} y1={130 + Math.sin(t) * 92} x2={130 + Math.cos(t) * 78} y2={130 + Math.sin(t) * 78} stroke={i > 9 ? C.red : C.ink} strokeWidth={4} />;
      })}
      <line x1={130} y1={130} x2={130 + Math.cos(((a - 90) * Math.PI) / 180) * 80} y2={130 + Math.sin(((a - 90) * Math.PI) / 180) * 80} stroke={C.red} strokeWidth={6} strokeLinecap="round" />
      <circle cx={130} cy={130} r={10} fill={C.ink} />
    </svg>
  );
};

/** A lanyard ID badge. */
export const Badge: React.FC<{w?: number; label: string; color?: string}> = ({w = 200, label, color = '#2F5D8A'}) => (
  <div style={{width: w, height: w * 1.35, background: C.card, borderRadius: 10, overflow: 'hidden', position: 'relative'}}>
    <div style={{height: w * 0.32, background: color}} />
    <div style={{position: 'absolute', top: w * 0.18, left: '50%', width: w * 0.4, height: w * 0.4, marginLeft: -w * 0.2, borderRadius: '50%', background: '#CFC8BA', border: `4px solid ${C.card}`}} />
    <div style={{position: 'absolute', top: w * 0.68, width: '100%', textAlign: 'center', fontFamily: F.mono, fontWeight: 500, fontSize: w * 0.085, letterSpacing: '0.12em', color: C.ink, textTransform: 'uppercase'}}>{label}</div>
    <div style={{position: 'absolute', bottom: w * 0.12, left: '20%', right: '20%'}}>
      <Lines n={2} w={w * 0.6} gap={16} seed={label} />
    </div>
  </div>
);

/** An auditor's clipboard with ticks. */
export const Clipboard: React.FC<{w?: number; at: number}> = ({w = 300, at}) => {
  const f = useCurrentFrame();
  return (
    <div style={{width: w, height: w * 1.3, background: '#8C6B4F', borderRadius: 14, padding: w * 0.07, boxSizing: 'border-box', position: 'relative'}}>
      <div style={{position: 'absolute', top: -16, left: '50%', width: w * 0.38, height: 36, marginLeft: -w * 0.19, background: '#8E9397', borderRadius: 8}} />
      <div style={{background: C.card, width: '100%', height: '100%', padding: w * 0.08, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: w * 0.07}}>
        {Array.from({length: 5}, (_, i) => (
          <div key={i} style={{display: 'flex', alignItems: 'center', gap: 12}}>
            <svg width={30} height={30}>
              <rect x={2} y={2} width={26} height={26} fill="none" stroke={C.ink} strokeWidth={2.5} />
              <path d="M7 15 L13 21 L24 7" fill="none" stroke={C.red} strokeWidth={4} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - e01(f, at + i * 5, 6)} />
            </svg>
            <div style={{flex: 1, height: 9, background: 'rgba(25,23,20,0.18)', borderRadius: 2}} />
          </div>
        ))}
      </div>
    </div>
  );
};
