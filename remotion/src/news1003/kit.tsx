import React, {createContext, useContext} from 'react';
import {Easing, Img, interpolate, random, staticFile, useCurrentFrame} from 'remotion';
import {BLUE_FILL, C, F, H, R, W} from './design';
import PEOPLE from '../../public/news1003/people/credits.json';

/*
 * Motion kit for AI News 3 Oct (24 fps), in Autopilot Blue. Pieces arrive on `swift` and settle
 * without overshoot ("everything arrives, nothing departs"), drift slightly while held, and at
 * the scene end ease toward the viewer, blurring past the lens. Sizes change on `morph`.
 * Shadows are blue bloom, never grey.
 */
export const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
export const swift = Easing.bezier(0.22, 1, 0.36, 1);
export const morph = Easing.bezier(0.65, 0, 0.35, 1);
const exitEase = Easing.bezier(0.42, 0, 0.8, 0.55);
export const settle = (x: number) => (x <= 0 ? 0 : x >= 1 ? 1 : swift(x));
export const e01 = (f: number, a: number, d: number, ease: (x: number) => number = morph) => interpolate(f, [a, a + d], [0, 1], {...clamp, easing: ease});

/* ------------------------------------------------------------------ scene context */
export type SceneInfo = {dur: number; exitAt: number; lines: number[]; words: [string, number][]; seed: number};
export const SceneCtx = createContext<SceneInfo>({dur: 240, exitAt: 220, lines: [0], words: [], seed: 0});
export const useScene = () => useContext(SceneCtx);
/** Local frame at which the scene's k-th line starts (k beyond the last line = scene end). */
export const useL = () => {
  const s = useScene();
  return (k: number) => (k < s.lines.length ? s.lines[k] : s.exitAt);
};
/**
 * Local frame at which a word is spoken (lower-case, letters/digits only, as the speech
 * recogniser tokens it: "AI" is "a" "i", 48 is "fortyeight"). `n` picks the n-th occurrence.
 * Falls back to `fb` if the word was not recognised.
 */
export const useW = () => {
  const s = useScene();
  return (w: string, n = 0, fb = 0) => {
    const hits = s.words.filter(([t]) => t === w);
    return hits.length > n ? hits[n][1] : fb;
  };
};
export const EXIT_LEN = 18;
export const MOVE = 13; // arrival length in frames (~540 ms at 24 fps)

