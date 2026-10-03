// After Effects habits, rebuilt for Remotion at 60 fps:
// keyframes with per-segment easing (Easy Ease, expo out, overshoot), layers with real
// directional motion blur (180° shutter), text animators with a range offset, trim paths,
// number counters, a parallax camera and depth of field. Times are in SECONDS, local to the scene.
import React, {createContext, useContext, useId} from 'react';
import {Easing, spring} from 'remotion';
import {C, F, FPS} from './design';

export type EaseFn = (t: number) => number;
export const E = {
  linear: (t: number) => t,
  easy: Easing.bezier(0.33, 0, 0.67, 1), // AE "Easy Ease" (33% influence)
  out: Easing.bezier(0.16, 1, 0.3, 1), // expo out: the motion-designer default for arrivals
  in: Easing.bezier(0.7, 0, 0.84, 0), // exits
  inOut: Easing.bezier(0.76, 0, 0.24, 1), // quart in-out: camera moves, wipes
  back: Easing.bezier(0.34, 1.56, 0.64, 1), // overshoot then settle
  snap: Easing.bezier(0.05, 0.7, 0.1, 1), // very fast attack
};

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
/** 0→1 progress of a move that starts at `at` and lasts `dur` seconds. */
export const p01 = (t: number, at: number, dur: number, ease: EaseFn = E.out) => ease(clamp((t - at) / dur));
/** Value between a and b over a move. */
export const tw = (t: number, at: number, dur: number, a: number, b: number, ease: EaseFn = E.out) => lerp(a, b, p01(t, at, dur, ease));

/** Keyframes: [[time, value], [time, value, easeIntoThisKey?], ...]. Holds before the first and after the last. */
export type Key = [number, number] | [number, number, EaseFn];
export const kf = (t: number, keys: Key[]) => {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const [t1, v1, e] = keys[i] as [number, number, EaseFn?];
    const [t0, v0] = keys[i - 1];
    if (t <= t1) return lerp(v0, v1, (e ?? E.easy)(clamp((t - t0) / (t1 - t0))));
  }
  return keys[keys.length - 1][1];
};

/** AE-style inertial bounce: a spring that starts at `at`. Returns 0→1 with a settle. */
export const bounce = (t: number, at: number, damping = 14, stiffness = 180, mass = 0.8) =>
  t < at ? 0 : spring({frame: (t - at) * FPS, fps: FPS, config: {damping, stiffness, mass}});

/** In and out envelope: 0 before `a`, rises over `ri`, holds, falls over `fo` ending at `b`. */
export const env = (t: number, a: number, b: number, ri = 0.45, fo = 0.35) => Math.min(p01(t, a, ri), 1 - p01(t, b - fo, fo, E.in));

// ---------------------------------------------------------------- layers with motion blur
export type Pose = {x?: number; y?: number; s?: number; sx?: number; sy?: number; r?: number; o?: number; blur?: number; rx?: number; ry?: number};
const SHUTTER = 1 / (FPS * 2); // 180° at 60 fps

/** A layer whose transform is a function of time. Moving layers get a directional blur along
 * their path, sized like a 180° shutter, exactly what AE's motion blur switch does. */
export const Layer: React.FC<{t: number; at: (t: number) => Pose; children: React.ReactNode; style?: React.CSSProperties; origin?: string; mb?: number; size?: number}> = ({t, at, children, style, origin = '50% 50%', mb = 1, size = 300}) => {
  const id = useId().replace(/:/g, '');
  const p = at(t);
  const q = at(t - SHUTTER);
  const s = p.s ?? 1;
  const dx = ((p.x ?? 0) - (q.x ?? 0)) * mb;
  const dy = ((p.y ?? 0) - (q.y ?? 0)) * mb;
  const ds = Math.abs(s - (q.s ?? 1)) * size * mb; // zooming smears radially; approximate it isotropically
  const bx = Math.min(70, Math.abs(dx) * 0.42 + ds * 0.3);
  const by = Math.min(70, Math.abs(dy) * 0.42 + ds * 0.3);
  const blurred = bx > 0.6 || by > 0.6;
  const o = p.o ?? 1;
  if (o <= 0.001) return null;
  const tf = `translate(${p.x ?? 0}px, ${p.y ?? 0}px) rotate(${p.r ?? 0}deg) scale(${(p.sx ?? 1) * s}, ${(p.sy ?? 1) * s})${p.rx || p.ry ? ` perspective(1400px) rotateX(${p.rx ?? 0}deg) rotateY(${p.ry ?? 0}deg)` : ''}`;
  const filters = [blurred ? `url(#mb${id})` : '', p.blur ? `blur(${p.blur}px)` : ''].filter(Boolean).join(' ');
  return (
    <div style={{position: 'absolute', transform: tf, transformOrigin: origin, opacity: o, filter: filters || undefined, ...style}}>
      {blurred && (
        <svg width={0} height={0} style={{position: 'absolute'}}>
          <filter id={`mb${id}`} x="-60%" y="-60%" width="220%" height="220%" colorInterpolationFilters="sRGB">
            <feGaussianBlur stdDeviation={`${bx.toFixed(2)} ${by.toFixed(2)}`} />
          </filter>
        </svg>
      )}
      {children}
    </div>
  );
};

