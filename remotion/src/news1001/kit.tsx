import React, {createContext, useContext} from 'react';
import {Easing, Img, interpolate, random, staticFile, useCurrentFrame} from 'remotion';
import {C, F, H, W} from './design';
import CREDITS from '../../public/news1001/people/credits.json';

/*
 * Motion kit for AI News 1 Oct (24 fps). Adapted from the data-centres kit: pieces glide in
 * from a side, rotating, settle with no overshoot, keep drifting, and at the scene end ease
 * toward the viewer, blurring past the lens.
 */
export const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const glide = Easing.bezier(0.33, 0, 0.15, 1);
export const settle = (x: number) => (x <= 0 ? 0 : x >= 1 ? 1 : glide(x));
const exitEase = Easing.bezier(0.42, 0, 0.8, 0.55);
export const inOut = Easing.bezier(0.45, 0, 0.2, 1);
export const snap = Easing.bezier(0.22, 1, 0.36, 1);
export const e01 = (f: number, a: number, d: number, ease: (x: number) => number = inOut) => interpolate(f, [a, a + d], [0, 1], {...clamp, easing: ease});

/* ------------------------------------------------------------------ scene context */
export type SceneInfo = {dur: number; exitAt: number; lines: number[]; seed: number};
export const SceneCtx = createContext<SceneInfo>({dur: 240, exitAt: 220, lines: [0], seed: 0});
export const useScene = () => useContext(SceneCtx);
/** Local frame at which the scene's k-th line starts (k beyond the last line = scene end). */
export const useL = () => {
  const s = useScene();
  return (k: number) => (k < s.lines.length ? s.lines[k] : s.exitAt);
};
export const EXIT_LEN = 20;