/* ------------------------------------------------------------------ a floating piece */
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
}> = ({x, y, at, from = 'rise', rot = 0, dur = MOVE, lift = 10, shadow = true, exit = true, out, z = 1, children, style}) => {
  const f = useCurrentFrame();
  const sc = useScene();
  const seed = x * 0.013 + y * 0.029;
  const far = {l: [-W * 0.6, 0], r: [W * 0.6, 0], t: [0, -H * 0.8], b: [0, H * 0.8], rise: [0, 60], none: [0, 0], drop: [0, 0]}[from];
  const spin = from === 'l' || from === 'r' ? (random(`r${seed}`) > 0.5 ? 1 : -1) * 8 : 0;
  const pos = (ff: number) => {
    const kk = settle((ff - at) / dur);
    return [far[0] * (1 - kk), far[1] * (1 - kk)];
  };
  const k = settle((f - at) / dur);
  const [dx0, dy0] = pos(f);
  const [pdx, pdy] = pos(f - 1);
  const vel = Math.hypot(dx0 - pdx, dy0 - pdy);
  const hold = Math.max(0, f - at - dur);
  const amp = Math.min(1, hold / 30);
  const driftX = amp * 3 * Math.sin(hold / 34 + seed);
  const driftY = amp * 5 * Math.sin(hold / 27 + seed * 2);
  const dropS = from === 'drop' ? 1 + 0.6 * (1 - swift(Math.min(1, Math.max(0, (f - at) / 11)))) : 1;
  const lag = Math.min(1, Math.max(0, x / W)) * 5;
  const ex0 = out ?? sc.exitAt;
  const ex = exit ? exitEase(Math.min(1, Math.max(0, (f - ex0 - lag) / EXIT_LEN))) : 0;
  const scale = (1 / (1 - 0.8 * ex)) * dropS * (from === 'rise' || from === 'none' ? 0.96 + 0.04 * k : 1);
  const ox = (x - W / 2) * (1 / (1 - 0.8 * ex) - 1) * 1.2;
  const oy = (y - H / 2) * (1 / (1 - 0.8 * ex) - 1) * 1.2;
  const blur = Math.min(12, vel * 0.05) + ex * ex * 30 + (dropS - 1) * 18 + (from === 'rise' ? (1 - k) * 6 : 0);
  const opacity = (from === 'rise' || from === 'none' ? e01(f, at, 9) : from === 'drop' ? e01(f, at, 5) : f < at ? 0 : 1) * (1 - Math.max(0, (ex - 0.8) / 0.2));
  if (f < at - 1 || opacity <= 0.001) return null;
  const l = lift * (1 + ex * 3) * (from === 'drop' ? dropS ** 2 : 1);
  const sh = shadow ? `drop-shadow(0px ${8 + l * 0.9}px ${14 + l * 1.4}px rgba(10,58,140,${0.2 * (1 - ex)}))` : '';
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        zIndex: z,
        opacity,
        transform: `translate(-50%,-50%) translate(${dx0 + driftX + ox}px,${dy0 + driftY + oy}px) rotate(${rot + spin * (1 - k)}deg) scale(${scale})`,
        filter: `${sh} ${blur > 0.3 ? `blur(${blur}px)` : ''}`.trim() || undefined,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/* ------------------------------------------------------------------ type */
/** The namespace chip: mono, blue ink on blue wash. */
export const Kicker: React.FC<{text: string; at: number; size?: number}> = ({text, at, size = 22}) => {
  const f = useCurrentFrame();
  const o = e01(f, at, 10);
  return (
    <span style={{display: 'inline-block', fontFamily: F.mono, fontWeight: 500, fontSize: size, letterSpacing: '0.06em', color: C.blueInk, background: 'rgba(5,113,248,.09)', padding: `${size * 0.22}px ${size * 0.5}px`, borderRadius: 8, opacity: o, textTransform: 'uppercase', transform: `translateY(${(1 - o) * 8}px)`}}>
      {text}
    </span>
  );
};

/** Display words (names, numbers, quoted words only). */
export const Big: React.FC<{children: React.ReactNode; size?: number; color?: string; weight?: number; style?: React.CSSProperties}> = ({children, size = 96, color = C.ink, weight = 600, style}) => (
  <div style={{fontFamily: F.display, fontWeight: weight, fontSize: size, color, lineHeight: 1.02, letterSpacing: '-0.03em', whiteSpace: 'nowrap', ...style}}>{children}</div>
);

export const Source: React.FC<{text: string; at?: number}> = ({text, at = 0}) => {
  const f = useCurrentFrame();
  const sc = useScene();
  const o = e01(f, at + 8, 10) * (1 - e01(f, sc.exitAt, 8));
  return (
    <div style={{position: 'absolute', right: 56, bottom: 40, fontFamily: F.mono, fontWeight: 500, fontSize: 16, letterSpacing: '0.06em', color: C.ink2, opacity: o, textTransform: 'uppercase', background: 'rgba(243,244,246,.9)', padding: '7px 14px', borderRadius: 999, boxShadow: '0 1px 0 rgba(16,21,28,.05)', zIndex: 50}}>
      Source · {text}
    </div>
  );
};

export const Counter: React.FC<{to: number; at: number; dur?: number; from?: number; prefix?: string; suffix?: string; decimals?: number; size?: number; color?: string}> = ({to, at, dur = 26, from = 0, prefix = '', suffix = '', decimals = 0, size = 160, color = C.ink}) => {
  const f = useCurrentFrame();
  const v = from + (to - from) * settle((f - at) / dur);
  const s = v.toLocaleString('en-US', {minimumFractionDigits: decimals, maximumFractionDigits: decimals});
  return (
    <div style={{fontFamily: F.display, fontWeight: 600, fontSize: size, color, lineHeight: 0.95, letterSpacing: '-0.035em', fontVariantNumeric: 'tabular-nums', opacity: e01(f, at, 6), whiteSpace: 'nowrap'}}>
      {prefix}
      {s}
      {suffix}
    </div>
  );
};

/** Quoted words: display type with a drawn quote mark in cobalt. */
export const Quote: React.FC<{text: string; at: number; size?: number; width?: number}> = ({text, at, size = 64, width = 1100}) => {
  const f = useCurrentFrame();
  const words = text.split(' ');
  return (
    <div style={{width, position: 'relative'}}>
      <QuoteMark size={size * 1.1} />
      <div style={{fontFamily: F.display, fontWeight: 500, fontSize: size, lineHeight: 1.12, letterSpacing: '-0.025em', color: C.ink, marginTop: size * 0.2}}>
        {words.map((w, i) => {
          const o = e01(f, at + i * 2.2, 8);
          return (
            <span key={i} style={{opacity: o, filter: `blur(${(1 - o) * 6}px)`, display: 'inline-block', marginRight: '0.26em'}}>
              {w}
            </span>
          );
        })}
      </div>
    </div>
  );
};
export const QuoteMark: React.FC<{size?: number; color?: string}> = ({size = 96, color = C.core}) => (
  <svg width={size * 1.25} height={size} viewBox="0 0 125 100" style={{display: 'block'}}>
    {[0, 62].map((dx) => (
      <path key={dx} transform={`translate(${dx} 0)`} d="M2 72 C2 40 18 16 50 2 L56 12 C38 22 30 34 29 46 A24 24 0 1 1 2 72 Z" fill={color} />
    ))}
  </svg>
);

/* ------------------------------------------------------------------ marks */
export const Ring: React.FC<{w: number; h: number; at: number; dur?: number; color?: string; stroke?: number}> = ({w, h, at, dur = 11, color = C.core, stroke = 5}) => {
  const f = useCurrentFrame();
  const k = e01(f, at, dur);
  return (
    <svg width={w} height={h} style={{overflow: 'visible', position: 'absolute', left: 0, top: 0}}>
      <rect x={2} y={2} width={w - 4} height={h - 4} rx={Math.min(w, h) / 2} fill="none" stroke={color} strokeWidth={stroke} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - k} strokeLinecap="round" />
    </svg>
  );
};
export const Arrow: React.FC<{x1: number; y1: number; x2: number; y2: number; at: number; color?: string; bend?: number; dur?: number; w?: number}> = ({x1, y1, x2, y2, at, color = C.core, bend = 0.2, dur = 11, w = 5}) => {
  const f = useCurrentFrame();
  const k = e01(f, at, dur);
  const mx = (x1 + x2) / 2 - (y2 - y1) * bend;
  const my = (y1 + y2) / 2 + (x2 - x1) * bend;
  const ang = Math.atan2(y2 - my, x2 - mx);
  const hk = e01(f, at + dur - 2, 4);
  const h = 20;
  return (
    <svg style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', zIndex: 40}} width={1} height={1}>
      <path d={`M${x1},${y1} Q${mx},${my} ${x2},${y2}`} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - k} />
      <path d={`M${x2 - h * Math.cos(ang - 0.5)},${y2 - h * Math.sin(ang - 0.5)} L${x2},${y2} L${x2 - h * Math.cos(ang + 0.5)},${y2 - h * Math.sin(ang + 0.5)}`} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" opacity={hk} />
    </svg>
  );
};

