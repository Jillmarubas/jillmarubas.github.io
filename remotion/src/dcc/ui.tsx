import React from 'react';
import {useCurrentFrame} from 'remotion';
import {Dir, Piece, e01, settle, useScene} from '../dc/kit';
import {K} from './art';

/*
 * On-screen type for the city-world edition: white sticker cards with a coloured tab, big
 * Poppins numbers, speech bubbles, and pins that stand on the world itself. Pieces keep the
 * approved motion: in from a side with a soft settle, out toward the viewer.
 */
export const PF = 'Poppins';
export const NF = 'Nunito';
const shadow = '0 10px 0 rgba(30,42,68,0.10), 0 18px 40px rgba(30,42,68,0.18)';

const words = (text: string, at: number, f: number, gap = 2.4) =>
  text.split(' ').map((w, i) => {
    const o = e01(f, at + i * gap, 12);
    return (
      <span key={i} style={{display: 'inline-block', marginRight: '0.24em', opacity: o, transform: `translateY(${(1 - o) * 24}px)`}}>
        {w}
      </span>
    );
  });

export const Tab: React.FC<{text: string; c?: string}> = ({text, c = K.blue}) => (
  <div style={{display: 'inline-block', background: c, color: K.white, fontFamily: PF, fontWeight: 700, fontSize: 22, letterSpacing: '0.12em', textTransform: 'uppercase', padding: '8px 18px', borderRadius: 14}}>{text}</div>
);

/** Headline card. (x, y) is the card's top-left corner. */
export const Head: React.FC<{k?: string; text: string; at: number; x?: number; y?: number; w?: number; c?: string; size?: number; from?: Dir; sub?: string; subAt?: number; out?: number}> = ({
  k,
  text,
  at,
  x = 90,
  y = 90,
  w = 800,
  c = K.blue,
  size = 62,
  from = 'l',
  sub,
  subAt,
  out,
}) => {
  const f = useCurrentFrame();
  const lines = Math.ceil((text.length * size * 0.56) / (w - 80));
  const h = 60 + (k ? 56 : 0) + lines * size * 1.12 + (sub ? 20 + Math.ceil((sub.length * 34 * 0.5) / (w - 80)) * 46 : 0);
  return (
    <Piece x={x + w / 2} y={y + h / 2} at={at} from={from} rot={from === 'r' ? 1.5 : -1.5} shadow={false} out={out}>
      <div style={{width: w, boxSizing: 'border-box', background: K.white, borderRadius: 30, padding: '30px 40px', boxShadow: shadow}}>
        {k && (
          <div style={{marginBottom: 16}}>
            <Tab text={k} c={c} />
          </div>
        )}
        <div style={{fontFamily: PF, fontWeight: 800, fontSize: size, lineHeight: 1.1, color: K.navy, letterSpacing: '-0.01em'}}>{words(text, at + 6, f)}</div>
        {sub && <div style={{fontFamily: NF, fontWeight: 800, fontSize: 34, lineHeight: 1.3, color: '#51607A', marginTop: 20}}>{words(sub, subAt ?? at + 14, f, 1.6)}</div>}
      </div>
    </Piece>
  );
};