/** The most common entrance: slide from a direction with expo-out, motion blur, optional exit. */
export const enter = (at: number, opts: {from?: 'l' | 'r' | 'u' | 'd' | 'z'; dist?: number; dur?: number; out?: number; outDur?: number; to?: 'l' | 'r' | 'u' | 'd' | 'z'; x?: number; y?: number; ease?: EaseFn; s0?: number} = {}) => {
  const {from = 'd', dist = 140, dur = 0.6, out, outDur = 0.4, to = from === 'l' ? 'r' : from === 'r' ? 'l' : from === 'u' ? 'd' : from === 'd' ? 'u' : 'z', x = 0, y = 0, ease = E.out, s0 = 0.6} = opts;
  const vec = (d: string) => (d === 'l' ? [-1, 0] : d === 'r' ? [1, 0] : d === 'u' ? [0, -1] : d === 'd' ? [0, 1] : [0, 0]);
  return (t: number): Pose => {
    const pi = p01(t, at, dur, ease);
    const po = out === undefined ? 0 : p01(t, out, outDur, E.in);
    const [ix, iy] = vec(from);
    const [ox, oy] = vec(to);
    const sIn = from === 'z' ? lerp(s0, 1, pi) : 1;
    const sOut = to === 'z' ? lerp(1, 1.6, po) : 1;
    return {
      x: x + ix * dist * (1 - pi) + ox * dist * 1.4 * po,
      y: y + iy * dist * (1 - pi) + oy * dist * 1.4 * po,
      s: sIn * sOut,
      o: Math.min(clamp(pi * 2.2), 1 - po),
    };
  };
};

// ---------------------------------------------------------------- text animator
/** Per-character or per-word animator with a range offset (AE's Range Selector).
 * Wrap words in *stars* to colour them orange. */
export const AText: React.FC<{
  t: number;
  text: string;
  at: number;
  by?: 'char' | 'word';
  stagger?: number;
  dur?: number;
  dy?: number;
  blur?: number;
  s0?: number;
  out?: number;
  size?: number;
  weight?: number;
  family?: string;
  color?: string;
  accent?: string;
  tracking?: string;
  style?: React.CSSProperties;
  ease?: EaseFn;
}> = ({t, text, at, by = 'char', stagger, dur = 0.55, dy = 46, blur = 10, s0 = 1, out, size = 80, weight = 800, family = F.display, color = C.ink, accent = C.orange, tracking = '-0.035em', style, ease = E.out}) => {
  const words = text.split(' ');
  const stg = stagger ?? (by === 'char' ? 0.022 : 0.07);
  let k = 0;
  const po = out === undefined ? 0 : p01(t, out, 0.35, E.in);
  return (
    <div style={{fontFamily: family, fontWeight: weight, fontSize: size, color, letterSpacing: tracking, lineHeight: 1.02, whiteSpace: 'pre-wrap', ...style}}>
      {words.map((raw, wi) => {
        const hot = raw.startsWith('*') && raw.replace(/[.,!?:;]+$/, '').endsWith('*');
        const w = raw.replace(/\*/g, '');
        const units = by === 'char' ? w.split('') : [w];
        const node = (
          <span key={wi} style={{display: 'inline-block', color: hot ? accent : undefined, whiteSpace: 'nowrap'}}>
            {units.map((u, ui) => {
              const p = p01(t, at + k++ * stg, dur, ease);
              const o = clamp(p * 1.6) * (1 - po);
              return (
                <span key={ui} style={{display: 'inline-block', opacity: o, transform: `translateY(${(1 - p) * dy - po * 30}px) scale(${lerp(s0, 1, p)})`, filter: (1 - p) * blur + po * 8 > 0.3 ? `blur(${(1 - p) * blur + po * 8}px)` : undefined}}>
                  {u}
                </span>
              );
            })}
          </span>
        );
        return (
          <React.Fragment key={wi}>
            {node}
            {wi < words.length - 1 ? ' ' : ''}
          </React.Fragment>
        );
      })}
    </div>
  );
};