/* ------------------------------------------------------------------ surfaces */
/** A panel sitting on the wash: surface fill, superellipse-ish corners, flat lift. */
export const Panel: React.FC<{w: number; h?: number; r?: number; pad?: number; children?: React.ReactNode; style?: React.CSSProperties; blue?: boolean}> = ({w, h, r = R.lg, pad = 28, children, style, blue}) => (
  <div
    style={{
      width: w,
      height: h,
      background: blue ? BLUE_FILL : C.surface,
      borderRadius: r,
      padding: pad,
      boxSizing: 'border-box',
      position: 'relative',
      boxShadow: blue ? `inset 1.5px 0 0 ${C.rim}, inset 0 1.5px 0 ${C.rim}` : 'inset 0 1px 0 rgba(255,255,255,.9), 0 1px 0 rgba(16,21,28,.05)',
      color: blue ? '#fff' : C.ink,
      ...style,
    }}
  >
    {children}
  </div>
);

/** Grey bars standing in for text on a document. */
export const Lines: React.FC<{n: number; w: number; gap?: number; seed?: string; color?: string}> = ({n, w, gap = 20, seed = 'x', color = 'rgba(16,21,28,0.13)'}) => (
  <div style={{display: 'flex', flexDirection: 'column', gap: gap - 9}}>
    {Array.from({length: n}, (_, i) => (
      <div key={i} style={{height: 9, borderRadius: 5, background: color, width: i === n - 1 ? w * 0.55 : w * (0.8 + 0.2 * random(`${seed}${i}`))}} />
    ))}
  </div>
);

