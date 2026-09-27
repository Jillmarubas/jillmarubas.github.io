import React, {createContext, useContext} from 'react';
import {Easing, interpolate, random, useCurrentFrame} from 'remotion';
import {C, F, H, W} from './design';

/*
 * Motion kit for the data-centres explainer. The rules come from the motion-video skill:
 * pieces enter from a side, rotating, with a long soft settle and no overshoot; they keep
 * drifting; at the end of a scene they ease toward the viewer, growing, sliding outward and
 * blurring as they pass the lens, left to right a few frames apart.
 */
export const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const glide = Easing.bezier(0.33, 0, 0.15, 1);
export const settle = (x: number) => (x <= 0 ? 0 : x >= 1 ? 1 : glide(x));
const exitEase = Easing.bezier(0.42, 0, 0.8, 0.55);
export const inOut = Easing.bezier(0.45, 0, 0.2, 1);
export const e01 = (f: number, a: number, d: number, ease: (x: number) => number = inOut) => interpolate(f, [a, a + d], [0, 1], {...clamp, easing: ease});

/* ------------------------------------------------------------------ scene context */
export type SceneInfo = {dur: number; exitAt: number; lines: number[]; seed: number};
export const SceneCtx = createContext<SceneInfo>({dur: 300, exitAt: 280, lines: [0], seed: 0});
export const useScene = () => useContext(SceneCtx);
/** Local frame at which the scene's k-th line starts (k beyond the last line = scene end). */
export const useL = () => {
  const s = useScene();
  return (k: number) => (k < s.lines.length ? s.lines[k] : s.exitAt);
};
export const EXIT_LEN = 26;