/** A big number with a caption. (x, y) is the centre. */
export const Stat: React.FC<{n: number; at: number; x: number; y: number; pre?: string; suf?: string; dec?: number; label: string; c?: string; from?: Dir; w?: number; size?: number; dur?: number; out?: number}> = ({
  n,
  at,
  x,
  y,
  pre = '',
  suf = '',
  dec = 0,
  label,
  c = K.red,
  from = 'r',
  w = 560,
  size = 128,
  dur = 40,
  out,
}) => {
  const f = useCurrentFrame();
  const v = n * settle((f - at - 6) / dur);
  return (
    <Piece x={x} y={y} at={at} from={from} rot={from === 'l' ? -2 : 2} shadow={false} out={out}>
      <div style={{width: w, boxSizing: 'border-box', background: K.white, borderRadius: 30, padding: '26px 36px 30px', boxShadow: shadow, borderBottom: `12px solid ${c}`}}>
        <div style={{fontFamily: PF, fontWeight: 800, fontSize: size, lineHeight: 1, color: c, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap'}}>
          {pre}
          {v.toLocaleString('en-US', {minimumFractionDigits: dec, maximumFractionDigits: dec})}
          {suf}
        </div>
        <div style={{fontFamily: NF, fontWeight: 800, fontSize: 32, lineHeight: 1.25, color: K.navy, marginTop: 12}}>{label}</div>
      </div>
    </Piece>
  );
};

/** A coloured pill. (x, y) is the centre. */
export const Chip: React.FC<{text: string; at: number; x: number; y: number; c?: string; from?: Dir; size?: number; strike?: number; out?: number; icon?: React.ReactNode}> = ({text, at, x, y, c = K.blue, from = 'l', size = 38, strike, out, icon}) => {
  const f = useCurrentFrame();
  const s = strike === undefined ? 0 : e01(f, strike, 10);
  return (
    <Piece x={x} y={y} at={at} from={from} rot={from === 'l' ? -3 : 3} shadow={false} dur={24} out={out}>
      <div style={{position: 'relative', display: 'flex', alignItems: 'center', gap: 14, background: c, color: K.white, fontFamily: PF, fontWeight: 800, fontSize: size, padding: '14px 30px', borderRadius: 999, whiteSpace: 'nowrap', boxShadow: shadow, opacity: 1 - s * 0.45}}>
        {icon}
        {text}
        {strike !== undefined && <div style={{position: 'absolute', left: 16, right: 16, top: '50%', height: 6, marginTop: -3, borderRadius: 3, background: K.navy, transformOrigin: 'left', transform: `scaleX(${s})`}} />}
      </div>
    </Piece>
  );
};

/** A speech bubble with a tail. (x, y) is the centre. */
export const Bubble: React.FC<{text: string; at: number; x: number; y: number; w?: number; tail?: 'l' | 'r'; from?: Dir; c?: string; out?: number}> = ({text, at, x, y, w = 560, tail = 'l', from = 'b', c = K.navy, out}) => {
  const f = useCurrentFrame();
  return (
    <Piece x={x} y={y} at={at} from={from} rot={tail === 'l' ? -2 : 2} shadow={false} dur={22} out={out}>
      <div style={{position: 'relative', width: w, boxSizing: 'border-box', background: K.white, borderRadius: 36, padding: '28px 36px', boxShadow: shadow}}>
        <div style={{fontFamily: PF, fontWeight: 800, fontSize: 44, lineHeight: 1.15, color: c}}>{words(text, at + 4, f, 2)}</div>
        <svg width={60} height={50} style={{position: 'absolute', bottom: -40, [tail === 'l' ? 'left' : 'right']: 60}}>
          <path d={tail === 'l' ? 'M0 0 L50 0 L10 46 Z' : 'M60 0 L10 0 L50 46 Z'} fill={K.white} />
        </svg>
      </div>
    </Piece>
  );
};

/** A white panel with a coloured header strip for charts. (x, y) is the centre. */
export const Panel: React.FC<{title: string; at: number; x: number; y: number; w: number; h: number; c?: string; from?: Dir; children: React.ReactNode; out?: number}> = ({title, at, x, y, w, h, c = K.blue, from = 'r', children, out}) => (
  <Piece x={x} y={y} at={at} from={from} rot={from === 'l' ? -1.5 : 1.5} shadow={false} out={out}>
    <div style={{width: w, height: h, boxSizing: 'border-box', background: K.white, borderRadius: 30, overflow: 'hidden', boxShadow: shadow, display: 'flex', flexDirection: 'column'}}>
      <div style={{background: c, color: K.white, fontFamily: PF, fontWeight: 700, fontSize: 26, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '16px 32px'}}>{title}</div>
      <div style={{flex: 1, position: 'relative', padding: 30}}>{children}</div>
    </div>
  </Piece>
);

/** Source line, bottom left. */
export const Src: React.FC<{text: string; at?: number}> = ({text, at = 0}) => {
  const f = useCurrentFrame();
  const sc = useScene();
  const o = e01(f, at + 10, 14) * (1 - e01(f, sc.exitAt, 10));
  return (
    <div style={{position: 'absolute', left: 90, bottom: 40, fontFamily: NF, fontWeight: 800, fontSize: 20, color: K.navy, opacity: o * 0.9, background: 'rgba(255,255,255,0.9)', padding: '8px 18px', borderRadius: 16}}>
      Source: {text}
    </div>
  );
};

/** Vertical bars in the edition's colours; the highlighted bar is red. */
export const Bars: React.FC<{data: {label: string; v: number; show: string; at: number; hot?: boolean}[]; max: number; w: number; h: number; cap?: {v: number; label: string; at: number}}> = ({data, max, w, h, cap}) => {
  const f = useCurrentFrame();
  const bw = Math.min(170, (w / data.length) * 0.6);
  const gap = (w - bw * data.length) / (data.length + 1);
  return (
    <div style={{position: 'relative', width: w, height: h + 60}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: h, height: 4, borderRadius: 2, background: K.navy}} />
      {data.map((d, i) => {
        const k = settle((f - d.at) / 34);
        const bh = (d.v / max) * h * k;
        const x = gap + i * (bw + gap);
        return (
          <React.Fragment key={i}>
            <div style={{position: 'absolute', left: x, width: bw, top: h - bh, height: bh, borderRadius: '18px 18px 0 0', background: d.hot ? K.red : K.blue}} />
            <div style={{position: 'absolute', left: x - 60, width: bw + 120, top: h - bh - 64, textAlign: 'center', fontFamily: PF, fontWeight: 800, fontSize: 44, color: K.navy, opacity: e01(f, d.at + 10, 10)}}>{d.show}</div>
            <div style={{position: 'absolute', left: x - 60, width: bw + 120, top: h + 14, textAlign: 'center', fontFamily: NF, fontWeight: 800, fontSize: 26, color: '#51607A', opacity: e01(f, d.at, 10)}}>{d.label}</div>
          </React.Fragment>
        );
      })}
      {cap && (
        <div style={{opacity: e01(f, cap.at, 12)}}>
          <div style={{position: 'absolute', left: -10, right: -10, top: h - (cap.v / max) * h, borderTop: `5px dashed ${K.red}`}} />
          <div style={{position: 'absolute', left: 0, top: h - (cap.v / max) * h - 44, fontFamily: PF, fontWeight: 800, fontSize: 24, color: K.red}}>{cap.label}</div>
        </div>
      )}
    </div>
  );
};

/** A share as a ring. */
export const Ring: React.FC<{share: number; at: number; size?: number; c?: string; label?: string}> = ({share, at, size = 340, c = K.red, label}) => {
  const f = useCurrentFrame();
  const k = settle((f - at) / 45);
  const r = size / 2 - 34;
  const C2 = 2 * Math.PI * r;
  return (
    <div style={{position: 'relative', width: size, height: size}}>
      <svg width={size} height={size} style={{transform: 'rotate(-90deg)'}}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#E3EAF3" strokeWidth={52} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={c} strokeWidth={52} strokeLinecap="round" strokeDasharray={`${Math.max(0.01, C2 * share * k)} ${C2}`} />
      </svg>
      <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
        <div style={{fontFamily: PF, fontWeight: 800, fontSize: size * 0.25, color: K.navy, lineHeight: 1}}>{Math.round(share * 100 * k)}%</div>
        {label && <div style={{fontFamily: NF, fontWeight: 800, fontSize: 24, color: '#51607A', marginTop: 6, textAlign: 'center', maxWidth: size * 0.6}}>{label}</div>}
      </div>
    </div>
  );
};

/** The chapter banner: a big ribbon that swings in over the wide shot. */
export const Banner: React.FC<{n: number; title: string}> = ({n, title}) => {
  const f = useCurrentFrame();
  return (
    <Piece x={960} y={470} at={4} from="t" rot={-2} shadow={false} dur={34}>
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        <div style={{width: 150, height: 150, borderRadius: 75, background: K.yellow, color: K.navy, fontFamily: PF, fontWeight: 800, fontSize: 96, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: shadow, marginBottom: -40, zIndex: 2, transform: `scale(${0.6 + 0.4 * settle((f - 14) / 20)})`}}>{n}</div>
        <div style={{position: 'relative', background: K.red, color: K.white, fontFamily: PF, fontWeight: 800, fontSize: 92, padding: '56px 90px 34px', borderRadius: 28, boxShadow: shadow, whiteSpace: 'nowrap'}}>
          {words(title, 18, f, 4)}
          <div style={{position: 'absolute', left: -40, top: 60, width: 60, height: 90, background: K.red2, zIndex: -1, clipPath: 'polygon(0 0,100% 0,100% 100%,0 100%,40% 50%)'}} />
          <div style={{position: 'absolute', right: -40, top: 60, width: 60, height: 90, background: K.red2, zIndex: -1, clipPath: 'polygon(0 0,100% 0,60% 50%,100% 100%,0 100%)'}} />
        </div>
      </div>
    </Piece>
  );
};

/** A row of simple people icons (e.g. 50 jobs, half contractors). */
export const People: React.FC<{n: number; at: number; hollowFrom?: number; hollowAt?: number; cols?: number; s?: number; c?: string}> = ({n, at, hollowFrom = n, hollowAt = 0, cols = 10, s = 44, c = K.blue}) => {
  const f = useCurrentFrame();
  return (
    <div style={{display: 'grid', gridTemplateColumns: `repeat(${cols}, ${s}px)`, gap: 10}}>
      {Array.from({length: n}, (_, i) => {
        const o = e01(f, at + i * 1.2, 10);
        const hollow = i >= hollowFrom && f >= hollowAt;
        return (
          <svg key={i} width={s} height={s * 1.3} viewBox="0 0 40 52" style={{opacity: o, transform: `translateY(${(1 - o) * 14}px)`}}>
            <circle cx={20} cy={11} r={9} fill={hollow ? 'none' : c} stroke={c} strokeWidth={3} />
            <path d="M4 50 C4 30 36 30 36 50 Z" fill={hollow ? 'none' : c} stroke={c} strokeWidth={3} />
          </svg>
        );
      })}
    </div>
  );
};