/** Trim-path stroke: draws from start to end between `at` and `at + dur`. */
export const Draw: React.FC<{t: number; d: string; at: number; dur?: number; stroke?: string; width?: number; ease?: EaseFn; trimStart?: number; dash?: string; cap?: 'round' | 'butt'}> = ({t, d, at, dur = 0.7, stroke = C.orange, width = 4, ease = E.inOut, trimStart = 0, dash, cap = 'round'}) => {
  const p = p01(t, at, dur, ease);
  if (p <= 0) return null;
  const a = trimStart;
  return dash ? (
    <path d={d} fill="none" stroke={stroke} strokeWidth={width} strokeLinecap={cap} strokeDasharray={dash} style={{clipPath: 'none'}} opacity={p} />
  ) : (
    <path d={d} pathLength={1} fill="none" stroke={stroke} strokeWidth={width} strokeLinecap={cap} strokeDasharray={`${Math.max(0.0001, p - a)} 2`} strokeDashoffset={-a} />
  );
};

/** Animated number (AE Slider Control on a text layer). */
export const Count: React.FC<{t: number; at: number; dur?: number; from?: number; to: number; fmt?: (n: number) => string; style?: React.CSSProperties}> = ({t, at, dur = 1.1, from = 0, to, fmt = (n) => Math.round(n).toLocaleString('en-US'), style}) => <span style={{fontVariantNumeric: 'tabular-nums', ...style}}>{fmt(tw(t, at, dur, from, to, E.out))}</span>;

// ---------------------------------------------------------------- camera (2.5D)
// A camera null: pan, zoom and dutch roll on the whole scene, with layers at different depths
// moving at different speeds (parallax) and softening away from the focal plane (DOF).
type Cam = {x: number; y: number; z: number; r: number; focus: number; dof: number};
const CamCtx = createContext<Cam>({x: 0, y: 0, z: 1, r: 0, focus: 1, dof: 0});
export const Camera: React.FC<{cam: Partial<Cam>; children: React.ReactNode}> = ({cam, children}) => {
  const c: Cam = {x: 0, y: 0, z: 1, r: 0, focus: 1, dof: 0, ...cam};
  return (
    <CamCtx.Provider value={c}>
      <div style={{position: 'absolute', inset: 0, transform: `translate(960px,540px) rotate(${c.r}deg) scale(${c.z}) translate(${-960 - c.x}px, ${-540 - c.y}px)`, transformOrigin: '0 0'}}>{children}</div>
    </CamCtx.Provider>
  );
};
/** A layer at depth d (1 = main plane, <1 farther, >1 nearer). */
export const Depth: React.FC<{d: number; children: React.ReactNode}> = ({d, children}) => {
  const c = useContext(CamCtx);
  const k = d - 1;
  const blur = Math.abs(d - c.focus) * c.dof;
  return <div style={{position: 'absolute', inset: 0, transform: `translate(${-c.x * k}px, ${-c.y * k}px) scale(${1 + (c.z - 1) * k * 0.6})`, transformOrigin: '960px 540px', filter: blur > 0.4 ? `blur(${blur}px)` : undefined}}>{children}</div>;
};

/** Centre helper: absolutely positioned box centred on (x, y). */
export const At: React.FC<{x: number; y: number; children: React.ReactNode; style?: React.CSSProperties}> = ({x, y, children, style}) => (
  <div style={{position: 'absolute', left: x, top: y, transform: 'translate(-50%, -50%)', ...style}}>{children}</div>
);