/* ------------------------------------------------------------------ a floating cut-out piece */
export type Dir = 'l' | 'r' | 't' | 'b' | 'rise' | 'none' | 'drop';
export const Piece: React.FC<{
  x: number;
  y: number;
  at: number;
  from?: Dir;
  rot?: number;
  dur?: number;
  lift?: number;
  shadow?: boolean;
  exit?: boolean;
  out?: number;
  z?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({x, y, at, from = 'l', rot = 0, dur = 20, lift = 10, shadow = true, exit = true, out, z = 1, children, style}) => {
  const f = useCurrentFrame();
  const sc = useScene();
  const seed = x * 0.013 + y * 0.029;
  const far = {l: [-W * 0.75, 0], r: [W * 0.75, 0], t: [0, -H * 0.95], b: [0, H * 0.95], rise: [0, 50], none: [0, 0], drop: [0, 0]}[from];
  const spin = from === 'rise' || from === 'none' || from === 'drop' ? 0 : (random(`r${seed}`) > 0.5 ? 1 : -1) * 20;
  const pos = (ff: number) => {
    const kk = settle((ff - at) / dur);
    return [far[0] * (1 - kk), far[1] * (1 - kk)];
  };
  const k = settle((f - at) / dur);
  const [dx0, dy0] = pos(f);
  const [pdx, pdy] = pos(f - 1);
  const vel = Math.hypot(dx0 - pdx, dy0 - pdy);
  const hold = Math.max(0, f - at - dur);
  const amp = Math.min(1, hold / 32);
  const driftX = amp * 4 * Math.sin(hold / 30 + seed);
  const driftY = amp * 6 * Math.sin(hold / 23 + seed * 2);
  const driftR = amp * 0.9 * Math.sin(hold / 36 + seed);
  // drop: falls onto the desk from above the lens (big, blurred, then lands)
  const dropS = from === 'drop' ? 1 + 0.9 * (1 - snap(Math.min(1, Math.max(0, (f - at) / 12)))) : 1;
  const lag = Math.min(1, Math.max(0, x / W)) * 6;
  const ex0 = out ?? sc.exitAt;
  const ex = exit ? exitEase(Math.min(1, Math.max(0, (f - ex0 - lag) / EXIT_LEN))) : 0;
  const scale = (1 / (1 - 0.82 * ex)) * dropS;
  const ox = (x - W / 2) * (1 / (1 - 0.82 * ex) - 1) * 1.25;
  const oy = (y - H / 2) * (1 / (1 - 0.82 * ex) - 1) * 1.25;
  const blur = Math.min(14, vel * 0.06) + ex * ex * 34 + (dropS - 1) * 16;
  const opacity = (from === 'rise' || from === 'none' ? e01(f, at, 10) : from === 'drop' ? e01(f, at, 5) : f < at ? 0 : 1) * (1 - Math.max(0, (ex - 0.8) / 0.2));
  if (f < at - 1 || opacity <= 0.001) return null;
  const l = lift * (1 + ex * 3) * (from === 'drop' ? dropS ** 2 : 1);
  const sh = shadow ? `drop-shadow(${4 + l * 0.35}px ${6 + l * 0.6}px ${8 + l * 0.9}px rgba(${C.shadow},${0.34 * (1 - ex)}))` : '';
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        zIndex: z,
        opacity,
        transform: `translate(-50%,-50%) translate(${dx0 + driftX + ox}px,${dy0 + driftY + oy}px) rotate(${rot + spin * (1 - k) + driftR}deg) scale(${scale})`,
        filter: `${sh} ${blur > 0.3 ? `blur(${blur}px)` : ''}`.trim() || undefined,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/* ------------------------------------------------------------------ type */
const halo = '0 1px 10px rgba(250,246,238,0.9)';
export const Kicker: React.FC<{text: string; at: number; color?: string; size?: number}> = ({text, at, color = C.ink2, size = 22}) => {
  const f = useCurrentFrame();
  const o = e01(f, at, 12);
  return (
    <div style={{textShadow: halo, fontFamily: F.mono, fontWeight: 500, fontSize: size, letterSpacing: '0.2em', color, opacity: o, textTransform: 'uppercase', transform: `translateX(${(1 - o) * -16}px)`}}>
      {text}
    </div>
  );
};

/** Handwritten quote: writes on letter by letter, in marker. */
export const Hand: React.FC<{text: string; at: number; size?: number; color?: string; rot?: number; speed?: number; width?: number}> = ({text, at, size = 64, color = C.ink, rot = -2, speed = 0.55, width}) => {
  const f = useCurrentFrame();
  const n = Math.floor(interpolate(f - at, [0, text.length * speed], [0, text.length], clamp));
  return (
    <div style={{fontFamily: F.hand, fontWeight: 600, fontSize: size, color, transform: `rotate(${rot}deg)`, lineHeight: 1.05, width, whiteSpace: width ? 'normal' : 'nowrap'}}>
      <span>{text.slice(0, n)}</span>
      <span style={{opacity: 0}}>{text.slice(n)}</span>
    </div>
  );
};

export const Source: React.FC<{text: string; at?: number}> = ({text, at = 0}) => {
  const f = useCurrentFrame();
  const sc = useScene();
  const o = e01(f, at + 8, 12) * (1 - e01(f, sc.exitAt, 8));
  return (
    <div style={{position: 'absolute', right: 56, bottom: 40, fontFamily: F.mono, fontWeight: 500, fontSize: 16, letterSpacing: '0.12em', color: C.ink2, opacity: o, textTransform: 'uppercase', background: 'rgba(250,246,238,0.88)', padding: '6px 12px', borderRadius: 3, zIndex: 50}}>
      Source · {text}
    </div>
  );
};

export const Counter: React.FC<{to: number; at: number; dur?: number; from?: number; prefix?: string; suffix?: string; decimals?: number; size?: number; color?: string}> = ({
  to,
  at,
  dur = 28,
  from = 0,
  prefix = '',
  suffix = '',
  decimals = 0,
  size = 160,
  color = C.ink,
}) => {
  const f = useCurrentFrame();
  const v = from + (to - from) * settle((f - at) / dur);
  const s = v.toLocaleString('en-US', {minimumFractionDigits: decimals, maximumFractionDigits: decimals});
  return (
    <div style={{fontFamily: F.display, fontWeight: 900, fontSize: size, color, lineHeight: 0.95, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums', opacity: e01(f, at, 6), whiteSpace: 'nowrap'}}>
      {prefix}
      {s}
      {suffix}
    </div>
  );
};

/* ------------------------------------------------------------------ hand-drawn marks */
export const Circle: React.FC<{w: number; h: number; at: number; dur?: number; color?: string; stroke?: number}> = ({w, h, at, dur = 12, color = C.red, stroke = 6}) => {
  const f = useCurrentFrame();
  const k = e01(f, at, dur);
  const d = `M ${w * 0.1} ${h * 0.3} C ${w * 0.3} ${-h * 0.05}, ${w * 0.95} ${h * 0.02}, ${w * 0.98} ${h * 0.45} C ${w} ${h * 0.95}, ${w * 0.2} ${h * 1.05}, ${w * 0.04} ${h * 0.6} C ${-w * 0.02} ${h * 0.35}, ${w * 0.2} ${h * 0.12}, ${w * 0.4} ${h * 0.08}`;
  return (
    <svg width={w} height={h} style={{overflow: 'visible', position: 'absolute', left: 0, top: 0}}>
      <path d={d} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - k} />
    </svg>
  );
};
export const Arrow: React.FC<{x1: number; y1: number; x2: number; y2: number; at: number; color?: string; bend?: number; dur?: number}> = ({x1, y1, x2, y2, at, color = C.red, bend = 0.25, dur = 12}) => {
  const f = useCurrentFrame();
  const k = e01(f, at, dur);
  const mx = (x1 + x2) / 2 - (y2 - y1) * bend;
  const my = (y1 + y2) / 2 + (x2 - x1) * bend;
  const ang = Math.atan2(y2 - my, x2 - mx);
  const hk = e01(f, at + dur - 2, 5);
  const h = 22;
  return (
    <svg style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', zIndex: 40}} width={1} height={1}>
      <path d={`M${x1},${y1} Q${mx},${my} ${x2},${y2}`} fill="none" stroke={color} strokeWidth={6} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - k} />
      <path d={`M${x2 - h * Math.cos(ang - 0.5)},${y2 - h * Math.sin(ang - 0.5)} L${x2},${y2} L${x2 - h * Math.cos(ang + 0.5)},${y2 - h * Math.sin(ang + 0.5)}`} fill="none" stroke={color} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" opacity={hk} />
    </svg>
  );
};
/** A highlighter stroke that sweeps across behind a line of text. */
export const Highlight: React.FC<{w: number; h?: number; at: number; dur?: number; color?: string}> = ({w, h = 40, at, dur = 12, color = 'rgba(255,214,10,0.55)'}) => {
  const f = useCurrentFrame();
  const k = e01(f, at, dur);
  return <div style={{position: 'absolute', left: -6, top: '50%', marginTop: -h / 2, width: (w + 12) * k, height: h, background: color, mixBlendMode: 'multiply', borderRadius: 4, transform: 'rotate(-0.6deg)'}} />;
};

/** A rubber stamp that slams down onto the paper (red ink, slightly rough). */
export const Stamp: React.FC<{text: string; at: number; size?: number; rot?: number; color?: string}> = ({text, at, size = 64, rot = -8, color = C.red}) => {
  const f = useCurrentFrame();
  if (f < at) return null;
  const k = snap(Math.min(1, (f - at) / 7));
  const s = 1.7 - 0.7 * k;
  return (
    <div
      style={{
        transform: `rotate(${rot}deg) scale(${s})`,
        opacity: Math.min(1, (f - at) / 3) * 0.92,
        border: `${size * 0.09}px solid ${color}`,
        borderRadius: size * 0.16,
        padding: `${size * 0.1}px ${size * 0.32}px`,
        fontFamily: F.mono,
        fontWeight: 500,
        fontSize: size,
        letterSpacing: '0.12em',
        color,
        whiteSpace: 'nowrap',
        filter: 'url(#rough)',
        mixBlendMode: 'multiply',
      }}
    >
      {text}
    </div>
  );
};

/** A strip of masking tape. */
export const Tape: React.FC<{x: number; y: number; w?: number; rot?: number}> = ({x, y, w = 120, rot = -4}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w, height: 34, marginLeft: -w / 2, marginTop: -17, background: C.tape, opacity: 0.85, transform: `rotate(${rot}deg)`, boxShadow: '0 1px 2px rgba(0,0,0,0.12)', clipPath: 'polygon(2% 0,98% 4%,100% 50%,97% 100%,3% 96%,0 50%)', zIndex: 5}} />
);