/* ------------------------------------------------------------------ people */
type Credit = {license: string; author: string; local: string; source?: string};
const CR = PEOPLE as unknown as Record<string, Credit>;
export const credit = (slug: string) => {
  const c = CR[slug];
  if (!c) return '';
  return `Photo: ${c.author.replace(/^Photo by /i, '')} · ${c.license}`;
};

/** A real, licensed photo on a surface card, with name, title and credit in small type. */
export const Photo: React.FC<{slug: string; name: string; role?: string; w?: number; h?: number; at?: number; pos?: string}> = ({slug, name, role, w = 420, h = 500, at = 0, pos = '50% 22%'}) => {
  const f = useCurrentFrame();
  const c = CR[slug];
  const nameO = e01(f, at + 9, 10);
  return (
    <Panel w={w + 32} pad={16} r={R.lg} style={{paddingBottom: 22}}>
      <div style={{width: w, height: h, overflow: 'hidden', borderRadius: R.md, background: C.sunk}}>
        {c ? <Img src={staticFile(`news1003/people/${c.local}`)} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: pos}} /> : null}
      </div>
      <NameStrip name={name} role={role} credit={credit(slug)} o={nameO} w={w} />
    </Panel>
  );
};

/** SOP: when no licensed photo exists, a named silhouette card stands in. */
export const Silhouette: React.FC<{name: string; role?: string; w?: number; h?: number; at?: number}> = ({name, role, w = 420, h = 500, at = 0}) => {
  const f = useCurrentFrame();
  return (
    <Panel w={w + 32} pad={16} r={R.lg} style={{paddingBottom: 22}}>
      <div style={{width: w, height: h, overflow: 'hidden', borderRadius: R.md, background: `linear-gradient(180deg, ${C.mid}, ${C.lo})`, position: 'relative'}}>
        <svg viewBox="0 0 100 120" width={w} height={h} preserveAspectRatio="xMidYMax meet" style={{position: 'absolute', left: 0, bottom: 0}}>
          <circle cx={50} cy={46} r={19} fill="#AFC0D6" />
          <path d="M10 120 C12 86 30 72 50 72 C70 72 88 86 90 120 Z" fill="#AFC0D6" />
        </svg>
      </div>
      <NameStrip name={name} role={role} credit="No licensed photo available" o={e01(f, at + 9, 10)} w={w} />
    </Panel>
  );
};

const NameStrip: React.FC<{name: string; role?: string; credit: string; o: number; w: number}> = ({name, role, credit: cr, o, w}) => (
  <div style={{marginTop: 14, opacity: o, transform: `translateY(${(1 - o) * 8}px)`, paddingLeft: 4}}>
    <div style={{fontFamily: F.display, fontWeight: 600, fontSize: Math.min(40, w * 0.095), color: C.ink, lineHeight: 1.04, letterSpacing: '-0.02em'}}>{name}</div>
    {role && <div style={{fontFamily: F.mono, fontWeight: 500, fontSize: Math.min(16, w * 0.04), letterSpacing: '0.05em', color: C.blueInk, textTransform: 'uppercase', marginTop: 7, lineHeight: 1.3}}>{role}</div>}
    <div style={{fontFamily: F.mono, fontSize: 11, color: C.ink3, marginTop: 9, lineHeight: 1.3, maxWidth: w}}>{cr}</div>
  </div>
);

/** A flat government seal (public-domain artwork) on a raised disc. */
export const Seal: React.FC<{name: string; size?: number}> = ({name, size = 220}) => (
  <div style={{width: size, height: size, borderRadius: '50%', background: C.surface, padding: size * 0.05, boxSizing: 'border-box', boxShadow: 'inset 0 1px 0 #fff'}}>
    <Img src={staticFile(`news1003/logos/${name}.svg`)} style={{width: '100%', height: '100%', display: 'block'}} />
  </div>
);

/** A cut-out photo of a real object (rembg), sitting on the ground with a blue contact bloom. */
export const Cutout: React.FC<{src: string; w: number; bloom?: number}> = ({src, w, bloom = 1}) => (
  <div style={{position: 'relative', width: w}}>
    <div style={{position: 'absolute', left: '8%', right: '8%', bottom: -w * 0.03, height: w * 0.08, borderRadius: '50%', background: 'rgba(10,58,140,.35)', filter: `blur(${w * 0.03}px)`, opacity: bloom}} />
    <Img src={staticFile(`news1003/${src}`)} style={{width: w, display: 'block', position: 'relative'}} />
  </div>
);