/* ------------------------------------------------------------------ a floating cut-out piece */
export type Dir = 'l' | 'r' | 't' | 'b' | 'rise' | 'none';
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
  out?: number; // leave early (local frame), toward the viewer
  z?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({x, y, at, from = 'l', rot = 0, dur = 30, lift = 10, shadow = true, exit = true, out, z = 1, children, style}) => {
  const f = useCurrentFrame();
  const sc = useScene();
  const seed = x * 0.013 + y * 0.029;
  // entrance
  const k = settle((f - at) / dur);
  const far = {l: [-W * 0.75, 0], r: [W * 0.75, 0], t: [0, -H * 0.95], b: [0, H * 0.95], rise: [0, 60], none: [0, 0]}[from];
  const spin = from === 'rise' || from === 'none' ? 0 : (random(`r${seed}`) > 0.5 ? 1 : -1) * 22;
  const pos = (ff: number) => {
    const kk = settle((ff - at) / dur);
    return [far[0] * (1 - kk), far[1] * (1 - kk)];
  };
  const [dx0, dy0] = pos(f);
  const [pdx, pdy] = pos(f - 1);
  const vel = Math.hypot(dx0 - pdx, dy0 - pdy);
  // drift once landed
  const hold = Math.max(0, f - at - dur);
  const amp = Math.min(1, hold / 40);
  const driftX = amp * 3 * Math.sin(hold / 37 + seed);
  const driftY = amp * 2.5 * Math.sin(hold / 29 + seed * 2);
  const driftR = amp * 0.35 * Math.sin(hold / 45 + seed);
  // exit toward the viewer
  const lag = Math.min(1, Math.max(0, x / W)) * 8;
  const ex0 = out ?? sc.exitAt;
  const ex = exit ? exitEase(Math.min(1, Math.max(0, (f - ex0 - lag) / EXIT_LEN))) : 0;
  const scale = 1 / (1 - 0.82 * ex);
  const ox = (x - W / 2) * (scale - 1) * 1.25;
  const oy = (y - H / 2) * (scale - 1) * 1.25;
  const blur = Math.min(14, vel * 0.06) + ex * ex * 38;
  const opacity = (from === 'rise' || from === 'none' ? e01(f, at, 12) : f < at ? 0 : 1) * (1 - Math.max(0, (ex - 0.8) / 0.2));
  if (f < at - 1 || opacity <= 0.001) return null;
  const l = lift * (1 + ex * 3);
  const sh = shadow ? `drop-shadow(${4 + l * 0.35}px ${6 + l * 0.55}px ${8 + l * 0.9}px rgba(45,32,18,${0.26 * (1 - ex)}))` : '';
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
        willChange: 'transform',
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/* ------------------------------------------------------------------ type */
const wordsIn = (text: string, at: number, f: number, gap = 2.2) =>
  text.split(' ').map((w, i) => {
    const o = e01(f, at + i * gap, 12);
    return (
      <span key={i} style={{display: 'inline-block', opacity: o, transform: `translateY(${(1 - o) * 18}px)`, filter: o < 1 ? `blur(${(1 - o) * 6}px)` : undefined, marginRight: '0.26em'}}>
        {w}
      </span>
    );
  });

export const Kicker: React.FC<{text: string; at: number; color?: string}> = ({text, at, color = C.ink2}) => {
  const f = useCurrentFrame();
  const o = e01(f, at, 14);
  return (
    <div style={{fontFamily: F.mono, fontWeight: 500, fontSize: 22, letterSpacing: '0.22em', color, opacity: o, textTransform: 'uppercase', transform: `translateX(${(1 - o) * -20}px)`}}>
      {text}
    </div>
  );
};
export const Lead: React.FC<{text: string; at: number; size?: number}> = ({text, at, size = 46}) => {
  const f = useCurrentFrame();
  return <div style={{fontFamily: F.display, fontStyle: 'italic', fontWeight: 600, fontSize: size, color: C.ink2, lineHeight: 1.15}}>{wordsIn(text, at, f)}</div>;
};
export const Key: React.FC<{text: string; at: number; size?: number; accent?: string}> = ({text, at, size = 104, accent}) => {
  const f = useCurrentFrame();
  return (
    <div style={{fontFamily: F.display, fontWeight: 900, fontSize: size, color: C.ink, lineHeight: 0.98, letterSpacing: '-0.02em'}}>
      {text.split(' ').map((w, i) => {
        const o = e01(f, at + i * 3, 16);
        return (
          <span key={i} style={{display: 'inline-block', marginRight: '0.22em', opacity: o, color: accent && w.replace(/[^\w$%.,]/g, '') === accent ? C.hum : undefined, transform: `translateY(${(1 - o) * 40}px)`, filter: o < 1 ? `blur(${(1 - o) * 10}px)` : undefined}}>
            {w}
          </span>
        );
      })}
    </div>
  );
};
export const Body: React.FC<{text: string; at: number; size?: number; width?: number; color?: string}> = ({text, at, size = 34, width = 640, color = C.ink}) => {
  const f = useCurrentFrame();
  return <div style={{fontFamily: F.sans, fontWeight: 500, fontSize: size, color, lineHeight: 1.35, maxWidth: width}}>{wordsIn(text, at, f, 1.4)}</div>;
};
export const Hand: React.FC<{text: string; at: number; size?: number; color?: string; rot?: number}> = ({text, at, size = 58, color = C.hum, rot = -3}) => {
  const f = useCurrentFrame();
  const n = Math.floor(interpolate(f - at, [0, text.length * 1.6], [0, text.length], clamp));
  return <div style={{fontFamily: F.hand, fontWeight: 600, fontSize: size, color, transform: `rotate(${rot}deg)`, whiteSpace: 'nowrap'}}>{text.slice(0, n)}</div>;
};
export const Source: React.FC<{text: string; at: number}> = ({text, at}) => {
  const f = useCurrentFrame();
  const sc = useScene();
  const o = e01(f, at + 10, 14) * (1 - e01(f, sc.exitAt, 10));
  return (
    <div style={{position: 'absolute', left: 120, bottom: 64, fontFamily: F.mono, fontWeight: 500, fontSize: 18, letterSpacing: '0.14em', color: C.ink2, opacity: o, textTransform: 'uppercase'}}>
      Source · {text}
    </div>
  );
};

/** The left text column: a Piece that rises in and exits toward the viewer with everything else. */
export const Column: React.FC<{at: number; y?: number; x?: number; width?: number; children: React.ReactNode}> = ({at, y = 540, x = 120, width = 680, children}) => (
  <Piece x={x + width / 2} y={y} at={at} from="none" shadow={false} dur={14}>
    <div style={{width, display: 'flex', flexDirection: 'column', gap: 18}}>{children}</div>
  </Piece>
);

/* ------------------------------------------------------------------ numbers */
export const Counter: React.FC<{to: number; at: number; dur?: number; from?: number; prefix?: string; suffix?: string; decimals?: number; size?: number; color?: string}> = ({
  to,
  at,
  dur = 36,
  from = 0,
  prefix = '',
  suffix = '',
  decimals = 0,
  size = 180,
  color = C.ink,
}) => {
  const f = useCurrentFrame();
  const v = from + (to - from) * settle((f - at) / dur);
  const s = v.toLocaleString('en-US', {minimumFractionDigits: decimals, maximumFractionDigits: decimals});
  return (
    <div style={{fontFamily: F.display, fontWeight: 900, fontSize: size, color, lineHeight: 0.9, letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums', opacity: e01(f, at, 8)}}>
      {prefix}
      {s}
      {suffix}
    </div>
  );
};

/* ------------------------------------------------------------------ the hum line (signature) */
export const HumLine: React.FC<{x: number; y: number; w: number; at: number; amp?: number; flat?: number; color?: string; width?: number; draw?: number}> = ({
  x,
  y,
  w,
  at,
  amp = 16,
  flat = 0,
  color = C.hum,
  width = 3,
  draw = 30,
}) => {
  const f = useCurrentFrame();
  const n = 120;
  const phase = f * 0.35;
  const a = amp * (1 - flat);
  const pts = Array.from({length: n + 1}, (_, i) => {
    const u = i / n;
    const env = Math.sin(Math.PI * u) ** 0.6;
    const yy = a * env * (0.6 * Math.sin(u * 42 + phase) + 0.3 * Math.sin(u * 97 - phase * 1.7) + 0.1 * Math.sin(u * 190 + phase * 2.3));
    return `${(u * w).toFixed(1)},${yy.toFixed(1)}`;
  });
  const shown = e01(f, at, draw);
  return (
    <svg width={w} height={amp * 2 + 10} style={{position: 'absolute', left: x, top: y - amp - 5, overflow: 'visible'}}>
      <polyline points={pts.join(' ')} transform={`translate(0 ${amp + 5})`} fill="none" stroke={color} strokeWidth={width} strokeLinejoin="round" strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - shown} />
    </svg>
  );
};

/* ------------------------------------------------------------------ hand-drawn marks */
export const Circle: React.FC<{w: number; h: number; at: number; dur?: number; color?: string}> = ({w, h, at, dur = 18, color = C.hum}) => {
  const f = useCurrentFrame();
  const k = e01(f, at, dur);
  const d = `M ${w * 0.1} ${h * 0.3} C ${w * 0.3} ${-h * 0.05}, ${w * 0.95} ${h * 0.02}, ${w * 0.98} ${h * 0.45} C ${w} ${h * 0.95}, ${w * 0.2} ${h * 1.05}, ${w * 0.04} ${h * 0.6} C ${-w * 0.02} ${h * 0.35}, ${w * 0.2} ${h * 0.12}, ${w * 0.4} ${h * 0.08}`;
  return (
    <svg width={w} height={h} style={{overflow: 'visible', position: 'absolute', left: 0, top: 0}}>
      <path d={d} fill="none" stroke={color} strokeWidth={5} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - k} />
    </svg>
  );
};
export const Arrow: React.FC<{x1: number; y1: number; x2: number; y2: number; at: number; color?: string; bend?: number}> = ({x1, y1, x2, y2, at, color = C.hum, bend = 0.25}) => {
  const f = useCurrentFrame();
  const k = e01(f, at, 16);
  const mx = (x1 + x2) / 2 - (y2 - y1) * bend;
  const my = (y1 + y2) / 2 + (x2 - x1) * bend;
  const ang = Math.atan2(y2 - my, x2 - mx);
  const hk = e01(f, at + 14, 6);
  const h = 22;
  return (
    <svg style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}} width={1} height={1}>
      <path d={`M${x1},${y1} Q${mx},${my} ${x2},${y2}`} fill="none" stroke={color} strokeWidth={5} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - k} />
      <path
        d={`M${x2 - h * Math.cos(ang - 0.5)},${y2 - h * Math.sin(ang - 0.5)} L${x2},${y2} L${x2 - h * Math.cos(ang + 0.5)},${y2 - h * Math.sin(ang + 0.5)}`}
        fill="none"
        stroke={color}
        strokeWidth={5}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={hk}
      />
    </svg>
  );
};

/* ------------------------------------------------------------------ paper card */
export const Card: React.FC<{w: number; h: number; children?: React.ReactNode; pad?: number; tape?: boolean; style?: React.CSSProperties}> = ({w, h, children, pad = 24, tape, style}) => (
  <div style={{width: w, height: h, background: C.card, borderRadius: 3, padding: pad, boxSizing: 'border-box', position: 'relative', ...style}}>
    {tape && <div style={{position: 'absolute', top: -14, left: '50%', width: 110, height: 30, marginLeft: -55, background: 'rgba(229,220,200,0.8)', transform: 'rotate(-3deg)'}} />}
    {children}
  </div>
);