/* ------------------------------------------------------------------ people */
type Credit = {license: string; author: string; local: string};
const CR = CREDITS as unknown as Record<string, Credit>;
export const credit = (slug: string) => {
  const c = CR[slug];
  if (!c) return '';
  const lic = c.license.replace('Public domain', 'Public domain');
  return `Photo: ${c.author.replace(/^Photo by /i, '')} · ${lic}`;
};

/**
 * A real, licensed photo printed on paper and taped to the desk, with a name strip and the
 * credit in small type. Photos are slightly desaturated and warmed to sit in the paper world.
 */
export const Photo: React.FC<{slug: string; name: string; role?: string; w?: number; h?: number; at?: number; pos?: string; tone?: number}> = ({slug, name, role, w = 420, h = 520, at = 0, pos = '50% 25%', tone = 0.25}) => {
  const f = useCurrentFrame();
  const c = CR[slug];
  const nameO = e01(f, at + 10, 10);
  return (
    <div style={{position: 'relative', width: w + 28, background: C.card, padding: 14, paddingBottom: 18, boxSizing: 'border-box'}}>
      <Tape x={(w + 28) / 2} y={-6} w={130} rot={-3} />
      <div style={{width: w, height: h, overflow: 'hidden', background: '#333'}}>
        {c ? (
          <Img src={staticFile(`news1001/people/${c.local}`)} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: pos, filter: `saturate(${1 - tone}) sepia(${tone * 0.5}) contrast(1.04)`}} />
        ) : null}
      </div>
      <div style={{marginTop: 12, opacity: nameO, transform: `translateY(${(1 - nameO) * 8}px)`}}>
        <div style={{fontFamily: F.display, fontWeight: 900, fontSize: 40, color: C.ink, lineHeight: 1}}>{name}</div>
        {role && <div style={{fontFamily: F.mono, fontWeight: 500, fontSize: 17, letterSpacing: '0.1em', color: C.ink2, textTransform: 'uppercase', marginTop: 6}}>{role}</div>}
        <div style={{fontFamily: F.mono, fontSize: 10.5, color: C.mute, marginTop: 8, lineHeight: 1.3, maxWidth: w}}>{credit(slug)}</div>
      </div>
    </div>
  );
};

