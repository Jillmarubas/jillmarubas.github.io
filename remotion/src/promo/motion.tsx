import React from 'react';
import {Easing, interpolate, random, spring, useCurrentFrame, useVideoConfig} from 'remotion';

export const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
export const ease = Easing.bezier(0.22, 1, 0.36, 1); // snappy ease-out
export const whip = Easing.bezier(0.7, 0, 0.3, 1); // fast in-out for camera moves

export const useSpr = (delay: number, damping = 14, stiffness = 120) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return spring({frame: frame - delay, fps, config: {damping, stiffness, mass: 0.9}});
};

// Blur proportional to how fast something moves: fake per-object motion blur.
export const velocityBlur = (pos: (f: number) => number, frame: number, k = 0.35, max = 40) =>
  Math.min(max, Math.abs(pos(frame) - pos(frame - 1)) * k);

// Script / sans lines that type in character by character, newest letter fading from light gray.
export const TypeText: React.FC<{
  text: string;
  start: number;
  cps?: number;
  style?: React.CSSProperties;
  trail?: number;
}> = ({text, start, cps = 1.2, style, trail = 5}) => {
  const frame = useCurrentFrame();
  return (
    <span style={style}>
      {[...text].map((ch, i) => {
        const t = frame - start - i / cps;
        const o = interpolate(t, [0, trail], [0, 1], clamp);
        return (
          <span key={i} style={{opacity: o, filter: `blur(${(1 - o) * 3}px)`}}>
            {ch}
          </span>
        );
      })}
    </span>
  );
};

// Letters pop in in a shuffled order (the "1.4 BILLION DOLLAR" effect).
export const ScatterText: React.FC<{text: string; start: number; duration: number; seed: string; style?: React.CSSProperties}> = ({
  text,
  start,
  duration,
  seed,
  style,
}) => {
  const frame = useCurrentFrame();
  return (
    <span style={style}>
      {[...text].map((ch, i) => {
        const at = start + random(`${seed}-${i}`) * duration;
        const o = interpolate(frame, [at, at + 4], [0, 1], clamp);
        return (
          <span key={i} style={{opacity: o}}>
            {ch}
          </span>
        );
      })}
    </span>
  );
};

// Words rise, un-blur and darken one after another.
export const WordRise: React.FC<{words: string[]; start: number; gap?: number; style?: React.CSSProperties; from?: 'below' | 'right'}> = ({
  words,
  start,
  gap = 5,
  style,
  from = 'below',
}) => {
  const frame = useCurrentFrame();
  return (
    <span style={style}>
      {words.map((w, i) => {
        const p = interpolate(frame, [start + i * gap, start + i * gap + 12], [0, 1], {...clamp, easing: ease});
        const off = (1 - p) * (from === 'below' ? 40 : 160);
        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              marginRight: '0.25em',
              opacity: p,
              filter: `blur(${(1 - p) * (from === 'right' ? 14 : 6)}px)`,
              transform: from === 'below' ? `translateY(${off}px)` : `translateX(${off}px)`,
              color: `rgba(40,40,44,${0.35 + 0.65 * p})`,
            }}
          >
            {w}
          </span>
        );
      })}
    </span>
  );
};

// Dashed ring that draws itself on, then keeps slowly turning.
export const DashedRing: React.FC<{size: number; start: number; duration?: number; id: string}> = ({size, start, duration = 22, id}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [start, start + duration], [0, 1], {...clamp, easing: ease});
  const r = size / 2 - 4;
  const rot = -90 + frame * 0.6;
  return (
    <svg width={size} height={size} style={{position: 'absolute', left: -size / 2, top: -size / 2, transform: `rotate(${rot}deg)`}}>
      <defs>
        <mask id={id}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#fff" strokeWidth={8} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - p} />
        </mask>
      </defs>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#1d1d20" strokeWidth={3} strokeDasharray="12 10" mask={`url(#${id})`} />
    </svg>
  );
};

// Thin architectural line that draws along a path.
export const DrawPath: React.FC<{d: string; start: number; duration?: number; width?: number; color?: string; opacity?: number}> = ({
  d,
  start,
  duration = 24,
  width = 3,
  color = '#9a9a9a',
  opacity = 1,
}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [start, start + duration], [0, 1], {...clamp, easing: ease});
  return <path d={d} fill="none" stroke={color} strokeWidth={width} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - p} opacity={opacity} strokeLinecap="round" />;
};

// Faint dot + line grid panel that sits behind hero objects.
export const DotGrid: React.FC<{w: number; h: number; start: number; step?: number}> = ({w, h, start, step = 44}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [start, start + 14], [0, 1], {...clamp, easing: ease});
  const cols = Math.floor(w / step);
  const rows = Math.floor(h / step);
  return (
    <svg width={w} height={h} style={{position: 'absolute', left: -w / 2, top: -h / 2, opacity: p * 0.9, transform: `scale(${0.92 + 0.08 * p})`}}>
      {Array.from({length: rows + 1}).map((_, r) => (
        <line key={`r${r}`} x1={0} x2={w} y1={r * step} y2={r * step} stroke="#000" strokeOpacity={0.07} strokeDasharray="3 5" />
      ))}
      {Array.from({length: cols + 1}).map((_, c) => (
        <line key={`c${c}`} y1={0} y2={h} x1={c * step} x2={c * step} stroke="#000" strokeOpacity={0.07} strokeDasharray="3 5" />
      ))}
      {Array.from({length: (rows + 1) * (cols + 1)}).map((_, i) => (
        <circle key={i} cx={(i % (cols + 1)) * step} cy={Math.floor(i / (cols + 1)) * step} r={2.6} fill="#000" opacity={0.3} />
      ))}
    </svg>
  );
};

// Paper background with a faint square grid.
export const Paper: React.FC = () => (
  <div
    style={{
      position: 'absolute',
      inset: 0,
      background: '#fbfbfa',
      backgroundImage:
        'linear-gradient(rgba(0,0,0,0.045) 2px, transparent 2px), linear-gradient(90deg, rgba(0,0,0,0.045) 2px, transparent 2px)',
      backgroundSize: '64px 64px',
    }}
  />
);