/** A paper card for props. */
export const Paper: React.FC<{w: number; h: number; children?: React.ReactNode; pad?: number; tape?: boolean; style?: React.CSSProperties; lined?: boolean}> = ({w, h, children, pad = 28, tape, style, lined}) => (
  <div
    style={{
      width: w,
      height: h,
      background: lined ? `repeating-linear-gradient(180deg, ${C.card} 0 37px, rgba(90,84,74,0.14) 37px 38px)` : C.card,
      padding: pad,
      boxSizing: 'border-box',
      position: 'relative',
      ...style,
    }}
  >
    {tape && <Tape x={w / 2} y={-4} rot={-3} />}
    {children}
  </div>
);

/** Fake text lines on a document (grey bars), so documents read as documents without fake words. */
export const Lines: React.FC<{n: number; w: number; gap?: number; seed?: string; color?: string}> = ({n, w, gap = 20, seed = 'x', color = 'rgba(25,23,20,0.16)'}) => (
  <div style={{display: 'flex', flexDirection: 'column', gap: gap - 9}}>
    {Array.from({length: n}, (_, i) => (
      <div key={i} style={{height: 9, borderRadius: 2, background: color, width: i === n - 1 ? w * 0.55 : w * (0.82 + 0.18 * random(`${seed}${i}`))}} />
    ))}
  </div>
);
